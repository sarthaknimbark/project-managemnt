"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur">
      <div className="page-shell flex items-center justify-between py-3">
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold text-brand-700">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 text-sm text-white">
            PT
          </span>
          Project Tracker
        </Link>
        <div className="flex items-center gap-3">
          <div className="hidden text-right text-sm sm:block">
            <p className="font-medium text-slate-800">
              {user?.name}{" "}
              {user?.isAdmin ? (
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-700">
                  Admin
                </span>
              ) : null}
            </p>
            <p className="text-slate-500">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm transition hover:-translate-y-0.5 hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
