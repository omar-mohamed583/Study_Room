import {
  useCalendarApp,
  DayFlowCalendar,
  createDayView,
  createWeekView,
  createMonthView,
  createEventsPlugin,
} from "@dayflow/react";
import { createDragPlugin } from "@dayflow/plugin-drag";
import {
  createEvent,
  createAllDayEvent,
  temporalToDate,
  type CalendarCallbacks,
  type Event as DayFlowEvent,
  type ICalendarApp,
} from "@dayflow/core";
import "@dayflow/core/dist/styles.components.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useTheme from "~/context/themeContext";
import { apiFetch } from "~/api/api";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import LoadingComponent from "./LoadingComponent";
import CalendarEventDetailsDialog, {
  type CalendarEventFormValues,
} from "./CalendarEventDetailsDialog";
import type { Task } from "~/types/taskType";
import type { Exam } from "~/types/examType";
import type { Subject } from "~/types/subjectTypes";

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
}

type EventEntityType = "task" | "exam";

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

type EventIdentity = {
  entityType: EventEntityType;
  documentId: string;
};

type CalendarEventMutation =
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

type StudyDetailsDialogState = {
  mode: "create" | "edit";
  event: DayFlowEvent;
  identity?: EventIdentity;
  values: CalendarEventFormValues;
  initialValues: CalendarEventFormValues;
};

