# Global & Function Surface

This document lists every detected global symbol and exported helper so the docs explicitly reference each name measured by the coverage tool.

## bootstrap.d.ts
### Functions
- `bootstrap.d.ts:RequireFn`
- `bootstrap.d.ts:bootstrap`
- `bootstrap.d.ts:collectDynamicModuleImports`
- `bootstrap.d.ts:collectModuleSpecifiers`
- `bootstrap.d.ts:compileSCSS`
- `bootstrap.d.ts:compileTSX`
- `bootstrap.d.ts:createRequire`
- `bootstrap.d.ts:frameworkRender`
- `bootstrap.d.ts:injectCSS`
- `bootstrap.d.ts:loadConfig`
- `bootstrap.d.ts:loadDynamicModule`
- `bootstrap.d.ts:loadModules`
- `bootstrap.d.ts:loadScript`
- `bootstrap.d.ts:loadTools`
- `bootstrap.d.ts:normalizeProviderBase`
- `bootstrap.d.ts:preloadDynamicModulesFromSource`
- `bootstrap.d.ts:preloadModulesFromSource`
- `bootstrap.d.ts:probeUrl`
- `bootstrap.d.ts:resolveModuleUrl`

## bootstrap.js
### Globals
- `bootstrap.js:BootstrapApp`
- `bootstrap.js:app`
- `bootstrap.js:bootstrapExports`

## bootstrap/base-bootstrap-app.js
### Globals
- `bootstrap/base-bootstrap-app.js:GlobalRootHandler`

## bootstrap/bootstrap-app.js
### Globals
- `bootstrap/bootstrap-app.js:BaseBootstrapApp`
- `bootstrap/bootstrap-app.js:Bootstrapper`
- `bootstrap/bootstrap-app.js:BootstrapperConfig`
- `bootstrap/bootstrap-app.js:LoggingManager`
- `bootstrap/bootstrap-app.js:LoggingManagerConfig`
### Functions
- `bootstrap/bootstrap-app.js:bootstrap`

## bootstrap/cdn/dynamic-modules.js
### Globals
- `bootstrap/cdn/dynamic-modules.js:BaseEntryPoint`
- `bootstrap/cdn/dynamic-modules.js:DynamicModulesConfig`
- `bootstrap/cdn/dynamic-modules.js:DynamicModulesService`
- `bootstrap/cdn/dynamic-modules.js:dynamicModulesService`
- `bootstrap/cdn/dynamic-modules.js:entrypoint`
### Functions
- `bootstrap/cdn/dynamic-modules.js:configFactory`

## bootstrap/cdn/import-map-init.js
### Globals
- `bootstrap/cdn/import-map-init.js:BaseEntryPoint`
- `bootstrap/cdn/import-map-init.js:ImportMapInitConfig`
- `bootstrap/cdn/import-map-init.js:ImportMapInitializer`
- `bootstrap/cdn/import-map-init.js:entrypoint`

## bootstrap/cdn/logging.js
### Globals
- `bootstrap/cdn/logging.js:BaseEntryPoint`
- `bootstrap/cdn/logging.js:LoggingService`
- `bootstrap/cdn/logging.js:LoggingServiceConfig`
- `bootstrap/cdn/logging.js:entrypoint`
- `bootstrap/cdn/logging.js:loggingService`
### Functions
- `bootstrap/cdn/logging.js:configFactory`

## bootstrap/cdn/network-entrypoint.js
### Globals
- `bootstrap/cdn/network-entrypoint.js:BaseEntryPoint`
- `bootstrap/cdn/network-entrypoint.js:NetworkService`
- `bootstrap/cdn/network-entrypoint.js:NetworkServiceConfig`
### Functions
- `bootstrap/cdn/network-entrypoint.js:configFactory`

## bootstrap/cdn/network.js
### Globals
- `bootstrap/cdn/network.js:NetworkEntryPoint`
- `bootstrap/cdn/network.js:entrypoint`

