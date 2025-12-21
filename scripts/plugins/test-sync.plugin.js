#!/usr/bin/env node

/**
 * Test Sync Plugin
 * Synchronizes bootstrap tests with source code changes.
 * Migrated from sync-bootstrap-tests.js
 */

const fs = require('fs');
const path = require('path');
const BasePlugin = require('../lib/base-plugin');

class TestSyncPlugin extends BasePlugin {
  constructor() {
    super({
      name: 'test-sync',
      description: 'Synchronizes bootstrap tests with source code changes',
      version: '1.0.0',
      author: 'RWTRA',
      category: 'utility',
      commands: [
        {
          name: 'test-sync',
          description: 'Sync bootstrap tests with source code'
        }
      ],
      dependencies: []
    });

    this.results = {
      sourceFiles: 0,
      testFiles: 0,
      stubsCreated: 0,
      filesCopied: 0,
      errors: [],
      syncTime: 0
    };
  }

  /**
   * Main plugin execution method
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Sync results
   */
  async execute(context) {
    await this.initialize(context);
    
    this.log('Starting test synchronization...', 'info');
    this.log(this.colorize('🔄 Test Synchronization', context.colors.cyan));
    this.log(this.colorize('='.repeat(50), context.colors.white));
    
    const startTime = Date.now();
    
    const repoRoot = context.options['repo-root'] || path.join(context.bootstrapPath, '..');
    const sourceRoot = context.options['source-root'] || path.join(repoRoot, 'bootstrap');
    const testsRoot = context.options['tests-root'] || path.join(repoRoot, 'test-tooling', 'tests');
    
    try {
      await this._ensureMapping(repoRoot, sourceRoot, testsRoot);
      
      this.results.syncTime = ((Date.now() - startTime) / 1000).toFixed(2);
      
      this._generateReport(context);
      
      // Save results if output directory specified
      if (context.options.output) {
        await this._saveResults(context);
      }
      
      return this.results;
      
    } catch (error) {
      this.log(`Test synchronization failed: ${error.message}`, 'error');
      this.results.errors.push(error.message);
      throw error;
    }
  }

  /**
   * Ensures mapping between source files and test files
   */
  async _ensureMapping(repoRoot, sourceRoot, testsRoot) {
    this.log('Creating file mapping...', 'info');
    
    const sourceFiles = await this._collectFiles(sourceRoot);
    this.results.sourceFiles = sourceFiles.length;
    
    this.log(`Found ${sourceFiles.length} source files`, 'info');
    
    for (const sourceFile of sourceFiles) {
      try {
        const relPath = path.relative(sourceRoot, sourceFile);
        const targetPath = path.join(testsRoot, relPath);
        
        // Ensure directory exists
        await fs.promises.mkdir(path.dirname(targetPath), { recursive: true });
        
        // Check if file exists and handle accordingly
        const sourceStats = await fs.promises.stat(sourceFile);
        
        if (await this._pathExists(targetPath)) {
          const targetStats = await fs.promises.stat(targetPath);
          
          if (sourceStats.isFile() && targetStats.isFile()) {
            // Copy source file over test file
            await fs.promises.copyFile(sourceFile, targetPath);
            this.results.filesCopied++;
            this.log(`Synced: ${relPath}`, 'info');
          } else {
            this.log(`Skipped directory: ${relPath}`, 'info');
          }
        } else {
          // Create test stub
          await this._createTestStub(relPath, relPath, sourceFile);
          this.results.stubsCreated++;
          this.log(`Created stub: ${relPath}`, 'info');
        }
        
      } catch (error) {
        this.log(`Error processing ${relPath}: ${error.message}`, 'error');
        this.results.errors.push(`Error processing ${relPath}: ${error.message}`);
      }
    }
    
    this.results.testFiles = await this._collectFiles(testsRoot);
    this.log(`Synced to ${this.results.testFiles} test files`, 'info');
  }

