#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Multiline String Finder
 *
 * Finds multiline strings in source code files including:
 * - Template literals spanning multiple lines
 * - String concatenations across multiple lines
 * - Long strings broken across lines
 *
 * @author Multiline String Finder
 * @version 1.0.0
 */

class MultilineStringFinder {
  constructor(options = {}) {
    this.options = {
      files: options.files || [],
      project: options.project || false,
      verbose: options.verbose || false,
      exclude: options.exclude || ['node_modules/**', '.git/**', 'coverage/**', 'dist/**', 'build/**'],
      maxFiles: options.maxFiles || 100,
      ...options
    };

    this.multilineStrings = [];
    this.processedFiles = [];
    this.results = {
      timestamp: null,
      mode: 'MULTILINE_STRING_ANALYSIS',
      safety: {},
      analysis: {},
      multilineStrings: [],
      success: true
    };
  }

  /**
   * Main analysis method
   */
  async find() {
    this.results.timestamp = new Date().toISOString();

    try {
      // Get files to process
      const files = await this.getFiles();
      this.results.safety.filesFound = files.length;
      this.results.safety.maxFiles = this.options.maxFiles;

      // Process each file
      for (const file of files) {
        await this.processFile(file);
        this.processedFiles.push(path.relative(process.cwd(), file));
      }

      // Build final results
      this.results.analysis = {
        totalMultilineStrings: this.multilineStrings.length,
        filesProcessed: this.processedFiles.length,
        processedFiles: this.processedFiles
      };

      this.results.multilineStrings = this.multilineStrings;
      this.results.success = true;

      return this.results;

    } catch (error) {
      this.results.success = false;
      this.results.error = error.message;
      return this.results;
    }
  }

  /**
   * Get list of files to process
   */
  async getFiles() {
    if (this.options.files.length > 0) {
      // Process specified files
      const files = [];
      const projectRoot = path.resolve(__dirname, '..');

      for (const pattern of this.options.files) {
        // Handle glob patterns
        if (pattern.includes('*') || pattern.includes('?')) {
          try {
            const result = execSync(`find "${projectRoot}" -path "${pattern}" -type f`, {
              encoding: 'utf8'
            });
            files.push(...result.trim().split('\n').filter(f => f));
          } catch (error) {
            this.log(`Warning: Could not find files matching pattern: ${pattern}`, 'warn');
          }
        } else {
          // Handle direct file paths
          const fullPath = path.resolve(projectRoot, pattern);
          if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
            files.push(fullPath);
          } else {
            this.log(`Warning: File not found: ${pattern}`, 'warn');
          }
        }
      }
      return files;
    }

    if (this.options.project) {
      // Process entire project
      return this.getProjectFiles();
    }

