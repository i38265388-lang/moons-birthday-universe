import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PartyPopper, Play, RotateCcw, Sparkles, Star, Timer, Trophy, Zap } from 'lucide-react';
import { useSurprises } from '../context/SurpriseContext';
import { useAudio } from '../context/AudioContext';
import { LAYERS } from '../data/surprises';
import { CONFETTI_LABELS, POP_MESSAGES } from '../data/wishes';
import { burstConfetti, burstStars, launchFirework, PALETTES, sideCannons } from '../utils/fx';
import { NoRepeatPool, randomFrom } from '../utils/random';
import {
  Balloon,
  GlowButton,
  ParticleField,
  RevealCard,
  SceneHeader,
  SurpriseDots,
  TypingText,
} from '../components/ui';

const META = LAYERS[4];

const BALLOON_COLORS = ['#ff5d8f', '#ffd166', '#ff8a5b', '#ff6bb5', '#f45b69', '#ffb347', '#ffe083'];
const BUNTING_COLORS = ['#ff5d8f', '#ffd166', '#fff0d6', '#ff8a5b', '#ff6bb5', '#ffcf5c'];
const GAME_SECONDS = 20;

interface PartyBalloon {
  id: number;
  color: string;
  alive: boolean;
}

interface FallingStar {
  id: number;
  left: number;
  duration: number;
  glyph: string;
}

type GamePhase = 'idle' | 'playing' | 'finished';

/** Every result is playful and encouraging — nobody loses at this carnival. */
function gameResult(score: number): { emoji: string; title: string; message: string } {
  if (score === 0) {
    return {
      emoji: '🧘',
      title: 'A Masterclass in Patience',
      message:
        'You proved patience is a superpower! 🌟 Sometimes the calmest hands win the loveliest prizes. Your reward is a whole day of easy, happy moments — no rushing required.',
    };
  }
  if (score < 5) {
    return {
      emoji: '🌟',
      title: 'Sweet Moves!',
      message: `You caught ${score} star${score === 1 ? '' : 's'}, and every single one counted. Nothing beats the simple joy of a little carnival win — especially on your birthday!`,
    };
  }
  if (score < 10) {
    return {
      emoji: '✨',
      title: 'Star Catcher Extraordinaire!',
      message: `${score} stars! Your reflexes are officially carnival-legendary. Here is to a year where every good thing comes zooming straight to you.`,
    };
  }
  return {
    emoji: '🏆',
    title: 'Absolutely Stellar!',
    message: `${score} stars caught — incredible! You brought the whole big top to life. May your birthday year be just as bright, bold and wonderfully yours.`,
  };
}

