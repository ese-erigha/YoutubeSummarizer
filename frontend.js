#!/usr/bin/env node

// Direct frontend-only entry point script
console.log('Starting frontend-only TubeSummarize app...');

import { execSync } from 'child_process';

try {
  // Run Vite directly from command line with all needed parameters
  execSync('npx vite --host 0.0.0.0', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
} catch (error) {
  console.error('Error starting Vite server:', error);
  process.exit(1);
}