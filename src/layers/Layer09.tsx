import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Cake, Flame, PartyPopper, RotateCcw, Sparkles, Star } from 'lucide-react';
import { useSurprises } from '../context/SurpriseContext';
import { useAudio } from '../context/AudioContext';
import { EASTER_EGG_MESSAGES, GRAND_WISH, PERSON } from '../data/birthdayMessages';
import { LAYERS } from '../data/surprises';
import { burstConfetti, launchFirework, launchFireworks, sideCannons, PALETTES } from '../utils/fx';
import { randomFrom } from '../utils/random';
import {
  GlowButton,
  ParticleField,
  RevealCard,
  SceneHeader,
  SurpriseDots,
  TypingText,
} from '../components/ui';

const meta = LAYERS[8];
const CANDLE_COUNT = 6;
const DRIP_HEIGHTS = [16, 24, 13, 28, 18, 22, 14, 26, 17, 20];
const SPRINKLES = [
  { left: '10%', top: '42%', color: '#ff5b9e', rotate: -24 },
  { left: '22%', top: '58%', color: '#7c5cff', rotate: 32 },
  { left: '34%', top: '36%', color: '#4fc3f7', rotate: 12 },
  { left: '46%', top: '62%', color: '#ff5b9e', rotate: -40 },
  { left: '58%', top: '40%', color: '#7c5cff', rotate: 18 },
  { left: '70%', top: '56%', color: '#4fc3f7', rotate: -14 },
  { left: '82%', top: '38%', color: '#ff5b9e', rotate: 44 },
  { left: '16%', top: '70%', color: '#4fc3f7', rotate: 28 },
  { left: '52%', top: '74%', color: '#7c5cff', rotate: -20 },
  { left: '88%', top: '68%', color: '#ff5b9e', rotate: 36 },
];
const BUNTING = [
  '#ffcf5c', '#ff8ab5', '#b9a2ff', '#8fe3ff', '#ffd76a', '#ff7ba9', '#c9b6ff',
  '#9be7c4', '#ffcf5c', '#ff8ab5', '#b9a2ff', '#8fe3ff', '#ffd76a',
];
const SKY_CHEERS = [
  'The sky is celebrating!',
  'A sky full of fireworks for you!',
  'Moon approved fireworks! ✨',
  'Up, up and away! 🎆',
];
const WISH_PARAGRAPHS = GRAND_WISH.split('\n\n').map((p) => p.trim()).filter(Boolean);
const freshCandles = (): boolean[] => Array.from({ length: CANDLE_COUNT }, () => true);

