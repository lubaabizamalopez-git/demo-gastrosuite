const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('C:/02 SISTEMAS/gastrosuite/extracted_docx_fixed.txt', 'utf8');
const lines = content.split('\n');

let currentFile = null;
let currentCode = [];
let isCapturing = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].replace(/\r$/, '');
  
  // Detect file path comments like "// component/shared/button/button.component.ts"
  // or "<!-- component/shared/button/button.component.html -->"
  const tsMatch = line.match(/\/\/\s*component\/shared\/([a-zA-Z0-9-]+\/[a-zA-Z0-9-]+\.component\.ts)/);
  const htmlMatch = line.match(/<!--\s*component\/shared\/([a-zA-Z0-9-]+\/[a-zA-Z0-9-]+\.component\.html)\s*-->/);
  
  if (tsMatch || htmlMatch) {
    if (isCapturing && currentFile) {
      // Save previous file
      saveFile(currentFile, currentCode.join('\n'));
    }
    
    currentFile = (tsMatch || htmlMatch)[1];
    currentCode = [];
    isCapturing = true;
    continue;
  }
  
  // Stop capturing if we hit a separator or language markdown
  if (isCapturing && (line.includes('-----') || line.includes('Usa el cdigo') || line.includes('Usa el código'))) {
    saveFile(currentFile, currentCode.join('\n'));
    isCapturing = false;
    currentFile = null;
    continue;
  }
  
  if (isCapturing) {
    currentCode.push(line);
  }
}

if (isCapturing && currentFile) {
  saveFile(currentFile, currentCode.join('\n'));
}

function saveFile(relPath, code) {
  // Fix weird character encoding issues for ó, ñ, í, etc.
  code = code.replace(/Botn/g, 'Botón')
             .replace(/tamaos/g, 'tamaños')
             .replace(/Asignacin/g, 'Asignación')
             .replace(/administracin/g, 'administración')
             .trim();
             
  const fullPath = path.join('C:/02 SISTEMAS/gastrosuite/frontend/src/app/shared/components', relPath);
  const dir = path.dirname(fullPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(fullPath, code, 'utf8');
  console.log('Saved:', fullPath);
}
