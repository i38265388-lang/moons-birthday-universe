import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Gift, Sparkles, Star, Zap } from 'lucide-react';
import { useSurprises } from '../context/SurpriseContext';
import { useAudio } from '../context/AudioContext';
import { GOLDEN_GIFT_MESSAGE } from '../data/birthdayMessages';
import { LAYERS } from '../data/surprises';
import { GIFT_SURPRISES, HAPPINESS_MESSAGES } from '../data/wishes';
import { burstConfetti, burstStars, sideCannons, PALETTES } from '../utils/fx';
import { NoRepeatPool } from '../utils/random';
import {
  GlowButton,
  GiftBox,
  ParticleField,
  RevealCard,
  SceneHeader,
  SurpriseDots,
  TypingText,
} from '../components/ui';

const meta = LAYERS[2];
const ACCENT = meta.accent; // warm gold
const ACCENT2 = meta.accent2; // pink-magenta

/** Fixed offsets for the little star burst around the golden gift. */
const GOLDEN_SPARKLES = [
  { x: -78, y: -54 },
  { x: -46, y: -86 },
  { x: 0, y: -100 },
  { x: 46, y: -86 },
  { x: 78, y: -54 },
  { x: -66, y: -10 },
  { x: 66, y: -10 },
  { x: 0, y: -46 },
] as const;

