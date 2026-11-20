import { useMemo } from 'react';
import { cn } from '../utils/cn';

interface FloatingEmojisProps {
  items: string[];
  count?: number;
  className?: string;
  itemClassName?: string;
  /** Seconds for one full drift. */
  duration?: number;
  size?: string;
  opacity?: number;
}

interface Floater {
  id: number;
  emoji: string;
  left: number;
  delay: number;
  duration: number;
  scale: number;
  blur: number;
}

/**
 * Purely decorative ambient emoji drifting upward. Pointer-events are disabled
 * so it can safely sit behind interactive content.
 */
export function FloatingEmojis({
  items,
  count = 14,
  className,
  itemClassName,
  duration = 22,
  size = 'text-2xl sm:text-3xl',
  opacity = 0.7,
}: FloatingEmojisProps) {
  const floaters = useMemo<Floater[]>(() => {
    if (items.length === 0) return [];
    return Array.from({ length: count }, (_, index) => ({
      id: index,
      emoji: items[index % items.length],
      left: Math.random() * 100,
      delay: -Math.random() * duration,
      duration: duration * (0.7 + Math.random() * 0.8),
      scale: 0.6 + Math.random() * 0.9,
      blur: Math.random() > 0.75 ? 1.4 : 0,
    }));
  }, [items, count, duration]);

  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      {floaters.map((f) => (
        <span
          key={f.id}
          className={cn('absolute bottom-0 select-none will-change-transform', size, itemClassName)}
          style={{
            left: `${f.left}%`,
            opacity,
            filter: f.blur ? `blur(${f.blur}px)` : undefined,
            animation: `rise ${f.duration}s linear infinite`,
            animationDelay: `${f.delay}s`,
            fontSize: undefined,
            transform: `scale(${f.scale})`,
          }}
        >
          {f.emoji}
        </span>
      ))}
    </div>
  );
}
