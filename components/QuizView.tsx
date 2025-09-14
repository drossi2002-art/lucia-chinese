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
    speak(`Tap the picture for: ${words[currentQuestionIndex].chinese}`, 'zh-CN');
  }, [currentQuestionIndex, generateOptions, words]);
  
  const handleAnswer = (selectedWord: Word) => {
    if (answered) return;

    setAnswered(true);
    if (selectedWord.chinese === words[currentQuestionIndex].chinese) {
      setFeedback('correct');
      speak('Correct! Awesome!', 'en-US');
    } else {
      setFeedback('incorrect');
      speak('Oops, try again!', 'en-US');
    }

    setTimeout(() => {
      if (selectedWord.chinese === words[currentQuestionIndex].chinese) {
        if (currentQuestionIndex < words.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
          onQuizFinished();
        }
      }
      setFeedback(null);
      setAnswered(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-700 mb-2">Quiz Time!</h2>
      <p className="text-lg text-gray-500 mb-6">Listen and tap the right picture!</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {options.map((word) => {
          const { Icon } = word;
          const isCorrect = word.chinese === words[currentQuestionIndex].chinese;
          
          let cardClass = 'bg-white rounded-2xl shadow-lg p-4 cursor-pointer transform transition-all duration-300 hover:scale-105';
          if (feedback && answered) {
              if (isCorrect) {
                  cardClass += ' scale-110 border-4 border-green-400';
              } else if (feedback === 'incorrect') {
                  cardClass += ' opacity-50';
              }
          }

          return (
            <div key={word.chinese} onClick={() => handleAnswer(word)} className={cardClass}>
              <div className="bg-pink-100 rounded-lg p-2 aspect-square flex items-center justify-center">
                <Icon className="w-full h-full" />
              </div>
              <p className="text-center mt-2 font-semibold text-gray-600">{word.english}</p>
            </div>
          );
        })}
      </div>
      
       {feedback === 'correct' && <div className="mt-6 text-3xl font-bold text-green-500">Correct! 🌟</div>}
       {feedback === 'incorrect' && <div className="mt-6 text-3xl font-bold text-red-500">Not quite, try again!</div>}
    </div>
  );
};

export default QuizView;