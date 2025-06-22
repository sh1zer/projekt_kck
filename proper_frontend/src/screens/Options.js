import React from 'react';
import { Link } from 'react-router-dom';
import './OptionsScreen.css';
import { useSound } from '../SoundProvider';

function OptionsScreen() {
  const [settings, setSettings] = React.useState({
    soundEnabled: true,
    darkMode: true,
    autoSubmit: false,
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

        {/* Sound Settings Section - now styled as part of the options card */}
        <div className="option-group" style={{ marginBottom: 18 }}>
          <div className="options-title" style={{ marginBottom: 10, fontSize: 20 }}>Sound Settings</div>
          <label style={{ color: '#232323', fontWeight: 500, display: 'block', marginBottom: 8 }}>
            Music Volume:
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={musicVolume}
              onChange={e => setMusicVolume(Number(e.target.value))}
              style={{ margin: '0 10px', verticalAlign: 'middle' }}
            />
            <span>{Math.round(musicVolume * 100)}</span>
          </label>
          <label style={{ color: '#232323', fontWeight: 500, display: 'block', marginBottom: 8 }}>
            Button Click Volume:
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={clickVolume}
              onChange={e => setClickVolume(Number(e.target.value))}
              style={{ margin: '0 10px', verticalAlign: 'middle' }}
            />
            <span>{Math.round(clickVolume * 100)}</span>
          </label>
          <label style={{ color: '#232323', fontWeight: 500, display: 'block' }}>
            Button Hover Volume:
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={hoverVolume}
              onChange={e => setHoverVolume(Number(e.target.value))}
              style={{ margin: '0 10px', verticalAlign: 'middle' }}
            />
            <span>{Math.round(hoverVolume * 100)}</span>
          </label>
        </div>
        
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

