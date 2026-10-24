"use client";

import React, { useState, useMemo } from "react";
import { Expense, ExpenseCategory } from "@/types";
import { CATEGORIES, CATEGORY_LIST, formatINR, formatDateDisplay } from "@/lib/constants";
import {
  Search,
  Download,
  Filter,
  Trash2,
  Pencil,
  X,
  Plus,
  Receipt,
  Calendar,
  Tag,
} from "lucide-react";

interface ExpenseListProps {
  expenses: Expense[];
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onOpenAddModal: () => void;
  loading?: boolean;
  currentMonth: string;
}

export function ExpenseList({
  expenses,
  onEditExpense,
  onDeleteExpense,
  onOpenAddModal,
  loading,
  currentMonth,
}: ExpenseListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | "ALL">("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter expenses based on search, category, and date range
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      // 1. Search Query on note
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim();
        const noteMatch = (e.note || "").toLowerCase().includes(query);
        const catMatch = e.category.toLowerCase().includes(query);
        if (!noteMatch && !catMatch) return false;
      }

      // 2. Category filter
      if (selectedCategory !== "ALL" && e.category !== selectedCategory) {
        return false;
      }

      // 3. Date range filter
      if (startDate && e.expense_date < startDate) {
        return false;
      }
      if (endDate && e.expense_date > endDate) {
        return false;
      }

      return true;
    });
  }, [expenses, searchQuery, selectedCategory, startDate, endDate]);

  const hasActiveFilters = searchQuery !== "" || selectedCategory !== "ALL" || startDate !== "" || endDate !== "";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("ALL");
    setStartDate("");
    setEndDate("");
  };

  // CSV Export handler
  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) return;

    const headers = ["Expense ID", "Date", "Category", "Amount (INR)", "Note"];
    const rows = filteredExpenses.map((e) => {
      const escapedNote = (e.note || "").replace(/"/g, '""');
      return [
        `"${e.id}"`,
        `"${e.expense_date}"`,
        `"${e.category}"`,
        `"${e.amount}"`,
        `"${escapedNote}"`,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Kharcha_Expenses_${currentMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const confirmDelete = (id: string) => {
    onDeleteExpense(id);
    setDeletingId(null);
  };

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes or category..."
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action buttons: Clear & CSV Export */}
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                id="clear-filters-btn"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}

            <button
              onClick={handleExportCSV}
              disabled={filteredExpenses.length === 0}
              id="export-csv-btn"
              title="Export filtered expenses to CSV"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-indigo-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Category & Date Range Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl px-2.5 py-1.5 border border-slate-200 dark:border-slate-700">
            <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              id="category-filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ExpenseCategory | "ALL")}
              aria-label="Filter by category"
              className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {CATEGORY_LIST.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Start */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl px-2.5 py-1.5 border border-slate-200 dark:border-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="date"
              id="date-filter-start"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              aria-label="Filter from date"
              className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>

          {/* Date Range End */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl px-2.5 py-1.5 border border-slate-200 dark:border-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="date"
              id="date-filter-end"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              aria-label="Filter to date"
              className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Expenses List View */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Recent Transactions</span>
            <span className="text-xs font-normal text-slate-400">
              ({filteredExpenses.length} of {expenses.length})
            </span>
          </h3>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 animate-pulse"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-3 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
                <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State: No expenses logged for month */}
        {!loading && expenses.length === 0 && (
          <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 flex items-center justify-center">
              <Receipt className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
              No expenses in this month
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1 mb-5">
              Start recording your daily spending to see visual analytics and track your monthly budget.
            </p>
            <button
              onClick={onOpenAddModal}
              id="empty-add-expense-btn"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              Add First Expense
            </button>
          </div>
        )}

        {/* Empty State: Filter matched nothing */}
        {!loading && expenses.length > 0 && filteredExpenses.length === 0 && (
          <div className="text-center py-10 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center">
              <Filter className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No expenses match your filters
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">
              Try adjusting your search query, category, or date range.
            </p>
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Reset all filters
            </button>
          </div>
        )}

        {/* Expense Items List */}
        {!loading && filteredExpenses.length > 0 && (
          <div className="space-y-2">
            {filteredExpenses.map((expense) => {
              const meta = CATEGORIES[expense.category] || CATEGORIES.Other;
              const Icon = meta.icon;
              const isDeleting = deletingId === expense.id;

              return (
                <div
                  key={expense.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs transition-all flex items-center justify-between gap-3 group"
                >
                  {/* Left: Icon and Details */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: `${meta.color}15`,
                        borderColor: `${meta.color}35`,
                        color: meta.color,
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {expense.note && expense.note.trim() !== "" ? expense.note : expense.category}
                        </span>
                        {expense.note && expense.note.trim() !== "" && (
                          <span
                            className="hidden sm:inline-block text-[10px] font-medium px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${meta.color}15`,
                              color: meta.color,
                            }}
                          >
                            {expense.category}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {formatDateDisplay(expense.expense_date)}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount and Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-mono">
                        {formatINR(expense.amount)}
                      </span>
                    </div>

                    {/* Action buttons or delete confirm */}
                    {isDeleting ? (
                      <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/60 p-1 rounded-xl border border-rose-200 dark:border-rose-800 animate-in fade-in">
                        <button
                          onClick={() => confirmDelete(expense.id)}
                          className="px-2 py-1 text-[11px] font-bold text-white bg-rose-600 rounded-lg hover:bg-rose-700"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditExpense(expense)}
                          aria-label={`Edit expense ${expense.note || expense.category}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(expense.id)}
                          aria-label={`Delete expense ${expense.note || expense.category}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
