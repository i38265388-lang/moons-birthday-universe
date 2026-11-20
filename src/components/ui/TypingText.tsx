import { useEffect, useState } from 'react';

interface TypingTextProps {
  text: string;
  /** Milliseconds per character. */
  speed?: number;
  className?: string;
  onDone?: () => void;
  showCursor?: boolean;
  /** Set false to pause, true to begin/continue. */
  start?: boolean;
}

export function TypingText({
  text,
  speed = 45,
  className = '',
  onDone,
  showCursor = true,
  start = true,
}: TypingTextProps) {
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!start) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setIndex(text.length);
      setDone(true);
      onDone?.();
      return;
    }
    if (index >= text.length) {
      if (!done) {
        setDone(true);
        onDone?.();
      }
      return;
    }
    const timer = window.setTimeout(() => setIndex((i) => i + 1), speed);
    return () => window.clearTimeout(timer);
  }, [index, start, speed, text, done, onDone]);

  return (
    <span className={className}>
      {text.slice(0, index)}
      {showCursor && !done && <span className="ml-0.5 inline-block animate-pulse">|</span>}
    </span>
  );
}

export default TypingText;
