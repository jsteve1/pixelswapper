const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Ensure the dist directory exists
const distPath = path.join(__dirname, '../dist');
if (!fs.existsSync(distPath)) {
  console.error('Error: dist directory does not exist. Run npm run build first.');
  process.exit(1);
}

// Create a file to stream archive data to
const output = fs.createWriteStream(path.join(__dirname, '../pixelswapper.zip'));
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level
});

// Listen for all archive data to be written
output.on('close', function() {
  console.log(`\nSuccessfully created pixelswapper.zip (${archive.pointer()} bytes)`);
  console.log('\nYour extension is ready for Chrome Web Store submission!');
  console.log('Remember to include:');
  console.log('1. At least 2 screenshots of your extension');
  console.log('2. A 128x128 icon');
  console.log('3. A short description (up to 132 characters)');
  console.log('4. A detailed description');
  console.log('5. Privacy policy URL (link to your PRIVACY.md on GitHub)');
});

archive.on('error', function(err) {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Add all files from dist directory
archive.directory(distPath, false);

// Finalize the archive
archive.finalize(); 