/**
 * CodegenEntrypoint Test Suite
 * Tests for the CodegenEntrypoint class
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CodegenEntrypoint } from './codegen-entrypoint';

describe('CodegenEntrypoint', () => {
  let entrypoint: CodegenEntrypoint;
  let mockAggregator: any;

  beforeEach(() => {
    mockAggregator = {
      drillDown: vi.fn(),
      listChildren: vi.fn(),
      execute: vi.fn()
    };

    entrypoint = new CodegenEntrypoint(mockAggregator);
  });

  describe('constructor', () => {
    it('should initialize successfully', () => {
      expect(entrypoint).toBeDefined();
    });
  });

  describe('basic functionality', () => {
    it('should have expected properties', () => {
      expect(entrypoint).toHaveProperty('uuid');
      expect(entrypoint).toHaveProperty('id');
      expect(entrypoint).toHaveProperty('search');
    });
  });
});
