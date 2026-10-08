import {
  useCalendarApp,
  DayFlowCalendar,
  createDayView,
  createWeekView,
  createMonthView,
  createEventsPlugin,
} from "@dayflow/react";
import { createDragPlugin } from "@dayflow/plugin-drag";
import { createEvent, createAllDayEvent } from "@dayflow/core";
import "@dayflow/core/dist/styles.components.css"


export type CalendarType = {
  id: string;
  name: string;
  colors: {
    lineColor: string;
    eventColor: string;
    eventSelectedColor: string;
    textColor: string;
  };
};

export type EventType = {
  id: string;
  title: string;
  start: any;
  end: any;
  calendarId?: string;
  allDay?: boolean;
};

export default function Calendar({
  calendars,
  events,
  initialDate,
}: {
  calendars: CalendarType[];
  events: EventType[];
  initialDate: Date;
}) {
  const calendar = useCalendarApp({
    views: [createDayView(), createWeekView(), createMonthView()],
    plugins: [createDragPlugin(), createEventsPlugin()],
    calendars: calendars,
    events: events.map((event) => {
      if (event?.allDay)
        return createAllDayEvent({
          id: event.id,
          end: event.end,
          start: event.start,
          title: event.title,
          calendarId: event.calendarId,
        });
      else
        return createEvent({
          id: event.id,
          end: event.end,
          start: event.start,
          title: event.title,
          calendarId: event.calendarId,
        });
    }),
    initialDate,
  });

  return <DayFlowCalendar calendar={calendar} />;
}
