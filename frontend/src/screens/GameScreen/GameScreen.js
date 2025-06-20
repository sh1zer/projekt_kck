import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './GameScreen.css';
import ProblemPanel from './ProblemPanel';
import TestResultsPanel from './TestResultsPanel';
import EditorPanel from './EditorPanel';

function GameScreen() {
    const { duelId } = useParams();
    const navigate = useNavigate();
    const [duel, setDuel] = useState(null);
    const [code, setCode] = useState('');
    const [testResults, setTestResults] = useState(null);
    const [error, setError] = useState(null);
    const initialCodeSet = React.useRef(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        let isMounted = true;

        const longPoll = async () => {
            try {
                const response = await fetch(`/api/duels/${duelId}/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!isMounted) return;

                if (response.status === 401) {
                    navigate('/login');
                    return;
                }

                if (response.ok) {
                    const data = await response.json();
                    setDuel(data);
                    if (!initialCodeSet.current && data.problem && data.problem.solution_template) {
                        setCode(data.problem.solution_template);
                        initialCodeSet.current = true;
                    }
                } else {
                    console.error('Long poll failed:', response.status);
                    // Wait longer before retrying on failure
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            } catch (err) {
                console.error('Error in long poll request:', err);
                 await new Promise(resolve => setTimeout(resolve, 5000));
            } finally {
                if (isMounted) {
                    // Schedule the next poll immediately after the previous one completes
                    setTimeout(longPoll, 1000);
                }
            }
        };

        longPoll(); // Start the polling

        return () => {
            isMounted = false;
        };
    }, [duelId, navigate]);

    const handleCodeChange = (newCode) => {
        setCode(newCode);
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem('token');
        setError(null);
        setTestResults(null);
        try {
            const response = await fetch(`/api/duels/${duelId}/submit/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ code }),
            });
            const result = await response.json();
            if (response.ok) {
                setTestResults(result);
            } else {
                setError(result.error || 'Failed to submit solution.');
            }
        } catch (err) {
            console.error('Submission error:', err);
            setError('An error occurred during submission.');
        }
    };

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!duel) {
        return <div className="loading-screen">Loading duel...</div>;
    }

    return (
        <div className="game-screen">
            <ProblemPanel
                problem={duel.problem}
                player1={duel.player1 ? duel.player1.username : '...'}
                player2={duel.player2 ? duel.player2.username : '...'}
            />
            <div className="editor-and-results-panel">
                <EditorPanel
                    code={code}
                    onCodeChange={handleCodeChange}
                    onSubmit={handleSubmit}
                    language={duel.problem && duel.problem.language ? duel.problem.language : 'c'}
                />
                <TestResultsPanel results={testResults} />
            </div>
        </div>
    );
}

export default GameScreen;