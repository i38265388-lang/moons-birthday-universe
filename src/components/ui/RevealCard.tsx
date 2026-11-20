import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';
import { GlowButton } from './GlowButton';

interface RevealCardProps {
  /** When truthy the card is shown (inside a full-screen overlay). */
  open: boolean;
  onClose?: () => void;
  emoji?: string;
  title?: string;
  message: string;
  accent?: string;
  /** Optional extra content rendered below the message. */
  children?: ReactNode;
  closeLabel?: string;
}

export function RevealCard({
  open,
  onClose,
  emoji = '✨',
  title,
  message,
  accent = '#c9b6ff',
  children,
  closeLabel = 'Keep exploring',
}: RevealCardProps) {
  const content = (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="absolute inset-0 bg-[#08061a]/70 backdrop-blur-md"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title ?? 'Surprise'}
            className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-white/25 bg-white/10 p-[2px] shadow-[0_30px_90px_rgba(0,0,0,0.5)]"
            initial={{ opacity: 0, scale: 0.75, y: 40, rotate: -3 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 210, damping: 20 }}
          >
            <div
              className="relative rounded-[26px] bg-gradient-to-br from-[#1b1538]/95 via-[#251b4d]/95 to-[#12102b]/95 px-6 py-8 text-center sm:px-10 sm:py-10"
              style={{ boxShadow: `inset 0 0 60px ${accent}22` }}
            >
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <motion.span
                    key={i}
                    className="absolute text-lg opacity-70"
                    style={{
                      left: `${8 + i * 16}%`,
                      top: `${10 + (i % 3) * 32}%`,
                      color: accent,
                    }}
                    animate={{ y: [0, -14, 0], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2.4 + i * 0.3, repeat: Infinity, delay: i * 0.25 }}
                  >
                    ✦
                  </motion.span>
                ))}
              </div>

              <motion.div
                className="relative mx-auto mb-3 text-5xl sm:text-6xl"
                animate={{ y: [0, -8, 0], rotate: [-4, 4, -4] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {emoji}
              </motion.div>

              {title && (
                <h3
                  className="relative font-display text-2xl font-bold sm:text-3xl"
                  style={{ color: accent }}
                >
                  {title}
                </h3>
              )}
              <p className="relative mt-4 whitespace-pre-line font-body text-base leading-relaxed text-white/90 sm:text-lg">
                {message}
              </p>
              {children && <div className="relative mt-5">{children}</div>}

              {onClose && (
                <div className="relative mt-7 flex justify-center">
                  <GlowButton onClick={onClose} size="md">
                    <Sparkles className="h-4 w-4" /> {closeLabel}
                  </GlowButton>
                </div>
              )}
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close surprise"
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(content, document.body);
}

export default RevealCard;
