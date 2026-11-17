# LEVEL UP — additions matched to your PDF

This replaces the previous kit as the design handoff. It is **not a redesign of your existing screens**. Original Today, Daily steps, Upper body, Nutrition, Meal Category, History, Saved and Scan screens are left intact.

## What was taken from your actual source

The uploaded PDF has 375 px-wide phone frames. Its measured patterns include 24 px page margins, 20 px summary cards, 14 px exercise rows and primary buttons, 10 px inputs, 48 px primary buttons, and 24 px-radius walk-sheet pill actions. Actual section accents are #6600FF, #5DFF00 and #E24EFF. Original source crops are provided in `source-reference/` for comparison.

The native Figma importer discovers your original 375 px frames, **clones the original text styles and fonts**, preserves native status/home-indicator graphics, and duplicates the existing Workout frame for Full Body and Lower Body. It does not replace your font with Inter or apply a new design system. If it cannot find the originals or load their fonts, it stops before creating a page.

## Additions

38 targeted additions cover Full Body, Lower Body, Cardio; eleven exercise logging variants; extended walk inputs, step estimation, cadence, manual totals and editing; portion editing; goals and scheduling; progress; and the missing completion, empty, camera, loading, network, storage, delete and unsaved states.

No new dashboard layout, navigation system, motivational panels or replacement Nutrition screen is added. Progress is a separate detail frame; its entry point remains for you to place. Your existing wording is retained where the pattern already exists; new controls use short labels such as Add, Save, Done, Your sets and Edit walk.

## Import into the original Figma file

The Figma tool connection was not available in this chat. The original live file has **not** been edited.

1. Open the original Level Up Figma file in Figma Desktop.
2. Create a local development plugin: **Plugins → Development → New plugin**, Figma Design, Run once/without UI. Figma creates its own manifest and plugin ID.
3. Replace that generated plugin folder's `code.js` with this kit's `code.js`; keep Figma's generated manifest.
4. Run the development plugin. A new **LEVEL UP · Source-matched additions** page is created. Existing pages and prototype connections are not changed.
5. Review the additions, then connect them from your existing frames where desired. Internal buttons are linked where a new destination is present; original-page links are left for review rather than rewiring your file automatically.

## Preview and SVG import

`preview.png` compares a few additions with your original Workout reference. The `screens/` folder contains individual SVG layout previews; they can be dragged into Figma. These SVG previews use system fonts and therefore cannot guarantee the exact original glyph shapes on every machine. **Use the native source-template importer to inherit the actual Figma text styles.** The SVGs are layout previews, not a claim that the live source file was edited.

The native importer is syntax-checked and passed a local source-document simulation that verifies original text/styles are unchanged and no font substitution occurs. It cannot be verified against the inaccessible live Figma document. It resolves source templates by the exact existing screen text and 375 px width. Do not run the old 77-screen importer for this handoff.

## Behavior notes

Suggested set targets are not logged sets. Save only checked actual reps/weights. The treadmill example 2.74 mi at a generic 28-inch step length estimates 6,200 steps; cadence 110 over 54:20 gives 5,977. Incline and machine calories do not directly determine steps. Estimated steps are added only by explicit choice, and editing replaces an existing contribution rather than duplicating it. Food nutrition per serving is multiplied by portions consumed once; unknown nutrients remain unknown. Goals are editable starting values, not personal nutrition advice. Existing tracking and XP rules are preserved during future implementation.

This folder contains design artifacts only. Application source code is unchanged.
