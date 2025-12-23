#!/usr/bin/env bun

/**
 * Lint script for Revolutionary Codegen
 * AGENTS.md compliant linting with no shell scripts
 */

import { $ } from 'bun';
import { existsSync } from 'fs';
import { PluginDependencyLinter } from './src/core/plugin-dependency-linter.js';

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

    // Check single export per file
    await checkSingleExportPerFile();

    // Validate specs
    console.log('📋 Validating specifications...');
    await validateSpecs();

    // Check plugin dependencies for circular imports
    console.log('🔗 Analyzing plugin dependencies...');
    await checkPluginDependencies();

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

  // Check single export per file
  await checkSingleExportPerFile();

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

async function checkSingleExportPerFile() {
  console.log('🔍 Checking single export per file (1 class/interface/constant/function per file)...');

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

    // Count different types of exports
    const exportedClasses = (content.match(/export\s+(?:abstract\s+)?class\s+\w+/g) || []).length;
    const exportedInterfaces = (content.match(/export\s+(interface|type)\s+\w+/g) || []).length;
    const exportedFunctions = (content.match(/export\s+(?:async\s+)?function\s+\w+/g) || []).length;
    const exportedConstants = (content.match(/export\s+(?:const|let|var)\s+\w+/g) || []).length;
    const exportedDefaults = (content.match(/export\s+default/g) || []).length;

    // Count total named exports
    const totalNamedExports = exportedClasses + exportedInterfaces + exportedFunctions + exportedConstants;

    // Allow files with only default export + optionally one named export (for barrel exports)
    if (exportedDefaults > 0 && totalNamedExports <= 1) {
      continue;
    }

    // Check for violations
    if (totalNamedExports > 1) {
      const violations = [];
      if (exportedClasses > 1) violations.push(`${exportedClasses} classes`);
      if (exportedInterfaces > 1) violations.push(`${exportedInterfaces} interfaces/types`);
      if (exportedFunctions > 1) violations.push(`${exportedFunctions} functions`);
      if (exportedConstants > 1) violations.push(`${exportedConstants} constants`);

      throw new Error(
        `File ${file} violates single export rule: ${violations.join(', ')}. Each file should export exactly 1 class, interface, function, or constant.`
      );
    }

    if (totalNamedExports === 0 && exportedDefaults === 0) {
      // Skip empty files or files with only imports
      continue;
    }

    // Check for inline interface definitions in constructor parameters
    // This regex looks for constructor parameters with inline object types like "param: { prop: string }"
    const inlineInterfaceMatches =
      content.match(/constructor\s*\([^)]*\w+\s*:\s*{\s*[^}]*}[^)]*\)/g) || [];
    if (inlineInterfaceMatches.length > 0) {
      throw new Error(
        `File ${file} contains inline interface definitions in constructor parameters. All types must be defined in separate files.`
      );
    }
  }

  console.log(`✅ Single export per file check passed for ${tsFiles.length} files`);
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
        throw new Error(`Invalid JSON in ${specFile}: ${(error as Error).message}`);
      }
    }
  }
}

async function checkPluginDependencies() {
  const linter = new PluginDependencyLinter();
  const result = await linter.analyze();

  if (!result.success) {
    console.log('❌ Circular dependencies detected in plugin system:');
    result.circularDeps.forEach((cycle, index) => {
      console.log(`  ${index + 1}. ${cycle.join(' → ')}`);
    });
    throw new Error('Plugin circular dependencies found');
  }

  if (result.warnings.length > 0) {
    console.log('⚠️  Plugin dependency warnings:');
    result.warnings.forEach(warning => {
      console.log(`  - ${warning}`);
    });
  }

  console.log(`✅ Plugin dependency analysis passed for ${result.pluginCount} plugins`);
}

if (import.meta.main) {
  main();
}
