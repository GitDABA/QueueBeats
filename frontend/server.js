import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { createRequire } from 'module';
import { spawn } from 'child_process';

const require = createRequire(import.meta.url);
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') });

// Instead of running our own Express server, let's use Vite's dev server
// which handles module loading and MIME types correctly
console.log('Starting Vite development server...');

// Use FRONTEND_PORT from .env or fallback to 5173
const port = parseInt(process.env.FRONTEND_PORT || '5173', 10);

// Start Vite dev server
const vite = spawn('npx', ['vite'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    VITE_API_URL: process.env.VITE_API_URL || 'http://localhost:8001',
    PORT: port.toString()
  }
});

vite.on('error', (error) => {
  console.error('Failed to start Vite server:', error);
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
  vite.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  vite.kill();
  process.exit(0);
});
