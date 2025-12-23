/**
 * Minimal spec interface for validation purposes
 * Simplified version used by SpecValidator
 */
import { ISearchMetadataForValidation } from './isearch-metadata-for-validation';

export interface ISpecForValidation {
  uuid: string;
  id: string;
  search: ISearchMetadataForValidation;
  [key: string]: unknown;
}
