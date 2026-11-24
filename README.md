# Nodzo Finance — SaaS Expense & Financial Management System

> Production-ready internal financial management SaaS web application built specifically for **Nodzo AI** — an AI-powered call tracking, transcription, sales analytics, and CRM platform.

---

## 🚀 Key Specifications

- **Target Audience:** Internal Founder & Finance Operations Team (Nodzo AI)
- **Primary Currency:** Indian Rupee (`INR - ₹`)
- **Secondary Currency:** US Dollar (`USD - $`) (with real-time conversion & exchange rate control)
- **Fiscal Calendar:** April 1 to March 31 (Indian Financial Year)
- **Timezone:** Asia/Kolkata (IST)
- **Design Inspiration:** Linear, Attio, Stripe Dashboard (warm off-white / near-black surfaces, restrained indigo accent, compact data tables)

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19, TypeScript, Vite |
| **Styling & Design System** | Tailwind CSS, Lucide Icons, Custom Design Tokens |
| **State Management** | Context API + Resilient LocalVault + Supabase Sync |
| **Charts & Visualizations** | Recharts (Monthly Bars, Category Donut, Area Profit Trend, AI Pipeline Line, Cash Runway) |
| **Database & Auth** | Supabase (PostgreSQL, Row Level Security, Storage, Audit Triggers) |
| **Tax & Compliance** | India GST Engine (CGST 9% + SGST 9%, IGST 18%, ITC Eligibility) |

---

## 📁 System Architecture & Modules

```
src/
├── components/
│   ├── common/
│   │   └── GlobalSearchModal.tsx       # Cmd+K / Ctrl+K keyboard navigation
│   ├── layout/
│   │   ├── Header.tsx                  # Org profile, Currency switch, Role switch, Quick Add
│   │   └── Sidebar.tsx                 # 10 Module Navigation with badges & DB status
│   ├── modals/
│   │   ├── AddExpenseModal.tsx         # Expense entry, GST breakdown, duplicate detector
│   │   ├── AddRevenueModal.tsx         # Customer contract invoice creator, MRR vs usage
│   │   ├── AddSubscriptionModal.tsx    # Recurring software tracker & reminders
│   │   ├── AddTransferModal.tsx        # Internal bank transfer (excluded from P&L)
│   │   ├── AddAIUsageModal.tsx         # Operational call log recorder (STT, LLM, GPU)
│   │   └── ReceiptExtractorModal.tsx   # AI receipt OCR simulation & confirmation
│   └── views/
│       ├── OverviewView.tsx            # 10 Executive KPIs + 6 Recharts Visualizations
│       ├── ExpensesView.tsx            # Expense CRUD, filters, duplicate check, CSV export
│       ├── RevenueView.tsx             # MRR, ARR, agent seats, cash vs accrual toggle
│       ├── SubscriptionsView.tsx       # 7d, 3d, 1d renewal alerts, payment reconciliation
│       ├── AICostsView.tsx             # 7 Nodzo unit metrics, provider breakdown & reconciliation
│       ├── CashFlowView.tsx            # 5 financial accounts, treasury liquidity, internal transfers
│       ├── BudgetsView.tsx             # Category spending vs budget, 80%/100%/120% alerts
│       ├── InvoicesReceiptsView.tsx    # Document vault, PDF preview, duplicate invoice check
│       ├── ReportsView.tsx             # GSTR-3B tax summary, GAAP P&L, customer margins
│       └── SettingsView.tsx            # Supabase credentials, RBAC matrix, audit log, demo seed
├── context/
│   └── FinanceContext.tsx              # Central reactive financial state and audit dispatcher
├── hooks/
│   └── useFinancialMetrics.ts          # Financial math, MoM calculations, date filters
├── lib/
│   ├── supabase.ts                     # Supabase client wrapper & runtime credential switcher
│   └── utils.ts                        # INR/USD currency formatter, dates, IDs
└── types/
    └── finance.ts                      # Normalized TypeScript types & models
```

---

## 🗄️ Database Schema & Supabase Migrations

The database migration file is located at:
`supabase/migrations/20261118000001_nodzo_schema.sql`

And pre-seeded organization fixtures are in:
`supabase/seed.sql`

### Core Normalized Tables
1. `organizations`: Legal entity, GSTIN, PAN, currencies, fiscal year start.
2. `organization_members`: RBAC roles (`owner`, `finance_manager`, `viewer`).
3. `financial_accounts`: Business banks (HDFC), personal accounts, UPI, forex cards, petty cash.
4. `expense_categories` & `expense_subcategories`: Pre-seeded with Nodzo AI categories.
5. `vendors`: Service providers (OpenAI, Modal, Deepgram, Supabase, Anthropic, etc.).
6. `expenses`: Decimal currency fields, GST split, CGST, SGST, IGST, ITC eligibility, soft delete.
7. `recurring_subscriptions`: Billing intervals, renewal reminders (7d, 3d, 1d), owner.
8. `customers`: Enterprise clients, agent seat volume, contract MRR.
9. `revenue_invoices`: Invoiced contracts, GST breakdown, accrual vs cash collected.
10. `ai_usage_records`: Calls, audio minutes, token counts, unit costs, operational reconciliation.
11. `ai_provider_invoices`: Actual vendor invoices compared against internal operational estimates.
12. `budgets`: Category monthly limits, thresholds (80%, 100%, 120%), month-end run rates.
13. `financial_transfers`: Internal account rebalancing (strictly excluded from P&L).
14. `audit_logs`: Immutable security log for all financial events.

---

## 📊 Financial Rules & Compliance Implementation

1. **Invoiced Revenue vs. Cash Collected:**
   - Contract MRR & ARR are calculated strictly from active recurring subscription contracts, not total cash collected.
   - Operating revenue in Accrual Mode excludes GST collected on behalf of the Government of India.
2. **Internal Transfers Segregation:**
   - Transfers between HDFC, ICICI, UPI, or Forex cards adjust ledger liquidity directly without being counted as revenue or expense.
3. **AI Cost Reconciliation:**
   - Call logs and token metrics provide real-time operational cost estimates. Actual provider bills (OpenAI, Deepgram, Modal) are reconciled with estimates to eliminate duplicate expense accounting.
4. **Subscription Payment Confirmation:**
   - Recurring software renewals trigger alerts (7d, 3d, 1d) but are never recorded as paid expenses until confirmed or reconciled against bank statements.
5. **India GST & Input Tax Credit (ITC):**
   - GST-inclusive and exclusive options.
   - Intra-state (CGST 9% + SGST 9%) vs Inter-state (IGST 18%).
   - Separate tracking of Eligible ITC vs Blocked ITC under Section 17(5) (e.g., salaries).

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Run Vite development server
npm run dev

# Run Production Build
npm run build
```

---

## 🔑 Supabase Connection
To link your Supabase project:
1. Open the web app.
2. Navigate to **Settings** › **Supabase PostgreSQL DB**.
3. Enter your Supabase Project URL and Anon Public Key.
4. Execute the SQL migration in your Supabase SQL Editor.
