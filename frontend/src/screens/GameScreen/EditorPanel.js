import React from 'react';
import MonacoEditor from '@monaco-editor/react';
import { Clock } from 'lucide-react';

export default function EditorPanel({ code, setCode, editorRef, editorContainerRef, handleEditorWillMount, handleEditorDidMount }) {
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
    if (handleEditorDidMount) handleEditorDidMount(editor, monaco);
  }

  return (
    <div style={{
      background: '#232323', // Dark grey background for window2
      borderRadius: '8px',
      padding: '1rem 1rem 1rem 1rem',
      width: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      flex: 1,
      minHeight: 0,
    }}>
      {/* Level 1 - Header Panel with Fixed Height */}
      <div style={{
        height: '2rem', // Fixed height for Level 1 panel
        display: 'flex',
        alignItems: 'flex-end', // Align content to bottom of the panel
        paddingRight: '1.5rem', // Move content to the right
        paddingLeft: '1.5rem',
        paddingBottom: '0.25rem', // Fine-tune vertical position
        marginBottom: '1rem', // Gap between Level 1 and blue panel
      }}>
        <div className="flex items-center justify-between w-full" style={{ color: '#fff' }}>
          <div className="flex items-center gap-2">
            <span className="text-m font-semibold tracking-wide">Code</span>
            <span 
              className="text-xs" 
              style={{
                background: '#ffd700',
                color: '#232323',
                padding: '2px 8px',
                borderRadius: '6px',
                marginLeft: '8px'
              }}
            >
              C
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-white" />
            <span className="text-sm">15:42</span>
          </div>
        </div>
      </div>

      {/* Blue Panel with Monaco Editor - Same style as ProblemPanel */}
      <div style={{
        background: '#101a28', // Same blue background as ProblemPanel
        borderRadius: '8px',
        padding: '1rem',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div ref={editorContainerRef} style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <MonacoEditor
            height="100%"
            width="100%"
            language="c"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || "")}
            beforeMount={handleMonacoWillMount}
            onMount={handleMonacoDidMount}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on',
              fontFamily: 'Fira Mono, monospace',
              lineNumbers: 'on',
              tabSize: 4,
              scrollbar: {
                vertical: 'auto',
                horizontal: 'auto',
              },
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