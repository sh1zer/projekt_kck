import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import LoginScreen from './screens/LoginScreen';
import MainMenuScreen from './screens/MainMenuScreen';
import GameScreen from './screens/GameScreen';
import Options from './screens/Options';
import './App.css';
import { SoundProvider } from './SoundProvider';

function App() {
  return (
    <SoundProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<LoginScreen/>} />
            <Route path="/main-menu" element={<MainMenuScreen/>} />
            <Route path="/game" element={<GameScreen/>} />
            <Route path="/options" element={<Options/>} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </SoundProvider>
  );
}
export default App;
