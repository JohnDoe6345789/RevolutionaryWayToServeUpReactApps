#!/usr/bin/env node

/**
 * Project Template Plugin
 * Generates project templates for different languages and frameworks
 */

const fs = require('fs');
const path = require('path');
const BasePlugin = require('../lib/base-plugin');

class ProjectTemplatePlugin extends BasePlugin {
  constructor() {
    super({
      name: 'project-template',
      description: 'Generate project templates for different languages and frameworks',
      version: '1.0.0',
      author: 'DEV CLI',
      category: 'generation',
      commands: [
        {
          name: 'list',
          description: 'List available project templates'
        },
        {
          name: 'create',
          description: 'Create a new project from template'
        },
        {
          name: 'info',
          description: 'Show detailed information about a template'
        }
      ],
      dependencies: []
    });

    this.defaultConfig = {
      templatesDirectory: path.join(__dirname, '..', 'templates'),
      outputDirectory: process.cwd(),
      defaultAuthor: 'Developer',
      defaultLicense: 'MIT',
      gitInit: true,
      npmInstall: false
    };

    this.templates = new Map();
    this.templatesLoaded = false;
  }

  /**
   * Main execution method
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Execution results
   */
  async execute(context) {
    await this.initialize(context);
    
    if (context.options.list) {
      return await this.handleListCommand(context);
    } else if (context.options.create) {
      return await this.handleCreateCommand(context);
    } else if (context.options.info) {
      return await this.handleInfoCommand(context);
    } else {
      return await this.handleListCommand(context);
    }
  }

  /**
   * Handles list command
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - List results
   */
  async handleListCommand(context) {
    console.log(context.colors.cyan + '\n📋 Available Project Templates' + context.colors.reset);
    console.log(context.colors.white + '='.repeat(60) + context.colors.reset);

    await this.loadTemplates();
    
    if (this.templates.size === 0) {
      console.log(context.colors.yellow + '⚠️  No templates found.' + context.colors.reset);
      return { success: false, message: 'No templates available' };
    }

    const categories = this.groupTemplatesByCategory();
    
    for (const [category, templates] of Object.entries(categories)) {
      console.log(context.colors.green + `\n📁 ${category.toUpperCase()}:` + context.colors.reset);
      
      for (const template of templates) {
        const status = template.recommended ? context.colors.yellow + '⭐' : context.colors.white + '  ';
        console.log(`${status} ${template.name.padEnd(25)} ${template.description}` + context.colors.reset);
        console.log(`${context.colors.gray}      Languages: ${template.languages.join(', ')}` + context.colors.reset);
        console.log(`${context.colors.gray}      Framework: ${template.framework || 'None'}` + context.colors.reset);
      }
    }

    console.log(context.colors.cyan + '\n💡 Usage:' + context.colors.reset);
    console.log(context.colors.white + '   dev-cli project-template --create <template-name> <project-name>' + context.colors.reset);
    console.log(context.colors.white + '   dev-cli project-template --info <template-name>' + context.colors.reset);
    
    return { success: true, templates: Array.from(this.templates.values()) };
  }

