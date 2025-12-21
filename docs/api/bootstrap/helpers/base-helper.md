# Module: `bootstrap/helpers/base-helper.js`

## Overview

- **Purpose:** Abstract helper logic so derived helpers can share registry wiring.

## Globals

- `BaseHelper`

## Functions / Classes

- `_resolveHelperRegistry` — locates the helper registry namespace shared by bootstrap helpers.

## Examples

```ts
class CustomHelper extends BaseHelper {
  initialize() {
    this._registerHelper("customHelper", this);
  }
}
```

## Related docs

- [Bootstrap API README](../README.md)