## bootstrap/cdn/source-utils.js
### Globals
- `bootstrap/cdn/source-utils.js:BaseEntryPoint`
- `bootstrap/cdn/source-utils.js:SourceUtilsConfig`
- `bootstrap/cdn/source-utils.js:SourceUtilsService`
- `bootstrap/cdn/source-utils.js:entrypoint`
- `bootstrap/cdn/source-utils.js:sourceUtilsService`
### Functions
- `bootstrap/cdn/source-utils.js:configFactory`

## bootstrap/cdn/tools.js
### Globals
- `bootstrap/cdn/tools.js:BaseEntryPoint`
- `bootstrap/cdn/tools.js:ToolsLoaderConfig`
- `bootstrap/cdn/tools.js:ToolsLoaderService`
- `bootstrap/cdn/tools.js:entrypoint`
- `bootstrap/cdn/tools.js:toolsLoaderService`
### Functions
- `bootstrap/cdn/tools.js:configFactory`

## bootstrap/configs/core/bootstrapper.js

## bootstrap/configs/cdn/dynamic-modules.js

## bootstrap/configs/core/env.js

## bootstrap/configs/cdn/import-map-init.js

## bootstrap/configs/local/local-dependency-loader.js

## bootstrap/configs/local/local-loader.js

## bootstrap/configs/local/local-module-loader.js

## bootstrap/configs/local/local-paths.js

## bootstrap/configs/local/local-require-builder.js

## bootstrap/configs/core/logging-manager.js

## bootstrap/configs/cdn/logging-service.js

## bootstrap/configs/core/module-loader.js

## bootstrap/configs/cdn/network-service.js

## bootstrap/configs/cdn/network-module-resolver.js
### Globals
- `bootstrap/configs/cdn/network-module-resolver.js:NetworkModuleResolverConfig`

## bootstrap/configs/cdn/network-probe-service.js
### Globals
- `bootstrap/configs/cdn/network-probe-service.js:NetworkProbeServiceConfig`

## bootstrap/configs/cdn/network-provider-service.js
### Globals
- `bootstrap/configs/cdn/network-provider-service.js:NetworkProviderServiceConfig`

## bootstrap/configs/local/sass-compiler.js

## bootstrap/configs/core/script-list-loader.js
### Globals
- `bootstrap/configs/core/script-list-loader.js:GlobalRootHandler`

## bootstrap/configs/cdn/source-utils.js

## bootstrap/configs/cdn/tools.js

## bootstrap/configs/local/tsx-compiler.js

## bootstrap/configs/helpers/local-helpers.js
### Globals
- `bootstrap/configs/helpers/local-helpers.js:LocalHelpersConfig`

## bootstrap/constants/ci-log-query-param.js

## bootstrap/constants/client-log-endpoint.js

## bootstrap/constants/common.js
### Globals
- `bootstrap/constants/common.js:ciLogQueryParam`
- `bootstrap/constants/common.js:clientLogEndpoint`
- `bootstrap/constants/common.js:defaultFallbackProviders`
- `bootstrap/constants/common.js:getDefaultProviderAliases`
- `bootstrap/constants/common.js:localModuleExtensions`
- `bootstrap/constants/common.js:proxyModeAuto`
- `bootstrap/constants/common.js:proxyModeDirect`
- `bootstrap/constants/common.js:proxyModeProxy`
- `bootstrap/constants/common.js:scriptManifestUrl`

## bootstrap/constants/default-fallback-providers.js

## bootstrap/constants/default-provider-aliases.js
### Functions
- `bootstrap/constants/default-provider-aliases.js:exports`
- `bootstrap/constants/default-provider-aliases.js:getDefaultProviderAliases`

## bootstrap/constants/global-root-handler.js

## bootstrap/constants/local-module-extensions.js

## bootstrap/constants/proxy-mode-auto.js

## bootstrap/constants/proxy-mode-direct.js

## bootstrap/constants/proxy-mode-proxy.js

## bootstrap/constants/script-manifest-url.js

## bootstrap/controllers/base-controller.js

## bootstrap/controllers/bootstrapper.js
### Globals
- `bootstrap/controllers/bootstrapper.js:BaseController`
- `bootstrap/controllers/bootstrapper.js:BootstrapperConfig`
- `bootstrap/controllers/bootstrapper.js:GlobalRootHandler`
- `bootstrap/controllers/bootstrapper.js:hasDocument`
- `bootstrap/controllers/bootstrapper.js:hasWindow`
- `bootstrap/controllers/bootstrapper.js:rootHandler`

