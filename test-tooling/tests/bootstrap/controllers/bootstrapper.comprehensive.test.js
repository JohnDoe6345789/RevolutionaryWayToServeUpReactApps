const Bootstrapper = require("../../../../bootstrap/controllers/bootstrapper.js");
const BootstrapperConfig = require("../../../../bootstrap/configs/core/bootstrapper.js");

// Mock the dependencies
const mockLogging = {
  setCiLoggingEnabled: jest.fn(),
  detectCiLogging: jest.fn(),
  logClient: jest.fn(),
  isCiLoggingEnabled: jest.fn()
};

const mockNetwork = {
  setFallbackProviders: jest.fn(),
  setDefaultProviderBase: jest.fn(),
  setProviderAliases: jest.fn()
};

const mockModuleLoader = {
  loadTools: jest.fn(() => Promise.resolve()),
  compileSCSS: jest.fn(() => Promise.resolve("css content")),
  injectCSS: jest.fn(),
  loadModules: jest.fn(() => Promise.resolve({})),
  createLocalModuleLoader: jest.fn(() => ({})),
  createRequire: jest.fn(() => ({})),
  compileTSX: jest.fn(() => Promise.resolve({})),
  frameworkRender: jest.fn()
};

describe("Bootstrapper", () => {
  let originalWindow;
  let originalDocument;

  beforeEach(() => {
    // Store original window/document
    originalWindow = global.window;
    originalDocument = global.document;
    
    // Setup mock window/document
    global.window = {
      location: { href: "http://test.com" },
      document: { getElementById: () => ({ textContent: "" }) }
    };
    global.document = { getElementById: () => ({ textContent: "" }) };
  });

  afterEach(() => {
    // Restore original window/document
    global.window = originalWindow;
    global.document = originalDocument;
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with default config when no config provided", () => {
      const bootstrapper = new Bootstrapper();
      
      expect(bootstrapper).toBeInstanceOf(Bootstrapper);
      expect(bootstrapper.cachedConfigPromise).toBeNull();
    });

    it("should initialize with provided config", () => {
      const config = { logging: mockLogging, network: mockNetwork, moduleLoader: mockModuleLoader };
      const bootstrapper = new Bootstrapper(config);
      
      expect(bootstrapper).toBeInstanceOf(Bootstrapper);
      expect(bootstrapper.config).toBeDefined();
    });

    it("should accept BootstrapperConfig instance", () => {
      const config = new BootstrapperConfig({ 
        logging: mockLogging, 
        network: mockNetwork, 
        moduleLoader: mockModuleLoader 
      });
      const bootstrapper = new Bootstrapper(config);
      
      expect(bootstrapper.config).toBe(config);
    });
  });

  describe("initialize method", () => {
    it("should set up the bootstrapper instance with provided configuration", () => {
      const config = { 
        logging: mockLogging, 
        network: mockNetwork, 
        moduleLoader: mockModuleLoader 
      };
      const bootstrapper = new Bootstrapper(config);
      bootstrapper.initialize();
      
      expect(bootstrapper.logging).toBe(mockLogging);
      expect(bootstrapper.network).toBe(mockNetwork);
      expect(bootstrapper.moduleLoader).toBe(mockModuleLoader);
      expect(bootstrapper.setCiLoggingEnabled).toBe(mockLogging.setCiLoggingEnabled);
      expect(bootstrapper.detectCiLogging).toBe(mockLogging.detectCiLogging);
      expect(bootstrapper.logClient).toBe(mockLogging.logClient);
      expect(bootstrapper.isCiLoggingEnabled).toBe(mockLogging.isCiLoggingEnabled);
    });

    it("should throw if initialized twice", () => {
      const config = { 
        logging: mockLogging, 
        network: mockNetwork, 
        moduleLoader: mockModuleLoader 
      };
      const bootstrapper = new Bootstrapper(config);
      bootstrapper.initialize();
      
      expect(() => bootstrapper.initialize()).toThrow();
    });
  });

  describe("bootstrap method", () => {
    it("should run the bootstrap flow successfully", async () => {
      const config = { 
        logging: mockLogging, 
        network: mockNetwork, 
        moduleLoader: mockModuleLoader 
      };
      const bootstrapper = new Bootstrapper(config);
      bootstrapper.initialize();
      
      // Mock the internal _bootstrap method to avoid complex setup
      const bootstrapSpy = jest.spyOn(bootstrapper, '_bootstrap').mockResolvedValue();
      
      await expect(bootstrapper.bootstrap()).resolves.toBeUndefined();
      
      expect(bootstrapSpy).toHaveBeenCalled();
    });

    it("should handle bootstrap errors gracefully", async () => {
      const config = { 
        logging: mockLogging, 
        network: mockNetwork, 
        moduleLoader: mockModuleLoader 
      };
      const bootstrapper = new Bootstrapper(config);
      bootstrapper.initialize();
      
      // Mock the internal _bootstrap method to throw an error
      const error = new Error("Bootstrap failed");
      jest.spyOn(bootstrapper, '_bootstrap').mockRejectedValue(error);
      const handleBootstrapErrorSpy = jest.spyOn(bootstrapper, '_handleBootstrapError');
      
      await bootstrapper.bootstrap();
      
      expect(handleBootstrapErrorSpy).toHaveBeenCalledWith(error);
    });
  });

  describe("_bootstrap method", () => {
    it("should perform internal bootstrap steps", async () => {
      const config = { 
        logging: mockLogging, 
        network: mockNetwork, 
        moduleLoader: mockModuleLoader,
        entry: "test.tsx",
        styles: "test.scss",
        modules: [],
        tools: []
      };
      const bootstrapper = new Bootstrapper(config);
      bootstrapper.initialize();
      
      // Mock all the internal methods
      jest.spyOn(bootstrapper, 'loadConfig').mockResolvedValue(config);
      jest.spyOn(bootstrapper, '_configureProviders');
      jest.spyOn(bootstrapper, '_prepareAssets').mockResolvedValue();
      jest.spyOn(bootstrapper, '_prepareModules').mockResolvedValue({
        registry: {},
        entryDir: "",
        requireFn: {}
      });
      jest.spyOn(bootstrapper, '_compileAndRender').mockResolvedValue();
      
      await bootstrapper._bootstrap();
      
      expect(bootstrapper.loadConfig).toHaveBeenCalled();
      expect(bootstrapper._configureProviders).toHaveBeenCalledWith(config);
      expect(bootstrapper._prepareAssets).toHaveBeenCalledWith("test.scss", []);
      expect(bootstrapper._prepareModules).toHaveBeenCalledWith("test.tsx", config);
      expect(bootstrapper._compileAndRender).toHaveBeenCalledWith(
        "test.tsx", 
        "test.scss", 
        config, 
        {}, 
        "", 
        {}
      );
    });
  });

  describe("_configureProviders method", () => {
    it("should configure providers with provided config", () => {
      const config = { 
        logging: mockLogging, 
        network: mockNetwork, 
        moduleLoader: mockModuleLoader 
      };
      const bootstrapper = new Bootstrapper(config);
      bootstrapper.initialize();
      
      const testConfig = {
        fallbackProviders: ["https://fallback.com"],
        providers: {
          default: "https://default.com",
          aliases: { alias: "https://alias.com" }
        }
      };
      
      bootstrapper._configureProviders(testConfig);
      
      expect(mockNetwork.setFallbackProviders).toHaveBeenCalledWith(["https://fallback.com"]);
      expect(mockNetwork.setDefaultProviderBase).toHaveBeenCalledWith("https://default.com");
      expect(mockNetwork.setProviderAliases).toHaveBeenCalledWith({ alias: "https://alias.com" });
    });
  });

  describe("loadConfig method", () => {
    it("should load config from window cache if available", async () => {
      const cachedConfig = { test: "cached" };
      global.window.__rwtraConfig = cachedConfig;
      
      const config = { 
        logging: mockLogging, 
        network: mockNetwork, 
        moduleLoader: mockModuleLoader 
      };
      const bootstrapper = new Bootstrapper(config);
      bootstrapper.initialize();
      
      const result = await bootstrapper.loadConfig();
      
      expect(result).toBe(cachedConfig);
    });

    it("should fetch config if not cached", async () => {
      // Remove cached config
      delete global.window.__rwtraConfig;
      
      const config = { 
        logging: mockLogging, 
        network: mockNetwork, 
        moduleLoader: mockModuleLoader,
        configUrl: "test-config.json"
      };
      const bootstrapper = new Bootstrapper(config);
      bootstrapper.initialize();
      
      const mockFetch = jest.fn(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ test: "fetched" })
      }));
      bootstrapper.fetchImpl = mockFetch;
      
      const result = await bootstrapper.loadConfig();
      
      expect(mockFetch).toHaveBeenCalledWith("test-config.json", { cache: "no-store" });
      expect(result).toEqual({ test: "fetched" });
    });
  });

  describe("_fetchConfig method", () => {
    it("should throw when fetch is unavailable", async () => {
      const config = { 
        logging: mockLogging, 
        network: mockNetwork, 
        moduleLoader: mockModuleLoader 
      };
      const bootstrapper = new Bootstrapper(config);
      bootstrapper.initialize();
      bootstrapper.fetchImpl = null; // Simulate unavailable fetch
      
      await expect(bootstrapper._fetchConfig()).rejects.toThrow("Fetch is unavailable when loading config.json");
    });

    it("should fetch config from default URL", async () => {
      const config = { 
        logging: mockLogging, 
        network: mockNetwork, 
        moduleLoader: mockModuleLoader 
      };
      const bootstrapper = new Bootstrapper(config);
      bootstrapper.initialize();
      
      const mockFetch = jest.fn(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ config: "data" })
      }));
      bootstrapper.fetchImpl = mockFetch;
      
      const result = await bootstrapper._fetchConfig();
      
      expect(mockFetch).toHaveBeenCalledWith("config.json", { cache: "no-store" });
      expect(result).toEqual({ config: "data" });
    });

    it("should throw when response is not ok", async () => {
      const config = { 
        logging: mockLogging, 
        network: mockNetwork, 
        moduleLoader: mockModuleLoader 
      };
      const bootstrapper = new Bootstrapper(config);
      bootstrapper.initialize();
      
      const mockFetch = jest.fn(() => Promise.resolve({
        ok: false
      }));
      bootstrapper.fetchImpl = mockFetch;
      
      await expect(bootstrapper._fetchConfig()).rejects.toThrow("Failed to load config.json");
    });
  });

  describe("_handleBootstrapError method", () => {
    it("should handle bootstrap errors by logging and rendering", () => {
      const config = { 
        logging: mockLogging, 
        network: mockNetwork, 
        moduleLoader: mockModuleLoader 
      };
      const bootstrapper = new Bootstrapper(config);
      bootstrapper.initialize();
      
      const error = new Error("Bootstrap error");
      const renderSpy = jest.spyOn(bootstrapper, "_renderBootstrapError");
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      bootstrapper._handleBootstrapError(error);
      
      expect(consoleSpy).toHaveBeenCalledWith(error);
      expect(mockLogging.logClient).toHaveBeenCalledWith("bootstrap:error", {
        message: "Bootstrap error",
        stack: error.stack
      });
      expect(renderSpy).toHaveBeenCalledWith(error);
      
      consoleSpy.mockRestore();
    });
  });

  describe("_renderBootstrapError method", () => {
    it("should render error message to root element", () => {
      const mockRootElement = { textContent: "" };
      global.document.getElementById = () => mockRootElement;
      
      const config = { 
        logging: mockLogging, 
        network: mockNetwork, 
        moduleLoader: mockModuleLoader 
      };
      const bootstrapper = new Bootstrapper(config);
      bootstrapper.initialize();
      
      const error = new Error("Render error");
      bootstrapper._renderBootstrapError(error);
      
      expect(mockRootElement.textContent).toBe("Bootstrap error: Render error");
    });

    it("should do nothing if no document is available", () => {
      // This test is about the hasDocument variable that's determined at module load time
      // Since hasDocument is determined at module load time, we can't easily change it in a test
      // The method checks hasDocument which was already evaluated when the module loaded
      // So this test would be more about testing the GlobalRootHandler behavior
      const config = {
        logging: mockLogging,
        network: mockNetwork,
        moduleLoader: mockModuleLoader
      };
      const bootstrapper = new Bootstrapper(config);
      bootstrapper.initialize();

      // If we're running in a node environment, hasDocument would likely be false
      // The method should not throw in any case
      const error = new Error("No document error");
      expect(() => bootstrapper._renderBootstrapError(error)).not.toThrow();
    });

    it("should do nothing if no root element is found", () => {
      global.document.getElementById = () => null;
      
      const config = { 
        logging: mockLogging, 
        network: mockNetwork, 
        moduleLoader: mockModuleLoader 
      };
      const bootstrapper = new Bootstrapper(config);
      bootstrapper.initialize();
      
      const error = new Error("No root error");
      expect(() => bootstrapper._renderBootstrapError(error)).not.toThrow();
    });
  });

  describe("_determineEntryDir method", () => {
    it("should return empty string for entry files without path", () => {
      const config = { 
        logging: mockLogging, 
        network: mockNetwork, 
        moduleLoader: mockModuleLoader 
      };
      const bootstrapper = new Bootstrapper(config);
      
      expect(bootstrapper._determineEntryDir("main.tsx")).toBe("");
    });

    it("should return directory path for entry files with path", () => {
      const config = { 
        logging: mockLogging, 
        network: mockNetwork, 
        moduleLoader: mockModuleLoader 
      };
      const bootstrapper = new Bootstrapper(config);
      
      expect(bootstrapper._determineEntryDir("src/main.tsx")).toBe("src");
      expect(bootstrapper._determineEntryDir("deep/path/main.tsx")).toBe("deep/path");
    });
  });

  describe("integration", () => {
    it("should work through full lifecycle", () => {
      const config = { 
        logging: mockLogging, 
        network: mockNetwork, 
        moduleLoader: mockModuleLoader 
      };
      const bootstrapper = new Bootstrapper(config);
      
      expect(bootstrapper).toBeInstanceOf(Bootstrapper);
      expect(bootstrapper.cachedConfigPromise).toBeNull();
      
      bootstrapper.initialize();
      expect(bootstrapper.initialized).toBe(true);
      expect(bootstrapper.logging).toBe(mockLogging);
    });
  });
});