
import React from 'react';

interface ProgressBarProps {
  totalItems: number;
  completedItems: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ totalItems, completedItems }) => {
  return (
    <div className="flex justify-center items-center gap-2 p-2 bg-white/70 backdrop-blur-sm rounded-full shadow-md">
      {Array.from({ length: totalItems }).map((_, index) => (
        <span
          key={index}
          className={`text-3xl md:text-4xl transition-colors duration-500 ${
            index < completedItems ? 'text-yellow-400' : 'text-gray-300'
          }`}
          style={{ transitionDelay: `${index * 50}ms`}}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default ProgressBar;
