#!/usr/bin/env node

/**
 * Enhanced Documentation Coverage Plugin
 * Comprehensive JavaScript documentation coverage analysis with feature parity to Python version.
 * rewritten to match Python doc_coverage.py functionality.
 */

const fs = require('fs');
const path = require('path');
const BasePlugin = require('../lib/base-plugin');
const LanguageRegistry = require('../lib/language-registry');

// Constants matching Python implementation
const DEFAULT_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.html'];
const DEFAULT_IGNORE_DIRS = [
  '.git', '.venv', 'dist', 'coverage', 'node_modules', 
  'build', 'ci', 'e2e', 'python', 'test-tooling'
];

const STRINGS = {
  cli_description: 'Estimate API doc coverage',
  coverage_heading: 'Documentation coverage',
  missing_modules: 'Missing module docs:',
  stub_template_phrase: 'Module documentation template',
  stub_penalty_note: '...convert or delete these matching templates so the penalty vanishes:',
  missing_readme_title: 'Missing README.md in these directories:',
  missing_readme_links_title: 'README files missing links to local docs:',
  missing_globals_title: 'Missing documented globals:',
  missing_functions_title: 'Missing documented functions:',
  bootstrap_unmatched_title: 'Bootstrap docs without matching source files:',
  extra_docs_title: 'Documented modules without matching source files:',
  misplaced_docs_title: 'Documented modules not located at expected path:',
  broken_readme_links_title: 'Broken README links pointing at missing files:',
  module_template_title: '# Module template: `{module}`',
  template_intro: 'Use this document as a starting point. Replace the placeholder text with prose, examples, and links that describe the exported surface.',
  template_overview_heading: '## Overview',
  template_overview_purpose: '- **Purpose:**',
  template_overview_entry: '- **Entry point / exports:**',
  template_globals_heading: '## Globals',
  template_global_entry: '- `{name}` — describe the meaning and how callers should use it.',
  template_none_yet: '- _None yet_',
  template_functions_heading: '## Functions / Classes',
  template_function_entry: '- `{name}` — explain arguments, return values, and side effects; note if it is async, a class constructor, etc.',
  template_examples_heading: '## Examples',
  template_code_block_start: '```ts',
  template_examples_note: '// Show a minimal snippet that exercises the module.',
  template_code_block_end: '```',
  template_related_heading: '## Related docs',
  template_related_item: '- Reference other relevant markdown files if they already mention this module.',
  module_template_written: 'Module templates written for {count} modules under {path}',
};

const IGNORED_DOC_FILES = new Set(['api/globals.md']);

const BASE_PATH_CONFIG = {
  doc_base: path.join('api'),
  module_overrides: {
    'index.html': path.join('api', 'index.html.md'),
    'bootstrap.js': path.join('api', 'bootstrap.md'),
    'bootstrap.d.ts': path.join('api', 'bootstrap.md'),
  },
  mirror_sections: [
    {
      name: 'bootstrap',
      doc_prefix: path.join('api', 'bootstrap'),
      src_prefix: 'bootstrap',
    },
  ],
};

// Data structures matching Python dataclasses
class ModuleSummary {
  constructor(modulePath) {
    this.path = modulePath;
    this.globals = [];
    this.functions = [];
  }
}

class ReportMetrics {
  constructor() {
    this.module_docged = 0;
    this.module_total = 0;
    this.globals_docged = 0;
    this.globals_total = 0;
    this.functions_docged = 0;
    this.functions_total = 0;
    this.missing_modules = [];
    this.missing_globals = [];
    this.missing_functions = [];
    this.coverage_pct = 100.0;
    this.coverage_with_penalty = 100.0;
    this.penalties = {};
  }
}

class PenaltySpec {
  constructor(count, penalty, formatter) {
    this.count = count;
    this.penalty = penalty;
    this.formatter = formatter;
  }
}

// Core Analysis Engine
class DocumentationAnalyzer {
  static CLASS_DECL_RE = /^\s*(?:export\s+)?class\s+[A-Za-z_]\w*/;
  static METHOD_DECL_RE = /^\s*(?:(?:static|async|get|set)\s+)*\*?\s*([A-Za-z_]\w*)\s*\(/;
  static FIELD_ARROW_RE = /^\s*(?:static\s+)?([A-Za-z_]\w*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/;
  static FIELD_FUNC_RE = /^\s*(?:static\s+)?([A-Za-z_]\w*)\s*=\s*(?:async\s*)?function\b/;
  static MODULE_HEADING_RE = /#\s*Module:\s*`([^`]+)`/i;
  static LINK_TARGET_RE = /\[[^\]]*\]\(([^)]+)\)/;

  /**
   * Collect all source files matching extensions
   */
  static collectSourceFiles(codeRoot, extensions = null, ignoreDirs = null) {
    const files = [];
    extensions = extensions || DEFAULT_EXTENSIONS;
    ignoreDirs = ignoreDirs || DEFAULT_IGNORE_DIRS;

    const scanDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !ignoreDirs.includes(item)) {
          scanDirectory(fullPath);
        } else if (stat.isFile()) {
          // Skip .d.ts files except bootstrap.d.ts
          if (fullPath.endsWith('.d.ts') && !fullPath.endsWith('bootstrap.d.ts')) {
            continue;
          }
          
          const ext = path.extname(fullPath);
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    };

