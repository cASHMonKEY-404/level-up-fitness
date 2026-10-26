# LEVEL UP ⚡

A mobile-first fitness RPG built with React, TypeScript, Vite, and Tailwind CSS. Inspired by the supplied LEVEL UP prototype, with a new responsive dark-and-lime interface.

## Run locally

Use Node.js 22.12+ (validated with Node 24) and npm.

```sh
npm ci
npm run dev
```

Open the address printed by Vite (normally http://localhost:5173). In a remote development environment, forward port 5173 using your editor's Ports panel. The server binds to all interfaces for port forwarding. This is a web app, not a native iOS build.

```sh
npm run build       # TypeScript validation and production bundle in dist/
npm run preview     # Serve the production bundle
```

## Working features

- **Today:** level and XP bar, recommended full-body mission, daily quests, manual step goal, and quick nutrition access.
- **Train:** three home routines covering two 5 lb dumbbells, a 10 lb kettlebell, resistance bands, and a medicine ball. Add sets, edit reps/weights, check completed sets, and finish to save a session. Only completed sets are recorded. Dumbbell weight is per hand; band/bodyweight sets use 0 lb; enter your actual medicine ball weight.
- **Fuel:** manually log meals with calories and protein, and see today's totals.
- **Progress:** expandable workout history with set details, total XP, levels, and earned milestones.
- **Local persistence:** workouts, meals, and daily step totals survive reloads in the same browser. Storage failure displays a warning. No accounts, backend, cloud backup, health sync, or barcode scanning yet. The older HTML prototype's storage is separate and is not migrated.

All actual tracking starts at zero. Workout routines, 25-minute durations, and default 2 × 12 sets are suggestions, not fabricated activity. Steps are a manually entered daily total, not automatic or estimated tracking. There are no prescribed calorie targets.

**XP rules:** 120 per logged workout with at least one completed set, 25 for the first meal on each local calendar day, and 50 for a daily total of at least 8,000 steps. XP is derived from saved records; correcting a step total below the goal removes that day's step bonus. Every 500 XP advances one level. Daily quests reset by date without erasing history.

## Browser tests

```sh
npx playwright install chromium
npm test
```

Or use an existing Chromium binary:

```sh
CHROMIUM_PATH=/usr/bin/chromium npm test
```

The suite runs on mobile and desktop viewports and checks actual set logging, empty-workout rejection, meal logging, step goal XP without duplicate awards, persistence after reload, history details, navigation, runtime errors, and horizontal overflow.

## Data privacy

Data is stored under `levelup-react-v1` in localStorage on your device. Clearing browser storage erases it. This version does not send fitness or nutrition entries to a server. Avoid relying on this as your only copy of important records.