## bootstrap/entrypoints/base-entrypoint.js
### Globals
- `bootstrap/entrypoints/base-entrypoint.js:GlobalRootHandler`
- `bootstrap/entrypoints/base-entrypoint.js:serviceRegistry`
### Functions
- `bootstrap/entrypoints/base-entrypoint.js:configFactory`

## bootstrap/entrypoints/env.js
### Globals
- `bootstrap/entrypoints/env.js:BaseEntryPoint`
- `bootstrap/entrypoints/env.js:EnvInitializer`
- `bootstrap/entrypoints/env.js:EnvInitializerConfig`
- `bootstrap/entrypoints/env.js:entrypoint`
### Functions
- `bootstrap/entrypoints/env.js:configFactory`

## bootstrap/entrypoints/module-loader.js
### Globals
- `bootstrap/entrypoints/module-loader.js:BaseEntryPoint`
- `bootstrap/entrypoints/module-loader.js:ModuleLoaderAggregator`
- `bootstrap/entrypoints/module-loader.js:ModuleLoaderConfig`
- `bootstrap/entrypoints/module-loader.js:entrypoint`
- `bootstrap/entrypoints/module-loader.js:moduleLoader`
### Functions
- `bootstrap/entrypoints/module-loader.js:configFactory`

## bootstrap/entrypoints/script-list-loader.js
### Globals
- `bootstrap/entrypoints/script-list-loader.js:ScriptListLoader`
- `bootstrap/entrypoints/script-list-loader.js:scriptListLoader`

## bootstrap/entrypoints/script-list.html

## bootstrap/helpers/base-helper.js

## bootstrap/helpers/helper-registry-instance.js
### Globals
- `bootstrap/helpers/helper-registry-instance.js:HelperRegistry`
- `bootstrap/helpers/helper-registry-instance.js:helperRegistry`

## bootstrap/helpers/helper-registry.js

## bootstrap/helpers/local-helpers.js
### Globals
- `bootstrap/helpers/local-helpers.js:HelperBase`
- `bootstrap/helpers/local-helpers.js:LocalHelpersConfig`
### Functions
- `bootstrap/helpers/local-helpers.js:LocalHelpers`

## bootstrap/initializers/compilers/sass-compiler.js
### Globals
- `bootstrap/initializers/compilers/sass-compiler.js:BaseEntryPoint`
- `bootstrap/initializers/compilers/sass-compiler.js:SassCompilerConfig`
- `bootstrap/initializers/compilers/sass-compiler.js:SassCompilerService`
- `bootstrap/initializers/compilers/sass-compiler.js:entrypoint`
- `bootstrap/initializers/compilers/sass-compiler.js:sassCompilerService`
### Functions
- `bootstrap/initializers/compilers/sass-compiler.js:configFactory`

## bootstrap/initializers/compilers/tsx-compiler.js
### Globals
- `bootstrap/initializers/compilers/tsx-compiler.js:BaseEntryPoint`
- `bootstrap/initializers/compilers/tsx-compiler.js:TsxCompilerConfig`
- `bootstrap/initializers/compilers/tsx-compiler.js:TsxCompilerService`
- `bootstrap/initializers/compilers/tsx-compiler.js:entrypoint`
- `bootstrap/initializers/compilers/tsx-compiler.js:tsxCompilerService`
### Functions
- `bootstrap/initializers/compilers/tsx-compiler.js:configFactory`

## bootstrap/initializers/loaders/local-loader.js
### Globals
- `bootstrap/initializers/loaders/local-loader.js:BaseEntryPoint`
- `bootstrap/initializers/loaders/local-loader.js:LocalLoaderConfig`
- `bootstrap/initializers/loaders/local-loader.js:LocalLoaderService`
- `bootstrap/initializers/loaders/local-loader.js:entrypoint`
- `bootstrap/initializers/loaders/local-loader.js:localLoaderService`
### Functions
- `bootstrap/initializers/loaders/local-loader.js:configFactory`

