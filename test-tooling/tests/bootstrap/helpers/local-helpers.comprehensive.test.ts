import LocalHelpers from "../../../../bootstrap/helpers/local-helpers.js";
import HelperBase from "../../../../bootstrap/helpers/base-helper.js";

// Mock dependencies for testing
class MockHelperRegistry {
  constructor() {
    this.registeredHelpers = new Map();
  }
  
  register(name, helper, metadata) {
    if (this.registeredHelpers.has(name)) {
      throw new Error(`Helper already registered: ${name}`);
    }
    this.registeredHelpers.set(name, { helper, metadata });
  }
  
  isRegistered(name) {
    return this.registeredHelpers.has(name);
  }
  
  getHelper(name) {
    const entry = this.registeredHelpers.get(name);
    return entry ? entry.helper : undefined;
  }
  
  getMetadata(name) {
    const entry = this.registeredHelpers.get(name);
    return entry ? entry.metadata : undefined;
  }
}

class MockFrameworkRenderer {}
class MockLocalRequireBuilder {}

describe("LocalHelpers", () => {
  let localHelpers;
  let mockHelperRegistry;

  beforeEach(() => {
    mockHelperRegistry = new MockHelperRegistry();
    const config = { helperRegistry: mockHelperRegistry };
    localHelpers = new LocalHelpers(config);
  });

  describe("constructor", () => {
    it("should initialize with provided config", () => {
      expect(localHelpers.config).toBeDefined();
      expect(localHelpers.config.helperRegistry).toBe(mockHelperRegistry);
      expect(localHelpers.initialized).toBe(false);
    });

    it("should use default helperRegistry if not provided in config", () => {
      // This test is just to verify the constructor accepts a config without helperRegistry
      // In a real implementation, it would use the imported helperRegistry
      const configWithoutRegistry = {};
      const localHelpersWithoutRegistry = new LocalHelpers(configWithoutRegistry);
      
      // The config should have been set
      expect(localHelpersWithoutRegistry.config).toBeDefined();
    });

    it("should accept a plain config object", () => {
      const plainConfig = { helperRegistry: mockHelperRegistry };
      const service = new LocalHelpers(plainConfig);
      
      expect(service.config.helperRegistry).toBe(mockHelperRegistry);
    });

    it("should use default config when none provided", () => {
      const service = new LocalHelpers();
      expect(service.config).toBeDefined();
    });
  });

  describe("initialize method", () => {
    it("should register frameworkRenderer and localRequireBuilder helpers", () => {
      localHelpers.initialize();
      
      expect(mockHelperRegistry.isRegistered("frameworkRenderer")).toBe(true);
      expect(mockHelperRegistry.isRegistered("localRequireBuilder")).toBe(true);
      
      // Check that the correct classes were registered
      const frameworkRendererEntry = mockHelperRegistry.getHelper("frameworkRenderer");
      expect(frameworkRendererEntry).toBeDefined(); // Actual class will be imported
      
      const localRequireBuilderEntry = mockHelperRegistry.getHelper("localRequireBuilder");
      expect(localRequireBuilderEntry).toBeDefined(); // Actual class will be imported
    });

    it("should register helpers with correct metadata", () => {
      localHelpers.initialize();
      
      const frameworkRendererMetadata = mockHelperRegistry.getMetadata("frameworkRenderer");
      expect(frameworkRendererMetadata).toEqual({
        folder: "services/local/helpers",
        domain: "helpers"
      });
      
      const localRequireBuilderMetadata = mockHelperRegistry.getMetadata("localRequireBuilder");
      expect(localRequireBuilderMetadata).toEqual({
        folder: "services/local/helpers",
        domain: "helpers"
      });
    });

    it("should return the instance to allow chaining", () => {
      const result = localHelpers.initialize();
      expect(result).toBe(localHelpers);
    });

    it("should prevent double initialization", () => {
      localHelpers.initialize();
      const result = localHelpers.initialize(); // Second call
      
      expect(result).toBe(localHelpers); // Should return self
      // Double initialization should be prevented but the helpers should still be registered
      expect(mockHelperRegistry.isRegistered("frameworkRenderer")).toBe(true);
      expect(mockHelperRegistry.isRegistered("localRequireBuilder")).toBe(true);
    });

    it("should mark the instance as initialized", () => {
      expect(localHelpers.initialized).toBe(false);
      localHelpers.initialize();
      expect(localHelpers.initialized).toBe(true);
    });

    it("should only register helpers once even if called multiple times", () => {
      localHelpers.initialize();
      localHelpers.initialize(); // Call again
      
      // Verify that helpers are still registered (and only once)
      expect(mockHelperRegistry.isRegistered("frameworkRenderer")).toBe(true);
      expect(mockHelperRegistry.isRegistered("localRequireBuilder")).toBe(true);
    });
  });

  describe("Config property", () => {
    it("should have a Config property", () => {
      expect(LocalHelpers.Config).toBeDefined();
      expect(typeof LocalHelpers.Config).toBe("function");
    });
  });

  describe("inheritance", () => {
    it("should inherit from HelperBase", () => {
      expect(localHelpers).toBeInstanceOf(HelperBase);
    });

    it("should have HelperBase methods available", () => {
      expect(typeof localHelpers._registerHelper).toBe("function");
      expect(typeof localHelpers._resolveHelperRegistry).toBe("function");
    });
  });

  describe("integration tests", () => {
    it("should work through full lifecycle", () => {
      // Before initialization
      expect(localHelpers.initialized).toBe(false);
      expect(mockHelperRegistry.isRegistered("frameworkRenderer")).toBe(false);
      expect(mockHelperRegistry.isRegistered("localRequireBuilder")).toBe(false);
      
      // Initialize
      const initResult = localHelpers.initialize();
      
      // After initialization
      expect(initResult).toBe(localHelpers);
      expect(localHelpers.initialized).toBe(true);
      expect(mockHelperRegistry.isRegistered("frameworkRenderer")).toBe(true);
      expect(mockHelperRegistry.isRegistered("localRequireBuilder")).toBe(true);
    });

    it("should handle multiple initialization attempts gracefully", () => {
      // Initialize first time
      localHelpers.initialize();
      const firstInitializedState = localHelpers.initialized;
      
      // Initialize second time
      const secondResult = localHelpers.initialize();
      
      // Should return the same instance and remain initialized
      expect(secondResult).toBe(localHelpers);
      expect(localHelpers.initialized).toBe(firstInitializedState);
      expect(localHelpers.initialized).toBe(true);
      
      // Should still have the helpers registered
      expect(mockHelperRegistry.isRegistered("frameworkRenderer")).toBe(true);
      expect(mockHelperRegistry.isRegistered("localRequireBuilder")).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should handle initialization with empty registry", () => {
      const emptyRegistry = new MockHelperRegistry();
      const config = { helperRegistry: emptyRegistry };
      const service = new LocalHelpers(config);
      
      service.initialize();
      
      expect(emptyRegistry.isRegistered("frameworkRenderer")).toBe(true);
      expect(emptyRegistry.isRegistered("localRequireBuilder")).toBe(true);
    });
  });
});