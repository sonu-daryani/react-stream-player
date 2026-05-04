export type ThumbnailCue = {
  start: number;
  end: number;
  url: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

const TIME_PAIR =
  /^(\d{1,2}):(\d{2}):(\d{2})\.(\d{3})\s*-->\s*(\d{1,2}):(\d{2}):(\d{2})\.(\d{3})/;

function toSeconds(h: string, m: string, s: string, ms: string): number {
  return Number(h) * 3600 + Number(m) * 60 + Number(s) + Number(ms) / 1000;
}

export function resolveVttMediaUrl(vttUrl: string, mediaRef: string): string {
  const ref = mediaRef.trim();
  if (/^https?:\/\//i.test(ref) || ref.startsWith("//")) {
    return ref.startsWith("//") ? `https:${ref}` : ref;
  }
  try {
    const base = new URL(vttUrl);
    base.pathname = base.pathname.replace(/\/[^/]+$/, "/");
    return new URL(ref.replace(/^\//, ""), base).href;
  } catch {
    return ref;
  }
}

export function parseThumbnailStoryboardVtt(vttText: string, vttUrl: string): ThumbnailCue[] {
  const cues: ThumbnailCue[] = [];
  const lines = vttText.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();
    if (line === "WEBVTT" || line.startsWith("NOTE") || line === "" || /^\d+$/.test(line)) {
      i += 1;
      continue;
    }
    const m = line.match(TIME_PAIR);
    if (!m) {
      i += 1;
      continue;
    }
    const start = toSeconds(m[1], m[2], m[3], m[4]);
    const end = toSeconds(m[5], m[6], m[7], m[8]);
    i += 1;
    while (i < lines.length && lines[i].trim() === "") i += 1;
    if (i >= lines.length) break;
    const payload = lines[i].trim();
    i += 1;
    const xy = payload.match(/#xywh=(\d+),(\d+),(\d+),(\d+)\s*$/i);
    const withoutFrag = payload.replace(/#xywh=.*$/i, "").trim();
    if (!withoutFrag) continue;
    const url = resolveVttMediaUrl(vttUrl, withoutFrag);
    const x = xy ? Number(xy[1]) : 0;
    const y = xy ? Number(xy[2]) : 0;
    const w = xy ? Number(xy[3]) : 160;
    const h = xy ? Number(xy[4]) : 90;
    cues.push({ start, end, url, x, y, w, h });
  }
  return cues;
}

export function pickThumbnailCueForTime(cues: ThumbnailCue[], t: number): ThumbnailCue | null {
  if (cues.length === 0) return null;
  const hit = cues.find((c) => t >= c.start && t < c.end);
  if (hit) return hit;
  let best: ThumbnailCue | null = null;
  for (const c of cues) {
    if (c.start <= t && (!best || c.start > best.start)) best = c;
  }
  return best;
}
