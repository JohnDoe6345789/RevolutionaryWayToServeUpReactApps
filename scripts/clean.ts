#!/usr/bin/env bun

/**
 * Clean script for Revolutionary Codegen monorepo
 * Uses the clean plugin to remove generated code and dependencies
 */

import { CleanPlugin } from '../codegen/src/plugins/tools/clean/src/clean-plugin';
import { readFileSync } from 'fs';
import { join } from 'path';

async function main() {
  console.log('🧹 Running cleanup operations...');

  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const options = parseArguments(args);

    // Load plugin configuration
    const pluginConfig = loadPluginConfig();

    // Create and execute clean plugin
    const cleanPlugin = new CleanPlugin(pluginConfig);

    // Mock registry manager for standalone execution
    const mockRegistryManager = {
      register: () => {},
      get: () => cleanPlugin,
      list: () => ['tool.dev.clean'],
      getRegistry: () => null,
      getAggregate: () => null
    };

    await cleanPlugin.register(mockRegistryManager as any);

    // Execute cleanup
    const context = {
      operation: 'execute',
      targets: options.targets,
      dryRun: options.dryRun,
      force: options.force
    };

    const result = await cleanPlugin.execute(context) as {
      summary: string;
      dryRun?: boolean;
    };

    console.log('✅ Cleanup completed successfully!');
    console.log(`📊 ${result.summary}`);

    if (options.dryRun) {
      console.log('🔍 This was a dry run - no files were actually removed');
    }

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

function parseArguments(args: string[]): {
  targets: string;
  dryRun: boolean;
  force: boolean;
} {
  let targets = 'node_modules,dist,build,out,.cache,.next,coverage';
  let dryRun = false;
  let force = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--targets=') || arg.startsWith('-t=')) {
      targets = arg.split('=')[1];
    } else if (arg === '--targets' || arg === '-t') {
      if (i + 1 < args.length) {
        targets = args[i + 1];
        i++; // Skip next arg
      }
    } else if (arg === '--dry-run' || arg === '--preview') {
      dryRun = true;
    } else if (arg === '--force' || arg === '-f') {
      force = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (!arg.startsWith('--') && !arg.startsWith('-')) {
      // If it doesn't start with -- or -, treat as targets
      targets = arg;
    }
  }

  return { targets, dryRun, force };
}

function loadPluginConfig(): any {
  try {
    const pluginPath = join(process.cwd(), 'codegen/src/plugins/tools/clean/plugin.json');
    const configData = readFileSync(pluginPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    throw new Error(`Failed to load plugin configuration: ${error}`);
  }
}

function printHelp(): void {
  console.log(`
🧹 Clean Script for Revolutionary Codegen Monorepo

Usage:
  bun run scripts/clean.ts [options] [targets]

Options:
  --targets, -t <list>    Comma-separated list of targets to clean
                          Default: node_modules,dist,build,out,.cache,.next,coverage
  --dry-run, --preview    Show what would be cleaned without actually removing
  --force, -f            Force removal without confirmation
  --help, -h             Show this help message

Targets:
  node_modules           Node.js dependencies
  dist                   Distribution/build output
  build                  Build artifacts
  out                    Output directories
  .cache                 Cache directories
  .next                  Next.js cache
  coverage               Test coverage reports

Examples:
  bun run scripts/clean.ts                        # Clean all default targets
  bun run scripts/clean.ts --dry-run              # Preview cleanup
  bun run scripts/clean.ts --targets=node_modules # Clean only node_modules
  bun run scripts/clean.ts --targets=dist,build   # Clean specific targets

Available npm scripts:
  npm run clean:all      # Clean all targets
  npm run clean:node-modules  # Clean only node_modules
  npm run clean:dist     # Clean build outputs
  npm run clean:cache    # Clean cache directories
`);
}

if (import.meta.main) {
  main();
}
