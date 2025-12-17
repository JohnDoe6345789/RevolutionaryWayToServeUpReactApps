(function (global) {
  const namespace = global.__rwtraBootstrap || (global.__rwtraBootstrap = {});
  const helpers = namespace.helpers || (namespace.helpers = {});

  const isCommonJs = typeof module !== "undefined" && module.exports;
  const logging = isCommonJs
    ? require("./logging.js")
    : helpers.logging;
  const dynamicModules = isCommonJs
    ? require("./dynamic-modules.js")
    : helpers.dynamicModules;
  const sourceUtils = isCommonJs
    ? require("./source-utils.js")
    : helpers.sourceUtils;

  const { logClient = () => {} } = logging || {};
  const { loadDynamicModule = () => Promise.reject(new Error("dynamic loader missing")) } =
    dynamicModules || {};
  const {
    collectModuleSpecifiers = () => [],
    preloadModulesFromSource = () => Promise.resolve(),
    preloadDynamicModulesFromSource = () => Promise.resolve()
  } = sourceUtils || {};

  async function compileSCSS(scssFile) {
    const res = await fetch(scssFile, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load " + scssFile);
    const scss = await res.text();
    const SassImpl = window.Sass;
    if (!SassImpl) {
      throw new Error("Sass global not found (is your Sass tool loaded?)");
    }

    return new Promise((resolve, reject) => {
      try {
        if (typeof SassImpl === "function") {
          const sass = new SassImpl();
          sass.compile(scss, (result) => {
            if (result.status === 0) {
              resolve(result.text);
            } else {
              reject(
                new Error(result.formatted || "Sass (sass.js) compile error")
              );
            }
          });
          return;
        }

        if (typeof SassImpl.compile === "function") {
          if (SassImpl.compile.length >= 2) {
            SassImpl.compile(scss, (result) => {
              if (result.status === 0) {
                resolve(result.text);
              } else {
                reject(
                  new Error(result.formatted || "Sass (object) compile error")
                );
              }
            });
            return;
          }

          const result = SassImpl.compile(scss);
          const css = typeof result === "string" ? result : result.css || "";
          resolve(css);
          return;
        }

        reject(
          new Error(
            "Unsupported Sass implementation: neither constructor nor usable compile() found"
          )
        );
      } catch (e) {
        reject(e);
      }
    });
  }

  function injectCSS(css) {
    const tag = document.createElement("style");
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  async function compileTSX(entryFile, requireFn, entryDir = "") {
    const res = await fetch(entryFile, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load " + entryFile);
    const tsxCode = await res.text();

    await preloadModulesFromSource(tsxCode, requireFn, entryDir);

    const compiled = executeModuleSource(tsxCode, entryFile, entryDir, requireFn);
    logClient("tsx:compiled", { entryFile, entryDir });
    return compiled;
  }

  const LOCAL_MODULE_EXTENSIONS = ["", ".tsx", ".ts", ".jsx", ".js"];
  const moduleContextStack = [];

  function isLocalModule(name) {
    return name.startsWith(".") || name.startsWith("/");
  }

  function normalizeDir(dir) {
    if (!dir) return "";
    return dir.replace(/^\/+/, "").replace(/\/+$/, "");
  }

  function makeAliasKey(name, baseDir) {
    return normalizeDir(baseDir) + "|" + name;
  }

  function resolveLocalModuleBase(name, baseDir) {
    const normalizedBase = normalizeDir(baseDir);
    const baseUrl = normalizedBase
      ? `${location.origin}/${normalizedBase}/`
      : `${location.origin}/`;
    const resolvedUrl = new URL(name, baseUrl);
    return resolvedUrl.pathname.replace(/^\//, "");
  }

  function getModuleDir(filePath) {
    const idx = filePath.lastIndexOf("/");
    return idx === -1 ? "" : filePath.slice(0, idx);
  }

  function hasKnownExtension(path) {
    return /\.(tsx|ts|jsx|js)$/.test(path);
  }

  function getCandidateLocalPaths(basePath) {
    const normalizedBase = basePath.replace(/\/+$/, "");
    const seen = new Set();
    const candidates = [];

    function add(candidate) {
      if (!candidate) return;
      if (seen.has(candidate)) return;
      seen.add(candidate);
      candidates.push(candidate);
    }

    add(normalizedBase);
    if (!hasKnownExtension(normalizedBase)) {
      for (const ext of LOCAL_MODULE_EXTENSIONS) {
        add(normalizedBase + ext);
      }
      for (const ext of LOCAL_MODULE_EXTENSIONS) {
        add(`${normalizedBase}/index${ext}`);
      }
    }

    return candidates;
  }

  function transformSource(source, filePath) {
    return Babel.transform(source, {
      filename: filePath,
      presets: [
        ["typescript", { allExtensions: true, isTSX: true }],
        "react",
        "env"
      ],
      sourceMaps: "inline"
    }).code;
  }

  function executeModuleSource(source, filePath, moduleDir, requireFn) {
    const compiled = transformSource(source, filePath);
    const exports = {};
    const module = { exports };

    moduleContextStack.push({ path: filePath, dir: moduleDir });
    try {
      new Function("require", "exports", "module", compiled)(
        requireFn,
        exports,
        module
      );
    } finally {
      moduleContextStack.pop();
    }

    return module.exports.default || module.exports;
  }

  function createLocalModuleLoader(entryDir) {
    const moduleCache = new Map();
    const modulePromises = new Map();
    const aliasToCanonical = new Map();

    return async function loadLocalModule(name, baseDir, requireFn, registry) {
      const normalizedBase = normalizeDir(baseDir || entryDir || "");
      const aliasKey = makeAliasKey(name, normalizedBase);
      const existingCanonical = aliasToCanonical.get(aliasKey);

      if (existingCanonical && registry[existingCanonical]) {
        const cached = registry[existingCanonical];
        registry[name] = cached;
        return cached;
      }

      const basePath = resolveLocalModuleBase(name, normalizedBase);
      const { source, resolvedPath } = await fetchLocalModuleSource(basePath);
      const moduleDir = getModuleDir(resolvedPath);
      aliasToCanonical.set(aliasKey, resolvedPath);

      if (moduleCache.has(resolvedPath)) {
        const cached = moduleCache.get(resolvedPath);
        registry[resolvedPath] = cached;
        registry[name] = cached;
        return cached;
      }

      if (modulePromises.has(resolvedPath)) {
        const pending = await modulePromises.get(resolvedPath);
        registry[resolvedPath] = pending;
        registry[name] = pending;
        return pending;
      }

      const loadPromise = (async () => {
        await preloadModulesFromSource(source, requireFn, moduleDir);
        const moduleExports = executeModuleSource(
          source,
          resolvedPath,
          moduleDir,
          requireFn
        );
        moduleCache.set(resolvedPath, moduleExports);
        registry[resolvedPath] = moduleExports;
        return moduleExports;
      })();

      modulePromises.set(resolvedPath, loadPromise);
      try {
        const result = await loadPromise;
        registry[name] = result;
        return result;
      } finally {
        modulePromises.delete(resolvedPath);
      }
    };
  }

  async function fetchLocalModuleSource(basePath) {
    const candidates = getCandidateLocalPaths(basePath);

    for (const candidate of candidates) {
      try {
        const res = await fetch(candidate, { cache: "no-store" });
        if (res.ok) {
          return {
            source: await res.text(),
            resolvedPath: candidate
          };
        }
      } catch (err) {
        // ignore and try next candidate
      }
    }

    logClient("local-module:failed", { basePath, candidates });
    throw new Error(
      "Failed to load local module: " +
        basePath +
        " (tried: " +
        candidates.join(", ") +
        ")"
    );
  }

  function frameworkRender(config, registry, App) {
    const rootId = config.render?.rootId || "root";
    const rootEl = document.getElementById(rootId);
    if (!rootEl) throw new Error("Root element not found: #" + rootId);

    const domModuleName = config.render?.domModule;
    const reactModuleName = config.render?.reactModule;
    const domModule = domModuleName ? registry[domModuleName] : null;
    const reactModule = reactModuleName ? registry[reactModuleName] : null;
    if (!domModule) throw new Error("DOM render module missing: " + domModuleName);
    if (!reactModule) throw new Error("React module missing: " + reactModuleName);

    const createRootFn = domModule[config.render.createRoot];
    if (!createRootFn) {
      throw new Error("createRoot not found: " + config.render.createRoot);
    }

    const root = createRootFn(rootEl);
    const renderMethod = config.render.renderMethod || "render";
    if (typeof root[renderMethod] !== "function") {
      throw new Error("Render method not found: " + renderMethod);
    }

    root[renderMethod](reactModule.createElement(App));
  }

  function createRequire(
    registry,
    config,
    entryDir = "",
    localModuleLoader,
    dynamicModuleLoader
  ) {
    let resolvedEntryDir = "";
    let resolvedDynamicModuleLoader = dynamicModuleLoader;

    if (typeof entryDir === "function" && arguments.length === 3) {
      resolvedDynamicModuleLoader = entryDir;
    } else {
      resolvedEntryDir = entryDir || "";
    }

    resolvedDynamicModuleLoader = resolvedDynamicModuleLoader || loadDynamicModule;

    function require(name) {
      if (registry[name]) return registry[name];
      throw new Error(
        "Module not yet loaded: " +
          name +
          " (use a preload step via requireAsync for dynamic modules)"
      );
    }

    async function requireAsync(name, baseDir) {
      if (registry[name]) return registry[name];
      if (localModuleLoader && isLocalModule(name)) {
        return localModuleLoader(
          name,
          baseDir || resolvedEntryDir,
          require,
          registry
        );
      }
      const dynRules = config.dynamicModules || [];
      if (dynRules.some((r) => name.startsWith(r.prefix))) {
        return resolvedDynamicModuleLoader(name, config, registry);
      }
      throw new Error("Module not registered: " + name);
    }

    require._async = requireAsync;
    return require;
  }

  const exports = {
    compileSCSS,
    injectCSS,
    compileTSX,
    getCandidateLocalPaths,
    fetchLocalModuleSource,
    createLocalModuleLoader,
    frameworkRender,
    createRequire,
    isLocalModule,
    transformSource,
    executeModuleSource,
    normalizeDir,
    makeAliasKey,
    getModuleDir
  };

  helpers.localLoader = exports;
  if (isCommonJs) {
    module.exports = exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
