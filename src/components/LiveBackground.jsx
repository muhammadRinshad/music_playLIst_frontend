import { useEffect, useRef, useState } from "react";

export default function LiveBackground() {
  const sprayRef = useRef(null);
  const posRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);
  const initializedRef = useRef(false);
  const [ready, setReady] = useState(false);

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

  return (
    <div className="live-bg" aria-hidden="true">
      <div className="live-bg__blob live-bg__blob-1" />
      <div className="live-bg__blob live-bg__blob-2" />
      <div className="live-bg__blob live-bg__blob-3" />
      <div className="live-bg__blob live-bg__blob-4" />
      {ready && (
        <div
          ref={sprayRef}
          className="live-bg__spray"
          aria-hidden="true"
        />
      )}
      <div className="live-bg__shimmer" />
      <div className="live-bg__vignette" />
    </div>
  );
}
