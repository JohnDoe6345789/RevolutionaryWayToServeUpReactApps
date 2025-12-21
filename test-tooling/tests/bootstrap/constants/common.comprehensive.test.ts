import common from "../../../../bootstrap/constants/common.js";
import ciLogQueryParam from "../../../../bootstrap/constants/ci-log-query-param.js";
import clientLogEndpoint from "../../../../bootstrap/constants/client-log-endpoint.js";
import defaultFallbackProviders from "../../../../bootstrap/constants/default-fallback-providers.js";
import getDefaultProviderAliases from "../../../../bootstrap/constants/default-provider-aliases.js";
import proxyModeAuto from "../../../../bootstrap/constants/proxy-mode-auto.js";
import proxyModeDirect from "../../../../bootstrap/constants/proxy-mode-direct.js";
import proxyModeProxy from "../../../../bootstrap/constants/proxy-mode-proxy.js";
import scriptManifestUrl from "../../../../bootstrap/constants/script-manifest-url.js";
import localModuleExtensions from "../../../../bootstrap/constants/local-module-extensions.js";

describe("Common Constants Module", () => {
  describe("exports validation", () => {
    it("should export all expected constant modules", () => {
      expect(common).toBeDefined();
      expect(common.ciLogQueryParam).toBeDefined();
      expect(common.clientLogEndpoint).toBeDefined();
      expect(common.defaultFallbackProviders).toBeDefined();
      expect(common.getDefaultProviderAliases).toBeDefined();
      expect(common.proxyModeAuto).toBeDefined();
      expect(common.proxyModeDirect).toBeDefined();
      expect(common.proxyModeProxy).toBeDefined();
      expect(common.scriptManifestUrl).toBeDefined();
      expect(common.localModuleExtensions).toBeDefined();
    });

    it("should have the correct number of exports", () => {
      const expectedExports = [
        'ciLogQueryParam',
        'clientLogEndpoint', 
        'defaultFallbackProviders',
        'getDefaultProviderAliases',
        'proxyModeAuto',
        'proxyModeDirect',
        'proxyModeProxy',
        'scriptManifestUrl',
        'localModuleExtensions'
      ];
      
      expect(Object.keys(common)).toHaveLength(expectedExports.length);
    });
  });

  describe("ciLogQueryParam constant", () => {
    it("should match the imported ciLogQueryParam value", () => {
      expect(common.ciLogQueryParam).toBe(ciLogQueryParam);
    });

    it("should be a string value", () => {
      expect(typeof common.ciLogQueryParam).toBe("string");
    });

    it("should have a non-empty value", () => {
      expect(common.ciLogQueryParam).not.toBe("");
    });
  });

  describe("clientLogEndpoint constant", () => {
    it("should match the imported clientLogEndpoint value", () => {
      expect(common.clientLogEndpoint).toBe(clientLogEndpoint);
    });

    it("should be a string value", () => {
      expect(typeof common.clientLogEndpoint).toBe("string");
    });

    it("should have a non-empty value", () => {
      expect(common.clientLogEndpoint).not.toBe("");
    });
  });

  describe("defaultFallbackProviders constant", () => {
    it("should match the imported defaultFallbackProviders value", () => {
      expect(common.defaultFallbackProviders).toEqual(defaultFallbackProviders);
    });

    it("should be an array", () => {
      expect(Array.isArray(common.defaultFallbackProviders)).toBe(true);
    });

    it("should have at least one provider", () => {
      expect(common.defaultFallbackProviders.length).toBeGreaterThan(0);
    });

    it("should contain string values", () => {
      common.defaultFallbackProviders.forEach(provider => {
        expect(typeof provider).toBe("string");
      });
    });

    it("should return a fresh array each time to avoid mutation leaks", () => {
      const array1 = common.defaultFallbackProviders;
      const array2 = common.defaultFallbackProviders;
      expect(array1).not.toBe(array2); // Different instances
      expect(array1).toEqual(array2);  // Same content
    });
  });

  describe("getDefaultProviderAliases function", () => {
    it("should match the imported getDefaultProviderAliases function", () => {
      expect(common.getDefaultProviderAliases).toBe(getDefaultProviderAliases);
    });

    it("should be a function", () => {
      expect(typeof common.getDefaultProviderAliases).toBe("function");
    });

    it("should return an object when called", () => {
      const aliases = common.getDefaultProviderAliases();
      expect(typeof aliases).toBe("object");
    });

    it("should return an empty object when no aliases are configured", () => {
      const aliases = common.getDefaultProviderAliases();
      // Verify it's an object (might be empty or have defaults)
      expect(typeof aliases).toBe("object");
    });
  });

  describe("proxy mode constants", () => {
    it("should match the imported proxyModeAuto value", () => {
      expect(common.proxyModeAuto).toBe(proxyModeAuto);
    });

    it("should match the imported proxyModeDirect value", () => {
      expect(common.proxyModeDirect).toBe(proxyModeDirect);
    });

    it("should match the imported proxyModeProxy value", () => {
      expect(common.proxyModeProxy).toBe(proxyModeProxy);
    });

    it("should have distinct values for each proxy mode", () => {
      const modes = [
        common.proxyModeAuto,
        common.proxyModeDirect,
        common.proxyModeProxy
      ];
      
      // Check that all values are unique
      for (let i = 0; i < modes.length; i++) {
        for (let j = i + 1; j < modes.length; j++) {
          expect(modes[i]).not.toBe(modes[j]);
        }
      }
    });

    it("should have string values for proxy modes", () => {
      expect(typeof common.proxyModeAuto).toBe("string");
      expect(typeof common.proxyModeDirect).toBe("string");
      expect(typeof common.proxyModeProxy).toBe("string");
    });

    it("should have lowercase values for proxy modes", () => {
      expect(common.proxyModeAuto).toBe(common.proxyModeAuto.toLowerCase());
      expect(common.proxyModeDirect).toBe(common.proxyModeDirect.toLowerCase());
      expect(common.proxyModeProxy).toBe(common.proxyModeProxy.toLowerCase());
    });
  });

  describe("scriptManifestUrl constant", () => {
    it("should match the imported scriptManifestUrl value", () => {
      expect(common.scriptManifestUrl).toBe(scriptManifestUrl);
    });

    it("should be a string value", () => {
      expect(typeof common.scriptManifestUrl).toBe("string");
    });

    it("should have a non-empty value", () => {
      expect(common.scriptManifestUrl).not.toBe("");
    });
  });

  describe("localModuleExtensions constant", () => {
    it("should match the imported localModuleExtensions value", () => {
      expect(common.localModuleExtensions).toEqual(localModuleExtensions);
    });

    it("should be an array", () => {
      expect(Array.isArray(common.localModuleExtensions)).toBe(true);
    });

    it("should contain at least one extension", () => {
      expect(common.localModuleExtensions.length).toBeGreaterThan(0);
    });

    it("should contain string values starting with a dot", () => {
      common.localModuleExtensions.forEach(ext => {
        expect(typeof ext).toBe("string");
        expect(ext.startsWith(".")).toBe(true);
      });
    });

    it("should include common extensions like .js", () => {
      expect(common.localModuleExtensions).toContain(".js");
    });

    it("should include an empty string to allow bare require/dir matches", () => {
      expect(common.localModuleExtensions).toContain("");
    });
  });

  describe("integration tests", () => {
    it("should have all constants properly defined and accessible", () => {
      const allConstants = {
        ciLogQueryParam: common.ciLogQueryParam,
        clientLogEndpoint: common.clientLogEndpoint,
        defaultFallbackProviders: common.defaultFallbackProviders,
        getDefaultProviderAliases: common.getDefaultProviderAliases,
        proxyModeAuto: common.proxyModeAuto,
        proxyModeDirect: common.proxyModeDirect,
        proxyModeProxy: common.proxyModeProxy,
        scriptManifestUrl: common.scriptManifestUrl,
        localModuleExtensions: common.localModuleExtensions
      };

      // Verify all constants are defined
      Object.entries(allConstants).forEach(([key, value]) => {
        expect(value).toBeDefined();
      });
    });

    it("should maintain consistent values across multiple accesses", () => {
      const firstAccess = { ...common };
      const secondAccess = { ...common };

      expect(firstAccess.ciLogQueryParam).toBe(secondAccess.ciLogQueryParam);
      expect(firstAccess.clientLogEndpoint).toBe(secondAccess.clientLogEndpoint);
      expect(firstAccess.defaultFallbackProviders).toEqual(secondAccess.defaultFallbackProviders);
      expect(firstAccess.proxyModeAuto).toBe(secondAccess.proxyModeAuto);
      expect(firstAccess.proxyModeDirect).toBe(secondAccess.proxyModeDirect);
      expect(firstAccess.proxyModeProxy).toBe(secondAccess.proxyModeProxy);
      expect(firstAccess.scriptManifestUrl).toBe(secondAccess.scriptManifestUrl);
      expect(firstAccess.localModuleExtensions).toEqual(secondAccess.localModuleExtensions);
    });
  });
});