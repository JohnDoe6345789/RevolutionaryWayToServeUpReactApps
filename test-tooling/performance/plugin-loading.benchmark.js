#!/usr/bin/env node

/**
 * Plugin Loading Performance Benchmarks
 * Measures and analyzes plugin loading performance across different scenarios
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

// Mock the plugin system for benchmarking
const createMockPluginSystem = () => {
  const plugins = new Map();
  const loadTimes = new Map();
  
  return {
    plugins,
    loadTimes,
    
    async loadPlugin(pluginPath) {
      const startTime = performance.now();
      
      try {
        // Clear require cache to simulate fresh load
        delete require.cache[require.resolve(pluginPath)];
        
        const PluginClass = require(pluginPath);
        const plugin = new PluginClass();
        
        const endTime = performance.now();
        const loadTime = endTime - startTime;
        
        loadTimes.set(pluginPath, {
          loadTime,
          timestamp: new Date().toISOString(),
          success: true,
          plugin: plugin.name || path.basename(pluginPath)
        });
        
        plugins.set(pluginPath, plugin);
        return plugin;
      } catch (error) {
        const endTime = performance.now();
        const loadTime = endTime - startTime;
        
        loadTimes.set(pluginPath, {
          loadTime,
          timestamp: new Date().toISOString(),
          success: false,
          error: error.message,
          plugin: path.basename(pluginPath)
        });
        
        throw error;
      }
    },
    
    async loadAllPlugins(pluginPaths) {
      const startTime = performance.now();
      const results = [];
      
      for (const pluginPath of pluginPaths) {
        try {
          const plugin = await this.loadPlugin(pluginPath);
          results.push({ pluginPath, success: true, plugin: plugin.name });
        } catch (error) {
          results.push({ pluginPath, success: false, error: error.message });
        }
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      return {
        results,
        totalTime,
        averageTime: totalTime / pluginPaths.length,
        successCount: results.filter(r => r.success).length,
        failureCount: results.filter(r => !r.success).length
      };
    },
    
    getMetrics() {
      const times = Array.from(loadTimes.values());
      const successfulTimes = times.filter(t => t.success).map(t => t.loadTime);
      
      return {
        totalPlugins: times.length,
        successfulLoads: successfulTimes.length,
        failedLoads: times.length - successfulTimes.length,
        averageLoadTime: successfulTimes.length > 0 ? 
          successfulTimes.reduce((sum, time) => sum + time, 0) / successfulTimes.length : 0,
        minLoadTime: successfulTimes.length > 0 ? Math.min(...successfulTimes) : 0,
        maxLoadTime: successfulTimes.length > 0 ? Math.max(...successfulTimes) : 0,
        medianLoadTime: successfulTimes.length > 0 ? 
          successfulTimes.sort((a, b) => a - b)[Math.floor(successfulTimes.length / 2)] : 0,
        loadTimes: times
      };
    }
  };
};

class PluginLoadingBenchmark {
  constructor() {
    this.pluginSystem = createMockPluginSystem();
    this.results = [];
    this.scenarios = [
      'single-load',
      'sequential-load',
      'concurrent-load',
      'memory-pressure-load',
      'repeated-load'
    ];
  }

  /**
   * Runs all benchmark scenarios
   */
  async runAllBenchmarks() {
    console.log('🚀 Starting Plugin Loading Performance Benchmarks\n');
    
    for (const scenario of this.scenarios) {
      console.log(`📊 Running ${scenario} scenario...`);
      const result = await this.runScenario(scenario);
      this.results.push({ scenario, ...result });
      console.log(`✅ ${scenario} completed\n`);
    }
    
    this.generateReport();
  }

  /**
   * Runs a specific benchmark scenario
   */
  async runScenario(scenario) {
    switch (scenario) {
      case 'single-load':
        return await this.benchmarkSingleLoad();
      case 'sequential-load':
        return await this.benchmarkSequentialLoad();
      case 'concurrent-load':
        return await this.benchmarkConcurrentLoad();
      case 'memory-pressure-load':
        return await this.benchmarkMemoryPressureLoad();
      case 'repeated-load':
        return await this.benchmarkRepeatedLoad();
      default:
        throw new Error(`Unknown scenario: ${scenario}`);
    }
  }

  /**
   * Benchmark single plugin loading
   */
  async benchmarkSingleLoad() {
    const pluginPaths = this.getPluginPaths();
    const results = [];
    
    for (const pluginPath of pluginPaths) {
      const startTime = performance.now();
      const memoryBefore = process.memoryUsage();
      
      try {
        await this.pluginSystem.loadPlugin(pluginPath);
        const endTime = performance.now();
        const memoryAfter = process.memoryUsage();
        
        results.push({
          plugin: path.basename(pluginPath),
          loadTime: endTime - startTime,
          memoryDelta: memoryAfter.heapUsed - memoryBefore.heapUsed,
          success: true
        });
      } catch (error) {
        const endTime = performance.now();
        results.push({
          plugin: path.basename(pluginPath),
          loadTime: endTime - startTime,
          memoryDelta: 0,
          success: false,
          error: error.message
        });
      }
    }
    
    return {
      type: 'single-load',
      results,
      averageLoadTime: results.reduce((sum, r) => sum + r.loadTime, 0) / results.length,
      successRate: results.filter(r => r.success).length / results.length
    };
  }

  /**
   * Benchmark sequential plugin loading
   */
  async benchmarkSequentialLoad() {
    const pluginPaths = this.getPluginPaths();
    const startTime = performance.now();
    const memoryBefore = process.memoryUsage();
    
    const result = await this.pluginSystem.loadAllPlugins(pluginPaths);
    
    const endTime = performance.now();
    const memoryAfter = process.memoryUsage();
    
    return {
      type: 'sequential-load',
      ...result,
      totalMemoryDelta: memoryAfter.heapUsed - memoryBefore.heapUsed,
      totalLoadTime: endTime - startTime
    };
  }

  /**
   * Benchmark concurrent plugin loading
   */
  async benchmarkConcurrentLoad() {
    const pluginPaths = this.getPluginPaths();
    const startTime = performance.now();
    const memoryBefore = process.memoryUsage();
    
    // Load plugins concurrently
    const loadPromises = pluginPaths.map(async (pluginPath) => {
      try {
        await this.pluginSystem.loadPlugin(pluginPath);
        return { pluginPath, success: true };
      } catch (error) {
        return { pluginPath, success: false, error: error.message };
      }
    });
    
    const results = await Promise.all(loadPromises);
    
    const endTime = performance.now();
    const memoryAfter = process.memoryUsage();
    
    return {
      type: 'concurrent-load',
      results,
      totalTime: endTime - startTime,
      averageTime: (endTime - startTime) / pluginPaths.length,
      successCount: results.filter(r => r.success).length,
      failureCount: results.filter(r => !r.success).length,
      totalMemoryDelta: memoryAfter.heapUsed - memoryBefore.heapUsed
    };
  }

  /**
   * Benchmark plugin loading under memory pressure
   */
  async benchmarkMemoryPressureLoad() {
    const pluginPaths = this.getPluginPaths();
    
    // Create memory pressure
    const memoryPressure = new Array(1000000).fill('x'.repeat(1000));
    console.log(`   Created memory pressure: ${(JSON.stringify(memoryPressure).length / 1024 / 1024).toFixed(2)} MB`);
    
    const startTime = performance.now();
    const memoryBefore = process.memoryUsage();
    
    const result = await this.pluginSystem.loadAllPlugins(pluginPaths);
    
    const endTime = performance.now();
    const memoryAfter = process.memoryUsage();
    
    // Clean up memory pressure
    memoryPressure.length = 0;
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    return {
      type: 'memory-pressure-load',
      ...result,
      totalMemoryDelta: memoryAfter.heapUsed - memoryBefore.heapUsed,
      totalLoadTime: endTime - startTime,
      memoryPressureMB: (JSON.stringify(memoryPressure).length / 1024 / 1024).toFixed(2)
    };
  }

  /**
   * Benchmark repeated plugin loading
   */
  async benchmarkRepeatedLoad() {
    const pluginPaths = this.getPluginPaths();
    const iterations = 10;
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
      console.log(`   Iteration ${i + 1}/${iterations}`);
      
      // Clear require cache for each iteration
      pluginPaths.forEach(pluginPath => {
        delete require.cache[require.resolve(pluginPath)];
      });
      
      const startTime = performance.now();
      const result = await this.pluginSystem.loadAllPlugins(pluginPaths);
      const endTime = performance.now();
      
      results.push({
        iteration: i + 1,
        loadTime: result.totalTime,
        successCount: result.successCount,
        failureCount: result.failureCount,
        averageTime: result.averageTime
      });
    }
    
    const averageLoadTime = results.reduce((sum, r) => sum + r.loadTime, 0) / results.length;
    const minLoadTime = Math.min(...results.map(r => r.loadTime));
    const maxLoadTime = Math.max(...results.map(r => r.loadTime));
    
    return {
      type: 'repeated-load',
      iterations,
      results,
      averageLoadTime,
      minLoadTime,
      maxLoadTime,
      consistency: ((maxLoadTime - minLoadTime) / averageLoadTime * 100).toFixed(2)
    };
  }

  /**
   * Gets list of plugin paths to benchmark
   */
  getPluginPaths() {
    const pluginsDir = path.join(__dirname, '../plugins/language_plugins');
    const pluginPaths = [];
    
    if (fs.existsSync(pluginsDir)) {
      const items = fs.readdirSync(pluginsDir);
      
      for (const item of items) {
        const pluginDir = path.join(pluginsDir, item);
        const stat = fs.statSync(pluginDir);
        
        if (stat.isDirectory()) {
          const pluginFile = path.join(pluginDir, `${item}.language.js`);
          if (fs.existsSync(pluginFile)) {
            pluginPaths.push(pluginFile);
          }
        }
      }
    }
    
    return pluginPaths;
  }

  /**
   * Generates comprehensive benchmark report
   */
  generateReport() {
    console.log('📈 Plugin Loading Performance Report\n');
    console.log('=' .repeat(80));
    
    // Overall metrics
    const allMetrics = this.pluginSystem.getMetrics();
    console.log('📊 Overall Metrics:');
    console.log(`   Total Plugins: ${allMetrics.totalPlugins}`);
    console.log(`   Successful Loads: ${allMetrics.successfulLoads}`);
    console.log(`   Failed Loads: ${allMetrics.failedLoads}`);
    console.log(`   Average Load Time: ${allMetrics.averageLoadTime.toFixed(2)} ms`);
    console.log(`   Min Load Time: ${allMetrics.minLoadTime.toFixed(2)} ms`);
    console.log(`   Max Load Time: ${allMetrics.maxLoadTime.toFixed(2)} ms`);
    console.log(`   Median Load Time: ${allMetrics.medianLoadTime.toFixed(2)} ms\n`);
    
    // Scenario-specific results
    for (const result of this.results) {
      this.printScenarioResults(result);
    }
    
    // Performance recommendations
    this.generateRecommendations();
  }

  /**
   * Prints results for a specific scenario
   */
  printScenarioResults(result) {
    console.log(`🎯 ${result.type.toUpperCase()} Results:`);
    
    switch (result.type) {
      case 'single-load':
        console.log(`   Average Load Time: ${result.averageLoadTime.toFixed(2)} ms`);
        console.log(`   Success Rate: ${(result.successRate * 100).toFixed(1)}%`);
        break;
        
      case 'sequential-load':
      case 'concurrent-load':
        console.log(`   Total Load Time: ${result.totalTime.toFixed(2)} ms`);
        console.log(`   Average Load Time: ${result.averageTime.toFixed(2)} ms`);
        console.log(`   Success Count: ${result.successCount}`);
        console.log(`   Failure Count: ${result.failureCount}`);
        console.log(`   Memory Delta: ${(result.totalMemoryDelta / 1024 / 1024).toFixed(2)} MB`);
        break;
        
      case 'memory-pressure-load':
        console.log(`   Total Load Time: ${result.totalLoadTime.toFixed(2)} ms`);
        console.log(`   Memory Pressure: ${result.memoryPressureMB} MB`);
        console.log(`   Memory Delta: ${(result.totalMemoryDelta / 1024 / 1024).toFixed(2)} MB`);
        break;
        
      case 'repeated-load':
        console.log(`   Iterations: ${result.iterations}`);
        console.log(`   Average Load Time: ${result.averageLoadTime.toFixed(2)} ms`);
        console.log(`   Min Load Time: ${result.minLoadTime.toFixed(2)} ms`);
        console.log(`   Max Load Time: ${result.maxLoadTime.toFixed(2)} ms`);
        console.log(`   Consistency: ${result.consistency}% variation`);
        break;
    }
    console.log();
  }

  /**
   * Generates performance recommendations
   */
  generateRecommendations() {
    console.log('💡 Performance Recommendations:');
    
    const allMetrics = this.pluginSystem.getMetrics();
    
    if (allMetrics.averageLoadTime > 100) {
      console.log('⚠️  Average load time is > 100ms. Consider optimizing plugin initialization.');
    }
    
    if (allMetrics.failedLoads > 0) {
      console.log('⚠️  Some plugins failed to load. Review error handling and dependencies.');
    }
    
    const concurrentResult = this.results.find(r => r.type === 'concurrent-load');
    const sequentialResult = this.results.find(r => r.type === 'sequential-load');
    
    if (concurrentResult && sequentialResult) {
      const speedup = sequentialResult.totalTime / concurrentResult.totalTime;
      if (speedup > 1.2) {
        console.log('✅ Concurrent loading shows significant performance improvement.');
      } else {
        console.log('ℹ️  Concurrent loading shows minimal benefit. Consider sequential loading.');
      }
    }
    
    const memoryPressureResult = this.results.find(r => r.type === 'memory-pressure-load');
    if (memoryPressureResult && memoryPressureResult.totalMemoryDelta > 50 * 1024 * 1024) {
      console.log('⚠️  High memory usage detected under pressure. Consider memory optimization.');
    }
    
    const repeatedResult = this.results.find(r => r.type === 'repeated-load');
    if (repeatedResult && parseFloat(repeatedResult.consistency) > 20) {
      console.log('⚠️  High load time variability detected. Review plugin initialization consistency.');
    }
    
    console.log('\n🎉 Benchmark completed successfully!');
  }
}

// Run benchmarks if this file is executed directly
if (require.main === module) {
  const benchmark = new PluginLoadingBenchmark();
  
  benchmark.runAllBenchmarks().catch(error => {
    console.error('❌ Benchmark failed:', error.message);
    process.exit(1);
  });
}

module.exports = PluginLoadingBenchmark;
