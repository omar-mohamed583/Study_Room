import { Dialog } from "@base-ui/react/dialog";
import { useEffect, useState, type FormEvent } from "react";
import type { Priority, Subject } from "~/types/tasksDashboard";

export interface CreateTaskInput {
  title: string;
  description: string;
  dueDate: string;
  priority: Priority;
  estimatedDuration: number;
  subjectDocumentId: string;
}

type Props = {
  open: boolean;
  subjects: Subject[];
  isSaving: boolean;
  error: string | null;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: CreateTaskInput) => void;
};

const EMPTY_FORM: CreateTaskInput = {
  title: "",
  description: "",
  dueDate: "",
  priority: "medium",
  estimatedDuration: 60,
  subjectDocumentId: "",
};

const LABEL_CLASS = "block text-sm font-medium text-foreground";
const FIELD_CLASS =
  "mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-100) disabled:cursor-not-allowed disabled:opacity-60";

export function CreateTaskDialog({
  open,
  subjects,
  isSaving,
  error,
  onOpenChange,
  onCreate,
}: Props) {
  const [form, setForm] = useState<CreateTaskInput>(EMPTY_FORM);

  useEffect(() => {
    if (open) setForm(EMPTY_FORM);
  }, [open]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving || !form.title.trim() || !form.subjectDocumentId) return;
    onCreate({ ...form, title: form.title.trim() });
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isSaving) onOpenChange(nextOpen);
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-19999999 bg-black/45 backdrop-blur-sm data-starting-style:opacity-0 data-ending-style:opacity-0 transition-opacity" />
        <Dialog.Viewport className="fixed inset-0 z-20000000 grid place-items-center overflow-y-auto p-4">
          <Dialog.Popup className="relative w-full max-w-xl border border-zinc-400/35 bg-white text-neutral-950 shadow-2xl dark:bg-neutral-950 dark:text-white">
            <Dialog.Close
              disabled={isSaving}
              aria-label="Close create task dialog"
              className="absolute right-4 top-4 grid size-9 place-items-center rounded-lg border border-zinc-400/35 transition-colors hover:bg-zinc-400/15 disabled:opacity-50"
            >
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="m18 6-12 12M6 6l12 12" />
              </svg>
            </Dialog.Close>

            <form onSubmit={handleSubmit}>
              <header className="border-b border-zinc-400/25 px-6 py-5 pe-16">
                <Dialog.Title className="text-xl font-semibold">
                  Create task
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-(--text-secondary)">
                  Add the task details and choose its subject.
                </Dialog.Description>
              </header>

              <div className="grid gap-4 p-6 sm:grid-cols-2">
                <label className={`${LABEL_CLASS} sm:col-span-2`}>
                  Title
                  <input
                    autoFocus
                    required
                    maxLength={160}
                    value={form.title}
                    disabled={isSaving}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    className={FIELD_CLASS}
                  />
                </label>

                <label className={LABEL_CLASS}>
                  Subject
                  <select
                    required
                    value={form.subjectDocumentId}
                    disabled={isSaving || subjects.length === 0}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        subjectDocumentId: event.target.value,
                      }))
                    }
                    className={FIELD_CLASS}
                  >
                    <option value="" disabled>
                      Select a subject
                    </option>
                    {subjects.map((subject) => (
                      <option
                        key={subject.documentId}
                        value={subject.documentId}
                      >
                        {subject.name}
                      </option>
                    ))}
                  </select>
                  {subjects.length === 0 && (
                    <span className="mt-1 block text-xs font-normal text-(--text-secondary)">
                      Create a subject before adding a task.
                    </span>
                  )}
                </label>

                <label className={LABEL_CLASS}>
                  Priority
                  <select
                    value={form.priority}
                    disabled={isSaving}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        priority: event.target.value as Priority,
                      }))
                    }
                    className={FIELD_CLASS}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </label>

                <label className={LABEL_CLASS}>
                  Due date and time <span className="font-normal text-(--text-secondary)">(optional)</span>
                  <input
                    type="datetime-local"
                    value={form.dueDate}
                    disabled={isSaving}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        dueDate: event.target.value,
                      }))
                    }
                    className={FIELD_CLASS}
                  />
                </label>

                <label className={LABEL_CLASS}>
                  Estimated duration (minutes)
                  <input
                    type="number"
                    min={1}
                    max={1440}
                    required
                    value={form.estimatedDuration}
                    disabled={isSaving}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        estimatedDuration: Number(event.target.value),
                      }))
                    }
                    className={FIELD_CLASS}
                  />
                </label>

                <label className={`${LABEL_CLASS} sm:col-span-2`}>
                  Description <span className="font-normal text-(--text-secondary)">(optional)</span>
                  <textarea
                    rows={3}
                    value={form.description}
                    disabled={isSaving}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    className="mt-1.5 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-100) disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </label>

                {error && (
                  <p
                    role="alert"
                    className="text-sm text-red-600 dark:text-red-400 sm:col-span-2"
                  >
                    {error}
                  </p>
                )}
              </div>

              <footer className="flex justify-end gap-3 border-t border-zinc-400/25 px-6 py-4">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => onOpenChange(false)}
                  className="h-10 rounded-lg border border-zinc-400/40 px-4 text-sm font-medium transition-colors hover:bg-zinc-400/10 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || subjects.length === 0}
                  className="h-10 rounded-lg bg-(--accent-100) px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? "Creating..." : "Create task"}
                </button>
              </footer>
            </form>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
