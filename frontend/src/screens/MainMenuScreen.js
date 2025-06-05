import React from 'react';
import { Link } from 'react-router-dom';

function MainMenuScreen() {
  return (
    <div id = "main_menu_screen">
      <div id="button_pannel_pos_div">
        <div id="button_pannel_div">
          <div id="banner_div">
            <img src="ape_icon.png" alt="Ape" id="banner_icon"/>
            <div id="banner_text">Dante Duel</div>
          </div>
          
          <Link className="menu_button">OPTIONS</Link>
          <Link className="menu_button">STORE</Link>
          <Link className="menu_button">TUTORIAL</Link>
          <Link to="/login" className="menu_button">EXIT</Link>
        </div>
      </div>
      <div id="center_pannel_pos_div">
        <Link to="/game" className="menu_button">PLAY</Link>
      </div>
      <div id="user_pannel_pos_div"></div>
    </div>
  );
}
export default MainMenuScreen;
