import { useEffect, useRef, useState } from "react";

/**
 * Hook that returns true when the element is in viewport.
 * Uses IntersectionObserver for efficient lazy-loading / infinite scroll.
 * @param {string} rootMargin - Margin around root to trigger early (e.g. "200px")
 */
export function useInView(rootMargin = "200px") {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin, threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return [ref, inView];
}
