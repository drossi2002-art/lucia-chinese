import React, { useEffect } from 'react';
import { Word } from '../types';
import { speakSequence } from '../services/ttsService';
import SpeakerButton from './SpeakerButton';
import { ArrowLeft, ArrowRight, Check } from './Icons';

interface LearningViewProps {
  words: Word[];
  onWordLearned: (index: number) => void;
  onFinishLearning: () => void;
  currentWordIndex: number;
  setCurrentWordIndex: (index: number) => void;
}

const LearningView: React.FC<LearningViewProps> = ({ words, onWordLearned, onFinishLearning, currentWordIndex, setCurrentWordIndex }) => {
  const currentWord = words[currentWordIndex];
  const { Icon } = currentWord;

  useEffect(() => {
    // Automatically speak the English and Chinese words when the card appears
    void speakSequence([
      { text: currentWord.english, lang: 'en-US' },
      { text: currentWord.chinese, lang: 'zh-CN' },
    ]);
  }, [currentWord]);

  const handleNext = () => {
    onWordLearned(currentWordIndex);
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      onFinishLearning();
    }
  };

  const handlePrev = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
    }
  };
  
  const playWordAudioSequence = () => {
     void speakSequence([
      { text: currentWord.english, lang: 'en-US' },
      { text: currentWord.chinese, lang: 'zh-CN' },
    ]);
  }

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 w-full text-center transform transition-all duration-500">
        <div className="bg-yellow-100 rounded-2xl p-4 mb-4 flex justify-center items-center h-40">
          <Icon className="w-32 h-32" />
        </div>
        <p className="text-gray-500 text-xl md:text-2xl font-semibold">{currentWord.english}</p>
        <h2 className="text-4xl md:text-5xl font-bold text-pink-500 my-2">{currentWord.chinese}</h2>
        <p className="text-gray-400 text-lg md:text-xl">{currentWord.pinyin}</p>
        <SpeakerButton onClick={playWordAudioSequence} />
      </div>

      <div className="flex justify-between w-full mt-8">
        <button
          onClick={handlePrev}
          disabled={currentWordIndex === 0}
          className="p-4 bg-white rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-110 transition-transform"
          aria-label="Previous word"
        >
          <ArrowLeft className="w-8 h-8 text-gray-600" />
        </button>
        {currentWordIndex === words.length - 1 ? (
          <button onClick={handleNext} className="px-8 py-4 bg-green-500 text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-transform text-xl flex items-center gap-2">
            Quiz Time! <Check className="w-6 h-6" />
          </button>
        ) : (
          <button onClick={handleNext} className="p-4 bg-white rounded-full shadow-lg transform hover:scale-110 transition-transform" aria-label="Next word">
            <ArrowRight className="w-8 h-8 text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
};

export default LearningView;