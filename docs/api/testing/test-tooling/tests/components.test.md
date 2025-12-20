# Module: `test-tooling/tests/components.test.tsx`

## Overview

- **Purpose:** Mount `HeroSection`, `FeaturedGames`, and `FooterStrip` using Jest + React Testing Library to validate component-level rendering.
- **Entry point:** Imports each component, renders them inside a theme provider, and asserts class names, text nodes, and aria labels exist.

## Assertions

- Verifies the hero gradient, CTA buttons, and system chips render correctly.
- Ensures the featured grid shows the first item from `FEATURED_GAMES` with image/genre metadata.
- Confirms footer chips like `CRT Shader` and `Netplay` appear when the data toggles are enabled.

## Navigation

- [Testing overview](../../testing/README.md)
