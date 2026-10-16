import { Dialog } from "@base-ui/react/dialog";
import { twMerge } from "cn";
import type { ReactNode } from "react";
import AccountContent from "../layout/AccountDialog";
import SettingsContent from "../layout/SettingDialog";
import { useAuth } from "../providers/authProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "~/api/api";

export default function DialogComp({
  dialogType,
  svg,
  className,
}: {
  dialogType: string;
  svg: ReactNode;
  className: string;
}) {
  const { user, logout } = useAuth();

  const client = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (updatedFields: object ) =>
      apiFetch(`/users/${user?.id}`, {
        method: "PUT",
        body: JSON.stringify(updatedFields),
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["user"] }),
  });

  return (
    <Dialog.Root>
      <Dialog.Trigger
        className={twMerge(
          "flex items-center justify-between gap-2 px-3 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white capitalize",
          className,
        )}
      >
        {dialogType}
        {svg}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 min-h-dvh bg-black/20 dark:bg-black/50 transition-opacity duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute z-9999999999" />
        <Dialog.Viewport className="fixed inset-0 grid place-items-center px-4 py-12 xl:py-6 z-999999999999">
          <Dialog.Popup className="group/popup relative flex h-full w-full max-w-280 xl:max-w-none justify-center pointer-events-none transition-opacity duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0">
            <Dialog.Close
              className="cursor-pointer absolute right-0 -top-10 flex h-8 w-8 items-center justify-center border border-neutral-950 dark:border-zinc-400/35 bg-white dark:bg-neutral-950 text-neutral-950 dark:text-white shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:shadow-none hover:bg-neutral-100 dark:hover:bg-neutral-800 active:bg-neutral-200 dark:active:bg-neutral-700 xl:top-0 pointer-events-auto focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
              aria-label="Close"
            >
              <XIcon />
            </Dialog.Close>
            <div className="pointer-events-auto h-full w-full max-w-280 bg-white dark:bg-neutral-950 p-4 text-neutral-950 dark:text-white border border-neutral-950 dark:border-zinc-400/35 shadow-[0.25rem_0.25rem_0] shadow-black/12 dark:shadow-none transition-[scale] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-starting-style/popup:scale-105">
              {dialogType.toLowerCase() === "account" ? (
                <AccountContent
                  user={user}
                  onSave={({ username }) => mutate({ username })}
                  onLogout={logout}
                  isLoading={isPending}
                />
              ) : (
                <SettingsContent
                  onSave={(values) => mutate({ ...values })}
                  isLoading={isPending}
                  preferences={{
                    notifyExams: user?.notifyExams,
                    notifyTasks: user?.notifyTasks,
                    sessionMinutes: user?.sessionMinutes,
                    weeklyGoalHours: user?.weeklyGoalHours,
                  }}
                />
              )}
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function XIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeLinecap="square"
      strokeLinejoin="round"
      {...props}
      style={{ display: "block", ...props.style }}
    >
      <path d="m2.5 2.5 11 11m-11 0 11-11" />
    </svg>
  );
}
