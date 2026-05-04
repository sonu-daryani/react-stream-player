# hls-react-player

Reusable React video player (MP4, HLS, DASH) with a StreamFlix-style control layer.

**Package name on npm:** `hls-react-player` (publish from this directory with `npm publish` after `npm run build`). Until it is published, use an npm workspace or `npm link` instead of committing `.tgz` files.

---

## ✨ Features

* 🎬 MP4, HLS, and DASH support
* ⚡ Auto-detect streaming engine (`hls.js`, `dashjs`, native)
* 🎛 Custom controls (play, seek, volume, fullscreen)
* ⌨️ Keyboard shortcuts
* ⚙️ Resolution, audio, and subtitle selection (HLS)
* 🎨 Fully customizable UI via classNames
* 📦 Lightweight and reusable
* 🔌 Embed mode support

---

## 📦 Install

```bash
npm install hls-react-player react react-dom
```

**Peer dependencies:** `react` and `react-dom` **18+** (your app supplies them; the package does not ship a separate React runtime).

**Bundled inside the package:** `hls.js`, `dashjs`, and `lucide-react` (icons). You do **not** install those separately for normal use.

**Styles:** import the stylesheet once (root layout or app entry):

```ts
import "hls-react-player/styles.css";
```

---

## 🔗 Vite demo (this repo)

From the repository root:

```bash
npm run demo:install
npm run demo:dev
```

The demo under `demo/` resolves the parent package via `file:..` in `demo/package.json` so you can run it before publishing. See [`demo/README.md`](demo/README.md).

---

## 🚀 Usage

```tsx
import "hls-react-player/styles.css";
import { StreamPlayer } from "hls-react-player";
import type { StreamType } from "hls-react-player";

const streamType: StreamType = "hls";

export default function App() {
  return (
    <StreamPlayer
      title="Demo Stream"
      streamUrl="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
      streamType={streamType}
      posterSrc="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80"
    />
  );
}
```

Optional: pass **`seekThumbnail`** with an absolute WebVTT URL (sprite `#xywh=` cues) to enable scrub-bar thumbnail previews.

---

## 🌐 Plain HTML + JavaScript Usage

You can use this package without React components by registering a custom element. Import the stylesheet once (same as React usage):

```js
import "hls-react-player/styles.css";
import { registerStreamPlayerElement } from "hls-react-player";

registerStreamPlayerElement(); // registers <stream-player>
```

```html
<stream-player
  title="Demo Stream"
  stream-url="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
  stream-type="hls"
  poster-src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80"
  seek-thumbnail="https://example.com/storyboard.vtt"
></stream-player>
```

(`seek-thumbnail` is optional; use a WebVTT URL whose cues reference a sprite sheet, same as the React `seekThumbnail` prop.)

Listen to next episode clicks:

```js
const player = document.querySelector("stream-player");
player?.addEventListener("next", () => {
  console.log("Next clicked");
});
```

---

## 🎥 StreamType Examples

### MP4

```tsx
<StreamPlayer
  title="MP4 Example"
  streamUrl="https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  streamType="mp4"
  posterSrc="https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg"
/>
```

### HLS (m3u8)

```tsx
<StreamPlayer
  title="HLS Example"
  streamUrl="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
  streamType="hls"
  posterSrc="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80"
/>
```

### DASH (MPD)

```tsx
<StreamPlayer
  title="MPD Example"
  streamUrl="https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd"
  streamType="mpd"
  posterSrc="https://images.unsplash.com/photo-1517602302552-471fe67acf66?auto=format&fit=crop&w=900&q=80"
/>
```

---

## ⚙️ Props

### `<StreamPlayer />`

