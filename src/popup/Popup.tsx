import React, { useState, useEffect } from 'react';
import { getAvailableFormats, isVideoFormat, isImageFormat, SupportedFormat, processingQueue, ProcessingTask } from '../services/imageProcessor';
import { FilePreview } from '../components/FilePreview';
import ConversionSettings from '../components/ConversionSettings';
import ProgressIndicator from '../components/ProgressIndicator';
import DownloadPanel from '../components/DownloadPanel';
import JSZip from 'jszip';

interface FileState {
  id: string;
  file: File;
  availableFormats: SupportedFormat[];
  selectedFormat: SupportedFormat;
  quality: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

interface ConversionSettings {
  quality: number;
  maintainMetadata: boolean;
  resizeEnabled: boolean;
  width: number;
  height: number;
  maintainAspectRatio: boolean;
}

const MAX_FILES = 10;
const ACCEPTED_FORMATS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/tiff',
  'image/bmp',
  'image/avif',
  'image/heif',
  'image/x-eps',
  'image/x-canon-cr2',
  'image/x-raw'
].join(',');

interface SvgValidationResult {
  isValid: boolean;
  error?: string;
}

// Add lossy formats constant
const LOSSY_FORMATS = ['jpg', 'jpeg', 'jpeg_small', 'jpeg_large', 'jfif', 'webp'];

