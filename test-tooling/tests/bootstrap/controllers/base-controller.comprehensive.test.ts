import BaseController from "../../../../bootstrap/controllers/base-controller.js";

describe("BaseController", () => {
  describe("constructor", () => {
    it("should initialize with default empty config", () => {
      const controller = new BaseController();
      
      expect(controller.config).toEqual({});
      expect(controller.initialized).toBe(false);
    });

    it("should accept and store configuration", () => {
      const config = { test: "value", other: "data" };
      const controller = new BaseController(config);
      
      expect(controller.config).toBe(config);
      expect(controller.initialized).toBe(false);
    });

    it("should set initialized to false by default", () => {
      const controller = new BaseController();
      
      expect(controller.initialized).toBe(false);
    });
  });

  describe("initialize method", () => {
    it("should throw an error when called directly", () => {
      const controller = new BaseController();
      
      expect(() => controller.initialize()).toThrow(
        "BaseController must implement initialize()"
      );
    });

    it("should be overridable by subclasses", () => {
      class TestController extends BaseController {
        initialize() {
          this._markInitialized();
          return "initialized";
        }
      }
      
      const controller = new TestController();
      const result = controller.initialize();
      
      expect(result).toBe("initialized");
      expect(controller.initialized).toBe(true);
    });
  });

  describe("_ensureNotInitialized method", () => {
    it("should not throw when controller is not initialized", () => {
      const controller = new BaseController();
      
      expect(() => controller._ensureNotInitialized()).not.toThrow();
    });

    it("should throw when controller is already initialized", () => {
      const controller = new BaseController();
      controller._markInitialized();
      
      expect(() => controller._ensureNotInitialized()).toThrow(
        "BaseController already initialized"
      );
    });

    it("should work correctly after marking as initialized", () => {
      const controller = new BaseController();
      
      // Should not throw initially
      expect(() => controller._ensureNotInitialized()).not.toThrow();
      
      // Mark as initialized
      controller._markInitialized();
      
      // Should throw after initialization
      expect(() => controller._ensureNotInitialized()).toThrow(
        "BaseController already initialized"
      );
    });
  });

  describe("_markInitialized method", () => {
    it("should set initialized property to true", () => {
      const controller = new BaseController();
      
      expect(controller.initialized).toBe(false);
      controller._markInitialized();
      expect(controller.initialized).toBe(true);
    });

    it("should be called to mark controller as initialized", () => {
      class TestController extends BaseController {
        initialize() {
          this._markInitialized();
        }
      }
      
      const controller = new TestController();
      expect(controller.initialized).toBe(false);
      
      controller.initialize();
      expect(controller.initialized).toBe(true);
    });
  });

  describe("_ensureInitialized method", () => {
    it("should throw when controller is not initialized", () => {
      const controller = new BaseController();
      
      expect(() => controller._ensureInitialized()).toThrow(
        "BaseController not initialized"
      );
    });

    it("should not throw when controller is initialized", () => {
      const controller = new BaseController();
      controller._markInitialized();
      
      expect(() => controller._ensureInitialized()).not.toThrow();
    });

    it("should work correctly after initialization", () => {
      class TestController extends BaseController {
        initialize() {
          this._markInitialized();
        }
      }
      
      const controller = new TestController();
      
      // Should throw before initialization
      expect(() => controller._ensureInitialized()).toThrow();
      
      // Initialize the controller
      controller.initialize();
      
      // Should not throw after initialization
      expect(() => controller._ensureInitialized()).not.toThrow();
    });
  });

  describe("lifecycle methods interaction", () => {
    it("should enforce initialization lifecycle correctly", () => {
      class TestController extends BaseController {
        initialize() {
          // Verify not initialized yet
          this._ensureNotInitialized();
          
          // Mark as initialized
          this._markInitialized();
          
          // Verify now initialized
          this._ensureInitialized();
        }
      }
      
      const controller = new TestController();
      
      // Initially not initialized
      expect(controller.initialized).toBe(false);
      expect(() => controller._ensureInitialized()).toThrow();
      expect(() => controller._ensureNotInitialized()).not.toThrow();
      
      // After initialization
      controller.initialize();
      expect(controller.initialized).toBe(true);
      expect(() => controller._ensureInitialized()).not.toThrow();
      expect(() => controller._ensureNotInitialized()).toThrow();
    });

    it("should prevent double initialization", () => {
      class TestController extends BaseController {
        initialize() {
          this._ensureNotInitialized(); // Should pass first time
          this._markInitialized();
        }
      }
      
      const controller = new TestController();
      controller.initialize();
      
      // Trying to initialize again should fail at _ensureNotInitialized
      expect(() => {
        class ReinitController extends BaseController {
          initialize() {
            this._ensureNotInitialized(); // Should fail
            this._markInitialized();
          }
        }
        const reinitCtrl = new ReinitController();
        reinitCtrl.initialized = true; // Manually set to simulate already initialized
        reinitCtrl.initialize();
      }).toThrow("BaseController already initialized");
    });
  });

  describe("integration tests", () => {
    it("should work through full lifecycle with proper configuration", () => {
      const config = { custom: "value", settings: { enabled: true } };
      const controller = new BaseController(config);
      
      // Verify initial state
      expect(controller.config).toBe(config);
      expect(controller.initialized).toBe(false);
      
      // Simulate initialization process
      controller._ensureNotInitialized(); // Should not throw
      controller._markInitialized();
      controller._ensureInitialized(); // Should not throw
      
      // Verify final state
      expect(controller.initialized).toBe(true);
    });

    it("should handle complex configuration scenarios", () => {
      const config = { 
        namespace: { helpers: {} },
        settings: { 
          enabled: true, 
          options: { debug: false } 
        },
        registry: { services: [] }
      };
      
      class ComplexTestController extends BaseController {
        initialize() {
          // Access config properties
          expect(this.config.settings.enabled).toBe(true);
          expect(this.config.settings.options.debug).toBe(false);
          expect(this.config.namespace).toBeDefined();
          expect(this.config.registry).toBeDefined();
          
          this._markInitialized();
        }
      }
      
      const controller = new ComplexTestController(config);
      controller.initialize();
      
      // Verify everything worked
      expect(controller.initialized).toBe(true);
      expect(controller.config.settings.enabled).toBe(true);
    });

    it("should maintain state properly across method calls", () => {
      class StatefulController extends BaseController {
        initialize() {
          this._markInitialized();
          this.customProperty = "test";
        }
        
        getCustomProperty() {
          this._ensureInitialized(); // Ensure initialized before access
          return this.customProperty;
        }
      }
      
      const controller = new StatefulController();
      
      // Before initialization
      expect(() => controller.getCustomProperty()).toThrow();
      
      // Initialize
      controller.initialize();
      
      // After initialization
      expect(controller.getCustomProperty()).toBe("test");
    });
  });

  describe("error message specificity", () => {
    it("should include class name in error messages", () => {
      const controller = new BaseController();
      
      // Test initialize error message
      expect(() => controller.initialize()).toThrow("BaseController must implement initialize()");
      
      // Test not initialized error
      expect(() => controller._ensureInitialized()).toThrow("BaseController not initialized");
      
      // Test already initialized error
      controller._markInitialized();
      expect(() => controller._ensureNotInitialized()).toThrow("BaseController already initialized");
    });
  });
});