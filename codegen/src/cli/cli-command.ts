/**
 * CLICommand interface - Defines the structure of CLI commands
 */

import type { CodegenEntrypoint } from '../entrypoints/codegen-entrypoint';

/**
 * CLICommand interface - Defines the structure for CLI command definitions
 */
export interface CLICommand {
  name: string;
  description: string;
  syntax: string;
  examples: string[];
  handler: (args: string[], entrypoint: CodegenEntrypoint) => Promise<void>;
}
