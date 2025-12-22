/**
 * Language Registry
 * Manages language detection, registration, and language-specific plugin loading
 */

const fs = require('fs');
const path = require('path');
const BaseLanguagePlugin = require('./base-language-plugin');

class LanguageRegistry {
  constructor() {
    this.languages = new Map();
    this.detectedLanguages = new Set();
    this.languagePluginsDirectory = path.join(__dirname, '..', 'plugins', 'language_plugins');
    this.supportedLanguages = [];
    
    // Built-in language definitions
    this.builtinLanguages = new Map();
    this.registerBuiltinLanguages();
  }

  /**
   * Registers built-in language definitions
   */
  registerBuiltinLanguages() {
    // JavaScript/TypeScript
    this.builtinLanguages.set('javascript', {
      name: 'javascript',
      description: 'JavaScript and TypeScript projects',
      fileExtensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'],
      projectFiles: ['package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'tsconfig.json'],
      buildSystems: ['webpack.config.js', 'rollup.config.js', 'vite.config.js', 'next.config.js'],
      priority: 100
    });

    // Python
    this.builtinLanguages.set('python', {
      name: 'python',
      description: 'Python projects',
      fileExtensions: ['.py', '.pyx', '.pyi'],
      projectFiles: ['requirements.txt', 'pyproject.toml', 'setup.py', 'Pipfile', 'poetry.lock', 'conda.yml'],
      buildSystems: ['setup.cfg', 'tox.ini', 'Makefile'],
      priority: 90
    });

    // C++
    this.builtinLanguages.set('cpp', {
      name: 'cpp',
      description: 'C/C++ projects',
      fileExtensions: ['.cpp', '.cc', '.cxx', '.c', '.hpp', '.h', '.hxx', '.cppm'],
      projectFiles: ['CMakeLists.txt', 'configure.ac', 'Makefile.am'],
      buildSystems: ['CMakeLists.txt', 'Makefile', 'build.ninja', 'meson.build'],
      priority: 80
    });

    // Java
    this.builtinLanguages.set('java', {
      name: 'java',
      description: 'Java projects',
      fileExtensions: ['.java', '.kt', '.scala'],
      projectFiles: ['pom.xml', 'build.gradle', 'build.gradle.kts', 'settings.gradle'],
      buildSystems: ['pom.xml', 'build.gradle', 'build.gradle.kts'],
      priority: 85
    });
  }

  /**
   * Discovers all language plugins and registers them
   * @param {boolean} forceReload - Force rediscovery even if already discovered
   */
  async discoverLanguages(forceReload = false) {
    if (this.supportedLanguages.length > 0 && !forceReload) {
      return this.supportedLanguages;
    }

    this.languages.clear();
    this.supportedLanguages = [];

    // Register built-in languages first
    for (const [name, config] of this.builtinLanguages) {
      await this.registerLanguage(config);
    }

    // Discover language plugins
    await this.discoverLanguagePlugins();

    this.supportedLanguages = Array.from(this.languages.keys());
    return this.supportedLanguages;
  }

  /**
   * Discovers language plugins from the plugins directory
   */
  async discoverLanguagePlugins() {
    if (!fs.existsSync(this.languagePluginsDirectory)) {
      fs.mkdirSync(this.languagePluginsDirectory, { recursive: true });
      return;
    }

    const languageDirs = fs.readdirSync(this.languagePluginsDirectory);
    
    for (const langDir of languageDirs) {
      const langPath = path.join(this.languagePluginsDirectory, langDir);
      
      if (fs.statSync(langPath).isDirectory()) {
        await this.loadLanguagePlugin(langDir, langPath);
      }
    }
  }

  /**
   * Loads language plugins from a specific language directory
   * @param {string} languageName - Name of the language
   * @param {string} languagePath - Path to the language directory
   */
  async loadLanguagePlugin(languageName, languagePath) {
    try {
      const pluginFiles = fs.readdirSync(languagePath)
        .filter(file => file.endsWith('.language.js'));

      for (const pluginFile of pluginFiles) {
        const pluginPath = path.join(languagePath, pluginFile);
        
        // Clear require cache to allow reloading
        delete require.cache[require.resolve(pluginPath)];
        
        const PluginClass = require(pluginPath);
        
        if (typeof PluginClass === 'function') {
          const plugin = new PluginClass();
          
          if (plugin instanceof BaseLanguagePlugin) {
            plugin.file = path.relative(process.cwd(), pluginPath);
            await this.registerLanguagePlugin(plugin);
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Failed to load language plugin from ${languageName}: ${error.message}`);
    }
  }

  /**
   * Registers a language configuration
   * @param {Object} languageConfig - Language configuration
   */
  async registerLanguage(languageConfig) {
    const language = {
      name: languageConfig.name,
      description: languageConfig.description,
      fileExtensions: languageConfig.fileExtensions || [],
      projectFiles: languageConfig.projectFiles || [],
      buildSystems: languageConfig.buildSystems || [],
      priority: languageConfig.priority || 0,
      detected: false,
      plugin: null
    };

    this.languages.set(languageConfig.name, language);
  }

  /**
   * Registers a language plugin
   * @param {BaseLanguagePlugin} plugin - Language plugin instance
   */
  async registerLanguagePlugin(plugin) {
    const languageName = plugin.language;
    
    if (!this.languages.has(languageName)) {
      // Register language from plugin metadata
      await this.registerLanguage({
        name: languageName,
        description: plugin.description,
        fileExtensions: plugin.fileExtensions,
        projectFiles: plugin.projectFiles,
        buildSystems: plugin.buildSystems,
        priority: plugin.priority
      });
    }

    // Attach plugin to language
    const language = this.languages.get(languageName);
    language.plugin = plugin;
  }

  /**
   * Detects languages used in the current project
   * @param {string} projectPath - Path to the project root
   * @returns {Promise<Array>} - Array of detected language names
   */
  async detectLanguages(projectPath) {
    this.detectedLanguages.clear();

    const languageScores = new Map();

    // Score each language based on detection criteria
    for (const [name, language] of this.languages) {
      const score = await this.calculateLanguageScore(language, projectPath);
      if (score > 0) {
        languageScores.set(name, score);
      }
    }

    // Sort by score (descending) and return detected languages
    const sortedLanguages = Array.from(languageScores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);

    // Update language detection status
    for (const langName of sortedLanguages) {
      const language = this.languages.get(langName);
      language.detected = true;
      this.detectedLanguages.add(langName);
    }

    return sortedLanguages;
  }

  /**
   * Calculates a detection score for a language
   * @param {Object} language - Language configuration
   * @param {string} projectPath - Path to scan
   * @returns {Promise<number>} - Detection score
   */
  async calculateLanguageScore(language, projectPath) {
    let score = 0;

    // Check project files (highest weight)
    for (const projectFile of language.projectFiles) {
      const filePath = path.join(projectPath, projectFile);
      if (fs.existsSync(filePath)) {
        score += 50;
      }
    }

    // Check build systems (medium-high weight)
    for (const buildFile of language.buildSystems) {
      const filePath = path.join(projectPath, buildFile);
      if (fs.existsSync(filePath)) {
        score += 30;
      }
    }

    // Check file extensions (lower weight, but many files add up)
    for (const ext of language.fileExtensions) {
      const files = await this.countFilesByExtension(projectPath, ext);
      score += Math.min(files * 2, 20); // Cap at 20 points per extension
    }

    // Apply language priority multiplier
    score = score * (language.priority / 100);

    // Run custom plugin detection if available
    if (language.plugin) {
      try {
        const customDetected = await language.plugin.detectProject(projectPath);
        if (customDetected) {
          score += 25; // Bonus for custom detection
        }
      } catch (error) {
        // Ignore custom detection errors
      }
    }

    return score;
  }

  /**
   * Counts files by extension in a directory
   * @param {string} dir - Directory to search
   * @param {string} ext - File extension to match
   * @returns {Promise<number>} - Count of matching files
   */
  async countFilesByExtension(dir, ext) {
    let count = 0;

    const scan = (currentDir) => {
      if (!fs.existsSync(currentDir)) return;

      try {
        const items = fs.readdirSync(currentDir);

        for (const item of items) {
          const fullPath = path.join(currentDir, item);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            // Skip common ignore directories
            if (!['node_modules', '.git', 'dist', 'build', 'target', '__pycache__'].includes(item)) {
              scan(fullPath);
            }
          } else if (item.endsWith(ext)) {
            count++;
          }
        }
      } catch (error) {
        // Ignore permission errors
      }
    };

    scan(dir);
    return count;
  }

  /**
   * Gets a language by name
   * @param {string} name - Language name
   * @returns {Object|null} - Language configuration or null
   */
  getLanguage(name) {
    return this.languages.get(name) || null;
  }

  /**
   * Gets all supported languages
   * @returns {Array} - Array of language configurations
   */
  getSupportedLanguages() {
    return Array.from(this.languages.values());
  }

  /**
   * Gets detected languages for the current project
   * @returns {Array} - Array of detected language names
   */
  getDetectedLanguages() {
    return Array.from(this.detectedLanguages);
  }

  /**
   * Gets the number of supported languages
   * @returns {number} - Language count
   */
  getLanguageCount() {
    return this.languages.size;
  }

  /**
   * Checks if a language is supported
   * @param {string} name - Language name
   * @returns {boolean} - True if supported
   */
  isLanguageSupported(name) {
    return this.languages.has(name);
  }

  /**
   * Gets the plugin for a specific language
   * @param {string} languageName - Language name
   * @returns {BaseLanguagePlugin|null} - Language plugin or null
   */
  getLanguagePlugin(languageName) {
    const language = this.languages.get(languageName);
    return language ? language.plugin : null;
  }

  /**
   * Gets all language plugins
   * @returns {Array} - Array of language plugin instances
   */
  getAllLanguagePlugins() {
    const plugins = [];
    for (const language of this.languages.values()) {
      if (language.plugin) {
        plugins.push(language.plugin);
      }
    }
    return plugins;
  }

  /**
   * Validates that required tools are available for detected languages
   * @returns {Promise<Object>} - Validation results
   */
  async validateLanguageTools() {
    const results = {
      valid: true,
      issues: [],
      languageResults: {}
    };

    for (const languageName of this.detectedLanguages) {
      const plugin = this.getLanguagePlugin(languageName);
      
      if (plugin) {
        try {
          const validation = await plugin.validateTools();
          results.languageResults[languageName] = validation;
          
          if (!validation.valid) {
            results.valid = false;
            results.issues.push({
              language: languageName,
              missing: validation.missing
            });
          }
        } catch (error) {
          results.valid = false;
          results.issues.push({
            language: languageName,
            error: error.message
          });
        }
      }
    }

    return results;
  }

  /**
   * Gets language detection statistics
   * @returns {Object} - Statistics
   */
  getDetectionStatistics() {
    const totalLanguages = this.languages.size;
    const detectedCount = this.detectedLanguages.size;
    const withPlugins = this.getAllLanguagePlugins().length;

    return {
      total: totalLanguages,
      detected: detectedCount,
      detectedLanguages: Array.from(this.detectedLanguages),
      withPlugins: withPlugins,
      detectionRate: totalLanguages > 0 ? (detectedCount / totalLanguages * 100).toFixed(1) + '%' : '0%'
    };
  }

  /**
   * Creates a language priority map for conflict resolution
   * @returns {Map} - Language priority map
   */
  createPriorityMap() {
    const priorities = new Map();
    
    for (const [name, language] of this.languages) {
      priorities.set(name, language.priority);
    }
    
    return priorities;
  }

  /**
   * Clears all registered languages
   */
  clear() {
    this.languages.clear();
    this.detectedLanguages.clear();
    this.supportedLanguages = [];
  }
}

module.exports = LanguageRegistry;
