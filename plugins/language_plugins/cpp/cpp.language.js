#!/usr/bin/env node

/**
 * C++ Language Plugin
 * Provides C/C++ specific analysis and generation capabilities
 */

const fs = require('fs');
const path = require('path');
const BaseLanguagePlugin = require('../../../lib/base-language-plugin');

class CPPLanguagePlugin extends BaseLanguagePlugin {
  constructor() {
    super({
      name: 'cpp',
      description: 'C/C++ language support',
      version: '1.0.0',
      author: 'DEV CLI',
      language: 'cpp',
      category: 'language',
      fileExtensions: ['.cpp', '.cc', '.cxx', '.c', '.hpp', '.h', '.hxx', '.cppm'],
      projectFiles: ['CMakeLists.txt', 'configure.ac', 'Makefile.am'],
      buildSystems: ['CMakeLists.txt', 'Makefile', 'build.ninja', 'meson.build'],
      priority: 80,
      commands: [
        {
          name: 'dependencies',
          description: 'Analyze C/C++ dependencies and includes'
        },
        {
          name: 'structure',
          description: 'Analyze C/C++ project structure'
        },
        {
          name: 'build',
          description: 'Execute C/C++ build commands'
        },
        {
          name: 'test',
          description: 'Run C/C++ tests'
        }
      ],
      dependencies: []
    });

    this.defaultConfig = {
      buildSystem: 'cmake',
      compiler: 'gcc',
      standard: 'c++17',
      includePaths: [],
      libraryPaths: [],
      ignorePatterns: ['build', 'dist', '.git', '__pycache__'],
      analysis: {
        dependencyDepth: 10,
        circularDetection: true,
        headerAnalysis: true,
        templateAnalysis: true
      }
    };
  }

  /**
   * Registers language-specific parsers
   */
  registerParsers() {
    this.parsers.set('.cpp', {
      dependencies: this.parseCPPDependencies.bind(this),
      structure: this.parseCPPStructure.bind(this)
    });

    this.parsers.set('.cc', this.parsers.get('.cpp'));
    this.parsers.set('.cxx', this.parsers.get('.cpp'));
    this.parsers.set('.c', {
      dependencies: this.parseCDependencies.bind(this),
      structure: this.parseCStructure.bind(this)
    });
    this.parsers.set('.hpp', {
      dependencies: this.parseHeaderDependencies.bind(this),
      structure: this.parseHeaderStructure.bind(this)
    });
    this.parsers.set('.h', this.parsers.get('.hpp'));
    this.parsers.set('.hxx', this.parsers.get('.hpp'));
    this.parsers.set('.cppm', {
      dependencies: this.parseCPPDependencies.bind(this),
      structure: this.parseCPPStructure.bind(this)
    });
  }

  /**
   * Registers custom language detectors
   */
  registerDetectors() {
    this.detectors.set('cmake', async (projectPath) => {
      const cmakeFiles = ['CMakeLists.txt', 'cmake'];
      return await this.hasAnyFiles(projectPath, cmakeFiles);
    });

    this.detectors.set('makefile', async (projectPath) => {
      const makeFiles = ['Makefile', 'makefile', 'GNUmakefile'];
      return await this.hasAnyFiles(projectPath, makeFiles);
    });

    this.detectors.set('autotools', async (projectPath) => {
      const autoFiles = ['configure.ac', 'configure.in', 'Makefile.am'];
      return await this.hasAnyFiles(projectPath, autoFiles);
    });

    this.detectors.set('meson', async (projectPath) => {
      const mesonFiles = ['meson.build', 'meson_options.txt'];
      return await this.hasAnyFiles(projectPath, mesonFiles);
    });
  }

