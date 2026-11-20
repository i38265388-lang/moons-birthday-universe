export type LayerId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type SurpriseNumber = 1 | 2 | 3;

export interface LayerMeta {
  id: LayerId;
  name: string;
  emoji: string;
  tagline: string;
  /** Short atmospheric description shown in the layer header. */
  atmosphere: string;
  /** Tailwind gradient classes used for the scene backdrop. */
  bg: string;
  /** Primary accent colour (hex) used for glows and particles. */
  accent: string;
  /** Secondary accent colour (hex). */
  accent2: string;
}

export interface SurpriseMeta {
  /** Stable id, e.g. "l3-s2". */
  id: string;
  layer: LayerId;
  number: SurpriseNumber;
  name: string;
  /** Teaser shown before the surprise is discovered. */
  teaser: string;
}

export interface EggMeta {
  id: string;
  name: string;
  /** A gentle hint (used in the "secrets" panel after discovery). */
  hint: string;
}

export interface ToastMessage {
  id: number;
  text: string;
  kind: 'surprise' | 'egg' | 'info';
}
