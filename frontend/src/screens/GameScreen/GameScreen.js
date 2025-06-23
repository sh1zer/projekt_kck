import React, { useState, useRef, useEffect } from 'react';
import { Check, X, User, Clock, ChevronDown, ChevronRight, LogOut } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import EditorPanel from './EditorPanel';
import ProblemPanel from './ProblemPanel';
import TestResultsPanel from './TestResultsPanel';
import OpponentPanel from './OpponentPanel';
import VictoryDefeatScreen from './VictoryDefeatScreen';
import { useUserHistory } from './hooks/useUserHistory';
import './GameScreen.css';

export default function GameScreen() {
    /* ------------------ ROUTING / TOKEN ------------------ */
    const { duelId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const currentUsername = localStorage.getItem('username');

    /* ------------------ STATE ------------------ */
    const [duel, setDuel] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [code, setCode] = useState('');
    const [testResults, setTestResults] = useState(null);
    const [error, setError] = useState(null);
    const [showVictoryDefeat, setShowVictoryDefeat] = useState(false);

    // Layout
    const [horizontalSplit, setHorizontalSplit] = useState(50);
    const [verticalSplit, setVerticalSplit] = useState(60);
    const [isDragging, setIsDragging] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Refs for Monaco auto-layout
    const editorRef = useRef(null);
    const editorContainerRef = useRef(null);
    const initialCodeSet = useRef(false);

    const { userStats } = useUserHistory(currentUser?.username);

    /* ------------------ DETERMINE CURRENT USER ------------------ */
    useEffect(() => {
        if (duel && currentUsername) {
            // Find which player object corresponds to the logged-in user
            if (duel.player1?.username === currentUsername) {
                setCurrentUser(duel.player1);
            } else if (duel.player2?.username === currentUsername) {
                setCurrentUser(duel.player2);
            }
        }
    }, [duel, currentUsername]);

    /* ------------------ VICTORY/DEFEAT DETECTION ------------------ */
    useEffect(() => {
        if (duel?.status === 'completed' && duel?.winner && !showVictoryDefeat) {
            // Add a small delay to let the user see their final test results
            const timer = setTimeout(() => {
                setShowVictoryDefeat(true);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [duel?.status, duel?.winner, showVictoryDefeat]);
    

    /* ------------------ MONACO THEME ------------------ */
    function handleEditorWillMount(monaco) {
        monaco.editor.defineTheme('tailwind-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: '', foreground: '#f3f4f6', background: '#111827' },
            ],
            colors: {
                'editor.background': '#101a28',
                'editor.foreground': '#f3f4f6',
                'editor.lineHighlightBackground': '#1f2937',
                'editorLineNumber.foreground': '#6b7280',
                'editorCursor.foreground': '#f59e42',
                'editor.selectionBackground': '#374151',
                'editor.inactiveSelectionBackground': '#37415199',
                'editorIndentGuide.background': '#374151',
                'editorIndentGuide.activeBackground': '#6b7280',
                'editorWidget.background': '#1f2937',
                'editorWidget.border': '#374151',
                'editorSuggestWidget.background': '#1f2937',
                'editorSuggestWidget.border': '#374151',
                'editorSuggestWidget.foreground': '#f3f4f6',
                'editorSuggestWidget.selectedBackground': '#374151',
                'editorBracketMatch.background': '#374151',
                'editorBracketMatch.border': '#f59e42',
            },
        });
    }

    function handleEditorDidMount(editor, monaco) {
        monaco.editor.setTheme('tailwind-dark');
        editorRef.current = editor;
    }

    /* ------------------ LONG-POLLING ------------------ */
    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        let isMounted = true;
        const firstFetch = { done: false };

        const longPoll = async () => {
            try {
                const url = firstFetch.done
                    ? `/api/duels/${duelId}/`
                    : `/api/duels/${duelId}/?poll=false`;

                const resp = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!isMounted) return;
                if (resp.status === 401) {
                    navigate('/login');
                    return;
                }
                if (resp.ok) {
                    const data = await resp.json();
                    setDuel(data);
                    if (!initialCodeSet.current && data.problem?.solution_template) {
                        setCode(data.problem.solution_template);
                        initialCodeSet.current = true;
                    }
                }
            } catch (e) {
                console.error('Long-poll error', e);
            } finally {
                if (isMounted) {
                    firstFetch.done = true;
                    // Don't continue polling if game is completed
                    if (!duel || duel.status !== 'completed') {
                        setTimeout(longPoll, 1000);
                    }
                }
            }
        };
        longPoll();
        return () => { isMounted = false; };
    }, [duelId, token, navigate, duel?.status]);

    /* ------------------ SUBMIT ------------------ */
    const handleSubmit = async () => {
        if (!token || duel?.status === 'completed') return;
        setError(null);
        setTestResults(null);
        try {
            const resp = await fetch(`/api/duels/${duelId}/submit/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ code }),
            });
            const res = await resp.json();
            if (resp.ok) {
                setTestResults(res);
                // Check if this submission won the game
                if (res.status === 'success') {
                    // The duel state will be updated via long polling
                    // Victory screen will show automatically
                }
            } else {
                setError(res.error || 'Submission failed');
            }
        } catch (e) {
            console.error(e);
            setError('Network error while submitting');
        }
    };

    /* ------------------ LAYOUT DRAG HANDLERS ------------------ */
    const handleMouseDown = (type) => setIsDragging(type);
    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const rect = e.currentTarget.getBoundingClientRect();
        if (isDragging === 'horizontal') {
            const newSplit = ((e.clientX - rect.left) / rect.width) * 100;
            setHorizontalSplit(Math.max(20, Math.min(80, newSplit)));
        } else if (isDragging === 'vertical') {
            const newSplit = ((e.clientY - rect.top) / rect.height) * 100;
            setVerticalSplit(Math.max(30, Math.min(80, newSplit)));
        }
    };
    const handleMouseUp = () => {
        setIsDragging(null);
        if (editorRef.current) editorRef.current.layout();
    };

    /* ------------------ KEYBOARD SHORTCUTS ------------------ */
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && (e.key === 'm' || e.key === 'M')) {
                setHorizontalSplit(50);
                setVerticalSplit(60);
                if (editorRef.current) editorRef.current.layout();
                e.preventDefault();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    /* ------------------ RENDER ------------------ */
    if (error) return <div className="error-message">{error}</div>;
    if (!duel) return <div className="loading-screen">Loading duel...</div>;

    return (
        <div
            className="h-screen gamescreen-bg text-white flex relative overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ cursor: isDragging ? 'grabbing' : 'default' }}
        >
            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col">
                {/* ---------------- TOP SECTION ---------------- */}
                <div
                    className="flex w-full h-full min-h-0"
                    style={{ height: `${verticalSplit}%` }}
                >
                    {/* PROBLEM COLUMN */}
                    <div
                        className="border-r border-gray-700 p-4 overflow-y-auto min-w-0"
                        style={{
                            width: `${horizontalSplit}%`,
                            background: '#232323',
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: 0,
                            flex: 1,
                        }}
                    >
                        {/* HEADER BAR */}
                        <div style={{ marginTop: '-0.5rem' }}>
                            <div
                                style={{
                                    background: '#232323',
                                    borderRadius: '8px 8px 0 0',
                                    color: '#e53e3e',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                }}
                            >
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        background: 'var(--dd-red)',
                                        border: 'none',
                                        padding: '0.25rem',
                                        borderRadius: '8px',
                                    }}
                                >
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <rect x="4" y="4" width="16" height="2" rx="1" fill="#fff" />
                                        <rect x="4" y="10.5" width="16" height="2" rx="1" fill="#fff" />
                                        <rect x="4" y="17" width="16" height="2" rx="1" fill="#fff" />
                                    </svg>
                                </button>
                                <img
                                    src="/ape_icon.png"
                                    alt="ape"
                                    style={{ height: '28px', width: '28px', marginLeft: '1.25rem' }}
                                />
                                <span className="text-sm font-bold">DanteDuel</span>
                                <div className={`ml-2 w-3 h-3 rounded-full ${
                                    duel.status === 'completed' ? 'bg-gray-500' : 'bg-orange-500 animate-pulse'
                                }`} />
                                <button
                                    onClick={handleSubmit}
                                    disabled={duel.status === 'completed'}
                                    style={{
                                        background: duel.status === 'completed' ? '#666' : '#e53e3e',
                                        color: '#fff',
                                        borderRadius: '8px',
                                        padding: '0.5rem 1.5rem',
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        marginLeft: 'auto',
                                        cursor: duel.status === 'completed' ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    {duel.status === 'completed' ? 'Game Ended' : 'Run Code'}
                                </button>
                            </div>
                        </div>

                        {/* PROBLEM PANEL */}
                        <ProblemPanel duel={duel} style={{ flex: 1, minHeight: 0, height: '100%' }} />
                    </div>

                    {/* HORIZONTAL RESIZE HANDLE */}
                    <div
                        className="w-1 bg-gray-700 hover:bg-gray-600 cursor-col-resize"
                        onMouseDown={() => handleMouseDown('horizontal')}
                    />

                    {/* EDITOR COLUMN */}
                    <div
                        className="bg-gray-850 flex flex-col min-w-0"
                        style={{ width: `${100 - horizontalSplit}%` }}
                    >
                        <EditorPanel
                            code={code}
                            setCode={setCode}
                            editorRef={editorRef}
                            editorContainerRef={editorContainerRef}
                            handleEditorWillMount={handleEditorWillMount}
                            handleEditorDidMount={handleEditorDidMount}
                            duel={duel}
                        />
                    </div>
                </div>

                {/* VERTICAL RESIZE HANDLE */}
                <div
                    className="h-1 bg-gray-700 hover:bg-gray-600 cursor-row-resize"
                    onMouseDown={() => handleMouseDown('vertical')}
                />

                {/* ---------------- BOTTOM SECTION ---------------- */}
                <div
                    className="flex border-t border-gray-700"
                    style={{ height: `${100 - verticalSplit}%` }}
                >
                    {/* OPPONENT */}
                    <div
                        className="border-r border-gray-700 p-4 overflow-y-auto flex flex-col"
                        style={{ width: `${horizontalSplit}%`, background: '#232323' }}
                    >
                        <OpponentPanel duel={duel} currentUser={currentUser} />
                    </div>

                    {/* HORIZONTAL RESIZE HANDLE */}
                    <div
                        className="w-1 bg-gray-700 hover:bg-gray-600 cursor-col-resize"
                        onMouseDown={() => handleMouseDown('horizontal')}
                    />

                    {/* RESULTS */}
                    <div
                        className="bg-gray-850 p-4 overflow-y-auto"
                        style={{ width: `${100 - horizontalSplit}%` }}
                    >
                        <TestResultsPanel results={testResults} />
                    </div>
                </div>
            </div>

            {/* SIDEBAR */}
            <div
                className={`fixed left-0 top-0 h-full gamescreen-sidebar transition-transform duration-300 z-50 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } w-64`}
                style={{ backgroundColor: '#1e1e2f', boxShadow: '4px 0 12px rgba(0,0,0,0.4)' }}
            >
                <div className="p-4 h-full flex flex-col">
                    {/* CLOSE BTN */}
                    <div className="flex justify-end mb-4">
                        <button onClick={() => setSidebarOpen(false)} className="p-1 gamescreen-btn rounded">
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                   
                    {/* PROFILE */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 gamescreen-profile rounded-full flex items-center justify-center">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="font-medium">{currentUser?.username || 'Player'}</div>
                                <div className="text-xs">
                                    {userStats ? (
                                        <span>
                                            <span className="text-green-400">{userStats.wins}W</span>
                                            <span className="text-gray-400">-</span>
                                            <span className="text-red-400">{userStats.total_games - userStats.wins}L</span>
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">--W--L</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* STATS */}
                        <div className="space-y-3">
                            <div className="text-sm">
                                <div className="text-gray-400">Current Streak</div>
                                <div className="font-medium">{userStats?.current_streak ?? currentUser?.current_streak ?? 0}</div>
                            </div>
                            <div className="text-sm">
                                <div className="text-gray-400">Win Rate</div>
                                <div className="font-medium">
                                    {userStats ? `${userStats.win_rate.toFixed(1)}%` : '---'}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* EXIT */}
                    <button onClick={() => navigate('/main-menu')} className="flex items-center gap-2 w-full p-3 gamescreen-btn">
                        <LogOut className="w-4 h-4" />
                        Exit Battle
                    </button>
                </div>
            </div>

            {/* VICTORY/DEFEAT SCREEN - Use currentUser */}
            {showVictoryDefeat && (
                <VictoryDefeatScreen
                    duel={duel}
                    currentUser={currentUser}
                    onClose={() => setShowVictoryDefeat(false)}
                />
            )}
        </div>
    );
}