export const day = () => new Date().toLocaleDateString("en-CA");
export type SetEntry = { reps: number; weight: number };
export type Session = {
  id: string;
  date: string;
  name: string;
  exercises: { name: string; sets: SetEntry[] }[];
  xp: number;
};
export type Food = {
  id: string;
  date: string;
  name: string;
  calories: number;
  protein: number;
};
export type State = {
  history: Session[];
  food: Food[];
  steps: Record<string, number>;
};
export const emptyState = (): State => ({ history: [], food: [], steps: {} });
export const xpTotal = (s: State) =>
  s.history.reduce((n, x) => n + x.xp, 0) +
  new Set(s.food.map((f) => f.date)).size * 25 +
  Object.values(s.steps).filter((n) => n >= 8000).length * 50;
export const levelInfo = (xp: number) => ({
  level: 1 + Math.floor(xp / 500),
  progress: xp % 500,
});
export const routines = [
  {
    name: "Full body foundations",
    tag: "FULL BODY",
    minutes: 25,
    detail: "A little of everything. A stronger you.",
    exercises: [
      ["Goblet squat", "10 lb kettlebell", 10],
      ["Dumbbell floor press", "Two 5 lb dumbbells · weight per hand", 5],
      ["Band row", "Resistance band · enter 0 lb", 0],
      ["Medicine ball dead bug", "Medicine ball · use your actual weight", 0],
    ],
  },
  {
    name: "Upper body builder",
    tag: "UPPER BODY",
    minutes: 20,
    detail: "Build strength, one good rep at a time.",
    exercises: [
      ["Bicep curl", "Two 5 lb dumbbells · weight per hand", 5],
      ["Shoulder press", "Two 5 lb dumbbells · weight per hand", 5],
      ["Band pull-apart", "Resistance band · enter 0 lb", 0],
      ["Bent-over row", "Two 5 lb dumbbells · weight per hand", 5],
    ],
  },
  {
    name: "Strong from the ground up",
    tag: "LOWER BODY",
    minutes: 25,
    detail: "Find your foundation. Build your power.",
    exercises: [
      ["Kettlebell deadlift", "10 lb kettlebell", 10],
      ["Goblet squat", "10 lb kettlebell", 10],
      ["Band lateral walk", "Resistance band · reps per side", 0],
      [
        "Medicine ball glute bridge",
        "Medicine ball · use your actual weight",
        0,
      ],
    ],
  },
] as const;
export function loadState(): State {
  try {
    const s = JSON.parse(localStorage.getItem("levelup-react-v1") || "null");
    if (
      s &&
      Array.isArray(s.history) &&
      Array.isArray(s.food) &&
      s.steps &&
      typeof s.steps === "object" &&
      s.history.every(
        (h: Session) =>
          typeof h.id === "string" &&
          typeof h.date === "string" &&
          typeof h.name === "string" &&
          h.xp === 120 &&
          Array.isArray(h.exercises) &&
          h.exercises.every(
            (e) =>
              typeof e.name === "string" &&
              Array.isArray(e.sets) &&
              e.sets.every(
                (v) =>
                  Number.isFinite(v.reps) &&
                  v.reps > 0 &&
                  Number.isFinite(v.weight) &&
                  v.weight >= 0,
              ),
          ),
      ) &&
      s.food.every(
        (f: Food) =>
          typeof f.name === "string" &&
          typeof f.date === "string" &&
          Number.isFinite(f.calories) &&
          Number.isFinite(f.protein),
      ) &&
      Object.values(s.steps).every((n) => Number.isFinite(n) && Number(n) >= 0)
    )
      return s;
  } catch {
    /* Keep the app usable if storage is unavailable or invalid. */
  }
  return emptyState();
}
