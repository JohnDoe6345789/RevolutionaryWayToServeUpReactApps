(function (global) {
  const namespace = global.__rwtraBootstrap || (global.__rwtraBootstrap = {});
  const helpers = namespace.helpers || (namespace.helpers = {});

  const isCommonJs = typeof module !== "undefined" && module.exports;
  const logging = isCommonJs
    ? require("./logging.js")
    : helpers.logging;
  const network = isCommonJs
    ? require("./network.js")
    : helpers.network;

  const { logClient = () => {} } = logging || {};
  const {
    loadScript = () => Promise.resolve(),
    resolveModuleUrl = () => ""
  } = network || {};

  function loadTools(tools) {
    return Promise.all(
      (tools || []).map(async (tool) => {
        const url = await resolveModuleUrl(tool);
        await loadScript(url);
        if (!window[tool.global]) {
          throw new Error(
            "Tool global not found after loading " + url + ": " + tool.global
          );
        }
        logClient("tool:loaded", { name: tool.name, url, global: tool.global });
      })
    );
  }

  function makeNamespace(globalObj) {
    const ns = { default: globalObj, __esModule: true };
    for (const k in globalObj) {
      if (Object.prototype.hasOwnProperty.call(globalObj, k)) {
        ns[k] = globalObj[k];
      }
    }
    return ns;
  }

  async function loadModules(modules) {
    const registry = {};
    for (const mod of modules) {
      const url = await (helpers.network?.resolveModuleUrl || network.resolveModuleUrl)(mod);
      await loadScript(url);
      const globalObj = window[mod.global];
      if (!globalObj) {
        throw new Error(
          "Module global not found after loading " + url + ": " + mod.global
        );
      }
      registry[mod.name] = makeNamespace(globalObj);
      logClient("module:loaded", {
        name: mod.name,
        url,
        global: mod.global
      });
    }
    return registry;
  }

  const exports = {
    loadTools,
    makeNamespace,
    loadModules
  };

  helpers.tools = exports;
  if (isCommonJs) {
    module.exports = exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
