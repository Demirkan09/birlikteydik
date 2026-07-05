"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, RotateCcw } from "lucide-react";

interface VideoPlayerProProps {
  src: string;
}

export default function VideoPlayerPro({ src }: VideoPlayerProProps) {
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
      className="relative w-full overflow-hidden rounded-xl bg-black/40 border border-white/5 group aspect-video"
      onMouseMove={triggerControlsVisibility}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onClick={togglePlay}
      style={{ cursor: "pointer" }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover block"
        loop
        playsInline
        autoPlay
        muted={isMuted}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedData={() => setIsLoaded(true)}
      />

      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Play/Pause Overlay Centered Button */}
      <div
        className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-black/60 backdrop-blur-md border border-white/10 text-white/90 shadow-xl transition-all duration-300 hover:scale-110 hover:bg-black/80 hover:text-white">
          {isPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current translate-x-0.5" />
          )}
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-all duration-300 flex flex-col gap-3 select-none ${
          showControls || !isPlaying ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar */}
        <div
          className="h-1 w-full bg-white/20 rounded-full cursor-pointer relative group/progress transition-all duration-200 hover:h-1.5"
          onClick={handleProgressClick}
        >
          <div
            className="absolute top-0 left-0 h-full bg-amber-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between text-white/80">
          <button
            onClick={togglePlay}
            className="hover:text-white transition-colors p-1"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleMute}
            className="hover:text-white transition-colors p-1"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
