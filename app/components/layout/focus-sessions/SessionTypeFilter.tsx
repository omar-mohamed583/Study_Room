import { useEffect, useId, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent, MouseEvent } from "react";
import type { SessionFilter } from "~/types/studySessions";
import { CheckIcon, ChevronDownIcon, ListFilterIcon } from "./icons";
import { FILTER_OPTIONS, SESSION_TYPE_META } from "./SessionTypeMeta";

interface SessionTypeFilterProps {
  value: SessionFilter;
  onChange: (value: SessionFilter) => void;
  counts: Record<SessionFilter, number>;
}

// A select-only combobox (WAI-ARIA pattern): DOM focus stays on the trigger and
// the highlighted option is announced through aria-activedescendant.
//   Closed: Enter / Space / Arrow keys open the list.
//   Open:   Arrow keys, Home and End move; Enter / Space choose; Esc closes.
export default function SessionTypeFilter({
  value,
  onChange,
  counts,
}: SessionTypeFilterProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  const lastIndex = FILTER_OPTIONS.length - 1;
  const selectedIndex = Math.max(
    0,
    FILTER_OPTIONS.findIndex((option) => option.value === value),
  );
  const selectedLabel = FILTER_OPTIONS[selectedIndex]?.label;

  // Close when a pointer goes down outside the control. Safari doesn't focus a
  // button on click, so relying on blur alone would leave the list open there.
  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  function openList() {
    setActiveIndex(selectedIndex);
    setOpen(true);
    triggerRef.current?.focus();
  }

  function choose(index: number) {
    const option = FILTER_OPTIONS[index];
    if (option) onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleTriggerClick(event: MouseEvent<HTMLButtonElement>) {
    if (!open) return openList();
    // Enter or Space on a button arrives as a click with detail 0: pick the
    // highlighted option. A pointer click on the trigger just closes the list.
    if (event.detail === 0) return choose(activeIndex);
    setOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (open) setActiveIndex((index) => Math.min(index + 1, lastIndex));
        else openList();
        break;
      case "ArrowUp":
        event.preventDefault();
        if (open) setActiveIndex((index) => Math.max(index - 1, 0));
        else openList();
        break;
      case "Home":
        if (open) {
          event.preventDefault();
          setActiveIndex(0);
        }
        break;
      case "End":
        if (open) {
          event.preventDefault();
          setActiveIndex(lastIndex);
        }
        break;
      case "Escape":
        if (open) {
          event.preventDefault();
          setOpen(false);
        }
        break;
    }
  }

  // Tabbing away (or focus leaving the window) closes the list.
  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!rootRef.current?.contains(event.relatedTarget as Node | null)) {
      setOpen(false);
    }
  }

  return (
    <div
      ref={rootRef}
      className="relative"
      onBlur={handleBlur}
    >
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-label="Filter by session type"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? `${listId}-${activeIndex}` : undefined}
        onClick={handleTriggerClick}
        onKeyDown={handleKeyDown}
        className="inline-flex h-10 items-center gap-2 rounded-xl border bg-(--sect-bg) pr-3 pl-3.5 text-sm font-medium text-(--text-primary) hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--text-primary) leading-[normal] aria-expanded:bg-muted/60"
      >
        <ListFilterIcon className="size-4 text-(--text-secondary)" />
        <span>{selectedLabel}</span>
        <ChevronDownIcon
          className={`size-4 text-(--text-secondary) transition-transform duration-150 motion-reduce:transition-none ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Session type"
          className="absolute left-0 z-20 mt-2 w-60 origin-top-left animate-in rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg duration-150 fade-in-0 zoom-in-95 slide-in-from-top-1 motion-reduce:animate-none sm:right-0 sm:left-auto sm:origin-top-right"
        >
          {FILTER_OPTIONS.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;
            return (
              <li
                key={option.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={isSelected}
                // Keep focus on the trigger while the pointer is used.
                onMouseDown={(event) => event.preventDefault()}
                onMouseMove={() => setActiveIndex(index)}
                onClick={() =>
                  document.startViewTransition(() => {
                    choose(index);
                  })
                }
                className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm ${
                  isActive ? "bg-accent text-accent-foreground" : ""
                } ${isSelected ? "font-medium" : ""}`}
              >
                <span
                  aria-hidden="true"
                  className={`size-2 shrink-0 rounded-full ${
                    option.value === "all"
                      ? "bg-muted-foreground/50"
                      : SESSION_TYPE_META[option.value].dot
                  }`}
                />
                <span className="flex-1">{option.label}</span>
                <span className="text-xs text-(--text-secondary)">
                  {counts[option.value]}
                </span>
                <span className="grid size-4 place-items-center">
                  {isSelected && <CheckIcon className="size-4" />}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
