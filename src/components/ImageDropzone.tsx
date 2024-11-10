import React from 'react';
import { Upload } from 'lucide-react';

interface ImageDropzoneProps {
  onFileSelect: (files: FileList) => void;
}

export default function ImageDropzone({ onFileSelect }: ImageDropzoneProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files?.length) {
      onFileSelect(files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="relative"
    >
      <input
        type="file"
        onChange={(e) => e.target.files && onFileSelect(e.target.files)}
        accept="image/*"
        className="hidden"
        id="file-upload"
        multiple
      />
      <label
        htmlFor="file-upload"
        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="text-center p-6">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            Drop images here or click to upload
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Supports PNG, JPEG, WebP, GIF, BMP, ICO, TIFF
          </p>
        </div>
      </label>
    </div>
  );
}