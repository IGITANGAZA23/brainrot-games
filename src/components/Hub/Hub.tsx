import React from 'react';
import { motion } from 'motion/react';
import './Hub.css';

interface GameInfo {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
}

const games: GameInfo[] = [
  {
    id: 'wordle',
    title: 'Wordle',
    description: 'The classic word guessing game.',
    emoji: '📝',
    color: '#6aaa64'
  },
  {
    id: 'clicker',
    title: 'Sigma Clicker',
    description: 'Click to unlock your inner Sigma. Very brainrot.',
    emoji: '🗿',
    color: '#3498db'
  },
  {
    id: 'flappy',
    title: 'Skibidi Bird',
    description: 'Coming Soon... (Too much rot)',
    emoji: '🚽',
    color: '#e74c3c'
  }
];

interface HubProps {
  onSelectGame: (gameId: string) => void;
}

const Hub: React.FC<HubProps> = ({ onSelectGame }) => {
  return (
    <div className="hub-container">
      <motion.div
        className="hub-header"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>Brainrot Game Center</h1>
        <p>Unlock your maximum brainrot potential</p>
      </motion.div>

      <div className="game-grid">
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            className="game-card"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectGame(game.id)}
            style={{ '--accent-color': game.color } as any}
          >
            <div className="game-emoji">{game.emoji}</div>
            <div className="game-info">
              <h3>{game.title}</h3>
              <p>{game.description}</p>
            </div>
            <div className="game-card-glass"></div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="brainrot-meter-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="meter-label">Current Brainrot Level: <span>MAX</span></div>
        <div className="meter-bar">
          <motion.div
            className="meter-fill"
            animate={{ width: ['0%', '100%'] }}
            transition={{ duration: 2, ease: "easeInOut" }}
          ></motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Hub;
