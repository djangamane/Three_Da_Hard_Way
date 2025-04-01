const fs = require('fs');
const path = require('path');

console.log('Running postinstall script to prepare text files...');

// Source directory containing the lecture text files
const sourceDir = path.join(__dirname, '..', 'components', 'scholarship');

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, '..', 'assets', 'texts');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
  console.log(`Created directory: ${assetsDir}`);
}

// Check if source directory exists
if (!fs.existsSync(sourceDir)) {
  console.error(`Error: Source directory ${sourceDir} does not exist!`);
  process.exit(1);
}

// List all text files in the source directory
try {
  const files = fs.readdirSync(sourceDir);
  
  // Copy each .txt file to assets directory
  let copiedCount = 0;
  
  for (const file of files) {
    if (file.endsWith('.txt')) {
      const sourcePath = path.join(sourceDir, file);
      const destPath = path.join(assetsDir, file);
      
      // Read the file
      const content = fs.readFileSync(sourcePath, 'utf8');
      
      // Write to the destination
      fs.writeFileSync(destPath, content, 'utf8');
      
      console.log(`Copied: ${file}`);
      copiedCount++;
    }
  }
  
  console.log(`Successfully copied ${copiedCount} text files.`);
} catch (error) {
  console.error('Error processing text files:', error);
  process.exit(1);
}

console.log('Postinstall script completed successfully.'); 