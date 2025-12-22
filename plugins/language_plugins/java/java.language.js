#!/usr/bin/env node

/**
 * Java Language Plugin
 * Provides Java-specific analysis and generation capabilities
 */

const fs = require('fs');
const path = require('path');
const BaseLanguagePlugin = require('../../../lib/base-language-plugin');

class JavaLanguagePlugin extends BaseLanguagePlugin {
  constructor() {
    super({
      name: 'java',
      description: 'Java language support',
      version: '1.0.0',
      author: 'DEV CLI',
      language: 'java',
      category: 'language',
      fileExtensions: ['.java', '.kt', '.scala'],
      projectFiles: ['pom.xml', 'build.gradle', 'build.gradle.kts', 'settings.gradle'],
      buildSystems: ['pom.xml', 'build.gradle', 'build.gradle.kts'],
      priority: 85,
      commands: [
        {
          name: 'dependencies',
          description: 'Analyze Java dependencies and imports'
        },
        {
          name: 'structure',
          description: 'Analyze Java project structure'
        },
        {
          name: 'build',
          description: 'Execute Java build commands'
        },
        {
          name: 'test',
          description: 'Run Java tests'
        }
      ],
      dependencies: []
    });

    this.defaultConfig = {
      buildSystem: 'maven',
      jdkVersion: '11',
      mavenRepo: 'https://repo1.maven.org/maven2/',
      gradleRepo: 'https://repo.maven.apache.org/maven2/',
      ignorePatterns: ['target', 'build', '.gradle', '.m2', '.git'],
      analysis: {
        dependencyDepth: 10,
        circularDetection: true,
        packageAnalysis: true,
        annotationAnalysis: true
      }
    };
  }

  /**
   * Registers language-specific parsers
   */
  registerParsers() {
    this.parsers.set('.java', {
      dependencies: this.parseJavaDependencies.bind(this),
      structure: this.parseJavaStructure.bind(this)
    });

    this.parsers.set('.kt', {
      dependencies: this.parseKotlinDependencies.bind(this),
      structure: this.parseKotlinStructure.bind(this)
    });

    this.parsers.set('.scala', {
      dependencies: this.parseScalaDependencies.bind(this),
      structure: this.parseScalaStructure.bind(this)
    });
  }

  /**
   * Registers custom language detectors
   */
  registerDetectors() {
    this.detectors.set('maven', async (projectPath) => {
      const mavenFiles = ['pom.xml', '.m2'];
      return await this.hasAnyFiles(projectPath, mavenFiles);
    });

    this.detectors.set('gradle', async (projectPath) => {
      const gradleFiles = ['build.gradle', 'build.gradle.kts', 'settings.gradle', '.gradle'];
      return await this.hasAnyFiles(projectPath, gradleFiles);
    });

    this.detectors.set('spring', async (projectPath) => {
      const springFiles = ['application.properties', 'application.yml', 'spring-boot-starter'];
      return await this.hasAnyFiles(projectPath, springFiles) || 
             await this.hasSpringDependencies(projectPath);
    });

    this.detectors.set('android', async (projectPath) => {
      const androidFiles = ['AndroidManifest.xml', 'gradle/wrapper/gradle-wrapper.jar', 'app/build.gradle'];
      return await this.hasAnyFiles(projectPath, androidFiles);
    });
  }

  /**
   * Parses Java dependencies from file content
   * @param {string} filePath - Path to Java file
   * @returns {Promise<Array>} - Array of dependencies
   */
  async parseJavaDependencies(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const dependencies = [];
      
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Look for import statements
        if (line.startsWith('import ')) {
          const match = line.match(/import\s+(?:static\s+)?([^;]+);/);
          if (match) {
            const importPath = match[1];
            const isStatic = line.includes('static ');
            const isWildcard = importPath.endsWith('.*');
            
            dependencies.push({
              name: importPath,
              type: isStatic ? 'static' : 'regular',
              wildcard: isWildcard,
              line: i + 1,
              statement: line
            });
          }
        }
        
        // Look for package declarations
        if (line.startsWith('package ')) {
          const match = line.match(/package\s+([^;]+);/);
          if (match) {
            dependencies.push({
              name: match[1],
              type: 'package',
              line: i + 1,
              statement: line
            });
          }
        }
      }

