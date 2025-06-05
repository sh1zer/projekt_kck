import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';

function LoginScreen() {
  const [password, setPassword] = useState("");
  const [type, setType] = useState('password');
  const [icon, setIcon] = useState("crossed_eye.svg");

  const handleToggle = () => {
    if (type==='password'){
        setType('text')
        setIcon("eye.svg")
    } else {
        setType('password')
        setIcon("crossed_eye.svg")
    }
  }

  return (
    <>
      <div id="center_wraper">
        <img src="banner.png" alt="Banner" id="banner_img"/>
        <div id="login_pannel">
          <div id="input_pannel">
            <div className="input_div">
              <div className="input_icon_div">
                <img src="user.svg" alt="User" className="icon"/>
              </div>
              <input className="text_input" type="email" placeholder="Email"/>
            </div>
            <div className="input_div">
              <div className="input_icon_div">
                <img src="lock.svg" alt="Lock" className="icon"/>
              </div>
              <input className="text_input" type={type} placeholder="Hasło"/>
              <div className="input_icon_div" id="eye_icon_div" onClick={handleToggle}>
                <img src={icon} alt="Eye" className="icon"/>
              </div>
            </div>
            <div className="input_div" id="check_div">
              <input type="checkbox" id="remeber_checkbox"/>
              <label>Zapamiętaj mnie</label>
            </div>
          </div>
          <div id="button_pannel">
            <Link to="/main-menu" id = "log_in_button">Zaloguj</Link> 
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
