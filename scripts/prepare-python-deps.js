// scripts/prepare-python-deps.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function directories that need Python dependencies
const pythonFunctionDirs = [
  'spotify-search',
  'songs-add',
  // Add other Python-based functions here
];

// Install Python dependencies for each function
pythonFunctionDirs.forEach(funcName => {
  const funcDir = path.join(__dirname, '../netlify/functions', funcName);
  if (fs.existsSync(funcDir)) {
    console.log(`Installing Python dependencies for ${funcName}`);
    const requirementsFile = path.join(funcDir, 'requirements.txt');
    
    if (fs.existsSync(requirementsFile)) {
      try {
        execSync(`pip install -r ${requirementsFile} --target ${funcDir}/deps`, 
          { stdio: 'inherit' });
        console.log(`Successfully installed dependencies for ${funcName}`);
      } catch (error) {
        console.error(`Error installing dependencies for ${funcName}:`, error.message);
      }
    } else {
      console.log(`No requirements.txt found for ${funcName}`);
    }
  } else {
    console.log(`Function directory not found: ${funcDir}`);
  }
});

console.log('Python dependencies preparation complete');
