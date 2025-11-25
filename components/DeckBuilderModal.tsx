
import React, { useState, useEffect } from 'react';
import { WordPair, CustomDeck } from '../types';

interface DeckBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, pairs: WordPair[], id?: string) => void;
  editingDeck?: CustomDeck | null; // Optional deck to edit
}

const DeckBuilderModal: React.FC<DeckBuilderModalProps> = ({ isOpen, onClose, onSave, editingDeck }) => {
  const [deckName, setDeckName] = useState('');
  // Initialize with 4 empty pairs
  const [pairs, setPairs] = useState<WordPair[]>([
    { en: '', cn: '' },
    { en: '', cn: '' },
    { en: '', cn: '' },
    { en: '', cn: '' },
  ]);
  const [error, setError] = useState('');

  // Populate form when editingDeck changes
  useEffect(() => {
    if (editingDeck) {
      setDeckName(editingDeck.name);
      // Ensure we have at least 4 rows for better UX, or just use existing
      if (editingDeck.pairs.length > 0) {
        setPairs([...editingDeck.pairs]);
      }
    } else {
      // Reset if not editing (creation mode)
      setDeckName('');
      setPairs([
        { en: '', cn: '' },
        { en: '', cn: '' },
        { en: '', cn: '' },
        { en: '', cn: '' },
      ]);
    }
  }, [editingDeck, isOpen]);

  if (!isOpen) return null;

  const handlePairChange = (index: number, field: 'en' | 'cn', value: string) => {
    const newPairs = [...pairs];
    newPairs[index] = { ...newPairs[index], [field]: value };
    setPairs(newPairs);
  };

  const addPair = () => {
    setPairs([...pairs, { en: '', cn: '' }]);
  };

  const removePair = (index: number) => {
    if (pairs.length <= 1) return;
    setPairs(pairs.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    setError('');
    if (!deckName.trim()) {
      setError('Please enter a deck name.');
      return;
    }

    // Filter out incomplete pairs
    const validPairs = pairs.filter(p => p.en.trim() && p.cn.trim());

    if (validPairs.length < 2) {
      setError('Please add at least 2 complete word pairs.');
      return;
    }

    // Pass the existing ID if we are editing
    onSave(deckName, validPairs, editingDeck?.id);
    
    // Reset form
    setDeckName('');
    setPairs([
        { en: '', cn: '' },
        { en: '', cn: '' },
        { en: '', cn: '' },
        { en: '', cn: '' },
    ]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-[fadeIn_0.2s_ease-out]">
        
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">
            {editingDeck ? 'Edit Deck' : 'Create Custom Deck'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">Deck Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Chapter 1 Vocabulary"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-slate-700">Word Pairs</label>
              <span className="text-xs text-slate-400">English - Chinese</span>
            </div>
            
            {pairs.map((pair, index) => (
              <div key={index} className="flex gap-2 items-center group">
                <span className="w-6 text-center text-slate-400 text-sm">{index + 1}</span>
                <input 
                  type="text" 
                  placeholder="Apple"
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={pair.en}
                  onChange={(e) => handlePairChange(index, 'en', e.target.value)}
                />
                <input 
                  type="text" 
                  placeholder="苹果"
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={pair.cn}
                  onChange={(e) => handlePairChange(index, 'cn', e.target.value)}
                />
                <button 
                  onClick={() => removePair(index)}
                  className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  tabIndex={-1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 000-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <button 
            onClick={addPair}
            className="mt-4 text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add another pair
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-lg shadow-indigo-200 transition-all"
          >
            {editingDeck ? 'Update Deck' : 'Save Deck'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeckBuilderModal;
