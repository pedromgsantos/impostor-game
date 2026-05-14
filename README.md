# Impostor Game

A mobile-first social deduction party game. One player secretly receives a different word from everyone else and must blend in without being caught.

> The UI is in **Portuguese (PT)**.

## How to Play

1. **Setup**: Add players (minimum 3), pick a game mode, theme, and optional timer.
2. **Assign**: Each player privately sees their word by holding the reveal button or dragging the card up. Nobody else should look.
3. **Round**: Players take turns giving clues. The timer (if set) counts down. The first player to speak is shown at the start.
4. **Vote**: The group votes on who they think is the impostor.
5. **Result**: The game reveals whether the group caught the impostor or not, plus the real word and the impostor word (Normal mode only).

## Game Modes

| Mode | Description |
|------|-------------|
| **Normal** | The impostor receives a related but different word from the group. |
| **Cego (Blind)** | The impostor sees no word at all and must bluff from scratch. The impostor never speaks first. |

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

## Features

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
```

## Project Structure

```
src/
├── App.tsx                  # Phase router with animated transitions
├── store/
│   └── game.ts              # Zustand store, all game state and actions
├── views/
│   ├── Setup.tsx            # Player list, mode, theme, timer configuration
│   ├── Assign.tsx           # Secret role reveal (drag/hold mechanic)
│   ├── Round.tsx            # Discussion timer and first-speaker indicator
│   ├── Vote.tsx             # Suspect selection and confirmation modal
│   └── Result.tsx           # Winner reveal and round summary
├── services/
│   └── wordManager.ts       # Theme loading and word-history tracking (IndexedDB)
└── utils/
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
2. Add an `<option>` to the theme `<select>` in `src/views/Setup.tsx`.
3. If the theme must force Blind mode, handle it in `src/store/game.ts` where `effectiveMode` is derived (currently only `"royale"` forces Blind).
4. To show card images, place PNGs in `public/cards/` using the filename format produced by `slugifyCard.ts`.

## License

MIT
