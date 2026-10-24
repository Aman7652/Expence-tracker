# Kharcha - Daily Expense Tracker (INR ₹)

A production-ready, mobile-first Daily Expense Tracker web app built with Next.js (App Router), TypeScript, Tailwind CSS, Supabase Auth & Postgres, Recharts, and Google Sheets webhook sync.

![Kharcha Tracker Banner](https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80)

---

## Features

- **Mobile-First UI & Indian Rupee (₹)**: Designed specifically for phones and modern browsers, formatted with Indian numbering (`en-IN`, e.g. `₹1,25,000`).
- **Supabase Authentication**: Secure email and password signup, signin, session cookies using `@supabase/ssr`, and protected routes via Next.js middleware.
- **Supabase Postgres with RLS**: All expenses and monthly budgets are securely stored with Row Level Security (RLS) policies.
- **Fixed Categories with Icons**: Food, Travel, Bills, Shopping, Rent, Health, Entertainment, and Other.
- **Monthly Budget Alert System**:
  - Interactive monthly budget limit bar.
  - **80% Yellow Warning Banner**: Alerts you as you approach your limit.
  - **100% Red Danger Banner**: Immediate notice when budget is exceeded.
- **Visual Analytics with Recharts**:
  - **Category Pie / Donut Chart**: Breakdown of spending by category with percentages.
  - **Daily Spending Bar Chart**: Day-by-day expenditure timeline for the selected month.
- **Advanced Filters & Search**: Real-time search across notes, category filters, and custom date range filters.
- **CSV Export**: One-click download of the currently filtered expenses.
- **Google Sheets Webhook Sync (Optional)**: Automatically triggers a non-blocking server POST to a Google Apps Script Web App after every add, edit, or delete, plus a batch sync button in Settings.
- **Dark Mode**: Persistent dark and light mode toggle.
- **Zero-Crash Setup Experience**: If Supabase environment variables are missing, a friendly interactive Setup Guide is shown with copyable steps and schema instructions.

---

## Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **Next.js (App Router) + TS** | Framework, SSR, Client/Server components & API routes |
| **Tailwind CSS** | Styling, responsive layout, dark mode |
| **Supabase Auth** | Signup, login, session management |
| **Supabase Postgres** | Relational database with Row Level Security |
| **@supabase/ssr** | Cookie-based authentication for App Router |
| **Recharts** | Interactive pie and bar charts |
| **Lucide React** | Icons |
| **Google Apps Script** | Webhook listener for Google Sheets sync |
| **Vercel** | One-click hosting |

---

## Step-by-Step Setup Guide

### 1. Create Supabase Project
1. Go to [Supabase](https://supabase.com/) and sign in.
2. Click **New Project**, choose an organization, project name (e.g. `kharcha-tracker`), and a strong database password.
3. Wait ~1-2 minutes for the database to provision.

### 2. Run Database Schema
1. In your Supabase project dashboard, open the **SQL Editor** from the left sidebar.
2. Click **New query**.
3. Copy the entire contents of [`supabase/schema.sql`](./supabase/schema.sql) and paste it into the editor.
4. Click **Run** (Cmd/Ctrl + Enter). This creates the `expenses` and `budgets` tables, indexes, and enables Row Level Security policies.

### 3. Turn Off Email Confirmation (For Instant Testing)
1. In your Supabase dashboard, navigate to **Authentication** &rarr; **Providers** &rarr; **Email**.
2. Toggle off **"Confirm email"** and click **Save**.
   *(This allows you to sign up and log in immediately without waiting for an email confirmation link).*

### 4. Configure Environment Variables
1. In Supabase, navigate to **Project Settings** (gear icon) &rarr; **API**.
2. Copy your **Project URL** and **anon / public key**.
3. In the root of this project, create a file named `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
4. Paste your credentials into `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   GOOGLE_SHEET_WEBHOOK_URL=
   ```

### 5. Run Locally
Install dependencies and start the development server:
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Google Sheets Sync Setup (Optional)

To mirror your expenses into Google Sheets automatically:

1. Open [Google Sheets](https://sheets.new) and create a new blank spreadsheet.
2. In the Google Sheets top menu, click **Extensions** &rarr; **Apps Script**.
3. Replace any code in `Code.gs` with the entire content of [`google-apps-script.js`](./google-apps-script.js).
4. Click **Deploy** &rarr; **New deployment**.
5. Click the gear icon next to "Select type" and choose **Web app**.
   - **Description**: `Expense Tracker Webhook`
   - **Execute as**: `Me (<your-email>)`
   - **Who has access**: `Anyone` *(allows your Next.js backend to send webhook data)*
6. Click **Deploy**, authorize access if prompted, and copy the **Web app URL** (ends with `/exec`).
7. Paste this URL into your `.env.local` as:
   ```env
   GOOGLE_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/your-deployment-id/exec
   ```
8. In the web app, you can also open **Settings** and click **"Sync All Expenses to Google Sheet"** at any time.

---

## Deploy to Vercel

1. Push this project to your GitHub repository:
   ```bash
   git add .
   git commit -m "feat: complete production-ready expense tracker"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
2. Go to [Vercel](https://vercel.com/) and click **Add New** &rarr; **Project**.
3. Select your GitHub repository and click **Import**.
4. In the **Environment Variables** section, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = `your Supabase project URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your Supabase anon key`
   - `GOOGLE_SHEET_WEBHOOK_URL` = `your Google Apps Script Web App URL (optional)`
5. Click **Deploy**. Vercel will build and launch your application globally!

---

## Troubleshooting

### 1. Blank page or Setup Guide after deploy
- **Cause**: Missing or placeholder Supabase environment variables on Vercel.
- **Fix**: Open your project settings in Vercel &rarr; **Environment Variables**. Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are added. Redeploy the latest commit.

### 2. Login or Sign Up not working ("Email not confirmed")
- **Cause**: Email confirmation is enabled in Supabase by default, requiring you to click an email verification link before logging in.
- **Fix**: In your Supabase dashboard, go to **Authentication** &rarr; **Providers** &rarr; **Email** and toggle off **Confirm email**. Alternatively, check the spam/inbox folder for the confirmation link.

### 3. Data not showing or "Permission denied"
- **Cause**: Either `supabase/schema.sql` was not run, or Row Level Security (RLS) is blocking access.
- **Fix**: Open Supabase SQL Editor and run `supabase/schema.sql`. Ensure you are signed in with the same user account that created the expenses.

### 4. Build errors (Package version mismatch)
- **Cause**: Incompatible lockfile or missing dependency.
- **Fix**: Run `npm run build` locally. If issues persist, delete `node_modules` and `.next` then run:
  ```bash
  rm -rf node_modules .next package-lock.json
  npm install
  npm run build
  ```

---

## Database Schema Reference

```sql
expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  note TEXT DEFAULT '',
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- 'YYYY-MM'
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_month_budget UNIQUE (user_id, month)
);
```

---

## License
MIT
