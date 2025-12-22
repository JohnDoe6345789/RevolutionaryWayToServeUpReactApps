#!/usr/bin/env node

/**
 * WebUIGenerator - Revolutionary static HTML web UI generation system
 * Generates comprehensive web interfaces for project documentation and exploration
 * 
 * 🚀 Revolutionary Features:
 * - Static HTML website generation
 * - Interactive API explorer
 * - Dependency graph visualization
 * - Class browser interface
 * - Searchable documentation
 * - Multiple UI framework support
 * - Responsive design and modern UI
 */

const fs = require('fs');
const path = require('path');
const BaseCodegen = require('../base/base-codegen');

class WebUIGenerator extends BaseCodegen {
  constructor(options = {}) {
    super({
      ...options,
      outputDir: options.outputDir || './generated-project',
      enableInnovations: options.enableInnovations !== false
    });
    
    this.specification = options.specification || null;
    this.webUIConfig = options.webUI || {};
    this.generatedPages = new Map();
    this.uiFramework = this.webUIConfig.uiFramework || 'bootstrap';
  }

  /**
   * Initialize web UI generator
   * @returns {Promise<WebUIGenerator>} Initialized generator
   */
  async initialize() {
    await super.initialize();
    
    this.log('🌐 Initializing Web UI Generator...', 'info');
    
    // Load specification if provided
    if (this.options.specPath && !this.specification) {
      await this.loadSpecification();
    }
    
    // Initialize web UI configuration
    this.initializeWebUIConfig();
    
    this.log('✅ Web UI Generator initialized', 'success');
    return this;
  }

