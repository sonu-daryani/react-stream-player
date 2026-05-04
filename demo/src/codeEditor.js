import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { oneDark } from "@codemirror/theme-one-dark";

/** @typedef {"tsx" | "js" | "html" | "bash"} CodeLang */

/**
 * @param {HTMLElement} container
 * @param {string} doc
 * @param {{ lang?: CodeLang }} [options]
 * @returns {EditorView}
 */
export function mountReadOnlyEditor(container, doc, { lang = "tsx" } = {}) {
  /** @type {import("@codemirror/state").Extension[]} */
  const langExt = [];
  if (lang === "tsx") {
    langExt.push(javascript({ jsx: true, typescript: true }));
  } else if (lang === "js") {
    langExt.push(javascript({ jsx: true }));
  } else if (lang === "html") {
    langExt.push(html());
  }

  const extensions = [
    basicSetup,
    oneDark,
    EditorState.readOnly.of(true),
    EditorView.lineWrapping,
    ...langExt,
    EditorView.theme({
      "&": {
        fontSize: "13px",
        height: "100%",
        backgroundColor: "#0d1117",
      },
      ".cm-scroller": {
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
      },
      ".cm-content": {
        paddingBlock: "10px",
        caretColor: "transparent",
      },
      ".cm-gutters": {
        backgroundColor: "#0d1117",
        borderRight: "1px solid rgba(148, 163, 184, 0.15)",
      },
      ".cm-activeLineGutter": {
        backgroundColor: "transparent",
      },
    }),
  ];

  return new EditorView({
    parent: container,
    state: EditorState.create({ doc, extensions }),
  });
}

/**
 * @param {HTMLButtonElement} button
 * @param {string} text
 */
export function bindCopyButton(button, text) {
  const defaultLabel = button.textContent?.trim() || "Copy";
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = "Copied";
      button.classList.add("is-copied");
      setTimeout(() => {
        button.textContent = defaultLabel;
        button.classList.remove("is-copied");
      }, 2000);
    } catch {
      button.textContent = "Failed";
      setTimeout(() => {
        button.textContent = defaultLabel;
      }, 2000);
    }
  });
}