## bootstrap/initializers/loaders/local-module-loader.js
### Globals
- `bootstrap/initializers/loaders/local-module-loader.js:BaseEntryPoint`
- `bootstrap/initializers/loaders/local-module-loader.js:LocalModuleLoaderConfig`
- `bootstrap/initializers/loaders/local-module-loader.js:LocalModuleLoaderService`
- `bootstrap/initializers/loaders/local-module-loader.js:entrypoint`
- `bootstrap/initializers/loaders/local-module-loader.js:localModuleLoaderService`
### Functions
- `bootstrap/initializers/loaders/local-module-loader.js:configFactory`

## bootstrap/initializers/path-utils/local-paths.js
### Globals
- `bootstrap/initializers/path-utils/local-paths.js:BaseEntryPoint`
- `bootstrap/initializers/path-utils/local-paths.js:LocalPathsConfig`
- `bootstrap/initializers/path-utils/local-paths.js:LocalPathsService`
- `bootstrap/initializers/path-utils/local-paths.js:entrypoint`
- `bootstrap/initializers/path-utils/local-paths.js:localPathsService`
### Functions
- `bootstrap/initializers/path-utils/local-paths.js:configFactory`

## bootstrap/services/base-service.js

## bootstrap/services/cdn/dynamic-modules-service.js
### Globals
- `bootstrap/services/cdn/dynamic-modules-service.js:BaseService`
- `bootstrap/services/cdn/dynamic-modules-service.js:DynamicModuleFetcher`
- `bootstrap/services/cdn/dynamic-modules-service.js:DynamicModuleFetcherConfig`
- `bootstrap/services/cdn/dynamic-modules-service.js:DynamicModulesConfig`
- `bootstrap/services/cdn/dynamic-modules-service.js:ProviderResolver`
- `bootstrap/services/cdn/dynamic-modules-service.js:ProviderResolverConfig`

## bootstrap/services/cdn/dynamic-modules/module-fetcher-config.js
### Globals
- `bootstrap/services/cdn/dynamic-modules/module-fetcher-config.js:HelperRegistry`

## bootstrap/services/cdn/dynamic-modules/module-fetcher.js
### Globals
- `bootstrap/services/cdn/dynamic-modules/module-fetcher.js:BaseHelper`
- `bootstrap/services/cdn/dynamic-modules/module-fetcher.js:DynamicModuleFetcherConfig`
- `bootstrap/services/cdn/dynamic-modules/module-fetcher.js:globalScope`

## bootstrap/services/cdn/dynamic-modules/provider-resolver-config.js
### Globals
- `bootstrap/services/cdn/dynamic-modules/provider-resolver-config.js:HelperRegistry`

## bootstrap/services/cdn/dynamic-modules/provider-resolver.js
### Globals
- `bootstrap/services/cdn/dynamic-modules/provider-resolver.js:BaseHelper`
- `bootstrap/services/cdn/dynamic-modules/provider-resolver.js:ProviderResolverConfig`
### Functions
- `bootstrap/services/cdn/dynamic-modules/provider-resolver.js:addBase`

## bootstrap/services/cdn/import-map-init-service.js
### Globals
- `bootstrap/services/cdn/import-map-init-service.js:BaseService`
- `bootstrap/services/cdn/import-map-init-service.js:ImportMapInitConfig`
### Functions
- `bootstrap/services/cdn/import-map-init-service.js:resolveModuleUrl`
- `bootstrap/services/cdn/import-map-init-service.js:setDefaultProviderBase`
- `bootstrap/services/cdn/import-map-init-service.js:setFallbackProviders`
- `bootstrap/services/cdn/import-map-init-service.js:setProviderAliases`

## bootstrap/services/cdn/logging-service.js
### Globals
- `bootstrap/services/cdn/logging-service.js:BaseService`
- `bootstrap/services/cdn/logging-service.js:LoggingServiceConfig`

