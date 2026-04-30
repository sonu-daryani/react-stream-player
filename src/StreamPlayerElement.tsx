import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import StreamPlayer from "./StreamPlayer";
import type { StreamType } from "./types";

type StreamPlayerElementConfig = {
  tagName?: string;
};

const DEFAULT_TAG = "stream-player";

const toStreamType = (value: string | null): StreamType => {
  if (value === "hls" || value === "mpd") return value;
  return "mp4";
};

class StreamPlayerElement extends HTMLElement {
  static get observedAttributes() {
    return ["title", "stream-url", "stream-type", "poster-src", "embed", "class-name"];
  }

  private root: Root | null = null;
  private mountNode: HTMLDivElement | null = null;

  connectedCallback() {
    if (!this.mountNode) {
      this.mountNode = document.createElement("div");
      this.mountNode.style.width = "100%";
      this.appendChild(this.mountNode);
    }
    if (!this.root) {
      this.root = createRoot(this.mountNode);
    }
    this.renderPlayer();
  }

  disconnectedCallback() {
    this.root?.unmount();
    this.root = null;
    this.mountNode = null;
  }

  attributeChangedCallback() {
    this.renderPlayer();
  }

  private renderPlayer() {
    if (!this.root) return;

    const title = this.getAttribute("title") || "Stream Player";
    const streamUrl = this.getAttribute("stream-url") || "";
    const posterSrc = this.getAttribute("poster-src") || "";
    const streamType = toStreamType(this.getAttribute("stream-type"));
    const embed = this.getAttribute("embed") !== null && this.getAttribute("embed") !== "false";
    const className = this.getAttribute("class-name") || undefined;

    this.root.render(
      createElement(StreamPlayer, {
        title,
        streamUrl,
        streamType,
        posterSrc,
        embed,
        className,
        onNext: () => {
          this.dispatchEvent(new CustomEvent("next", { bubbles: true }));
        },
      }),
    );
  }
}

export const registerStreamPlayerElement = (config?: StreamPlayerElementConfig) => {
  const tagName = config?.tagName || DEFAULT_TAG;
  if (!customElements.get(tagName)) {
    customElements.define(tagName, StreamPlayerElement);
  }
};
