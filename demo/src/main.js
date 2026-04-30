import "./styles.css";
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
          This Vite demo shows the integrated player package with sidebar navigation and
          section-based documentation.
        </p>
      </div>

      <section id="examples" class="content-section active">
        <h2>Examples</h2>
        <p>Play, seek, fullscreen, volume, keyboard shortcuts, and settings are enabled below.</p>
        <stream-player
          id="demo-player"
          title="Demo HLS Stream"
          stream-url="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
          stream-type="hls"
          poster-src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80"
        ></stream-player>
      </section>

      <section id="quick-install" class="content-section">
        <h2>Quick Install</h2>
        <pre>npm install hls-react-player react react-dom lucide-react hls.js dashjs</pre>
      </section>

      <section id="instructions" class="content-section">
        <h2>Instructions</h2>
        <pre>import { registerStreamPlayerElement } from "hls-react-player";
registerStreamPlayerElement();</pre>
        <p style="margin-top: 12px">Then add a &lt;stream-player&gt; element anywhere in your HTML.</p>
      </section>

      <section id="api" class="content-section">
        <h2>API (HTML Attributes)</h2>
        <ul>
          <li><code>title</code> - Player title text</li>
          <li><code>stream-url</code> - Video stream URL</li>
          <li><code>stream-type</code> - <code>mp4</code>, <code>hls</code>, or <code>mpd</code></li>
          <li><code>poster-src</code> - Poster image URL</li>
          <li><code>embed</code> - Minimal wrapper mode</li>
          <li><code>class-name</code> - Optional custom root class</li>
        </ul>
      </section>

      <section id="faq" class="content-section">
        <h2>FAQ</h2>
        <ul>
          <li>Works with React apps and plain HTML/JS via custom element.</li>
          <li>Supports MP4, HLS, and DASH.</li>
          <li>Emits a <code>next</code> event for JS listeners when Next is clicked.</li>
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
