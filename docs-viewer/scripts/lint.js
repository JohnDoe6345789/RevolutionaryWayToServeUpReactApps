#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

function run(command) {
  try {
    execSync(command, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  } catch (error) {
    process.exit(1);
  }
}

console.log('Running ESLint...');
run('eslint . --max-warnings 0');

console.log('Running Prettier check...');
run('prettier --check "**/*.{ts,tsx,js,jsx,json,md}"');

console.log('Running TypeScript compiler...');
run('tsc --noEmit');

console.log('✓ All lint checks passed');
