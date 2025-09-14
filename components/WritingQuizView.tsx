import React, { useState, useRef, useEffect } from 'react';
import { Word } from '../types';
import Canvas, { CanvasRef } from './Canvas';
import { checkWriting } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { Trash, Check, Sun, Undo, ArrowRight } from './Icons';
import { speak } from '../services/ttsService';

interface WritingQuizViewProps {
  words: Word[];
  onQuizFinished: () => void;
}

const WritingQuizView: React.FC<WritingQuizViewProps> = ({ words, onQuizFinished }) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const currentWord = words[questionIndex];

  const canvasRef = useRef<CanvasRef>(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCanvasEmpty, setIsCanvasEmpty] = useState(true);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);

  useEffect(() => {
    speak(`Please write: ${currentWord.english}`, 'en-US');
  }, [currentWord]);

  const handleClear = () => {
    canvasRef.current?.clear();
    setFeedback('');
    setRating(null);
    setIsAnswerCorrect(false);
  };

  const handleUndo = () => {
    canvasRef.current?.undo();
  };

  const handleSubmit = async () => {
    const imageDataUrl = canvasRef.current?.getImageDataUrl();
    if (!imageDataUrl) return;

    setIsLoading(true);
    setFeedback('');
    setRating(null);
    setIsAnswerCorrect(false);

    try {
      const { rating, feedback } = await checkWriting(imageDataUrl, currentWord);
      setRating(rating);
      setFeedback(feedback);
      speak(feedback, 'en-US');

      if (rating >= 2) {
        setIsAnswerCorrect(true);
      }
    } catch (error) {
      console.error('Failed to get feedback:', error);
      const errorMessage = 'Sorry, the teacher is busy. Please try again.';
      setRating(0);
      setFeedback(errorMessage);
      speak(errorMessage, 'en-US');
    }
    setIsLoading(false);
  };

  const handleNext = () => {
    if (questionIndex < words.length - 1) {
      setQuestionIndex(questionIndex + 1);
      handleClear();
    } else {
      onQuizFinished();
    }
  };
  
  const handleDrawingChange = (isEmpty: boolean) => {
    setIsCanvasEmpty(isEmpty);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-700 mb-2">Writing Quiz!</h2>
      <p className="text-lg text-gray-500 mb-6">
        Write the characters for: <span className="font-bold text-pink-500">{currentWord.english}</span>
      </p>

      <div className="w-full aspect-square bg-white rounded-2xl shadow-lg overflow-hidden relative">
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none">
          <div className="border-r border-b border-dashed border-gray-200"></div>
          <div className="border-b border-l border-dashed border-gray-200"></div>
          <div className="border-t border-r border-dashed border-gray-200"></div>
          <div className="border-l border-t border-dashed border-gray-200"></div>
        </div>
        <Canvas 
          ref={canvasRef} 
          characterToTrace={""} // No tracing in the quiz
          onDrawingChange={handleDrawingChange}
        />
      </div>

      <div className="flex justify-center items-center w-full mt-6 space-x-4">
        {isAnswerCorrect ? (
          <button
            onClick={handleNext}
            className="px-8 py-4 bg-blue-500 text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-transform text-xl flex items-center gap-2"
          >
            Next <ArrowRight className="w-6 h-6" />
          </button>
        ) : (
          <>
            <button
              onClick={handleClear}
              disabled={isLoading || isCanvasEmpty}
              className="p-4 bg-white rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-110 transition-transform"
              aria-label="Clear drawing"
            >
              <Trash className="w-8 h-8 text-red-500" />
            </button>
            <button
              onClick={handleUndo}
              disabled={isLoading || isCanvasEmpty}
              className="p-4 bg-white rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-110 transition-transform"
              aria-label="Undo last stroke"
            >
              <Undo className="w-8 h-8 text-gray-600" />
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || isCanvasEmpty}
              className="px-8 py-4 bg-green-500 text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-transform text-xl flex items-center gap-2 disabled:bg-green-300 disabled:cursor-not-allowed"
              aria-label="Check writing"
            >
              {isLoading ? <LoadingSpinner /> : <>Check <Check className="w-6 h-6" /></>}
            </button>
          </>
        )}
      </div>

      {!isLoading && (rating !== null || feedback) && (
        <div className="mt-6 w-full">
          {rating !== null && (
            <div className="mb-2 flex justify-center space-x-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <Sun
                  key={index}
                  className={`w-10 h-10 transition-all duration-300 ${
                    index < rating ? 'text-yellow-400 scale-110' : 'text-gray-300'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms`}}
                />
              ))}
            </div>
          )}
          {feedback && (
            <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded-lg w-full text-center">
              <p>{feedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WritingQuizView;