  /**
   * Handles create command
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Creation results
   */
  async handleCreateCommand(context) {
    const args = context.options.args || [];
    const templateName = args[0];
    const projectName = args[1];

    if (!templateName) {
      console.log(context.colors.red + '❌ Template name is required.' + context.colors.reset);
      console.log(context.colors.yellow + '💡 Use "dev-cli project-template --list" to see available templates.' + context.colors.reset);
      return { success: false, message: 'Template name required' };
    }

    if (!projectName) {
      console.log(context.colors.red + '❌ Project name is required.' + context.colors.reset);
      return { success: false, message: 'Project name required' };
    }

    await this.loadTemplates();
    
    const template = this.templates.get(templateName);
    if (!template) {
      console.log(context.colors.red + `❌ Template "${templateName}" not found.` + context.colors.reset);
      console.log(context.colors.yellow + '💡 Use "dev-cli project-template --list" to see available templates.' + context.colors.reset);
      return { success: false, message: 'Template not found' };
    }

    const projectPath = path.join(this.defaultConfig.outputDirectory, projectName);
    
    // Check if project already exists
    if (fs.existsSync(projectPath)) {
      console.log(context.colors.red + `❌ Project directory "${projectName}" already exists.` + context.colors.reset);
      return { success: false, message: 'Project already exists' };
    }

    console.log(context.colors.green + `🚀 Creating project "${projectName}" from template "${templateName}"...` + context.colors.reset);

    try {
      // Create project directory
      fs.mkdirSync(projectPath, { recursive: true });

      // Process template files
      await this.processTemplate(template, projectPath, projectName, context);

      // Initialize git if requested
      if (this.defaultConfig.gitInit) {
        await this.initializeGit(projectPath, context);
      }

      // Install dependencies if requested
      if (this.defaultConfig.npmInstall && template.packageManager === 'npm') {
        await this.installDependencies(projectPath, context);
      }

      console.log(context.colors.green + `✅ Project "${projectName}" created successfully!` + context.colors.reset);
      console.log(context.colors.cyan + `📁 Location: ${projectPath}` + context.colors.reset);
      
      // Show next steps
      this.showNextSteps(template, projectPath, projectName, context);

      return { success: true, projectPath, template };

    } catch (error) {
      console.log(context.colors.red + `❌ Failed to create project: ${error.message}` + context.colors.reset);
      
      // Clean up on failure
      if (fs.existsSync(projectPath)) {
        fs.rmSync(projectPath, { recursive: true, force: true });
      }

      return { success: false, error: error.message };
    }
  }

  /**
   * Handles info command
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Info results
   */
  async handleInfoCommand(context) {
    const args = context.args || [];
    const templateName = args[0];

    if (!templateName) {
      console.log(context.colors.red + '❌ Template name is required.' + context.colors.reset);
      console.log(context.colors.yellow + '💡 Use "dev-cli project-template --list" to see available templates.' + context.colors.reset);
      return { success: false, message: 'Template name required' };
    }

    await this.loadTemplates();
    
    const template = this.templates.get(templateName);
    if (!template) {
      console.log(context.colors.red + `❌ Template "${templateName}" not found.` + context.colors.reset);
      return { success: false, message: 'Template not found' };
    }

    console.log(context.colors.cyan + `\n📋 Template Information: ${templateName}` + context.colors.reset);
    console.log(context.colors.white + '='.repeat(60) + context.colors.reset);
    
    console.log(context.colors.yellow + '📝 Description:' + context.colors.reset);
    console.log(context.colors.white + `   ${template.description}` + context.colors.reset);
    
    console.log(context.colors.yellow + '\n🌍 Languages:' + context.colors.reset);
    console.log(context.colors.white + `   ${template.languages.join(', ')}` + context.colors.reset);
    
    console.log(context.colors.yellow + '\n🔧 Framework:' + context.colors.reset);
    console.log(context.colors.white + `   ${template.framework || 'None'}` + context.colors.reset);
    
    console.log(context.colors.yellow + '\n📂 Files Structure:' + context.colors.reset);
    this.printTemplateStructure(template, context.colors);
    
    console.log(context.colors.yellow + '\n⚙️  Features:' + context.colors.reset);
    if (template.features && template.features.length > 0) {
      for (const feature of template.features) {
        console.log(context.colors.white + `   ✅ ${feature}` + context.colors.reset);
      }
    }
    
    if (template.dependencies && template.dependencies.length > 0) {
      console.log(context.colors.yellow + '\n📦 Dependencies:' + context.colors.reset);
      for (const dep of template.dependencies) {
        console.log(context.colors.white + `   - ${dep}` + context.colors.reset);
      }
    }

    console.log(context.colors.yellow + '\n🚀 Usage Example:' + context.colors.reset);
    console.log(context.colors.cyan + `   dev-cli project-template --create ${templateName} my-awesome-project` + context.colors.reset);

    return { success: true, template };
  }

