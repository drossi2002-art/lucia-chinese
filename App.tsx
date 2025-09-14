import React, { useState, useEffect } from 'react';
import LearningView from './components/LearningView';
import QuizView from './components/QuizView';
import { WORDS } from './constants';
import { speak, isChineseSupported } from './services/ttsService';
import ProgressBar from './components/ProgressBar';

enum GameState {
  Welcome,
  Learning,
  Quiz,
  Finished
}

type TtsStatus = 'checking' | 'ready' | 'unsupported';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.Welcome);
  const [progress, setProgress] = useState<boolean[]>(new Array(WORDS.length).fill(false));
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [ttsStatus, setTtsStatus] = useState<TtsStatus>('checking');

  useEffect(() => {
    // Check for Chinese TTS support when the app loads.
    isChineseSupported().then(isSupported => {
        setTtsStatus(isSupported ? 'ready' : 'unsupported');
    });
  }, []);

  const handleWordLearned = (index: number) => {
    const newProgress = [...progress];
    newProgress[index] = true;
    setProgress(newProgress);
  };

  const handleStartLearning = () => {
    setGameState(GameState.Learning);
    speak("Let's start learning!", 'en-US');
  };

  const handleStartQuiz = () => {
    setGameState(GameState.Quiz);
    speak("Great job! Now, are you ready for a quiz?", 'en-US');
  };
  
  const handleQuizFinished = () => {
    setGameState(GameState.Finished);
    speak("You finished the quiz! You are amazing!", 'en-US');
  }

  const handlePlayAgain = () => {
    setProgress(new Array(WORDS.length).fill(false));
    setCurrentWordIndex(0);
    setGameState(GameState.Welcome);
  };

  const renderWelcomeScreen = () => {
    return (
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-pink-500 mb-4">Lucia's Chinese Adventure</h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8">Ready to learn some new words?</p>

        {ttsStatus === 'unsupported' && (
            <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 rounded-lg my-6 text-left max-w-lg mx-auto">
                <h3 className="font-bold">Chinese Voice Needed</h3>
                <p className="text-sm">To hear Chinese words, please install the free Chinese voice pack on your phone:</p>
                <ol className="list-decimal list-inside text-sm mt-2">
                    <li>Go to your phone's <strong>Settings</strong>.</li>
                    <li>Search for and tap <strong>"Text-to-speech"</strong>.</li>
                    <li>Tap your engine (e.g., "Speech Services by Google"), then tap the settings icon ⚙️.</li>
                    <li>Tap <strong>"Install voice data"</strong>.</li>
                    <li>Find and install <strong>Chinese</strong>.</li>
                    <li>Restart this app.</li>
                </ol>
            </div>
        )}
        
        <button
          onClick={handleStartLearning}
          disabled={ttsStatus === 'checking'}
          className="px-8 py-4 bg-yellow-400 text-yellow-800 font-bold rounded-full shadow-lg hover:bg-yellow-500 transform hover:scale-105 transition-transform duration-300 text-2xl disabled:bg-gray-300 disabled:cursor-wait"
        >
          {ttsStatus === 'checking' ? 'Checking Audio...' : "Let's Go!"}
        </button>
      </div>
    );
  };

  const renderContent = () => {
    switch (gameState) {
      case GameState.Welcome:
        return renderWelcomeScreen();
      case GameState.Learning:
        return (
          <LearningView
            words={WORDS}
            onWordLearned={handleWordLearned}
            onFinishLearning={handleStartQuiz}
            currentWordIndex={currentWordIndex}
            setCurrentWordIndex={setCurrentWordIndex}
          />
        );
      case GameState.Quiz:
        return <QuizView words={WORDS} onQuizFinished={handleQuizFinished} />;
      case GameState.Finished:
         return (
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-green-500 mb-4">You did it!</h1>
             <p className="text-lg md:text-xl text-gray-600 mb-8">You are a superstar!</p>
            <div className="text-8xl mb-8">🎉🌟💖</div>
            <button
              onClick={handlePlayAgain}
              className="px-8 py-4 bg-pink-400 text-white font-bold rounded-full shadow-lg hover:bg-pink-500 transform hover:scale-105 transition-transform duration-300 text-2xl"
            >
              Play Again
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 font-sans antialiased bg-gradient-to-br from-pink-100 to-yellow-100">
      <div className="w-full max-w-2xl mx-auto">
        {(gameState === GameState.Learning || gameState === GameState.Quiz) && (
           <ProgressBar totalItems={WORDS.length} completedItems={progress.filter(Boolean).length} />
        )}
        <main className="mt-8 flex items-center justify-center">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;