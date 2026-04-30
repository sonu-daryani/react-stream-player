# react-stream-player

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
npm install react-stream-player
```

---

## 🔗 Peer Dependencies

Make sure these are installed:

```bash
npm install react react-dom lucide-react hls.js dashjs
```

---

## 🚀 Usage

```tsx
import { CustomPlayer } from "react-stream-player";
import type { StreamType } from "react-stream-player";

const streamType: StreamType = "hls";

export default function App() {
  return (
    <CustomPlayer
      title="Demo Stream"
      streamUrl="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
      streamType={streamType}
      posterSrc="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80"
    />
  );
}
```

---

## 🎥 StreamType Examples

### MP4

```tsx
<CustomPlayer
  title="MP4 Example"
  streamUrl="https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  streamType="mp4"
  posterSrc="https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg"
/>
```

### HLS (m3u8)

```tsx
<CustomPlayer
  title="HLS Example"
  streamUrl="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
  streamType="hls"
  posterSrc="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80"
/>
```

### DASH (MPD)

```tsx
<CustomPlayer
  title="MPD Example"
  streamUrl="https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd"
  streamType="mpd"
  posterSrc="https://images.unsplash.com/photo-1517602302552-471fe67acf66?auto=format&fit=crop&w=900&q=80"
/>
```

---

## ⚙️ Props

### `<CustomPlayer />`

| Prop Name    | Type                      | Default      | Description                              |
| ------------ | ------------------------- | ------------ | ---------------------------------------- |
| `title`      | `string`                  | **required** | Title displayed at the top of the player |
| `streamUrl`  | `string`                  | **required** | Video/stream source URL                  |
| `streamType` | `"mp4" \| "hls" \| "mpd"` | **required** | Streaming format                         |
| `posterSrc`  | `string`                  | `undefined`  | Poster image                             |
| `onNext`     | `() => void`              | `undefined`  | Triggered when "Next" button is clicked  |
| `embed`      | `boolean`                 | `false`      | Enables embed mode (minimal UI wrapper)  |
| `className`  | `string`                  | `undefined`  | Custom root class                        |
| `style`      | `React.CSSProperties`     | `undefined`  | Inline styles for root                   |
| `classNames` | `CustomPlayerClassNames`  | `{}`         | Override internal UI styles              |

---

## 🎨 Custom Styling

Override internal UI parts:

```tsx
<CustomPlayer
  title="Styled Player"
  streamUrl="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
  streamType="hls"
  className="rounded-none"
  style={{ maxWidth: 900 }}
  classNames={{
    logoPill: "hidden",
    bottomOverlay: "absolute inset-x-0 bottom-0 p-3 bg-black/70",
  }}
/>
```

### `CustomPlayerClassNames`

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
<CustomPlayer
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
