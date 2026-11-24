export type Currency = 'INR' | 'USD';

export type UserRole = 'owner' | 'finance_manager' | 'viewer';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  organizationId: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  defaultCurrency: Currency;
  secondaryCurrency: Currency;
  fiscalYearStartMonth: number; // 4 = April
  gstRegistered: boolean;
  gstin: string;
  pan: string;
  address: string;
  usdToInrRate: number;
}

export type AccountType = 'business_bank' | 'personal_business' | 'upi' | 'credit_card' | 'cash';

export interface FinancialAccount {
  id: string;
  name: string;
  type: AccountType;
  accountNumberMask: string;
  currency: Currency;
  openingBalance: number;
  currentBalance: number;
  isActive: boolean;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  code: string;
  icon: string;
  color: string;
  subcategories: string[];
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  defaultCurrency: Currency;
  gstin?: string;
  contactEmail?: string;
  website?: string;
}

export type PaymentMethod = 'bank_transfer' | 'upi' | 'credit_card' | 'debit_card' | 'cash';

export type ExpensePaymentStatus = 'paid' | 'pending' | 'scheduled' | 'reimbursed' | 'cancelled';

export interface ExpenseAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface Expense {
  id: string;
  expenseNumber: string; // e.g. EXP-2026-004
  title: string;
  description?: string;
  category: string;
  subcategory?: string;
  vendor: string;
  vendorGstin?: string;
  amount: number; // in original currency
  currency: Currency;
  exchangeRate: number; // e.g. 84.50
  totalAmountInr: number;
  expenseDate: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  accountId: string;
  gstPercentage: number; // 0, 5, 12, 18, 28
  baseAmount: number;
  gstAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  itcEligible: boolean; // Input Tax Credit eligibility
  totalAmount: number;
  invoiceNumber?: string;
  paymentStatus: ExpensePaymentStatus;
  isRecurring: boolean;
  notes?: string;
  attachments: ExpenseAttachment[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export type BillingFrequency = 'monthly' | 'quarterly' | 'half_yearly' | 'annual';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

export interface RecurringSubscription {
  id: string;
  serviceName: string;
  category: string;
  vendor: string;
  amount: number;
  currency: Currency;
  billingFrequency: BillingFrequency;
  nextBillingDate: string;
  paymentAccountId: string;
  autoRenewal: boolean;
  subscriptionOwner: string;
  status: SubscriptionStatus;
  reminderDays: number[]; // [7, 3, 1]
  notes?: string;
  createdAt: string;
  lastRenewedDate?: string;
  renewalHistory: {
    id: string;
    date: string;
    amount: number;
    currency: Currency;
    status: 'confirmed' | 'upcoming';
    expenseId?: string;
  }[];
}

export interface Customer {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  gstin?: string;
  billingAddress?: string;
  status: 'active' | 'churned' | 'lead';
  agentSeats: number;
  mrr: number; // In INR
  joinedDate: string;
}

export type RevenuePaymentStatus = 'draft' | 'pending' | 'partially_paid' | 'paid' | 'overdue' | 'refunded';

export interface RevenueInvoice {
  id: string;
  invoiceNumber: string; // e.g. INV-2026-081
  customerId: string;
  customerName: string;
  customerGstin?: string;
  subscriptionPlan: string;
  agentSeats: number;
  subscriptionDurationMonths: number;
  subscriptionAmount: number; // Contract base
  aiUsageCharges: number;
  discount: number;
  subtotal: number;
  gstPercentage: number;
  gstAmount: number;
  totalAmount: number;
  currency: Currency;
  invoiceDate: string;
  paymentDueDate: string;
  paymentReceivedDate?: string;
  paymentStatus: RevenuePaymentStatus;
  paymentMethod?: PaymentMethod;
  accountId?: string;
  notes?: string;
  createdAt: string;
  isDeleted?: boolean;
}

export type AIServiceType = 
  | 'speech_to_text' 
  | 'call_analysis' 
  | 'gpu_inference' 
  | 'llm_api' 
  | 'audio_storage' 
  | 'data_transfer';

export interface AIUsageRecord {
  id: string;
  date: string;
  customerId?: string;
  customerName?: string;
  provider: 'OpenAI' | 'Gemini' | 'Anthropic' | 'Modal' | 'Deepgram' | 'Supabase';
  model: string;
  serviceType: AIServiceType;
  callsCount: number;
  audioMinutes: number;
  tokensInput: number;
  tokensOutput: number;
  unitPrice: number;
  currency: Currency;
  estimatedCostUsd: number;
  estimatedCostInr: number;
  isReconciled: boolean;
  reconciledExpenseId?: string;
  notes?: string;
}

export interface AIProviderInvoice {
  id: string;
  provider: string;
  invoiceNumber: string;
  periodStart: string;
  periodEnd: string;
  invoicedAmountUsd: number;
  invoicedAmountInr: number;
  estimatedUsageCostInr: number;
  varianceAmountInr: number; // Invoiced - Estimated
  reconciliationStatus: 'reconciled' | 'pending_review' | 'discrepancy';
  expenseId?: string;
}

export interface Budget {
  id: string;
  category: string;
  month: string; // YYYY-MM
  budgetAmount: number;
  currency: Currency;
}

export interface FinancialTransfer {
  id: string;
  fromAccountId: string;
  fromAccountName: string;
  toAccountId: string;
  toAccountName: string;
  amount: number;
  transferFee: number;
  transferDate: string;
  referenceNumber?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userEmail: string;
  userRole: UserRole;
  action: 'create' | 'update' | 'delete' | 'reconcile' | 'transfer' | 'reversal';
  entityType: 'expense' | 'revenue' | 'subscription' | 'account' | 'transfer' | 'budget';
  entityId: string;
  description: string;
  timestamp: string;
  changes?: Record<string, any>;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'renewal_reminder' | 'overdue_payment' | 'budget_alert' | 'ai_cost_spike' | 'duplicate_invoice';
  severity: 'info' | 'warning' | 'critical';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export type DateFilterType = 
  | 'today'
  | '7d' 
  | '30d' 
  | 'this_month' 
  | 'last_month' 
  | 'quarter' 
  | 'fy' 
  | 'custom';

export interface DateRange {
  from: string;
  to: string;
}
