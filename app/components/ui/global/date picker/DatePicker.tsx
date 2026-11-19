import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type Ref,
} from "react";
import { ChevronLeft, ChevronRight } from "@untitledui/icons";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";


type DatePickerProps = {
  value: DateValue;
  onChange: (value: string) => void;
  anchor: string;
  onClose?: () => void;
  showTimePicker: boolean;
};

type DateValue = Date | string | null;

/* -------------------------------------------------------------------------- */
/*  Constants & helpers                                                       */
/* -------------------------------------------------------------------------- */

const LOCALE = "en";
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const PERSPECTIVE = 1200;

const ITEM_H = 34; // px per wheel row
const VISIBLE = 7; // rows in view (odd, so one sits dead centre)
const REACH = Math.ceil(VISIBLE / 2); // rows rendered above/below the centre row
const TAP_SLOP = 4; // px a press may move and still count as a tap
const FLICK_MIN = 4; // rows/s; slower releases just snap
const FLICK_GAIN = 0.22; // seconds of glide a release velocity buys

const mod = (n: number, m: number) => ((n % m) + m) % m;
const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));
const pad = (n: number) => String(n).padStart(2, "0");

/** Parse date-only strings as local dates to avoid a UTC day shift. */
function parseDateValue(value: DateValue): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : new Date(value);
  }
  if (!value) return null;

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const parsed = dateOnly
    ? new Date(
        Number(dateOnly[1]),
        Number(dateOnly[2]) - 1,
        Number(dateOnly[3]),
      )
    : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Serialize local calendar fields without applying a timezone conversion. */
function formatDateValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** Same moment, different calendar day. */
const withDate = (d: Date, day: Date) =>
  new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    d.getHours(),
    d.getMinutes(),
  );

/** Same calendar day, different time of day. */
const withTime = (d: Date, h = d.getHours(), m = d.getMinutes()) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m);

function toDraft(value: DateValue): Date {
  const parsed = parseDateValue(value);
  if (parsed) {
    return new Date(
      parsed.getFullYear(),
      parsed.getMonth(),
      parsed.getDate(),
      parsed.getHours(),
      parsed.getMinutes(),
    );
  }
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
  );
}

/** Always 42 cells (6 weeks, Sunday first) so the card never changes height. */
function monthGrid(year: number, month: number): Date[] {
  const lead = new Date(year, month, 1).getDay();
  return Array.from(
    { length: 42 },
    (_, i) => new Date(year, month, 1 - lead + i),
  );
}

/* -------------------------------------------------------------------------- */
/*  Picker                                                                    */
/* -------------------------------------------------------------------------- */

