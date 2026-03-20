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
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const targetDirs = [
  'C:/Users/kritex/Herd/skeeme/student-app/app',
  'C:/Users/kritex/Herd/skeeme/student-app/components'
];

let files = [];
targetDirs.forEach(dir => {
    if(fs.existsSync(dir)) files = files.concat(walk(dir));
});

const replacements = {
  // Typography
  'text-[48px]': 'text-[36px]',
  'text-[42px]': 'text-[32px]',
  'text-[32px]': 'text-[26px]',
  'text-[26px]': 'text-[22px]',
  'text-[24px]': 'text-[20px]',
  'text-[20px]': 'text-[18px]',
  'text-[18px]': 'text-[16px]',
  'text-[17px]': 'text-[15px]',
  'text-[16px]': 'text-[15px]',
  'text-[15px]': 'text-[14px]',
  'text-[14px]': 'text-[13px]',
  'text-[13px]': 'text-[12px]',
  'text-[12px]': 'text-[11px]',
  'text-3xl': 'text-2xl',
  'text-2xl': 'text-xl',
  'text-xl': 'text-lg',
  
  // Height & Widths
  'h-[64px]': 'h-[56px]',
  'h-[60px]': 'h-[52px]',
  'h-[56px]': 'h-[48px]',
  'h-[50px]': 'h-[44px]',
  'w-[50px]': 'w-[44px]',
  'size-20': 'size-16',
  'size-16': 'size-14',
  'size-14': 'size-12',
  'size-12': 'size-10',
  'size-11': 'size-10',
  'size-10': 'size-9',
  
  // Border Radius
  'rounded-[40px]': 'rounded-[28px]',
  'rounded-[32px]': 'rounded-[24px]',
  'rounded-3xl': 'rounded-2xl',
  'rounded-2xl': 'rounded-xl',
  'rounded-xl': 'rounded-lg',
  
  // Padding
  'p-10': 'p-8',
  'p-8': 'p-6',
  'p-6': 'p-5',
  'p-5': 'p-4',
  'px-8': 'px-6',
  'px-6': 'px-5',
  'py-10': 'py-8',
  'py-8': 'py-6',
  'py-6': 'py-5',
  'py-5': 'py-4',
  'pt-20': 'pt-16',
  'pb-10': 'pb-8',
  'pb-8': 'pb-6',
  'pb-6': 'pb-5',
  
  // Margins
  'mb-12': 'mb-10',
  'mb-10': 'mb-8',
  'mb-8': 'mb-6',
  'mb-6': 'mb-5',
  'mt-12': 'mt-10',
  'mt-10': 'mt-8',
  'mt-8': 'mt-6',
  'mt-6': 'mt-5',
  
  // Line height & Tracking
  'leading-[48px]': 'leading-[38px]',
  'tracking-[0.2em]': 'tracking-widest'
};

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
}

const keys = Object.keys(replacements).sort((a,b) => b.length - a.length);
const regexStr = keys.map(escapeRegExp).join('|');

const regex = new RegExp(`(^|[\\s"'\`])(${regexStr})(?=[\\s"'\`]|$)`, 'g');

let changedCount = 0;

files.forEach(file => {
  if (file.includes('node_modules')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  content = content.replace(regex, (fullMatch, g1, g2) => {
      return g1 + replacements[g2];
  });
  
  // Special exception: Ionicons sizing
  content = content.replace(/<Ionicons([^>]*?)size=\{24\}/g, '<Ionicons$1size={20}');
  content = content.replace(/<Ionicons([^>]*?)size=\{22\}/g, '<Ionicons$1size={18}');
  content = content.replace(/<Ionicons([^>]*?)size=\{20\}/g, '<Ionicons$1size={18}');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedCount++;
  }
});

console.log(`Successfully refined sizing in ${changedCount} files.`);