| Prop Name       | Type                      | Default      | Description                                      |
| --------------- | ------------------------- | ------------ | ------------------------------------------------ |
| `title`         | `string`                  | **required** | Title displayed at the top of the player         |
| `streamUrl`     | `string`                  | **required** | Video/stream source URL                          |
| `streamType`    | `"mp4" \| "hls" \| "mpd"` | **required** | Streaming format                                 |
| `posterSrc`     | `string`                  | **required** | Poster image                                     |
| `seekThumbnail` | `string` or `SeekThumbnailGridSheet[]` | — | Hover scrub: `.vtt` URL, or a small array of sprite sheets (see `SeekThumbnailGridSheet` export). |
| `previewStoryboardVttUrl` | `string` | — | Old name for the vtt-only case; use `seekThumbnail` string instead. |
| `onNext`        | `() => void`              | `undefined`  | Triggered when "Next" button is clicked          |
| `embed`         | `boolean`                 | `false`      | Enables embed mode (minimal UI wrapper)          |
| `className`     | `string`                  | `undefined`  | Custom root class                                |
| `style`         | `React.CSSProperties`     | `undefined`  | Inline styles for root                           |
| `showLogo`      | `boolean`                 | `false`      | When `true` **and** `customLogo` is set, shows branding in the **top-right** (never in the bottom bar) |
| `customLogo`    | `ReactNode`               | `undefined`  | Logo / mark rendered in the top-right pill when `showLogo` is `true` |
| `classNames`    | `StreamPlayerClassNames`  | `{}`         | Replace internal className slots                 |
| `customStyling` | `StreamPlayerCustomStyling` | `{}`       | Inline style overrides for internal UI sections  |

---

## 🎨 Custom Styling

Override internal UI parts without writing external CSS:

Import the bundled stylesheet once in your app (for example in your root layout or entry file):

```ts
import "hls-react-player/styles.css";
```

```tsx
<StreamPlayer
  title="Styled Player"
  streamUrl="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
  streamType="hls"
  style={{ maxWidth: 900, borderRadius: 24 }}
  customStyling={{
    bottomOverlay: { padding: 20 },
    logoPill: { letterSpacing: 0.5 },
    timePill: { fontSize: 14 },
  }}
/>
```

### Branding Control

```tsx
<StreamPlayer
  title="No Branding"
  streamUrl="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
  streamType="hls"
  showLogo={false}
/>

<StreamPlayer
  title="Custom Branding"
  streamUrl="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
  streamType="hls"
  showLogo
  customLogo={<span>MyOTT</span>}
/>
```

### `StreamPlayerClassNames`

| Key             | Description         |
| --------------- | ------------------- |
| `root`          | Outer wrapper       |
| `frame`         | Player container    |
| `video`         | Video element       |
| `topOverlay`    | Top overlay         |
| `bottomOverlay` | Bottom controls     |
| `leftControls`  | Left control group  |
| `rightControls` | Right control group |
| `logoPill`      | Branding pill       |
| `timePill`      | Time display        |

---

## 🧩 Embed Mode

Use for iframe/widget embedding:

```tsx
<StreamPlayer
  title="Embedded Stream"
  streamUrl="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
  streamType="hls"
  embed
/>
```

---

## ⌨️ Keyboard Shortcuts

| Key         | Action       |
| ----------- | ------------ |
| `Space / K` | Play / Pause |
| `← / J`     | Seek -10s    |
| `→ / L`     | Seek +10s    |
| `↑`         | Volume +     |
| `↓`         | Volume -     |
| `M`         | Mute toggle  |
| `F`         | Fullscreen   |
| `Home`      | Go to start  |
| `End`       | Go to end    |

---

## ⚠️ Notes

* HLS uses **hls.js** when supported
* DASH uses **dashjs**
* Falls back to native HTML5 video for MP4
* Autoplay behavior depends on browser policies

---

## 🛠 Development & publishing (maintainers)

Clone this repo to change the player source; end users normally only install from npm.

```bash
npm install
npm run build   # outputs to dist/ (published via package.json "files")
```

**Release checklist**

1. Bump `"version"` in [`package.json`](package.json).
2. `npm run build`
3. `npm publish` (npm login required; package name `hls-react-player`).

After publish, apps upgrade with `npm install hls-react-player@latest`.

---

## Maintainer & related projects

- **GitHub:** [@sonu-daryani](https://github.com/sonu-daryani)
- **npm:** `hls-react-player` (publish when ready; link appears on npmjs after the first release)
- **StreamFlix (sample app):** [`../netflix-streaming-platform/README.md`](../netflix-streaming-platform/README.md) — Next.js + MongoDB, consumes this package from the registry, optional MX-style catalog seed (`npm run seed:mx`) and legal notes in that README.

---
