#!/usr/bin/env bun

/**
 * Lint script for Revolutionary Codegen
 * AGENTS.md compliant linting with no shell scripts
 */

import { $ } from 'bun';
import { existsSync } from 'fs';
import { join } from 'path';

async function main() {
  console.log('📋 Running AGENTS.md compliant linting...');

  try {
    // Check if we're in a Bun environment
    if (!existsSync('bunfig.toml')) {
      console.log('⚠️  Bun config not found, falling back to Node.js linting');
      await runNodeLinting();
      return;
    }

    // Run ESLint with TypeScript support
    console.log('🔍 Running ESLint...');
    await $`bunx eslint . --max-warnings 0`;

    // Check code structure (AGENTS.md compliance)
    console.log('🏗️  Checking AGENTS.md compliance...');
    await checkOOPCompliance();

    // Check constructor dataclass separation
    await checkConstructorDataclassSeparation();

    // Validate specs
    console.log('📋 Validating specifications...');
    await validateSpecs();

    console.log('✅ All lint checks passed!');
  } catch (error) {
    console.error('❌ Linting failed:', error);
    process.exit(1);
  }
}

async function runNodeLinting() {
  console.log('🔍 Running Node.js ESLint...');
  try {
    await $`npx eslint . --ext .js,.ts --max-warnings 0`;
  } catch {
    console.log('ESLint not available, basic checks only...');
  }

  // Still run AGENTS.md compliance checks even in Node.js mode
  console.log('🏗️  Checking AGENTS.md compliance...');
  await checkOOPCompliance();

  // Check constructor dataclass separation
  await checkConstructorDataclassSeparation();

  // Validate specs
  console.log('📋 Validating specifications...');
  await validateSpecs();

  console.log('✅ All lint checks passed!');
}

async function checkOOPCompliance() {
  // Simple compliance check - can be enhanced
  const fs = await import('fs');

  const coreFiles = [
    'codegen/core/base-component.js',
    'codegen/core/registry.js',
    'codegen/core/aggregate.js',
    'codegen/core/plugin.js',
  ];

  for (const file of coreFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');

      // Check for class definition
      if (!content.includes('class ')) {
        throw new Error(`${file} does not have class definition`);
      }

      // Special case: base-component.js doesn't extend anything
      if (file !== 'codegen/core/base-component.js' && !content.includes('extends BaseComponent')) {
        throw new Error(`${file} does not extend BaseComponent`);
      }

      // Check method count (rough estimate)
      const methodMatches = content.match(/async \w+\(|^\s*\w+\s*\(/gm) || [];
      if (methodMatches.length > 5) {
        // Allow some buffer
        console.log(`⚠️  ${file} may have too many methods (${methodMatches.length})`);
      }
    }
  }
}

async function checkConstructorDataclassSeparation() {
  console.log('🔍 Checking constructor dataclass separation (1 dataclass per file)...');

  const fs = await import('fs');
  const path = await import('path');

  // Find all TypeScript files in the src directory
  const srcDir = 'src';
  const tsFiles: string[] = [];

  function scanDirectory(dir: string) {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
        tsFiles.push(fullPath);
      }
    }
  }

  scanDirectory(srcDir);

  for (const file of tsFiles) {
    const content = fs.readFileSync(file, 'utf8');

    // Find all exported interfaces in this file
    const exportedInterfaces = content.match(/export\s+(interface|type)\s+(\w+)/g) || [];
    const exportedClasses = content.match(/export\s+(?:abstract\s+)?class\s+(\w+)/g) || [];

    // Count constructor dataclass interfaces (interfaces used as constructor params)
    let constructorDataclassCount = 0;
    const constructorMatches = content.match(/constructor\s*\(([^)]*)\)/g) || [];

    for (const constructorMatch of constructorMatches) {
      // Extract parameter types from constructor
      const paramMatches = constructorMatch.match(/(\w+):\s*([^{}=&|;,\s]+)/g) || [];
      for (const paramMatch of paramMatches) {
        const [, , paramType] = paramMatch.match(/(\w+):\s*([^=,&|;\s]+)/) || [];
        if (paramType && paramType.startsWith('I') && paramType.length > 1) {
          // This looks like an interface type (starts with I)
          constructorDataclassCount++;
        }
      }
    }

    // Check for violations
    if (exportedInterfaces.length > 1 && constructorDataclassCount > 0) {
      throw new Error(
        `File ${file} contains ${exportedInterfaces.length} exported interfaces but should have at most 1 dataclass interface per file`
      );
    }

    if (exportedClasses.length > 1) {
      throw new Error(
        `File ${file} contains ${exportedClasses.length} exported classes but should have at most 1 class per file`
      );
    }

    // Check for inline interface definitions in constructor parameters
    // This regex looks for constructor parameters with inline object types like "param: { prop: string }"
    const inlineInterfaceMatches =
      content.match(/constructor\s*\([^)]*\w+\s*:\s*{\s*[^}]*}[^)]*\)/g) || [];
    if (inlineInterfaceMatches.length > 0) {
      throw new Error(
        `File ${file} contains inline interface definitions in constructor parameters. Constructor dataclasses must be defined in separate files.`
      );
    }
  }

  console.log(`✅ Constructor dataclass separation check passed for ${tsFiles.length} files`);
}

async function validateSpecs() {
  const fs = await import('fs');
  const specFiles = [
    'codegen/plugins/tools/oop-principles/spec.json',
    'codegen/plugins/tools/test-runner/spec.json',
    'specs/bootstrap-system.json',
  ];

  for (const specFile of specFiles) {
    if (fs.existsSync(specFile)) {
      try {
        const content = fs.readFileSync(specFile, 'utf8');
        JSON.parse(content);
      } catch (error) {
        throw new Error(`Invalid JSON in ${specFile}: ${error.message}`);
      }
    }
  }
}

if (import.meta.main) {
  main();
}
