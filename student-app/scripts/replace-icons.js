const fs = require('fs');
const path = require('path');
const glob = require('glob'); // Note: we'll just use a simple recursive read since glob might not be installed, wait we can just recursively read dirs.

const SRC_DIR = path.join(__dirname, '../');

const iconMap = {
  'AltArrowLeft': 'arrow-left',
  'AltArrowRight': 'arrow-right',
  'Fire': 'sparkle-ai-01',
  'MedalRibbonStar': 'award-medal',
  'MedalRibbonsStar': 'award-medal',
  'Stars': 'award-medal',
  'CupStar': 'award-medal',
  'Star': 'award-medal',
  'CheckCircle': 'check-tick-circle',
  'Eye': 'photo-image-default', // placeholder mapped
  'EyeClosed': 'lock-close', // placeholder mapped
  'DangerTriangle': 'troubleshoot',
  'Danger': 'troubleshoot',
  'CloseCircle': 'multiple-cross-cancel-circle',
  'RoundArrowUp': 'arrow-up',
  'Forward': 'arrow-right',
  'Cloud': 'upload-up',
  'CloudCross': 'download-down',
  'Letter': 'envelope-default',
  'Key': 'key-left',
  'DocumentText': 'file-default',
  'Download': 'download-down',
  'Compass': 'map',
  'Home': 'home-simple',
  'Bell': 'notification-bell-on',
  'Checklist': 'check-tick-square',
  'User': 'user-default',
  'CameraAdd': 'photo-image-plus',
  'Gallery': 'photo-image-default',
  'QuestionCircle': 'troubleshoot',
  'InfoCircle': 'troubleshoot',
  'Bolt': 'sparkle-ai-01',
  'Scanner': 'search-big',
  'List': 'sidebar-menu',
  'MenuDotsCircle': 'sidebar-menu',
  'PlayCircle': 'arrow-right',
  'TrashBinTrash': 'delete-dustbin-01',
  'Book': 'file-02-default',
  'Notebook': 'file-02-default',
  'Copy': 'copy-default',
  'CloudUpload': 'upload-up',
  'Leaf': 'award-medal',
  'LightbulbBolt': 'sparkle-ai-01',
  'Rocket': 'ufo',
  'Refresh': 'arrow-down', // generic
  'Share': 'send-plane-horizontal',
  'Like': 'user-love-heart',
  'Dislike': 'minus-circle',
  'Diploma': 'award-medal',
  'Case': 'briefcase-job',
  'Stopwatch': 'clock-default',
  'Settings': 'settings-01',
  'Heart': 'user-love-heart',
  'Layers': 'layer-two',
  'MagicStick': 'sparkle-ai-01',
  'Lightbulb': 'sparkle-ai-01',
  'UsersGroupRounded': 'user-circle',
  'FolderOpen': 'folder-default'
};

const getAllFiles = (dirPath, arrayOfFiles) => {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach((file) => {
    if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
      if (file !== 'node_modules' && file !== '.expo' && file !== 'assets') {
        arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
      }
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        arrayOfFiles.push(path.join(dirPath, file));
      }
    }
  });
  return arrayOfFiles;
};

const files = getAllFiles(SRC_DIR);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const solarImportRegex = /import\s+\{([^}]+)\}\s+from\s+['"]@solar-icons\/react-native\/Bold['"];?/g;
  
  let match;
  while ((match = solarImportRegex.exec(content)) !== null) {
    const importBlock = match[0];
    const importedIcons = match[1].split(',').map(s => s.trim()).filter(s => s);
    
    let unmappedIcons = [];
    let mappedImports = [];

    importedIcons.forEach(icon => {
      if (iconMap[icon]) {
        mappedImports.push(`import ${icon} from '@/assets/icons/pikaicons/${iconMap[icon]}.svg';`);
      } else {
        unmappedIcons.push(icon);
      }
    });

    let replacement = mappedImports.join('\n');
    if (unmappedIcons.length > 0) {
      if (replacement.length > 0) replacement += '\n';
      replacement += `import { ${unmappedIcons.join(', ')} } from '@solar-icons/react-native/Bold';`;
    }

    content = content.replace(importBlock, replacement);
    changed = true;
  }

  // Next, replace <Icon size={24} ... /> with <Icon width={24} height={24} ... />
  // We'll do a simple regex for tags that start with any of the mapped icon names
  if (changed) {
    Object.keys(iconMap).forEach(icon => {
      // Find <Icon ... size={XX} ... /> or <Icon ... size={XX} ...></Icon>
      // Using regex to replace size={value} with width={value} height={value}
      const tagRegex = new RegExp(`<${icon}\\s+([^>]*?)size=\\{([^}]+)\\}([^>]*?)>`, 'g');
      content = content.replace(tagRegex, `<${icon} $1width={$2} height={$2}$3>`);
      
      const tagRegexStr = new RegExp(`<${icon}\\s+([^>]*?)size=(['"][^'"]+['"])([^>]*?)>`, 'g');
      content = content.replace(tagRegexStr, `<${icon} $1width=$2 height=$2$3>`);
    });
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
console.log('Done replacing icons.');
