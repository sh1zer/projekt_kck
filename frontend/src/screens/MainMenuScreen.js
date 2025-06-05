import React from 'react';
import { Link } from 'react-router-dom';

function MainMenuScreen() {
  return (
    <div>
      <h1>Main Menu</h1>
      <Link to="/game">Start Game</Link>
      <br />
      <Link to="/login">Logout</Link>
      <br/>
      <Link to="/options">Options</Link>
    </div>
  );
}
export default MainMenuScreen;
