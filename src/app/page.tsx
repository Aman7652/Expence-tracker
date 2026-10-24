"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { SetupGuide } from "@/components/SetupGuide";
import { Navbar } from "@/components/Navbar";
import { SummaryCards } from "@/components/SummaryCards";
import { BudgetBar } from "@/components/BudgetBar";
import { ChartsSection } from "@/components/ChartsSection";
import { ExpenseList } from "@/components/ExpenseList";
import { ExpenseModal } from "@/components/ExpenseModal";
import { BudgetModal } from "@/components/BudgetModal";
import { SettingsModal } from "@/components/SettingsModal";
import { FloatingAddButton } from "@/components/FloatingAddButton";
import { useToast } from "@/components/Toast";
import { Expense, ExpenseCategory } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();

  // 1. Initial configuration check
  const isConfigured = isSupabaseConfigured();

  // Current Month: format "YYYY-MM" (initialized statically to avoid prerender clock instability)
  const [currentMonth, setCurrentMonth] = useState<string>("2026-10");

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    setCurrentMonth(`${year}-${month}`);
  }, []);

  const [userEmail, setUserEmail] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [budgetAmount, setBudgetAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // If Supabase is not configured, show helpful Setup Screen
  if (!isConfigured) {
    return <SetupGuide />;
  }

  const supabase = createClient();

  // Fetch all data for the current user and selected month
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Get current user session
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      setUserEmail(user.email || "");
      setUserId(user.id);

      // 2. Calculate date range for the current month
      const [yearStr, monthStr] = currentMonth.split("-");
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const daysInMonth = new Date(year, month, 0).getDate();
      const startDate = `${currentMonth}-01`;
      const endDate = `${currentMonth}-${String(daysInMonth).padStart(2, "0")}`;

      // 3. Fetch expenses for this month
      const { data: monthExpensesData, error: expensesError } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .gte("expense_date", startDate)
        .lte("expense_date", endDate)
        .order("expense_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (expensesError) {
        showToast(`Failed to load expenses: ${expensesError.message}`, "error");
      } else {
        setExpenses(monthExpensesData || []);
      }

      // 4. Fetch budget for this month
      const { data: budgetData, error: budgetError } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user.id)
        .eq("month", currentMonth)
        .maybeSingle();

      if (!budgetError && budgetData) {
        setBudgetAmount(Number(budgetData.amount));
      } else {
        setBudgetAmount(null);
      }

      // 5. Fetch all expenses count for settings sync
      const { data: allData } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .order("expense_date", { ascending: false });

      if (allData) {
        setAllExpenses(allData);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error loading data";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [currentMonth, router, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Non-blocking Google Sheets Webhook caller helper
  const triggerWebhook = async (payload: {
    action: "add" | "update" | "delete";
    id: string;
    amount?: number;
    category?: string;
    note?: string;
    date?: string;
  }) => {
    try {
      await fetch("/api/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // Non-blocking: Errors are caught and ignored on client
    }
  };

  // Handle Add or Edit Expense
  const handleSaveExpense = async (data: {
    id?: string;
    amount: number;
    category: ExpenseCategory;
    note: string;
    expense_date: string;
  }): Promise<boolean> => {
    if (!userId) {
      showToast("User session not found. Please re-login.", "error");
      return false;
    }

    try {
      if (data.id) {
        // Edit / Update
        const { error } = await supabase
          .from("expenses")
          .update({
            amount: data.amount,
            category: data.category,
            note: data.note,
            expense_date: data.expense_date,
          })
          .eq("id", data.id)
          .eq("user_id", userId);

        if (error) {
          showToast(`Error updating expense: ${error.message}`, "error");
          return false;
        }

        showToast("Expense updated successfully!", "success");

        // Trigger Google Sheets Webhook (non-blocking)
        triggerWebhook({
          action: "update",
          id: data.id,
          amount: data.amount,
          category: data.category,
          note: data.note,
          date: data.expense_date,
        });
      } else {
        // Insert / Add
        const { data: inserted, error } = await supabase
          .from("expenses")
          .insert({
            user_id: userId,
            amount: data.amount,
            category: data.category,
            note: data.note,
            expense_date: data.expense_date,
          })
          .select()
          .single();

        if (error) {
          showToast(`Error adding expense: ${error.message}`, "error");
          return false;
        }

        showToast("Expense added successfully!", "success");

        // Trigger Google Sheets Webhook (non-blocking)
        if (inserted?.id) {
          triggerWebhook({
            action: "add",
            id: inserted.id,
            amount: data.amount,
            category: data.category,
            note: data.note,
            date: data.expense_date,
          });
        }
      }

      await fetchData();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Database error";
      showToast(msg, "error");
      return false;
    }
  };

  // Handle Delete Expense
  const handleDeleteExpense = async (id: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) {
        showToast(`Failed to delete expense: ${error.message}`, "error");
        return;
      }

      showToast("Expense deleted", "info");

      // Trigger Google Sheets Webhook (non-blocking)
      triggerWebhook({
        action: "delete",
        id,
      });

      // Update state locally
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      setAllExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      showToast(msg, "error");
    }
  };

  // Handle Save Budget
  const handleSaveBudget = async (month: string, amount: number): Promise<boolean> => {
    if (!userId) return false;

    try {
      const { error } = await supabase.from("budgets").upsert(
        {
          user_id: userId,
          month,
          amount,
        },
        { onConflict: "user_id,month" }
      );

      if (error) {
        showToast(`Failed to save budget: ${error.message}`, "error");
        return false;
      }

      setBudgetAmount(amount);
      showToast("Monthly budget updated!", "success");
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Budget error";
      showToast(msg, "error");
      return false;
    }
  };

  const totalSpent = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  return (
    <div className="min-h-screen pb-28 md:pb-16 flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Top Navbar */}
      <Navbar
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        userEmail={userEmail}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 space-y-6 flex-1">
        {/* 1. Monthly Summary Cards */}
        <SummaryCards
          expenses={expenses}
          currentMonth={currentMonth}
          loading={loading}
        />

        {/* 2. Monthly Budget Progress & Warnings */}
        <BudgetBar
          totalSpent={totalSpent}
          budgetAmount={budgetAmount}
          onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
          loading={loading}
        />

        {/* 3. Recharts Visual Analytics (Pie & Bar) */}
        <ChartsSection
          expenses={expenses}
          currentMonth={currentMonth}
          loading={loading}
        />

        {/* 4. Expense List with Search, Filters & CSV Export */}
        <ExpenseList
          expenses={expenses}
          currentMonth={currentMonth}
          onEditExpense={(expense) => {
            setEditingExpense(expense);
            setIsExpenseModalOpen(true);
          }}
          onDeleteExpense={handleDeleteExpense}
          onOpenAddModal={() => {
            setEditingExpense(null);
            setIsExpenseModalOpen(true);
          }}
          loading={loading}
        />
      </main>

      {/* Floating Action Button */}
      <FloatingAddButton
        onClick={() => {
          setEditingExpense(null);
          setIsExpenseModalOpen(true);
        }}
      />

      {/* Modals */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        initialData={editingExpense}
        defaultDate={currentMonth}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        currentMonth={currentMonth}
        currentBudget={budgetAmount}
        onSaveBudget={handleSaveBudget}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        userEmail={userEmail}
        allExpenses={allExpenses}
      />
    </div>
  );
}
