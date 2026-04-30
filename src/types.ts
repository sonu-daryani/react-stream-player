import type { CSSProperties, ReactNode } from "react";

export type StreamType = "mp4" | "hls" | "mpd";

export type StreamPlayerClassNames = {
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

export type StreamPlayerCustomStyling = {
  root?: CSSProperties;
  frame?: CSSProperties;
  video?: CSSProperties;
  topOverlay?: CSSProperties;
  bottomOverlay?: CSSProperties;
  leftControls?: CSSProperties;
  rightControls?: CSSProperties;
  logoPill?: CSSProperties;
  timePill?: CSSProperties;
  progress?: CSSProperties;
};

export type StreamPlayerProps = {
  title: string;
  streamUrl: string;
  streamType: StreamType;
  posterSrc: string;
  onNext?: () => void;
  embed?: boolean;
  className?: string;
  style?: CSSProperties;
  showLogo?: boolean;
  customLogo?: ReactNode;
  classNames?: Partial<StreamPlayerClassNames>;
  customStyling?: StreamPlayerCustomStyling;
};
