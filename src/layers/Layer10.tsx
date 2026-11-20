import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MoonStar, RotateCcw, Sparkles, Star, X } from 'lucide-react';
import { useSurprises } from '../context/SurpriseContext';
import { useExperience } from '../context/ExperienceContext';
import { useAudio } from '../context/AudioContext';
import {
  EASTER_EGG_MESSAGES,
  FINALE_MASTERPIECE,
  FINAL_BUTTON_LABEL,
  FINAL_BUTTON_QUESTION,
} from '../data/birthdayMessages';
import { burstStars, grandFinale, PALETTES } from '../utils/fx';
import {
  GlowButton,
  ParticleField,
  RevealCard,
  SceneHeader,
  SurpriseDots,
} from '../components/ui';

/** Fixed scenery for the living galaxy — kept outside the component so identity is stable. */
const NEBULAE = [
  { color: '#a855f7', left: '2%', top: '6%', size: '54vw', delay: '0s', duration: '26s' },
  { color: '#3b82f6', left: '56%', top: '2%', size: '46vw', delay: '-8s', duration: '32s' },
  { color: '#ec4899', left: '64%', top: '46%', size: '42vw', delay: '-14s', duration: '30s' },
  { color: '#14b8a6', left: '4%', top: '56%', size: '38vw', delay: '-5s', duration: '28s' },
] as const;

const PLANETS = [
  { color: '#ffd76a', size: 58, left: '9%', top: '15%', ring: true, duration: 9 },
  { color: '#8b9dff', size: 40, left: '83%', top: '21%', ring: false, duration: 11 },
  { color: '#ff8fb1', size: 30, left: '73%', top: '70%', ring: true, duration: 13 },
] as const;

const BLOOM = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2;
  return { x: Math.cos(angle) * 128, y: Math.sin(angle) * 96 };
});

const BUNTING = ['#ff7bac', '#ffd76a', '#8b9dff', '#7bedc0', '#ff9e6d', '#c9a2ff', '#ffe9a8'] as const;
const BALLOONS = ['#ff7bac', '#ffd76a', '#8b9dff', '#7bedc0', '#c9a2ff'] as const;
const SPARKLES = ['✦', '✧', '✦', '✧', '✦'] as const;

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'] as const;

const GRADIENT_TEXT: CSSProperties = {
  backgroundImage: 'linear-gradient(100deg,#ffffff 0%,#d9c2ff 18%,#ffd76a 38%,#ffffff 54%,#b69bff 74%,#ffffff 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
};

