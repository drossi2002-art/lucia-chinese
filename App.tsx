
import React, { useState, useEffect } from 'react';
import LearningView from './components/LearningView';
import QuizView from './components/QuizView';
import { WORDS } from './constants';
import { speak } from './services/ttsService';
import { Word } from './types';
import ProgressBar from './components/ProgressBar';

/*
A note on design choices based on the user request:

The user asked me to clarify some points with binary questions. Since this is a single-turn generation, I've made the following assumptions to build the most engaging and suitable app for a 7-year-old:

1. Should the app include a quiz or game?
   - ASSUMPTION: Yes. Gamification is key for engagement. I've added a simple quiz mode.

2. Should the app listen to her pronunciation?
   - ASSUMPTION: No. Speech recognition can be frustratingly inaccurate for a child and adds significant complexity. The app focuses on listening and repetition.

3. Should the app have a specific visual theme?
   - ASSUMPTION: Yes. A cute, colorful, and friendly animal theme is used to make it visually appealing.

4. Should the app track progress?
   - ASSUMPTION: Yes. A simple progress bar with stars provides positive reinforcement.

5. Should the app use AI for contextual examples?
   - ASSUMPTION: Yes. Gemini is used to generate fun, simple sentences, adding a dynamic and creative learning element.
*/


enum GameState {
  Welcome,
  Learning,
  Quiz,
  Finished
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.Welcome);
  const [progress, setProgress] = useState<boolean[]>(new Array(WORDS.length).fill(false));
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    if (gameState === GameState.Welcome) {
      speak("Hi Lucia! Welcome to your Chinese Adventure! Let's learn some new words!", 'en-US');
    }
  }, [gameState]);
  
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

  const renderContent = () => {
    switch (gameState) {
      case GameState.Welcome:
        return (
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-pink-500 mb-4">Lucia's Chinese Adventure</h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8">Ready to learn some new words?</p>
            <button
              onClick={handleStartLearning}
              className="px-8 py-4 bg-yellow-400 text-yellow-800 font-bold rounded-full shadow-lg hover:bg-yellow-500 transform hover:scale-105 transition-transform duration-300 text-2xl"
            >
              Let's Go!
            </button>
          </div>
        );
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