## bootstrap/services/cdn/network-service.js
### Globals
- `bootstrap/services/cdn/network-service.js:BaseService`
- `bootstrap/services/cdn/network-service.js:DEFAULT_PROVIDER_ALIASES`
- `bootstrap/services/cdn/network-service.js:NetworkServiceConfig`
- `bootstrap/services/cdn/network-service.js:globalObject`
- `bootstrap/services/cdn/network-service.js:isCommonJs`
- `bootstrap/services/cdn/network-service.js:NetworkModuleResolver`
- `bootstrap/services/cdn/network-service.js:NetworkModuleResolverConfig`
- `bootstrap/services/cdn/network-service.js:NetworkProbeService`
- `bootstrap/services/cdn/network-service.js:NetworkProbeServiceConfig`
- `bootstrap/services/cdn/network-service.js:NetworkProviderService`
- `bootstrap/services/cdn/network-service.js:NetworkProviderServiceConfig`
### Functions
- `bootstrap/services/cdn/network-service.js:addBase`
- `bootstrap/services/cdn/network-service.js:createAliasMap`
- `bootstrap/services/cdn/network-service.js:normalizeProviderBaseRawValue`
- `bootstrap/services/cdn/network-service.js:onerror`
- `bootstrap/services/cdn/network-service.js:onload`

## bootstrap/services/cdn/network/network-env.js
### Globals
- `bootstrap/services/cdn/network/network-env.js:globalObject`
- `bootstrap/services/cdn/network/network-env.js:isCommonJs`

## bootstrap/services/cdn/network/network-module-resolver.js
### Globals
- `bootstrap/services/cdn/network/network-module-resolver.js:BaseService`
- `bootstrap/services/cdn/network/network-module-resolver.js:NetworkModuleResolver`
### Functions
- `bootstrap/services/cdn/network/network-module-resolver.js:resolveModuleUrl`

## bootstrap/services/cdn/network/network-probe-service.js
### Globals
- `bootstrap/services/cdn/network/network-probe-service.js:BaseService`
- `bootstrap/services/cdn/network/network-probe-service.js:NetworkProbeService`
### Functions
- `bootstrap/services/cdn/network/network-probe-service.js:probeUrl`

## bootstrap/services/cdn/network/network-provider-service.js
### Globals
- `bootstrap/services/cdn/network/network-provider-service.js:BaseService`
- `bootstrap/services/cdn/network/network-provider-service.js:NetworkProviderService`
### Functions
- `bootstrap/services/cdn/network/network-provider-service.js:collectBases`
- `bootstrap/services/cdn/network/network-provider-service.js:normalizeProviderBase`
- `bootstrap/services/cdn/network/network-provider-service.js:resolveProvider`

## bootstrap/services/cdn/network/provider-utils.js
### Globals
- `bootstrap/services/cdn/network/provider-utils.js:createAliasMap`
- `bootstrap/services/cdn/network/provider-utils.js:normalizeProviderBaseRawValue`

## bootstrap/services/cdn/source-utils-service.js
### Globals
- `bootstrap/services/cdn/source-utils-service.js:BaseService`
- `bootstrap/services/cdn/source-utils-service.js:SourceUtilsConfig`
### Functions
- `bootstrap/services/cdn/source-utils-service.js:maybeAdd`

## bootstrap/services/cdn/tools-service.js
### Globals
- `bootstrap/services/cdn/tools-service.js:BaseService`
- `bootstrap/services/cdn/tools-service.js:ToolsLoaderConfig`

## bootstrap/services/core/env-service.js
### Globals
- `bootstrap/services/core/env-service.js:BaseService`
- `bootstrap/services/core/env-service.js:EnvInitializerConfig`

## bootstrap/services/core/logging-manager.js
### Globals
- `bootstrap/services/core/logging-manager.js:BaseService`
- `bootstrap/services/core/logging-manager.js:LoggingManagerConfig`
- `bootstrap/services/core/logging-manager.js:hasWindow`

## bootstrap/services/core/module-loader-environment.js

## bootstrap/services/core/module-loader-service.js
### Globals
- `bootstrap/services/core/module-loader-service.js:BaseService`
- `bootstrap/services/core/module-loader-service.js:ModuleLoaderConfig`
- `bootstrap/services/core/module-loader-service.js:ModuleLoaderEnvironment`

