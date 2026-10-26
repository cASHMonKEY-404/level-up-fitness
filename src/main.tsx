import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Dumbbell,
  Flower2,
  Footprints,
  House,
  Leaf,
  Play,
  Plus,
  Settings2,
  ShieldCheck,
  Sparkles,
  Sun,
  Trophy,
  Utensils,
  UserRound,
} from "lucide-react";
import {
  day,
  formatDay,
  weekDays,
  loadState,
  xpTotal,
  levelInfo,
  routines,
  planFor,
  exerciseGuides,
  type State,
  type Session,
  type Plan,
} from "./data";
import {
  Badge,
  Bar,
  Calendar,
  Card,
  History,
  Modal,
  Ring,
  SectionTitle,
  WorkoutArt,
} from "./components";
import { Meal } from "./meal";
import "./style.css";

type Tab = "Home" | "Workout" | "Meal";
type Update = (next: State) => void;
const tabs = [
  { name: "Home" as Tab, icon: House },
  { name: "Workout" as Tab, icon: Dumbbell },
  { name: "Meal" as Tab, icon: Utensils },
];
function App() {
  const [state, setState] = useState<State>(loadState),
    [tab, setTab] = useState<Tab>("Home"),
    [selected, setSelected] = useState(day),
    [active, setActive] = useState<{ index: number; date: string } | null>(
      null,
    ),
    [toast, setToast] = useState(""),
    [storageError, setStorageError] = useState(false),
    [profile, setProfile] = useState(false);
  const [today, setToday] = useState(day);
  useEffect(() => {
    const timer = window.setInterval(() => setToday(day()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);
  const xp = xpTotal(state),
    { level, progress } = levelInfo(xp);
  const commit: Update = (next) => {
    try {
      localStorage.setItem("levelup-react-v1", JSON.stringify(next));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
    setState(next);
  };
  const go = (name: Tab, date?: string) => {
    if (date) setSelected(date);
    setTab(name);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            go("Home");
          }}
        >
          <span className="brand-mark">
            <Flower2 size={28} />
          </span>
          <span>
            level up<span className="brand-period">.</span>
            <small>A LITTLE BETTER, EVERY DAY</small>
          </span>
        </a>
        <span className="sidebar-caption">YOUR WELLNESS SPACE</span>
        <nav aria-label="Main navigation">
          {tabs.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={`nav-item ${tab === name ? "active" : ""}`}
              aria-current={tab === name ? "page" : undefined}
              onClick={() => go(name)}
            >
              <Icon size={21} />
              <span>{name}</span>
              {tab === name && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <div className="note-flower">
            <Flower2 size={40} />
          </div>
          <h3>
            A little progress.
            <br />A lot of possibility.
          </h3>
          <p>
            Make space for the version
            <br />
            of you that’s growing.
          </p>
          <span>
            <ShieldCheck size={13} />
            {storageError ? "Saving unavailable" : "Saved on your device"}
          </span>
        </div>
        <button className="sidebar-profile" onClick={() => setProfile(true)}>
          <span className="avatar">
            {(state.name || "Challenger").slice(0, 1).toUpperCase()}
          </span>
          <span>
            <b>{state.name || "Challenger"}</b>
            <small>Level {level} · growing stronger</small>
          </span>
          <Settings2 size={16} />
        </button>
      </aside>
      <div className="main-wrap">
        <header className="topbar">
          <span className="topbar-title">
            Your space to <em>grow.</em>
          </span>
          <a
            className="mobile-brand"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              go("Home");
            }}
          >
            <Flower2 size={25} /> level up.
          </a>
          <div className="topbar-right">
            <span className="save-status">
              <span /> {storageError ? "Not saved" : "Saved locally"}
            </span>
            <span className="topbar-divider" />
            <button
              className="profile-button"
              onClick={() => setProfile(true)}
              aria-label="Edit your profile"
            >
              <span className="avatar">
                <UserRound size={19} />
              </span>
              <span>
                {state.name || "Challenger"}
                <small>Level {level}</small>
              </span>
              <ChevronRight size={14} />
            </button>
          </div>
        </header>
        <main>
          {storageError && (
            <div role="alert" className="notice">
              Browser storage is unavailable. Changes are in memory only until
              storage is allowed.
            </div>
          )}
          {tab === "Home" && (
            <Home
              state={state}
              today={today}
              xp={xp}
              level={level}
              progress={progress}
              commit={commit}
              go={go}
              start={(index) => setActive({ index, date: today })}
              notify={setToast}
            />
          )}
          {tab === "Workout" && (
            <WorkoutPage
              state={state}
              selected={selected}
              onSelect={setSelected}
              commit={commit}
              start={(index) => setActive({ index, date: selected })}
              notify={setToast}
            />
          )}
          {tab === "Meal" && (
            <Meal
              state={state}
              selected={selected}
              onSelect={setSelected}
              commit={commit}
              notify={setToast}
            />
          )}
          <footer>
            <span>
              <Flower2 size={14} /> Small steps. Lasting change.
            </span>
            <span>Made for your everyday.</span>
          </footer>
        </main>
      </div>
      {profile && (
        <Modal
          title="Make yourself at home"
          eyebrow="YOUR SPACE"
          onClose={() => setProfile(false)}
        >
          <p className="modal-intro">What would you like us to call you?</p>
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              const name = String(
                new FormData(e.currentTarget).get("name"),
              ).trim();
              commit({ ...state, name });
              setProfile(false);
              setToast("Your profile is updated");
            }}
          >
            <label>
              Your name
              <input
                name="name"
                maxLength={30}
                required
                pattern=".*\S.*"
                defaultValue={state.name || "Challenger"}
              />
            </label>
            <button className="primary">
              Save profile <Check size={18} />
            </button>
          </form>
        </Modal>
      )}
      {active && (
        <WorkoutLogger
          index={active.index}
          date={active.date}
          onClose={() => setActive(null)}
          onFinish={(session) => {
            commit({ ...state, history: [...state.history, session] });
            setActive(null);
            go("Home");
            setToast("A little stronger. Workout saved · +120 XP");
          }}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          <span>
            <Check size={17} />
          </span>
          {toast}
        </div>
      )}
    </div>
  );
}
function Home({
  state,
  today,
  xp,
  level,
  progress,
  commit,
  go,
  start,
  notify,
}: {
  state: State;
  today: string;
  xp: number;
  level: number;
  progress: number;
  commit: Update;
  go: (tab: Tab, date?: string) => void;
  start: (i: number) => void;
  notify: (s: string) => void;
}) {
  const [allHistory, setAllHistory] = useState(false);
  const steps = state.steps[today] || 0,
    food = state.food.filter((f) => f.date === today),
    trained = state.history.some((h) => h.date === today),
    plan = planFor(state, today),
    index = plan.routine ?? 0,
    routine = routines[index];
  const goals = [
    {
      title: "Move your body",
      detail: "Complete a workout",
      done: trained,
      icon: Dumbbell,
      xp: 120,
      action: () => go("Workout", today),
    },
    {
      title: "Nourish yourself",
      detail: "Log your first meal",
      done: food.length > 0,
      icon: Utensils,
      xp: 25,
      action: () => go("Meal", today),
    },
    {
      title: "Take it in stride",
      detail: "Reach 8,000 steps",
      done: steps >= 8000,
      icon: Footprints,
      xp: 50,
      action: () => document.getElementById("steps-input")?.focus(),
    },
  ];
  const badges = [
    {
      title: "First chapter",
      desc: "Complete your first workout",
      value: state.history.length,
      max: 1,
    },
    {
      title: "Finding your rhythm",
      desc: "Complete 5 workouts",
      value: state.history.length,
      max: 5,
    },
    { title: "A new kind of you", desc: "Reach level 2", value: xp, max: 500 },
  ];
  const hour = new Date().getHours();
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <Sun size={15} /> YOUR DAILY DOSE OF FEEL-GOOD
          </div>
          <h1>
            Good {hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening"},{" "}
            <span className="greeting-name">
              {state.name || "Challenger"}{" "}
              <span className="greeting-spark">✧</span>
            </span>
          </h1>
          <p>Let’s make a little room for a stronger, happier you.</p>
        </div>
        <span className="date-chip">
          <CalendarDays size={16} />
          {formatDay(today, {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
      <div className="home-layout">
        <div className="home-main">
          <section className="featured-workout">
            <div className="featured-copy">
              <span className="pill">
                <Sparkles size={13} />{" "}
                {plan.routine === null
                  ? "A little movement, if you feel like it"
                  : "PICKED FOR YOU"}
              </span>
              <h2>{routine.name}</h2>
              <p>
                {routine.detail}
                <br />
                Your next little win is waiting.
              </p>
              <div className="workout-meta">
                <span>
                  <Clock3 size={14} />
                  {routine.minutes} min
                </span>
                <span>
                  <Dumbbell size={14} />
                  {routine.exercises.length} exercises
                </span>
                <span>+120 XP</span>
              </div>
              <button className="primary" onClick={() => start(index)}>
                Start workout <ArrowRight size={17} />
              </button>
              <small>Suggested routine · only completed sets are tracked</small>
            </div>
            <WorkoutArt variant={index} />
            <span className="featured-dots">
              <i />
              <i />
              <i />
            </span>
          </section>
          <Card className="activity-card">
            <SectionTitle
              title="A little movement goes a long way"
              subtitle="Your daily activity"
              action={
                <span className="icon-tile peach">
                  <Footprints size={22} />
                </span>
              }
            />
            <div className="activity-content">
              <Ring value={steps} max={8000} className="steps-ring">
                <Footprints size={24} />
                <strong>{steps.toLocaleString()}</strong>
                <small>of 8,000 steps</small>
              </Ring>
              <div className="activity-details">
                <span className="soft-label">ONE STEP AT A TIME</span>
                <h3>
                  {steps >= 8000
                    ? "Look at you go!"
                    : steps > 0
                      ? "You’re finding your stride."
                      : "Every step is a fresh start."}
                </h3>
                <p>
                  {steps >= 8000
                    ? "Your daily step goal is complete. +50 XP earned."
                    : "A short walk counts. So does a little dance break."}
                </p>
                <form
                  className="step-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const stepsValue = Number(
                      new FormData(e.currentTarget).get("steps"),
                    );
                    commit({
                      ...state,
                      steps: { ...state.steps, [today]: stepsValue },
                    });
                    notify("Today’s step total updated");
                  }}
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
                    step="1"
                    required
                    placeholder="Enter today’s total steps"
                  />
                  <button aria-label="Save step total">
                    <Check size={20} />
                  </button>
                </form>
                <small className="muted">
                  Manual daily total · no device sync
                </small>
              </div>
            </div>
          </Card>
          <Card className="schedule-overview">
            <SectionTitle
              title="Your week, at a glance"
              subtitle="A little structure. Plenty of flexibility."
              action={
                <button
                  className="text-button"
                  onClick={() => go("Workout", today)}
                >
                  View plan <ArrowRight size={15} />
                </button>
              }
            />
            <Calendar
              selected={today}
              onSelect={(d) => go("Workout", d)}
              completed={state.history.map((h) => h.date)}
              planned={weekDays(today).filter(
                (d) => planFor(state, d).routine !== null,
              )}
              compact
            />
            <div className="schedule-note">
              <span className="icon-tile small lilac">
                <Dumbbell size={17} />
              </span>
              <span>
                {plan.routine === null
                  ? "Today is a gentle recovery day"
                  : `Up today: ${routine.name}`}
                <small>
                  {plan.routine === null
                    ? "Rest is part of getting stronger."
                    : `${routine.minutes} min · your home equipment`}
                </small>
              </span>
              <span className="suggestion-label">
                {state.schedule?.[today] ? "Your plan" : "Suggested plan"}
              </span>
            </div>
          </Card>
        </div>
        <div className="home-side">
          <Card className="level-card">
            <div className="level-card-heading">
              <span className="icon-tile lilac">
                <Sparkles size={23} />
              </span>
              <span className="pill subtle">YOUR JOURNEY</span>
            </div>
            <p className="soft-label">GROWING AT YOUR OWN PACE</p>
            <h2>
              Level {level}
              <span>Challenger</span>
            </h2>
            <div className="xp-heading">
              <span>{progress} / 500 XP</span>
              <small>{xp.toLocaleString()} total XP</small>
            </div>
            <Bar value={progress} max={500} label="Level XP progress" />
            <p>{500 - progress} XP to your next chapter.</p>
          </Card>
          <Card className="daily-goals">
            <SectionTitle
              title="Little wins, today"
              action={
                <span className="count-chip">
                  {goals.filter((g) => g.done).length}/3
                </span>
              }
            />
            <p className="card-subtitle">Good habits. No pressure.</p>
            <div>
              {goals.map((g) => (
                <button
                  className={`goal-row ${g.done ? "done" : ""}`}
                  key={g.title}
                  onClick={g.action}
                >
                  <span className="goal-check">
                    {g.done ? <Check size={16} /> : <g.icon size={17} />}
                  </span>
                  <span>
                    <b>{g.title}</b>
                    <small>{g.detail}</small>
                  </span>
                  <em>{g.done ? "Done" : `+${g.xp}`}</em>
                </button>
              ))}
            </div>
          </Card>
          <div className="kind-reminder">
            <Flower2 size={35} />
            <span>YOUR FRIENDLY REMINDER</span>
            <p>
              You don’t have to do it all.
              <br />
              <b>Just a little, for yourself.</b>
            </p>
            <i>✧</i>
          </div>
        </div>
      </div>
      <SectionTitle
        title="Small wins worth celebrating"
        subtitle="Your milestones, at your pace."
        action={
          <span className="pill white">
            <Trophy size={13} /> {badges.filter((b) => b.value >= b.max).length}{" "}
            of 3 unlocked
          </span>
        }
      />
      <div className="achievement-grid">
        {badges.map((b, i) => (
          <Card
            key={b.title}
            className={`achievement-card ${b.value >= b.max ? "unlocked" : ""}`}
          >
            <Badge kind={i} earned={b.value >= b.max} />
            <div>
              <span className="soft-label">
                {b.value >= b.max ? "WELL EARNED" : "A LITTLE CLOSER"}
              </span>
              <h3>{b.title}</h3>
              <p>{b.desc}</p>
              <Bar
                value={b.value}
                max={b.max}
                label={`${b.title} progress`}
                tone={i === 1 ? "peach" : i === 2 ? "sage" : "lavender"}
              />
              <small>
                {b.value >= b.max
                  ? "Unlocked — this one’s yours."
                  : `${Math.min(b.value, b.max)} / ${b.max} ${i === 2 ? "XP" : "workouts"}`}
              </small>
            </div>
          </Card>
        ))}
      </div>
      <Card className="recent-card">
        <SectionTitle
          title="Look how far you’ve come"
          subtitle="Your workout history · all real, all you."
          action={
            state.history.length > 3 ? (
              <button
                className="text-button"
                onClick={() => setAllHistory(!allHistory)}
              >
                {allHistory ? "Show recent" : "View all"}{" "}
                <ChevronRight size={15} />
              </button>
            ) : (
              <span className="count-chip">
                {state.history.length} workouts
              </span>
            )
          }
        />
        <History history={state.history} limit={allHistory ? undefined : 3} />
      </Card>
      <p className="privacy-note">
        <ShieldCheck size={14} /> Your progress is saved in this browser. No
        account or cloud backup yet.
      </p>
    </>
  );
}
function WorkoutPage({
  state,
  selected,
  onSelect,
  commit,
  start,
  notify,
}: {
  state: State;
  selected: string;
  onSelect: (d: string) => void;
  commit: Update;
  start: (i: number) => void;
  notify: (s: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const plan = planFor(state, selected),
    routine = plan.routine === null ? null : routines[plan.routine],
    completed = state.history.filter((h) => h.date === selected),
    future = selected > day();
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <Dumbbell size={15} /> YOUR MOVEMENT PRACTICE
          </div>
          <h1>A little stronger, every day.</h1>
          <p>Make a plan that moves with you. There’s room to be flexible.</p>
        </div>
        <span className="date-chip">
          <Leaf size={16} /> Home equipment
        </span>
      </div>
      <Card className="calendar-card">
        <SectionTitle
          title="Your weekly rhythm"
          subtitle="Choose a day to see what’s ahead."
          action={
            <span className="pill subtle">
              {state.history.length} workouts completed
            </span>
          }
        />
        <Calendar
          selected={selected}
          onSelect={onSelect}
          completed={state.history.map((h) => h.date)}
          planned={weekDays(selected).filter(
            (d) => planFor(state, d).routine !== null,
          )}
        />
      </Card>
      <div className="section-title day-section-title">
        <div>
          <h2>
            {selected === day()
              ? "Today"
              : formatDay(selected, {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
            ’s movement
          </h2>
          <p>
            {completed.length
              ? "You showed up. That matters."
              : state.schedule?.[selected]
                ? "Your plan, your pace."
                : "A suggested plan. Adjust it to make it yours."}
          </p>
        </div>
        <button className="secondary" onClick={() => setEditing(true)}>
          <Settings2 size={16} /> Edit plan
        </button>
      </div>
      {routine ? (
        <section className="workout-detail-card">
          <div className="workout-detail-art">
            <WorkoutArt variant={plan.routine!} />
            <span className="pill white">{routine.tag.toLowerCase()}</span>
          </div>
          <div className="workout-detail-copy">
            <span className="eyebrow">
              {completed.length ? (
                <>
                  <Check size={14} /> WORKOUT LOGGED
                </>
              ) : (
                <>
                  <Sparkles size={14} /> YOUR DAILY RECOMMENDATION
                </>
              )}
            </span>
            <h2>{routine.name}</h2>
            <p>{routine.detail}</p>
            <div className="workout-meta">
              <span>
                <Clock3 size={15} />
                {routine.minutes} min suggested
              </span>
              <span>
                <Dumbbell size={15} />
                {routine.exercises.length} exercises
              </span>
            </div>
            <div className="equipment-tags">
              <span>At home</span>
              <span>2 × 12 suggested</span>
              <span>+120 XP</span>
            </div>
            {plan.note && <p className="plan-note">Your note: {plan.note}</p>}
            <div className="workout-actions">
              <button
                className="primary"
                disabled={future}
                onClick={() => start(plan.routine!)}
              >
                {future
                  ? "Planned for " + formatDay(selected)
                  : completed.length
                    ? "Log another workout"
                    : "Start workout"}
                {!future && <Play size={16} />}
              </button>
              <button
                className="icon-button"
                aria-label="Swap or reschedule workout"
                onClick={() => setEditing(true)}
              >
                <CalendarDays size={20} />
              </button>
            </div>
            {future && (
              <small className="muted">
                Plan ahead now. Log completed sets on the day or afterward.
              </small>
            )}
          </div>
        </section>
      ) : (
        <Card className="rest-card">
          <div className="rest-art">
            <Flower2 size={64} />
            <span>✧</span>
          </div>
          <div>
            <span className="eyebrow">A LITTLE ROOM TO REST</span>
            <h2>Recovery looks good on you.</h2>
            <p>
              A walk, a stretch, or simply a slower day. Rest is part of your
              progress.
            </p>
            <button className="secondary" onClick={() => setEditing(true)}>
              <Plus size={16} /> Add a workout
            </button>
          </div>
        </Card>
      )}
      {routine && (
        <Card className="exercise-preview">
          <SectionTitle
            title="Meet your movements"
            subtitle="Simple guidance to help you feel confident. Tap to explore."
          />
          {routine.exercises.map((e, i) => (
            <details className="exercise-guide" key={e[0]}>
              <summary>
                <span className="exercise-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <b>{e[0]}</b>
                  <small>{e[1]}</small>
                </span>
                <span className="guide-label">
                  <Play size={13} /> How to
                </span>
                <ChevronRight size={16} />
              </summary>
              <Guide name={e[0]} />
            </details>
          ))}
        </Card>
      )}
      {completed.length > 0 && (
        <Card className="recent-card">
          <SectionTitle
            title="Your completed sessions"
            subtitle={`${formatDay(selected)} · saved set by set`}
          />
          <History history={completed} />
        </Card>
      )}
      <SectionTitle
        title="Find your kind of strong"
        subtitle="Three simple routines for the equipment you already have."
      />
      <div className="workout-library">
        {routines.map((r, i) => (
          <Card className="routine-card" key={r.name}>
            <div className={`routine-thumbnail tone-${i}`}>
              <WorkoutArt variant={i} />
              <span className="pill white">{r.tag.toLowerCase()}</span>
            </div>
            <div className="routine-info">
              <h3>{r.name}</h3>
              <p>{r.detail}</p>
              <div className="workout-meta">
                <span>
                  <Clock3 size={14} />
                  {r.minutes} min
                </span>
                <span>{r.exercises.length} exercises</span>
              </div>
              <button
                className="secondary"
                onClick={() => {
                  commit({
                    ...state,
                    schedule: {
                      ...state.schedule,
                      [selected]: { ...plan, routine: i },
                    },
                  });
                  notify("Your workout plan is updated");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Choose for{" "}
                {selected === day()
                  ? "today"
                  : formatDay(selected, { month: "short", day: "numeric" })}
                <ArrowRight size={16} />
              </button>
            </div>
          </Card>
        ))}
      </div>
      <p className="privacy-note">
        Suggestions aren’t tracked activity. Use a comfortable range of motion
        and stop if you feel pain.
      </p>
      {editing && (
        <PlanEditor
          plan={plan}
          selected={selected}
          state={state}
          onClose={() => setEditing(false)}
          onSave={(p, date) => {
            const schedule = { ...state.schedule };
            if (date !== selected)
              schedule[selected] = { routine: null, note: "" };
            schedule[date] = p;
            commit({ ...state, schedule });
            onSelect(date);
            setEditing(false);
            notify(
              date !== selected
                ? "Workout rescheduled"
                : "Your plan is updated",
            );
          }}
        />
      )}
    </>
  );
}
function PlanEditor({
  plan,
  selected,
  state,
  onClose,
  onSave,
}: {
  plan: Plan;
  selected: string;
  state: State;
  onClose: () => void;
  onSave: (plan: Plan, date: string) => void;
}) {
  const [error, setError] = useState("");
  return (
    <Modal
      title="Make your plan yours"
      eyebrow="A LITTLE FLEXIBILITY"
      onClose={onClose}
    >
      <p className="modal-intro">
        Swap your routine, add a note, or move it to a day that works better.
      </p>
      <form
        className="form-stack"
        onSubmit={(e) => {
          e.preventDefault();
          const d = new FormData(e.currentTarget),
            date = String(d.get("date")),
            routine = String(d.get("routine"));
          if (date !== selected && state.schedule?.[date]?.routine != null) {
            setError(
              "That day already has a saved workout plan. Choose another day or edit that plan first.",
            );
            return;
          }
          onSave(
            {
              routine: routine === "rest" ? null : Number(routine),
              note: String(d.get("note")).trim(),
            },
            date,
          );
        }}
      >
        <label>
          Workout
          <select name="routine" defaultValue={plan.routine ?? "rest"}>
            {routines.map((r, i) => (
              <option value={i} key={r.name}>
                {r.name}
              </option>
            ))}
            <option value="rest">Recovery day</option>
          </select>
        </label>
        <label>
          Scheduled date
          <input name="date" type="date" required defaultValue={selected} />
        </label>
        <label>
          A note for yourself <span>(optional)</span>
          <textarea
            name="note"
            maxLength={200}
            defaultValue={plan.note}
            placeholder="A slower start, a little music…"
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="primary">
          Save plan <Check size={18} />
        </button>
      </form>
    </Modal>
  );
}
function Guide({ name }: { name: string }) {
  return (
    <div className="guide-content">
      <ol>
        {exerciseGuides[name]?.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <a
        className="text-button"
        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(name + " exercise proper form demonstration")}`}
        target="_blank"
        rel="noreferrer"
      >
        <Play size={15} /> Find a video demonstration <ArrowRight size={14} />
      </a>
      <small>
        Opens YouTube search. Choose a qualified instructor and adapt to your
        comfort.
      </small>
    </div>
  );
}
function WorkoutLogger({
  index,
  date,
  onClose,
  onFinish,
}: {
  index: number;
  date: string;
  onClose: () => void;
  onFinish: (session: Session) => void;
}) {
  const r = routines[index];
  const [sets, setSets] = useState(
      r.exercises.map((e) => [
        { reps: "12", weight: String(e[2]), done: false },
        { reps: "12", weight: String(e[2]), done: false },
      ]),
    ),
    [error, setError] = useState("");
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
    <Modal
      title={r.name}
      eyebrow={`YOUR MOVEMENT · ${formatDay(date)}`}
      onClose={onClose}
      closeLabel="Close workout"
      confirmClose
    >
      <p className="modal-intro">
        Your actual reps. Your actual effort. Check off each completed set;
        unchecked sets won’t be saved.
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
            date,
            name: r.name,
            exercises,
            xp: 120,
          });
        }}
      >
        {r.exercises.map((ex, i) => (
          <div className="exercise" key={ex[0]}>
            <h3>
              <span>{String(i + 1).padStart(2, "0")}</span>
              {ex[0]}
            </h3>
            <small className="muted">{ex[1]}</small>
            <details className="logger-guide">
              <summary>
                <Play size={13} /> Exercise demonstration & guidance
              </summary>
              <Guide name={ex[0]} />
            </details>
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
              <Plus size={15} /> Add set
            </button>
          </div>
        ))}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="primary finish">
          Finish workout{" "}
          <span>
            +120 XP <Check size={17} />
          </span>
        </button>
      </form>
    </Modal>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
