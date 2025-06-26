import React, { useEffect, useState, useContext  } from "react";
import { Link } from 'react-router-dom';
import { SettingsContext } from '../context/SettingsContext';
import './OptionsScreen.css';
import { useSound } from '../SoundProvider';

function OptionsScreen() {
  const { themeSettings, updateSettings } = useContext(SettingsContext);
  const handleThemeChange = (e) => {
    updateSettings({ theme: e.target.value });
  };

  const [settings, setSettings] = React.useState({
    soundEnabled: true,
  });

  const {
    clickVolume, setClickVolume,
    hoverVolume, setHoverVolume,
    musicVolume, setMusicVolume
  } = useSound();

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="options-container">
      <div className="options-card">
        <h1 className="options-title">Game Options</h1>

        {/* Sound Settings Section */}
        <div className="option-group">
          <div className="options-title">Sound Settings</div>
          <label>
            Music Volume:
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={musicVolume}
              onChange={e => setMusicVolume(Number(e.target.value))}
            />
          </label>
          <label>
            Button Click Volume:
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={clickVolume}
              onChange={e => setClickVolume(Number(e.target.value))}
            />
          </label>
          <label>
            Button Hover Volume:
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={hoverVolume}
              onChange={e => setHoverVolume(Number(e.target.value))}
            />
          </label>
        </div>
        
        <div className="option-group">
          <label className="option-checkbox-label">
            Enable Sound Effects
            <input 
              type="checkbox"
              className="option-checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
            />
          </label>
        </div>
        
        <div className="option-group">
          <label className="option-checkbox-label">
            Background theme
            <select 
              value={settings.theme} 
              onChange={handleThemeChange}
              className="option-select">
              <option value="none" selected disabled hidden></option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </div>

        <div className="options-buttons">
          <button className="save-button" onClick={() => window.location.reload()}>Save Settings</button>
          <Link to="/main-menu" className="back-button">
            Back to Main Menu
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OptionsScreen;