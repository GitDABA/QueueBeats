// Netlify Function adapter for FastAPI
import { createServerAdapter } from '@fastify/aws-lambda';
import fastify from 'fastify';
import axios from 'axios';
import { exec } from 'child_process';
import { join } from 'path';
import { promisify } from 'util';

// Add CORS support
const app = fastify({
  logger: true
});

// Add CORS support
app.register(require('@fastify/cors'), {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

// Start FastAPI server
let fastApiProcess;
let fastApiStarted = false;
const fastApiPort = 9000;

const startFastApi = async () => {
  if (fastApiStarted) return;
  
  try {
    const backendDir = join(__dirname, '../../');
    console.log(`Starting FastAPI in directory: ${backendDir}`);
    
    // Add the Python package installation dir to PYTHONPATH
    const depsPath = join(__dirname, '../deps');
    process.env.PYTHONPATH = `${depsPath}:${process.env.PYTHONPATH || ''}`;
    
    // Start FastAPI as a background process
    fastApiProcess = exec(
      `python -m uvicorn main:app --host 127.0.0.1 --port ${fastApiPort}`,
      { 
        cwd: backendDir,
        env: process.env
      }
    );
    
    // Log output
    fastApiProcess.stdout.on('data', (data) => console.log(`FastAPI: ${data}`));
    fastApiProcess.stderr.on('data', (data) => console.error(`FastAPI Error: ${data}`));
    
    // Wait for the server to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    fastApiStarted = true;
    console.log(`FastAPI started on port ${fastApiPort}`);
  } catch (error) {
    console.error('Failed to start FastAPI:', error);
    throw error;
  }
};

// Route all requests to FastAPI
app.route({
  method: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  url: '/*',
  handler: async (request, reply) => {
    try {
      // Start FastAPI server if not already running
      await startFastApi();
      
      // Build the URL for the FastAPI endpoint
      const url = `http://localhost:${fastApiPort}${request.url}`;
      
      // Forward the request to FastAPI
      const response = await axios({
        method: request.method,
        url: url,
        headers: request.headers,
        data: request.body,
        validateStatus: () => true // Accept any status code
      });
      
      // Set response status and headers
      reply.status(response.status);
      
      // Set CORS headers explicitly
      reply.header('Access-Control-Allow-Origin', '*');
      reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      // Copy other headers
      Object.entries(response.headers).forEach(([key, value]) => {
        if (key.toLowerCase() !== 'content-length') {
          reply.header(key, value);
        }
      });
      
      // Return the response body
      return response.data;
    } catch (error) {
      console.error('Error interfacing with FastAPI:', error);
      return reply.status(500).send({ 
        error: 'Internal Server Error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
});

// Create Lambda handler
const handler = createServerAdapter(app);

// Cleanup on process exit
process.on('exit', () => {
  if (fastApiProcess) {
    console.log('Shutting down FastAPI process');
    fastApiProcess.kill();
  }
});

export { handler };
