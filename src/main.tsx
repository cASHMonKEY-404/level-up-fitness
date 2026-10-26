import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  ArrowDownLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Dumbbell,
  Flame,
  Footprints,
  House,
  Plus,
  Sparkles,
  Trophy,
  Utensils,
  X,
  Zap,
} from "lucide-react";
import {
  day,
  loadState,
  xpTotal,
  levelInfo,
  routines,
  type State,
  type Session,
} from "./data";
import "./style.css";
const tabs = [
  { name: "Today", icon: House },
  { name: "Train", icon: Dumbbell },
  { name: "Fuel", icon: Utensils },
  { name: "Progress", icon: Activity },
];
function Bar({ value, max }: { value: number; max: number }) {
  return (
    <div
      className="bar"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <span style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
    </div>
  );
}
function App() {
  const [state, setState] = useState<State>(loadState),
    [tab, setTab] = useState("Today"),
    [active, setActive] = useState<number | null>(null),
    [toast, setToast] = useState(""),
    [storageError, setStorageError] = useState(false);
  const xp = xpTotal(state),
    { level, progress } = levelInfo(xp),
    today = day(),
    steps = state.steps[today] || 0,
    food = state.food.filter((f) => f.date === today),
    trained = state.history.some((h) => h.date === today);
  const commit = (next: State) => {
    try {
      localStorage.setItem("levelup-react-v1", JSON.stringify(next));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
    setState(next);
  };
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 4500);
  };
  const go = (name: string) => {
    setTab(name);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const quests = [
    {
      title: "Show up for yourself",
      desc: "Complete a strength workout",
      xp: 120,
      done: trained,
      icon: Dumbbell,
      action: () => go("Train"),
    },
    {
      title: "Fuel your next level",
      desc: "Log your first meal of the day",
      xp: 25,
      done: food.length > 0,
      icon: Utensils,
      action: () => go("Fuel"),
    },
    {
      title: "Take the scenic route",
      desc: "Reach 8,000 steps today",
      xp: 50,
      done: steps >= 8000,
      icon: Footprints,
      action: () => document.getElementById("steps-input")?.focus(),
    },
  ];
  return (
    <div className="app-shell">
      <aside>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            go("Today");
          }}
        >
          LEVEL UP
          <span>
            <Zap size={21} fill="currentColor" />
          </span>
        </a>
        <div className="sidebar-label">YOUR NEXT CHAPTER</div>
        <nav aria-label="Main navigation">
          {tabs.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={tab === name ? "nav-item active" : "nav-item"}
              onClick={() => go(name)}
              aria-current={tab === name ? "page" : undefined}
            >
              <Icon size={20} />
              <span>{name}</span>
              {tab === name && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="mini-badge">
            <Zap size={18} />
          </div>
          <b>Small steps. Big upgrades.</b>
          <p>
            Your only competition is
            <br />
            who you were yesterday.
          </p>
          <div className="local-label">
            <span /> LOCAL SAVE ENABLED
          </div>
        </div>
      </aside>
      <div className="main-wrap">
        <header>
          <span className="breadcrumb">
            YOUR FITNESS ADVENTURE <ChevronRight size={13} />{" "}
            <b>{tab.toUpperCase()}</b>
          </span>
          <span className="profile">
            <span className="avatar">YOU</span>{" "}
            <span>
              Challenger <small>LEVEL {level}</small>
            </span>
          </span>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <span />{" "}
                {new Date()
                  .toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })
                  .toUpperCase()}
              </div>
              <h1>
                {tab === "Today" ? (
                  <>
                    Your next level <em>starts today.</em>
                  </>
                ) : tab === "Train" ? (
                  <>
                    Put in the work.<em> Find your power.</em>
                  </>
                ) : tab === "Fuel" ? (
                  <>
                    Good fuel.<em> Great adventures.</em>
                  </>
                ) : (
                  <>
                    Every rep.<em> Real progress.</em>
                  </>
                )}
              </h1>
              <p>
                {tab === "Today"
                  ? "A little stronger. A little further. A little more you."
                  : tab === "Train"
                    ? "Your space. Your equipment. Your pace."
                    : tab === "Fuel"
                      ? "Build awareness, one meal at a time."
                      : "See the work you’ve put in. Keep the story going."}
              </p>
            </div>
            <div className="daily-status">
              <Flame size={16} /> LET’S MAKE IT COUNT
            </div>
          </div>
          {storageError && (
            <div role="alert" className="notice">
              Browser storage is unavailable. This session’s changes are in
              memory only; allow storage to keep your progress.
            </div>
          )}
          {tab === "Today" && (
            <>
              <section className="level-card">
                <div className="level-emblem">
                  <Zap size={31} fill="currentColor" />
                  <span>{level}</span>
                </div>
                <div className="level-content">
                  <div className="flex justify-between items-center">
                    <span className="eyebrow">
                      LEVEL {level} <span className="divider">/</span>{" "}
                      CHALLENGER
                    </span>
                    <span className="xp-label">
                      {progress} <span>/ 500 XP</span>
                    </span>
                  </div>
                  <h2>Your origin story is in motion.</h2>
                  <Bar value={progress} max={500} />
                  <div className="flex justify-between">
                    <small>
                      {500 - progress} XP to level {level + 1}
                    </small>
                    <small>Every effort counts.</small>
                  </div>
                </div>
                <Sparkles className="level-sparkle" size={48} />
              </section>
              <div className="dashboard-grid">
                <div>
                  <div className="section-heading">
                    <h2>Today’s mission</h2>
                    <span className="tag">RECOMMENDED</span>
                  </div>
                  <section className="mission">
                    <div className="mission-art" aria-hidden="true">
                      <div className="orb" />
                      <Dumbbell size={150} strokeWidth={1} />
                      <span>01 / BUILD YOUR FOUNDATION</span>
                    </div>
                    <div className="mission-body">
                      <div className="eyebrow lime">STRENGTH · FULL BODY</div>
                      <h2>
                        Full body
                        <br />
                        foundations
                      </h2>
                      <p>
                        A little of everything.
                        <br />A stronger you.
                      </p>
                      <div className="mission-meta">
                        <span>25 min</span>
                        <span>4 exercises</span>
                        <span className="lime">+120 XP</span>
                      </div>
                      <button className="primary" onClick={() => setActive(0)}>
                        Start workout <ArrowRight size={18} />
                      </button>
                      <small>
                        Suggested routine · log only what you complete
                      </small>
                    </div>
                  </section>
                  <div className="section-heading">
                    <h2>
                      Daily quests{" "}
                      <span className="count">
                        {quests.filter((q) => q.done).length}/3
                      </span>
                    </h2>
                    <span className="muted text-xs">
                      A fresh start, every day
                    </span>
                  </div>
                  <section className="quest-list">
                    {quests.map((q) => (
                      <button
                        className={`quest ${q.done ? "done" : ""}`}
                        key={q.title}
                        onClick={q.action}
                      >
                        <span className="quest-icon">
                          {q.done ? <Check size={20} /> : <q.icon size={20} />}
                        </span>
                        <span className="quest-copy">
                          <b>{q.title}</b>
                          <small>{q.desc}</small>
                        </span>
                        <span className="quest-xp">
                          {q.done ? "COMPLETE" : `+${q.xp} XP`}
                        </span>
                        <ChevronRight size={16} />
                      </button>
                    ))}
                  </section>
                </div>
                <div className="right-column">
                  <section className="panel steps">
                    <div className="flex justify-between">
                      <h2>Keep moving</h2>
                      <Footprints size={19} className="muted" />
                    </div>
                    <div
                      className="step-ring"
                      style={
                        {
                          "--angle": `${Math.min(1, steps / 8000) * 360}deg`,
                        } as React.CSSProperties
                      }
                    >
                      <div>
                        <Footprints size={24} />
                        <strong>{steps.toLocaleString()}</strong>
                        <span>of 8,000 steps</span>
                      </div>
                    </div>
                    <div className="step-caption">
                      <span className="lime">
                        {Math.round((steps / 8000) * 100)}% of your goal
                      </span>
                      <span>+50 XP at goal</span>
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const n = Number(
                          new FormData(e.currentTarget).get("steps"),
                        );
                        commit({
                          ...state,
                          steps: { ...state.steps, [today]: n },
                        });
                        notify("Today’s step total updated");
                      }}
                      className="step-form"
                    >
                      <label className="sr-only" htmlFor="steps-input">
                        Today’s total steps
                      </label>
                      <input
                        id="steps-input"
                        name="steps"
                        type="number"
                        min="0"
                        max="100000"
                        required
                        placeholder="Today’s total steps"
                      />
                      <button aria-label="Save step total">
                        <Check size={18} />
                      </button>
                    </form>
                    <small className="muted">
                      Manual daily total · no device sync
                    </small>
                  </section>
                  <section className="panel fuel-card">
                    <span className="icon-square">
                      <Utensils size={21} />
                    </span>
                    <h2>Fuel the adventure.</h2>
                    <p>
                      Your next level needs good fuel.
                      <br />
                      Make your first meal count.
                    </p>
                    <div className="fuel-stat">
                      <b>
                        {food
                          .reduce((n, f) => n + f.calories, 0)
                          .toLocaleString()}{" "}
                        <small>kcal logged</small>
                      </b>
                      <span>{food.length} meals</span>
                    </div>
                    <button className="secondary" onClick={() => go("Fuel")}>
                      Log nutrition <Plus size={17} />
                    </button>
                  </section>
                  <div className="quote">
                    <span>“</span>Progress is built in the small
                    <br />
                    things you do every day.
                  </div>
                </div>
              </div>
            </>
          )}
          {tab === "Train" && (
            <>
              <div className="section-heading">
                <h2>Your workout library</h2>
                <span className="tag">HOME EDITION</span>
              </div>
              <div className="library">
                {routines.map((r, i) => (
                  <section className="panel routine" key={r.name}>
                    <div className="routine-symbol">
                      <Dumbbell size={46} />
                      <span>0{i + 1}</span>
                    </div>
                    <div className="eyebrow lime">{r.tag}</div>
                    <h2>{r.name}</h2>
                    <p>{r.detail}</p>
                    <span className="muted text-sm">
                      {r.minutes} min suggested · {r.exercises.length} exercises
                    </span>
                    <ul>
                      {r.exercises.map((e) => (
                        <li key={e[0]}>
                          {e[0]}
                          <small>{e[1]}</small>
                        </li>
                      ))}
                    </ul>
                    <button className="primary" onClick={() => setActive(i)}>
                      Start workout <ArrowRight size={18} />
                    </button>
                  </section>
                ))}
              </div>
              <p className="footnote">
                Suggested routines, not tracked sessions. Start comfortably, use
                controlled movement, and stop if you feel pain. Default
                suggestion: 2 sets of 12 reps; adjust to your ability.
              </p>
            </>
          )}
          {tab === "Fuel" && (
            <div className="two-col">
              <section className="panel">
                <div className="eyebrow lime">MANUAL NUTRITION TRACKING</div>
                <h2 className="mt-3">What’s on the menu?</h2>
                <p>Enter values from your food label or your own estimate.</p>
                <form
                  className="food-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget,
                      data = new FormData(form);
                    commit({
                      ...state,
                      food: [
                        ...state.food,
                        {
                          id: crypto.randomUUID(),
                          date: today,
                          name: String(data.get("name")).trim(),
                          calories: Number(data.get("calories")),
                          protein: Number(data.get("protein")),
                        },
                      ],
                    });
                    form.reset();
                    notify(
                      food.length
                        ? "Meal logged"
                        : "First meal logged. +25 XP!",
                    );
                  }}
                >
                  <label>
                    Food or meal
                    <input
                      name="name"
                      required
                      maxLength={100}
                      pattern=".*\S.*"
                      placeholder="e.g. Greek yogurt & berries"
                    />
                  </label>
                  <div className="two-col">
                    <label>
                      Calories (kcal)
                      <input
                        name="calories"
                        type="number"
                        min="0"
                        max="10000"
                        step="1"
                        required
                        placeholder="0"
                      />
                    </label>
                    <label>
                      Protein (g)
                      <input
                        name="protein"
                        type="number"
                        min="0"
                        max="1000"
                        step="0.1"
                        required
                        placeholder="0"
                      />
                    </label>
                  </div>
                  <button className="primary">
                    Log meal <Plus size={18} />
                  </button>
                </form>
                <small className="muted">
                  +25 XP for the first meal each day. No sample meals added.
                </small>
              </section>
              <section className="panel">
                <h2>Today’s food log</h2>
                <div className="nutrition-totals">
                  <div>
                    <strong>{food.reduce((n, f) => n + f.calories, 0)}</strong>
                    <small>kcal logged</small>
                  </div>
                  <div>
                    <strong>
                      {food.reduce((n, f) => n + f.protein, 0).toFixed(1)}g
                    </strong>
                    <small>protein</small>
                  </div>
                </div>
                {food.length ? (
                  food.map((f) => (
                    <div className="history-row" key={f.id}>
                      <span>
                        <b>{f.name}</b>
                        <small>{f.protein}g protein</small>
                      </span>
                      <span>{f.calories} kcal</span>
                    </div>
                  ))
                ) : (
                  <Empty
                    icon={<Utensils />}
                    text="Your plate, your story."
                    detail="Log a meal to start tracking today’s nutrition."
                  />
                )}
              </section>
            </div>
          )}
          {tab === "Progress" && (
            <>
              <div className="stats-grid">
                {[
                  ["Current level", level],
                  ["Total XP earned", xp],
                  ["Workouts completed", state.history.length],
                ].map(([label, value]) => (
                  <section className="panel" key={label}>
                    <small className="eyebrow">{label}</small>
                    <strong className="stat-number">{value}</strong>
                  </section>
                ))}
              </div>
              <div className="two-col mt-6">
                <section className="panel">
                  <h2>Workout history</h2>
                  {state.history.length ? (
                    [...state.history].reverse().map((h) => (
                      <details key={h.id} className="history-detail">
                        <summary>
                          <span>
                            <b>{h.name}</b>
                            <small>
                              {h.date} ·{" "}
                              {h.exercises.reduce(
                                (n, e) => n + e.sets.length,
                                0,
                              )}{" "}
                              sets
                            </small>
                          </span>
                          <span className="lime">+{h.xp} XP</span>
                        </summary>
                        {h.exercises.map((e, i) => (
                          <div className="history-sets" key={i}>
                            <b>{e.name}</b>
                            <p>
                              {e.sets
                                .map(
                                  (s, j) =>
                                    `Set ${j + 1}: ${s.reps} reps × ${s.weight} lb`,
                                )
                                .join(" · ")}
                            </p>
                          </div>
                        ))}
                      </details>
                    ))
                  ) : (
                    <Empty
                      icon={<Dumbbell />}
                      text="Your first chapter awaits."
                      detail="Finish a workout to see your real progress here."
                    />
                  )}
                </section>
                <section className="panel">
                  <h2>Milestones</h2>
                  {[
                    {
                      name: "First chapter",
                      desc: "Complete your first workout",
                      earned: state.history.length > 0,
                    },
                    {
                      name: "Finding your rhythm",
                      desc: "Complete 5 workouts",
                      earned: state.history.length >= 5,
                    },
                    {
                      name: "Level unlocked",
                      desc: "Reach level 2",
                      earned: level >= 2,
                    },
                  ].map((b) => (
                    <div
                      className={`achievement ${b.earned ? "earned" : ""}`}
                      key={b.name}
                    >
                      <Trophy size={26} />
                      <div>
                        <b>{b.name}</b>
                        <small>
                          {b.desc} · {b.earned ? "Unlocked" : "Locked"}
                        </small>
                      </div>
                    </div>
                  ))}
                </section>
              </div>
              <div className="notice mt-6">
                Your progress stays in this browser on this device. No account
                or cloud backup yet. Clearing browser storage removes your data.
                Workout XP: 120 per completed session; nutrition: 25 per day;
                step goal: 50 per qualifying day.
              </div>
            </>
          )}
          <footer>
            <span>
              <Zap size={13} /> BUILT ONE DAY AT A TIME.
            </span>
            <span>YOUR JOURNEY. YOUR PACE.</span>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          {toast}
        </div>
      )}
      {active !== null && (
        <Workout
          index={active}
          onClose={() => setActive(null)}
          onFinish={(session) => {
            commit({ ...state, history: [...state.history, session] });
            setActive(null);
            go("Progress");
            notify("Workout complete. +120 XP earned!");
          }}
        />
      )}
    </div>
  );
}
function Empty({
  icon,
  text,
  detail,
}: {
  icon: React.ReactNode;
  text: string;
  detail: string;
}) {
  return (
    <div className="empty">
      {icon}
      <b>{text}</b>
      <p>{detail}</p>
    </div>
  );
}
function Workout({
  index,
  onClose,
  onFinish,
}: {
  index: number;
  onClose: () => void;
  onFinish: (s: Session) => void;
}) {
  const r = routines[index];
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  const [sets, setSets] = useState(
    r.exercises.map((e) => [
      { reps: "12", weight: String(e[2]), done: false },
      { reps: "12", weight: String(e[2]), done: false },
    ]),
  );
  const [error, setError] = useState("");
  const update = (
    i: number,
    j: number,
    key: "reps" | "weight" | "done",
    value: string | boolean,
  ) =>
    setSets((old) =>
      old.map((group, ei) =>
        ei === i
          ? group.map((s, si) => (si === j ? { ...s, [key]: value } : s))
          : group,
      ),
    );
  return (
    <div className="modal-backdrop">
      <section
        className="workout-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="workout-title"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            if (
              window.confirm(
                "Leave this workout? Unsaved sets will be discarded.",
              )
            )
              onClose();
          }
          if (e.key === "Tab") {
            const elements = Array.from(
              e.currentTarget.querySelectorAll<HTMLElement>(
                'button, input, [tabindex="0"]',
              ),
            );
            const first = elements[0],
              last = elements[elements.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last?.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first?.focus();
            }
          }
        }}
      >
        <div className="modal-head">
          <div>
            <div className="eyebrow lime">YOUR ACTIVE MISSION</div>
            <h2 id="workout-title">{r.name}</h2>
          </div>
          <button
            autoFocus
            className="close"
            aria-label="Close workout"
            onClick={() => {
              if (
                window.confirm(
                  "Leave this workout? Unsaved sets will be discarded.",
                )
              )
                onClose();
            }}
          >
            <X />
          </button>
        </div>
        <p>
          Record your actual reps and weight, then check off each completed set.
          Unchecked sets won’t be saved.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const exercises = r.exercises
              .map((ex, i) => ({
                name: ex[0],
                sets: sets[i]
                  .filter((s) => s.done)
                  .map((s) => ({
                    reps: Number(s.reps),
                    weight: Number(s.weight),
                  })),
              }))
              .filter((e) => e.sets.length);
            if (!exercises.length) {
              setError("Check off at least one completed set to finish.");
              return;
            }
            onFinish({
              id: crypto.randomUUID(),
              date: day(),
              name: r.name,
              exercises,
              xp: 120,
            });
          }}
        >
          {r.exercises.map((ex, i) => (
            <div className="exercise" key={ex[0]}>
              <h3>
                <span>0{i + 1}</span>
                {ex[0]}
              </h3>
              <small className="muted">{ex[1]}</small>
              <div className="set-head">
                <span>SET</span>
                <span>REPS</span>
                <span>WEIGHT (LB)</span>
                <span>DONE</span>
              </div>
              {sets[i].map((s, j) => (
                <div className={`set-row ${s.done ? "completed" : ""}`} key={j}>
                  <span>{j + 1}</span>
                  <input
                    aria-label={`${ex[0]} set ${j + 1} reps`}
                    type="number"
                    min="1"
                    max="500"
                    required
                    step="1"
                    value={s.reps}
                    onChange={(e) => update(i, j, "reps", e.target.value)}
                  />
                  <input
                    aria-label={`${ex[0]} set ${j + 1} weight in pounds`}
                    type="number"
                    min="0"
                    max="1000"
                    step="0.5"
                    required
                    value={s.weight}
                    onChange={(e) => update(i, j, "weight", e.target.value)}
                  />
                  <input
                    type="checkbox"
                    aria-label={`${ex[0]} set ${j + 1} completed`}
                    checked={s.done}
                    onChange={(e) => update(i, j, "done", e.target.checked)}
                  />
                </div>
              ))}
              <button
                type="button"
                className="add-set"
                onClick={() =>
                  setSets((old) =>
                    old.map((g, n) =>
                      n === i
                        ? [
                            ...g,
                            { reps: "12", weight: String(ex[2]), done: false },
                          ]
                        : g,
                    ),
                  )
                }
              >
                <Plus size={14} /> Add set
              </button>
            </div>
          ))}
          {error && (
            <p role="alert" className="lime">
              {error}
            </p>
          )}
          <button className="primary finish">
            Finish workout{" "}
            <span>
              +120 XP <ArrowDownLeft size={16} />
            </span>
          </button>
        </form>
      </section>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
