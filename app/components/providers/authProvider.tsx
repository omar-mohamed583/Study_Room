import { useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { apiFetch } from "~/api/api";
import { AuthContext } from "~/context/authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const [jwt, setJwt] = useState(() => {
    return localStorage.getItem("jwt");
  });

  const [user, setUser] = useState(null);

  const [isLoading, setLoading] = useState(false);

  const [resetPassSuccess, setResetPassSuccess] = useState<boolean>(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadUser() {
      setLoading(true);
      if (!jwt) {
        console.log("no JWT");
        setLoading(false);
        return;
      }

      try {
        const currentUser = await apiFetch("/users/me", {
          signal: controller.signal,
        });
        setUser(currentUser);
      } catch (error: any) {
        console.error("Failed to load user:", error);

        if (error.name === "AbortError")
          return console.log("Aborted From If Condition");

        if (error?.status === 401 || error?.status === 403) {
          localStorage.removeItem("jwt");
          setJwt(null);
          setUser(null);

          navigate("/login");
        }

        return { error };
      } finally {
        setLoading(false);
      }
    }

    loadUser();

    return () => {
      controller.abort();
      console.log("aborted");
    };
  }, [jwt]);

  async function register(
    username: string,
    email: string,
    password: string | number,
  ) {
    setLoading(true);
    try {
      const data = await apiFetch("/auth/local/register", {
        method: "POST",
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      localStorage.setItem("jwt", data.jwt);

      setJwt(data.jwt);
      setUser(data.user);

      return data.user;
    } catch (e: any) {
      console.log("Error: ", e);
      return { error: String(e) };
    } finally {
      setLoading(false);
    }
  }

  async function login(identifier: string, password: string) {
    setLoading(true);
    try {
      const data = await apiFetch("/auth/local", {
        method: "POST",
        body: JSON.stringify({
          identifier,
          password,
        }),
      });

      localStorage.setItem("jwt", data.jwt);

      setJwt(data.jwt);
      setUser(data.user);

      return data.user;
    } catch (e: any) {
      console.log("Error: ", e);
      return { error: String(e).replace(/identifier/, "email") };
    } finally {
      setLoading(false);
    }
  }

  async function requestOtp(email: string) {
    setLoading(true);
    try {
      const otp = await apiFetch("/password-otp/send", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      return otp;
    } catch (e) {
      console.warn(e);
      return { error: e };
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(email: string, otp: string) {
    setLoading(true);
    try {
      const otpVerification = await apiFetch("/password-otp/verify", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      });

      return otpVerification;
    } catch (e) {
      console.warn(e);

      return { error: e };
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(
    resetToken: string,
    newPassword: string,
    newPassConfirmation: string,
  ) {
    setLoading(true);
    try {
      const passwordReset = await apiFetch("/password-otp/reset-password", {
        method: "POST",
        body: JSON.stringify({
          resetToken,
          password: newPassword,
          passwordConfirmation: newPassConfirmation,
        }),
      });

      return passwordReset;
    } catch (e) {
      console.warn(e);
      return { error: e };
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp(email: string) {
    setLoading(true);

    try {
      const data = await apiFetch("/password-otp/resend", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      return data;
    } catch (e) {
      console.warn(e);
      return { error: e };
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("jwt");

    setJwt(null);
    setUser(null);
  }

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
