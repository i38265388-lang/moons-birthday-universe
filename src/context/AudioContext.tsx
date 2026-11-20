import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type SoundName =
  | 'click'
  | 'pop'
  | 'gift'
  | 'chime'
  | 'whoosh'
  | 'fireworks'
  | 'laugh'
  | 'crown'
  | 'reveal';

interface AudioApi {
  /** True when sound + music are enabled. */
  enabled: boolean;
  toggle: () => void;
  playSfx: (name: SoundName) => void;
}

const AudioContextReact = createContext<AudioApi | null>(null);
const STORAGE_KEY = 'moon-birthday-audio';

export function AudioProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'on';
    } catch {
      return false;
    }
  });

  const ctxRef = useRef<AudioContext | null>(null);
  const musicBusRef = useRef<GainNode | null>(null);
  const sfxBusRef = useRef<GainNode | null>(null);
  const musicTimerRef = useRef<number | null>(null);
  const stepRef = useRef(0);

  const getContext = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    try {
      if (!ctxRef.current) {
        const ACtor =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!ACtor) return null;
        const ctx = new ACtor();
        const master = ctx.createGain();
        master.gain.value = 0.6;
        master.connect(ctx.destination);

        const musicBus = ctx.createGain();
        musicBus.gain.value = 0.22;
        musicBus.connect(master);

        const sfxBus = ctx.createGain();
        sfxBus.gain.value = 0.55;
        sfxBus.connect(master);

        ctxRef.current = ctx;
        musicBusRef.current = musicBus;
        sfxBusRef.current = sfxBus;
      }
      if (ctxRef.current.state === 'suspended') void ctxRef.current.resume();
      return ctxRef.current;
    } catch {
      return null;
    }
  }, []);

  /** A short synthesised tone. No external audio files required. */
  const tone = useCallback(
    (
      freq: number,
      duration: number,
      type: OscillatorType,
      volume: number,
      destination: GainNode | null,
      opts: { start?: number; endFreq?: number } = {},
    ) => {
      const ctx = getContext();
      if (!ctx || !destination) return;
      const now = ctx.currentTime + (opts.start ?? 0);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (opts.endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.endFreq), now + duration);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain);
      gain.connect(destination);
      osc.start(now);
      osc.stop(now + duration + 0.05);
    },
    [getContext],
  );

  const noise = useCallback(
    (duration: number, volume: number, highpass = 800) => {
      const ctx = getContext();
      const bus = sfxBusRef.current;
      if (!ctx || !bus) return;
      const frames = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < frames; i += 1) data[i] = Math.random() * 2 - 1;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = highpass;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(bus);
      source.start();
    },
    [getContext],
  );

  const playSfx = useCallback(
    (name: SoundName) => {
      if (!enabled) return;
      const bus = sfxBusRef.current;
      if (!bus) getContext();
      switch (name) {
        case 'click':
          tone(760, 0.08, 'sine', 0.12, sfxBusRef.current, { endFreq: 1050 });
          break;
        case 'pop':
          noise(0.1, 0.18, 1200);
          tone(420, 0.12, 'sine', 0.16, sfxBusRef.current, { endFreq: 900 });
          break;
        case 'gift':
          [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.3, 'triangle', 0.13, sfxBusRef.current, { start: i * 0.08 }));
          break;
        case 'chime':
          tone(1046, 0.5, 'sine', 0.12, sfxBusRef.current);
          tone(1318, 0.55, 'sine', 0.09, sfxBusRef.current, { start: 0.05 });
          break;
        case 'whoosh':
          noise(0.35, 0.1, 300);
          break;
        case 'fireworks':
          noise(0.45, 0.22, 200);
          tone(160, 0.5, 'sine', 0.18, sfxBusRef.current, { endFreq: 60 });
          break;
        case 'laugh':
          [660, 590, 720, 640, 780].forEach((f, i) =>
            tone(f, 0.12, 'square', 0.07, sfxBusRef.current, { start: i * 0.09, endFreq: f * 0.7 }),
          );
          break;
        case 'crown':
          [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.45, 'sine', 0.1, sfxBusRef.current, { start: i * 0.07 }));
          break;
        case 'reveal':
          [523, 659, 880].forEach((f, i) => tone(f, 0.6, 'sine', 0.1, sfxBusRef.current, { start: i * 0.06 }));
          break;
      }
    },
    [enabled, getContext, noise, tone],
  );

  /** Gentle, original looping arpeggio — started only after user interaction. */
  const startMusic = useCallback(() => {
    if (musicTimerRef.current !== null) return;
    const ctx = getContext();
    if (!ctx || !musicBusRef.current) return;
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 523.25, 392.0, 329.63];
    const pad = [130.81, 164.81, 196.0, 130.81];
    const tick = () => {
      const step = stepRef.current;
      tone(notes[step % notes.length], 0.9, 'sine', 0.16, musicBusRef.current);
      if (step % 4 === 0) tone(pad[(step / 4) % pad.length], 2.4, 'triangle', 0.07, musicBusRef.current);
      stepRef.current = step + 1;
    };
    tick();
    musicTimerRef.current = window.setInterval(tick, 540);
  }, [getContext, tone]);

  const stopMusic = useCallback(() => {
    if (musicTimerRef.current !== null) {
      window.clearInterval(musicTimerRef.current);
      musicTimerRef.current = null;
    }
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off');
      } catch {
        /* storage unavailable — ignore */
      }
      if (next) {
        getContext();
        // A user gesture just happened, so it is safe to start audio here.
        window.setTimeout(() => startMusic(), 0);
      } else {
        stopMusic();
      }
      return next;
    });
  }, [getContext, startMusic, stopMusic]);

  // If a preference was restored from storage, wait for the first user gesture
  // before starting the music (browsers block autoplay otherwise).
  useEffect(() => {
    if (!enabled) {
      stopMusic();
      return;
    }
    const unlock = () => {
      getContext();
      startMusic();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [enabled, getContext, startMusic, stopMusic]);

  useEffect(() => () => stopMusic(), [stopMusic]);

  const value = useMemo<AudioApi>(
    () => ({ enabled, toggle, playSfx }),
    [enabled, toggle, playSfx],
  );

  return <AudioContextReact.Provider value={value}>{children}</AudioContextReact.Provider>;
}

export function useAudio(): AudioApi {
  const ctx = useContext(AudioContextReact);
  if (!ctx) throw new Error('useAudio must be used inside <AudioProvider>');
  return ctx;
}
