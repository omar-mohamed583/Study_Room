import {
  temporalToDate,
  type Event as DayFlowEvent,
  type ICalendarApp,
} from "@dayflow/core";
import "@dayflow/core/dist/styles.components.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useTheme from "~/context/themeContext";
import { apiFetch } from "~/api/api";
import { queryKeys } from "~/api/queryKeys";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type SubmitEvent,
} from "react";
import LoadingComponent from "../global/LoadingComponent";
import DesktopNotice from "../global/DesktopNotice";
import CalendarEventDetailsDialog, {
  type CalendarEventFormValues,
} from "./CalendarEventDetailsDialog";
import CalendarView from "./CalendarView";
import type { Task } from "~/types/taskType";
import type { Exam } from "~/types/examType";
import type { Subject } from "~/types/subjectTypes";
import {
  dateTimeInputToDate,
  dateToDateTimeInput,
} from "~/components/utils/dateTime";
import {
  getEntityLabel,
  getEventDetailsPatch,
  getEventIdentity,
  getEventMutationData,
  getNewRecordData,
  getSubjectDocumentIds,
  makeEventFromForm,
  toEventType,
} from "./calendarEventUtils";
import type {
  CalendarEventMutation,
  EventEntityType,
  EventIdentity,
  EventQueryRecord,
  EventQueryResponse,
  EventType,
  StudyDetailsDialogState,
  UnFormattedCalendarType,
} from "./calendarTypes";

