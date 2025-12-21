const BaseController = require("../../../../bootstrap/controllers/base-controller.js");

// Create a concrete implementation for testing since BaseController is abstract
class ConcreteController extends BaseController {
  initialize() {
    // Implement the required method
    this._markInitialized();
  }
}

describe("BaseController", () => {
  describe("constructor", () => {
    it("should store the provided configuration", () => {
      const config = { test: "value" };
      const controller = new ConcreteController(config);
      
      expect(controller.config).toBe(config);
    });

    it("should accept empty config object", () => {
      const controller = new ConcreteController({});
      
      expect(controller.config).toEqual({});
    });

    it("should accept no config and default to empty object", () => {
      const controller = new ConcreteController();
      
      expect(controller.config).toEqual({});
    });

    it("should track initialization state as false by default", () => {
      const controller = new ConcreteController({});
      
      expect(controller.initialized).toBe(false);
    });
  });

  describe("initialize method", () => {
    it("should throw when called on the base implementation", () => {
      // Create a controller that doesn't override initialize to test the base implementation
      class BaseImplementation extends BaseController {}
      const controller = new BaseImplementation({});
      
      expect(() => controller.initialize()).toThrow(/must implement initialize/);
      expect(() => controller.initialize()).toThrow("BaseImplementation must implement initialize()");
    });

    it("should not throw when called on concrete implementation", () => {
      const controller = new ConcreteController({});
      
      expect(() => controller.initialize()).not.toThrow();
    });

    it("should mark controller as initialized after initialize is called", () => {
      const controller = new ConcreteController({});
      
      controller.initialize();
      
      expect(controller.initialized).toBe(true);
    });
  });

  describe("_ensureNotInitialized method", () => {
    it("should not throw when controller is not initialized", () => {
      const controller = new ConcreteController({});
      
      expect(() => controller._ensureNotInitialized()).not.toThrow();
    });

    it("should throw when controller is already initialized", () => {
      const controller = new ConcreteController({});
      controller.initialize();
      
      expect(() => controller._ensureNotInitialized()).toThrow(/already initialized/);
      expect(() => controller._ensureNotInitialized()).toThrow("ConcreteController already initialized");
    });
  });

  describe("_markInitialized method", () => {
    it("should set initialized flag to true", () => {
      const controller = new ConcreteController({});
      
      controller._markInitialized();
      
      expect(controller.initialized).toBe(true);
    });

    it("should be callable multiple times", () => {
      const controller = new ConcreteController({});
      
      controller._markInitialized();
      controller._markInitialized(); // Should not throw
      
      expect(controller.initialized).toBe(true);
    });
  });

  describe("_ensureInitialized method", () => {
    it("should throw when controller is not initialized", () => {
      const controller = new ConcreteController({});
      
      expect(() => controller._ensureInitialized()).toThrow(/not initialized/);
      expect(() => controller._ensureInitialized()).toThrow("ConcreteController not initialized");
    });

    it("should not throw when controller is initialized", () => {
      const controller = new ConcreteController({});
      controller.initialize();
      
      expect(() => controller._ensureInitialized()).not.toThrow();
    });
  });

  describe("lifecycle methods work together", () => {
    it("should allow proper initialization flow", () => {
      const controller = new ConcreteController({});
      
      // Before initialization
      expect(() => controller._ensureInitialized()).toThrow();
      expect(() => controller._ensureNotInitialized()).not.toThrow();
      
      // During initialization
      controller._ensureNotInitialized();
      controller._markInitialized();
      
      // After initialization
      expect(() => controller._ensureInitialized()).not.toThrow();
      expect(() => controller._ensureNotInitialized()).toThrow();
    });
  });

  describe("integration: full controller lifecycle", () => {
    it("should work through complete lifecycle", () => {
      const mockConfig = { setting: "value" };
      
      const controller = new ConcreteController(mockConfig);
      
      // Before initialize
      expect(controller.initialized).toBe(false);
      expect(() => controller._ensureInitialized()).toThrow();
      
      // Initialize
      controller.initialize();
      
      // After initialize
      expect(controller.initialized).toBe(true);
      expect(() => controller._ensureInitialized()).not.toThrow();
      expect(controller.config).toBe(mockConfig);
    });

    it("should prevent double initialization", () => {
      const controller = new ConcreteController({});
      
      // First initialization should work
      controller.initialize();
      expect(controller.initialized).toBe(true);
      
      // Second initialization should be prevented by the concrete implementation
      // if it uses the guards, or we can test the guard directly
      expect(() => controller._ensureNotInitialized()).toThrow();
    });
  });

  describe("inheritance behavior", () => {
    it("should work with different controller subclasses", () => {
      class TestController1 extends BaseController {
        initialize() {
          this._markInitialized();
        }
      }
      
      class TestController2 extends BaseController {
        initialize() {
          this.data = "initialized";
          this._markInitialized();
        }
      }
      
      const controller1 = new TestController1({ name: "test1" });
      const controller2 = new TestController2({ name: "test2" });
      
      controller1.initialize();
      controller2.initialize();
      
      expect(controller1.initialized).toBe(true);
      expect(controller2.initialized).toBe(true);
      expect(controller2.data).toBe("initialized");
    });
  });
});