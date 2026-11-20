import { AnimatePresence, motion } from 'framer-motion';

type GiftVariant = 'purple' | 'red' | 'gold' | 'mystery' | 'pink';

interface GiftBoxProps {
  variant?: GiftVariant;
  onClick?: () => void;
  opened?: boolean;
  label?: string;
  size?: number;
  className?: string;
}

const themes: Record<GiftVariant, { box: string; lid: string; ribbon: string; glow: string }> = {
  purple: { box: '#7a4fd6', lid: '#9b74ff', ribbon: '#ffd76a', glow: 'rgba(180,140,255,0.6)' },
  red: { box: '#d63f6e', lid: '#ff6b93', ribbon: '#ffd76a', glow: 'rgba(255,110,150,0.55)' },
  gold: { box: '#c9962f', lid: '#ffd76a', ribbon: '#fff4cf', glow: 'rgba(255,215,106,0.75)' },
  mystery: { box: '#4b3a9e', lid: '#6f57d6', ribbon: '#7bedf0', glow: 'rgba(120,100,255,0.6)' },
  pink: { box: '#b04fa5', lid: '#f48fd6', ribbon: '#fff0a8', glow: 'rgba(255,140,220,0.55)' },
};

export function GiftBox({
  variant = 'purple',
  onClick,
  opened = false,
  label = 'Open the gift',
  size = 180,
  className = '',
}: GiftBoxProps) {
  const t = themes[variant];
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`relative flex flex-col items-center justify-end focus:outline-none ${className}`}
      style={{ width: size, height: size }}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.96 }}
      animate={{ y: [0, -6, 0] }}
      transition={{ y: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
    >
      <div
        className="pointer-events-none absolute bottom-2 left-1/2 h-10 w-3/4 -translate-x-1/2 rounded-full blur-2xl"
        style={{ background: t.glow, opacity: 0.7 }}
      />
      {/* Lid */}
      <motion.div
        className="absolute left-1/2 z-20 -translate-x-1/2 rounded-lg"
        style={{
          width: size * 0.78,
          height: size * 0.2,
          background: `linear-gradient(135deg, ${t.lid}, ${t.box})`,
          boxShadow: `0 6px 18px rgba(0,0,0,0.35), 0 0 25px ${t.glow}`,
          top: size * 0.3,
        }}
        animate={opened ? { y: -size * 0.32, rotate: -18, x: '-58%' } : { y: 0, rotate: 0, x: '-50%' }}
        transition={{ type: 'spring', stiffness: 190, damping: 14 }}
      >
        <span
          className="absolute left-1/2 top-1/2 h-full w-[16%] -translate-x-1/2 -translate-y-1/2 rounded-sm"
          style={{ background: t.ribbon }}
        />
        <motion.span
          className="absolute -top-4 left-1/2 h-7 w-7 -translate-x-1/2 rounded-full"
          style={{ background: t.ribbon }}
          animate={opened ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
        />
      </motion.div>

      {/* Box body */}
      <div
        className="absolute bottom-1 left-1/2 -translate-x-1/2 overflow-hidden rounded-b-xl rounded-t-md shadow-[0_18px_40px_rgba(0,0,0,0.4)]"
        style={{
          width: size * 0.7,
          height: size * 0.48,
          background: `linear-gradient(160deg, ${t.box}, ${t.lid})`,
        }}
      >
        <span
          className="absolute left-1/2 top-0 h-full w-[16%] -translate-x-1/2"
          style={{ background: t.ribbon, opacity: 0.95 }}
        />
        <span
          className="absolute left-0 top-0 h-full w-[16%]"
          style={{ background: t.ribbon, opacity: 0.95 }}
        />
        <span
          className="absolute right-0 top-0 h-full w-[16%]"
          style={{ background: t.ribbon, opacity: 0.95 }}
        />
      </div>

      <AnimatePresence>
        {opened && (
          <motion.span
            className="pointer-events-none absolute left-1/2 top-6 z-10 -translate-x-1/2 text-5xl"
            initial={{ opacity: 0, y: 40, scale: 0.4 }}
            animate={{ opacity: 1, y: -18, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
          >
            {variant === 'gold' ? '🌟' : '✨'}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export default GiftBox;
