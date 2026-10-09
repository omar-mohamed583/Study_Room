import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { apiFetch } from "~/api/api";
import { AuthContext } from "~/context/authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [jwt, setJwt] = useState<string | null>(() =>
    localStorage.getItem("jwt"),
  );
  const [resetPassSuccess, setResetPassSuccess] = useState<boolean>(false);

  function clearAuth() {
    localStorage.removeItem("jwt");
    setJwt(null);
    queryClient.removeQueries({ queryKey: ["user"] });
  }

  // ---------- current user (query) ----------
  const userQuery = useQuery({
    queryKey: ["user", jwt],
    queryFn: ({ signal }) => apiFetch("/users/me", { signal }),
    enabled: !!jwt,
    retry: false,
  });

  const user = userQuery.data ?? null;

  useEffect(() => {
    const err: any = userQuery.error;
    if (!err || err.name === "AbortError") return;

    if (err.status === 401 || err.status === 403) {
      clearAuth();
      navigate("/login");
    }
  }, [userQuery.error]);

  // ---------- mutations (all at top level) ----------
  function onAuthSuccess(data: { jwt: string; user: unknown }) {
    localStorage.setItem("jwt", data.jwt);
    setJwt(data.jwt);
    queryClient.setQueryData(["user", data.jwt], data.user);
  }

  const registerMutation = useMutation({
    mutationFn: (v: {
      username: string;
      email: string;
      password: string | number;
    }) =>
      apiFetch("/auth/local/register", {
        method: "POST",
        body: JSON.stringify(v),
      }),
    onSuccess: onAuthSuccess,
  });

  const loginMutation = useMutation({
    mutationFn: (v: { identifier: string; password: string }) =>
      apiFetch("/auth/local", {
        method: "POST",
        body: JSON.stringify(v),
      }),
    onSuccess: onAuthSuccess,
  });

  const requestOtpMutation = useMutation({
    mutationFn: (email: string) =>
      apiFetch("/password-otp/send", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (v: { email: string; otp: string }) =>
      apiFetch("/password-otp/verify", {
        method: "POST",
        body: JSON.stringify(v),
      }),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (v: {
      resetToken: string;
      password: string;
      passwordConfirmation: string;
    }) =>
      apiFetch("/password-otp/reset-password", {
        method: "POST",
        body: JSON.stringify(v),
      }),
  });

  const resendOtpMutation = useMutation({
    mutationFn: (email: string) =>
      apiFetch("/password-otp/resend", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
  });

  // ---------- wrappers: plain functions, safe to call from handlers ----------
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
      return { error: String(e) };
    }
  }

  async function login(identifier: string, password: string) {
    try {
      const data = await loginMutation.mutateAsync({ identifier, password });
      return data.user;
    } catch (e) {
      console.log("Error: ", e);
      return { error: String(e).replace(/identifier/, "email") };
    }
  }

  async function requestOtp(email: string) {
    try {
      return await requestOtpMutation.mutateAsync(email);
    } catch (e) {
      console.warn(e);
      return { error: e };
    }
  }

  async function verifyOtp(email: string, otp: string) {
    try {
      return await verifyOtpMutation.mutateAsync({ email, otp });
    } catch (e) {
      console.warn(e);
      return { error: e };
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
      console.warn(e);
      return { error: e };
    }
  }

  async function resendOtp(email: string) {
    try {
      return await resendOtpMutation.mutateAsync(email);
    } catch (e) {
      console.warn(e);
      return { error: e };
    }
  }

  function logout() {
    clearAuth();
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
        jwt,
        isLoading,
        isAuthenticated: !!jwt && !!user,
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
