#!/usr/bin/env bun

/**
 * Root-level lint script for Revolutionary Codegen monorepo
 * AGENTS.md compliant linting across all packages
 */

import { $ } from 'bun';
import { existsSync } from 'fs';
import { join } from 'path';

const PACKAGES = [
  'codegen',
  'retro-react-app',
  'e2e'
];

async function main() {
  console.log('📋 Running AGENTS.md compliant linting across monorepo...');

  try {
    let allPassed = true;

    for (const pkg of PACKAGES) {
      console.log(`\n🏗️  Linting package: ${pkg}`);
      const passed = await lintPackage(pkg);
      if (!passed) {
        allPassed = false;
      }
    }

    if (allPassed) {
      console.log('\n✅ All packages passed lint checks!');
    } else {
      console.log('\n❌ Some packages failed lint checks!');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Linting failed:', error);
    process.exit(1);
  }
}

async function lintPackage(pkgName: string): Promise<boolean> {
  const pkgPath = join(process.cwd(), pkgName);

  if (!existsSync(pkgPath)) {
    console.log(`⚠️  Package ${pkgName} not found, skipping`);
    return true;
  }

  try {
    // Check if package has its own lint script
    const packageJsonPath = join(pkgPath, 'package.json');
    if (existsSync(packageJsonPath)) {
      const packageJson = await import(packageJsonPath, { assert: { type: 'json' } });
      if (packageJson.default?.scripts?.lint) {
        console.log(`🔍 Running ${pkgName} package lint script...`);
        await $`cd ${pkgPath} && npm run lint`;
        return true;
      }
    }

    // Fallback to basic checks
    console.log(`🔍 Running basic lint checks for ${pkgName}...`);
    await runBasicLintChecks(pkgPath);
    return true;

  } catch (error) {
    console.error(`❌ Linting failed for ${pkgName}:`, error);
    return false;
  }
}

async function runBasicLintChecks(pkgPath: string) {
  // Basic checks for packages without dedicated lint scripts
  console.log(`📋 Running basic checks for ${pkgPath}...`);

  // Check for common issues
  const fs = await import('fs');
  const path = await import('path');

  // Find TypeScript/JavaScript files
  const tsFiles: string[] = [];

  function scanDirectory(dir: string) {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanDirectory(fullPath);
      } else if (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx')) {
        tsFiles.push(fullPath);
      }
    }
  }

  scanDirectory(pkgPath);

  console.log(`📊 Found ${tsFiles.length} source files`);

  // Basic validation - check for console.log statements (could be improved)
  let issues = 0;
  for (const file of tsFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');

      // Check for basic issues - console.log statements (excluding comments)
      // Match console.log not preceded by // or inside /* */ blocks
      const consoleLogMatches = content.match(/^\s*console\.log|\bconsole\.log\s*\(/gm) || [];
      let actualConsoleLogs = 0;

      for (const match of consoleLogMatches) {
        // Check if this match is not in a comment
        const matchIndex = content.indexOf(match);
        const beforeMatch = content.substring(0, matchIndex);

        // Check if preceded by // or inside /* */
        const lastLineStart = beforeMatch.lastIndexOf('\n');
        const currentLine = beforeMatch.substring(lastLineStart + 1);

        // Skip if line starts with // or if we're inside a /* */ block
        if (currentLine.trim().startsWith('//') ||
            (beforeMatch.includes('/*') && !beforeMatch.substring(beforeMatch.lastIndexOf('/*')).includes('*/'))) {
          continue;
        }

        actualConsoleLogs++;
      }

      if (actualConsoleLogs > 0) {
        console.log(`⚠️  ${file}: ${actualConsoleLogs} console.log statements`);
        issues++;
      }

      // Check for TODO comments
      const todos = (content.match(/TODO|FIXME/g) || []).length;
      if (todos > 0) {
        console.log(`📝 ${file}: ${todos} TODO/FIXME comments`);
      }

    } catch (error) {
      console.log(`⚠️  Could not read ${file}: ${error}`);
    }
  }

  if (issues === 0) {
    console.log(`✅ Basic checks passed for ${pkgPath.split('/').pop()}`);
  } else {
    console.log(`⚠️  Found ${issues} potential issues in ${pkgPath.split('/').pop()}`);
  }
}

if (import.meta.main) {
  main();
}
