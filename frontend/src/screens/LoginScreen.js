import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './LoginScreen.css'

function LoginScreen() {
  const [password, setPassword] = useState("");
  const [type, setType] = useState('password');
  const [icon, setIcon] = useState("crossed_eye.svg");  
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
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

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        navigate('/main-menu');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  return (
    <>
      <div id="center_wraper">
        <img src="banner.png" alt="Banner" id="banner_img"/>
        <div id="login_pannel">
          <form  onSubmit={handleLogin}>
            <div id="input_pannel">
              <div className="input_div">
                <div className="input_icon_div">
                  <img src="user.svg" alt="User" className="icon"/>
                </div>
                <input 
                  className="text_input" 
                  placeholder="Email"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="input_div">
                <div className="input_icon_div">
                  <img src="lock.svg" alt="Lock" className="icon"/>
                </div>
                <input 
                  className="text_input"
                  type={type} 
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  />
                <div className="input_icon_div" id="eye_icon_div" onClick={handleToggle}>
                  <img src={icon} alt="Eye" className="icon"/>
                </div>
              </div>
              <div className="input_div" id="check_div">
                <input type="checkbox" id="remeber_checkbox"/>
                <label>Remeber me</label>
              </div>
            </div>
            
            <div id="error_div">
              {error && <p style={{ color: "#c00117", margin: 0}}>{error}</p>}
            </div>
            
            <div id="button_pannel">
              <button type="submit" id = "log_in_button">Login</button>
            </div>
          </form>
          <div id="info_pannel">
            <h id="warning_header">Warning</h>
            <p id="warning_paragraf">Email i hasło są takie same jak na dante.<br/>W przypadku braku konta na dante,<br/>zwróć się do swojego prowadzącego.</p>
          </div>
        </div>        
      </div>
    </>

  );
}

export default LoginScreen;
