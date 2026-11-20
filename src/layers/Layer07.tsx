import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import {
  Cog,
  Laugh,
  Medal,
  PartyPopper,
  Smile,
  Sparkles,
  Star,
  Trophy,
} from 'lucide-react';
import { useSurprises } from '../context/SurpriseContext';
import { useAudio } from '../context/AudioContext';
import { AWARDS, JOKES, LAUGH_MESSAGES } from '../data/jokes';
import { LAYERS } from '../data/surprises';
import { burstConfetti, burstStars, PALETTES } from '../utils/fx';
import { NoRepeatPool } from '../utils/random';
import {
  GlowButton,
  ParticleField,
  RevealCard,
  SceneHeader,
  SurpriseDots,
  TypingText,
} from '../components/ui';

type RGB = [number, number, number];

/** Candy-shop colours that give this world its own identity. */
const CANDY: RGB[] = [
  [255, 224, 102],
  [255, 159, 67],
  [255, 143, 163],
  [255, 246, 224],
  [169, 123, 235],
];

const META = LAYERS[6];

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  );
}

interface FactoryPanelProps {
  label: string;
  icon: ReactNode;
  tint: string;
  children: ReactNode;
  className?: string;
}

/** A shared cartoon-machine shell: bolts, a nameplate and a lazy spinning cog. */
function FactoryPanel({ label, icon, tint, children, className = '' }: FactoryPanelProps) {
  return (
    <div
      className={`relative rounded-[28px] border border-white/20 bg-[#241436]/70 p-[2px] shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl ${className}`}
    >
      <div className="relative h-full rounded-[26px] bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-5 sm:p-6">
        {['left-3 top-3', 'right-3 top-3', 'left-3 bottom-3', 'right-3 bottom-3'].map((pos) => (
          <span
            key={pos}
            className={`absolute ${pos} h-2 w-2 rounded-full bg-white/25 shadow-[inset_0_1px_1px_rgba(0,0,0,0.45)]`}
            aria-hidden="true"
          />
        ))}
        <div className="mb-5 flex items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10"
            style={{ color: tint, boxShadow: `inset 0 0 18px ${tint}33` }}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.25em] text-white/45">
              Giggle Factory · Station
            </p>
            <h3 className="truncate font-display text-lg font-bold text-white sm:text-xl">{label}</h3>
          </div>
          <Cog
            className="ml-auto h-6 w-6 shrink-0 animate-spin-slow opacity-30"
            style={{ color: tint }}
            aria-hidden="true"
          />
        </div>
        {children}
      </div>
    </div>
  );
}

interface FloatEmoji {
  id: number;
  glyph: string;
  x: number;
  delay: number;
  rotate: number;
}

