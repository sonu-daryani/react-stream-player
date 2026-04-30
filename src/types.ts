import type { CSSProperties } from "react";

export type StreamType = "mp4" | "hls" | "mpd";

export type CustomPlayerClassNames = {
  root: string;
  frame: string;
  video: string;
  topOverlay: string;
  bottomOverlay: string;
  leftControls: string;
  rightControls: string;
  logoPill: string;
  timePill: string;
};

export type CustomPlayerProps = {
  title: string;
  streamUrl: string;
  streamType: StreamType;
  posterSrc: string;
  onNext?: () => void;
  embed?: boolean;
  className?: string;
  style?: CSSProperties;
  classNames?: Partial<CustomPlayerClassNames>;
};