    scanDirectory(codeRoot);
    return files;
  }

  /**
   * Extract symbols from source text
   */
  static extractSymbols(text) {
    const globals = new Set();
    const functions = new Set();

    // Extract globals (const, let, var declarations)
    const globalMatches = text.matchAll(/^(?:export\s+)?(?:const|let|var)\s+([A-Za-z_]\w*)/gm);
    for (const match of globalMatches) {
      globals.add(match[1]);
    }

    const lines = text.split('\n');
    const classDepths = this._classDepths(lines);
    
    // Extract class methods
    const classMethods = this._extractClassMethods(lines, classDepths);
    classMethods.forEach(method => functions.add(method));

    // Extract standalone functions and classes
    const patterns = [
      /\bfunction\s*\*?\s*([A-Za-z_]\w*)\s*\(/g,
      /\b([A-Za-z_]\w*)\s*=\s*function\b/g,
      /\b([A-Za-z_]\w*)\s*=\s*async\s*\(/g,
      /\b([A-Za-z_]\w*)\s*=\s*\([^)]*\)\s*=>/g,
      /\b([A-Za-z_]\w*)\s*:\s*(?:async\s*)?\([^)]*\)\s*=>/g,
    ];

    for (let i = 0; i < lines.length; i++) {
      if (classDepths[i] > 0) continue;
      
      const line = lines[i];
      for (const pattern of patterns) {
        const matches = line.matchAll(pattern);
        for (const match of matches) {
          functions.add(match[1]);
        }
      }
    }

    // Extract class declarations
    const classMatches = text.matchAll(/^(?:export\s+(?:default\s+)?)?class\s+([A-Za-z_]\w*)/gm);
    for (const match of classMatches) {
      functions.add(match[1]);
    }

    return { globals: Array.from(globals), functions: Array.from(functions) };
  }

  /**
   * Calculate class depths for method extraction
   */
  static _classDepths(lines) {
    const depths = new Array(lines.length).fill(0);
    let classDepth = 0;
    let pendingClass = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      depths[i] = classDepth;

      if (pendingClass) {
        if (line.includes('{')) {
          pendingClass = false;
          classDepth += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
          if (classDepth < 0) classDepth = 0;
        }
        continue;
      }

      if (classDepth === 0 && this.CLASS_DECL_RE.test(line)) {
        pendingClass = true;
        if (line.includes('{')) {
          pendingClass = false;
          classDepth += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
          if (classDepth < 0) classDepth = 0;
        }
        continue;
      }

      if (classDepth > 0) {
        classDepth += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
        if (classDepth < 0) classDepth = 0;
      }
    }

    return depths;
  }

  /**
   * Extract class methods with JSDoc checking
   */
  static _extractClassMethods(lines, classDepths) {
    const methods = new Set();
    
    for (let i = 0; i < lines.length; i++) {
      if (classDepths[i] !== 1) continue;
      
      const line = lines[i];
      const patterns = [this.METHOD_DECL_RE, this.FIELD_ARROW_RE, this.FIELD_FUNC_RE];
      
      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          if (this._hasJSDoc(lines, i)) {
            methods.add(match[1]);
          }
          break;
        }
      }
    }
    
    return Array.from(methods);
  }

  /**
   * Check if a function has JSDoc comments
   */
  static _hasJSDoc(lines, index) {
    for (let i = index - 1; i >= 0; i--) {
      const stripped = lines[i].trim();
      if (!stripped) continue;
      
      if (stripped.startsWith('/**')) return true;
      if (stripped.startsWith('*') || stripped.startsWith('*/') || stripped.startsWith('//')) continue;
      return false;
    }
    return false;
  }

  /**
   * Load documentation from markdown files
   */
  static loadDocs(docRoot, ignoreDirs = null) {
    let collectedText = '';
    const entries = [];
    
    if (!fs.existsSync(docRoot)) return { collectedText, entries };
    
    const scanDirectory = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (item.endsWith('.md')) {
          const relative = path.relative(docRoot, fullPath);
          if (IGNORED_DOC_FILES.has(relative)) continue;
          
          try {
            const text = fs.readFileSync(fullPath, 'utf8');
            collectedText += text + '\n';
            
            const matches = text.matchAll(this.MODULE_HEADING_RE);
            for (const match of matches) {
              if (match[1]) {
                entries.push({ path: fullPath, module: match[1] });
              }
            }
          } catch (error) {
            // Skip files that can't be read
          }
        }
      }
    };

    scanDirectory(docRoot);
    return { collectedText, entries };
  }

  /**
   * Compute coverage statistics
   */
  static computeCoverage(names, docText) {
    const namesSet = new Set(names);
    if (namesSet.size === 0) return { documented: 0, total: 0 };
    
    let documented = 0;
    for (const name of namesSet) {
      if (this.isDocumented(name, docText)) {
        documented++;
      }
    }
    
    return { documented, total: namesSet.size };
  }

  /**
   * Find missing names
   */
  static findMissingNames(names, docText) {
    const missing = new Set();
    const documentedCache = new Map();
    
    for (const name of names) {
      if (documentedCache.has(name)) {
        if (!documentedCache.get(name)) {
          missing.add(name);
        }
        continue;
      }
      
      const documented = this.isDocumented(name, docText);
      documentedCache.set(name, documented);
      if (!documented) {
        missing.add(name);
      }
    }
    
    return Array.from(missing).sort();
  }

  /**
   * Check if a name is documented
   */
  static isDocumented(name, docText) {
    if (!docText) return false;
    
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const wordBoundary = new RegExp(`\\b${escaped}\\b`);
    
    if (wordBoundary.test(docText)) return true;
    
    if (name.includes(':')) {
      const [modulePath, symbol] = name.split(':');
      const symbolEscaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const symbolBoundary = new RegExp(`\\b${symbolEscaped}\\b`);
      if (symbolBoundary.test(docText)) return true;
      
      const moduleEscaped = modulePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const combinedPattern = new RegExp(`${moduleEscaped}.*${symbolEscaped}`);
      if (combinedPattern.test(docText)) return true;
    }
    
    return new RegExp(escaped).test(docText);
  }
}

