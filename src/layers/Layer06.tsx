import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Droplets, Flower2, Sparkles, Sun } from 'lucide-react';
import { useSurprises } from '../context/SurpriseContext';
import { useAudio } from '../context/AudioContext';
import { BUTTERFLY_WISHES, FLOWER_MESSAGES, FOUNTAIN_MESSAGE } from '../data/wishes';
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

interface Flower {
  id: number;
  emoji: string;
  name: string;
  color: string;
}

interface FlowerSpeech {
  seq: number;
  name: string;
  emoji: string;
  message: string;
  color: string;
}

interface Butterfly {
  id: number;
  left: string;
  top: string;
  color: string;
  duration: number;
  delay: number;
  x: number[];
  y: number[];
}

/** Eight distinct blossoms — each one has its own voice in the garden. */
const FLOWERS: Flower[] = [
  { id: 0, emoji: '🌸', name: 'Cherry Blossom', color: '#ffafd0' },
  { id: 1, emoji: '🌷', name: 'Tulip', color: '#ffc0d4' },
  { id: 2, emoji: '🌻', name: 'Sunflower', color: '#ffd76a' },
  { id: 3, emoji: '🌼', name: 'Daisy', color: '#fff3b8' },
  { id: 4, emoji: '🌺', name: 'Hibiscus', color: '#ff9c86' },
  { id: 5, emoji: '🌹', name: 'Rose', color: '#ff86a6' },
  { id: 6, emoji: '🪷', name: 'Lotus', color: '#c9b6ff' },
  { id: 7, emoji: '🏵️', name: 'Marigold', color: '#ffb054' },
];

/** Seven looping flight paths across the meadow. */
const BUTTERFLIES: Butterfly[] = [
  { id: 0, left: '6%', top: '12%', color: '#ffafd0', duration: 9.5, delay: 0, x: [0, 24, -6, 0], y: [0, 18, 30, 0] },
  { id: 1, left: '24%', top: '48%', color: '#a8f0d0', duration: 11, delay: 0.9, x: [0, -20, 18, 0], y: [0, -24, 12, 0] },
  { id: 2, left: '40%', top: '8%', color: '#ffd76a', duration: 10.2, delay: 1.7, x: [0, 30, -12, 0], y: [0, 26, 8, 0] },
  { id: 3, left: '55%', top: '55%', color: '#c9b6ff', duration: 12, delay: 0.4, x: [0, -26, 14, 0], y: [0, -18, -30, 0] },
  { id: 4, left: '70%', top: '18%', color: '#8fd3ff', duration: 8.8, delay: 2.3, x: [0, -22, 20, 0], y: [0, 22, -6, 0] },
  { id: 5, left: '84%', top: '46%', color: '#ffb3c6', duration: 10.8, delay: 1.2, x: [0, -28, 8, 0], y: [0, -20, 16, 0] },
  { id: 6, left: '46%', top: '72%', color: '#c9f2a2', duration: 11.6, delay: 2.8, x: [0, 22, -16, 0], y: [0, -26, -12, 0] },
];

const RAINBOW_COLORS = ['#ff6b8a', '#ffab5e', '#ffe07a', '#8fe08a', '#7cc7ff', '#9b8cff', '#e79bff'];

interface GardenSectionProps {
  icon: ReactNode;
  number: number;
  title: string;
  hint: string;
  children: ReactNode;
}

