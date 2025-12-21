const fs = require('fs');
const path = require('path');

const sourceDir = path.resolve(__dirname, '../../test-skydata');
const targetDir = path.resolve(__dirname, '../dist/skydata');

function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach((childItemName) => {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

try {
    if (fs.existsSync(sourceDir)) {
        console.log(`Copying skydata from ${sourceDir} to ${targetDir}...`);
        copyRecursiveSync(sourceDir, targetDir);
        console.log('Copy complete!');
    } else {
        console.log('test-skydata directory not found, skipping copy.');
    }
} catch (err) {
    console.error('Error copying skydata:', err.message);
}
