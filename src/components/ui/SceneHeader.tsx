import { motion } from 'framer-motion';

interface SceneHeaderProps {
  emoji: string;
  title: string;
  subtitle?: string;
  accent?: string;
  eyebrow?: string;
}

export function SceneHeader({ emoji, title, subtitle, accent = '#d9c2ff', eyebrow }: SceneHeaderProps) {
  return (
    <motion.div
      className="relative z-10 mx-auto mb-8 max-w-2xl text-center sm:mb-10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      {eyebrow && (
        <span
          className="mb-3 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1 font-body text-[11px] font-bold uppercase tracking-[0.2em] text-white/80 backdrop-blur-sm"
        >
          {eyebrow}
        </span>
      )}
      <div className="mb-2 text-4xl drop-shadow-[0_0_18px_rgba(255,255,255,0.35)] sm:text-5xl">{emoji}</div>
      <h2
        className="font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl"
        style={{ color: accent, textShadow: `0 0 30px ${accent}66` }}
      >
        {title}
      </h2>
      {subtitle && <p className="mt-3 font-body text-sm text-white/75 sm:text-base">{subtitle}</p>}
    </motion.div>
  );
}

export default SceneHeader;
