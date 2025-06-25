import React, { useEffect, useState } from 'react';
import { Trophy, X, Home, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserHistory } from './hooks/useUserHistory';

export default function VictoryDefeatScreen({ duel, currentUser, onClose }) {
  const navigate = useNavigate();
  const [showScreen, setShowScreen] = useState(false);
  
  // Get real user stats
  const { userStats, loading } = useUserHistory(currentUser?.username);

  // Get opponent stats too
  const opponent = currentUser && duel?.player1?.id === currentUser?.id
    ? duel?.player2
    : duel?.player1;
  const { userStats: opponentStats } = useUserHistory(opponent?.username);

  // Robust victory detection
  let isWinner = false;
  if (duel?.winner && currentUser) {
    isWinner = 
      duel.winner === currentUser.username ||
      duel.winner === currentUser.id ||
      (typeof duel.winner === 'object' && duel.winner.username === currentUser.username) ||
      (typeof duel.winner === 'object' && duel.winner.id === currentUser.id);
  }

  useEffect(() => {
    const timer = setTimeout(() => setShowScreen(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleReturnToMenu = () => {
    navigate('/main-menu');
  };

  const handlePlayAgain = () => {
    navigate('/waiting');
  };

  // Calculate new stats after this game
  const newWins = userStats ? userStats.wins + (isWinner ? 1 : 0) : (currentUser?.battles_won || 0);
  const newStreak = isWinner 
    ? (userStats?.current_streak || 0) + 1 
    : 0;

  // Helper function to render win-loss display
  const renderWinLoss = (stats) => {
    if (!stats) return <span className="text-gray-400">--W--L</span>;
    const losses = stats.total_games - stats.wins;
    return (
      <span>
        <span className="text-green-400">{stats.wins}W</span>
        <span className="text-gray-400">-</span>
        <span className="text-red-400">{losses}L</span>
      </span>
    );
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 transition-opacity duration-500 ${showScreen ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 text-center transform transition-all duration-500 ${showScreen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Victory/Defeat Icon */}
        <div className="mb-6">
          {isWinner ? (
            <div className="w-20 h-20 mx-auto bg-yellow-500 rounded-full flex items-center justify-center animate-bounce">
              <Trophy className="w-10 h-10 text-yellow-900" />
            </div>
          ) : (
            <div className="w-20 h-20 mx-auto bg-red-600 rounded-full flex items-center justify-center">
              <X className="w-10 h-10 text-red-100" />
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className={`text-3xl font-bold mb-2 ${isWinner ? 'text-yellow-400' : 'text-red-400'}`}>
          {isWinner ? 'VICTORY!' : 'DEFEAT'}
        </h1>

        {/* Players Section */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Current User */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="font-medium text-white">{currentUser?.username || 'You'}</div>
            <div className="text-xs">
              {loading ? <span className="text-gray-400">Loading...</span> : renderWinLoss(userStats)}
            </div>
          </div>
          
          {/* Opponent */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="font-medium text-white">{opponent?.username || 'Opponent'}</div>
            <div className="text-xs">
              {renderWinLoss(opponentStats)}
            </div>
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-gray-300 mb-6">
          {isWinner 
            ? `You defeated ${opponent?.username || 'your opponent'}!`
            : `${opponent?.username || 'Your opponent'} solved it first!`
          }
        </p>

        {/* Problem Info */}
        {duel?.problem && (
          <div className="bg-gray-800 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-white mb-2">Problem:</h3>
            <p className="text-sm text-gray-300">{duel.problem.title}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                duel.problem.difficulty === 'easy' ? 'bg-green-600 text-green-100' :
                duel.problem.difficulty === 'medium' ? 'bg-yellow-600 text-yellow-100' :
                'bg-red-600 text-red-100'
              }`}>
                {duel.problem.difficulty?.charAt(0).toUpperCase() + duel.problem.difficulty?.slice(1)}
              </span>
              <span className="text-xs text-gray-400">
                {duel.problem.time_limit} min limit
              </span>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-gray-400">Win Streak</div>
            <div className="text-lg font-bold text-white">
              {loading ? '...' : newStreak}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-gray-400">Win Rate</div>
            <div className="text-lg font-bold text-white">
              {loading || !userStats ? '...' : `${((newWins / (userStats.total_games + 1)) * 100).toFixed(1)}%`}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handlePlayAgain}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </button>
          
          <button
            onClick={handleReturnToMenu}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}