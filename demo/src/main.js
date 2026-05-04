import "./styles.css";
import "hls-react-player/styles.css";
import { registerStreamPlayerElement } from "hls-react-player";

const PKG_VERSION = "0.5.0";

const SNIPPETS = {
  npm: `npm install hls-react-player@${PKG_VERSION}`,
  yarn: `yarn add hls-react-player@${PKG_VERSION}`,
  pnpm: `pnpm add hls-react-player@${PKG_VERSION}`,
  styles: `import "hls-react-player/styles.css";`,
  reactApp: `import "hls-react-player/styles.css";
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
}`,
  wcJs: `import "hls-react-player/styles.css";
import { registerStreamPlayerElement } from "hls-react-player";

registerStreamPlayerElement();`,
  wcHtml: `<stream-player
  title="Demo Stream"
  stream-url="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
  stream-type="hls"
  poster-src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80"
></stream-player>`,
  wcEvents: `const player = document.querySelector("stream-player");

player?.addEventListener("next", () => {
  console.log("Next episode");
});`,
  styled: `import "hls-react-player/styles.css";
import { StreamPlayer } from "hls-react-player";

export default function Branded() {
  return (
    <StreamPlayer
      title="Styled"
      streamUrl="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
      streamType="hls"
      posterSrc="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80"
      style={{ maxWidth: 900, borderRadius: 24 }}
      customStyling={{
        bottomOverlay: { padding: 20 },
        timePill: { fontSize: 14 },
      }}
      showLogo
      customLogo={<span>MyOTT</span>}
    />
  );
}`,
};

const STREAM_DEMOS = {
  hls: {
    title: "HLS (Living manifest)",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    streamType: "hls",
    posterSrc:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80",
    hint: "Adaptive bitrate via hls.js where supported; variant + subtitle menus when the manifest exposes tracks.",
  },
  mp4: {
    title: "MP4 (Progressive)",
    streamUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    streamType: "mp4",
    posterSrc: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
    hint: "Uses native HTML5 playback with the same control chrome as streaming modes.",
  },
  mpd: {
    title: "DASH (MPD manifest)",
    streamUrl: "https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd",
    streamType: "mpd",
    posterSrc:
      "https://images.unsplash.com/photo-1517602302552-471fe67acf66?auto=format&fit=crop&w=900&q=80",
    hint: "Parsed with dashjs; quality ladders follow the MPD period and adaptation sets.",
  },
};

registerStreamPlayerElement();

