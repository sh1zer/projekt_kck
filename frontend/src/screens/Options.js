import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './OptionsScreen.css';

function OptionsScreen() {
  const [settings, setSettings] = useState({
    soundEnabled: true,
    darkMode: true,
    autoSubmit: false,
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="options-container">
      <div className="options-card">
        <h1 className="options-title">Game Options</h1>
        
        <div className="option-group">
          <label className="option-checkbox-label">
            <input 
              type="checkbox"
              className="option-checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
            />
            Enable Sound Effects
          </label>
        </div>

        <div className="option-group">
          <label className="option-checkbox-label">
            <input 
              type="checkbox"
              className="option-checkbox"
              checked={settings.darkMode}
              onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
            />
            Dark Mode
          </label>
        </div>

        <div className="option-group">
          <label className="option-checkbox-label">
            <input 
              type="checkbox"
              className="option-checkbox"
              checked={settings.autoSubmit}
              onChange={(e) => handleSettingChange('autoSubmit', e.target.checked)}
            />
            Auto-submit on Time Limit
          </label>
        </div>

        <div className="options-buttons">
          <button className="save-button">Save Settings</button>
          <Link to="/main-menu" className="back-button">
            Back to Main Menu
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OptionsScreen;

