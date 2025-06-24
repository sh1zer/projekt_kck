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
  duel,
  onTimeUp // Add this prop
}) {
  const [timeLeft, setTimeLeft] = useState('--:--');
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Update the timer effect to notify parent when time is up
  useEffect(() => {
    if (!duel?.problem?.time_limit || !duel?.start_time) {
      console.log('Timer debug - missing data:', {
        timeLimit: duel?.problem?.time_limit,
        startTime: duel?.start_time,
        duelStatus: duel?.status
      });
      setTimeLeft('--:--');
      return;
    }

    // If game is already completed, don't run timer
    if (duel.status === 'completed') {
      setTimeLeft('00:00');
      return;
    }

    let interval;

    const updateTimer = () => {
      try {
        // Use start_time from API
        const startTime = new Date(duel.start_time);
        const timeLimit = duel.problem.time_limit * 60 * 1000; // Convert minutes to milliseconds
        const elapsed = Date.now() - startTime.getTime();
        const remaining = Math.max(0, timeLimit - elapsed);
        
        console.log('Timer debug:', {
          startTime: startTime.toISOString(),
          currentTime: new Date().toISOString(),
          timeLimit: duel.problem.time_limit,
          elapsed: Math.floor(elapsed / 1000),
          remaining: Math.floor(remaining / 1000)
        });

        if (remaining <= 0) {
          setTimeLeft('00:00');
          if (!isTimeUp) {
            setIsTimeUp(true);
            onTimeUp?.(true); // Notify parent component
          }
          return;
        }

        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        setTimeLeft(timeString);
        if (isTimeUp) {
          setIsTimeUp(false);
          onTimeUp?.(false); // Reset if time comes back (shouldn't happen but just in case)
        }
      } catch (error) {
        console.error('Timer error:', error);
        setTimeLeft('--:--');
      }
    };

    // Update immediately, then every second
    updateTimer();
    interval = setInterval(updateTimer, 1000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [duel?.start_time, duel?.problem?.time_limit, duel?.status, isTimeUp, onTimeUp]);

  // Determine timer color based on time remaining
  const getTimerColor = () => {
    if (timeLeft === '--:--') return '#ffffff';
    if (isTimeUp) return '#ef4444'; // red
    
    const [minutes, seconds] = timeLeft.split(':').map(Number);
    const totalSeconds = minutes * 60 + seconds;
    
    if (totalSeconds < 60) return '#ef4444'; // red - under 1 minute
    if (totalSeconds < 120) return '#f97316'; // orange - under 2 minutes  
    if (totalSeconds < 300) return '#eab308'; // yellow - under 5 minutes
    return '#ffffff'; // white - plenty of time
  };

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
      background: '#232323',
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
            <Clock 
              className="w-4 h-4" 
              style={{ 
                color: getTimerColor(),
                filter: isTimeUp ? 'drop-shadow(0 0 4px #ef4444)' : 'none'
              }} 
            />
            <span 
              className={`text-sm font-mono ${isTimeUp ? 'animate-pulse' : ''}`}
              style={{ 
                color: getTimerColor(),
                fontWeight: isTimeUp ? 'bold' : 'normal'
              }}
            >
              {timeLeft}
            </span>
          </div>
        </div>
      </div>
      
      {/* Time warning overlay */}
      {isTimeUp && (
        <div className="absolute top-16 left-4 right-4 bg-red-600 text-white p-2 rounded text-center text-sm font-bold animate-pulse z-10">
          TIME'S UP!
        </div>
      )}
      
      {/* editor container */}
      <div style={{ background: '#101a28', borderRadius: '8px', padding: '1rem', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <div ref={editorContainerRef} style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <MonacoEditor
            height="100%"
            width="100%"
            language="c"
            theme="vs-dark"
            value={code}
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
              readOnly: isTimeUp, // Disable editing when time is up
            }}
          />
        </div>
      </div>
    </div>
  );
}