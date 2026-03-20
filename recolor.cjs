const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('node_modules')) {
      results = results.concat(walk(file));
    } else if ((file.endsWith('.tsx') || file.endsWith('.ts')) && !file.includes('node_modules')) {
      results.push(file);
    }
  });
  return results;
}

const targetDirs = [
  'C:/Users/kritex/Herd/skeeme/student-app/app',
  'C:/Users/kritex/Herd/skeeme/student-app/components',
  'C:/Users/kritex/Herd/skeeme/student-app/lib'
];

let files = [];
targetDirs.forEach(dir => {
    if(fs.existsSync(dir)) files = files.concat(walk(dir));
});

let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Replace all hardcoded #D2B48C with #A1C4FD (case insensitive)
  content = content.replace(/#D2B48C/gi, '#A1C4FD');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedCount++;
  }
});

console.log('Replaced #D2B48C -> #A1C4FD in ' + changedCount + ' files.');
