const fs = require('fs');
const path = require('path');

function replaceColor(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.expo' && file !== 'dist') {
                replaceColor(fullPath);
            }
        } else {
            if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
                let content = fs.readFileSync(fullPath, 'utf8');
                if (content.match(/#2EBD85/ig)) {
                    content = content.replace(/#2EBD85/ig, '#D2B48C');
                    fs.writeFileSync(fullPath, content);
                    console.log(`Updated: ${fullPath}`);
                }
            }
        }
    });
}

replaceColor(path.join(__dirname, 'student-app'));
console.log('Done.');
