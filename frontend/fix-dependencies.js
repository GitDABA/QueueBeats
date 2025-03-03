#!/usr/bin/env node

/**
 * This script specifically fixes issues with smooth-scrollbar and other problematic dependencies
 * It runs after the main install to patch any remaining issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting dependency fix script...');

// Function to run commands safely
const runCommand = (cmd) => {
  try {
    console.log(`Running: ${cmd}`);
    execSync(cmd, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error running command: ${cmd}`);
    console.error(error.message);
    return false;
  }
};

// Check if smooth-scrollbar exists in node_modules
const checkSmoothScrollbar = () => {
  const smoothScrollbarPath = path.join(__dirname, 'node_modules', 'smooth-scrollbar');
  if (!fs.existsSync(smoothScrollbarPath)) {
    console.log('smooth-scrollbar module not found, attempting to install it directly');
    return runCommand('npm install smooth-scrollbar@8.8.4 --no-save --legacy-peer-deps');
  }
  console.log('smooth-scrollbar module found');
  return true;
};

// Fix dependencies
const fixDependencies = () => {
  // First check if smooth-scrollbar is properly installed
  checkSmoothScrollbar();

  // Run npm dedupe to reduce duplicate packages
  runCommand('npm dedupe --legacy-peer-deps');

  // Check package.json and install any missing dependencies
  try {
    const packageJson = require('./package.json');
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    for (const [dep, version] of Object.entries(dependencies)) {
      const depPath = path.join(__dirname, 'node_modules', dep);
      if (!fs.existsSync(depPath)) {
        console.log(`Missing dependency: ${dep}@${version}, attempting to install`);
        runCommand(`npm install ${dep}@${version} --no-save --legacy-peer-deps`);
      }
    }
  } catch (error) {
    console.error('Error checking package.json:', error);
  }

  console.log('Dependency fix script completed');
};

// Run the fix
fixDependencies();