export type {
  CalendarType,
  EventType,
  UnFormattedCalendarType,
} from "./calendarTypes";

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
  const { setToast } = useTheme();
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
        client.setQueryData<{ data?: UnFormattedCalendarType[] }>(
          queryKeys.calendars,
          (current) => {
            const currentCalendars = current?.data ?? [];
            if (
              currentCalendars.some(
                (calendar) =>
                  calendar.documentId === createdCalendar.documentId,
              )
            ) {
              return current;
            }
            return { ...current, data: [...currentCalendars, createdCalendar] };
          },
        );
      }
    },
    onError: (error) => {
      setToast({
          title: "Calendar creation failed",
          description: error.message,
          actionBtnText: "Dismiss",
          onAction: () => {},
        }, "fail");
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
      const entityType =
        mutation.action === "create"
          ? mutation.values.entityType
          : mutation.identity.entityType;
      setToast({
          title: `${getEntityLabel(entityType)} ${action} failed`,
          description: error.message,
          actionBtnText: "Dismiss",
          onAction: () => {},
        }, "fail");
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
    setToast({
        title,
        description,
        actionBtnText: "Dismiss",
        onAction: () => {},
      }, icon);
  }

  function showMissingEventToast() {
    showToast(
      "Event change failed",
      "This calendar event is not linked to a task or exam.",
    );
  }

  function showMutationSuccess(
    action: "created" | "updated" | "deleted",
    entityType: EventEntityType,
    title?: string,
  ) {
    const label = getEntityLabel(entityType);
    showToast(
      `${label} ${action}`,
      title ? `“${title}” was ${action}.` : `${label} was ${action}.`,
      "success",
    );
  }

  async function refreshEventData(entityType: EventEntityType) {
    const eventQueryKey =
      entityType === "task" ? queryKeys.tasks : queryKeys.exams;
    await Promise.all([
      client.invalidateQueries({
        queryKey: eventQueryKey,
        exact: true,
        refetchType: "all",
      }),
      client.invalidateQueries({
        queryKey: queryKeys.subjects,
        refetchType: "all",
      }),
      client.invalidateQueries({
        queryKey: queryKeys.studySessions,
        refetchType: "all",
      }),
    ]);
  }

  function upsertEventQueryRecord(
    entityType: EventEntityType,
    record: EventQueryRecord,
  ) {
    if (!record.documentId) return;

    client.setQueryData<EventQueryResponse>(
      entityType === "task" ? queryKeys.tasks : queryKeys.exams,
      (current) => {
        if (!current || !Array.isArray(current.data)) return current;

        return {
          ...current,
          data: [
            ...current.data.filter(
              (item) => item.documentId !== record.documentId,
            ),
            record,
          ],
        };
      },
    );
  }

  function removeEventFromCalendar(eventId: string, identity: EventIdentity) {
    eventIdentities?.current?.delete(eventId);
    client.setQueryData<{ data?: Array<{ documentId?: string }> }>(
      identity.entityType === "task" ? queryKeys.tasks : queryKeys.exams,
      (current) =>
        current?.data
          ? {
              ...current,
              data: current.data.filter(
                (record) => record.documentId !== identity.documentId,
              ),
            }
          : current,
    );
    calendarApp.current?.applyEventsChanges(
      { delete: [eventId] },
      false,
      "remote",
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
    if (seenCreateEventIds?.current?.has(event.id)) return;
    seenCreateEventIds?.current?.add(event.id);
    temporaryEventIds?.current?.add(event.id);
    temporaryEvents?.current?.set(event.id, event);
    setDetailsDialogError(null);

    const initialValues: CalendarEventFormValues = {
      entityType: "task",
      title: event.title,
      subjectDocumentIds: [],
      calendarId: event.calendarId ?? "",
      startDateTime: dateToDateTimeInput(temporalToDate(event.start)),
      endDateTime: dateToDateTimeInput(temporalToDate(event.end)),
      description: event.description ?? "",
      allDay: Boolean(event.allDay),
      priority: "medium",
      completed: false,
    };
    setDetailsDialog({
      mode: "create",
      event,
      values: initialValues,
      initialValues,
    });
  }

  function getExistingValues(
    event: DayFlowEvent,
    identity: EventIdentity,
  ): CalendarEventFormValues {
    const eventValues = {
      entityType: identity.entityType,
      title: event.title,
      calendarId: event.calendarId ?? "",
      startDateTime: dateToDateTimeInput(temporalToDate(event.start)),
      endDateTime: dateToDateTimeInput(temporalToDate(event.end)),
      description: event.description ?? "",
      allDay: Boolean(event.allDay),
    } as const;

    if (identity.entityType === "task") {
      const task = tasks.find(
        (item) => item.documentId === identity.documentId,
      );
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
    const identity =
      getEventIdentity(event) ?? eventIdentities?.current?.get(event.id);
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
    if (temporaryEventIds?.current?.has(event.id)) {
      temporaryEvents?.current?.set(event.id, event);
      setDetailsDialog((current) =>
        current?.mode === "create" && current.event.id === event.id
          ? { ...current, event }
          : current,
      );
      return;
    }

    const identity =
      getEventIdentity(event) ?? eventIdentities?.current?.get(event.id);

    if (!identity) {
      showMissingEventToast();
      return;
    }

    const previousEvent = events.find(
      (candidate) =>
        candidate.id === event.id ||
        (candidate.meta.entityType === identity.entityType &&
          candidate.meta.documentId === identity.documentId),
    );
    if (event.conference && !warnedConferenceEvents?.current?.has(event.id)) {
      warnedConferenceEvents?.current?.add(event.id);
      showToast(
        "Meeting details are not stored",
        "Task and Exam records do not have a conference field, so this Dayflow value will not be Saved.",
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
        error instanceof Error
          ? error.message
          : "The selected calendar could not be saved.",
      );
      return;
    }

    const previousDuration = previousEvent
      ? previousEvent.end.getTime() - previousEvent.start.getTime()
      : null;
    const nextDuration =
      temporalToDate(event.end).getTime() -
      temporalToDate(event.start).getTime();
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
    if (pendingMutationIds?.current?.has(mutationId)) {
      queuedEventUpdates?.current?.set(event.id, event);
      return;
    }
    pendingMutationIds?.current?.add(mutationId);
    try {
      await mutateCalendarEvents.mutateAsync({
        action: "update",
        identity,
        data: eventData,
      });
      eventIdentities?.current?.set(event.id, identity);
      showMutationSuccess("updated", identity.entityType, event.title);
      await refreshEventData(identity.entityType);
    } catch {
      await refreshEventData(identity.entityType);
    } finally {
      pendingMutationIds?.current?.delete(mutationId);
      const queuedDelete = queuedEventDeletes?.current?.get(mutationId);
      if (queuedDelete) {
        queuedEventDeletes?.current?.delete(mutationId);
        queuedEventUpdates?.current?.delete(event.id);
        void handleEventDelete(event.id);
      } else {
        const queuedUpdate = queuedEventUpdates?.current?.get(event.id);
        if (queuedUpdate) {
          queuedEventUpdates?.current?.delete(event.id);
          void handleEventUpdate(queuedUpdate);
        }
      }
    }
  }

  async function handleEventDelete(eventId: string) {
    if (temporaryEventIds?.current?.delete(eventId)) {
      temporaryEvents?.current?.delete(eventId);
      setDetailsDialog((current) =>
        current?.mode === "create" && current.event.id === eventId
          ? null
          : current,
      );
      return;
    }

    const originalEvent = events.find((event) => event.id === eventId);
    const identity =
      (originalEvent && getEventIdentity(originalEvent)) ??
      eventIdentities?.current?.get(eventId) ??
      getEventIdentity({ id: eventId, meta: undefined });

    if (!identity) {
      showMissingEventToast();
      return;
    }

    const mutationId = `${identity.entityType}:${identity.documentId}`;
    if (pendingMutationIds?.current?.has(mutationId)) {
      queuedEventUpdates?.current?.delete(eventId);
      queuedEventDeletes?.current?.set(mutationId, identity);
      return;
    }
    pendingMutationIds?.current?.add(mutationId);
    try {
      await mutateCalendarEvents.mutateAsync({
        action: "delete",
        identity,
      });
      showMutationSuccess("deleted", identity.entityType, originalEvent?.title);
      removeEventFromCalendar(eventId, identity);
      await refreshEventData(identity.entityType);
    } catch {
      await refreshEventData(identity.entityType);
    } finally {
      pendingMutationIds?.current?.delete(mutationId);
      queuedEventUpdates?.current?.delete(eventId);
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
    if (pendingMutationIds?.current?.has(mutationId)) return;
    pendingMutationIds?.current?.add(mutationId);
    setDetailsDialogSaving(true);
    setDetailsDialogError(null);
    try {
      await mutateCalendarEvents.mutateAsync({ action: "delete", identity });
      showMutationSuccess(
        "deleted",
        identity.entityType,
        detailsDialog.event.title,
      );
      removeEventFromCalendar(detailsDialog.event.id, identity);
      setDetailsDialog(null);
      await refreshEventData(identity.entityType);
    } catch (error) {
      setDetailsDialogError(
        error instanceof Error
          ? error.message
          : "The event could not be deleted.",
      );
    } finally {
      pendingMutationIds?.current?.delete(mutationId);
      setDetailsDialogSaving(false);
    }
  }

  function handleDialogCancel() {
    const current = detailsDialog;
    if (!current || detailsDialogSaving) return;

    if (
      current.mode === "create" &&
      temporaryEventIds?.current?.delete(current.event.id)
    ) {
      temporaryEvents?.current?.delete(current.event.id);
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
    submitEvent: SubmitEvent<HTMLFormElement>,
  ) {
    submitEvent.preventDefault();
    if (!detailsDialog || detailsDialogSaving) return;
    const values = detailsDialog.values;
    const start = dateTimeInputToDate(values.startDateTime);
    const end = dateTimeInputToDate(values.endDateTime);
    if (
      !values.title.trim() ||
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      start > end
    ) {
      setDetailsDialogError("Enter a title and a valid event time range.");
      return;
    }
    if (detailsDialog.mode === "edit" && !detailsDialog.identity) {
      setDetailsDialogError(
        "This event is missing its Strapi record identity.",
      );
      return;
    }

    const mutationId =
      detailsDialog.mode === "create"
        ? detailsDialog.event.id
        : `${detailsDialog.identity?.entityType}:${detailsDialog.identity?.documentId}`;
    if (pendingMutationIds?.current?.has(mutationId)) return;
    pendingMutationIds?.current?.add(mutationId);
    setDetailsDialogSaving(true);
    setDetailsDialogError(null);

    let createdIdentity: EventIdentity | null = null;
    let createResponseReceived = false;
    try {
      const sourceEvent =
        detailsDialog.mode === "create"
          ? (temporaryEvents?.current?.get(detailsDialog.event.id) ??
            detailsDialog.event)
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
          throw new Error(
            "The calendar is still initializing. Try saving again.",
          );
        }

        const calendarDocumentId = getCalendarDocumentId(
          submittedEvent.calendarId,
        );
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
          throw new Error(
            "Strapi did not return a documentId for the new event.",
          );
        }

        createdIdentity = {
          entityType: values.entityType,
          documentId,
        };
        const start = temporalToDate(submittedEvent.start);
        const end = temporalToDate(submittedEvent.end);
        const selectedCalendar = submittedEvent.calendarId
          ? calendars.find(
              (calendar) =>
                calendar.documentId === submittedEvent.calendarId ||
                calendar.id === submittedEvent.calendarId,
            )
          : undefined;
        const selectedSubjects = subjects.filter((subject) =>
          values.subjectDocumentIds.includes(subject.documentId),
        );
        const createdRecord: EventQueryRecord = {
          ...response.data,
          documentId,
          title: submittedEvent.title,
          description: submittedEvent.description ?? "",
          calendarAllDay: Boolean(submittedEvent.allDay),
          ...(values.entityType === "exam"
            ? { examDate: start.toISOString() }
            : {
                dueDate: end.toISOString(),
                estimatedDuration: submittedEvent.allDay
                  ? 60
                  : Math.max(
                      1,
                      Math.round((end.getTime() - start.getTime()) / 60_000),
                    ),
                priority: values.priority,
                completed: values.completed,
              }),
          ...(selectedCalendar ? { calendars: [selectedCalendar] } : {}),
          ...(selectedSubjects.length > 0
            ? {
                subject:
                  values.entityType === "task" && selectedSubjects.length
                    ? selectedSubjects[0]
                    : values.entityType === "task"
                      ? selectedSubjects
                      : undefined,
              }
            : {}),
        };
        upsertEventQueryRecord(createdIdentity.entityType, createdRecord);
        showMutationSuccess(
          "created",
          createdIdentity.entityType,
          submittedEvent.title,
        );
        const persistedEvent: DayFlowEvent = {
          ...submittedEvent,
          id: `${createdIdentity.entityType}-${documentId}`,
          meta: {
            ...submittedEvent.meta,
            entityType: createdIdentity.entityType,
            documentId,
          },
        };
        eventIdentities?.current?.set(submittedEvent.id, createdIdentity);
        eventIdentities?.current?.set(persistedEvent.id, createdIdentity);
        calendarApp.current.applyEventsChanges(
          { delete: [submittedEvent.id], add: [persistedEvent] },
          false,
          "remote",
        );
        temporaryEventIds?.current?.delete(submittedEvent.id);
        temporaryEvents?.current?.delete(submittedEvent.id);
        setDetailsDialog(null);
        await refreshEventData(createdIdentity.entityType);
      } else if (detailsDialog.identity) {
        const identity = detailsDialog.identity;
        const previousEvent =
          events.find(
            (candidate) =>
              candidate.id === detailsDialog.event.id ||
              (candidate.meta.entityType === identity.entityType &&
                candidate.meta.documentId === identity.documentId),
          ) ?? toEventType(detailsDialog.event, identity);
        const calendarDocumentId = getCalendarDocumentId(
          submittedEvent.calendarId,
        );
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
          showMutationSuccess(
            "updated",
            identity.entityType,
            submittedEvent.title,
          );
          eventIdentities?.current?.set(submittedEvent.id, identity);
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
        if (temporaryEventIds?.current?.delete(temporaryEventId)) {
          temporaryEvents?.current?.delete(temporaryEventId);
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
        temporaryEventIds?.current?.delete(detailsDialog.event.id);
        temporaryEvents?.current?.delete(detailsDialog.event.id);
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
          error instanceof Error
            ? error.message
            : "The event could not be saved.",
        );
      }
    } finally {
      pendingMutationIds?.current?.delete(mutationId);
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

  if (!isDesktop) return <DesktopNotice page="Calendar" />;

  if (calendarsLoading || createCalendarMutation.isPending)
    return (
      <LoadingComponent
        loadingState={calendarsLoading || createCalendarMutation.isPending}
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
