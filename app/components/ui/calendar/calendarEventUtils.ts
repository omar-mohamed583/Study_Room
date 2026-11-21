import {
  createAllDayEvent,
  createEvent,
  temporalToDate,
  type Event as DayFlowEvent,
} from "@dayflow/core";
import type { Subject } from "~/types/subjectTypes";
import { dateTimeInputToDate } from "~/components/utils/dateTime";
import type { CalendarEventFormValues } from "./CalendarEventDetailsDialog";
import type {
  EventEntityType,
  EventIdentity,
  EventType,
} from "./calendarTypes";

export function getEntityLabel(entityType: EventEntityType) {
  return entityType === "task" ? "Task" : "Exam";
}

export function getEventIdentity(event: Pick<DayFlowEvent, "id" | "meta">) {
  const entityType = event.meta?.entityType;
  const documentId = event.meta?.documentId;

  if (
    (entityType === "task" || entityType === "exam") &&
    typeof documentId === "string" &&
    documentId.length > 0
  ) {
    return { entityType, documentId } satisfies EventIdentity;
  }

  const prefixedId = /^(task|exam)-(.+)$/.exec(event.id);
  if (prefixedId) {
    return {
      entityType: prefixedId[1] as EventEntityType,
      documentId: prefixedId[2],
    } satisfies EventIdentity;
  }

  return undefined;
}

export function makeEventFromForm(
  event: DayFlowEvent,
  values: CalendarEventFormValues,
) {
  const start = dateTimeInputToDate(values.startDateTime);
  const end =
    values.entityType === "exam"
      ? new Date(start.getTime() + 60 * 60_000)
      : dateTimeInputToDate(values.endDateTime);
  const common = {
    id: event.id,
    title: values.title.trim(),
    description: values.description,
    calendarId: values.calendarId || undefined,
    conference: event.conference,
    meta: event.meta,
  };

  if (values.allDay) {
    const allDayStart = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
    );
    const allDayEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    return createAllDayEvent({ ...common, start: allDayStart, end: allDayEnd });
  }

  return createEvent({ ...common, start, end, allDay: false });
}

export function toEventType(
  event: DayFlowEvent,
  identity: EventIdentity,
): EventType {
  return {
    id: event.id,
    title: event.title,
    start: temporalToDate(event.start),
    end: temporalToDate(event.end),
    description: event.description ?? "",
    calendarId: event.calendarId,
    allDay: Boolean(event.allDay),
    meta: identity,
  };
}

export function getNewRecordData(
  event: DayFlowEvent,
  values: CalendarEventFormValues,
  calendarDocumentId?: string,
) {
  const start = temporalToDate(event.start);
  const end = temporalToDate(event.end);
  const subjectRelation = values.subjectDocumentIds.length
    ? { subject: values.subjectDocumentIds[0] }
    : {};
  const calendarRelation = calendarDocumentId
    ? { calendars: { connect: [calendarDocumentId] } }
    : {};
  const common = {
    title: event.title.trim() || `Untitled ${values.entityType}`,
    description: event.description ?? "",
    calendarAllDay: Boolean(event.allDay),
    ...subjectRelation,
    ...calendarRelation,
  };

  if (values.entityType === "exam") {
    return { ...common, examDate: start.toISOString() };
  }

  return {
    ...common,
    dueDate: end.toISOString(),
    estimatedDuration: event.allDay
      ? 60
      : Math.max(1, Math.round((end.getTime() - start.getTime()) / 60_000)),
    priority: values.priority,
    completed: values.completed,
    ...(values.completed ? { completedAt: new Date().toISOString() } : {}),
  };
}

export function getEventMutationData(
  event: DayFlowEvent,
  entityType: EventEntityType,
  previousEvent: EventType | undefined,
  calendarDocumentId?: string,
) {
  const start = temporalToDate(event.start);
  const end = temporalToDate(event.end);
  const data: Record<string, unknown> = {};
  const previousStart = previousEvent?.start.getTime();
  const previousEnd = previousEvent?.end.getTime();

  if (!previousEvent || event.title !== previousEvent.title) {
    data.title = event.title;
  }
  if (!previousEvent || (event.description ?? "") !== previousEvent.description) {
    data.description = event.description ?? "";
  }
  if (!previousEvent || Boolean(event.allDay) !== Boolean(previousEvent.allDay)) {
    data.calendarAllDay = Boolean(event.allDay);
  }
  if (previousEvent && event.calendarId !== previousEvent.calendarId) {
    if (event.calendarId && !calendarDocumentId) {
      throw new Error("The selected calendar has no Strapi documentId.");
    }
    data.calendars = calendarDocumentId
      ? { set: [calendarDocumentId] }
      : { set: [] };
  }

  if (entityType === "exam") {
    if (!previousEvent || start.getTime() !== previousStart) {
      data.examDate = start.toISOString();
    }
    return data;
  }

  if (!previousEvent || end.getTime() !== previousEnd) {
    data.dueDate = end.toISOString();
  }
  const duration = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / 60_000),
  );
  const previousDuration =
    previousStart === undefined || previousEnd === undefined
      ? undefined
      : Math.max(1, Math.round((previousEnd - previousStart) / 60_000));
  if (!event.allDay && (!previousEvent || duration !== previousDuration)) {
    data.estimatedDuration = duration;
  }

  return data;
}

export function getEventDetailsPatch(
  identity: EventIdentity,
  values: CalendarEventFormValues,
  initialValues: CalendarEventFormValues,
) {
  const data: Record<string, unknown> = {};
  const sameSubjects =
    values.subjectDocumentIds.length === initialValues.subjectDocumentIds.length &&
    values.subjectDocumentIds.every((documentId) =>
      initialValues.subjectDocumentIds.includes(documentId),
    );
  if (!sameSubjects) data.subject = { set: values.subjectDocumentIds };

  if (identity.entityType === "task") {
    if (values.priority !== initialValues.priority) {
      data.priority = values.priority;
    }
    if (values.completed !== initialValues.completed) {
      data.completed = values.completed;
      data.completedAt = values.completed ? new Date().toISOString() : null;
    }
  }

  return data;
}

export function getSubjectDocumentIds(
  subject: Subject | Subject[] | null | undefined,
) {
  const subjects = Array.isArray(subject) ? subject : subject ? [subject] : [];
  return subjects.map((item) => item.documentId).filter(Boolean);
}
