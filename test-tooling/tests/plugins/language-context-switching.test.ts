/**
 * Language Context Switching Tests
 * Tests for complex language context scenarios and edge cases
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';

// Mock the plugin system
const mockBasePlugin = {
  BaseLanguagePlugin: class MockBaseLanguagePlugin {
    public name: string;
    public language: string;
    public fileExtensions: string[];
    public currentLanguageContext: any;
    public crossLanguageMappings: any;
    public logs: any[];

    constructor(metadata: any) {
      this.name = metadata.name;
      this.language = metadata.language;
      this.fileExtensions = metadata.fileExtensions || [];
      this.currentLanguageContext = null;
      this.crossLanguageMappings = {};
      this.logs = [];
    }

    log(message: string, level: string = 'info') {
      this.logs.push({ message, level, timestamp: new Date() });
    }

    async setLanguageContext(context: any) {
      if (!context || !context.language) {
        throw new Error('Language context is required');
      }

      this.currentLanguageContext = {
        ...context,
        timestamp: new Date().toISOString(),
        pluginName: this.name
      };

      await this.initializeLanguageServices(this.currentLanguageContext);
      this.log(`Language context set for ${context.language}`, 'info');
    }

    getLanguageContext() {
      return this.currentLanguageContext;
    }

    async initializeLanguageServices(context: any) {
      if (this.language === context.language) {
        return;
      }
      await this.setupCrossLanguageSupport(context);
    }

    async setupCrossLanguageSupport(context: any) {
      this.log(`Setting up cross-language support for ${this.language} → ${context.language}`, 'info');
    }

    async resetLanguageContext() {
      this.currentLanguageContext = null;
      this.log('Language context reset', 'info');
    }

    getLanguageContextMetadata() {
      return {
        hasContext: !!this.currentLanguageContext,
        contextTimestamp: this.currentLanguageContext?.timestamp,
        contextLanguage: this.currentLanguageContext?.language,
        pluginName: this.name,
        supportedLanguages: [this.language],
        capabilities: {
          crossLanguageSupport: true,
          contextValidation: true,
          contextReset: true
        }
      };
    }
  }
};

// Import plugins after mocking
const JavaScriptLanguagePlugin = require('../../plugins/language_plugins/javascript/javascript.language.js');
const GoLanguagePlugin = require('../../plugins/language_plugins/go/go.language.js');
const RubyLanguagePlugin = require('../../plugins/language_plugins/ruby/ruby.language.js');

describe('Language Context Switching Tests', () => {
  let jsPlugin: any;
  let goPlugin: any;
  let rubyPlugin: any;

  beforeEach(() => {
    jsPlugin = new JavaScriptLanguagePlugin();
    goPlugin = new GoLanguagePlugin();
    rubyPlugin = new RubyLanguagePlugin();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Context Management', () => {
    test('should set and retrieve language context', async () => {
      const context = {
        language: 'javascript',
        projectPath: '/test/project',
        config: { typescript: true }
      };

      await jsPlugin.setLanguageContext(context);
      const retrievedContext = jsPlugin.getLanguageContext();

      expect(retrievedContext).toBeDefined();
      expect(retrievedContext.language).toBe('javascript');
      expect(retrievedContext.projectPath).toBe('/test/project');
      expect(retrievedContext.timestamp).toBeDefined();
      expect(retrievedContext.pluginName).toBe('javascript');
    });

    test('should reset language context', async () => {
      await jsPlugin.setLanguageContext({ language: 'javascript' });
      expect(jsPlugin.getLanguageContext()).toBeDefined();

      await jsPlugin.resetLanguageContext();
      expect(jsPlugin.getLanguageContext()).toBeNull();
    });

    test('should validate context metadata', async () => {
      await jsPlugin.setLanguageContext({ language: 'javascript' });
      const metadata = jsPlugin.getLanguageContextMetadata();

      expect(metadata.hasContext).toBe(true);
      expect(metadata.contextLanguage).toBe('javascript');
      expect(metadata.supportedLanguages).toContain('javascript');
      expect(metadata.capabilities.crossLanguageSupport).toBe(true);
    });
  });

  describe('Context Validation Edge Cases', () => {
    test('should throw error for null context', async () => {
      await expect(jsPlugin.setLanguageContext(null as any)).rejects.toThrow('Language context is required');
    });

    test('should throw error for undefined context', async () => {
      await expect(jsPlugin.setLanguageContext(undefined as any)).rejects.toThrow('Language context is required');
    });

    test('should throw error for context without language', async () => {
      const invalidContext = { projectPath: '/test' };
      await expect(jsPlugin.setLanguageContext(invalidContext as any)).rejects.toThrow('Language context must specify a language');
    });

    test('should handle empty context gracefully', async () => {
      const emptyContext = { language: '', projectPath: '' };
      
      // Should not throw for technically valid but empty context
      await expect(jsPlugin.setLanguageContext(emptyContext)).resolves.not.toThrow();
      
      const retrieved = jsPlugin.getLanguageContext();
      expect(retrieved.language).toBe('');
      expect(retrieved.projectPath).toBe('');
    });
  });

  describe('Cross-Language Context Switching', () => {
    test('should handle same language context switching', async () => {
      const jsContext = { language: 'javascript', projectPath: '/js/project' };
      
      await jsPlugin.setLanguageContext(jsContext);
      const initialLogs = jsPlugin.logs.length;

      // Setting same language should not trigger cross-language setup
      await jsPlugin.setLanguageContext({ ...jsContext, config: { new: true } });
      
      expect(jsPlugin.logs.length).toBe(initialLogs + 2); // Only the set context logs
    });

    test('should handle different language context switching', async () => {
      const jsContext = { language: 'javascript', projectPath: '/js/project' };
      const goContext = { language: 'go', projectPath: '/go/project' };
      
      await jsPlugin.setLanguageContext(goContext);
      
      const retrievedContext = jsPlugin.getLanguageContext();
      expect(retrievedContext.language).toBe('go');
      
      // Should have cross-language setup logs
      const crossLanguageLogs = jsPlugin.logs.filter(log => 
        log.message.includes('cross-language support')
      );
      expect(crossLanguageLogs.length).toBeGreaterThan(0);
    });

    test('should handle rapid context switching', async () => {
      const contexts = [
        { language: 'javascript', projectPath: '/js' },
        { language: 'go', projectPath: '/go' },
        { language: 'ruby', projectPath: '/ruby' },
        { language: 'python', projectPath: '/python' }
      ];

      for (const context of contexts) {
        await jsPlugin.setLanguageContext(context);
      }

      const finalContext = jsPlugin.getLanguageContext();
      expect(finalContext.language).toBe('python');

      // Should have logs for each context switch
      expect(jsPlugin.logs.length).toBeGreaterThanOrEqual(contexts.length);
    });
  });

  describe('Complex Context Scenarios', () => {
    test('should handle context with nested configuration', async () => {
      const complexContext = {
        language: 'javascript',
        projectPath: '/complex/project',
        config: {
          typescript: true,
          react: true,
          webpack: {
            mode: 'development',
            devtool: 'source-map'
          },
          plugins: [
            { name: 'babel-loader', options: {} },
            { name: 'ts-loader', options: {} }
          ]
        },
        metadata: {
          version: '1.0.0',
          author: 'Test Author',
          description: 'Complex test project'
        }
      };

      await jsPlugin.setLanguageContext(complexContext);
      const retrieved = jsPlugin.getLanguageContext();

      expect(retrieved.config.typescript).toBe(true);
      expect(retrieved.config.webpack.mode).toBe('development');
      expect(retrieved.config.plugins).toHaveLength(2);
      expect(retrieved.metadata.author).toBe('Test Author');
    });

    test('should handle context with circular references', async () => {
      const circularContext: any = {
        language: 'javascript',
        projectPath: '/circular'
      };
      
      // Create circular reference
      circularContext.self = circularContext;

      // Should handle circular references gracefully
      await expect(jsPlugin.setLanguageContext(circularContext)).resolves.not.toThrow();
      
      const retrieved = jsPlugin.getLanguageContext();
      expect(retrieved.self).toBe(circularContext);
    });

    test('should handle context with functions and symbols', async () => {
      const testFunction = () => 'test';
      const testSymbol = Symbol('test');
      
      const functionalContext = {
        language: 'javascript',
        projectPath: '/functional',
        callback: testFunction,
        symbol: testSymbol
      };

      await jsPlugin.setLanguageContext(functionalContext);
      const retrieved = jsPlugin.getLanguageContext();

      expect(typeof retrieved.callback).toBe('function');
      expect(retrieved.symbol).toBe(testSymbol);
    });
  });

  describe('Language-Specific Context Handling', () => {
    test('JavaScript plugin should handle TypeScript configuration', async () => {
      const tsContext = {
        language: 'javascript',
        projectPath: '/ts-project',
        config: {
          typescript: true,
          strict: true,
          target: 'ES2020'
        }
      };

      await jsPlugin.setLanguageContext(tsContext);
      const crossTargets = await jsPlugin.getCrossLanguageBuildTargets({ language: 'python' });

      expect(crossTargets).toHaveLength(1);
      expect(crossTargets[0].name).toBe('python-to-js');
    });

    test('Go plugin should handle module configuration', async () => {
      const goContext = {
        language: 'go',
        projectPath: '/go-project',
        config: {
          requireGoMod: true,
          version: '1.21'
        }
      };

      await goPlugin.setLanguageContext(goContext);
      const crossTargets = await goPlugin.getCrossLanguageBuildTargets({ language: 'javascript' });

      expect(crossTargets).toHaveLength(1);
      expect(crossTargets[0].name).toBe('js-to-go');
    });

    test('Ruby plugin should handle bundler configuration', async () => {
      const rubyContext = {
        language: 'ruby',
        projectPath: '/ruby-project',
        config: {
          requireBundler: true,
          rails: true
        }
      };

      await rubyPlugin.setLanguageContext(rubyContext);
      const crossTargets = await rubyPlugin.getCrossLanguageBuildTargets({ language: 'java' });

      expect(crossTargets).toHaveLength(1);
      expect(crossTargets[0].name).toBe('java-to-ruby');
    });
  });

  describe('Error Recovery and Edge Cases', () => {
    test('should recover from context setting failures', async () => {
      const originalLog = console.error;
      console.error = jest.fn();

      // Simulate a failure during context setting
      const invalidContext = {
        language: 'javascript',
        projectPath: null // This might cause issues in some scenarios
      };

      try {
        await jsPlugin.setLanguageContext(invalidContext);
      } catch (error) {
        // Expected to fail
      }

      // Should be able to set a valid context afterward
      const validContext = { language: 'javascript', projectPath: '/valid' };
      await jsPlugin.setLanguageContext(validContext);

      const retrieved = jsPlugin.getLanguageContext();
      expect(retrieved.projectPath).toBe('/valid');

      console.error = originalLog;
    });

    test('should handle memory pressure scenarios', async () => {
      const largeContext = {
        language: 'javascript',
        projectPath: '/large',
        data: new Array(10000).fill('large-data-string')
      };

      await expect(jsPlugin.setLanguageContext(largeContext)).resolves.not.toThrow();
      
      const retrieved = jsPlugin.getLanguageContext();
      expect(retrieved.data).toHaveLength(10000);
    });

    test('should handle concurrent context setting', async () => {
      const contexts = [
        { language: 'javascript', projectPath: '/concurrent1' },
        { language: 'go', projectPath: '/concurrent2' },
        { language: 'ruby', projectPath: '/concurrent3' }
      ];

      // Set contexts concurrently
      const promises = contexts.map(context => jsPlugin.setLanguageContext(context));
      
      await Promise.all(promises);
      
      // Should have a valid context (last one set)
      const finalContext = jsPlugin.getLanguageContext();
      expect(finalContext).toBeDefined();
      expect(['javascript', 'go', 'ruby']).toContain(finalContext.language);
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle rapid context switching performance', async () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        await jsPlugin.setLanguageContext({
          language: 'javascript',
          projectPath: `/performance-${i}`
        });
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete 1000 context switches in reasonable time (< 5 seconds)
      expect(duration).toBeLessThan(5000);
    });

    test('should handle large context objects efficiently', async () => {
      const largeConfig = {};
      for (let i = 0; i < 1000; i++) {
        largeConfig[`key${i}`] = `value${i}`.repeat(100);
      }

      const largeContext = {
        language: 'javascript',
        projectPath: '/large-config',
        config: largeConfig
      };

      const startTime = Date.now();
      await jsPlugin.setLanguageContext(largeContext);
      const endTime = Date.now();

      const duration = endTime - startTime;
      
      // Should handle large objects efficiently (< 1 second)
      expect(duration).toBeLessThan(1000);
      
      const retrieved = jsPlugin.getLanguageContext();
      expect(Object.keys(retrieved.config)).toHaveLength(1000);
    });
  });

  describe('Integration with Plugin System', () => {
    test('should integrate with JavaScript plugin cross-language features', async () => {
      const jsContext = { language: 'javascript' };
      await jsPlugin.setLanguageContext(jsContext);

      // Test cross-language mappings
      const translated = jsPlugin.translatePattern('python', 'def');
      expect(translated).toBe('function');

      const goTranslated = jsPlugin.translatePattern('go', 'func');
      expect(goTranslated).toBe('function');
    });

    test('should integrate with Go plugin cross-language features', async () => {
      const goContext = { language: 'go' };
      await goPlugin.setLanguageContext(goContext);

      // Test cross-language mappings should be available
      expect(goPlugin.crossLanguageMappings).toBeDefined();
    });

    test('should integrate with Ruby plugin cross-language features', async () => {
      const rubyContext = { language: 'ruby' };
      await rubyPlugin.setLanguageContext(rubyContext);

      // Test cross-language mappings should be available
      expect(rubyPlugin.crossLanguageMappings).toBeDefined();
    });
  });
});
