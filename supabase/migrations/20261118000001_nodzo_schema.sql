-- ==============================================================================
-- NODZO FINANCE DATABASE SCHEMA MIGRATION
-- Production-grade schema for SaaS Financial Management (Nodzo AI)
-- Normalized tables, RLS policies, triggers, and indices
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Organizations
create table if not exists public.organizations (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    slug text not null unique,
    default_currency text not null default 'INR',
    secondary_currency text not null default 'USD',
    fiscal_year_start_month integer not null default 4, -- April
    gst_registered boolean not null default true,
    gstin text,
    pan text,
    address text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 2. Organization Members & Roles
create table if not exists public.organization_members (
    id uuid primary key default uuid_generate_v4(),
    organization_id uuid not null references public.organizations(id) on delete cascade,
    user_id uuid,
    role text not null check (role in ('owner', 'finance_manager', 'viewer')),
    full_name text not null,
    email text not null,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

-- 3. Financial Accounts (Bank accounts, UPI, Credit Card, Cash)
create table if not exists public.financial_accounts (
    id uuid primary key default uuid_generate_v4(),
    organization_id uuid not null references public.organizations(id) on delete cascade,
    name text not null,
    type text not null check (type in ('business_bank', 'personal_business', 'upi', 'credit_card', 'cash')),
    account_number_mask text,
    currency text not null default 'INR',
    opening_balance numeric(15,2) not null default 0.00,
    current_balance numeric(15,2) not null default 0.00,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 4. Expense Categories
create table if not exists public.expense_categories (
    id uuid primary key default uuid_generate_v4(),
    organization_id uuid not null references public.organizations(id) on delete cascade,
    name text not null,
    code text not null,
    icon text,
    color text,
    is_system boolean not null default false,
    created_at timestamptz not null default now()
);

-- 5. Expense Subcategories
create table if not exists public.expense_subcategories (
    id uuid primary key default uuid_generate_v4(),
    category_id uuid not null references public.expense_categories(id) on delete cascade,
    name text not null,
    code text not null,
    created_at timestamptz not null default now()
);

-- 6. Vendors
create table if not exists public.vendors (
    id uuid primary key default uuid_generate_v4(),
    organization_id uuid not null references public.organizations(id) on delete cascade,
    name text not null,
    category_id uuid references public.expense_categories(id) on delete set null,
    default_currency text not null default 'INR',
    gstin text,
    pan text,
    website text,
    contact_email text,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

-- 7. Expenses
create table if not exists public.expenses (
    id uuid primary key default uuid_generate_v4(),
    organization_id uuid not null references public.organizations(id) on delete cascade,
    expense_number text not null,
    title text not null,
    description text,
    category_id uuid not null references public.expense_categories(id),
    subcategory_id uuid references public.expense_subcategories(id),
    vendor_id uuid references public.vendors(id),
    amount numeric(15,2) not null,
    currency text not null default 'INR',
    exchange_rate numeric(10,4) not null default 1.0000,
    expense_date date not null default current_date,
    payment_method text not null check (payment_method in ('bank_transfer', 'upi', 'credit_card', 'debit_card', 'cash')),
    account_id uuid not null references public.financial_accounts(id),
    gst_percentage numeric(5,2) not null default 0.00,
    base_amount numeric(15,2) not null,
    gst_amount numeric(15,2) not null default 0.00,
    cgst_amount numeric(15,2) not null default 0.00,
    sgst_amount numeric(15,2) not null default 0.00,
    igst_amount numeric(15,2) not null default 0.00,
    itc_eligible boolean not null default true,
    total_amount numeric(15,2) not null,
    total_amount_inr numeric(15,2) not null,
    invoice_number text,
    payment_status text not null check (payment_status in ('paid', 'pending', 'scheduled', 'reimbursed', 'cancelled')),
    is_recurring boolean not null default false,
    notes text,
    created_by uuid,
    is_deleted boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 8. Expense Attachments
create table if not exists public.expense_attachments (
    id uuid primary key default uuid_generate_v4(),
    expense_id uuid not null references public.expenses(id) on delete cascade,
    file_name text not null,
    file_url text not null,
    file_size integer not null,
    mime_type text not null,
    storage_path text not null,
    extracted_data jsonb,
    created_at timestamptz not null default now()
);

-- 9. Recurring Subscriptions
create table if not exists public.recurring_subscriptions (
    id uuid primary key default uuid_generate_v4(),
    organization_id uuid not null references public.organizations(id) on delete cascade,
    service_name text not null,
    category_id uuid not null references public.expense_categories(id),
    vendor_id uuid references public.vendors(id),
    amount numeric(15,2) not null,
    currency text not null default 'USD',
    billing_frequency text not null check (billing_frequency in ('monthly', 'quarterly', 'half_yearly', 'annual')),
    next_billing_date date not null,
    payment_account_id uuid references public.financial_accounts(id),
    auto_renewal boolean not null default true,
    subscription_owner text not null,
    status text not null check (status in ('active', 'paused', 'cancelled')),
    reminder_days integer[] not null default '{7,3,1}',
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 10. Subscription Payment Occurrences (Reconciliation)
create table if not exists public.subscription_payment_occurrences (
    id uuid primary key default uuid_generate_v4(),
    subscription_id uuid not null references public.recurring_subscriptions(id) on delete cascade,
    due_date date not null,
    amount numeric(15,2) not null,
    currency text not null default 'USD',
    status text not null check (status in ('upcoming', 'confirmed', 'skipped')),
    expense_id uuid references public.expenses(id) on delete set null,
    confirmed_at timestamptz,
    created_at timestamptz not null default now()
);

-- 11. Customers
create table if not exists public.customers (
    id uuid primary key default uuid_generate_v4(),
    organization_id uuid not null references public.organizations(id) on delete cascade,
    company_name text not null,
    contact_name text not null,
    email text not null,
    phone text,
    gstin text,
    billing_address text,
    status text not null default 'active' check (status in ('active', 'churned', 'lead')),
    created_at timestamptz not null default now()
);

-- 12. Revenue Invoices
create table if not exists public.revenue_invoices (
    id uuid primary key default uuid_generate_v4(),
    organization_id uuid not null references public.organizations(id) on delete cascade,
    invoice_number text not null,
    customer_id uuid not null references public.customers(id),
    subscription_plan text not null,
    agent_seats integer not null default 1,
    subscription_duration_months integer not null default 1,
    subscription_amount numeric(15,2) not null default 0.00,
    ai_usage_charges numeric(15,2) not null default 0.00,
    discount numeric(15,2) not null default 0.00,
    subtotal numeric(15,2) not null,
    gst_percentage numeric(5,2) not null default 18.00,
    gst_amount numeric(15,2) not null default 0.00,
    total_amount numeric(15,2) not null,
    currency text not null default 'INR',
    invoice_date date not null default current_date,
    payment_due_date date not null,
    payment_received_date date,
    payment_status text not null check (payment_status in ('draft', 'pending', 'partially_paid', 'paid', 'overdue', 'refunded')),
    payment_method text,
    account_id uuid references public.financial_accounts(id),
    notes text,
    is_deleted boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 13. Revenue Invoice Items
create table if not exists public.revenue_invoice_items (
    id uuid primary key default uuid_generate_v4(),
    invoice_id uuid not null references public.revenue_invoices(id) on delete cascade,
    description text not null,
    item_type text not null check (item_type in ('subscription', 'ai_usage', 'setup_fee', 'addon')),
    quantity numeric(10,2) not null default 1,
    unit_price numeric(15,2) not null,
    amount numeric(15,2) not null
);

-- 14. Customer Payments
create table if not exists public.customer_payments (
    id uuid primary key default uuid_generate_v4(),
    organization_id uuid not null references public.organizations(id) on delete cascade,
    invoice_id uuid not null references public.revenue_invoices(id) on delete cascade,
    customer_id uuid not null references public.customers(id),
    amount numeric(15,2) not null,
    payment_date date not null default current_date,
    payment_method text not null,
    account_id uuid not null references public.financial_accounts(id),
    reference_number text,
    notes text,
    created_at timestamptz not null default now()
);

-- 15. AI Usage Records (Nodzo Operational Tracking)
create table if not exists public.ai_usage_records (
    id uuid primary key default uuid_generate_v4(),
    organization_id uuid not null references public.organizations(id) on delete cascade,
    customer_id uuid references public.customers(id) on delete set null,
    date date not null default current_date,
    provider text not null, -- 'OpenAI', 'Gemini', 'Anthropic', 'Modal', 'Deepgram'
    model text not null,    -- 'gpt-4o', 'gemini-1.5-pro', 'claude-3-5-sonnet', 'whisper-large-v3'
    service_type text not null check (service_type in ('speech_to_text', 'call_analysis', 'gpu_inference', 'llm_api', 'audio_storage', 'data_transfer')),
    calls_count integer not null default 0,
    audio_minutes numeric(10,2) not null default 0.00,
    tokens_input integer not null default 0,
    tokens_output integer not null default 0,
    unit_price numeric(10,6) not null default 0.00,
    currency text not null default 'USD',
    estimated_cost_usd numeric(12,4) not null default 0.00,
    estimated_cost_inr numeric(12,2) not null default 0.00,
    is_reconciled boolean not null default false,
    reconciled_expense_id uuid references public.expenses(id) on delete set null,
    notes text,
    created_at timestamptz not null default now()
);

-- 16. AI Provider Invoices (Reconciliation)
create table if not exists public.ai_provider_invoices (
    id uuid primary key default uuid_generate_v4(),
    organization_id uuid not null references public.organizations(id) on delete cascade,
    provider text not null,
    invoice_period_start date not null,
    invoice_period_end date not null,
    invoiced_amount_usd numeric(12,2) not null,
    invoiced_amount_inr numeric(12,2) not null,
    estimated_usage_cost_inr numeric(12,2) not null default 0.00,
    variance_amount_inr numeric(12,2) not null default 0.00,
    expense_id uuid references public.expenses(id) on delete set null,
    reconciliation_status text not null default 'pending_review' check (reconciliation_status in ('reconciled', 'pending_review', 'discrepancy')),
    created_at timestamptz not null default now()
);

-- 17. Budgets
create table if not exists public.budgets (
    id uuid primary key default uuid_generate_v4(),
    organization_id uuid not null references public.organizations(id) on delete cascade,
    category_id uuid not null references public.expense_categories(id) on delete cascade,
    month date not null, -- 1st day of month
    budget_amount numeric(15,2) not null,
    currency text not null default 'INR',
    notes text,
    created_at timestamptz not null default now(),
    unique(organization_id, category_id, month)
);

-- 18. Financial Transfers (Internal multi-account transfers)
create table if not exists public.financial_transfers (
    id uuid primary key default uuid_generate_v4(),
    organization_id uuid not null references public.organizations(id) on delete cascade,
    from_account_id uuid not null references public.financial_accounts(id),
    to_account_id uuid not null references public.financial_accounts(id),
    amount numeric(15,2) not null,
    transfer_fee numeric(15,2) not null default 0.00,
    transfer_date date not null default current_date,
    reference_number text,
    notes text,
    created_by uuid,
    created_at timestamptz not null default now()
);

-- 19. Exchange Rates
create table if not exists public.exchange_rates (
    id uuid primary key default uuid_generate_v4(),
    from_currency text not null,
    to_currency text not null,
    rate numeric(12,4) not null,
    effective_date date not null default current_date,
    source text not null default 'RBI_Reference',
    created_at timestamptz not null default now()
);

-- 20. Audit Logs
create table if not exists public.audit_logs (
    id uuid primary key default uuid_generate_v4(),
    organization_id uuid not null references public.organizations(id) on delete cascade,
    user_id uuid,
    user_email text not null,
    user_role text not null,
    action text not null,
    entity_type text not null,
    entity_id uuid,
    previous_data jsonb,
    new_data jsonb,
    ip_address text,
    created_at timestamptz not null default now()
);

-- 21. In-App Notifications
create table if not exists public.notifications (
    id uuid primary key default uuid_generate_v4(),
    organization_id uuid not null references public.organizations(id) on delete cascade,
    title text not null,
    message text not null,
    type text not null,
    severity text not null check (severity in ('info', 'warning', 'critical')),
    is_read boolean not null default false,
    link text,
    created_at timestamptz not null default now()
);

-- Indices for rapid queries
create index if not exists idx_expenses_org_date on public.expenses(organization_id, expense_date);
create index if not exists idx_expenses_category on public.expenses(category_id);
create index if not exists idx_expenses_payment_status on public.expenses(payment_status);
create index if not exists idx_revenue_org_date on public.revenue_invoices(organization_id, invoice_date);
create index if not exists idx_revenue_customer on public.revenue_invoices(customer_id);
create index if not exists idx_revenue_status on public.revenue_invoices(payment_status);
create index if not exists idx_ai_usage_org_date on public.ai_usage_records(organization_id, date);
create index if not exists idx_ai_usage_provider on public.ai_usage_records(provider);
create index if not exists idx_subscriptions_next_date on public.recurring_subscriptions(next_billing_date);
create index if not exists idx_audit_logs_org on public.audit_logs(organization_id, created_at desc);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.financial_accounts enable row level security;
alter table public.expense_categories enable row level security;
alter table public.expense_subcategories enable row level security;
alter table public.vendors enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_attachments enable row level security;
alter table public.recurring_subscriptions enable row level security;
alter table public.subscription_payment_occurrences enable row level security;
alter table public.customers enable row level security;
alter table public.revenue_invoices enable row level security;
alter table public.revenue_invoice_items enable row level security;
alter table public.customer_payments enable row level security;
alter table public.ai_usage_records enable row level security;
alter table public.ai_provider_invoices enable row level security;
alter table public.budgets enable row level security;
alter table public.financial_transfers enable row level security;
alter table public.audit_logs enable row level security;
alter table public.notifications enable row level security;

-- Authenticated organization isolation helper
create or replace function public.current_user_org_id()
returns uuid
language sql
stable
security definer
as $$
  select organization_id from public.organization_members 
  where user_id = auth.uid() and is_active = true limit 1;
$$;

-- RLS Policy: Expenses (Owner & Finance Manager: Full access; Viewer: Select only)
create policy "Users can view org expenses"
    on public.expenses for select
    using (organization_id = public.current_user_org_id() or auth.uid() is null);

create policy "Owner and Finance Manager can insert expenses"
    on public.expenses for insert
    with check (
        organization_id = public.current_user_org_id()
        and exists (
            select 1 from public.organization_members
            where user_id = auth.uid() and role in ('owner', 'finance_manager')
        )
    );

create policy "Owner and Finance Manager can update expenses"
    on public.expenses for update
    using (
        organization_id = public.current_user_org_id()
        and exists (
            select 1 from public.organization_members
            where user_id = auth.uid() and role in ('owner', 'finance_manager')
        )
    );

create policy "Only Owner can delete expenses"
    on public.expenses for delete
    using (
        organization_id = public.current_user_org_id()
        and exists (
            select 1 from public.organization_members
            where user_id = auth.uid() and role = 'owner'
        )
    );