export default function Layer05() {
  const { completeSurprise, isComplete, showToast } = useSurprises();
  const { playSfx } = useAudio();

  // Timers created inside event handlers must never call a stale completion
  // callback (context identities change as progress is saved).
  const completeRef = useRef(completeSurprise);
  useEffect(() => {
    completeRef.current = completeSurprise;
  }, [completeSurprise]);

  // ---- shared short-lived timers (balloon respawns) -----------------------
  const timersRef = useRef<number[]>([]);
  const schedule = useCallback((fn: () => void, delay: number) => {
    timersRef.current.push(window.setTimeout(fn, delay));
  }, []);
  useEffect(
    () => () => {
      timersRef.current.forEach(window.clearTimeout);
    },
    [],
  );

  // ---- Surprise 1 — Balloon Pop Challenge --------------------------------
  const popPool = useRef(new NoRepeatPool<string>(POP_MESSAGES)).current;
  const balloonIdRef = useRef(0);
  const bubbleIdRef = useRef(0);
  const poppingRef = useRef<Set<number>>(new Set());
  const [balloons, setBalloons] = useState<PartyBalloon[]>(() =>
    Array.from({ length: 12 }, () => ({
      id: ++balloonIdRef.current,
      color: randomFrom(BALLOON_COLORS) ?? BALLOON_COLORS[0],
      alive: true,
    })),
  );
  const [popCount, setPopCount] = useState(0);
  const [bubble, setBubble] = useState<{ id: number; message: string } | null>(null);

  const popBalloon = (id: number) => {
    if (poppingRef.current.has(id)) return;
    poppingRef.current.add(id);

    setBalloons((prev) => prev.map((b) => (b.id === id ? { ...b, alive: false } : b)));

    const message = popPool.next() ?? POP_MESSAGES[0];
    setBubble({ id: ++bubbleIdRef.current, message });
    setPopCount((n) => n + 1);
    playSfx('pop');
    burstConfetti({
      particleCount: 22,
      spread: 68,
      colors: [
        [255, 209, 102],
        [255, 123, 172],
        [255, 255, 255],
      ],
    });
    completeRef.current('l5-s1');

    // A fresh balloon drifts back in so the booth never runs out.
    schedule(() => {
      poppingRef.current.delete(id);
      setBalloons((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                id: ++balloonIdRef.current,
                color: randomFrom(BALLOON_COLORS) ?? BALLOON_COLORS[0],
                alive: true,
              }
            : b,
        ),
      );
    }, 820);
  };

  // ---- Surprise 2 — The Confetti Button ----------------------------------
  // Drawing effect indices from a NoRepeatPool keeps the label paired with its
  // explosion and guarantees a different blast every single click.
  const effectPool = useRef(new NoRepeatPool<number>([0, 1, 2, 3, 4, 5])).current;
  const effectIdRef = useRef(0);
  const [blastCount, setBlastCount] = useState(0);
  const [lastEffect, setLastEffect] = useState<{ id: number; label: string } | null>(null);

  const fireEffect = (effect: number) => {
    switch (effect) {
      case 0:
        burstConfetti({
          particleCount: 120,
          spread: 100,
          colors: PALETTES.birthday,
          shapes: ['circle'],
        });
        playSfx('gift');
        break;
      case 1:
        sideCannons(PALETTES.rainbow, 90);
        playSfx('whoosh');
        break;
      case 2:
        void burstStars(PALETTES.gold, 80);
        playSfx('chime');
        break;
      case 3:
        launchFirework(undefined, undefined, PALETTES.cosmic);
        playSfx('fireworks');
        break;
      case 4:
        burstConfetti({
          particleCount: 140,
          spread: 120,
          scalar: 1.35,
          origin: { x: 0.5, y: 0.78 },
          colors: PALETTES.pastel,
          shapes: ['square'],
        });
        playSfx('gift');
        break;
      default:
        sideCannons(PALETTES.gold, 100);
        burstConfetti({ particleCount: 80, spread: 70, colors: PALETTES.rainbow });
        playSfx('fireworks');
        break;
    }
  };

  const pressConfetti = () => {
    const effect = effectPool.next() ?? 0;
    const label = CONFETTI_LABELS[effect] ?? CONFETTI_LABELS[0];
    setLastEffect({ id: ++effectIdRef.current, label });
    setBlastCount((n) => n + 1);
    fireEffect(effect);
    showToast(`🎊 ${label}`, 'info', 2800);
    completeRef.current('l5-s2');
  };

  // ---- Surprise 3 — Catch the Falling Stars ------------------------------
  const gameTimersRef = useRef<number[]>([]);
  const timeRef = useRef(GAME_SECONDS);
  const starIdRef = useRef(0);
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState<FallingStar[]>([]);

  const clearGameTimers = useCallback(() => {
    gameTimersRef.current.forEach((id) => {
      window.clearInterval(id);
      window.clearTimeout(id);
    });
    gameTimersRef.current = [];
  }, []);

  useEffect(() => () => clearGameTimers(), [clearGameTimers]);

  const finishGame = useCallback(() => {
    clearGameTimers();
    setStars([]);
    setPhase('finished');
    completeRef.current('l5-s3');
    playSfx('crown');
    burstConfetti({ particleCount: 80, spread: 95, colors: PALETTES.gold });
  }, [clearGameTimers, playSfx]);

  const spawnStar = useCallback(() => {
    const star: FallingStar = {
      id: ++starIdRef.current,
      left: 4 + Math.random() * 76,
      duration: 2400 + Math.random() * 700,
      glyph: Math.random() > 0.45 ? '⭐' : '🌟',
    };
    // Keep at most six stars on screen at once.
    setStars((prev) => [...prev.slice(-5), star]);
  }, []);

  const startGame = () => {
    clearGameTimers();
    setScore(0);
    setStars([]);
    timeRef.current = GAME_SECONDS;
    setTimeLeft(GAME_SECONDS);
    setPhase('playing');
    playSfx('whoosh');
    spawnStar();

    gameTimersRef.current.push(window.setInterval(spawnStar, 780));
    gameTimersRef.current.push(
      window.setInterval(() => {
        timeRef.current -= 1;
        setTimeLeft(timeRef.current);
        if (timeRef.current <= 0) finishGame();
      }, 1000),
    );
  };

  const catchStar = (id: number) => {
    setStars((prev) => prev.filter((s) => s.id !== id));
    setScore((n) => n + 1);
    playSfx('chime');
    burstConfetti({
      particleCount: 16,
      spread: 60,
      colors: [
        [255, 209, 102],
        [255, 255, 255],
        [255, 123, 172],
      ],
    });
  };

  const result = gameResult(score);
  const found = [isComplete('l5-s1'), isComplete('l5-s2'), isComplete('l5-s3')].filter(Boolean).length;

  return (
    <div className="layer-scene relative mx-auto w-full max-w-5xl px-4 pb-12 pt-24 sm:px-6 sm:pt-28">
      {/* ---------- carnival scenery ---------- */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-3 opacity-90"
        style={{ background: 'repeating-linear-gradient(90deg,#ff5d8f 0 26px,#fff0d6 26px 52px)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-3 opacity-90"
        style={{ background: 'repeating-linear-gradient(90deg,#ffd166 0 26px,#ff5d8f 26px 52px)' }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-[#ff5d8f]/25 blur-[100px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-1/2 h-72 w-72 rounded-full bg-[#ffd166]/20 blur-[100px]" />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[84px] z-0 flex justify-center sm:top-[96px]"
        animate={{ rotate: [-0.7, 0.7, -0.7], y: [0, 3, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="relative flex w-full items-start justify-between">
          <span className="absolute left-0 right-0 top-0 h-px bg-white/35" />
          {Array.from({ length: 11 }).map((_, i) => (
            <span
              key={i}
              className="block h-0 w-0 drop-shadow-[0_4px_3px_rgba(0,0,0,0.35)]"
              style={{
                borderLeft: '13px solid transparent',
                borderRight: '13px solid transparent',
                borderTop: `26px solid ${BUNTING_COLORS[i % BUNTING_COLORS.length]}`,
                marginTop: 1,
              }}
            />
          ))}
        </div>
      </motion.div>

      <ParticleField count={22} variant="sparkles" colors={[META.accent, META.accent2, '#fff0d6', '#ffffff']} />

      <SceneHeader
        eyebrow="Layer 05 — The Celebration Carnival"
        emoji={META.emoji}
        title="Step right up, Moon!"
        subtitle="Three cheerful games are waiting under the big top. Play them all to keep the carnival spinning!"
        accent={META.accent}
      />
      <SurpriseDots layer={5} className="relative z-10 mb-10" />

      {/* ---------- Surprise 1: Balloon Pop Challenge ---------- */}
      <section className="surprise-card glass-panel relative z-10 mx-auto mb-6 w-full max-w-3xl rounded-[28px] border border-white/15 bg-white/[0.07] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-md sm:p-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isComplete('l5-s1') ? 'bg-[#ffd166]/25' : 'bg-white/10'}`}>
              <Sparkles className={`h-6 w-6 ${isComplete('l5-s1') ? 'text-[#ffd166]' : 'text-[#ff9ecd]'}`} />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-white sm:text-xl">Balloon Pop Challenge</h3>
              <p className="font-body text-xs text-white/60">Tap every balloon to set off a little surprise.</p>
            </div>
          </div>
          <span className="rounded-full border border-[#ffd166]/40 bg-[#ffd166]/10 px-3 py-1.5 font-body text-xs font-bold text-[#ffd166]">
            {popCount} popped
          </span>
        </div>

        <div className="mx-auto grid max-w-xl grid-cols-3 justify-items-center gap-x-1 gap-y-1 sm:grid-cols-4">
          {balloons.map((b, index) => (
            <div key={index} className="relative flex h-[148px] w-[72px] items-start justify-center">
              <AnimatePresence>
                {b.alive ? (
                  <motion.div
                    key={`b-${b.id}`}
                    className="flex items-start justify-center"
                    initial={{ scale: 0.5, opacity: 0, y: 26 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0, opacity: 0, rotate: b.id % 2 ? 18 : -18 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  >
                    <Balloon color={b.color} size={68} onClick={() => popBalloon(b.id)} label="Pop this balloon for a surprise" />
                  </motion.div>
                ) : (
                  <motion.div
                    key={`p-${b.id}`}
                    className="pointer-events-none absolute inset-0 flex items-center justify-center"
                    initial={{ scale: 0.35, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-3xl drop-shadow-[0_0_12px_rgba(255,209,102,0.9)]">✷</span>
                    <span className="absolute left-0 top-7 text-lg text-[#ffd166]">✦</span>
                    <span className="absolute right-0 top-10 text-base text-[#ff9ecd]">✧</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="mt-1 flex min-h-[74px] justify-center">
          <AnimatePresence mode="wait">
            {bubble && (
              <motion.div
                key={bubble.id}
                className="relative max-w-md rounded-2xl border border-[#ffd166]/50 bg-[#2a0f36]/90 px-5 py-3 text-center shadow-[0_0_30px_rgba(255,209,102,0.25)]"
                initial={{ opacity: 0, y: 14, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              >
                <span className="absolute -top-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-[#ffd166]/50 bg-[#2a0f36]" />
                <p className="font-display text-sm font-bold text-[#ffe9a8] sm:text-base">
                  <TypingText text={bubble.message} speed={26} />
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ---------- Surprise 2: The Confetti Button ---------- */}
      <section className="surprise-card glass-panel relative z-10 mx-auto mb-6 w-full max-w-3xl overflow-hidden rounded-[28px] border border-white/15 bg-white/[0.07] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-md sm:p-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-1.5"
          style={{ background: 'repeating-linear-gradient(90deg,#ffd166 0 22px,#ff5d8f 22px 44px)' }}
        />
        <div className="flex items-center gap-3">
          <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isComplete('l5-s2') ? 'bg-[#ffd166]/25' : 'bg-white/10'}`}>
            <PartyPopper className={`h-6 w-6 ${isComplete('l5-s2') ? 'text-[#ffd166]' : 'text-[#ff7bac]'}`} />
          </span>
          <div>
            <h3 className="font-display text-lg font-bold text-white sm:text-xl">The Confetti Button</h3>
            <p className="font-body text-xs text-white/60">Every press fires a brand-new celebration.</p>
          </div>
        </div>

        <div className="relative mx-auto mt-6 flex max-w-md flex-col items-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[150px] w-[260px] -translate-x-1/2 -translate-y-1/2 sm:w-[320px]"
          >
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              const x = 50 + Math.cos(angle) * 44;
              const y = 50 + Math.sin(angle) * 42;
              return (
                <span
                  key={i}
                  className="animate-twinkle-soft absolute h-2.5 w-2.5 rounded-full shadow-[0_0_10px_2px_rgba(255,209,102,0.8)]"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    background: BUNTING_COLORS[i % BUNTING_COLORS.length],
                    animationDelay: `${i * 0.22}s`,
                  }}
                />
              );
            })}
          </div>

          <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <AnimatePresence>
              {blastCount > 0 && (
                <motion.span
                  key={blastCount}
                  className="block h-20 w-20 rounded-full border-4 border-[#ffd166]/70"
                  initial={{ scale: 0.4, opacity: 0.9 }}
                  animate={{ scale: 3.4, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                />
              )}
            </AnimatePresence>
          </div>

          <GlowButton
            variant="rainbow"
            size="xl"
            onClick={pressConfetti}
            className="relative z-10 !min-h-[88px] !rounded-full !px-10 !py-6 !text-2xl sm:!text-3xl"
          >
            <Zap className="h-6 w-6" /> FIRE THE CONFETTI! <PartyPopper className="h-6 w-6" />
          </GlowButton>

          <div className="pointer-events-none absolute -top-2 left-1/2 z-20 -translate-x-1/2">
            <AnimatePresence>
              {lastEffect && (
                <motion.div
                  key={lastEffect.id}
                  className="whitespace-nowrap rounded-full border border-[#ffd166]/60 bg-[#3a0f3f]/95 px-4 py-1.5 font-display text-sm font-bold text-[#ffe9a8] shadow-[0_0_24px_rgba(255,209,102,0.45)]"
                  initial={{ opacity: 0, y: 10, scale: 0.7 }}
                  animate={{ opacity: 1, y: -18, scale: 1 }}
                  exit={{ opacity: 0, y: -46, scale: 0.9 }}
                  transition={{ duration: 0.35 }}
                >
                  {lastEffect.label}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="relative z-10 mt-4 font-body text-xs text-white/55">
            Blasts fired: <span className="font-bold text-[#ffd166]">{blastCount}</span> · no two the same!
          </p>
        </div>
      </section>

      {/* ---------- Surprise 3: Catch the Falling Stars ---------- */}
      <section className="surprise-card glass-panel relative z-10 mx-auto w-full max-w-3xl rounded-[28px] border border-white/15 bg-white/[0.07] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-md sm:p-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isComplete('l5-s3') ? 'bg-[#ffd166]/25' : 'bg-white/10'}`}>
              <Star className={`h-6 w-6 ${isComplete('l5-s3') ? 'text-[#ffd166]' : 'text-[#ff9ecd]'}`} />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-white sm:text-xl">Catch the Falling Stars</h3>
              <p className="font-body text-xs text-white/60">A 20-second carnival game, easy to play and impossible not to smile.</p>
            </div>
          </div>
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 font-body text-[11px] font-bold uppercase tracking-wider text-white/70">
            20-second challenge
          </span>
        </div>

        {/* Bounded, touch-friendly game area */}
        <div className="relative h-64 w-full overflow-hidden rounded-3xl border-2 border-[#ffd166]/45 bg-[radial-gradient(ellipse_at_top,#5a1a63_0%,#2a0e3c_60%,#1a0a2b_100%)] shadow-[inset_0_0_50px_rgba(0,0,0,0.45)] sm:h-72">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{ background: 'repeating-linear-gradient(90deg,#ffffff 0 18px,transparent 18px 36px)' }}
          />

          {/* heads-up display */}
          <div className="pointer-events-none absolute inset-x-2 top-2 z-20 flex items-center justify-between gap-2">
            <span className="rounded-full bg-black/45 px-3 py-1.5 font-display text-sm font-bold text-[#ffe9a8] backdrop-blur-sm">
              ⭐ {score}
            </span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-black/45 px-3 py-1.5 font-display text-sm font-bold text-white backdrop-blur-sm">
                <Timer className="h-3.5 w-3.5 text-[#ff7bac]" /> 0:{String(timeLeft).padStart(2, '0')}
              </span>
              {phase === 'playing' && (
                <button
                  type="button"
                  onClick={finishGame}
                  className="pointer-events-auto min-h-[44px] rounded-full border border-white/30 bg-white/15 px-3 font-body text-xs font-bold text-white backdrop-blur-sm transition hover:bg-white/25"
                >
                  Finish
                </button>
              )}
            </div>
          </div>

          <div aria-hidden="true" className="absolute inset-x-0 top-0 z-20 h-1 bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-[#ff7bac] to-[#ffd166] transition-[width] duration-500 ease-linear"
              style={{ width: `${(timeLeft / GAME_SECONDS) * 100}%` }}
            />
          </div>

          <AnimatePresence>
            {stars.map((star) => (
              <motion.button
                key={star.id}
                type="button"
                aria-label="Catch the falling star"
                onClick={() => catchStar(star.id)}
                className="absolute top-0 z-10 flex h-12 w-12 items-center justify-center rounded-full text-3xl drop-shadow-[0_0_14px_rgba(255,215,106,0.95)] transition-transform hover:scale-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#ffd166]/70"
                style={{ left: `${star.left}%` }}
                initial={{ y: -60, opacity: 0, rotate: -25, scale: 0.6 }}
                animate={{ y: 380, opacity: 1, rotate: 25, scale: 1 }}
                exit={{ scale: 0, opacity: 0, transition: { duration: 0.18 } }}
                transition={{ duration: star.duration / 1000, ease: 'linear' }}
                onAnimationComplete={() => {
                  setStars((prev) => prev.filter((s) => s.id !== star.id));
                }}
              >
                {star.glyph}
              </motion.button>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {phase === 'idle' && (
              <motion.div
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#180826]/70 px-4 text-center backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span className="text-4xl">🌟</span>
                <p className="max-w-sm font-display text-base font-bold text-[#ffe9a8] sm:text-lg">
                  Ready, Moon? Catch as many falling stars as you can in {GAME_SECONDS} seconds!
                </p>
                <p className="font-body text-xs text-white/60">Tap a star to catch it. Every score gets a celebration.</p>
                <GlowButton size="md" variant="gold" onClick={startGame} className="!min-h-[48px]">
                  <Play className="h-4 w-4" /> Start the game
                </GlowButton>
              </motion.div>
            )}
          </AnimatePresence>

          {phase === 'finished' && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#180826]/80 text-center backdrop-blur-[2px]">
              <span className="text-4xl">🎉</span>
              <p className="font-display text-xl font-bold text-[#ffe9a8]">Round complete!</p>
              <p className="font-body text-sm text-white/70">You caught {score} star{score === 1 ? '' : 's'}.</p>
            </div>
          )}
        </div>

        <p className="mt-3 text-center font-body text-[11px] text-white/45">
          Tip: one finger or a mouse works great — big stars, big targets, zero stress.
        </p>
      </section>

      <RevealCard
        open={phase === 'finished'}
        onClose={() => setPhase('idle')}
        emoji={result.emoji}
        title={result.title}
        message={result.message}
        accent={META.accent}
        closeLabel="Back to the carnival"
      >
        <div className="flex flex-col items-center gap-3">
          <span className="rounded-full border border-[#ffd166]/50 bg-[#ffd166]/10 px-5 py-2 font-display text-lg font-bold text-[#ffe9a8]">
            ⭐ {score} star{score === 1 ? '' : 's'} caught
          </span>
          <GlowButton variant="gold" size="md" onClick={startGame} className="!min-h-[48px]">
            <RotateCcw className="h-4 w-4" /> Play again
          </GlowButton>
        </div>
      </RevealCard>

      <div className="relative z-10 mt-8 flex items-center justify-center gap-2 font-body text-xs text-white/45">
        <Trophy className="h-3.5 w-3.5 text-[#ffd166]" />
        Found {found} of 3 here · the whole carnival is cheering you on!
      </div>
    </div>
  );
}
