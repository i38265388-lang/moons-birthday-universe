import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useSurprises } from './SurpriseContext';

interface ExperienceApi {
  /** False while the magical arrival screen is showing. */
  entered: boolean;
  enter: () => void;
  /** Resets all progress and returns to the arrival screen. */
  restartExperience: () => void;
}

const ExperienceContextReact = createContext<ExperienceApi | null>(null);

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [entered, setEntered] = useState(false);
  const { restart } = useSurprises();

  const enter = useCallback(() => {
    setEntered(true);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const restartExperience = useCallback(() => {
    restart();
    setEntered(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [restart]);

  const value = useMemo<ExperienceApi>(
    () => ({ entered, enter, restartExperience }),
    [entered, enter, restartExperience],
  );

  return <ExperienceContextReact.Provider value={value}>{children}</ExperienceContextReact.Provider>;
}

export function useExperience(): ExperienceApi {
  const ctx = useContext(ExperienceContextReact);
  if (!ctx) throw new Error('useExperience must be used inside <ExperienceProvider>');
  return ctx;
}
