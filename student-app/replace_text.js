const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('./app').concat(walk('./components'));
let modified = 0;

files.forEach(file => {
  if (file.replace(/\\/g, '/').includes('components/ui/Text.tsx')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes("import { Text } from '@/components/ui/Text'")) return;
  
  // Find the react-native import line
  const lines = content.split('\n');
  let newLines = [];
  let modifiedFile = false;
  let addedImport = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line.includes('from \'react-native\'') || line.includes('from "react-native"')) {
      if (line.includes('Text')) {
        // String replacements to remove Text carefully
        line = line.replace(/,\s*Text\s*,/g, ',');
        line = line.replace(/{\s*Text\s*,/g, '{ ');
        line = line.replace(/,\s*Text\s*}/g, ' }');
        // If it was the only import left
        line = line.replace(/{\s*Text\s*}/g, '{}');
        line = line.replace(/import\s*{}\s*from\s*['"]react-native['"];?/, '');
        
        if (!addedImport) {
          newLines.unshift("import { Text } from '@/components/ui/Text';");
          addedImport = true;
        }
        modifiedFile = true;
      }
    }
    if (line.trim() !== '' || !line.includes('react-native')) {
        newLines.push(line);
    } else if (line.trim() === '') {
        newLines.push(line);
    }
  }

  if (modifiedFile) {
    fs.writeFileSync(file, newLines.join('\n'));
    modified++;
    console.log('Modified: ' + file);
  }
});

console.log('Total files modified: ' + modified);