export default function Layer10() {
  const { completeSurprise, isComplete, findEgg } = useSurprises();
  const { restartExperience } = useExperience();
  const { playSfx } = useAudio();

  const [s1Phase, setS1Phase] = useState(0);
  const [s1CardOpen, setS1CardOpen] = useState(false);
  const [finaleLive, setFinaleLive] = useState(false);
  const [giantVisible, setGiantVisible] = useState(false);
  const [masterpieceOpen, setMasterpieceOpen] = useState(false);

  const timers = useRef<number[]>([]);
  const finaleStop = useRef<(() => void) | null>(null);
  const konamiIndex = useRef(0);
  const eggFired = useRef(false);

  const clearTimers = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  }, []);

  // Tidy up every timer and effect the layer may have started.
  useEffect(() => () => {
    timers.current.forEach(window.clearTimeout);
    finaleStop.current?.();
  }, []);

  /* ---------------------------- Surprise 1 ---------------------------- */
  const beginCelebration = useCallback(() => {
    if (s1Phase !== 0) return;
    clearTimers();
    setS1Phase(1);
    completeSurprise('l10-s1');
    playSfx('whoosh');
    void burstStars(PALETTES.cosmic, 70);
    timers.current.push(window.setTimeout(() => setS1Phase(2), 420));
    timers.current.push(window.setTimeout(() => setS1Phase(3), 1050));
    timers.current.push(window.setTimeout(() => {
      setS1Phase(4);
      setS1CardOpen(true);
    }, 1750));
  }, [s1Phase, clearTimers, completeSurprise, playSfx]);

  const replayCosmos = useCallback(() => {
    clearTimers();
    setS1Phase(0);
    setS1CardOpen(false);
  }, [clearTimers]);

  /* ---------------------------- Surprise 2 ---------------------------- */
  const unlockFinale = useCallback(() => {
    finaleStop.current?.();
    finaleStop.current = grandFinale();
    playSfx('fireworks');
    setFinaleLive(true);
    setGiantVisible(true);
    completeSurprise('l10-s2');
  }, [completeSurprise, playSfx]);

  /* ---------------------------- Surprise 3 ---------------------------- */
  const revealMasterpiece = useCallback(() => {
    setMasterpieceOpen(true);
    completeSurprise('l10-s3');
    playSfx('reveal');
    void burstStars(PALETTES.gold, 60);
  }, [completeSurprise, playSfx]);

  /* ----------------------- Konami-code easter egg ---------------------- */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (eggFired.current) return;
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (key === KONAMI[konamiIndex.current]) {
        konamiIndex.current += 1;
        if (konamiIndex.current === KONAMI.length) {
          eggFired.current = true;
          findEgg('confetti-vortex', EASTER_EGG_MESSAGES.konami);
          playSfx('gift');
          finaleStop.current?.();
          finaleStop.current = grandFinale();
          void burstStars(PALETTES.rainbow, 90);
        }
      } else {
        konamiIndex.current = key === KONAMI[0] ? 1 : 0;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [findEgg, playSfx]);

  const foundCount = [isComplete('l10-s1'), isComplete('l10-s2'), isComplete('l10-s3')].filter(Boolean).length;
  const paragraphs = FINALE_MASTERPIECE.split('\n\n');

  return (
    <div className="layer-scene relative isolate min-h-[100svh] w-full overflow-x-hidden px-4 pb-16 pt-24 sm:px-6 sm:pt-28">
      {/* ---------- The living galaxy backdrop ---------- */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="bg-stars absolute inset-0 opacity-70" />
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              'radial-gradient(2px 2px at 20% 30%, #fff 50%, transparent 51%), radial-gradient(2px 2px at 70% 60%, #d9c2ff 50%, transparent 51%), radial-gradient(1px 1px at 45% 80%, #ffd76a 50%, transparent 51%)',
            backgroundSize: '220px 220px',
          }}
        />
        <ParticleField count={20} variant="stars" colors={['#ffffff', '#d9c2ff', '#ffd76a', '#9fd8ff']} />

        {NEBULAE.map((n, i) => (
          <div
            key={i}
            className={`absolute rounded-full mix-blend-screen blur-[60px] ${i % 2 ? 'animate-drift-slow' : 'animate-aurora'}`}
            style={{
              left: n.left,
              top: n.top,
              width: n.size,
              height: n.size,
              background: `radial-gradient(circle, ${n.color}55 0%, ${n.color}22 45%, transparent 70%)`,
              animationDelay: n.delay,
              animationDuration: n.duration,
            }}
          />
        ))}

        {PLANETS.map((p, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
            animate={{ y: [0, -16, 0], rotate: [0, 6, 0] }}
            transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }}
          >
            <div
              className="h-full w-full rounded-full"
              style={{
                background: `radial-gradient(circle at 30% 28%, #ffffff 0%, ${p.color} 38%, #1b1240 100%)`,
                boxShadow: `0 0 32px ${p.color}88, inset -8px -8px 18px rgba(0,0,0,0.55)`,
              }}
            />
            {p.ring && (
              <span className="absolute left-1/2 top-1/2 h-[26%] w-[152%] -translate-x-1/2 -translate-y-1/2 -rotate-[22deg] rounded-[50%] border-2 border-white/45" />
            )}
          </motion.div>
        ))}
      </div>

      <SceneHeader
        eyebrow="Layer 10 — The Grand Finale"
        emoji="🌌"
        title="The universe celebrates Moon"
        subtitle="One last galaxy, one final burst of magic. Everything here is for you."
        accent="#d9c2ff"
      />
      <SurpriseDots layer={10} className="relative z-10 mb-6" />

      {/* ---------- ACT I — The Universe Celebrates Moon ---------- */}
      <section className="relative z-10 flex min-h-[62vh] flex-col items-center justify-center py-6 text-center">
        <motion.p
          className="font-body text-[11px] font-bold uppercase tracking-[0.35em] text-[#d9c2ff]/85"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Act I · Behold the galaxy
        </motion.p>

        <div className="relative mt-2 flex min-h-[340px] w-full max-w-5xl items-center justify-center">
          {/* Enormous shimmering MOON typography */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
            <motion.h1
              className="shimmer-text select-none whitespace-nowrap font-display text-[30vw] font-bold leading-none tracking-[0.06em] sm:text-[24vw]"
              style={GRADIENT_TEXT}
              animate={
                s1Phase > 0
                  ? { scale: [1, 1.18, 1.05], rotate: [0, -3, 0], opacity: [0.16, 0.42, 0.22] }
                  : { scale: [1, 1.04, 1], rotate: [0, 1.5, 0], opacity: [0.13, 0.2, 0.13] }
              }
              transition={
                s1Phase > 0
                  ? { duration: 2.4, ease: 'easeOut' }
                  : { duration: 12, repeat: Infinity, ease: 'easeInOut' }
              }
            >
              MOON
            </motion.h1>
          </div>

          {/* The interactive glowing core */}
          <button
            type="button"
            onClick={beginCelebration}
            aria-label="Begin the celebration"
            className="group relative z-10 flex min-h-[132px] min-w-[220px] items-center justify-center rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-[#ffd76a]/60"
          >
            <span className="animate-glow-pulse absolute h-40 w-40 rounded-full bg-[#d9c2ff]/25 blur-3xl transition-colors duration-700 group-hover:bg-[#ffd76a]/35" />
            <motion.span
              className="relative flex h-24 w-24 items-center justify-center rounded-full"
              style={{
                background: 'radial-gradient(circle at 35% 30%, #ffffff 0%, #ffe9a8 35%, #c9a2ff 75%, #6d4bd6 100%)',
                boxShadow: '0 0 52px rgba(255,220,140,0.82), inset -6px -8px 18px rgba(80,40,140,0.5)',
              }}
              animate={
                s1Phase > 0
                  ? { scale: [1, 1.38, 1.12], rotate: [0, 180, 360] }
                  : { scale: [1, 1.06, 1], rotate: [0, 8, 0] }
              }
              transition={
                s1Phase > 0
                  ? { duration: 1.7, ease: 'easeOut' }
                  : { duration: 6, repeat: Infinity, ease: 'easeInOut' }
              }
            >
              <Star className="h-8 w-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]" fill="white" />
            </motion.span>
            <span className="absolute -bottom-2 translate-y-full whitespace-nowrap font-display text-[11px] font-bold uppercase tracking-[0.25em] text-[#ffd76a] sm:text-sm">
              {s1Phase === 0 ? 'Begin the celebration' : s1Phase < 4 ? 'The cosmos is waking up…' : 'The universe celebrates you'}
            </span>
          </button>

          {/* Star bloom */}
          <AnimatePresence>
            {s1Phase >= 2 &&
              BLOOM.map((point, i) => (
                <motion.span
                  key={i}
                  className="pointer-events-none absolute text-2xl text-[#ffe9a8] drop-shadow-[0_0_12px_#ffd76a]"
                  style={{ left: 'calc(50% - 12px)', top: 'calc(50% - 12px)' }}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{ opacity: 1, scale: 1, x: point.x, y: point.y }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ delay: i * 0.06, type: 'spring', stiffness: 170, damping: 14 }}
                >
                  ✦
                </motion.span>
              ))}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {s1Phase >= 3 && (
            <motion.p
              className="mt-8 max-w-lg font-display text-lg text-white/90 sm:text-xl"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Every star up there is cheering for you, Moon. ✦
            </motion.p>
          )}
        </AnimatePresence>
        {s1Phase >= 4 && (
          <button
            type="button"
            onClick={replayCosmos}
            className="mt-3 min-h-[44px] px-3 font-body text-xs text-white/50 underline-offset-4 transition hover:text-white/90 hover:underline"
          >
            replay the cosmos
          </button>
        )}
      </section>

      {/* ---------- ACT II — The Ultimate Surprise Button ---------- */}
      <section className="relative z-10 mx-auto my-10 w-full max-w-3xl text-center">
        <motion.div
          className="surprise-card glass-panel rounded-[28px] border border-white/15 bg-white/5 px-5 py-9 backdrop-blur-md sm:px-10 sm:py-11"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7 }}
        >
          <span className="font-body text-[11px] font-bold uppercase tracking-[0.3em] text-[#ffd76a]">Act II · The final button</span>
          <h3 className="mx-auto mt-3 max-w-xl font-display text-2xl font-bold leading-tight text-white sm:text-4xl">
            {FINAL_BUTTON_QUESTION}
          </h3>
          <p className="mt-3 font-body text-sm text-white/65">Go on — the whole sky is waiting for you.</p>

          <div className="mt-7 flex justify-center">
            <GlowButton variant="rainbow" size="xl" onClick={unlockFinale} className="min-h-[56px] max-w-full whitespace-normal">
              {FINAL_BUTTON_LABEL}
            </GlowButton>
          </div>

          <AnimatePresence>
            {finaleLive && (
              <motion.div
                className="relative mt-8 flex flex-col items-center gap-3 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex flex-wrap items-end justify-center gap-x-2 gap-y-1">
                  {BUNTING.map((color, i) => (
                    <motion.span
                      key={i}
                      className="block h-5 w-3.5"
                      style={{ background: color, clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
                      initial={{ y: -30, opacity: 0, rotate: -12 }}
                      animate={{ y: 0, opacity: 1, rotate: 0 }}
                      transition={{ delay: i * 0.07, type: 'spring', stiffness: 220, damping: 16 }}
                    />
                  ))}
                </div>
                <div className="flex items-end justify-center gap-1 sm:gap-2">
                  {BALLOONS.map((color, i) => (
                    <motion.span
                      key={i}
                      className="text-4xl sm:text-5xl"
                      style={{ filter: `hue-rotate(${i * 62}deg) drop-shadow(0 0 10px ${color})` }}
                      initial={{ y: 50, opacity: 0, scale: 0.6 }}
                      animate={{ y: [50, -8, 0], opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1, duration: 1.1, type: 'spring', stiffness: 180, damping: 14 }}
                    >
                      🎈
                    </motion.span>
                  ))}
                </div>
                <motion.div
                  className="text-5xl sm:text-6xl"
                  initial={{ opacity: 0, scale: 0.3, rotate: -20 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.4, type: 'spring', stiffness: 180, damping: 12 }}
                >
                  🎂
                </motion.div>
                <div className="flex items-center gap-3 text-xl text-[#ffe9a8]">
                  {SPARKLES.map((glyph, i) => (
                    <motion.span
                      key={i}
                      className="animate-twinkle-soft"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                    >
                      {glyph}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* ---------- ACT III — The Final Birthday Masterpiece ---------- */}
      <section className="relative z-10 mx-auto my-10 w-full max-w-2xl text-center">
        <motion.div
          className="surprise-card glass-panel rounded-[28px] border border-white/15 bg-white/5 px-5 py-9 backdrop-blur-md sm:px-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <span className="font-body text-[11px] font-bold uppercase tracking-[0.3em] text-[#d9c2ff]">Act III · One last message</span>
          <h3 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">The Final Birthday Masterpiece</h3>
          <p className="mt-2 font-body text-sm text-white/65">Written in starlight, just for you.</p>
          <motion.div
            className="my-5 text-4xl"
            animate={{ y: [0, -8, 0], rotate: [-4, 4, -4] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            📜✨
          </motion.div>
          <GlowButton variant="gold" size="lg" onClick={revealMasterpiece} className="min-h-[54px]">
            {isComplete('l10-s3') ? 'Read the masterpiece again ✨' : 'Reveal the final masterpiece ✨'}
          </GlowButton>
        </motion.div>
      </section>

      <div className="relative z-10 mt-8 flex items-center justify-center gap-2 font-body text-xs text-white/45">
        <MoonStar className="h-3.5 w-3.5" />
        <Star className="h-3.5 w-3.5" />
        Found {foundCount} of 3 here
      </div>

      {/* ---------- Surprise 1 reveal card ---------- */}
      <RevealCard
        open={s1CardOpen}
        onClose={() => setS1CardOpen(false)}
        emoji="🌌"
        title="The universe celebrates you, Moon!"
        message="Every star up there is cheering for you tonight. Keep shining, Moon — the whole cosmos is proud of you."
        accent="#d9c2ff"
        closeLabel="Continue the journey"
      >
        <p className="font-display text-sm text-[#ffd76a]">✦ A thousand tiny wishes, all for you ✦</p>
      </RevealCard>

      {/* ---------- Surprise 2 — giant birthday overlay ---------- */}
      <AnimatePresence>
        {giantVisible && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center px-3 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-[#05030f]/85 backdrop-blur-xl"
              onClick={() => setGiantVisible(false)}
              aria-hidden="true"
            />
            <motion.div
              className="relative w-full max-w-5xl text-center"
              initial={{ scale: 0.5, rotate: -6, filter: 'blur(14px)', opacity: 0 }}
              animate={{ scale: 1, rotate: 0, filter: 'blur(0px)', opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 110, damping: 14 }}
            >
              <motion.p className="mb-4 text-4xl sm:text-6xl" animate={{ y: [0, -12, 0] }} transition={{ duration: 2.4, repeat: Infinity }}>
                🎉 ✨ 🎂 ✨ 🎉
              </motion.p>
              <motion.h2
                className="shimmer-text break-words font-display text-[9vw] font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
                style={{ ...GRADIENT_TEXT, filter: 'drop-shadow(0 0 32px rgba(255,215,106,0.45))' }}
              >
                HAPPY BIRTHDAY, MOON! 🎂
              </motion.h2>
              <motion.p
                className="mx-auto mt-5 max-w-md font-display text-base text-white/85 sm:text-xl"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                This one is the biggest celebration of them all. 🎈
              </motion.p>
              <div className="mt-8 flex justify-center">
                <GlowButton variant="gold" size="lg" onClick={() => setGiantVisible(false)} className="min-h-[56px]">
                  <Sparkles className="h-5 w-5" /> Continue to the final message
                </GlowButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- Surprise 3 — the masterpiece in a glowing frame ---------- */}
      <AnimatePresence>
        {masterpieceOpen && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto p-3 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="fixed inset-0 bg-[#04020c]/92 backdrop-blur-2xl"
              onClick={() => setMasterpieceOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="The final birthday masterpiece"
              className="relative my-auto w-full max-w-3xl rounded-[30px] p-[2px] shadow-[0_0_90px_rgba(217,194,255,0.35)]"
              style={{
                background: 'linear-gradient(135deg,#ffd76a,#d9c2ff,#ff8fd0,#7bedf0,#ffd76a)',
                backgroundSize: '300% 300%',
                animation: 'shimmer 8s linear infinite',
              }}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 150, damping: 20 }}
            >
              <div className="relative overflow-hidden rounded-[28px] bg-[#0b071f]/95 px-5 py-9 text-center sm:px-12 sm:py-12">
                <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-[#d9c2ff]/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-[#ffd76a]/20 blur-3xl" />

                <button
                  type="button"
                  onClick={() => setMasterpieceOpen(false)}
                  aria-label="Close the masterpiece"
                  className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>

                <motion.div
                  className="relative mb-4 text-3xl"
                  animate={{ y: [0, -8, 0], rotate: [-4, 4, -4] }}
                  transition={{ duration: 3.5, repeat: Infinity }}
                >
                  🌙✨🎂
                </motion.div>

                <div className="relative space-y-5">
                  {paragraphs.map((paragraph, i) => {
                    const isLast = i >= paragraphs.length - 2;
                    return (
                      <motion.p
                        key={i}
                        className={
                          i === 0
                            ? 'font-display text-2xl font-bold leading-tight sm:text-4xl'
                            : isLast
                              ? 'font-display text-lg font-bold tracking-wide text-[#ffd76a] sm:text-2xl'
                              : 'font-body text-base leading-relaxed text-white/90 sm:text-xl'
                        }
                        style={i === 0 ? GRADIENT_TEXT : undefined}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.12, duration: 0.5 }}
                      >
                        {paragraph}
                      </motion.p>
                    );
                  })}
                </div>

                <motion.div
                  className="relative mt-9 flex justify-center"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + paragraphs.length * 0.12 }}
                >
                  <GlowButton
                    variant="rainbow"
                    size="lg"
                    onClick={restartExperience}
                    className="min-h-[56px] max-w-full whitespace-normal"
                  >
                    <RotateCcw className="h-5 w-5" /> RESTART THE MAGICAL JOURNEY 🔄
                  </GlowButton>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
