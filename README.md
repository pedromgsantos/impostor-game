# Impostor Game

Impostor Game is a mobile‑friendly social deduction experience inspired by one‑secret‑word party games. Players pass a single phone around, and the app guides the group through setup, secret role assignment, the discussion round, voting, and the final reveal.

## Features

* **Guided lobby setup**: add or remove players, choose between Normal or Blind (Cego) mode, select a word theme, and set a round timer. Invalid configurations automatically return to the setup screen.
* **Secret role assignment**: each player presses and holds to reveal their card, with haptic feedback. In Royale mode, the correct Clash Royale card art is shown automatically.
* **Word management**: word lists are loaded from `public/data/*.json` and stored in IndexedDB using `idb-keyval`. Words are not repeated until a theme is exhausted. Hosts can reset a theme or clear the entire history.
* **Discussion timer**: the Round screen displays a large animated timer with pause/resume controls. When the timer reaches zero, it emits a subtle "ding" but never blocks progression.
* **Touch‑first voting**: large tap targets, confirmation modals, and suspense animations before results. Votes are stored in Zustand state and navigation errors are handled gracefully.
* **Persistent rooms**: lobby settings (players, timer, mode) persist in `localStorage`.
* **PWA support**: Vite + `vite-plugin-pwa` provide a manifest and icons for installation on mobile devices.

## Tech Stack

* React 19 + TypeScript
* Vite 7
* Tailwind CSS v4
* Zustand with persistence
* Framer Motion for transitions
* idb-keyval for IndexedDB
* Vite PWA Plugin

## Getting the Project

If you do not yet have the code locally, choose one of the following:

### 1. Clone with Git

```bash
git clone https://github.com/pedromgsantos/impostor-game.git
cd impostor-game
npm install
```

### 2. Download ZIP

1. Open the repository on GitHub.
2. Click **Code → Download ZIP**.
3. Extract the archive and run:

```bash
npm install
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

## Project Structure

```
src/
├─ App.tsx
├─ components/
├─ services/wordManager.ts
├─ store/game.ts
├─ utils/
└─ views/
public/
├─ data/*.json
├─ cards/*.png
└─ manifest.webmanifest
```

## Word Themes

Word lists live under `public/data` and can be:

* **Pairs**: `{ "type": "pairs", "items": [["beach", "pool"], ...] }` for Normal mode, where the impostor sees an alternate word.
* **Single**: `{ "type": "single", "items": ["pizza", "sushi", ...] }` for Blind mode or when the impostor receives a random second word.

The `wordManager.ts` tracks used indices in IndexedDB and warns when a theme is exhausted.

## Gameplay Flow

1. **Setup** – configure players, mode, theme, and timer.
2. **Assign** – pass the device around and reveal roles.
3. **Round** – discussion phase with animated timer.
4. **Vote** – choose suspects, confirm, and display suspense animation.
5. **Result** – reveal impostor, real word, impostor word (if applicable), and winner.

## Customisation

* Add or translate word sets by placing JSON files in `public/data` and updating the theme selector in `src/views/Setup.tsx`.
* Add art assets (e.g., new Clash Royale cards) by placing PNGs in `public/cards` using the slug format generated in `Assign.tsx`.
* Adjust styling in `src/index.css` and `tailwind.config.ts`.

## License

This project is distributed under the MIT License.
