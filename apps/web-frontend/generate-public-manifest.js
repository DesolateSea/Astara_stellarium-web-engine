const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, basePath = '') {
    const files = [];
    try {
        const items = fs.readdirSync(dirPath);
        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const relativePath = basePath ? `${basePath}/${item}` : item;

            if (fs.statSync(fullPath).isDirectory()) {
                files.push(...getAllFiles(fullPath, relativePath));
            } else {
                files.push(relativePath);
            }
        }
    } catch (e) {
        console.error('Error reading directory:', e.message);
    }
    return files;
}

const publicPath = path.join(__dirname, 'public');
const allFiles = getAllFiles(publicPath);

const manifest = {
    generated: new Date().toISOString(),
    totalFiles: allFiles.length,
    files: allFiles
};

fs.writeFileSync(
    path.join(publicPath, 'file-manifest.json'),
    JSON.stringify(manifest, null, 2)
);

console.log(`Created file-manifest.json in public folder with ${allFiles.length} files`);
