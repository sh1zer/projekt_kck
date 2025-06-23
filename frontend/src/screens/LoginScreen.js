import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from 'react-router-dom';
import './LoginScreen.css'
import { useSound } from '../SoundProvider';

function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [type, setType] = useState('password');
  const [icon, setIcon] = useState("crossed_eye.svg");
  const { setMusicPlaying, playMusicNow, playClick } = useSound();
  const navigate = useNavigate();

  const handleToggle = () => {
    if (type==='password'){
        setType('text')
        setIcon("eye.svg")
    } else {
        setType('password')
        setIcon("crossed_eye.svg")
    }
  }

  const handleLogin = async () => {
    playClick();
    try {
      const response = await fetch('/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        navigate('/main-menu');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    }
  };

  // Debug button handler
  const handleDebugPlayMusic = () => {
    playMusicNow();
    console.log('Debug: Play Music button clicked');
  };

  return (
    <>
      <div id="center_wraper">
        <div id="login_pannel">
          <img src="/monkey.png" style={{ width: 140, height: 140 }} alt="App logo" />
          <h1 id="login-title">Dante Duel</h1>
          <div id="input_pannel">
            <div className="input_div">
              <div className="input_icon_div">
                <img src="user.svg" alt="User" className="icon"/>
              </div>
              <input className="text_input" type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} onFocus={playMusicNow} />
            </div>
            <div className="input_div">
              <div className="input_icon_div">
                <img src="lock.svg" alt="Lock" className="icon"/>
              </div>
              <input className="text_input" type={type} placeholder="Hasło" value={password} onChange={(e) => setPassword(e.target.value)} />
              <div className="input_icon_div" id="eye_icon_div" onClick={handleToggle}>
                <img src={icon} alt="Eye" className="icon"/>
              </div>
            </div>
            <div className="input_div" id="check_div">
              <input type="checkbox" id="remeber_checkbox"/>
              <label>Zapamiętaj mnie</label>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
          </div>
          <div id="button_pannel">
            <Link to="#" onClick={(e) => { e.preventDefault(); handleLogin(); }} id="log_in_button">Zaloguj</Link> 
          </div>
          <div id="info_pannel">
            <h id="warning_header">Uwaga</h>
            <p id="warning_paragraf">Email i hasło są takie same jak na dante.<br/>W przypadku braku konta na dante,<br/>zwróć się do swojego prowadzącego.</p>
          </div>
        </div>        
      </div>
    </>

  );
}

export default LoginScreen;
