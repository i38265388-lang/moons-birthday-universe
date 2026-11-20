import type { EggMeta, LayerId, LayerMeta, SurpriseMeta } from '../types';

/** The 10 environments. Each has a distinct atmosphere and palette. */
export const LAYERS: LayerMeta[] = [
  {
    id: 1,
    name: 'The Magical Arrival',
    emoji: '🌙',
    tagline: 'Entering Moon’s Birthday Universe',
    atmosphere: 'A moonlit sky that wakes up one star at a time.',
    bg: 'from-[#0b0a1f] via-[#1b1540] to-[#3b2a6b]',
    accent: '#c9b6ff',
    accent2: '#ffd76a',
  },
  {
    id: 2,
    name: 'The Magical Birthday World',
    emoji: '🎠',
    tagline: 'A fantasy amusement park above the clouds',
    atmosphere: 'Floating balloons, shooting stars and a glowing portal.',
    bg: 'from-[#141a3a] via-[#263a7a] to-[#5b8fd6]',
    accent: '#8fd3ff',
    accent2: '#ffb3d9',
  },
  {
    id: 3,
    name: 'The Happiness Box',
    emoji: '🎁',
    tagline: 'A room filled with magical gifts',
    atmosphere: 'Warm golden light spills out of towering present boxes.',
    bg: 'from-[#2a1740] via-[#5c2d6b] to-[#b05a8e]',
    accent: '#ffd166',
    accent2: '#ff9ecd',
  },
  {
    id: 4,
    name: 'The Compliment Universe',
    emoji: '⭐',
    tagline: 'A constellation of reasons to smile',
    atmosphere: 'Golden stars drift through a calm violet cosmos.',
    bg: 'from-[#0d1030] via-[#282a6e] to-[#6c4fb0]',
    accent: '#ffdf8a',
    accent2: '#bfa8ff',
  },
  {
    id: 5,
    name: 'The Celebration Carnival',
    emoji: '🎪',
    tagline: 'Step right up to the birthday carnival',
    atmosphere: 'Bold stripes, bright lights and cheerful chaos.',
    bg: 'from-[#3a1150] via-[#8e2f7e] to-[#e4725f]',
    accent: '#ffd166',
    accent2: '#ff7bac',
  },
  {
    id: 6,
    name: 'The Interactive Wonder Garden',
    emoji: '🌸',
    tagline: 'A garden that blooms when you tap it',
    atmosphere: 'Soft mint, blossom pink and wandering butterflies.',
    bg: 'from-[#0d2b3a] via-[#1e6b63] to-[#7bbd8c]',
    accent: '#ffafd0',
    accent2: '#a8f0d0',
  },
  {
    id: 7,
    name: 'The Giggle Factory',
    emoji: '😂',
    tagline: 'Where the laughs are made',
    atmosphere: 'Candy-coloured machines, cartoons and silly surprises.',
    bg: 'from-[#2b1246] via-[#6d3ca8] to-[#f0a04b]',
    accent: '#ffe066',
    accent2: '#ff8fa3',
  },
  {
    id: 8,
    name: 'The Birthday Dream World',
    emoji: '☁️',
    tagline: 'Drift through a sky of soft possibilities',
    atmosphere: 'Pastel clouds, slow rainbows and dreamy light.',
    bg: 'from-[#1b2352] via-[#5b6fc4] to-[#c9b8f2]',
    accent: '#ffe3a3',
    accent2: '#b8d8ff',
  },
  {
    id: 9,
    name: 'The Ultimate Celebration',
    emoji: '🎂',
    tagline: 'The party everyone is talking about',
    atmosphere: 'A grand stage with a glowing cake and full-screen fireworks.',
    bg: 'from-[#160a2e] via-[#4a1d63] to-[#b8376e]',
    accent: '#ffcf5c',
    accent2: '#ff8ab5',
  },
  {
    id: 10,
    name: 'The Grand Finale',
    emoji: '🌌',
    tagline: 'The universe celebrates Moon',
    atmosphere: 'A cinematic galaxy, enormous typography and a final burst of magic.',
    bg: 'from-[#05030f] via-[#150b39] to-[#3a1f7a]',
    accent: '#d9c2ff',
    accent2: '#ffd76a',
  },
];

