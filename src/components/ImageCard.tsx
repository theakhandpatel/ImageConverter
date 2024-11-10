import React from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import type { ImageFile, ConversionFormat } from '../types';

interface ImageCardProps {
  image: ImageFile;
  onRemove: (id: string) => void;
  onFormatChange: (id: string, format: ConversionFormat) => void;
  onConvert: (id: string) => void;
}

export default function ImageCard({ 
  image, 
  onRemove, 
  onFormatChange,
  onConvert 
}: ImageCardProps) {
  const formats: ConversionFormat[] = ['png', 'jpeg', 'webp', 'gif', 'bmp', 'ico', 'tiff'];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-40">
        <img
          src={image.previewUrl}
          alt="Preview"
          className="w-full h-full object-cover"
        />
        <button
          onClick={() => onRemove(image.id)}
          className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-sm font-medium text-gray-700 truncate" title={image.file.name}>
          {image.file.name}
        </p>
        <div className="flex items-center gap-2">
          <select
            value={image.targetFormat}
            onChange={(e) => onFormatChange(image.id, e.target.value as ConversionFormat)}
            className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {formats.map((format) => (
              <option key={format} value={format}>
                {format.toUpperCase()}
              </option>
            ))}
          </select>
          <button
            onClick={() => onConvert(image.id)}
            disabled={image.status === 'converting'}
            className="flex items-center justify-center p-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {image.status === 'converting' && <Loader2 className="h-4 w-4 animate-spin" />}
            {image.status === 'completed' && <Check className="h-4 w-4" />}
            {image.status === 'pending' && 'Convert'}
            {image.status === 'error' && 'Retry'}
          </button>
        </div>
      </div>
    </div>
  );
}