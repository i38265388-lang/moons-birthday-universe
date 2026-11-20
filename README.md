# 🌙 Moon's Birthday Universe

> A magical, friendship-filled birthday website built for Moon — **10 worlds × 3 surprises = 30 little moments of joy.**

This is an interactive birthday celebration: a journey through ten hand-crafted worlds, each hiding three surprises to discover. It is 100% a **friendship gift**. No romance, just wholesome fun, laughter, and a whole universe of "happy birthday" energy. ✨

---

## ✨ Feature Highlights

- **30 surprises across 10 layers** — three discoverable moments in each uniquely themed world.
- **12 floating balloons** — pop them in Layer 5 for carnival wishes, confetti and falling-star games.
- **Progress tracking** — your journey is saved automatically to `localStorage`, so you can pick up where you left off.
- **Unlocked layers** — new worlds open up only after you've found all three surprises in the previous one.
- **World map revisit** — hop back to any unlocked world at any time from the in-app map (or with the ← / → arrow keys).
- **Restart** — one tap wipes progress and lets you (or Moon) experience everything from the beginning again.
- **Sound with a twist** — a sound toggle controls original music and effects that are **generated in the browser with the Web Audio API**. No audio files, no downloads.
- **No autoplay** — audio only starts after a real user interaction, exactly as browsers require. Sound is **off by default**.
- **Confetti & fireworks** — celebratory particle effects powered by `canvas-confetti`, including star shapes, side cannons, and a grand-finale firework show.
- **Responsive** — designed to feel magical on both desktop and mobile.
- **Hidden Easter eggs** — secret extras (including a Konami-code confetti vortex) that are fun to find but **never count** toward the 30 surprises.
- **Reduced-motion support** — respects `prefers-reduced-motion` throughout: particle effects are skipped and transitions fall back to gentle fades.

---

## 🛠️ Tech Stack

| Piece | Technology |
| --- | --- |
| UI library | **React 18** |
| Language | **TypeScript** |
| Build tool / dev server | **Vite** |
| Styling | **Tailwind CSS v3** |
| Animation | **Framer Motion** |
| Icons | **Lucide React** |
| Particles | **canvas-confetti** |
| Audio | **Web Audio API** (generated music + SFX, no external files) |

---

## 🚀 Local Development

**Requirements:** Node.js **18+** (the project uses Vite 6).

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

The dev server binds to `0.0.0.0`, so it works in containers and on your local network. Open the URL Vite prints (usually `http://localhost:5173`).

Other useful scripts:

```bash
npm run typecheck   # TypeScript check only (tsc --noEmit)
```

---

## 📦 Production Build & Preview

```bash
# Type-check and build into dist/
npm run build

# Serve the production build locally
npm run preview
```

The production output lands in the **`dist/`** directory. `npm run build` runs `tsc --noEmit && vite build`, so a type error will fail the build.

---

## 🌐 Deployment

This is a static Vite single-page app — any static host will work. Ready-made configs for Vercel and Netlify are included in the repo root (`vercel.json` and `netlify.toml`).

### Deploy to Vercel

