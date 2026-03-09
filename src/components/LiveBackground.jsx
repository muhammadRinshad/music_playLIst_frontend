import { useEffect, useRef, useState, useMemo } from "react";
import { usePlayer } from "../context/PlayerContext";

const MUSIC_SYMBOLS = ["♪", "♫", "♬", "🎵", "🎶", "✦"];
const NOTE_COUNT = 24;
const DIRECTIONS = [
  { x: 0, y: -1 },   // up
  { x: 0.7, y: -0.7 }, // up-right
  { x: 1, y: 0 },    // right
  { x: 0.7, y: 0.7 },  // down-right
  { x: 0, y: 1 },    // down
  { x: -0.7, y: 0.7 }, // down-left
  { x: -1, y: 0 },   // left
  { x: -0.7, y: -0.7 }, // up-left
];
const RANDOM_ORIGIN_COUNT = 6;

function getRandomOrigins() {
  return Array.from({ length: RANDOM_ORIGIN_COUNT }, () => ({
    x: 15 + Math.random() * 70,
    y: 15 + Math.random() * 70,
  }));
}

export default function LiveBackground() {
  const { isPlaying, currentSong } = usePlayer();
  const sprayRef = useRef(null);
  const posRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);
  const initializedRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [origins, setOrigins] = useState([]);
  const randomOriginsRef = useRef([]);

  useEffect(() => {
    const isPointer = window.matchMedia("(pointer: fine)").matches;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!isPointer || prefersReduced) return;

    const handleMove = (e) => {
      if (!initializedRef.current) {
        posRef.current = { x: e.clientX, y: e.clientY };
        targetRef.current = { x: e.clientX, y: e.clientY };
        initializedRef.current = true;
        setReady(true);
      } else {
        targetRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const animate = () => {
      const { x: tx, y: ty } = targetRef.current;
      let { x, y } = posRef.current;
      const speed = 0.12;
      x += (tx - x) * speed;
      y += (ty - y) * speed;
      posRef.current = { x, y };

      if (sprayRef.current) {
        sprayRef.current.style.setProperty("--spray-x", `${x}px`);
        sprayRef.current.style.setProperty("--spray-y", `${y}px`);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    window.addEventListener("mousemove", handleMove);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isPlaying || !currentSong?._id) {
      setOrigins([]);
      return;
    }

    const updateOrigins = () => {
      const el = document.querySelector(`[data-song-id="${currentSong._id}"]`);
      if (el) {
        const rect = el.getBoundingClientRect();
        const inView =
          rect.top < window.innerHeight &&
          rect.bottom > 0 &&
          rect.left < window.innerWidth &&
          rect.right > 0;
        if (inView) {
          const x = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
          const y = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
          setOrigins([{ x, y }]);
          return;
        }
      }
      if (randomOriginsRef.current.length === 0) {
        randomOriginsRef.current = getRandomOrigins();
      }
      setOrigins([...randomOriginsRef.current]);
    };

    updateOrigins();
    const onScrollOrResize = () => updateOrigins();

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    const interval = setInterval(updateOrigins, 600);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      clearInterval(interval);
    };
  }, [isPlaying, currentSong?._id]);

  useEffect(() => {
    if (!isPlaying || !currentSong) return;
    randomOriginsRef.current = [];
  }, [currentSong?._id]);

  const showNotes = isPlaying && currentSong && origins.length > 0;

  const notesConfig = useMemo(() => {
    if (!showNotes) return [];
    return Array.from({ length: NOTE_COUNT }, (_, i) => {
      const origin = origins[i % origins.length];
      const dir = DIRECTIONS[i % DIRECTIONS.length];
      return {
        originX: origin.x,
        originY: origin.y,
        dirX: dir.x,
        dirY: dir.y,
        delay: (i / NOTE_COUNT) * 6,
        size: 0.6 + (i % 4) * 0.2,
        symbol: MUSIC_SYMBOLS[i % MUSIC_SYMBOLS.length],
      };
    });
  }, [showNotes, origins]);

  return (
    <div className="live-bg" aria-hidden="true">
      <div className="live-bg__blob live-bg__blob-1" />
      <div className="live-bg__blob live-bg__blob-2" />
      <div className="live-bg__blob live-bg__blob-3" />
      <div className="live-bg__blob live-bg__blob-4" />
      {ready && (
        <div ref={sprayRef} className="live-bg__spray" aria-hidden="true" />
      )}
      {showNotes && (
        <div className="live-bg__notes" aria-hidden="true">
          {notesConfig.map((cfg, i) => (
            <span
              key={i}
              className="live-bg__note"
              style={{
                "--origin-x": `${cfg.originX}%`,
                "--origin-y": `${cfg.originY}%`,
                "--dir-x": cfg.dirX,
                "--dir-y": cfg.dirY,
                "--note-delay": `${cfg.delay}s`,
                "--note-size": cfg.size,
              }}
            >
              {cfg.symbol}
            </span>
          ))}
        </div>
      )}
      <div className="live-bg__shimmer" />
      <div className="live-bg__vignette" />
    </div>
  );
}