document.querySelector("#app").innerHTML = `
  <div class="layout">
    <aside class="sidebar">
      <div class="brand-block">
        <p class="brand">hls-react-player</p>
        <p class="subtitle">Interactive showcase · v${PKG_VERSION}</p>
        <span class="badge">MP4 · HLS · DASH</span>
      </div>
      <nav class="menu" aria-label="Sections">
        <a href="#overview" class="active" data-target="overview">Overview</a>
        <a href="#player" data-target="player">Live player</a>
        <a href="#install" data-target="install">Install</a>
        <a href="#examples-code" data-target="examples-code">Code examples</a>
        <a href="#api" data-target="api">API</a>
        <a href="#keyboard" data-target="keyboard">Shortcuts</a>
        <a href="#faq" data-target="faq">FAQ</a>
      </nav>
      <p class="sidebar-foot">
        Bundles <strong>hls.js</strong> · <strong>dashjs</strong> · <strong>lucide-react</strong>. Use in React 18+ apps or as <code>&lt;stream-player&gt;</code>.
      </p>
    </aside>

    <main class="content">
      <header class="hero">
        <div class="hero__top">
          <h1 class="hero__title">Stream-ready React player</h1>
          <span class="pill pill--accent">Latest ${PKG_VERSION}</span>
        </div>
        <p class="hero__lead">
          One component for progressive MP4, HLS (<code>.m3u8</code>), and DASH (<code>.mpd</code>), with a StreamFlix-style
          control layer: seek, volume, fullscreen, keyboard shortcuts, captions/audio/resolution where the manifest supports them,
          optional scrub thumbnails, embed mode, and deep styling hooks.
        </p>
        <div class="hero-grid">
          <div class="chip">Auto engine: native · hls.js · dashjs</div>
          <div class="chip">Custom element for non-React apps</div>
          <div class="chip"><code>classNames</code> + <code>customStyling</code></div>
        </div>
      </header>

      <section id="overview" class="content-section active">
        <h2 class="section-title">What ships in v${PKG_VERSION}</h2>
        <p class="section-lead">
          This demo tracks the published API: install from npm, import the stylesheet once, and render <code>StreamPlayer</code>
          or register <code>&lt;stream-player&gt;</code>. The package pins proven streaming runtimes so your app does not add
          <code>hls.js</code> or <code>dashjs</code> as separate dependencies for normal use.
        </p>

        <div class="detail-grid">
          <article class="detail-card">
            <h3>Playback</h3>
            <p>Detects <strong>streamType</strong> and picks the right stack: native video for MP4, hls.js for HLS, dashjs for MPD.</p>
          </article>
          <article class="detail-card">
            <h3>Controls &amp; input</h3>
            <p>Play/pause, seek bar with hover preview when <code>seekThumbnail</code> (WebVTT sprite) is set, volume, mute, fullscreen, settings gear.</p>
          </article>
          <article class="detail-card">
            <h3>Branding</h3>
            <p>Logo appears top-right only when both <code>showLogo</code> and <code>customLogo</code> are provided—no stray marks in the bottom bar.</p>
          </article>
          <article class="detail-card">
            <h3>Integration</h3>
            <p>Built for React 18+; optional web component for vanilla or legacy pages. Import <code>hls-react-player/styles.css</code> at your app root.</p>
          </article>
        </div>

        <h3 class="subheading">Runtime versions (inside the package)</h3>
        <ul class="checklist">
          <li><code>hls.js</code> ^1.6.x — HLS MSE playback</li>
          <li><code>dashjs</code> ^5.x — MPEG-DASH</li>
          <li><code>lucide-react</code> — toolbar icons</li>
        </ul>
      </section>

      <section id="player" class="content-section">
        <h2 class="section-title">Live player</h2>
        <p class="section-lead">
          Switch formats to load different sample manifests. The same custom element updates attributes and remounts the inner React tree—try keyboard shortcuts and the settings menu.
        </p>

        <div class="stream-toolbar" role="tablist" aria-label="Stream format">
          <button type="button" class="stream-tab active" data-stream="hls" role="tab" aria-selected="true">HLS</button>
          <button type="button" class="stream-tab" data-stream="mp4" role="tab" aria-selected="false">MP4</button>
          <button type="button" class="stream-tab" data-stream="mpd" role="tab" aria-selected="false">DASH</button>
        </div>
        <p id="stream-hint" class="stream-hint">${STREAM_DEMOS.hls.hint}</p>

        <stream-player
          id="demo-player"
          title="${STREAM_DEMOS.hls.title}"
          stream-url="${STREAM_DEMOS.hls.streamUrl}"
          stream-type="${STREAM_DEMOS.hls.streamType}"
          poster-src="${STREAM_DEMOS.hls.posterSrc}"
        ></stream-player>

        <h3 class="subheading">Try these interactions</h3>
        <ul class="checklist">
          <li><code>Space</code> / <code>K</code> — play / pause</li>
          <li><code>J</code> / <code>L</code> or arrows — seek ±10s</li>
          <li><code>F</code> — fullscreen; controls auto-hide after idle</li>
          <li><code>M</code> — mute; <code>↑</code> / <code>↓</code> — volume</li>
          <li>Gear icon — captions, audio tracks, resolution when available</li>
        </ul>
      </section>

      <section id="install" class="content-section">
        <h2 class="section-title">Install</h2>
        <p class="section-lead">
          Install only <code>hls-react-player</code>—your app already supplies React when you use <code>StreamPlayer</code>. Pick a package manager and copy the command.
        </p>

        <div class="code-grid">
          <div class="code-panel">
            <div class="code-panel__toolbar">
              <span class="code-panel__label">npm</span>
              <button type="button" class="copy-btn">Copy</button>
            </div>
            <div class="code-panel__editor" data-snippet="npm" data-lang="bash"></div>
          </div>
          <div class="code-panel">
            <div class="code-panel__toolbar">
              <span class="code-panel__label">yarn</span>
              <button type="button" class="copy-btn">Copy</button>
            </div>
            <div class="code-panel__editor" data-snippet="yarn" data-lang="bash"></div>
          </div>
          <div class="code-panel">
            <div class="code-panel__toolbar">
              <span class="code-panel__label">pnpm</span>
              <button type="button" class="copy-btn">Copy</button>
            </div>
            <div class="code-panel__editor" data-snippet="pnpm" data-lang="bash"></div>
          </div>
        </div>

        <h3 class="subheading">Styles (required once)</h3>
        <div class="code-panel code-panel--wide">
          <div class="code-panel__toolbar">
            <span class="code-panel__label">Application entry or root layout</span>
            <button type="button" class="copy-btn">Copy</button>
          </div>
          <div class="code-panel__editor" data-snippet="styles" data-lang="tsx"></div>
        </div>

        <p class="muted tiny">
          Local development from this monorepo: at repo root run <code>npm run demo:install</code> then <code>npm run demo:dev</code>.
          The demo resolves <code>hls-react-player</code> via <code>file:..</code> in <code>demo/package.json</code>.
        </p>
      </section>

      <section id="examples-code" class="content-section">
        <h2 class="section-title">Code examples</h2>
        <p class="section-lead">
          Editors are read-only but fully selectable—click inside, press <code>⌘A</code> / <code>Ctrl+A</code>, or use <strong>Copy</strong>.
        </p>

        <h3 class="subheading">React — <code>StreamPlayer</code></h3>
        <div class="code-panel code-panel--tall">
          <div class="code-panel__toolbar">
            <span class="code-panel__label">App.tsx</span>
            <button type="button" class="copy-btn">Copy</button>
          </div>
          <div class="code-panel__editor" data-snippet="reactApp" data-lang="tsx"></div>
        </div>

        <h3 class="subheading">Branding &amp; inline style overrides</h3>
        <div class="code-panel code-panel--tall">
          <div class="code-panel__toolbar">
            <span class="code-panel__label">customStyling + logo</span>
            <button type="button" class="copy-btn">Copy</button>
          </div>
          <div class="code-panel__editor" data-snippet="styled" data-lang="tsx"></div>
        </div>

        <h3 class="subheading">Web component — registration</h3>
        <div class="code-panel">
          <div class="code-panel__toolbar">
            <span class="code-panel__label">main.js</span>
            <button type="button" class="copy-btn">Copy</button>
          </div>
          <div class="code-panel__editor" data-snippet="wcJs" data-lang="js"></div>
        </div>

        <h3 class="subheading">Web component — markup</h3>
        <div class="code-panel code-panel--tall">
          <div class="code-panel__toolbar">
            <span class="code-panel__label">index.html</span>
            <button type="button" class="copy-btn">Copy</button>
          </div>
          <div class="code-panel__editor" data-snippet="wcHtml" data-lang="html"></div>
        </div>

        <h3 class="subheading">Web component — Next episode event</h3>
        <div class="code-panel">
          <div class="code-panel__toolbar">
            <span class="code-panel__label">listener</span>
            <button type="button" class="copy-btn">Copy</button>
          </div>
          <div class="code-panel__editor" data-snippet="wcEvents" data-lang="js"></div>
        </div>
      </section>

      <section id="api" class="content-section">
        <h2 class="section-title">API snapshot</h2>
        <p class="section-lead">
          Full tables live in the repo README; this is the practical subset most apps touch first.
        </p>

        <div class="table-wrap">
          <table class="props-table">
            <thead>
              <tr>
                <th>Prop</th>
                <th>Web attribute</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>title</code></td>
                <td><code>title</code></td>
                <td>Shown in the top overlay.</td>
              </tr>
              <tr>
                <td><code>streamUrl</code></td>
                <td><code>stream-url</code></td>
                <td>Source URL for MP4, HLS, or DASH.</td>
              </tr>
              <tr>
                <td><code>streamType</code></td>
                <td><code>stream-type</code></td>
                <td><code>mp4</code> | <code>hls</code> | <code>mpd</code></td>
              </tr>
              <tr>
                <td><code>posterSrc</code></td>
                <td><code>poster-src</code></td>
                <td>Poster image before playback.</td>
              </tr>
              <tr>
                <td><code>seekThumbnail</code></td>
                <td><code>seek-thumbnail</code></td>
                <td>WebVTT URL (sprite <code>#xywh=</code> cues) or <code>SeekThumbnailGridSheet[]</code> in React.</td>
              </tr>
              <tr>
                <td><code>previewStoryboardVttUrl</code></td>
                <td><code>preview-storyboard-vtt-url</code></td>
                <td>Legacy alias for VTT-only thumbnails; prefer <code>seekThumbnail</code> string.</td>
              </tr>
              <tr>
                <td><code>embed</code></td>
                <td><code>embed</code></td>
                <td>Minimal chrome for iframe/widget embeds.</td>
              </tr>
              <tr>
                <td><code>showLogo</code> + <code>customLogo</code></td>
                <td>—</td>
                <td>React-only branding; both required to show the top-right pill.</td>
              </tr>
              <tr>
                <td><code>classNames</code></td>
                <td><code>class-name</code> (partial)</td>
                <td>Slot overrides for layout wrappers (see README for keys).</td>
              </tr>
              <tr>
                <td><code>customStyling</code></td>
                <td>—</td>
                <td>Inline style objects per UI region (<code>bottomOverlay</code>, <code>timePill</code>, …).</td>
              </tr>
              <tr>
                <td><code>onNext</code></td>
                <td><code>next</code> event</td>
                <td>Callback / custom event when Next is activated.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="keyboard" class="content-section">
        <h2 class="section-title">Keyboard shortcuts</h2>
        <div class="table-wrap">
          <table class="props-table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><code>Space</code>, <code>K</code></td><td>Play / pause</td></tr>
              <tr><td><code>←</code>, <code>J</code></td><td>Seek −10s</td></tr>
              <tr><td><code>→</code>, <code>L</code></td><td>Seek +10s</td></tr>
              <tr><td><code>↑</code></td><td>Volume up</td></tr>
              <tr><td><code>↓</code></td><td>Volume down</td></tr>
              <tr><td><code>M</code></td><td>Mute toggle</td></tr>
              <tr><td><code>F</code></td><td>Fullscreen</td></tr>
              <tr><td><code>Home</code></td><td>Start</td></tr>
              <tr><td><code>End</code></td><td>End</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="faq" class="content-section">
        <h2 class="section-title">FAQ</h2>
        <ul class="faq-list">
          <li>
            <strong>Do I install Tailwind?</strong>
            <span>No. Import the bundled stylesheet; controls ship with scoped CSS.</span>
          </li>
          <li>
            <strong>Can I theme it?</strong>
            <span>Yes—<code>classNames</code>, <code>customStyling</code>, and root <code>className</code> / <code>style</code>.</span>
          </li>
          <li>
            <strong>Autoplay?</strong>
            <span>Follows browser policies; muted autoplay may still be blocked on some platforms.</span>
          </li>
          <li>
            <strong>Non-React pages?</strong>
            <span>Use <code>registerStreamPlayerElement()</code> and declarative attributes on <code>&lt;stream-player&gt;</code>.</span>
          </li>
        </ul>
      </section>
    </main>
  </div>
`;