  /**
   * Loads all available templates
   */
  async loadTemplates() {
    if (this.templatesLoaded) return;

    const templatesDir = this.defaultConfig.templatesDirectory;
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
      this.templatesLoaded = true;
      return;
    }

    const templateDirs = fs.readdirSync(templatesDir)
      .filter(item => fs.statSync(path.join(templatesDir, item)).isDirectory());

    for (const templateDir of templateDirs) {
      const templatePath = path.join(templatesDir, templateDir);
      const templateConfig = path.join(templatePath, 'template.json');
      
      if (fs.existsSync(templateConfig)) {
        try {
          const config = JSON.parse(fs.readFileSync(templateConfig, 'utf8'));
          this.templates.set(config.name, {
            ...config,
            path: templatePath,
            directory: templateDir
          });
        } catch (error) {
          console.warn(`Warning: Failed to load template ${templateDir}: ${error.message}`);
        }
      }
    }

    this.templatesLoaded = true;
  }

  /**
   * Groups templates by category
   * @returns {Object} - Templates grouped by category
   */
  groupTemplatesByCategory() {
    const categories = {};
    
    for (const template of this.templates.values()) {
      const category = template.category || 'general';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(template);
    }

    return categories;
  }

  /**
   * Processes template files
   * @param {Object} template - Template configuration
   * @param {string} projectPath - Output project path
   * @param {string} projectName - Project name
   * @param {Object} context - Execution context
   */
  async processTemplate(template, projectPath, projectName, context) {
    const templateFiles = await this.getTemplateFiles(template.path);
    
    for (const file of templateFiles) {
      const relativePath = path.relative(template.path, file);
      const outputPath = path.join(projectPath, relativePath);
      
      // Create directory structure
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Process file content
      if (fs.statSync(file).isDirectory()) {
        await this.processDirectory(file, outputPath, projectName, template, context);
      } else {
        await this.processFile(file, outputPath, projectName, template, context);
      }
    }
  }

  /**
   * Gets all files in template directory
   * @param {string} templatePath - Template directory path
   * @returns {Promise<Array>} - Array of file paths
   */
  async getTemplateFiles(templatePath) {
    const files = [];
    
    const scan = (dir) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scan(fullPath);
        } else {
          files.push(fullPath);
        }
      }
    };
    
    scan(templatePath);
    return files;
  }

  /**
   * Processes a directory
   * @param {string} srcDir - Source directory
   * @param {string} destDir - Destination directory
   * @param {string} projectName - Project name
   * @param {Object} template - Template configuration
   * @param {Object} context - Execution context
   */
  async processDirectory(srcDir, destDir, projectName, template, context) {
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const items = fs.readdirSync(srcDir);
    
    for (const item of items) {
      const srcPath = path.join(srcDir, item);
      const destPath = path.join(destDir, item);
      const stat = fs.statSync(srcPath);
      
      if (stat.isDirectory()) {
        await this.processDirectory(srcPath, destPath, projectName, template, context);
      } else {
        await this.processFile(srcPath, destPath, projectName, template, context);
      }
    }
  }

  /**
   * Processes a single file
   * @param {string} srcFile - Source file path
   * @param {string} destFile - Destination file path
   * @param {string} projectName - Project name
   * @param {Object} template - Template configuration
   * @param {Object} context - Execution context
   */
  async processFile(srcFile, destFile, projectName, template, context) {
    let content = fs.readFileSync(srcFile, 'utf8');
    
    // Replace template variables
    content = this.replaceTemplateVariables(content, projectName, template, context);
    
    // Write processed content
    fs.writeFileSync(destFile, content, 'utf8');
  }

  /**
   * Replaces template variables in content
   * @param {string} content - File content
   * @param {string} projectName - Project name
   * @param {Object} template - Template configuration
   * @param {Object} context - Execution context
   * @returns {string} - Processed content
   */
  replaceTemplateVariables(content, projectName, template, context) {
    const variables = {
      PROJECT_NAME: projectName,
      PROJECT_NAME_KEBAB: projectName.toLowerCase().replace(/\s+/g, '-'),
      PROJECT_NAME_SNAKE: projectName.toLowerCase().replace(/\s+/g, '_'),
      PROJECT_NAME_PASCAL: projectName.replace(/\b\w/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()),
      PROJECT_NAME_CAMEL: projectName.replace(/\b\w/g, word => word.toLowerCase()),
      AUTHOR: this.defaultConfig.defaultAuthor,
      LICENSE: this.defaultConfig.defaultLicense,
      YEAR: new Date().getFullYear(),
      DESCRIPTION: template.description || `${projectName} project`,
      FRAMEWORK: template.framework || 'None'
    };

    let processedContent = content;
    
    for (const [key, value] of Object.entries(variables)) {
      processedContent = processedContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    
    return processedContent;
  }

  /**
   * Initializes git repository
   * @param {string} projectPath - Project path
   * @param {Object} context - Execution context
   */
  async initializeGit(projectPath, context) {
    try {
      const { execSync } = require('child_process');
      execSync('git init', { cwd: projectPath, stdio: 'ignore' });
      console.log(context.colors.green + '📁 Git repository initialized' + context.colors.reset);
    } catch (error) {
      console.log(context.colors.yellow + '⚠️  Failed to initialize git repository' + context.colors.reset);
    }
  }

  /**
   * Installs project dependencies
   * @param {string} projectPath - Project path
   * @param {Object} context - Execution context
   */
  async installDependencies(projectPath, context) {
    try {
      const { execSync } = require('child_process');
      execSync('npm install', { cwd: projectPath, stdio: 'ignore' });
      console.log(context.colors.green + '📦 Dependencies installed' + context.colors.reset);
    } catch (error) {
      console.log(context.colors.yellow + '⚠️  Failed to install dependencies' + context.colors.reset);
    }
  }

  /**
   * Shows next steps after project creation
   * @param {Object} template - Template configuration
   * @param {string} projectPath - Project path
   * @param {string} projectName - Project name
   * @param {Object} context - Execution context
   */
  showNextSteps(template, projectPath, projectName, context) {
    console.log(context.colors.cyan + '\n🎯 Next Steps:' + context.colors.reset);
    console.log(context.colors.white + `   cd ${projectName}` + context.colors.reset);
    
    if (template.packageManager === 'npm') {
      console.log(context.colors.white + '   npm install' + context.colors.reset);
    } else if (template.packageManager === 'pip') {
      console.log(context.colors.white + '   pip install -r requirements.txt' + context.colors.reset);
    }
    
    if (template.commands) {
      console.log(context.colors.white + `   ${template.commands.join('\n   ')}` + context.colors.reset);
    }
    
    console.log(context.colors.white + `   ${context.colors.cyan}dev-cli project-template --info ${template.name}${context.colors.reset} for more information`);
    
    console.log(context.colors.yellow + '\n💡 Happy coding!' + context.colors.reset);
  }

  /**
   * Prints template structure
   * @param {Object} template - Template configuration
   * @param {Object} colors - Color utilities
   */
  printTemplateStructure(template, colors) {
    if (!template.structure) return;
    
    const printStructure = (structure, prefix = '') => {
      for (const [name, type] of Object.entries(structure)) {
        if (type === 'directory') {
          console.log(colors.white + `${prefix}📁 ${name}/` + colors.reset);
          printStructure(type.content, prefix + '  ');
        } else if (type === 'file') {
          console.log(colors.white + `${prefix}📄 ${name}` + colors.reset);
        }
      }
    };
    
    printStructure(template.structure);
  }
}

module.exports = ProjectTemplatePlugin;
