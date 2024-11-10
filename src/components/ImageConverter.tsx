import React, { useState, useRef } from 'react';
import { ImageIcon, FileType2, Zap } from 'lucide-react';
import type { ImageFile, ConversionFormat } from '../types';
import ImageDropzone from './ImageDropzone';
import ImageCard from './ImageCard';

export default function ImageConverter() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (files: FileList) => {
    const newImages: ImageFile[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
      targetFormat: 'png',
      status: 'pending'
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  const handleRemove = (id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.previewUrl);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleFormatChange = (id: string, format: ConversionFormat) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, targetFormat: format } : img
      )
    );
  };

  const convertImage = async (id: string) => {
    const image = images.find((img) => img.id === id);
    if (!image || !canvasRef.current) return;

    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, status: 'converting' } : img
      )
    );

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      const img = new Image();
      img.src = image.previewUrl;
      
      await new Promise((resolve) => {
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          resolve(null);
        };
      });

      const mimeType = `image/${image.targetFormat}`;
      const dataUrl = canvas.toDataURL(mimeType, 0.9);
      
      const link = document.createElement('a');
      link.download = `${image.file.name.split('.')[0]}.${image.targetFormat}`;
      link.href = dataUrl;
      link.click();

      setImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, status: 'completed' } : img
        )
      );
    } catch (error) {
      setImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, status: 'error' } : img
        )
      );
    }
  };

  const convertAll = () => {
    images.forEach((image) => {
      if (image.status === 'pending') {
        convertImage(image.id);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Multi-Image Converter</h1>
          <p className="text-gray-600">Convert multiple images to different formats securely in your browser</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="space-y-8">
            <ImageDropzone onFileSelect={handleFileSelect} />

            {images.length > 0 && (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Your Images ({images.length})
                  </h2>
                  <button
                    onClick={convertAll}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    Convert All
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {images.map((image) => (
                    <ImageCard
                      key={image.id}
                      image={image}
                      onRemove={handleRemove}
                      onFormatChange={handleFormatChange}
                      onConvert={convertImage}
                    />
                  ))}
                </div>
              </>
            )}

            <div className="grid md:grid-cols-3 gap-6 bg-gray-50 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <ImageIcon className="h-6 w-6 text-indigo-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-800">Local Processing</h3>
                  <p className="text-sm text-gray-600">All conversions happen in your browser</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileType2 className="h-6 w-6 text-indigo-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-800">Multiple Formats</h3>
                  <p className="text-sm text-gray-600">Convert to PNG, JPEG, WebP, GIF, and more</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="h-6 w-6 text-indigo-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-800">Batch Processing</h3>
                  <p className="text-sm text-gray-600">Convert multiple images at once</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}