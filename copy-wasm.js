import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// We need to find where sql.js is located. 
// It might be in node_modules/sql.js/dist/sql-wasm.wasm
const src = path.join(__dirname, 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
const destDir = path.join(__dirname, 'api');
const dest = path.join(destDir, 'sql-wasm.wasm');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

try {
    if (fs.existsSync(src)) {
        console.log(`Copying ${src} to ${dest}...`);
        fs.copyFileSync(src, dest);
        console.log('Done.');
    } else {
        console.warn(`Warning: source wasm file not found at ${src}. This is expected if dependencies are not yet installed.`);
    }
} catch (err) {
    console.error('Error copying wasm file:', err);
}
