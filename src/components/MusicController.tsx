import { useEffect, useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { cn } from '../utils/cn';
import { Volume2, VolumeX } from 'lucide-react';

export function MusicController({ className }: { className?: string }) {
  const { enabled, toggle } = useAudio();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    setPulse(true);
    const timer = window.setTimeout(() => setPulse(false), 900);
    return () => window.clearTimeout(timer);
  }, [enabled]);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? 'Mute music and sound effects' : 'Turn on music and sound effects'}
      title={enabled ? 'Sound on — tap to mute' : 'Tap for magical sound'}
      className={cn(
        'group relative flex h-10 items-center gap-2 rounded-full border px-3 text-xs font-semibold transition-colors',
        enabled
          ? 'border-white/25 bg-white/15 text-white'
          : 'border-white/15 bg-white/[0.06] text-white/60 hover:bg-white/10 hover:text-white',
        pulse && 'ring-2 ring-amber-200/60',
        className,
      )}
    >
      {enabled ? (
        <>
          <Volume2 className="h-4 w-4 shrink-0" />
          <span className="hidden items-end gap-[2px] sm:flex" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-[2px] rounded-full bg-amber-200/90"
                style={{
                  height: `${5 + i * 3}px`,
                  animation: `twinkle-soft ${0.7 + i * 0.18}s ease-in-out infinite`,
                }}
              />
            ))}
          </span>
          <span className="hidden md:inline">Sound on</span>
        </>
      ) : (
        <>
          <VolumeX className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Sound off</span>
        </>
      )}
    </button>
  );
}
