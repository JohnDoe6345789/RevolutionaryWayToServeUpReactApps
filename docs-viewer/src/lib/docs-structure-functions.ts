import type { DocFile, DocSection } from "@/types/docs";
import { DOCS_STRUCTURE } from "./docs-structure-data";

/**
 * getAllDocFiles - Returns all documentation files from all sections
 */
export function getAllDocFiles(): DocFile[] {
  return DOCS_STRUCTURE.flatMap((section) => section.files);
}

/**
 * getDocFile - Finds a specific documentation file by section and file ID
 */
export function getDocFile(
  sectionId: string,
  fileId: string,
): DocFile | undefined {
  const section = DOCS_STRUCTURE.find((s) => s.id === sectionId);
  return section?.files.find((f) => f.id === fileId);
}

/**
 * getSection - Finds a documentation section by ID
 */
export function getSection(sectionId: string): DocSection | undefined {
  return DOCS_STRUCTURE.find((s) => s.id === sectionId);
}
