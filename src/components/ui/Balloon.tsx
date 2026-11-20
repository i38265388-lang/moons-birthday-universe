import { motion } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';

interface BalloonProps {
  color: string;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
  /** Optional icon or short label shown on the balloon. */
  children?: ReactNode;
  size?: number;
  popped?: boolean;
  label?: string;
}

export function Balloon({
  color,
  onClick,
  className = '',
  style,
  children,
  size = 84,
  popped = false,
  label,
}: BalloonProps) {
  if (popped) {
    return (
      <span
        className={`inline-flex flex-col items-center ${className}`}
        style={{ width: size, ...style }}
        aria-hidden="true"
      >
        <span className="text-2xl opacity-60">✷</span>
      </span>
    );
  }
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label ?? 'Balloon — tap for a surprise'}
      className={`group relative flex flex-col items-center focus:outline-none ${className}`}
      style={{ width: size, ...style }}
      whileHover={{ scale: 1.08, y: -6 }}
      whileTap={{ scale: 0.9 }}
      animate={{ y: [0, -9, 0] }}
      transition={{ y: { duration: 3.2 + (size % 5) * 0.4, repeat: Infinity, ease: 'easeInOut' } }}
    >
      <span
        className="relative flex items-center justify-center shadow-[inset_-10px_-12px_20px_rgba(0,0,0,0.18),0_10px_28px_rgba(0,0,0,0.25)]"
        style={{
          width: size,
          height: size * 1.15,
          background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.85), ${color} 42%, ${color} 100%)`,
          borderRadius: '50% 50% 48% 48% / 56% 56% 44% 44%',
        }}
      >
        {children && <span className="relative z-10 text-xl drop-shadow">{children}</span>}
        <span
          className="absolute left-[22%] top-[14%] h-[22%] w-[16%] rotate-[25deg] rounded-full bg-white/60 blur-[1px]"
          aria-hidden="true"
        />
      </span>
      <span
        className="block h-2 w-3 -mt-0.5"
        style={{ background: color, clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}
        aria-hidden="true"
      />
      <span
        className="block w-px bg-white/45"
        style={{ height: size * 0.85, transform: 'rotate(3deg)', transformOrigin: 'top' }}
        aria-hidden="true"
      />
    </motion.button>
  );
}

export default Balloon;
