import React, { useState } from 'react';
import { Icon } from '../icons/Icon';

const XIcon = () => <Icon className="h-4 w-4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></Icon>;

interface MutedWordsInputProps {
  mutedWords: string[];
  onAddWord: (word: string) => void;
  onRemoveWord: (word: string) => void;
}

const MutedWordsInput: React.FC<MutedWordsInputProps> = ({ mutedWords, onAddWord, onRemoveWord }) => {
  const [newWord, setNewWord] = useState('');

  const handleAdd = () => {
    if (newWord.trim() && !mutedWords.includes(newWord.trim().toLowerCase())) {
      onAddWord(newWord.trim().toLowerCase());
      setNewWord('');
    }
  };

  return (
    <div>
      <p className="font-medium text-gray-800 dark:text-gray-200">Palavras Silenciadas</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Posts contendo estas palavras não aparecerão no seu feed.</p>
      <div className="flex items-center space-x-2 mb-3">
        <input
          type="text"
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Adicionar nova palavra..."
          className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          onClick={handleAdd}
          className="bg-primary hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
        >
          Adicionar
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {mutedWords.map((word) => (
          <div key={word} className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1 text-sm">
            <span>{word}</span>
            <button onClick={() => onRemoveWord(word)} className="ml-2 text-gray-600 dark:text-gray-300 hover:text-red-500">
              <XIcon />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MutedWordsInput;