// Service Classes
class ModuleCollectorService {
  constructor(config) {
    this.codeRoot = config.codeRoot;
    this.extensions = config.extensions;
  }

  collect(request) {
    const moduleSummaries = [];
    const modules = [];
    const globalsList = [];
    const functionsList = [];

    const files = DocumentationAnalyzer.collectSourceFiles(
      this.codeRoot, 
      this.extensions, 
      request.ignore_dirs
    );

    for (const filePath of files) {
      const relative = path.relative(this.codeRoot, filePath);
      const summary = new ModuleSummary(relative);
      
      try {
        const text = fs.readFileSync(filePath, 'utf8');
        const { globals, functions } = DocumentationAnalyzer.extractSymbols(text);
        
        summary.globals = globals.sort();
        summary.functions = functions.sort();
        
        moduleSummaries.push(summary);
        modules.push(summary.path);
        
        globalsList.push(...globals.map(name => `${summary.path}:${name}`));
        functionsList.push(...functions.map(name => `${summary.path}:${name}`));
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return {
      moduleSummaries,
      modules,
      globalsList,
      functionsList
    };
  }
}

class TemplateGeneratorService {
  constructor(templateRoot) {
    this.templateRoot = templateRoot;
  }

  generate(request) {
    if (!this.templateRoot) return;
    
    const createdTemplates = [];
    if (!fs.existsSync(this.templateRoot)) {
      fs.mkdirSync(this.templateRoot, { recursive: true });
    }

    for (const module of request.module_summaries) {
      if (DocumentationAnalyzer.isDocumented(module.path, request.existing_doc_text)) {
        continue;
      }

      const modulePath = path.parse(module.path);
      const targetDir = path.join(this.templateRoot, modulePath.dir);
      
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const targetFile = path.join(targetDir, `${modulePath.name}.md`);
      if (fs.existsSync(targetFile)) continue;

      const template = this._renderModuleTemplate(module);
      fs.writeFileSync(targetFile, template, 'utf8');
      createdTemplates.push(targetFile);
    }

    if (createdTemplates.length > 0) {
      console.log(
        STRINGS.module_template_written
          .replace('{count}', createdTemplates.length)
          .replace('{path}', this.templateRoot)
      );
    }
  }

  _renderModuleTemplate(module) {
    const lines = [
      STRINGS.module_template_title.replace('{module}', module.path),
      '',
      STRINGS.template_intro,
      '',
      STRINGS.template_overview_heading,
      STRINGS.template_overview_purpose,
      STRINGS.template_overview_entry,
      '',
      STRINGS.template_globals_heading,
    ];

    if (module.globals.length > 0) {
      lines.push(...module.globals.map(name => 
        STRINGS.template_global_entry.replace('{name}', name)
      ));
    } else {
      lines.push(STRINGS.template_none_yet);
    }

    lines.push('', STRINGS.template_functions_heading);
    
    if (module.functions.length > 0) {
      lines.push(...module.functions.map(name => 
        STRINGS.template_function_entry.replace('{name}', name)
      ));
    } else {
      lines.push(STRINGS.template_none_yet);
    }

    lines.push(
      '',
      STRINGS.template_examples_heading,
      STRINGS.template_code_block_start,
      STRINGS.template_examples_note,
      STRINGS.template_code_block_end,
      '',
      STRINGS.template_related_heading,
      STRINGS.template_related_item
    );

    return lines.join('\n') + '\n';
  }
}

class PenaltyCalculatorService {
  constructor(config) {
    this.config = config;
  }

  calculate(request) {
    const components = {
      stub_templates: this._findStubTemplates(request.documented_modules),
      missing_readmes: this._missingReadmes(),
      extra_docs: this._extraDocs(request.documented_module_roots),
      bootstrap_extra: this._bootstrapExtra(request.entries),
      misplaced: this._misplaced(request.entries),
      broken_readme_links: this._brokenReadmeLinks(),
      missing_readme_links: this._missingReadmeLinks(),
    };

    const penalties = {};
    for (const [name, items] of Object.entries(components)) {
      penalties[name] = this._penalty(items);
    }

    const total = Math.min(Object.values(penalties).reduce((sum, val) => sum + val, 0), 100.0);

    return {
      ...components,
      penalties: {
        stub_templates: penalties.stub_templates,
        missing_readmes: penalties.missing_readmes,
        extra_docs: penalties.extra_docs,
        bootstrap_extra: penalties.bootstrap_extra,
        misplaced: penalties.misplaced,
        broken_readme_links: penalties.broken_readme_links,
        missing_readme_links: penalties.missing_readme_links,
      },
      total
    };
  }

  _findStubTemplates(documentedModules) {
    const templates = [];
    const matched = [];
    const stubPath = path.join(this.config.doc_root, 'api', 'stubs');

    if (!fs.existsSync(stubPath)) return templates;

    const scanDirectory = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (item.endsWith('.md')) {
          try {
            const text = fs.readFileSync(fullPath, 'utf8');
            if (!text.includes(STRINGS.stub_template_phrase)) continue;

            const match = text.match(DocumentationAnalyzer.MODULE_HEADING_RE);
            if (match && match[1]) {
              const modulePath = match[1].toLowerCase();
              if (documentedModules.has(modulePath)) {
                matched.push(fullPath);
              } else {
                templates.push(fullPath);
              }
            }
          } catch (error) {
            // Skip files that can't be read
          }
        }
      }
    };

    scanDirectory(stubPath);
    
    // Handle matched stubs if fix_stubs is enabled
    if (this.config.fix_stubs && matched.length > 0) {
      for (const filePath of matched) {
        try {
          fs.unlinkSync(filePath);
        } catch (error) {
          // Continue if deletion fails
        }
      }
      console.log(`Removed ${matched.length} stub templates whose modules already have docs.`);
    }

    return templates;
  }

