import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Barcode,
  Camera,
  Check,
  ChevronRight,
  Coffee,
  Droplet,
  Drumstick,
  Flame,
  Leaf,
  Plus,
  Salad,
  Search,
  Settings2,
  Sun,
  Utensils,
  Wheat,
  X,
} from "lucide-react";
import {
  day,
  defaultTargets,
  foodReferences,
  formatDay,
  mealTypes,
  type Food,
  type MealType,
  type State,
  type Targets,
} from "./data";
import {
  Bar,
  Calendar,
  Card,
  Empty,
  FoodArt,
  Modal,
  Ring,
  SectionTitle,
} from "./components";

export function Meal({
  state,
  selected,
  onSelect,
  commit,
  notify,
}: {
  state: State;
  selected: string;
  onSelect: (d: string) => void;
  commit: (next: State) => void;
  notify: (s: string) => void;
}) {
  const [adding, setAdding] = useState<MealType | null>(null),
    [editingTargets, setEditingTargets] = useState(false),
    [showHistory, setShowHistory] = useState(false),
    [openScanner, setOpenScanner] = useState(false);
  const targets = state.targets || defaultTargets,
    foods = state.food.filter((f) => f.date === selected),
    sum = (key: "calories" | "protein" | "carbs" | "fat") =>
      foods.reduce((n, f) => n + (f[key] || 0), 0),
    calories = sum("calories"),
    remaining = Math.max(0, targets.calories - calories),
    future = selected > day();
  const groups = [
    ...mealTypes,
    ...(foods.some((f) => !f.meal) ? ["Uncategorized" as const] : []),
  ];
  const dates = [...new Set(state.food.map((f) => f.date))].sort().reverse();
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <Leaf size={15} /> A LITTLE NOURISHMENT
          </div>
          <h1>Good food. Good energy.</h1>
          <p>Feed your everyday. Find what feels good for you.</p>
        </div>
        <button className="secondary" onClick={() => setEditingTargets(true)}>
          <Settings2 size={16} /> My targets
        </button>
      </div>
      <Card className="calendar-card meal-calendar">
        <Calendar
          selected={selected}
          onSelect={onSelect}
          completed={state.food.map((f) => f.date)}
        />
      </Card>
      <div className="nutrition-heading">
        <h2>
          {selected === day()
            ? "Today"
            : formatDay(selected, {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
          ’s nourishment
        </h2>
        <span>
          {state.targets
            ? "Your daily targets"
            : "Starting targets · adjust for you"}
        </span>
      </div>
      <Card className="calorie-card">
        <div className="calorie-intro">
          <span className="pill white">
            <Flame size={13} /> DAILY ENERGY
          </span>
          <h2>
            A little fuel for
            <br />
            everything you do.
          </h2>
          <p>
            {calories >= targets.calories
              ? "Your energy target is reached. Listen to your body."
              : "Nourishment, not a numbers game."}
          </p>
          <span className="nutrition-date">
            {formatDay(selected, {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        <Ring value={calories} max={targets.calories} className="calorie-ring">
          <Flame size={21} />
          <strong>{Math.round(calories).toLocaleString()}</strong>
          <small>kcal consumed</small>
        </Ring>
        <div className="calorie-stats">
          <div>
            <span className="icon-tile small white">
              <Salad size={18} />
            </span>
            <span>
              <small>Daily goal</small>
              <b>
                {targets.calories.toLocaleString()} <em>kcal</em>
              </b>
            </span>
          </div>
          <div>
            <span className="icon-tile small white">
              <Leaf size={18} />
            </span>
            <span>
              <small>
                {calories > targets.calories ? "Above target" : "Remaining"}
              </small>
              <b>
                {Math.round(
                  calories > targets.calories
                    ? calories - targets.calories
                    : remaining,
                ).toLocaleString()}{" "}
                <em>kcal</em>
              </b>
            </span>
          </div>
        </div>
        <FoodArt />
      </Card>
      <div className="macro-grid">
        {(
          [
            {
              key: "protein",
              label: "Protein",
              icon: Drumstick,
              tone: "peach",
            },
            {
              key: "carbs",
              label: "Carbohydrates",
              icon: Wheat,
              tone: "lavender",
            },
            { key: "fat", label: "Fat", icon: Droplet, tone: "sage" },
          ] as const
        ).map(({ key, label, icon: Icon, tone }) => (
          <Card key={key} className={`macro-card ${tone}`}>
            <div>
              <span className={`icon-tile ${tone}`}>
                <Icon size={21} />
              </span>
              <h3>{label}</h3>
              <span className="macro-target">{targets[key]}g goal</span>
            </div>
            <strong>
              {sum(key).toLocaleString(undefined, { maximumFractionDigits: 1 })}
              <small>g</small>
            </strong>
            <Bar
              value={sum(key)}
              max={targets[key]}
              label={`${label} progress`}
              tone={tone}
            />
            <p>
              {Math.max(0, targets[key] - sum(key)).toLocaleString(undefined, {
                maximumFractionDigits: 1,
              })}
              g remaining
            </p>
          </Card>
        ))}
      </div>
      {foods.some((f) => f.carbs === undefined || f.fat === undefined) && (
        <p className="legacy-note">
          Earlier entries didn’t track carbohydrates or fat. Their original
          calories and protein are preserved; macro totals include only known
          values.
        </p>
      )}
      <div className="meal-layout">
        <div>
          <SectionTitle
            title="A day of good things"
            subtitle="Your meals, one bite at a time."
            action={
              <button
                className="text-button"
                disabled={future}
                onClick={() => setAdding("Breakfast")}
              >
                <Plus size={16} /> Add food
              </button>
            }
          />
          {future && (
            <p className="notice">
              You’re looking ahead. Log meals on the day or afterward.
            </p>
          )}
          <div className="meal-groups">
            {groups.map((group, i) => {
              const entries = foods.filter((f) =>
                  group === "Uncategorized" ? !f.meal : f.meal === group,
                ),
                Icon = [Coffee, Sun, Utensils, Leaf, Utensils][i];
              return (
                <Card key={group} className="meal-group">
                  <div className="meal-group-heading">
                    <span
                      className={`icon-tile ${["peach", "lavender", "sage", "rose", "lavender"][i]}`}
                    >
                      <Icon size={20} />
                    </span>
                    <span>
                      <h3>{group}</h3>
                      <small>
                        {entries.length
                          ? `${Math.round(entries.reduce((n, f) => n + f.calories, 0))} kcal · ${entries.length} ${entries.length === 1 ? "entry" : "entries"}`
                          : "A little something to keep you going"}
                      </small>
                    </span>
                    {group !== "Uncategorized" && (
                      <button
                        className="icon-button add-food-button"
                        aria-label={`Add ${group.toLowerCase()}`}
                        disabled={future}
                        onClick={() => setAdding(group)}
                      >
                        <Plus size={19} />
                      </button>
                    )}
                  </div>
                  {entries.length ? (
                    <div className="food-entries">
                      {entries.map((f) => (
                        <div className="food-entry" key={f.id}>
                          <span>
                            <b>{f.name}</b>
                            <small>
                              {f.servings
                                ? `${f.servings} ${f.servings === 1 ? "serving" : "servings"} · `
                                : ""}
                              {f.protein.toLocaleString(undefined, {
                                maximumFractionDigits: 1,
                              })}
                              g protein
                              {f.carbs !== undefined
                                ? ` · ${f.carbs.toLocaleString(undefined, { maximumFractionDigits: 1 })}g carbs`
                                : ""}
                              {f.fat !== undefined
                                ? ` · ${f.fat.toLocaleString(undefined, { maximumFractionDigits: 1 })}g fat`
                                : ""}
                            </small>
                          </span>
                          <span>
                            {Math.round(f.calories)} <small>kcal</small>
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="meal-empty">
                      Nothing logged yet. A fresh plate of possibilities.
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
        <div className="meal-sidebar">
          <Card className="barcode-entry">
            <span className="icon-tile lilac">
              <Barcode size={26} />
            </span>
            <h2>
              Less typing.
              <br />
              More living.
            </h2>
            <p>
              Scan or enter a packaged food’s barcode to find its nutrition
              label.
            </p>
            <button
              className="secondary"
              disabled={future}
              onClick={() => {
                setOpenScanner(true);
                setAdding("Snacks");
              }}
            >
              <Barcode size={18} /> Scan a barcode <ArrowRight size={15} />
            </button>
            <small>Open Food Facts · always verify the label</small>
          </Card>
          <div className="kind-reminder meal-reminder">
            <Salad size={36} />
            <span>MORE THAN A NUMBER</span>
            <p>
              Some days are balanced.
              <br />
              Some days are birthday cake.
              <br />
              <b>There’s room for both.</b>
            </p>
          </div>
          <Card className="nutrition-history">
            <SectionTitle
              title="Your food journal"
              action={
                <button
                  className="icon-button"
                  aria-label={
                    showHistory
                      ? "Show recent nutrition history"
                      : "Show all nutrition history"
                  }
                  onClick={() => setShowHistory(!showHistory)}
                >
                  <ChevronRight size={17} />
                </button>
              }
            />
            {dates.length ? (
              <div>
                {dates.slice(0, showHistory ? undefined : 5).map((date) => (
                  <button
                    className="nutrition-history-row"
                    key={date}
                    onClick={() => {
                      onSelect(date);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    <span>
                      <b>
                        {formatDay(date, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </b>
                      <small>
                        {state.food.filter((f) => f.date === date).length}{" "}
                        entries
                      </small>
                    </span>
                    <span>
                      {Math.round(
                        state.food
                          .filter((f) => f.date === date)
                          .reduce((n, f) => n + f.calories, 0),
                      )}{" "}
                      kcal
                      <ChevronRight size={14} />
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <Empty icon={<Leaf />} title="A fresh start.">
                Your logged nutrition history will grow here.
              </Empty>
            )}
          </Card>
        </div>
      </div>
      <p className="privacy-note">
        +25 XP for your first meal each day. Targets are editable starting
        points, not a personalized nutrition prescription.
      </p>
      {adding && (
        <FoodLogger
          date={selected}
          meal={adding}
          initialScanner={openScanner}
          onClose={() => {
            setAdding(null);
            setOpenScanner(false);
          }}
          onSave={(food) => {
            commit({ ...state, food: [...state.food, food] });
            setAdding(null);
            setOpenScanner(false);
            notify(
              foods.length
                ? "Meal saved. A little more nourished."
                : "First meal saved · +25 XP",
            );
          }}
        />
      )}
      {editingTargets && (
        <Modal
          title="Your goals, your way"
          eyebrow="DAILY NUTRITION TARGETS"
          onClose={() => setEditingTargets(false)}
        >
          <p className="modal-intro">
            Set targets that suit your needs. These apply to your nutrition
            dashboard on every day; they don’t change your food records.
          </p>
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              const d = new FormData(e.currentTarget);
              const targets = {
                calories: Number(d.get("calories")),
                protein: Number(d.get("protein")),
                carbs: Number(d.get("carbs")),
                fat: Number(d.get("fat")),
              };
              commit({ ...state, targets });
              setEditingTargets(false);
              notify("Your nutrition targets are updated");
            }}
          >
            <div className="form-grid">
              {(
                [
                  {
                    key: "calories",
                    label: "Daily calories (kcal)",
                    max: 10000,
                  },
                  { key: "protein", label: "Daily protein (g)", max: 1000 },
                  { key: "carbs", label: "Daily carbohydrates (g)", max: 2000 },
                  { key: "fat", label: "Daily fat (g)", max: 1000 },
                ] as const
              ).map((f) => (
                <label key={f.key}>
                  {f.label}
                  <input
                    type="number"
                    name={f.key}
                    min="1"
                    max={f.max}
                    required
                    defaultValue={targets[f.key]}
                  />
                </label>
              ))}
            </div>
            <button className="primary">
              Save targets <Check size={18} />
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
function FoodLogger({
  date,
  meal,
  onClose,
  onSave,
  initialScanner = false,
}: {
  date: string;
  meal: MealType;
  initialScanner?: boolean;
  onClose: () => void;
  onSave: (food: Food) => void;
}) {
  const [query, setQuery] = useState(""),
    [name, setName] = useState(""),
    [values, setValues] = useState({
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
    }),
    [servings, setServings] = useState("1"),
    [unit, setUnit] = useState("your label’s serving size"),
    [barcodeOpen, setBarcodeOpen] = useState(initialScanner),
    [code, setCode] = useState(""),
    [status, setStatus] = useState(""),
    [loading, setLoading] = useState(false),
    [scanning, setScanning] = useState(false);
  const video = useRef<HTMLVideoElement>(null),
    stream = useRef<MediaStream | null>(null),
    running = useRef(false),
    scanGeneration = useRef(0),
    abort = useRef<AbortController | null>(null);
  const stop = () => {
    scanGeneration.current += 1;
    running.current = false;
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    setScanning(false);
  };
  useEffect(
    () => () => {
      scanGeneration.current += 1;
      running.current = false;
      stream.current?.getTracks().forEach((t) => t.stop());
      abort.current?.abort();
    },
    [],
  );
  const fill = (food: (typeof foodReferences)[number]) => {
    setName(food.name);
    setValues({
      calories: String(food.calories),
      protein: String(food.protein),
      carbs: String(food.carbs),
      fat: String(food.fat),
    });
    setUnit(food.serving);
    setServings("1");
    setQuery("");
  };
  const lookup = async (barcode = code) => {
    stop();
    if (!/^\d{8,14}$/.test(barcode)) {
      setStatus("Enter an 8–14 digit barcode.");
      return;
    }
    setLoading(true);
    setStatus("Looking up the label…");
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    const timeout = window.setTimeout(
      () => controller.abort(new Error("timeout")),
      15000,
    );
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=product_name,nutriments`,
        { signal: controller.signal },
      );
      if (!response.ok)
        throw new Error(
          "Food lookup is unavailable right now. You can enter the label manually.",
        );
      const result = await response.json();
      if (result.status === 0 || !result.product)
        throw new Error(
          "No match found. You can still enter the label manually.",
        );
      const product = result.product,
        n = product.nutriments || {};
      const number = (key: string) =>
        typeof n[key] === "number" && Number.isFinite(n[key]) && n[key] >= 0
          ? String(Math.round(n[key] * 10) / 10)
          : "";
      setName(product.product_name || "Packaged food");
      setValues({
        calories: number("energy-kcal_100g"),
        protein: number("proteins_100g"),
        carbs: number("carbohydrates_100g"),
        fat: number("fat_100g"),
      });
      setServings("1");
      setUnit("100 g");
      setStatus(
        "Label found. Values are per 100 g. Review them, fill any missing values, and adjust your servings before logging.",
      );
    } catch (error) {
      if (controller.signal.reason?.message === "timeout")
        setStatus(
          "Lookup took too long. Try again or enter the food label manually.",
        );
      else if (!controller.signal.aborted)
        setStatus(
          error instanceof TypeError
            ? "Couldn’t connect to the food database. Try again or enter your label manually."
            : error instanceof Error
              ? error.message
              : "Unable to look up this food. Enter the label manually.",
        );
    } finally {
      window.clearTimeout(timeout);
      if (abort.current === controller) setLoading(false);
    }
  };
  const scan = async () => {
    const detectorClass = (
      window as unknown as {
        BarcodeDetector?: new (options: { formats: string[] }) => {
          detect: (video: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
        };
      }
    ).BarcodeDetector;
    if (!detectorClass || !navigator.mediaDevices?.getUserMedia) {
      setStatus(
        "Live scanning isn’t supported in this browser. Enter the barcode below to look it up.",
      );
      return;
    }
    const generation = ++scanGeneration.current;
    setScanning(true);
    setStatus("Point your camera at the barcode.");
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (scanGeneration.current !== generation) {
        media.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = media;
      if (!video.current) {
        media.getTracks().forEach((t) => t.stop());
        return;
      }
      video.current.srcObject = media;
      await video.current.play();
      if (scanGeneration.current !== generation) {
        media.getTracks().forEach((t) => t.stop());
        return;
      }
      running.current = true;
      const detector = new detectorClass({
        formats: ["ean_13", "ean_8", "upc_a", "upc_e"],
      });
      while (running.current && video.current) {
        const found = await detector.detect(video.current);
        if (!running.current) break;
        if (found.length) {
          setCode(found[0].rawValue);
          await lookup(found[0].rawValue);
          break;
        }
        await new Promise((resolve) => window.setTimeout(resolve, 250));
      }
    } catch {
      if (scanGeneration.current !== generation) return;
      stop();
      setStatus(
        "Camera unavailable or access was declined. Enter your barcode instead.",
      );
    }
  };
  return (
    <Modal
      title="A little nourishment"
      eyebrow={`${meal.toUpperCase()} · ${formatDay(date)}`}
      onClose={onClose}
    >
      <p className="modal-intro">
        Find a familiar food, scan a label, or enter your own. Nothing is logged
        until you save.
      </p>
      <div className="food-search">
        <label htmlFor="food-search">
          <Search size={17} /> Search foods
        </label>
        <input
          id="food-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try banana, yogurt, oatmeal…"
        />
        {query && (
          <div className="food-results">
            <small>REFERENCE FOODS · ESTIMATES PER SERVING</small>
            {foodReferences
              .filter((f) => f.name.toLowerCase().includes(query.toLowerCase()))
              .map((f) => (
                <button key={f.name} onClick={() => fill(f)}>
                  <span>
                    <b>{f.name}</b>
                    <small>
                      {f.serving} · {f.calories} kcal
                    </small>
                  </span>
                  <Plus size={17} />
                </button>
              ))}
            {!foodReferences.some((f) =>
              f.name.toLowerCase().includes(query.toLowerCase()),
            ) && <p>No match in the starter library. Enter your food below.</p>}
          </div>
        )}
      </div>
      <button
        id="barcode-toggle"
        className="barcode-toggle text-button"
        onClick={() => {
          setBarcodeOpen(!barcodeOpen);
          if (barcodeOpen) stop();
        }}
      >
        <Barcode size={17} />
        {barcodeOpen ? "Hide barcode lookup" : "Scan or enter a barcode"}
        <ChevronRight size={15} />
      </button>
      {barcodeOpen && (
        <div className="scan-panel">
          <div className="scan-actions">
            <button
              type="button"
              className="secondary"
              disabled={scanning}
              onClick={scan}
            >
              <Camera size={17} /> Use camera
            </button>
            {scanning && (
              <button
                className="text-button"
                onClick={() => {
                  stop();
                  setStatus("Scan stopped. You can enter a barcode instead.");
                }}
              >
                <X size={16} /> Stop camera
              </button>
            )}
          </div>
          <video ref={video} hidden={!scanning} autoPlay playsInline muted />
          <label>
            Product barcode
            <input
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="8–14 digit UPC or EAN"
            />
          </label>
          <button
            type="button"
            className="secondary"
            disabled={loading}
            onClick={() => lookup()}
          >
            {loading ? "Looking up…" : "Look up barcode"}
            <Search size={16} />
          </button>
          {status && <p role="status">{status}</p>}
          <small>
            Open Food Facts records may be incomplete. Always verify your food
            label.
          </small>
        </div>
      )}
      <form
        className="form-stack food-form"
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget),
            quantity = Number(servings);
          onSave({
            id: crypto.randomUUID(),
            date,
            name: name.trim(),
            calories:
              Math.round(Number(values.calories) * quantity * 100) / 100,
            protein: Math.round(Number(values.protein) * quantity * 100) / 100,
            carbs: Math.round(Number(values.carbs) * quantity * 100) / 100,
            fat: Math.round(Number(values.fat) * quantity * 100) / 100,
            servings: quantity,
            meal: String(data.get("meal")) as MealType,
          });
        }}
      >
        <div className="form-grid">
          <label>
            Meal
            <select name="meal" defaultValue={meal}>
              {mealTypes.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>
          <label>
            Servings
            <input
              type="number"
              min="0.1"
              max="100"
              step="0.1"
              required
              value={servings}
              onChange={(e) => setServings(e.target.value)}
            />
          </label>
        </div>
        <label>
          Food or meal
          <input
            required
            maxLength={100}
            pattern=".*\S.*"
            placeholder="e.g. Greek yogurt & berries"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <p className="serving-label">
          Values below are <b>per serving</b> ({unit}). Reference foods are
          estimates; verify the label for your portion.
        </p>
        <div className="form-grid">
          {(
            [
              { key: "calories", label: "Calories (kcal)", max: 10000 },
              { key: "protein", label: "Protein (g)", max: 1000 },
              { key: "carbs", label: "Carbohydrates (g)", max: 2000 },
              { key: "fat", label: "Fat (g)", max: 1000 },
            ] as const
          ).map((f) => (
            <label key={f.key}>
              {f.label}
              <input
                type="number"
                min="0"
                max={f.max}
                step="0.1"
                required
                placeholder="0"
                value={values[f.key]}
                onChange={(e) =>
                  setValues({ ...values, [f.key]: e.target.value })
                }
              />
            </label>
          ))}
        </div>
        <div className="portion-summary">
          <span>Your portion</span>
          <b>
            {(
              Number(values.calories || 0) * Number(servings || 0)
            ).toLocaleString(undefined, { maximumFractionDigits: 1 })}{" "}
            kcal · {Number(servings || 0)} servings
          </b>
        </div>
        <button className="primary">
          Log meal <Plus size={18} />
        </button>
      </form>
    </Modal>
  );
}
