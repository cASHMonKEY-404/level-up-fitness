import { useEffect, useId, useRef, type ReactNode } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Flower2,
  Dumbbell,
  Sparkles,
  Sprout,
  Star,
  X,
} from "lucide-react";
import {
  addDays,
  day,
  formatDay,
  parseDay,
  weekDays,
  type Session,
} from "./data";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`card ${className}`}>{children}</section>;
}
export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-title">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
export function Bar({
  value,
  max,
  label,
  tone = "lavender",
}: {
  value: number;
  max: number;
  label: string;
  tone?: string;
}) {
  return (
    <div
      className={`progress-track ${tone}`}
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.min(value, max)}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <span
        style={{ width: `${Math.min(100, Math.max(0, (value / max) * 100))}%` }}
      />
    </div>
  );
}
export function Ring({
  value,
  max,
  children,
  className = "",
}: {
  value: number;
  max: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`progress-ring ${className}`}
      style={
        {
          "--progress": `${Math.min(100, Math.max(0, (value / max) * 100))}%`,
        } as React.CSSProperties
      }
    >
      <div>{children}</div>
    </div>
  );
}
export function Empty({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span>{icon}</span>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
export function Calendar({
  selected,
  onSelect,
  completed = [],
  compact = false,
  planned = [],
}: {
  selected: string;
  onSelect: (key: string) => void;
  completed?: string[];
  planned?: string[];
  compact?: boolean;
}) {
  const days = weekDays(selected);
  const today = day();
  return (
    <div className={`calendar ${compact ? "compact" : ""}`}>
      <div className="calendar-heading">
        <span>{formatDay(days[0], { month: "long", year: "numeric" })}</span>
        <div>
          <button
            className="icon-button"
            onClick={() => onSelect(addDays(selected, -7))}
            aria-label="Previous week"
          >
            <ChevronLeft size={18} />
          </button>
          <button className="text-button" onClick={() => onSelect(today)}>
            Today
          </button>
          <button
            className="icon-button"
            onClick={() => onSelect(addDays(selected, 7))}
            aria-label="Next week"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="week-days">
        {days.map((d) => (
          <button
            key={d}
            className={`calendar-day ${d === selected ? "selected" : ""} ${d === today ? "is-today" : ""}`}
            aria-label={formatDay(d, {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            title={
              completed.includes(d)
                ? "Workout completed"
                : planned.includes(d)
                  ? "Workout planned"
                  : undefined
            }
            aria-pressed={d === selected}
            onClick={() => onSelect(d)}
          >
            <small>{formatDay(d, { weekday: "short" })}</small>
            <b>{parseDay(d).getDate()}</b>
            <span
              className={`day-marker ${completed.includes(d) ? "complete" : ""}`}
            >
              {completed.includes(d) ? (
                <Check size={10} />
              ) : planned.includes(d) ? (
                <Dumbbell size={11} />
              ) : d === today ? (
                <i />
              ) : (
                ""
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
export function Modal({
  title,
  eyebrow,
  children,
  onClose,
  closeLabel = "Close dialog",
  confirmClose = false,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  onClose: () => void;
  closeLabel?: string;
  confirmClose?: boolean;
}) {
  const id = useId(),
    ref = useRef<HTMLElement>(null);
  const dismiss = () => {
    if (
      !confirmClose ||
      window.confirm("Leave this workout? Unsaved sets will be discarded.")
    )
      onClose();
  };
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return (
    <div className="modal-backdrop">
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        ref={ref}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            dismiss();
          }
          if (e.key === "Tab") {
            const all = Array.from(
              e.currentTarget.querySelectorAll<HTMLElement>(
                'button:not([disabled]), input:not([disabled]), select, a[href], summary, [tabindex="0"]',
              ),
            ).filter((el) => el.getClientRects().length);
            const first = all[0],
              last = all[all.length - 1];
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
        <div className="modal-heading">
          <div>
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            <h2 id={id}>{title}</h2>
          </div>
          <button
            className="icon-button close-button"
            aria-label={closeLabel}
            onClick={dismiss}
          >
            <X size={21} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
export function WorkoutArt({
  variant = 0,
  className = "",
}: {
  variant?: number;
  className?: string;
}) {
  const id = useId();
  return (
    <svg
      className={`workout-art ${className}`}
      viewBox="0 0 360 300"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={id}
          x1="80"
          y1="40"
          x2="310"
          y2="300"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#f5efff" />
          <stop
            offset="1"
            stopColor={
              variant === 1 ? "#e1eaf4" : variant === 2 ? "#f4dfe2" : "#d9d2f0"
            }
          />
        </linearGradient>
      </defs>
      <path
        d="M278 51c62 32 74 94 45 148-29 55-112 72-180 51C76 230 31 187 59 126 87 65 216 19 278 51Z"
        fill={`url(#${id})`}
      />
      <ellipse
        cx="186"
        cy="265"
        rx="119"
        ry="13"
        fill="#a49ac1"
        opacity=".16"
      />
      <path
        d="M60 260h237"
        stroke="#afa0ca"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M287 218c-8-23 3-49 19-59 6 22 1 41-19 59Zm0 12c1-32-19-47-33-49-1 21 10 38 33 49Z"
        fill="#b3c9b4"
      />
      <path d="M286 252v-43" stroke="#93ad97" strokeWidth="3" />
      <path d="M270 237h31l-5 26h-20l-6-26Z" fill="#d6c7b8" />
      {variant === 1 ? (
        <>
          <path
            d="m160 169-24 80m57-80 25 80"
            stroke="#7e75aa"
            strokeWidth="25"
            strokeLinecap="round"
          />
          <path d="M158 124h38l7 57c-17 12-37 12-54 0l9-57Z" fill="#c8bce9" />
          <path
            d="m159 132-28-37-12-37m77 74 27-38 10-36"
            stroke="#dbad99"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M111 55h22m88 0h24"
            stroke="#77718c"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <circle cx="177" cy="99" r="22" fill="#dbad99" />
          <path
            d="M155 94c-3-35 45-38 47-7l-15-5-6-15-7 21-19 6Z"
            fill="#4b405e"
          />
        </>
      ) : variant === 2 ? (
        <>
          <path
            d="m167 175-32 41-21 32m70-72 28 32 26 40"
            stroke="#8b7aa4"
            strokeWidth="24"
            strokeLinecap="round"
          />
          <path
            d="m153 121 37-4 14 58c-15 19-41 19-57 2l6-56Z"
            fill="#c8b4dc"
          />
          <path
            d="m158 132 1 39 16 20m12-62 9 38-14 24"
            stroke="#dcae9a"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <circle cx="176" cy="211" r="19" fill="#969fbd" />
          <path
            d="M165 194v-8a11 11 0 0 1 22 0v8"
            stroke="#7d88a5"
            strokeWidth="6"
          />
          <circle cx="172" cy="95" r="22" fill="#dcae9a" />
          <path
            d="M150 92c-3-34 47-38 47-6l-16-1-10-15-7 19-14 3Z"
            fill="#55435f"
          />
        </>
      ) : (
        <>
          <path
            d="m161 170-32 45 25 34m33-79 33 44 27 35"
            stroke="#8d80b9"
            strokeWidth="25"
            strokeLinecap="round"
          />
          <path
            d="m149 123 42-5 15 54c-17 16-43 18-61 3l4-52Z"
            fill="#b8a5df"
          />
          <path
            d="m154 136-28 28 31 18m34-48 23 26-30 22"
            stroke="#dcae9a"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <circle cx="171" cy="94" r="23" fill="#dcae9a" />
          <path
            d="M148 93c-2-36 45-38 49-12l-17 2-12-14-4 21-16 3Z"
            fill="#4f405e"
          />
          <circle cx="195" cy="76" r="11" fill="#4f405e" />
          <path
            d="m162 180 22 0"
            stroke="#666076"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <rect x="154" y="170" width="9" height="23" rx="3" fill="#858098" />
          <rect x="183" y="170" width="9" height="23" rx="3" fill="#858098" />
        </>
      )}
      <path
        d="M118 253h34m81 0h23"
        stroke="#f4efe9"
        strokeWidth="11"
        strokeLinecap="round"
      />
      <path d="m81 83 3-8 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="#a391c9" />
      <circle cx="268" cy="101" r="5" fill="#c0b0dd" />
      <path
        d="m111 57 5-6m-8-3-5-4"
        stroke="#c5b7db"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
export function FoodArt() {
  return (
    <svg className="food-art" viewBox="0 0 180 150" aria-hidden="true">
      <ellipse cx="90" cy="130" rx="62" ry="9" fill="#dccfe5" />
      <path
        d="M25 66h130c-5 39-29 62-65 62S30 105 25 66"
        fill="#f8f5ff"
        stroke="#d2c2e8"
        strokeWidth="3"
      />
      <ellipse cx="90" cy="66" rx="65" ry="32" fill="#e4d4ee" />
      <ellipse cx="90" cy="64" rx="57" ry="25" fill="#d6ba8c" />
      {[
        [-25, -5, "#a0b58c"],
        [-10, 4, "#88a783"],
        [12, -8, "#d9a486"],
        [32, 2, "#c78f7e"],
        [3, 12, "#bdca9a"],
      ].map(([x, y, c], i) => (
        <ellipse
          key={i}
          cx={90 + Number(x)}
          cy={61 + Number(y)}
          rx="17"
          ry="10"
          fill={String(c)}
          transform={`rotate(${i * 35} ${90 + Number(x)} ${61 + Number(y)})`}
        />
      ))}
      <path
        d="m133 42 15-29"
        stroke="#9b83b1"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
export function Badge({ kind, earned }: { kind: number; earned: boolean }) {
  const Icon = [Sprout, Star, Flower2, Sparkles][kind % 4];
  return (
    <div className={`badge-art badge-${kind} ${earned ? "earned" : ""}`}>
      <span className="badge-rays" />
      <div>
        <Icon size={29} strokeWidth={1.5} />
      </div>
      <i />
      <i />
    </div>
  );
}
export function History({
  history,
  limit,
}: {
  history: Session[];
  limit?: number;
}) {
  return history.length ? (
    <div className="history-list">
      {[...history]
        .reverse()
        .slice(0, limit)
        .map((h) => (
          <details className="history-item" key={h.id}>
            <summary>
              <span className="history-icon">
                <Check size={19} />
              </span>
              <span className="history-title">
                <b>{h.name}</b>
                <small>
                  {formatDay(h.date)} ·{" "}
                  {h.exercises.reduce((n, e) => n + e.sets.length, 0)} sets
                  logged
                </small>
              </span>
              <span className="history-xp">+{h.xp} XP</span>
              <ChevronRight size={16} />
            </summary>
            <div className="history-sets">
              {h.exercises.map((e, i) => (
                <div key={i}>
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
            </div>
          </details>
        ))}
    </div>
  ) : (
    <Empty icon={<Sprout />} title="Your first chapter awaits.">
      Every journey starts somewhere. Your completed workouts will appear here.
    </Empty>
  );
}
