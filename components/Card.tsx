
import React from 'react';
import { CardItem } from '../types';

interface CardProps {
  card: CardItem;
  onClick: (card: CardItem) => void;
  disabled: boolean;
  isSelected: boolean;
}

const Card: React.FC<CardProps> = ({ card, onClick, disabled, isSelected }) => {
  const handleClick = () => {
    if (!disabled && !card.isMatched) {
      onClick(card);
    }
  };

  const visibilityClass = card.isMatched 
    ? 'opacity-0 pointer-events-none transform scale-90' 
    : 'opacity-100 scale-100';

  // Dynamic font sizing based on content length
  const getFontSize = () => {
    const len = card.content.length;
    if (card.type === 'en') {
      return len > 12 ? 'text-xs sm:text-sm' : 'text-sm sm:text-lg';
    } else {
      // Chinese
      if (len > 18) return 'text-[9px] sm:text-[10px] leading-tight'; // Extra small for very long text
      if (len > 10) return 'text-[10px] sm:text-xs leading-tight';
      if (len > 6) return 'text-xs sm:text-sm leading-tight';
      return 'text-lg sm:text-2xl';
    }
  };

  return (
    <div 
      className={`relative w-full aspect-square cursor-pointer perspective-1000 group transition-all ${card.isMatched ? 'duration-200' : 'duration-500'} ${visibilityClass} ${isSelected ? 'z-10' : ''}`}
      onClick={handleClick}
    >
      <div
        className={`w-full h-full relative preserve-3d transition-transform duration-500 shadow-sm rounded-xl ${
          card.isFlipped ? 'rotate-y-180' : ''
        } ${isSelected ? 'scale-105' : ''}`}
      >
        {/* Card Back (Success/Matched State) */}
        <div className="absolute inset-0 backface-hidden rounded-xl bg-white flex items-center justify-center border-2 border-slate-100">
           <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* Card Front */}
        <div className={`absolute inset-0 rotate-y-180 backface-hidden rounded-xl bg-white flex flex-col items-center justify-center p-2 text-center shadow-inner transition-colors ${
            isSelected 
              ? 'border-4 border-blue-600' // Blue border for selection
              : 'border-2 border-indigo-100 group-hover:border-indigo-300'
          }`}>
          <div className="flex items-center justify-center w-full h-full overflow-hidden">
            <span className={`font-bold select-none break-words px-1 ${getFontSize()} ${
                card.type === 'en' ? 'text-indigo-900 font-medium' : 'font-sans text-slate-800'
              }`}
            >
              {card.content}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
