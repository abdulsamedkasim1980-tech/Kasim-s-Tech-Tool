
import React from 'react';
import type { GeneratedImage } from '../types';
import ImageCard from './ImageCard';
import { DownloadIcon } from './Icons';

interface ResultsDisplayProps {
  results: GeneratedImage[];
  isLoading: boolean;
  onDownload: (image: GeneratedImage, index: number) => void;
  onRegenerate: (image: GeneratedImage) => void;
  onEdit: (image: GeneratedImage) => void;
  onPreview: (image: GeneratedImage) => void;
  onDownloadAll: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, isLoading, onDownload, onRegenerate, onEdit, onPreview, onDownloadAll }) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <svg className="animate-spin h-12 w-12 text-red-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h2 className="text-2xl font-semibold text-white">Generating Your Story...</h2>
          <p className="text-gray-400 mt-2">This may take a few moments. Please wait.</p>
        </div>
      );
    }

    if (results.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center border-2 border-dashed border-gray-700 rounded-lg">
          <h2 className="text-2xl font-semibold text-white">Your results will appear here</h2>
          <p className="text-gray-400 mt-2">Upload character references, add prompts, and click "Generate All Images" to begin.</p>
        </div>
      );
    }

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Generated Images</h2>
                <button 
                  onClick={onDownloadAll}
                  className="flex items-center bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    <DownloadIcon className="w-5 h-5 mr-2"/>
                    Download All (.zip)
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {results.map((image, index) => (
                <ImageCard 
                    key={image.id} 
                    image={image} 
                    index={index} 
                    onDownload={onDownload} 
                    onRegenerate={onRegenerate} 
                    onEdit={onEdit} 
                    onPreview={onPreview}
                />
            ))}
            </div>
        </>
    );
  };

  return <div className="flex-1 bg-gray-900 p-8 overflow-y-auto">{renderContent()}</div>;
};

export default ResultsDisplay;
