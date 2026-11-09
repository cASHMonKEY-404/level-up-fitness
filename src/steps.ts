import type { State } from "./data";

export type TreadmillInput = {
  minutes: number;
  seconds?: number;
  speed?: number;
  distance?: number;
  incline?: number;
  calories?: number;
  method?: "distance" | "cadence";
  stepLength?: number;
  cadence?: number;
};
export type StepEstimate = {
  steps: number;
  method: "distance" | "cadence";
  stepLength?: number;
  cadence?: number;
  distance?: number;
  distanceSource?: "display" | "speed";
};
export type StepEntry = {
  id: string;
  date: string;
  input: TreadmillInput;
  estimate: StepEstimate;
  included: boolean;
};

export function estimateSteps(input: TreadmillInput): StepEstimate | null {
  if (
    !Number.isFinite(input.minutes) ||
    input.minutes < 0 ||
    (input.seconds !== undefined &&
      (!Number.isFinite(input.seconds) ||
        input.seconds < 0 ||
        input.seconds >= 60))
  )
    return null;
  const duration = input.minutes + (input.seconds || 0) / 60;
  if (!Number.isFinite(duration) || duration <= 0) return null;
  if (input.method === "cadence") {
    if (!Number.isFinite(input.cadence) || !input.cadence || input.cadence <= 0)
      return null;
    return {
      steps: Math.round(duration * input.cadence),
      method: "cadence",
      cadence: input.cadence,
    };
  }
  const distance =
    input.distance ??
    (input.speed !== undefined ? (input.speed * duration) / 60 : undefined);
  const stepLength = input.stepLength ?? 28;
  if (
    !distance ||
    !Number.isFinite(distance) ||
    distance <= 0 ||
    !Number.isFinite(stepLength) ||
    stepLength <= 0
  )
    return null;
  return {
    steps: Math.round((distance * 63360) / stepLength),
    method: "distance",
    stepLength,
    distance,
    distanceSource: input.distance !== undefined ? "display" : "speed",
  };
}

// Update by record ID. Editing a saved estimate replaces its contribution instead of adding it twice.
export function saveStepEntry(state: State, entry: StepEntry): State {
  const old = state.stepEntries?.find((e) => e.id === entry.id);
  const steps = { ...state.steps };
  if (old?.included)
    steps[old.date] = Math.max(0, (steps[old.date] || 0) - old.estimate.steps);
  if (entry.included)
    steps[entry.date] = (steps[entry.date] || 0) + entry.estimate.steps;
  return {
    ...state,
    steps,
    stepEntries: [
      ...(state.stepEntries || []).filter((e) => e.id !== entry.id),
      entry,
    ],
  };
}
export function setManualSteps(
  state: State,
  date: string,
  total: number,
): State {
  // A device/manual total replaces the day's count, including previous estimate contributions.
  return {
    ...state,
    steps: { ...state.steps, [date]: total },
    ...(state.stepEntries
      ? {
          stepEntries: state.stepEntries.map((e) =>
            e.date === date ? { ...e, included: false } : e,
          ),
        }
      : {}),
  };
}
export function durationLabel(input: TreadmillInput) {
  return input.seconds
    ? `${input.minutes}:${String(input.seconds).padStart(2, "0")}`
    : `${input.minutes} min`;
}
