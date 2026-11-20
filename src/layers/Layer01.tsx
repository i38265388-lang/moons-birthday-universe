import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Gift, MoonStar, Sparkles, Star } from 'lucide-react';
import { useSurprises } from '../context/SurpriseContext';
import { useAudio } from '../context/AudioContext';
import {
  BIRTHDAY_CARD_MESSAGE,
  EASTER_EGG_MESSAGES,
  FIRST_BOX_MESSAGES,
  PERSON,
} from '../data/birthdayMessages';
import { burstConfetti, sideCannons } from '../utils/fx';
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

export default function Layer01() {
  const { completeSurprise, isComplete, findEgg } = useSurprises();
  const { playSfx } = useAudio();
  const [phase, setPhase] = useState(0);
  const [cardOpen, setCardOpen] = useState(false);
  const [boxOpen, setBoxOpen] = useState(false);
  const [boxMessage, setBoxMessage] = useState('');
  const [moonTaps, setMoonTaps] = useState(0);
  const boxPool = useRef(new NoRepeatPool(FIRST_BOX_MESSAGES)).current;
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  };

  useEffect(() => () => clearTimers(), []);

  const playCeremony = () => {
    clearTimers();
    setPhase(1);
    timers.current.push(window.setTimeout(() => setPhase(2), 380));
    timers.current.push(window.setTimeout(() => setPhase(3), 820));
    timers.current.push(window.setTimeout(() => {
      setPhase(4);
      completeSurprise('l1-s1');
      sideCannons();
    }, 1150));
  };

  const openCard = () => {
    setCardOpen(true);
    completeSurprise('l1-s2');
    playSfx('gift');
  };

  const openBox = () => {
    if (boxOpen) return;
    setBoxOpen(true);
    const message = boxPool.next() ?? FIRST_BOX_MESSAGES[0];
    window.setTimeout(() => {
      setBoxMessage(message);
      completeSurprise('l1-s3');
      burstConfetti({ particleCount: 100, spread: 90 });
    }, 520);
  };

  const tapMoon = () => {
    const next = moonTaps + 1;
    setMoonTaps(next);
    playSfx('pop');
    burstConfetti({ particleCount: 18, spread: 60, colors: [[255, 215, 106], [255, 255, 255]] });
    if (next === 7) findEgg('moon-7', EASTER_EGG_MESSAGES.moonSeven);
    if (phase < 4) playCeremony();
  };

  return (
    <div className="layer-scene">
      <ParticleField count={44} colors={['#ffffff', '#ffe9a8', '#c9b6ff']} />

      <SceneHeader
        eyebrow="Layer 01 — The Magical Arrival"
        emoji="🌙"
        title="Welcome to your universe, Moon"
        subtitle="Three little surprises are hiding in this moonlit world. Find them all to open the next one."
        accent="#e6d9ff"
      />
      <SurpriseDots layer={1} className="relative z-10 mb-8" />

      {/* Surprise 1 — Moonlight ceremony */}
      <motion.div className="relative z-10 mb-9 flex flex-col items-center text-center">
        <p className="mb-3 font-body text-[11px] font-bold uppercase tracking-[0.28em] text-white/50">
          ✦ Surprise 1 · The Magical Entrance
        </p>
        <button
          type="button"
          onClick={tapMoon}
          aria-label="Tap the moon to begin the ceremony"
          className="relative flex h-36 items-center justify-center focus:outline-none"
        >
          <span className="animate-glow-pulse absolute h-40 w-40 rounded-full bg-[#ffe9a8]/30 blur-3xl" />
          <motion.span
            className="relative block h-24 w-24 rounded-full bg-[radial-gradient(circle_at_35%_30%,#fffdf2,#ffe9a8_45%,#f5c46b_100%)] shadow-[0_0_60px_rgba(255,233,168,0.75)]"
            animate={{ scale: phase >= 1 ? 1 : 0.7, rotate: [0, 8, 0] }}
            transition={{ type: 'spring', stiffness: 130, damping: 12, rotate: { duration: 8, repeat: Infinity } }}
          >
            <span className="absolute left-5 top-6 h-4 w-4 rounded-full bg-[#e8c477]/50" />
            <span className="absolute bottom-6 right-5 h-6 w-6 rounded-full bg-[#e8c477]/40" />
            <span className="absolute left-9 bottom-5 h-2.5 w-2.5 rounded-full bg-[#e8c477]/60" />
          </motion.span>
        </button>
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div className="mt-3 flex gap-3 text-2xl text-[#ffe9a8]" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {Array.from({ length: 7 }).map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1, type: 'spring' }}
                >
                  ✦
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {phase >= 3 && (
            <motion.h3
              className="gradient-text mt-2 font-display text-5xl font-bold tracking-[0.2em] sm:text-6xl"
              initial={{ opacity: 0, scale: 0.5, filter: 'blur(12px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ type: 'spring', stiffness: 120, damping: 14 }}
            >
              {PERSON.nameUpper}
            </motion.h3>
          )}
        </AnimatePresence>
        <GlowButton size="sm" variant="ghost" onClick={playCeremony} className="mt-4">
          <Sparkles className="h-4 w-4" /> {phase >= 4 ? 'Replay the sky' : 'Light up the sky'}
        </GlowButton>
      </motion.div>

      {/* Surprises 2 & 3 */}
      <div className="relative z-10 grid w-full max-w-3xl gap-5 sm:grid-cols-2">
        <div className="surprise-card flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <MoonStar className="h-6 w-6 text-[#ffd76a]" />
          </div>
          <p className="mb-2 font-body text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">
            Surprise 2 · Birthday Message
          </p>
          <h3 className="font-display text-lg font-bold text-white">Your Birthday Card</h3>
          <p className="mt-1 font-body text-xs text-white/55">A little note, just for you.</p>
          <div className="mt-4">
            <GlowButton size="sm" variant={isComplete('l1-s2') ? 'gold' : 'primary'} onClick={openCard}>
              {isComplete('l1-s2') ? 'Read it again' : 'Open the card'} <Sparkles className="h-4 w-4" />
            </GlowButton>
          </div>
        </div>

        <div className="surprise-card flex flex-col items-center">
          <p className="mb-2 font-body text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">
            Surprise 3 · First Mystery Box
          </p>
          <div className="mb-1 flex h-20 items-center justify-center">
            <GiftBox variant="mystery" size={104} opened={boxOpen} onClick={openBox} label="Open the mystery box" />
          </div>
          <h3 className="font-display text-lg font-bold text-white">What is inside?</h3>
          <p className="mt-1 font-body text-xs text-white/55">Tap the box to find out.</p>
          {boxOpen && (
            <span className="mt-2 inline-flex items-center gap-1 font-body text-[11px] text-[#ffd76a]">
              <Gift className="h-3 w-3" /> A surprise was inside!
            </span>
          )}
        </div>
      </div>

      {/* Hidden star easter egg */}
      <button
        type="button"
        aria-label="A tiny star"
        onClick={() => {
          playSfx('chime');
          findEgg('hidden-star', EASTER_EGG_MESSAGES.hiddenStar);
        }}
        className="absolute right-[8%] top-[28%] z-10 text-lg text-white/25 transition hover:scale-150 hover:text-[#ffe9a8]"
      >
        ✦
      </button>

      <RevealCard
        open={cardOpen}
        onClose={() => setCardOpen(false)}
        emoji="💌"
        title="A Birthday Note For You"
        message={BIRTHDAY_CARD_MESSAGE}
        accent="#ffd76a"
      >
        <p className="font-body text-lg text-[#ffe9a8]">
          <TypingText text="Happy Birthday, Moon!" speed={80} start={cardOpen} />
        </p>
      </RevealCard>

      <RevealCard
        open={Boolean(boxMessage)}
        onClose={() => setBoxMessage('')}
        emoji="🎁"
        title="What was in the box?"
        message={boxMessage}
        accent="#a77bff"
      />

      <div className="relative z-10 mt-8 flex items-center gap-2 font-body text-xs text-white/40">
        <MoonStar className="h-3.5 w-3.5" />
        <Star className="h-3.5 w-3.5" />
        Found {[isComplete('l1-s1'), isComplete('l1-s2'), isComplete('l1-s3')].filter(Boolean).length} of 3 here
      </div>
    </div>
  );
}
