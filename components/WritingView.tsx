import React, { useState, useRef, useEffect } from 'react';
import { Word } from '../types';
import Canvas, { CanvasRef } from './Canvas';
import { checkWriting } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { Trash, ArrowLeft, Check, Sun, Undo } from './Icons';
import { speak, speakSequence } from '../services/ttsService';

interface WritingViewProps {
  word: Word;
  onBack: () => void;
}

const WritingView: React.FC<WritingViewProps> = ({ word, onBack }) => {
  const canvasRef = useRef<CanvasRef>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [rating, setRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCanvasEmpty, setIsCanvasEmpty] = useState(true);

  // Reset state when the character changes
  useEffect(() => {
    handleClear();
    speakSequence([
      { text: "Try writing", lang: 'en-US'},
      { text: word.chinese, lang: 'zh-CN' }
    ]);
  }, [word]);

  const handleClear = () => {
    canvasRef.current?.clear();
    setFeedback('');
    setRating(null);
  };
  
  const handleUndo = () => {
    canvasRef.current?.undo();
  };

  const handleCheck = async () => {
    const imageDataUrl = canvasRef.current?.getImageDataUrl();
    if (!imageDataUrl) return;

    setIsLoading(true);
    setFeedback('');
    setRating(null);
    try {
      const { rating, feedback } = await checkWriting(imageDataUrl, word);
      setRating(rating);
      setFeedback(feedback);
      speak(feedback, 'en-US');
    } catch (error) {
      console.error('Failed to get feedback:', error);
      const errorMessage = 'Sorry, I had trouble checking your writing. Please try again.';
      setRating(0);
      setFeedback(errorMessage);
      speak(errorMessage, 'en-US');
    }
    setIsLoading(false);
  };

  const handlePointerDown = () => {
    if(feedback || rating !== null) {
        setFeedback('');
        setRating(null);
    }
  };
  
  const handleDrawingChange = (isEmpty: boolean) => {
    setIsCanvasEmpty(isEmpty);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto">
      <div className="w-full flex justify-between items-center mb-4 px-2">
        <button onClick={onBack} className="p-3 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h2 className="text-xl md:text-2xl font-bold text-gray-700 text-center">
          Try writing: <span className="text-pink-500">{word.chinese}</span>
        </h2>
        <div className="w-12"></div> {/* Spacer */}
      </div>

      <div 
        className="w-full aspect-square bg-white rounded-2xl shadow-lg overflow-hidden relative"
        onPointerDown={handlePointerDown}
      >
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none">
            <div className="border-r border-b border-dashed border-gray-200"></div>
            <div className="border-b border-l border-dashed border-gray-200"></div>
            <div className="border-t border-r border-dashed border-gray-200"></div>
            <div className="border-l border-t border-dashed border-gray-200"></div>
        </div>
        <Canvas 
            ref={canvasRef} 
            characterToTrace={word.chinese} 
            onDrawingChange={handleDrawingChange}
        />
      </div>

      <div className="flex justify-center items-center w-full mt-6 space-x-4">
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
          onClick={handleCheck}
          disabled={isLoading || isCanvasEmpty}
          className="px-8 py-4 bg-green-500 text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-transform text-xl flex items-center gap-2 disabled:bg-green-300 disabled:cursor-not-allowed"
          aria-label="Check writing"
        >
          {isLoading ? <LoadingSpinner /> : <>Check <Check className="w-6 h-6" /></>}
        </button>
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

export default WritingView;