  /**
   * Generate all web UI components
   * @param {Object} results - Generation results object
   * @returns {Promise<void>}
   */
  async generate(results) {
    this.log('🌐 Generating revolutionary web UI...', 'info');
    
    try {
      // Generate main structure
      await this.generateWebUIStructure();
      
      // Generate index page
      await this.generateIndexPage();
      
      // Generate API explorer
      if (this.shouldGenerateAPIExplorer()) {
        await this.generateAPIExplorer();
      }
      
      // Generate dependency graph
      if (this.shouldGenerateDependencyGraph()) {
        await this.generateDependencyGraph();
      }
      
      // Generate class browser
      if (this.shouldGenerateClassBrowser()) {
        await this.generateClassBrowser();
      }
      
      // Generate searchable docs
      if (this.shouldGenerateSearchableDocs()) {
        await this.generateSearchableDocs();
      }
      
      // Generate CSS and JavaScript assets
      await this.generateAssets();
      
      // Generate configuration pages
      await this.generateConfigurationPages();
      
      // Generate navigation and layout
      await this.generateLayoutComponents();
      
      // Generate utility pages
      await this.generateUtilityPages();
      
      // Trigger innovation features
      this.triggerInnovation('webUIGenerated', { 
        pages: this.generatedPages.size,
        framework: this.uiFramework,
        features: {
          apiExplorer: this.shouldGenerateAPIExplorer(),
          dependencyGraph: this.shouldGenerateDependencyGraph(),
          classBrowser: this.shouldGenerateClassBrowser(),
          searchableDocs: this.shouldGenerateSearchableDocs()
        }
      });
      
    } catch (error) {
      this.log(`❌ Web UI generation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Generate web UI directory structure
   * @returns {Promise<void>}
   */
  async generateWebUIStructure() {
    const webUIDir = path.join(this.options.outputDir, this.getWebUIOutputDirectory());
    
    // Create main directories
    const directories = [
      'css',
      'js',
      'assets',
      'pages',
      'components',
      'data'
    ];
    
    for (const dir of directories) {
      const dirPath = path.join(webUIDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        this.log(`📁 Created directory: ${dir}`, 'info');
      }
    }
  }

  /**
   * Generate main index page
   * @returns {Promise<void>}
   */
  async generateIndexPage() {
    const content = this.getIndexPageTemplate();
    const filePath = path.join(this.options.outputDir, this.getWebUIOutputDirectory(), 'index.html');
    
    await this.writeFile(`docs/${this.getWebUIOutputDirectory()}/index.html`, content);
    this.generatedPages.set('index', filePath);
    
    this.log('✅ Generated index page', 'success');
  }

  /**
   * Generate API explorer interface
   * @returns {Promise<void>}
   */
  async generateAPIExplorer() {
    const content = this.getAPIExplorerTemplate();
    const filePath = path.join(this.options.outputDir, this.getWebUIOutputDirectory(), 'api-explorer.html');
    
    await this.writeFile(`docs/${this.getWebUIOutputDirectory()}/api-explorer.html`, content);
    this.generatedPages.set('api-explorer', filePath);
    
    this.log('✅ Generated API explorer', 'success');
  }

  /**
   * Generate dependency graph visualization
   * @returns {Promise<void>}
   */
  async generateDependencyGraph() {
    const content = this.getDependencyGraphTemplate();
    const filePath = path.join(this.options.outputDir, this.getWebUIOutputDirectory(), 'dependency-graph.html');
    
    await this.writeFile(`docs/${this.getWebUIOutputDirectory()}/dependency-graph.html`, content);
    this.generatedPages.set('dependency-graph', filePath);
    
    this.log('✅ Generated dependency graph', 'success');
  }

  /**
   * Generate class browser interface
   * @returns {Promise<void>}
   */
  async generateClassBrowser() {
    const content = this.getClassBrowserTemplate();
    const filePath = path.join(this.options.outputDir, this.getWebUIOutputDirectory(), 'class-browser.html');
    
    await this.writeFile(`docs/${this.getWebUIOutputDirectory()}/class-browser.html`, content);
    this.generatedPages.set('class-browser', filePath);
    
    this.log('✅ Generated class browser', 'success');
  }

  /**
   * Generate searchable documentation
   * @returns {Promise<void>}
   */
  async generateSearchableDocs() {
    const content = this.getSearchableDocsTemplate();
    const filePath = path.join(this.options.outputDir, this.getWebUIOutputDirectory(), 'searchable-docs.html');
    
    await this.writeFile(`docs/${this.getWebUIOutputDirectory()}/searchable-docs.html`, content);
    this.generatedPages.set('searchable-docs', filePath);
    
    this.log('✅ Generated searchable docs', 'success');
  }

  /**
   * Generate CSS and JavaScript assets
   * @returns {Promise<void>}
   */
  async generateAssets() {
    // Generate CSS
    await this.generateCSS();
    
    // Generate JavaScript
    await this.generateJavaScript();
    
    // Generate images and icons
    await this.generateImages();
    
    this.log('✅ Generated assets', 'success');
  }

  /**
   * Generate configuration pages
   * @returns {Promise<void>}
   */
  async generateConfigurationPages() {
    // Generate settings page
    await this.generateSettingsPage();
    
    // Generate about page
    await this.generateAboutPage();
    
    this.log('✅ Generated configuration pages', 'success');
  }

  /**
   * Generate layout components
   * @returns {Promise<void>}
   */
  async generateLayoutComponents() {
    // Generate navigation
    await this.generateNavigation();
    
    // Generate header
    await this.generateHeader();
    
    // Generate footer
    await this.generateFooter();
    
    // Generate sidebar
    await this.generateSidebar();
    
    this.log('✅ Generated layout components', 'success');
  }

  /**
   * Generate utility pages
   * @returns {Promise<void>}
   */
  async generateUtilityPages() {
    // Generate help page
    await this.generateHelpPage();
    
    // Generate error page
    await this.generateErrorPage();
    
    this.log('✅ Generated utility pages', 'success');
  }

  /**
   * Get index page template
   * @returns {string} HTML template
   */
  getIndexPageTemplate() {
    const framework = this.getUIFrameworkConfig();
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.getProjectName()} - Revolutionary Web UI</title>
    ${this.getFrameworkCSS(framework)}
    <link rel="icon" type="image/x-icon" href="assets/favicon.ico">
    <link rel="stylesheet" href="css/main.css">
</head>
<body>
    ${this.getHeaderTemplate(framework)}
    
    <main class="container-fluid">
        <div class="row">
            ${this.getSidebarTemplate(framework)}
            
            <div class="col-md-9 col-lg-10">
                <div class="dashboard-header">
                    <h1 class="mb-4">🚀 ${this.getProjectName()} Web UI</h1>
                    <p class="lead">Revolutionary project documentation and exploration interface</p>
                </div>
                
                <div class="dashboard-cards row">
                    ${this.getDashboardCards(framework)}
                </div>
                
                <div class="recent-activity">
                    <h3>📊 Quick Stats</h3>
                    ${this.getProjectStats(framework)}
                </div>
            </div>
        </div>
    </main>
    
    ${this.getFooterTemplate(framework)}
    
    ${this.getFrameworkJavaScript(framework)}
</body>
</html>`;
  }

  /**
   * Get API explorer template
   * @returns {string} HTML template
   */
  getAPIExplorerTemplate() {
    const framework = this.getUIFrameworkConfig();
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Explorer - ${this.getProjectName()}</title>
    ${this.getFrameworkCSS(framework)}
    <link rel="stylesheet" href="css/main.css">
</head>
<body>
    ${this.getHeaderTemplate(framework)}
    
    <main class="container-fluid">
        <div class="row">
            ${this.getSidebarTemplate(framework)}
            
            <div class="col-md-9 col-lg-10">
                <div class="api-explorer-header">
                    <h2>🔌 API Explorer</h2>
                    <p class="lead">Interactive API documentation and testing interface</p>
                </div>
                
                <div class="api-controls">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <input type="text" class="form-control" id="api-search" placeholder="Search endpoints...">
                        </div>
                        <div class="col-md-3">
                            <select class="form-control" id="api-filter">
                                <option value="all">All Methods</option>
                                <option value="get">GET Methods</option>
                                <option value="post">POST Methods</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <button class="btn btn-primary" onclick="exportAPI()">Export</button>
                        </div>
                    </div>
                </div>
                
                <div class="api-endpoints">
                    <h3>📋 API Endpoints</h3>
                    ${this.getAPIEndpointsList(framework)}
                </div>
                
                <div class="api-details" id="api-details">
                    <!-- API details will be loaded here -->
                </div>
            </div>
        </div>
    </main>
    
    ${this.getFooterTemplate(framework)}
    
    <script src="js/api-explorer.js"></script>
    ${this.getFrameworkJavaScript(framework)}
</body>
</html>`;
  }

  /**
   * Get dependency graph template
   * @returns {string} HTML template
   */
  getDependencyGraphTemplate() {
    const framework = this.getUIFrameworkConfig();
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dependency Graph - ${this.getProjectName()}</title>
    ${this.getFrameworkCSS(framework)}
    <link rel="stylesheet" href="css/main.css">
</head>
<body>
    ${this.getHeaderTemplate(framework)}
    
    <main class="container-fluid">
        <div class="row">
            ${this.getSidebarTemplate(framework)}
            
            <div class="col-md-9 col-lg-10">
                <div class="graph-header">
                    <h2>📊 Dependency Graph</h2>
                    <p class="lead">Interactive visualization of project dependencies</p>
                </div>
                
                <div class="graph-controls">
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <button class="btn btn-primary" onclick="refreshGraph()">🔄 Refresh</button>
                        </div>
                        <div class="col-md-4">
                            <select class="form-control" id="graph-layout">
                                <option value="force">Force Layout</option>
                                <option value="circular">Circular Layout</option>
                                <option value="hierarchical">Hierarchical Layout</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <button class="btn btn-secondary" onclick="exportGraph()">📥 Export</button>
                        </div>
                    </div>
                </div>
                
                <div class="graph-container">
                    <div id="dependency-graph">
                        <!-- Dependency graph will be rendered here -->
                    </div>
                </div>
                
                <div class="graph-stats">
                    <h3>📈 Graph Statistics</h3>
                    ${this.getGraphStatistics(framework)}
                </div>
            </div>
        </div>
    </main>
    
    ${this.getFooterTemplate(framework)}
    
    <script src="js/dependency-graph.js"></script>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    ${this.getFrameworkJavaScript(framework)}
</body>
</html>`;
  }

  /**
   * Get class browser template
   * @returns {string} HTML template
   */
  getClassBrowserTemplate() {
    const framework = this.getUIFrameworkConfig();
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Class Browser - ${this.getProjectName()}</title>
    ${this.getFrameworkCSS(framework)}
    <link rel="stylesheet" href="css/main.css">
</head>
<body>
    ${this.getHeaderTemplate(framework)}
    
    <main class="container-fluid">
        <div class="row">
            ${this.getSidebarTemplate(framework)}
            
            <div class="col-md-9 col-lg-10">
                <div class="class-browser-header">
                    <h2>📦 Class Browser</h2>
                    <p class="lead">Browse and explore project classes and their relationships</p>
                </div>
                
                <div class="class-controls">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <input type="text" class="form-control" id="class-search" placeholder="Search classes...">
                        </div>
                        <div class="col-md-3">
                            <select class="form-control" id="class-type">
                                <option value="all">All Types</option>
                                <option value="business">Business Logic</option>
                                <option value="data">Data Classes</option>
                                <option value="factory">Factories</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <select class="form-control" id="class-sort">
                                <option value="name">Sort by Name</option>
                                <option value="type">Sort by Type</option>
                                <option value="dependencies">Sort by Dependencies</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="class-grid">
                    <h3>📋 Classes</h3>
                    ${this.getClassesGrid(framework)}
                </div>
                
                <div class="class-details" id="class-details">
                    <!-- Class details will be loaded here -->
                </div>
            </div>
        </div>
    </main>
    
    ${this.getFooterTemplate(framework)}
    
    <script src="js/class-browser.js"></script>
    ${this.getFrameworkJavaScript(framework)}
</body>
</html>`;
  }

  /**
   * Get searchable docs template
   * @returns {string} HTML template
   */
  getSearchableDocsTemplate() {
    const framework = this.getUIFrameworkConfig();
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Searchable Documentation - ${this.getProjectName()}</title>
    ${this.getFrameworkCSS(framework)}
    <link rel="stylesheet" href="css/main.css">
</head>
<body>
    ${this.getHeaderTemplate(framework)}
    
    <main class="container-fluid">
        <div class="row">
            ${this.getSidebarTemplate(framework)}
            
            <div class="col-md-9 col-lg-10">
                <div class="docs-header">
                    <h2>🔍 Searchable Documentation</h2>
                    <p class="lead">Search and explore project documentation</p>
                </div>
                
                <div class="search-controls">
                    <div class="row mb-3">
                        <div class="col-md-8">
                            <input type="text" class="form-control" id="docs-search" placeholder="Search documentation...">
                        </div>
                        <div class="col-md-4">
                            <button class="btn btn-outline-secondary" onclick="clearSearch()">Clear</button>
                        </div>
                    </div>
                </div>
                
                <div class="search-results">
                    <h3>📄 Search Results</h3>
                    <div id="search-results">
                        <div class="alert alert-info">
                            <i class="bi bi-search"></i> Enter a search term to find documentation
                        </div>
                    </div>
                </div>
                
                <div class="docs-content" id="docs-content">
                    <!-- Documentation content will be loaded here -->
                </div>
            </div>
        </div>
    </main>
    
    ${this.getFooterTemplate(framework)}
    
    <script src="js/searchable-docs.js"></script>
    ${this.getFrameworkJavaScript(framework)}
</body>
</html>`;
  }

  /**
   * Get UI framework configuration
   * @returns {Object} Framework configuration
   */
  getUIFrameworkConfig() {
    const frameworks = {
      bootstrap: {
        cssClasses: 'btn btn-primary btn-secondary btn-success btn-danger btn-info',
        containerClass: 'container-fluid',
        gridSystem: 'col-md-3 col-lg-2'
      },
      tailwind: {
        cssClasses: 'bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded',
        containerClass: 'container mx-auto',
        gridSystem: 'w-full md:w-1/4 lg:w-1/5'
      },
      bulma: {
        cssClasses: 'button is-primary is-secondary',
        containerClass: 'container is-fluid',
        gridSystem: 'column is-3'
      }
    };
    
    return frameworks[this.uiFramework] || frameworks.bootstrap;
  }

  /**
   * Get project name
   * @returns {string} Project name
   */
  getProjectName() {
    return this.specification?.project?.name || 'Revolutionary Project';
  }

  /**
   * Get dashboard cards HTML
   * @param {Object} framework - UI framework configuration
   * @returns {string} Dashboard cards HTML
   */
  getDashboardCards(framework) {
    const projectInfo = this.getProjectInfo();
    const cards = [
      {
        title: '📦 Classes',
        value: projectInfo.totalClasses,
        icon: 'bi bi-box',
        color: 'primary'
      },
      {
        title: '🔗 Dependencies',
        value: projectInfo.totalDependencies,
        icon: 'bi bi-diagram-3',
        color: 'info'
      },
      {
        title: '📋 Business Logic',
        value: projectInfo.businessClasses,
        icon: 'bi bi-gear',
        color: 'success'
      },
      {
        title: '📊 Data Classes',
        value: projectInfo.dataClasses,
        icon: 'bi bi-database',
        color: 'warning'
      },
      {
        title: '🏭 Factories',
        value: projectInfo.factories,
        icon: 'bi bi-building',
        color: 'danger'
      }
    ];
    
    return cards.map(card => `
                    <div class="col-md-6 col-lg-4 mb-4">
                        <div class="card text-center">
                            <div class="card-body">
                                <i class="bi ${card.icon} display-4 ${framework.cssClasses.includes(card.color) ? framework.cssClasses : ''}"></i>
                                <h5 class="card-title">${card.title}</h5>
                                <p class="card-text display-4">${card.value}</p>
                            </div>
                        </div>
                    </div>
    `).join('');
  }

  /**
   * Get project information
   * @returns {Object} Project statistics
   */
  getProjectInfo() {
    return {
      totalClasses: this.getClassCount(),
      businessClasses: this.getBusinessClassCount(),
      dataClasses: this.getDataClassCount(),
      factories: this.getFactoryCount(),
      totalDependencies: this.getDependencyCount()
    };
  }

  /**
   * Get project statistics HTML
   * @param {Object} framework - UI framework configuration
   * @returns {string} Project statistics HTML
   */
  getProjectStats(framework) {
    const stats = this.getProjectInfo();
    
    return `
                <div class="row">
                    <div class="col-md-3">
                        <div class="stat-card ${framework.cssClasses.includes('primary') ? framework.cssClasses : ''}">
                            <h5>Classes</h5>
                            <p class="display-4">${stats.totalClasses}</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card ${framework.cssClasses.includes('info') ? framework.cssClasses : ''}">
                            <h5>Dependencies</h5>
                            <p class="display-4">${stats.totalDependencies}</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card ${framework.cssClasses.includes('success') ? framework.cssClasses : ''}">
                            <h5>Business Logic</h5>
                            <p class="display-4">${stats.businessClasses}</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card ${framework.cssClasses.includes('warning') ? framework.cssClasses : ''}">
                            <h5>Data Classes</h5>
                            <p class="display-4">${stats.dataClasses}</p>
                        </div>
                    </div>
                </div>
                <div class="row mt-3">
                    <div class="col-md-4">
                        <div class="stat-card ${framework.cssClasses.includes('danger') ? framework.cssClasses : ''}">
                            <h5>Factories</h5>
                            <p class="display-4">${stats.factories}</p>
                        </div>
                    </div>
                </div>
    `;
  }

  /**
   * Get class count
   * @returns {number} Total class count
   */
  getClassCount() {
    if (!this.specification?.classes) return 0;
    
    return (this.specification.classes.businessLogic?.length || 0) +
           (this.specification.classes.dataClasses?.length || 0) +
           (this.specification.classes.factories?.length || 0) +
           (this.specification.classes.aggregates?.length || 0);
  }

  /**
   * Get business class count
   * @returns {number} Business logic class count
   */
  getBusinessClassCount() {
    return this.specification?.classes?.businessLogic?.length || 0;
  }

  /**
   * Get data class count
   * @returns {number} Data class count
   */
  getDataClassCount() {
    return this.specification?.classes?.dataClasses?.length || 0;
  }

  /**
   * Get factory count
   * @returns {number} Factory count
   */
  getFactoryCount() {
    return this.specification?.classes?.factories?.length || 0;
  }

  /**
   * Get dependency count
   * @returns {number} Total dependency count
   */
  getDependencyCount() {
    if (!this.specification?.classes) return 0;
    
    let totalDeps = 0;
    
    const allClasses = [
      ...(this.specification.classes.businessLogic || []),
      ...(this.specification.classes.factories || []),
      ...(this.specification.classes.dataClasses || [])
    ];
    
    for (const classSpec of allClasses) {
      if (classSpec.dependencies) {
        totalDeps += classSpec.dependencies.length;
      }
    }
    
    return totalDeps;
  }

  /**
   * Check if API explorer should be generated
   * @returns {boolean} True if API explorer should be generated
   */
  shouldGenerateAPIExplorer() {
    return this.webUIConfig.features?.apiExplorer !== false;
  }

  /**
   * Check if dependency graph should be generated
   * @returns {boolean} True if dependency graph should be generated
   */
  shouldGenerateDependencyGraph() {
    return this.webUIConfig.features?.dependencyGraph !== false;
  }

  /**
   * Check if class browser should be generated
   * @returns {boolean} True if class browser should be generated
   */
  shouldGenerateClassBrowser() {
    return this.webUIConfig.features?.classBrowser !== false;
  }

  /**
   * Check if searchable docs should be generated
   * @returns {boolean} True if searchable docs should be generated
   */
  shouldGenerateSearchableDocs() {
    return this.webUIConfig.features?.searchableDocs !== false;
  }

  /**
   * Get web UI output directory
   * @returns {string} Output directory path
   */
  getWebUIOutputDirectory() {
    return this.webUIConfig.outputDirectory || 'web-ui';
  }

  /**
   * Get framework CSS includes
   * @param {Object} framework - UI framework configuration
   * @returns {string} CSS includes
   */
  getFrameworkCSS(framework) {
    switch (this.uiFramework) {
      case 'bootstrap':
        return '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">';
      case 'tailwind':
        return '<script src="https://cdn.tailwindcss.com"></script>';
      case 'bulma':
        return '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">';
      default:
        return '';
    }
  }

  /**
   * Get framework JavaScript includes
   * @param {Object} framework - UI framework configuration
   * @returns {string} JavaScript includes
   */
  getFrameworkJavaScript(framework) {
    switch (this.uiFramework) {
      case 'bootstrap':
        return '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>';
      case 'tailwind':
        return '';
      case 'bulma':
        return '';
      default:
        return '';
    }
  }

  /**
   * Initialize web UI configuration
   * @returns {void}
   */
  initializeWebUIConfig() {
    this.webUIConfig = {
      generateWebUI: true,
      uiFramework: 'bootstrap',
      outputDirectory: 'web-ui',
      features: {
        apiExplorer: true,
        dependencyGraph: true,
        classBrowser: true,
        searchableDocs: true
      },
      templates: {
        indexTemplate: 'default',
        apiTemplate: 'default',
        classTemplate: 'default'
      },
      ...this.webUIConfig
    };
  }

  /**
   * Load project specification
   * @returns {Promise<void>}
   */
  async loadSpecification() {
    try {
      if (fs.existsSync(this.options.specPath)) {
        const content = fs.readFileSync(this.options.specPath, 'utf8');
        this.specification = JSON.parse(content);
        this.log(`📂 Loaded specification from ${this.options.specPath}`, 'success');
      }
    } catch (error) {
      this.log(`⚠️  Failed to load specification: ${error.message}`, 'warning');
    }
  }

  /**
   * Generate CSS files
   * @returns {Promise<void>}
   */
  async generateCSS() {
    const framework = this.getUIFrameworkConfig();
    const cssContent = this.getMainCSS(framework);
    
    await this.writeFile(`docs/${this.getWebUIOutputDirectory()}/css/main.css`, cssContent);
  }

  /**
   * Get main CSS content
   * @param {Object} framework - UI framework configuration
   * @returns {string} CSS content
   */
  getMainCSS(framework) {
    return `/* 🎨 Revolutionary Web UI CSS */
/* Generated by RevolutionaryCodegen */

/* Custom overrides for ${this.uiFramework} */
:root {
    --primary-color: #007bff;
    --secondary-color: #6c757d;
    --success-color: #28a745;
    --warning-color: #ffc107;
    --danger-color: #dc3545;
    --info-color: #17a2b8;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background-color: #f8f9fa;
    line-height: 1.6;
}

/* Dashboard styles */
.dashboard-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem;
    border-radius: 10px;
    margin-bottom: 2rem;
}

.dashboard-cards .card {
    border: none;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;
}

.dashboard-cards .card:hover {
    transform: translateY(-5px);
}

.stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    border-left: 4px solid var(--primary-color);
}

/* API Explorer styles */
.api-controls {
    background: white;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.api-endpoints {
    background: white;
    padding: 1rem;
    border-radius: 8px;
}

.endpoint-card {
    border: 1px solid #dee2e6;
    border-radius: 8px;
    margin-bottom: 1rem;
    transition: all 0.2s;
}

.endpoint-card:hover {
    border-color: var(--primary-color);
    box-shadow: 0 4px 8px rgba(0, 123, 255, 0.1);
}

/* Dependency graph styles */
.graph-container {
    background: white;
    border-radius: 8px;
    padding: 1rem;
    min-height: 500px;
    border: 1px solid #dee2e6;
}

#dependency-graph {
    width: 100%;
    height: 500px;
    border: 1px solid #eee;
    border-radius: 4px;
}

/* Class browser styles */
.class-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
}

.class-card {
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 1rem;
    transition: all 0.2s;
}

.class-card:hover {
    border-color: var(--primary-color);
    box-shadow: 0 4px 8px rgba(0, 123, 255, 0.1);
}

/* Searchable docs styles */
.search-results {
    background: white;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
}

.search-result {
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 1rem;
    margin-bottom: 0.5rem;
}

.search-result:hover {
    border-color: var(--info-color);
}

/* Responsive design */
@media (max-width: 768px) {
    .dashboard-cards .col-md-6 {
        margin-bottom: 1rem;
    }
    
    .class-grid {
        grid-template-columns: 1fr;
    }
}

/* Animation styles */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.fade-in {
    animation: fadeIn 0.3s ease-in;
}
`;
  }

  /**
   * Generate JavaScript files
   * @returns {Promise<void>}
   */
  async generateJavaScript() {
    // API Explorer JavaScript
    const apiExplorerJS = this.getAPIExplorerJS();
    await this.writeFile(`docs/${this.getWebUIOutputDirectory()}/js/api-explorer.js`, apiExplorerJS);
    
    // Dependency Graph JavaScript
    const dependencyGraphJS = this.getDependencyGraphJS();
    await this.writeFile(`docs/${this.getWebUIOutputDirectory()}/js/dependency-graph.js`, dependencyGraphJS);
    
    // Class Browser JavaScript
    const classBrowserJS = this.getClassBrowserJS();
    await this.writeFile(`docs/${this.getWebUIOutputDirectory()}/js/class-browser.js`, classBrowserJS);
    
    // Searchable Docs JavaScript
    const searchableDocsJS = this.getSearchableDocsJS();
    await this.writeFile(`docs/${this.getWebUIOutputDirectory()}/js/searchable-docs.js`, searchableDocsJS);
  }

  /**
   * Get API Explorer JavaScript
   * @returns {string} JavaScript content
   */
  getAPIExplorerJS() {
    return `/**
 * 🌐 API Explorer JavaScript
 * Interactive API documentation and testing interface
 * 
 * @generated by RevolutionaryCodegen
 */

class APIExplorer {
  constructor() {
    this.endpoints = this.loadEndpoints();
    this.initializeEventListeners();
  }

  loadEndpoints() {
    // This would load from project specification
    return [
      {
        name: 'UserService',
        method: 'POST',
        path: '/api/users',
        description: 'User management operations',
        parameters: ['userData']
      },
      {
        name: 'DataService',
        method: 'GET',
        path: '/api/data',
        description: 'Data retrieval operations',
        parameters: []
      }
    ];
  }

  initializeEventListeners() {
    document.getElementById('api-search')?.addEventListener('input', (e) => {
      this.filterEndpoints(e.target.value);
    });

    document.getElementById('api-filter')?.addEventListener('change', (e) => {
      this.filterEndpointsByMethod(e.target.value);
    });
  }

  filterEndpoints(searchTerm) {
    const filtered = this.endpoints.filter(endpoint => 
      endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    this.renderEndpoints(filtered);
  }

  filterEndpointsByMethod(method) {
    const filtered = method === 'all' 
      ? this.endpoints 
      : this.endpoints.filter(endpoint => endpoint.method === method.toUpperCase());
    
    this.renderEndpoints(filtered);
  }

  renderEndpoints(endpoints) {
    const container = document.getElementById('api-endpoints');
    if (!container) return;

    container.innerHTML = endpoints.map(endpoint => \`
      <div class="endpoint-card">
          <div class="card-header">
            <h5>\${endpoint.method} \${endpoint.path}</h5>
            <small>\${endpoint.description}</small>
          </div>
          <div class="card-body">
            <button class="btn btn-primary btn-sm" onclick="apiExplorer.showDetails('\${endpoint.name}')">
              View Details
            </button>
          </div>
      </div>
    \`).join('');
  }

  showDetails(endpointName) {
    const endpoint = this.endpoints.find(ep => ep.name === endpointName);
    if (!endpoint) return;

    const detailsContainer = document.getElementById('api-details');
    if (!detailsContainer) return;

    detailsContainer.innerHTML = \`
      <div class="card">
          <div class="card-header">
            <h4>\${endpoint.name}</h4>
          </div>
          <div class="card-body">
            <p><strong>Method:</strong> \${endpoint.method}</p>
            <p><strong>Path:</strong> \${endpoint.path}</p>
            <p><strong>Description:</strong> \${endpoint.description}</p>
            <p><strong>Parameters:</strong> \${endpoint.parameters.join(', ')}</p>
          </div>
      </div>
    \`;
  }

  exportAPI() {
    const data = JSON.stringify(this.endpoints, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'api-endpoints.json';
    a.click();
  }
}

// Initialize API Explorer
const apiExplorer = new APIExplorer();
window.apiExplorer = apiExplorer;
`;
  }

  /**
   * Get Dependency Graph JavaScript
   * @returns {string} JavaScript content
   */
  getDependencyGraphJS() {
    return `/**
 * 📊 Dependency Graph JavaScript
 * Interactive dependency visualization
 * 
 * @generated by RevolutionaryCodegen
 */

class DependencyGraph {
  constructor() {
    this.graph = this.loadDependencyGraph();
    this.initializeGraph();
  }

  loadDependencyGraph() {
    // This would load from project specification
    return {
      nodes: [
        { id: 'UserService', label: 'UserService', group: 'business' },
        { id: 'DataService', label: 'DataService', group: 'business' },
        { id: 'BaseService', label: 'BaseService', group: 'core' },
        { id: 'BaseData', label: 'BaseData', group: 'core' }
      ],
      links: [
        { source: 'UserService', target: 'BaseService' },
        { source: 'DataService', target: 'BaseService' },
        { source: 'UserService', target: 'BaseData' }
      ]
    };
  }

  initializeGraph() {
    const container = d3.select('#dependency-graph');
    if (!container) return;

    const width = container.node().getBoundingClientRect().width;
    const height = 500;

    // Create SVG
    const svg = container.append('svg')
      .attr('width', width)
      .attr('height', height);

    // Create force simulation
    const simulation = d3.forceSimulation(this.graph.nodes)
      .forceLink(d3.forceLink().id(d => d.id).distance(100))
      .forceCharge(d3.forceManyBody().strength(-300))
      .forceCenter(d3.forceCenter(width / 2, height / 2));

    // Create links
    const links = svg.append('g')
      .selectAll('line')
      .data(this.graph.links)
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2);

    // Create nodes
    const nodes = svg.append('g')
      .selectAll('circle')
      .data(this.graph.nodes)
      .enter().append('circle')
      .attr('r', 8)
      .attr('fill', d => {
        const colors = { business: '#007bff', core: '#6c757d', data: '#28a745', factory: '#ffc107' };
        return colors[d.group] || '#17a2b8';
      });

    // Add labels
    svg.append('g')
      .selectAll('text')
      .data(this.graph.nodes)
      .enter().append('text')
      .text(d => d.label)
      .attr('font-size', 10)
      .attr('dx', 12)
      .attr('dy', 4);

    // Update positions on each tick
    simulation.on('tick', () => {
      links
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      nodes
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      svg.selectAll('text')
        .attr('x', d => d.x + 12)
        .attr('y', d => d.y + 4);
    });

    simulation.on('end', () => {
      console.log('Dependency graph rendered');
    });
  }

  refreshGraph() {
    this.initializeGraph();
  }

  exportGraph() {
    const data = JSON.stringify(this.graph, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dependency-graph.json';
    a.click();
  }
}

// Initialize Dependency Graph
const dependencyGraph = new DependencyGraph();
window.dependencyGraph = dependencyGraph;
`;
  }

  /**
   * Get Class Browser JavaScript
   * @returns {string} JavaScript content
   */
  getClassBrowserJS() {
    return `/**
 * 📦 Class Browser JavaScript
 * Interactive class exploration interface
 * 
 * @generated by RevolutionaryCodegen
 */

class ClassBrowser {
  constructor() {
    this.classes = this.loadClasses();
    this.initializeEventListeners();
  }

  loadClasses() {
    // This would load from project specification
    return [
      {
        name: 'UserService',
        type: 'business',
        description: 'Service for user management operations',
        dependencies: ['BaseService', 'UserData']
      },
      {
        name: 'DataService',
        type: 'business',
        description: 'Service for data persistence operations',
        dependencies: ['BaseService', 'ConfigData']
      },
      {
        name: 'UserData',
        type: 'data',
        description: 'Data class for user information',
        properties: ['id', 'email', 'username', 'profile']
      },
      {
        name: 'ConfigData',
        type: 'data',
        description: 'Data class for configuration information',
        properties: ['timeout', 'retries', 'logging']
      }
    ];
  }

  initializeEventListeners() {
    document.getElementById('class-search')?.addEventListener('input', (e) => {
      this.filterClasses(e.target.value);
    });

    document.getElementById('class-type')?.addEventListener('change', (e) => {
      this.filterClassesByType(e.target.value);
    });

    document.getElementById('class-sort')?.addEventListener('change', (e) => {
      this.sortClasses(e.target.value);
    });
  }

  filterClasses(searchTerm) {
    const filtered = this.classes.filter(cls => 
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    this.renderClasses(filtered);
  }

  filterClassesByType(type) {
    const filtered = type === 'all' 
      ? this.classes 
      : this.classes.filter(cls => cls.type === type);
    
    this.renderClasses(filtered);
  }

  sortClasses(sortBy) {
    let sorted = [...this.classes];
    
    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'type':
        sorted.sort((a, b) => a.type.localeCompare(b.type));
        break;
      case 'dependencies':
        sorted.sort((a, b) => (b.dependencies?.length || 0) - (a.dependencies?.length || 0));
        break;
    }
    
    this.renderClasses(sorted);
  }

  renderClasses(classes) {
    const container = document.getElementById('class-grid');
    if (!container) return;

    container.innerHTML = classes.map(cls => \`
      <div class="class-card" onclick="classBrowser.showDetails('\${cls.name}')">
          <div class="card-header">
            <h5>\${cls.name}</h5>
            <span class="badge bg-primary">\${cls.type}</span>
          </div>
          <div class="card-body">
            <p>\${cls.description}</p>
            <div class="dependencies">
              <strong>Dependencies:</strong> \${(cls.dependencies || []).join(', ')}
            </div>
          </div>
      </div>
    \`).join('');
  }

  showDetails(className) {
    const cls = this.classes.find(c => c.name === className);
    if (!cls) return;

    const detailsContainer = document.getElementById('class-details');
    if (!detailsContainer) return;

    detailsContainer.innerHTML = \`
      <div class="card">
          <div class="card-header">
            <h4>\${cls.name}</h4>
          </div>
          <div class="card-body">
            <p><strong>Type:</strong> \${cls.type}</p>
            <p><strong>Description:</strong> \${cls.description}</p>
            <p><strong>Dependencies:</strong> \${(cls.dependencies || []).join(', ')}</p>
            \${cls.properties ? \`<p><strong>Properties:</strong> \${cls.properties.join(', ')}</p>\` : ''}
          </div>
      </div>
    \`;
  }
}

// Initialize Class Browser
const classBrowser = new ClassBrowser();
window.classBrowser = classBrowser;
`;
  }

  /**
   * Get Searchable Docs JavaScript
   * @returns {string} JavaScript content
   */
  getSearchableDocsJS() {
    return `/**
 * 🔍 Searchable Documentation JavaScript
 * Interactive documentation search interface
 * 
 * @generated by RevolutionaryCodegen
 */

class SearchableDocs {
  constructor() {
    this.documentation = this.loadDocumentation();
    this.initializeEventListeners();
  }

  loadDocumentation() {
    // This would load from generated documentation
    return [
      {
        title: 'UserService API',
        content: 'Complete API documentation for UserService endpoints',
        keywords: ['user', 'service', 'api', 'management']
      },
      {
        title: 'Data Classes',
        content: 'Overview of all data classes and their properties',
        keywords: ['data', 'classes', 'models', 'properties']
      },
      {
        title: 'Factory Pattern',
        content: 'Implementation of factory pattern for object creation',
        keywords: ['factory', 'pattern', 'creation', 'objects']
      },
      {
        title: 'Dependency Management',
        content: 'Dependency injection and management system documentation',
        keywords: ['dependency', 'injection', 'management', 'registry']
      }
    ];
  }

  initializeEventListeners() {
    document.getElementById('docs-search')?.addEventListener('input', (e) => {
      this.search(e.target.value);
    });
  }

  search(searchTerm) {
    if (!searchTerm || searchTerm.length < 2) {
      this.renderResults([]);
      return;
    }

    const results = this.documentation.filter(doc => 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    this.renderResults(results);
  }

  renderResults(results) {
    const container = document.getElementById('search-results');
    if (!container) return;

    if (results.length === 0) {
      container.innerHTML = \`
        <div class="alert alert-warning">
          <i class="bi bi-search"></i> No results found for your search. Try different keywords.
        </div>
      \`;
      return;
    }

    container.innerHTML = results.map(result => \`
      <div class="search-result">
          <div class="result-header">
            <h5>\${result.title}</h5>
          </div>
          <div class="result-content">
            <p>\${result.content}</p>
            <div class="keywords">
              <strong>Keywords:</strong> \${result.keywords.join(', ')}
            </div>
          </div>
      </div>
    \`).join('');
  }

  clearSearch() {
    document.getElementById('docs-search').value = '';
    this.renderResults([]);
    document.getElementById('docs-content').innerHTML = '<div class="alert alert-info">Enter a search term to find documentation.</div>';
  }
}

// Initialize Searchable Docs
const searchableDocs = new SearchableDocs();
window.searchableDocs = searchableDocs;
`;
  }

  /**
   * Generate images and icons
   * @returns {Promise<void>}
   */
  async generateImages() {
    // Generate favicon
    const faviconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="32" height="32" fill="#007bff"/>
      <text x="6" y="22" font-family="Arial" font-size="14" fill="white">R</text>
    </svg>`;
    
    await this.writeFile(`docs/${this.getWebUIOutputDirectory()}/assets/favicon.svg`, faviconSVG);
  }

  /**
   * Generate layout components
   * @returns {Promise<void>}
   */
  async generateNavigation() {
    const navigationHTML = `
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
          <div class="container-fluid">
              <a class="navbar-brand" href="index.html">
                  🚀 ${this.getProjectName()}
              </a>
              <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                  <span class="navbar-toggler-icon"></span>
              </button>
              <div class="collapse navbar-collapse" id="navbarNav">
                  <ul class="navbar-nav me-auto">
                      <li class="nav-item">
                          <a class="nav-link" href="index.html">
                              📊 Dashboard
                          </a>
                      </li>
                      <li class="nav-item">
                          <a class="nav-link" href="api-explorer.html">
                              🔌 API Explorer
                          </a>
                      </li>
                      <li class="nav-item">
                          <a class="nav-link" href="dependency-graph.html">
                              📊 Dependencies
                          </a>
                      </li>
                      <li class="nav-item">
                          <a class="nav-link" href="class-browser.html">
                              📦 Classes
                          </a>
                      </li>
                      <li class="nav-item">
                          <a class="nav-link" href="searchable-docs.html">
                              🔍 Documentation
                          </a>
                      </li>
                  </ul>
              </div>
          </div>
      </nav>
    `;
    
    await this.writeFile(`docs/${this.getWebUIOutputDirectory()}/components/navigation.html`, navigationHTML);
  }

  /**
   * Generate header component
   * @returns {Promise<void>}
   */
  async generateHeader() {
    const headerHTML = `
      <header class="bg-dark text-white py-3">
          <div class="container-fluid">
              <div class="row align-items-center">
                  <div class="col-md-6">
                      <h5 class="mb-0">🚀 ${this.getProjectName()} Web UI</h5>
                  </div>
                  <div class="col-md-6 text-end">
                      <small>Generated by RevolutionaryCodegen</small>
                  </div>
              </div>
          </div>
      </header>
    `;
    
    await this.writeFile(`docs/${this.getWebUIOutputDirectory()}/components/header.html`, headerHTML);
  }

  /**
   * Generate footer component
   * @returns {Promise<void>}
   */
  async generateFooter() {
    const footerHTML = `
      <footer class="bg-dark text-white text-center py-3">
          <div class="container-fluid">
              <p>&copy; 2023 ${this.getProjectName()}. Generated with ❤️ by RevolutionaryCodegen</p>
              <p>
                  <a href="#" class="text-white">Documentation</a> |
                  <a href="#" class="text-white">API Reference</a> |
                  <a href="#" class="text-white">Support</a>
              </p>
          </div>
      </footer>
    `;
    
    await this.writeFile(`docs/${this.getWebUIOutputDirectory()}/components/footer.html`, footerHTML);
  }

  /**
   * Generate sidebar component
   * @returns {Promise<void>}
   */
  async generateSidebar() {
    const sidebarHTML = `
      <div class="sidebar bg-light">
          <div class="sidebar-header">
              <h5>🎯 Quick Links</h5>
          </div>
          <div class="sidebar-content">
              <div class="list-group">
                  <a href="index.html" class="list-group-item list-group-item-action">
                      📊 Dashboard
                  </a>
                  <a href="api-explorer.html" class="list-group-item list-group-item-action">
                      🔌 API Explorer
                  </a>
                  <a href="dependency-graph.html" class="list-group-item list-group-item-action">
                      📊 Dependencies
                  </a>
                  <a href="class-browser.html" class="list-group-item list-group-item-action">
                      📦 Classes
                  </a>
                  <a href="searchable-docs.html" class="list-group-item list-group-item-action">
                      🔍 Documentation
                  </a>
              </div>
          </div>
      </div>
    `;
    
    await this.writeFile(`docs/${this.getWebUIOutputDirectory()}/components/sidebar.html`, sidebarHTML);
  }

  /**
   * Generate settings page
   * @returns {Promise<void>}
   */
  async generateSettingsPage() {
    const settingsHTML = `
      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Settings - ${this.getProjectName()}</title>
    ${this.getFrameworkCSS(this.getUIFrameworkConfig())}
    <link rel="stylesheet" href="css/main.css">
</head>
<body>
    ${this.getHeaderTemplate(this.getUIFrameworkConfig())}
    
    <main class="container-fluid">
        <div class="row">
            <div class="col-md-9 col-lg-10">
                <h2>⚙️ Settings</h2>
                
                <div class="settings-section">
                    <h3>🎨 UI Preferences</h3>
                    <div class="form-group">
                        <label for="theme">Theme:</label>
                        <select class="form-control" id="theme">
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="auto">Auto</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="layout">Layout:</label>
                        <select class="form-control" id="layout">
                            <option value="default">Default</option>
                            <option value="compact">Compact</option>
                            <option value="wide">Wide</option>
                        </select>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>📊 Graph Settings</h3>
                    <div class="form-group">
                        <label for="graph-animation">Graph Animation:</label>
                        <select class="form-control" id="graph-animation">
                            <option value="enabled">Enabled</option>
                            <option value="disabled">Disabled</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="graph-layout">Default Layout:</label>
                        <select class="form-control" id="graph-layout">
                            <option value="force">Force</option>
                            <option value="circular">Circular</option>
                            <option value="hierarchical">Hierarchical</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    </main>
    
    ${this.getFooterTemplate(this.getUIFrameworkConfig())}
    <script>
        // Settings management
        function saveSettings() {
            const settings = {
                theme: document.getElementById('theme').value,
                layout: document.getElementById('layout').value,
                graphAnimation: document.getElementById('graph-animation').value,
                graphLayout: document.getElementById('graph-layout').value
            };
            localStorage.setItem('webui-settings', JSON.stringify(settings));
        }
        
        function loadSettings() {
            const saved = localStorage.getItem('webui-settings');
            if (saved) {
                const settings = JSON.parse(saved);
                document.getElementById('theme').value = settings.theme;
                document.getElementById('layout').value = settings.layout;
                document.getElementById('graph-animation').value = settings.graphAnimation;
                document.getElementById('graph-layout').value = settings.graphLayout;
            }
        }
        
        // Load settings on page load
        document.addEventListener('DOMContentLoaded', loadSettings);
    </script>
    ${this.getFrameworkJavaScript(this.getUIFrameworkConfig())}
</body>
</html>
    `;
    
    await this.writeFile(`docs/${this.getWebUIOutputDirectory()}/settings.html`, settingsHTML);
  }

  /**
   * Generate about page
   * @returns {Promise<void>}
   */
  async generateAboutPage() {
    const aboutHTML = `
      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About - ${this.getProjectName()}</title>
    ${this.getFrameworkCSS(this.getUIFrameworkConfig())}
    <link rel="stylesheet" href="css/main.css">
</head>
<body>
    ${this.getHeaderTemplate(this.getUIFrameworkConfig())}
    
    <main class="container-fluid">
        <div class="row">
            <div class="col-md-9 col-lg-10">
                <h2>ℹ️ About</h2>
                
                <div class="about-content">
                    <h3>🚀 RevolutionaryCodegen Web UI</h3>
                    <p>This web interface provides comprehensive documentation and exploration tools for your revolutionary project.</p>
                    
                    <h4>🌟 Features</h4>
                    <ul>
                        <li><strong>Interactive API Explorer</strong> - Browse and test API endpoints</li>
                        <li><strong>Dependency Graph Visualization</strong> - Understand project dependencies</li>
                        <li><strong>Class Browser</strong> - Explore project classes and relationships</li>
                        <li><strong>Searchable Documentation</strong> - Find information quickly</li>
                    </ul>
                    
                    <h4>🎯 Technologies</h4>
                    <ul>
                        <li><strong>Frontend:</strong> HTML5, CSS3, JavaScript (ES6+)</li>
                        <li><strong>UI Framework:</strong> ${this.uiFramework}</li>
                        <li><strong>Visualization:</strong> D3.js for dependency graphs</li>
                        <li><strong>Icons:</strong> Bootstrap Icons</li>
                    </ul>
                    
                    <h4>📖 Version Information</h4>
                    <ul>
                        <li><strong>Web UI Version:</strong> 1.0.0</li>
                        <li><strong>Generated:</strong> ${new Date().toISOString()}</li>
                        <li><strong>RevolutionaryCodegen:</strong> 1.0.0</li>
                    </ul>
                </div>
            </div>
        </div>
    </main>
    
    ${this.getFooterTemplate(this.getUIFrameworkConfig())}
    ${this.getFrameworkJavaScript(this.getUIFrameworkConfig())}
</body>
</html>
    `;
    
    await this.writeFile(`docs/${this.getWebUIOutputDirectory()}/about.html`, aboutHTML);
  }

  /**
   * Generate help page
   * @returns {Promise<void>}
   */
  async generateHelpPage() {
    const helpHTML = `
      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Help - ${this.getProjectName()}</title>
    ${this.getFrameworkCSS(this.getUIFrameworkConfig())}
    <link rel="stylesheet" href="css/main.css">
</head>
<body>
    ${this.getHeaderTemplate(this.getUIFrameworkConfig())}
    
    <main class="container-fluid">
        <div class="row">
            <div class="col-md-9 col-lg-10">
                <h2>❓ Help</h2>
                
                <div class="help-content">
                    <h3>🚀 Getting Started</h3>
                    <div class="help-section">
                        <h4>1. 📊 Dashboard</h4>
                        <p>The dashboard provides an overview of your project including class counts, dependencies, and quick access to all features.</p>
                        <p><strong>Key Features:</strong></p>
                        <ul>
                            <li>Project statistics dashboard</li>
                            <li>Quick navigation to all tools</li>
                            <li>Real-time project metrics</li>
                        </ul>
                    </div>
                    
                    <div class="help-section">
                        <h4>2. 🔌 API Explorer</h4>
                        <p>Browse and test your API endpoints with the interactive explorer.</p>
                        <p><strong>Features:</strong></p>
                        <ul>
                            <li>Search and filter endpoints</li>
                            <li>View detailed endpoint information</li>
                            <li>Export API documentation</li>
                        </ul>
                    </div>
                    
                    <div class="help-section">
                        <h4>3. 📊 Dependency Graph</h4>
                        <p>Visualize your project dependencies with interactive graphs.</p>
                        <p><strong>Features:</strong></p>
                        <ul>
                            <li>Interactive force-directed layout</li>
                            <li>Circular dependency detection</li>
                            <li>Export graph data</li>
                            <li>Multiple layout options</li>
                        </ul>
                    </div>
                    
                    <div class="help-section">
                        <h4>4. 📦 Class Browser</h4>
                        <p>Explore all project classes and their relationships.</p>
                        <p><strong>Features:</strong></p>
                        <ul>
                            <li>Search and filter classes</li>
                            <li>Sort by name, type, or dependencies</li>
                            <li>View class details and documentation</li>
                        </ul>
                    </div>
                    
                    <div class="help-section">
                        <h4>5. 🔍 Searchable Documentation</h4>
                        <p>Search through all project documentation quickly.</p>
                        <p><strong>Features:</strong></p>
                        <ul>
                            <li>Full-text search across all documentation</li>
                            <li>Keyword highlighting</li>
                            <li>Search result ranking</li>
                        </ul>
                    </div>
                    
                    <h3>⚙️ Configuration</h3>
                    <div class="help-section">
                        <h4>UI Settings</h4>
                        <p>Customize the web interface appearance and behavior.</p>
                        <ul>
                            <li><strong>Theme:</strong> Light, Dark, or Auto</li>
                            <li><strong>Layout:</strong> Default, Compact, or Wide</li>
                            <li><strong>Graph Animation:</strong> Enable or disable animations</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </main>
    
    ${this.getFooterTemplate(this.getUIFrameworkConfig())}
    ${this.getFrameworkJavaScript(this.getUIFrameworkConfig())}
</body>
</html>
    `;
    
    await this.writeFile(`docs/${this.getWebUIOutputDirectory()}/help.html`, helpHTML);
  }

  /**
   * Generate error page
   * @returns {Promise<void>}
   */
  async generateErrorPage() {
    const errorHTML = `
      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error - ${this.getProjectName()}</title>
    ${this.getFrameworkCSS(this.getUIFrameworkConfig())}
    <link rel="stylesheet" href="css/main.css">
</head>
<body>
    <div class="error-container">
        <div class="error-card">
            <div class="error-header">
                <h1>😵 Oops! Something went wrong</h1>
            </div>
            <div class="error-body">
                <p>An error occurred while loading the requested page.</p>
                <p><strong>Error Code:</strong> 404</p>
                <p><strong>Message:</strong> Page not found</p>
            </div>
            <div class="error-actions">
                <button class="btn btn-primary" onclick="window.history.back()">🔙 Go Back</button>
                <a href="index.html" class="btn btn-secondary">🏠 Home</a>
            </div>
        </div>
    </div>
    
    <script>
        // Auto-redirect after 5 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 5000);
    </script>
    ${this.getFrameworkJavaScript(this.getUIFrameworkConfig())}
</body>
</html>
    `;
    
    await this.writeFile(`docs/${this.getWebUIOutputDirectory()}/error.html`, errorHTML);
  }

  /**
   * Get API endpoints list HTML
   * @param {Object} framework - UI framework configuration
   * @returns {string} API endpoints HTML
   */
  getAPIEndpointsList(framework) {
    const endpoints = this.getAPIEndpoints();
    
    return endpoints.map(endpoint => `
                <div class="endpoint-card">
                    <div class="card-header">
                        <h5>\${endpoint.method} \${endpoint.path}</h5>
                    </div>
                    <div class="card-body">
                        <p>\${endpoint.description}</p>
                        <div class="endpoint-actions">
                            <button class="btn ${framework.cssClasses.includes('primary') ? framework.cssClasses : ''} btn-sm" onclick="apiExplorer.testEndpoint('\${endpoint.name}')">
                                🧪 Test
                            </button>
                            <button class="btn ${framework.cssClasses.includes('info') ? framework.cssClasses : ''} btn-sm" onclick="apiExplorer.showEndpointDetails('\${endpoint.name}')">
                                📋 Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
    `).join('');
  }

  /**
   * Get API endpoints data
   * @returns {Array} API endpoints array
   */
  getAPIEndpoints() {
    return [
      {
        name: 'UserService',
        method: 'POST',
        path: '/api/users/create',
        description: 'Create a new user account',
        parameters: ['userData']
      },
      {
        name: 'UserService',
        method: 'GET',
        path: '/api/users',
        description: 'Retrieve all users',
        parameters: []
      },
      {
        name: 'DataService',
        method: 'POST',
        path: '/api/data/save',
        description: 'Save data to persistent storage',
        parameters: ['data']
      },
      {
        name: 'DataService',
        method: 'GET',
        path: '/api/data',
        description: 'Retrieve all stored data',
        parameters: []
      }
    ];
  }

  /**
   * Get classes grid HTML
   * @param {Object} framework - UI framework configuration
   * @returns {string} Classes grid HTML
   */
  getClassesGrid(framework) {
    const classes = this.getClasses();
    
    return classes.map(cls => `
                <div class="class-card" onclick="classBrowser.showDetails('\${cls.name}')">
                    <div class="card-header">
                        <h5>\${cls.name}</h5>
                        <span class="badge ${framework.cssClasses.includes('primary') ? framework.cssClasses : ''}">\${cls.type}</span>
                    </div>
                    <div class="card-body">
                        <p>\${cls.description}</p>
                        <div class="class-actions">
                            <button class="btn ${framework.cssClasses.includes('info') ? framework.cssClasses : ''} btn-sm" onclick="classBrowser.showDocumentation('\${cls.name}')">
                                📚 Documentation
                            </button>
                            <button class="btn ${framework.cssClasses.includes('warning') ? framework.cssClasses : ''} btn-sm" onclick="classBrowser.showDependencies('\${cls.name}')">
                                🔗 Dependencies
                            </button>
                        </div>
                    </div>
                </div>
            </div>
    `).join('');
  }

  /**
   * Get classes data
   * @returns {Array} Classes array
   */
  getClasses() {
    const classes = [];
    
    // Add business logic classes
    if (this.specification?.classes?.businessLogic) {
      this.specification.classes.businessLogic.forEach(cls => {
        classes.push({
          ...cls,
          type: 'business'
        });
      });
    }
    
    // Add data classes
    if (this.specification?.classes?.dataClasses) {
      this.specification.classes.dataClasses.forEach(cls => {
        classes.push({
          ...cls,
          type: 'data'
        });
      });
    }
    
    // Add factory classes
    if (this.specification?.classes?.factories) {
      this.specification.classes.factories.forEach(cls => {
        classes.push({
          ...cls,
          type: 'factory'
        });
      });
    }
    
    return classes;
  }

  /**
   * Get graph statistics HTML
   * @param {Object} framework - UI framework configuration
   * @returns {string} Graph statistics HTML
   */
  getGraphStatistics(framework) {
    const stats = this.getGraphStats();
    
    return `
                <div class="row">
                    <div class="col-md-3">
                        <div class="stat-card ${framework.cssClasses.includes('info') ? framework.cssClasses : ''}">
                            <h5>Total Nodes</h5>
                            <p class="display-4">${stats.totalNodes}</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card ${framework.cssClasses.includes('primary') ? framework.cssClasses : ''}">
                            <h5>Total Edges</h5>
                            <p class="display-4">${stats.totalEdges}</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card ${framework.cssClasses.includes('success') ? framework.cssClasses : ''}">
                            <h5>Max Depth</h5>
                            <p class="display-4">${stats.maxDepth}</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card ${framework.cssClasses.includes('warning') ? framework.cssClasses : ''}">
                            <h5>Circular Dependencies</h5>
                            <p class="display-4">\${stats.circularDependencies}</p>
                        </div>
                    </div>
                </div>
    `;
  }

  /**
   * Get graph statistics data
   * @returns {Object} Graph statistics
   */
  getGraphStats() {
    return {
      totalNodes: this.getClassCount() + 5, // Approximate with core classes
      totalEdges: this.getDependencyCount() * 2,
      maxDepth: 3,
      circularDependencies: 0 // Would be calculated from dependency graph
    };
  }
}

module.exports = WebUIGenerator;
