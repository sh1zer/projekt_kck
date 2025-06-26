import React from 'react';
import { Link } from 'react-router-dom';
import './OptionsScreen.css';
import { useSound } from '../SoundProvider';

function OptionsScreen() {
  const [settings, setSettings] = React.useState({
    soundEnabled: true,
  });

  const {
    playClick, playHover,
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
        
       
        <div className="options-buttons">
          <button
            className="save-button"
            onMouseEnter={playHover}
            onClick={playClick}
          >
            Save Settings
          </button>
          <Link
            to="/main-menu"
            className="back-button"
            onMouseEnter={playHover}
            onClick={playClick}
          >
            Back to Main Menu
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OptionsScreen;