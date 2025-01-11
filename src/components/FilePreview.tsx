import React, { useState, useEffect } from 'react';
import { SupportedFormat, ProcessingTask } from '../services/imageProcessor';

interface FileState {
  id: string;
  file: File;
  availableFormats: SupportedFormat[];
  selectedFormat: SupportedFormat;
  quality: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

interface FilePreviewProps {
  fileState: FileState;
  task?: ProcessingTask;
  onRemove: () => void;
  isDarkMode: boolean;
}

// Formats that support transparency
const TRANSPARENT_FORMATS = ['png', 'webp', 'gif', 'svg'];

// Add supported preview formats
const PREVIEW_SUPPORTED_FORMATS = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
  'image/webp', 'image/svg+xml', 'image/bmp'
];

// Add fallback icon component
const FallbackIcon = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <div className={`
    w-full h-full flex items-center justify-center text-6xl
    ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}
  `}>
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      className="w-12 h-12"
      stroke="currentColor" 
      strokeWidth="2"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  </div>
);

export const FilePreview = ({ fileState, task, onRemove, isDarkMode }: FilePreviewProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [hasTransparency, setHasTransparency] = useState(false);
  const [canPreview, setCanPreview] = useState(true);

  // Check if the current format supports transparency
  const isTransparentFormat = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    return TRANSPARENT_FORMATS.includes(ext || '') || 
           TRANSPARENT_FORMATS.some(format => file.type.includes(format));
  };

  // Check if image has transparency
  const checkTransparency = (url: string) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      try {
        // Sample pixels to check for transparency
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const hasTransparentPixels = Array.from(imageData.data)
          .filter((_, i) => (i + 1) % 4 === 0) // Get alpha channel values
          .some(alpha => alpha < 255);
        setHasTransparency(hasTransparentPixels);
      } catch (e) {
        // CORS or other errors, assume no transparency
        setHasTransparency(false);
      }
    };
    img.src = url;
  };

  // Update preview support check
  useEffect(() => {
    const isPreviewSupported = PREVIEW_SUPPORTED_FORMATS.includes(fileState.file.type);
    setCanPreview(isPreviewSupported);
    
    if (!isPreviewSupported) {
      setPreviewUrl('');
      setHasTransparency(false);
      return;
    }

    // Rest of the existing preview logic...
    if (task?.status === 'completed' && task.result) {
      const url = URL.createObjectURL(task.result.data);
      setPreviewUrl(url);
      if (isTransparentFormat(task.file)) {
        checkTransparency(url);
      }
      return () => URL.revokeObjectURL(url);
    }
    
    const url = URL.createObjectURL(fileState.file);
    setPreviewUrl(url);
    if (isTransparentFormat(fileState.file)) {
      checkTransparency(url);
    }
    return () => URL.revokeObjectURL(url);
  }, [fileState.file, task]);

  const handleClick = () => {
    if (task?.status === 'completed' && task.result) {
      const url = URL.createObjectURL(task.result.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `converted_${fileState.file.name.split('.')[0]}.${task.options.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div 
      className={`
        relative aspect-square w-full overflow-hidden rounded-lg
        ${task?.status === 'completed' ? 'cursor-pointer' : ''}
        ${task?.status === 'processing' ? 'opacity-70' : ''}
      `}
      onClick={handleClick}
      title={task?.status === 'completed' ? 'Click to download' : undefined}
    >
      {/* Checkered background for transparent images */}
      {hasTransparency && canPreview && (
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `
              linear-gradient(45deg, #e5e5e5 25%, transparent 25%),
              linear-gradient(-45deg, #e5e5e5 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #e5e5e5 75%),
              linear-gradient(-45deg, transparent 75%, #e5e5e5 75%)
            `,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            opacity: 0.5
          }}
        />
      )}
      {canPreview ? (
        <img
          src={previewUrl}
          alt={fileState.file.name}
          className="w-full h-full object-cover relative z-10"
          style={{
            mixBlendMode: hasTransparency ? 'normal' : 'normal',
            opacity: hasTransparency ? 0.999 : 1
          }}
        />
      ) : (
        <FallbackIcon isDarkMode={isDarkMode} />
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors z-20"
        title="Remove file"
      >
        ×
      </button>
      
      {/* Status Overlay */}
      {task?.status === 'processing' && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-20">
          <div className="text-white text-sm">
            Converting... {task.progress}%
          </div>
        </div>
      )}
      
      {task?.status === 'error' && (
        <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center z-20">
          <div className="text-white text-sm px-2 text-center">
            Error: {task.error}
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white text-sm truncate z-20">
        {task?.status === 'completed' 
          ? `Click to download .${task.options.format}`
          : fileState.file.name
        }
      </div>
    </div>
  );
}; 