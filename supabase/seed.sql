-- ==============================================================================
-- NODZO FINANCE INITIAL SEED DATA
-- Pre-seeded Organization, Accounts, Categories, Subcategories, and Settings
-- ==============================================================================

-- 1. Default Organization: Nodzo AI
insert into public.organizations (id, name, slug, default_currency, secondary_currency, fiscal_year_start_month, gst_registered, gstin, pan, address)
values (
    '00000000-0000-0000-0000-000000000001',
    'Nodzo AI Private Limited',
    'nodzo-ai',
    'INR',
    'USD',
    4,
    true,
    '29AABCN1234F1Z8',
    'AABCN1234F',
    'Indiranagar, Bengaluru, Karnataka 560038, India'
) on conflict (slug) do nothing;

-- 2. Organization Members
insert into public.organization_members (id, organization_id, user_id, role, full_name, email)
values
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', null, 'owner', 'Nitin Sharma (Founder)', 'founder@nodzo.ai'),
    ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', null, 'finance_manager', 'Aditi Rao (Finance Lead)', 'finance@nodzo.ai'),
    ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', null, 'viewer', 'Rohan Mehta (Auditor)', 'auditor@nodzo.ai')
on conflict do nothing;

-- 3. Financial Accounts
insert into public.financial_accounts (id, organization_id, name, type, account_number_mask, currency, opening_balance, current_balance)
values
    ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'HDFC Current A/c (Main Ops)', 'business_bank', '••• 9412', 'INR', 4500000.00, 4820000.00),
    ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'ICICI Personal (Founder Reimbursements)', 'personal_business', '••• 4021', 'INR', 150000.00, 114500.00),
    ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Razorpay UPI Business', 'upi', 'nodzo@razorpay', 'INR', 350000.00, 420000.00),
    ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Axis Corporate Forex Card (USD Subscriptions)', 'credit_card', '••• 8820', 'USD', 12000.00, 9400.00),
    ('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Office Petty Cash', 'cash', 'N/A', 'INR', 50000.00, 38500.00)
on conflict do nothing;

-- 4. Categories & Subcategories
-- AI & Infrastructure
insert into public.expense_categories (id, organization_id, name, code, icon, color, is_system)
values ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'AI & Infrastructure', 'AI_INFRA', 'Cpu', '#6366f1', true)
on conflict do nothing;

insert into public.expense_subcategories (category_id, name, code) values
    ('30000000-0000-0000-0000-000000000001', 'OpenAI API', 'OPENAI'),
    ('30000000-0000-0000-0000-000000000001', 'Gemini API', 'GEMINI'),
    ('30000000-0000-0000-0000-000000000001', 'Claude API', 'CLAUDE'),
    ('30000000-0000-0000-0000-000000000001', 'Modal GPU', 'MODAL_GPU'),
    ('30000000-0000-0000-0000-000000000001', 'Supabase', 'SUPABASE'),
    ('30000000-0000-0000-0000-000000000001', 'Hosting and servers', 'HOSTING'),
    ('30000000-0000-0000-0000-000000000001', 'Cloud storage', 'STORAGE'),
    ('30000000-0000-0000-0000-000000000001', 'Speech-to-text processing', 'STT'),
    ('30000000-0000-0000-0000-000000000001', 'Other AI providers', 'OTHER_AI')
on conflict do nothing;

-- Software & Tools
insert into public.expense_categories (id, organization_id, name, code, icon, color, is_system)
values ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Software & Tools', 'SOFTWARE_TOOLS', 'Boxes', '#0ea5e9', true)
on conflict do nothing;

insert into public.expense_subcategories (category_id, name, code) values
    ('30000000-0000-0000-0000-000000000002', 'Lovable', 'LOVABLE'),
    ('30000000-0000-0000-0000-000000000002', 'Cursor', 'CURSOR'),
    ('30000000-0000-0000-0000-000000000002', 'GitHub', 'GITHUB'),
    ('30000000-0000-0000-0000-000000000002', 'Domain renewals', 'DOMAINS'),
    ('30000000-0000-0000-0000-000000000002', 'Email services', 'EMAIL'),
    ('30000000-0000-0000-0000-000000000002', 'SaaS subscriptions', 'SAAS_MISC')
