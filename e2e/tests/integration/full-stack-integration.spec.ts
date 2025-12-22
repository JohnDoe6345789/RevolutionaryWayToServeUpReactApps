/**
 * Full Stack Integration Tests
 * Tests end-to-end functionality of the entire framework
 */

import { test, expect } from '@playwright/test';
import { chromium, Browser, Page } from '@playwright';

test.describe('Full Stack Integration Tests', () => {
  let browser: Browser;
  let page: Page;

  test.beforeAll(async () => {
    browser = await chromium.launch();
  });

  test.afterAll(async () => {
    await browser.close();
  });

  test.beforeEach(async () => {
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should load bootstrap system and detect languages', async () => {
    // Navigate to the bootstrap page
    await page.goto('http://localhost:4173');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that bootstrap system is loaded
    const bootstrapLoaded = await page.evaluate(() => {
      return typeof window !== 'undefined' && 
             window.__RWTRA_BOOTSTRAP_LOADED__ === true;
    });
    
    expect(bootstrapLoaded).toBe(true);
    
    // Check language detection
    const detectedLanguages = await page.evaluate(() => {
      return window.__RWTRA_DETECTED_LANGUAGES__ || [];
    });
    
    expect(detectedLanguages).toContain('javascript');
    expect(detectedLanguages).toContain('typescript');
  });

  test('should initialize plugin system with language context', async () => {
    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');
    
    // Test language context initialization
    const contextInitialized = await page.evaluate(() => {
      if (window.__RWTRA_LANGUAGE_CONTEXT__) {
        return {
          hasContext: true,
          language: window.__RWTRA_LANGUAGE_CONTEXT__.language,
          timestamp: window.__RWTRA_LANGUAGE_CONTEXT__.timestamp
        };
      }
      return { hasContext: false };
    });
    
    expect(contextInitialized.hasContext).toBe(true);
    expect(contextInitialized.language).toBeDefined();
    expect(contextInitialized.timestamp).toBeDefined();
  });

  test('should handle cross-language plugin operations', async () => {
    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');
    
    // Test cross-language functionality
    const crossLanguageSupport = await page.evaluate(async () => {
      if (window.__RWTRA_PLUGIN_SYSTEM__) {
        try {
          // Test context switching
          const jsContext = { language: 'javascript', projectPath: '/test/js' };
          await window.__RWTRA_PLUGIN_SYSTEM__.setLanguageContext(jsContext);
          
          const goContext = { language: 'go', projectPath: '/test/go' };
          await window.__RWTRA_PLUGIN_SYSTEM__.setLanguageContext(goContext);
          
          // Test cross-language build targets
          const buildTargets = await window.__RWTRA_PLUGIN_SYSTEM__.getCrossLanguageBuildTargets({
            language: 'javascript'
          });
          
          return {
            contextSwitching: true,
            buildTargets: buildTargets.length > 0,
            jsContextSet: window.__RWTRA_PLUGIN_SYSTEM__.getLanguageContext().language === 'go'
          };
        } catch (error) {
          return { error: error.message, contextSwitching: false };
        }
      }
      return { contextSwitching: false };
    });
    
    expect(crossLanguageSupport.contextSwitching).toBe(true);
    expect(crossLanguageSupport.buildTargets).toBe(true);
  });

  test('should render React application with proper structure', async () => {
    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');
    
    // Check for React application structure
    const appStructure = await page.evaluate(() => {
      const root = document.getElementById('root');
      if (!root) return { hasRoot: false };
      
      const children = root.children;
      if (children.length === 0) return { hasRoot: true, hasChildren: false };
      
      return {
        hasRoot: true,
        hasChildren: true,
        childCount: children.length,
        hasAppComponent: Array.from(children).some(child => 
          child.classList && child.classList.contains('App')
        )
      };
    });
    
    expect(appStructure.hasRoot).toBe(true);
    expect(appStructure.hasChildren).toBe(true);
    expect(appStructure.childCount).toBeGreaterThan(0);
  });

  test('should handle service registry initialization', async () => {
    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');
    
    // Test service registry
    const serviceRegistry = await page.evaluate(() => {
      if (window.__RWTRA_SERVICE_REGISTRY__) {
        return {
          initialized: true,
          serviceCount: Object.keys(window.__RWTRA_SERVICE_REGISTRY__).length,
          hasCoreServices: [
            'moduleLoader',
            'loggingManager',
            'networkProviderService'
          ].every(service => window.__RWTRA_SERVICE_REGISTRY__?.[service])
        };
      }
      return { initialized: false };
    });
    
    expect(serviceRegistry.initialized).toBe(true);
    expect(serviceRegistry.serviceCount).toBeGreaterThan(0);
    expect(serviceRegistry.hasCoreServices).toBe(true);
  });

  test('should execute build pipeline successfully', async () => {
    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');
    
    // Test build pipeline execution
    const buildResult = await page.evaluate(async () => {
      if (window.__RWTRA_BUILD_PIPELINE__) {
        try {
          const result = await window.__RWTRA_BUILD_PIPELINE__.execute({
            target: 'development',
            optimize: false
          });
          
          return {
            success: true,
            buildTime: result.buildTime,
            bundleSize: result.bundleSize,
            hasErrors: result.errors && result.errors.length > 0
          };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }
      return { success: false };
    });
    
    expect(buildResult.success).toBe(true);
    expect(buildResult.buildTime).toBeGreaterThan(0);
    expect(buildResult.hasErrors).toBe(false);
  });

  test('should handle error scenarios gracefully', async () => {
    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');
    
    // Test error handling
    const errorHandling = await page.evaluate(async () => {
      if (window.__RWTRA_ERROR_HANDLER__) {
        try {
          // Simulate an error
          const result = await window.__RWTRA_ERROR_HANDLER__.handleError(
            new Error('Test error scenario'),
            { context: 'integration-test', recoverable: true }
          );
          
          return {
            handled: true,
            errorLogged: result.logged,
            hasRecovery: result.recoveryAvailable,
            gracefulShutdown: result.gracefulShutdown
          };
        } catch (error) {
          return { handled: false, error: error.message };
        }
      }
      return { handled: false };
    });
    
    expect(errorHandling.handled).toBe(true);
    expect(errorHandling.errorLogged).toBe(true);
  });

  test('should maintain performance under load', async () => {
    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');
    
    // Test performance under load
    const performanceMetrics = await page.evaluate(async () => {
      const startTime = performance.now();
      
      // Simulate multiple operations
      const operations = [];
      for (let i = 0; i < 100; i++) {
        operations.push(
          window.__RWTRA_PLUGIN_SYSTEM__?.setLanguageContext({
            language: ['javascript', 'go', 'ruby', 'python'][i % 4],
            projectPath: `/test/load-${i}`
          })
        );
      }
      
      await Promise.all(operations);
      
      const endTime = performance.now();
      const memoryUsage = performance.memory ? performance.memory.usedJSHeapSize : 0;
      
      return {
        totalTime: endTime - startTime,
        averageOperationTime: (endTime - startTime) / 100,
        memoryUsage,
        operationsPerSecond: 100 / ((endTime - startTime) / 1000)
      };
    });
    
    expect(performanceMetrics.totalTime).toBeLessThan(5000); // Should complete in < 5 seconds
    expect(performanceMetrics.averageOperationTime).toBeLessThan(50); // Average < 50ms per operation
    expect(performanceMetrics.operationsPerSecond).toBeGreaterThan(20); // > 20 ops/sec
  });

  test('should support plugin hot-reloading', async () => {
    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');
    
    // Test plugin hot-reloading
    const hotReloadResult = await page.evaluate(async () => {
      if (window.__RWTRA_HOT_RELOAD__) {
        try {
          // Get initial plugin count
          const initialCount = Object.keys(window.__RWTRA_LOADED_PLUGINS__ || {}).length;
          
          // Simulate plugin reload
          const reloadResult = await window.__RWTRA_HOT_RELOAD__.reloadPlugin('javascript');
          
          // Get final plugin count
          const finalCount = Object.keys(window.__RWTRA_LOADED_PLUGINS__ || {}).length;
          
          return {
            supported: true,
            reloaded: reloadResult.success,
            pluginCountChanged: finalCount !== initialCount,
            noErrors: reloadResult.errors.length === 0
          };
        } catch (error) {
          return { supported: false, error: error.message };
        }
      }
      return { supported: false };
    });
    
    expect(hotReloadResult.supported).toBe(true);
    expect(hotReloadResult.reloaded).toBe(true);
    expect(hotReloadResult.noErrors).toBe(true);
  });

  test('should validate cross-language build targets', async () => {
    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');
    
    // Test cross-language build targets validation
    const buildValidation = await page.evaluate(async () => {
      if (window.__RWTRA_BUILD_VALIDATOR__) {
        const languages = ['javascript', 'go', 'ruby', 'python', 'java'];
        const results = [];
        
        for (const sourceLang of languages) {
          for (const targetLang of languages) {
            if (sourceLang !== targetLang) {
              try {
                const targets = await window.__RWTRA_BUILD_VALIDATOR__.getCrossLanguageTargets(
                  sourceLang,
                  targetLang
                );
                
                results.push({
                  source: sourceLang,
                  target: targetLang,
                  hasTargets: targets.length > 0,
                  validCommands: targets.every(t => t.command && t.description)
                });
              } catch (error) {
                results.push({
                  source: sourceLang,
                  target: targetLang,
                  hasTargets: false,
                  error: error.message
                });
              }
            }
          }
        }
        
        const validResults = results.filter(r => r.hasTargets && r.validCommands);
        const totalCombinations = languages.length * (languages.length - 1);
        
        return {
          totalCombinations,
          validCombinations: validResults.length,
          successRate: validResults.length / totalCombinations,
          results
        };
      }
      return { error: 'Build validator not available' };
    });
    
    expect(buildValidation.totalCombinations).toBeGreaterThan(0);
    expect(buildValidation.validCombinations).toBeGreaterThan(0);
    expect(buildValidation.successRate).toBeGreaterThan(0.5); // At least 50% valid
  });

  test('should handle configuration loading and updates', async () => {
    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');
    
    // Test configuration handling
    const configHandling = await page.evaluate(async () => {
      if (window.__RWTRA_CONFIG_MANAGER__) {
        try {
          // Load initial config
          const initialConfig = await window.__RWTRA_CONFIG_MANAGER__.loadConfig();
          
          // Update config
          await window.__RWTRA_CONFIG_MANAGER__.updateConfig({
            testMode: true,
            logLevel: 'debug',
            features: {
              hotReload: true,
              crossLanguage: true
            }
          });
          
          // Get updated config
          const updatedConfig = await window.__RWTRA_CONFIG_MANAGER__.getConfig();
          
          return {
            loadSuccess: !!initialConfig,
            updateSuccess: true,
            testModeEnabled: updatedConfig.testMode === true,
            logLevelDebug: updatedConfig.logLevel === 'debug',
            featuresEnabled: updatedConfig.features.hotReload === true && 
                           updatedConfig.features.crossLanguage === true
          };
        } catch (error) {
          return { loadSuccess: false, error: error.message };
        }
      }
      return { loadSuccess: false };
    });
    
    expect(configHandling.loadSuccess).toBe(true);
    expect(configHandling.updateSuccess).toBe(true);
    expect(configHandling.testModeEnabled).toBe(true);
    expect(configHandling.logLevelDebug).toBe(true);
    expect(configHandling.featuresEnabled).toBe(true);
  });

  test('should provide comprehensive logging', async () => {
    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');
    
    // Test logging system
    const loggingTest = await page.evaluate(async () => {
      if (window.__RWTRA_LOGGER__) {
        try {
          // Generate various log levels
          await window.__RWTRA_LOGGER__.debug('Debug message', { context: 'test' });
          await window.__RWTRA_LOGGER__.info('Info message', { context: 'test' });
          await window.__RWTRA_LOGGER__.warn('Warning message', { context: 'test' });
          await window.__RWTRA_LOGGER__.error('Error message', { context: 'test' });
          
          // Get log entries
          const logs = await window.__RWTRA_LOGGER__.getLogs();
          
          return {
            loggingAvailable: true,
            logCount: logs.length,
            hasAllLevels: ['debug', 'info', 'warn', 'error'].every(level =>
              logs.some(log => log.level === level)
            ),
            hasContext: logs.every(log => log.context === 'test'),
            hasTimestamps: logs.every(log => log.timestamp)
          };
        } catch (error) {
          return { loggingAvailable: false, error: error.message };
        }
      }
      return { loggingAvailable: false };
    });
    
    expect(loggingTest.loggingAvailable).toBe(true);
    expect(loggingTest.logCount).toBeGreaterThanOrEqual(4);
    expect(loggingTest.hasAllLevels).toBe(true);
    expect(loggingTest.hasContext).toBe(true);
    expect(loggingTest.hasTimestamps).toBe(true);
  });
});