  _missingReadmes() {
    const missing = [];
    const apiRoot = path.join(this.config.doc_root, 'api');

    if (!fs.existsSync(apiRoot)) return missing;

    const directories = new Set();

    const scanDirectory = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (item.endsWith('.md')) {
          directories.add(path.dirname(fullPath));
        }
      }
    };

    scanDirectory(apiRoot);

    for (const directory of directories) {
      if (directory === apiRoot) continue;
      const readmePath = path.join(directory, 'README.md');
      if (!fs.existsSync(readmePath)) {
        missing.push(directory);
      }
    }

    return missing.sort();
  }

  _extraDocs(documentedModuleRoots) {
    const recorded = new Set(this.config.modules.map(m => m.toLowerCase()));
    const extras = [];

    for (const doc of documentedModuleRoots) {
      if (
        !recorded.has(doc.toLowerCase()) &&
        this._isCodeModulePath(doc) &&
        !this._isInIgnoreDir(doc) &&
        !doc.toLowerCase().startsWith('bootstrap')
      ) {
        extras.push(doc);
      }
    }

    return extras.sort();
  }

  _bootstrapExtra(entries) {
    const unmatched = [];
    
    for (const { path: docPath, module: modulePath } of entries) {
      if (!this._matchesSection(docPath)) continue;
      
      const target = path.join(this.config.code_root, modulePath);
      if (!fs.existsSync(target)) {
        unmatched.push({ docPath, modulePath });
      }
    }

    return unmatched;
  }

  _misplaced(entries) {
    const misplaced = [];
    
    for (const { path: docPath, module } of entries) {
      if (!module.toLowerCase().startsWith('bootstrap')) continue;
      
      const relative = path.relative(this.config.doc_root, docPath);
      const expected = this._expectedDocPath(module);
      
      if (relative !== expected) {
        misplaced.push({ actual: relative, expected });
      }
    }

    return misplaced;
  }

  _brokenReadmeLinks() {
    const broken = [];
    
    const scanForReadmes = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanForReadmes(fullPath);
        } else if (item === 'README.md') {
          try {
            const text = fs.readFileSync(fullPath, 'utf8');
            const matches = text.matchAll(DocumentationAnalyzer.LINK_TARGET_RE);
            
            for (const match of matches) {
              const href = match[1].trim();
              if (!href || href.startsWith(('http://', 'https://', 'mailto:')) || href.startsWith('#')) {
                continue;
              }

              const cleaned = href.split('?')[0].split('#')[0].trim();
              if (!cleaned) continue;

              const suffix = path.extname(cleaned).toLowerCase();
              if (suffix && !['.md', '.mdx'].includes(suffix)) continue;

              const target = path.join(path.dirname(fullPath), cleaned);
              if (!fs.existsSync(target)) {
                broken.push({ 
                  readme: path.relative(this.config.doc_root, fullPath), 
                  target: cleaned 
                });
              }
            }
          } catch (error) {
            // Skip files that can't be read
          }
        }
      }
    };

    scanForReadmes(this.config.doc_root);
    return broken;
  }

  _missingReadmeLinks() {
    const missing = [];
    
    const scanForReadmes = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanForReadmes(fullPath);
        } else if (item === 'README.md') {
          const filesInDir = new Set();
          const dirItems = fs.readdirSync(path.dirname(fullPath));
          
          for (const dirItem of dirItems) {
            const dirItemPath = path.join(path.dirname(fullPath), dirItem);
            if (fs.statSync(dirItemPath).isFile() && 
                ['.md', '.mdx'].includes(path.extname(dirItem).toLowerCase()) &&
                dirItem !== 'README.md') {
              filesInDir.add(dirItem);
            }
          }

          if (filesInDir.size === 0) continue;

          const linked = new Set();
          
          try {
            const text = fs.readFileSync(fullPath, 'utf8');
            const matches = text.matchAll(DocumentationAnalyzer.LINK_TARGET_RE);
            
            for (const match of matches) {
              const href = match[1].trim();
              if (!href || href.startsWith(('http://', 'https://', 'mailto:')) || href.startsWith('#')) {
                continue;
              }

              const cleaned = href.split('?')[0].split('#')[0].trim();
              if (!cleaned) continue;

              const target = path.join(path.dirname(fullPath), cleaned);
              if (fs.existsSync(target) && filesInDir.has(path.basename(target))) {
                linked.add(path.basename(target));
              }
            }
          } catch (error) {
            // Skip files that can't be read
          }

          const missingFiles = Array.from(filesInDir).filter(f => !linked.has(f));
          if (missingFiles.length > 0) {
            missing.push({
              readme: path.relative(this.config.doc_root, fullPath),
              missing: missingFiles.sort()
            });
          }
        }
      }
    };

    scanForReadmes(this.config.doc_root);
    return missing;
  }

  _isCodeModulePath(modulePath) {
    const cleaned = modulePath.trim();
    if (cleaned.includes('<') || cleaned.includes('>')) return false;
    
    const lower = cleaned.toLowerCase();
    const hasValidExtension = DEFAULT_EXTENSIONS.some(ext => lower.endsWith(ext));
    return hasValidExtension && !lower.startsWith('docs/');
  }

  _isInIgnoreDir(modulePath) {
    const cleaned = modulePath.trim().replace(/^\.\//, '');
    if (!cleaned) return false;
    
    const firstPart = cleaned.split('/')[0];
    return DEFAULT_IGNORE_DIRS.includes(firstPart);
  }

  _matchesSection(docPath) {
    const relative = path.relative(this.config.doc_root, docPath);
    
    for (const section of BASE_PATH_CONFIG.mirror_sections) {
      const docPrefix = section.doc_prefix;
      if (relative.startsWith(docPrefix)) {
        return true;
      }
    }
    
    return false;
  }

  _expectedDocPath(modulePath) {
    const cleaned = modulePath.trim();
    const override = BASE_PATH_CONFIG.module_overrides[cleaned];
    if (override) return override;
    
    const sanitized = path.parse(cleaned);
    const base = sanitized.ext ? sanitized.name : cleaned;
    return path.join(BASE_PATH_CONFIG.doc_base, `${base}.md`);
  }

  _penalty(items) {
    return Math.min(items.length * 2.0, 100.0);
  }
}

