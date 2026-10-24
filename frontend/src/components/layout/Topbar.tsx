"use client";

import { Bell, Menu, ShieldCheck } from "lucide-react";

export default function Topbar({
  role,
  onMenuClick,
}: {
  role: "ADMIN" | "CONTRIBUTOR";
  onMenuClick: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-7">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div>
          <p className="font-[family-name:var(--font-heading)] text-xl font-bold text-[#0B1F3A]">
            {role === "ADMIN" ? "COMMAND CENTER" : "RESPONSE WORKSPACE"}
          </p>
          <p className="hidden text-xs text-slate-500 sm:block">
            Disaster Response Coordination Platform
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 sm:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Response system
        </div>

        <button
          aria-label="Notifications"
          title="Notifications"
          className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"
        >
          <Bell size={19} />
        </button>

        <div className="hidden rounded-xl bg-blue-50 p-2.5 text-blue-800 sm:block">
          <ShieldCheck size={20} />
        </div>
      </div>
    </header>
  );
}