1. Push this project to a Git repository (GitHub / GitLab / Bitbucket).
2. In [Vercel](https://vercel.com), choose **Add New → Project** and import that repository.
3. Vercel usually detects Vite automatically. Confirm the settings:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Click **Deploy**. The included `vercel.json` already sets these values and adds an SPA rewrite to `/index.html`.

### Deploy to Netlify

**Option A — Git-based (recommended):**

1. Push the project to a Git repository.
2. In [Netlify](https://www.netlify.com), choose **Add new site → Import an existing project** and connect the repo.
3. Set the build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Click **Deploy site**. The included `netlify.toml` provides these settings plus the SPA redirect.

**Option B — Drag and drop:**

1. Run `npm run build` locally.
2. Drag the generated **`dist/`** folder onto the deploy area in the Netlify dashboard.
3. That's it — no config needed for a simple static deploy. (For clean SPA route refreshes, keep the `netlify.toml` redirect.)

> **Note:** The app uses client-side navigation with no URL-based routing, so it works perfectly from the root URL. The SPA rewrites are included as a safety net for any future deep links.

---

## 🎨 Customization Guide

Everything personal is centralized in `src/data/` — you never need to touch the layer logic to change the words.

### Name and all core copy

Edit **`src/data/birthdayMessages.ts`**:

- `PERSON.name` / `PERSON.nameUpper` — Moon's name (display and uppercase forms).
- `INTRO` — the landing screen greeting, hook, subtitle, CTA button, and hint.
- `BIRTHDAY_CARD_MESSAGE` — the message on the birthday card in Layer 1.
- `FIRST_BOX_MESSAGES` — the pool of messages shown by the first mystery box.
- `GOLDEN_GIFT_MESSAGE` — the message inside the golden gift (Layer 3).
- `GRAND_WISH` — the big wish in Layer 9.
- `FINALE_MASTERPIECE` — the final message in the Layer 10 finale.
- `EASTER_EGG_MESSAGES` — the secret bonus messages (these don't count toward the 30).

Also in this file you'll find `FINAL_BUTTON_QUESTION` and `FINAL_BUTTON_LABEL` for the big final reveal.

### Message pools

Randomized lines live in their own files so they can be expanded freely:

- **`src/data/wishes.ts`** — wish messages.
- **`src/data/compliments.ts`** — compliments for the compliment universe.
- **`src/data/jokes.ts`** — jokes for the giggle factory.

### Layers, palettes, and surprises

Edit **`src/data/surprises.ts`**:

- `LAYERS` — each layer's id, name, emoji, tagline, atmosphere description, background gradient (`bg`), and two accent colors (`accent`, `accent2`).
- `SURPRISES` — the 30 surprise definitions: `id`, `layer`, `number`, `name`, and `teaser`.
- `EGGS` — the hidden extras (metadata + hints).
- `TOTAL_SURPRISES` — derived from `SURPRISES.length`.

### Colors and animations

- **`tailwind.config.js`** — theme colors (`midnight`, `lavender`, `moonlight`), fonts, glow shadows, and the custom keyframes/animations (`float`, `twinkle`, `shimmer`, `pulse-glow`, and more).
- **`src/index.css`** — global styles, base layer, utility classes, and the `@media (prefers-reduced-motion: reduce)` block.

The page title, meta description, theme color, and Google Fonts links live in **`index.html`** if you want to rebrand those too.

---

## 🧪 Testing performed

- `npm run typecheck` passed after the final edits.
- `npm run build` passed (`tsc --noEmit && vite build`); the production bundle built successfully.
- Browser DOM checks confirmed the Layer 8 `secret-rainbow` egg fires once when all three Layer 8 surprises are found, even after entering Layer 8 with the egg missing.
- Browser interactions covered Layer 8 clouds/rainbow/dream, Layer 9 candles/fireworks/grand wish, Layer 10 celebration/final button/masterpiece, restart clearing progress, the 12-balloon Layer 5 state, and the sound toggle persistence.
- No console errors were observed during the browser checks.

---

## 🧠 Architecture Overview

```
src/
├── context/
│   ├── SurpriseContext.tsx   # progress engine + localStorage persistence
│   ├── AudioContext.tsx      # Web Audio music + SFX, sound toggle
│   └── ExperienceContext.tsx # "entered" state for the intro → experience flow
├── components/
│   ├── ui/         # shared presentational library (buttons, cards, particles, etc.)
│   └── ...         # app shell UI, intro, toasts, progress tracker, world map, music control
├── layers/
│   └── Layer01.tsx … Layer10.tsx   # one component per themed world
├── data/           # all copy, layer metadata, surprise definitions, message pools
├── hooks/          # reuseable hooks (typewriter, konami, no-repeat, discovery)
├── utils/
│   ├── fx.ts       # confetti / fireworks helpers (reduced-motion aware)
│   ├── random.ts   # shuffle, randomFrom, pickMany, NoRepeatPool
│   └── cn.ts       # className helper
├── App.tsx         # picks the active layer and wires up the shell
├── index.css       # Tailwind entry + global styles
└── types.ts        # shared TypeScript types (LayerId, SurpriseMeta, etc.)
```

- **`src/context/SurpriseContext.tsx`** is the progress engine. It stores state in `localStorage` under the key **`moon-birthday-universe-v1`**, tracks completed surprise IDs and found eggs, computes unlocks, and drives toasts, chimes, and confetti.
- **`src/context/AudioContext.tsx`** owns the single `AudioContext`, synthesizes all SFX and a looping arpeggio from oscillators, and stores the sound preference under `moon-birthday-audio`. It never autoplays.
- **`src/components/ui`** is the shared, reusable UI library (e.g. `GlowButton`, `RevealCard`, `GiftBox`, `Balloon`, `ParticleField`, `TypingText`), re-exported through `src/components/ui/index.ts`.
- **`src/components/layout`** is the shell around each world: `ProgressTracker`, `WorldMap`, `MusicController`, `ContinueBanner`, and `Toast`.
- **`src/layers/Layer01.tsx` … `Layer10.tsx`** are the ten self-contained themed worlds rendered by `App.tsx` based on the current layer.
- **`src/utils/fx.ts`** and **`src/utils/random.ts`** provide the confetti/fireworks effects and the no-repeat randomizers used by the message pools.

---

## 🔓 How the Surprise Engine Works

- Each layer contains **exactly 3 surprises**, with IDs of the form **`lN-s1` … `lN-s3`** (for example, Layer 1 uses `l1-s1`, `l1-s2`, `l1-s3`).
- Layer **N** unlocks only when **all three** surprises of layer **N−1** are complete. Layer 1 is open from the start; `unlockedThrough` is the highest layer the visitor may enter.
- Completing a surprise marks its ID complete (persisted to `localStorage`), plays a chime, fires confetti, and shows a discovery toast. The layer's progress dots and the global counter update immediately.
- Message pools use a **no-repeat** strategy: a `NoRepeatPool` shuffles a pool and draws until it's exhausted before reshuffling, so the same line doesn't repeat back-to-back.
- **Easter eggs are tracked separately** from completed surprises. Finding one triggers its own message and effect but never contributes to the 30-surprise count or layer unlocks.
- Progress survives reloads. **Restart** clears completed surprises, eggs, and the current-layer state, removes the storage key, and returns to Layer 1.

---

## 🌙 Made for Moon

Every world, word, and little secret here was made for Moon by a friend — purely to celebrate a birthday and say *"you're a wonderful person and today is yours."* No romance, just genuine friendship, laughter, and a wish for an amazing year ahead.

Happy birthday, Moon. Keep shining. 🎂✨
