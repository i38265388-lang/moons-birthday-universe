import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { Crown, ListChecks, RotateCcw, Sparkles, Star } from 'lucide-react';
import { useSurprises } from '../context/SurpriseContext';
import { useAudio } from '../context/AudioContext';
import { COMPLIMENTS, CROWN_MESSAGE, REASONS } from '../data/compliments';
import { PERSON } from '../data/birthdayMessages';
import { LAYERS } from '../data/surprises';
import { burstStars, PALETTES } from '../utils/fx';
import { NoRepeatPool, shuffle } from '../utils/random';
import {
  GlowButton,
  ParticleField,
  RevealCard,
  SceneHeader,
  SurpriseDots,
} from '../components/ui';

const META = LAYERS[3];
const GOLD = META.accent; // #ffdf8a
const VIOLET = META.accent2; // #bfa8ff

interface StarSpec {
  x: number;
  y: number;
  size: 'sm' | 'md' | 'lg';
  delay: number;
}

/** A hand-placed constellation so the sky feels intentional, not random. */
const STARS: StarSpec[] = [
  { x: 12, y: 20, size: 'md', delay: 0 },
  { x: 30, y: 11, size: 'sm', delay: 0.4 },
  { x: 50, y: 25, size: 'lg', delay: 0.8 },
  { x: 70, y: 13, size: 'sm', delay: 1.2 },
  { x: 88, y: 26, size: 'md', delay: 0.6 },
  { x: 20, y: 49, size: 'sm', delay: 1.6 },
  { x: 42, y: 57, size: 'md', delay: 0.2 },
  { x: 62, y: 45, size: 'sm', delay: 1.4 },
  { x: 81, y: 59, size: 'lg', delay: 1 },
  { x: 29, y: 80, size: 'md', delay: 1.8 },
  { x: 55, y: 84, size: 'sm', delay: 0.9 },
  { x: 75, y: 81, size: 'md', delay: 1.5 },
];

/** Pairs of star indices joined by a faint constellation thread. */
const LINKS: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [6, 9], [9, 10], [10, 11], [11, 8],
  [2, 6], [7, 4],
];

const STAR_FONT: Record<StarSpec['size'], string> = {
  sm: 'text-xl',
  md: 'text-3xl',
  lg: 'text-4xl',
};

const SPARKLES = [
  { left: '28%', top: '4%', delay: 0 },
  { left: '72%', top: '8%', delay: 0.5 },
  { left: '38%', top: '16%', delay: 1.1 },
  { left: '64%', top: '19%', delay: 0.8 },
  { left: '22%', top: '27%', delay: 1.5 },
  { left: '78%', top: '29%', delay: 0.3 },
];

interface ActiveCompliment {
  key: number;
  star: number;
  text: string;
}

