import type { DocFile } from './doc-file';

/**
 * DocSection - Represents a section of documentation containing multiple files
 */
export interface DocSection {
  id: string;
  title: string;
  path: string;
  files: DocFile[];
}