class ReporterService {
  constructor(docRoot) {
    this.docRoot = docRoot;
  }

  publish(metrics) {
    console.log();
    console.log(STRINGS.coverage_heading);
    console.log('----------------------');
    
    // Summary rows
    const summaryRows = [
      ['Modules', `${metrics.module_docged}/${metrics.module_total} documented`],
      ['Globals', `${metrics.globals_docged}/${metrics.globals_total}`],
      ['Functions / Classes', `${metrics.functions_docged}/${metrics.functions_total}`],
    ];

    for (const [label, value] of summaryRows) {
      console.log(`${label}:    ${value}`);
    }

    // Missing items
    if (metrics.missing_modules.length > 0) {
      console.log(STRINGS.missing_modules);
      for (const module of metrics.missing_modules) {
        console.log(`  - ${module}`);
      }
    }

    if (metrics.missing_globals.length > 0) {
      console.log(STRINGS.missing_globals_title);
      for (const item of metrics.missing_globals) {
        console.log(`  - ${item}`);
      }
    }

    if (metrics.missing_functions.length > 0) {
      console.log(STRINGS.missing_functions_title);
      for (const item of metrics.missing_functions) {
        console.log(`  - ${item}`);
      }
    }

    // Penalty information
    const penaltyConfig = [
      { key: 'stub_templates', title: STRINGS.stub_penalty_note },
      { key: 'missing_readmes', title: 'missing README files' },
      { key: 'extra_docs', title: 'extra module docs' },
      { key: 'bootstrap_extra', title: 'unmatched bootstrap docs' },
      { key: 'misplaced', title: 'misplaced docs' },
      { key: 'broken_readme_links', title: 'broken README links' },
      { key: 'missing_readme_links', title: 'missing README links' },
    ];

    if (metrics.penalties.total > 0) {
      const activePenalties = penaltyConfig
        .filter(config => metrics.penalties[config.key] && metrics.penalties[config.key].length > 0)
        .map(config => `${metrics.penalties[config.key].length} ${config.title}`);
      
      const reason = activePenalties.join(' and ');
      console.log(
        `Overall:    ${metrics.coverage_with_penalty.toFixed(1)}% ` +
        `(penalized ${metrics.penalties.total.toFixed(1)}% for ${reason})`
      );
    } else {
      console.log(`Overall:    ${metrics.coverage_pct.toFixed(1)}%`);
    }

    // Detailed sections
    const sectionConfig = [
      { title: STRINGS.missing_readme_title, items: metrics.penalties.missing_readmes },
      { title: STRINGS.bootstrap_unmatched_title, items: metrics.penalties.bootstrap_extra },
      { title: STRINGS.extra_docs_title, items: metrics.penalties.extra_docs },
      { title: STRINGS.misplaced_docs_title, items: metrics.penalties.misplaced },
      { title: STRINGS.broken_readme_links_title, items: metrics.penalties.broken_readme_links },
      { title: STRINGS.missing_readme_links_title, items: metrics.penalties.missing_readme_links },
    ];

    for (const section of sectionConfig) {
      if (!section.items || section.items.length === 0) continue;
      
      console.log(section.title);
      for (const item of section.items) {
        if (typeof item === 'string') {
          console.log(`  - ${item}`);
        } else if (item.readme) {
          console.log(`  - ${item.readme} -> ${item.target || item.missing?.join(', ')}`);
        } else if (item.actual && item.expected) {
          console.log(`  - ${item.actual} (expected ${item.expected})`);
        }
      }
    }
  }
}

