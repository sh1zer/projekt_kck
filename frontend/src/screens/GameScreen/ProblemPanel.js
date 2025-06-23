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

      {/* Function Signature */}
      <div className="mb-4 p-3 bg-gray-900 rounded border border-gray-700">
        <div className="text-sm text-gray-300 mb-1">Function Signature:</div>
        <code className="text-yellow-400 font-mono text-sm">{problem.signature}</code>
      </div>

      <div className="text-white space-y-4 overflow-y-auto flex-1">
        <div className="whitespace-pre-wrap">{problem.description}</div>
      </div>
    </div>
  );
}