import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const zip = new JSZip();
const buildDir = path.resolve('build');

// Function to recursively add files to zip
async function addFilesToZip(dir, zipFolder) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            await addFilesToZip(filePath, zipFolder.folder(file));
        } else {
            const fileData = fs.readFileSync(filePath);
            zipFolder.file(file, fileData);
        }
    }
}

console.log('Creating ZIP file for Chrome Web Store submission...');

// Add all files from build directory
await addFilesToZip(buildDir, zip);

// Generate ZIP file
const zipContent = await zip.generateAsync({ type: 'nodebuffer' });
const outputPath = path.resolve('pixel-parkour.zip');
fs.writeFileSync(outputPath, zipContent);

console.log(`ZIP file created at: ${outputPath}`); 