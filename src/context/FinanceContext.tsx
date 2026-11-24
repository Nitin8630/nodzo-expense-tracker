import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Organization,
  FinancialAccount,
  ExpenseCategory,
  Expense,
  RecurringSubscription,
  Customer,
  RevenueInvoice,
  AIUsageRecord,
  AIProviderInvoice,
  Budget,
  FinancialTransfer,
  AuditLog,
  NotificationItem,
  UserProfile,
  UserRole,
  Currency,
  DateFilterType,
  DateRange,
} from '../types/finance';
import {
  initialOrganization,
  initialAccounts,
  initialCategories,
  initialExpenses,
  initialSubscriptions,
  initialCustomers,
  initialInvoices,
  initialAIUsage,
  initialAIProviderInvoices,
  initialBudgets,
  initialTransfers,
  initialAuditLogs,
  initialNotifications,
} from '../data/mockData';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { generateId } from '../lib/utils';
import {
  GoogleSheetsConfig,
  initialGoogleSheetsConfig,
  pushToGoogleSheets,
  pullFromGoogleSheets,
} from '../lib/googleSheets';

interface FinanceContextType {
  // State
  organization: Organization;
  currentUser: UserProfile;
  accounts: FinancialAccount[];
  categories: ExpenseCategory[];
  expenses: Expense[];
  subscriptions: RecurringSubscription[];
  customers: Customer[];
  invoices: RevenueInvoice[];
  aiUsage: AIUsageRecord[];
  aiProviderInvoices: AIProviderInvoice[];
  budgets: Budget[];
  transfers: FinancialTransfer[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  googleSheetsConfig: GoogleSheetsConfig;
  
  // Settings & Filters
  activeCurrency: Currency;
  setActiveCurrency: (c: Currency) => void;
  dateFilter: DateFilterType;
  setDateFilter: (d: DateFilterType) => void;
  customDateRange: DateRange;
  setCustomDateRange: (range: DateRange) => void;
  isSupabaseMode: boolean;
  
  // RBAC Actions
  switchRole: (role: UserRole) => void;
  
  // Expense Actions
  addExpense: (expense: Omit<Expense, 'id' | 'expenseNumber' | 'createdAt' | 'updatedAt' | 'totalAmountInr'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  duplicateExpense: (id: string) => void;
  
  // Subscription Actions
  addSubscription: (sub: Omit<RecurringSubscription, 'id' | 'createdAt' | 'renewalHistory'>) => void;
  updateSubscription: (id: string, updates: Partial<RecurringSubscription>) => void;
  confirmSubscriptionRenewal: (subId: string, customAmount?: number) => void;
  cancelSubscription: (id: string) => void;
  
  // Revenue Actions
  addInvoice: (inv: Omit<RevenueInvoice, 'id' | 'invoiceNumber' | 'createdAt'>) => void;
  updateInvoice: (id: string, updates: Partial<RevenueInvoice>) => void;
  deleteInvoice: (id: string) => void;
  markInvoicePaid: (id: string, accountId: string, method: string) => void;
  
  // Transfers & Accounts
  addTransfer: (transfer: Omit<FinancialTransfer, 'id' | 'createdAt' | 'fromAccountName' | 'toAccountName'>) => void;
  updateAccountBalance: (accountId: string, newBalance: number) => void;
  
  // Budgets
  updateBudget: (category: string, amount: number) => void;
  
  // AI Operations
  addAIUsageRecord: (record: Omit<AIUsageRecord, 'id' | 'estimatedCostInr'>) => void;
  reconcileAIInvoice: (invoiceId: string, expenseId: string) => void;
  
  // Google Sheets Database Actions
  updateGoogleSheetsConfig: (updates: Partial<GoogleSheetsConfig>) => void;
  syncToGoogleSheets: () => Promise<{ success: boolean; message: string }>;
  syncFromGoogleSheets: () => Promise<{ success: boolean; message: string }>;

  // Notifications & State Reset
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetToCleanState: () => void;
  seedDemoData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'nodzo_fin_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error loading ${key} from storage:`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [organization, setOrganization] = useState<Organization>(() =>
    loadFromStorage('org', initialOrganization)
  );

  const [currentUser, setCurrentUser] = useState<UserProfile>(() =>
    loadFromStorage('user', {
      id: 'usr-01',
      email: 'founder@nodzo.ai',
      fullName: 'Nitin Sharma (Founder)',
      role: 'owner',
      organizationId: initialOrganization.id,
    })
  );

  const [accounts, setAccounts] = useState<FinancialAccount[]>(() =>
    loadFromStorage('accounts', initialAccounts)
  );

  const [categories, setCategories] = useState<ExpenseCategory[]>(() =>
    loadFromStorage('categories', initialCategories)
  );

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const loaded = loadFromStorage('expenses', initialExpenses);
    // Automatically purge previous demo expenses and load the 8 real Nodzo AI business expenses
    if (!Array.isArray(loaded) || loaded.some((e: any) => e.id === 'exp-01' || e.id === 'exp-06' || e.title?.includes('Salaries'))) {
      saveToStorage('expenses', initialExpenses);
      return initialExpenses;
    }
    return loaded;
  });

  const [subscriptions, setSubscriptions] = useState<RecurringSubscription[]>(() =>
    loadFromStorage('subscriptions', initialSubscriptions)
  );

  const [customers, setCustomers] = useState<Customer[]>(() =>
    loadFromStorage('customers', initialCustomers)
  );

  const [invoices, setInvoices] = useState<RevenueInvoice[]>(() =>
    loadFromStorage('invoices', initialInvoices)
  );

  const [aiUsage, setAiUsage] = useState<AIUsageRecord[]>(() =>
    loadFromStorage('aiUsage', initialAIUsage)
  );

  const [aiProviderInvoices, setAiProviderInvoices] = useState<AIProviderInvoice[]>(() =>
    loadFromStorage('aiProviderInvoices', initialAIProviderInvoices)
  );

  const [budgets, setBudgets] = useState<Budget[]>(() =>
    loadFromStorage('budgets', initialBudgets)
  );

  const [transfers, setTransfers] = useState<FinancialTransfer[]>(() =>
    loadFromStorage('transfers', initialTransfers)
  );

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() =>
    loadFromStorage('auditLogs', initialAuditLogs)
  );

  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    loadFromStorage('notifications', initialNotifications)
  );

  const [googleSheetsConfig, setGoogleSheetsConfig] = useState<GoogleSheetsConfig>(() =>
    loadFromStorage('googleSheetsConfig', initialGoogleSheetsConfig)
  );

  const [activeCurrency, setActiveCurrency] = useState<Currency>('INR');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('this_month');
  const [customDateRange, setCustomDateRange] = useState<DateRange>({
    from: '2026-11-01',
    to: '2026-11-30',
  });

  const isSupabaseMode = isSupabaseConfigured;

  // Sync state to localStorage for offline resilience
  useEffect(() => saveToStorage('org', organization), [organization]);
  useEffect(() => saveToStorage('user', currentUser), [currentUser]);
  useEffect(() => saveToStorage('accounts', accounts), [accounts]);
  useEffect(() => saveToStorage('categories', categories), [categories]);
  useEffect(() => saveToStorage('expenses', expenses), [expenses]);
  useEffect(() => saveToStorage('subscriptions', subscriptions), [subscriptions]);
  useEffect(() => saveToStorage('customers', customers), [customers]);
  useEffect(() => saveToStorage('invoices', invoices), [invoices]);
  useEffect(() => saveToStorage('aiUsage', aiUsage), [aiUsage]);
  useEffect(() => saveToStorage('aiProviderInvoices', aiProviderInvoices), [aiProviderInvoices]);
  useEffect(() => saveToStorage('budgets', budgets), [budgets]);
  useEffect(() => saveToStorage('transfers', transfers), [transfers]);
  useEffect(() => saveToStorage('auditLogs', auditLogs), [auditLogs]);
  useEffect(() => saveToStorage('notifications', notifications), [notifications]);
  useEffect(() => saveToStorage('googleSheetsConfig', googleSheetsConfig), [googleSheetsConfig]);

  // Helper to record immutable audit logs
  const logAudit = (
    action: AuditLog['action'],
    entityType: AuditLog['entityType'],
    entityId: string,
    description: string,
    changes?: Record<string, any>
  ) => {
    const newLog: AuditLog = {
      id: generateId('LOG'),
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action,
      entityType,
      entityId,
      description,
      timestamp: new Date().toISOString(),
      changes,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Google Sheets Config updates
  const updateGoogleSheetsConfig = (updates: Partial<GoogleSheetsConfig>) => {
    setGoogleSheetsConfig((prev) => ({ ...prev, ...updates }));
  };

  // Push all data to Google Sheets
  const syncToGoogleSheets = async (): Promise<{ success: boolean; message: string }> => {
    if (!googleSheetsConfig.webAppUrl) {
      return { success: false, message: 'Google Sheets Web App URL is not configured. Please set it in Settings.' };
    }

    setGoogleSheetsConfig((prev) => ({ ...prev, syncStatus: 'syncing', errorMessage: undefined }));

    const res = await pushToGoogleSheets(googleSheetsConfig.webAppUrl, {
      expenses: expenses.filter((e) => !e.isDeleted),
      invoices: invoices.filter((i) => !i.isDeleted),
      subscriptions,
      accounts,
    });

    if (res.success) {
      setGoogleSheetsConfig((prev) => ({
        ...prev,
        syncStatus: 'synced',
        lastSyncedAt: new Date().toISOString(),
      }));
      logAudit('update', 'account', 'google_sheets', 'Successfully synchronized local records with Google Sheets database');
      return { success: true, message: 'Google Sheets database synchronized successfully!' };
    } else {
      setGoogleSheetsConfig((prev) => ({
        ...prev,
        syncStatus: 'error',
        errorMessage: res.message,
      }));
      return { success: false, message: res.message };
    }
  };

  // Pull data from Google Sheets
  const syncFromGoogleSheets = async (): Promise<{ success: boolean; message: string }> => {
    if (!googleSheetsConfig.webAppUrl) {
      return { success: false, message: 'Google Sheets Web App URL is not configured. Please set it in Settings.' };
    }

    setGoogleSheetsConfig((prev) => ({ ...prev, syncStatus: 'syncing', errorMessage: undefined }));

    const res = await pullFromGoogleSheets(googleSheetsConfig.webAppUrl);

    if (res.success && res.data) {
      setGoogleSheetsConfig((prev) => ({
        ...prev,
        syncStatus: 'synced',
        lastSyncedAt: new Date().toISOString(),
      }));
      logAudit('update', 'account', 'google_sheets', 'Pulled fresh records from Google Sheets database');
      return { success: true, message: 'Loaded latest records from Google Sheets!' };
    } else {
      setGoogleSheetsConfig((prev) => ({
        ...prev,
        syncStatus: 'error',
        errorMessage: res.message,
      }));
      return { success: false, message: res.message };
    }
  };

  // Auto-sync trigger
  const triggerAutoSyncIfEnabled = () => {
    if (googleSheetsConfig.autoSync && googleSheetsConfig.webAppUrl) {
      pushToGoogleSheets(googleSheetsConfig.webAppUrl, {
        expenses: expenses.filter((e) => !e.isDeleted),
        invoices: invoices.filter((i) => !i.isDeleted),
        subscriptions,
        accounts,
      }).then((res) => {
        if (res.success) {
          setGoogleSheetsConfig((prev) => ({ ...prev, lastSyncedAt: new Date().toISOString(), syncStatus: 'synced' }));
        }
      });
    }
  };

  // RBAC switch
  const switchRole = (role: UserRole) => {
    setCurrentUser((prev) => ({
      ...prev,
      role,
      fullName:
        role === 'owner'
          ? 'Nitin Sharma (Founder)'
          : role === 'finance_manager'
          ? 'Aditi Rao (Finance Lead)'
          : 'Rohan Mehta (Auditor)',
      email:
        role === 'owner'
          ? 'founder@nodzo.ai'
          : role === 'finance_manager'
          ? 'finance@nodzo.ai'
          : 'auditor@nodzo.ai',
    }));
  };

  // ---------------- Expense Actions ----------------
  const addExpense = (newExpData: Omit<Expense, 'id' | 'expenseNumber' | 'createdAt' | 'updatedAt' | 'totalAmountInr'>) => {
    const exchangeRate = newExpData.currency === 'USD' ? organization.usdToInrRate : 1;
    const totalAmountInr = newExpData.currency === 'USD' 
      ? newExpData.totalAmount * organization.usdToInrRate 
      : newExpData.totalAmount;

    const newExpense: Expense = {
      ...newExpData,
      id: generateId('exp'),
      expenseNumber: generateId('EXP'),
      exchangeRate,
      totalAmountInr,
      createdBy: currentUser.fullName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setExpenses((prev) => [newExpense, ...prev]);

    // Deduct from financial account if status is paid
    if (newExpense.paymentStatus === 'paid') {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === newExpense.accountId) {
            const deduction = acc.currency === newExpense.currency ? newExpense.totalAmount : (newExpense.totalAmountInr / organization.usdToInrRate);
            return {
              ...acc,
              currentBalance: acc.currentBalance - deduction,
            };
          }
          return acc;
        })
      );
    }

    logAudit('create', 'expense', newExpense.id, `Created expense ${newExpense.expenseNumber}: ${newExpense.title} (${newExpense.currency} ${newExpense.totalAmount})`);
    triggerAutoSyncIfEnabled();
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((exp) => {
        if (exp.id === id) {
          const updated = { ...exp, ...updates, updatedAt: new Date().toISOString() };
          if (updates.currency || updates.totalAmount) {
            const cur = updated.currency;
            updated.exchangeRate = cur === 'USD' ? organization.usdToInrRate : 1;
            updated.totalAmountInr = cur === 'USD' ? updated.totalAmount * organization.usdToInrRate : updated.totalAmount;
          }
          return updated;
        }
        return exp;
      })
    );
    logAudit('update', 'expense', id, `Updated expense details for ${id}`, updates);
    triggerAutoSyncIfEnabled();
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, isDeleted: true } : exp))
    );
    logAudit('delete', 'expense', id, `Soft-deleted expense ${id}`);
    triggerAutoSyncIfEnabled();
  };

  const duplicateExpense = (id: string) => {
    const original = expenses.find((e) => e.id === id);
    if (!original) return;

    const duplicated: Expense = {
      ...original,
      id: generateId('exp'),
      expenseNumber: generateId('EXP'),
      title: `${original.title} (Copy)`,
      expenseDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setExpenses((prev) => [duplicated, ...prev]);
    logAudit('create', 'expense', duplicated.id, `Duplicated expense from ${original.expenseNumber}`);
    triggerAutoSyncIfEnabled();
  };

  // ---------------- Subscription Actions ----------------
  const addSubscription = (subData: Omit<RecurringSubscription, 'id' | 'createdAt' | 'renewalHistory'>) => {
    const newSub: RecurringSubscription = {
      ...subData,
      id: generateId('sub'),
      createdAt: new Date().toISOString(),
      renewalHistory: [],
    };
    setSubscriptions((prev) => [newSub, ...prev]);
    logAudit('create', 'subscription', newSub.id, `Added recurring subscription ${newSub.serviceName} (${newSub.currency} ${newSub.amount}/${newSub.billingFrequency})`);
    triggerAutoSyncIfEnabled();
  };

  const updateSubscription = (id: string, updates: Partial<RecurringSubscription>) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    logAudit('update', 'subscription', id, `Updated subscription ${id}`, updates);
    triggerAutoSyncIfEnabled();
  };

  const confirmSubscriptionRenewal = (subId: string, customAmount?: number) => {
    const sub = subscriptions.find((s) => s.id === subId);
    if (!sub) return;

    const renewalAmount = customAmount ?? sub.amount;
    const expenseNumber = generateId('EXP');

    const newExpense: Expense = {
      id: generateId('exp'),
      expenseNumber,
      title: `${sub.serviceName} Renewal`,
      description: `Confirmed recurring billing for ${sub.serviceName} (${sub.billingFrequency})`,
      category: sub.category,
      vendor: sub.vendor,
      amount: renewalAmount,
      currency: sub.currency,
      exchangeRate: sub.currency === 'USD' ? organization.usdToInrRate : 1,
      totalAmountInr: sub.currency === 'USD' ? renewalAmount * organization.usdToInrRate : renewalAmount,
      expenseDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'credit_card',
      accountId: sub.paymentAccountId,
      gstPercentage: 18,
      baseAmount: (renewalAmount / 1.18),
      gstAmount: renewalAmount - (renewalAmount / 1.18),
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: renewalAmount - (renewalAmount / 1.18),
      itcEligible: true,
      totalAmount: renewalAmount,
      paymentStatus: 'paid',
      isRecurring: true,
      notes: `Generated from recurring subscription ${sub.serviceName}`,
      attachments: [],
      createdBy: currentUser.fullName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setExpenses((prev) => [newExpense, ...prev]);

    // Update account balance
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === sub.paymentAccountId) {
          const deduction = acc.currency === sub.currency ? renewalAmount : (newExpense.totalAmountInr / organization.usdToInrRate);
          return { ...acc, currentBalance: acc.currentBalance - deduction };
        }
        return acc;
      })
    );

    // Calculate next billing date
    const currentNext = new Date(sub.nextBillingDate);
    if (sub.billingFrequency === 'monthly') currentNext.setMonth(currentNext.getMonth() + 1);
    else if (sub.billingFrequency === 'quarterly') currentNext.setMonth(currentNext.getMonth() + 3);
    else if (sub.billingFrequency === 'half_yearly') currentNext.setMonth(currentNext.getMonth() + 6);
    else if (sub.billingFrequency === 'annual') currentNext.setFullYear(currentNext.getFullYear() + 1);

    const nextBillingStr = currentNext.toISOString().split('T')[0];

    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id === subId) {
          return {
            ...s,
            lastRenewedDate: new Date().toISOString().split('T')[0],
            nextBillingDate: nextBillingStr,
            renewalHistory: [
              {
                id: generateId('rh'),
                date: new Date().toISOString().split('T')[0],
                amount: renewalAmount,
                currency: s.currency,
                status: 'confirmed',
                expenseId: newExpense.id,
              },
              ...s.renewalHistory,
            ],
          };
        }
        return s;
      })
    );

    logAudit('reconcile', 'subscription', subId, `Confirmed payment & renewal for ${sub.serviceName}: Expense ${expenseNumber} created`);
    triggerAutoSyncIfEnabled();
  };

  const cancelSubscription = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'cancelled' } : s))
    );
    logAudit('update', 'subscription', id, `Cancelled subscription ${id}`);
    triggerAutoSyncIfEnabled();
  };

  // ---------------- Revenue Actions ----------------
  const addInvoice = (invData: Omit<RevenueInvoice, 'id' | 'invoiceNumber' | 'createdAt'>) => {
    const newInvoice: RevenueInvoice = {
      ...invData,
      id: generateId('inv'),
      invoiceNumber: generateId('INV'),
      createdAt: new Date().toISOString(),
    };
    setInvoices((prev) => [newInvoice, ...prev]);

    if (newInvoice.paymentStatus === 'paid' && newInvoice.accountId) {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === newInvoice.accountId) {
            return { ...acc, currentBalance: acc.currentBalance + newInvoice.totalAmount };
          }
          return acc;
        })
      );
    }

    logAudit('create', 'revenue', newInvoice.id, `Created invoice ${newInvoice.invoiceNumber} for ${newInvoice.customerName} (₹${newInvoice.totalAmount})`);
    triggerAutoSyncIfEnabled();
  };

  const updateInvoice = (id: string, updates: Partial<RevenueInvoice>) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv))
    );
    logAudit('update', 'revenue', id, `Updated invoice ${id}`, updates);
    triggerAutoSyncIfEnabled();
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, isDeleted: true } : inv))
    );
    logAudit('delete', 'revenue', id, `Soft-deleted invoice ${id}`);
    triggerAutoSyncIfEnabled();
  };

  const markInvoicePaid = (id: string, accountId: string, method: string) => {
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return;

    setInvoices((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              paymentStatus: 'paid',
              paymentReceivedDate: new Date().toISOString().split('T')[0],
              accountId,
              paymentMethod: method as any,
            }
          : i
      )
    );

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === accountId) {
          return { ...acc, currentBalance: acc.currentBalance + inv.totalAmount };
        }
        return acc;
      })
    );

    logAudit('reconcile', 'revenue', id, `Marked invoice ${inv.invoiceNumber} as paid (₹${inv.totalAmount} deposited to account ${accountId})`);
    triggerAutoSyncIfEnabled();
  };

  // ---------------- Transfers & Accounts ----------------
  const addTransfer = (transferData: Omit<FinancialTransfer, 'id' | 'createdAt' | 'fromAccountName' | 'toAccountName'>) => {
    const fromAcc = accounts.find((a) => a.id === transferData.fromAccountId);
    const toAcc = accounts.find((a) => a.id === transferData.toAccountId);
    if (!fromAcc || !toAcc) return;

    const newTransfer: FinancialTransfer = {
      ...transferData,
      id: generateId('tr'),
      fromAccountName: fromAcc.name,
      toAccountName: toAcc.name,
      createdAt: new Date().toISOString(),
    };

    setTransfers((prev) => [newTransfer, ...prev]);

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === fromAcc.id) {
          return { ...acc, currentBalance: acc.currentBalance - (transferData.amount + transferData.transferFee) };
        }
        if (acc.id === toAcc.id) {
          return { ...acc, currentBalance: acc.currentBalance + transferData.amount };
        }
        return acc;
      })
    );

    logAudit('transfer', 'transfer', newTransfer.id, `Internal transfer ₹${transferData.amount} from ${fromAcc.name} to ${toAcc.name}`);
    triggerAutoSyncIfEnabled();
  };

  const updateAccountBalance = (accountId: string, newBalance: number) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === accountId ? { ...a, currentBalance: newBalance } : a))
    );
    logAudit('update', 'account', accountId, `Reconciled account ${accountId} balance to ₹${newBalance}`);
    triggerAutoSyncIfEnabled();
  };

  // ---------------- Budgets ----------------
  const updateBudget = (category: string, amount: number) => {
    setBudgets((prev) => {
      const exists = prev.some((b) => b.category === category);
      if (exists) {
        return prev.map((b) => (b.category === category ? { ...b, budgetAmount: amount } : b));
      }
      return [
        ...prev,
        {
          id: generateId('bud'),
          category,
          month: '2026-11',
          budgetAmount: amount,
          currency: 'INR',
        },
      ];
    });
    logAudit('update', 'budget', category, `Updated ${category} budget to ₹${amount}`);
  };

  // ---------------- AI Usage & Reconciliation ----------------
  const addAIUsageRecord = (recordData: Omit<AIUsageRecord, 'id' | 'estimatedCostInr'>) => {
    const estimatedCostInr = recordData.estimatedCostUsd * organization.usdToInrRate;
    const newRecord: AIUsageRecord = {
      ...recordData,
      id: generateId('ai'),
      estimatedCostInr,
    };
    setAiUsage((prev) => [newRecord, ...prev]);
  };

  const reconcileAIInvoice = (invoiceId: string, expenseId: string) => {
    setAiProviderInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? { ...inv, reconciliationStatus: 'reconciled', expenseId }
          : inv
      )
    );
    logAudit('reconcile', 'expense', invoiceId, `Reconciled AI provider invoice ${invoiceId} with expense ${expenseId}`);
  };

  // ---------------- Notifications ----------------
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // ---------------- Clean State vs Demo Seed ----------------
  const resetToCleanState = () => {
    setExpenses([]);
    setInvoices([]);
    setSubscriptions([]);
    setTransfers([]);
    setAiUsage([]);
    setAiProviderInvoices([]);
    setNotifications([]);
    setAccounts((prev) =>
      prev.map((acc) => ({
        ...acc,
        openingBalance: 0,
        currentBalance: 0,
      }))
    );
    setAuditLogs([
      {
        id: generateId('LOG'),
        userEmail: currentUser.email,
        userRole: currentUser.role,
        action: 'delete',
        entityType: 'expense',
        entityId: 'ALL',
        description: 'Reset system to clean empty production state with zero financial records.',
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const seedDemoData = () => {
    setExpenses(initialExpenses);
    setInvoices(initialInvoices);
    setSubscriptions(initialSubscriptions);
    setCustomers(initialCustomers);
    setAccounts(initialAccounts);
    setCategories(initialCategories);
    setAiUsage(initialAIUsage);
    setAiProviderInvoices(initialAIProviderInvoices);
    setBudgets(initialBudgets);
    setTransfers(initialTransfers);
    setNotifications(initialNotifications);
    setAuditLogs(initialAuditLogs);
  };

  return (
    <FinanceContext.Provider
      value={{
        organization,
        currentUser,
        accounts,
        categories,
        expenses,
        subscriptions,
        customers,
        invoices,
        aiUsage,
        aiProviderInvoices,
        budgets,
        transfers,
        auditLogs,
        notifications,
        googleSheetsConfig,

        activeCurrency,
        setActiveCurrency,
        dateFilter,
        setDateFilter,
        customDateRange,
        setCustomDateRange,
        isSupabaseMode,

        switchRole,
        addExpense,
        updateExpense,
        deleteExpense,
        duplicateExpense,
        addSubscription,
        updateSubscription,
        confirmSubscriptionRenewal,
        cancelSubscription,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        markInvoicePaid,
        addTransfer,
        updateAccountBalance,
        updateBudget,
        addAIUsageRecord,
        reconcileAIInvoice,
        updateGoogleSheetsConfig,
        syncToGoogleSheets,
        syncFromGoogleSheets,
        markNotificationRead,
        markAllNotificationsRead,
        resetToCleanState,
        seedDemoData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
