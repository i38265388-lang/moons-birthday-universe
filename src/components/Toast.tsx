import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSurprises } from '../context/SurpriseContext';
import { cn } from '../utils/cn';
import { Sparkles, Star } from 'lucide-react';

export function Toast() {
  const { toast, dismissToast } = useSurprises();

  useEffect(() => {
    if (!toast) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismissToast();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toast, dismissToast]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <AnimatePresence>
        {toast && (
          <motion.button
            key={toast.id}
            type="button"
            onClick={dismissToast}
            initial={{ opacity: 0, y: 26, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className={cn(
              'pointer-events-auto relative max-w-md overflow-hidden rounded-2xl border px-4 py-3 text-left text-sm font-medium shadow-2xl backdrop-blur-xl sm:px-5',
              toast.kind === 'egg'
                ? 'border-amber-200/50 bg-[#241a33]/90 text-amber-50'
                : toast.kind === 'surprise'
                  ? 'border-emerald-200/40 bg-[#10251f]/90 text-emerald-50'
                  : 'border-white/20 bg-[#151129]/90 text-white/90',
            )}
            aria-live="polite"
          >
            <span className="flex items-start gap-2.5">
              <span className="mt-0.5 shrink-0">
                {toast.kind === 'egg' ? (
                  <Star className="h-4 w-4 text-amber-200" fill="currentColor" />
                ) : (
                  <Sparkles className="h-4 w-4 text-emerald-200" />
                )}
              </span>
              <span className="leading-snug">{toast.text}</span>
            </span>
            <span className="mt-1 block text-[10px] uppercase tracking-[0.2em] text-white/35">
              Tap to dismiss
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
