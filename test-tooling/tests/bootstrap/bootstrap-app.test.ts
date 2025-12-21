const modulePath = "../../../bootstrap/bootstrap-app.js";

describe("bootstrap/bootstrap-app.js", () => {
  let BootstrapApp;
  let instance;
  let latestLoggingManagerInstance;
  let latestBootstrapperInstance;
  let moduleLoaderHelper;
  let networkHelper;
  let loggingHelper;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    latestLoggingManagerInstance = null;
    latestBootstrapperInstance = null;

    jest.doMock("../../../bootstrap/services/core/logging-manager.js", () => {
      return jest.fn().mockImplementation(() => {
        latestLoggingManagerInstance = {
          initialize: jest.fn(),
          install: jest.fn(),
        };
        return latestLoggingManagerInstance;
      });
    });

    jest.doMock("../../../bootstrap/configs/core/logging-manager.js", () => {
      return jest.fn().mockImplementation((options) => options);
    });

    jest.doMock("../../../bootstrap/configs/core/bootstrapper.js", () => {
      return jest.fn().mockImplementation((options) => options);
    });

    jest.doMock("../../../bootstrap/services/service-registry-instance.js", () => {
      return {
        register: jest.fn(),
        get: jest.fn(),
      };
    });

    loggingHelper = {
      setCiLoggingEnabled: jest.fn(),
      detectCiLogging: jest.fn(),
      logClient: { send: jest.fn() },
      serializeForLog: jest.fn(),
      isCiLoggingEnabled: jest.fn(),
    };
    jest.doMock("../../../bootstrap/cdn/logging.js", () => loggingHelper);

    networkHelper = {
      normalizeProviderBase: jest.fn(),
      probeUrl: jest.fn(),
      resolveModuleUrl: jest.fn(),
    };
    jest.doMock("../../../bootstrap/cdn/network.js", () => networkHelper);

    moduleLoaderHelper = {
      loadTools: jest.fn(),
      makeNamespace: jest.fn(),
      loadModules: jest.fn(),
      loadDynamicModule: jest.fn(),
      createRequire: jest.fn(),
      compileSCSS: jest.fn(),
      injectCSS: jest.fn(),
      collectDynamicModuleImports: jest.fn(),
      preloadDynamicModulesFromSource: jest.fn(),
      collectModuleSpecifiers: jest.fn(),
      preloadModulesFromSource: jest.fn(),
      compileTSX: jest.fn(),
      frameworkRender: jest.fn(),
      loadScript: jest.fn(),
    };
    jest.doMock("../../../bootstrap/entrypoints/module-loader.js", () => moduleLoaderHelper);

    jest.doMock("../../../bootstrap/controllers/bootstrapper.js", () => {
      return jest.fn().mockImplementation(() => {
        latestBootstrapperInstance = {
          initialize: jest.fn(),
          bootstrap: jest.fn(),
          loadConfig: jest.fn(),
        };
        return latestBootstrapperInstance;
      });
    });

    BootstrapApp = require(modulePath);
    instance = new BootstrapApp();
  });

  afterEach(() => {
    jest.dontMock("../../../bootstrap/services/core/logging-manager.js");
    jest.dontMock("../../../bootstrap/configs/core/logging-manager.js");
    jest.dontMock("../../../bootstrap/configs/core/bootstrapper.js");
    jest.dontMock("../../../bootstrap/services/service-registry-instance.js");
    jest.dontMock("../../../bootstrap/cdn/logging.js");
    jest.dontMock("../../../bootstrap/cdn/network.js");
    jest.dontMock("../../../bootstrap/entrypoints/module-loader.js");
    jest.dontMock("../../../bootstrap/controllers/bootstrapper.js");
  });

  it("initializes the logging manager and bootstrapper and returns itself", () => {
    const result = instance.initialize();
    expect(latestLoggingManagerInstance.initialize).toHaveBeenCalled();
    expect(latestBootstrapperInstance.initialize).toHaveBeenCalled();
    expect(result).toBe(instance);
  });

  it("exposes the helper modules alongside bootstrapper load/boot helpers", () => {
    const exports = instance.getExports();

    expect(exports.loadTools).toBe(moduleLoaderHelper.loadTools);
    expect(exports.makeNamespace).toBe(moduleLoaderHelper.makeNamespace);
    expect(exports.loadScript).toBe(moduleLoaderHelper.loadScript);
    expect(exports.normalizeProviderBase).toBe(networkHelper.normalizeProviderBase);
    expect(exports.probeUrl).toBe(networkHelper.probeUrl);
    expect(exports.resolveModuleUrl).toBe(networkHelper.resolveModuleUrl);

    exports.bootstrap();
    expect(latestBootstrapperInstance.bootstrap).toHaveBeenCalled();
  });

  it("installLogging calls the helper when a browser window is provided", () => {
    const windowObj = { document: {} };
    instance.installLogging(windowObj);
    expect(latestLoggingManagerInstance.install).toHaveBeenCalledWith(windowObj);
  });

  it("installLogging is a no-op outside browser contexts", () => {
    instance.installLogging({});
    expect(latestLoggingManagerInstance.install).not.toHaveBeenCalled();
  });

  it("runBootstrapper invokes bootstrapper when allowed", () => {
    const windowObj = { document: {}, __RWTRA_BOOTSTRAP_TEST_MODE__: false };
    instance.runBootstrapper(windowObj);
    expect(latestBootstrapperInstance.bootstrap).toHaveBeenCalled();
  });

  it("runBootstrapper skips bootstrapping when already in test mode", () => {
    const windowObj = { document: {}, __RWTRA_BOOTSTRAP_TEST_MODE__: true };
    instance.runBootstrapper(windowObj);
    expect(latestBootstrapperInstance.bootstrap).not.toHaveBeenCalled();
  });

  it("runBootstrapper skips when not running in a browser", () => {
    instance.runBootstrapper({});
    expect(latestBootstrapperInstance.bootstrap).not.toHaveBeenCalled();
  });

  it("provides the logging helper bindings", () => {
    const bindings = instance._loggingBindings();
    expect(bindings.setCiLoggingEnabled).toBe(loggingHelper.setCiLoggingEnabled);
    expect(bindings.detectCiLogging).toBe(loggingHelper.detectCiLogging);
    expect(bindings.logClient).toBe(loggingHelper.logClient);
    expect(bindings.serializeForLog).toBe(loggingHelper.serializeForLog);
    expect(bindings.isCiLoggingEnabled).toBe(loggingHelper.isCiLoggingEnabled);
  });
});