on conflict do nothing;

-- Marketing & Sales
insert into public.expense_categories (id, organization_id, name, code, icon, color, is_system)
values ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Marketing & Sales', 'MARKETING_SALES', 'TrendingUp', '#ec4899', true)
on conflict do nothing;

insert into public.expense_subcategories (category_id, name, code) values
    ('30000000-0000-0000-0000-000000000003', 'Meta Ads', 'META_ADS'),
    ('30000000-0000-0000-0000-000000000003', 'Google Ads', 'GOOGLE_ADS'),
    ('30000000-0000-0000-0000-000000000003', 'LinkedIn Ads', 'LINKEDIN_ADS'),
    ('30000000-0000-0000-0000-000000000003', 'Sales commissions', 'COMMISSIONS'),
    ('30000000-0000-0000-0000-000000000003', 'Promotional campaigns', 'PROMOTIONS')
on conflict do nothing;

-- Team & Operations
insert into public.expense_categories (id, organization_id, name, code, icon, color, is_system)
values ('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Team & Operations', 'TEAM_OPS', 'Users', '#10b981', true)
on conflict do nothing;

insert into public.expense_subcategories (category_id, name, code) values
    ('30000000-0000-0000-0000-000000000004', 'Salaries', 'SALARIES'),
    ('30000000-0000-0000-0000-000000000004', 'Freelancers', 'FREELANCERS'),
    ('30000000-0000-0000-0000-000000000004', 'Contractors', 'CONTRACTORS'),
    ('30000000-0000-0000-0000-000000000004', 'Office expenses', 'OFFICE'),
    ('30000000-0000-0000-0000-000000000004', 'Travel', 'TRAVEL'),
    ('30000000-0000-0000-0000-000000000004', 'Internet', 'INTERNET'),
    ('30000000-0000-0000-0000-000000000004', 'Equipment', 'EQUIPMENT')
on conflict do nothing;

-- Legal & Compliance
insert into public.expense_categories (id, organization_id, name, code, icon, color, is_system)
values ('30000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Legal & Compliance', 'LEGAL_COMPLIANCE', 'ShieldCheck', '#f59e0b', true)
on conflict do nothing;

insert into public.expense_subcategories (category_id, name, code) values
    ('30000000-0000-0000-0000-000000000005', 'Company registration', 'REGISTRATION'),
    ('30000000-0000-0000-0000-000000000005', 'CA fees', 'CA_FEES'),
    ('30000000-0000-0000-0000-000000000005', 'GST compliance', 'GST_COMPLIANCE'),
    ('30000000-0000-0000-0000-000000000005', 'Legal services', 'LEGAL_SERVICES'),
    ('30000000-0000-0000-0000-000000000005', 'Trademark expenses', 'TRADEMARK')
on conflict do nothing;

-- 5. Exchange Rates
insert into public.exchange_rates (from_currency, to_currency, rate, effective_date, source)
values ('USD', 'INR', 84.5000, current_date, 'RBI_Reference')
on conflict do nothing;