export default function Layer04() {
  const { completeSurprise, isComplete, showToast } = useSurprises();
  const { playSfx } = useAudio();

  // ---- Surprise 1: the compliment constellation ----
  const complimentPool = useRef(new NoRepeatPool(COMPLIMENTS)).current;
  const complimentKey = useRef(0);
  const [active, setActive] = useState<ActiveCompliment | null>(null);
  const [revealed, setRevealed] = useState(0);

  const tapStar = (index: number) => {
    const message = complimentPool.next() ?? COMPLIMENTS[0];
    complimentKey.current += 1;
    setActive({ key: complimentKey.current, star: index, text: message });
    setRevealed((n) => n + 1);
    playSfx('pop');
    void burstStars(PALETTES.gold, 14);
    completeSurprise('l4-s1');
  };

  // ---- Surprise 2: the crown ----
  const [crownWorn, setCrownWorn] = useState(false);
  const [crownModalOpen, setCrownModalOpen] = useState(false);
  const timers = useRef<number[]>([]);

  const toggleCrown = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    if (crownWorn) {
      setCrownWorn(false);
      playSfx('whoosh');
      showToast('👑 Crown safely set aside — try it on whenever you like!', 'info', 2600);
      return;
    }
    setCrownWorn(true);
    playSfx('crown');
    void burstStars(PALETTES.gold, 60);
    completeSurprise('l4-s2');
    // Let the crown settle onto Moon before the message appears.
    timers.current.push(window.setTimeout(() => setCrownModalOpen(true), 760));
  };

  // ---- Surprise 3: the 10 reasons generator ----
  const reasonBag = useRef<string[]>([]);
  const [reasons, setReasons] = useState<string[]>([]);
  const [generation, setGeneration] = useState(0);

  const generateReasons = () => {
    // Avoid repeats until the curated pool has been exhausted.
    if (reasonBag.current.length < 10) reasonBag.current = shuffle(REASONS);
    const fresh = reasonBag.current.splice(-10);
    setReasons(fresh);
    setGeneration((n) => n + 1);
    playSfx('reveal');
    void burstStars(PALETTES.gold, 26);
    completeSurprise('l4-s3');
  };

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const tooltipStyle = active
    ? (() => {
        const star = STARS[active.star];
        const horizontal =
          star.x < 30 ? '-12%' : star.x > 70 ? '-88%' : '-50%';
        const vertical =
          star.y < 32 ? '14px' : 'calc(-100% - 14px)';
        return { left: `${star.x}%`, top: `${star.y}%`, transform: `translate(${horizontal}, ${vertical})` };
      })()
    : undefined;

  return (
    <div className="layer-scene relative flex min-h-screen w-full flex-col items-center overflow-x-hidden px-3 pb-28 pt-28 sm:px-6 sm:pt-32">
      <ParticleField
        count={48}
        colors={['#ffdf8a', '#fff4cf', VIOLET]}
        variant="stars"
      />

      <SceneHeader
        eyebrow="Layer 04 — The Compliment Universe"
        emoji="⭐"
        title="A Constellation of Reasons to Smile"
        subtitle="Golden stars, a birthday crown, and ten little reminders of how wonderful you are."
        accent={GOLD}
      />
      <SurpriseDots layer={4} className="relative z-10 mb-8" />

      <div className="relative z-10 flex w-full max-w-3xl flex-col gap-6">
        {/* ---------- Surprise 1 — Star of Awesomeness ---------- */}
        <section className="surprise-card relative overflow-hidden rounded-[26px] border border-white/15 bg-white/[0.055] p-4 backdrop-blur-xl sm:rounded-[30px] sm:p-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-14 -top-12 h-40 w-40 rounded-full blur-3xl"
            style={{ background: `${GOLD}22` }}
          />
          <div className="relative mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h3 className="font-display text-lg font-bold text-white sm:text-xl">
                ⭐ Star of Awesomeness
              </h3>
              <p className="mt-1 font-body text-xs text-white/60 sm:text-sm">
                Tap a golden star — each one holds a kind word just for you.
              </p>
            </div>
            <span className="font-body text-[11px] font-semibold text-[#ffdf8a]">
              ✦ {revealed} revealed
            </span>
          </div>

          <div className="relative h-[300px] w-full sm:h-[360px]">
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {LINKS.map(([a, b], i) => (
                <line
                  key={i}
                  x1={STARS[a].x}
                  y1={STARS[a].y}
                  x2={STARS[b].x}
                  y2={STARS[b].y}
                  stroke={GOLD}
                  strokeOpacity={0.26}
                  strokeWidth={0.22}
                  strokeDasharray="1 1.4"
                />
              ))}
            </svg>

            {STARS.map((star, i) => (
              <motion.button
                key={i}
                type="button"
                aria-label={`Reveal a compliment from star ${i + 1}`}
                onClick={() => tapStar(i)}
                className="absolute flex h-11 w-11 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffdf8a]/70"
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  marginLeft: -22,
                  marginTop: -22,
                }}
              >
                <span
                  className="pointer-events-none absolute h-10 w-10 rounded-full blur-xl"
                  style={{ background: `${GOLD}33` }}
                />
                <motion.span
                  className={`relative select-none leading-none text-[#ffdf8a] drop-shadow-[0_0_12px_rgba(255,223,138,0.95)] ${STAR_FONT[star.size]}`}
                  animate={{ opacity: [0.55, 1, 0.55], scale: [0.88, 1.12, 0.88] }}
                  transition={{
                    duration: 2.8 + (i % 5) * 0.35,
                    repeat: Infinity,
                    delay: star.delay,
                    ease: 'easeInOut',
                  }}
                >
                  ✦
                </motion.span>
              </motion.button>
            ))}

            <AnimatePresence>
              {active && (
                <motion.div
                  key={active.key}
                  className="pointer-events-none absolute z-20 w-52 sm:w-64"
                  style={tooltipStyle}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    initial={{ y: 10, scale: 0.82 }}
                    animate={{ y: -4, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    className="rounded-2xl border border-[#ffdf8a]/45 bg-[#1b1538]/95 px-4 py-3 text-center shadow-[0_16px_45px_rgba(0,0,0,0.5)] backdrop-blur-xl"
                    style={{ boxShadow: `0 0 34px ${GOLD}33, 0 16px 45px rgba(0,0,0,0.5)` }}
                  >
                    <span className="block font-display text-[10px] font-bold uppercase tracking-[0.18em] text-[#ffdf8a]/80">
                      A star says…
                    </span>
                    <p className="mt-1 font-body text-xs leading-snug text-white/95 sm:text-sm">
                      {active.text}
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="relative mt-2 text-center font-body text-[11px] text-white/40">
            Keep tapping — the sky has {COMPLIMENTS.length} kind things to tell you.
          </p>
        </section>

        {/* ---------- Surprise 2 — Crown of the Day ---------- */}
        <section className="surprise-card relative overflow-hidden rounded-[26px] border border-white/15 bg-white/[0.055] p-5 backdrop-blur-xl sm:rounded-[30px] sm:p-7">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-16 top-1/3 h-44 w-44 rounded-full blur-3xl"
            style={{ background: `${VIOLET}22` }}
          />
          <div className="relative mb-2 text-center">
            <h3 className="font-display text-lg font-bold text-white sm:text-xl">
              👑 Crown of the Day
            </h3>
            <p className="mt-1 font-body text-xs text-white/60 sm:text-sm">
              Every birthday queen needs a crown. Go on, try yours on.
            </p>
          </div>

          <LayoutGroup>
            <div className="relative mx-auto h-56 w-full max-w-sm sm:h-64">
              {/* A simple, stylised Moon silhouette */}
              <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 flex-col items-center">
                <div
                  className="relative flex h-24 w-24 items-center justify-center rounded-full shadow-[0_0_40px_rgba(191,168,255,0.45)]"
                  style={{
                    background:
                      'radial-gradient(circle at 35% 30%, #fff6df, #e9d2ff 55%, #8f74c9 100%)',
                  }}
                >
                  <span className="font-display text-3xl text-[#6c4fb0]/70">☾</span>
                </div>
                <div className="-mt-3 h-16 w-32 rounded-t-[3.5rem] bg-gradient-to-b from-[#bfa8ff]/55 to-[#6c4fb0]/20 sm:w-36" />
                <span className="mt-2 font-display text-lg font-bold" style={{ color: GOLD }}>
                  {PERSON.name}
                </span>
                <AnimatePresence>
                  {crownWorn && (
                    <motion.span
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="mt-0.5 font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[#ffdf8a]/85"
                    >
                      Birthday Queen
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* The crown lives in one spot when resting, another when worn. */}
              {crownWorn ? (
                <div className="absolute inset-x-0 top-1 flex justify-center">
                  <motion.button
                    type="button"
                    layoutId="l4-crown"
                    aria-label="Take off the birthday crown"
                    aria-pressed={crownWorn}
                    onClick={toggleCrown}
                    className="flex h-14 w-14 cursor-pointer select-none items-center justify-center rounded-full text-5xl leading-none drop-shadow-[0_0_20px_rgba(255,223,138,0.95)] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffdf8a]/70"
                  >
                    👑
                  </motion.button>
                </div>
              ) : (
                <div className="absolute bottom-5 left-2">
                  <motion.button
                    type="button"
                    layoutId="l4-crown"
                    aria-label="Try on the birthday crown"
                    aria-pressed={crownWorn}
                    onClick={toggleCrown}
                    className="flex h-14 w-14 cursor-pointer select-none items-center justify-center rounded-full text-4xl leading-none drop-shadow-[0_0_18px_rgba(255,223,138,0.8)] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffdf8a]/70"
                  >
                    👑
                  </motion.button>
                  <span className="absolute -bottom-4 left-0 whitespace-nowrap font-body text-[10px] uppercase tracking-[0.14em] text-white/40">
                    your crown
                  </span>
                </div>
              )}

              <AnimatePresence>
                {crownWorn &&
                  SPARKLES.map((s, i) => (
                    <motion.span
                      key={i}
                      className="pointer-events-none absolute select-none text-sm text-[#ffdf8a]"
                      style={{ left: s.left, top: s.top }}
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -8, 0], scale: 1 }}
                      exit={{ opacity: 0, scale: 0.4 }}
                      transition={{
                        duration: 2 + (i % 3) * 0.4,
                        repeat: Infinity,
                        delay: s.delay,
                      }}
                    >
                      ✦
                    </motion.span>
                  ))}
              </AnimatePresence>
            </div>

            <div className="mt-4 flex justify-center">
              <GlowButton
                size="md"
                variant={crownWorn ? 'ghost' : 'gold'}
                onClick={toggleCrown}
              >
                {crownWorn ? (
                  <>
                    <RotateCcw className="h-4 w-4" /> Take it off
                  </>
                ) : (
                  <>
                    <Crown className="h-4 w-4" /> Try on the crown
                  </>
                )}
              </GlowButton>
            </div>
          </LayoutGroup>
        </section>

        {/* ---------- Surprise 3 — 10 Reasons Generator ---------- */}
        <section className="surprise-card relative overflow-hidden rounded-[26px] border border-white/15 bg-white/[0.055] p-5 backdrop-blur-xl sm:rounded-[30px] sm:p-7">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -bottom-16 h-44 w-44 rounded-full blur-3xl"
            style={{ background: `${GOLD}20` }}
          />
          <div className="relative text-center">
            <h3 className="font-display text-lg font-bold text-white sm:text-xl">
              ✨ The 10 Reasons Generator
            </h3>
            <p className="mt-1 font-body text-xs text-white/60 sm:text-sm">
              Ten unique reasons, picked from a whole universe of goodness.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <GlowButton size="md" variant="gold" onClick={generateReasons}>
                <Sparkles className="h-4 w-4" />
                {generation === 0 ? 'Generate 10 reasons' : 'Generate a fresh set'}
              </GlowButton>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {reasons.length > 0 && (
              <motion.div
                key={generation}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="relative mt-5 rounded-2xl border border-white/15 bg-[#120e2a]/70 p-3 sm:p-4"
              >
                <div className="no-scrollbar max-h-[22rem] overflow-y-auto pr-1">
                  <ul className="flex flex-col gap-2">
                    {reasons.map((reason, i) => (
                      <motion.li
                        key={`${generation}-${i}`}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: i * 0.06,
                          type: 'spring',
                          stiffness: 220,
                          damping: 20,
                        }}
                        className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2.5"
                      >
                        <span
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-display text-xs font-bold"
                          style={{
                            background: `${GOLD}22`,
                            color: GOLD,
                            boxShadow: `inset 0 0 12px ${GOLD}18`,
                          }}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="pt-0.5 font-body text-sm leading-snug text-white/90">
                          {reason}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
                <p className="mt-3 text-center font-body text-[11px] text-white/35">
                  <ListChecks className="mr-1 inline h-3 w-3" />
                  Scroll for all ten — every set is freshly shuffled.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      <div className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-2 font-body text-xs text-white/40">
        <Star className="h-3.5 w-3.5" />
        <Sparkles className="h-3.5 w-3.5" />
        <Crown className="h-3.5 w-3.5" />
        <span>
          Found {[isComplete('l4-s1'), isComplete('l4-s2'), isComplete('l4-s3')].filter(Boolean).length} of 3 here
        </span>
      </div>

      <RevealCard
        open={crownModalOpen}
        onClose={() => setCrownModalOpen(false)}
        emoji="👑"
        title="Crown of the Day"
        message={CROWN_MESSAGE}
        accent={GOLD}
      />
    </div>
  );
}
