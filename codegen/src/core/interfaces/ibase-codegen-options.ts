/**
 * Base codegen options interface
 * Configuration options for the BaseCodegen class
 */

export interface IBaseCodegenOptions {
  outputDir?: string;
  strictMode?: boolean;
  verbose?: boolean;
  enableCache?: boolean;
  [key: string]: unknown;
}
