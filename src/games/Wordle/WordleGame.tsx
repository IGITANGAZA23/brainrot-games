import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import '../../App.css';
import '../../Wordle.css';
import { getRandomWord, getWordDefinition } from '../../wordList';
import GameBoard, { GameBoardRef } from '../../components/GameBoard';
import Keyboard from '../../components/Keyboard';
import Title from '../../components/Title';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';
import { soundManager } from '../../utils/sound';

interface WordleGameProps {
  isDarkMode: boolean;
  isSoundEnabled: boolean;
  onBack: () => void;
}

function WordleGame({ isDarkMode, isSoundEnabled, onBack }: WordleGameProps) {
  const [targetWord, setTargetWord] = useState<string>('');
  const [wordDefinition, setWordDefinition] = useState<string>('');
  const [guesses, setGuesses] = useState<string[]>(Array(6).fill(''));
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [currentRow, setCurrentRow] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const gameBoardRef = useRef<GameBoardRef>(null);

  const [spacePositions, setSpacePositions] = useState<number[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [screenWidth, setScreenWidth] = useState<number>(window.innerWidth);

  const startNewGame = useCallback(() => {
    const newWord = getRandomWord();
    setTargetWord(newWord);
    setWordDefinition(getWordDefinition(newWord) || '');
    setGuesses(Array(6).fill(''));
    setCurrentGuess('');
    setCurrentRow(0);
    setGameOver(false);
    setGameWon(false);
    setShowModal(false);

    const newSpacePositions: number[] = [];
    for (let i = 0; i < newWord.length; i++) {
      if (newWord[i] === ' ') {
        newSpacePositions.push(i);
      }
    }
    setSpacePositions(newSpacePositions);

    if (gameBoardRef.current) {
      gameBoardRef.current.revealRow(-1);
    }
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  useEffect(() => {
    for (const position of spacePositions) {
      if (currentGuess.length === position) {
        setCurrentGuess((prev) => prev + ' ');
      }
    }
  }, [currentGuess, spacePositions]);

  const getEffectiveGuessLength = useCallback(
    (guess: string): number => {
      let effectiveLength = 0;
      for (let i = 0; i < guess.length; i++) {
        if (guess[i] !== ' ' || !spacePositions.includes(i)) {
          effectiveLength++;
        }
      }
      return effectiveLength;
    },
    [spacePositions]
  );

  const effectiveTargetLength = targetWord.length - spacePositions.length;

  const submitGuess = useCallback(() => {
    const effectiveGuessLen = getEffectiveGuessLength(currentGuess);

    if (effectiveGuessLen !== effectiveTargetLength) {
      setShowToast(true);
      gameBoardRef.current?.shakeRow(currentRow);
      setTimeout(() => setShowToast(false), 2000);
      return;
    }

    const newGuesses = [...guesses];
    newGuesses[currentRow] = currentGuess;
    setGuesses(newGuesses);

    gameBoardRef.current?.revealRow(currentRow);

    if (currentGuess.toUpperCase() === targetWord.toUpperCase()) {
      setGameOver(true);
      setGameWon(true);
    } else {
      if (currentRow < 5) {
        setCurrentRow(currentRow + 1);
        setCurrentGuess('');
      } else {
        setGameOver(true);
      }
    }
  }, [
    currentGuess,
    targetWord,
    guesses,
    currentRow,
    effectiveTargetLength,
    getEffectiveGuessLength,
  ]);

  const getNextTypePosition = useCallback(
    (currentLength: number): number => {
      if (spacePositions.includes(currentLength)) {
        return getNextTypePosition(currentLength + 1);
      }
      return currentLength;
    },
    [spacePositions]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (gameOver) return;
      if (event.altKey) return;

      const key = event.key.toUpperCase();

      if (key === 'ENTER') {
        submitGuess();
      } else if (key === 'BACKSPACE') {
        if (spacePositions.includes(currentGuess.length - 1)) {
          setCurrentGuess((prev) => prev.slice(0, -2));
        } else {
          setCurrentGuess((prev) => prev.slice(0, -1));
        }
      } else if (
        /^[A-Z]$/.test(key) &&
        currentGuess.length < targetWord.length
      ) {
        const nextPos = getNextTypePosition(currentGuess.length);
        if (nextPos > currentGuess.length) {
          let newGuess = currentGuess;
          while (newGuess.length < nextPos) {
            newGuess += ' ';
          }
          newGuess += key;
          setCurrentGuess(newGuess);
        } else {
          setCurrentGuess((prev) => prev + key);
        }
      }
    },
    [currentGuess, gameOver, submitGuess, targetWord, spacePositions, getNextTypePosition]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleKeyClick = useCallback(
    (key: string) => {
      if (gameOver) return;

      if (key === 'ENTER') {
        submitGuess();
      } else if (key === 'BACKSPACE') {
        if (spacePositions.includes(currentGuess.length - 1)) {
          setCurrentGuess((prev) => prev.slice(0, -2));
        } else {
          setCurrentGuess((prev) => prev.slice(0, -1));
        }
      } else if (currentGuess.length < targetWord.length) {
        const nextPos = getNextTypePosition(currentGuess.length);
        if (nextPos > currentGuess.length) {
          let newGuess = currentGuess;
          while (newGuess.length < nextPos) {
            newGuess += ' ';
          }
          newGuess += key;
          setCurrentGuess(newGuess);
        } else {
          setCurrentGuess((prev) => prev + key);
        }
      }
    },
    [currentGuess, gameOver, submitGuess, targetWord, spacePositions, getNextTypePosition]
  );

  useEffect(() => {
    if (showModal) {
      soundManager.play(gameWon ? 'win' : 'fail');
    }
  }, [showModal, gameWon]);

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = width < 600;
      setScreenWidth(width);
      setIsMobile(isTouchDevice || isSmallScreen);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="wordle-game-wrapper">
      <div className="game-nav-controls">
         <button onClick={onBack} className="back-button">← Exit Game</button>
      </div>
      <Modal
        isOpen={showModal}
        onClose={startNewGame}
        title={gameWon ? '🎉 Congratulations!' : '😔 Game Over'}
        word={targetWord}
        definition={wordDefinition}
        isWin={gameWon}
      />

      <main className={`wordle-container ${isMobile ? 'mobile' : ''}`}>
        <Title />
        <Toast
          isVisible={showToast}
          message={`Word must be ${effectiveTargetLength} letters!`}
        />
        <motion.section
          className="definition"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          aria-live="polite"
          aria-atomic="true"
        >
          <p>Definition: {wordDefinition}</p>
        </motion.section>

        <GameBoard
          ref={gameBoardRef}
          guesses={guesses}
          currentGuess={currentGuess}
          currentRow={currentRow}
          targetWord={targetWord}
          onRevealComplete={() => {
            if (gameOver) {
              setShowModal(true);
            }
          }}
          isMobile={isMobile}
          screenWidth={screenWidth}
        />

        <Keyboard
          guesses={guesses}
          currentRow={currentRow}
          targetWord={targetWord}
          gameOver={gameOver}
          onKeyClick={handleKeyClick}
        />
      </main>
    </div>
  );
}

export default WordleGame;
