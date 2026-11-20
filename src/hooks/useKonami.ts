import { useCallback, useEffect, useRef } from 'react';

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

/** Detects the classic Konami code. Used for a hidden confetti easter egg. */
export function useKonami(onUnlock: () => void) {
  const index = useRef(0);
  const callbackRef = useRef(onUnlock);

  useEffect(() => {
    callbackRef.current = onUnlock;
  }, [onUnlock]);

  const handler = useCallback((event: KeyboardEvent) => {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (key === KONAMI[index.current]) {
      index.current += 1;
      if (index.current === KONAMI.length) {
        index.current = 0;
        callbackRef.current();
      }
    } else {
      index.current = key === KONAMI[0] ? 1 : 0;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);
}
