"use client";

import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Expense } from "@/types";
import { CATEGORIES, formatINR } from "@/lib/constants";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";

interface ChartsSectionProps {
  expenses: Expense[];
  currentMonth: string; // YYYY-MM
  loading?: boolean;
}

export function ChartsSection({ expenses, currentMonth, loading }: ChartsSectionProps) {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"both" | "category" | "daily">("both");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (loading || !isMounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 animate-pulse" />
        <div className="h-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 animate-pulse" />
      </div>
    );
  }

  if (expenses.length === 0) {
    return null; // Empty state is handled by the expense list
  }

  // 1. Process Category Breakdown for Pie Chart
  const categoryTotals: Record<string, number> = {};
  let totalAmount = 0;

  expenses.forEach((e) => {
    const amt = Number(e.amount || 0);
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + amt;
    totalAmount += amt;
  });

  const pieData = Object.entries(categoryTotals)
    .map(([category, value]) => ({
      name: category,
      value,
      percentage: totalAmount > 0 ? Math.round((value / totalAmount) * 100) : 0,
      color: CATEGORIES[category as keyof typeof CATEGORIES]?.color || "#94a3b8",
    }))
    .sort((a, b) => b.value - a.value);

  // 2. Process Daily Spending for Bar Chart (deterministic)
  const [yearStr, monthStr] = (currentMonth || "2026-10").split("-");
  const year = parseInt(yearStr, 10) || 2026;
  const month = parseInt(monthStr, 10) || 10;
  const daysInMonth = new Date(year, month, 0).getDate();
  const maxDay = daysInMonth;

  const dailyMap: Record<number, number> = {};
  for (let d = 1; d <= maxDay; d++) {
    dailyMap[d] = 0;
  }

  expenses.forEach((e) => {
    if (e.expense_date) {
      const parts = e.expense_date.split("-");
      if (parts.length === 3) {
        const d = parseInt(parts[2], 10);
        if (d >= 1 && d <= maxDay) {
          dailyMap[d] = (dailyMap[d] || 0) + Number(e.amount || 0);
        }
      }
    }
  });

  const barData = Object.entries(dailyMap).map(([day, amount]) => ({
    day: `${day}`,
    dayLabel: `${day} ${new Date(year, month - 1, 1).toLocaleDateString("en-IN", { month: "short" })}`,
    amount,
  }));

  // Custom Recharts Tooltip for Category Pie Chart
  interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
      payload: {
        name: string;
        value: number;
        percentage: number;
        color: string;
      };
    }>;
  }

  const CustomPieTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white p-3 rounded-xl shadow-xl border border-slate-700/80 text-xs">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span className="font-bold">{data.name}</span>
          </div>
          <div className="text-slate-300">
            Amount: <strong className="text-white font-mono">{formatINR(data.value)}</strong>
          </div>
          <div className="text-slate-400 mt-0.5">{data.percentage}% of total expenses</div>
        </div>
      );
    }
    return null;
  };

  interface CustomBarTooltipProps {
    active?: boolean;
    payload?: Array<{
      payload: {
        dayLabel: string;
        amount: number;
      };
    }>;
  }

  const CustomBarTooltip = ({ active, payload }: CustomBarTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white p-3 rounded-xl shadow-xl border border-slate-700/80 text-xs">
          <div className="font-semibold text-slate-300 mb-0.5">{data.dayLabel}</div>
          <div className="text-emerald-400 font-bold font-mono text-sm">{formatINR(data.amount)}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Chart tab switcher for small screens */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>Visual Analytics</span>
        </h3>
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl p-1 text-xs">
          <button
            onClick={() => setActiveTab("both")}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeTab === "both"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("category")}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeTab === "category"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            Category
          </button>
          <button
            onClick={() => setActiveTab("daily")}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeTab === "daily"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            Daily
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1. Category Breakdown (Pie / Donut) */}
        {(activeTab === "both" || activeTab === "category") && (
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <PieChartIcon className="w-4 h-4 text-indigo-500" />
                Spending by Category
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                {pieData.length} active categories
              </span>
            </div>

            <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category pills legend */}
            <div className="flex flex-wrap gap-1.5 justify-center pt-2 border-t border-slate-100 dark:border-slate-800/80 mt-auto">
              {pieData.map((item) => (
                <div
                  key={item.name}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-700 dark:text-slate-300"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Daily Spending (Bar Chart) */}
        {(activeTab === "both" || activeTab === "daily") && (
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                Daily Spending Timeline
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                INR (₹)
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.4} />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    interval={maxDay > 15 ? 2 : 0}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    tickFormatter={(val) => (val >= 1000 ? `${Math.round(val / 1000)}k` : val)}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[11px] text-center text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/80 mt-auto">
              Daily expenditure for {new Date(year, month - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