function GardenSection({ icon, number, title, hint, children }: GardenSectionProps) {
  return (
    <section className="surprise-card glass-panel relative z-10 w-full max-w-3xl rounded-[28px] border border-white/20 bg-white/[0.08] px-4 py-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:px-7 sm:py-6">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#ffe0ec]">
          {icon}
        </span>
        <div>
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-[#a8f0d0]/80">
            Surprise {number} of 3
          </p>
          <h3 className="font-display text-lg font-bold leading-tight text-white sm:text-xl">{title}</h3>
        </div>
      </div>
      <p className="mb-4 font-body text-xs text-white/60 sm:text-sm">{hint}</p>
      {children}
    </section>
  );
}

export default function Layer06() {
  const { completeSurprise, isComplete } = useSurprises();
  const { playSfx } = useAudio();

  const flowerPool = useRef(new NoRepeatPool(FLOWER_MESSAGES)).current;
  const butterflyPool = useRef(new NoRepeatPool(BUTTERFLY_WISHES)).current;
  const speechTimer = useRef<number | null>(null);
  const speechSeq = useRef(0);

  const [flowerSpeech, setFlowerSpeech] = useState<FlowerSpeech | null>(null);
  const [butterflyWish, setButterflyWish] = useState<string | null>(null);
  const [fountainOpen, setFountainOpen] = useState(false);

  const clearSpeechTimer = () => {
    if (speechTimer.current !== null) window.clearTimeout(speechTimer.current);
    speechTimer.current = null;
  };

  useEffect(() => () => clearSpeechTimer(), []);

  // Surprise 1 — the talking flower bed (repeatable).
  const talkToFlower = (flower: Flower) => {
    clearSpeechTimer();
    const message = flowerPool.next() ?? FLOWER_MESSAGES[0];
    speechSeq.current += 1;
    setFlowerSpeech({
      seq: speechSeq.current,
      name: flower.name,
      emoji: flower.emoji,
      message,
      color: flower.color,
    });
    speechTimer.current = window.setTimeout(() => setFlowerSpeech(null), 9000);
    completeSurprise('l6-s1');
    playSfx('pop');
    burstConfetti({
      colors: PALETTES.pastel,
      particleCount: 14,
      spread: 55,
      scalar: 0.7,
      origin: { y: 0.72 },
    });
  };

  // Surprise 2 — catch a butterfly to unwrap a wish (butterflies keep flying).
  const catchButterfly = () => {
    const wish = butterflyPool.next() ?? BUTTERFLY_WISHES[0];
    setButterflyWish(wish);
    completeSurprise('l6-s2');
    playSfx('chime');
    void burstStars(PALETTES.pastel, 36);
  };

  // Surprise 3 — the rainbow fountain sprays colour and a message.
  const sprayFountain = () => {
    completeSurprise('l6-s3');
    playSfx('gift');
    burstConfetti({
      colors: PALETTES.rainbow,
      particleCount: 95,
      spread: 100,
      scalar: 0.95,
      origin: { y: 0.6 },
    });
    void burstStars(PALETTES.pastel, 44);
    setFountainOpen(true);
  };

  const found = [isComplete('l6-s1'), isComplete('l6-s2'), isComplete('l6-s3')].filter(Boolean).length;

  return (
    <div className="layer-scene relative flex min-h-[100svh] w-full flex-col items-center overflow-hidden px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-28">
      {/* Falling petals + a patch of warm afternoon sunlight. */}
      <ParticleField
        variant="petals"
        count={22}
        colors={['#ffafd0', '#ffe0ec', '#a8f0d0', '#fff3b8']}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-[6%] h-72 w-72 rounded-full bg-[#ffe9a8]/25 blur-[90px] sm:h-96 sm:w-96"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 left-[4%] h-64 w-64 rounded-full bg-[#a8f0d0]/15 blur-[90px]"
      />

      <SceneHeader
        eyebrow="Layer 06 — The Interactive Wonder Garden"
        emoji="🌸"
        title="The Wonder Garden"
        subtitle="A garden that blooms when you tap it. Listen to the flowers, chase a butterfly and make a wish at the fountain."
        accent="#ffd0e4"
      />
      <SurpriseDots layer={6} className="relative z-10 mb-9" />

      <div className="relative z-10 flex w-full flex-col items-center gap-6">
        {/* ---------- Surprise 1: Talking Flowers ---------- */}
        <GardenSection
          icon={<Flower2 className="h-6 w-6" />}
          number={1}
          title="The Talking Flowers"
          hint="Tap any blossom in the bed. Every flower has something kind to say — and a new message each time."
        >
          <div className="grid grid-cols-4 gap-x-2 gap-y-3 rounded-3xl border border-white/10 bg-gradient-to-b from-[#0d2b3a]/40 to-[#1e6b63]/35 px-2 py-5 sm:grid-cols-8 sm:gap-x-3 sm:px-4">
            {FLOWERS.map((flower) => (
              <motion.button
                key={flower.id}
                type="button"
                onClick={() => talkToFlower(flower)}
                aria-label={`Talk to the ${flower.name}`}
                className="relative mx-auto flex h-16 w-14 flex-col items-center justify-end rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:h-20 sm:w-16"
                animate={{ y: [0, -6, 0], rotate: [-3, 3, -3] }}
                transition={{
                  duration: 3.2 + flower.id * 0.24,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: flower.id * 0.18,
                }}
                whileHover={{ scale: 1.14 }}
                whileTap={{ scale: 0.9 }}
              >
                {/* stem + a little leaf */}
                <span className="pointer-events-none absolute bottom-0 left-1/2 h-7 w-1 -translate-x-1/2 rounded-full bg-gradient-to-t from-[#1f7a5a] to-[#7bd99a]" />
                <span className="pointer-events-none absolute bottom-2 left-1/2 h-2.5 w-5 -translate-x-[85%] -rotate-[28deg] rounded-[100%_0_100%_0] bg-[#7bd99a]/80" />
                <span
                  className="relative z-10 text-3xl leading-none sm:text-4xl"
                  style={{ filter: `drop-shadow(0 0 8px ${flower.color}aa)` }}
                >
                  {flower.emoji}
                </span>
              </motion.button>
            ))}
          </div>

          <div className="mt-4 flex min-h-[88px] items-start justify-center">
            <AnimatePresence mode="wait">
              {flowerSpeech ? (
                <motion.div
                  key={flowerSpeech.seq}
                  initial={{ opacity: 0, y: 12, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="relative w-full max-w-md rounded-2xl border border-white/25 bg-[#123f3a]/85 px-4 py-3 text-center shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-md"
                >
                  <span className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l border-t border-white/25 bg-[#123f3a]" />
                  <p className="font-display text-xs font-bold" style={{ color: flowerSpeech.color }}>
                    {flowerSpeech.emoji} {flowerSpeech.name} whispers…
                  </p>
                  <p className="mt-1 font-body text-sm leading-relaxed text-white/90">
                    <TypingText key={flowerSpeech.seq} text={flowerSpeech.message} speed={28} />
                  </p>
                </motion.div>
              ) : (
                <motion.p
                  key="flower-prompt"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="self-center font-body text-sm text-[#d8f7e6]/70"
                >
                  🌿 Tap a flower and listen closely…
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </GardenSection>

        {/* ---------- Surprise 2: Butterfly Wishes ---------- */}
        <GardenSection
          icon={<Sparkles className="h-6 w-6" />}
          number={2}
          title="Butterfly Wishes"
          hint="Seven butterflies are drifting through the meadow. Catch one to reveal a wish — they'll keep fluttering."
        >
          <div className="relative h-[250px] w-full overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(13,43,58,0.45),rgba(123,189,140,0.2))] sm:h-[280px]">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#1e6b63]/50 to-transparent" />

            {BUTTERFLIES.map((butterfly) => (
              <motion.button
                key={butterfly.id}
                type="button"
                onClick={catchButterfly}
                aria-label="Catch a butterfly for a wish"
                className="absolute flex h-14 w-14 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                style={{ left: butterfly.left, top: butterfly.top }}
                animate={{
                  x: butterfly.x,
                  y: butterfly.y,
                  rotate: [-10, 10, -10],
                }}
                transition={{
                  duration: butterfly.duration,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: butterfly.delay,
                }}
                whileHover={{ scale: 1.18 }}
                whileTap={{ scale: 0.86 }}
              >
                <span className="relative flex h-full w-full items-center justify-center">
                  <span
                    className="absolute h-8 w-8 rounded-full opacity-45 blur-md"
                    style={{ background: butterfly.color }}
                  />
                  <span
                    className="relative text-[28px] leading-none"
                    style={{ filter: `drop-shadow(0 0 6px ${butterfly.color})` }}
                  >
                    🦋
                  </span>
                </span>
              </motion.button>
            ))}

            <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap font-body text-[11px] text-white/50">
              tap a fluttering wing to unwrap a wish ✨
            </span>
          </div>
        </GardenSection>

        {/* ---------- Surprise 3: The Rainbow Fountain ---------- */}
        <GardenSection
          icon={<Droplets className="h-6 w-6" />}
          number={3}
          title="The Rainbow Fountain"
          hint="The old fountain in the centre of the garden grants one cheerful wish. Touch the water to set it sparkling."
        >
          <motion.button
            type="button"
            onClick={sprayFountain}
            aria-label="Make a wish at the rainbow fountain"
            className="relative flex h-[230px] w-full max-w-md items-end justify-center rounded-[24px] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:h-[250px]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* magical rainbow arc */}
            <svg
              viewBox="0 0 240 140"
              className="absolute inset-x-0 top-2 mx-auto h-[150px] w-[240px] max-w-full"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="wonder-garden-rainbow" x1="0" y1="0" x2="1" y2="0">
                  {RAINBOW_COLORS.map((color, i) => (
                    <stop key={color} offset={`${(i / (RAINBOW_COLORS.length - 1)) * 100}%`} stopColor={color} />
                  ))}
                </linearGradient>
              </defs>
              <motion.path
                d="M14 132 A106 106 0 0 1 226 132"
                fill="none"
                stroke="url(#wonder-garden-rainbow)"
                strokeWidth="11"
                strokeLinecap="round"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
              />
            </svg>

            {/* three dancing water jets */}
            {[-24, 0, 24].map((angle, i) => (
              <motion.span
                key={angle}
                className="absolute bottom-[42px] h-24 w-2.5 rounded-full"
                style={{
                  left: i === 0 ? '44%' : i === 1 ? '50%' : '56%',
                  background: 'linear-gradient(to top, rgba(168,240,208,0.2), #bff3ff 55%, rgba(255,255,255,0.9))',
                  transformOrigin: 'bottom center',
                  rotate: angle,
                }}
                animate={{ scaleY: [0.82, 1.08, 0.82], opacity: [0.65, 1, 0.65] }}
                transition={{
                  duration: 1.8 + i * 0.3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.2,
                }}
              />
            ))}

            {/* shimmering basin */}
            <div className="pointer-events-none absolute bottom-4 left-1/2 h-10 w-52 -translate-x-1/2 rounded-[50%] border border-white/40 bg-[radial-gradient(ellipse_at_50%_20%,#c8f6ff_0%,#4bb7c9_45%,#1e6b63_100%)] shadow-[0_10px_30px_rgba(0,0,0,0.35),inset_0_4px_14px_rgba(255,255,255,0.4)] sm:w-64" />
            <span className="pointer-events-none absolute bottom-8 left-1/2 h-2 w-24 -translate-x-1/2 rounded-full bg-white/50 blur-md" />
          </motion.button>

          <div className="mt-3 flex justify-center">
            <GlowButton size="sm" variant="gold" onClick={sprayFountain} className="min-h-[44px]">
              <Sun className="h-4 w-4" /> Make a wish
            </GlowButton>
          </div>
        </GardenSection>
      </div>

      <div className="relative z-10 mt-8 flex items-center gap-2 font-body text-xs text-white/50">
        <Flower2 className="h-3.5 w-3.5" />
        <Sparkles className="h-3.5 w-3.5" />
        Found {found} of 3 growing here
      </div>

      <RevealCard
        open={butterflyWish !== null}
        onClose={() => setButterflyWish(null)}
        emoji="🦋"
        title="A wish from a butterfly"
        message={butterflyWish ?? ''}
        accent="#a8f0d0"
      />

      <RevealCard
        open={fountainOpen}
        onClose={() => setFountainOpen(false)}
        emoji="🌈"
        title="The Fountain's Wish"
        message={FOUNTAIN_MESSAGE}
        accent="#ffafd0"
      />
    </div>
  );
}
