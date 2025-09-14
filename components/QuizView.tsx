import React, { useState, useEffect, useCallback } from 'react';
import { Word } from '../types';
import { speak } from '../services/ttsService';

interface QuizViewProps {
  words: Word[];
  onQuizFinished: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ words, onQuizFinished }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [options, setOptions] = useState<Word[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [answered, setAnswered] = useState(false);
  const [revealIconFor, setRevealIconFor] = useState<string | null>(null);

  const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  const generateOptions = useCallback(() => {
    const correctAnswer = words[currentQuestionIndex];
    const wrongAnswers = words.filter((_, index) => index !== currentQuestionIndex);
    const shuffledWrong = shuffleArray(wrongAnswers).slice(0, 2);
    const newOptions = shuffleArray([correctAnswer, ...shuffledWrong]);
    setOptions(newOptions);
  }, [currentQuestionIndex, words]);

  useEffect(() => {
    generateOptions();
    // Ask the user to find the correct character for the spoken word
    speak(`Tap the card for: ${words[currentQuestionIndex].chinese}`, 'zh-CN');
  }, [currentQuestionIndex, generateOptions, words]);
  
  const handleAnswer = (selectedWord: Word) => {
    if (answered) return;

    setAnswered(true);
    const isCorrectAnswer = selectedWord.chinese === words[currentQuestionIndex].chinese;

    if (isCorrectAnswer) {
      setFeedback('correct');
      speak('Correct! Awesome!', 'en-US');
    } else {
      setFeedback('incorrect');
      // Reveal the icon for the correct answer as a hint
      setRevealIconFor(words[currentQuestionIndex].chinese);
      speak('Oops, not quite. This is the right one.', 'en-US');
    }

    setTimeout(() => {
      if (isCorrectAnswer) {
        if (currentQuestionIndex < words.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
          onQuizFinished();
        }
      }
      // Reset for the next question or retry
      setFeedback(null);
      setAnswered(false);
      setRevealIconFor(null);

      // If the answer was incorrect, regenerate options to allow another try on the same question
      if (!isCorrectAnswer) {
        generateOptions();
      }

    }, 3000); // Increased delay to allow user to see the hint
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-700 mb-2">Quiz Time!</h2>
      <p className="text-lg text-gray-500 mb-6">Listen and tap the right characters!</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {options.map((word) => {
          const { Icon } = word;
          const isCorrectOption = word.chinese === words[currentQuestionIndex].chinese;
          
          let cardClass = 'bg-white rounded-2xl shadow-lg p-4 cursor-pointer transform transition-all duration-300 hover:scale-105';
          if (feedback && answered) {
              if (isCorrectOption) {
                  cardClass += ' scale-110 border-4 border-green-400';
              } else if (feedback === 'incorrect') {
                  // Only fade the card that was incorrectly tapped
                  if (word.chinese === options.find(o => o.chinese === word.chinese)?.chinese) {
                     cardClass += ' opacity-50';
                  }
              }
          }

          return (
            <div key={word.chinese} onClick={() => handleAnswer(word)} className={cardClass}>
              <div className="bg-pink-100 rounded-lg p-2 aspect-square flex items-center justify-center">
                {revealIconFor === word.chinese ? (
                    <Icon className="w-full h-full" />
                ) : (
                    <span className="text-4xl md:text-5xl font-bold text-pink-500 select-none">{word.chinese}</span>
                )}
              </div>
              <p className="text-center mt-2 font-semibold text-gray-600">{word.english}</p>
            </div>
          );
        })}
      </div>
      
       {feedback === 'correct' && <div className="mt-6 text-3xl font-bold text-green-500">Correct! 🌟</div>}
       {feedback === 'incorrect' && <div className="mt-6 text-3xl font-bold text-red-500">Not quite, have another look!</div>}
    </div>
  );
};

export default QuizView;