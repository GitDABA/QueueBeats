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

// Check if Material UI modules exist
const checkMaterialUI = () => {
  const materialUIIconsPath = path.join(__dirname, 'node_modules', '@material-ui', 'icons');
  const materialUICorePath = path.join(__dirname, 'node_modules', '@material-ui', 'core');
  
  let allFound = true;
  
  if (!fs.existsSync(materialUIIconsPath)) {
    console.log('@material-ui/icons module not found, attempting to install it directly');
    allFound = runCommand('npm install @material-ui/icons@4.11.3 --no-save --legacy-peer-deps') && allFound;
  } else {
    console.log('@material-ui/icons module found');
  }
  
  if (!fs.existsSync(materialUICorePath)) {
    console.log('@material-ui/core module not found, attempting to install it directly');
    allFound = runCommand('npm install @material-ui/core@4.12.4 --no-save --legacy-peer-deps') && allFound;
  } else {
    console.log('@material-ui/core module found');
  }
  
  return allFound;
};

// Fix dependencies
const fixDependencies = () => {
  // First check if smooth-scrollbar is properly installed
  checkSmoothScrollbar();
  
  // Check if Material UI modules are properly installed
  checkMaterialUI();

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
