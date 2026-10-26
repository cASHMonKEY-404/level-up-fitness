# LEVEL UP

A mobile-first fitness RPG built with React, TypeScript, Vite, and Tailwind CSS. A soft lavender wellness interface with original SVG artwork, responsive layouts, and three navigation tabs: Home, Workout, and Meal.

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

- **Home:** personalized greeting, recommended workout, manual daily steps, weekly calendar, daily goals, levels, illustrated milestones, and expandable workout history. Edit your name using the profile button.
- **Workout:** selectable weekly calendar with planned/completed indicators and three home routines for two 5 lb dumbbells, a 10 lb kettlebell, resistance bands, and a medicine ball. Swap routines, add notes, set recovery days, or move a plan to another date. Planning earns no XP. Completed sessions remain on their original date when plans move. Future workouts can be planned but not logged early.
- **Tracking:** add sets, edit reps/weights, check completed sets, and finish to save a session. Only completed sets are recorded. Dumbbell weight is per hand; band/bodyweight sets use 0 lb; enter your actual medicine ball weight. Exercise guides include step-by-step instructions and links to search for video demonstrations on YouTube; videos are not hosted in the app.
- **Meal:** weekly calendar, calories consumed/goal/remaining, protein/carbohydrate/fat progress, editable daily targets, breakfast/lunch/dinner/snack logs, serving multipliers, nutrition history, and a small searchable reference-food library. Food library values are explicitly labeled estimates. Default targets (2,000 kcal, 100 g protein, 225 g carbs, 70 g fat) are editable starting points, not personalized advice. Targets apply across all dashboard dates without rewriting food entries.
- **Barcode entry:** camera scanning where `BarcodeDetector` and secure camera access are supported; manual UPC/EAN lookup otherwise. Product lookup uses Open Food Facts at `world.openfoodfacts.org` and needs Internet access. Results are per 100 g, require label review, and are never logged automatically. Incomplete results leave fields blank for manual completion; network failures allow manual entry. iPhone Safari may not support camera barcode detection.
- **Local persistence:** the existing `levelup-react-v1` storage key and XP calculation are retained. Previous React app workouts, food records, steps, and XP remain intact. Older meals appear under Uncategorized, with unrecorded carbs/fat left unknown rather than fabricated. Plans, targets, and profile name are additive optional fields. Storage failure displays a warning. No accounts, backend, cloud backup, or health-device sync. The original uploaded HTML prototype's separate storage is not migrated.

All actual tracking starts at zero on a new browser. Suggested routines, durations, default weekly recommendations, and 2 × 12 sets are not tracked activity. Steps are a manually entered daily total. You can log completed workouts and meals for today or past dates using the calendars.

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

The original logging regression scenarios were retained and updated for the new navigation. The expanded suite covers desktop, iPhone, and compact 320 px layouts; legacy record preservation; XP rules and level progress; set logging and empty-workout rejection; plan changes and rescheduling without XP; meals, serving arithmetic, targets, and history; barcode lookup with mocked product responses and camera fallback; keyboard focus in dialogs; personalization; runtime errors; and horizontal overflow. Live camera hardware and the external food service are not exercised by mocked tests.

## Data privacy

Data is stored under `levelup-react-v1` in localStorage on your device. Clearing browser storage erases it. Workout records and meal logs are not sent to a server. Barcode lookup sends only the entered barcode to Open Food Facts; exercise video links open YouTube search. Avoid relying on this as your only copy of important records.

## Design system

`src/style.css` defines shared tokens for color, spacing, typography, radii, and shadows. `src/components.tsx` provides reusable cards, progress bars/rings, calendars, modal focus management, history rows, and original workout/food/badge illustrations. Layouts use desktop navigation and a fixed three-tab mobile bar, safe-area spacing, visible keyboard focus, and reduced-motion support. No external artwork or font download is needed.
