# TacTic — Project Guide for Claude

## What this is
Mobile-first tactical learning app for football. Two roles: **Coach** creates patterns, **Player** quizzes on them.

## Stack
- React 19 + Vite + TypeScript strict (no `any`)
- Tailwind CSS v4 (`@tailwindcss/vite` plugin — no tailwind.config.js)
- Zustand for global state
- React Router v7 (BrowserRouter)
- Canvas API native (no canvas library) via custom hooks
- LocalStorage via `src/services/storage.ts` — abstracted behind repository pattern
- Vitest + Testing Library

## Path alias
`@/` maps to `src/` — always use `@/` for internal imports.

## Architecture
```
src/
  features/coach/      Coach editor (pitch + timeline + keyframes)
  features/player/     Player quiz mode (animation + drawing + scoring)
  components/          Shared UI components
  hooks/               Shared custom hooks (useAnimationLoop, etc.)
  stores/              Zustand stores
  types/               TypeScript interfaces (index.ts is the barrel)
  lib/                 Pure logic — interpolation.ts, scoring.ts, id.ts
  services/            Data access — storage.ts (LocalStorage)
  test/                Vitest setup
```

## Key concepts

### Coordinate system
All positions stored as normalized `Vec2` (`x ∈ [0,1]`, `y ∈ [0,1]`) relative to the pitch canvas.  
Multiply by `canvas.width` / `canvas.height` to get pixel coordinates on render.

### Keyframe interpolation
`src/lib/interpolation.ts → getPositionAtTime(keyframes, time)` — linear interpolation between keyframes, time is `[0, 1]`.

### Pattern data model
`Pattern → Player[] → Keyframe[]` — stored in LocalStorage via `patternRepository`.  
`pauseTime` on Pattern = the quiz moment (time in [0,1]).

### Canvas rendering
Coach pitch: `src/features/coach/hooks/usePitchCanvas.ts` — draws everything on a single canvas, handles pointer events for drag.  
Pattern: draw once on every state change (no animation loop at idle). Animation loop (`useAnimationLoop`) only active during playback.

### State
Single Zustand store: `usePatternStore` in `src/stores/patternStore.ts`.  
Derived selectors (`activePattern()`, `selectedPlayer()`) are methods on the store — call them inside components.

## Conventions
- Commits: conventional commits in English (`feat:`, `fix:`, `refactor:`, `chore:`)
- No `any` — use `unknown` + type narrowing if needed
- No default exports except `App.tsx` and `main.tsx`
- Components = PascalCase files, hooks = camelCase with `use` prefix
- Mobile-first: design for 375px wide, then expand

## Running
```bash
pnpm dev        # dev server at localhost:5173
pnpm build      # production build
pnpm tsc        # type check
pnpm test       # vitest
```
