
import React from 'react';
import type { Character, PromptItem, AspectRatio } from '../types';
import { UploadIcon, PlusIcon, TrashIcon, InfoIcon } from './Icons';

interface ControlPanelProps {
  characters: Character[];
  onCharacterChange: (id: number, file: File | null) => void;
  onCharacterSelect: (id: number, isSelected: boolean) => void;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  prompts: PromptItem[];
  onAddPrompt: () => void;
  onRemovePrompt: (id: string) => void;
  onPromptChange: (id: string, value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const CharacterUploader: React.FC<{
  character: Character;
  onChange: (file: File | null) => void;
  onSelect: (isSelected: boolean) => void;
}> = ({ character, onChange, onSelect }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.files ? e.target.files[0] : null);
  };

  return (
    <div className="flex items-center space-x-3">
      <input
        type="checkbox"
        checked={character.isSelected}
        onChange={(e) => onSelect(e.target.checked)}
        className="form-checkbox h-5 w-5 text-red-600 bg-gray-800 border-gray-600 rounded focus:ring-red-500"
        disabled={!character.image}
      />
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-300 mb-1">Character {character.id}</label>
        <div className="flex items-center space-x-2">
          <label htmlFor={`char-upload-${character.id}`} className="cursor-pointer flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-md px-3 py-2 flex items-center justify-center transition-colors">
            <UploadIcon className="w-4 h-4 mr-2" />
            <span>{character.image ? character.image.name : 'Upload Image'}</span>
          </label>
          <input id={`char-upload-${character.id}`} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          {character.imageBase64 && (
            <div className="w-10 h-10 rounded-md overflow-hidden ring-2 ring-gray-600">
              <img src={`data:image/jpeg;base64,${character.imageBase64}`} className="w-full h-full object-cover" alt={`Character ${character.id} preview`} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ControlPanel: React.FC<ControlPanelProps> = (props) => {
  const { characters, onCharacterChange, onCharacterSelect, aspectRatio, onAspectRatioChange, prompts, onAddPrompt, onRemovePrompt, onPromptChange, onGenerate, isLoading } = props;
  const canGenerate = prompts.some(p => p.value.trim() !== '') && characters.some(c => c.isSelected && c.image) && !isLoading;

  return (
    <div className="w-full md:w-1/3 lg:w-1/4 bg-gray-800 p-6 flex flex-col h-full overflow-y-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Kasim’s Tech Tool</h1>
      <p className="text-sm text-gray-400 mb-6">Consistent AI Character Story Creator</p>

      <div className="space-y-6 flex-1">
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">1. Character Reference Images</h2>
          <div className="space-y-4">
            {characters.map(char => (
              <CharacterUploader
                key={char.id}
                character={char}
                onChange={(file) => onCharacterChange(char.id, file)}
                onSelect={(isSelected) => onCharacterSelect(char.id, isSelected)}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-3">2. Aspect Ratio</h2>
           <div className="relative">
             <select
               value={aspectRatio}
               onChange={(e) => onAspectRatioChange(e.target.value as AspectRatio)}
               className="w-full bg-gray-700 border-gray-600 text-white rounded-md px-3 py-2 focus:ring-red-500 focus:border-red-500 appearance-none"
             >
               <option>1:1</option>
               <option>16:9</option>
               <option>9:16</option>
               <option>4:3</option>
             </select>
             <div className="group flex items-center absolute top-2 right-10">
                 <InfoIcon className="w-5 h-5 text-gray-400" />
                 <span className="absolute left-full ml-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                     Aspect ratio is not supported by this model and will be ignored. Images will be generated in 1:1 format.
                 </span>
             </div>
           </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-3">3. Prompt List (up to 10)</h2>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {prompts.map((prompt, index) => (
              <div key={prompt.id} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder={`Prompt ${index + 1}`}
                  value={prompt.value}
                  onChange={(e) => onPromptChange(prompt.id, e.target.value)}
                  className="flex-1 bg-gray-700 border-gray-600 text-white rounded-md px-3 py-2 focus:ring-red-500 focus:border-red-500"
                />
                <button
                  onClick={() => onRemovePrompt(prompt.id)}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                  disabled={prompts.length <= 1}
                >
                  <TrashIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            ))}
          </div>
          {prompts.length < 10 && (
            <button
              onClick={onAddPrompt}
              className="mt-2 w-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-md px-3 py-2 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-1" />
              Add Prompt
            </button>
          )}
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={onGenerate}
          disabled={!canGenerate}
          className="w-full text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            'Generate All Images'
          )}
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
