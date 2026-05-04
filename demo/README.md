# hls-react-player — Vite demo

Interactive playground for **`hls-react-player`**: live preview, MP4/HLS/DASH presets, and an embedded code editor (CodeMirror). The demo installs **`hls-react-player`** from **npm** (the `0.5.x` line; see [`package.json`](package.json) for the semver range), the same as [StreamFlix](../netflix-streaming-platform/README.md).

## Related: StreamFlix (full app)

[StreamFlix](../netflix-streaming-platform/) (`netflix-streaming-platform/`) is the Next.js sample that uses the same **`hls-react-player`** npm dependency for playback with a MongoDB catalog and CMS. See its README for `.env`, MongoDB, and `npm run seed:mx`.

| Project | Role |
| -------- | ---- |
| This demo (`demo/`) | Standalone Vite UI to try the player and props quickly |
| [StreamFlix](../netflix-streaming-platform/) | End-to-end streaming UI + APIs consuming the same package |

## Setup

From the package root (`hls-react-player/`):

```bash
npm run demo:install
npm run demo:dev
```

Or from `demo/`:

```bash
npm install
npm run dev
```

The dev server URL is printed by Vite (typically [http://localhost:5173](http://localhost:5173)).

## Build

From `hls-react-player/`:

```bash
npm run demo:build
```

Or from `demo/`:

```bash
npm run build
```

Output goes to `demo/dist/`. Use `npm run preview` in `demo/` to serve the production build locally.
