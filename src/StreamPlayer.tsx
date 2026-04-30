"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Clapperboard,
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
import type { StreamPlayerClassNames, StreamPlayerProps } from "./types";
import "./stream-player.css";
import { ensureStreamPlayerStyles } from "./ensureStyles";

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

  useEffect(() => {
    ensureStreamPlayerStyles();
  }, []);

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
    if (isFullscreen && isPlaying) {
      scheduleControlsHide();
    }
  }, [isFullscreen, isPlaying, scheduleControlsHide]);

  useEffect(() => {
    if (isFullscreen && isPlaying) {
      setAreControlsVisible(true);
      scheduleControlsHide();
      return;
    }

    clearControlsHideTimer();
    setAreControlsVisible(true);
  }, [clearControlsHideTimer, isFullscreen, isPlaying, scheduleControlsHide]);

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
          )}
          style={customStyling?.topOverlay}
        >
          <div className="rsp-top-inner">
            <div>
              <p className="rsp-title">{title}</p>
            </div>
          </div>
        </div>

        {isBuffering ? (
          <div className="rsp-buffer-overlay">
            <div className="rsp-buffer-chip">
              <span className="rsp-spinner" />
              Buffering...
            </div>
          </div>
        ) : null}

        {!isPlaying && !isBuffering ? (
          <div className="rsp-center-overlay">
            <button
              type="button"
              onClick={togglePlay}
              className="rsp-main-play-btn"
              aria-label="Play"
            >
              <Play size={24} />
            </button>
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
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="rsp-progress"
            style={{
              ...customStyling?.progress,
              background: `linear-gradient(to right, #3b82f6 ${progress}%, #334155 ${progress}%)`,
            }}
          />

          <div className="rsp-controls-row">
            <div className={ui.leftControls} style={customStyling?.leftControls}>
              <button
                type="button"
                onClick={() => seekBy(-10)}
                className="rsp-btn rsp-btn-ghost"
                aria-label="Back 10 seconds"
              >
                <span className="rsp-btn-icon-group">
                  <RotateCcw size={16} />
                  <span className="rsp-btn-caption">10</span>
                </span>
              </button>
              <button
                type="button"
                onClick={togglePlay}
                className="rsp-btn rsp-btn-primary"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button
                type="button"
                onClick={() => seekBy(10)}
                className="rsp-btn rsp-btn-ghost"
                aria-label="Forward 10 seconds"
              >
                <span className="rsp-btn-icon-group">
                  <span className="rsp-btn-caption">10</span>
                  <RotateCw size={16} />
                </span>
              </button>
              {onNext ? (
                <button
                  type="button"
                  onClick={onNext}
                  className="rsp-btn rsp-btn-ghost"
                  aria-label="Next episode"
                >
                  <SkipForward size={16} />
                </button>
              ) : null}
              <div ref={settingsRef} className="rsp-relative">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen((prev) => !prev)}
                  className="rsp-btn rsp-btn-ghost"
                  aria-label="Player settings"
                >
                  <Settings size={16} />
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
            </div>

            <div className={ui.rightControls} style={customStyling?.rightControls}>
              {showLogo && customLogo ? (
                <span className={ui.logoPill} style={customStyling?.logoPill}>
                  {customLogo}
                </span>
              ) : showLogo ? (
                <span className={ui.logoPill} style={customStyling?.logoPill}>
                  <Clapperboard size={14} />
                </span>
              ) : null}
              <div className="rsp-volume-group">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="rsp-icon-btn"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
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
              <span className={ui.timePill} style={customStyling?.timePill}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="rsp-btn rsp-btn-chip"
                aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
