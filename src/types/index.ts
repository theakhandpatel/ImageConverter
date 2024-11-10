export type ConversionFormat = 
  | 'png' 
  | 'jpeg' 
  | 'webp' 
  | 'gif' 
  | 'bmp' 
  | 'ico' 
  | 'tiff';

export interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
  targetFormat: ConversionFormat;
  status: 'pending' | 'converting' | 'completed' | 'error';
}