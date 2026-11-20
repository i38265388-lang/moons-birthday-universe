import { useEffect, useRef, useState } from 'react';

/** A soft trailing glow for desktop pointers. Disabled on touch devices. */
export function CursorGlow() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const fine = window.matchMedia?.('(pointer: fine)').matches === true;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
    setEnabled(fine && !reduced);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const el = dotRef.current;
    if (!el) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let x = targetX;
    let y = targetY;
    let frame = 0;

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const loop = () => {
      x += (targetX - x) * 0.12;
      y += (targetY - y) * 0.12;
      el.style.transform = `translate3d(${x - 160}px, ${y - 160}px, 0)`;
      frame = window.requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    frame = window.requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.cancelAnimationFrame(frame);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[5] h-[320px] w-[320px] rounded-full opacity-60 mix-blend-screen will-change-transform"
      style={{
        background:
          'radial-gradient(circle, rgba(255,224,150,0.16) 0%, rgba(185,162,255,0.10) 38%, transparent 68%)',
      }}
    />
  );
}
