export const day = () => dateKey(new Date());
export const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const parseDay = (key: string) => new Date(`${key}T12:00:00`);
export const addDays = (key: string, n: number) => {
  const d = parseDay(key);
  d.setDate(d.getDate() + n);
  return dateKey(d);
};
export const weekDays = (key: string) => {
  const d = parseDay(key);
  const monday = addDays(key, -((d.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
};
export const formatDay = (
  key: string,
  options: Intl.DateTimeFormatOptions = { month: "long", day: "numeric" },
) => parseDay(key).toLocaleDateString("en-US", options);
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
  carbs?: number;
  fat?: number;
  meal?: MealType;
  servings?: number;
};
export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snacks";
export type Targets = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};
export type Plan = { routine: number | null; note: string };
export const defaultTargets: Targets = {
  calories: 2000,
  protein: 100,
  carbs: 225,
  fat: 70,
};
export const mealTypes: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snacks"];
export type State = {
  history: Session[];
  food: Food[];
  steps: Record<string, number>;
  schedule?: Record<string, Plan>;
  targets?: Targets;
  name?: string;
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

// Default recommendations are suggestions, not completed activity or saved plans.
export function planFor(state: State, key: string): Plan {
  const saved = state.schedule?.[key];
  if (saved) return saved;
  const index = (parseDay(key).getDay() + 6) % 7;
  return {
    routine: index === 0 ? 0 : index === 2 ? 1 : index === 4 ? 2 : null,
    note: "",
  };
}
export const foodReferences = [
  {
    name: "Greek yogurt, plain",
    serving: "170 g tub",
    calories: 100,
    protein: 17,
    carbs: 6,
    fat: 0,
  },
  {
    name: "Banana",
    serving: "1 medium banana",
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fat: 0.4,
  },
  {
    name: "Oatmeal, cooked",
    serving: "1 cup",
    calories: 154,
    protein: 5,
    carbs: 27,
    fat: 2.6,
  },
  {
    name: "Chicken breast, cooked",
    serving: "100 g",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
  },
  {
    name: "Brown rice, cooked",
    serving: "1 cup",
    calories: 216,
    protein: 5,
    carbs: 45,
    fat: 1.8,
  },
  {
    name: "Egg",
    serving: "1 large egg",
    calories: 72,
    protein: 6.3,
    carbs: 0.4,
    fat: 4.8,
  },
  {
    name: "Avocado",
    serving: "half a medium avocado",
    calories: 160,
    protein: 2,
    carbs: 8.5,
    fat: 14.7,
  },
];
export const exerciseGuides: Record<string, string[]> = {
  "Goblet squat": [
    "Hold the kettlebell close to your chest, feet about shoulder-width apart.",
    "Sit your hips back and bend your knees, keeping your chest lifted.",
    "Press through your feet to stand tall. Use a comfortable depth.",
  ],
  "Dumbbell floor press": [
    "Lie on your back with knees bent and a dumbbell in each hand.",
    "Keep elbows about 45 degrees from your body. Press weights above your chest.",
    "Lower slowly until your upper arms gently touch the floor.",
  ],
  "Band row": [
    "Sit with legs extended and loop an intact band securely around your feet.",
    "Keep your chest tall and pull your elbows back toward your ribs.",
    "Release slowly without rounding your back. Keep the band away from your face.",
  ],
  "Medicine ball dead bug": [
    "Lie on your back, knees above hips. Hold a light medicine ball above your chest.",
    "Keep your lower back gently pressed down while you extend one leg.",
    "Return slowly and alternate legs. Count reps per side.",
  ],
  "Bicep curl": [
    "Stand tall with a dumbbell in each hand, palms forward.",
    "Keep elbows by your sides as you curl the weights toward your shoulders.",
    "Lower with control without swinging your body.",
  ],
  "Shoulder press": [
    "Hold dumbbells at shoulder height, wrists straight.",
    "Brace your core and press overhead without arching your back.",
    "Lower slowly to the start. Use only a comfortable overhead range.",
  ],
  "Band pull-apart": [
    "Hold an intact band at chest height with arms extended but not locked.",
    "Gently pull hands apart, bringing shoulder blades toward each other.",
    "Return slowly while keeping shoulders relaxed.",
  ],
  "Bent-over row": [
    "Hold dumbbells, soften your knees, and hinge at your hips with a neutral back.",
    "Draw elbows toward your hips without shrugging or twisting.",
    "Lower the weights slowly and maintain your hinge.",
  ],
  "Kettlebell deadlift": [
    "Place the kettlebell between your feet. Hinge at the hips and grip the handle.",
    "Keep your back neutral and stand tall by pressing through your feet.",
    "Push your hips back to return the weight to the floor with control.",
  ],
  "Band lateral walk": [
    "Place a loop band above your knees and take a small squat stance.",
    "Step sideways with control, keeping knees aligned with toes.",
    "Bring the trailing foot in without losing tension. Repeat both directions.",
  ],
  "Medicine ball glute bridge": [
    "Lie on your back with knees bent, feet flat. Secure a light ball on your hips with your hands.",
    "Brace your core and lift hips by squeezing your glutes, without arching your back.",
    "Lower slowly. Use bodyweight instead if the ball is uncomfortable.",
  ],
};
