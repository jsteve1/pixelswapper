import fs from 'fs';
import path from 'path';

const buildDir = path.resolve('build');
const staticDir = path.resolve('static');
const nodeModulesDir = path.resolve('node_modules');

console.log('Build paths:');
console.log('buildDir:', buildDir);
console.log('staticDir:', staticDir);

// Clean and create build directory
console.log('Cleaning build directory...');
if (fs.existsSync(buildDir)) {
  fs.rmSync(buildDir, { recursive: true });
}
console.log('Creating build directory...');
fs.mkdirSync(buildDir);

// Copy static files
console.log('Copying static files...');
['popup.html', 'manifest.json', 'background.js', 'popup.js', 'converter.js', 'styles.css'].forEach(file => {
  const sourcePath = path.join(staticDir, file);
  if (fs.existsSync(sourcePath)) {
    console.log(`Copying ${file}...`);
    fs.copyFileSync(sourcePath, path.join(buildDir, file));
  } else {
    console.warn(`Warning: ${file} not found in static directory`);
  }
});

// Copy required node_modules
console.log('Copying FFmpeg dependencies...');
const deps = [
  // FFmpeg core files
  '@ffmpeg/core/dist/umd/ffmpeg-core.js',
  '@ffmpeg/core/dist/umd/ffmpeg-core.wasm',
  // FFmpeg package files
  '@ffmpeg/ffmpeg/dist/esm/index.js',
  '@ffmpeg/ffmpeg/dist/esm/classes.js',
  '@ffmpeg/ffmpeg/dist/esm/errors.js',
  '@ffmpeg/ffmpeg/dist/esm/const.js',
  '@ffmpeg/ffmpeg/dist/esm/utils.js',
  '@ffmpeg/ffmpeg/dist/umd/ffmpeg.js',
  // FFmpeg util files
  '@ffmpeg/util/dist/esm/index.js',
  '@ffmpeg/util/dist/esm/errors.js',
  '@ffmpeg/util/dist/esm/const.js',
  '@ffmpeg/util/dist/esm/types.js',
  // JSZip
  'jszip/dist/jszip.min.js'
];

deps.forEach(dep => {
  const sourcePath = path.join(nodeModulesDir, dep);
  const targetPath = path.join(buildDir, 'vendor', dep);
  
  if (fs.existsSync(sourcePath)) {
    // Create target directory if it doesn't exist
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    try {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`Copied ${dep}`);
    } catch (error) {
      console.error(`Error copying ${dep}:`, error);
    }
  } else {
    console.warn(`Warning: ${dep} not found at ${sourcePath}`);
  }
});

// Copy icons
console.log('Creating icons directory...');
fs.mkdirSync(path.join(buildDir, 'icons'));
console.log('Copying icons...');
const iconFiles = fs.readdirSync(path.join(staticDir, 'icons'));
iconFiles.forEach(file => {
  fs.copyFileSync(
    path.join(staticDir, 'icons', file),
    path.join(buildDir, 'icons', file)
  );
});

console.log('Build complete!'); 