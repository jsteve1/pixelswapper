import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import glob from 'tiny-glob';

const buildDir = path.resolve('build');

async function processHtmlFiles() {
  const htmlFiles = await glob('**/*.html', { cwd: buildDir });
  
  for (const htmlFile of htmlFiles) {
    const filePath = path.join(buildDir, htmlFile);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find inline scripts
    const scriptRegex = /<script>([\s\S]*?)<\/script>/g;
    let match;
    let index = 0;
    
    while ((match = scriptRegex.exec(content)) !== null) {
      const inlineScript = match[1];
      const hash = crypto.createHash('sha256').update(inlineScript).digest('hex').slice(0, 8);
      const scriptFileName = `script-${hash}.js`;
      const scriptPath = path.join(buildDir, scriptFileName);
      
      // Write the script to an external file
      fs.writeFileSync(scriptPath, inlineScript);
      console.log(`✔ Inline script extracted and saved at: ${scriptFileName}`);
      
      // Replace inline script with reference to external file
      content = content.replace(
        match[0],
        `<script src="${scriptFileName}" type="module"></script>`
      );
    }
    
    // Write modified HTML back
    fs.writeFileSync(filePath, content);
  }
}

try {
  await processHtmlFiles();
} catch (error) {
  console.error('Error processing HTML files:', error);
  process.exit(1);
} 