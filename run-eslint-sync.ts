#!/usr/bin/env bun

/**
 * Script to run ESLint sync plugin directly
 */

import { ESLintSyncPlugin } from './codegen/src/plugins/tools/eslint-sync/src/eslint-sync-plugin';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load the plugin config
const pluginJsonPath = './codegen/src/plugins/tools/eslint-sync/plugin.json';
const pluginJson = JSON.parse(readFileSync(pluginJsonPath, 'utf8'));

async function main() {
  console.log('🔧 Running ESLint Sync Plugin...');

  try {
    const plugin = new ESLintSyncPlugin(pluginJson);

    // Initialize the plugin
    await plugin.initializePlugin();

    // Run sync operation
    const result = await plugin.execute({
      operation: 'sync',
      scope: 'all',
      level: 'auto',
      dryRun: false,
      force: false,
      backup: true
    });

    console.log('✅ ESLint sync completed');
    console.log('Results:', result);

  } catch (error) {
    console.error('❌ ESLint sync failed:', error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
