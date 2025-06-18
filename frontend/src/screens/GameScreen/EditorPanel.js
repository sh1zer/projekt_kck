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
    <>
      <div style={{background:'#232323', color:'#fff', borderRadius:'8px 8px 0 0', padding:'0.5rem 1rem 0 1rem', marginBottom:0}} className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-wide">Code</span>
          <span className="text-xs" style={{background:'#232323',color:'#ffd700',padding:'2px 8px',borderRadius:'6px',marginLeft:'8px', border:'1px solid #ffd700'}}>C</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-white" />
          <span className="text-sm">15:42</span>
        </div>
      </div>
      <div style={{background:'#101a28', borderRadius:'0 0 8px 8px', padding:'1rem 1rem 1rem 1rem', flex:1, minHeight:0, display:'flex', flexDirection:'column'}}>
        <div ref={editorContainerRef} style={{flex:1, minHeight:0, display:'flex', flexDirection:'column'}}>
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
    </>
  );
} 