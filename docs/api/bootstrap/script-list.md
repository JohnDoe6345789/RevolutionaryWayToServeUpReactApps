# Module: `bootstrap/script-list.html`

## Overview

- **Purpose:** Declares the ordered list of helper scripts that the loader can fetch before `bootstrap.js` executes, ensuring each optional feature registers in the expected order.
- **Consumers:** The `script-list-loader.js` module loads this file and injects each `<script>` entry so the runtime is ready for CDN-provided shims.

## Contents

```html
<!doctype html>
<script src="bootstrap/cdn/tools.js"></script>
```

## Related docs

- [`bootstrap/script-list-loader.md`](script-list-loader.md)

