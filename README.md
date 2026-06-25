# Impostor Game

A mobile-first social deduction party game. One player secretly receives a different word from everyone else and must blend in without being caught.

> The UI ships in **Portuguese (PT)** and **English (EN)** — switch languages from the toggle in the top-right of the Setup screen. The choice is remembered across sessions.

## How to Play

1. **Setup**: Add players (minimum 3), pick a game mode, theme, optional twists, and optional timer.
2. **Assign**: Each player privately sees their word by holding the reveal button or dragging the card up. Nobody else should look.
3. **Round**: Players take turns giving clues. The timer (if set) counts down. The first player to speak is shown at the start.
4. **Vote**: The group votes on who they think is the impostor.
5. **Last Chance** (optional twist): If enabled and the impostor is caught, the impostor gets one final shot to guess the real word and steal the win.
6. **Result**: The game reveals whether the group caught the impostor or not, plus the real word and the impostor word (Normal mode only).

## Game Modes

| Mode | Description |
|------|-------------|
| **Normal** | The impostor receives a related but different word from the group. |
| **Cego (Blind)** | The impostor sees no word at all and must bluff from scratch. The impostor never speaks first. |

### Optional Twists

These can be toggled on at Setup and combined with either mode:

| Twist | Description |
|-------|-------------|
| **Última Chance (Last Chance)** | When the impostor is caught, they get one final guess at the real word. Guess it right and the impostor wins anyway. |
| **Dois Impostores (Two Impostors)** | Requires at least 5 players. Two players become impostors instead of one, and the group only wins if **both** are caught. |

## Themes

| Theme | Type | Notes |
|-------|------|-------|
| **Classic** | Word pairs | Impostor gets a related alternate word |
| **Celebrities** | Single list | Impostor gets a random different word |
| **Food** | Single list | Impostor gets a random different word |
| **Royale Heheheha** | Single list | Forces Blind mode; shows card images for group players |

The game tracks which words have been used per theme (stored in IndexedDB) and avoids repeating them until the pool is exhausted. Players can reset a theme's history from the Result screen.

## Tech Stack

| Tool | Version |
|------|---------|
| React | 19 |
| TypeScript | 5.9 |
| Vite | 7 |
| Tailwind CSS | 4 |
| Framer Motion | 12 |
| Zustand | 5 |
| idb-keyval | 6 |
| vite-plugin-pwa | 1 |
| Vitest | 3 |

## Features

- **Bilingual (PT/EN)**: in-app language toggle backed by a typed translation table; the active language persists and sets `<html lang>`.
- **PWA**: installable on mobile and desktop, works offline after the first load.
- **No backend**: fully client-side. No accounts, no server, no data leaves the device.
- **Word history**: IndexedDB prevents word repetition across rounds until the theme pool is exhausted.
- **State persistence**: room configuration (players, mode, theme, timer) survives a page refresh via Zustand + localStorage.
- **Haptic feedback**: vibration on key interactions for mobile devices.
- **Anti-cheat reveal**: the secret word is only visible while the player holds the card; the screen clears the moment they release.
- **Animated transitions**: smooth phase-to-phase transitions powered by Framer Motion.

## Getting Started

```bash
# Clone
git clone https://github.com/pedromgsantos/impostor-game.git
cd impostor-game

# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Lint
npm run lint

# Run the test suite once
npm test

# Run tests in watch mode
npm run test:watch
```

## Testing

Unit tests run on [Vitest](https://vitest.dev) (jsdom environment) and cover the
game's pure logic — no component rendering required:

- `src/store/game.test.ts` — round setup, the single- and two-impostor voting
  flows, Last Chance resolution (case/accent-insensitive), and the exhausted-pool
  toast. `getNextWords` is mocked so outcomes are deterministic.
- `src/services/wordManager.test.ts` — no-repeat word selection for pairs and
  single-list themes, blind vs. normal mode, history reset, and missing-file
  errors. `idb-keyval` is replaced with an in-memory map and `fetch` is stubbed.
- `src/i18n/translations.test.ts` — guarantees the PT and EN tables define the
  exact same keys and that interpolation works.
- `src/utils/*.test.ts` — `slugifyCard` and `playerEmoji` helpers.

## Project Structure

```
src/
├── App.tsx                  # Phase router with animated transitions
├── store/
│   └── game.ts              # Zustand store, all game state and actions
├── i18n/
│   ├── translations.ts      # PT/EN tables + framework-agnostic `translate()`
│   └── index.ts             # `useT()` React hook bound to the active language
├── views/
│   ├── Setup.tsx            # Player list, mode, theme, timer, language toggle
│   ├── Assign.tsx           # Secret role reveal (drag/hold mechanic)
│   ├── Round.tsx            # Discussion timer and first-speaker indicator
│   ├── Vote.tsx             # Suspect selection and confirmation modal
│   ├── LastChance.tsx       # Impostor's final word guess (Última Chance twist)
│   └── Result.tsx           # Winner reveal and round summary
├── services/
│   └── wordManager.ts       # Theme loading and word-history tracking (IndexedDB)
├── test/
│   └── setup.ts             # Vitest setup (localStorage shim for jsdom)
└── utils/
    ├── playerEmoji.ts       # Maps a player index to an avatar emoji
    └── slugifyCard.ts       # Maps a word to its card image filename (Royale theme)

public/
└── data/
    ├── classic.json         # Word pairs: [[real, impostor], ...]
    ├── celebrities.json     # Single word list: ["word", ...]
    ├── food.json            # Single word list
    └── royale.json          # Single word list (Blind mode, with card images)
```

## Adding a New Theme

1. Create `public/data/<theme>.json`:
   - **Word pairs** (Normal mode): `{ "type": "pairs", "items": [["beach", "pool"], ...] }`
   - **Single list** (Blind/Normal): `["pizza", "sushi", ...]`
2. Add an entry to the `THEMES` array in `src/views/Setup.tsx`, and add a
   `setup.theme.<id>` label to both the `pt` and `en` tables in
   `src/i18n/translations.ts`.
3. If the theme must force Blind mode, handle it in `src/store/game.ts` where `effectiveMode` is derived (currently only `"royale"` forces Blind).
4. To show card images, place PNGs in `public/cards/` using the filename format produced by `slugifyCard.ts`.

## License

MIT
