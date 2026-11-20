import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Headphones, Sparkles } from 'lucide-react';
import { StarField } from './StarField';
import { FloatingEmojis } from './FloatingEmojis';
import { MagicButton } from './MagicButton';
import { MusicController } from './MusicController';
import { useExperience } from '../context/ExperienceContext';
import { useSurprises } from '../context/SurpriseContext';
import { useAudio } from '../context/AudioContext';
import { EASTER_EGG_MESSAGES, INTRO, PERSON } from '../data/birthdayMessages';
import { burstConfetti, sideCannons } from '../utils/fx';

const WORLDS = ['🌙', '🎠', '🎁', '⭐', '🎪', '🌸', '😂', '☁️', '🎂', '🌌'];

const CRATERS = [
  { top: '22%', left: '26%', size: '18%' },
  { top: '52%', left: '62%', size: '24%' },
  { top: '68%', left: '28%', size: '13%' },
  { top: '36%', left: '72%', size: '10%' },
  { top: '12%', left: '58%', size: '8%' },
];

export function BirthdayIntro() {
  const { enter } = useExperience();
  const { playSfx, enabled } = useAudio();
  const reduced = useReducedMotion();
  const [launching, setLaunching] = useState(false);
  const timer = useRef<number | null>(null);
  const moonTaps = useRef(0);
  const { findEgg } = useSurprises();

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const openUniverse = () => {
    if (launching) return;
    setLaunching(true);
    playSfx('reveal');
    sideCannons();
    burstConfetti({ particleCount: 130, spread: 110, origin: { y: 0.62 } });
    timer.current = window.setTimeout(() => {
      enter();
      burstConfetti({ particleCount: 90, spread: 120, origin: { y: 0.4 } });
    }, 900);
  };

  return (
    <div className="relative min-h-[100svh] w-full overflow-hidden bg-[radial-gradient(ellipse_at_50%_-10%,#3b2a6b_0%,#191236_42%,#08061a_100%)] text-white">
      <StarField density={150} shootingStars />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-stars opacity-40" />

      {/* dreamy aurora clouds */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-violet-500/25 blur-[110px] animate-aurora"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-1/3 h-[380px] w-[380px] rounded-full bg-sky-400/20 blur-[110px] animate-drift-slow"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 h-[340px] w-[540px] -translate-x-1/2 rounded-full bg-pink-400/15 blur-[120px]"
      />

      <FloatingEmojis
        items={['✨', '🎈', '⭐', '🎁', '🌙', '🎂', '💫', '🎉']}
        count={12}
        duration={30}
        opacity={0.32}
      />

      <div className="pointer-events-none absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <div className="pointer-events-auto flex items-center gap-2">
          <MusicController className="h-10 rounded-full" />
        </div>
      </div>

      <main className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-4xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        {/* Moon */}
        <motion.button
          type="button"
          onClick={() => {
            playSfx('chime');
            burstConfetti({ particleCount: 40, spread: 90, origin: { x: 0.5, y: 0.32 } });
            moonTaps.current += 1;
            if (moonTaps.current === 7) {
              findEgg('moon-7', EASTER_EGG_MESSAGES.moonSeven);
            }
          }}
          aria-label="Give the moon a tap"
          className="group relative mb-2 h-32 w-32 shrink-0 rounded-full sm:h-40 sm:w-40"
          initial={reduced ? false : { scale: 0.6, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.15 }}
          whileHover={reduced ? undefined : { scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
        >
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full"
            animate={reduced ? undefined : { y: [0, -10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="absolute -inset-6 rounded-full bg-[radial-gradient(circle,rgba(255,236,190,0.38),transparent_66%)] blur-2xl" />
            <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_33%_28%,#fffaf0_0%,#f7e8bd_38%,#d8c2f4_78%,#b8a0e6_100%)] shadow-[0_0_70px_18px_rgba(255,225,160,0.30)]" />
            {CRATERS.map((crater, i) => (
              <span
                key={i}
                className="absolute rounded-full bg-[#c5aee7]/45 shadow-[inset_1px_1px_3px_rgba(120,90,170,0.35)]"
                style={{
                  top: crater.top,
                  left: crater.left,
                  width: crater.size,
                  height: crater.size,
                }}
              />
            ))}
            <span className="absolute inset-0 rounded-full ring-1 ring-white/50" />
            <span className="absolute -right-1 top-4 text-lg opacity-80">✨</span>
          </motion.span>

          {/* orbit */}
          <span
            aria-hidden="true"
            className="absolute -inset-8 rounded-full border border-white/15 sm:-inset-10"
            style={{ animation: 'spin-slow 26s linear infinite' }}
          >
            <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-amber-200 shadow-[0_0_12px_rgba(255,220,130,0.9)]" />
            <span className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-sky-200/80" />
          </span>
        </motion.button>

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.42em] text-white/50 sm:text-[11px]"
        >
          <Sparkles className="h-3 w-3 text-amber-200" />
          A little universe for
          <Sparkles className="h-3 w-3 text-amber-200" />
        </motion.p>

        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 18, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="mt-2 font-display text-[3rem] font-bold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl"
        >
          <span className="text-glow">HEY </span>
          <span className="bg-gradient-to-r from-amber-100 via-pink-200 to-violet-200 bg-clip-text text-transparent shimmer-text">
            {PERSON.nameUpper}!
          </span>{' '}
          <span className="inline-block animate-[bob-rotate_4s_ease-in-out_infinite]">🌙</span>
        </motion.h1>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="mt-4 max-w-xl space-y-2"
        >
          <p className="font-display text-lg text-white/90 sm:text-2xl">{INTRO.hook}</p>
          <p className="text-sm leading-relaxed text-white/55 sm:text-base">{INTRO.sub}</p>
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-8 flex flex-col items-center gap-3"
        >
          <MagicButton
            onClick={openUniverse}
            disabled={launching}
            size="lg"
            accent="#ffe3a3"
            accent2="#ffb3d9"
            className="px-7 text-[15px] sm:px-10 sm:text-lg"
            icon={
              launching ? (
                <span className="block h-4 w-4 animate-spin rounded-full border-2 border-[#2a1a00]/40 border-t-[#2a1a00]" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )
            }
          >
            {launching ? 'OPENING YOUR UNIVERSE…' : INTRO.cta}
          </MagicButton>

          <p className="flex items-center gap-1.5 text-[11px] text-white/35">
            <Headphones className="h-3.5 w-3.5" />
            {enabled ? 'Sound is on — magical.' : 'Best with sound on (tap the speaker top-right)'}
          </p>
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.95, duration: 1 }}
          className="mt-10 flex flex-col items-center gap-4"
        >
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {WORLDS.map((emoji, i) => (
              <motion.span
                key={i}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-sm backdrop-blur-sm sm:h-9 sm:w-9"
                animate={reduced ? undefined : { y: [0, -4, 0] }}
                transition={{
                  duration: 3 + (i % 4) * 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.12,
                }}
                title={`World ${i + 1}`}
              >
                {emoji}
              </motion.span>
            ))}
          </div>

          <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35 sm:gap-5 sm:text-[11px]">
            <span>10 worlds</span>
            <span className="h-1 w-1 rounded-full bg-white/25" />
            <span className="text-amber-100/70">30 surprises</span>
            <span className="h-1 w-1 rounded-full bg-white/25" />
            <span>1 birthday legend</span>
          </div>

          <p className="max-w-sm text-xs leading-relaxed text-white/30">{INTRO.hint}</p>
        </motion.div>
      </main>

      <AnimatePresence>
        {launching && (
          <motion.div
            key="flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.85, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, times: [0, 0.35, 1] }}
            className="pointer-events-none fixed inset-0 z-40 bg-[radial-gradient(circle_at_50%_50%,#fff8e1_0%,#ffd166_28%,transparent_68%)]"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