      return dependencies;
    } catch (error) {
      this.log(`Error parsing Java dependencies in ${filePath}: ${error.message}`, 'error');
      return [];
    }
  }

  /**
   * Parses Kotlin dependencies from file content
   * @param {string} filePath - Path to Kotlin file
   * @returns {Promise<Array>} - Array of dependencies
   */
  async parseKotlinDependencies(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const dependencies = [];
      
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Look for import statements
        if (line.startsWith('import ')) {
          const match = line.match(/import\s+([^;]+);?/);
          if (match) {
            const importPath = match[1];
            const isWildcard = importPath.endsWith('.*');
            
            dependencies.push({
              name: importPath,
              type: 'regular',
              wildcard: isWildcard,
              line: i + 1,
              statement: line
            });
          }
        }
        
        // Look for package declarations
        if (line.startsWith('package ')) {
          const match = line.match(/package\s+([^;]+)/);
          if (match) {
            dependencies.push({
              name: match[1].replace(';', ''),
              type: 'package',
              line: i + 1,
              statement: line
            });
          }
        }
      }

      return dependencies;
    } catch (error) {
      this.log(`Error parsing Kotlin dependencies in ${filePath}: ${error.message}`, 'error');
      return [];
    }
  }

  /**
   * Parses Scala dependencies from file content
   * @param {string} filePath - Path to Scala file
   * @returns {Promise<Array>} - Array of dependencies
   */
  async parseScalaDependencies(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const dependencies = [];
      
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Look for import statements
        if (line.startsWith('import ')) {
          const match = line.match(/import\s+([^;]+);?/);
          if (match) {
            const importPath = match[1];
            const isWildcard = importPath.endsWith('.*') || importPath.endsWith('._');
            
            dependencies.push({
              name: importPath,
              type: 'regular',
              wildcard: isWildcard,
              line: i + 1,
              statement: line
            });
          }
        }
        
        // Look for package declarations
        if (line.startsWith('package ')) {
          const match = line.match(/package\s+([^;]+)/);
          if (match) {
            dependencies.push({
              name: match[1].replace(';', ''),
              type: 'package',
              line: i + 1,
              statement: line
            });
          }
        }
      }

      return dependencies;
    } catch (error) {
      this.log(`Error parsing Scala dependencies in ${filePath}: ${error.message}`, 'error');
      return [];
    }
  }

  /**
   * Parses Java structure from file content
   * @param {string} filePath - Path to Java file
   * @returns {Promise<Object>} - Structure information
   */
  async parseJavaStructure(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const structure = {
        package: null,
        imports: [],
        classes: [],
        interfaces: [],
        enums: [],
        methods: [],
        fields: [],
        annotations: []
      };

      const lines = content.split('\n');
      let inClass = false;
      let currentClass = null;
      let currentClassType = null;
      let braceCount = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Look for package declaration
        if (line.startsWith('package ')) {
          const match = line.match(/package\s+([^;]+);/);
          if (match) {
            structure.package = match[1];
          }
        }
        
        // Look for import statements
        if (line.startsWith('import ')) {
          const match = line.match(/import\s+(?:static\s+)?([^;]+);/);
          if (match) {
            structure.imports.push({
              name: match[1],
              line: i + 1
            });
          }
        }
        
        // Look for annotations
        if (line.startsWith('@')) {
          const match = line.match(/@(\w+)(?:\([^)]*\))?/);
          if (match) {
            structure.annotations.push({
              name: match[1],
              line: i + 1,
              fullLine: line
            });
          }
        }
        
        // Look for class definitions
        if (line.match(/^(public\s+)?(abstract\s+)?(final\s+)?(class|interface|enum)\s+\w+/)) {
          const match = line.match(/^(public\s+)?(abstract\s+)?(final\s+)?(class|interface|enum)\s+(\w+)/);
          if (match) {
            const modifiers = [];
            if (match[1]) modifiers.push('public');
            if (match[2]) modifiers.push('abstract');
            if (match[3]) modifiers.push('final');
            
            currentClass = match[5];
            currentClassType = match[4];
            inClass = true;
            
            const classInfo = {
              name: match[5],
              type: match[4],
              modifiers: modifiers,
              line: i + 1,
              package: structure.package
            };
            
            if (match[4] === 'class') {
              structure.classes.push(classInfo);
            } else if (match[4] === 'interface') {
              structure.interfaces.push(classInfo);
            } else if (match[4] === 'enum') {
              structure.enums.push(classInfo);
            }
          }
        }
        
        // Look for method definitions
        if (line.match(/\w+(?:<[^>]*>)?\s+\w+\s*\([^)]*\)\s*(?:throws\s+[^{]+)?\s*\{?/)) {
          const match = line.match(/(?:(public|private|protected|static|final|abstract|synchronized|native)\s+)*(\w+(?:<[^>]*>)?)\s+(\w+)\s*\([^)]*\)(?:\s+throws\s+[^{]+)?\s*\{?/);
          if (match && !line.includes('class ') && !line.includes('interface ') && !line.includes('enum ')) {
            const modifiers = match[1] ? match[1].split(/\s+/) : [];
            
            const methodInfo = {
              name: match[3],
              returnType: match[2],
              modifiers: modifiers,
              line: i + 1,
              class: currentClass,
              classType: currentClassType
            };
            
            if (inClass) {
              structure.methods.push(methodInfo);
            }
          }
        }
        
        // Look for field declarations
        if (line.match(/(?:(public|private|protected|static|final|transient|volatile)\s+)*\w+(?:<[^>]*>)?\s+\w+(?:\s*=\s+[^;]+)?;/)) {
          const match = line.match(/(?:(public|private|protected|static|final|transient|volatile)\s+)*(\w+(?:<[^>]*>)?)\s+(\w+)(?:\s*=\s+[^;]+)?;/);
          if (match && !line.includes('class ') && !line.includes('interface ') && !line.includes('enum ')) {
            const modifiers = match[1] ? match[1].split(/\s+/) : [];
            
            const fieldInfo = {
              name: match[3],
              type: match[2],
              modifiers: modifiers,
              line: i + 1,
              class: currentClass,
              classType: currentClassType
            };
            
            if (inClass) {
              structure.fields.push(fieldInfo);
            }
          }
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
            currentClassType = null;
          }
        }
      }

      return structure;
    } catch (error) {
      this.log(`Error parsing Java structure in ${filePath}: ${error.message}`, 'error');
      return { package: null, imports: [], classes: [], interfaces: [], enums: [], methods: [], fields: [], annotations: [] };
    }
  }

  /**
   * Parses Kotlin structure from file content
   * @param {string} filePath - Path to Kotlin file
   * @returns {Promise<Object>} - Structure information
   */
  async parseKotlinStructure(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const structure = {
        package: null,
        imports: [],
        classes: [],
        interfaces: [],
        enums: [],
        methods: [],
        properties: [],
        annotations: []
      };

      const lines = content.split('\n');
      let inClass = false;
      let currentClass = null;
      let currentClassType = null;
      let braceCount = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Look for package declaration
        if (line.startsWith('package ')) {
          const match = line.match(/package\s+([^;]+)/);
          if (match) {
            structure.package = match[1].replace(';', '');
          }
        }
        
        // Look for import statements
        if (line.startsWith('import ')) {
          const match = line.match(/import\s+([^;]+)/);
          if (match) {
            structure.imports.push({
              name: match[1].replace(';', ''),
              line: i + 1
            });
          }
        }
        
        // Look for annotations
        if (line.startsWith('@')) {
          const match = line.match(/@(\w+)(?:\([^)]*\))?/);
          if (match) {
            structure.annotations.push({
              name: match[1],
              line: i + 1,
              fullLine: line
            });
          }
        }
        
        // Look for class/interface/object definitions
        if (line.match(/^(class|interface|object|enum class)\s+\w+/)) {
          const match = line.match(/^(class|interface|object|enum class)\s+(\w+)/);
          if (match) {
            currentClass = match[2];
            currentClassType = match[1];
            inClass = true;
            
            const classInfo = {
              name: match[2],
              type: match[1],
              line: i + 1,
              package: structure.package
            };
            
            if (match[1] === 'class' || match[1] === 'object' || match[1] === 'enum class') {
              structure.classes.push(classInfo);
            } else if (match[1] === 'interface') {
              structure.interfaces.push(classInfo);
            }
          }
        }
        
        // Look for function definitions
        if (line.match(/^(fun|suspend fun)\s+\w+\s*\([^)]*\)(?::\s*[^{=]+)?\s*\{?/)) {
          const match = line.match(/^(fun|suspend fun)\s+(\w+)\s*\([^)]*\)(?::\s*[^{=]+)?\s*\{?/);
          if (match) {
            const methodInfo = {
              name: match[2],
              returnType: 'fun', // Kotlin functions have inline return types
              modifiers: match[1] === 'suspend fun' ? ['suspend'] : [],
              line: i + 1,
              class: currentClass,
              classType: currentClassType
            };
            
            structure.methods.push(methodInfo);
          }
        }
        
        // Look for property declarations
        if (line.match(/^(val|var)\s+\w+(?::\s*[^=]+)?(?:\s*=\s*[^;]+)?/)) {
          const match = line.match(/^(val|var)\s+(\w+)(?::\s*[^=]+)?(?:\s*=\s*[^;]+)?/);
          if (match) {
            const propertyInfo = {
              name: match[2],
              type: match[1], // val or var
              modifiers: [],
              line: i + 1,
              class: currentClass,
              classType: currentClassType
            };
            
            structure.properties.push(propertyInfo);
          }
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
            currentClassType = null;
          }
        }
      }

      return structure;
    } catch (error) {
      this.log(`Error parsing Kotlin structure in ${filePath}: ${error.message}`, 'error');
      return { package: null, imports: [], classes: [], interfaces: [], enums: [], methods: [], properties: [], annotations: [] };
    }
  }

  /**
   * Parses Scala structure from file content
   * @param {string} filePath - Path to Scala file
   * @returns {Promise<Object>} - Structure information
   */
  async parseScalaStructure(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const structure = {
        package: null,
        imports: [],
        classes: [],
        interfaces: [],
        objects: [],
        methods: [],
        fields: [],
        traits: []
      };

      const lines = content.split('\n');
      let inClass = false;
      let currentClass = null;
      let currentClassType = null;
      let braceCount = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Look for package declaration
        if (line.startsWith('package ')) {
          const match = line.match(/package\s+([^;]+)/);
          if (match) {
            structure.package = match[1].replace(';', '');
          }
        }
        
        // Look for import statements
        if (line.startsWith('import ')) {
          const match = line.match(/import\s+([^;]+)/);
          if (match) {
            structure.imports.push({
              name: match[1].replace(';', ''),
              line: i + 1
            });
          }
        }
        
        // Look for class/trait/object definitions
        if (line.match(/^(class|trait|object)\s+\w+/)) {
          const match = line.match(/^(class|trait|object)\s+(\w+)/);
          if (match) {
            currentClass = match[2];
            currentClassType = match[1];
            inClass = true;
            
            const classInfo = {
              name: match[2],
              type: match[1],
              line: i + 1,
              package: structure.package
            };
            
            if (match[1] === 'class') {
              structure.classes.push(classInfo);
            } else if (match[1] === 'trait') {
              structure.traits.push(classInfo);
            } else if (match[1] === 'object') {
              structure.objects.push(classInfo);
            }
          }
        }
        
        // Look for method definitions (def)
        if (line.match(/^def\s+\w+\s*\([^)]*\)(?::\s*[^{=]+)?\s*(?::\s*[^{=]+)?\s*\{?/)) {
          const match = line.match(/^def\s+(\w+)\s*\([^)]*\)(?::\s*[^{=]+)?/);
          if (match) {
            const methodInfo = {
              name: match[1],
              returnType: 'def',
              modifiers: [],
              line: i + 1,
              class: currentClass,
              classType: currentClassType
            };
            
            structure.methods.push(methodInfo);
          }
        }
        
        // Look for field declarations (val/var)
        if (line.match(/^(val|var)\s+\w+(?::\s*[^=]+)?(?:\s*=\s*[^;]+)?/)) {
          const match = line.match(/^(val|var)\s+(\w+)(?::\s*[^=]+)?/);
          if (match) {
            const fieldInfo = {
              name: match[2],
              type: match[1], // val or var
              modifiers: [],
              line: i + 1,
              class: currentClass,
              classType: currentClassType
            };
            
            structure.fields.push(fieldInfo);
          }
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
            currentClassType = null;
          }
        }
      }

      return structure;
    } catch (error) {
      this.log(`Error parsing Scala structure in ${filePath}: ${error.message}`, 'error');
      return { package: null, imports: [], classes: [], interfaces: [], objects: [], methods: [], fields: [], traits: [] };
    }
  }

  /**
   * Gets build commands for Java projects
   * @param {string} projectPath - Path to the project
   * @returns {Promise<Array>} - Array of build command objects
   */
  async getBuildCommands(projectPath) {
    const commands = [];
    
    // Check for Maven
    const pomXml = path.join(projectPath, 'pom.xml');
    if (fs.existsSync(pomXml)) {
      commands.push({
        name: 'maven-compile',
        command: 'mvn compile',
        description: 'Compile Maven project'
      });
      
      commands.push({
        name: 'maven-package',
        command: 'mvn package',
        description: 'Package Maven project'
      });
      
      commands.push({
        name: 'maven-install',
        command: 'mvn install',
        description: 'Install Maven project'
      });
      
      commands.push({
        name: 'maven-clean',
        command: 'mvn clean',
        description: 'Clean Maven project'
      });
    }

    // Check for Gradle
    const buildGradle = path.join(projectPath, 'build.gradle');
    const buildGradleKts = path.join(projectPath, 'build.gradle.kts');
    if (fs.existsSync(buildGradle) || fs.existsSync(buildGradleKts)) {
      commands.push({
        name: 'gradle-build',
        command: './gradlew build',
        description: 'Build Gradle project'
      });
      
      commands.push({
        name: 'gradle-compile',
        command: './gradlew compileJava',
        description: 'Compile Java with Gradle'
      });
      
      commands.push({
        name: 'gradle-test',
        command: './gradlew test',
        description: 'Test with Gradle'
      });
      
      commands.push({
        name: 'gradle-clean',
        command: './gradlew clean',
        description: 'Clean Gradle project'
      });
    }

    return commands;
  }

  /**
   * Gets test commands for Java projects
   * @param {string} projectPath - Path to the project
   * @returns {Promise<Array>} - Array of test command objects
   */
  async getTestCommands(projectPath) {
    const commands = [];
    
    // Check for Maven
    const pomXml = path.join(projectPath, 'pom.xml');
    if (fs.existsSync(pomXml)) {
      commands.push({
        name: 'maven-test',
        command: 'mvn test',
        description: 'Run Maven tests'
      });
      
      commands.push({
        name: 'maven-test-verify',
        command: 'mvn verify',
        description: 'Run Maven tests and verify'
      });
    }

    // Check for Gradle
    const buildGradle = path.join(projectPath, 'build.gradle');
    const buildGradleKts = path.join(projectPath, 'build.gradle.kts');
    if (fs.existsSync(buildGradle) || fs.existsSync(buildGradleKts)) {
      commands.push({
        name: 'gradle-test',
        command: './gradlew test',
        description: 'Run Gradle tests'
      });
      
      commands.push({
        name: 'gradle-test-integration',
        command: './gradlew integrationTest',
        description: 'Run Gradle integration tests'
      });
    }

    // Check for JUnit test files
    const testFiles = await this.findFilesByPattern(projectPath, '*Test.java');
    if (testFiles.length > 0) {
      commands.push({
        name: 'junit',
        command: 'java -cp ".:target/test-classes:target/classes:$(find ~/.m2 -name "*.jar" | tr "\\n" ":")" org.junit.runner.JUnitCore',
        description: 'Run JUnit tests directly'
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
      java: { required: true, available: false },
      javac: { required: true, available: false },
      maven: { required: false, available: false },
      gradle: { required: false, available: false },
      kotlinc: { required: false, available: false },
      scalac: { required: false, available: false }
    };

    // Check Java
    try {
      require('child_process').execSync('java -version', { stdio: 'ignore' });
      tools.java.available = true;
    } catch (error) {
      // Java not available
    }

    // Check Java Compiler
    try {
      require('child_process').execSync('javac -version', { stdio: 'ignore' });
      tools.javac.available = true;
    } catch (error) {
      // javac not available
    }

    // Check Maven
    try {
      require('child_process').execSync('mvn --version', { stdio: 'ignore' });
      tools.maven.available = true;
    } catch (error) {
      // Maven not available
    }

    // Check Gradle
    try {
      require('child_process').execSync('gradle --version', { stdio: 'ignore' });
      tools.gradle.available = true;
    } catch (error) {
      // Gradle not available
    }

    // Check Kotlin Compiler
    try {
      require('child_process').execSync('kotlinc -version', { stdio: 'ignore' });
      tools.kotlinc.available = true;
    } catch (error) {
      // kotlinc not available
    }

    // Check Scala Compiler
    try {
      require('child_process').execSync('scalac -version', { stdio: 'ignore' });
      tools.scalac.available = true;
    } catch (error) {
      // scalac not available
    }

    const missing = Object.entries(tools)
      .filter(([name, tool]) => tool.required && !tool.available)
      .map(([name]) => name);

    return {
      valid: missing.length === 0,
      missing,
      tools
    };
  }

  /**
   * Handles dependency analysis command
   * @param {Object} context - Language context
   * @returns {Promise<Object>} - Analysis results
   */
  async handleDependenciesCommand(context) {
    console.log(context.colors.cyan + '\n☕ Java Dependency Analysis' + context.colors.reset);
    console.log(context.colors.white + '='.repeat(50) + context.colors.reset);

    const projectPath = context.projectPath;
    const javaFiles = await this.findFilesByExtension(projectPath, '.java');
    const kotlinFiles = await this.findFilesByExtension(projectPath, '.kt');
    const scalaFiles = await this.findFilesByExtension(projectPath, '.scala');
    
    const allFiles = [...javaFiles, ...kotlinFiles, ...scalaFiles];
    const results = {
      totalFiles: allFiles.length,
      dependencies: [],
      statistics: {},
      packageAnalysis: {}
    };

    console.log(context.colors.yellow + `📊 Analyzing ${allFiles.length} JVM files...` + context.colors.reset);

    let regularImports = 0;
    let staticImports = 0;
    let wildcardImports = 0;
    let packageDeclarations = 0;
    const packages = new Set();

    for (const file of allFiles) {
      try {
        const deps = await this.parseDependencies(file);
        results.dependencies.push({
          file: path.relative(projectPath, file),
          dependencies: deps,
          count: deps.length
        });

        // Analyze import types
        deps.forEach(dep => {
          if (dep.type === 'regular') regularImports++;
          else if (dep.type === 'static') staticImports++;
          if (dep.wildcard) wildcardImports++;
          if (dep.type === 'package') {
            packageDeclarations++;
            packages.add(dep.name);
          }
        });
      } catch (error) {
        console.log(context.colors.red + `❌ Error analyzing ${file}: ${error.message}` + context.colors.reset);
      }
    }

    const totalDeps = results.dependencies.reduce((sum, file) => sum + file.count, 0);
    results.statistics = {
      totalDependencies: totalDeps,
      regularImports,
      staticImports,
      wildcardImports,
      packageDeclarations,
      uniquePackages: packages.size,
      averageDepsPerFile: (totalDeps / allFiles.length).toFixed(2),
      filesWithDeps: results.dependencies.filter(f => f.count > 0).length
    };

    results.packageAnalysis = {
      packages: Array.from(packages),
      packageCount: packages.size
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
    console.log(context.colors.cyan + '\n🏗️ JVM Structure Analysis' + context.colors.reset);
    console.log(context.colors.white + '='.repeat(50) + context.colors.reset);

    const projectPath = context.projectPath;
    const javaFiles = await this.findFilesByExtension(projectPath, '.java');
    const kotlinFiles = await this.findFilesByExtension(projectPath, '.kt');
    const scalaFiles = await this.findFilesByExtension(projectPath, '.scala');
    
    const allFiles = [...javaFiles, ...kotlinFiles, ...scalaFiles];
    const results = {
      totalFiles: allFiles.length,
      structures: [],
      summary: {
        totalClasses: 0,
        totalInterfaces: 0,
        totalEnums: 0,
        totalTraits: 0,
        totalObjects: 0,
        totalMethods: 0,
        totalFields: 0,
        totalProperties: 0,
        totalAnnotations: 0
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
        results.summary.totalInterfaces += structure.interfaces?.length || 0;
        results.summary.totalEnums += structure.enums?.length || 0;
        results.summary.totalTraits += structure.traits?.length || 0;
        results.summary.totalObjects += structure.objects?.length || 0;
        results.summary.totalMethods += structure.methods?.length || 0;
        results.summary.totalFields += structure.fields?.length || 0;
        results.summary.totalProperties += structure.properties?.length || 0;
        results.summary.totalAnnotations += structure.annotations?.length || 0;
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
    console.log(context.colors.cyan + '\n🔨 Java Build' + context.colors.reset);
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
    console.log(context.colors.cyan + '\n🧪 Java Testing' + context.colors.reset);
    console.log(context.colors.white + '='.repeat(50) + context.colors.reset);

    const testCommands = await this.getTestCommands(context.projectPath);
    
    if (testCommands.length === 0) {
      console.log(context.colors.yellow + '⚠️  No Java test commands found in project' + context.colors.reset);
      return { success: false, message: 'No test commands found' };
    }

    console.log(context.colors.green + '🧪 Available test commands:' + context.colors.reset);
    for (const cmd of testCommands) {
      console.log(context.colors.white + `  ${cmd.name.padEnd(20)} ${cmd.description}` + context.colors.reset);
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
    console.log(context.colors.cyan + '\n☕ Java Language Plugin' + context.colors.reset);
    console.log(context.colors.white + '='.repeat(50) + context.colors.reset);
    
    const projectPath = context.projectPath;
    const detected = await this.detectProject(projectPath);
    
    console.log(context.colors.green + `✅ Java detected: ${detected}` + context.colors.reset);
    console.log(context.colors.yellow + '📁 Supported file extensions: .java, .kt, .scala' + context.colors.reset);
    console.log(context.colors.yellow + '📦 Supported project files: pom.xml, build.gradle, settings.gradle, etc.' + context.colors.reset);
    
    const tools = await this.validateTools();
    console.log(context.colors.green + `🔧 Tools available: ${tools.valid ? 'All required tools found' : 'Missing tools'}` + context.colors.reset);
    
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
   * Helper method to check for Spring dependencies
   * @param {string} projectPath - Path to the project
   * @returns {Promise<boolean>} - True if Spring dependencies found
   */
  async hasSpringDependencies(projectPath) {
    const pomXml = path.join(projectPath, 'pom.xml');
    if (fs.existsSync(pomXml)) {
      try {
        const content = fs.readFileSync(pomXml, 'utf8');
        return content.includes('spring-boot-starter') || 
               content.includes('spring-framework') ||
               content.includes('org.springframework');
      } catch (error) {
        return false;
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
    console.log(colors.white + `   Regular Imports: ${results.statistics.regularImports}` + colors.reset);
    console.log(colors.white + `   Static Imports: ${results.statistics.staticImports}` + colors.reset);
    console.log(colors.white + `   Wildcard Imports: ${results.statistics.wildcardImports}` + colors.reset);
    console.log(colors.white + `   Package Declarations: ${results.statistics.packageDeclarations}` + colors.reset);
    console.log(colors.white + `   Unique Packages: ${results.statistics.uniquePackages}` + colors.reset);
    console.log(colors.white + `   Average Dependencies per File: ${results.statistics.averageDepsPerFile}` + colors.reset);
    console.log(colors.white + `   Files with Dependencies: ${results.statistics.filesWithDeps}` + colors.reset);
    
    if (results.packageAnalysis.packages.length > 0) {
      console.log(colors.yellow + '\n📦 Package Analysis:' + colors.reset);
      results.packageAnalysis.packages.slice(0, 10).forEach(pkg => {
        console.log(colors.white + `   ${pkg}` + colors.reset);
      });
      
      if (results.packageAnalysis.packages.length > 10) {
        console.log(colors.gray + `   ... and ${results.packageAnalysis.packages.length - 10} more packages` + colors.reset);
      }
    }
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
    console.log(colors.white + `   Total Interfaces: ${results.summary.totalInterfaces}` + colors.reset);
    console.log(colors.white + `   Total Enums: ${results.summary.totalEnums}` + colors.reset);
    console.log(colors.white + `   Total Traits: ${results.summary.totalTraits}` + colors.reset);
    console.log(colors.white + `   Total Objects: ${results.summary.totalObjects}` + colors.reset);
    console.log(colors.white + `   Total Methods: ${results.summary.totalMethods}` + colors.reset);
    console.log(colors.white + `   Total Fields: ${results.summary.totalFields}` + colors.reset);
    console.log(colors.white + `   Total Properties: ${results.summary.totalProperties}` + colors.reset);
    console.log(colors.white + `   Total Annotations: ${results.summary.totalAnnotations}` + colors.reset);
  }
}

module.exports = JavaLanguagePlugin;
