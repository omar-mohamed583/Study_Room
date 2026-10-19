import { useEffect, useId, useState } from "react";
import AccountContentSkeleton from "../skeleton/AccountDialogSkeleton";
import Button from "../ui/Button";
import DialogPanel, { Icon } from "../ui/DialogPanel";
import type { UserType } from "~/types/userType";

const FIELD_CLASS =
  "h-10 w-full rounded-lg border border-zinc-400/40 bg-transparent px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--accent-100)";

const HINT_CLASS = "mt-1 text-(--text-secondary) [font-size:var(--sm-text)]";

export default function AccountContent({
  user,
  isLoading = false,
  onSave,
  onLogout,
}: {
  user: UserType | null;
  isLoading?: boolean;
  onSave: (values: { username: string }) => Promise<void> | void;
  onLogout: () => Promise<void> | void;
}) {
  const uid = useId();

  const savedUsername = user?.username ?? "";

  const [username, setUsername] = useState(savedUsername);
  const [touched, setTouched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-sync when the user data arrives or changes (e.g. after loading or saving).
  useEffect(() => {
    setUsername(savedUsername);
    setTouched(false);
    setError(null);
  }, [savedUsername]);

  const trimmed = username.trim();
  const usernameError =
    trimmed.length < 2 ? "Username must be at least 2 characters." : null;
  const showUsernameError = touched && !!usernameError;
  const dirty = trimmed !== savedUsername;

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  async function handleSave() {
    setTouched(true);
    if (usernameError) return;

    setError(null);
    setIsSaving(true);
    try {
      await onSave({ username: trimmed });
    } catch {
      setError("Couldn't save your account. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <DialogPanel
      title="Account"
      breadcrumb={[
        { label: "Study Room" },
        { label: "Account" },
        { label: "Profile" },
      ]}
      onSave={handleSave}
      onReset={() => {
        setUsername(savedUsername);
        setTouched(false);
        setError(null);
      }}
      resetLabel="Reset"
      canSave={dirty}
      canReset={dirty}
      isSaving={isSaving}
      isLoading={isLoading}
      error={error}
    >
      {isLoading ? (
        <AccountContentSkeleton />
      ) : !user ? (
        <p className="text-sm text-(--text-secondary)">
          We couldn't load your profile. Close this dialog and try again.
        </p>
      ) : (
        <div className="grid gap-6">
          {/* Avatar + name + email */}
          <div className="flex items-center gap-4">
            <div
              aria-hidden="true"
              className="grid size-16 shrink-0 place-content-center rounded-full bg-(--accent-100) text-2xl font-semibold text-white uppercase"
            >
              {(savedUsername[0] ?? "?").toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold leading-[normal]">
                {savedUsername}
              </p>
              <p className="truncate text-sm text-(--text-secondary)">
                {user.email}
              </p>
            </div>
          </div>

          {/* Fields */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor={`${uid}-username`}
                className="mb-2 block text-sm font-semibold"
              >
                Username
              </label>
              <input
                id={`${uid}-username`}
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => setTouched(true)}
                aria-invalid={showUsernameError}
                aria-describedby={
                  showUsernameError ? `${uid}-username-error` : undefined
                }
                className={`${FIELD_CLASS} ${showUsernameError ? "border-red-500" : ""}`}
              />
              {showUsernameError && (
                <p
                  id={`${uid}-username-error`}
                  className="mt-1 text-sm text-red-500"
                >
                  {usernameError}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor={`${uid}-email`}
                className="mb-2 block text-sm font-semibold"
              >
                Email
              </label>
              <input
                id={`${uid}-email`}
                type="email"
                value={user.email}
                readOnly
                aria-readonly="true"
                aria-describedby={`${uid}-email-hint`}
                className={`${FIELD_CLASS} cursor-default bg-zinc-400/10 text-(--text-secondary)`}
              />
              <p
                id={`${uid}-email-hint`}
                className={HINT_CLASS}
              >
                Email can't be changed here.
              </p>
            </div>
          </div>

          {/* Member since */}
          <div>
            <p className="text-sm font-semibold">Member since</p>
            <p className="mt-1 text-sm text-(--text-secondary)">
              {memberSince}
            </p>
          </div>

          {/* Session */}
          <section
            aria-labelledby={`${uid}-session`}
            className="flex items-center justify-between gap-4 rounded-xl border border-(--secondary-gray) p-4"
          >
            <div className="min-w-0">
              <h3
                id={`${uid}-session`}
                className="text-sm font-semibold"
              >
                Session
              </h3>
              <p className={HINT_CLASS}>Log out of your account.</p>
            </div>

            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex h-9 shrink-0 items-center gap-2 rounded-lg border border-red-500/50 px-4 text-sm text-red-500 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line
                  x1="21"
                  x2="9"
                  y1="12"
                  y2="12"
                />
              </Icon>
              {isLoggingOut ? "Logging out…" : "Log out"}
            </Button>
          </section>
        </div>
      )}
    </DialogPanel>
  );
}