export default function Popup() {
  const [files, setFiles] = useState<FileState[]>([]);
  const [darkMode, setDarkMode] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [tasks, setTasks] = useState<ProcessingTask[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<ConversionSettings>({
    quality: 90,
    maintainMetadata: true,
    resizeEnabled: false,
    width: 1920,
    height: 1080,
    maintainAspectRatio: true,
  });
  const [selectedFormat, setSelectedFormat] = useState<SupportedFormat>('png');
  const [showCompleted, setShowCompleted] = useState(false);
  const [showSvgModal, setShowSvgModal] = useState(false);
  const [svgText, setSvgText] = useState('');
  const [svgValidation, setSvgValidation] = useState<SvgValidationResult>({ isValid: false });
  const [showSizeOptions, setShowSizeOptions] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('original');
  const [isBatchConversion, setIsBatchConversion] = useState(false);

  const PRESET_SIZES = [
    { label: 'Original Size', value: 'original' },
    { label: '16×16', width: 16, height: 16 },
    { label: '32×32', width: 32, height: 32 },
    { label: '64×64', width: 64, height: 64 },
    { label: '128×128', width: 128, height: 128 },
    { label: '256×256', width: 256, height: 256 },
    { label: '512×512', width: 512, height: 512 },
    { label: 'One of Each', value: 'batch' },
  ];

  useEffect(() => {
    processingQueue.setProgressCallback((updatedTasks) => {
      setTasks(updatedTasks);
      const isComplete = updatedTasks.every(
        task => ['completed', 'error', 'cancelled'].includes(task.status)
      );
      if (isComplete && isConverting) {
        setIsConverting(false);
        if (updatedTasks.some(task => task.status === 'completed')) {
          if (isBatchConversion) {
            // Auto download batch conversions as ZIP
            const completedTasks = updatedTasks.filter(task => task.status === 'completed' && task.result);
            if (completedTasks.length > 0) {
              const zip = new JSZip();
              completedTasks.forEach(task => {
                const fileName = `${task.file.name.split('.')[0]}_${task.options.width}x${task.options.height}.${task.options.format}`;
                zip.file(fileName, task.result!.data);
              });
              zip.generateAsync({ type: 'blob' }).then(content => {
                const url = URL.createObjectURL(content);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'batch_converted_files.zip';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                // Reset states after download
                setIsBatchConversion(false);
                handleConvertMore();
              });
            }
          } else {
            setShowCompleted(true);
          }
        }
      }
    });
  }, [isConverting, isBatchConversion]);

  const handleFiles = (newFiles: File[]) => {
    const imageFiles = Array.from(newFiles).filter(file => 
      file.type.startsWith('image/') || 
      ACCEPTED_FORMATS.includes(file.type)
    );

    const remainingSlots = MAX_FILES - files.length;
    if (remainingSlots <= 0) {
      return;
    }

    const filesToAdd = imageFiles.slice(0, remainingSlots).map(file => ({
      id: crypto.randomUUID(),
      file,
      availableFormats: getAvailableFormats(file),
      selectedFormat: getAvailableFormats(file)[0],
      quality: settings.quality,
      status: 'pending' as const
    }));
    
    setFiles(prev => [...prev, ...filesToAdd]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    handleFiles(Array.from(e.target.files));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFormatChange = (fileId: string, format: SupportedFormat) => {
    setFiles(prev =>
      prev.map(f =>
        f.id === fileId
          ? { ...f, selectedFormat: format }
          : f
      )
    );
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    setIsConverting(true);
    files.forEach(file => {
      processingQueue.add({
        id: file.id,
        file: file.file,
        options: {
          format: selectedFormat,
          quality: settings.quality,
          width: settings.resizeEnabled ? settings.width : undefined,
          height: settings.resizeEnabled ? settings.height : undefined,
          maintainAspectRatio: settings.maintainAspectRatio,
          maintainMetadata: settings.maintainMetadata,
        },
        status: 'queued',
        progress: 0,
      });
    });
  };

  const handleDownloadAll = () => {
    tasks
      .filter(task => task.status === 'completed' && task.result)
      .forEach(task => {
        const url = URL.createObjectURL(task.result!.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `converted_${task.file.name.split('.')[0]}.${task.options.format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
  };

  const handleDownloadZip = async () => {
    const completedTasks = tasks.filter(task => task.status === 'completed' && task.result);
    if (completedTasks.length === 0) return;

    const zip = new JSZip();
    
    completedTasks.forEach(task => {
      const fileName = `${task.file.name.split('.')[0]}.${task.options.format}`;
      zip.file(fileName, task.result!.data);
    });
    
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted_files.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleConvertMore = () => {
    setFiles([]);
    setTasks([]);
    setShowCompleted(false);
  };

  const handleSettingsChange = (newSettings: ConversionSettings) => {
    setSettings(newSettings);
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    e.preventDefault();
    
    // Handle SVG text paste
    const text = e.clipboardData.getData('text/plain');
    if (text.trim().startsWith('<svg') && text.includes('</svg>')) {
      setShowSvgModal(true);
      setSvgText(text);
      setSvgValidation(validateSvg(text));
      return;
    }

    // Handle image paste
    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter(item => item.type.startsWith('image/'));
    
    if (imageItems.length > 0) {
      const files = await Promise.all(
        imageItems.map(item => item.getAsFile())
      );
      handleFiles(files.filter((f): f is File => f !== null));
    }
  };

  // Get common formats available for all selected files
  const getCommonFormats = (files: FileState[]): SupportedFormat[] => {
    if (files.length === 0) return [];
    
    // Get the first file's available formats
    const commonFormats = new Set(files[0].availableFormats);
    
    // Find intersection with all other files' formats
    files.slice(1).forEach(file => {
      const fileFormats = new Set(file.availableFormats);
      for (const format of commonFormats) {
        if (!fileFormats.has(format)) {
          commonFormats.delete(format);
        }
      }
    });
    
    return Array.from(commonFormats);
  };

  // Update format options when files change
  useEffect(() => {
    const commonFormats = getCommonFormats(files);
    if (commonFormats.length > 0) {
      setSelectedFormat(commonFormats[0]);
    }
  }, [files]);

  const validateSvg = (text: string): SvgValidationResult => {
    if (!text.trim()) {
      return { isValid: false, error: 'SVG code cannot be empty' };
    }
    
    if (!text.trim().startsWith('<svg')) {
      return { isValid: false, error: 'SVG must start with <svg> tag' };
    }
    
    if (!text.includes('</svg>')) {
      return { isValid: false, error: 'SVG must include closing </svg> tag' };
    }
    
    if (text.includes('<script')) {
      return { isValid: false, error: 'SVG cannot contain script tags for security reasons' };
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'image/svg+xml');
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        return { isValid: false, error: 'Invalid SVG format' };
      }
    } catch (e) {
      return { isValid: false, error: 'Failed to parse SVG' };
    }
    
    return { isValid: true };
  };

  const handleSvgTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setSvgText(text);
    setSvgValidation(validateSvg(text));
  };

  const handleSvgSubmit = () => {
    const validation = validateSvg(svgText);
    if (!validation.isValid) {
      return;
    }
    
    const blob = new Blob([svgText], { type: 'image/svg+xml' });
    const file = new File([blob], 'pasted-svg.svg', { type: 'image/svg+xml' });
    handleFiles([file]);
    setSvgText('');
    setShowSvgModal(false);
    setSvgValidation({ isValid: false });
  };

  return (
    <div 
      className={`flex flex-col min-h-screen w-full p-4 ${darkMode ? 'bg-[#1E1E1E] text-white' : 'bg-white text-gray-800'}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onPaste={handlePaste}
      tabIndex={0}
    >
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">PixelSwapper</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full hover:bg-gray-700/50 text-2xl"
            title="Settings"
          >
            ⚙️
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-gray-700/50 text-2xl"
          >
            {darkMode ? '🌞' : '🌙'}
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="mb-4">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Settings</h2>
              <a
                href="https://chrome.google.com/webstore/detail/placeholder-id"
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm hover:underline ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
              >
                About
              </a>
            </div>
            <ConversionSettings
              isDarkMode={darkMode}
              onSettingsChange={handleSettingsChange}
            />
          </div>
        </div>
      )}

      <div 
        className={`
          flex-1 border-2 border-dashed rounded-lg p-4 mb-4 transition-colors
          ${isDragging ? 'border-indigo-500 bg-indigo-500/10' : darkMode ? 'border-gray-700' : 'border-gray-300'}
          ${files.length === 0 ? 'flex items-center justify-center' : ''}
        `}
      >
        {files.length === 0 ? (
          <div className="text-center">
            <p className="mb-2">Drop files here or</p>
            <div className="flex gap-2 justify-center">
              <label className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700">
                Browse Files
                <input
                  type="file"
                  multiple
                  accept={ACCEPTED_FORMATS}
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => setShowSvgModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Paste SVG
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Up to {MAX_FILES} images
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {files.map((fileState, index) => (
              <FilePreview
                key={fileState.id}
                fileState={fileState}
                task={tasks.find(t => t.id === fileState.id)}
                onRemove={() => removeFile(index)}
                isDarkMode={darkMode}
              />
            ))}
            {files.length < MAX_FILES && (
              <label className="relative aspect-square w-full overflow-hidden rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-gray-700/10">
                <span className="text-2xl">+</span>
                <input
                  type="file"
                  multiple
                  accept={ACCEPTED_FORMATS}
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>
        )}
      </div>

      {files.length > 0 && !showCompleted && (
        <div className="flex flex-col gap-4">
          {isConverting ? (
            <ProgressIndicator
              tasks={tasks}
              isDarkMode={darkMode}
              isPaused={processingQueue.paused}
              onCancel={(id) => processingQueue.cancel(id)}
              onCancelAll={() => processingQueue.cancelAll()}
              onPauseResume={() => processingQueue.paused ? processingQueue.resume() : processingQueue.pause()}
              onRetry={(id) => processingQueue.retry(id)}
              onRetryAll={() => processingQueue.retryAll()}
            />
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="whitespace-nowrap">Convert to:</label>
                <div className="relative">
                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value as SupportedFormat)}
                    className={`p-2 rounded-lg ${
                      darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
                    }`}
                  >
                    {getCommonFormats(files).map(format => (
                      <option key={format} value={format}>
                        {format.toUpperCase().replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                  {LOSSY_FORMATS.includes(selectedFormat) && files.some(f => !LOSSY_FORMATS.includes(f.file.type.split('/')[1])) && (
                    <div className={`
                      absolute -top-1 left-full ml-2 text-xs px-2 py-0.5 rounded-sm
                      ${darkMode ? 'text-yellow-200/80' : 'text-yellow-600/80'}
                    `}>
                      ℹ️ Lossy format
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowSizeOptions(!showSizeOptions)}
                    className={`p-2 rounded-lg hover:bg-opacity-80 ${
                      darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
                    }`}
                    title="Size Options"
                  >
                    <span className="flex items-center gap-1">
                      {selectedSize === 'original' ? 'Original Size' : selectedSize}
                      <span className="text-xs">▼</span>
                    </span>
                  </button>
                  
                  {showSizeOptions && (
                    <div 
                      className={`
                        absolute z-50 bottom-[120%] right-0 w-64 rounded-lg shadow-lg
                        ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
                      `}
                    >
                      <div className="p-2">
                        <div className="mb-2 font-medium">Preset Sizes</div>
                        {PRESET_SIZES.map(size => (
                          <button
                            key={size.value || `${size.width}x${size.height}`}
                            onClick={() => {
                              setSelectedSize(size.value || `${size.width}×${size.height}`);
                              if (size.value === 'batch') {
                                // Handle batch conversion
                                const batchTasks: ProcessingTask[] = [];
                                files.forEach(file => {
                                  PRESET_SIZES
                                    .filter(s => s.width && s.height) // Only use numeric sizes
                                    .forEach(preset => {
                                      const task: ProcessingTask = {
                                        id: `${file.id}-${preset.width}x${preset.height}`,
                                        file: file.file,
                                        options: {
                                          format: selectedFormat,
                                          quality: settings.quality,
                                          width: preset.width,
                                          height: preset.height,
                                          maintainAspectRatio: settings.maintainAspectRatio,
                                          maintainMetadata: settings.maintainMetadata,
                                        },
                                        status: 'queued',
                                        progress: 0,
                                      };
                                      batchTasks.push(task);
                                    });
                                });
                                
                                // Queue all batch tasks
                                batchTasks.forEach(task => {
                                  processingQueue.add(task);
                                });
                                
                                setIsBatchConversion(true);
                                setIsConverting(true);
                                setShowSizeOptions(false);
                              } else if (size.width && size.height) {
                                setSettings(prev => ({
                                  ...prev,
                                  resizeEnabled: true,
                                  width: size.width,
                                  height: size.height
                                }));
                              } else {
                                setSettings(prev => ({
                                  ...prev,
                                  resizeEnabled: false
                                }));
                              }
                              setShowSizeOptions(false);
                            }}
                            className={`
                              w-full text-left px-3 py-1 rounded-md
                              ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
                              ${size.value === 'batch' ? 'border-t border-gray-600 mt-2 pt-2' : ''}
                            `}
                          >
                            {size.label}
                          </button>
                        ))}
                        
                        <div className="border-t my-2"></div>
                        
                        <div className="mb-2 font-medium">Custom Size</div>
                        <div className="flex gap-2 p-2">
                          <input
                            type="number"
                            placeholder="Width"
                            min="1"
                            max="10000"
                            className={`
                              w-full p-1 rounded border
                              ${darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300'
                              }
                            `}
                            value={settings.resizeEnabled ? settings.width : ''}
                            onChange={(e) => {
                              const width = parseInt(e.target.value);
                              if (width > 0) {
                                setSettings(prev => ({
                                  ...prev,
                                  resizeEnabled: true,
                                  width,
                                  height: prev.maintainAspectRatio 
                                    ? Math.round(width * (prev.height / prev.width))
                                    : prev.height
                                }));
                                setSelectedSize(`${width}×${settings.height}`);
                              }
                            }}
                          />
                          <span>×</span>
                          <input
                            type="number"
                            placeholder="Height"
                            min="1"
                            max="10000"
                            className={`
                              w-full p-1 rounded border
                              ${darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300'
                              }
                            `}
                            value={settings.resizeEnabled ? settings.height : ''}
                            onChange={(e) => {
                              const height = parseInt(e.target.value);
                              if (height > 0) {
                                setSettings(prev => ({
                                  ...prev,
                                  resizeEnabled: true,
                                  height,
                                  width: prev.maintainAspectRatio 
                                    ? Math.round(height * (prev.width / prev.height))
                                    : prev.width
                                }));
                                setSelectedSize(`${settings.width}×${height}`);
                              }
                            }}
                          />
                        </div>
                        <label className="flex items-center gap-2 p-2">
                          <input
                            type="checkbox"
                            checked={settings.maintainAspectRatio}
                            onChange={(e) => {
                              setSettings(prev => ({
                                ...prev,
                                maintainAspectRatio: e.target.checked
                              }));
                            }}
                          />
                          <span className="text-sm">Maintain aspect ratio</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleConvert}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Convert {files.length} {files.length === 1 ? 'File' : 'Files'}
              </button>
            </div>
          )}
        </div>
      )}

      {showCompleted && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <button
              onClick={handleDownloadAll}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Download All
            </button>
            <button
              onClick={handleDownloadZip}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Download as ZIP
            </button>
          </div>
          <button
            onClick={handleConvertMore}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Convert More Files
          </button>
        </div>
      )}

      {showSvgModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`
            w-full max-w-2xl p-4 rounded-lg shadow-lg
            ${darkMode ? 'bg-gray-800' : 'bg-white'}
          `}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Paste SVG Code</h3>
              <button
                onClick={() => {
                  setShowSvgModal(false);
                  setSvgText('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <textarea
              value={svgText}
              onChange={handleSvgTextChange}
              placeholder="Paste your SVG code here..."
              className={`
                w-full h-64 p-2 rounded-lg border mb-2 font-mono text-sm
                ${darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-800'
                }
                ${svgValidation.error ? 'border-red-500' : ''}
              `}
            />
            {svgValidation.error && (
              <p className="text-red-500 text-sm mb-4">
                {svgValidation.error}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowSvgModal(false);
                  setSvgText('');
                }}
                className={`
                  px-4 py-2 rounded-lg
                  ${darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-200 hover:bg-gray-300'
                  }
                `}
              >
                Cancel
              </button>
              <button
                onClick={handleSvgSubmit}
                disabled={!svgValidation.isValid}
                className={`
                  px-4 py-2 bg-indigo-600 text-white rounded-lg
                  ${svgValidation.isValid
                    ? 'hover:bg-indigo-700'
                    : 'opacity-50 cursor-not-allowed'
                  }
                `}
              >
                Add SVG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 