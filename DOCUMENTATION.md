# Parkour Pixel Technical Documentation

## Current State

Parkour Pixel is currently in its initial release phase, focusing on core image conversion functionality. The application provides a solid foundation for basic image format conversions while maintaining a strong focus on privacy and client-side processing.

## Architecture Overview

### Core Components

1. **Extension Interface**
   - Chrome Extension Manifest V3
   - SvelteKit-based UI
   - WebAssembly integration for image processing

2. **Processing Engine**
   - WebAssembly-based image processing
   - Module-based architecture for extensibility
   - Client-side processing for privacy

3. **Storage Layer**
   - Chrome Storage API for user preferences
   - Local file system for input/output

### Technical Stack

- **Frontend:**
  - SvelteKit
  - TypeScript
  - Native CSS
  - Chrome Extension APIs

- **Processing:**
  - WebAssembly
  - ES Modules

- **Build Tools:**
  - Vite
  - Node.js build scripts
  - ESLint

## Current Features

### Image Processing
```typescript
interface ImageConversion {
  format: 'webp' | 'png' | 'jpg' | 'gif';
  quality: number;  // 1-100
}
```
- Single image conversion
- Basic quality control
- Common format support (WEBP, PNG, JPG, GIF)
- Drag-and-drop interface

## Implementation Details

### File Processing Flow

1. **Input Handling**
   - Drag-and-drop or file picker
   - Format validation
   - Size checks

2. **Conversion Pipeline**
   - WebAssembly initialization
   - Memory allocation
   - Progress tracking
   - Output generation

3. **Error Handling**
   - Memory constraints
   - Format compatibility
   - Processing failures
   - User feedback

## Development Guidelines

1. **Build Process**
   ```bash
   npm run build  # Builds extension
   ```
   - Bundles SvelteKit application
   - Generates extension structure

2. **Testing**
   - Manual testing workflow
   - Chrome extension loading
   - Feature verification

## Planned Features

### Phase 1 (Next Release)
- HEIC image support
- Batch processing for images
- Enhanced quality controls
- Performance optimizations

### Phase 2 (Future)
- Video format conversion support
- Premium feature tier
- Advanced codec options
- UI/UX improvements

### Phase 3 (Long-term)
- Hardware acceleration
- Custom presets
- Advanced filters
- Analytics integration 