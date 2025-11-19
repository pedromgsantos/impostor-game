# Impostor Game

Impostor Game is a mobile-friendly party experience inspired by "one secret word" style social deduction games. It is built with React, TypeScript, Vite, and Tailwind CSS and is optimised for passing a single phone around the table. The app guides the group through setup, secret role assignment, the timed discussion round, voting, and the reveal of the impostor.

## Features
- **Guided lobby setup** – add/remove players, choose between Normal or Cego (blind) modes, pick a word theme, and set a round timer directly from the `Setup` view. Invalid configurations automatically fall back to the setup screen so nobody gets stuck mid-game.
- **Secret assignments with gestures** – players reveal their role one at a time with a press-and-hold interaction that vibrates the device for tactile feedback (`Assign.tsx`). Clash Royale themed rounds automatically show the correct card art from `public/cards`.
- **Smart word management** – `src/services/wordManager.ts` loads words from `public/data/*.json`, keeps them in IndexedDB (`idb-keyval`), and avoids repeats until a theme is exhausted. Hosts can reset a theme or the entire cache from the Result screen.
- **Discussion timer** – the `Round` screen centres a large, animated timer with pause/resume controls and haptic feedback. When the timer hits zero it plays a subtle "ding" state but never blocks progressing to the vote.
- **Touch-first voting** – `Vote.tsx` renders large, tappable cards, confirmation modals, and suspense animations before jumping to the results. Votes are persisted in Zustand state and the UI gracefully handles accidental navigation.
- **Persistent rooms** – Zustand with `persist` keeps lobby settings in `localStorage`, so reloading the page or revisiting later keeps player names, timers, and the selected mode.
- **PWA ready** – Vite + `vite-plugin-pwa` ship a manifest (`public/manifest.webmanifest`) and icon set so the game can be installed on phones.

## Tech stack
- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 7](https://vite.dev/) for development/build tooling
- [Tailwind CSS v4](https://tailwindcss.com/) via `@tailwindcss/vite`
- [Zustand](https://github.com/pmndrs/zustand) for state management with persistence middleware
- [Framer Motion](https://www.framer.com/motion/) for animated transitions between phases
- [idb-keyval](https://github.com/jakearchibald/idb-keyval) for lightweight IndexedDB storage of used words
- [Vite PWA plugin](https://vite-pwa-org.netlify.app/) for manifest/service worker generation

## Getting started
Prerequisites:
- Node.js 18.18+ or 20+ (the project targets the versions supported by Vite 7)
- npm 9+

```bash
# Install dependencies
npm install

# Start the dev server (http://localhost:5173)
npm run dev

# Type-check and build for production
npm run build

# Preview the production build locally
npm run preview

# Run ESLint
npm run lint
```

## Project structure
```
src/
├─ App.tsx             # Phase router between Setup → Assign → Round → Vote → Result
├─ components/         # Shared UI primitives
├─ services/wordManager.ts
├─ store/game.ts       # Zustand store with room/round state and persistence
├─ utils/              # Helpers used across views
└─ views/              # Setup, Assign, Round, Vote, Result screens
public/
├─ data/*.json         # Word lists and themed pairs
├─ cards/*.png         # Royale theme artwork
└─ manifest.webmanifest
```

## Word themes
Word files live under `public/data` and can be either:
- `{"type":"pairs","items":[["praia","piscina"], ...]}` for Normal mode rounds where the impostor sees an alternate word, or
- `{"type":"single","items":["pizza","sushi", ...]}` for themes where the impostor either plays blind (Cego mode) or receives a second random word.

`wordManager.ts` keeps track of the indices it has already used in IndexedDB. If a theme is exhausted, the round still starts but the host is alerted so they can reset the theme from the Result screen (`resetTheme(theme)`).

## Gameplay flow
1. **Setup** – Add players, choose mode (Normal vs Cego), select a theme (Classic, Celebrities, Royale, Food), and decide if a timer is needed.
2. **Assign** – The device is passed around; each player presses and holds to reveal their card. Royale mode swaps the words for Clash Royale cards and ensures the game runs in blind mode.
3. **Round** – The chosen starting player is highlighted alongside the countdown timer. Pausing/resuming and manual phase control keeps the experience flexible.
4. **Vote** – Everyone selects a suspect on a large touch target. A confirmation modal prevents mis-taps, then a suspense overlay plays while votes are processed.
5. **Result** – The screen declares the winner, shows the impostor, real word, and (if applicable) impostor word. Hosts can immediately play again, create a new room, or reset the word history for the active theme.

## Customisation tips
- To add or translate word sets, drop new JSON files into `public/data` and extend the `<select>` options in `src/views/Setup.tsx`.
- Add more Clash Royale cards (or any theme art) by saving matching PNGs into `public/cards` using the slug format generated in `Assign.tsx` (e.g., `Hog Rider` → `hog-rider.png`).
- Adjust the look and feel through `src/index.css` and the Tailwind base styles in `tailwind.config.ts`.

## License
This project is distributed under the [MIT License](LICENSE).
