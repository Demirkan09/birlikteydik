"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface VideoPlayerProProps {
  src: string;
  style?: React.CSSProperties;
}

export default function VideoPlayerPro({ src, style }: VideoPlayerProProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play attempt on mount
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlayAttempt = async () => {
      try {
        video.muted = true;
        setIsMuted(true);
        await video.play();
        setIsPlaying(true);
      } catch (err) {
        console.log("Autoplay blocked, user interaction required:", err);
        setIsPlaying(false);
      }
    };

    if (video.readyState >= 3) {
      handlePlayAttempt();
    } else {
      video.addEventListener("loadeddata", handlePlayAttempt);
    }

    return () => {
      video.removeEventListener("loadeddata", handlePlayAttempt);
    };
  }, [src]);

  // Track progress
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    const currentProgress = (video.currentTime / video.duration) * 100;
    setProgress(isNaN(currentProgress) ? 0 : currentProgress);
  };

  // Toggle play/pause
  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      try {
        await video.play();
        setIsPlaying(true);
      } catch (err) {
        console.error("Failed to play video:", err);
      }
    }
    triggerControlsVisibility();
  };

  // Toggle mute
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
    triggerControlsVisibility();
  };

  // Click on progress bar to seek
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * video.duration;
    video.currentTime = isNaN(newTime) ? 0 : newTime;
  };

  // Handle controls auto-hide
  const triggerControlsVisibility = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      onMouseMove={triggerControlsVisibility}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onClick={togglePlay}
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        borderRadius: "12px",
        backgroundColor: "rgba(0,0,0,0.4)",
        border: "1px solid rgba(255,255,255,0.05)",
        cursor: "pointer",
        aspectRatio: "16 / 9",
        display: "block",
        ...style
      }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block"
        }}
        loop
        playsInline
        autoPlay
        muted={isMuted}
        preload="auto"
        onPlay={() => {
          setIsPlaying(true);
          setIsLoaded(true);
        }}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedData={() => setIsLoaded(true)}
        onLoadedMetadata={() => setIsLoaded(true)}
        onCanPlay={() => setIsLoaded(true)}
      />

      {/* Loading Overlay */}
      {!isLoaded && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.6)", zIndex: 5, pointerEvents: "none" }}>
          <div style={{ width: "32px", height: "32px", border: "2px solid rgba(245,158,11,0.2)", borderTopColor: "#f59e0b", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        </div>
      )}

      {/* Play/Pause Overlay Centered Button */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0.2)",
          transition: "opacity 0.3s ease",
          opacity: showControls || !isPlaying ? 1 : 0,
          pointerEvents: showControls || !isPlaying ? "auto" : "none",
          zIndex: 4
        }}
      >
        <div style={{ width: "56px", height: "56px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.9)", transition: "transform 0.3s ease" }}>
          {isPlaying ? (
            <Pause style={{ width: "24px", height: "24px", fill: "currentColor" }} />
          ) : (
            <Play style={{ width: "24px", height: "24px", fill: "currentColor", transform: "translateX(1px)" }} />
          )}
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "16px",
          background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)",
          transition: "all 0.3s ease",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          opacity: showControls || !isPlaying ? 1 : 0,
          pointerEvents: showControls || !isPlaying ? "auto" : "none",
          zIndex: 4
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar */}
        <div
          style={{ height: "4px", width: "100%", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "9999px", cursor: "pointer", position: "relative" }}
          onClick={handleProgressClick}
        >
          <div
            style={{ position: "absolute", top: 0, left: 0, height: "100%", backgroundColor: "#f59e0b", borderRadius: "9999px", width: `${progress}%` }}
          />
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "rgba(255,255,255,0.8)" }}>
          <button
            onClick={togglePlay}
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: "4px" }}
          >
            {isPlaying ? <Pause style={{ width: "16px", height: "16px" }} /> : <Play style={{ width: "16px", height: "16px" }} />}
          </button>

          <button
            onClick={toggleMute}
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: "4px" }}
          >
            {isMuted ? <VolumeX style={{ width: "16px", height: "16px" }} /> : <Volume2 style={{ width: "16px", height: "16px" }} />}
          </button>
        </div>
      </div>
    </div>
  );
}
