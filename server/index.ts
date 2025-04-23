// Frontend-only entry point wrapper for backward compatibility
// This file exists only to satisfy the existing workflow configuration
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const clientDir = join(rootDir, 'client');

console.log('Starting TubeSummarize in frontend-only mode...');
console.log('Root directory:', rootDir);
console.log('Client directory:', clientDir);

// Start a simple Express server to serve the frontend app
const app = express();

// Start Vite in development mode (as a child process)
const viteProcess = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '3000'], {
  stdio: 'pipe', // We'll capture and forward the output
  cwd: rootDir,
  env: {
    ...process.env,
    NODE_ENV: 'development',
  },
});

// Forward Vite output to console
viteProcess.stdout.on('data', (data) => {
  process.stdout.write(data);
});

viteProcess.stderr.on('data', (data) => {
  process.stderr.write(data);
});

// Set up simple health check endpoint
app.get('/health', (req, res) => {
  res.send({ status: 'ok', mode: 'frontend-only' });
});

// Proxy all other requests to Vite
app.all('*', (req, res) => {
  res.redirect(`http://localhost:3000${req.url}`);
});

// Start the Express server on port 5000
const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Express server running at http://localhost:${PORT}`);
  console.log(`Proxying requests to Vite server at http://localhost:3000`);
});

// Handle clean shutdown
const shutdown = () => {
  console.log('Shutting down...');
  viteProcess.kill();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);