/** Exactly 30 main surprises — three per layer. */
export const SURPRISES: SurpriseMeta[] = [
  { id: 'l1-s1', layer: 1, number: 1, name: 'Magical Birthday Entrance', teaser: 'Watch the sky wake up' },
  { id: 'l1-s2', layer: 1, number: 2, name: 'Birthday Message Reveal', teaser: 'Open your birthday card' },
  { id: 'l1-s3', layer: 1, number: 3, name: 'First Mystery Box', teaser: 'Tap the mystery box' },

  { id: 'l2-s1', layer: 2, number: 1, name: 'Floating Balloon Universe', teaser: 'Pop a floating balloon' },
  { id: 'l2-s2', layer: 2, number: 2, name: 'Shooting Star Wishes', teaser: 'Catch a shooting star' },
  { id: 'l2-s3', layer: 2, number: 3, name: 'Magical Birthday Portal', teaser: 'Step through the portal' },

  { id: 'l3-s1', layer: 3, number: 1, name: 'The Infinite Gift Box', teaser: 'Open the never-ending gift' },
  { id: 'l3-s2', layer: 3, number: 2, name: 'The Happiness Generator', teaser: 'Generate some joy' },
  { id: 'l3-s3', layer: 3, number: 3, name: 'The Golden Gift', teaser: 'Unwrap the rare golden gift' },

  { id: 'l4-s1', layer: 4, number: 1, name: 'Star of Awesomeness', teaser: 'Discover a compliment star' },
  { id: 'l4-s2', layer: 4, number: 2, name: 'Crown of the Day', teaser: 'Try on the birthday crown' },
  { id: 'l4-s3', layer: 4, number: 3, name: '10 Reasons Generator', teaser: 'Find out why you are amazing' },

  { id: 'l5-s1', layer: 5, number: 1, name: 'Balloon Pop Challenge', teaser: 'Pop your way through the carnival' },
  { id: 'l5-s2', layer: 5, number: 2, name: 'The Confetti Button', teaser: 'Fire the confetti cannons' },
  { id: 'l5-s3', layer: 5, number: 3, name: 'Mini Birthday Game', teaser: 'Catch falling stars' },

  { id: 'l6-s1', layer: 6, number: 1, name: 'Talking Flowers', teaser: 'Listen to the flowers' },
  { id: 'l6-s2', layer: 6, number: 2, name: 'Butterfly Wishes', teaser: 'Catch a butterfly' },
  { id: 'l6-s3', layer: 6, number: 3, name: 'Rainbow Fountain', teaser: 'Make a wish at the fountain' },

  { id: 'l7-s1', layer: 7, number: 1, name: 'Random Joke Machine', teaser: 'Get a giggle' },
  { id: 'l7-s2', layer: 7, number: 2, name: 'Funny Birthday Awards', teaser: 'Claim your award' },
  { id: 'l7-s3', layer: 7, number: 3, name: 'The Laugh Button', teaser: 'Press for laughs' },

  { id: 'l8-s1', layer: 8, number: 1, name: 'Cloud of Wishes', teaser: 'Tap a floating cloud' },
  { id: 'l8-s2', layer: 8, number: 2, name: 'The Magical Rainbow', teaser: 'Touch the rainbow' },
  { id: 'l8-s3', layer: 8, number: 3, name: 'The Dream Machine', teaser: 'Generate a dream wish' },

  { id: 'l9-s1', layer: 9, number: 1, name: 'Giant Birthday Cake', teaser: 'Blow out the candles' },
  { id: 'l9-s2', layer: 9, number: 2, name: 'Birthday Fireworks', teaser: 'Light up the sky' },
  { id: 'l9-s3', layer: 9, number: 3, name: 'Grand Birthday Wish', teaser: 'Read your grand wish' },

  { id: 'l10-s1', layer: 10, number: 1, name: 'The Universe Celebrates Moon', teaser: 'Behold the galaxy' },
  { id: 'l10-s2', layer: 10, number: 2, name: 'Ultimate Surprise Button', teaser: 'Unlock the final magic' },
  { id: 'l10-s3', layer: 10, number: 3, name: 'Final Birthday Masterpiece', teaser: 'Read the final message' },
];

/** Hidden extras — deliberately NOT part of the 30. */
export const EGGS: EggMeta[] = [
  { id: 'moon-7', name: 'The Winking Moon', hint: 'The moon loves a little attention. Try seven taps.' },
  { id: 'hidden-star', name: 'The Whispering Star', hint: 'Somewhere in the sky, one tiny star is different.' },
  { id: 'cake-secret', name: 'The Cake’s Secret', hint: 'Cake has more than one slice of wisdom.' },
  { id: 'secret-rainbow', name: 'The Secret Rainbow', hint: 'Good things come to those who keep exploring.' },
  { id: 'confetti-vortex', name: 'Confetti Vortex', hint: 'A classic combination of arrows unlocks a classic surprise.' },
];

export const TOTAL_SURPRISES = SURPRISES.length; // 30

export function surprisesForLayer(layer: LayerId): SurpriseMeta[] {
  return SURPRISES.filter((s) => s.layer === layer);
}

export function surpriseById(id: string): SurpriseMeta | undefined {
  return SURPRISES.find((s) => s.id === id);
}

export function layerById(id: LayerId): LayerMeta {
  return LAYERS.find((l) => l.id === id) ?? LAYERS[0];
}
