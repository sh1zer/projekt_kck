// MainMenuScreen.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './MainMenuScreen.css';
import { useSound } from '../SoundProvider';
import BackgroundCanvas from './BackgroundCanvas';

function MainMenuScreen() {
  const navigate = useNavigate();
  const { playClick, playHover } = useSound();

  const handleMenuClick = (action) => {
    console.log(`Menu action: ${action}`);
    if (action === 'exit') {
      navigate('/'); // Navigate to login screen (root path)
    }
  };

  const handlePlayClick = () => {
    console.log('Starting game...');
  };

  return (
    <>
      <BackgroundCanvas />
      <div className="main-menu-root">
        {/* Left Panel */}
        <div className="main-menu-left-panel">
          <aside className="left-menu-bar">
            <div className="logo-app-container">
              <div className="hex-logo">
                <img src="/monkey.png" style={{ width: 90, height: 90 }} alt="App logo" />
              </div>
              <span className="app-name">Dante Duel</span>
            </div>
            <nav className="menu-btns-vertical">
              <Link to="/options" className="menu-btn" onMouseEnter={playHover} onClick={playClick}>
                OPTIONS
              </Link>
              <Link to="/store" className="menu-btn" onMouseEnter={playHover} onClick={playClick}>
                STORE
              </Link>
              <Link to="/tutorial" className="menu-btn" onMouseEnter={playHover} onClick={playClick}>
                TUTORIAL
              </Link>
              <button
                className="menu-btn"
                onMouseEnter={playHover}
                onClick={() => { playClick(); handleMenuClick('exit'); }}
              >
                EXIT
              </button>
            </nav>
          </aside>
        </div>

        {/* Center Content: Play and Leaderboard */}
        <main className="main-center-area">
          <div className="center-column">
            <Link
              to="/game"
              className="play-btn"
              onMouseEnter={playHover}
              onClick={() => { playClick(); handlePlayClick(); }}
            >
              PLAY
            </Link>
            <section className="leaderboard-section">
              <div className="leaderboard-header">
                <span className="trophy-icon">🏆</span>
                <span>LeaderBoard</span>
              </div>

              {/* ————————————————————————————————————————
                   Здесь добавили placeholder для аватарок
                   чтобы колонки ровно совпадали с ячейками в строках
                 ———————————————————————————————————————— */}
              <div className="leaderboard-columns">
                <div className="column-label rank">RANK</div>
                <div className="column-label avatar"></div>
                <div className="column-label player">PLAYER</div>
                <div className="column-label elo">ELO</div>
                <div className="column-label wld">W/L/D</div>
              </div>

              <div className="leaderboard-table">
                <div className="leaderboard-row">
                  <div className="rank">#1</div>
                  <img
                    className="player-avatar-img"
                    src="https://randomuser.me/api/portraits/men/1.jpg"
                    alt="Mega USER"
                  />
                  <div className="player-name">Mega USER</div>
                  <div className="elo-rating">2150</div>
                  <div className="wld">15/5/1</div>
                </div>
                <div className="leaderboard-row">
                  <div className="rank">#2</div>
                  <img
                    className="player-avatar-img"
                    src="https://randomuser.me/api/portraits/men/2.jpg"
                    alt="blablauser"
                  />
                  <div className="player-name">blablauser</div>
                  <div className="elo-rating">1950</div>
                  <div className="wld">5/15/1</div>
                </div>
              </div>
            </section>
          </div>
        </main>

        {/* Right Side */}
        <div className="right-panel">
          <div className="user-profile-card">
            <img
              className="user-profile-img"
              src="https://randomuser.me/api/portraits/men/1.jpg"
              alt="Mega USER"
            />
            <div className="user-profile-info">
              <div className="user-profile-name">Mega USER</div>
              <div className="user-profile-elo">
                ELO <span className="elo-value">2150</span>
              </div>
            </div>
            <div className="user-profile-stats">
              <div className="wld-label">W/L/D</div>
              <div className="wld-value">15/5/1</div>
            </div>
          </div>
          <section className="last-problems-card">
            <div className="last-problems-header">Last Problems</div>
            <ol className="last-problems-list">
              <li>Zadanie</li>
              <li>Zadanie</li>
              <li>Zadanie</li>
              <li>Zadanie</li>
              <li>Zadanie</li>
            </ol>
          </section>
        </div>
      </div>
    </>
  );
}

export default MainMenuScreen;