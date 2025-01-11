import React from 'react';

export interface ConvertedFile {
  id: string;
  name: string;
  originalName: string;
  url: string;
  thumbnail?: string;
  size: number;
}

interface DownloadPanelProps {
  files: ConvertedFile[];
  isDarkMode: boolean;
  onDownloadAll: () => void;
  onDownloadZip: () => void;
  onBack: () => void;
}

const DownloadPanel: React.FC<DownloadPanelProps> = ({
  files,
  isDarkMode,
  onDownloadAll,
  onDownloadZip,
  onBack,
}) => {
  const formatFileSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Go back"
          >
            ←
          </button>
          <h2 className="text-lg font-medium">Converted Files</h2>
        </div>
        <div className="flex w-full sm:w-auto gap-2">
          <button
            onClick={onDownloadAll}
            className="flex-1 sm:flex-none px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Download All
          </button>
          <button
            onClick={onDownloadZip}
            className="flex-1 sm:flex-none px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Download ZIP
          </button>
        </div>
      </div>

      {/* File Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {files.map(file => (
          <div
            key={file.id}
            className={`
              rounded-lg overflow-hidden border
              ${isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
              }
            `}
          >
            {/* Preview */}
            <div className="aspect-square bg-gray-900">
              {file.thumbnail ? (
                <img
                  src={file.thumbnail}
                  alt={file.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">
                  📄
                </div>
              )}
            </div>

            {/* Info & Download */}
            <div className="p-3 space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-sm font-medium truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <a
                  href={file.url}
                  download={file.name}
                  className="p-2 text-indigo-500 hover:text-indigo-400 transition-colors shrink-0"
                  title="Download file"
                >
                  ⬇️
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DownloadPanel; 