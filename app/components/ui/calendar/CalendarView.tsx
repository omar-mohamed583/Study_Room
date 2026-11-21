import {
  DayFlowCalendar,
  createDayView,
  createWeekView,
  createMonthView,
  createEventsPlugin,
  useCalendarApp,
} from "@dayflow/react";
import { createDragPlugin } from "@dayflow/plugin-drag";
import {
  createAllDayEvent,
  createEvent,
  type Event as DayFlowEvent,
} from "@dayflow/core";
import { useEffect } from "react";
import type { CalendarViewProps } from "./calendarTypes";

export default function CalendarView({
  flatCalendars,
  unIdentifiedEvents,
  initialDate,
  callbacks,
  onCalendarReady,
}: CalendarViewProps) {
  const calendars = flatCalendars.map((calendar) => ({
    name: calendar.name,
    id: calendar.documentId ?? calendar.id,
    colors: {
      lineColor: calendar.lineColor,
      eventColor: calendar.eventColor,
      eventSelectedColor: calendar.eventSelectedColor,
      textColor: calendar.textColor,
    },
  }));
  const views = [createDayView(), createWeekView(), createMonthView()];
  const plugins = [createDragPlugin(), createEventsPlugin()];
  const events: DayFlowEvent[] = unIdentifiedEvents.map((event) => {
    const common = {
      id: event.id,
      title: typeof event.title === "string" ? event.title : "Untitled event",
      description: typeof event.description === "string" ? event.description : "",
      calendarId: event.calendarId,
      meta: {
        entityType: event.meta?.entityType,
        documentId: event.meta?.documentId,
      },
    };

    return event.allDay
      ? createAllDayEvent({
          ...common,
          start: event.start,
          end: event.end,
        })
      : createEvent({
          ...common,
          start: event.start,
          end: event.end,
        });
  });

  const calendar = useCalendarApp({
    views,
    plugins,
    calendars,
    eventDetailTrigger: "click",
    events,
    initialDate,
    useEventDetailDialog: false,
    useEventDetailPanel: false,
    callbacks,
  });

  useEffect(() => {
    onCalendarReady(calendar.app);
  }, [calendar.app, onCalendarReady]);

  return (
    <DayFlowCalendar
      calendar={calendar}
      eventContextMenu={({ event, onClose }) => (
        <div
          role="menu"
          className="min-w-40 rounded-lg border border-zinc-400/35 bg-white p-1 text-neutral-950 shadow-lg dark:bg-neutral-950 dark:text-white"
        >
          <button
            type="button"
            role="menuitem"
            className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-zinc-400/15"
            onClick={() => {
              onClose();
              void callbacks.onEventClick?.(event);
            }}
          >
            Edit event
          </button>
        </div>
      )}
    />
  );
}
