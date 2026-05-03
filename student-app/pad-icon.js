const fs = require('fs');
const path = require('path');

// Try to load sharp, if it fails, we'll install it
let sharp;
try {
    sharp = require('sharp');
} catch (e) {
    console.error("Please install sharp by running: npm install sharp --no-save");
    process.exit(1);
}

async function processImage() {
    const inputPath = 'C:\\Users\\kritex\\Downloads\\icon-removebg-preview.png';
    const outputPath = 'C:\\Users\\kritex\\Herd\\skeeme\\student-app\\assets\\images\\adaptive-icon.png';

    if (!fs.existsSync(inputPath)) {
        console.error('ERROR: Input file not found:', inputPath);
        process.exit(1);
    }

    try {
        console.log("Processing image...");
        // Get dimensions
        const metadata = await sharp(inputPath).metadata();
        
        // Target inner size is 614x614 (60% of 1024)
        const targetSize = 614;
        const scale = Math.min(targetSize / metadata.width, targetSize / metadata.height);
        const newWidth = Math.round(metadata.width * scale);
        const newHeight = Math.round(metadata.height * scale);

        console.log(`Resizing inner logo to ${newWidth}x${newHeight}...`);

        await sharp(inputPath)
            .resize(newWidth, newHeight)
            .extend({
                top: Math.floor((1024 - newHeight) / 2),
                bottom: Math.ceil((1024 - newHeight) / 2),
                left: Math.floor((1024 - newWidth) / 2),
                right: Math.ceil((1024 - newWidth) / 2),
                background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent
            })
            .toFile(outputPath);
            
        console.log('✅ Successfully created padded adaptive-icon.png!');
    } catch (error) {
        console.error('Error processing image:', error);
    }
}

processImage();
