import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Lock, RotateCcw, Sparkles, Star, X } from 'lucide-react';
import { useSurprises } from '../context/SurpriseContext';
import { useExperience } from '../context/ExperienceContext';
import { EGGS, LAYERS } from '../data/surprises';
import { cn } from '../utils/cn';

interface LayerMapProps {
  open: boolean;
  onClose: () => void;
}

export function LayerMap({ open, onClose }: LayerMapProps) {
  const {
    currentLayer,
    goToLayer,
    isLayerUnlocked,
    layerCount,
    count,
    total,
    eggs,
  } = useSurprises();
  const { restartExperience } = useExperience();
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!open) {
      setConfirming(false);
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="The birthday universe map">
          <motion.button
            type="button"
            aria-label="Close map"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 h-full w-full cursor-default bg-[#05030f]/75 backdrop-blur-sm"
          />

          <motion.aside
            initial={{ x: '100%', opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', stiffness: 280, damping: 32 }}
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-white/15 bg-[#0e0a22]/95 shadow-2xl"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,rgba(185,162,255,0.22),transparent_70%)]" />

            <div className="relative flex items-start justify-between gap-4 border-b border-white/10 px-5 pb-4 pt-[max(1.25rem,env(safe-area-inset-top))]">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-200/80">
                  World map
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold text-white">
                  10 worlds, 30 surprises
                </h2>
                <p className="mt-1 text-xs text-white/50">
                  Revisit any world you have unlocked.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-colors hover:bg-white/15 hover:text-white"
                aria-label="Close map"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative flex-1 overflow-y-auto overscroll-contain px-4 py-4">
              <div className="mb-4 grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">
                    Discovered
                  </p>
                  <p className="font-display text-xl font-bold text-white">
                    {count} <span className="text-sm text-white/40">/ {total}</span>
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-200/20 bg-amber-200/5 px-3 py-2.5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-amber-100/50">
                    Secret extras
                  </p>
                  <p className="font-display text-xl font-bold text-amber-100">
                    {eggs.length} <span className="text-sm text-amber-100/40">/ {EGGS.length}</span>
                  </p>
                </div>
              </div>

              <ol className="space-y-2">
                {LAYERS.map((layer) => {
                  const unlocked = isLayerUnlocked(layer.id);
                  const found = layerCount(layer.id);
                  const complete = found === 3;
                  const isCurrent = layer.id === currentLayer;

                  return (
                    <li key={layer.id}>
                      <button
                        type="button"
                        disabled={!unlocked}
                        onClick={() => {
                          goToLayer(layer.id);
                          onClose();
                        }}
                        className={cn(
                          'group flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-all',
                          isCurrent
                            ? 'border-white/30 bg-white/[0.12]'
                            : unlocked
                              ? 'border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.09]'
                              : 'cursor-not-allowed border-white/5 bg-white/[0.02] opacity-45',
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base',
                            complete
                              ? 'bg-emerald-300/15 text-emerald-200'
                              : unlocked
                                ? 'bg-white/10'
                                : 'bg-white/5',
                          )}
                        >
                          {!unlocked ? (
                            <Lock className="h-4 w-4 text-white/40" />
                          ) : complete ? (
                            <Check className="h-4 w-4" strokeWidth={3} />
                          ) : (
                            layer.emoji
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">
                              Layer {layer.id.toString().padStart(2, '0')}
                            </span>
                            {isCurrent && (
                              <span className="rounded-full bg-amber-200/20 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-amber-100">
                                Here
                              </span>
                            )}
                          </span>
                          <span className="block truncate font-display text-sm font-semibold text-white/90">
                            {layer.name}
                          </span>
                        </span>
                        <span className="shrink-0 text-[10px] font-bold tabular-nums text-white/45">
                          {found}/3
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-100/70">
                  <Star className="h-3 w-3" fill="currentColor" /> Hidden extras
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-white/45">
                  There are secret surprises tucked around this universe. They do not count
                  toward the 30 — they are just for the curious. Keep tapping things, Moon.
                </p>
              </div>
            </div>

            <div className="relative border-t border-white/10 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
              {confirming ? (
                <div className="rounded-2xl border border-rose-300/25 bg-rose-400/10 p-3">
                  <p className="text-sm font-semibold text-rose-50">Restart from the very beginning?</p>
                  <p className="mt-1 text-[11px] text-white/50">
                    This clears all {total} surprises and any secret extras.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        restartExperience();
                        onClose();
                      }}
                      className="flex-1 rounded-xl bg-rose-300/90 px-3 py-2 text-xs font-bold text-rose-950 transition-colors hover:bg-rose-200"
                    >
                      Yes, restart
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirming(false)}
                      className="flex-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 transition-colors hover:bg-white/10"
                    >
                      Keep going
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs font-semibold text-white/55 transition-colors hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restart the magical journey
                </button>
              )}
              <p className="mt-2 flex items-center justify-center gap-1 text-center text-[10px] text-white/25">
                <Sparkles className="h-3 w-3" /> Built with friendship, for Moon
              </p>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
