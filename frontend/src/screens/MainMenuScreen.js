import React from 'react';
import { Link } from 'react-router-dom';
import './MainMenuScreen.css'; // You'll need to create this CSS file

function MainMenuScreen() {
  const handleMenuClick = (action) => {
    console.log(`Menu action: ${action}`);
    // Add your navigation logic here
  };

  const handlePlayClick = () => {
    console.log('Starting game...');
    // Add your game start logic here
  };

  return (
    <div className="main-menu-container">
      <div className="background-blur"></div>
      
      {/* Header */}
      <div className="header">
        <div className="logo-section">
          <div className="logo">D</div>
          <div className="logo-text">Dante Duel</div>
        </div>

        <div className="user-profile">
          <div className="user-avatar">MU</div>
          <div className="user-info">
            <h3>Mega USER</h3>
            <div className="elo">ELO 1902</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Menu Buttons */}
        <div className="menu-buttons">
          <Link to="/options" className="menu-btn">OPTIONS</Link>
          <Link to="/store" className="menu-btn">STORE</Link>
          <Link to="/tutorial" className="menu-btn">TUTORIAL</Link>
          <button className="menu-btn" onClick={() => handleMenuClick('exit')}>EXIT</button>
        </div>

        {/* Center Play Section */}
        <div className="play-section">
          <Link to="/game" className="play-btn" onClick={handlePlayClick}>PLAY</Link>
          
          {/* Leaderboard */}
          <div className="leaderboard-section">
            <div className="leaderboard-header">
              <div className="trophy-icon">🏆</div>
              <span>LeaderBoard</span>
            </div>
            <div className="leaderboard-table">
              <div className="leaderboard-row">
                <div className="rank">#1</div>
                <div className="player-avatar"></div>
                <div>Mega USER</div>
                <div className="rating">1902</div>
                <div className="wld">15/5/1</div>
              </div>
              <div className="leaderboard-row">
                <div className="rank">#2</div>
                <div className="player-avatar"></div>
                <div>blablauser</div>
                <div className="rating">1302</div>
                <div className="wld">5/15/1</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Problems Section */}
        <div className="problems-section">
          <div className="problems-header">Last Problems</div>
          <div className="problem-item">1. Zadanie</div>
          <div className="problem-item">2. Zadanie</div>
          <div className="problem-item">3. Zadanie</div>
          <div className="problem-item">4. Zadanie</div>
          <div className="problem-item">5. Zadanie</div>
        </div>
      </div>
    </div>
  );
}

export default MainMenuScreen;