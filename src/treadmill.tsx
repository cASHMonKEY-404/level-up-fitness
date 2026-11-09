import { useId, useState } from "react";
import { Check } from "lucide-react";
import { estimateSteps, type StepEstimate, type TreadmillInput } from "./steps";

export function TreadmillForm({
  initial,
  included = false,
  requireEstimate = false,
  submitLabel,
  onSave,
  workouts = [],
}: {
  initial?: TreadmillInput;
  included?: boolean;
  requireEstimate?: boolean;
  submitLabel: string;
  onSave: (
    input: TreadmillInput,
    estimate: StepEstimate | null,
    include: boolean,
    sourceId?: string,
  ) => void;
  workouts?: {
    id: string;
    name: string;
    cardio: TreadmillInput;
    included: boolean;
  }[];
}) {
  const hintId = useId();
  const [values, setValues] = useState(() => toFields(initial)),
    [include, setInclude] = useState(included),
    [error, setError] = useState(""),
    [sourceId, setSourceId] = useState("");
  const field = (key: keyof typeof values, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setError("");
  };
  const optional = (key: keyof typeof values) =>
    values[key] === "" ? undefined : Number(values[key]);
  const input: TreadmillInput = {
    minutes: Number(values.minutes),
    seconds: Number(values.seconds || 0),
    ...(optional("speed") !== undefined ? { speed: optional("speed") } : {}),
    ...(optional("distance") !== undefined
      ? { distance: optional("distance") }
      : {}),
    ...(optional("incline") !== undefined
      ? { incline: optional("incline") }
      : {}),
    ...(optional("calories") !== undefined
      ? { calories: optional("calories") }
      : {}),
    method: values.method as "distance" | "cadence",
    ...(values.method === "cadence"
      ? { cadence: optional("cadence") }
      : { stepLength: Number(values.stepLength) }),
  };
  const estimate = values.minutes !== "" ? estimateSteps(input) : null;
  return (
    <form
      className="form-stack"
      onSubmit={(e) => {
        e.preventDefault();
        if (input.minutes + (input.seconds || 0) / 60 <= 0) {
          setError("Enter a workout duration greater than zero.");
          return;
        }
        if (requireEstimate && !estimate) {
          setError(
            "Enter distance or speed, or use your measured steps per minute.",
          );
          return;
        }
        onSave(input, estimate, !!estimate && include, sourceId || undefined);
      }}
    >
      {workouts.length > 0 && (
        <label>
          Use a saved treadmill workout
          <select
            value={sourceId}
            onChange={(e) => {
              const id = e.target.value;
              setSourceId(id);
              const workout = workouts.find((w) => w.id === id);
              setValues(toFields(workout?.cardio));
              setInclude(workout?.included || false);
              setError("");
            }}
          >
            <option value="">Enter a separate walk</option>
            {workouts.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="form-grid">
        <label>
          Minutes completed
          <input
            name="minutes"
            type="number"
            min="0"
            max="300"
            step="1"
            required
            value={values.minutes}
            onChange={(e) => field("minutes", e.target.value)}
            placeholder="e.g. 54"
          />
        </label>
        <label>
          Seconds
          <input
            name="seconds"
            type="number"
            min="0"
            max="59"
            step="1"
            value={values.seconds}
            onChange={(e) => field("seconds", e.target.value)}
            placeholder="0"
          />
        </label>
      </div>
      <div className="form-grid">
        <label>
          Distance (miles, optional)
          <input
            type="number"
            min="0.01"
            max="50"
            step="0.01"
            value={values.distance}
            onChange={(e) => field("distance", e.target.value)}
            placeholder="e.g. 2.74"
          />
        </label>
        <label>
          Speed (mph, optional)
          <input
            type="number"
            min="0.1"
            max="15"
            step="0.1"
            value={values.speed}
            onChange={(e) => field("speed", e.target.value)}
            placeholder="e.g. 3"
          />
        </label>
      </div>
      <div className="form-grid">
        <label>
          Incline (%, optional)
          <input
            type="number"
            min="0"
            max="40"
            step="0.1"
            value={values.incline}
            onChange={(e) => field("incline", e.target.value)}
            placeholder="e.g. 4"
          />
        </label>
        <label>
          Treadmill calories (optional)
          <input
            type="number"
            min="0"
            max="5000"
            step="1"
            value={values.calories}
            onChange={(e) => field("calories", e.target.value)}
            placeholder="e.g. 398"
          />
        </label>
      </div>
      <label>
        Step estimation method
        <select
          value={values.method}
          onChange={(e) => field("method", e.target.value)}
        >
          <option value="distance">Distance & step length</option>
          <option value="cadence">Measured steps per minute</option>
        </select>
      </label>
      {values.method === "distance" ? (
        <div>
          <label>
            Step length (inches)
            <input
              type="number"
              min="10"
              max="60"
              step="0.1"
              required
              value={values.stepLength}
              aria-describedby={`${hintId}-length`}
              onChange={(e) => field("stepLength", e.target.value)}
            />
          </label>
          <small id={`${hintId}-length`} className="field-hint">
            28 inches is a starting estimate, not a measurement of your stride.
            For better accuracy, measure distance walked ÷ number of steps; one
            step is one footfall.
          </small>
        </div>
      ) : (
        <div>
          <label>
            Measured steps per minute
            <input
              type="number"
              min="20"
              max="250"
              step="1"
              required
              value={values.cadence}
              aria-describedby={`${hintId}-cadence`}
              onChange={(e) => field("cadence", e.target.value)}
              placeholder="e.g. 110"
            />
          </label>
          <small id={`${hintId}-cadence`} className="field-hint">
            Count every footfall for one minute at this speed and incline.
            Average a few counts if possible.
          </small>
        </div>
      )}
      <div className="step-result" role="status" aria-live="polite">
        <span>Estimated steps</span>
        <strong>
          {estimate ? `≈ ${estimate.steps.toLocaleString()}` : "—"}
        </strong>
        <small>
          {estimate?.method === "cadence"
            ? `${estimate.cadence} steps/min × elapsed time`
            : estimate
              ? `${estimate.distanceSource === "display" ? "Displayed distance" : "Speed × elapsed time"} ÷ ${estimate.stepLength}-inch step length`
              : "Enter time and distance or speed to see an estimate."}
        </small>
      </div>
      <p className="calculator-note">
        Incline and displayed calories are saved for reference; they don’t
        directly determine steps. This is an estimate, not a device step count.
      </p>
      <label className="check-label">
        <input
          type="checkbox"
          checked={include}
          disabled={!estimate}
          onChange={(e) => setInclude(e.target.checked)}
        />
        <span>Add this estimate to the daily step total</span>
      </label>
      <p className="calculator-note">
        Leave unchecked if your phone or tracker already counted this walk.
        Editing a saved estimate updates its contribution rather than adding it
        twice.
      </p>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <button className="primary">
        {submitLabel}
        <Check size={18} />
      </button>
    </form>
  );
}
function toFields(input?: TreadmillInput) {
  return {
    minutes: input ? String(input.minutes) : "",
    seconds: input?.seconds !== undefined ? String(input.seconds) : "0",
    distance: input?.distance !== undefined ? String(input.distance) : "",
    speed: input?.speed !== undefined ? String(input.speed) : "",
    incline: input?.incline !== undefined ? String(input.incline) : "",
    calories: input?.calories !== undefined ? String(input.calories) : "",
    method: input?.method || "distance",
    stepLength: String(input?.stepLength ?? 28),
    cadence: input?.cadence !== undefined ? String(input.cadence) : "",
  };
}
