import type { SeekThumbnailGridSheet } from "./types";

export function pickGridThumbAtTime(sheet: SeekThumbnailGridSheet, tSec: number) {
  const { total, intervalSec, thumbWidth, thumbHeight, columns, rows, spriteUrl } = sheet;
  if (total < 1 || columns < 1 || rows < 1 || thumbWidth < 1 || thumbHeight < 1 || !spriteUrl) {
    return null;
  }

  const step = intervalSec > 0 ? intervalSec : 10;
  const cellCount = columns * rows;
  const last = Math.min(total, cellCount) - 1;
  const i = Math.min(Math.max(0, Math.floor(tSec / step)), last);
  const col = i % columns;
  const row = Math.floor(i / columns);
  if (row >= rows) return null;

  return {
    url: spriteUrl,
    x: col * thumbWidth,
    y: row * thumbHeight,
    w: thumbWidth,
    h: thumbHeight,
  };
}
