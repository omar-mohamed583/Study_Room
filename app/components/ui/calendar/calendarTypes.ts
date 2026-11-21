import type {
  CalendarCallbacks,
  Event as DayFlowEvent,
  ICalendarApp,
} from "@dayflow/core";
import type { CalendarEventFormValues } from "./CalendarEventDetailsDialog";

export type CalendarType = {
  id: string;
  documentId?: string;
  name: string;
  colors: {
    lineColor: string;
    eventColor: string;
    eventSelectedColor: string;
    textColor: string;
  };
};

export type UnFormattedCalendarType = {
  id: string;
  documentId?: string;
  name: string;
  lineColor: string;
  eventColor: string;
  eventSelectedColor: string;
  textColor: string;
};

export type EventEntityType = "task" | "exam";

export type EventType = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description: string;
  calendarId?: string;
  allDay?: boolean;
  meta: {
    entityType: EventEntityType;
    documentId: string;
  };
};

export type EventIdentity = {
  entityType: EventEntityType;
  documentId: string;
};

export type EventQueryRecord = {
  documentId?: string;
  [field: string]: unknown;
};

export type EventQueryResponse = {
  data?: EventQueryRecord[];
  [field: string]: unknown;
};

export type CalendarEventMutation =
  | {
      action: "create";
      event: DayFlowEvent;
      values: CalendarEventFormValues;
      calendarDocumentId?: string;
    }
  | {
      action: "update";
      identity: EventIdentity;
      data: Record<string, unknown>;
    }
  | { action: "delete"; identity: EventIdentity };

export type StudyDetailsDialogState = {
  mode: "create" | "edit";
  event: DayFlowEvent;
  identity?: EventIdentity;
  values: CalendarEventFormValues;
  initialValues: CalendarEventFormValues;
};

export type CalendarViewProps = {
  flatCalendars: UnFormattedCalendarType[];
  unIdentifiedEvents: EventType[];
  initialDate: Date;
  callbacks: CalendarCallbacks;
  onCalendarReady: (app: ICalendarApp) => void;
};