export default function Layer07() {
  const { completeSurprise, isComplete } = useSurprises();
  const { playSfx } = useAudio();

  // Curated pools: every joke, award and reaction cycles before any repeats.
  const jokePool = useRef(new NoRepeatPool(JOKES)).current;
  const awardPool = useRef(new NoRepeatPool(AWARDS)).current;
  const laughPool = useRef(new NoRepeatPool(LAUGH_MESSAGES)).current;

  const timers = useRef<number[]>([]);
  const emojiId = useRef(0);

  const [joke, setJoke] = useState('');
  const [jokeTick, setJokeTick] = useState(0);
  const [jokeCount, setJokeCount] = useState(0);

  const [latestAward, setLatestAward] = useState('');
  const [awardOpen, setAwardOpen] = useState(false);
  const [awardCount, setAwardCount] = useState(0);

  const [reaction, setReaction] = useState('');
  const [reactionTick, setReactionTick] = useState(0);
  const [laughCount, setLaughCount] = useState(0);
  const [floaters, setFloaters] = useState<FloatEmoji[]>([]);

  // Short, self-cleaning motion controls for each machine.
  const shake = useAnimationControls();
  const buttonPop = useAnimationControls();
  const lever = useAnimationControls();
  const medalSpin = useAnimationControls();

  useEffect(
    () => () => {
      timers.current.forEach(window.clearTimeout);
      timers.current = [];
    },
    [],
  );

  const after = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const spawnEmojis = () => {
    const glyphs = ['😂', '🤣', '😆', '✨', '😹', '🎉', '😄', '💥'];
    const batch: FloatEmoji[] = Array.from({ length: 8 }, (_, i) => ({
      id: emojiId.current++,
      glyph: glyphs[i % glyphs.length],
      x: (Math.random() - 0.5) * 200,
      delay: i * 0.045,
      rotate: (Math.random() - 0.5) * 70,
    }));
    // Cap the number of floating nodes so rapid clicking stays lightweight.
    setFloaters((prev) => [...prev, ...batch].slice(-24));
    after(1700, () => {
      const ids = new Set(batch.map((b) => b.id));
      setFloaters((prev) => prev.filter((f) => !ids.has(f.id)));
    });
  };

  const tellJoke = () => {
    const next = jokePool.next() ?? JOKES[0];
    setJoke(next);
    setJokeTick((n) => n + 1);
    setJokeCount((n) => n + 1);
    playSfx('laugh');
    if (!prefersReducedMotion()) {
      void lever.start({ y: [0, 14, 0], transition: { duration: 0.38 } });
    }
    burstConfetti({ particleCount: 12, spread: 55, colors: CANDY });
    if (!isComplete('l7-s1')) completeSurprise('l7-s1');
  };

  const spinAward = () => {
    const next = awardPool.next() ?? AWARDS[0];
    setLatestAward(next);
    setAwardOpen(true);
    setAwardCount((n) => n + 1);
    playSfx('crown');
    if (!prefersReducedMotion()) {
      void medalSpin.start({
        rotate: [0, 360, 720],
        scale: [1, 1.18, 1],
        transition: { duration: 0.8, ease: 'easeOut' },
      });
    }
    void burstStars(PALETTES.gold, 70);
    if (!isComplete('l7-s2')) completeSurprise('l7-s2');
  };

  const pressLaugh = () => {
    const next = laughPool.next() ?? LAUGH_MESSAGES[0];
    setReaction(next);
    setReactionTick((n) => n + 1);
    setLaughCount((n) => n + 1);
    playSfx('laugh');
    burstConfetti({ particleCount: 28, spread: 90, colors: CANDY });
    if (!prefersReducedMotion()) {
      void shake.start({ x: [0, -7, 7, -5, 5, -2, 0], transition: { duration: 0.42 } });
      void buttonPop.start({
        scale: [1, 0.9, 1.1, 1],
        rotate: [0, -5, 5, 0],
        transition: { duration: 0.5 },
      });
      spawnEmojis();
    }
    if (!isComplete('l7-s3')) completeSurprise('l7-s3');
  };

  return (
    <motion.div
      animate={shake}
      className="layer-scene relative flex min-h-[85svh] w-full flex-col items-center overflow-hidden px-4 pb-24 pt-20 sm:px-6 sm:pt-24"
    >
      <ParticleField
        count={34}
        variant="bubbles"
        colors={['#ffe066', '#ff8fa3', '#ffd9a0', '#ffffff']}
      />

      {/* Candy-striped awning across the top of the factory. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-2 opacity-70"
        style={{
          background:
            'repeating-linear-gradient(90deg, #ffe066 0 22px, #ff8fa3 22px 44px, #fff6e6 44px 66px)',
        }}
      />

      <SceneHeader
        eyebrow="Layer 07 — The Giggle Factory"
        emoji="😂"
        title="Welcome to the Giggle Factory"
        subtitle="Three delightfully silly machines, all powered by Moon’s smile. Press, spin and giggle — everything here is pure joy."
        accent={META.accent}
      />

      <div className="relative z-10 mb-7 flex items-center gap-3">
        <span className="h-px w-8 bg-white/25 sm:w-14" />
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-4 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.22em] text-[#ffe9a8] backdrop-blur-sm sm:text-[11px]">
          <Cog className="h-3.5 w-3.5 animate-spin-slow" /> Open for giggles{' '}
          <Cog className="h-3.5 w-3.5 animate-spin-slow" />
        </span>
        <span className="h-px w-8 bg-white/25 sm:w-14" />
      </div>

      <SurpriseDots layer={7} className="relative z-10 mb-8" />

      <div className="relative z-10 grid w-full max-w-5xl gap-6 lg:grid-cols-2">
        {/* ---------- Surprise 1 — Random Joke Machine ---------- */}
        <FactoryPanel label="Random Joke Machine" icon={<Smile className="h-6 w-6" />} tint="#ffe066">
          <div className="rounded-2xl border border-white/15 bg-[#150c28]/80 p-4 shadow-[inset_0_2px_16px_rgba(0,0,0,0.5)] sm:p-5">
            <div className="mb-2 flex items-center justify-between font-body text-[10px] font-bold uppercase tracking-[0.2em] text-[#ffe066]/70">
              <span>Output slot</span>
              <span className="flex items-center gap-1" aria-hidden="true">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff8fa3]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#ffe066]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#9be7c4]" />
              </span>
            </div>

            <div className="relative flex min-h-[112px] items-center rounded-xl bg-[linear-gradient(135deg,#fff6e6,#ffe9c9)] px-4 py-4 shadow-[inset_0_3px_10px_rgba(120,70,20,0.25)] sm:min-h-[124px]">
              <span
                className="absolute left-2 top-2 h-1.5 w-1.5 rounded-full bg-[#d9a25e]/60"
                aria-hidden="true"
              />
              <span
                className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#d9a25e]/60"
                aria-hidden="true"
              />
              <AnimatePresence mode="wait">
                <motion.div
                  key={jokeTick}
                  initial={{ opacity: 0, y: 14, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  {joke ? (
                    <p className="font-body text-[15px] font-bold leading-snug text-[#5a2d12] sm:text-base">
                      <TypingText text={joke} speed={20} showCursor />
                    </p>
                  ) : (
                    <p className="font-body text-sm italic leading-snug text-[#9a6a42]">
                      <Smile className="mr-1 inline h-4 w-4" /> Nothing dispensed yet — give the big
                      button a cheerful press!
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <span className="font-body text-[10px] uppercase tracking-widest text-white/40">
                Dispense lever
              </span>
              <motion.span
                animate={lever}
                className="block h-3 w-20 rounded-full bg-gradient-to-b from-[#ffe9a8] to-[#e0a13d] shadow-[0_3px_0_#8f5a12]"
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <GlowButton size="lg" variant="gold" sound={false} onClick={tellJoke}>
              <Laugh className="h-5 w-5" /> Tell me a joke
            </GlowButton>
            <div className="flex items-center gap-2" aria-hidden="true">
              <Cog className="h-5 w-5 animate-spin-slow text-[#ffe066]/60" />
              <Cog
                className="h-4 w-4 animate-spin-slow text-[#ff8fa3]/60"
                style={{ animationDirection: 'reverse' }}
              />
            </div>
          </div>
          <p className="mt-3 font-body text-[11px] text-white/45">
            Jokes dispensed: <span className="font-bold text-[#ffe9a8]">{jokeCount}</span>
            {jokeCount > 0 && ' · fresh off the joke conveyor every time'}
          </p>
        </FactoryPanel>

        {/* ---------- Surprise 2 — Funny Birthday Awards ---------- */}
        <FactoryPanel label="Funny Birthday Awards" icon={<Trophy className="h-6 w-6" />} tint="#ff8fa3">
          <div className="flex flex-col items-center rounded-2xl border border-white/15 bg-[#150c28]/70 px-4 py-5 text-center shadow-[inset_0_2px_16px_rgba(0,0,0,0.45)] sm:py-6">
            <motion.div
              animate={medalSpin}
              className="relative mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff3c4,#ffcf5c_55%,#e08a2b)] shadow-[0_8px_24px_rgba(255,190,80,0.45)]"
            >
              <span
                className="absolute -inset-2 rounded-full border-2 border-dashed border-[#ffe9a8]/60"
                aria-hidden="true"
              />
              <Medal className="h-10 w-10 text-[#7a3d0c]" />
            </motion.div>
            <p className="font-display text-base font-bold text-white sm:text-lg">The Award-O-Matic 3000</p>
            <p className="mt-1 max-w-xs font-body text-xs leading-relaxed text-white/55">
              Every spin prints an official, completely made-up, 100% delightful award — just for
              Moon.
            </p>

            <AnimatePresence>
              {latestAward && (
                <motion.button
                  key={awardCount}
                  type="button"
                  onClick={() => setAwardOpen(true)}
                  initial={{ opacity: 0, scale: 0.85, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="mt-4 flex w-full items-center gap-2 rounded-xl border border-[#ffe066]/35 bg-[#ffe066]/10 px-3 py-2 text-left transition hover:bg-[#ffe066]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe066]/60"
                  style={{ minHeight: 44 }}
                >
                  <Sparkles className="h-4 w-4 shrink-0 text-[#ffe066]" />
                  <span className="truncate font-body text-xs font-bold text-[#ffe9c9]">{latestAward}</span>
                  <span className="ml-auto shrink-0 font-body text-[10px] text-white/50">view</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <GlowButton size="lg" variant="rainbow" sound={false} onClick={spinAward}>
              <Trophy className="h-5 w-5" /> {awardCount > 0 ? 'Spin another award' : 'Claim your award'}
            </GlowButton>
            <span className="font-body text-[11px] text-white/45">
              Awards won: <span className="font-bold text-[#ffd0dd]">{awardCount}</span>
            </span>
          </div>
        </FactoryPanel>
      </div>

      {/* ---------- Surprise 3 — The Laugh Button ---------- */}
      <div className="relative z-10 mt-6 w-full max-w-3xl">
        <FactoryPanel label="The Laugh Button" icon={<Laugh className="h-6 w-6" />} tint="#f0a04b">
          <div className="relative flex flex-col items-center py-2">
            {/* Floating emoji burst, capped and self-cleaning. */}
            <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden="true">
              <AnimatePresence>
                {floaters.map((f) => (
                  <motion.span
                    key={f.id}
                    className="absolute bottom-24 left-1/2 select-none text-3xl"
                    initial={{ opacity: 0, y: 20, x: f.x, scale: 0.5, rotate: 0 }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      y: -150,
                      x: f.x,
                      scale: [0.5, 1.25, 1.1, 0.9],
                      rotate: f.rotate,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, delay: f.delay, ease: 'easeOut' }}
                  >
                    {f.glyph}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>

            {/* Glowing rays behind the giant button. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-[86px] h-56 w-56 -translate-x-1/2"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <span
                  key={i}
                  className="absolute left-1/2 top-1/2"
                  style={{ transform: `rotate(${i * 45}deg) translateY(-96px)` }}
                >
                  <motion.span
                    className="block text-lg text-[#ffe066]/70"
                    animate={{ opacity: [0.35, 1, 0.35], scale: [0.9, 1.15, 0.9] }}
                    transition={{ duration: 2 + (i % 3) * 0.4, repeat: Infinity, delay: i * 0.2 }}
                  >
                    ✦
                  </motion.span>
                </span>
              ))}
            </div>

            <motion.div
              className="relative z-10"
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <motion.button
                type="button"
                aria-label="Press the giant laugh button for a silly surprise"
                onClick={pressLaugh}
                animate={buttonPop}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.9 }}
                className="relative flex min-h-[136px] w-[min(82vw,300px)] flex-col items-center justify-center rounded-[40px] border-4 border-white/80 bg-[linear-gradient(150deg,#ffe066_0%,#ffb347_45%,#ff6f91_100%)] px-6 py-5 text-[#4a1f00] shadow-[0_16px_0_#c9542f,0_26px_50px_rgba(0,0,0,0.4)] focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70"
              >
                <span
                  className="absolute inset-x-5 top-3 h-6 rounded-full bg-white/30 blur-md"
                  aria-hidden="true"
                />
                <motion.span
                  className="relative text-5xl drop-shadow"
                  animate={{ rotate: [-6, 6, -6], scale: [1, 1.06, 1] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  😂
                </motion.span>
                <span className="relative mt-1 font-display text-2xl font-extrabold uppercase tracking-widest drop-shadow-sm sm:text-3xl">
                  Press for laughs
                </span>
                <span className="relative mt-1 font-body text-xs font-bold uppercase tracking-wider text-[#6b2b00]/70">
                  go on, you know you want to
                </span>
              </motion.button>
            </motion.div>

            <div className="relative z-10 mt-10 flex min-h-[72px] w-full max-w-lg items-center justify-center px-2">
              <AnimatePresence mode="wait">
                {reaction ? (
                  <motion.div
                    key={reactionTick}
                    initial={{ opacity: 0, y: 16, scale: 0.7, rotate: -3 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, y: -12, scale: 0.85 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    className="relative rounded-2xl border border-[#ffe066]/40 bg-[#fff6e6] px-5 py-3 text-center shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
                  >
                    <span
                      className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl"
                      aria-hidden="true"
                    >
                      💬
                    </span>
                    <p className="font-display text-sm font-bold leading-snug text-[#6b2b00] sm:text-base">
                      {reaction}
                    </p>
                  </motion.div>
                ) : (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-body text-sm italic text-white/55"
                  >
                    The factory is waiting for your laugh…
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-2 flex items-center gap-2 font-body text-[11px] text-white/45">
              <PartyPopper className="h-3.5 w-3.5 text-[#ff8fa3]" />
              Laughs triggered: <span className="font-bold text-[#ffe9a8]">{laughCount}</span> · every
              press is a brand-new giggle
            </div>
          </div>
        </FactoryPanel>
      </div>

      <div className="relative z-10 mt-10 flex items-center gap-2 font-body text-xs text-white/50">
        <Sparkles className="h-3.5 w-3.5" />
        Found{' '}
        {[isComplete('l7-s1'), isComplete('l7-s2'), isComplete('l7-s3')].filter(Boolean).length} of 3
        giggles in this factory
      </div>

      {/* The official award certificate — a RevealCard with an extra seal & stamp. */}
      <RevealCard
        open={awardOpen}
        onClose={() => setAwardOpen(false)}
        emoji="🏆"
        title="Official Award Certificate"
        message={latestAward}
        accent="#ffe066"
        closeLabel="Proudly accept"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2" aria-hidden="true">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#ffe066]" />
            <Star className="h-4 w-4 fill-[#ffe066] text-[#ffe066]" />
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#ffe066]" />
          </div>
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
            Proudly presented to
          </p>
          <p className="font-display text-2xl font-bold text-[#ffe9a8]">Moon 🌙</p>
          <motion.div
            className="mt-1 flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-[#ffe066]/70 bg-[#ffe066]/10 shadow-[0_0_30px_rgba(255,224,102,0.25)]"
            animate={{ rotate: [-8, 8, -8] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Medal className="h-8 w-8 text-[#ffe066]" />
          </motion.div>
          <p className="font-body text-[10px] uppercase tracking-[0.2em] text-white/40">
            Certified fresh · The Giggle Factory
          </p>
        </div>
      </RevealCard>
    </motion.div>
  );
}
