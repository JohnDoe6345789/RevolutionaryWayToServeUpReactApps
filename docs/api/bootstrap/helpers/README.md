# bootstrap/helpers

This directory surfaces shared helper namespaces that bootstrap merges on `__rwtraBootstrap.helpers` for network, logging, CDN, and local tools.

## Documents

- [`base-helper.md`](base-helper.md) – Documents the base helper functions that every namespace extends.
- [`helper-registry-instance.md`](helper-registry-instance.md) – Shows how the helper registry instance is created and populated.
- [`helper-registry.md`](helper-registry.md) – Explains the API for registering and retrieving helper namespaces inside bootstrap.
- [`local-helpers.md`](local-helpers.md) – Shows how the registry receives the renderer and require builder helpers that power the local loader.
