
import React, { useState } from 'react';
import type { GeneratedImage } from '../types';
import { DownloadIcon, RefreshCwIcon, EditIcon, EyeIcon } from './Icons';

interface ImageCardProps {
  image: GeneratedImage;
  index: number;
  onDownload: (image: GeneratedImage, index: number) => void;
  onRegenerate: (image: GeneratedImage) => void;
  onEdit: (image: GeneratedImage) => void;
  onPreview: (image: GeneratedImage) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, index, onDownload, onRegenerate, onEdit, onPreview }) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg group relative">
      <img src={`data:image/png;base64,${image.imageBase64}`} alt={image.prompt} className="w-full h-auto aspect-square object-cover" />
      
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center p-4">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center space-x-4">
          <button onClick={() => onPreview(image)} className="p-3 bg-gray-900 rounded-full text-white hover:bg-red-600 transition-colors" title="Preview">
            <EyeIcon className="w-6 h-6" />
          </button>
          <button onClick={() => onDownload(image, index)} className="p-3 bg-gray-900 rounded-full text-white hover:bg-red-600 transition-colors" title="Download">
            <DownloadIcon className="w-6 h-6" />
          </button>
          <button onClick={() => onRegenerate(image)} className="p-3 bg-gray-900 rounded-full text-white hover:bg-red-600 transition-colors" title="Regenerate">
            <RefreshCwIcon className="w-6 h-6" />
          </button>
          <button onClick={() => onEdit(image)} className="p-3 bg-gray-900 rounded-full text-white hover:bg-red-600 transition-colors" title="Edit Prompt">
            <EditIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <p className="text-sm text-gray-400 truncate" title={image.prompt}>
          <span className="font-bold text-gray-200">Prompt {index + 1}:</span> {image.prompt}
        </p>
        <div className="mt-2">
            <span className="inline-block bg-red-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                {`Characters: ${image.charactersUsed.join(', ')}`}
            </span>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;
