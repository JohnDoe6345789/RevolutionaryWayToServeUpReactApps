# Module: `bootstrap/controllers/base-controller.js`

## Overview

- **Purpose:** Provides a lightweight lifecycle guard shared by bootstrap controllers.

## Globals

- `BaseController`

## Functions / Classes

- `_ensureInitialized` — checks that controllers reach the required initialization phase before executing protected steps.

## Examples

```ts
class CustomController extends BaseController {
  initialize() {
    this._ensureNotInitialized();
    this._markInitialized();
  }
}
```

## Related docs

- [Bootstrap API README](../README.md)
