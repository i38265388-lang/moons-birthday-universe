import { useSurprises } from '../../context/SurpriseContext';
import type { LayerId } from '../../types';

interface SurpriseDotsProps {
  layer: LayerId;
  className?: string;
}

/** Three small dots showing which surprises in this layer are done. */
export function SurpriseDots({ layer, className = '' }: SurpriseDotsProps) {
  const { isComplete } = useSurprises();
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`} aria-label="Surprises in this layer">
      {[1, 2, 3].map((n) => {
        const done = isComplete(`l${layer}-s${n}`);
        return (
          <span
            key={n}
            className={`h-2.5 rounded-full transition-all duration-500 ${done ? 'w-7 bg-gradient-to-r from-[#ffd76a] to-[#ff9ecd] shadow-[0_0_12px_rgba(255,215,106,0.8)]' : 'w-2.5 bg-white/30'}`}
          />
        );
      })}
    </div>
  );
}

export default SurpriseDots;
