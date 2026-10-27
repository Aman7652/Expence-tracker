import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Expense Tracker - Daily Expense Tracker (INR ₹)",
  description: "Production-ready, mobile-first daily expense tracker web app with Supabase, Recharts, and Google Sheets sync.",
  keywords: ["expense tracker", "budget tracker", "money manager", "INR", "indian rupee"],
  authors: [{ name: "Expense Tracker Team" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen selection:bg-emerald-500/20 selection:text-emerald-500`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
