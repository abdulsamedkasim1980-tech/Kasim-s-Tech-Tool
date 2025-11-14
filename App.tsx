import React, { useState } from 'react';
import ControlPanel from './components/ControlPanel';
import ResultsDisplay from './components/ResultsDisplay';
import Modal from './components/Modal';
import { fileToBase64, downloadBase64Image, createZipAndDownload } from './utils/fileUtils';
import { generateStoryImage } from './services/geminiService';
import type { Character, PromptItem, AspectRatio, GeneratedImage } from './types';

const App: React.FC = () => {
  const initialCharacters = Array.from({ length: 4 }, (_, i) => ({
    id: i + 1,
    image: null,
    imageBase64: null,
    isSelected: false,
  }));

  const [characters, setCharacters] = useState<Character[]>(initialCharacters);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [prompts, setPrompts] = useState<PromptItem[]>([{ id: crypto.randomUUID(), value: '' }]);
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [previewImage, setPreviewImage] = useState<GeneratedImage | null>(null);
  const [editingImage, setEditingImage] = useState<GeneratedImage | null>(null);
  const [editedPrompt, setEditedPrompt] = useState('');

  const handleCharacterChange = async (id: number, file: File | null) => {
    const newCharacters = [...characters];
    const charIndex = newCharacters.findIndex(c => c.id === id);
    if (charIndex !== -1) {
      newCharacters[charIndex].image = file;
      if (file) {
        newCharacters[charIndex].isSelected = true;
        newCharacters[charIndex].imageBase64 = await fileToBase64(file);
      } else {
        newCharacters[charIndex].isSelected = false;
        newCharacters[charIndex].imageBase64 = null;
      }
      setCharacters(newCharacters);
    }
  };

  const handleCharacterSelect = (id: number, isSelected: boolean) => {
    setCharacters(characters.map(c => (c.id === id ? { ...c, isSelected } : c)));
  };

  const handleAddPrompt = () => {
    if (prompts.length < 10) {
      setPrompts([...prompts, { id: crypto.randomUUID(), value: '' }]);
    }
  };

  const handleRemovePrompt = (id: string) => {
    if (prompts.length > 1) {
      setPrompts(prompts.filter(p => p.id !== id));
    }
  };

  const handlePromptChange = (id: string, value: string) => {
    setPrompts(prompts.map(p => (p.id === id ? { ...p, value } : p)));
  };

  const runGeneration = async (promptsToRun: PromptItem[], selectedCharacters: Character[]) => {
    const generationPromises = promptsToRun.map(prompt => 
        generateStoryImage(prompt.value, selectedCharacters)
            .then(base64 => ({
                id: prompt.id,
                prompt: prompt.value,
                imageBase64: base64,
                charactersUsed: selectedCharacters.map(c => c.id),
                timestamp: new Date(),
                // FIX: Use 'as const' to help TypeScript infer a literal type for 'status',
                // creating a discriminated union that allows for proper type narrowing.
                status: 'fulfilled' as const
            }))
            .catch(err => ({
                id: prompt.id,
                prompt: prompt.value,
                error: err.message,
                status: 'rejected' as const
            }))
    );
    return Promise.all(generationPromises);
  };

  const handleGenerateAll = async () => {
    setError(null);
    setIsLoading(true);
    setResults([]);
    
    const validPrompts = prompts.filter(p => p.value.trim() !== '');
    const selectedCharacters = characters.filter(c => c.isSelected && c.image);

    if (validPrompts.length === 0 || selectedCharacters.length === 0) {
        setError("Please provide at least one prompt and select one character with an uploaded image.");
        setIsLoading(false);
        return;
    }

    const outcomes = await runGeneration(validPrompts, selectedCharacters);
    
    const successfulResults = outcomes
        .filter(o => o.status === 'fulfilled')
        .map(o => o as GeneratedImage);

    const failedResults = outcomes.filter(o => o.status === 'rejected');
    if (failedResults.length > 0) {
        setError(`Failed to generate ${failedResults.length} image(s). Please check your prompts or try again. Error: ${failedResults[0].error}`);
    }

    setResults(successfulResults);
    setIsLoading(false);
  };

  const handleRegenerate = async (image: GeneratedImage) => {
      setError(null);
      setIsLoading(true);
      const charactersForRegen = characters.filter(c => image.charactersUsed.includes(c.id));
      try {
          const newBase64 = await generateStoryImage(image.prompt, charactersForRegen);
          const newImage: GeneratedImage = { ...image, imageBase64: newBase64, timestamp: new Date() };
          setResults(results.map(r => r.id === image.id ? newImage : r));
      } catch (e: any) {
          setError(`Failed to regenerate image: ${e.message}`);
      }
      setIsLoading(false);
  };

  const handleEdit = (image: GeneratedImage) => {
      setEditingImage(image);
      setEditedPrompt(image.prompt);
  };

  const handleEditSubmit = async () => {
    if (!editingImage || !editedPrompt.trim()) return;
    setError(null);
    setIsLoading(true);
    const charactersForEdit = characters.filter(c => editingImage.charactersUsed.includes(c.id));
    try {
        const newBase64 = await generateStoryImage(editedPrompt, charactersForEdit);
        const newImage: GeneratedImage = { ...editingImage, imageBase64: newBase64, prompt: editedPrompt, timestamp: new Date() };
        setResults(results.map(r => r.id === editingImage.id ? newImage : r));
    } catch (e: any) {
        setError(`Failed to regenerate image with new prompt: ${e.message}`);
    }
    setEditingImage(null);
    setIsLoading(false);
  };

  const handleDownload = (image: GeneratedImage, index: number) => {
    const date = image.timestamp;
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const formattedDate = `${day}${month.charAt(0).toUpperCase() + month.slice(1)}${year}`;
    const fileName = `${String(index + 1).padStart(3, '0')}_${formattedDate}.png`;
    downloadBase64Image(image.imageBase64, fileName);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen font-sans">
      {error && (
        <div className="absolute top-4 right-4 bg-red-800 text-white p-4 rounded-lg shadow-lg z-50">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="absolute top-1 right-1 text-red-200 hover:text-white">&times;</button>
        </div>
      )}
      
      <ControlPanel
        characters={characters}
        onCharacterChange={handleCharacterChange}
        onCharacterSelect={handleCharacterSelect}
        aspectRatio={aspectRatio}
        onAspectRatioChange={setAspectRatio}
        prompts={prompts}
        onAddPrompt={handleAddPrompt}
        onRemovePrompt={handleRemovePrompt}
        onPromptChange={handlePromptChange}
        onGenerate={handleGenerateAll}
        isLoading={isLoading}
      />
      <ResultsDisplay
        results={results}
        isLoading={isLoading}
        onDownload={handleDownload}
        onRegenerate={handleRegenerate}
        onEdit={handleEdit}
        onPreview={setPreviewImage}
        onDownloadAll={() => createZipAndDownload(results)}
      />

      <Modal isOpen={!!previewImage} onClose={() => setPreviewImage(null)} title={previewImage?.prompt || 'Image Preview'}>
        {previewImage && <img src={`data:image/png;base64,${previewImage.imageBase64}`} alt={previewImage.prompt} className="w-full h-auto rounded-md" />}
      </Modal>

      <Modal isOpen={!!editingImage} onClose={() => setEditingImage(null)} title="Edit Prompt & Regenerate">
        {editingImage && (
            <div className='space-y-4'>
                <img src={`data:image/png;base64,${editingImage.imageBase64}`} alt={editingImage.prompt} className="w-1/2 mx-auto h-auto rounded-md mb-4"/>
                <textarea
                    value={editedPrompt}
                    onChange={(e) => setEditedPrompt(e.target.value)}
                    className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-2 h-24 focus:ring-red-500 focus:border-red-500"
                />
                <button
                    onClick={handleEditSubmit}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Regenerate with New Prompt
                </button>
            </div>
        )}
      </Modal>

    </div>
  );
};

export default App;
