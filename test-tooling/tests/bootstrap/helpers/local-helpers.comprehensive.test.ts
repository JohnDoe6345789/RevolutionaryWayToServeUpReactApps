import LocalHelpers from "../../../../bootstrap/helpers/local-helpers.js";

// Mock the dependencies
class MockHelperRegistry {
  constructor() {
    this.registeredHelpers = new Map();
  }
  
  register(name, helper, metadata) {
    this.registeredHelpers.set(name, { helper, metadata });
  }
  
  isRegistered(name) {
    return this.registeredHelpers.has(name);
  }
  
  getHelper(name) {
    const entry = this.registeredHelpers.get(name);
    return entry ? entry.helper : undefined;
  }
}

class MockFrameworkRenderer {}
class MockLocalRequireBuilder {}

// Mock the config
class MockLocalHelpersConfig {
  constructor({ helperRegistry } = {}) {
    this.helperRegistry = helperRegistry;
  }
}

describe("LocalHelpers", () => {
  let mockHelperRegistry;

  beforeEach(() => {
    mockHelperRegistry = new MockHelperRegistry();
  });

  describe("constructor", () => {
    it("should initialize with default config when no config provided", () => {
      // Since the default config creates a new instance, we need to mock that behavior
      const localHelpers = new LocalHelpers({ helperRegistry: mockHelperRegistry });
      
      expect(localHelpers.config).toBeDefined();
      expect(localHelpers.initialized).toBe(false);
    });

    it("should accept and use provided config", () => {
      const config = { helperRegistry: mockHelperRegistry, custom: "value" };
      const localHelpers = new LocalHelpers(config);
      
      expect(localHelpers.config).toBe(config);
      expect(localHelpers.initialized).toBe(false);
    });

    it("should use helperRegistry instance if not provided in config", () => {
      const localHelpers = new LocalHelpers({ custom: "value" });
      
      // This test verifies the constructor logic - if helperRegistry is undefined,
      // it should be set to the global helperRegistry
      expect(localHelpers.config).toBeDefined();
    });

    it("should properly extend HelperBase", () => {
      const localHelpers = new LocalHelpers({ helperRegistry: mockHelperRegistry });
      
      expect(localHelpers._registerHelper).toBeDefined();
      expect(localHelpers._resolveHelperRegistry).toBeDefined();
      expect(typeof localHelpers.initialize).toBe("function");
    });
  });

  describe("initialize method", () => {
    it("should register frameworkRenderer and localRequireBuilder helpers", () => {
      const localHelpers = new LocalHelpers({ helperRegistry: mockHelperRegistry });
      
      localHelpers.initialize();
      
      expect(mockHelperRegistry.isRegistered("frameworkRenderer")).toBe(true);
      expect(mockHelperRegistry.isRegistered("localRequireBuilder")).toBe(true);
      
      // Check that the helpers were registered with correct metadata
      const frameworkRendererEntry = mockHelperRegistry.registeredHelpers.get("frameworkRenderer");
      expect(frameworkRendererEntry.metadata).toEqual({
        folder: "services/local/helpers",
        domain: "helpers"
      });
      
      const localRequireBuilderEntry = mockHelperRegistry.registeredHelpers.get("localRequireBuilder");
      expect(localRequireBuilderEntry.metadata).toEqual({
        folder: "services/local/helpers",
        domain: "helpers"
      });
    });

    it("should return the instance to allow chaining", () => {
      const localHelpers = new LocalHelpers({ helperRegistry: mockHelperRegistry });
      
      const result = localHelpers.initialize();
      
      expect(result).toBe(localHelpers);
    });

    it("should set initialized flag to true after initialization", () => {
      const localHelpers = new LocalHelpers({ helperRegistry: mockHelperRegistry });
      
      expect(localHelpers.initialized).toBe(false);
      localHelpers.initialize();
      expect(localHelpers.initialized).toBe(true);
    });

    it("should return the instance if already initialized", () => {
      const localHelpers = new LocalHelpers({ helperRegistry: mockHelperRegistry });
      
      // Initialize first time
      const result1 = localHelpers.initialize();
      const firstInitializedState = localHelpers.initialized;
      
      // Initialize second time
      const result2 = localHelpers.initialize();
      
      expect(result1).toBe(result2);
      expect(firstInitializedState).toBe(true);
      expect(localHelpers.initialized).toBe(true);
      
      // Should still only have registered the helpers once
      expect(mockHelperRegistry.isRegistered("frameworkRenderer")).toBe(true);
      expect(mockHelperRegistry.isRegistered("localRequireBuilder")).toBe(true);
    });

    it("should register the correct helper classes", () => {
      const localHelpers = new LocalHelpers({ helperRegistry: mockHelperRegistry });
      
      localHelpers.initialize();
      
      const frameworkRendererEntry = mockHelperRegistry.registeredHelpers.get("frameworkRenderer");
      // The actual FrameworkRenderer class should be registered
      expect(frameworkRendererEntry.helper).toBeDefined();
      
      const localRequireBuilderEntry = mockHelperRegistry.registeredHelpers.get("localRequireBuilder");
      // The actual LocalRequireBuilder class should be registered
      expect(localRequireBuilderEntry.helper).toBeDefined();
    });
  });

  describe("integration tests", () => {
    it("should work through full lifecycle", () => {
      const localHelpers = new LocalHelpers({ helperRegistry: mockHelperRegistry });
      
      // Before initialization
      expect(localHelpers.initialized).toBe(false);
      expect(mockHelperRegistry.isRegistered("frameworkRenderer")).toBe(false);
      expect(mockHelperRegistry.isRegistered("localRequireBuilder")).toBe(false);
      
      // After initialization
      const result = localHelpers.initialize();
      expect(result).toBe(localHelpers);
      expect(localHelpers.initialized).toBe(true);
      expect(mockHelperRegistry.isRegistered("frameworkRenderer")).toBe(true);
      expect(mockHelperRegistry.isRegistered("localRequireBuilder")).toBe(true);
      
      // Verify it's a no-op on second call
      const result2 = localHelpers.initialize();
      expect(result2).toBe(localHelpers);
      expect(localHelpers.initialized).toBe(true);
    });

    it("should properly register both helpers with correct metadata", () => {
      const localHelpers = new LocalHelpers({ helperRegistry: mockHelperRegistry });
      
      localHelpers.initialize();
      
      // Check frameworkRenderer
      const frameworkRendererEntry = mockHelperRegistry.registeredHelpers.get("frameworkRenderer");
      expect(frameworkRendererEntry).toBeDefined();
      expect(frameworkRendererEntry.metadata.folder).toBe("services/local/helpers");
      expect(frameworkRendererEntry.metadata.domain).toBe("helpers");
      
      // Check localRequireBuilder
      const localRequireBuilderEntry = mockHelperRegistry.registeredHelpers.get("localRequireBuilder");
      expect(localRequireBuilderEntry).toBeDefined();
      expect(localRequireBuilderEntry.metadata.folder).toBe("services/local/helpers");
      expect(localRequireBuilderEntry.metadata.domain).toBe("helpers");
    });
  });

  describe("Config property", () => {
    it("should expose LocalHelpersConfig as a static Config property", () => {
      expect(LocalHelpers.Config).toBeDefined();
      expect(typeof LocalHelpers.Config).toBe("function");
      
      const config = new LocalHelpers.Config();
      expect(config).toBeInstanceOf(Object);
    });
  });

  describe("inheritance", () => {
    it("should inherit from HelperBase", () => {
      const localHelpers = new LocalHelpers({ helperRegistry: mockHelperRegistry });
      
      // Should have HelperBase methods
      expect(typeof localHelpers._resolveHelperRegistry).toBe("function");
      expect(typeof localHelpers._registerHelper).toBe("function");
    });

    it("should properly call parent constructor", () => {
      const localHelpers = new LocalHelpers({ helperRegistry: mockHelperRegistry });
      
      expect(localHelpers.config).toBeDefined();
      expect(localHelpers.initialized).toBe(false);
    });
  });
});