// Workflow Framework
class DocCoverageFramework {
  constructor(config, services) {
    this.config = config;
    this.services = services;
    this.results = new ReportMetrics();
  }

  async run() {
    const context = {
      module_summaries: [],
      modules: [],
      globals_list: [],
      functions_list: [],
      ignore_paths: [],
      existing_doc_text: '',
      doc_text: '',
      documented_entries: [],
      documented_modules: new Set(),
      documented_module_roots: [],
    };

    const steps = this._workflowSteps();
    for (const step of steps) {
      await step.action(context);
    }

    return this.results;
  }

  _workflowSteps() {
    return [
      { name: 'collect modules', action: this._collectModules.bind(this) },
      { name: 'load docs for templates', action: this._loadExistingDocs.bind(this) },
      { name: 'generate templates', action: this._generateTemplates.bind(this) },
      { name: 'reload docs', action: this._reloadDocs.bind(this) },
      { name: 'compute coverage', action: this._computeCoverage.bind(this) },
      { name: 'calculate penalties', action: this._calculatePenalties.bind(this) },
      { name: 'publish report', action: this._publish.bind(this) },
    ];
  }

  async _collectModules(context) {
    const collector = this.services.get('module_collector');
    const result = collector.collect({ ignore_dirs: DEFAULT_IGNORE_DIRS });
    
    context.module_summaries = result.module_summaries;
    context.modules = result.modules;
    context.globals_list = result.globalsList;
    context.functions_list = result.functionsList;
  }

  async _loadExistingDocs(context) {
    const { collectedText } = DocumentationAnalyzer.loadDocs(
      this.config.doc_root, 
      context.ignore_paths
    );
    context.existing_doc_text = collectedText;
  }

  async _generateTemplates(context) {
    const templateGen = this.services.get('template_generator');
    templateGen.generate({
      module_summaries: context.module_summaries,
      existing_doc_text: context.existing_doc_text,
    });
  }

  async _reloadDocs(context) {
    const { collectedText, entries } = DocumentationAnalyzer.loadDocs(
      this.config.doc_root, 
      context.ignore_paths
    );
    context.doc_text = collectedText;
    context.documented_entries = entries;
  }

  async _computeCoverage(context) {
    const documentedModules = new Set(
      context.documented_entries
        .filter(entry => entry.module)
        .map(entry => entry.module.toLowerCase())
    );
    
    context.documented_modules = documentedModules;
    context.documented_module_roots = context.documented_entries
      .filter(entry => entry.module)
      .map(entry => entry.module);

    // Module coverage
    const { documented: moduleDocged, total: moduleTotal } = 
      DocumentationAnalyzer.computeCoverage(context.modules, context.doc_text);
    
    // Global coverage
    const { documented: globalsDocged, total: globalsTotal } = 
      DocumentationAnalyzer.computeCoverage(context.globals_list, context.doc_text);
    
    // Function coverage
    const { documented: functionsDocged, total: functionsTotal } = 
      DocumentationAnalyzer.computeCoverage(context.functions_list, context.doc_text);

    // Missing items
    const missingGlobals = DocumentationAnalyzer.findMissingNames(context.globals_list, context.doc_text);
    const missingFunctions = DocumentationAnalyzer.findMissingNames(context.functions_list, context.doc_text);

    // Calculate overall coverage
    const overallTotal = moduleTotal + globalsTotal + functionsTotal;
    const overallDocged = moduleDocged + globalsDocged + functionsDocged;
    const coveragePct = overallTotal > 0 ? (overallDocged / overallTotal * 100) : 100.0;

    // Update context
    context.module_docged = moduleDocged;
    context.module_total = moduleTotal;
    context.globals_docged = globalsDocged;
    context.globals_total = globalsTotal;
    context.functions_docged = functionsDocged;
    context.functions_total = functionsTotal;
    context.missing_globals = missingGlobals;
    context.missing_functions = missingFunctions;
    context.coverage_pct = coveragePct;
  }

  async _calculatePenalties(context) {
    const penaltyCalc = this.services.get('penalty_calculator');
    const penalties = penaltyCalc.calculate({
      documented_module_roots: context.documented_module_roots,
      documented_modules: context.documented_modules,
      entries: context.documented_entries,
    });

    context.penalties = penalties;
    context.coverage_with_penalty = Math.max(context.coverage_pct - penalties.total, 0.0);
  }

