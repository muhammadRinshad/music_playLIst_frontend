import { useRef } from "react";
import { usePlayer } from "../context/PlayerContext";

export default function NowPlayingBar() {
  const { currentSong, isPlaying, currentTime, duration, volume, setVolume, togglePlay, seek, audioRef } = usePlayer();
  const progressRef = useRef(null);

  if (!currentSong) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    seek(pct * duration);
  };

  const formatTime = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <audio ref={audioRef} src={currentSong.filePath} className="hidden" />
      <div className="now-playing-bar">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 overflow-hidden">
          <div className={`now-playing-bar__cover ${isPlaying ? "now-playing-bar__cover--playing" : ""}`}>
            {currentSong.coverUrl ? (
              <img src={currentSong.coverUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-base sm:text-lg md:text-xl opacity-60">♪</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate text-xs sm:text-sm text-zinc-900 dark:text-white">{currentSong.title}</p>
            <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 truncate">{currentSong.artist}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-[1.5] sm:flex-[2] min-w-0 max-w-[180px] sm:max-w-xs md:max-w-md lg:max-w-2xl">
          <button
            onClick={togglePlay}
            className={`now-playing-bar__play-btn shrink-0 ${isPlaying ? "now-playing-bar__play-btn--playing" : ""}`}
          >
            {isPlaying ? (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <div className="flex flex-1 items-center gap-2 min-w-0">
            <span className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-500 tabular-nums shrink-0 hidden sm:inline">{formatTime(currentTime)}</span>
            <div
              ref={progressRef}
              onClick={handleProgressClick}
              className="now-playing-bar__progress-track flex-1 min-w-0"
            >
              <div
                className="now-playing-bar__progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-500 tabular-nums shrink-0 hidden sm:inline">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2 flex-1 max-w-24 md:max-w-32 shrink-0 justify-end">
          <button
            onClick={() => setVolume(volume > 0 ? 0 : 1)}
            className="now-playing-bar__vol-btn"
            title={volume > 0 ? "Mute" : "Unmute"}
          >
            {volume === 0 ? (
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="now-playing-bar__volume"
            title="Volume"
          />
        </div>
      </div>
    </>
  );
}
