"use client";

import React, { useState } from "react";
import { Database, Copy, Check, ExternalLink, ShieldCheck, KeyRound, Sparkles } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const SQL_SCHEMA = `-- Daily Expense Tracker Supabase Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL,
    note TEXT DEFAULT '',
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    month TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_month_budget UNIQUE (user_id, month)
);

CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses (user_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses (user_id, category);
CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON public.budgets (user_id, month);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own expenses" ON public.expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own expenses" ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own expenses" ON public.expenses FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own expenses" ON public.expenses FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own budgets" ON public.budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own budgets" ON public.budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own budgets" ON public.budgets FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own budgets" ON public.budgets FOR DELETE USING (auth.uid() = user_id);`;

export function SetupGuide() {
  const [copiedEnv, setCopiedEnv] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  const sampleEnv = `# In your .env.local file:
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# Optional:
GOOGLE_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/.../exec`;

  const copyEnvSnippet = () => {
    navigator.clipboard.writeText(sampleEnv);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2500);
  };

  const copySqlSchema = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-100 dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-900 relative">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
        {/* Glow decorative background */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Welcome to Expense Tracker
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 font-medium border border-indigo-200 dark:border-indigo-800">
                  Initial Setup
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Connect your Supabase project in under 2 minutes to get started.
              </p>
            </div>
          </div>

          <div className="space-y-4 my-6">
            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-semibold flex items-center justify-center text-sm shrink-0 mt-0.5">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  Create a free Supabase Project
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 font-normal"
                  >
                    Open Supabase <ExternalLink className="w-3 h-3" />
                  </a>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Go to supabase.com, sign in and click <strong>New Project</strong>. Choose any project name and secure database password.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-semibold flex items-center justify-center text-sm shrink-0 mt-0.5">
                2
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Run Database Schema (supabase/schema.sql)
                  </h3>
                  <button
                    onClick={copySqlSchema}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedSql ? "Copied SQL" : "Copy SQL"}
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Open the <strong>SQL Editor</strong> in Supabase dashboard and run the SQL code from <code className="text-indigo-600 dark:text-indigo-400 font-mono">supabase/schema.sql</code>. It creates the expenses &amp; budgets tables with Row Level Security.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-semibold flex items-center justify-center text-sm shrink-0 mt-0.5">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Turn off Email Confirmation (For Instant Testing)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Under <strong>Authentication &rarr; Providers &rarr; Email</strong>, toggle off &ldquo;Confirm email&rdquo; so you can sign up and log in immediately without waiting for an email link.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-semibold flex items-center justify-center text-sm shrink-0 mt-0.5">
                4
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-amber-500" />
                    Add Keys to .env.local
                  </h3>
                  <button
                    onClick={copyEnvSnippet}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
                  >
                    {copiedEnv ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedEnv ? "Copied" : "Copy Template"}
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  In Supabase, go to <strong>Project Settings &rarr; API</strong>. Copy the <strong>Project URL</strong> and <strong>anon / public key</strong> into your project&apos;s <code className="text-indigo-600 dark:text-indigo-400 font-mono">.env.local</code>.
                </p>
                <div className="mt-2.5 p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto">
                  <p className="text-emerald-400">NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</p>
                  <p className="text-emerald-400">NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4" />
              Check Configuration &amp; Reload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
