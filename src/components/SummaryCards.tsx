"use client";

import React from "react";
import { formatINR, CATEGORIES } from "@/lib/constants";
import { Expense } from "@/types";
import { TrendingUp, PieChart as PieIcon, CalendarDays, Receipt } from "lucide-react";

interface SummaryCardsProps {
  expenses: Expense[];
  currentMonth: string; // YYYY-MM
  loading?: boolean;
}

export function SummaryCards({ expenses, currentMonth, loading }: SummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 animate-pulse"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 mb-3" />
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
            <div className="h-6 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // 1. Total Spending
  const total = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  // 2. Highest Category
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount || 0);
  });

  let highestCategory = "None";
  let highestAmount = 0;
  Object.entries(categoryTotals).forEach(([cat, amount]) => {
    if (amount > highestAmount) {
      highestAmount = amount;
      highestCategory = cat;
    }
  });

  const highestMeta = highestCategory !== "None" && CATEGORIES[highestCategory as keyof typeof CATEGORIES]
    ? CATEGORIES[highestCategory as keyof typeof CATEGORIES]
    : null;
  const highestIcon = highestMeta?.icon;

  // 3. Daily Average calculation (deterministic based on month)
  const [yearStr, monthStr] = (currentMonth || "2026-10").split("-");
  const year = parseInt(yearStr, 10) || 2026;
  const month = parseInt(monthStr, 10) || 10;
  const daysInMonth = new Date(year, month, 0).getDate();
  const divisor = Math.max(1, daysInMonth);
  const dailyAverage = total / divisor;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Monthly Total */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden group hover:border-emerald-500/30 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Spent</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {formatINR(total)}
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
          {expenses.length} transaction{expenses.length === 1 ? "" : "s"}
        </p>
      </div>

      {/* 2. Highest Spending Category */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden group hover:border-indigo-500/30 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Top Category</span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            {highestIcon ? React.createElement(highestIcon, { className: "w-4 h-4" }) : <PieIcon className="w-4 h-4" />}
          </div>
        </div>
        <div className="text-base sm:text-xl font-bold text-slate-900 dark:text-white truncate">
          {highestCategory}
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">
          {highestAmount > 0 ? `${formatINR(highestAmount)} (${Math.round((highestAmount / total) * 100)}%)` : "No data yet"}
        </p>
      </div>

      {/* 3. Daily Average */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden group hover:border-blue-500/30 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Daily Average</span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <CalendarDays className="w-4 h-4" />
          </div>
        </div>
        <div className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {formatINR(dailyAverage)}
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
          Based on {divisor} days
        </p>
      </div>

      {/* 4. Transactions Count */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden group hover:border-amber-500/30 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Activity</span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Receipt className="w-4 h-4" />
          </div>
        </div>
        <div className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {expenses.length}
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
          Logged this month
        </p>
      </div>
    </div>
  );
}