  async _publish(context) {
    const metrics = new ReportMetrics();
    metrics.module_docged = context.module_docged;
    metrics.module_total = context.module_total;
    metrics.globals_docged = context.globals_docged;
    metrics.globals_total = context.globals_total;
    metrics.functions_docged = context.functions_docged;
    metrics.functions_total = context.functions_total;
    metrics.missing_globals = context.missing_globals;
    metrics.missing_functions = context.missing_functions;
    metrics.coverage_pct = context.coverage_pct;
    metrics.coverage_with_penalty = context.coverage_with_penalty;
    metrics.penalties = context.penalties;

    const reporter = this.services.get('reporter');
    reporter.publish(metrics);

    this.results = metrics;
  }
}

// Main Plugin Class
class DocCoveragePlugin extends BasePlugin {
  constructor() {
    super({
      name: 'doc-coverage',
      description: 'Comprehensive JavaScript documentation coverage analysis with Python feature parity',
      version: '2.0.0',
      author: 'RWTRA',
      category: 'analysis',
      commands: [
        {
          name: 'doc-coverage',
          description: 'Run comprehensive documentation coverage analysis'
        }
      ],
      dependencies: []
    });

    this.pathConfig = this._deepCopy(BASE_PATH_CONFIG);
    this.services = new Map();
  }

