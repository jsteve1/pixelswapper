const glob = require("tiny-glob");
const path = require('path');
const fs = require('fs');

function hash(value) {
  let hash = 5381;
  let i = value.length;
  if (typeof value === "string") {
    while (i) hash = (hash * 33) ^ value.charCodeAt(--i);
  } else {
    while (i) hash = (hash * 33) ^ value[--i];
  }
  return (hash >>> 0).toString(36);
}

async function removeInlineScript(directory) {
  console.log("Removing Inline Scripts");
  const scriptRegx = /<script>([\s\S]+)<\/script>/;
  const files = await glob("**/*.{html}", {
    cwd: directory,
    dot: true,
    absolute: false,
    filesOnly: true,
  });
  
  files.forEach((file) => {
    const fullPath = path.join(directory, file);
    console.log(`Processing file: ${fullPath}`);
    const f = fs.readFileSync(fullPath, { encoding: 'utf-8' });
    
    const script = f.match(scriptRegx);
    if (script && script[1]) {
      const inlineContent = script[1]
        .replace('__sveltekit', 'const __sveltekit')
        .replace('document.currentScript.parentElement', 'document.body.firstElementChild')
        .replace(/\/app\//g, './app/');
      const fn = `script-${hash(inlineContent)}.js`;
      const newHtml = f.replace(scriptRegx, `<script type="module" src="./${fn}" defer></script>`)
        .replace(/href="\/app\//g, 'href="./app/');
      fs.writeFileSync(fullPath, newHtml);
      fs.writeFileSync(path.join(directory, fn), inlineContent);
      console.log(`Inline script extracted and saved at: ${path.join(directory, fn)}`);
    }
  });
}

removeInlineScript(path.resolve(__dirname, '../build')); 