import { useEffect, useRef } from 'react';
import { cn } from '../utils/cn';

interface Star {
  x: number;
  y: number;
  r: number;
  base: number;
  phase: number;
  speed: number;
  hue: number;
}

interface StarFieldProps {
  /** Roughly how many stars to draw. Scaled down automatically on small screens. */
  density?: number;
  className?: string;
  color?: string;
  /** Very subtle shooting stars. Off by default to keep things calm. */
  shootingStars?: boolean;
}

/**
 * A lightweight canvas star field. One animation frame loop, no React state,
 * and it stops drawing when the tab is hidden. Reduced-motion gets a static sky.
 */
export function StarField({
  density = 110,
  className,
  color = '255, 255, 255',
  shootingStars = false,
}: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let frame = 0;
    let start = performance.now();
    let hidden = false;

    const buildStars = () => {
      const count = Math.round(
        Math.min(220, Math.max(30, (density * width * height) / 1_000_000)),
      );
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.4 + Math.random() * 1.4,
        base: 0.25 + Math.random() * 0.65,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.2,
        hue: Math.random(),
      }));
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStars();
      if (reduced) draw(0);
    };

    const draw = (now: number) => {
      if (!width || !height) return;
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, width, height);
      for (const s of stars) {
        const twinkle = reduced ? s.base : s.base + Math.sin(t * s.speed + s.phase) * 0.28;
        const alpha = Math.max(0.05, Math.min(1, twinkle));
        const tint = s.hue > 0.72 ? '255, 226, 168' : s.hue < 0.2 ? '198, 220, 255' : color;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${tint}, ${alpha})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (s.r > 1.25) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(${tint}, ${alpha * 0.12})`;
          ctx.arc(s.x, s.y, s.r * 3.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (shootingStars && !reduced && Math.random() < 0.0022) {
        drawShootingStar();
      }
    };

    let shooting: { x: number; y: number; vx: number; vy: number; life: number } | null = null;

    const drawShootingStar = () => {
      shooting = {
        x: Math.random() * width * 0.8,
        y: Math.random() * height * 0.35,
        vx: 5 + Math.random() * 3,
        vy: 2 + Math.random() * 1.5,
        life: 1,
      };
    };

    const loop = (now: number) => {
      if (!hidden) {
        draw(now);
        if (shooting) {
          const s = shooting;
          s.x += s.vx;
          s.y += s.vy;
          s.life -= 0.025;
          const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 16, s.y - s.vy * 16);
          grad.addColorStop(0, `rgba(255,255,255,${Math.max(0, s.life)})`);
          grad.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x - s.vx * 16, s.y - s.vy * 16);
          ctx.stroke();
          if (s.life <= 0) shooting = null;
        }
      }
      frame = window.requestAnimationFrame(loop);
    };

    const onVisibility = () => {
      hidden = document.hidden;
    };

    resize();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    if (observer && canvas.parentElement) observer.observe(canvas.parentElement);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    start = performance.now();
    if (!reduced) frame = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      observer?.disconnect();
    };
  }, [density, color, shootingStars]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
    />
  );
}