/** A decorative present used to build the "room full of gifts" set dressing. */
function MiniGift({
  color,
  ribbon,
  size = 56,
  className = '',
  rotate = -4,
}: {
  color: string;
  ribbon: string;
  size?: number;
  className?: string;
  rotate?: number;
}) {
  return (
    <div
      className={`pointer-events-none absolute opacity-80 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <div
        className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-md shadow-[0_10px_22px_rgba(0,0,0,0.35)]"
        style={{ height: size * 0.62, background: `linear-gradient(150deg, ${color}, rgba(0,0,0,0.35))` }}
      >
        <span className="absolute left-1/2 top-0 h-full w-[18%] -translate-x-1/2" style={{ background: ribbon }} />
        <span className="absolute left-0 top-0 h-full w-[18%] opacity-80" style={{ background: ribbon }} />
        <span className="absolute right-0 top-0 h-full w-[18%] opacity-80" style={{ background: ribbon }} />
      </div>
      <div
        className="absolute left-1/2 rounded-sm shadow-[0_5px_12px_rgba(0,0,0,0.35)]"
        style={{
          width: size * 0.8,
          height: size * 0.2,
          top: size * 0.26,
          transform: `translateX(-50%) rotate(${rotate}deg)`,
          background: `linear-gradient(135deg, ${ribbon}, ${color})`,
        }}
      >
        <span
          className="absolute left-1/2 top-1/2 h-full w-[18%] -translate-x-1/2 -translate-y-1/2"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

export default function Layer03() {
  const { completeSurprise, isComplete } = useSurprises();
  const { playSfx } = useAudio();

  // One non-repeating pool per repeatable surprise.
  const giftPool = useRef(new NoRepeatPool(GIFT_SURPRISES)).current;
  const joyPool = useRef(new NoRepeatPool(HAPPINESS_MESSAGES)).current;
  const timers = useRef<number[]>([]);

  const [boxOpened, setBoxOpened] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [giftOpenCount, setGiftOpenCount] = useState(0);

  const [joyMessage, setJoyMessage] = useState('');
  const [joyBusy, setJoyBusy] = useState(false);
  const [joyCount, setJoyCount] = useState(0);

  const [goldenOpening, setGoldenOpening] = useState(false);
  const [goldenMessage, setGoldenMessage] = useState('');

  const schedule = (fn: () => void, delay: number) => {
    timers.current.push(window.setTimeout(fn, delay));
  };

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  /* ---------- Surprise 1 — The Infinite Gift Box ---------- */
  const openGiftBox = () => {
    if (boxOpened || giftMessage) return;
    setBoxOpened(true);
    setGiftOpenCount((n) => n + 1);
    playSfx('gift');
    const message = giftPool.next() ?? GIFT_SURPRISES[0];
    schedule(() => {
      setGiftMessage(message);
      completeSurprise('l3-s1');
      burstConfetti({ particleCount: 80, spread: 85, colors: PALETTES.birthday });
    }, 560);
  };

  const closeGiftBox = () => {
    setGiftMessage('');
    setBoxOpened(false);
  };

  /* ---------- Surprise 2 — The Happiness Generator ---------- */
  const generateJoy = () => {
    if (joyBusy) return;
    setJoyBusy(true);
    playSfx('click');
    const message = joyPool.next() ?? HAPPINESS_MESSAGES[0];
    schedule(() => {
      setJoyMessage(message);
      setJoyCount((n) => n + 1);
      setJoyBusy(false);
      completeSurprise('l3-s2');
      playSfx('pop');
      burstConfetti({ particleCount: 26, spread: 65, colors: PALETTES.pastel });
    }, 620);
  };

  /* ---------- Surprise 3 — The Golden Gift ---------- */
  const openGoldenGift = () => {
    if (goldenOpening || goldenMessage) return;
    setGoldenOpening(true);
    playSfx('gift');
    schedule(() => {
      // Dramatic peak: stars, cannons and a chime.
      void burstStars(PALETTES.gold, 80);
      sideCannons(PALETTES.gold, 75);
      playSfx('chime');
    }, 760);
    schedule(() => {
      setGoldenMessage(GOLDEN_GIFT_MESSAGE);
      completeSurprise('l3-s3');
      burstConfetti({ particleCount: 110, spread: 100, colors: PALETTES.gold });
    }, 1120);
  };

  const closeGoldenGift = () => {
    setGoldenMessage('');
    setGoldenOpening(false);
  };

  const foundCount = [
    isComplete('l3-s1'),
    isComplete('l3-s2'),
    isComplete('l3-s3'),
  ].filter(Boolean).length;

  return (
    <div className="layer-scene relative flex min-h-[78vh] w-full flex-col items-center overflow-hidden px-4 pb-20 pt-24 text-center sm:px-6 sm:pt-28">
      {/* ---- The gift room: warm light, sparkles and stacked presents ---- */}
      <ParticleField colors={['#ffffff', ACCENT, ACCENT2, '#c9b6ff']} count={34} variant="sparkles" />
      <div
        className="animate-glow-pulse pointer-events-none absolute left-[4%] top-[16%] h-64 w-64 rounded-full bg-[#ffd166]/20 blur-[90px]"
        aria-hidden="true"
      />
      <div
        className="animate-glow-pulse pointer-events-none absolute bottom-[6%] right-[3%] h-72 w-72 rounded-full bg-[#ff9ecd]/20 blur-[100px]"
        style={{ animationDelay: '-1.3s' }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#2a0f33]/75 to-transparent"
        aria-hidden="true"
      />

      <MiniGift color="#7a4fd6" ribbon="#ffd76a" size={64} className="bottom-5 left-[3%] animate-float" />
      <MiniGift color="#d63f6e" ribbon="#ffe9a8" size={48} className="bottom-24 left-[9%] animate-float-slow" rotate={6} />
      <MiniGift color="#b04fa5" ribbon="#fff0a8" size={70} className="bottom-3 right-[4%] animate-float-slow" rotate={5} />
      <MiniGift color="#5b3bb5" ribbon="#ff9ecd" size={52} className="bottom-28 right-[10%] animate-float" rotate={-8} />
      <MiniGift color="#8e3b8f" ribbon="#ffd76a" size={42} className="left-[5%] top-[24%] hidden animate-bob-rotate sm:block" />
      <MiniGift color="#a63f7a" ribbon="#ffe9a8" size={46} className="right-[6%] top-[32%] hidden animate-bob-rotate lg:block" rotate={8} />

      <SceneHeader
        eyebrow="Layer 03 — The Happiness Box"
        emoji="🎁"
        title="The Happiness Box"
        subtitle="A room overflowing with magical gifts. Open them all — every single one is full of joy."
        accent={ACCENT}
      />
      <SurpriseDots layer={3} className="relative z-10 mb-9" />

      {/* ---- Three gift stations ---- */}
      <div className="relative z-10 grid w-full max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
        {/* Surprise 1 — Infinite Gift Box */}
        <div className="surprise-card glass flex flex-col items-center rounded-3xl border border-white/15 bg-white/[0.07] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.3)] backdrop-blur-md sm:p-6">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 shadow-[inset_0_0_20px_rgba(255,209,102,0.2)]">
            <Gift className="h-6 w-6" style={{ color: ACCENT }} />
          </div>
          <h3 className="font-display text-lg font-bold text-white">The Infinite Gift Box</h3>
          <p className="mt-1 min-h-[34px] font-body text-xs leading-snug text-white/60">
            One box. Endless surprises. Open it again and again.
          </p>
          <div className="relative my-2 flex h-[150px] items-center justify-center">
            <span className="animate-glow-pulse pointer-events-none absolute h-32 w-32 rounded-full bg-[#a77bff]/25 blur-2xl" />
            <GiftBox
              variant="purple"
              size={142}
              opened={boxOpened}
              onClick={openGiftBox}
              label="Open the infinite gift box"
            />
          </div>
          <GlowButton size="sm" variant="primary" className="min-h-[44px]" onClick={openGiftBox} disabled={boxOpened || Boolean(giftMessage)}>
            <Sparkles className="h-4 w-4" /> Open the gift
          </GlowButton>
          <p className="mt-3 font-body text-[11px] text-white/45">
            {giftOpenCount > 0 ? `Opened ${giftOpenCount} ${giftOpenCount === 1 ? 'time' : 'times'} — keep going!` : 'Tap the box or the button'}
          </p>
        </div>

        {/* Surprise 2 — Happiness Generator */}
        <div className="surprise-card glass flex flex-col items-center rounded-3xl border border-white/15 bg-white/[0.07] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.3)] backdrop-blur-md sm:p-6">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 shadow-[inset_0_0_20px_rgba(255,158,205,0.25)]">
            <Zap className="h-6 w-6" style={{ color: ACCENT2 }} />
          </div>
          <h3 className="font-display text-lg font-bold text-white">The Happiness Generator</h3>
          <p className="mt-1 min-h-[34px] font-body text-xs leading-snug text-white/60">
            Press the button. Let the good vibes roll out.
          </p>

          {/* Mechanical output screen */}
          <div className="relative my-2 w-full max-w-[290px] rounded-2xl border border-[#ffd166]/25 bg-[#150d2e]/85 p-3 text-left shadow-[inset_0_0_30px_rgba(120,80,220,0.25)]">
            <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-1.5">
              <span className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                Joy-O-Matic 3000
              </span>
              <span className="flex items-center gap-1">
                <span className={`h-1.5 w-1.5 rounded-full ${joyBusy ? 'animate-pulse bg-[#ff9ecd]' : 'bg-[#7bed9f]'}`} />
                <span className="font-body text-[9px] uppercase tracking-wider text-white/40">
                  {joyBusy ? 'Brewing' : 'Online'}
                </span>
              </span>
            </div>
            <div className="flex min-h-[74px] items-center justify-center px-1 text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={joyBusy ? 'busy' : `joy-${joyCount}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="font-body text-sm leading-snug text-white/90"
                >
                  {joyBusy ? (
                    <span className="flex items-center gap-2" style={{ color: ACCENT }}>
                      <span className="inline-block animate-spin-slow text-lg">⚙️</span>
                      <span className="animate-pulse">Generating happiness</span>
                      <span className="animate-pulse">...</span>
                    </span>
                  ) : joyMessage ? (
                    <TypingText text={joyMessage} speed={24} start={!joyBusy} key={`type-${joyCount}`} />
                  ) : (
                    <span className="text-white/40">Press GENERATE to brew some happiness…</span>
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
                  animate={joyBusy ? { opacity: [0.2, 1, 0.2], scale: [1, 1.6, 1] } : { opacity: 0.45, scale: 1 }}
                  transition={{ duration: 0.7, repeat: joyBusy ? Infinity : 0, delay: i * 0.1 }}
                />
              ))}
            </div>
          </div>

          <GlowButton size="sm" variant="rainbow" className="min-h-[44px]" onClick={generateJoy} disabled={joyBusy}>
            <Zap className="h-4 w-4" /> {joyBusy ? 'Working…' : 'Generate joy'}
          </GlowButton>
          <p className="mt-3 font-body text-[11px] text-white/45">
            {joyCount > 0 ? `${joyCount} ${joyCount === 1 ? 'dose' : 'doses'} of joy delivered!` : 'Fresh joy every time'}
          </p>
        </div>

        {/* Surprise 3 — The Golden Gift */}
        <div className="surprise-card glass flex flex-col items-center rounded-3xl border border-[#ffd166]/25 bg-white/[0.07] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.3)] backdrop-blur-md sm:p-6">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 shadow-[inset_0_0_24px_rgba(255,215,106,0.3)]">
            <Star className="h-6 w-6" style={{ color: ACCENT }} />
          </div>
          <h3 className="font-display text-lg font-bold text-white">The Golden Gift</h3>
          <p className="mt-1 min-h-[34px] font-body text-xs leading-snug text-white/60">
            A rare, radiant gift with one glorious message inside.
          </p>
          <div className="relative my-2 flex h-[150px] w-full items-center justify-center">
            <motion.div
              className="relative"
              animate={goldenOpening ? { scale: [1, 1.09, 0.98, 1.05, 1] } : { scale: 1 }}
              transition={{ duration: 1.15, ease: 'easeInOut' }}
            >
              <span
                className={`pointer-events-none absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffd76a]/35 blur-2xl ${goldenOpening ? 'animate-glow-pulse' : 'animate-pulse'}`}
                aria-hidden="true"
              />
              <AnimatePresence>
                {goldenOpening &&
                  GOLDEN_SPARKLES.map((s, i) => (
                    <motion.span
                      key={i}
                      className="pointer-events-none absolute left-1/2 top-1/2 text-xl"
                      style={{ color: i % 2 === 0 ? ACCENT : '#fff4cf', textShadow: `0 0 14px ${ACCENT}` }}
                      initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                      animate={{ opacity: 1, scale: 1, x: s.x, y: s.y }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                    >
                      ✦
                    </motion.span>
                  ))}
              </AnimatePresence>
              <GiftBox
                variant="gold"
                size={138}
                opened={goldenOpening}
                onClick={openGoldenGift}
                label="Unwrap the rare golden gift"
              />
            </motion.div>
          </div>
          <GlowButton
            size="sm"
            variant="gold"
            className="min-h-[44px]"
            onClick={openGoldenGift}
            disabled={goldenOpening || Boolean(goldenMessage)}
          >
            <Sparkles className="h-4 w-4" /> Unwrap the gold
          </GlowButton>
          <p className="mt-3 font-body text-[11px] text-white/45">
            {isComplete('l3-s3') ? 'The glow is yours — unwrap it again!' : 'Shh… this one is special.'}
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-9 flex items-center gap-2 font-body text-xs text-white/45">
        <Gift className="h-3.5 w-3.5" />
        <Star className="h-3.5 w-3.5" />
        Found {foundCount} of 3 here
      </div>

      {/* ---- Reveal overlays ---- */}
      <RevealCard
        open={Boolean(giftMessage)}
        onClose={closeGiftBox}
        emoji="🎁"
        title="What was in the box?"
        message={giftMessage}
        accent={ACCENT2}
        closeLabel="Open another!"
      />

      <RevealCard
        open={Boolean(goldenMessage)}
        onClose={closeGoldenGift}
        emoji="🌟"
        title="The Golden Gift"
        message={goldenMessage}
        accent={ACCENT}
        closeLabel="Keep the magic"
      >
        <p className="font-display text-sm font-bold tracking-[0.22em] text-[#ffd76a]">
          <TypingText text="HAPPY BIRTHDAY, MOON!" speed={70} start={Boolean(goldenMessage)} />
        </p>
      </RevealCard>
    </div>
  );
}
