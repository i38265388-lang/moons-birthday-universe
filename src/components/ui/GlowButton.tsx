import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';
import { useAudio } from '../../context/AudioContext';

type Variant = 'primary' | 'gold' | 'ghost' | 'rainbow' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface GlowButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  /** Play a soft click sound (requires audio to be enabled). */
  sound?: boolean;
}

const variantClass: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-[#7c5cff] via-[#a77bff] to-[#ff8fd0] text-white shadow-[0_10px_40px_rgba(150,110,255,0.45)]',
  gold:
    'bg-gradient-to-r from-[#ffcf5c] via-[#ffe9a8] to-[#ffb347] text-[#4a2b00] shadow-[0_10px_40px_rgba(255,200,90,0.45)]',
  ghost:
    'bg-white/10 text-white border border-white/25 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.18)]',
  rainbow:
    'bg-[linear-gradient(90deg,#ff6b9d,#ffc371,#7bed9f,#70a1ff,#c56cf0,#ff6b9d)] bg-[length:200%_auto] animate-shimmer text-white shadow-[0_10px_40px_rgba(200,120,255,0.4)]',
  danger:
    'bg-gradient-to-r from-[#ff7eb3] to-[#ff758c] text-white shadow-[0_10px_35px_rgba(255,110,150,0.4)]',
};

const sizeClass: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm rounded-full',
  md: 'px-6 py-3 text-sm sm:text-base rounded-full',
  lg: 'px-8 py-4 text-base sm:text-lg rounded-full',
  xl: 'px-9 py-5 text-lg sm:text-xl rounded-full',
};

export function GlowButton({
  variant = 'primary',
  size = 'md',
  sound = true,
  className = '',
  onClick,
  children,
  ...rest
}: GlowButtonProps) {
  const { playSfx } = useAudio();
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 320, damping: 18 }}
      onClick={(event) => {
        if (sound) playSfx('click');
        onClick?.(event);
      }}
      className={`relative inline-flex items-center justify-center gap-2 font-display font-semibold tracking-wide transition-shadow hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50 disabled:cursor-not-allowed disabled:opacity-50 ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

export default GlowButton;
