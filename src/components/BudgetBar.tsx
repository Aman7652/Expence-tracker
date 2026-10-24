"use client";

import React from "react";
import { formatINR } from "@/lib/constants";
import { AlertTriangle, AlertOctagon, Target, Pencil } from "lucide-react";

interface BudgetBarProps {
  totalSpent: number;
  budgetAmount: number | null;
  onOpenBudgetModal: () => void;
  loading?: boolean;
}

export function BudgetBar({
  totalSpent,
  budgetAmount,
  onOpenBudgetModal,
  loading,
}: BudgetBarProps) {
  if (loading) {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 animate-pulse">
        <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
        <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full" />
      </div>
    );
  }

  // If no budget is configured
  if (!budgetAmount || budgetAmount <= 0) {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-50/50 via-slate-50 to-emerald-50/30 dark:from-indigo-950/20 dark:via-slate-900 dark:to-emerald-950/20 border border-indigo-100 dark:border-indigo-900/50 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              No monthly budget set
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Set a monthly limit to monitor spending thresholds and receive 80% &amp; 100% alerts.
            </p>
          </div>
        </div>
        <button
          onClick={onOpenBudgetModal}
          id="set-budget-btn"
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors shrink-0"
        >
          Set Monthly Budget
        </button>
      </div>
    );
  }

  const percentage = Math.round((totalSpent / budgetAmount) * 100);
  const remaining = budgetAmount - totalSpent;
  const isOverBudget = percentage >= 100;
  const isNearBudget = percentage >= 80 && !isOverBudget;

  const barColor = isOverBudget
    ? "bg-rose-500"
    : isNearBudget
    ? "bg-amber-500"
    : "bg-gradient-to-r from-emerald-500 to-teal-500";

  return (
    <div className="space-y-3">
      {/* 80% Warning Banner */}
      {isNearBudget && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 text-xs sm:text-sm">
            <span className="font-bold">Budget Warning (80% reached): </span>
            You have spent {percentage}% ({formatINR(totalSpent)}) of your {formatINR(budgetAmount)} budget. You have {formatINR(remaining)} remaining.
          </div>
        </div>
      )}

      {/* 100% Critical Banner */}
      {isOverBudget && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0">
            <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="flex-1 text-xs sm:text-sm">
            <span className="font-bold">Budget Exceeded (100%+): </span>
            You have spent {percentage}% ({formatINR(totalSpent)}) and surpassed your monthly limit by {formatINR(Math.abs(remaining))}!
          </div>
        </div>
      )}

      {/* Budget Progress Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Monthly Budget Progress
            </span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                isOverBudget
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                  : isNearBudget
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
              }`}
            >
              {percentage}%
            </span>
          </div>

          <button
            onClick={onOpenBudgetModal}
            id="edit-budget-btn"
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
          <span>Spent: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{formatINR(totalSpent)}</strong></span>
          <span>Budget: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{formatINR(budgetAmount)}</strong></span>
        </div>
      </div>
    </div>
  );
}
