import { motion } from 'framer-motion';
import { Check, ChevronRight, RotateCcw, Sparkles } from 'lucide-react';
import { useSurprises } from '../context/SurpriseContext';
import { useExperience } from '../context/ExperienceContext';
import { layerById } from '../data/surprises';
import type { LayerId } from '../types';
import { MagicButton } from './MagicButton';
import { cn } from '../utils/cn';

/**
 * Sits below every world. It is the single place that gates the next layer:
 * the doorway only opens once all three surprises in the current layer are found.
 */
export function LayerFooter({ layerId }: { layerId: LayerId }) {
  const {
    layerCount,
    isLayerComplete,
    goToLayer,
    count,
    total,
    unlockedThrough,
  } = useSurprises();
  const { restartExperience } = useExperience();
  const layer = layerById(layerId);
  const found = layerCount(layerId);
  const complete = isLayerComplete(layerId);
  const isFinal = layerId === 10;
  const allDone = count === total;

  return (
    <div className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-16 pt-2 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
        className={cn(
          'relative overflow-hidden rounded-[26px] border p-5 text-center backdrop-blur-xl sm:p-7',
          complete
            ? 'border-emerald-200/30 bg-emerald-300/[0.07]'
            : 'border-white/12 bg-black/20',
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: complete ? 'rgba(110,255,190,0.18)' : `${layer.accent}24` }}
        />

        <div className="relative flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-bold transition-colors',
                  i < found
                    ? 'border-emerald-200/50 bg-emerald-300/15 text-emerald-100'
                    : 'border-white/15 bg-white/5 text-white/35',
                )}
              >
                {i < found ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
              </span>
            ))}
          </div>

          {complete ? (
            <>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-200/80">
                Layer {layer.id.toString().padStart(2, '0')} cleared
              </p>
              <h3 className="font-display text-xl font-bold text-white sm:text-2xl">
                {isFinal
                  ? allDone
                    ? 'You found all 30 surprises, Moon. 🌙'
                    : 'The final world is complete.'
                  : `The next world is ready for you.`}
              </h3>
              <p className="max-w-md text-sm leading-relaxed text-white/55">
                {isFinal
                  ? 'That was the whole universe — but the birthday magic never really ends. You can replay all 30 surprises any time.'
                  : `${layer.emoji} ${layerById((layerId + 1) as LayerId).name} is waiting just beyond this one.`}
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                {isFinal ? (
                  <MagicButton
                    onClick={restartExperience}
                    variant="primary"
                    accent="#ffd166"
                    accent2="#ff9ecd"
                    icon={<RotateCcw className="h-4 w-4" />}
                  >
                    Restart the magical journey
                  </MagicButton>
                ) : (
                  <MagicButton
                    onClick={() => goToLayer((layerId + 1) as LayerId)}
                    variant="primary"
                    accent={layer.accent}
                    accent2={layer.accent2}
                    icon={<Sparkles className="h-4 w-4" />}
                  >
                    Enter Layer {(layerId + 1).toString().padStart(2, '0')}
                    <ChevronRight className="ml-1 inline h-4 w-4" />
                  </MagicButton>
                )}
                {layerId < unlockedThrough && (
                  <button
                    type="button"
                    onClick={() => goToLayer(unlockedThrough)}
                    className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    Jump to latest world
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
                Layer {layer.id.toString().padStart(2, '0')} · {found} of 3 discovered
              </p>
              <h3 className="font-display text-lg font-semibold text-white/90 sm:text-xl">
                {3 - found === 1
                  ? 'One more surprise opens the next world.'
                  : `${3 - found} more surprises open the next world.`}
              </h3>
              <p className="max-w-sm text-xs leading-relaxed text-white/40">
                Every surprise in this world is interactive. Tap, pop, open, catch, or press
                something above.
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
