import React from 'react';
import { WordPair } from '../types';

interface ResultModalProps {
  isOpen: boolean;
  moves: number;
  time: number;
  onClose: () => void;
  words: WordPair[];
}

const ResultModal: React.FC<ResultModalProps> = ({ isOpen, moves, time, onClose, words }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[fadeIn_0.3s_ease-out]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-center text-white">
          <h2 className="text-3xl font-bold mb-2">Well Done! 🎉</h2>
          <p className="text-indigo-100">You matched all pairs.</p>
        </div>

        {/* Stats Body */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
              <span className="block text-xs text-slate-400 uppercase tracking-wider mb-1">Time</span>
              <span className="text-2xl font-bold text-slate-800">{time}s</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
              <span className="block text-xs text-slate-400 uppercase tracking-wider mb-1">Moves</span>
              <span className="text-2xl font-bold text-slate-800">{moves}</span>
            </div>
          </div>

          <div className="mb-6">
             <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Vocabulary Review</h3>
             <div className="bg-slate-50 rounded-lg border border-slate-200 max-h-48 overflow-y-auto divide-y divide-slate-100">
                {words.map((w, idx) => (
                  <div key={idx} className="flex justify-between px-4 py-2 text-sm">
                    <span className="font-medium text-slate-700">{w.en}</span>
                    <span className="text-slate-500">{w.cn}</span>
                  </div>
                ))}
             </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-200"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
