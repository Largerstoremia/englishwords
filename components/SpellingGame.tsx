
import React, { useState, useEffect, useRef } from 'react';
import { WordPair } from '../types';

interface SpellingGameProps {
  words: WordPair[];
  onComplete: () => void;
  onUpdateScore: (score: number) => void;
}

interface LetterState {
  char: string;
  isHidden: boolean;
  userInput: string;
}

const SpellingGame: React.FC<SpellingGameProps> = ({ words, onComplete, onUpdateScore }) => {
  // Game State
  const [queue, setQueue] = useState<WordPair[]>([]);
  const [mistakenWords, setMistakenWords] = useState<WordPair[]>([]);
  
  // Current Round State
  const [letters, setLetters] = useState<LetterState[]>([]);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [hasErrorOnCurrent, setHasErrorOnCurrent] = useState(false); // Track if current word was already missed once
  const [isFinished, setIsFinished] = useState(false);

  // Stats for progress bar (Initial length needed to calculate percentage since queue grows)
  const [initialCount, setInitialCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize Queue on Mount or when words prop changes
  useEffect(() => {
    setQueue([...words]);
    setInitialCount(words.length);
    setCompletedCount(0);
    setMistakenWords([]);
    setIsFinished(false);
    setHasErrorOnCurrent(false);
  }, [words]);

  const currentWord = queue.length > 0 ? queue[0] : null;

  // Initialize Letters for the current word
  useEffect(() => {
    if (!currentWord) {
        // Only trigger finish if we actually had words to begin with (initialCount > 0)
        // This prevents the game from finishing immediately on mount before state is synced
        if (initialCount > 0 && completedCount >= initialCount && queue.length === 0) {
            setIsFinished(true);
        }
        return;
    }

    const chars = currentWord.en.split('');
    const newLetters: LetterState[] = chars.map((char) => {
      // Always show non-alphabetic characters (spaces, punctuation)
      const isAlpha = /[a-zA-Z]/.test(char);
      // Randomly hide ~50% of letters, ensuring non-alpha are shown
      const isHidden = isAlpha && Math.random() > 0.4; 
      return {
        char,
        isHidden,
        userInput: ''
      };
    });

    // Ensure at least one letter is hidden if the word has letters
    const alphaIndices = newLetters.map((l, i) => l.isHidden ? i : -1).filter(i => i !== -1);
    if (alphaIndices.length === 0 && /[a-zA-Z]/.test(currentWord.en)) {
       // Force hide the last alpha char if none were hidden randomly
       for (let i = newLetters.length - 1; i >= 0; i--) {
         if (/[a-zA-Z]/.test(newLetters[i].char)) {
           newLetters[i].isHidden = true;
           break;
         }
       }
    }

    setLetters(newLetters);
    setFeedback('idle');
    setHasErrorOnCurrent(false);
    
    // Focus first input after a slight delay to allow render
    setTimeout(() => {
        const firstInput = inputRefs.current.find(ref => ref !== null);
        firstInput?.focus();
    }, 100);

  }, [currentWord, completedCount, initialCount, queue.length]);

  const handleInputChange = (index: number, val: string) => {
    // Only accept 1 char
    const char = val.slice(-1);
    
    // Reset feedback to idle if user starts typing again after an error
    if (feedback === 'wrong') {
        setFeedback('idle');
    }

    const newLetters = [...letters];
    newLetters[index].userInput = char;
    setLetters(newLetters);

    // Auto-advance focus
    if (char) {
      let nextInputIndex = -1;
      for (let i = index + 1; i < letters.length; i++) {
        if (letters[i].isHidden) {
          nextInputIndex = i;
          break;
        }
      }
      if (nextInputIndex !== -1) {
        inputRefs.current[nextInputIndex]?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !letters[index].userInput) {
      // Move back to previous input
      let prevInputIndex = -1;
      for (let i = index - 1; i >= 0; i--) {
        if (letters[i].isHidden) {
          prevInputIndex = i;
          break;
        }
      }
      if (prevInputIndex !== -1) {
        inputRefs.current[prevInputIndex]?.focus();
      }
    } else if (e.key === 'Enter') {
      checkAnswer();
    }
  };

  const checkAnswer = () => {
    if (feedback === 'correct' || !currentWord) return;

    const userWord = letters.map(l => l.isHidden ? l.userInput : l.char).join('');
    const targetWord = currentWord.en;

    if (userWord.toLowerCase() === targetWord.toLowerCase()) {
      // --- CORRECT ---
      setFeedback('correct');
      onUpdateScore(completedCount + 1);
      
      setTimeout(() => {
        setCompletedCount(prev => prev + 1);
        setQueue(prev => prev.slice(1)); // Remove current word from head
      }, 1000);

    } else {
      // --- WRONG ---
      setFeedback('wrong');
      
      // If this is the first time missing this specific instance of the word,
      // add it to mistakes and re-queue it.
      if (!hasErrorOnCurrent) {
          setHasErrorOnCurrent(true);
          
          // Track unique mistakes (avoid duplicates if same word exists multiple times in source)
          setMistakenWords(prev => {
              const alreadyExists = prev.some(w => w.en === currentWord.en);
              return alreadyExists ? prev : [...prev, currentWord];
          });

          // Add to end of queue so user sees it again later
          setQueue(prev => [...prev, currentWord]);
      }
      
      // UX: Focus the first empty input again? Or first incorrect?
      // For now, let user edit their existing inputs.
    }
  };

  // --- Summary View (End of Game) ---
  if (isFinished) {
    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[400px] animate-[fadeIn_0.5s_ease-out]">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full border border-slate-100 flex flex-col items-center text-center">
                <h2 className="text-3xl font-bold text-slate-800 mb-4">Spelling Complete! ✍️</h2>
                
                {mistakenWords.length === 0 ? (
                    <div className="mb-8">
                        <div className="text-6xl mb-4">🏆</div>
                        <p className="text-xl text-green-600 font-medium">Perfect! You didn't make a single mistake.</p>
                    </div>
                ) : (
                    <div className="w-full mb-8">
                        <p className="text-slate-600 mb-4">You mastered these words after some practice:</p>
                        <div className="bg-red-50 rounded-xl p-4 max-h-60 overflow-y-auto border border-red-100">
                            <ul className="divide-y divide-red-100">
                                {mistakenWords.map((w, i) => (
                                    <li key={i} className="py-2 flex justify-between items-center text-sm sm:text-base">
                                        <span className="font-bold text-slate-700">{w.en}</span>
                                        <span className="text-slate-500">{w.cn}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-200"
                >
                    Finish Game
                </button>
            </div>
        </div>
    );
  }

  if (!currentWord) return null;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[400px]">
      {/* Card Container */}
      <div className={`bg-white rounded-2xl shadow-xl p-8 w-full border border-slate-100 flex flex-col items-center text-center transition-all duration-300 ${feedback === 'wrong' ? 'animate-[shake_0.5s_ease-in-out] border-red-300' : ''}`}>
        
        {/* Progress */}
        <div className="w-full bg-slate-100 h-2 rounded-full mb-8 overflow-hidden">
           {/* Calculate progress based on how many unique "Successes" vs total needed. 
               Since queue grows, we stick to initial count vs completed count. 
               Completed count goes up only when a word is removed from queue. */}
           <div 
             className="bg-indigo-500 h-full transition-all duration-500"
             style={{ width: `${Math.min(100, (completedCount / initialCount) * 100)}%` }}
           ></div>
        </div>

        {/* Chinese Definition */}
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-12">
          {currentWord.cn}
        </h2>

        {/* Word Inputs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {letters.map((letter, idx) => {
            if (!letter.isHidden) {
              return (
                <span key={idx} className="w-10 h-14 flex items-center justify-center text-2xl font-mono font-bold text-slate-500 bg-slate-50 rounded-lg border border-transparent">
                  {letter.char}
                </span>
              );
            }

            return (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                type="text"
                value={letter.userInput}
                onChange={(e) => handleInputChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                disabled={feedback === 'correct'}
                className={`w-10 h-14 text-center text-2xl font-mono font-bold border-2 rounded-lg focus:outline-none focus:ring-4 transition-all
                  ${feedback === 'idle' ? 'border-indigo-200 focus:border-indigo-500 focus:ring-indigo-100 text-slate-800' : ''}
                  ${feedback === 'correct' ? 'border-green-500 bg-green-50 text-green-700' : ''}
                  ${feedback === 'wrong' ? 'border-red-500 bg-red-50 text-red-700' : ''}
                `}
              />
            );
          })}
        </div>

        {/* Feedback / Correct Answer */}
        <div className="h-8 mb-6">
            {feedback === 'wrong' && (
                <p className="text-red-500 font-bold text-lg">
                    Incorrect. Try again!
                </p>
            )}
            {feedback === 'correct' && (
                 <p className="text-green-500 font-bold text-lg animate-pulse">
                    Correct!
                </p>
            )}
        </div>

        {/* Action Button */}
        <button
          onClick={checkAnswer}
          disabled={feedback === 'correct'}
          className={`px-8 py-3 rounded-xl font-bold text-white transition-all transform active:scale-95 shadow-lg
             ${feedback === 'correct'
                ? 'bg-green-500 hover:bg-green-600' 
                : feedback === 'wrong'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200'
             }
          `}
        >
          {feedback === 'correct' ? 'Next...' : feedback === 'wrong' ? 'Retry' : 'Check Answer'}
        </button>

      </div>
       <p className="mt-8 text-slate-400 text-sm">Type the missing letters and press Enter</p>
    </div>
  );
};

export default SpellingGame;
