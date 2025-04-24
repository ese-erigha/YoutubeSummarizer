#!/usr/bin/env node

import fs from 'fs';
import { execSync } from 'child_process';

// Read package.json
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const dependencies = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
  ...packageJson.optionalDependencies
};

// Find all source files
const files = execSync("find . -type f -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' | grep -v node_modules | grep -v dist")
  .toString()
  .trim()
  .split('\n');

// Regex to match imports
const importRegex = /import\s+.*?(?:from\s+['"]([^'"@][^'"]*?)['"]|from\s+['"](@[^/'"]+\/[^/'"]+).*?['"])/g;
const usedPackages = new Set();

// Core packages that are always needed
const corePackages = [
  'react',
  'react-dom',
  'express',
  'openai',
  'youtube-transcript',
  'zod',
  'tailwindcss',
  'typescript',
  'tsx',
  'vite',
  '@vitejs/plugin-react',
  'esbuild',
  'body-parser',
  '@tanstack/react-query'
];

// Add core packages
corePackages.forEach(pkg => usedPackages.add(pkg));

// Process each file to find imported packages
files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const packageName = match[1] || match[2];
      if (packageName && !packageName.startsWith('.')) {
        // Extract root package name (e.g., '@radix-ui/react-accordion' -> '@radix-ui/react-accordion')
        const parts = packageName.split('/');
        
        if (packageName.startsWith('@') && parts.length > 1) {
          // For scoped packages, use the first two parts
          usedPackages.add(`${parts[0]}/${parts[1]}`);
        } else {
          // For regular packages, use the first part
          usedPackages.add(parts[0]);
        }
      }
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

// List unused packages
const unusedPackages = [];
for (const [pkg, version] of Object.entries(dependencies)) {
  // Extract the base package name
  const baseName = pkg.startsWith('@') ? 
    pkg.split('/').slice(0, 2).join('/') : 
    pkg.split('/')[0];
  
  if (!Array.from(usedPackages).some(used => 
    used === baseName || 
    baseName.includes(used) || 
    used.includes(baseName))) {
    unusedPackages.push(pkg);
  }
}

console.log('Used packages:');
console.log(Array.from(usedPackages).sort().join('\n'));

console.log('\nPotentially unused packages:');
console.log(unusedPackages.sort().join('\n'));

console.log('\nTotal used packages:', usedPackages.size);
console.log('Total potential unused packages:', unusedPackages.length);
console.log('\nNote: This analysis might miss dynamically imported packages or dependencies used by other packages.');