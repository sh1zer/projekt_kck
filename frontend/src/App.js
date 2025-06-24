import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import LoginScreen from './screens/LoginScreen';
import MainMenuScreen from './screens/MainMenuScreen';
import CodingBattleInterface from './screens/GameScreen/GameScreen';
import OptionsScreen from './screens/OptionsScreen';
import WaitingScreen from './screens/WaitingScreen';
import './App.css';
import { SoundProvider } from './SoundProvider';
import BackgroundCanvas from './screens/BackgroundCanvas';

function App() {
  return (
    <Router>
      <div className="App">
        <BackgroundCanvas />
        <Routes>
          <Route path="/login" element={<LoginScreen/>} />
          <Route path="/main-menu" element={
            <SoundProvider>
              <MainMenuScreen/>
            </SoundProvider>
          } />
          <Route path="/game/:duelId" element={
            <SoundProvider>
              <CodingBattleInterface/>
            </SoundProvider>
          } />
          <Route path="/waiting" element={<WaitingScreen />} />
          <Route path="/options" element={
            <SoundProvider>
              <OptionsScreen/>
            </SoundProvider>
          } />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
