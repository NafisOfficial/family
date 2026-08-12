"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut } from "lucide-react";

export default function ProfileCard() {
  const { user, logout } = useAuth();

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white">
          {user?.displayName?.charAt(0).toUpperCase() ?? "U"}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {user?.displayName ?? "User"}
          </p>
          <p className="text-xs text-slate-600 truncate">
            @{user?.username ?? "unknown"}
          </p>
        </div>
      </div>
      <div className="mt-3">
        <button
          onClick={async () => {
            await logout();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
