# Module: `src/components/FeaturedGames.tsx`

## Overview

- **Purpose:** Renders the highlighted games carousel on the landing page and wires up autoplay, badges, and call-to-action buttons while remaining responsive.
- **Consumers:** `index.html` or other shell entrypoints import `FeaturedGames` to display curated titles once `bootstrap.js` bootstraps the React tree.

## Props

- `games` — list of game metadata objects with `title`, `image`, and `cta` fields.
- `onGameSelect` — callback whenever the user interacts with a card.

## Related docs

- [Component catalog](components.md)
