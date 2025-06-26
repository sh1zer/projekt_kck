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
import BackgroundCanvas from './screens/BackgroundCanvas';
import ProblemsScreen from './screens/ProblemsScreen';

function App() {
  return (
    <Router>
      <div className="App">
        <BackgroundCanvas />
        <Routes>
          <Route path="/login" element={<LoginScreen/>} />
          <Route path="/main-menu" element={<MainMenuScreen />} />
          <Route path="/game/:duelId" element={<CodingBattleInterface />} />
          <Route path="/waiting" element={<WaitingScreen />} />
          <Route path="/options" element={<OptionsScreen />} />
          <Route path="/problems" element={<ProblemsScreen />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
