const fs = require('fs');
const path = require('path');
function fixHtmlClasses(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixHtmlClasses(fullPath);
    } else if (fullPath.endsWith('.html') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      content = content.replace(/\[class\.([^\]]+)\]=\"([^\"]+)\"/g, (match, className, expr) => {
        if (className.includes('[') || className.includes(']') || className.includes('/') || className.includes('#')) {
           return `[ngClass]="{'${className}': ${expr}}"`;
        }
        return match;
      });
      
      fs.writeFileSync(fullPath, content);
    }
  });
}
fixHtmlClasses('C:/02 SISTEMAS/gastrosuite/frontend/src/app/shared/components');
