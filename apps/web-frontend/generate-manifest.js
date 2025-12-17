const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, basePath = '') {
    const files = [];
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
    return files;
}

const distPath = path.join(__dirname, 'dist');
const allFiles = getAllFiles(distPath);

// Write manifest
const manifest = {
    generated: new Date().toISOString(),
    totalFiles: allFiles.length,
    files: allFiles
};

fs.writeFileSync(
    path.join(distPath, 'file-manifest.json'),
    JSON.stringify(manifest, null, 2)
);

console.log(`Generated file-manifest.json with ${allFiles.length} files`);
