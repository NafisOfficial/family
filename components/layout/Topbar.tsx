"use client";

import { Search } from "lucide-react";

export default function Topbar() {
  return (
    <div className="sticky top-0 z-20 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm lg:hidden">
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-center gap-3">
        <div className="flex-1">
          <p className="text-lg font-semibold text-emerald-600">RootLink</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50">
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
