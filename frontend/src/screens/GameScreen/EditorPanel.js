import React, { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { Clock } from 'lucide-react';

export default function EditorPanel({ 
  code, 
  setCode, 
  editorRef, 
  editorContainerRef, 
  handleEditorWillMount, 
  handleEditorDidMount,
  duel
}) {
  const [timeLeft, setTimeLeft] = useState(null);

  // Timer logic
  useEffect(() => {
    if (!duel?.problem?.time_limit || !duel?.created_at) return;

    const updateTimer = () => {
      const startTime = new Date(duel.created_at);
      const timeLimit = duel.problem.time_limit * 60 * 1000; // Convert minutes to ms
      const elapsed = Date.now() - startTime.getTime();
      const remaining = Math.max(0, timeLimit - elapsed);
      
      if (remaining === 0) {
        setTimeLeft('00:00');
        return;
      }

      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [duel]);

  // Custom Monaco theme for Dante Duel
  function handleMonacoWillMount(monaco) {
    monaco.editor.defineTheme('dante-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: '', foreground: 'ffffff', background: '232323' },
      ],
      colors: {
        'editor.background': '#232323',
        'editor.foreground': '#ffffff',
        'editor.lineHighlightBackground': '#2a2a2a',
        'editorLineNumber.foreground': '#ffd700',
        'editorCursor.foreground': '#ffd700',
        'editor.selectionBackground': '#393939',
        'editor.inactiveSelectionBackground': '#39393999',
        'editorIndentGuide.background': '#393939',
        'editorIndentGuide.activeBackground': '#ffd700',
        'editorWidget.background': '#232323',
        'editorWidget.border': '#ffd700',
        'editorSuggestWidget.background': '#232323',
        'editorSuggestWidget.border': '#ffd700',
        'editorSuggestWidget.foreground': '#ffffff',
        'editorSuggestWidget.selectedBackground': '#393939',
        'editorBracketMatch.background': '#393939',
        'editorBracketMatch.border': '#ffd700',
      },
    });
    if (handleEditorWillMount) handleEditorWillMount(monaco);
  }

  function handleMonacoDidMount(editor, monaco) {
    monaco.editor.setTheme('dante-dark');
    if (editorRef) editorRef.current = editor;
    if (handleEditorDidMount) handleEditorDidMount(editor, monaco);
  }

  return (
    <div style={{
      background: '#232323', // outer
      borderRadius: '8px',
      padding: '1rem',
      width: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      flex: 1,
      minHeight: 0,
    }}>
      {/* header */}
      <div style={{
        height: '2rem',
        display: 'flex',
        alignItems: 'flex-end',
        paddingRight: '1.5rem',
        paddingLeft: '1.5rem',
        paddingBottom: '0.25rem',
        marginBottom: '1rem',
      }}>
        <div className="flex items-center justify-between w-full" style={{ color: '#fff' }}>
          <div className="flex items-center gap-2">
            <span className="text-m font-semibold tracking-wide">Code</span>
            <span className="text-xs" style={{ background: '#ffd700', color: '#232323', padding: '2px 8px', borderRadius: '6px', marginLeft: '8px' }}>C</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-white" />
            <span className={`text-sm ${timeLeft === '00:00' ? 'text-red-400' : ''}`}>
              {timeLeft || '--:--'}
            </span>
          </div>
        </div>
      </div>
      {/* editor container */}
      <div style={{ background: '#101a28', borderRadius: '8px', padding: '1rem', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div ref={editorContainerRef} style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <MonacoEditor
              height="100%"
              width="100%"
              language="c"
              theme="vs-dark"
              value={code || ''} // Ensure we always have a string
              onChange={(val) => setCode(val || '')}
              beforeMount={handleMonacoWillMount}
              onMount={handleMonacoDidMount}
              options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  wordWrap: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  fontFamily: 'Fira Mono, monospace',
                  lineNumbers: 'on',
                  tabSize: 4,
                  overviewRulerBorder: false,
                  renderLineHighlight: 'all',
                  renderIndentGuides: true,
                  renderLineHighlightOnlyWhenFocus: true,
              }}
          />
        </div>
      </div>
    </div>
  );
}