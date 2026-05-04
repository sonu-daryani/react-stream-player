"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Settings,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { SeekThumbnailGridSheet, StreamPlayerClassNames, StreamPlayerProps } from "./types";
import {
  parseThumbnailStoryboardVtt,
  pickThumbnailCueForTime,
  type ThumbnailCue,
} from "./storyboardVtt";
import { pickGridThumbAtTime } from "./seekThumbnailGrid";
import "./stream-player.css";

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

const defaultClassNames: StreamPlayerClassNames = {
  root: "rsp-root",
  frame: "rsp-frame",
  video: "rsp-video",
  topOverlay: "rsp-top-overlay",
  bottomOverlay: "rsp-bottom-overlay",
  leftControls: "rsp-left-controls",
  rightControls: "rsp-right-controls",
  logoPill: "rsp-logo-pill",
  timePill: "rsp-time-pill",
};

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export default function StreamPlayer({
  title,
  streamUrl,
  streamType,
  posterSrc,
  seekThumbnail,
  previewStoryboardVttUrl,
  onNext,
  embed = false,
  className,
  style,
  showLogo = false,
  customLogo,
  classNames,
  customStyling,
}: StreamPlayerProps) {
  const ui = { ...defaultClassNames, ...classNames };
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const settingsRef = useRef<HTMLDivElement | null>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hlsRef = useRef<{
    levels: Array<{ height?: number }>;
    audioTracks?: Array<{ name?: string; lang?: string }>;
    currentLevel?: number;
    nextLevel?: number;
    audioTrack?: number;
  } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [areControlsVisible, setAreControlsVisible] = useState(true);
  const [subtitleOptions, setSubtitleOptions] = useState<string[]>(["Off"]);
  const [audioOptions, setAudioOptions] = useState<string[]>(["Default"]);
  const [resolutionOptions, setResolutionOptions] = useState<string[]>(["Auto"]);
  const [selectedSubtitle, setSelectedSubtitle] = useState("Off");
  const [selectedAudio, setSelectedAudio] = useState("Default");
  const [selectedResolution, setSelectedResolution] = useState("Auto");
  const [thumbnailCues, setThumbnailCues] = useState<ThumbnailCue[]>([]);
  const [spriteDims, setSpriteDims] = useState<{ w: number; h: number } | null>(null);
  type ScrubCue = Pick<ThumbnailCue, "url" | "x" | "y" | "w" | "h">;
  const [scrubPreview, setScrubPreview] = useState<null | {
    pct: number;
    cue: ScrubCue;
    scale: number;
    dispW: number;
    dispH: number;
  }>(null);
  const progressWrapRef = useRef<HTMLDivElement | null>(null);

  const safePlay = async (video: HTMLVideoElement) => {
    try {
      const playPromise = video.play();
      if (playPromise) {
        await playPromise;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      if (
        error instanceof Error &&
        (error.message.includes("interrupted by a call to pause") ||
          error.message.toLowerCase().includes("notallowederror"))
      ) {
        return;
      }
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
  }, [volume]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let activeEngine: "html5" | "hls" | "dash" = "html5";
    let dashPlayer:
      | {
          initialize?: (
            video: HTMLVideoElement,
            source: string,
            autoplay: boolean,
          ) => void;
          destroy?: () => void;
          reset?: () => void;
        }
      | null = null;
    let hls:
      | {
          destroy: () => void;
          stopLoad?: () => void;
          detachMedia?: () => void;
        }
      | null = null;
    let mounted = true;

    const setupStream = async () => {
      if (!mounted) return;

      if (streamType === "hls") {
        const hlsModule = await import("hls.js");
        const HlsCtor = hlsModule.default;
        if (HlsCtor.isSupported()) {
          const instance = new HlsCtor();
          activeEngine = "hls";
          instance.loadSource(streamUrl);
          instance.attachMedia(video);
          hlsRef.current = instance as unknown as {
            levels: Array<{ height?: number }>;
            audioTracks?: Array<{ name?: string; lang?: string }>;
            currentLevel?: number;
            nextLevel?: number;
            audioTrack?: number;
          };
          instance.on(HlsCtor.Events.MANIFEST_PARSED, () => {
            const levels = (instance.levels || [])
              .map((level: { height?: number }) => level.height)
              .filter((height): height is number => Number.isFinite(height));
            const uniqueLevels = Array.from(new Set(levels)).sort((a, b) => b - a);
            setResolutionOptions(["Auto", ...uniqueLevels.map((height) => `${height}p`)]);

            const audioTracks = (instance.audioTracks || []).map(
              (track: { name?: string; lang?: string }, index: number) =>
                track.name || track.lang || `Track ${index + 1}`,
            );
            if (audioTracks.length) {
              setAudioOptions(audioTracks);
              setSelectedAudio(audioTracks[0]);
            } else {
              setAudioOptions(["Default"]);
              setSelectedAudio("Default");
            }
            void safePlay(video);
          });
          hls = instance;
          return;
        }
      }

      if (streamType === "mpd") {
        const dashjsModule = await import("dashjs");
        const dashFactory = dashjsModule.MediaPlayer;
        dashPlayer = dashFactory().create();
        activeEngine = "dash";
        dashPlayer.initialize?.(video, streamUrl, true);
        return;
      }

      video.src = streamUrl;
      await safePlay(video);
    };

    void setupStream();

    return () => {
      mounted = false;
      hlsRef.current = null;
      if (activeEngine === "hls") {
        hls?.stopLoad?.();
        hls?.detachMedia?.();
        hls?.destroy();
      }
      if (activeEngine === "dash") {
        dashPlayer?.reset?.();
        dashPlayer?.destroy?.();
      }
      video.pause();
      if (activeEngine === "html5") {
        video.removeAttribute("src");
        video.load();
      }
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      setIsBuffering(true);
      setIsSettingsOpen(false);
    };
  }, [streamType, streamUrl]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const tracks = Array.from(videoRef.current?.textTracks || []);
    const subtitleList = [
      "Off",
      ...tracks.map((track, index) => track.label || track.language || `Subtitle ${index + 1}`),
    ];
    setSubtitleOptions(subtitleList);
    setSelectedSubtitle("Off");
  }, [streamUrl]);

  const clearControlsHideTimer = useCallback(() => {
    if (!controlsTimerRef.current) return;
    clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = null;
  }, []);

  const scheduleControlsHide = useCallback(() => {
    clearControlsHideTimer();
    controlsTimerRef.current = setTimeout(() => {
      setAreControlsVisible(false);
      setIsSettingsOpen(false);
    }, 5000);
  }, [clearControlsHideTimer]);

  const revealControls = useCallback(() => {
    setAreControlsVisible(true);
    if (isPlaying) {
      scheduleControlsHide();
    }
  }, [isPlaying, scheduleControlsHide]);

  useEffect(() => {
    if (isPlaying) {
      setAreControlsVisible(true);
      scheduleControlsHide();
      return;
    }

    clearControlsHideTimer();
    setAreControlsVisible(true);
  }, [clearControlsHideTimer, isPlaying, scheduleControlsHide]);

  useEffect(() => {
    return () => {
      clearControlsHideTimer();
    };
  }, [clearControlsHideTimer]);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (!settingsRef.current) return;
      if (settingsRef.current.contains(event.target as Node)) return;
      setIsSettingsOpen(false);
    };
    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, []);

  const progress = useMemo(() => {
    if (!duration) return 0;
    return (currentTime / duration) * 100;
  }, [currentTime, duration]);

  const gridSpriteSheets = useMemo(() => {
    if (!Array.isArray(seekThumbnail) || !seekThumbnail.length) return null;
    const head = seekThumbnail[0];
    if (
      head &&
      typeof head === "object" &&
      typeof (head as SeekThumbnailGridSheet).spriteUrl === "string"
    ) {
      return seekThumbnail as SeekThumbnailGridSheet[];
    }
    return null;
  }, [seekThumbnail]);

  const updateScrubPreviewFromClientX = useCallback(
    (clientX: number) => {
      const wrap = progressWrapRef.current;
      if (!wrap || duration <= 0) {
        setScrubPreview(null);
        return;
      }
      const rect = wrap.getBoundingClientRect();
      const pct01 = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const t = pct01 * duration;
      const small =
        typeof window !== "undefined" && window.matchMedia?.("(max-width: 500px)")?.matches;
      const cap = small ? 68 : 116;

      const pushPreview = (cue: ScrubCue) => {
        const scale = Math.min(1, cap / Math.max(cue.w, 1));
        setScrubPreview({
          pct: pct01 * 100,
          cue,
          scale,
          dispW: cue.w * scale,
          dispH: cue.h * scale,
        });
      };

      if (gridSpriteSheets?.length) {
        const frame = pickGridThumbAtTime(gridSpriteSheets[0], t);
        if (!frame) {
          setScrubPreview(null);
          return;
        }
        pushPreview(frame);
        return;
      }

      if (!thumbnailCues.length) {
        setScrubPreview(null);
        return;
      }
      const cue = pickThumbnailCueForTime(thumbnailCues, t);
      if (!cue) {
        setScrubPreview(null);
        return;
      }
      pushPreview({ url: cue.url, x: cue.x, y: cue.y, w: cue.w, h: cue.h });
    },
    [duration, gridSpriteSheets, thumbnailCues],
  );

  const storyboardVttUrl = useMemo(() => {
    if (gridSpriteSheets) return undefined;
    const fromSeek = typeof seekThumbnail === "string" ? seekThumbnail.trim() : "";
    const fromLegacy = previewStoryboardVttUrl?.trim();
    const u = (fromSeek && fromSeek.length > 0 ? fromSeek : fromLegacy) || undefined;
    return u;
  }, [gridSpriteSheets, seekThumbnail, previewStoryboardVttUrl]);

  useEffect(() => {
    const url = storyboardVttUrl;
    if (!url) {
      setThumbnailCues([]);
      return;
    }
    const ac = new AbortController();
    void (async () => {
      try {
        const res = await fetch(url, { signal: ac.signal, mode: "cors" });
        if (!res.ok) return;
        const text = await res.text();
        setThumbnailCues(parseThumbnailStoryboardVtt(text, url));
      } catch {
        setThumbnailCues([]);
      }
    })();
    return () => ac.abort();
  }, [storyboardVttUrl]);

  useEffect(() => {
    const url = scrubPreview?.cue.url;
    if (!url) {
      setSpriteDims(null);
      return;
    }
    setSpriteDims(null);
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setSpriteDims({ w: img.naturalWidth, h: img.naturalHeight });
      }
    };
    img.onerror = () => setSpriteDims({ w: 0, h: 0 });
    img.src = url;
  }, [scrubPreview?.cue.url]);

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    if (!video.paused) {
      video.pause();
      return;
    }

    try {
      await safePlay(video);
    } catch {
      return;
    }
  }, []);

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const nextTime = Number(event.target.value);
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleVolume = (event: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const nextVolume = Number(event.target.value);
    setVolume(nextVolume);
    video.volume = nextVolume;
    video.muted = false;
    setIsMuted(false);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const toggleFullscreen = async () => {
    const wrapper = wrapperRef.current;
    if (!wrapper?.requestFullscreen) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await wrapper.requestFullscreen();
  };

  const seekBy = useCallback(
    (delta: number) => {
      const video = videoRef.current;
      if (!video) return;
      const next = Math.min(Math.max(video.currentTime + delta, 0), duration || video.duration || 0);
      video.currentTime = next;
      setCurrentTime(next);
    },
    [duration],
  );

  const adjustVolumeBy = useCallback(
    (delta: number) => {
      const video = videoRef.current;
      if (!video) return;
      const baseVolume = isMuted ? 0 : volume;
      const nextVolume = Math.min(Math.max(baseVolume + delta, 0), 1);
      setVolume(nextVolume);
      video.volume = nextVolume;
      video.muted = false;
      setIsMuted(false);
    },
    [isMuted, volume],
  );

  const onSelectResolution = (value: string) => {
    setSelectedResolution(value);
    const hls = hlsRef.current;
    if (!hls) return;
    if (value === "Auto") {
      if ("currentLevel" in hls) hls.currentLevel = -1;
      if ("nextLevel" in hls) hls.nextLevel = -1;
      return;
    }
    const targetHeight = Number(value.replace("p", ""));
    const levelIndex = (hls.levels || []).findIndex((level) => level.height === targetHeight);
    if (levelIndex >= 0) {
      if ("currentLevel" in hls) hls.currentLevel = levelIndex;
      if ("nextLevel" in hls) hls.nextLevel = levelIndex;
    }
  };

  const onSelectAudio = (value: string) => {
    setSelectedAudio(value);
    const hls = hlsRef.current;
    if (!hls?.audioTracks?.length) return;
    const index = hls.audioTracks.findIndex(
      (track, i) => (track.name || track.lang || `Track ${i + 1}`) === value,
    );
    if (index >= 0 && "audioTrack" in hls) {
      hls.audioTrack = index;
    }
  };

  const onSelectSubtitle = (value: string) => {
    setSelectedSubtitle(value);
    const tracks = Array.from(videoRef.current?.textTracks || []);
    tracks.forEach((track, index) => {
      const label = track.label || track.language || `Subtitle ${index + 1}`;
      track.mode = value !== "Off" && label === value ? "showing" : "disabled";
    });
  };

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName.toLowerCase();
      if (tagName === "input" || tagName === "textarea" || tagName === "select") return;

      switch (event.key) {
        case " ":
        case "k":
        case "K":
          event.preventDefault();
          void togglePlay();
          break;
        case "ArrowLeft":
        case "j":
        case "J":
          event.preventDefault();
          seekBy(-10);
          break;
        case "ArrowRight":
        case "l":
        case "L":
          event.preventDefault();
          seekBy(10);
          break;
        case "ArrowUp":
          event.preventDefault();
          adjustVolumeBy(0.1);
          break;
        case "ArrowDown":
          event.preventDefault();
          adjustVolumeBy(-0.1);
          break;
        case "m":
        case "M":
          event.preventDefault();
          toggleMute();
          break;
        case "f":
        case "F":
          event.preventDefault();
          void toggleFullscreen();
          break;
        case "Home":
          event.preventDefault();
          seekBy(-(duration || 0));
          break;
        case "End":
          event.preventDefault();
          seekBy(duration || 0);
          break;
        default:
          break;
      }

      revealControls();
    };

    wrapper.addEventListener("keydown", onKeyDown);
    wrapper.focus();
    return () => wrapper.removeEventListener("keydown", onKeyDown);
  }, [adjustVolumeBy, duration, revealControls, seekBy, togglePlay]);

  return (
    <div
      className={cx(embed ? "rsp-embed-root" : ui.root, className)}
      style={{ ...customStyling?.root, ...style }}
    >
      <div
        ref={wrapperRef}
        className={ui.frame}
        style={customStyling?.frame}
        tabIndex={0}
        onMouseMove={revealControls}
        onTouchStart={revealControls}
        onClick={revealControls}
      >
        <video
          ref={videoRef}
          className={ui.video}
          style={customStyling?.video}
          poster={posterSrc}
          autoPlay
          playsInline
          preload="metadata"
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
          onCanPlay={() => setIsBuffering(false)}
          onLoadStart={() => setIsBuffering(true)}
          controls={false}
        >
          Your browser does not support HTML video.
        </video>

        <div
          className={cx(
            ui.topOverlay,
            "rsp-fade-overlay",
            areControlsVisible ? "rsp-visible" : "rsp-hidden",
            showLogo && customLogo ? "rsp-top-overlay--has-logo" : null,
          )}
          style={customStyling?.topOverlay}
        >
          <div className="rsp-top-inner">
            <p className="rsp-title">{title}</p>
          </div>
          {showLogo && customLogo ? (
            <div className="rsp-top-logo-anchor">
              <span className={cx(ui.logoPill, "rsp-top-logo")} style={customStyling?.logoPill}>
                {customLogo}
              </span>
            </div>
          ) : null}
        </div>

        {isBuffering ? (
          <div className="rsp-buffer-overlay">
            <div className="rsp-buffer-chip">
              <span className="rsp-spinner" />
              Buffering...
            </div>
          </div>
        ) : null}

        {!isBuffering ? (
          <div
            className={cx(
              "rsp-center-seek-overlay",
              "rsp-fade-overlay",
              areControlsVisible ? "rsp-visible" : "rsp-hidden",
            )}
          >
            <div className="rsp-center-seek-pill">
              <button
                type="button"
                onClick={() => seekBy(-10)}
                className="rsp-btn rsp-btn-ghost"
                aria-label="Back 10 seconds"
              >
                <span className="rsp-btn-icon-group">
                  <RotateCcw size={18} />
                  <span className="rsp-btn-caption">10</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => void togglePlay()}
                className="rsp-btn rsp-btn-primary rsp-center-seek-play"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button
                type="button"
                onClick={() => seekBy(10)}
                className="rsp-btn rsp-btn-ghost"
                aria-label="Forward 10 seconds"
              >
                <span className="rsp-btn-icon-group">
                  <span className="rsp-btn-caption">10</span>
                  <RotateCw size={18} />
                </span>
              </button>
              {onNext ? (
                <button
                  type="button"
                  onClick={onNext}
                  className="rsp-btn rsp-btn-ghost"
                  aria-label="Next episode"
                >
                  <SkipForward size={18} />
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        <div
          className={cx(
            ui.bottomOverlay,
            "rsp-fade-overlay",
            areControlsVisible ? "rsp-visible" : "rsp-hidden",
          )}
          style={customStyling?.bottomOverlay}
        >
          <div
            ref={progressWrapRef}
            className="rsp-progress-wrap"
            onPointerLeave={() => setScrubPreview(null)}
            onPointerMove={(event) => {
              if (event.pointerType === "mouse" || event.pointerType === "pen") {
                revealControls();
                updateScrubPreviewFromClientX(event.clientX);
              }
            }}
            onTouchStart={(event) => {
              revealControls();
              const x = event.touches[0]?.clientX;
              if (x !== undefined) updateScrubPreviewFromClientX(x);
            }}
            onTouchMove={(event) => {
              const x = event.touches[0]?.clientX;
              if (x !== undefined) updateScrubPreviewFromClientX(x);
            }}
            onTouchEnd={() => setScrubPreview(null)}
          >
            {scrubPreview && duration > 0 ? (
              <div
                className="rsp-scrub-preview"
                style={{
                  left: `${scrubPreview.pct}%`,
                  width: scrubPreview.dispW,
                  height: scrubPreview.dispH,
                }}
              >
                {spriteDims && spriteDims.w > 0 ? (
                  <div
                    className="rsp-scrub-preview-clip"
                    style={{
                      width: scrubPreview.dispW,
                      height: scrubPreview.dispH,
                    }}
                  >
                    <img
                      src={scrubPreview.cue.url}
                      alt=""
                      draggable={false}
                      className="rsp-scrub-preview-img"
                      style={{
                        width: spriteDims.w * scrubPreview.scale,
                        height: spriteDims.h * scrubPreview.scale,
                        marginLeft: -scrubPreview.cue.x * scrubPreview.scale,
                        marginTop: -scrubPreview.cue.y * scrubPreview.scale,
                      }}
                    />
                  </div>
                ) : (
                  <div className="rsp-scrub-preview-placeholder" />
                )}
              </div>
            ) : null}
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              onInput={(event) => {
                revealControls();
                const el = event.currentTarget;
                const rect = el.getBoundingClientRect();
                const max = Number(el.max) || 1;
                const pct = Math.min(1, Math.max(0, Number(el.value) / max));
                updateScrubPreviewFromClientX(rect.left + pct * rect.width);
              }}
              className="rsp-progress"
              style={{
                ...customStyling?.progress,
                background: `linear-gradient(to right, #3b82f6 ${progress}%, #334155 ${progress}%)`,
              }}
            />
          </div>

          <div className="rsp-controls-row">
            <div className={ui.leftControls} style={customStyling?.leftControls}>
              <button
                type="button"
                onClick={() => void togglePlay()}
                className="rsp-btn rsp-btn-primary"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <div className="rsp-volume-group">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="rsp-btn rsp-btn-ghost"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <div className="rsp-volume-slider-popover">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolume}
                    className="rsp-volume-slider"
                    style={{ writingMode: "vertical-lr", direction: "rtl" }}
                  />
                </div>
              </div>
            </div>

            <div className={ui.rightControls} style={customStyling?.rightControls}>
              <div ref={settingsRef} className="rsp-relative">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen((prev) => !prev)}
                  className="rsp-btn rsp-btn-ghost"
                  aria-label="Player settings"
                >
                  <Settings size={18} />
                </button>
                {isSettingsOpen ? (
                  <div className="rsp-settings-menu">
                    <div className="rsp-settings-group">
                      <label className="rsp-select-label">Subtitle</label>
                      <select
                        value={selectedSubtitle}
                        onChange={(event) => onSelectSubtitle(event.target.value)}
                        className="rsp-select"
                      >
                        {subtitleOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="rsp-settings-group">
                      <label className="rsp-select-label">Audio</label>
                      <select
                        value={selectedAudio}
                        onChange={(event) => onSelectAudio(event.target.value)}
                        className="rsp-select"
                      >
                        {audioOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="rsp-settings-group">
                      <label className="rsp-select-label">Resolution</label>
                      <select
                        value={selectedResolution}
                        onChange={(event) => onSelectResolution(event.target.value)}
                        className="rsp-select"
                      >
                        {resolutionOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : null}
              </div>
              <span className={ui.timePill} style={customStyling?.timePill}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="rsp-btn rsp-btn-ghost"
                aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
