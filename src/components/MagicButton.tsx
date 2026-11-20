import { motion, useReducedMotion } from 'framer-motion';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../utils/cn';

type Variant = 'primary' | 'glass' | 'gold' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface MagicButtonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag' | 'ref' | 'children'
  > {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  accent?: string;
  accent2?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const SIZES: Record<Size, string> = {
  sm: 'min-h-[40px] px-4 py-2 text-sm gap-1.5 rounded-full',
  md: 'min-h-[48px] px-6 py-3 text-[15px] gap-2 rounded-full',
  lg: 'min-h-[56px] px-8 py-4 text-base sm:text-lg gap-2.5 rounded-full',
};

export function MagicButton({
  children,
  variant = 'primary',
  size = 'md',
  accent = '#b9a2ff',
  accent2 = '#ffd166',
  icon,
  fullWidth,
  className,
  style,
  type = 'button',
  ...rest
}: MagicButtonProps) {
  const reduced = useReducedMotion();

  const base =
    'group relative inline-flex select-none items-center justify-center overflow-hidden font-display font-semibold tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-45';

  const variants: Record<Variant, string> = {
    primary: 'text-[#1a1236] shadow-[0_14px_40px_-12px_rgba(255,209,102,0.65)]',
    gold: 'text-[#2a1a00] shadow-[0_14px_44px_-10px_rgba(255,205,90,0.8)]',
    glass: 'border border-white/25 bg-white/10 text-white backdrop-blur-md hover:bg-white/20',
    ghost: 'text-white/85 hover:bg-white/10 hover:text-white',
  };

  const background =
    variant === 'primary'
      ? `linear-gradient(120deg, ${accent} 0%, #fff 48%, ${accent2} 100%)`
      : variant === 'gold'
        ? 'linear-gradient(120deg, #ffe9a8 0%, #ffd166 45%, #ffb347 100%)'
        : undefined;

  return (
    <motion.button
      type={type}
      whileHover={reduced || rest.disabled ? undefined : { scale: 1.035, y: -1 }}
      whileTap={reduced || rest.disabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 380, damping: 24 }}
      className={cn(base, SIZES[size], variants[variant], fullWidth && 'w-full', className)}
      style={{ background, ...style }}
      {...rest}
    >
      {variant !== 'glass' && variant !== 'ghost' && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-1/3 bg-white/45 blur-md animate-sheen"
        />
      )}
      {icon && <span className="relative shrink-0">{icon}</span>}
      <span className="relative">{children}</span>
    </motion.button>
  );
}
