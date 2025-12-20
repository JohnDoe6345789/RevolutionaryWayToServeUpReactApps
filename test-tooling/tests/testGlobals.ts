import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest as baseJest
} from "@jest/globals";

declare const require: NodeRequire | undefined;

const mockRegistry = new Map<
  string,
  { original?: NodeModule; factory: () => unknown }
>();

const clearRequireCache = () => {
  if (typeof require !== "function" || !require.cache) {
    return;
  }
  for (const key of Object.keys(require.cache)) {
    delete require.cache[key];
  }
};

const resolveModuleId = (moduleName: string) => {
  if (typeof require !== "function" || typeof require.resolve !== "function") {
    return moduleName;
  }
  try {
    return require.resolve(moduleName);
  } catch {
    return moduleName;
  }
};

const overrideModule = (moduleId: string, mockExports: unknown) => {
  if (typeof require !== "function" || !require.cache) {
    return;
  }
  mockRegistry.set(moduleId, {
    original: require.cache[moduleId],
    factory: () => mockExports
  });

  require.cache[moduleId] = {
    id: moduleId,
    filename: moduleId,
    loaded: true,
    exports: mockExports,
    children: [],
    paths: []
  } as NodeModule;
};

const restoreModule = (moduleId: string) => {
  if (typeof require !== "function" || !require.cache) {
    return;
  }
  const registration = mockRegistry.get(moduleId);
  if (!registration) {
    return;
  }
  if (registration.original) {
    require.cache[moduleId] = registration.original;
  } else {
    delete require.cache[moduleId];
  }
  mockRegistry.delete(moduleId);
};

const ensureJestShims = () => {
  const jestAny = baseJest as typeof baseJest & {
    resetModules?: () => void;
    doMock?: (moduleName: string, factory: () => unknown) => void;
    dontMock?: (moduleName: string) => void;
  };

  if (typeof jestAny.resetModules !== "function") {
    jestAny.resetModules = () => {
      mockRegistry.clear();
      clearRequireCache();
    };
  }

  if (typeof jestAny.doMock !== "function") {
    jestAny.doMock = (moduleName, factory) => {
      const moduleId = resolveModuleId(moduleName);
      overrideModule(moduleId, factory());
    };
  }

  if (typeof jestAny.dontMock !== "function") {
    jestAny.dontMock = (moduleName) => {
      const moduleId = resolveModuleId(moduleName);
      restoreModule(moduleId);
    };
  }
};

ensureJestShims();

export { afterEach, beforeEach, describe, expect, it, baseJest as jest };
