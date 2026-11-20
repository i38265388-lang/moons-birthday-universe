import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Cloud, Rainbow, Sparkles, Star, Zap } from 'lucide-react';
import { useSurprises } from '../context/SurpriseContext';
import { useAudio } from '../context/AudioContext';
import { EASTER_EGG_MESSAGES } from '../data/birthdayMessages';
import { LAYERS } from '../data/surprises';
import { CLOUD_WISHES, DREAM_WISHES, RAINBOW_MESSAGES } from '../data/wishes';
import { burstConfetti, PALETTES } from '../utils/fx';
import { NoRepeatPool } from '../utils/random';
import {
  GlowButton,
  ParticleField,
  RevealCard,
  SceneHeader,
  SurpriseDots,
  TypingText,
} from '../components/ui';

const meta = LAYERS[7];
const ACCENT = meta.accent; // soft golden light
const ACCENT2 = meta.accent2; // pale sky blue

/** The seven classic rainbow bands, in outer-to-inner order. */
const RAINBOW_BANDS = [
  { name: 'Red', color: '#ff6b81', soft: '#ff9aa8', glow: 'rgba(255,107,129,0.45)' },
  { name: 'Orange', color: '#ff9f43', soft: '#ffc47a', glow: 'rgba(255,159,67,0.45)' },
  { name: 'Yellow', color: '#ffd93d', soft: '#ffefa0', glow: 'rgba(255,217,61,0.45)' },
  { name: 'Green', color: '#5fc98a', soft: '#a5e8bd', glow: 'rgba(95,201,138,0.45)' },
  { name: 'Blue', color: '#4d96ff', soft: '#9dc6ff', glow: 'rgba(77,150,255,0.45)' },
  { name: 'Indigo', color: '#6c5ce7', soft: '#a99ff0', glow: 'rgba(108,92,231,0.45)' },
  { name: 'Violet', color: '#a66cff', soft: '#d0aeff', glow: 'rgba(166,108,255,0.45)' },
] as const;

/** Fixed sky positions so the clouds never overlap or jump between renders. */
const SKY_CLOUDS = [
  { left: '2%', top: '6%', size: 92, duration: 24, delay: -3, tint: '#ffffff' },
  { left: '24%', top: '0%', size: 108, duration: 31, delay: -11, tint: '#f2f0ff' },
  { left: '50%', top: '11%', size: 86, duration: 27, delay: -6, tint: '#fff7f0' },
  { left: '68%', top: '2%', size: 96, duration: 35, delay: -15, tint: '#ffffff' },
  { left: '9%', top: '54%', size: 98, duration: 29, delay: -20, tint: '#f0f6ff' },
  { left: '46%', top: '57%', size: 92, duration: 38, delay: -8, tint: '#fff4fb' },
] as const;

/** A fluffy cloud built from a few overlapping, soft-edged puffs. */
function DreamCloud({ size, tint }: { size: number; tint: string }) {
  const fill = `linear-gradient(180deg, #ffffff 10%, ${tint} 100%)`;
  const shadow = '0 10px 26px rgba(28,36,92,0.28)';
  return (
    <div className="relative" style={{ width: size, height: size * 0.62 }} aria-hidden="true">
      <span
        className="absolute bottom-0 left-[5%] rounded-full"
        style={{ width: size * 0.9, height: size * 0.5, background: fill, boxShadow: shadow }}
      />
      <span
        className="absolute bottom-[12%] left-[17%] rounded-full"
        style={{ width: size * 0.56, height: size * 0.56, background: fill, boxShadow: shadow }}
      />
      <span
        className="absolute bottom-[14%] right-[11%] rounded-full"
        style={{ width: size * 0.5, height: size * 0.5, background: fill, boxShadow: shadow }}
      />
      <span
        className="absolute left-[26%] top-[20%] h-[18%] w-[26%] rotate-[-18deg] rounded-full bg-white/70 blur-[2px]"
        style={{ opacity: 0.8 }}
      />
      <span className="absolute right-[16%] top-[8%] text-[10px] text-white/90 drop-shadow" style={{ color: ACCENT }}>
        ✦
      </span>
    </div>
  );
}

