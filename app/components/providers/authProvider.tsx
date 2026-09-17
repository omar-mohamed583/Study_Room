import { useContext, useEffect, useState, type ReactNode } from "react";
import { apiFetch } from "~/api/api";
import { AuthContext } from "~/context/authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [jwt, setJwt] = useState(() => {
    return localStorage.getItem("jwt");
  });

  const [user, setUser] = useState(null);

  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (!jwt) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await apiFetch("/users/me");
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to load user:", error);

        localStorage.removeItem("jwt");
        setJwt(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [jwt]);

  async function register(
    username: string,
    email: string,
    password: string | number,
  ) {
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
    } catch (e) {
      console.log("Error: ", e);
      return { error: e };
    }
  }

  async function login(identifier: string, password: string | number) {
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
    } catch (e) {
      console.log("Error: ", e);

      return { error: e };
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
