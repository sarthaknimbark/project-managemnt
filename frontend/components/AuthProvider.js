"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("pm_token");
    if (!token) {
      setLoading(false);
      return;
    }
    apiFetch("/me")
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem("pm_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await apiFetch("/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem("pm_token", data.token);
    setUser(data.user);
    router.push("/dashboard");
  };

  const signup = async ({ name, email, password, avatar }) => {
    const data = await apiFetch("/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password, avatar })
    });
    localStorage.setItem("pm_token", data.token);
    setUser(data.user);
    router.push("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("pm_token");
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
