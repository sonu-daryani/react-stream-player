import "./styles.css";
import "hls-react-player/styles.css";
import { registerStreamPlayerElement } from "hls-react-player";

registerStreamPlayerElement();

document.querySelector("#app").innerHTML = `
  <div class="layout">
    <aside class="sidebar">
      <h1 class="brand">hls-react-player</h1>
      <p class="subtitle">Vite showcase UI</p>
      <nav class="menu">
        <a href="#examples" class="active" data-target="examples">Examples</a>
        <a href="#quick-install" data-target="quick-install">Quick Install</a>
        <a href="#instructions" data-target="instructions">Instructions</a>
        <a href="#api" data-target="api">API</a>
        <a href="#faq" data-target="faq">FAQ</a>
      </nav>
    </aside>

    <main class="content">
      <div class="hero">
        <h2>Build cinematic playback in minutes</h2>
        <p>
          Install with <code>npm run demo:install</code> from the package root, then <code>npm run demo:dev</code>.
          The demo depends on the parent folder via <code>file:..</code> in <code>demo/package.json</code>.
        </p>
        <div class="hero-grid">
          <div class="chip">MP4 / HLS / DASH</div>
          <div class="chip">Fullscreen Auto-Hide Controls</div>
          <div class="chip">React + Web Component Support</div>
        </div>
      </div>

      <section id="examples" class="content-section active">
        <h2>Examples</h2>
        <p>
          Play, seek, fullscreen, volume, keyboard shortcuts, quality/audio/subtitle selection, and
          settings menu are enabled below.
        </p>
        <stream-player
          id="demo-player"
          title="Demo HLS Stream"
          stream-url="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
          stream-type="hls"
          poster-src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80"
        ></stream-player>
        <h3 class="subheading">Try these interactions</h3>
        <ul>
          <li>Press <code>K</code> or <code>Space</code> for play/pause.</li>
          <li>Press <code>J</code>/<code>L</code> or Arrow Left/Right for 10s seek.</li>
          <li>Press <code>F</code> for fullscreen and wait 5s to see controls auto-hide.</li>
          <li>Use settings gear for subtitle/audio/resolution options.</li>
        </ul>
      </section>

      <section id="quick-install" class="content-section">
        <h2>Quick Install</h2>
        <pre>npm install hls-react-player react react-dom</pre>
        <p class="muted">Peer: React 18+. The package bundles <code>hls.js</code>, <code>dashjs</code>, and <code>lucide-react</code> icons.</p>
        <h3 class="subheading">Minimal React usage</h3>
        <pre>import "hls-react-player/styles.css";
import { StreamPlayer } from "hls-react-player";

export default function App() {
  return (
    <StreamPlayer
      title="Demo Stream"
      streamUrl="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
      streamType="hls"
      posterSrc="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80"
    />
  );
}</pre>
      </section>

      <section id="instructions" class="content-section">
        <h2>Instructions</h2>
        <p>Use as a native custom element in plain HTML/JS projects:</p>
        <pre>import { registerStreamPlayerElement } from "hls-react-player";
registerStreamPlayerElement();

// HTML
// &lt;stream-player title="Movie" stream-url="..." stream-type="hls"&gt;&lt;/stream-player&gt;</pre>
        <h3 class="subheading">Branding (top-right)</h3>
        <pre>// Logo shows only when BOTH are set — pass your mark as customLogo
&lt;StreamPlayer showLogo customLogo={&lt;span&gt;MyOTT&lt;/span&gt;} /&gt;</pre>
      </section>

      <section id="api" class="content-section">
        <h2>API</h2>
        <h3 class="subheading">Core props</h3>
        <ul>
          <li><code>title</code> - Player title text.</li>
          <li><code>streamUrl</code> / <code>stream-url</code> - Video stream URL.</li>
          <li><code>streamType</code> / <code>stream-type</code> - <code>mp4</code>, <code>hls</code>, or <code>mpd</code>.</li>
          <li><code>posterSrc</code> / <code>poster-src</code> - Poster image URL.</li>
          <li><code>showLogo</code> + <code>customLogo</code> — Top-right branding pill (both required to show).</li>
          <li><code>seekThumbnail</code> (React) / <code>seek-thumbnail</code> (element) — WebVTT sprite URL for scrub thumbnails (optional). Legacy: <code>previewStoryboardVttUrl</code>.</li>
          <li><code>customStyling</code> - Inline style overrides for internal parts.</li>
        </ul>
        <div class="card-grid">
          <div class="mini-card">
            <strong>Event</strong>
            <span class="muted"><code>next</code> custom event (web component) when Next button is pressed.</span>
          </div>
          <div class="mini-card">
            <strong>Styling</strong>
            <span class="muted">Import <code>hls-react-player/styles.css</code> once in your app (or in this demo’s entry).</span>
          </div>
        </div>
      </section>

      <section id="faq" class="content-section">
        <h2>FAQ</h2>
        <ul>
          <li><strong>Does this need Tailwind in my app?</strong> No. Import the package stylesheet; no Tailwind required.</li>
          <li><strong>Can I customize appearance?</strong> Yes. Use <code>classNames</code> and <code>customStyling</code>.</li>
          <li><strong>Branding?</strong> Omit <code>customLogo</code> or set <code>showLogo={false}</code>. To show a logo, set both <code>showLogo</code> and <code>customLogo</code>.</li>
          <li><strong>Does it work outside React?</strong> Yes, via <code>registerStreamPlayerElement()</code>.</li>
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
  const nextTarget = existing ? targetId : "examples";

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

activateSection(window.location.hash.replace("#", "") || "examples");
