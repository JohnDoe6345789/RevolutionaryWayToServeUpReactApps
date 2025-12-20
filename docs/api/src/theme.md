# Module: `src/theme.ts`

## Overview

- **Purpose:** Define the Material UI theme used across the RetroDeck UI so typography, colors, and shapes stay in sync regardless of the screen density or layout.
- **Entry point:** Import the default export (`theme`) into your React tree and pass it to `ThemeProvider` along with `CssBaseline`.

## Globals

- _None:_ exports a single default theme object.

## Functions / Classes

- _None:_ the module simply calls `createTheme` and exports the result.

## Theme highlights

- `palette` uses a dark mode base with neon pink (`#ff6ec7`) as primary, cyan (`#00e5ff`) as secondary, and deep charcoal backgrounds for canvas/paper.
- `typography` prioritizes `"Press Start 2P"` for retro flair, falls back to system UI stacks, tightens `h2` letter spacing, and disables uppercase text transformation on buttons.
- `shape.borderRadius` is set to `10` to keep cards and buttons pill-shaped.

## Examples

```ts
import theme from "./theme";
import { ThemeProvider } from "@mui/material";

<ThemeProvider theme={theme}>
  <App />
</ThemeProvider>;
```

## Related docs

- `docs/api/src/app.md` shows how the app wraps the hero and featured sections inside this theme.

## Navigation

- [Source modules README](README.md)
