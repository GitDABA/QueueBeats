const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3336;

// Add CORS support
app.use(cors());
app.use(express.json());

// Start FastAPI server as a child process
const startFastAPI = () => {
  console.log('Starting FastAPI server...');
  const pythonProcess = spawn('python', ['-m', 'uvicorn', 'main:app', '--reload', '--host', '127.0.0.1', '--port', '8000'], {
    cwd: path.join(__dirname),
    env: process.env,
    stdio: 'inherit'
  });

  pythonProcess.on('close', (code) => {
    console.log(`FastAPI server exited with code ${code}`);
    if (code !== 0) {
      console.log('Attempting to restart FastAPI server in 5 seconds...');
      setTimeout(startFastAPI, 5000);
    }
  });

  // Handle Express server shutdown
  process.on('SIGINT', () => {
    console.log('Shutting down FastAPI server...');
    pythonProcess.kill();
    process.exit(0);
  });
};

// Start the FastAPI server
startFastAPI();

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// Proxy all other requests to FastAPI
app.use('*', (req, res) => {
  res.status(404).json({ 
    status: 'error', 
    message: 'Route not found on Express server. Try accessing the FastAPI server directly at http://localhost:8000' 
  });
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
  console.log(`FastAPI server should be available at http://localhost:8000`);
});