  /**
   * Collects all files in a directory recursively
   */
  async _collectFiles(directory) {
    const files = [];
    
    const scanDirectory = async (dir) => {
      try {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory()) {
            await scanDirectory(fullPath);
          } else {
            files.push(fullPath);
          }
        }
      } catch (error) {
        this.log(`Error scanning directory ${dir}: ${error.message}`, 'warn');
      }
    };
    
    await scanDirectory(directory);
    return files;
  }

  /**
   * Checks if a path exists
   */
  async _pathExists(filePath) {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Creates a test stub for a source file
   */
  async _createTestStub(testPath, relPath, sourceFile) {
    const importPath = path.relative(path.dirname(testPath), sourceFile);
    const posixPath = relPath.split(path.sep).join('/');
    
    const stubContent = `/**
 * Auto-generated test stub for bootstrap/${posixPath}
 * Generated by RWTRA Test Sync Plugin
 */

const target = require('${posixPath}');

describe('bootstrap/${posixPath}', () => {
  test('loads without throwing', () => {
    expect(target).toBeDefined();
  });
  
  test('exports expected interface', () => {
    // Add interface compliance tests here
    expect(typeof target).toBe('object');
  });
  
  test('has required methods', () => {
    // Add method existence tests here
    if (target && typeof target === 'object') {
      expect(typeof target.initialize === 'function').toBe(true);
    }
  });
});
`;
    
    await fs.promises.writeFile(testPath, stubContent);
  }

  /**
   * Formats a path for POSIX compatibility
   */
  _formatPosixPath(filePath) {
    return filePath.split(path.sep).join('/');
  }

  /**
   * Generates and displays the sync report
   */
  _generateReport(context) {
    console.log(context.colors.reset + '\n🔄 TEST SYNCHRONIZATION REPORT');
    console.log('================================');
    
    // Summary
    console.log('\n📈 SUMMARY:');
    console.log(`   Source Files: ${this.results.sourceFiles}`);
    console.log(`   Test Files: ${this.results.testFiles}`);
    console.log(`   Stubs Created: ${this.results.stubsCreated}`);
    console.log(`   Files Copied: ${this.results.filesCopied}`);
    console.log(`   Sync Time: ${this.results.syncTime}s`);
    
    // Errors
    if (this.results.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      for (const error of this.results.errors.slice(0, 10)) {
        console.log(`   - ${error}`);
      }
      if (this.results.errors.length > 10) {
        console.log(`   ... and ${this.results.errors.length - 10} more errors`);
      }
    }
    
    // Recommendations
    this._generateRecommendations(context);
  }

  /**
   * Generates recommendations based on sync results
   */
  _generateRecommendations(context) {
    console.log('\n🎯 RECOMMENDATIONS:');
    
    if (this.results.stubsCreated > 0) {
      console.log(context.colors.cyan + `   - Complete ${this.results.stubsCreated} test stubs with actual tests` + context.colors.reset);
    }
    
    if (this.results.filesCopied > 0) {
      console.log(context.colors.cyan + `   - Review ${this.results.filesCopied} copied test files for accuracy` + context.colors.reset);
    }
    
    if (this.results.errors.length > 0) {
      console.log(context.colors.red + `   - Fix ${this.results.errors.length} errors that occurred during sync` + context.colors.reset);
    }
    
    console.log(context.colors.cyan + '   - Run test suite after synchronization' + context.colors.reset);
    console.log(context.colors.cyan + '   - Set up continuous integration for automated testing' + context.colors.reset);
    console.log(context.colors.cyan + '   - Review test coverage and add missing tests' + context.colors.reset);
    
    if (this.results.sourceFiles === 0) {
      console.log(context.colors.yellow + '   - Verify source directory path and file permissions' + context.colors.reset);
    }
    
    if (this.results.stubsCreated > this.results.sourceFiles * 0.5) {
      console.log(context.colors.green + '   - Good test coverage achieved through sync' + context.colors.reset);
    } else {
      console.log(context.colors.yellow + '   - Consider adding more comprehensive tests' + context.colors.reset);
    }
  }

  /**
   * Saves sync results to file
   */
  async _saveResults(context) {
    const outputDir = context.options['output-dir'] || path.join(context.bootstrapPath, 'reports');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsPath = path.join(outputDir, `test-sync-${timestamp}.json`);
    
    const reportData = {
      timestamp,
      summary: {
        sourceFiles: this.results.sourceFiles,
        testFiles: this.results.testFiles,
        stubsCreated: this.results.stubsCreated,
        filesCopied: this.results.filesCopied,
        syncTime: this.results.syncTime
      },
      errors: this.results.errors
    };
    
    fs.writeFileSync(resultsPath, JSON.stringify(reportData, null, 2), 'utf8');
    this.log(`Results saved to: ${resultsPath}`, 'info');
  }
}

module.exports = TestSyncPlugin;
