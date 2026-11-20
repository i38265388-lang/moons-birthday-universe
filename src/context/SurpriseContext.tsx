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
import { useAudio } from './AudioContext';
import { burstConfetti } from '../utils/fx';
import {
  LAYERS,
  SURPRISES,
  TOTAL_SURPRISES,
  surprisesForLayer,
  surpriseById,
} from '../data/surprises';
import type { LayerId, ToastMessage } from '../types';

const STORAGE_KEY = 'moon-birthday-universe-v1';

interface PersistedState {
  completed: string[];
  eggs: string[];
  currentLayer: LayerId;
}

interface SurpriseApi {
  completed: string[];
  eggs: string[];
  currentLayer: LayerId;
  /** Highest layer the visitor is allowed to enter. */
  unlockedThrough: LayerId;
  count: number;
  total: number;
  isComplete: (id: string) => boolean;
  completeSurprise: (id: string) => void;
  layerCount: (layer: LayerId) => number;
  isLayerComplete: (layer: LayerId) => boolean;
  isLayerUnlocked: (layer: LayerId) => boolean;
  goToLayer: (layer: LayerId) => void;
  restart: () => void;
  findEgg: (id: string, message: string) => void;
  hasEgg: (id: string) => boolean;
  toast: ToastMessage | null;
  showToast: (text: string, kind?: ToastMessage['kind'], duration?: number) => void;
  dismissToast: () => void;
  lastCompleted: string | null;
}

const SurpriseContextReact = createContext<SurpriseApi | null>(null);

function readStored(): PersistedState {
  const fallback: PersistedState = { completed: [], eggs: [], currentLayer: 1 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    const validIds = new Set(SURPRISES.map((s) => s.id));
    const completed = Array.isArray(parsed.completed)
      ? parsed.completed.filter((id): id is string => typeof id === 'string' && validIds.has(id))
      : [];
    const eggs = Array.isArray(parsed.eggs) ? parsed.eggs.filter((e): e is string => typeof e === 'string') : [];
    const layer = LAYERS.some((l) => l.id === parsed.currentLayer) ? (parsed.currentLayer as LayerId) : 1;
    return { completed, eggs, currentLayer: layer };
  } catch {
    return fallback;
  }
}

export function SurpriseProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(readStored, []);
  const [completed, setCompleted] = useState<string[]>(initial.completed);
  const [eggs, setEggs] = useState<string[]>(initial.eggs);
  const [currentLayer, setCurrentLayer] = useState<LayerId>(initial.currentLayer);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [lastCompleted, setLastCompleted] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const { playSfx } = useAudio();

  // Persist progress whenever it changes.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed, eggs, currentLayer }));
    } catch {
      /* storage unavailable — ignore */
    }
  }, [completed, eggs, currentLayer]);

  const dismissToast = useCallback(() => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast(null);
  }, []);

  const showToast = useCallback(
    (text: string, kind: ToastMessage['kind'] = 'info', duration = 3600) => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
      setToast({ id: Date.now(), text, kind });
      toastTimer.current = window.setTimeout(() => setToast(null), duration);
    },
    [],
  );

  useEffect(() => () => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
  }, []);

  const completedSet = useMemo(() => new Set(completed), [completed]);

  const isComplete = useCallback((id: string) => completedSet.has(id), [completedSet]);

  const layerCount = useCallback(
    (layer: LayerId) => surprisesForLayer(layer).filter((s) => completedSet.has(s.id)).length,
    [completedSet],
  );

  const isLayerComplete = useCallback((layer: LayerId) => layerCount(layer) === 3, [layerCount]);

  const unlockedThrough = useMemo<LayerId>(() => {
    let highest: LayerId = 1;
    for (const layer of LAYERS) {
      if (layer.id === 1 || isLayerComplete((layer.id - 1) as LayerId)) highest = layer.id;
    }
    return highest;
  }, [isLayerComplete]);

  const isLayerUnlocked = useCallback((layer: LayerId) => layer <= unlockedThrough, [unlockedThrough]);

  const completeSurprise = useCallback(
    (id: string) => {
      if (completedSet.has(id)) return;
      const meta = surpriseById(id);
      if (!meta) return;
      setCompleted((prev) => (prev.includes(id) ? prev : [...prev, id]));
      setLastCompleted(id);
      playSfx('chime');
      burstConfetti({ particleCount: 55, spread: 75 });
      showToast(`✨ Surprise discovered: ${meta.name}`, 'surprise');
    },
    [completedSet, playSfx, showToast],
  );

  const goToLayer = useCallback(
    (layer: LayerId) => {
      const target = Math.max(1, Math.min(layer, unlockedThrough)) as LayerId;
      setCurrentLayer(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [unlockedThrough],
  );

  const restart = useCallback(() => {
    setCompleted([]);
    setEggs([]);
    setCurrentLayer(1);
    setLastCompleted(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('🔄 The magic has been reset. Let’s go again!', 'info', 3000);
  }, [showToast]);

  const hasEgg = useCallback((id: string) => eggs.includes(id), [eggs]);

  const findEgg = useCallback(
    (id: string, message: string) => {
      if (eggs.includes(id)) return;
      setEggs((prev) => [...prev, id]);
      playSfx('reveal');
      burstConfetti({ particleCount: 40, spread: 100 });
      showToast(message, 'egg', 6000);
    },
    [eggs, playSfx, showToast],
  );

  const value = useMemo<SurpriseApi>(
    () => ({
      completed,
      eggs,
      currentLayer,
      unlockedThrough,
      count: completed.length,
      total: TOTAL_SURPRISES,
      isComplete,
      completeSurprise,
      layerCount,
      isLayerComplete,
      isLayerUnlocked,
      goToLayer,
      restart,
      findEgg,
      hasEgg,
      toast,
      showToast,
      dismissToast,
      lastCompleted,
    }),
    [
      completed, eggs, currentLayer, unlockedThrough, isComplete, completeSurprise,
      layerCount, isLayerComplete, isLayerUnlocked, goToLayer, restart, findEgg,
      hasEgg, toast, showToast, dismissToast, lastCompleted,
    ],
  );

  return <SurpriseContextReact.Provider value={value}>{children}</SurpriseContextReact.Provider>;
}

export function useSurprises(): SurpriseApi {
  const ctx = useContext(SurpriseContextReact);
  if (!ctx) throw new Error('useSurprises must be used inside <SurpriseProvider>');
  return ctx;
}
