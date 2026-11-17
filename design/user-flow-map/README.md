# LEVEL UP · Complete user flows

This package creates a **new page in your existing Figma Design file** with 53 editable screens (15 original-frame copies and 38 source-matched additions), visible route arrows, and clickable prototype hotspots. Original pages remain unchanged. The existing source-matched additions are reused without restyling.

## Import into Figma

1. Download and extract `level-up-user-flows.zip`.
2. Open your original LEVEL UP file in the **Figma desktop app**.
3. Choose **Plugins → Development → Import plugin from manifest**, then select `manifest.json` from this folder.
4. Run **LEVEL UP · Complete user flows**. Keep the original source frames in the file: the importer clones their typography and visual elements.
5. On the new **LEVEL UP · Complete user flows** page, select Today and press Present. Blue hotspot outlines in prototype mode show available actions.

`overview.svg` provides a zoomable overview. `flow-plan.json` lists every route and frame position. `code.js` is the editable native-node importer, rather than a flattened screenshot import.

## Scope and review notes

- Covers Today, Steps and walking inputs, Workout categories and exercise details, scheduling, completion, Nutrition logging and serving edits, saved/history food, scanning, targets, and empty/error states.
- These are design prototypes, not a functioning calculator or barcode service. Separate numeric-input examples are connected using review hotspots; they do not accept live input.
- The source PDF contains inconsistent sample step totals and goals. Original sample values are retained, so linked states illustrate navigation rather than verified arithmetic.
- Back links return to the relevant overview. Destructive/error examples are review branches, not real data operations.
- Native source frames must be 375px wide with the labels shown in the supplied PDF. Missing originals or unavailable source fonts stop import rather than substituting another visual style.
- Local simulation validates importer structure and original-page preservation. Live Figma rendering and hotspot alignment still need review after import; no connected Figma editing tool is available in this environment.
- No application functionality, styling, or local data was changed.