export default function Layer08() {
  const { completeSurprise, isComplete, findEgg, hasEgg } = useSurprises();
  const { playSfx } = useAudio();

  // One non-repeating pool per repeatable surprise.
  const cloudPool = useRef(new NoRepeatPool(CLOUD_WISHES)).current;
  const dreamPool = useRef(new NoRepeatPool(DREAM_WISHES)).current;
  const rainbowPools = useRef(
    RAINBOW_BANDS.reduce<Record<string, NoRepeatPool<string>>>((pools, band) => {
      pools[band.name] = new NoRepeatPool(RAINBOW_MESSAGES[band.name] ?? []);
      return pools;
    }, {}),
  ).current;

  const timers = useRef<number[]>([]);
  const eggFired = useRef(false);
  const schedule = (fn: () => void, delay: number) => {
    timers.current.push(window.setTimeout(fn, delay));
  };
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  /* ---------- Surprise 1 — Cloud of Wishes ---------- */
  const [cloudMessage, setCloudMessage] = useState('');
  const [cloudTaps, setCloudTaps] = useState(0);

  const pickCloud = () => {
    const wish = cloudPool.next() ?? CLOUD_WISHES[0];
    setCloudMessage(wish);
    setCloudTaps((n) => n + 1);
    playSfx('pop');
    completeSurprise('l8-s1');
    burstConfetti({
      particleCount: 22,
      spread: 70,
      colors: PALETTES.pastel,
      origin: { y: 0.35 },
    });
  };

  /* ---------- Surprise 2 — The Magical Rainbow ---------- */
  const [rainbowVisible, setRainbowVisible] = useState(false);
  const [rainbowMessage, setRainbowMessage] = useState('');
  const [rainbowBandName, setRainbowBandName] = useState('');
  const [rainbowTaps, setRainbowTaps] = useState(0);

  useEffect(() => {
    // Let the sky settle first, then let the rainbow quietly fade into view.
    schedule(() => setRainbowVisible(true), 700);
  }, []);

  const pickRainbow = (band: (typeof RAINBOW_BANDS)[number]) => {
    const pool = rainbowPools[band.name];
    const wish = pool.next() ?? RAINBOW_MESSAGES[band.name]?.[0] ?? 'A little colour, just for you!';
    setRainbowMessage(wish);
    setRainbowBandName(band.name);
    setRainbowTaps((n) => n + 1);
    playSfx('chime');
    completeSurprise('l8-s2');
    burstConfetti({ particleCount: 28, spread: 85, colors: PALETTES.rainbow, origin: { y: 0.5 } });
  };

  /* ---------- Surprise 3 — The Dream Machine ---------- */
  const [dreamBusy, setDreamBusy] = useState(false);
  const [dreamMessage, setDreamMessage] = useState('');
  const [dreamCount, setDreamCount] = useState(0);

  const generateDream = () => {
    if (dreamBusy) return;
    setDreamBusy(true);
    playSfx('whoosh');
    const wish = dreamPool.next() ?? DREAM_WISHES[0];
    schedule(() => {
      setDreamMessage(wish);
      setDreamCount((n) => n + 1);
      setDreamBusy(false);
      completeSurprise('l8-s3');
      playSfx('gift');
      burstConfetti({ particleCount: 38, spread: 85, colors: PALETTES.pastel });
    }, 720);
  };

  /* ---------- Hidden secret rainbow (does not count toward the 30) ---------- */
  const [showSecretRainbow, setShowSecretRainbow] = useState(false);
  const foundCount = [
    isComplete('l8-s1'),
    isComplete('l8-s2'),
    isComplete('l8-s3'),
  ].filter(Boolean).length;

  useEffect(() => {
    if (foundCount < 3 || eggFired.current || hasEgg('secret-rainbow')) return;
    eggFired.current = true;
    // Wait a little while after the third discovery — never reveal immediately.
    schedule(() => {
      setShowSecretRainbow(true);
      findEgg('secret-rainbow', EASTER_EGG_MESSAGES.secretRainbow);
      schedule(() => setShowSecretRainbow(false), 5200);
    }, 1800);
    // React StrictMode runs mount effects twice in development. The shared
    // timer cleanup cancels the first pass, so allow the remount to reschedule.
    return () => {
      if (!hasEgg('secret-rainbow')) eggFired.current = false;
    };
  }, [foundCount, findEgg, hasEgg]);

  return (
    <div className="layer-scene relative flex min-h-[78vh] w-full flex-col items-center overflow-hidden px-4 pb-20 pt-24 text-center sm:px-6 sm:pt-28">
      {/* ---- The dreamy sky ---- */}
      <ParticleField colors={['#ffffff', ACCENT, ACCENT2, '#c9b6ff']} count={34} variant="sparkles" />
      <div
        className="pointer-events-none absolute -left-24 top-[10%] h-72 w-72 rounded-full bg-[#ffe3a3]/15 blur-[100px] animate-aurora"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-[12%] h-80 w-80 rounded-full bg-[#b8d8ff]/20 blur-[110px] animate-aurora"
        style={{ animationDelay: '-8s' }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#1b2352]/70 to-transparent"
        aria-hidden="true"
      />

      <SceneHeader
        eyebrow="Layer 08 — The Birthday Dream World"
        emoji="☁️"
        title="The Birthday Dream World"
        subtitle="Drift through a sky of soft possibilities. Every cloud, every colour, every dream has a wish for you."
        accent={ACCENT2}
      />
      <SurpriseDots layer={8} className="relative z-10 mb-9" />

      <div className="relative z-10 grid w-full max-w-5xl grid-cols-1 gap-5 lg:grid-cols-3">
        {/* ===== Surprise 1 — Cloud of Wishes ===== */}
        <div className="surprise-card glass flex flex-col items-center rounded-3xl border border-white/15 bg-white/[0.07] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-md sm:p-6">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 shadow-[inset_0_0_20px_rgba(184,216,255,0.3)]">
            <Cloud className="h-6 w-6" style={{ color: ACCENT2 }} />
          </div>
          <h3 className="font-display text-lg font-bold text-white">Cloud of Wishes</h3>
          <p className="mt-1 min-h-[34px] font-body text-xs leading-snug text-white/60">
            Tap any drifting cloud to catch a gentle wish.
          </p>

          <div className="relative my-2 h-[230px] w-full max-w-[340px] overflow-hidden rounded-2xl bg-gradient-to-b from-[#3a4a9c]/35 to-transparent sm:h-[250px]">
            <div
              className="pointer-events-none absolute left-1/2 top-4 h-40 w-52 -translate-x-1/2 rounded-full bg-white/10 blur-3xl"
              aria-hidden="true"
            />
            {SKY_CLOUDS.map((cloud, i) => (
              <motion.button
                key={i}
                type="button"
                onClick={pickCloud}
                aria-label={`Cloud ${i + 1}: reveal a wish`}
                className="absolute flex min-h-[44px] items-center justify-center rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
                style={{ left: cloud.left, top: cloud.top, minWidth: 44 }}
                whileHover={{ scale: 1.08, y: -5 }}
                whileTap={{ scale: 0.94 }}
              >
                <div
                  className="animate-drift-slow"
                  style={{ animationDuration: `${cloud.duration}s`, animationDelay: `${cloud.delay}s` }}
                >
                  <DreamCloud size={cloud.size} tint={cloud.tint} />
                </div>
              </motion.button>
            ))}
          </div>

          <GlowButton size="sm" variant="ghost" className="min-h-[44px]" onClick={pickCloud}>
            <Sparkles className="h-4 w-4" /> Catch a cloud wish
          </GlowButton>
          <p className="mt-3 font-body text-[11px] text-white/45">
            {cloudTaps > 0
              ? `${cloudTaps} ${cloudTaps === 1 ? 'wish' : 'wishes'} floating your way — catch another!`
              : 'Six clouds, endless good wishes.'}
          </p>
        </div>

        {/* ===== Surprise 2 — The Magical Rainbow ===== */}
        <div className="surprise-card glass flex flex-col items-center rounded-3xl border border-white/15 bg-white/[0.07] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-md sm:p-6">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 shadow-[inset_0_0_20px_rgba(255,227,163,0.3)]">
            <Rainbow className="h-6 w-6" style={{ color: ACCENT }} />
          </div>
          <h3 className="font-display text-lg font-bold text-white">The Magical Rainbow</h3>
          <p className="mt-1 min-h-[34px] font-body text-xs leading-snug text-white/60">
            Seven colours appear slowly. Touch one to hear what it has to say.
          </p>

          <div className="relative my-2 flex w-full max-w-[300px] flex-col items-center gap-[3px] py-2">
            <span
              className="pointer-events-none absolute -inset-x-6 -inset-y-4 rounded-full bg-gradient-to-b from-[#ffd166]/20 via-[#7bed9f]/10 to-[#c56cf0]/20 blur-3xl"
              aria-hidden="true"
            />
            <AnimatePresence>
              {rainbowVisible &&
                RAINBOW_BANDS.map((band, i) => (
                  <motion.button
                    key={band.name}
                    type="button"
                    onClick={() => pickRainbow(band)}
                    aria-label={`${band.name} rainbow band — reveal a message`}
                    className="relative z-10 flex h-11 min-h-[44px] w-full items-center justify-center rounded-full font-display text-xs font-bold tracking-wide text-white drop-shadow focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
                    style={{
                      width: `${100 - i * 5}%`,
                      background: `linear-gradient(90deg, ${band.color}, ${band.soft})`,
                      boxShadow: `0 6px 18px ${band.glow}`,
                    }}
                    initial={{ opacity: 0, scale: 0.55, y: 24 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, delay: i * 0.12, ease: 'easeOut' }}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {band.name}
                  </motion.button>
                ))}
            </AnimatePresence>
          </div>

          <p className="mt-1 font-body text-[11px] text-white/45">
            {rainbowTaps > 0
              ? `${rainbowTaps} ${rainbowTaps === 1 ? 'colour' : 'colours'} shared — tap again for more!`
              : 'Red through violet — all for you.'}
          </p>
        </div>

        {/* ===== Surprise 3 — The Dream Machine ===== */}
        <div className="surprise-card glass flex flex-col items-center rounded-3xl border border-white/15 bg-white/[0.07] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-md sm:p-6">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 shadow-[inset_0_0_20px_rgba(184,216,255,0.3)]">
            <Zap className="h-6 w-6" style={{ color: ACCENT2 }} />
          </div>
          <h3 className="font-display text-lg font-bold text-white">The Dream Machine</h3>
          <p className="mt-1 min-h-[34px] font-body text-xs leading-snug text-white/60">
            Press the button and let the machine dream up a wish just for you.
          </p>

          <div
            className="relative my-2 w-full max-w-[300px] rounded-[28px] border border-white/25 p-4 pt-6 shadow-[0_16px_40px_rgba(0,0,0,0.3)]"
            style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.18), rgba(255,255,255,0.03))' }}
          >
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-2xl" aria-hidden="true" style={{ color: ACCENT }}>
              ✦
            </span>
            <motion.span
              className="absolute -left-3 top-9 text-xl"
              aria-hidden="true"
              animate={{ rotate: 360 }}
              transition={{ duration: 11, repeat: Infinity, ease: 'linear' }}
            >
              ⚙️
            </motion.span>
            <motion.span
              className="absolute -right-3 top-9 text-lg"
              aria-hidden="true"
              animate={{ rotate: -360 }}
              transition={{ duration: 13, repeat: Infinity, ease: 'linear' }}
            >
              ⚙️
            </motion.span>

            <div className="rounded-2xl border border-[#b8d8ff]/30 bg-[#121a44]/90 p-3 text-left shadow-[inset_0_0_30px_rgba(120,150,255,0.28)]">
              <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-1.5">
                <span className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                  Dream-O-Matic
                </span>
                <span className="flex items-center gap-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${dreamBusy ? 'animate-pulse bg-[#ff9ecd]' : 'bg-[#7bed9f]'}`} />
                  <span className="font-body text-[9px] uppercase tracking-wider text-white/40">
                    {dreamBusy ? 'Dreaming' : 'Ready'}
                  </span>
                </span>
              </div>
              <div className="flex min-h-[76px] items-center justify-center px-1 text-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={dreamBusy ? 'busy' : `dream-${dreamCount}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="font-body text-sm leading-snug text-white/90"
                  >
                    {dreamBusy ? (
                      <span className="flex items-center gap-2" style={{ color: ACCENT }}>
                        <span className="inline-block animate-spin-slow text-lg">⚙️</span>
                        <span className="animate-pulse">Dreaming something lovely</span>
                      </span>
                    ) : dreamMessage ? (
                      <TypingText key={`type-${dreamCount}`} text={dreamMessage} speed={22} start={!dreamBusy} />
                    ) : (
                      <span className="text-white/40">Press the button to brew a dream…</span>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="mt-2 flex items-center justify-center gap-1.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: i % 2 === 0 ? ACCENT : ACCENT2 }}
                    animate={dreamBusy ? { opacity: [0.2, 1, 0.2], scale: [1, 1.6, 1] } : { opacity: 0.45, scale: 1 }}
                    transition={{ duration: 0.7, repeat: dreamBusy ? Infinity : 0, delay: i * 0.1 }}
                  />
                ))}
              </div>
            </div>
          </div>

          <GlowButton size="sm" variant="rainbow" className="min-h-[44px]" onClick={generateDream} disabled={dreamBusy}>
            <Zap className="h-4 w-4" /> {dreamBusy ? 'Dreaming…' : 'Generate a dream'}
          </GlowButton>
          <p className="mt-3 font-body text-[11px] text-white/45">
            {dreamCount > 0
              ? `${dreamCount} ${dreamCount === 1 ? 'dream' : 'dreams'} delivered — dream again anytime!`
              : 'A brand-new wish every single time.'}
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-9 flex items-center gap-2 font-body text-xs text-white/45">
        <Cloud className="h-3.5 w-3.5" />
        <Star className="h-3.5 w-3.5" />
        Found {foundCount} of 3 here
      </div>

      {/* ---- Reveal overlays ---- */}
      <RevealCard
        open={Boolean(cloudMessage)}
        onClose={() => setCloudMessage('')}
        emoji="☁️"
        title="A Wish From the Clouds"
        message={cloudMessage}
        accent={ACCENT2}
        closeLabel="Catch another cloud"
      />
      <RevealCard
        open={Boolean(rainbowMessage)}
        onClose={() => setRainbowMessage('')}
        emoji="🌈"
        title={rainbowBandName ? `The ${rainbowBandName} Band Says` : 'The Rainbow Says'}
        message={rainbowMessage}
        accent={ACCENT}
        closeLabel="Pick another colour"
      />
      <RevealCard
        open={Boolean(dreamMessage)}
        onClose={() => setDreamMessage('')}
        emoji="💭"
        title="A Dream Wish For You"
        message={dreamMessage}
        accent={ACCENT2}
        closeLabel="Dream again"
      />

      {/* ---- The once-only secret rainbow ---- */}
      <AnimatePresence>
        {showSecretRainbow && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-40 flex items-end justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            aria-hidden="true"
          >
            <div className="relative h-[70vh] w-full max-w-3xl">
              {RAINBOW_BANDS.map((band, i) => (
                <div
                  key={band.name}
                  className="absolute bottom-0 left-1/2 -translate-x-1/2"
                  style={{ width: `${100 - i * 11}%`, height: `${52 - i * 5.4}%` }}
                >
                  <motion.span
                    className="block h-full w-full"
                    style={{
                      border: `${Math.max(6, 16 - i)}px solid ${band.color}`,
                      borderBottom: 0,
                      borderTopLeftRadius: '100%',
                      borderTopRightRadius: '100%',
                      boxShadow: `0 0 36px ${band.glow}`,
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.32, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.15 }}
                    transition={{ delay: i * 0.18, duration: 1 }}
                  />
                </div>
              ))}
              <motion.span
                className="absolute left-1/2 top-[26%] -translate-x-1/2 text-5xl drop-shadow-[0_0_24px_rgba(255,255,255,0.8)]"
                initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                animate={{ opacity: 0.9, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 1.4 }}
                transition={{ delay: 0.6, duration: 1.1, type: 'spring' }}
              >
                ✨
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
