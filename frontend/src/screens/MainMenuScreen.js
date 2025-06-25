// MainMenuScreen.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import './MainMenuScreen.css';
import { useSound } from '../SoundProvider';

function MainMenuScreen() {
  const navigate = useNavigate();
  const { playClick, playHover } = useSound();
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const username = localStorage.getItem('username');
        if (!username) {
          navigate('/');
          return;
        }

        const response = await fetch(`/api/users/${username}/history/`);
        if (response.ok) {
          const data = await response.json();
          setUserStats(data);
        } else {
          setError('Failed to load user data');
        }
      } catch (err) {
        setError('Error fetching user data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleMenuClick = (action) => {
    console.log(`Menu action: ${action}`);
    if (action === 'exit') {
      navigate('/');
    }
  };

  const handlePlayClick = () => {
    playClick();
    navigate('/waiting');
  };

  const formatWLDStats = (stats) => {
    if (!stats) return { wins: 0, losses: 0, draws: 0 };
    const draws = stats.total_games - stats.wins - stats.losses;
    return {
      wins: stats.wins,
      losses: stats.losses,
      draws: draws
    };
  };
  return (
    <>
      <div className="main-menu-root">
        {/* Left Panel */}
          <div className="main-menu-left-panel">
            <div className="logo-profile-card">
              <div className="hex-logo">
                <img src="/monkey.png" style={{ width: 75, height: 75 }} alt="App logo" />
              </div>
              <div className="logo-info">
                <div className="app-name">Dante Duel</div>
              </div>
            </div>
            
            <section className="menu-buttons-card">
              <nav className="menu-btns-vertical">
                <Link to="/options" className="menu-btn" onMouseEnter={playHover} onClick={playClick}>
                  OPTIONS
                </Link>
                <Link to="/problems" className="menu-btn" onMouseEnter={playHover} onClick={playClick}>
                  PROBLEMS
                </Link>
                <button
                  className="menu-btn"
                  onMouseEnter={playHover}
                  onClick={() => { playClick(); handleMenuClick('exit'); }}
                >
                  EXIT
                </button>
              </nav>
            </section>
          </div>

        {/* Center Content: Play and Leaderboard */}
        <main className="main-center-area">
          <div className="center-column">
            <button
              className="play-btn"
              onMouseEnter={playHover}
              onClick={handlePlayClick}
            >
              PLAY
            </button>
          </div>
        </main>

        {/* Right Side */}
        <div className="right-panel">
          <div className="user-profile-card">
            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div>Error: {error}</div>
            ) : userStats ? (
              <>
                <div className="user-profile-img placeholder-avatar">
                  {userStats.username.charAt(0).toUpperCase()}
                </div>
                <div className="user-profile-info">
                  <div className="user-profile-name">{userStats.username}</div>
                  <div className="user-profile-elo">
                    WIN RATE <span className="elo-value">{userStats.statistics.win_rate}%</span>
                  </div>
                </div>
                
              <div className="user-profile-stats">
                <div className="wld-breakdown">
                  {(() => {
                    const { wins, losses, draws } = formatWLDStats(userStats.statistics);
                    return (
                      <>
                        <div className="wld-stat win">W:{wins}</div>
                        <div className="wld-stat draw">D:{draws}</div>
                        <div className="wld-stat loss">L:{losses}</div>
                      </>
                    );
                  })()}
                </div>
              </div>
              </>
            ) : null}
          </div>
          
        
        <section className="last-problems-card">
          <div className="last-problems-header">Recent Matches</div>
          {loading ? (
            <div>Loading matches...</div>
          ) : error ? (
            <div>No recent matches</div>
          ) : userStats && userStats.recent_matches.length > 0 ? (
            
          <ol className="last-problems-list">
          {userStats.recent_matches.slice(0, 4).map((match, index) => {
            // Map different result types to consistent classes
            let resultClass = 'match-result-loss'; // default
            if (match.result === 'win') {
              resultClass = 'match-result-win';
            } else if (match.result === 'draw' || match.result === 'timeout') {
              resultClass = 'match-result-draw';
            }
            
            return (
              <li key={match.duel_id} className={resultClass}>
                <strong>{match.problem_title}</strong>
                <br />
                <small>
                  vs {match.opponent} - {match.result.toUpperCase()} ({match.problem_difficulty})
                </small>
              </li>
            );
          })}
        </ol>
          ) : (
            <div>No recent matches found</div>
          )}
        </section>
        </div>
      </div>
    </>
  );
}

export default MainMenuScreen;