  /**
   * Main plugin execution method
   */
  async execute(context) {
    await this.initialize(context);
    
    this.log('Starting comprehensive documentation coverage analysis...', 'info');
    this.log(this.colorize('📚 Enhanced Documentation Coverage Analysis', context.colors.cyan));
    this.log(this.colorize('='.repeat(50), context.colors.white));
    
    const startTime = Date.now();
    
    try {
      const config = this._createConfig(context);
      this._initializeServices(config);
      
      const framework = new DocCoverageFramework(config, this.services);
      await framework.run();
      
      this.results = {
        coverage: `${framework.results.coverage_with_penalty.toFixed(1)}%`,
        modules: {
          documented: framework.results.module_docged,
          total: framework.results.module_total
        },
        globals: {
          documented: framework.results.globals_docged,
          total: framework.results.globals_total
        },
        functions: {
          documented: framework.results.functions_docged,
          total: framework.results.functions_total
        },
        missing: [
          ...framework.results.missing_modules,
          ...framework.results.missing_globals,
          ...framework.results.missing_functions
        ],
        analysisTime: ((Date.now() - startTime) / 1000).toFixed(2),
        fallbackUsed: false,
        penalties: framework.results.penalties
      };
      
      this._generateEnhancedReport(context);
      
      if (context.options.output) {
        await this._saveResults(context);
      }
      
      return this.results;
      
    } catch (error) {
      this.log(`Analysis failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Create configuration from context
   */
  _createConfig(context) {
    const projectRoot = context.options['project-root'] || path.join(context.bootstrapPath, '..');
    const codeRoot = context.options['code-root'] || '.';
    const docRoot = context.options['doc-root'] || 'docs';
    const templateRoot = context.options['template-root'] || null;
    const fixStubs = context.options['fix-stubs'] || false;
    const extensions = this._parseExtensions(context.options['extensions'] || '');

    return {
      code_root: path.resolve(projectRoot, codeRoot),
      doc_root: path.resolve(projectRoot, docRoot),
      template_root: templateRoot ? path.resolve(projectRoot, templateRoot) : null,
      extensions,
      fix_stubs: fixStubs
    };
  }

  /**
   * Initialize service instances
   */
  _initializeServices(config) {
    this.services.set('module_collector', new ModuleCollectorService({
      codeRoot: config.code_root,
      extensions: config.extensions
    }));

    this.services.set('template_generator', new TemplateGeneratorService(config.template_root));
    
    this.services.set('penalty_calculator', new PenaltyCalculatorService({
      doc_root: config.doc_root,
      code_root: config.code_root,
      modules: [], // Will be populated during execution
      fix_stubs: config.fix_stubs
    }));

    this.services.set('reporter', new ReporterService(config.doc_root));
  }

  /**
   * Parse extensions string into array
   */
  _parseExtensions(value) {
    const candidates = value.split(',').map(part => part.trim()).filter(part => part);
    if (candidates.length === 0) return [...DEFAULT_EXTENSIONS];
    
    return candidates.map(ext => ext.startsWith('.') ? ext : `.${ext}`);
  }

  /**
   * Generate enhanced report with recommendations
   */
  _generateEnhancedReport(context) {
    console.log(context.colors.reset + '\n📊 ENHANCED DOCUMENTATION COVERAGE REPORT');
    console.log('========================================');
    
    const coverage = parseFloat(this.results.coverage);
    
    // Summary
    console.log('\n📈 SUMMARY:');
    console.log(`   Overall Coverage: ${this.results.coverage}`);
    console.log(`   Analysis Time: ${this.results.analysisTime}s`);
    console.log(`   Analysis Mode: Native JavaScript (Enhanced)`);
    
    console.log(`   Modules: ${this.results.modules.documented}/${this.results.modules.total}`);
    console.log(`   Globals: ${this.results.globals.documented}/${this.results.globals.total}`);
    console.log(`   Functions: ${this.results.functions.documented}/${this.results.functions.total}`);
    
    // Coverage by category
    const moduleCoverage = this.results.modules.total > 0 ? 
      Math.round((this.results.modules.documented / this.results.modules.total) * 100) : 0;
    const globalCoverage = this.results.globals.total > 0 ? 
      Math.round((this.results.globals.documented / this.results.globals.total) * 100) : 0;
    const functionCoverage = this.results.functions.total > 0 ? 
      Math.round((this.results.functions.documented / this.results.functions.total) * 100) : 0;
    
    console.log('\n📋 COVERAGE BY CATEGORY:');
    console.log(`   Modules: ${moduleCoverage}%`);
    console.log(`   Globals: ${globalCoverage}%`);
    console.log(`   Functions: ${functionCoverage}%`);
    
    // Missing items summary
    if (this.results.missing.length > 0) {
      console.log('\n📚 MISSING ITEMS SUMMARY:');
      console.log(`   Total missing: ${this.results.missing.length}`);
      const displayItems = this.results.missing.slice(0, 5);
      for (const item of displayItems) {
        console.log(context.colors.red + `   - ${item}` + context.colors.reset);
      }
      if (this.results.missing.length > 5) {
        console.log(context.colors.red + `   ... and ${this.results.missing.length - 5} more items` + context.colors.reset);
      }
    }
    
    // Recommendations
    console.log('\n🎯 ENHANCED RECOMMENDATIONS:');
    this._generateEnhancedRecommendations(context, coverage);
  }

  /**
   * Generate enhanced recommendations based on analysis
   */
  _generateEnhancedRecommendations(context, coverage) {
    if (coverage === 100) {
      console.log(context.colors.green + '   ✅ Perfect documentation coverage!' + context.colors.reset);
      console.log(context.colors.green + '   - Maintain current documentation standards' + context.colors.reset);
    } else if (coverage >= 90) {
      console.log(context.colors.green + '   ✅ Excellent documentation coverage!' + context.colors.reset);
      console.log(context.colors.yellow + '   - Document the remaining few items for perfection' + context.colors.reset);
    } else if (coverage >= 80) {
      console.log(context.colors.green + '   ✅ Good documentation coverage!' + context.colors.reset);
      console.log(context.colors.yellow + '   - Focus on undocumented modules and functions' + context.colors.reset);
    } else if (coverage >= 60) {
      console.log(context.colors.yellow + '   ⚠️  Documentation coverage needs improvement' + context.colors.reset);
      console.log(context.colors.yellow + '   - Priority: Document core modules and public APIs' + context.colors.reset);
      console.log(context.colors.yellow + '   - Add JSDoc comments to exported functions' + context.colors.reset);
    } else {
      console.log(context.colors.red + '   ❌ Poor documentation coverage' + context.colors.reset);
      console.log(context.colors.red + '   - Urgent: Add basic documentation to all public modules' + context.colors.reset);
      console.log(context.colors.red + '   - Focus on entry points and exported functions' + context.colors.reset);
      console.log(context.colors.red + '   - Consider automated documentation generation' + context.colors.reset);
    }
    
    // Specific recommendations based on missing items
    if (this.results.missing.length > 0) {
      console.log(context.colors.cyan + `   - Add documentation for ${this.results.missing.length} missing items` + context.colors.reset);
    }
    
    if (this.results.modules.documented < this.results.modules.total) {
      console.log(context.colors.cyan + '   - Add module-level JSDoc comments with @module tag' + context.colors.reset);
    }
    
    if (this.results.functions.documented < this.results.functions.total) {
      console.log(context.colors.cyan + '   - Add function documentation with @param, @returns, and @description' + context.colors.reset);
    }
    
    if (this.results.globals.documented < this.results.globals.total) {
      console.log(context.colors.cyan + '   - Document exported constants and variables with @const' + context.colors.reset);
    }

    // Penalty-specific recommendations
    if (this.results.penalties) {
      if (this.results.penalties.stub_templates && this.results.penalties.stub_templates.length > 0) {
        console.log(context.colors.yellow + '   - Convert or remove stub templates to eliminate penalties' + context.colors.reset);
      }
      
      if (this.results.penalties.missing_readmes && this.results.penalties.missing_readmes.length > 0) {
        console.log(context.colors.yellow + '   - Add README.md files to documentation directories' + context.colors.reset);
      }
      
      if (this.results.penalties.broken_readme_links && this.results.penalties.broken_readme_links.length > 0) {
        console.log(context.colors.yellow + '   - Fix broken links in README files' + context.colors.reset);
      }
    }
  }

  /**
   * Save results to file
   */
  async _saveResults(context) {
    const outputDir = context.options['output-dir'] || path.join(context.bootstrapPath, 'reports');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsPath = path.join(outputDir, `doc-coverage-${timestamp}.json`);
    
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        coverage: this.results.coverage,
        analysisTime: this.results.analysisTime,
        analysisMode: 'Native JavaScript Enhanced',
        fallbackUsed: this.results.fallbackUsed
      },
      categories: {
        modules: this.results.modules,
        globals: this.results.globals,
        functions: this.results.functions
      },
      missing: this.results.missing,
      penalties: this.results.penalties
    };
    
    fs.writeFileSync(resultsPath, JSON.stringify(reportData, null, 2), 'utf8');
    this.log(`Enhanced results saved to: ${resultsPath}`, 'info');
  }

  /**
   * Deep copy utility for configuration
   */
  _deepCopy(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => this._deepCopy(item));
    if (typeof obj === 'object') {
      const copy = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          copy[key] = this._deepCopy(obj[key]);
        }
      }
      return copy;
    }
  }
}

module.exports = DocCoveragePlugin;
