"use client";

import React, { useState } from "react";
import { X, Sheet, RefreshCw, CheckCircle2, AlertCircle, ExternalLink, ShieldCheck } from "lucide-react";
import { Expense } from "@/types";
import { useToast } from "./Toast";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  allExpenses: Expense[];
}

export function SettingsModal({
  isOpen,
  onClose,
  userEmail,
  allExpenses,
}: SettingsModalProps) {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSyncToGoogleSheets = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch("/api/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "batch_sync",
          expenses: allExpenses,
        }),
      });

      const data = await response.json();
      if (data.success) {
        showToast(data.message || `Synced ${allExpenses.length} expenses to Google Sheets!`, "success");
      } else {
        showToast(
          data.message || "Google Sheets webhook not configured or returned an error. (Check GOOGLE_SHEET_WEBHOOK_URL)",
          "info"
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sync error";
      showToast(`Google Sheets Sync: ${msg}`, "error");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
      >
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sheet className="w-4 h-4" />
            </div>
            <h2 id="settings-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
              Settings &amp; Integrations
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* User Account info */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account</span>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
              {userEmail || "Signed In"}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Supabase Row Level Security Active</span>
            </div>
          </div>

          {/* Google Sheets Sync Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sheet className="w-4 h-4 text-emerald-600" />
                  Google Sheets Webhook Sync
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Mirrors your expenses into a Google Sheet in real-time.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-300">Total recorded expenses:</span>
                <strong className="text-slate-900 dark:text-white font-mono">{allExpenses.length}</strong>
              </div>

              <button
                onClick={handleSyncToGoogleSheets}
                disabled={isSyncing}
                id="sync-google-sheets-btn"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Syncing..." : "Sync All Expenses to Google Sheet"}
              </button>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                <p className="font-semibold text-slate-700 dark:text-slate-300">How it works:</p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-500 dark:text-slate-400">
                  <li>Automatic POST webhook triggers after every add, edit, or delete.</li>
                  <li>Setup: Deploy <code className="font-mono text-indigo-500">google-apps-script.js</code> as Web App.</li>
                  <li>Add URL to <code className="font-mono text-indigo-500">GOOGLE_SHEET_WEBHOOK_URL</code> env variable.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