export default function Layer09() {
  const { completeSurprise, isComplete, findEgg, showToast } = useSurprises();
  const { playSfx } = useAudio();

  // --- Surprise 1: the cake ---
  const [lit, setLit] = useState<boolean[]>(freshCandles);
  const litRef = useRef<boolean[]>(lit);
  const [smoking, setSmoking] = useState<number[]>([]);
  const [cakeReveal, setCakeReveal] = useState(false);
  const cakeTaps = useRef(0);
  const eggFired = useRef(false);

  // --- Surprise 2: the fireworks ---
  const skyRef = useRef<HTMLDivElement | null>(null);
  const [launchCount, setLaunchCount] = useState(0);
  const [cheer, setCheer] = useState<string>(SKY_CHEERS[0]);
  const [burst, setBurst] = useState<{ x: number; y: number; id: number } | null>(null);

  // --- Surprise 3: the wish ---
  const [wishOpen, setWishOpen] = useState(false);

  const timers = useRef<number[]>([]);
  const stopCakeShow = useRef<(() => void) | null>(null);
  const stopSkyShow = useRef<(() => void) | null>(null);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  // Stop every show and timer when the visitor leaves this world.
  useEffect(() => () => {
    timers.current.forEach(window.clearTimeout);
    stopCakeShow.current?.();
    stopSkyShow.current?.();
  }, []);

  const blowOutCandle = (index: number) => {
    if (!litRef.current[index]) return;
    const next = litRef.current.map((value, i) => (i === index ? false : value));
    litRef.current = next;
    setLit(next);
    playSfx('pop');
    setSmoking((prev) => [...prev, index]);
    later(() => setSmoking((prev) => prev.filter((i) => i !== index)), 1100);

    if (next.every((value) => !value)) {
      setCakeReveal(true);
      completeSurprise('l9-s1');
      stopCakeShow.current?.();
      stopCakeShow.current = launchFireworks(5000);
      sideCannons();
    }
  };

  const relightCandles = () => {
    const next = freshCandles();
    litRef.current = next;
    setLit(next);
    setSmoking([]);
    setCakeReveal(false);
    stopCakeShow.current?.();
    stopCakeShow.current = null;
    playSfx('whoosh');
    showToast('🕯️ Candles relit — close your eyes and make another wish!', 'info', 2600);
  };

  const tapCake = () => {
    cakeTaps.current += 1;
    playSfx('click');
    if (cakeTaps.current >= 4 && !eggFired.current) {
      eggFired.current = true;
      findEgg('cake-secret', EASTER_EGG_MESSAGES.cakeRepeat);
    }
  };

  const fireAt = (x?: number, y?: number) => {
    playSfx('fireworks');
    launchFirework(x, y);
    setLaunchCount((count) => count + 1);
    setCheer(randomFrom(SKY_CHEERS) ?? SKY_CHEERS[0]);
    if (x !== undefined && y !== undefined) {
      setBurst({ x, y, id: Date.now() + Math.random() });
    }
    if (!isComplete('l9-s2')) completeSurprise('l9-s2');
  };

  const launchShow = () => {
    fireAt();
    stopSkyShow.current?.();
    stopSkyShow.current = launchFireworks(4000, PALETTES.cosmic);
  };

  const handleSkyClick = (event: MouseEvent<HTMLDivElement>) => {
    const rect = skyRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    fireAt(x, y);
  };

  const handleSkyKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      fireAt(0.5, 0.4);
    }
  };

  const openWish = () => {
    setWishOpen(true);
    completeSurprise('l9-s3');
    playSfx('reveal');
    burstConfetti({ particleCount: 130, spread: 110, colors: PALETTES.gold });
  };

  return (
    <div className="layer-scene relative mx-auto flex w-full max-w-5xl flex-col items-center overflow-hidden px-4 pb-16 pt-14 text-center sm:px-6 sm:pt-16">
      {/* bunting stretched across the grand stage */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-0 flex justify-center gap-1 pt-2 sm:gap-2">
        {BUNTING.map((color, i) => (
          <span
            key={i}
            className="block h-7 w-4 opacity-90 sm:h-9 sm:w-6"
            style={{
              background: color,
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              filter: `drop-shadow(0 4px 8px ${color}55)`,
              transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)`,
            }}
          />
        ))}
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-9 z-0 h-px bg-white/25" />

      {/* stage spotlights */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-10 left-[4%] z-0 h-[420px] w-28 rotate-[18deg] bg-gradient-to-b from-[#ffcf5c]/25 via-[#ffcf5c]/10 to-transparent blur-xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -top-10 right-[4%] z-0 h-[420px] w-28 -rotate-[18deg] bg-gradient-to-b from-[#ff8ab5]/25 via-[#ff8ab5]/10 to-transparent blur-xl" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 right-0 z-0 h-40 bg-gradient-to-t from-[#2a0a2e]/70 to-transparent" />

      <ParticleField count={40} colors={['#ffcf5c', '#ff8ab5', '#fff2cf', '#c9b6ff']} variant="stars" />

      <SceneHeader
        eyebrow="Layer 09 — The Ultimate Celebration"
        emoji="🎂"
        title="Welcome to the Grand Party, Moon!"
        subtitle="A towering cake, a sky on fire and one enormous birthday wish. Light up all three surprises!"
        accent={meta.accent}
      />
      <SurpriseDots layer={9} className="relative z-10 mb-9" />

      {/* ---------- Surprise 1: the giant cake ---------- */}
      <section className="glass-panel surprise-card relative z-10 w-full max-w-3xl rounded-[28px] border border-white/15 bg-white/[0.06] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-7">
        <div className="mb-3 flex items-center justify-center gap-2">
          <Cake className="h-5 w-5 text-[#ffcf5c]" />
          <h3 className="font-display text-lg font-bold text-white sm:text-xl">1 · The Giant Birthday Cake</h3>
        </div>
        <p className="font-body text-xs text-white/60 sm:text-sm">Tap each flame to blow out all six candles.</p>

        <div className="relative mx-auto mt-6 w-[280px] max-w-full sm:w-[360px]">
          <div
            aria-hidden="true"
            className="animate-glow-pulse pointer-events-none absolute left-1/2 top-1/3 h-52 w-64 -translate-x-1/2 rounded-full blur-3xl sm:h-64 sm:w-80"
            style={{ background: `${meta.accent2}66` }}
          />
          <div aria-hidden="true" className="absolute -bottom-4 left-1/2 h-7 w-[112%] -translate-x-1/2 rounded-[50%] bg-gradient-to-b from-white via-[#ffe9a8] to-[#b98a32] shadow-[0_16px_40px_rgba(0,0,0,0.55),0_0_30px_rgba(255,207,92,0.35)]" />

          {/* cake body — the hidden egg lives in the cake itself */}
          <div onClick={tapCake} className="relative cursor-pointer select-none">
            {/* bottom tier */}
            <div className="relative mx-auto w-full" style={{ height: 100 }}>
              <div aria-hidden="true" className="absolute -top-3 left-0 z-10 h-7 w-full rounded-[50%] bg-gradient-to-b from-[#fffafc] to-[#ffd9ec] shadow-[0_5px_14px_rgba(0,0,0,0.25)]" />
              <div
                className="absolute inset-0 overflow-hidden rounded-b-[26px] rounded-t-[40px] shadow-[inset_-18px_-10px_28px_rgba(90,10,60,0.45),inset_16px_10px_24px_rgba(255,255,255,0.28),0_18px_35px_rgba(0,0,0,0.45)]"
                style={{ background: 'linear-gradient(180deg,#ffd0e6 0%,#ff7db3 38%,#b62f6d 100%)' }}
              >
                {DRIP_HEIGHTS.map((height, i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className="absolute top-0 rounded-b-full bg-[#fff4fb] shadow-[0_3px_6px_rgba(0,0,0,0.14)]"
                    style={{ left: `${i * 10}%`, width: '10%', height }}
                  />
                ))}
                <span aria-hidden="true" className="absolute bottom-1 left-0 h-2 w-full" style={{ background: 'linear-gradient(90deg,#b8862f,#ffe9a8,#b8862f)' }} />
              </div>
            </div>

            {/* top tier with candles */}
            <div className="relative mx-auto mt-[-6px] w-[94%]" style={{ height: 86 }}>
              <div aria-hidden="true" className="absolute -top-3 left-0 z-10 h-7 w-full rounded-[50%] bg-gradient-to-b from-[#fffdf4] to-[#ffe9a8] shadow-[0_5px_14px_rgba(0,0,0,0.25)]" />
              <div
                className="absolute inset-0 overflow-hidden rounded-b-[22px] rounded-t-[40px] shadow-[inset_-14px_-8px_22px_rgba(120,60,10,0.4),inset_12px_8px_20px_rgba(255,255,255,0.35),0_14px_28px_rgba(0,0,0,0.4)]"
                style={{ background: 'linear-gradient(180deg,#fff0c2 0%,#ffcf5c 42%,#e8893b 100%)' }}
              >
                {DRIP_HEIGHTS.slice(0, 8).map((height, i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className="absolute top-0 rounded-b-full bg-[#fffaf0] shadow-[0_3px_6px_rgba(0,0,0,0.12)]"
                    style={{ left: `${i * 12.5}%`, width: '12.5%', height: height * 0.7 }}
                  />
                ))}
                {SPRINKLES.map((s, i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className="absolute h-1 w-1.5 rounded-full"
                    style={{ left: s.left, top: s.top, background: s.color, transform: `rotate(${s.rotate}deg)` }}
                  />
                ))}
                <span aria-hidden="true" className="absolute bottom-1 left-0 h-1.5 w-full" style={{ background: 'linear-gradient(90deg,#b8862f,#fff4cf,#b8862f)' }} />
              </div>

              {/* six individually clickable candles */}
              <div className="absolute -top-14 left-1/2 z-30 flex h-14 -translate-x-1/2 items-end">
                {lit.map((isLit, i) => (
                  <motion.button
                    key={i}
                    type="button"
                    disabled={!isLit}
                    onClick={(event) => { event.stopPropagation(); blowOutCandle(i); }}
                    aria-label={isLit ? `Blow out candle ${i + 1}` : `Candle ${i + 1} is blown out`}
                    className="relative flex h-14 w-11 items-end justify-center focus:outline-none disabled:cursor-default"
                  >
                    <span
                      aria-hidden="true"
                      className="relative z-10 block h-9 w-3 rounded-[3px] shadow-[inset_-3px_0_4px_rgba(0,0,0,0.25),0_2px_6px_rgba(0,0,0,0.35)]"
                      style={{ background: 'repeating-linear-gradient(45deg,#fff6df 0 5px,#ff8ab5 5px 10px)' }}
                    />
                    <span aria-hidden="true" className="absolute bottom-9 left-1/2 z-10 h-1.5 w-px -translate-x-1/2 bg-[#4a2b2b]" />
                    <span aria-hidden="true" className="pointer-events-none absolute bottom-[38px] left-1/2 z-20">
                      <motion.span
                        className="block"
                        initial={false}
                        animate={{ scale: isLit ? 1 : 0, opacity: isLit ? 1 : 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                      >
                        <span
                          className="animate-flame block h-5 w-3.5 bg-gradient-to-b from-[#fffbd6] via-[#ffcf5c] to-[#ff7a3d] shadow-[0_0_16px_5px_rgba(255,190,70,0.7)]"
                          style={{ borderRadius: '50% 50% 50% 50% / 65% 65% 35% 35%' }}
                        />
                      </motion.span>
                    </span>
                    <AnimatePresence>
                      {smoking.includes(i) && (
                        <span aria-hidden="true" className="pointer-events-none absolute bottom-[40px] left-1/2 z-20 -translate-x-1/2">
                          <motion.span
                            className="block h-3 w-3 rounded-full bg-white/70 blur-[3px]"
                            initial={{ opacity: 0, y: 0, scale: 0.6 }}
                            animate={{ opacity: [0, 0.75, 0], y: -22, scale: [0.6, 1.2, 1.9] }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.05, ease: 'easeOut' }}
                          />
                        </span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {cakeReveal && (
            <motion.div
              className="relative z-10 mt-6 flex flex-col items-center gap-1"
              initial={{ opacity: 0, y: 14, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <span className="text-glow-gold font-display text-2xl font-bold text-[#ffcf5c] sm:text-3xl">WISH GRANTED! 🎂</span>
              <span className="font-body text-xs text-white/80 sm:text-sm">All six candles are out. Happy birthday, {PERSON.name}!</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-10 mt-6 flex flex-wrap items-center justify-center gap-3">
          <GlowButton size="sm" variant="ghost" className="min-h-[44px]" onClick={relightCandles}>
            <RotateCcw className="h-4 w-4" /> Relight the candles
          </GlowButton>
          <span className="font-body text-[11px] text-white/45">{lit.filter(Boolean).length} of {CANDLE_COUNT} candles burning</span>
        </div>
      </section>

      {/* ---------- Surprise 2: the fireworks ---------- */}
      <section className="glass-panel surprise-card relative z-10 mt-6 w-full max-w-3xl rounded-[28px] border border-white/15 bg-white/[0.06] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-7">
        <div className="mb-3 flex items-center justify-center gap-2">
          <PartyPopper className="h-5 w-5 text-[#ff8ab5]" />
          <h3 className="font-display text-lg font-bold text-white sm:text-xl">2 · Birthday Fireworks</h3>
        </div>
        <p className="font-body text-xs text-white/60 sm:text-sm">Tap anywhere in the sky to send up your own firework.</p>

        <div
          ref={skyRef}
          role="button"
          tabIndex={0}
          aria-label="Fireworks sky — tap to launch a firework"
          onClick={handleSkyClick}
          onKeyDown={handleSkyKey}
          className="relative mt-4 h-64 w-full cursor-crosshair overflow-hidden rounded-[24px] border border-white/20 shadow-[inset_0_0_80px_rgba(0,0,0,0.6)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#ffcf5c]/60 sm:h-80"
          style={{
            background:
              'radial-gradient(ellipse at 50% 115%, rgba(255,138,181,0.35), rgba(22,10,46,0.96) 62%), linear-gradient(180deg,#160a2e,#3a1450)',
          }}
        >
          <ParticleField count={22} colors={['#fff2cf', '#ffcf5c', '#ff8ab5']} variant="stars" />
          <div aria-hidden="true" className="pointer-events-none absolute -top-10 left-10 h-[130%] w-24 rotate-[18deg] bg-gradient-to-b from-[#ffcf5c]/25 to-transparent blur-md" />
          <div aria-hidden="true" className="pointer-events-none absolute -top-10 right-10 h-[130%] w-24 -rotate-[18deg] bg-gradient-to-b from-[#ff8ab5]/25 to-transparent blur-md" />

          <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center px-3">
            <AnimatePresence>
              {launchCount > 0 && (
                <motion.span
                  key="cheer"
                  className="rounded-full border border-white/20 bg-black/30 px-4 py-1.5 font-display text-xs font-semibold text-[#ffe9a8] backdrop-blur-sm sm:text-sm"
                  initial={{ opacity: 0, y: -12, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  ✨ {cheer} · {launchCount} burst{launchCount === 1 ? '' : 's'}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {burst && (
              <div className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2" style={{ left: `${burst.x * 100}%`, top: `${burst.y * 100}%` }}>
                <motion.span
                  key={burst.id}
                  className="block h-20 w-20 rounded-full border-2 border-[#ffcf5c]"
                  initial={{ opacity: 0.9, scale: 0.2 }}
                  animate={{ opacity: 0, scale: 1.7 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                />
              </div>
            )}
          </AnimatePresence>

          <span className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap font-body text-[11px] text-white/50">✦ tap the sky ✦</span>
        </div>

        <div className="relative z-10 mt-5 flex justify-center">
          <GlowButton size="lg" variant={isComplete('l9-s2') ? 'gold' : 'primary'} onClick={launchShow}>
            <Sparkles className="h-5 w-5" /> {isComplete('l9-s2') ? 'More fireworks!' : 'Launch the fireworks'}
          </GlowButton>
        </div>
      </section>

      {/* ---------- Surprise 3: the grand wish ---------- */}
      <section className="glass-panel surprise-card relative z-10 mt-6 w-full max-w-3xl overflow-hidden rounded-[28px] border border-[#ffcf5c]/25 bg-gradient-to-br from-[#4a1d63]/50 via-[#2a0f3c]/60 to-[#160a2e]/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.4),inset_0_0_60px_rgba(255,207,92,0.12)] backdrop-blur-md sm:p-9">
        <div aria-hidden="true" className="animate-glow-pulse pointer-events-none absolute left-1/2 top-1/2 h-40 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffcf5c]/20 blur-3xl" />
        <div className="relative z-10 flex items-center justify-center gap-2">
          <Star className="h-5 w-5 text-[#ffcf5c]" />
          <h3 className="font-display text-lg font-bold text-white sm:text-xl">3 · The Grand Birthday Wish</h3>
        </div>
        <p className="relative z-10 mt-2 font-body text-sm text-[#ffe9a8]/85">
          <TypingText text="One enormous wish, written just for you, Moon..." speed={45} showCursor={false} />
        </p>
        <div className="relative z-10 mt-6">
          <GlowButton size="xl" variant="gold" onClick={openWish}>
            <Sparkles className="h-5 w-5" /> {isComplete('l9-s3') ? 'Read your wish again' : 'Open the Grand Wish'}
          </GlowButton>
        </div>
        <div className="relative z-10 mt-5 flex justify-center gap-3 text-lg text-[#ffcf5c]/70">
          <span aria-hidden="true">✦</span><span aria-hidden="true">🎂</span><span aria-hidden="true">✦</span>
        </div>
      </section>

      <div className="relative z-10 mt-9 flex items-center gap-2 font-body text-xs text-white/50">
        <Flame className="h-3.5 w-3.5 text-[#ffcf5c]" />
        <Star className="h-3.5 w-3.5 text-[#ff8ab5]" />
        Found {[isComplete('l9-s1'), isComplete('l9-s2'), isComplete('l9-s3')].filter(Boolean).length} of 3 here
      </div>

      <RevealCard
        open={wishOpen}
        onClose={() => setWishOpen(false)}
        emoji="🎂"
        title="Your Grand Birthday Wish"
        message=""
        accent={meta.accent}
      >
        <div className="relative mx-auto max-w-lg text-left">
          <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffcf5c]/15 blur-3xl" />
          <p className="relative mb-4 text-center font-display text-xs uppercase tracking-[0.25em] text-[#ff8ab5]">
            <TypingText text="✦ a wish made just for you ✦" speed={38} start={wishOpen} showCursor={false} />
          </p>
          {WISH_PARAGRAPHS.map((paragraph, i) => (
            <motion.p
              key={i}
              className={
                i === WISH_PARAGRAPHS.length - 1
                  ? 'relative mt-6 text-center font-display text-xl font-bold text-[#ffcf5c] sm:text-2xl'
                  : 'relative font-body text-base leading-relaxed text-white/90 sm:text-lg'
              }
              initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.3 + i * 0.45, duration: 0.6, ease: 'easeOut' }}
            >
              {paragraph}
            </motion.p>
          ))}
        </div>
      </RevealCard>
    </div>
  );
}
