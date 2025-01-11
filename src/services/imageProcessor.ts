export type SupportedFormat = 
  | 'jpg' | 'jpeg' | 'jpeg_small' | 'jpeg_large' | 'jfif'
  | 'png' | 'webp' | 'gif' | 'avif' | 'heif' | 'bmp'
  | 'svg' | 'tiff' | 'eps' | 'cr2' | 'raw';

export interface ProcessingOptions {
  format: SupportedFormat;
  quality?: number;
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  maintainMetadata?: boolean;
}

export interface ProcessedImage {
  data: Blob;
  format: SupportedFormat;
  size: number;
}

export interface ProcessingTask {
  id: string;
  file: File;
  options: ProcessingOptions;
  status: 'queued' | 'processing' | 'completed' | 'error' | 'cancelled';
  progress: number;
  result?: ProcessedImage;
  error?: string;
}

export function isImageFormat(format: string): boolean {
  return [
    'jpg', 'jpeg', 'jpeg_small', 'jpeg_large', 'jfif',
    'png', 'webp', 'gif', 'avif', 'heif', 'bmp',
    'svg', 'tiff', 'eps', 'cr2', 'raw'
  ].includes(format.toLowerCase());
}

export function isVideoFormat(format: string): boolean {
  return ['mp4', 'webm', 'mov', 'avi'].includes(format.toLowerCase());
}

export function getAvailableFormats(file: File): SupportedFormat[] {
  const type = file.type.toLowerCase();
  
  // SVG (vector) can be converted to any raster format
  if (type.startsWith('image/svg')) {
    return ['png', 'jpg', 'jpeg', 'webp', 'jpeg_small', 'jpeg_large'];
  }
  
  // All raster formats can be converted to these common formats
  const rasterFormats: SupportedFormat[] = ['png', 'webp', 'jpeg', 'jpeg_small', 'jpeg_large'];
  
  // JPEG variants can be converted to other compressed formats
  if (type.includes('jpeg') || type.includes('jpg') || type === 'image/jfif') {
    return rasterFormats;
  }
  
  // PNG can be converted to formats that support transparency
  if (type === 'image/png') {
    return [...rasterFormats, 'gif'];
  }
  
  // WebP can be converted to modern formats
  if (type === 'image/webp') {
    return [...rasterFormats, 'avif'];
  }
  
  // GIF can be converted to formats that support animation or transparency
  if (type === 'image/gif') {
    return ['webp', 'png', 'gif'];
  }
  
  // AVIF/HEIF can be converted to modern formats
  if (type === 'image/avif' || type === 'image/heif') {
    return [...rasterFormats, 'avif'];
  }
  
  // BMP can be converted to any modern format
  if (type === 'image/bmp') {
    return rasterFormats;
  }
  
  // TIFF/EPS can be converted to high-quality formats
  if (type === 'image/tiff' || type === 'image/x-eps') {
    return ['png', 'webp', 'tiff', 'jpeg_large'];
  }
  
  // RAW/CR2 should be converted to high-quality formats
  if (type === 'image/x-canon-cr2' || type === 'image/x-raw') {
    return ['png', 'tiff', 'jpeg_large'];
  }
  
  // Default to common web formats
  return rasterFormats;
}

