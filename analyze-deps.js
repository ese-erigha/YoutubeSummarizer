#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const dependencies = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies
};

// Get all TypeScript and JavaScript files
const findCommand = "find . -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' | grep -v 'node_modules' | grep -v 'dist'";
const files = execSync(findCommand).toString().trim().split('\n');

// Extract all imports
const importRegex = /import\s+.*?(?:from\s+['"]([^'"@][^'"]*?)['"]|from\s+['"](@[^/'"]+\/[^/'"]+).*?['"])/g;
const usedPackages = new Set();

// Loop through files and extract imports
files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const packageName = match[1] || match[2];
      if (packageName) {
        // Extract base package name (remove relative paths, strip version numbers)
        const baseName = packageName.split('/')[0];
        if (!baseName.startsWith('.') && !baseName.startsWith('@')) {
          usedPackages.add(baseName);
        } else if (baseName.startsWith('@')) {
          // Handle scoped packages like @angular/core
          usedPackages.add(packageName.split('/').slice(0, 2).join('/'));
        }
      }
    }
  } catch (err) {
    console.error(`Error reading file ${file}:`, err);
  }
});

// Add essential packages that might not be directly imported
const essentialPackages = [
  'react', 
  'react-dom', 
  'typescript', 
  'express', 
  'openai',
  'youtube-transcript',
  'zod',
  '@tanstack/react-query',
  'body-parser',
  'tailwindcss'
];

essentialPackages.forEach(pkg => usedPackages.add(pkg));

// Check which packages are not used
const unusedDependencies = Object.keys(dependencies).filter(dep => {
  // Extract the base package name
  const baseName = dep.startsWith('@') 
    ? dep.split('/').slice(0, 2).join('/')
    : dep.split('/')[0];
  
  return !Array.from(usedPackages).some(used => {
    return used === baseName || baseName.includes(used) || used.includes(baseName);
  });
});

console.log('Used packages:');
console.log(Array.from(usedPackages).sort().join('\n'));

console.log('\nPotential unused dependencies:');
console.log(unusedDependencies.sort().join('\n'));

console.log('\nNote: This is an automated analysis and might not be 100% accurate.');
console.log('Please review the list before removing any dependencies.');