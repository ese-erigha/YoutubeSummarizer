// Simple script to start the Vite development server
// Execute with: NODE_ENV=development node start.js
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Start Vite dev server
console.log('Starting Vite development server...');

const viteProcess = spawn('npx', ['vite'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development'
  },
  cwd: __dirname
});

viteProcess.on('close', (code) => {
  console.log(`Vite process exited with code ${code}`);
  process.exit(code);
});

// Handle termination signals
process.on('SIGINT', () => {
  console.log('Received SIGINT signal. Shutting down Vite server...');
  viteProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal. Shutting down Vite server...');
  viteProcess.kill('SIGTERM');
});