# Module: `src/App.tsx`

## Overview

- **Purpose:** Compose the RetroDeck shell by combining hero, featured games, and footer UI sections inside the global theme provider.
- **Entry point:** Render `<App />` inside the React root entrypoint (e.g., `main.tsx`) and wrap it with the Material UI `ThemeProvider` plus `CssBaseline`.

## Globals

- _None_: the file exports a single React component.

## Functions / Classes

- **`App()`** — Returns the themed layout: toolbar buttons (Settings/Sync), `HeroSection`, a divider, `FeaturedGames`, and `FooterStrip`. Buttons log their intent to the console to simulate event handling.

## Examples

```tsx
import App from "./App";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(<App />);
```

## Related docs

- [`docs/api/src/data.md`](data.md) documents the data that powers the hero/featured cards.

## Navigation

- [Source modules README](README.md)
