import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Star, Wand2, X } from 'lucide-react';
import { useSurprises } from '../context/SurpriseContext';
import { useAudio } from '../context/AudioContext';
import { BALLOON_WISHES, SHOOTING_STAR_WISHES } from '../data/wishes';
import { burstConfetti, burstStars, sideCannons, PALETTES } from '../utils/fx';
import { NoRepeatPool } from '../utils/random';
import {
  Balloon,
  GlowButton,
  ParticleField,
  RevealCard,
  SceneHeader,
  SurpriseDots,
  TypingText,
} from '../components/ui';

const BALLOON_COLORS = [
  '#ff8fb1',
  '#7ec8ff',
  '#ffd76a',
  '#a8e6cf',
  '#c9a7ff',
  '#ffab6b',
  '#7fe0ff',
  '#f49ac2',
];
const BALLOON_SIZES = [64, 70, 62, 68, 72, 66, 60, 68];
const BALLOON_GLYPHS = ['🎉', '🌈', '⭐', '🎈', '🍭', '☁️', '✨', '🎠'];
const BALLOON_OFFSETS = [8, 26, 2, 20, 12, 32, 4, 18];

const STAR_STARTS = [8, 40, 72, 24, 56];
const STAR_DURATIONS = [4.8, 5.4, 5.0, 5.8, 5.2];

const CLOUDS = [
  { left: '-6%', top: '6%', scale: 1.1, delay: '0s' },
  { left: '70%', top: '16%', scale: 0.8, delay: '-3s' },
  { left: '10%', top: '40%', scale: 0.65, delay: '-6s' },
  { left: '78%', top: '62%', scale: 1, delay: '-9s' },
  { left: '36%', top: '82%', scale: 0.85, delay: '-1.5s' },
];

const PORTAL_GREETING =
  'Moon, you have unlocked a world of wonder — and this is only the beginning!';

type PortalPhase = 'idle' | 'charging' | 'flash' | 'open';

