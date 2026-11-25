import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate, type LinksFunction, type MetaFunction } from "react-router";
import { apiFetch } from "~/api/api";
import { queryKeys } from "~/api/queryKeys";
import DashboardPage from "~/components/ui/dashboard-page/DashboardPage";
import {
  buildAreaChartData,
  buildCreatedTasksSeries,
  buildDailyStats,
  lastDays,
  type DayPoint,
  type DayStat,
} from "~/components/utils/dayStats";
import useStudyData from "~/context/studyDataContext";
import useTheme from "~/context/themeContext";
import {
  EMPTY_TASK_FORM,
  parseServerErrors,
  toTaskPayload,
  validateTask,
  type NewTaskPayload,
  type TaskFormErrors,
  type TaskFormValues,
} from "~/lib/taskForm";
import lightLogo from "~/assets/light-logo.svg";
import darkLogo from "~/assets/dark-logo.svg";

export const links: LinksFunction = () => [
  {
    rel: "icon",
    type: "image/svg+xml",
    href: window.matchMedia("(prefers-color-scheme: dark)").matches
      ? darkLogo
      : lightLogo,
  },
];

export const meta: MetaFunction = () => [
  {
    title: "Study Planner - Tasks Dashboard",
  },
  {
    name: "",
    content: "",
  },
];

const FIELD_ORDER: (keyof TaskFormValues)[] = [
  "title",
  "description",
  "dueDate",
  "calendarAllDay",
  "priority",
  "estimatedDuration",
  "subjectId",
];

async function createTask(payload: NewTaskPayload) {
  return apiFetch("/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: payload }),
  });
}

export default function tasks() {
  const {
    tasks: { data: tasks },
    sessions: { data: sessions },
  } = useStudyData();

  const { setToasts } = useTheme();

  const queryClient = useQueryClient();

  const formRef = useRef<HTMLFormElement>(null);

  const mutation = useMutation({
    mutationFn: createTask,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      setToasts((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          description: `task ${values.title} was successfully created.`,
          title: "Task Created",
          icon: "success",
        },
      ]);
      valuesRef.current = EMPTY_TASK_FORM;
      setValues(EMPTY_TASK_FORM);
      setErrors({});
      setFormError(null);
      focusField("title");
    },
    onError: (err) => {
      const { form, fields } = parseServerErrors(err);
      setErrors(fields);
      setFormError(form);
      focusFirstError(fields);
    },
  });

  const task = useRef<string | null>(null);

  const location = useLocation();
  const parsedLocation = location.pathname.split("/")[2];
  task.current = parsedLocation ?? "";

  const navigate = useNavigate();

  useEffect(() => {
    if (parsedLocation?.length) {
      navigate({
        pathname: location.pathname,
        hash: "#board",
      });
    }
  }, [location.pathname]);

  const dailyStats = useMemo(
    () => buildDailyStats(tasks ?? [], sessions ?? []),
    [tasks, sessions],
  );

  const series = useMemo(() => {
    const days = lastDays();
    const toSeries = (pick: (stat?: DayStat) => number): DayPoint[] =>
      days.map((day) => ({ day, value: pick(dailyStats.get(day)) }));

    return {
      created: buildCreatedTasksSeries(tasks ?? []),
      completed: toSeries((s) => s?.completed.length ?? 0),
      hours: toSeries(
        (s) => Math.round(((s?.focusSeconds ?? 0) / 3600) * 10) / 10,
      ),
    };
  }, [dailyStats, tasks]);

  const areaChartData = useMemo(
    () => buildAreaChartData(series.created, series.completed),
    [series],
  );

  const statsChartData = [
    { title: "tasks", chartData: series.created },
    { title: "completed", chartData: series.completed },
    { title: "hours", chartData: series.hours },
  ];

  const [values, setValues] = useState<TaskFormValues>(() => EMPTY_TASK_FORM);

  const valuesRef = useRef<TaskFormValues | null>(values);

  valuesRef.current = values;

  const [errors, setErrors] = useState<TaskFormErrors>({});

  const [formError, setFormError] = useState<string | null>(null);

  const handleDueDateChange = useCallback((date: string) => {
    startTransition(() => {
      const previous = valuesRef.current ?? EMPTY_TASK_FORM;
      const datePart = date.slice(0, 10);
      const timePart = date.slice(11, 16);
      const nextValues: TaskFormValues = {
        ...previous,
        dueDate: !datePart
          ? ""
          : previous.calendarAllDay
            ? datePart.slice(0, 10)
            : `${datePart}T${timePart}`,
      };
      valuesRef.current = nextValues;
      setValues(nextValues);
      setFormError(null);
      setErrors((shownErrors) => {
        if (!Object.keys(shownErrors).length) return shownErrors;
        const fresh = validateTask(nextValues);
        const kept: TaskFormErrors = {};
        for (const key of Object.keys(
          shownErrors,
        ) as (keyof TaskFormErrors)[]) {
          if (fresh[key]) kept[key] = fresh[key];
        }
        return kept;
      });
    });
  }, []);

  const dueValue = useMemo(
    () => (values.dueDate ? new Date(values.dueDate) : null),
    [values.dueDate],
  );

  function onSubmit(e: any) {
    e.preventDefault();
    if (mutation.isPending) return;

    const found = validateTask(values);
    setErrors(found);
    if (Object.keys(found).length) {
      setFormError(null);
      focusFirstError(found);
      return;
    }
    setFormError(null);
    mutation.mutate(toTaskPayload(values));
  }

  function validateField(key: keyof TaskFormValues) {
    const message = validateTask(values)[key];
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[key] = message;
      else delete next[key];
      return next;
    });
  }

  function update(patch: Partial<TaskFormValues>) {
    const next = { ...values, ...patch };
    valuesRef.current = next;
    setValues(next);
    setFormError(null);
    setErrors((prev) => {
      const shown = Object.keys(prev) as (keyof TaskFormValues)[];
      if (!shown.length) return prev;
      const fresh = validateTask(next);
      const kept: TaskFormErrors = {};
      for (const k of shown) if (fresh[k]) kept[k] = fresh[k];
      return kept;
    });
  }

  function focusField(name: string) {
    if (!formRef?.current) return;

    const el = formRef.current?.elements.namedItem(name);
    if (el instanceof HTMLElement) el.focus();
  }

  function focusFirstError(found: any) {
    const first = FIELD_ORDER.find((k) => found[k]);
    if (first) focusField(first);
  }

  return (
    <DashboardPage
      statsChartData={statsChartData}
      areaChartData={areaChartData}
      searchEvent={task}
      dueValue={dueValue}
      errors={errors}
      formError={formError}
      formValues={values}
      handleDueDateChange={handleDueDateChange}
      mutation={mutation}
      onSubmit={onSubmit}
      updateFunc={update}
      validateField={validateField}
    />
  );
}
