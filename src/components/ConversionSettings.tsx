import React from 'react';

interface ConversionSettingsProps {
  isDarkMode: boolean;
  onSettingsChange: (settings: ConversionSettings) => void;
}

export interface ConversionSettings {
  quality: number;
  maintainMetadata: boolean;
  resizeEnabled: boolean;
  width: number;
  height: number;
  maintainAspectRatio: boolean;
}

const ConversionSettings: React.FC<ConversionSettingsProps> = ({ isDarkMode, onSettingsChange }) => {
  const [settings, setSettings] = React.useState<ConversionSettings>({
    quality: 90,
    maintainMetadata: true,
    resizeEnabled: false,
    width: 1920,
    height: 1080,
    maintainAspectRatio: true,
  });

  const handleChange = (key: keyof ConversionSettings, value: number | boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const inputClass = `w-full p-2 rounded-md border ${
    isDarkMode 
      ? 'bg-gray-700 border-gray-600 text-white' 
      : 'bg-white border-gray-300'
  }`;

  const labelClass = 'text-sm font-medium mb-1 block';

  return (
    <div className="space-y-4">
      {/* Quality Control */}
      <div>
        <label className={labelClass}>
          Quality: {settings.quality}%
        </label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="1"
            max="100"
            value={settings.quality}
            onChange={(e) => handleChange('quality', parseInt(e.target.value))}
            className="flex-1"
          />
        </div>
      </div>

      {/* Metadata Toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="metadata"
          checked={settings.maintainMetadata}
          onChange={(e) => handleChange('maintainMetadata', e.target.checked)}
          className="rounded border-gray-300"
        />
        <label htmlFor="metadata" className="text-sm">
          Preserve metadata (EXIF, ICC profile)
        </label>
      </div>

      {/* Resize Controls */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            id="resize"
            checked={settings.resizeEnabled}
            onChange={(e) => handleChange('resizeEnabled', e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="resize" className="text-sm">
            Resize image
          </label>
        </div>

        {settings.resizeEnabled && (
          <div className="pl-6 space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Width</label>
                <input
                  type="number"
                  value={settings.width}
                  onChange={(e) => handleChange('width', parseInt(e.target.value))}
                  className={inputClass}
                  min="1"
                  max="10000"
                />
              </div>
              <div>
                <label className={labelClass}>Height</label>
                <input
                  type="number"
                  value={settings.height}
                  onChange={(e) => handleChange('height', parseInt(e.target.value))}
                  className={inputClass}
                  min="1"
                  max="10000"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="aspect"
                checked={settings.maintainAspectRatio}
                onChange={(e) => handleChange('maintainAspectRatio', e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="aspect" className="text-sm">
                Maintain aspect ratio
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversionSettings; 