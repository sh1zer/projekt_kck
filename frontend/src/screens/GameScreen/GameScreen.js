import React, { useState, useRef, useEffect } from 'react';
import { Check, X, User, Clock, ChevronDown, ChevronRight, Menu, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EditorPanel from './EditorPanel';
import ProblemPanel from './ProblemPanel';
import TestResultsPanel from './TestResultsPanel';
import './GameScreen.css';

export default function CodingBattleInterface() {
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const editorContainerRef = useRef(null);
  const [code, setCode] = useState(`
    // Your solution here
`);

  const [testResults, setTestResults] = useState([
    { 
      id: 1, 
      name: 'Testcase 1', 
      passed: true,
      description: 'Input: nums1 = [1,3], nums2 = [2]',
      expected: '2.00000',
      actual: '2.00000'
    },
    { 
      id: 2, 
      name: 'Testcase 2', 
      passed: true,
      description: 'Input: nums1 = [1,2], nums2 = [3,4]',
      expected: '2.50000',
      actual: '2.50000'
    },
    { 
      id: 3, 
      name: 'Testcase 3', 
      passed: true,
      description: 'Input: nums1 = [], nums2 = [1]',
      expected: '1.00000',
      actual: '1.00000'
    },
    { 
      id: 4, 
      name: 'Testcase 4', 
      passed: false,
      description: 'Input: nums1 = [0,0], nums2 = [0,0]',
      expected: '0.00000',
      actual: '0.50000',
      error: 'TypeError: Cannot read property \'length\' of undefined\n  at findMedianSortedArrays (solution.js:5:20)\n  at Object.runTest (test.js:15:8)\n  at runAllTests (test.js:42:12)'
    },
    { 
      id: 5, 
      name: 'Testcase 5', 
      passed: false,
      description: 'Input: nums1 = [1,2,3], nums2 = [4,5,6]',
      expected: '3.50000',
      actual: 'null',
      error: 'ReferenceError: merged is not defined\n  at findMedianSortedArrays (solution.js:12:15)\n  at Object.runTest (test.js:15:8)\n  at runAllTests (test.js:42:12)'
    }
  ]);

  const [opponentTests, setOpponentTests] = useState([
    { 
      id: 1, 
      name: 'Testcase 1', 
      passed: true,
      description: 'Basic merge test'
    },
    { 
      id: 2, 
      name: 'Testcase 2', 
      passed: false,
      description: 'Edge case with empty array'
    },
    { 
      id: 3, 
      name: 'Testcase 3', 
      passed: false,
      description: 'Large arrays performance'
    }
  ]);

  const [expandedTests, setExpandedTests] = useState(new Set());
  const [expandedOpponentTests, setExpandedOpponentTests] = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  // Panel sizing states
  const [horizontalSplit, setHorizontalSplit] = useState(50); // percentage
  const [verticalSplit, setVerticalSplit] = useState(60); // percentage
  const [isDragging, setIsDragging] = useState(null);

  const toggleTestExpansion = (testId) => {
    const newExpanded = new Set(expandedTests);
    if (newExpanded.has(testId)) {
      newExpanded.delete(testId);
    } else {
      newExpanded.add(testId);
    }
    setExpandedTests(newExpanded);
  };

  const toggleOpponentTestExpansion = (testId) => {
    const newExpanded = new Set(expandedOpponentTests);
    if (newExpanded.has(testId)) {
      newExpanded.delete(testId);
    } else {
      newExpanded.add(testId);
    }
    setExpandedOpponentTests(newExpanded);
  };

  const runTests = () => {
    const newResults = testResults.map((test, index) => ({
      ...test,
      passed: Math.random() > 0.4
    }));
    setTestResults(newResults);
  };

  const handleMouseDown = (type) => {
    setIsDragging(type);
  };

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
    if (editorRef.current) {
      editorRef.current.layout();
    }
  };

  const handleExit = () => {
    setShowExitConfirm(false);
    setSidebarOpen(false);
    navigate('/main-menu');
  };

  // Custom Monaco theme for Tailwind dark style
  function handleEditorWillMount(monaco) {
    monaco.editor.defineTheme('tailwind-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: '', foreground: '#f3f4f6', background: '#111827' }, // text-gray-100, bg-gray-900
      ],
      colors: {
        'editor.background': '#111827', // bg-gray-900
        'editor.foreground': '#f3f4f6', // text-gray-100
        'editor.lineHighlightBackground': '#1f2937', // bg-gray-800
        'editorLineNumber.foreground': '#6b7280', // text-gray-400
        'editorCursor.foreground': '#f59e42', // orange-400
        'editor.selectionBackground': '#374151', // bg-gray-700
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

  function debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

  // ResizeObserver to relayout Monaco on container resize
  useEffect(() => {
    if (!editorContainerRef.current) return;
    const debouncedLayout = debounce(() => {
      if (editorRef.current) editorRef.current.layout();
    }, 100);
    const resizeObserver = new window.ResizeObserver(debouncedLayout);
    resizeObserver.observe(editorContainerRef.current);
    return () => resizeObserver.disconnect();
  }, [editorContainerRef, editorRef]);

  // Keyboard shortcut: Ctrl+M to reset layout
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.ctrlKey && (e.key === 'm' || e.key === 'M')) {
        setHorizontalSplit(50);
        setVerticalSplit(60);
        e.preventDefault();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div 
      className="h-screen gamescreen-bg text-white flex relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ cursor: isDragging ? 'grabbing' : 'default' }}
    >
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full gamescreen-sidebar transition-transform duration-300 z-50 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } w-64`} style={{backgroundColor: '#1e1e2f', boxShadow: '4px 0 12px rgba(0,0,0,0.4)'}}>
        <div className="p-4 h-full flex flex-col">
          {/* Header with close button */}
          <div className="flex justify-end mb-4">
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-1 gamescreen-btn rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          {/* Profile Section */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 gamescreen-profile rounded-full flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="font-medium">Mega USER</div>
                <div className="text-xs gamescreen-elo">2150</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="text-sm">
                <div className="text-gray-400">Battles Won</div>
                <div className="font-medium">23</div>
              </div>
              <div className="text-sm">
                <div className="text-gray-400">Current Streak</div>
                <div className="font-medium">5</div>
              </div>
            </div>
          </div>
          
          {/* Exit Button */}
          <button 
            onClick={() => setShowExitConfirm(true)}
            className="flex items-center gap-2 w-full p-3 gamescreen-btn transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Exit Battle
          </button>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-medium mb-4">Confirm Exit</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to leave the battle? You will lose your progress.</p>
            <div className="flex gap-3">
              <button 
                onClick={handleExit}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
              >
                Yes, Exit
              </button>
              <button 
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Section */}
        <div className="flex w-full h-full min-h-0" style={{ height: `${verticalSplit}%` }}>
          <div className="border-r border-gray-700 p-4 overflow-y-auto min-w-0" style={{ width: `${horizontalSplit}%`, background: '#232323', display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
            <div style={{display:'flex', flexDirection:'column', minHeight:0, height:'100%'}}>
              <div style={{marginTop: '-0.5rem'}}>
                <div style={{background:'#232323', borderRadius:'8px 8px 0 0', color:'#e53e3e', width:'100%', display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:0, padding:'0.5rem 1rem', position: 'relative'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <button
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      className="gamescreen-menu-btn"
                      style={{display:'flex', alignItems:'center', background:'var(--dd-red)', border:'none', boxShadow:'none', padding: '0.25rem', borderRadius: '8px', transition: 'background 0.2s'}}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="4" width="16" height="2" rx="1" fill="#fff"/>
                        <rect x="4" y="10.5" width="16" height="2" rx="1" fill="#fff"/>
                        <rect x="4" y="17" width="16" height="2" rx="1" fill="#fff"/>
                      </svg>
                    </button>
                    <img src="/ape_icon.png" alt="Ape Icon" style={{height: '28px', width: '28px', marginLeft: '1.25rem', marginRight: '0.05rem'}} />
                    <span className="text-sm font-bold" style={{marginRight: '0.25rem'}}>DanteDuel</span>
                    <div className="ml-2 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                  </div>
                  <button 
                    onClick={runTests}
                    style={{background:'#e53e3e', color:'#fff', borderRadius:'8px', padding:'0.5rem 1.5rem', fontWeight:'bold', fontSize:'1rem', marginLeft:'auto'}}>
                    Run Code
                  </button>
                </div>
              </div>
              <ProblemPanel style={{flex: 1, minHeight: 0, height: '100%'}} />
            </div>
          </div>
          {/* Horizontal Resize Handle */}
          <div 
            className="w-1 bg-gray-700 hover:bg-gray-600 cursor-col-resize"
            onMouseDown={() => handleMouseDown('horizontal')}
          />
          <div className="bg-gray-850 flex flex-col min-w-0" style={{ width: `${100 - horizontalSplit}%` }}>
            <div style={{display:'flex', flexDirection:'column', minHeight:0, height:'100%'}}>
              <EditorPanel
                code={code}
                setCode={setCode}
                editorRef={editorRef}
                editorContainerRef={editorContainerRef}
                handleEditorWillMount={handleEditorWillMount}
                handleEditorDidMount={handleEditorDidMount}
              />
            </div>
          </div>
        </div>

        {/* Vertical Resize Handle */}
        <div 
          className="h-1 bg-gray-700 hover:bg-gray-600 cursor-row-resize"
          onMouseDown={() => handleMouseDown('vertical')}
        />

        {/* Bottom Section */}
        <div className="flex border-t border-gray-700" style={{ height: `${100 - verticalSplit}%` }}>
          {/* Opponent Panel */}
          <div className="border-r border-gray-700 p-4 overflow-y-auto" style={{ width: `${horizontalSplit}%`, background: '#232323' }}>
            <div style={{background:'#101a28', borderRadius:'16px', padding:'0 1rem 1rem 1rem', height:'100%', display:'flex', flexDirection:'column', minHeight:0}}>
              <div style={{marginTop: '1rem'}}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 gamescreen-profile rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium">blablauser</div>
                    <div className="text-xs gamescreen-elo">1950</div>
                  </div>
                  <div className="ml-auto">
                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {opponentTests.map((test) => (
                  <div key={test.id} className="border border-gray-700 rounded">
                    <div 
                      className="flex items-center gap-2 text-sm p-2 cursor-pointer hover:bg-gray-700"
                      onClick={() => toggleOpponentTestExpansion(test.id)}
                    >
                      {test.passed ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                      <span className={test.passed ? "text-green-400" : "text-red-400"}>
                        {test.name}
                      </span>
                      <div className="ml-auto">
                        {expandedOpponentTests.has(test.id) ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                    {expandedOpponentTests.has(test.id) && (
                      <div className="px-4 pb-2 text-xs text-gray-400">
                        <div className="bg-gray-900 p-2 rounded">
                          {test.description}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Horizontal Resize Handle */}
          <div 
            className="w-1 bg-gray-700 hover:bg-gray-600 cursor-col-resize"
            onMouseDown={() => handleMouseDown('horizontal')}
          />

          {/* Your Tests Panel */}
          <div className="bg-gray-850 p-4 overflow-y-auto" style={{ width: `${100 - horizontalSplit}%` }}>
            <div style={{background:'#101a28', borderRadius:'16px', padding:'0 1rem 1rem 1rem', height:'100%', display:'flex', flexDirection:'column', minHeight:0}}>
              <TestResultsPanel
                testResults={testResults}
                expandedTests={expandedTests}
                toggleTestExpansion={toggleTestExpansion}
                runTests={runTests}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}