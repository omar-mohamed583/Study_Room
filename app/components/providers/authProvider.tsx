import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router";
import { apiFetch } from "~/api/api";
import {
  ensureSession,
  getAccessToken,
  onTokenChange,
  setAccessToken,
} from "~/auth/session";
import { AuthContext } from "~/context/authContext";
import type { UserType } from "~/types/userType";

const send = (path: string, body: unknown) =>
  apiFetch(path, { method: "POST", body: JSON.stringify(body) });

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const accessToken = useSyncExternalStore(
    onTokenChange,
    getAccessToken,
    () => null,
  );

  const [isRestoring, setIsRestoring] = useState(true);
  const [resetPassSuccess, setResetPassSuccess] = useState<boolean>(false);

  useEffect(() => {
    ensureSession().finally(() => setIsRestoring(false));
  }, []);

  function clearAuth() {
    setAccessToken(null);
    queryClient.removeQueries({ queryKey: ["user"] });
  }

  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: ({ signal }) => apiFetch("/users/me", { signal }),
    enabled: !!accessToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const user: UserType | null = userQuery.data ?? null;

  useEffect(() => {
    const err: any = userQuery.error;
    if (!err || err.name === "AbortError") return;

    if (err.status === 401 || err.status === 403) {
      clearAuth();
      navigate("/login");
    }
  }, [userQuery.error]);

  function onAuthSuccess(data: { jwt: string; user: unknown }) {
    setAccessToken(data.jwt);
    queryClient.setQueryData(["user"], data.user);
  }

  const registerMutation = useMutation({
    mutationFn: (v: {
      username: string;
      email: string;
      password: string | number;
    }) => send("/auth/local/register", v),
    onSuccess: onAuthSuccess,
  });

  const loginMutation = useMutation({
    mutationFn: (v: { identifier: string; password: string }) =>
      send("/auth/local", v),
    onSuccess: onAuthSuccess,
  });

  const requestOtpMutation = useMutation({
    mutationFn: (email: string) => send("/password-otp/send", { email }),
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (v: { email: string; otp: string }) =>
      send("/password-otp/verify", v),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (v: {
      resetToken: string;
      password: string;
      passwordConfirmation: string;
    }) => send("/password-otp/reset-password", v),
  });

  const resendOtpMutation = useMutation({
    mutationFn: (email: string) => send("/password-otp/resend", { email }),
  });

  const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

  async function register(
    username: string,
    email: string,
    password: string | number,
  ) {
    try {
      const data = await registerMutation.mutateAsync({
        username,
        email,
        password,
      });
      return data.user;
    } catch (e) {
      return { error: message(e) };
    }
  }

  async function login(identifier: string, password: string) {
    try {
      const data = await loginMutation.mutateAsync({ identifier, password });
      return data.user;
    } catch (e) {
      return { error: message(e).replace(/identifier/, "email") };
    }
  }

  async function requestOtp(email: string) {
    try {
      return await requestOtpMutation.mutateAsync(email);
    } catch (e) {
      return { error: message(e) };
    }
  }

  async function verifyOtp(email: string, otp: string) {
    try {
      return await verifyOtpMutation.mutateAsync({ email, otp });
    } catch (e) {
      return { error: message(e) };
    }
  }

  async function resetPassword(
    resetToken: string,
    newPassword: string,
    newPassConfirmation: string,
  ) {
    try {
      return await resetPasswordMutation.mutateAsync({
        resetToken,
        password: newPassword,
        passwordConfirmation: newPassConfirmation,
      });
    } catch (e) {
      return { error: message(e) };
    }
  }

  async function resendOtp(email: string) {
    try {
      return await resendOtpMutation.mutateAsync(email);
    } catch (e) {
      return { error: message(e) };
    }
  }

  async function logout() {
    try {
      // Revokes the user's sessions on the server and clears the refresh cookie.
      await send("/auth/logout", {});
    } catch {
      // Even if the call fails, log out locally.
    }
    clearAuth();
    navigate("/login");
  }

  const isLoading =
    userQuery.isLoading ||
    registerMutation.isPending ||
    loginMutation.isPending ||
    requestOtpMutation.isPending ||
    verifyOtpMutation.isPending ||
    resetPasswordMutation.isPending ||
    resendOtpMutation.isPending;

  return (
    <AuthContext
      value={{
        user,
        accessToken,
        isLoading,
        isRestoring, // protected routes: show a spinner while true, don't redirect yet
        isAuthenticated: !!accessToken && !!user,
        register,
        login,
        requestOtp,
        verifyOtp,
        resetPassword,
        resendOtp,
        resetPassSuccess,
        setResetPassSuccess,
        logout,
      }}
    >
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
