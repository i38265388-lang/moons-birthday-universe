import confetti from 'canvas-confetti';

type RGB = [number, number, number];

export const PALETTES: Record<string, RGB[]> = {
  birthday: [[255, 209, 102], [255, 123, 172], [185, 162, 255], [135, 206, 250], [255, 255, 255]],
  rainbow: [[255, 99, 132], [255, 159, 64], [255, 205, 86], [75, 192, 192], [54, 162, 235], [153, 102, 255]],
  gold: [[255, 215, 0], [255, 235, 150], [255, 184, 77], [255, 255, 255]],
  pastel: [[255, 183, 197], [181, 226, 255], [203, 255, 182], [255, 231, 168], [214, 190, 255]],
  cosmic: [[200, 180, 255], [130, 180, 255], [255, 220, 140], [255, 255, 255]],
};

export interface BurstOptions {
  colors?: RGB[];
  particleCount?: number;
  spread?: number;
  scalar?: number;
  origin?: { x?: number; y?: number };
  shapes?: confetti.Shape[];
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

/** A single celebratory confetti pop. */
export function burstConfetti(options: BurstOptions = {}): void {
  if (prefersReducedMotion()) return;
  const {
    colors = PALETTES.birthday,
    particleCount = 90,
    spread = 70,
    scalar = 1,
    origin = { y: 0.6 },
    shapes,
  } = options;
  confetti({
    particleCount,
    spread,
    scalar,
    startVelocity: 28 + Math.random() * 18,
    ticks: 180,
    gravity: 0.9,
    decay: 0.92,
    colors: colors.map((c) => `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`),
    origin: { x: origin.x ?? 0.5, y: origin.y ?? 0.6 },
    shapes,
    disableForReducedMotion: true,
    zIndex: 100,
  });
}

/** Two cannons firing from the lower corners. */
export function sideCannons(colors = PALETTES.birthday, particleCount = 70): void {
  if (prefersReducedMotion()) return;
  const hex = colors.map((c) => `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`);
  confetti({
    particleCount,
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 0.75 },
    colors: hex,
    disableForReducedMotion: true,
    zIndex: 100,
  });
  confetti({
    particleCount,
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 0.75 },
    colors: hex,
    disableForReducedMotion: true,
    zIndex: 100,
  });
}

/** Star-shaped confetti (async because canvas-confetti builds the shape). */
export async function burstStars(colors = PALETTES.gold, particleCount = 60): Promise<void> {
  if (prefersReducedMotion()) return;
  try {
    const star = confetti.shapeFromText({ text: '★', scalar: 2, color: '#ffd76a' });
    burstConfetti({ colors, particleCount, spread: 90, shapes: [star] });
  } catch {
    burstConfetti({ colors, particleCount, spread: 90 });
  }
}

/** A single firework shell bursting in the sky. */
export function launchFirework(x?: number, y?: number, colors = PALETTES.cosmic): void {
  if (prefersReducedMotion()) return;
  const px = x ?? 0.15 + Math.random() * 0.7;
  const py = y ?? 0.15 + Math.random() * 0.4;
  confetti({
    particleCount: 70 + Math.floor(Math.random() * 50),
    spread: 360,
    startVelocity: 32,
    gravity: 0.75,
    decay: 0.93,
    ticks: 160,
    scalar: 0.95,
    colors: colors.map((c) => `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`),
    origin: { x: px, y: py },
    shapes: [Math.random() > 0.7 ? 'circle' : 'square'],
    disableForReducedMotion: true,
    zIndex: 100,
  });
}

/**
 * Runs a firework show for `durationMs`. Returns a stop function so callers can
 * clean it up (important for React unmounting).
 */
export function launchFireworks(durationMs = 6000, colors = PALETTES.cosmic): () => void {
  launchFirework(undefined, undefined, colors);
  if (prefersReducedMotion()) return () => undefined;
  const started = Date.now();
  const interval = window.setInterval(() => {
    if (Date.now() - started >= durationMs) {
      window.clearInterval(interval);
      return;
    }
    launchFirework(undefined, undefined, colors);
  }, 380);
  return () => window.clearInterval(interval);
}

/** Big "grand finale" burst sequence. Returns a cleanup function. */
export function grandFinale(): () => void {
  if (prefersReducedMotion()) return () => undefined;
  sideCannons(PALETTES.birthday, 120);
  const timers: number[] = [];
  [250, 600, 1000, 1500, 2100, 2800].forEach((delay, i) => {
    timers.push(window.setTimeout(() => {
      launchFirework(0.2 + (i % 4) * 0.2, 0.2 + (i % 3) * 0.12, PALETTES[i % 2 ? 'rainbow' : 'cosmic']);
    }, delay));
  });
  const stop = launchFireworks(4500);
  return () => {
    timers.forEach(window.clearTimeout);
    stop();
  };
}
