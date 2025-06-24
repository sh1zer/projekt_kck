import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSound } from '../SoundProvider';
import './ProblemsScreen.css';

function ProblemsScreen() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedProblems, setExpandedProblems] = useState(new Set());
  const { playClick, playHover } = useSound();

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await fetch('/api/problems/');
        if (response.ok) {
          const data = await response.json();
          setProblems(data);
        } else {
          setError('Failed to load problems');
        }
      } catch (err) {
        setError('Error fetching problems');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#22c55e';
      case 'medium': return '#eab308';
      case 'hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const toggleExpand = (problemId) => {
    const newExpanded = new Set(expandedProblems);
    if (newExpanded.has(problemId)) {
      newExpanded.delete(problemId);
    } else {
      newExpanded.add(problemId);
    }
    setExpandedProblems(newExpanded);
  };

  const getDisplayDescription = (description, problemId, maxLength = 150) => {
    const isExpanded = expandedProblems.has(problemId);
    const needsTruncation = description.length > maxLength;
    
    if (isExpanded || !needsTruncation) {
      return description;
    }
    return description.substring(0, maxLength) + '...';
  };

  return (
    <div className="problems-screen">
      <div className="problems-header">
        <Link to="/main-menu" className="back-btn" onMouseEnter={playHover} onClick={playClick}>
          ← Back
        </Link>
        <h1>Problems</h1>
      </div>

      {loading ? (
        <div className="loading">Loading problems...</div>
      ) : error ? (
        <div className="error">Error: {error}</div>
      ) : (
        <div className="problems-grid">
          {problems.map((problem) => {
            const isExpanded = expandedProblems.has(problem.id);
            const needsExpansion = problem.description.length > 150;
            
            return (
              <div key={problem.id} className="problem-card">
                <div className="problem-header">
                  <h3 className="problem-title">{problem.title}</h3>
                  <div className="problem-meta">
                    <span 
                      className="difficulty-badge"
                      style={{ backgroundColor: getDifficultyColor(problem.difficulty) }}
                    >
                      {problem.difficulty.toUpperCase()}
                    </span>
                    <span className="time-limit">⏱️ {problem.time_limit}min</span>
                  </div>
                </div>
                
                <div className="problem-description-container">
                  <p className="problem-description">
                    {getDisplayDescription(problem.description, problem.id)}
                  </p>
                  {needsExpansion && (
                    <button
                      className="expand-btn"
                      onMouseEnter={playHover}
                      onClick={() => { playClick(); toggleExpand(problem.id); }}
                    >
                      {isExpanded ? '−' : '+'}
                    </button>
                  )}
                </div>
                
                <div className="problem-examples">
                  <div className="example">
                    <strong>Input:</strong> {problem.sample_input}
                  </div>
                  <div className="example">
                    <strong>Output:</strong> {problem.sample_output}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ProblemsScreen;