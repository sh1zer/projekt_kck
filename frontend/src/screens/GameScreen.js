import React from 'react';
import { Link } from 'react-router-dom';

function GameScreen() {
  return (
    <div>
      <h1>Game Screen</h1>
      <p>The game will be here!</p>
      <Link to="/main-menu">Back to Main Menu</Link>
    </div>
  );
}
export default GameScreen;
