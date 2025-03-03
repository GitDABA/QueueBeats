// Utility to load environment variables for Netlify Functions
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Helper to find the location of the .env file
function findEnvFile() {
  const rootDir = path.resolve(__dirname, '../../..');
  
  // Priority order for env files
  const envFiles = [
    path.join(rootDir, '.env.netlify'),
    path.join(rootDir, '.env'),
    path.join(rootDir, '.env.fixed'),
    path.join(rootDir, '.env.example')
  ];
  
  // Return the first file that exists
  for (const file of envFiles) {
    if (fs.existsSync(file)) {
      return file;
    }
  }
  
  // If no file found, return the default path (even if it doesn't exist)
  return path.join(rootDir, '.env');
}

// Load environment variables
function loadEnv() {
  const envFile = findEnvFile();
  console.log(`Loading environment from: ${envFile}`);
  
  const result = dotenv.config({ path: envFile });
  
  if (result.error) {
    console.warn(`Warning: Could not load environment from ${envFile}:`, result.error);
    return false;
  }
  
  return true;
}

module.exports = { loadEnv };