export async function processImage(file: File, options: ProcessingOptions, onProgress?: (progress: number) => void): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    // Handle SVG input
    if (file.type.startsWith('image/svg')) {
      handleSVGInput(file, options, onProgress).then(resolve).catch(reject);
      return;
    }

    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: true });
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }
    
    img.onload = () => {
      try {
        if (onProgress) onProgress(30);

        let width = img.width;
        let height = img.height;
        
        if (options.width || options.height) {
          if (options.maintainAspectRatio) {
            const ratio = img.width / img.height;
            if (options.width) {
              width = options.width;
              height = width / ratio;
            } else if (options.height) {
              height = options.height;
              width = height * ratio;
            }
          } else {
            width = options.width || width;
            height = options.height || height;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        if (onProgress) onProgress(60);
        
        // Clear canvas and handle transparency
        ctx.clearRect(0, 0, width, height);
        
        // Only add white background for formats that don't support transparency
        if (['jpg', 'jpeg', 'jpeg_small', 'jpeg_large', 'jfif'].includes(options.format)) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        if (onProgress) onProgress(90);
        
        // Handle JPEG quality variations
        let quality = options.quality ? options.quality / 100 : 0.8;
        if (options.format === 'jpeg_small') quality = Math.min(quality, 0.6);
        if (options.format === 'jpeg_large') quality = Math.max(quality, 0.9);
        
        const format = options.format.replace(/_small|_large/, '');
        const mimeType = `image/${format === 'jpg' ? 'jpeg' : format}`;
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to convert image'));
              return;
            }
            
            if (onProgress) onProgress(100);
            
            resolve({
              data: blob,
              format: options.format,
              size: blob.size
            });
          },
          mimeType,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

async function handleSVGInput(file: File, options: ProcessingOptions, onProgress?: (progress: number) => void): Promise<ProcessedImage> {
  // If target format is SVG, just return the file
  if (options.format === 'svg') {
    if (onProgress) onProgress(100);
    return {
      data: file,
      format: 'svg',
      size: file.size
    };
  }

  // Convert SVG to other formats
  const text = await file.text();
  const blob = new Blob([text], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { alpha: true });
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      canvas.width = options.width || img.width;
      canvas.height = options.height || img.height;
      
      if (['jpg', 'jpeg', 'jpeg_small', 'jpeg_large', 'jfif'].includes(options.format)) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const quality = options.quality ? options.quality / 100 : 0.8;
      const format = options.format.replace(/_small|_large/, '');
      const mimeType = `image/${format === 'jpg' ? 'jpeg' : format}`;
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to convert SVG'));
            return;
          }
          if (onProgress) onProgress(100);
          resolve({
            data: blob,
            format: options.format,
            size: blob.size
          });
        },
        mimeType,
        quality
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load SVG'));
    img.src = url;
  });
}

export class ProcessingQueue {
  private tasks: ProcessingTask[] = [];
  private isProcessing = false;
  private isPaused = false;
  private progressCallback?: (tasks: ProcessingTask[]) => void;
  
  get paused(): boolean {
    return this.isPaused;
  }
  
  setProgressCallback(callback: (tasks: ProcessingTask[]) => void) {
    this.progressCallback = callback;
    // Initial callback with current state
    if (this.tasks.length > 0) {
      this.updateProgress();
    }
  }
  
  add(task: ProcessingTask) {
    this.tasks.push(task);
    this.updateProgress();
    if (!this.isProcessing && !this.isPaused) {
      void this.processNext();
    }
  }
  
  pause() {
    this.isPaused = true;
    this.updateProgress();
  }
  
  resume() {
    this.isPaused = false;
    if (!this.isProcessing) {
      void this.processNext();
    }
    this.updateProgress();
  }
  
  cancel(taskId: string) {
    const index = this.tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      this.tasks[index].status = 'cancelled';
      this.updateProgress();
    }
  }

  cancelAll() {
    this.tasks.forEach(task => {
      if (task.status === 'processing' || task.status === 'queued') {
        task.status = 'cancelled';
      }
    });
    this.updateProgress();
  }

  retry(taskId: string) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task && task.status === 'error') {
      task.status = 'queued';
      task.progress = 0;
      task.error = undefined;
      if (!this.isProcessing && !this.isPaused) {
        void this.processNext();
      }
      this.updateProgress();
    }
  }
  
  retryAll() {
    let hasRetried = false;
    this.tasks.forEach(task => {
      if (task.status === 'error') {
        task.status = 'queued';
        task.progress = 0;
        task.error = undefined;
        hasRetried = true;
      }
    });
    
    if (hasRetried && !this.isProcessing && !this.isPaused) {
      void this.processNext();
    }
    this.updateProgress();
  }
  
  private async processNext() {
    if (this.isPaused) return;
    
    const nextTask = this.tasks.find(t => t.status === 'queued');
    if (!nextTask) return;
    
    this.isProcessing = true;
    nextTask.status = 'processing';
    this.updateProgress();
    
    try {
      const result = await processImage(
        nextTask.file,
        nextTask.options,
        (progress) => {
          nextTask.progress = progress;
          this.updateProgress();
        }
      );
      
      nextTask.status = 'completed';
      nextTask.result = result;
      nextTask.progress = 100;
    } catch (error) {
      nextTask.status = 'error';
      nextTask.error = error instanceof Error ? error.message : 'Unknown error';
    }
    
    this.isProcessing = false;
    this.updateProgress();
    
    if (!this.isPaused) {
      void this.processNext();
    }
  }
  
  private updateProgress() {
    if (this.progressCallback) {
      this.progressCallback([...this.tasks]);
    }
  }
}

export const processingQueue = new ProcessingQueue(); 