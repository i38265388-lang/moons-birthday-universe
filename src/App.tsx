import { useCallback, useEffect, useState, type ComponentType } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useExperience } from './context/ExperienceContext';
import { useSurprises } from './context/SurpriseContext';
import { layerById } from './data/surprises';
import { EASTER_EGG_MESSAGES } from './data/birthdayMessages';
import type { LayerId } from './types';
import { BirthdayIntro } from './components/BirthdayIntro';
import { ProgressTracker } from './components/ProgressTracker';
import { LayerMap } from './components/LayerMap';
import { LayerFooter } from './components/LayerFooter';
import { Toast } from './components/Toast';
import { CursorGlow } from './components/CursorGlow';
import { useKonami } from './hooks/useKonami';
import { grandFinale } from './utils/fx';
import Layer01 from './layers/Layer01';
import Layer02 from './layers/Layer02';
import Layer03 from './layers/Layer03';
import Layer04 from './layers/Layer04';
import Layer05 from './layers/Layer05';
import Layer06 from './layers/Layer06';
import Layer07 from './layers/Layer07';
import Layer08 from './layers/Layer08';
import Layer09 from './layers/Layer09';
import Layer10 from './layers/Layer10';

const LAYER_COMPONENTS: Record<LayerId, ComponentType> = {
  1: Layer01,
  2: Layer02,
  3: Layer03,
  4: Layer04,
  5: Layer05,
  6: Layer06,
  7: Layer07,
  8: Layer08,
  9: Layer09,
  10: Layer10,
};

export default function App() {
  const { entered } = useExperience();
  const { currentLayer, goToLayer, unlockedThrough, findEgg, hasEgg } = useSurprises();
  const [mapOpen, setMapOpen] = useState(false);
  const reduced = useReducedMotion();
  const layer = layerById(currentLayer);
  const LayerComponent = LAYER_COMPONENTS[currentLayer];

  // Every new world starts at the top.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [currentLayer]);

  const konami = useCallback(() => {
    if (!hasEgg('confetti-vortex')) {
      findEgg('confetti-vortex', EASTER_EGG_MESSAGES.konami);
    }
    grandFinale();
  }, [findEgg, hasEgg]);

  useKonami(konami);

  // Arrow keys are a cozy way to hop between unlocked worlds.
  useEffect(() => {
    if (!entered) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (mapOpen) return;
      if (e.key === 'ArrowRight') {
        goToLayer(Math.min(currentLayer + 1, unlockedThrough) as LayerId);
      }
      if (e.key === 'ArrowLeft') {
        goToLayer(Math.max(currentLayer - 1, 1) as LayerId);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [entered, mapOpen, currentLayer, goToLayer, unlockedThrough]);

  if (!entered) {
    return (
      <div className="min-h-[100svh] bg-[#08061a]">
        <BirthdayIntro />
        <Toast />
      </div>
    );
  }

  return (
    <div className="relative min-h-[100svh] overflow-x-hidden bg-[#08061a]">
      <CursorGlow />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-40 h-24 bg-gradient-to-b from-[#08061a]/85 via-[#08061a]/35 to-transparent"
      />
      <ProgressTracker onOpenMap={() => setMapOpen(true)} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={currentLayer}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: -14 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className={`relative min-h-[100svh] w-full overflow-hidden bg-gradient-to-b ${layer.bg}`}
        >
          {/* soft breathing light behind every world */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[70vw] -translate-x-1/2 rounded-full opacity-60 blur-[110px] animate-aurora"
            style={{ background: `${layer.accent}3a` }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full opacity-40 blur-[100px]"
            style={{ background: `${layer.accent2}30` }}
          />

          <LayerComponent />
          <LayerFooter layerId={currentLayer} />
        </motion.main>
      </AnimatePresence>

      <LayerMap open={mapOpen} onClose={() => setMapOpen(false)} />
      <Toast />
    </div>
  );
}
