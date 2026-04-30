# hls-react-player

Reusable React video player component extracted from the StreamFlix app. Supports **MP4**, **HLS (m3u8)**, and **DASH (mpd)** streams with a modern UI and customizable controls.

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
npm install hls-react-player
```

---

## 🔗 Dependencies

No extra installs are required. `hls-react-player` bundles everything it needs, including React runtime, icons, and stream engines.

---

## 🚀 Usage

```tsx
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

---

## 🌐 Plain HTML + JavaScript Usage

You can use this package without React components by registering a custom element:

```js
import { registerStreamPlayerElement } from "hls-react-player";

registerStreamPlayerElement(); // registers <stream-player>
```

```html
<stream-player
  title="Demo Stream"
  stream-url="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
  stream-type="hls"
  poster-src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80"
></stream-player>
```

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
| `posterSrc`     | `string`                  | `undefined`  | Poster image                                     |
| `onNext`        | `() => void`              | `undefined`  | Triggered when "Next" button is clicked          |
| `embed`         | `boolean`                 | `false`      | Enables embed mode (minimal UI wrapper)          |
| `className`     | `string`                  | `undefined`  | Custom root class                                |
| `style`         | `React.CSSProperties`     | `undefined`  | Inline styles for root                           |
| `showLogo`      | `boolean`                 | `true`       | Show or hide the branding pill                   |
| `customLogo`    | `ReactNode`               | `undefined`  | Render custom logo/content inside branding pill  |
| `classNames`    | `StreamPlayerClassNames`  | `{}`         | Replace internal className slots                 |
| `customStyling` | `StreamPlayerCustomStyling` | `{}`       | Inline style overrides for internal UI sections  |

---

## 🎨 Custom Styling

Override internal UI parts without writing external CSS:

Built-in default player CSS is injected automatically by the package. You do not need to import any stylesheet manually for the default UI.

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

## 🛠 Development

```bash
npm install
npm run build
```

---
