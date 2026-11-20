import { motion } from 'framer-motion';
import { LayoutGrid, Sparkles } from 'lucide-react';
import { useSurprises } from '../context/SurpriseContext';
import { LAYERS } from '../data/surprises';
import { MusicController } from './MusicController';
import { cn } from '../utils/cn';

export function ProgressTracker({ onOpenMap }: { onOpenMap: () => void }) {
  const { count, total, currentLayer, layerCount } = useSurprises();
  const layer = LAYERS.find((l) => l.id === currentLayer) ?? LAYERS[0];
  const percent = Math.round((count / total) * 100);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-3 pb-2 pt-[max(0.6rem,env(safe-area-inset-top))] sm:gap-3 sm:px-6">
        <button
          type="button"
          onClick={onOpenMap}
          className="glass group flex h-11 shrink-0 items-center gap-2 rounded-2xl px-3 text-left transition-colors hover:bg-white/15"
          aria-label="Open the world map"
        >
          <span className="relative flex h-7 w-7 items-center justify-center text-lg">
            <span className="absolute inset-0 rounded-full bg-amber-200/25 blur-md transition-opacity group-hover:opacity-100" />
            <span className="relative">🌙</span>
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-[9px] font-bold uppercase tracking-[0.22em] text-white/45">
              Moon&apos;s
            </span>
            <span className="block font-display text-[13px] font-semibold text-white">
              Birthday Universe
            </span>
          </span>
        </button>

        <div className="glass flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-3 py-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 text-[10px] sm:text-[11px]">
              <span className="truncate font-semibold uppercase tracking-[0.16em] text-white/50">
                <span className="hidden xs:inline">Layer {layer.id} · </span>
                {layer.emoji} {layer.name.replace('The ', '')}
              </span>
              <span className="shrink-0 font-bold tabular-nums text-white/85">
                {count}
                <span className="text-white/35"> / {total}</span>
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-200 via-pink-300 to-violet-300"
                  animate={{ width: `${Math.max(percent, 2)}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 22 }}
                />
              </div>
              <span className="hidden items-center gap-0.5 sm:flex" aria-hidden="true">
                {LAYERS.map((l) => (
                  <span
                    key={l.id}
                    className={cn(
                      'h-1 w-1 rounded-full transition-colors',
                      layerCount(l.id) === 3
                        ? 'bg-emerald-300'
                        : l.id === currentLayer
                          ? 'bg-white'
                          : 'bg-white/20',
                    )}
                  />
                ))}
              </span>
            </div>
          </div>
          <span className="hidden shrink-0 items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-amber-100/90 sm:flex">
            <Sparkles className="h-3 w-3" /> {percent}%
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenMap}
          className="glass flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white/75 transition-colors hover:bg-white/15 hover:text-white"
          aria-label="Open the world map and restart options"
          title="World map"
        >
          <LayoutGrid className="h-[18px] w-[18px]" />
        </button>

        <MusicController className="h-11 shrink-0 rounded-2xl" />
      </div>
    </header>
  );
}
