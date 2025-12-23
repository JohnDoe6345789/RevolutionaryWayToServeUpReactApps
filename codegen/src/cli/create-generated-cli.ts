/**
 * Factory function to create GeneratedCLI instances
 */

import { GeneratedCLI } from './generated-cli';
import type { CodegenEntrypoint } from '../entrypoints/codegen-entrypoint';

/**
 * Factory function to create GeneratedCLI instances
 * @param entrypoint - The codegen entrypoint to use
 * @returns A new GeneratedCLI instance
 */
export function createGeneratedCLI(entrypoint: CodegenEntrypoint): GeneratedCLI {
  return new GeneratedCLI(entrypoint);
}
