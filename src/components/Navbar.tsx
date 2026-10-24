"use client";

import React from "react";
import { ChevronLeft, ChevronRight, LogOut, Settings, Wallet } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface NavbarProps {
  currentMonth: string; // YYYY-MM
  onMonthChange: (month: string) => void;
  userEmail?: string;
  onOpenSettings: () => void;
}

export function Navbar({
  currentMonth,
  onMonthChange,
  userEmail,
  onOpenSettings,
}: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();

  const handlePrevMonth = () => {
    const [yearStr, monthStr] = currentMonth.split("-");
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10) - 1;
    if (month < 1) {
      month = 12;
      year -= 1;
    }
    const formatted = `${year}-${String(month).padStart(2, "0")}`;
    onMonthChange(formatted);
  };

  const handleNextMonth = () => {
    const [yearStr, monthStr] = currentMonth.split("-");
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10) + 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
    const formatted = `${year}-${String(month).padStart(2, "0")}`;
    onMonthChange(formatted);
  };

  const getMonthLabel = (m: string) => {
    try {
      const [year, month] = m.split("-");
      const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
    } catch {
      return m;
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                Kharcha
              </span>
              <span className="hidden sm:inline-block ml-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                INR ₹
              </span>
            </div>
          </div>

          {/* Month Selector in Center */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl p-1 border border-slate-200/70 dark:border-slate-700/60">
            <button
              onClick={handlePrevMonth}
              id="prev-month-btn"
              aria-label="Previous Month"
              className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 min-w-[95px] text-center select-none">
              {getMonthLabel(currentMonth)}
            </span>
            <button
              onClick={handleNextMonth}
              id="next-month-btn"
              aria-label="Next Month"
              className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {userEmail && (
              <span className="hidden md:inline-block text-xs font-medium text-slate-500 dark:text-slate-400 max-w-[150px] truncate">
                {userEmail}
              </span>
            )}

            <ThemeToggle />

            <button
              onClick={onOpenSettings}
              id="settings-btn"
              aria-label="Settings"
              title="Settings & Google Sheets Sync"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/80 dark:border-slate-700/80"
            >
              <Settings className="w-5 h-5" />
            </button>

            <button
              onClick={handleLogout}
              id="logout-btn"
              aria-label="Log out"
              title="Log out"
              className="p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors border border-rose-200/60 dark:border-rose-900/40"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