  /**
   * Parses C++ dependencies from file content
   * @param {string} filePath - Path to C++ file
   * @returns {Promise<Array>} - Array of dependencies
   */
  async parseCPPDependencies(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const dependencies = [];
      
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Look for #include directives
        if (line.startsWith('#include')) {
          const match = line.match(/#include\s*[<"]([^>"]+)[>"]/);
          if (match) {
            const includePath = match[1];
            const isSystem = line.includes('<') && line.includes('>');
            
            dependencies.push({
              name: includePath,
              type: isSystem ? 'system' : 'local',
              line: i + 1,
              directive: line
            });
          }
        }
        
        // Look for pragma once (header guard)
        if (line.startsWith('#pragma once')) {
          dependencies.push({
            name: 'pragma_once',
            type: 'guard',
            line: i + 1,
            directive: line
          });
        }
      }

      return dependencies;
    } catch (error) {
      this.log(`Error parsing C++ dependencies in ${filePath}: ${error.message}`, 'error');
      return [];
    }
  }

  /**
   * Parses C dependencies from file content
   * @param {string} filePath - Path to C file
   * @returns {Promise<Array>} - Array of dependencies
   */
  async parseCDependencies(filePath) {
    // C files use the same parsing logic as C++ for includes
    return this.parseCPPDependencies(filePath);
  }

  /**
   * Parses header dependencies from file content
   * @param {string} filePath - Path to header file
   * @returns {Promise<Array>} - Array of dependencies
   */
  async parseHeaderDependencies(filePath) {
    // Headers use the same parsing logic as source files
    return this.parseCPPDependencies(filePath);
  }

  /**
   * Parses C++ structure from file content
   * @param {string} filePath - Path to C++ file
   * @returns {Promise<Object>} - Structure information
   */
  async parseCPPStructure(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const structure = {
        classes: [],
        functions: [],
        methods: [],
        namespaces: [],
        templates: [],
        macros: [],
        enums: [],
        typedefs: []
      };

      const lines = content.split('\n');
      let inClass = false;
      let currentClass = null;
      let currentNamespace = null;
      let braceCount = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Track namespaces
        if (line.startsWith('namespace ')) {
          const match = line.match(/namespace\s+(\w+)/);
          if (match) {
            currentNamespace = match[1];
            structure.namespaces.push({
              name: match[1],
              line: i + 1
            });
          }
        }
        
        // Look for class definitions
        if (line.match(/^(class|struct)\s+\w+/)) {
          const match = line.match(/^(class|struct)\s+(\w+)/);
          if (match) {
            currentClass = match[2];
            inClass = true;
            structure.classes.push({
              name: match[2],
              type: match[1],
              line: i + 1,
              namespace: currentNamespace
            });
          }
        }
        
        // Look for function definitions
        if (line.match(/\w+\s+\w+\s*\([^)]*\)\s*(?:const)?\s*\{?/)) {
          const match = line.match(/(\w+)\s+(\w+)\s*\([^)]*\)/);
          if (match) {
            const funcInfo = {
              name: match[2],
              returnType: match[1],
              line: i + 1,
              class: currentClass,
              namespace: currentNamespace
            };
            
            if (inClass) {
              structure.methods.push(funcInfo);
            } else {
              structure.functions.push(funcInfo);
            }
          }
        }
        
        // Look for template definitions
        if (line.startsWith('template ')) {
          structure.templates.push({
            declaration: line,
            line: i + 1,
            namespace: currentNamespace
          });
        }
        
        // Look for macro definitions
        if (line.startsWith('#define ')) {
          const match = line.match(/#define\s+(\w+)/);
          if (match) {
            structure.macros.push({
              name: match[1],
              line: i + 1,
              definition: line
            });
          }
        }
        
        // Look for enum definitions
        if (line.startsWith('enum ')) {
          const match = line.match(/enum\s+(?:class\s+)?(\w+)/);
          if (match) {
            structure.enums.push({
              name: match[1],
              line: i + 1,
              namespace: currentNamespace
            });
          }
        }
        
        // Look for typedef declarations
        if (line.startsWith('typedef ')) {
          structure.typedefs.push({
            declaration: line,
            line: i + 1,
            namespace: currentNamespace
          });
        }
        
        // Track braces for class scope
        if (line.includes('{')) {
          braceCount++;
        }
        if (line.includes('}')) {
          braceCount--;
          if (braceCount === 0 && inClass) {
            inClass = false;
            currentClass = null;
          }
        }
      }

      return structure;
    } catch (error) {
      this.log(`Error parsing C++ structure in ${filePath}: ${error.message}`, 'error');
      return { classes: [], functions: [], methods: [], namespaces: [], templates: [], macros: [], enums: [], typedefs: [] };
    }
  }

  /**
   * Parses C structure from file content
   * @param {string} filePath - Path to C file
   * @returns {Promise<Object>} - Structure information
   */
  async parseCStructure(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const structure = {
        functions: [],
        structs: [],
        macros: [],
        enums: [],
        typedefs: []
      };

      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Look for function definitions
        if (line.match(/\w+\s+\w+\s*\([^)]*\)\s*\{?/)) {
          const match = line.match(/(\w+)\s+(\w+)\s*\([^)]*\)/);
          if (match && !line.startsWith('typedef')) {
            structure.functions.push({
              name: match[2],
              returnType: match[1],
              line: i + 1
            });
          }
        }
        
        // Look for struct definitions
        if (line.startsWith('struct ')) {
          const match = line.match(/struct\s+(\w+)/);
          if (match) {
            structure.structs.push({
              name: match[1],
              line: i + 1
            });
          }
        }
        
        // Look for macro definitions
        if (line.startsWith('#define ')) {
          const match = line.match(/#define\s+(\w+)/);
          if (match) {
            structure.macros.push({
              name: match[1],
              line: i + 1,
              definition: line
            });
          }
        }
        
        // Look for enum definitions
        if (line.startsWith('enum ')) {
          const match = line.match(/enum\s+(\w+)/);
          if (match) {
            structure.enums.push({
              name: match[1],
              line: i + 1
            });
          }
        }
        
        // Look for typedef declarations
        if (line.startsWith('typedef ')) {
          structure.typedefs.push({
            declaration: line,
            line: i + 1
          });
        }
      }

      return structure;
    } catch (error) {
      this.log(`Error parsing C structure in ${filePath}: ${error.message}`, 'error');
      return { functions: [], structs: [], macros: [], enums: [], typedefs: [] };
    }
  }

  /**
   * Parses header structure from file content
   * @param {string} filePath - Path to header file
   * @returns {Promise<Object>} - Structure information
   */
  async parseHeaderStructure(filePath) {
    const ext = path.extname(filePath);
    if (ext === '.h') {
      return this.parseCStructure(filePath);
    } else {
      return this.parseCPPStructure(filePath);
    }
  }

  /**
   * Gets build commands for C/C++ projects
   * @param {string} projectPath - Path to the project
   * @returns {Promise<Array>} - Array of build command objects
   */
  async getBuildCommands(projectPath) {
    const commands = [];
    
    // Check for CMake
    const cmakeLists = path.join(projectPath, 'CMakeLists.txt');
    if (fs.existsSync(cmakeLists)) {
      commands.push({
        name: 'cmake-configure',
        command: 'cmake -B build -S .',
        description: 'Configure CMake project'
      });
      
      commands.push({
        name: 'cmake-build',
        command: 'cmake --build build',
        description: 'Build CMake project'
      });
      
      commands.push({
        name: 'cmake-clean',
        command: 'rm -rf build',
        description: 'Clean CMake build directory'
      });
    }

    // Check for Makefile
    const makefile = path.join(projectPath, 'Makefile');
    if (fs.existsSync(makefile)) {
      commands.push({
        name: 'make-build',
        command: 'make',
        description: 'Build with Make'
      });
      
      commands.push({
        name: 'make-clean',
        command: 'make clean',
        description: 'Clean with Make'
      });
    }

    // Check for Meson
    const mesonBuild = path.join(projectPath, 'meson.build');
    if (fs.existsSync(mesonBuild)) {
      commands.push({
        name: 'meson-setup',
        command: 'meson setup builddir',
        description: 'Setup Meson build'
      });
      
      commands.push({
        name: 'meson-compile',
        command: 'meson compile -C builddir',
        description: 'Compile with Meson'
      });
    }

    return commands;
  }

  /**
   * Gets test commands for C/C++ projects
   * @param {string} projectPath - Path to the project
   * @returns {Promise<Array>} - Array of test command objects
   */
  async getTestCommands(projectPath) {
    const commands = [];
    
    // Check for CTest (CMake)
    const cmakeLists = path.join(projectPath, 'CMakeLists.txt');
    if (fs.existsSync(cmakeLists)) {
      commands.push({
        name: 'ctest',
        command: 'cd build && ctest',
        description: 'Run CMake tests'
      });
    }

    // Check for Google Test
    const testFiles = await this.findFilesByPattern(projectPath, '*test*.cpp');
    if (testFiles.length > 0) {
      commands.push({
        name: 'gtest',
        command: './run_tests',
        description: 'Run Google Test tests'
      });
    }

    return commands;
  }

  /**
   * Validates that required tools are available
   * @returns {Promise<Object>} - Validation result
   */
  async validateTools() {
    const tools = {
      gcc: { required: false, available: false },
      clang: { required: false, available: false },
      cmake: { required: false, available: false },
      make: { required: false, available: false },
      meson: { required: false, available: false }
    };

    // Check GCC
    try {
      require('child_process').execSync('gcc --version', { stdio: 'ignore' });
      tools.gcc.available = true;
    } catch (error) {
      // GCC not available
    }

    // Check Clang
    try {
      require('child_process').execSync('clang --version', { stdio: 'ignore' });
      tools.clang.available = true;
    } catch (error) {
      // Clang not available
    }

    // Check CMake
    try {
      require('child_process').execSync('cmake --version', { stdio: 'ignore' });
      tools.cmake.available = true;
    } catch (error) {
      // CMake not available
    }

    // Check Make
    try {
      require('child_process').execSync('make --version', { stdio: 'ignore' });
      tools.make.available = true;
    } catch (error) {
      // Make not available
    }

    // Check Meson
    try {
      require('child_process').execSync('meson --version', { stdio: 'ignore' });
      tools.meson.available = true;
    } catch (error) {
      // Meson not available
    }

    const available = Object.values(tools).filter(tool => tool.available).length;
    const required = Object.values(tools).filter(tool => tool.required).length;

    return {
      valid: available > 0, // At least one compiler should be available
      missing: Object.entries(tools)
        .filter(([name, tool]) => tool.required && !tool.available)
        .map(([name]) => name),
      tools,
      available,
      summary: `Found ${available} C/C++ tools`
    };
  }

  /**
   * Handles dependency analysis command
   * @param {Object} context - Language context
   * @returns {Promise<Object>} - Analysis results
   */
  async handleDependenciesCommand(context) {
    console.log(context.colors.cyan + '\n🔧 C/C++ Dependency Analysis' + context.colors.reset);
    console.log(context.colors.white + '='.repeat(50) + context.colors.reset);

    const projectPath = context.projectPath;
    const cppFiles = await this.findFilesByExtension(projectPath, '.cpp');
    const cFiles = await this.findFilesByExtension(projectPath, '.c');
    const headerFiles = await this.findFilesByExtension(projectPath, '.h');
    const hppFiles = await this.findFilesByExtension(projectPath, '.hpp');
    
    const allFiles = [...cppFiles, ...cFiles, ...headerFiles, ...hppFiles];
    const results = {
      totalFiles: allFiles.length,
      dependencies: [],
      statistics: {},
      includeAnalysis: {}
    };

    console.log(context.colors.yellow + `📊 Analyzing ${allFiles.length} C/C++ files...` + context.colors.reset);

    let systemIncludes = 0;
    let localIncludes = 0;
    let headerGuards = 0;

    for (const file of allFiles) {
      try {
        const deps = await this.parseDependencies(file);
        results.dependencies.push({
          file: path.relative(projectPath, file),
          dependencies: deps,
          count: deps.length
        });

        // Analyze include types
        deps.forEach(dep => {
          if (dep.type === 'system') systemIncludes++;
          else if (dep.type === 'local') localIncludes++;
          else if (dep.type === 'guard') headerGuards++;
        });
      } catch (error) {
        console.log(context.colors.red + `❌ Error analyzing ${file}: ${error.message}` + context.colors.reset);
      }
    }

    const totalDeps = results.dependencies.reduce((sum, file) => sum + file.count, 0);
    results.statistics = {
      totalDependencies: totalDeps,
      systemIncludes,
      localIncludes,
      headerGuards,
      averageDepsPerFile: (totalDeps / allFiles.length).toFixed(2),
      filesWithDeps: results.dependencies.filter(f => f.count > 0).length
    };

    this.printDependencyResults(results, context.colors);
    return results;
  }

  /**
   * Handles structure analysis command
   * @param {Object} context - Language context
   * @returns {Promise<Object>} - Analysis results
   */
  async handleStructureCommand(context) {
    console.log(context.colors.cyan + '\n🏗️ C/C++ Structure Analysis' + context.colors.reset);
    console.log(context.colors.white + '='.repeat(50) + context.colors.reset);

    const projectPath = context.projectPath;
    const cppFiles = await this.findFilesByExtension(projectPath, '.cpp');
    const cFiles = await this.findFilesByExtension(projectPath, '.c');
    const headerFiles = await this.findFilesByExtension(projectPath, '.h');
    const hppFiles = await this.findFilesByExtension(projectPath, '.hpp');
    
    const allFiles = [...cppFiles, ...cFiles, ...headerFiles, ...hppFiles];
    const results = {
      totalFiles: allFiles.length,
      structures: [],
      summary: {
        totalClasses: 0,
        totalFunctions: 0,
        totalMethods: 0,
        totalNamespaces: 0,
        totalTemplates: 0,
        totalMacros: 0,
        totalEnums: 0,
        totalTypedefs: 0,
        totalStructs: 0
      }
    };

    console.log(context.colors.yellow + `📊 Analyzing structure of ${allFiles.length} files...` + context.colors.reset);

    for (const file of allFiles) {
      try {
        const structure = await this.parseStructure(file);
        results.structures.push({
          file: path.relative(projectPath, file),
          ...structure
        });

        // Update summary
        results.summary.totalClasses += structure.classes?.length || 0;
        results.summary.totalFunctions += structure.functions?.length || 0;
        results.summary.totalMethods += structure.methods?.length || 0;
        results.summary.totalNamespaces += structure.namespaces?.length || 0;
        results.summary.totalTemplates += structure.templates?.length || 0;
        results.summary.totalMacros += structure.macros?.length || 0;
        results.summary.totalEnums += structure.enums?.length || 0;
        results.summary.totalTypedefs += structure.typedefs?.length || 0;
        results.summary.totalStructs += structure.structs?.length || 0;
      } catch (error) {
        console.log(context.colors.red + `❌ Error analyzing ${file}: ${error.message}` + context.colors.reset);
      }
    }

    this.printStructureResults(results, context.colors);
    return results;
  }

  /**
   * Handles build command
   * @param {Object} context - Language context
   * @returns {Promise<Object>} - Build results
   */
  async handleBuildCommand(context) {
    console.log(context.colors.cyan + '\n🔨 C/C++ Build' + context.colors.reset);
    console.log(context.colors.white + '='.repeat(50) + context.colors.reset);

    const buildCommands = await this.getBuildCommands(context.projectPath);
    
    if (buildCommands.length === 0) {
      console.log(context.colors.yellow + '⚠️  No build commands found in project' + context.colors.reset);
      return { success: false, message: 'No build commands found' };
    }

    console.log(context.colors.green + '🚀 Available build commands:' + context.colors.reset);
    for (const cmd of buildCommands) {
      console.log(context.colors.white + `  ${cmd.name.padEnd(20)} ${cmd.description}` + context.colors.reset);
      console.log(context.colors.gray + `    Command: ${cmd.command}` + context.colors.reset);
    }

    return { success: true, commands: buildCommands };
  }

  /**
   * Handles test command
   * @param {Object} context - Language context
   * @returns {Promise<Object>} - Test results
   */
  async handleTestCommand(context) {
    console.log(context.colors.cyan + '\n🧪 C/C++ Testing' + context.colors.reset);
    console.log(context.colors.white + '='.repeat(50) + context.colors.reset);

    const testCommands = await this.getTestCommands(context.projectPath);
    
    if (testCommands.length === 0) {
      console.log(context.colors.yellow + '⚠️  No C/C++ test commands found in project' + context.colors.reset);
      return { success: false, message: 'No test commands found' };
    }

    console.log(context.colors.green + '🧪 Available test commands:' + context.colors.reset);
    for (const cmd of testCommands) {
      console.log(context.colors.white + `  ${cmd.name.padEnd(15)} ${cmd.description}` + context.colors.reset);
      console.log(context.colors.gray + `    Command: ${cmd.command}` + context.colors.reset);
    }

    return { success: true, commands: testCommands };
  }

  /**
   * Default command behavior
   * @param {Object} context - Language context
   * @returns {Promise<Object>} - Results
   */
  async handleDefaultCommand(context) {
    console.log(context.colors.cyan + '\n🔧 C/C++ Language Plugin' + context.colors.reset);
    console.log(context.colors.white + '='.repeat(50) + context.colors.reset);
    
    const projectPath = context.projectPath;
    const detected = await this.detectProject(projectPath);
    
    console.log(context.colors.green + `✅ C/C++ detected: ${detected}` + context.colors.reset);
    console.log(context.colors.yellow + '📁 Supported file extensions: .cpp, .cc, .cxx, .c, .hpp, .h, .hxx, .cppm' + context.colors.reset);
    console.log(context.colors.yellow + '📦 Supported project files: CMakeLists.txt, Makefile, meson.build, etc.' + context.colors.reset);
    
    const tools = await this.validateTools();
    console.log(context.colors.green + `🔧 Tools available: ${tools.summary}` + context.colors.reset);
    
    if (!tools.valid) {
      console.log(context.colors.red + `❌ Missing: ${tools.missing.join(', ')}` + context.colors.reset);
    }

    return { detected, tools };
  }

  /**
   * Helper method to check if any files exist
   * @param {string} projectPath - Path to the project
   * @param {Array} files - Array of file names to check
   * @returns {Promise<boolean>} - True if any files exist
   */
  async hasAnyFiles(projectPath, files) {
    for (const file of files) {
      if (fs.existsSync(path.join(projectPath, file))) {
        return true;
      }
    }
    return false;
  }

  /**
   * Prints dependency analysis results
   * @param {Object} results - Analysis results
   * @param {Object} colors - Color utilities
   */
  printDependencyResults(results, colors) {
    console.log(colors.cyan + '\n📈 Dependency Analysis Results:' + colors.reset);
    console.log(colors.white + `   Total Files: ${results.totalFiles}` + colors.reset);
    console.log(colors.white + `   Total Dependencies: ${results.statistics.totalDependencies}` + colors.reset);
    console.log(colors.white + `   System Includes: ${results.statistics.systemIncludes}` + colors.reset);
    console.log(colors.white + `   Local Includes: ${results.statistics.localIncludes}` + colors.reset);
    console.log(colors.white + `   Header Guards: ${results.statistics.headerGuards}` + colors.reset);
    console.log(colors.white + `   Average Dependencies per File: ${results.statistics.averageDepsPerFile}` + colors.reset);
    console.log(colors.white + `   Files with Dependencies: ${results.statistics.filesWithDeps}` + colors.reset);
  }

  /**
   * Prints structure analysis results
   * @param {Object} results - Analysis results
   * @param {Object} colors - Color utilities
   */
  printStructureResults(results, colors) {
    console.log(colors.cyan + '\n🏗️ Structure Analysis Results:' + colors.reset);
    console.log(colors.white + `   Total Files: ${results.totalFiles}` + colors.reset);
    console.log(colors.white + `   Total Classes: ${results.summary.totalClasses}` + colors.reset);
    console.log(colors.white + `   Total Functions: ${results.summary.totalFunctions}` + colors.reset);
    console.log(colors.white + `   Total Methods: ${results.summary.totalMethods}` + colors.reset);
    console.log(colors.white + `   Total Namespaces: ${results.summary.totalNamespaces}` + colors.reset);
    console.log(colors.white + `   Total Templates: ${results.summary.totalTemplates}` + colors.reset);
    console.log(colors.white + `   Total Macros: ${results.summary.totalMacros}` + colors.reset);
    console.log(colors.white + `   Total Enums: ${results.summary.totalEnums}` + colors.reset);
    console.log(colors.white + `   Total Typedefs: ${results.summary.totalTypedefs}` + colors.reset);
    console.log(colors.white + `   Total Structs: ${results.summary.totalStructs}` + colors.reset);
  }
}

module.exports = CPPLanguagePlugin;
