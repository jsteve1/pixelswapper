# Parkour Pixel Technical Documentation

## Architecture Overview

### Core Components

1. **Extension Interface**
   - Chrome Extension Manifest V3
   - SvelteKit-based UI
   - Service Worker for background tasks
   - WebAssembly integration for file processing

2. **Processing Engine**
   - FFmpeg.wasm for both image and video conversions
   - Module-based architecture for extensibility
   - Client-side processing for privacy

3. **Storage Layer**
   - Chrome Storage API for user preferences
   - Local file system for input/output
   - Memory-efficient streaming for large files

### Technical Stack

- **Frontend:**
  - SvelteKit
  - TypeScript
  - Native CSS
  - Chrome Extension APIs

- **Processing:**
  - FFmpeg.wasm
  - WebAssembly
  - ES Modules

- **Build Tools:**
  - Vite
  - Node.js build scripts
  - ESLint

## Feature Implementation

### Free Features

1. **Image Processing**
   ```typescript
   interface ImageConversion {
     format: 'webp' | 'png' | 'jpg' | 'gif';
     quality: number;  // 1-100
     batchProcessing: boolean;
   }
   ```
   - Batch photo conversions
   - Basic quality control
   - Common format support
   - Drag-and-drop interface

2. **Video Processing**
   ```typescript
   interface VideoConversion {
     format: 'mp4' | 'webm';
     quality: number;  // 1-100
     singleFile: boolean;  // true for free version
   }
   ```
   - Single video conversion
   - Basic quality settings
   - MP4 and WebM support
   - Progress tracking

### Premium Features

1. **Advanced Video Processing**
   ```typescript
   interface PremiumVideoConversion extends VideoConversion {
     batchProcessing: boolean;
     codec: 'h264' | 'h265' | 'av1' | 'prores' | 'dnxhd';
     bitrate: number;
     frameRate?: number;
     resolution?: {
       width: number;
       height: number;
     };
   }
   ```
   - Batch video processing
   - Advanced codec options
   - Custom quality parameters
   - Resolution control

2. **Beta Features**
   ```typescript
   interface BetaFeatures {
     hardwareAcceleration: boolean;
     customPresets: boolean;
     advancedFilters: boolean;
   }
   ```
   - Early access to new features
   - Experimental codecs
   - Advanced processing options

## Implementation Details

### File Processing Flow

1. **Input Handling**
   - Drag-and-drop or file picker
   - Format validation
   - Size checks
   - Batch processing detection

2. **Conversion Pipeline**
   - FFmpeg initialization
   - Memory allocation
   - Progress tracking
   - Output generation

3. **Error Handling**
   - Memory constraints
   - Format compatibility
   - Processing failures
   - User feedback

### Premium Integration

1. **License Management**
   ```typescript
   interface License {
     type: 'free' | 'premium';
     features: string[];
     expiryDate?: Date;
   }
   ```
   - Feature access control
   - Transparent UI
   - Seamless upgrades

## Security and Privacy

1. **Data Protection**
   - 100% client-side processing
   - No data transmission
   - Automatic cleanup
   - Memory management

2. **Resource Management**
   - Efficient memory usage
   - CPU optimization
   - Storage handling
   - Worker management

## Development Guidelines

1. **Build Process**
   ```bash
   npm run build  # Builds extension
   ```
   - Copies required FFmpeg files
   - Bundles SvelteKit application
   - Generates extension structure

2. **Testing**
   - Manual testing workflow
   - Chrome extension loading
   - Feature verification
   - Performance monitoring

## Future Roadmap

1. **Phase 1 (Current)**
   - Basic image/video conversions
   - Free vs Premium structure
   - Core functionality
   - Essential UI

2. **Phase 2 (Planned)**
   - Advanced codec support
   - Batch processing improvements
   - UI/UX enhancements
   - Performance optimization

3. **Phase 3 (Future)**
   - Hardware acceleration
   - Custom presets
   - Advanced filters
   - Analytics integration 