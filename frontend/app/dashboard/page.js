"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";
import RequireAuth from "@/components/RequireAuth";
import Header from "@/components/Header";

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const loadProjects = async () => {
    try {
      const data = await apiFetch("/projects");
      setProjects(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  async function handleCreateProject(event) {
    event.preventDefault();
    setError("");
    try {
      await apiFetch("/projects", {
        method: "POST",
        body: JSON.stringify({ title, description })
      });
      setTitle("");
      setDescription("");
      await loadProjects();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <RequireAuth>
      <Header />
      <main className="page-shell space-y-8">
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-700 p-6 text-white md:p-8">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-brand-300/20 blur-2xl" />
          <div className="relative z-10">
            <p className="mb-2 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
              Workspace Overview
            </p>
            <h1 className="text-2xl font-semibold md:text-3xl">Build and track team projects faster</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-100/90">
              Create project spaces, open task boards, and keep ownership clear with assignee-first
              visibility.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Create New Project</h2>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              Quick Add
            </span>
          </div>
          <form onSubmit={handleCreateProject} className="grid gap-3 md:grid-cols-5">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Project title"
              className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-brand-500 md:col-span-2"
              required
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description"
              className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-brand-500 md:col-span-2"
            />
            <button className="rounded-xl bg-slate-900 px-4 py-2.5 font-medium text-white transition hover:-translate-y-0.5 hover:bg-slate-700">
              Create Project
            </button>
          </form>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">Projects</h2>
            <span className="text-sm text-slate-500">
              {projects.length} active project{projects.length === 1 ? "" : "s"}
            </span>
          </div>

          {projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
              No projects yet. Create your first project to start the board.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  className="card card-interactive group rounded-2xl p-4"
                >
                  <div className="mb-3 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    Project Board
                  </div>
                  <h3 className="line-clamp-1 text-lg font-semibold text-slate-900">{project.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                    {project.description || "No description"}
                  </p>
                  <p className="mt-3 text-xs text-slate-500">
                    Last updated by{" "}
                    <span className="font-semibold text-slate-700">
                      {project.lastUpdatedBy?.userName || "Unknown"}
                    </span>
                  </p>
                  <Link
                    href={`/projects/${project._id}`}
                    className="mt-4 inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition group-hover:bg-brand-700"
                  >
                    Open Board
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>
    </RequireAuth>
  );
}
