# Module: `index.html`

## Overview

- **Purpose:** Anchors the single-page experience by bootstrapping `bootstrap.js`, loading client assets, and mounting the top-level shell/UI that the loader populates.
- **Loading order:** It pulls in `bootstrap/script-list-loader.js` (which in turn reads `bootstrap/script-list.html`), then finally `bootstrap.js` to launch the React components.

## Navigation

- [`docs/api/bootstrap/README.md`](bootstrap/README.md) — how the loader is wired up from `<script>` tags.