const links = Array.from(document.querySelectorAll(".menu a"));
const sections = Array.from(document.querySelectorAll(".content-section"));
const player = document.getElementById("demo-player");

player?.addEventListener("next", () => {
  window.alert("Next episode clicked");
});

const activateSection = (targetId) => {
  const existing = sections.find((section) => section.id === targetId);
  const nextTarget = existing ? targetId : "overview";

  links.forEach((item) => {
    item.classList.toggle("active", item.dataset.target === nextTarget);
  });

  sections.forEach((section) => {
    section.classList.toggle("active", section.id === nextTarget);
  });
};

links.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const targetId = link.dataset.target;
    if (!targetId) return;
    activateSection(targetId);
    history.replaceState(null, "", `#${targetId}`);
  });
});

activateSection(window.location.hash.replace("#", "") || "overview");

/* Stream format tabs */
const tabs = Array.from(document.querySelectorAll(".stream-tab"));
const hintEl = document.getElementById("stream-hint");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const key = tab.dataset.stream;
    if (!key || !STREAM_DEMOS[key] || !player) return;
    const demo = STREAM_DEMOS[key];

    player.setAttribute("title", demo.title);
    player.setAttribute("stream-url", demo.streamUrl);
    player.setAttribute("stream-type", demo.streamType);
    player.setAttribute("poster-src", demo.posterSrc);

    if (hintEl) hintEl.textContent = demo.hint;

    tabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
  });
});

/* CodeMirror (lazy chunk) + copy */
void import("./codeEditor.js").then(({ bindCopyButton, mountReadOnlyEditor }) => {
  const langMap = { tsx: "tsx", js: "js", html: "html", bash: "bash" };

  document.querySelectorAll(".code-panel__editor[data-snippet]").forEach((mountEl) => {
    if (!(mountEl instanceof HTMLElement)) return;
    const key = mountEl.dataset.snippet;
    const lang = mountEl.dataset.lang || "tsx";
    const text = SNIPPETS[key];
    if (!text) return;

    mountReadOnlyEditor(mountEl, text, { lang: langMap[lang] || "tsx" });

    const panel = mountEl.closest(".code-panel");
    const btn = panel?.querySelector(".copy-btn");
    if (btn instanceof HTMLButtonElement) {
      bindCopyButton(btn, text);
    }
  });
});
