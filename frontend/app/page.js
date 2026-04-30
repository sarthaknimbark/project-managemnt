"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await signup({ name, email, password, avatar });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-brand-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-violet-300/40 blur-3xl" />
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="glass-card z-10 w-full max-w-md p-6"
      >
        <h1 className="mb-2 text-2xl font-semibold text-slate-900">
          {mode === "login" ? "Team Login" : "Create Account"}
        </h1>
        <p className="mb-6 text-sm text-slate-500">
          {mode === "login"
            ? "Sign in to view projects and update tasks."
            : "Create a user account. First user becomes admin automatically."}
        </p>

        <div className="mb-4 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-sm">
          <button
            type="button"
            onClick={() => setMode("login")}
              className={`rounded-lg px-3 py-2 transition ${
              mode === "login" ? "bg-white font-medium shadow" : "text-slate-600"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
              className={`rounded-lg px-3 py-2 transition ${
              mode === "signup" ? "bg-white font-medium shadow" : "text-slate-600"
            }`}
          >
            Sign Up
          </button>
        </div>

        {mode === "signup" ? (
          <>
            <label className="mb-2 block text-sm font-medium">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-modern mb-4"
              required
            />
            <label className="mb-2 block text-sm font-medium">Avatar URL (optional)</label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="input-modern mb-4"
            />
          </>
        ) : null}

        <label className="mb-2 block text-sm font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-modern mb-4"
          required
        />

        <label className="mb-2 block text-sm font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-modern mb-4"
          required
        />

        {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

        <button
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-violet-500 px-4 py-2.5 font-medium text-white transition hover:opacity-95 disabled:opacity-60"
        >
          {loading
            ? mode === "login"
              ? "Signing in..."
              : "Creating account..."
            : mode === "login"
              ? "Login"
              : "Sign Up"}
        </button>
      </motion.form>
    </main>
  );
}
