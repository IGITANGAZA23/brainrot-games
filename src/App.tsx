import { useState, useEffect } from 'react';
import './App.css';
import Nav from './components/Nav';
import Footer from './components/Footer';
import Hub from './components/Hub/Hub';
import WordleGame from './games/Wordle/WordleGame';
import ClickerGame from './games/Clicker/ClickerGame';
import SkibidiBird from './games/Runner/SkibidiBird';
import { soundManager } from './utils/sound';

function App() {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedPreference = localStorage.getItem('darkMode');
    if (savedPreference !== null) {
      return savedPreference === 'true';
    }
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  useEffect(() => {
    soundManager.setEnabled(isSoundEnabled);
  }, [isSoundEnabled]);

  const handleSelectGame = (gameId: string) => {
    setActiveGame(gameId);
  };

  const handleBackToHub = () => {
    setActiveGame(null);
  };

  return (
    <div className="app">
      {!activeGame && (
        <header>
          <Nav
            isDarkMode={isDarkMode}
            isSoundEnabled={isSoundEnabled}
            onThemeToggle={() => setIsDarkMode(!isDarkMode)}
            onSoundToggle={() => setIsSoundEnabled(!isSoundEnabled)}
          />
        </header>
      )}

      <main className="main-content">
        {activeGame === null && (
          <Hub onSelectGame={handleSelectGame} />
        )}

        {activeGame === 'wordle' && (
          <WordleGame
            isDarkMode={isDarkMode}
            isSoundEnabled={isSoundEnabled}
            onBack={handleBackToHub}
          />
        )}

        {activeGame === 'clicker' && (
          <ClickerGame onBack={handleBackToHub} />
        )}

        {activeGame === 'flappy' && (
          <SkibidiBird onBack={handleBackToHub} />
        )}
      </main>

      {!activeGame && <Footer />}
    </div>
  );
}

export default App;

