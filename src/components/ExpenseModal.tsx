"use client";

import React, { useState, useEffect } from "react";
import { Expense, ExpenseCategory } from "@/types";
import { CATEGORIES, CATEGORY_LIST } from "@/lib/constants";
import { X, Calendar, IndianRupee, FileText } from "lucide-react";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    amount: number;
    category: ExpenseCategory;
    note: string;
    expense_date: string;
  }) => Promise<boolean>;
  initialData?: Expense | null;
  defaultDate?: string;
}

export function ExpenseModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultDate,
}: ExpenseModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<ExpenseCategory>("Food");
  const [note, setNote] = useState<string>("");
  const [expenseDate, setExpenseDate] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount ? String(initialData.amount) : "");
      setCategory(initialData.category || "Food");
      setNote(initialData.note || "");
      setExpenseDate(initialData.expense_date || new Date().toISOString().split("T")[0]);
    } else {
      setAmount("");
      setCategory("Food");
      setNote("");
      // Set to today or current month's first day if defaultDate provided
      const today = new Date().toISOString().split("T")[0];
      setExpenseDate(defaultDate ? `${defaultDate}-01` : today);
    }
    setErrorMessage("");
  }, [initialData, defaultDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("Please enter an amount greater than ₹0");
      return;
    }

    if (!category) {
      setErrorMessage("Please select a category");
      return;
    }

    if (!expenseDate) {
      setErrorMessage("Please select a valid date");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onSave({
        id: initialData?.id,
        amount: parsedAmount,
        category,
        note: note.trim(),
        expense_date: expenseDate,
      });

      if (success) {
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save expense";
      setErrorMessage(msg);
      // NOTE: Form inputs are preserved so user does not lose their entries!
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-5 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 id="modal-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {initialData ? "Edit Expense" : "Add New Expense"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label htmlFor="expense-amount-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Amount (INR ₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <IndianRupee className="w-5 h-5" />
              </div>
              <input
                id="expense-amount-input"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-lg font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
          </div>

          {/* Category Selector Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Category <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORY_LIST.map((cat) => {
                const meta = CATEGORIES[cat];
                const Icon = meta.icon;
                const isSelected = category === cat;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`p-2 sm:p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 border transition-all text-xs font-medium ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-xs scale-102"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: isSelected ? meta.color : `${meta.color}20`,
                        color: isSelected ? "#ffffff" : meta.color,
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold truncate w-full text-center">
                      {cat}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label htmlFor="expense-date-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                id="expense-date-input"
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label htmlFor="expense-note-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Note (optional)
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
                <FileText className="w-4 h-4" />
              </div>
              <input
                id="expense-note-input"
                type="text"
                placeholder="e.g. Swiggy dinner, Metro recharge, Groceries"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={100}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              id="save-expense-btn"
              className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : initialData ? "Save Changes" : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
