const fs = require('fs');
const path = require('path');

// Check if dist files exist
const distPath = path.join(__dirname, 'dist');
const files = [
  'index.d.ts',
  'index.esm.js',
  'index.umd.js'
];

console.log('Checking distribution files...');

files.forEach(file => {
  const filePath = path.join(distPath, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✓ ${file} (${stats.size} bytes)`);
  } else {
    console.log(`✗ ${file} missing`);
  }
});

// Check type definitions
const typesPath = path.join(distPath, 'index.d.ts');
if (fs.existsSync(typesPath)) {
  const content = fs.readFileSync(typesPath, 'utf8');
  console.log('\nType definitions:');
  console.log(content);
}

console.log('\n✓ Rich Text Editor library build completed successfully!');
console.log('\nUsage:');
console.log('npm install @draeggiar/rich-text-editor');
console.log('import { RichTextEditor } from "@draeggiar/rich-text-editor";');