import {
  useEffect,
  useId,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import DialogPanel, { Icon } from "../ui/DialogPanel";
import SettingsContentSkeleton from "../skeleton/SettingDialogSkeleton";
import useTheme from "~/context/themeContext";

export type Preferences = {
  weeklyGoalHours: number;
  sessionMinutes: number;
  notifyTasks: boolean;
  notifyExams: boolean;
};

const LIMITS = {
  goal: { min: 1, max: 60 },
  session: { min: 5, max: 180 },
};

const SESSION_PRESETS = [25, 45, 60, 90];

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(n) ? Math.round(n) : min));

const isSame = (a: Preferences, b: Preferences) =>
  (Object.keys(a) as (keyof Preferences)[]).every((k) => a[k] === b[k]);

/* --------------------------------- Sections ---------------------------------- */

type SectionId = "appearance" | "study" | "notifications";

const SECTIONS: { id: SectionId; label: string; icon: ReactNode }[] = [
  {
    id: "appearance",
    label: "Appearance",
    icon: (
      <Icon>
        <circle
          cx="12"
          cy="12"
          r="4"
        />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </Icon>
    ),
  },
  {
    id: "study",
    label: "Study",
    icon: (
      <Icon>
        <line
          x1="10"
          x2="14"
          y1="2"
          y2="2"
        />
        <line
          x1="12"
          x2="15"
          y1="14"
          y2="11"
        />
        <circle
          cx="12"
          cy="14"
          r="8"
        />
      </Icon>
    ),
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: (
      <Icon>
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </Icon>
    ),
  },
];

const THEMES = [
  {
    value: "light",
    label: "Light",
    surface: "bg-white border-zinc-300",
    bar: "bg-zinc-300",
    icon: SECTIONS[0].icon,
  },
  {
    value: "dark",
    label: "Dark",
    surface: "bg-zinc-900 border-zinc-700",
    bar: "bg-zinc-700",
    icon: (
      <Icon>
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </Icon>
    ),
  },
] as const;

/* ---------------------------------- Styles ----------------------------------- */

const FIELD_CLASS =
  "h-10 rounded-lg border border-zinc-400/40 bg-transparent px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--accent-100)";

const HINT_CLASS = "mt-1 text-(--text-secondary) [font-size:var(--sm-text)]";

/* ----------------------------------- Switch ---------------------------------- */