## bootstrap/services/core/script-list-loader-service.js
### Globals
- `bootstrap/services/core/script-list-loader-service.js:BaseService`
- `bootstrap/services/core/script-list-loader-service.js:GlobalRootHandler`
- `bootstrap/services/core/script-list-loader-service.js:ScriptListLoaderConfig`
### Functions
- `bootstrap/services/core/script-list-loader-service.js:onerror`
- `bootstrap/services/core/script-list-loader-service.js:onload`

## bootstrap/services/local/framework-renderer.js
### Globals
- `bootstrap/services/local/framework-renderer.js:BaseService`

## bootstrap/services/local/local-dependency-loader.js
### Globals
- `bootstrap/services/local/local-dependency-loader.js:BaseService`
- `bootstrap/services/local/local-dependency-loader.js:LocalDependencyLoaderConfig`

## bootstrap/services/local/local-loader-service.js
### Globals
- `bootstrap/services/local/local-loader-service.js:BaseService`
- `bootstrap/services/local/local-loader-service.js:LocalDependencyLoaderConfig`
- `bootstrap/services/local/local-loader-service.js:LocalLoaderConfig`
- `bootstrap/services/local/local-loader-service.js:LocalHelpers`

## bootstrap/services/local/local-module-loader-service.js
### Globals
- `bootstrap/services/local/local-module-loader-service.js:BaseService`
- `bootstrap/services/local/local-module-loader-service.js:LocalModuleLoaderConfig`
### Functions
- `bootstrap/services/local/local-module-loader-service.js:loadPromise`

## bootstrap/services/local/local-paths-service.js
### Globals
- `bootstrap/services/local/local-paths-service.js:BaseService`
- `bootstrap/services/local/local-paths-service.js:LocalPathsConfig`
### Functions
- `bootstrap/services/local/local-paths-service.js:add`

## bootstrap/services/local/local-require-builder.js
### Globals
- `bootstrap/services/local/local-require-builder.js:BaseHelper`
- `bootstrap/services/local/local-require-builder.js:LocalRequireBuilderConfig`

## bootstrap/services/local/sass-compiler-service.js
### Globals
- `bootstrap/services/local/sass-compiler-service.js:BaseService`
- `bootstrap/services/local/sass-compiler-service.js:SassCompilerConfig`

## bootstrap/services/local/tsx-compiler-service.js
### Globals
- `bootstrap/services/local/tsx-compiler-service.js:BaseService`
- `bootstrap/services/local/tsx-compiler-service.js:TsxCompilerConfig`

## bootstrap/services/service-registry-instance.js
### Globals
- `bootstrap/services/service-registry-instance.js:ServiceRegistry`

## bootstrap/services/service-registry.js

## index.html

## server/server.js
### Globals
- `server/server.js:app`
- `server/server.js:clientLogPath`
- `server/server.js:config`
- `server/server.js:envScriptPath`
- `server/server.js:esmProxy`
- `server/server.js:esmTarget`
- `server/server.js:express`
- `server/server.js:fs`
- `server/server.js:host`
- `server/server.js:http`
- `server/server.js:logPath`
- `server/server.js:logStream`
- `server/server.js:maxLogBodyLength`
- `server/server.js:parsedPort`
- `server/server.js:path`
- `server/server.js:port`
- `server/server.js:proxyMode`
- `server/server.js:proxyPath`
- `server/server.js:proxyRewrite`
- `server/server.js:proxyTarget`
- `server/server.js:rawPort`
- `server/server.js:rootDir`
- `server/server.js:server`
### Functions
- `server/server.js:assertConfigValue`
- `server/server.js:formatBody`
- `server/server.js:logLine`
- `server/server.js:normalizeProxyMode`
- `server/server.js:shouldProxyEsm`

## src/App.tsx
### Functions
- `src/App.tsx:App`

## src/components/FeaturedGames.tsx
### Functions
- `src/components/FeaturedGames.tsx:FeaturedGames`

## src/components/FooterStrip.tsx
### Functions
- `src/components/FooterStrip.tsx:FooterStrip`

## src/components/HeroSection.tsx
### Functions
- `src/components/HeroSection.tsx:HeroSection`

## src/data.ts

## src/theme.ts
### Globals
- `src/theme.ts:theme`
