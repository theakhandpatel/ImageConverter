import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ImageIcon, FileType2, Zap } from 'lucide-react';
import type { ImageFile, ConversionFormat } from '../types';
import ImageDropzone from './ImageDropzone';
import ImageCard from './ImageCard';

export default function ImageConverter() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [formatAll, setFormatAll] = useState<ConversionFormat>('png');
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

  const convertImage = async (id: string): Promise<{ name: string; dataUrl: string } | null> => {
    const image = images.find((img) => img.id === id);
    if (!image || !canvasRef.current) return null;

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

      setImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, status: 'completed' } : img
        )
      );

      return {
        name: `${image.file.name.split('.')[0]}.${image.targetFormat}`,
        dataUrl
      };
    } catch (error) {
      setImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, status: 'error' } : img
        )
      );
      return null;
    }
  };

  const convertAll = async () => {
    const zip = new JSZip(); // Create a new zip instance on each download click
    const formatToApply = formatAll; // The format selected for all images
    
    // Create a new array of promises to convert all images (including already converted ones)
    const convertedImages = await Promise.all(
      images.map((image) => {
        // If image is in 'pending' or 'completed' state, try to use its existing conversion
        if (image.status === 'pending' || image.status === 'completed') {
          // Mark as converting if still in pending state
          image.targetFormat = formatToApply;
          return convertImage(image.id); // Trigger conversion if pending
        }
        return null; // For error states, do nothing
      })
    );
  
    // Filter out null values (in case there were errors converting any images)
    const validImages = convertedImages.filter(Boolean);
  
    if (validImages.length === 0) {
      alert("No valid images to download");
      return;
    }
  
    // Add the valid images to the zip file
    validImages.forEach(({ name, dataUrl }) => {
      const imgData = dataUrl.split(',')[1]; // Remove the base64 header
      zip.file(name, imgData, { base64: true });
    });
  
    // Generate the zip file asynchronously
    const zipBlob = await zip.generateAsync({ type: 'blob' });
  
    // Trigger the download using file-saver
    saveAs(zipBlob, 'converted_images.zip');
  };
  


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">PurePixels</h1>
          <p className="text-gray-600">Convert images seamlessly and securely, right in your browser—no cloud, just you and PurePixels!</p>
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
                  <div className="flex items-center gap-2">
                    <select
                      value={formatAll}
                      onChange={(e) => setFormatAll(e.target.value as ConversionFormat)}
                      className="px-2 py-1 border rounded-md"
                    >
                      <option value="png">PNG</option>
                      <option value="jpeg">JPEG</option>
                      <option value="webp">WebP</option>
                      <option value="gif">GIF</option>
                    </select>
                    <button
                      onClick={convertAll}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                      <Zap className="h-4 w-4" />
                      Convert All & Download
                    </button>
                  </div>
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
                  <p className="text-sm text-gray-600">Convert images directly in your browser—no uploads, no cloud.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileType2 className="h-6 w-6 text-indigo-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-800">Multiple Formats</h3>
                  <p className="text-sm text-gray-600">Easily switch between PNG, JPEG, WebP, GIF, and more.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="h-6 w-6 text-indigo-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-800">Batch Processing</h3>
                  <p className="text-sm text-gray-600">Handle multiple images at once for quick conversions.</p>
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