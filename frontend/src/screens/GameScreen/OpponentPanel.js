import React, { useState } from 'react';
import { Check, X, ChevronDown, ChevronRight, User } from 'lucide-react';

export default function OpponentPanel({ duel, currentUser }) {
  if (!duel) {
    return (
      <div className="gamescreen-panel" style={{padding:'1rem', borderRadius:'8px', flex:1, minHeight:0}}>
        <h3>Waiting for opponent...</h3>
      </div>
    );
  }

  const opponent = currentUser && duel.player1 && duel.player1.id === currentUser.id
    ? duel.player2
    : duel.player1;

  // Find opponent's latest submission, if any
  let latestOppSubmission = null;
  if (duel.submissions && opponent) {
    const opponentSubs = duel.submissions
      .filter((s) => s.player && s.player.id === opponent.id)
      .sort((a, b) => new Date(b.submission_time) - new Date(a.submission_time));
    latestOppSubmission = opponentSubs[0];
  }

  const tests = latestOppSubmission ? latestOppSubmission.result.tests : null;

  // State for expanding / collapsing individual tests
  const [expanded, setExpanded] = useState(new Set());

  const toggle = (id) => {
    const newSet = new Set(expanded);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setExpanded(newSet);
  };

  return (
    <div style={{background:'#101a28', borderRadius:'16px', padding:'0 1rem 1rem 1rem', flex:1, minHeight:0, height:'100%', display:'flex', flexDirection:'column'}}>
      {/* PROFILE HEADER */}
      <div style={{marginTop:'1rem', marginBottom:'0.5rem'}}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 gamescreen-profile rounded-full flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="font-medium">{opponent ? opponent.username : 'Opponent'}</div>
            <div className="text-xs gamescreen-elo">{opponent?.elo ?? 1950}</div>
          </div>
          <div className="ml-auto">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* TEST LIST */}
      {tests ? (
        <div className="space-y-2 overflow-y-auto" style={{flex:1, minHeight:0}}>
          {Object.entries(tests).map(([id, test]) => (
            <div key={id} className="border border-gray-700 rounded">
              <div
                className="flex items-center gap-2 text-sm p-2 cursor-pointer hover:bg-gray-700"
                onClick={() => toggle(id)}
              >
                {test.status === 'PASS' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
                <span className={test.status === 'PASS' ? 'text-green-400' : 'text-red-400'}>
                  Test #{id}
                </span>
                <div className="ml-auto">
                  {expanded.has(id) ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
              {expanded.has(id) && (
                <div className="px-4 pb-2 text-xs space-y-2 text-gray-400">
                  {test.input && (
                    <div className="bg-gray-900 p-2 rounded">
                      <div className="text-gray-300 font-medium mb-1">Input:</div>
                      <div className="whitespace-pre-wrap">{test.input}</div>
                    </div>
                  )}
                  {test.expected && (
                    <div className="bg-gray-900 p-2 rounded">
                      <div className="text-gray-300 font-medium mb-1">Expected:</div>
                      <div className="whitespace-pre-wrap">{test.expected}</div>
                    </div>
                  )}
                  {test.actual && (
                    <div className="bg-gray-900 p-2 rounded">
                      <div className="text-gray-300 font-medium mb-1">Actual:</div>
                      <div className="whitespace-pre-wrap">{test.actual}</div>
                    </div>
                  )}
                  {test.message && (
                    <div className="bg-red-950 border border-red-800 p-2 rounded">
                      <div className="text-red-300 font-medium mb-1">Error:</div>
                      <pre className="text-red-400 whitespace-pre-wrap">{test.message}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">Opponent has not submitted yet.</p>
      )}
    </div>
  );
} 