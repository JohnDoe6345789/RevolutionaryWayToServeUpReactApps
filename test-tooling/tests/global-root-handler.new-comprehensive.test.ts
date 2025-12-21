import GlobalRootHandler from '../../bootstrap/constants/global-root-handler.js';

describe('GlobalRootHandler', () => {
  let originalGlobalThis;
  let originalGlobal;
  let originalWindow;
  let originalDocument;

  beforeEach(() => {
    // Store original values
    originalGlobalThis = global.globalThis;
    originalGlobal = global.global;
    originalWindow = global.window;
    originalDocument = global.document;
    
    // Clean up any existing bootstrap namespace
    delete global.__rwtraBootstrap;
  });

  afterEach(() => {
    // Restore original values
    global.globalThis = originalGlobalThis;
    global.global = originalGlobal;
    global.window = originalWindow;
    global.document = originalDocument;
    
    // Clean up bootstrap namespace
    delete global.__rwtraBootstrap;
  });

  describe('constructor', () => {
    it('should initialize with provided root', () => {
      const mockRoot = { document: {} };
      const handler = new GlobalRootHandler(mockRoot);

      expect(handler._root).toBe(mockRoot);
      expect(handler._namespace).toBeNull();
    });

    it('should initialize with undefined root if none provided', () => {
      const handler = new GlobalRootHandler();

      expect(handler._root).toBeUndefined();
      expect(handler._namespace).toBeNull();
    });

    it('should initialize namespace to null', () => {
      const handler = new GlobalRootHandler();

      expect(handler._namespace).toBeNull();
    });
  });

  describe('_ensureRoot method', () => {
    it('should return provided root if available', () => {
      const mockRoot = { document: {} };
      const handler = new GlobalRootHandler(mockRoot);

      const result = handler._ensureRoot();

      expect(result).toBe(mockRoot);
    });

    it('should detect the appropriate global as root when no root provided', () => {
      const handler = new GlobalRootHandler();

      const result = handler._ensureRoot();

      // In the test environment, this will likely be the window object
      expect(result).toBeDefined();
    });

    it('should return this as root when no root provided and global objects are deleted', () => {
      // Save original values
      const originalGlobalThis = global.globalThis;
      const originalWindow = global.window;
      const originalDocument = global.document;

      // Remove global objects temporarily
      delete global.globalThis;
      delete global.window;
      delete global.document;

      const handler = new GlobalRootHandler();
      const result = handler._ensureRoot();

      expect(result).toBe(handler);

      // Restore original values
      global.globalThis = originalGlobalThis;
      global.window = originalWindow;
      global.document = originalDocument;
    });

    it('should cache the detected root', () => {
      const handler = new GlobalRootHandler();

      // First call should detect and cache
      const result1 = handler._ensureRoot();
      // Second call should return cached value
      const result2 = handler._ensureRoot();

      expect(result1).toBe(result2);
    });
  });

  describe('_detectGlobal method', () => {
    it('should return globalThis when available', () => {
      // Save original values
      const originalGlobalThis = global.globalThis;
      const originalWindow = global.window;

      // Remove window temporarily to make sure globalThis is used
      delete global.window;
      global.globalThis = { test: 'globalThis' };

      const handler = new GlobalRootHandler();
      const result = handler._detectGlobal();

      expect(result).toBe(global.globalThis);

      // Restore original values
      global.globalThis = originalGlobalThis;
      global.window = originalWindow;
    });

    it('should return global when globalThis and window not available', () => {
      // Save original values
      const originalGlobalThis = global.globalThis;
      const originalWindow = global.window;
      const originalGlobal = global.global;

      // Remove globalThis and window
      delete global.globalThis;
      delete global.window;
      global.global = { test: 'global' };

      const handler = new GlobalRootHandler();
      const result = handler._detectGlobal();

      expect(result).toBe(global.global);

      // Restore original values
      global.globalThis = originalGlobalThis;
      global.window = originalWindow;
      global.global = originalGlobal;
    });

    it('should return this when no global objects available', () => {
      // Save original values
      const originalGlobalThis = global.globalThis;
      const originalWindow = global.window;
      const originalGlobal = global.global;
      const originalDocument = global.document;

      // Remove all global objects
      delete global.globalThis;
      delete global.window;
      delete global.global;
      delete global.document;

      const handler = new GlobalRootHandler();
      const result = handler._detectGlobal();

      expect(result).toBe(handler);

      // Restore original values
      global.globalThis = originalGlobalThis;
      global.window = originalWindow;
      global.global = originalGlobal;
      global.document = originalDocument;
    });
  });

  describe('root getter', () => {
    it('should return the detected root', () => {
      const mockRoot = { document: {} };
      const handler = new GlobalRootHandler(mockRoot);

      const result = handler.root;

      expect(result).toBe(mockRoot);
    });

    it('should return the provided root', () => {
      const mockRoot = { document: {} };
      const handler = new GlobalRootHandler(mockRoot);

      expect(handler.root).toBe(mockRoot);
    });

    it('should return the detected global root when none provided', () => {
      global.globalThis = { document: {} };
      const handler = new GlobalRootHandler();

      expect(handler.root).toBe(global.globalThis);
    });
  });

  describe('getNamespace method', () => {
    it('should create a new namespace if one does not exist', () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);

      const namespace = handler.getNamespace();

      expect(namespace).toEqual({});
      expect(mockRoot.__rwtraBootstrap).toBe(namespace);
    });

    it('should reuse existing namespace if available', () => {
      const existingNamespace = { existing: 'value' };
      const mockRoot = { __rwtraBootstrap: existingNamespace };
      const handler = new GlobalRootHandler(mockRoot);

      const namespace = handler.getNamespace();

      expect(namespace).toBe(existingNamespace);
    });

    it('should cache the namespace after first access', () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);

      const namespace1 = handler.getNamespace();
      const namespace2 = handler.getNamespace();

      expect(namespace1).toBe(namespace2);
    });

    it('should create namespace on the root object', () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);

      handler.getNamespace();

      expect(mockRoot.__rwtraBootstrap).toBeDefined();
      expect(typeof mockRoot.__rwtraBootstrap).toBe('object');
    });
  });

  describe('helpers getter', () => {
    it('should create helpers namespace if it does not exist', () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);

      const helpers = handler.helpers;

      expect(helpers).toEqual({});
      expect(handler.getNamespace().helpers).toBe(helpers);
    });

    it('should reuse existing helpers namespace if available', () => {
      const existingHelpers = { existing: 'helper' };
      const mockRoot = { __rwtraBootstrap: { helpers: existingHelpers } };
      const handler = new GlobalRootHandler(mockRoot);

      const helpers = handler.helpers;

      expect(helpers).toBe(existingHelpers);
    });

    it('should return the same helpers instance on subsequent calls', () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);

      const helpers1 = handler.helpers;
      const helpers2 = handler.helpers;

      expect(helpers1).toBe(helpers2);
    });

    it('should return helpers from the namespace', () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);
      const namespace = handler.getNamespace();

      const helpers = handler.helpers;

      expect(namespace.helpers).toBe(helpers);
    });
  });

  describe('getDocument method', () => {
    it('should return document from root', () => {
      const mockRoot = { document: { title: 'Test' } };
      const handler = new GlobalRootHandler(mockRoot);

      const document = handler.getDocument();

      expect(document).toBe(mockRoot.document);
    });

    it('should return undefined if no document available', () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);

      const document = handler.getDocument();

      expect(document).toBeUndefined();
    });

    it('should return document from global root when no root provided', () => {
      global.document = { title: 'Global Document' };
      const handler = new GlobalRootHandler();

      const document = handler.getDocument();

      expect(document).toBe(global.document);
    });
  });

  describe('getFetch method', () => {
    it('should return a bound fetch function if available', () => {
      const mockFetch = jest.fn();
      const mockRoot = { fetch: mockFetch };
      const handler = new GlobalRootHandler(mockRoot);

      const fetch = handler.getFetch();

      expect(fetch).toBeInstanceOf(Function);
      expect(fetch).not.toBe(mockFetch); // Should be bound version
    });

    it('should return undefined if fetch is not a function', () => {
      const mockRoot = { fetch: 'not a function' };
      const handler = new GlobalRootHandler(mockRoot);

      const fetch = handler.getFetch();

      expect(fetch).toBeUndefined();
    });

    it('should properly bind fetch to the root', () => {
      const mockFetch = jest.fn();
      const mockRoot = { fetch: mockFetch };
      const handler = new GlobalRootHandler(mockRoot);

      const boundFetch = handler.getFetch();
      boundFetch('test');

      expect(mockFetch).toHaveBeenCalledWith('test');
      expect(mockFetch.mock.instances[0]).toBe(mockRoot);
    });

    it('should return undefined if no fetch available', () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);

      const fetch = handler.getFetch();

      expect(fetch).toBeUndefined();
    });
  });

  describe('getLogger method', () => {
    it('should return a logging function with the provided tag', () => {
      const handler = new GlobalRootHandler({});

      const logger = handler.getLogger('customTag');

      expect(typeof logger).toBe('function');
    });

    it('should use default tag when none provided', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const handler = new GlobalRootHandler({});

      const logger = handler.getLogger();
      logger('test message');

      expect(consoleSpy).toHaveBeenCalledWith('rwtra', 'test message', '');
      consoleSpy.mockRestore();
    });

    it('should write to console.error with the tag', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const handler = new GlobalRootHandler({});

      const logger = handler.getLogger('testTag');
      logger('test message');

      expect(consoleSpy).toHaveBeenCalledWith('testTag', 'test message', '');
      consoleSpy.mockRestore();
    });

    it('should include data in the log when provided', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const handler = new GlobalRootHandler({});

      const logger = handler.getLogger('testTag');
      logger('test message', { key: 'value' });

      expect(consoleSpy).toHaveBeenCalledWith('testTag', 'test message', { key: 'value' });
      consoleSpy.mockRestore();
    });

    it('should handle missing console gracefully', () => {
      const originalConsole = global.console;
      global.console = undefined;
      
      const handler = new GlobalRootHandler({});
      const logger = handler.getLogger('testTag');
      
      // Should not throw when console is undefined
      expect(() => {
        logger('test message');
      }).not.toThrow();
      
      global.console = originalConsole;
    });
  });

  describe('hasWindow method', () => {
    it('should return true if global window is available', () => {
      const mockRoot = { window: {} };
      const handler = new GlobalRootHandler(mockRoot);

      const hasWindow = handler.hasWindow();

      expect(hasWindow).toBe(true);
    });

    it('should return false if global window is not available', () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);

      const hasWindow = handler.hasWindow();

      expect(hasWindow).toBe(false);
    });

    it('should return true when checking global object that has window', () => {
      global.window = { document: {} };
      const handler = new GlobalRootHandler();

      const hasWindow = handler.hasWindow();

      expect(hasWindow).toBe(true);
    });
  });

  describe('hasDocument method', () => {
    it('should return true if global document is available', () => {
      const mockRoot = { document: {} };
      const handler = new GlobalRootHandler(mockRoot);

      const hasDocument = handler.hasDocument();

      expect(hasDocument).toBe(true);
    });

    it('should return false if global document is not available', () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);

      const hasDocument = handler.hasDocument();

      expect(hasDocument).toBe(false);
    });

    it('should return true when checking global object that has document', () => {
      global.document = {};
      const handler = new GlobalRootHandler();

      const hasDocument = handler.hasDocument();

      expect(hasDocument).toBe(true);
    });
  });

  describe('integration', () => {
    it('should properly set up namespace with helpers', () => {
      const mockRoot = {};
      const handler = new GlobalRootHandler(mockRoot);

      const namespace = handler.getNamespace();
      const helpers = handler.helpers;

      expect(namespace).toBeDefined();
      expect(helpers).toBeDefined();
      expect(namespace.helpers).toBe(helpers);
      expect(mockRoot.__rwtraBootstrap).toBe(namespace);
    });

    it('should work with different root objects', () => {
      const root1 = { document: {} };
      const root2 = { window: {} };

      const handler1 = new GlobalRootHandler(root1);
      const handler2 = new GlobalRootHandler(root2);

      expect(handler1.root).toBe(root1);
      expect(handler2.root).toBe(root2);

      expect(handler1.hasDocument()).toBe(true);
      expect(handler2.hasWindow()).toBe(true);
    });

    it('should handle namespace and helpers properly together', () => {
      const mockRoot = { __rwtraBootstrap: { helpers: { existingHelper: 'value' } } };
      const handler = new GlobalRootHandler(mockRoot);

      const namespace = handler.getNamespace();
      const helpers = handler.helpers;

      expect(namespace).toBe(mockRoot.__rwtraBootstrap);
      expect(helpers).toBe(namespace.helpers);
      expect(helpers.existingHelper).toBe('value');
    });
  });
});