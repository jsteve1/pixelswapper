export type SupportedImageFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export interface ConversionOptions {
  format: SupportedImageFormat;
  quality?: number; // 0 to 1
  maxWidth?: number;
  maxHeight?: number;
}

export async function convertImage(
  file: File,
  options: ConversionOptions
): Promise<{ blob: Blob; filename: string }> {
  // Create a bitmap from the file
  const bitmap = await createImageBitmap(file);
  
  // Create a canvas with the image dimensions
  const canvas = document.createElement('canvas');
  let width = bitmap.width;
  let height = bitmap.height;
  
  // Handle resizing if maxWidth or maxHeight is specified
  if (options.maxWidth && width > options.maxWidth) {
    const ratio = options.maxWidth / width;
    width = options.maxWidth;
    height = height * ratio;
  }
  if (options.maxHeight && height > options.maxHeight) {
    const ratio = options.maxHeight / height;
    height = options.maxHeight;
    width = width * ratio;
  }
  
  canvas.width = width;
  canvas.height = height;
  
  // Draw the image on the canvas
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  ctx.drawImage(bitmap, 0, 0, width, height);
  
  // Convert to the desired format
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert image'));
        }
      },
      options.format,
      options.quality || 0.92
    );
  });
  
  // Generate filename
  const originalName = file.name.substring(0, file.name.lastIndexOf('.'));
  const extension = options.format.split('/')[1];
  const filename = `${originalName}.${extension}`;
  
  return { blob, filename };
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

export const supportedFormats: SupportedImageFormat[] = [
  'image/jpeg',
  'image/png',
  'image/webp'
]; 