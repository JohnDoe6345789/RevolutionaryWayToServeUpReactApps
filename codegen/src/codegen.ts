#!/usr/bin/env node

/**
 * Revolutionary Codegen - Main Entry Point with Lifecycle Builder
 * Uses lifecycle builder for component orchestration and messaging system
 * CLI and WebUI entry points with drill-down navigation
 * TypeScript strict typing with no 'any' types
 */

import { CodegenEntrypoint } from './entrypoints/index';
import { LifecycleBuilder } from './core/lifecycle/index';
import { PluginManager } from './core/plugins/plugin-manager';
import { ExecutionManager } from './core/codegen/execution-manager';

// Factory function to create the complete system using lifecycle builder
export function createCodegenSystem(options: Record<string, unknown> = {}): {
  entrypoint: CodegenEntrypoint;
  lifecycle: typeof LifecycleBuilder;
} {
  // Create lifecycle-managed components
  const pluginManager = new PluginManager({
    uuid: 'plugin-mgr-uuid',
    id: 'PluginManager',
    type: 'manager',
    search: {
      title: 'Plugin Manager',
      summary: 'Manages plugin discovery and loading',
      keywords: ['plugin', 'manager'],
      domain: 'core',
      capabilities: ['discovery', 'loading'],
    },
  });

  const executionManager = new ExecutionManager({
    uuid: 'exec-mgr-uuid',
    id: 'ExecutionManager',
    type: 'manager',
    search: {
      title: 'Execution Manager',
      summary: 'Coordinates code generation execution',
      keywords: ['execution', 'manager'],
      domain: 'core',
      capabilities: ['execution', 'coordination'],
    },
  });

  // Use lifecycle builder for component orchestration
  const lifecycle = new LifecycleBuilder()
    .add('pluginManager', pluginManager)
    .add('executionManager', executionManager)
    .dependsOn('executionManager', 'pluginManager')
    .onError('continue');

  // Create entrypoint with lifecycle builder
  const entrypoint = new CodegenEntrypoint(lifecycle, options);

  return { entrypoint, lifecycle: LifecycleBuilder };
}

// CLI and WebUI execution with dual entry points
if (require.main === module) {
  const args = process.argv.slice(2);

  // Check if WebUI mode is requested
  if (args.includes('--webui') || args.includes('webui')) {
    // Start WebUI
    const { startWebUI } = require('./webui/index');
    startWebUI();
  } else {
    // Run CLI
    const { entrypoint } = createCodegenSystem();
    entrypoint.runCLI(args).catch((error: unknown) => {
      console.error('Fatal error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
  }
}

// Export factory for programmatic use
module.exports = { createCodegenSystem };
