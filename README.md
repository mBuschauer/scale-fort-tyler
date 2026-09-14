# Fort Tyler Scale

The code was almost entirely written by Claude, though checked briefly by me. If I had more than a day for this project, I would've written it by hand.

A browser puzzle built around a two-pan balance. Players type codes to unlock items, drag them onto the pans, and read the tilt of the beam. Masses are never shown, so the only way to compare items is to weigh them against each other. Two collections must never share the scale: if they do, the scale blows its load clear. 

## Playing

- Press **Unlock** and enter a code. Each code works once and drops one item into the scene.
- Drag items with the mouse or a finger. Rest them on a pan to weigh them.
- The panel lists everything that has been unlocked. Hover or tap a row to find the item on the canvas. Removing an item relocks its code.
- When both pans carry the same weight and the beam settles level, a celebration names what is on each side.
- Unlocks are remembered in the browser between visits.

## Development

Requires [Bun](https://bun.sh). With Nix, `nix-shell` provides it.

```sh
bun install
bun run dev
```

| Script              | What it does                                 |
| ------------------- | -------------------------------------------- |
| `bun run dev`       | Start the dev server with hot reload         |
| `bun run build`     | Type-check and write a production build      |
| `bun run preview`   | Serve the production build locally           |
| `bun run lint`      | Run ESLint                                   |
| `bun run typecheck` | Run the TypeScript compiler without emitting |
| `bun run check`     | Lint and build; what CI runs                 |

## Project layout

```
src/
  main.tsx            React entry point
  App.tsx             Spawn queue, live weights, hover state, persistence
  index.css           Tailwind import and page colours
  components/
    Scale.tsx         Canvas, physics loop, and world membership
    Panel.tsx         Inventory list and the Unlock action
    Modal.tsx         Code entry dialog
    CloseIcon.tsx     Shared close glyph
  scale/
    constants.ts      World size, tunings, and canvas colours
    catalog.ts        Items, their codes, and the volatile pair
    bodies.ts         Arena and weight body construction
    contacts.ts       Overlap resolution and arena clamping
    carry.ts          Seating weights on pans and loading the beam
    explosion.ts      Volatile pair detection and the blast
    overlay.ts        Pivot, hover ring, labels, and blast drawing
    storage.ts        localStorage persistence of unlocked codes
```

## Editing the catalog

Items live in `src/scale/catalog.ts`. Each key is an unlock code, matched trimmed and case-insensitively, and each value gives the item's name, collection, mass, colour, and size in world pixels. Keep `size` below `PLATE_WIDTH` in `constants.ts` so two items still fit on one pan. `VOLATILE_PAIR` names the two collections that set each other off; both names must match a `collection` value exactly.

Codes ship inside the client bundle, so anyone who reads the source can find them. That is by design for this puzzle.

## Deployment

`bun run build` writes a static site to `dist/`. Serve that directory from any static host. If the site will live under a sub-path rather than a domain root, set `base` in `vite.config.ts` before building.