    throw new Error('No files specified. Use --files or --project option');
  }

  /**
   * Get all JavaScript/TypeScript files in the project
   */
  getProjectFiles() {
    const projectRoot = path.resolve(__dirname, '..');
    const codeFiles = [];

    const scanDirectory = (dir) => {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Skip excluded directories
          const relativePath = path.relative(projectRoot, fullPath);
          if (this.options.exclude.some(pattern => this.matchesPattern(relativePath, pattern))) {
            continue;
          }
          scanDirectory(fullPath);
        } else if (stat.isFile() && /\.(js|mjs|cjs|ts|tsx)$/.test(item)) {
          codeFiles.push(fullPath);
        }
      }
    };

    scanDirectory(projectRoot);

    // Apply file limit
    if (codeFiles.length > this.options.maxFiles) {
      this.log(`Found ${codeFiles.length} files, limiting to ${this.options.maxFiles} files`);
      return codeFiles.slice(0, this.options.maxFiles);
    }

    return codeFiles;
  }

  /**
   * Check if path matches a pattern
   */
  matchesPattern(path, pattern) {
    // Special handling for /** patterns (common for directory exclusion)
    if (pattern.endsWith('/**')) {
      const prefix = pattern.slice(0, -3); // remove `/**`
      return path === prefix || path.startsWith(prefix + '/');
    }

    // Convert glob pattern to regex for other patterns
    const regexPattern = pattern
      .replace(/\*\*/g, '___GLOBSTAR___')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '.')
      .replace(/___GLOBSTAR___/g, '.*');

    return new RegExp(`^${regexPattern}$`).test(path);
  }

  /**
   * Process a single file
   */
  async processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const multilineStrings = this.findMultilineStrings(content, filePath);

      // Add found multiline strings to results
      this.multilineStrings.push(...multilineStrings);

      if (this.options.verbose && multilineStrings.length > 0) {
        this.log(`Found ${multilineStrings.length} multiline strings in ${path.relative(process.cwd(), filePath)}`, 'info');
      }

    } catch (error) {
      this.log(`Error processing file ${filePath}: ${error.message}`, 'error');
    }
  }

  /**
   * Find multiline strings in file content
   */
  findMultilineStrings(content, filePath) {
    const multilineStrings = [];
    const lines = content.split('\n');
    const relativePath = path.relative(process.cwd(), filePath);

    // Pattern 1: Template literals spanning multiple lines
    const templateLiteralPattern = /`([^`]*(?:\n[^`]*)*)`/g;
    let match;
    while ((match = templateLiteralPattern.exec(content)) !== null) {
      const fullMatch = match[0];
      const content = match[1];

      // Check if this spans multiple lines
      if (fullMatch.includes('\n')) {
        const startLine = content.substring(0, match.index).split('\n').length;
        const endLine = startLine + (fullMatch.split('\n').length - 1);

        multilineStrings.push({
          type: 'template_literal',
          file: relativePath,
          startLine: startLine,
          endLine: endLine,
          content: content,
          fullMatch: fullMatch,
          length: content.length,
          lines: endLine - startLine + 1
        });
      }
    }

    // Pattern 2: String concatenation across multiple lines
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Look for string concatenation patterns
      if (line.trim().endsWith('+') || line.trim().endsWith('+ ') ||
          line.trim().endsWith('"+') || line.trim().endsWith("'+")) {

        // Find the start of the concatenation
        let startLine = i;
        let concatLines = [line];
        let j = i + 1;

        // Look for continuation lines
        while (j < lines.length) {
          const nextLine = lines[j];
          concatLines.push(nextLine);

          // Check if this line continues the concatenation
          if (!nextLine.trim().endsWith('+') && !nextLine.trim().endsWith('+ ') &&
              !nextLine.trim().endsWith('"+') && !nextLine.trim().endsWith("'+")) {
            break;
          }
          j++;
        }

        // If we found multiple lines, analyze the concatenation
        if (concatLines.length > 1) {
          const concatContent = concatLines.join('\n');
          const extractedStrings = this.extractStringsFromConcatenation(concatContent);

          if (extractedStrings.length > 0) {
            multilineStrings.push({
              type: 'string_concatenation',
              file: relativePath,
              startLine: startLine + 1,
              endLine: j,
              content: extractedStrings.join(' '),
              fullMatch: concatContent,
              length: extractedStrings.join(' ').length,
              lines: concatLines.length
            });
          }
        }
      }
    }

    // Pattern 3: Long strings broken across lines (quoted strings with line continuations)
    const longStringPattern = /["']([^"'\n]*(?:\n\s*[^"'\n]*)*)["']/g;
    while ((match = longStringPattern.exec(content)) !== null) {
      const fullMatch = match[0];
      const content = match[1];

      // Check if this spans multiple lines and is not just a template literal
      if (fullMatch.includes('\n') && !fullMatch.startsWith('`')) {
        const startLine = content.substr(0, match.index).split('\n').length;
        const endLine = startLine + (fullMatch.split('\n').length - 1);

        multilineStrings.push({
          type: 'line_continuation',
          file: relativePath,
          startLine: startLine,
          endLine: endLine,
          content: content.replace(/\n\s*/g, ' '), // Normalize whitespace
          fullMatch: fullMatch,
          length: content.length,
          lines: endLine - startLine + 1
        });
      }
    }

    return multilineStrings;
  }

  /**
   * Extract strings from concatenation pattern
   */
  extractStringsFromConcatenation(concatContent) {
    const strings = [];
    const stringPatterns = [
      /"([^"\\]*(?:\\.[^"\\]*)*)"/g,
      /'([^'\\]*(?:\\.[^'\\]*)*)'/g,
      /`([^`\\]*(?:\\.[^`\\]*)*)`/g
    ];

    for (const pattern of stringPatterns) {
      let match;
      while ((match = pattern.exec(concatContent)) !== null) {
        strings.push(match[1]);
      }
    }

    return strings;
  }

  /**
   * Log message
   */
  log(message, level = 'info') {
    if (!this.options.verbose && level === 'info') return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      component: 'MultilineStringFinder',
      level: level,
      message: message
    };

    console.log(JSON.stringify(logEntry));
  }
}

/**
 * Find multiline strings in files
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} JSON results with multiline strings found
 */
async function findMultilineStrings(options = {}) {
  const finder = new MultilineStringFinder(options);
  return await finder.find();
}

/**
 * Main CLI function
 */
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // Parse basic CLI args
  if (args.includes('--project')) {
    options.project = true;
  }
  if (args.includes('--verbose')) {
    options.verbose = true;
  }

  try {
    const result = await findMultilineStrings(options);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

// Export for testing
module.exports = {
  MultilineStringFinder,
  findMultilineStrings
};

// Run if called directly
if (require.main === module) {
  main();
}