export default function Layer02() {
  const { completeSurprise, isComplete } = useSurprises();
  const { playSfx } = useAudio();

  const [balloonWish, setBalloonWish] = useState('');
  const [starWish, setStarWish] = useState('');
  const [wishTick, setWishTick] = useState(0);
  const [starRuns, setStarRuns] = useState<number[]>(() => STAR_STARTS.map(() => 0));
  const [portalPhase, setPortalPhase] = useState<PortalPhase>('idle');

  const balloonPool = useRef(new NoRepeatPool(BALLOON_WISHES)).current;
  const starPool = useRef(new NoRepeatPool(SHOOTING_STAR_WISHES)).current;
  const portalTimers = useRef<number[]>([]);

  useEffect(() => () => portalTimers.current.forEach(window.clearTimeout), []);

  // --- Surprise 1: Floating Balloon Universe --------------------------------
  const popBalloon = () => {
    playSfx('pop');
    burstConfetti({ particleCount: 18, spread: 70, colors: PALETTES.pastel });
    setBalloonWish(balloonPool.next() ?? BALLOON_WISHES[0]);
    setWishTick((n) => n + 1);
    if (!isComplete('l2-s1')) completeSurprise('l2-s1');
  };

  // --- Surprise 2: Shooting Star Wishes -------------------------------------
  const catchStar = (index: number) => {
    playSfx('reveal');
    void burstStars(PALETTES.gold, 36);
    setStarWish(starPool.next() ?? SHOOTING_STAR_WISHES[0]);
    setWishTick((n) => n + 1);
    setStarRuns((prev) => prev.map((run, i) => (i === index ? run + 1 : run)));
    if (!isComplete('l2-s2')) completeSurprise('l2-s2');
  };

  // --- Surprise 3: Magical Birthday Portal ---------------------------------
  const enterPortal = () => {
    if (portalPhase === 'charging' || portalPhase === 'flash') return;
    portalTimers.current.forEach(window.clearTimeout);
    portalTimers.current = [];
    setPortalPhase('charging');
    playSfx('whoosh');

    portalTimers.current.push(
      window.setTimeout(() => {
        setPortalPhase('flash');
        playSfx('reveal');
        sideCannons(PALETTES.pastel, 80);
        void burstStars(PALETTES.gold, 44);
      }, 460),
    );
    portalTimers.current.push(
      window.setTimeout(() => {
        setPortalPhase('open');
        completeSurprise('l2-s3');
        burstConfetti({ particleCount: 95, spread: 100, colors: PALETTES.rainbow });
      }, 1120),
    );
  };

  const foundCount = [
    isComplete('l2-s1'),
    isComplete('l2-s2'),
    isComplete('l2-s3'),
  ].filter(Boolean).length;

  return (
    <div className="layer-scene relative overflow-x-hidden">
      {/* Clouds drifting behind the whole world */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        {CLOUDS.map((cloud, i) => (
          <div
            key={i}
            className="absolute"
            style={{ left: cloud.left, top: cloud.top, transform: `scale(${cloud.scale})` }}
          >
            <div className="animate-float-slow" style={{ animationDelay: cloud.delay }}>
              <span className="absolute h-10 w-28 rounded-full bg-white/25 blur-xl" />
              <span className="absolute -left-6 top-3 h-12 w-20 rounded-full bg-white/20 blur-lg" />
              <span className="absolute left-14 top-2 h-9 w-24 rounded-full bg-white/20 blur-lg" />
            </div>
          </div>
        ))}
      </div>

      <ParticleField colors={['#ffffff', '#8fd3ff', '#ffb3d9']} count={22} variant="sparkles" />

      <div className="relative z-10 flex w-full flex-col items-center gap-8 px-3 pb-16 pt-4 sm:gap-10">
        <SceneHeader
          eyebrow="Layer 02 — The Magical Birthday World"
          emoji="🎠"
          title="Welcome to the world above the clouds"
          subtitle="Three delights are floating in this sky: a universe of balloons, wishes on shooting stars, and a portal to something wonderful."
          accent="#bfe6ff"
        />
        <SurpriseDots layer={2} className="mb-1" />

        {/* Surprise 1 — Floating Balloon Universe */}
        <section className="surprise-card glass w-full max-w-4xl rounded-[28px] p-4 sm:p-6">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl">
              🎈
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-white sm:text-xl">
                Floating Balloon Universe
              </h3>
              <p className="font-body text-xs text-white/60 sm:text-sm">
                Tap a balloon to set a cheerful wish free.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 justify-items-center gap-x-1 gap-y-2 sm:grid-cols-8">
            {BALLOON_COLORS.map((color, i) => (
              <div key={i} style={{ marginTop: BALLOON_OFFSETS[i] }}>
                <Balloon
                  color={color}
                  size={BALLOON_SIZES[i]}
                  label={`Pop balloon ${i + 1} for a wish`}
                  onClick={popBalloon}
                >
                  {BALLOON_GLYPHS[i]}
                </Balloon>
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {balloonWish && (
              <motion.div
                key={`balloon-${wishTick}`}
                initial={{ opacity: 0, y: 14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="glass-panel glass mx-auto mt-4 flex w-full max-w-lg items-start gap-3 rounded-2xl border border-white/15 px-4 py-3 text-left"
              >
                <span className="text-2xl" aria-hidden="true">🎈</span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm font-bold text-[#8fd3ff]">A wish floated your way</p>
                  <p className="mt-1 font-body text-sm leading-relaxed text-white/90">{balloonWish}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setBalloonWish('')}
                  aria-label="Dismiss balloon wish"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/60 transition hover:bg-white/15 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Surprise 2 — Shooting Star Wishes */}
        <section className="surprise-card glass w-full max-w-4xl rounded-[28px] p-4 sm:p-6">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <Star className="h-5 w-5 text-[#ffe9a8]" />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-white sm:text-xl">
                Shooting Star Wishes
              </h3>
              <p className="font-body text-xs text-white/60 sm:text-sm">
                Catch a streaking star to claim a wish.
              </p>
            </div>
          </div>

          <div className="relative h-48 w-full overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-[#0d1a3a]/70 via-[#1b3a78]/50 to-[#2a5aa0]/40 sm:h-56">
            <div
              className="pointer-events-none absolute inset-0"
              aria-hidden="true"
              style={{
                background:
                  'radial-gradient(circle at 70% 20%, rgba(143,211,255,0.22), transparent 55%), radial-gradient(circle at 20% 80%, rgba(255,179,217,0.16), transparent 55%)',
              }}
            />
            {STAR_STARTS.map((start, i) => (
              <motion.button
                key={`${i}-${starRuns[i]}`}
                type="button"
                aria-label={`Catch shooting star ${i + 1}`}
                onClick={() => catchStar(i)}
                className="absolute left-0 top-0 flex h-14 w-14 items-center justify-center rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
                initial={{ left: '-12%', top: start, opacity: 0, scale: 0.6 }}
                animate={{
                  left: ['-12%', '6%', '86%', '108%'],
                  top: [start, start + 8, start + 64, start + 74],
                  opacity: [0, 1, 1, 0],
                  scale: [0.6, 1, 1, 0.6],
                }}
                transition={{
                  duration: STAR_DURATIONS[i],
                  repeat: Infinity,
                  delay: i * 0.75,
                  ease: 'linear',
                  times: [0, 0.12, 0.88, 1],
                }}
              >
                <span
                  className="pointer-events-none absolute -left-9 top-1/2 h-1 w-14 -translate-y-1/2 rotate-[-18deg] bg-gradient-to-r from-transparent via-[#bfe8ff] to-white blur-[2px]"
                  aria-hidden="true"
                />
                <span
                  className="relative text-2xl drop-shadow-[0_0_12px_rgba(191,232,255,0.95)]"
                  aria-hidden="true"
                >
                  ✦
                </span>
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {starWish && (
              <motion.div
                key={`star-${wishTick}`}
                initial={{ opacity: 0, y: 14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="glass-panel glass mx-auto mt-4 flex w-full max-w-lg items-start gap-3 rounded-2xl border border-white/15 px-4 py-3 text-left"
              >
                <span className="text-2xl" aria-hidden="true">⭐</span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm font-bold text-[#ffe9a8]">Wish caught!</p>
                  <p className="mt-1 font-body text-sm leading-relaxed text-white/90">{starWish}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStarWish('')}
                  aria-label="Dismiss star wish"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/60 transition hover:bg-white/15 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Surprise 3 — Magical Birthday Portal */}
        <section className="surprise-card glass flex w-full max-w-4xl flex-col items-center rounded-[28px] p-4 sm:p-6">
          <div className="mb-2 flex items-center gap-3 self-start">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <Wand2 className="h-5 w-5 text-[#ffb3d9]" />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-white sm:text-xl">
                Magical Birthday Portal
              </h3>
              <p className="font-body text-xs text-white/60 sm:text-sm">
                Step through and see what is waiting for you.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={enterPortal}
            aria-label="Step through the magical birthday portal"
            className="relative flex h-56 w-44 items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50 sm:h-72 sm:w-56"
          >
            <span
              className="animate-pulse-glow absolute inset-[-18%] rounded-[50%] bg-[#8fd3ff]/25 blur-3xl"
              aria-hidden="true"
            />
            <motion.span
              className="absolute inset-0 rounded-[50%] border-2 border-dashed border-[#ffb3d9]/70"
              animate={{ rotate: 360 }}
              transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
              aria-hidden="true"
            />
            <motion.span
              className="absolute inset-3 rounded-[50%] border-2 border-[#8fd3ff]/70 shadow-[0_0_22px_rgba(143,211,255,0.45)]"
              animate={{ rotate: -360 }}
              transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
              aria-hidden="true"
            />
            <motion.span
              className="absolute inset-7 rounded-[50%] border border-white/50"
              animate={{ rotate: 360, scale: [1, 1.05, 1] }}
              transition={{
                rotate: { duration: 12, repeat: Infinity, ease: 'linear' },
                scale: { duration: 4, repeat: Infinity },
              }}
              aria-hidden="true"
            />
            <motion.span
              className="absolute inset-[18%] rounded-[50%] bg-[radial-gradient(circle_at_50%_36%,rgba(255,255,255,0.95),rgba(143,211,255,0.7)_40%,rgba(120,90,220,0.55)_75%,rgba(255,179,217,0.5)_100%)] shadow-[inset_0_0_30px_rgba(255,255,255,0.7),0_0_60px_rgba(143,211,255,0.7)]"
              animate={{ scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 3.5, repeat: Infinity }}
              aria-hidden="true"
            />
            {['✦', '✧', '✦', '✧'].map((glyph, i) => (
              <motion.span
                key={i}
                className="absolute text-white/80"
                style={{ left: `${[4, 84, 10, 78][i]}%`, top: `${[14, 22, 72, 78][i]}%` }}
                animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 2.4 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
                aria-hidden="true"
              >
                {glyph}
              </motion.span>
            ))}
            <span className="relative z-10 flex flex-col items-center">
              <span className="text-4xl drop-shadow-[0_0_18px_rgba(255,255,255,0.9)]">✨</span>
              <span className="mt-1 font-display text-[10px] font-bold uppercase tracking-[0.28em] text-white/90">
                Enter
              </span>
            </span>
          </button>

          <div className="mt-6">
            <GlowButton
              variant="rainbow"
              size="md"
              onClick={enterPortal}
              disabled={portalPhase === 'charging' || portalPhase === 'flash'}
            >
              <Sparkles className="h-4 w-4" />
              {isComplete('l2-s3') ? 'Enter the portal again' : 'Step through the portal'}
            </GlowButton>
          </div>
        </section>

        <div className="flex items-center gap-2 font-body text-xs text-white/45">
          <Star className="h-3.5 w-3.5" />
          Found {foundCount} of 3 wonders here
        </div>
      </div>

      {/* Portal travel transition — flash, zoom and swirl */}
      <AnimatePresence>
        {(portalPhase === 'charging' || portalPhase === 'flash') && (
          <motion.div
            key="portal-transition"
            className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden="true"
          >
            <motion.span
              className="absolute h-24 w-24 rounded-full bg-white"
              style={{ boxShadow: '0 0 140px 90px rgba(190,235,255,0.95)' }}
              initial={{ scale: 0.4, opacity: 0.85 }}
              animate={{
                scale: portalPhase === 'flash' ? 70 : 3,
                opacity: portalPhase === 'flash' ? 0 : 0.9,
              }}
              transition={{ duration: portalPhase === 'flash' ? 0.65 : 0.45, ease: 'easeOut' }}
            />
            <motion.span
              className="absolute h-56 w-56 rounded-[50%] border-4 border-[#ffb3d9]/80 sm:h-80 sm:w-80"
              animate={{
                rotate: 720,
                scale: portalPhase === 'flash' ? 7 : 1.3,
                opacity: portalPhase === 'flash' ? 0 : 0.9,
              }}
              transition={{ duration: 0.95, ease: 'easeInOut' }}
            />
            <motion.span
              className="absolute h-40 w-40 rounded-[50%] border-4 border-[#8fd3ff]/80 sm:h-64 sm:w-64"
              animate={{
                rotate: -720,
                scale: portalPhase === 'flash' ? 9 : 1.1,
                opacity: portalPhase === 'flash' ? 0 : 0.9,
              }}
              transition={{ duration: 1.05, ease: 'easeInOut' }}
            />
            <motion.span
              className="relative z-10 text-6xl"
              initial={{ scale: 0.4, opacity: 0, rotate: -90 }}
              animate={{ scale: [0.4, 1.5], opacity: [0, 1, 0], rotate: 360 }}
              transition={{ duration: 0.95 }}
            >
              ✨
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      <RevealCard
        open={portalPhase === 'open'}
        onClose={() => setPortalPhase('idle')}
        emoji="🌀"
        title="The Portal Opens"
        message={PORTAL_GREETING}
        accent="#8fd3ff"
        closeLabel="Keep exploring"
      >
        <p className="font-display text-lg text-[#ffb3d9]">
          <TypingText
            text="The magic is only just getting started, Moon!"
            speed={70}
            start={portalPhase === 'open'}
          />
        </p>
      </RevealCard>
    </div>
  );
}
