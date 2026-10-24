import {
  Utensils,
  Plane,
  Receipt,
  ShoppingBag,
  Home,
  HeartPulse,
  Film,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import { ExpenseCategory } from "@/types";

export interface CategoryMeta {
  label: ExpenseCategory;
  icon: LucideIcon;
  color: string;       // HEX for recharts & badges
  bgLight: string;     // Tailwind class or style
  textLight: string;
  darkBg: string;
}

export const CATEGORIES: Record<ExpenseCategory, CategoryMeta> = {
  Food: {
    label: "Food",
    icon: Utensils,
    color: "#10b981", // Emerald 500
    bgLight: "bg-emerald-50 text-emerald-700 border-emerald-200",
    textLight: "text-emerald-600",
    darkBg: "dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50",
  },
  Travel: {
    label: "Travel",
    icon: Plane,
    color: "#3b82f6", // Blue 500
    bgLight: "bg-blue-50 text-blue-700 border-blue-200",
    textLight: "text-blue-600",
    darkBg: "dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50",
  },
  Bills: {
    label: "Bills",
    icon: Receipt,
    color: "#f59e0b", // Amber 500
    bgLight: "bg-amber-50 text-amber-700 border-amber-200",
    textLight: "text-amber-600",
    darkBg: "dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50",
  },
  Shopping: {
    label: "Shopping",
    icon: ShoppingBag,
    color: "#a855f7", // Purple 500
    bgLight: "bg-purple-50 text-purple-700 border-purple-200",
    textLight: "text-purple-600",
    darkBg: "dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800/50",
  },
  Rent: {
    label: "Rent",
    icon: Home,
    color: "#f43f5e", // Rose 500
    bgLight: "bg-rose-50 text-rose-700 border-rose-200",
    textLight: "text-rose-600",
    darkBg: "dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50",
  },
  Health: {
    label: "Health",
    icon: HeartPulse,
    color: "#14b8a6", // Teal 500
    bgLight: "bg-teal-50 text-teal-700 border-teal-200",
    textLight: "text-teal-600",
    darkBg: "dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800/50",
  },
  Entertainment: {
    label: "Entertainment",
    icon: Film,
    color: "#6366f1", // Indigo 500
    bgLight: "bg-indigo-50 text-indigo-700 border-indigo-200",
    textLight: "text-indigo-600",
    darkBg: "dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/50",
  },
  Other: {
    label: "Other",
    icon: MoreHorizontal,
    color: "#64748b", // Slate 500
    bgLight: "bg-slate-100 text-slate-700 border-slate-200",
    textLight: "text-slate-600",
    darkBg: "dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700",
  },
};

export const CATEGORY_LIST: ExpenseCategory[] = [
  "Food",
  "Travel",
  "Bills",
  "Shopping",
  "Rent",
  "Health",
  "Entertainment",
  "Other",
];

/**
 * Formats a number to Indian Rupee (INR) format (e.g. ₹1,25,000)
 */
export function formatINR(amount: number, showDecimals: boolean = false): string {
  const validAmount = typeof amount === "number" && !isNaN(amount) ? amount : 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(validAmount);
}

/**
 * Format date to standard Indian reading format (e.g., 24 Oct 2026)
 */
export function formatDateDisplay(dateString: string): string {
  if (!dateString) return "";
  try {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}
