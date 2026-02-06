import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import './SkibidiBird.css';

const GRAVITY = 0.6;
const JUMP = -8;
const PIPE_SPEED = 3;
const PIPE_SPAWN_RATE = 1500;
const BIRD_SIZE = 40;
const PIPE_WIDTH = 60;
const GAP_SIZE = 160;

interface Pipe {
  id: number;
  x: number;
  topHeight: number;
  passed: boolean;
}

const SkibidiBird: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [birdY, setBirdY] = useState(300);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const requestRef = useRef<number>(null);
  const lastPipeTime = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const jump = () => {
    if (gameOver) return;
    if (!gameStarted) {
      setGameStarted(true);
      setGameOver(false);
      setScore(0);
      setPipes([]);
      setBirdY(300);
    }
    setVelocity(JUMP);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        jump();
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, gameOver]);

  const update = (time: number) => {
    if (gameStarted && !gameOver) {
      // Update Bird
      setBirdY(prevY => {
        const nextY = prevY + velocity;
        setVelocity(prevV => prevV + GRAVITY);

        // Bounds check
        if (nextY < 0 || nextY > (containerRef.current?.clientHeight || 600) - BIRD_SIZE) {
          setGameOver(true);
        }
        return nextY;
      });

      // Update Pipes
      if (time - lastPipeTime.current > PIPE_SPAWN_RATE) {
        const height = Math.random() * (400 - 100) + 100;
        setPipes(prev => [...prev, { id: Date.now(), x: 800, topHeight: height, passed: false }]);
        lastPipeTime.current = time;
      }

      setPipes(prev => {
        const nextPipes = prev.map(p => ({ ...p, x: p.x - PIPE_SPEED }))
          .filter(p => p.x > -PIPE_WIDTH);

        // Collision detection & Scoring
        nextPipes.forEach(p => {
          if (p.x < 100 + BIRD_SIZE && p.x + PIPE_WIDTH > 100) {
            if (birdY < p.topHeight || birdY + BIRD_SIZE > p.topHeight + GAP_SIZE) {
              setGameOver(true);
            }
          }
          if (!p.passed && p.x + PIPE_WIDTH < 100) {
            p.passed = true;
            setScore(s => s + 1);
          }
        });

        return nextPipes;
      });
    }
    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameStarted, gameOver, birdY, velocity]);

  return (
    <div className="flappy-game-wrapper" ref={containerRef} onClick={jump}>
      <button onClick={(e) => { e.stopPropagation(); onBack(); }} className="back-button">← Exit Game</button>

      <div className="flappy-ui">
        <div className="flappy-score">{score}</div>
        {!gameStarted && !gameOver && <div className="flappy-hint">TAP TO START</div>}
      </div>

      <AnimatePresence>
        {gameOver && (
          <motion.div
            className="game-over-overlay glass-card"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2>GAME OVER</h2>
            <p>Score: {score}</p>
            <button className="restart-btn" onClick={(e) => { e.stopPropagation(); setGameStarted(false); setGameOver(false); }}>RETRY</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="bird"
        style={{
          top: birdY,
          left: 100,
          transform: `rotate(${Math.min(90, velocity * 4)}deg)`
        }}
      >
        🚽
      </div>

      {pipes.map(pipe => (
        <React.Fragment key={pipe.id}>
          <div
            className="pipe top"
            style={{ left: pipe.x, height: pipe.topHeight, width: PIPE_WIDTH }}
          />
          <div
            className="pipe bottom"
            style={{ left: pipe.x, top: pipe.topHeight + GAP_SIZE, width: PIPE_WIDTH, height: 1000 }}
          />
        </React.Fragment>
      ))}

      <div className="ground"></div>
    </div>
  );
};

export default SkibidiBird;