function getEventIdentity(event: Pick<DayFlowEvent, "id" | "meta">) {
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

function toDateTimeInput(value: DayFlowEvent["start"]) {
  const date = temporalToDate(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

function makeEventFromForm(
  event: DayFlowEvent,
  values: CalendarEventFormValues,
) {
  const start = new Date(values.startDateTime);
  const end =
    values.entityType === "exam"
      ? new Date(start.getTime() + 60 * 60_000)
      : new Date(values.endDateTime);
  const common = {
    id: event.id,
    title: values.title.trim(),
    description: values.description,
    calendarId: values.calendarId || undefined,
    conference: event.conference,
    meta: event.meta,
  };

  if (values.allDay) {
    const allDayStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const allDayEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    return createAllDayEvent({
      ...common,
      start: allDayStart,
      end: allDayEnd,
    });
  }

  return createEvent({ ...common, start, end, allDay: false });
}

function toEventType(event: DayFlowEvent, identity: EventIdentity): EventType {
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

function getNewRecordData(
  event: DayFlowEvent,
  values: CalendarEventFormValues,
  calendarDocumentId?: string,
) {
  const start = temporalToDate(event.start);
  const end = temporalToDate(event.end);
  const subjectRelation = values.subjectDocumentIds.length
    ? { subject: { connect: values.subjectDocumentIds } }
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
    return {
      ...common,
      examDate: start.toISOString(),
    };
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

function getEventMutationData(
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
  const duration = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60_000));
  const previousDuration =
    previousStart === undefined || previousEnd === undefined
      ? undefined
      : Math.max(1, Math.round((previousEnd - previousStart) / 60_000));
  if (!event.allDay && (!previousEvent || duration !== previousDuration)) {
    data.estimatedDuration = duration;
  }

  return data;
}

function getEventDetailsPatch(
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
  if (!sameSubjects) {
    data.subject = { set: values.subjectDocumentIds };
  }
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

function getSubjectDocumentIds(subject: Subject | Subject[] | null | undefined) {
  const subjects = Array.isArray(subject) ? subject : subject ? [subject] : [];
  return subjects.map((item) => item.documentId).filter(Boolean);
}

export default function Calendar({
  calendars,
  events,
  initialDate,
  calendarsLoading,
  subjects,
  subjectsLoading,
  tasks,
  exams,
}: {
  calendars: UnFormattedCalendarType[];
  calendarsLoading: boolean;
  events: EventType[];
  initialDate: Date;
  subjects: Subject[];
  subjectsLoading: boolean;
  tasks: Task[];
  exams: Exam[];
}) {
  const client = useQueryClient();
  const { setToasts } = useTheme();
  const defaultCalendarCreationStarted = useRef(false);
  const eventIdentities = useRef(new Map<string, EventIdentity>());
  const temporaryEventIds = useRef(new Set<string>());
  const seenCreateEventIds = useRef(new Set<string>());
  const temporaryEvents = useRef(new Map<string, DayFlowEvent>());
  const pendingMutationIds = useRef(new Set<string>());
  const queuedEventUpdates = useRef(new Map<string, DayFlowEvent>());
  const queuedEventDeletes = useRef(new Map<string, EventIdentity>());
  const warnedConferenceEvents = useRef(new Set<string>());
  const calendarApp = useRef<ICalendarApp | null>(null);
  const [detailsDialog, setDetailsDialog] =
    useState<StudyDetailsDialogState | null>(null);
  const [detailsDialogError, setDetailsDialogError] = useState<string | null>(
    null,
  );
  const [detailsDialogSaving, setDetailsDialogSaving] = useState(false);

  const createCalendarMutation = useMutation({
    mutationFn: () =>
      apiFetch("/calendars", {
        method: "POST",
        body: JSON.stringify({
          data: {
            name: "Default",
            lineColor: "#ff7452",
            eventColor: "#ff7452",
            eventSelectedColor: "#e85d3d",
            textColor: "#ffffff",
          },
        }),
      }),
    onSuccess: (response) => {
      const rawCalendar = response?.data;
      if (rawCalendar?.documentId) {
        const createdCalendar: UnFormattedCalendarType = {
          id: String(rawCalendar.id ?? rawCalendar.documentId),
          documentId: String(rawCalendar.documentId),
          name: rawCalendar.name,
          lineColor: rawCalendar.lineColor,
          eventColor: rawCalendar.eventColor,
          eventSelectedColor: rawCalendar.eventSelectedColor,
          textColor: rawCalendar.textColor,
        };
        client.setQueryData<UnFormattedCalendarType[]>(
          ["/calendars?populate=*", null],
          (current = []) =>
            current.some((calendar) => calendar.documentId === createdCalendar.documentId)
              ? current
              : [...current, createdCalendar],
        );
      }
    },
    onError: (error) => {
      setToasts((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          title: "Calendar creation failed",
          description: error.message,
          actionBtnText: "Dismiss",
          icon: "fail",
          onAction: () => {},
        },
      ]);
    },
  });

  useEffect(() => {
    if (
      !calendarsLoading &&
      calendars.length === 0 &&
      !defaultCalendarCreationStarted.current
    ) {
      defaultCalendarCreationStarted.current = true;
      createCalendarMutation.mutate();
    }
  }, [calendarsLoading, calendars.length]);

  const isDesktop =
    typeof window === "undefined" ||
    window.matchMedia("(pointer: fine)").matches;

  const mutateCalendarEvents = useMutation({
    mutationFn: (mutation: CalendarEventMutation) => {
      if (mutation.action === "create") {
        return apiFetch(`/${mutation.values.entityType}s`, {
          method: "POST",
          body: JSON.stringify({
            data: getNewRecordData(
              mutation.event,
              mutation.values,
              mutation.calendarDocumentId,
            ),
          }),
        });
      }

      const endpoint = `/${mutation.identity.entityType}s/${encodeURIComponent(mutation.identity.documentId)}`;
      if (mutation.action === "delete") {
        return apiFetch(endpoint, { method: "DELETE" });
      }

      return apiFetch(endpoint, {
        method: "PUT",
        body: JSON.stringify({ data: mutation.data }),
      });
    },
    onError: (error, mutation) => {
      const action =
        mutation.action === "create"
          ? "create"
          : mutation.action === "update"
            ? "update"
            : "delete";
      setToasts((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          title: `Event ${action} failed`,
          description: error.message,
          actionBtnText: "Dismiss",
          icon: "fail",
          onAction: () => {},
        },
      ]);
    },
  });

  const onCalendarReady = useCallback((app: ICalendarApp) => {
    calendarApp.current = app;
  }, []);

  function showToast(
    title: string,
    description: string,
    icon: "fail" | "success" | "alert" = "fail",
  ) {
    setToasts((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        title,
        description,
        actionBtnText: "Dismiss",
        icon,
        onAction: () => {},
      },
    ]);
  }

  function showMissingEventToast() {
    showToast(
      "Event change failed",
      "This calendar event is not linked to a task or exam.",
    );
  }

  async function refreshEventData(entityType: EventEntityType) {
    await Promise.all(
      [
        `/${entityType}s?populate=*`,
        "/subjects?populate=*",
        "/study-sessions?populate=*",
      ].map((queryKey) => client.invalidateQueries({ queryKey: [queryKey] })),
    );
  }

  function getCalendarDocumentId(calendarId?: string) {
    if (!calendarId) return undefined;
    return calendars.find(
      (calendar) =>
        calendar.documentId === calendarId || calendar.id === calendarId,
    )?.documentId;
  }

  function handleEventCreate(event: DayFlowEvent) {
    if (seenCreateEventIds.current.has(event.id)) return;
    seenCreateEventIds.current.add(event.id);
    temporaryEventIds.current.add(event.id);
    temporaryEvents.current.set(event.id, event);
    setDetailsDialogError(null);

    const initialValues: CalendarEventFormValues = {
      entityType: "task",
      title: event.title,
      subjectDocumentIds: [],
      calendarId: event.calendarId ?? "",
      startDateTime: toDateTimeInput(event.start),
      endDateTime: toDateTimeInput(event.end),
      description: event.description ?? "",
      allDay: Boolean(event.allDay),
      priority: "medium",
      completed: false,
    };
    setDetailsDialog({ mode: "create", event, values: initialValues, initialValues });
  }

  function getExistingValues(
    event: DayFlowEvent,
    identity: EventIdentity,
  ): CalendarEventFormValues {
    const eventValues = {
      entityType: identity.entityType,
      title: event.title,
      calendarId: event.calendarId ?? "",
      startDateTime: toDateTimeInput(event.start),
      endDateTime: toDateTimeInput(event.end),
      description: event.description ?? "",
      allDay: Boolean(event.allDay),
    } as const;

    if (identity.entityType === "task") {
      const task = tasks.find((item) => item.documentId === identity.documentId);
      return {
        ...eventValues,
        entityType: "task",
        subjectDocumentIds: getSubjectDocumentIds(task?.subject),
        priority: task?.priority ?? "medium",
        completed: task?.completed ?? false,
      };
    }

    const exam = exams.find((item) => item.documentId === identity.documentId);
    return {
      ...eventValues,
      entityType: "exam",
      subjectDocumentIds: getSubjectDocumentIds(exam?.subject),
      priority: "medium",
      completed: false,
    };
  }

  function handleEventClick(event: DayFlowEvent) {
    const identity = getEventIdentity(event) ?? eventIdentities.current.get(event.id);
    if (!identity) {
      showMissingEventToast();
      return;
    }

    const values = getExistingValues(event, identity);
    setDetailsDialogError(null);
    setDetailsDialog({
      mode: "edit",
      event,
      identity,
      values,
      initialValues: values,
    });
  }

  async function handleEventUpdate(event: DayFlowEvent) {
    if (temporaryEventIds.current.has(event.id)) {
      temporaryEvents.current.set(event.id, event);
      setDetailsDialog((current) =>
        current?.mode === "create" && current.event.id === event.id
          ? { ...current, event }
          : current,
      );
      return;
    }

    const identity = getEventIdentity(event) ?? eventIdentities.current.get(event.id);

    if (!identity) {
      showMissingEventToast();
      return;
    }

    const previousEvent = events.find(
      (candidate) => candidate.id === event.id ||
        (candidate.meta.entityType === identity.entityType &&
          candidate.meta.documentId === identity.documentId),
    );
    if (event.conference && !warnedConferenceEvents.current.has(event.id)) {
      warnedConferenceEvents.current.add(event.id);
      showToast(
        "Meeting details are not stored",
        "Task and Exam records do not have a conference field, so this Dayflow value will not persist to Strapi.",
        "alert",
      );
    }

    let eventData: Record<string, unknown>;
    try {
      eventData = getEventMutationData(
        event,
        identity.entityType,
        previousEvent,
        getCalendarDocumentId(event.calendarId),
      );
    } catch (error) {
      showToast(
        "Event update failed",
        error instanceof Error ? error.message : "The selected calendar could not be saved.",
      );
      return;
    }

    const previousDuration = previousEvent
      ? previousEvent.end.getTime() - previousEvent.start.getTime()
      : null;
    const nextDuration =
      temporalToDate(event.end).getTime() - temporalToDate(event.start).getTime();
    if (
      identity.entityType === "exam" &&
      previousDuration !== null &&
      previousDuration !== nextDuration
    ) {
      showToast(
        "Exam duration is not stored",
        "The exam record stores its start date only, so Dayflow cannot persist a changed end time.",
        "alert",
      );
    }

    if (Object.keys(eventData).length === 0) return;

    const mutationId = `${identity.entityType}:${identity.documentId}`;
    if (pendingMutationIds.current.has(mutationId)) {
      queuedEventUpdates.current.set(event.id, event);
      return;
    }
    pendingMutationIds.current.add(mutationId);
    try {
      await mutateCalendarEvents.mutateAsync({
        action: "update",
        identity,
        data: eventData,
      });
      eventIdentities.current.set(event.id, identity);
      await refreshEventData(identity.entityType);
    } catch {
      await refreshEventData(identity.entityType);
    } finally {
      pendingMutationIds.current.delete(mutationId);
      const queuedDelete = queuedEventDeletes.current.get(mutationId);
      if (queuedDelete) {
        queuedEventDeletes.current.delete(mutationId);
        queuedEventUpdates.current.delete(event.id);
        void handleEventDelete(event.id);
      } else {
        const queuedUpdate = queuedEventUpdates.current.get(event.id);
        if (queuedUpdate) {
          queuedEventUpdates.current.delete(event.id);
          void handleEventUpdate(queuedUpdate);
        }
      }
    }
  }

  async function handleEventDelete(eventId: string) {
    if (temporaryEventIds.current.delete(eventId)) {
      temporaryEvents.current.delete(eventId);
      setDetailsDialog((current) =>
        current?.mode === "create" && current.event.id === eventId ? null : current,
      );
      return;
    }

    const originalEvent = events.find((event) => event.id === eventId);
    const identity =
      (originalEvent && getEventIdentity(originalEvent)) ??
      eventIdentities.current.get(eventId) ??
      getEventIdentity({ id: eventId, meta: undefined });

    if (!identity) {
      showMissingEventToast();
      return;
    }

    const mutationId = `${identity.entityType}:${identity.documentId}`;
    if (pendingMutationIds.current.has(mutationId)) {
      queuedEventUpdates.current.delete(eventId);
      queuedEventDeletes.current.set(mutationId, identity);
      return;
    }
    pendingMutationIds.current.add(mutationId);
    try {
      await mutateCalendarEvents.mutateAsync({
        action: "delete",
        identity,
      });
      eventIdentities.current.delete(eventId);
      await refreshEventData(identity.entityType);
    } catch {
      await refreshEventData(identity.entityType);
    } finally {
      pendingMutationIds.current.delete(mutationId);
      queuedEventUpdates.current.delete(eventId);
    }
  }

  async function handleDetailsDelete() {
    if (
      !detailsDialog ||
      detailsDialog.mode !== "edit" ||
      !detailsDialog.identity ||
      detailsDialogSaving
    ) {
      return;
    }

    const { identity } = detailsDialog;
    const mutationId = `${identity.entityType}:${identity.documentId}`;
    if (pendingMutationIds.current.has(mutationId)) return;
    pendingMutationIds.current.add(mutationId);
    setDetailsDialogSaving(true);
    setDetailsDialogError(null);
    try {
      await mutateCalendarEvents.mutateAsync({ action: "delete", identity });
      eventIdentities.current.delete(detailsDialog.event.id);
      setDetailsDialog(null);
      await refreshEventData(identity.entityType);
    } catch (error) {
      setDetailsDialogError(
        error instanceof Error ? error.message : "The event could not be deleted.",
      );
    } finally {
      pendingMutationIds.current.delete(mutationId);
      setDetailsDialogSaving(false);
    }
  }

  function handleDialogCancel() {
    const current = detailsDialog;
    if (!current || detailsDialogSaving) return;

    if (current.mode === "create" && temporaryEventIds.current.delete(current.event.id)) {
      temporaryEvents.current.delete(current.event.id);
      calendarApp.current?.applyEventsChanges(
        { delete: [current.event.id] },
        false,
        "remote",
      );
    }

    setDetailsDialog(null);
    setDetailsDialogError(null);
  }

  async function handleDetailsSubmit(
    submitEvent: FormEvent<HTMLFormElement>,
  ) {
    submitEvent.preventDefault();
    if (!detailsDialog || detailsDialogSaving) return;
    const values = detailsDialog.values;
    const start = new Date(values.startDateTime);
    const end = new Date(values.endDateTime);
    if (
      !values.title.trim() ||
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      start > end
    ) {
      setDetailsDialogError("Enter a title and a valid event time range.");
      return;
    }
    if (
      values.entityType === "task" &&
      !values.subjectDocumentIds[0]
    ) {
      setDetailsDialogError("Select a subject before saving.");
      return;
    }
    if (detailsDialog.mode === "edit" && !detailsDialog.identity) {
      setDetailsDialogError("This event is missing its Strapi record identity.");
      return;
    }

    const mutationId =
      detailsDialog.mode === "create"
        ? detailsDialog.event.id
        : `${detailsDialog.identity?.entityType}:${detailsDialog.identity?.documentId}`;
    if (pendingMutationIds.current.has(mutationId)) return;
    pendingMutationIds.current.add(mutationId);
    setDetailsDialogSaving(true);
    setDetailsDialogError(null);

    let createdIdentity: EventIdentity | null = null;
    let createResponseReceived = false;
    try {
      const sourceEvent =
        detailsDialog.mode === "create"
          ? temporaryEvents.current.get(detailsDialog.event.id) ?? detailsDialog.event
          : detailsDialog.event;
      const eventFromForm = makeEventFromForm(sourceEvent, values);
      const submittedEvent: DayFlowEvent =
        detailsDialog.mode === "edit" && detailsDialog.identity
          ? {
              ...eventFromForm,
              meta: {
                ...eventFromForm.meta,
                entityType: detailsDialog.identity.entityType,
                documentId: detailsDialog.identity.documentId,
              },
            }
          : eventFromForm;

      if (detailsDialog.mode === "create") {
        if (!calendarApp.current) {
          throw new Error("The calendar is still initializing. Try saving again.");
        }

        const calendarDocumentId = getCalendarDocumentId(submittedEvent.calendarId);
        if (submittedEvent.calendarId && !calendarDocumentId) {
          throw new Error("The selected calendar has no Strapi documentId.");
        }

        const response = await mutateCalendarEvents.mutateAsync({
          action: "create",
          event: submittedEvent,
          values,
          calendarDocumentId,
        });
        createResponseReceived = true;
        const documentId = response?.data?.documentId;
        if (typeof documentId !== "string" || documentId.length === 0) {
          throw new Error("Strapi did not return a documentId for the new event.");
        }

        createdIdentity = {
          entityType: values.entityType,
          documentId,
        };
        const persistedEvent: DayFlowEvent = {
          ...submittedEvent,
          id: `${createdIdentity.entityType}-${documentId}`,
          meta: {
            ...submittedEvent.meta,
            entityType: createdIdentity.entityType,
            documentId,
          },
        };
        eventIdentities.current.set(submittedEvent.id, createdIdentity);
        eventIdentities.current.set(persistedEvent.id, createdIdentity);
        calendarApp.current.applyEventsChanges(
          { delete: [submittedEvent.id], add: [persistedEvent] },
          false,
          "remote",
        );
        temporaryEventIds.current.delete(submittedEvent.id);
        temporaryEvents.current.delete(submittedEvent.id);
        setDetailsDialog(null);
        await refreshEventData(createdIdentity.entityType);
      } else if (detailsDialog.identity) {
        const identity = detailsDialog.identity;
        const previousEvent = events.find(
          (candidate) =>
            candidate.id === detailsDialog.event.id ||
            (candidate.meta.entityType === identity.entityType &&
              candidate.meta.documentId === identity.documentId),
        ) ?? toEventType(detailsDialog.event, identity);
        const calendarDocumentId = getCalendarDocumentId(submittedEvent.calendarId);
        if (submittedEvent.calendarId && !calendarDocumentId) {
          throw new Error("The selected calendar has no Strapi documentId.");
        }
        const eventData = getEventMutationData(
          submittedEvent,
          identity.entityType,
          previousEvent,
          calendarDocumentId,
        );
        const detailsData = getEventDetailsPatch(
          identity,
          values,
          detailsDialog.initialValues,
        );
        const data = { ...eventData, ...detailsData };
        if (Object.keys(data).length > 0) {
          await mutateCalendarEvents.mutateAsync({
            action: "update",
            identity,
            data,
          });
          eventIdentities.current.set(submittedEvent.id, identity);
          try {
            calendarApp.current?.applyEventsChanges(
              {
                update: [
                  {
                    id: submittedEvent.id,
                    updates: {
                      title: submittedEvent.title,
                      start: submittedEvent.start,
                      end: submittedEvent.end,
                      description: submittedEvent.description,
                      allDay: submittedEvent.allDay,
                      calendarId: submittedEvent.calendarId,
                      meta: submittedEvent.meta,
                      conference: submittedEvent.conference,
                    },
                  },
                ],
              },
              false,
              "remote",
            );
          } catch {
            // The Strapi query refresh below will reconcile the calendar.
          }
          await refreshEventData(identity.entityType);
        }
        setDetailsDialog(null);
      }
    } catch (error) {
      if (createdIdentity || createResponseReceived) {
        const temporaryEventId = detailsDialog.event.id;
        if (temporaryEventIds.current.delete(temporaryEventId)) {
          temporaryEvents.current.delete(temporaryEventId);
          try {
            calendarApp.current?.applyEventsChanges(
              { delete: [temporaryEventId] },
              false,
              "remote",
            );
          } catch {
            // The refreshed Strapi query below will reconcile the calendar.
          }
        }
        temporaryEventIds.current.delete(detailsDialog.event.id);
        temporaryEvents.current.delete(detailsDialog.event.id);
        setDetailsDialog(null);
        await refreshEventData(
          createdIdentity?.entityType ?? values.entityType,
        );
        showToast(
          createdIdentity
            ? "Event created; calendar refresh requested"
            : "Event response was incomplete",
          createdIdentity
            ? "The record was saved, but the calendar could not update its temporary event. The saved record will reload from Strapi."
            : "Strapi accepted the request without returning a documentId. The calendar was refreshed; check the saved records before trying again.",
          "alert",
        );
      } else {
        setDetailsDialogError(
          error instanceof Error ? error.message : "The event could not be saved.",
        );
      }
    } finally {
      pendingMutationIds.current.delete(mutationId);
      setDetailsDialogSaving(false);
    }
  }

  function handleFormChange(values: CalendarEventFormValues) {
    setDetailsDialog((current) => (current ? { ...current, values } : current));
  }

  function handleFormReset() {
    setDetailsDialog((current) =>
      current ? { ...current, values: current.initialValues } : current,
    );
  }

  if (!isDesktop)
    return (
      <div className="font-black text-lg fixed top-1/2 left-1/2 -translate-1/2 text-center text-balance">
        Please Open This Page On Desktop For Better Experince
      </div>
    );

  if (calendarsLoading || createCalendarMutation.isPending)
    return (
      <LoadingComponent
        loading={calendarsLoading || createCalendarMutation.isPending}
      />
    );

  return (
    <>
      <CalendarView
        flatCalendars={calendars}
        initialDate={initialDate}
        unIdentifiedEvents={events}
        onCalendarReady={onCalendarReady}
        callbacks={{
          onEventUpdate: handleEventUpdate,
          onEventCreate: handleEventCreate,
          onEventDelete: handleEventDelete,
          onEventClick: handleEventClick,
        }}
      />
      {detailsDialog && (
        <CalendarEventDetailsDialog
          key={`${detailsDialog.mode}-${detailsDialog.event.id}`}
          open
          mode={detailsDialog.mode}
          values={detailsDialog.values}
          initialValues={detailsDialog.initialValues}
          subjects={subjects}
          subjectsLoading={subjectsLoading}
          calendars={calendars}
          isSaving={detailsDialogSaving}
          error={detailsDialogError}
          onChange={handleFormChange}
          onSubmit={handleDetailsSubmit}
          onCancel={handleDialogCancel}
          onDelete={handleDetailsDelete}
          onReset={handleFormReset}
        />
      )}
    </>
  );
}

type ViewProps = {
  flatCalendars: UnFormattedCalendarType[];
  unIdentifiedEvents: EventType[];
  initialDate: Date;
  callbacks: CalendarCallbacks;
  onCalendarReady: (app: ICalendarApp) => void;
};

function CalendarView({
  flatCalendars,
  unIdentifiedEvents,
  initialDate,
  callbacks,
  onCalendarReady,
}: ViewProps) {
  const calendars = flatCalendars.map((cal) => ({
    name: cal.name,
    id: cal.documentId ?? cal.id,
    colors: {
      lineColor: cal.lineColor,
      eventColor: cal.eventColor,
      eventSelectedColor: cal.eventSelectedColor,
      textColor: cal.textColor,
    },
  }));
  const views = [createDayView(), createWeekView(), createMonthView()];
  const plugins = [createDragPlugin(), createEventsPlugin()];
  const events = unIdentifiedEvents.map((event) => {
    if (event?.allDay)
      return createAllDayEvent({
        id: event.id,
        end: event.end,
        start: event.start,
        title: event.title,
        calendarId: event?.calendarId,
        description: event.description,
        meta: {
          entityType: event.meta.entityType,
          documentId: event.meta.documentId,
        },
      });
    else
      return createEvent({
        id: event.id,
        end: event.end,
        start: event.start,
        description: event.description,
        title: event.title,
        calendarId: event?.calendarId,
        meta: {
          entityType: event.meta.entityType,
          documentId: event.meta.documentId,
        },
      });
  });

  const calendar = useCalendarApp({
    views,
    plugins,
    calendars: calendars,
    eventDetailTrigger: "click",
    events: events,
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