function Switch({
  id,
  checked,
  onChange,
  label,
  description,
}: {
  id: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-(--secondary-gray) p-4">
      <div className="min-w-0">
        <p
          id={`${id}-label`}
          className="text-sm font-medium"
        >
          {label}
        </p>
        <p
          id={`${id}-desc`}
          className={HINT_CLASS}
        >
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-desc`}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-100) motion-reduce:transition-none ${
          checked ? "bg-(--accent-100)" : "bg-zinc-400/40"
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-[translate] duration-200 motion-reduce:transition-none ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

/* --------------------------------- Component --------------------------------- */

export default function SettingsContent({
  preferences,
  isLoading = false,
  onSave,
}: {
  preferences?: Preferences;
  isLoading?: boolean;
  onSave: (values: Preferences) => Promise<void> | void;
}) {
  const DEFAULT_PREFERENCES: Preferences = {
    weeklyGoalHours: preferences?.weeklyGoalHours ?? 10,
    sessionMinutes: preferences?.sessionMinutes ?? 25,
    notifyTasks: preferences?.notifyTasks ?? true,
    notifyExams: preferences?.notifyExams ?? true,
  };


  const uid = useId();

  const [section, setSection] = useState<SectionId>("appearance");
  const [form, setForm] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [saved, setSaved] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { theme, setTheme } = useTheme();

  const incomingKey = JSON.stringify(preferences);
  useEffect(() => {
    setForm(DEFAULT_PREFERENCES);
    setSaved(DEFAULT_PREFERENCES);
    setError(null);
  }, [incomingKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof Preferences>(key: K, value: Preferences[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const dirty = !isSame(form, saved);
  const isDefault = isSame(form, DEFAULT_PREFERENCES);
  const active = SECTIONS.find((s) => s.id === section) ?? SECTIONS[0];

  async function handleSave() {
    const clean: Preferences = {
      ...form,
      weeklyGoalHours: clamp(
        form.weeklyGoalHours,
        LIMITS.goal.min,
        LIMITS.goal.max,
      ),
      sessionMinutes: clamp(
        form.sessionMinutes,
        LIMITS.session.min,
        LIMITS.session.max,
      ),
    };

    setError(null);
    setIsSaving(true);
    try {
      await onSave(clean);
      setForm(clean);
      setSaved(clean);
    } catch {
      setError("Couldn't save your settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  // Arrow keys move between section tabs.
  function onTabKeyDown(e: KeyboardEvent, index: number) {
    const dir =
      e.key === "ArrowDown" || e.key === "ArrowRight"
        ? 1
        : e.key === "ArrowUp" || e.key === "ArrowLeft"
          ? -1
          : 0;
    if (!dir) return;

    e.preventDefault();
    const next = SECTIONS[(index + dir + SECTIONS.length) % SECTIONS.length];
    setSection(next.id);
    document.getElementById(`${uid}-tab-${next.id}`)?.focus();
  }

  return (
    <DialogPanel
      title="Settings"
      breadcrumb={[
        { label: "Study Room" },
        { label: "Settings", onClick: () => setSection("appearance") },
        { label: active.label },
      ]}
      onSave={handleSave}
      onReset={() => setForm(DEFAULT_PREFERENCES)}
      resetLabel="Reset changes"
      canSave={dirty}
      canReset={!isDefault}
      isSaving={isSaving}
      isLoading={isLoading}
      error={error}
    >
      {isLoading ? (
        <SettingsContentSkeleton />
      ) : (
        <div className="grid gap-6 md:grid-cols-[11rem_1fr]">
          {/* Section tabs */}
          <div
            role="tablist"
            aria-label="Settings sections"
            className="flex gap-1 overflow-x-auto md:flex-col md:overflow-auto"
          >
            {SECTIONS.map((s, i) => {
              const selected = s.id === section;

              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  id={`${uid}-tab-${s.id}`}
                  aria-selected={selected}
                  aria-controls={`${uid}-panel`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setSection(s.id)}
                  onKeyDown={(e) => onTabKeyDown(e, i)}
                  className={`flex h-9 shrink-0 gap-2 rounded-lg px-3 text-sm transition-colors leading-[normal] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--accent-100) motion-reduce:transition-none items-center ${
                    selected
                      ? "bg-(--accent-100)/15 font-semibold text-(--text-primary)"
                      : "text-(--text-secondary) hover:bg-zinc-400/20 hover:text-(--text-primary)"
                  }`}
                >
                  {s.icon}
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* Active section (remounts on change so it can fade in) */}
          <div
            key={section}
            role="tabpanel"
            id={`${uid}-panel`}
            aria-labelledby={`${uid}-tab-${section}`}
            className="min-w-0 transition-[opacity,translate] duration-200 starting:translate-y-1 starting:opacity-0 motion-reduce:transition-none"
          >
            {section === "appearance" && (
              <fieldset className="min-w-0">
                <legend className="text-sm font-semibold">Theme</legend>
                <p className={HINT_CLASS}>Choose how Study Room looks.</p>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  {THEMES.map((t) => (
                    <label
                      key={t.value}
                      className="flex cursor-pointer flex-col gap-2 rounded-xl border border-zinc-400/40 p-3 transition-colors hover:bg-zinc-400/10 has-[:checked]:border-(--accent-100) has-[:checked]:bg-(--accent-100)/10 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-(--accent-100) motion-reduce:transition-none"
                    >
                      <input
                        type="radio"
                        name={`${uid}-theme`}
                        value={t.value}
                        checked={theme === t.value}
                        onChange={() => setTheme(t.value)}
                        className="sr-only"
                      />

                      {/* Tiny preview */}
                      <div
                        aria-hidden="true"
                        className={`grid h-14 content-center gap-1.5 rounded-md border px-3 ${t.surface}`}
                      >
                        <div className={`h-1.5 w-2/3 rounded-full ${t.bar}`} />
                        <div className={`h-1.5 w-1/3 rounded-full ${t.bar}`} />
                      </div>

                      <span className="flex items-center gap-2 text-sm font-medium leading-[normal]">
                        {t.icon}
                        {t.label}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            {section === "study" && (
              <div className="grid gap-8">
                {/* Study goal */}
                <div>
                  <div className="flex items-baseline justify-between gap-4">
                    <label
                      htmlFor={`${uid}-goal`}
                      className="text-sm font-semibold"
                    >
                      Weekly study goal
                    </label>
                    <output
                      htmlFor={`${uid}-goal`}
                      className="text-sm font-medium tabular-nums"
                    >
                      {form.weeklyGoalHours} h / week
                    </output>
                  </div>

                  <input
                    id={`${uid}-goal`}
                    type="range"
                    min={LIMITS.goal.min}
                    max={LIMITS.goal.max}
                    step={1}
                    value={form.weeklyGoalHours}
                    onChange={(e) =>
                      set("weeklyGoalHours", Number(e.target.value))
                    }
                    aria-describedby={`${uid}-goal-hint`}
                    className="mt-3 w-full accent-(--accent-100)"
                  />
                  <p
                    id={`${uid}-goal-hint`}
                    className={HINT_CLASS}
                  >
                    Used for the weekly goal on your dashboard.
                  </p>
                </div>

                {/* Default session duration */}
                <fieldset className="min-w-0">
                  <legend className="text-sm font-semibold">
                    Default study session
                  </legend>
                  <p className={HINT_CLASS}>
                    The starting length of your focus timer.
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {SESSION_PRESETS.map((m) => {
                      const selected = form.sessionMinutes === m;

                      return (
                        <button
                          key={m}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => set("sessionMinutes", m)}
                          className={`h-10 rounded-lg border px-4 text-sm tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--accent-100) motion-reduce:transition-none ${
                            selected
                              ? "border-(--accent-100) bg-(--accent-100)/15 font-semibold"
                              : "border-zinc-400/40 hover:bg-zinc-400/20"
                          }`}
                        >
                          {m} min
                        </button>
                      );
                    })}

                    <div className="flex items-center gap-2">
                      <label
                        htmlFor={`${uid}-minutes`}
                        className="sr-only"
                      >
                        Custom session length in minutes
                      </label>
                      <input
                        id={`${uid}-minutes`}
                        type="number"
                        inputMode="numeric"
                        min={LIMITS.session.min}
                        max={LIMITS.session.max}
                        value={form.sessionMinutes}
                        onChange={(e) =>
                          set("sessionMinutes", Number(e.target.value))
                        }
                        onBlur={() =>
                          set(
                            "sessionMinutes",
                            clamp(
                              form.sessionMinutes,
                              LIMITS.session.min,
                              LIMITS.session.max,
                            ),
                          )
                        }
                        className={`${FIELD_CLASS} w-20 tabular-nums`}
                      />
                      <span
                        aria-hidden="true"
                        className="text-sm text-(--text-secondary)"
                      >
                        min
                      </span>
                    </div>
                  </div>
                  <p className={HINT_CLASS}>
                    Between {LIMITS.session.min} and {LIMITS.session.max}{" "}
                    minutes.
                  </p>
                </fieldset>
              </div>
            )}

            {section === "notifications" && (
              <div className="grid gap-3">
                <Switch
                  id={`${uid}-tasks`}
                  checked={form.notifyTasks}
                  onChange={(v) => set("notifyTasks", v)}
                  label="Task reminders"
                  description="Get notified about tasks that are due."
                />
                <Switch
                  id={`${uid}-exams`}
                  checked={form.notifyExams}
                  onChange={(v) => set("notifyExams", v)}
                  label="Exam reminders"
                  description="Get notified as your exams get closer."
                />
              </div>
            )}
          </div>
        </div>
      )}
    </DialogPanel>
  );
}
