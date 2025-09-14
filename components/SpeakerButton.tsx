
import React from 'react';
import { Speaker } from './Icons';

interface SpeakerButtonProps {
  onClick: () => void;
}

const SpeakerButton: React.FC<SpeakerButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="mt-4 mx-auto w-16 h-16 flex items-center justify-center bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 transform hover:scale-110 transition-transform duration-300"
      aria-label="Listen"
    >
      <Speaker className="w-8 h-8"/>
    </button>
  );
};

export default SpeakerButton;
