// Simple Express server to build and serve our frontend
import express from 'express';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const clientDir = join(rootDir, 'client');
const distDir = join(rootDir, 'dist');

// Create our Express server 
const app = express();
const PORT = 5000;

console.log('Starting TubeSummarize app using Express to serve the frontend...');

// Build the app in production mode
function buildApp() {
  return new Promise((resolve, reject) => {
    console.log('Building the frontend application...');
    exec('npx vite build', { cwd: rootDir }, (error, stdout, stderr) => {
      if (error) {
        console.error('Build error:', error);
        console.error(stderr);
        reject(error);
        return;
      }
      console.log(stdout);
      resolve(stdout);
    });
  });
}

async function startServer() {
  try {
    // Build the app
    await buildApp();
    
    console.log('Build complete, serving static files...');
    
    // Serve static assets from the dist directory
    app.use(express.static(join(distDir, 'public')));
    
    // API endpoint for checking the server status
    app.get('/api/status', (req, res) => {
      res.json({ status: 'ok', mode: 'production' });
    });
    
    // For all other routes, serve the index.html (SPA fallback)
    app.get('*', (req, res) => {
      res.sendFile(join(distDir, 'public', 'index.html'));
    });
    
    // Start listening
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();