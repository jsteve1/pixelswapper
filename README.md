# Parkour Pixel - Local File Format Converter

A privacy-focused Chrome extension for client-side image format conversions

[![Available in the Chrome Web Store](https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/iNEddTyWiMfLSwFD6qGq.png)](https://chromewebstore.google.com/detail/pixel-parkour/blpagjodddakdmenplgngncfojccficp)

## Features

- 🔒 100% Client-side processing - no file uploads
- 🎯 Convert between common image formats (WEBP, JPG, PNG, GIF)
- ⚡ High-performance using WebAssembly
- 🔌 Works offline
- 🎨 Simple drag-and-drop interface

## Upcoming Features

- 🎬 Video format conversions (MP4, MOV, AVI, WEBM)
- 📱 HEIC image support
- ⭐ Premium features with advanced options
- 🎛️ Advanced quality controls
- 📦 Batch processing improvements

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/jsteve1/pixelswapper.git
cd pixelparkour
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load the extension in Chrome:
- Open Chrome and navigate to `chrome://extensions/`
- Enable "Developer mode"
- Click "Load unpacked" and select the `dist` directory

## Project Structure

```
pixelparkour/
├── src/               # Source code
├── dist/              # Built extension
├── docs/              # Documentation
├── tests/             # Test files
└── wasm/              # WebAssembly modules
```

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 