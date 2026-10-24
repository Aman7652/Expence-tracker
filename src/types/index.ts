export type ExpenseCategory =
  | "Food"
  | "Travel"
  | "Bills"
  | "Shopping"
  | "Rent"
  | "Health"
  | "Entertainment"
  | "Other";

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: ExpenseCategory;
  note: string;
  expense_date: string; // YYYY-MM-DD
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  month: string; // YYYY-MM
  amount: number;
  created_at?: string;
}

export interface ExpenseFilterState {
  searchQuery: string;
  category: ExpenseCategory | "ALL";
  startDate: string;
  endDate: string;
}

export interface CategorySummary {
  category: ExpenseCategory;
  total: number;
  percentage: number;
  count: number;
}

export interface DailySummary {
  date: string; // YYYY-MM-DD or DD
  dayLabel: string;
  amount: number;
}
