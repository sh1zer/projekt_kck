import React from 'react';

export default function ProblemPanel({ duel, ...props }) {
  if (!duel || !duel.problem) {
    return (
      <div style={{
        background:'#101a28',
        borderRadius:'8px',
        padding:'1rem',
        width:'100%',
        boxSizing:'border-box',
        display:'flex',
        flexDirection:'column',
        height:'100%',
        flex: 1,
        minHeight: 0,
        ...props?.style
      }}>
        <p className="text-gray-400">Loading problem...</p>
      </div>
    );
  }

  const { problem } = duel;

  return (
    <div style={{
      background:'#101a28',
      borderRadius:'8px',
      padding:'1rem 1rem 1rem 1rem',
      width:'100%',
      boxSizing:'border-box',
      display:'flex',
      flexDirection:'column',
      height:'100%',
      flex: 1,
      minHeight: 0,
      ...props?.style
    }}>
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-xl font-bold" style={{color: '#fff'}}>{problem.title}</h1>
        <span 
          className={`px-2 py-1 rounded text-xs font-medium ${
            problem.difficulty === 'easy' ? 'bg-green-600 text-green-100' :
            problem.difficulty === 'medium' ? 'bg-yellow-600 text-yellow-100' :
            'bg-red-600 text-red-100'
          }`}
        >
          {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1)}
        </span>
      </div>


      <div className="text-white space-y-4 overflow-y-auto flex-1">
        {/* Problem Description */}
        <div className="whitespace-pre-wrap">{problem.description}</div>
        
        {/* Sample Input/Output */}
        {(problem.sample_input || problem.sample_output) && (
          <div className="space-y-3 pt-4 border-t border-gray-700">
            <h3 className="text-lg font-semibold text-white">Examples</h3>
            
            {problem.sample_input && (
              <div className="bg-gray-900 p-3 rounded border border-gray-700">
                <div className="text-sm font-medium text-gray-300 mb-2">Sample Input:</div>
                <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">{problem.sample_input}</pre>
              </div>
            )}
            
            {problem.sample_output && (
              <div className="bg-gray-900 p-3 rounded border border-gray-700">
                <div className="text-sm font-medium text-gray-300 mb-2">Sample Output:</div>
                <pre className="text-blue-400 font-mono text-sm whitespace-pre-wrap">{problem.sample_output}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}