-- 6. Real Business Expenses for Nodzo AI
insert into public.expenses (
    id, organization_id, expense_number, title, description, category_id, vendor_id, amount, currency,
    exchange_rate, expense_date, payment_method, account_id, gst_percentage, base_amount, gst_amount,
    cgst_amount, sgst_amount, igst_amount, itc_eligible, total_amount, total_amount_inr, invoice_number, payment_status
) values
    ('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'EXP-2026-001', 'Virtual Address & GST Registration Fees', 'Registered business virtual address and GST compliance fees paid to Aditya', '30000000-0000-0000-0000-000000000005', null, 17110.00, 'INR', 1.0000, '2026-11-15', 'bank_transfer', '20000000-0000-0000-0000-000000000001', 18.00, 14500.00, 2610.00, 1305.00, 1305.00, 0.00, true, 17110.00, 17110.00, 'GST-VA-2026', 'paid'),
    ('50000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'EXP-2026-002', 'nodzo.ai Domain Registration (Cloudflare)', 'nodzo.ai primary brand domain registration via Cloudflare Registrar', '30000000-0000-0000-0000-000000000002', null, 19000.00, 'INR', 1.0000, '2026-11-10', 'credit_card', '20000000-0000-0000-0000-000000000004', 18.00, 16101.69, 2898.31, 0.00, 0.00, 2898.31, true, 19000.00, 19000.00, 'CF-DOM-nodzo', 'paid'),
    ('50000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'EXP-2026-003', 'Google Play Console Developer Listing Fee', 'One-time registration fee to list Nodzo AI apps on Google Play Store', '30000000-0000-0000-0000-000000000002', null, 2500.00, 'INR', 1.0000, '2026-11-12', 'credit_card', '20000000-0000-0000-0000-000000000004', 18.00, 2118.64, 381.36, 0.00, 0.00, 381.36, true, 2500.00, 2500.00, 'GPC-REG-2026', 'paid'),
    ('50000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'EXP-2026-004', 'Lovable AI Subscription', 'Lovable web application development and AI rapid builder platform', '30000000-0000-0000-0000-000000000002', null, 1500.00, 'INR', 1.0000, '2026-11-14', 'credit_card', '20000000-0000-0000-0000-000000000004', 18.00, 1271.19, 228.81, 0.00, 0.00, 228.81, true, 1500.00, 1500.00, 'LVB-2026-11', 'paid'),
    ('50000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'EXP-2026-005', 'Client Setup Travel to Hisar (Sunil - MeDa Partners)', 'Travel expense for client onboarding & system setup in Hisar for Sunil (MeDa Partners)', '30000000-0000-0000-0000-000000000004', null, 1000.00, 'INR', 1.0000, '2026-11-16', 'upi', '20000000-0000-0000-0000-000000000003', 0.00, 1000.00, 0.00, 0.00, 0.00, 0.00, false, 1000.00, 1000.00, 'TRV-HSR-01', 'paid'),
    ('50000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'EXP-2026-006', 'Google Gemini API Recharge', 'Prepaid API tokens for Gemini 1.5 Pro multimodal call analysis and transcription', '30000000-0000-0000-0000-000000000001', null, 5000.00, 'INR', 1.0000, '2026-11-17', 'credit_card', '20000000-0000-0000-0000-000000000004', 18.00, 4237.29, 762.71, 0.00, 0.00, 762.71, true, 5000.00, 5000.00, 'GEM-RCH-5000', 'paid'),
    ('50000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'EXP-2026-007', 'OpenAI API Recharge', 'Prepaid API credits for GPT-4o call transcript summarization & sentiment scoring', '30000000-0000-0000-0000-000000000001', null, 4800.00, 'INR', 1.0000, '2026-11-17', 'credit_card', '20000000-0000-0000-0000-000000000004', 18.00, 4067.80, 732.20, 0.00, 0.00, 732.20, true, 4800.00, 4800.00, 'OAI-RCH-4800', 'paid'),
    ('50000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'EXP-2026-008', 'Jev AI Voice & Pipeline Recharge', 'Jev AI platform audio processing and speech pipeline credits', '30000000-0000-0000-0000-000000000001', null, 500.00, 'INR', 1.0000, '2026-11-18', 'upi', '20000000-0000-0000-0000-000000000003', 18.00, 423.73, 76.27, 0.00, 0.00, 76.27, true, 500.00, 500.00, 'JEV-RCH-500', 'paid')
on conflict do nothing;
