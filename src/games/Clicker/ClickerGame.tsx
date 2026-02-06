import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import './Clicker.css';

const ClickerGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [count, setCount] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [clicks, setClicks] = useState<{ id: number; x: number; y: number; val: number }[]>([]);

  const handleClick = (e: React.MouseEvent) => {
    const val = multiplier;
    setCount(prev => prev + val);

    // Add visual click effect
    const newClick = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY,
      val
    };
    setClicks(prev => [...prev, newClick]);

    // Remove click after animation
    setTimeout(() => {
      setClicks(prev => prev.filter(c => c.id !== newClick.id));
    }, 1000);
  };

  const buyUpgrade = (cost: number, mult: number) => {
    if (count >= cost) {
      setCount(prev => prev - cost);
      setMultiplier(prev => prev + mult);
    }
  };

  return (
    <div className="clicker-container">
      <button onClick={onBack} className="back-button">← Exit Game</button>

      <div className="clicker-content">
        <motion.div
          className="score-display"
          key={count}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.1 }}
        >
          {count.toLocaleString()}
          <div className="score-label">SIGMA POINTS</div>
        </motion.div>

        <motion.div
          className="main-clicker"
          whileTap={{ scale: 0.9 }}
          onClick={handleClick}
        >
          🗿
        </motion.div>

        <div className="upgrades">
          <button
            className="upgrade-btn"
            disabled={count < 10}
            onClick={() => buyUpgrade(10, 1)}
          >
            Mewing Lesson (Cost: 10) [+1/click]
          </button>
          <button
            className="upgrade-btn"
            disabled={count < 100}
            onClick={() => buyUpgrade(100, 10)}
          >
            Looksmaxxing (Cost: 100) [+10/click]
          </button>
          <button
            className="upgrade-btn"
            disabled={count < 1000}
            onClick={() => buyUpgrade(1000, 100)}
          >
            Skibidi Training (Cost: 1000) [+100/click]
          </button>
        </div>
      </div>

      <AnimatePresence>
        {clicks.map(click => (
          <motion.div
            key={click.id}
            initial={{ opacity: 1, y: click.y - 20, x: click.x }}
            animate={{ opacity: 0, y: click.y - 100 }}
            exit={{ opacity: 0 }}
            className="floating-text"
          >
            +{click.val}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ClickerGame;
