/**
 * Core birthday copy. Everything here is friendship-focused, wholesome,
 * and easy to edit — change Moon's name or any wish in one place.
 */

export const PERSON = {
  name: 'Moon',
  nameUpper: 'MOON',
};

export const INTRO = {
  greeting: 'HEY MOON! 🌙',
  hook: 'Guess what? Today is YOUR day!',
  sub: 'An entire universe of surprises is waiting for you.',
  cta: 'ENTER YOUR BIRTHDAY UNIVERSE ✨',
  hint: 'Tap around — almost everything here is a surprise.',
};

export const BIRTHDAY_CARD_MESSAGE =
  'Happy Birthday, Moon! May your day be as wonderful, bright, and extraordinary as you are!';

/** Revealed by Layer 1's first mystery box. */
export const FIRST_BOX_MESSAGES: string[] = [
  'Surprise! Your birthday has officially been upgraded to legendary status. 🎉',
  'Warning: excessive amounts of awesome are heading your way today.',
  'You have been selected as the official CEO of Having a Great Day. Congratulations!',
  'Plot twist: the entire universe decided to celebrate you. You are welcome.',
  'Cake calories don’t count today. It is scientifically proven. (Probably.)',
  'Some people get a card. You get a whole universe. Happy birthday!',
  'Your birthday notification has been set to: maximum joy, zero boring moments.',
  'You + a new year of adventures = absolutely unstoppable. Let’s go! 🎈',
];

export const GOLDEN_GIFT_MESSAGE =
  'Your happiness deserves a celebration bigger than the entire universe!';

export const GRAND_WISH = `Moon, may this new chapter of your life be filled with endless happiness, exciting adventures, wonderful achievements, unforgettable laughter, and countless reasons to smile.

Keep shining, keep being amazing, and never stop dreaming big.

YOU DESERVE THE BEST! 🎂✨`;

export const FINALE_MASTERPIECE = `🌙 HAPPY BIRTHDAY, MOON! 🎂

May your smile never fade, your dreams keep growing, and your days be filled with happiness.

May you achieve everything you dream of and experience countless beautiful adventures.

Keep shining, Moon. The world needs more people like you.

TODAY IS YOUR DAY. ENJOY EVERY SECOND OF IT!

HAVE THE MOST AMAZING BIRTHDAY EVER! 🎉`;

export const FINAL_BUTTON_QUESTION = 'Moon... Are You Ready For The BIGGEST SURPRISE?';
export const FINAL_BUTTON_LABEL = 'UNLOCK THE FINAL MAGIC ✨';

/** Hidden bonus messages — none of these count toward the 30 surprises. */
export const EASTER_EGG_MESSAGES = {
  moonSeven:
    '🌙 SECRET UNLOCKED: You found the moon’s hidden giggle! Seven taps = seven extra doses of luck for your new year.',
  hiddenStar:
    '⭐ A tiny star whispered: “The best kind of magic is the kind you share.” Thanks for being you, Moon!',
  cakeRepeat:
    '🎂 The cake has a secret message in every slice: “More joy, please!” Your wish has been granted.',
  secretRainbow:
    '🌈 A secret rainbow appeared just for you! It leads to endless good vibes and zero rainy days.',
  konami: '🎮 Cheeky! You unlocked the confetti vortex. Party mode: maximum.',
} as const;