export default function DatePicker({
  value,
  onChange,
  anchor,
  showTimePicker,
  onClose,
}: DatePickerProps) {
  const [draft, setDraft] = useState(() => toDraft(value));
  const [view, setView] = useState(() => ({
    year: draft.getFullYear(),
    month: draft.getMonth(),
  }));
  const [flipped, setFlipped] = useState(false);

  // A new `value` from outside (after Apply, a reset, ...) replaces the draft.
  const valueTime = parseDateValue(value)?.getTime() ?? null;
  const [seenTime, setSeenTime] = useState(valueTime);
  if (seenTime !== valueTime) {
    const next = toDraft(value);
    setSeenTime(valueTime);
    setDraft(next);
    setView({ year: next.getFullYear(), month: next.getMonth() });
  }

  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const frontToggle = useRef<HTMLButtonElement>(null);
  const backToggle = useRef<HTMLButtonElement>(null);
  const slideDir = useRef(1);

  const anchorName = anchor.startsWith("--") ? anchor : `--${anchor}`;
  const days = useMemo(
    () => monthGrid(view.year, view.month),
    [view.year, view.month],
  );
  const viewKey = `${view.year}-${view.month}`;
  const today = new Date();

  /* Escape or a press outside closes. A press on the trigger is left to the
     trigger (it usually toggles), found by its computed `anchor-name`. */
  useEffect(() => {
    if (!onClose) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onPointerDown = (e: PointerEvent) => {
      const path = e.composedPath();
      const root = rootRef.current;
      if (root && path.includes(root)) return;
      const onTrigger = path.some(
        (node) =>
          node instanceof Element &&
          getComputedStyle(node)
            .getPropertyValue("anchor-name")
            .split(",")
            .some((name) => name.trim() === anchorName),
      );
      if (!onTrigger) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [onClose, anchorName]);

  /* Slide the day grid in from the side we navigated towards. */
  const prevViewKey = useRef(viewKey);
  useLayoutEffect(() => {
    if (prevViewKey.current === viewKey) return;
    prevViewKey.current = viewKey;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (slideDir.current == null) slideDir.current = 0;
    gridRef.current?.animate(
      [
        { opacity: 0, transform: `translateX(${slideDir.current * 24}px)` },
        { opacity: 1, transform: "translateX(0)" },
      ],
      { duration: 240, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
  }, [viewKey]);

  /* The face that was just clicked goes inert, so hand focus to its twin. */
  const prevFlipped = useRef(flipped);
  useEffect(() => {
    if (prevFlipped.current === flipped) return;
    prevFlipped.current = flipped;
    (flipped ? backToggle : frontToggle).current?.focus({
      preventScroll: true,
    });
  }, [flipped]);

  const shiftMonth = (delta: number) => {
    slideDir.current = delta;
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const pickDay = (day: Date) => {
    setDraft((d) => withDate(d, day));
    // Picking a greyed-out day from the next/previous month follows it there.
    if (day.getFullYear() !== view.year || day.getMonth() !== view.month) {
      slideDir.current =
        day.getTime() > new Date(view.year, view.month, 1).getTime() ? 1 : -1;
      setView({ year: day.getFullYear(), month: day.getMonth() });
    }
  };

  const apply = () => {
    document.startViewTransition(() => {
      onChange(formatDateValue(draft));
      onClose?.();
    });
  };

  const monthLabel = new Date(view.year, view.month, 1).toLocaleDateString(
    LOCALE,
    { month: "long", year: "numeric" },
  );
  const draftLabel = draft.toLocaleDateString(LOCALE, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // CSS Anchor Positioning: below the trigger, left edges aligned, flipping
  // above / to the other side when there isn't room.
  const style = {
    position: "fixed",
    positionAnchor: anchorName,
    top: "calc(anchor(bottom) + 5px)",
    left: "anchor(left)",
    marginTop: 8,
    positionTryFallbacks: "flip-block, flip-inline, flip-block flip-inline",
    perspective: PERSPECTIVE,
  } as CSSProperties;

  return createPortal(
    <div
      ref={rootRef}
      role="dialog"
      aria-label="Pick a date and time"
      style={style}
      className="container-div z-50 w-72"
    >
      <div
        className="grid transition-transform duration-900ms ease-[cubic-bezier(0.4,0.2,0.2,1)] motion-reduce:transition-none"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front: calendar */}
        <Face inactive={flipped}>
          <div className="flex items-center justify-between">
            <NavButton
              label="Previous month"
              onClick={() => shiftMonth(-1)}
            >
              <ChevronLeft className="size-5" />
            </NavButton>
            <h3
              aria-live="polite"
              className="font-heading text-sm tracking-wide"
            >
              {monthLabel}
            </h3>
            <NavButton
              label="Next month"
              onClick={() => shiftMonth(1)}
            >
              <ChevronRight className="size-5" />
            </NavButton>
          </div>

          <div className="mt-2 grid grid-cols-7 text-center text-xs text-muted-foreground">
            {WEEKDAYS.map((w) => (
              <span
                key={w}
                className="py-1"
              >
                {w}
              </span>
            ))}
          </div>

          <div
            key={viewKey}
            ref={gridRef}
            className="grid grid-cols-7"
          >
            {days.map((day) => {
              const selected = isSameDay(day, draft);
              const inMonth = day.getMonth() === view.month;
              return (
                <button
                  key={day.getTime()}
                  type="button"
                  onClick={() => pickDay(day)}
                  aria-label={day.toLocaleDateString(LOCALE, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                  aria-pressed={selected}
                  aria-current={isSameDay(day, today) ? "date" : undefined}
                  className={`grid h-9 place-content-center rounded-lg text-sm tabular-nums transition-colors ${
                    selected
                      ? "bg-(--text-primary) text-(--contrast-text)"
                      : `hover:bg-muted ${inMonth ? "" : "text-muted-foreground/80"} ${
                          isSameDay(day, today)
                            ? "ring-1 ring-inset ring-primary/50"
                            : ""
                        }`
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <Footer
            showTimePicker={showTimePicker}
            toggleLabel="Select Time"
            toggleRef={frontToggle}
            onToggle={() => setFlipped(true)}
            onApply={apply}
          />
        </Face>

        {/* Back: time wheels */}
        {showTimePicker && (
          <Face
            back
            inactive={!flipped}
          >
            <p className="grid h-8 place-content-center text-sm text-muted-foreground">
              {draftLabel}
            </p>

            <div className="relative my-2 flex flex-1 items-center justify-center gap-1">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-1 top-1/2 -translate-y-1/2 rounded-lg bg-muted"
                style={{ height: ITEM_H }}
              />
              <TimeWheel
                label="Hours"
                count={24}
                value={draft.getHours()}
                onChange={(h) => setDraft((d) => withTime(d, h))}
              />
              <Colon />
              <TimeWheel
                label="Minutes"
                count={60}
                value={draft.getMinutes()}
                onChange={(m) => setDraft((d) => withTime(d, undefined, m))}
              />
            </div>

            <Footer
              showTimePicker={showTimePicker}
              toggleLabel="Select Date"
              toggleRef={backToggle}
              onToggle={() => setFlipped(false)}
              onApply={apply}
            />
          </Face>
        )}
      </div>
    </div>,
    document.body,
  );
}

/* -------------------------------------------------------------------------- */
/*  Card pieces                                                               */
/* -------------------------------------------------------------------------- */

function Face({
  back = false,
  inactive,
  children,
}: {
  back?: boolean;
  /** The face turned away from the viewer: unreachable by mouse, keys and AT. */
  inactive: boolean;
  children: ReactNode;
}) {
  return (
    <div
      inert={inactive}
      style={{
        gridArea: "1 / 1",
        backfaceVisibility: "hidden",
        transform: back ? "rotateY(180deg)" : undefined,
      }}
      className="flex flex-col rounded-xl border border-[hsl(from_var(--text-primary)_h_s_l_/.16)] bg-background p-2 shadow-md"
    >
      {children}
    </div>
  );
}

function NavButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-8 place-content-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  );
}

const BUTTON =
  "h-9 flex-1 rounded-lg px-3 text-sm font-medium transition-colors";

function Footer({
  toggleLabel,
  showTimePicker,
  toggleRef,
  onToggle,
  onApply,
}: {
  toggleLabel: string;
  showTimePicker: boolean;
  toggleRef: Ref<HTMLButtonElement>;
  onToggle: () => void;
  onApply: () => void;
}) {
  return (
    <div className="mt-auto flex gap-2 pt-3">
      {showTimePicker && (
        <button
          ref={toggleRef}
          type="button"
          onClick={onToggle}
          className={`${BUTTON} border hover:bg-muted`}
        >
          {toggleLabel}
        </button>
      )}
      <button
        type="button"
        onClick={onApply}
        className={twMerge(
          `${BUTTON} bg-(--text-primary) text-(--contrast-text) hover:bg-(--text-primary)/60`,
          !showTimePicker && "rounded-[9px]",
        )}
      >
        Apply
      </button>
    </div>
  );
}

function Colon() {
  return (
    <span
      aria-hidden
      className="w-3 pb-0.5 text-center text-xl font-medium text-muted-foreground"
    >
      :
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Time wheel                                                                */
/* -------------------------------------------------------------------------- */

type Drag = {
  id: number;
  startY: number;
  startOffset: number;
  moved: boolean;
  lastY: number;
  lastT: number;
  v: number; // rows per second, smoothed
};

const KEY_STEPS: Record<string, number> = {
  ArrowUp: 1,
  ArrowDown: -1,
  PageUp: 5,
  PageDown: -5,
};

/**
 * One vertical wheel. `offset` is its live position in rows. It is unbounded
 * (wrapping is just modulo), so 23 rolls on into 0 instead of rewinding.
 *
 * While you drag, only this component re-renders. The parent hears about the
 * new value once, the moment a gesture decides where the wheel will land.
 */
function TimeWheel({
  label,
  count,
  value,
  onChange,
}: {
  label: string;
  count: number;
  value: number;
  onChange: (value: number) => void;
}) {
  const [offset, setOffset] = useState(value);
  const offsetRef = useRef(value);
  const targetRef = useRef(value); // where the wheel is heading, or resting
  const frame = useRef(0);
  const drag = useRef<Drag | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const place = useCallback((next: number) => {
    offsetRef.current = next;
    setOffset(next);
  }, []);

  const animateTo = useCallback(
    (target: number, ms = 260, emit = true) => {
      frame.current && cancelAnimationFrame(frame.current);
      targetRef.current = target;
      if (emit && onChangeRef.current) onChangeRef.current(mod(target, count));

      const from = offsetRef.current;
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = clamp((now - t0) / ms, 0, 1);
        from != null && place(from + (target - from) * (1 - (1 - p) ** 3)); // ease-out cubic
        if (p < 1) {
          frame.current = requestAnimationFrame(tick);
        } else {
          // Park on the 0…count-1 copy so the numbers never grow without bound.
          const home = mod(target, count);
          targetRef.current = home;
          place(home);
        }
      };
      frame.current = requestAnimationFrame(tick);
    },
    [count, place],
  );

  // The draft changed from outside: roll the short way round to the new value.
  useEffect(() => {
    if (targetRef.current && value === mod(targetRef.current, count)) return;
    const turns =
      offsetRef.current != null
        ? Math.round((offsetRef.current - value) / count)
        : 0;
    animateTo(value + turns * count, 260, false);
  }, [value, count, animateTo]);

  useEffect(
    () => () => cancelAnimationFrame(frame.current != null ? frame.current : 0),
    [],
  );

  // Mouse wheel / trackpad: one row per notch. Needs a non-passive listener so
  // the page doesn't scroll underneath, and only while the pointer is over it.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let acc = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      acc += e.deltaMode === 1 ? e.deltaY * 20 : e.deltaY;
      if (Math.abs(acc) < 50) return;
      const dir = Math.sign(acc);
      acc = 0;
      targetRef.current != null && animateTo(targetRef.current + dir, 160);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [animateTo]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    frame.current != null && cancelAnimationFrame(frame.current); // grab it mid-glide
    e.currentTarget.setPointerCapture(e.pointerId);
    if (offsetRef.current == null) offsetRef.current = 0;
    drag.current = {
      id: e.pointerId,
      startY: e.clientY,
      startOffset: offsetRef.current,
      moved: false,
      lastY: e.clientY,
      lastT: e.timeStamp,
      v: 0,
    };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.abs(dy) < TAP_SLOP) return;
    d.moved = true;

    const dt = e.timeStamp - d.lastT;
    if (dt > 0) {
      const inst = -((e.clientY - d.lastY) / ITEM_H) / (dt / 1000);
      d.v = d.v * 0.5 + inst * 0.5;
    }
    d.lastY = e.clientY;
    d.lastT = e.timeStamp;

    place(d.startOffset - dy / ITEM_H); // dragging down brings smaller numbers
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    const pos = offsetRef.current ?? 0;

    if (!d.moved) {
      // A tap: whichever row was under the pointer becomes the selection.
      const rect = e.currentTarget.getBoundingClientRect();
      const row = pos + (e.clientY - (rect.top + rect.height / 2)) / ITEM_H;
      animateTo(Math.round(row));
      return;
    }

    // A drag: carry the release velocity a little further, then land on a row.
    const v = e.timeStamp - d.lastT > 80 ? 0 : d.v; // paused before letting go
    if (Math.abs(v) < FLICK_MIN) {
      animateTo(Math.round(pos));
      return;
    }
    const target = Math.round(pos + v * FLICK_GAIN);
    // Ease-out cubic starts at 3·distance/duration, so this duration makes the
    // glide pick up at exactly the speed the finger let go at.
    const ms = clamp(
      ((3 * Math.abs(target - pos)) / Math.abs(v)) * 1000,
      260,
      1100,
    );
    animateTo(target, ms);
  };

  const onPointerCancel = () => {
    if (!drag.current) return;
    drag.current = null;
    offsetRef.current != null && animateTo(Math.round(offsetRef.current));
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const step = KEY_STEPS[e.key];
    if (!step) return;
    e.preventDefault();
    targetRef.current != null && animateTo(targetRef.current + step, 180);
  };

  const rows: ReactNode[] = [];
  const centre = Math.round(offset);
  for (let i = centre - REACH; i <= centre + REACH; i++) {
    const rel = i - offset; // rows from the middle, fractional while moving
    const d = Math.abs(rel);
    rows.push(
      <div
        key={i}
        aria-hidden
        className="absolute inset-x-0 top-1/2 grid place-content-center text-xl font-medium tabular-nums will-change-transform"
        style={{
          height: ITEM_H,
          marginTop: -ITEM_H / 2,
          opacity: Math.max(0, 1 - 0.27 * d),
          transform: `translateY(${rel * ITEM_H}px) scale(${Math.max(0.62, 1.32 - 0.3 * d)})`,
        }}
      >
        {pad(mod(i, count))}
      </div>,
    );
  }

  return (
    <div
      ref={rootRef}
      role="spinbutton"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={count - 1}
      aria-valuenow={value}
      aria-valuetext={pad(value)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onKeyDown={onKeyDown}
      style={{ height: ITEM_H * VISIBLE }}
      className="relative w-16 cursor-grab touch-none select-none overflow-hidden rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:cursor-grabbing"
    >
      {rows}
    </div>
  );
}
/* -------------------------------------------------------------------------- */
/*  Standalone date-field trigger                                             */
/* -------------------------------------------------------------------------- */

/**
 * Input-style trigger for DatePicker. The field button opens and closes the
 * popover; the calendar/time switch inside the popover remains independent.
 */
export function DatePickerField({
  value,
  onChange,
  placeholder = "mm/dd/yyyy",
  className = "",
  showTimePicker,
}: {
  value: DateValue;
  onChange: (value: string) => void;
  showTimePicker: boolean;
  label?: string;
  placeholder?: string;
  className?: string;
}) {
  const id = useId();
  const suffix = id.replace(/[^a-zA-Z0-9_-]/g, "");
  const triggerId = `date-picker-trigger-${suffix}`;
  const anchorName = `--date-picker-${suffix}`;
  const [open, setOpen] = useState(false);

  const parsedValue = parseDateValue(value);
  const displayDate = parsedValue
    ? `${pad(parsedValue.getMonth() + 1)}/${pad(parsedValue.getDate())}/${parsedValue.getFullYear()}`
    : "";
  const displayTime =
    parsedValue && showTimePicker
      ? ` ${pad(parsedValue.getHours())}:${pad(parsedValue.getMinutes())}`
      : "";
  const displayValue = parsedValue
    ? `${displayDate}${displayTime}`
    : "";

  return (
    <div className={`w-[max(208px,100%)] ${className}`.trim()}>
      <button
        id={triggerId}
        type="button"
        style={{ anchorName }}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-9 w-full items-center justify-between gap-3 rounded-lg border border-[hsl(from_var(--text-primary)_h_s_l_/.2)] bg-background px-3 text-left text-sm text-foreground transition-colors hover:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <span className={displayValue ? "" : "text-neutral-400"}>
          {displayValue || placeholder}
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          className="size-4 shrink-0 text-neutral-300"
        >
          <rect
            x="3.5"
            y="5"
            width="17"
            height="15.5"
            rx="2.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M7.5 3.5v3M16.5 3.5v3M4 9h16"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && (
        <DatePicker
          showTimePicker={showTimePicker}
          value={value}
          onChange={onChange}
          anchor={anchorName}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
