import { useMemo } from 'react';

interface ParticleFieldProps {
  colors?: string[];
  count?: number;
  variant?: 'stars' | 'bubbles' | 'petals' | 'sparkles';
  className?: string;
}

/** Deterministic pseudo-random so particles don't jump between renders. */
function seeded(i: number, salt: number): number {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function ParticleField({
  colors = ['#ffffff', '#ffe9a8', '#c9b6ff'],
  count = 36,
  variant = 'stars',
  className = '',
}: ParticleFieldProps) {
  const colorKey = colors.join(',');
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: seeded(i, 1) * 100,
        top: seeded(i, 2) * 100,
        size: 8 + seeded(i, 3) * 16,
        delay: seeded(i, 4) * 8,
        duration: 8 + seeded(i, 5) * 12,
        opacity: 0.25 + seeded(i, 6) * 0.6,
        color: colors[i % colors.length],
        glyph:
          variant === 'stars'
            ? seeded(i, 7) > 0.5 ? '✦' : '✧'
            : variant === 'petals'
              ? seeded(i, 7) > 0.5 ? '❀' : '✿'
              : seeded(i, 7) > 0.5 ? '✦' : '✧',
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count, variant, colorKey],
  );

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {particles.map((p, i) => {
        if (variant === 'bubbles') {
          return (
            <span
              key={i}
              className="absolute rounded-full border shadow-[inset_0_0_8px_rgba(255,255,255,0.5)] particle-drift"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: p.size * 1.6,
                height: p.size * 1.6,
                borderColor: `${p.color}88`,
                opacity: p.opacity * 0.7,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            />
          );
        }
        return (
          <span
            key={i}
            className={`absolute select-none particle-twinkle ${variant === 'petals' ? 'particle-sway' : ''}`}
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              fontSize: p.size,
              color: p.color,
              opacity: p.opacity,
              textShadow: `0 0 12px ${p.color}`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          >
            {p.glyph}
          </span>
        );
      })}
    </div>
  );
}

export default ParticleField;
