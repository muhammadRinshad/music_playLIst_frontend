import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import API from "../api/axios";

const PlayerContext = createContext();

const DEFAULT_VOLUME = 1;

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(() => {
    const v = localStorage.getItem("playerVolume");
    const n = parseFloat(v);
    return !isNaN(n) && n >= 0 && n <= 1 ? n : DEFAULT_VOLUME;
  });
  const audioRef = useRef(null);
  const lastPlayedIdRef = useRef(null);

  const setVolume = useCallback((v) => {
    const val = Math.max(0, Math.min(1, v));
    setVolumeState(val);
    if (audioRef.current) audioRef.current.volume = val;
    localStorage.setItem("playerVolume", String(val));
  }, []);

  const play = useCallback((song) => {
    if (song) {
      if (lastPlayedIdRef.current !== song._id) {
        lastPlayedIdRef.current = song._id;
        API.post(`/song/recordPlay/${song._id}`).catch(() => {});
      }
      setCurrentSong(song);
      setIsPlaying(true);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!currentSong) return;
    setIsPlaying((p) => !p);
  }, [currentSong]);

  const pause = useCallback(() => setIsPlaying(false), []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume;
  }, [volume, currentSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
    };
  }, [currentSong]);

  const seek = useCallback((time) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const value = {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    setVolume,
    play,
    togglePlay,
    pause,
    seek,
    audioRef
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
