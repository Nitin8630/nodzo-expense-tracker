import React, { useState, useEffect } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewView } from './components/views/OverviewView';
import { ExpensesView } from './components/views/ExpensesView';
import { RevenueView } from './components/views/RevenueView';
import { SubscriptionsView } from './components/views/SubscriptionsView';
import { AICostsView } from './components/views/AICostsView';
import { CashFlowView } from './components/views/CashFlowView';
import { BudgetsView } from './components/views/BudgetsView';
import { InvoicesReceiptsView } from './components/views/InvoicesReceiptsView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsView } from './components/views/SettingsView';

import { AddExpenseModal } from './components/modals/AddExpenseModal';
import { AddRevenueModal } from './components/modals/AddRevenueModal';
import { AddSubscriptionModal } from './components/modals/AddSubscriptionModal';
import { AddTransferModal } from './components/modals/AddTransferModal';
import { AddAIUsageModal } from './components/modals/AddAIUsageModal';
import { ReceiptExtractorModal } from './components/modals/ReceiptExtractorModal';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { Expense } from './types/finance';

function MainApp() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('nodzo_theme') === 'dark';
  });

  // Modal triggers
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddRevenueOpen, setIsAddRevenueOpen] = useState(false);
  const [isAddSubscriptionOpen, setIsAddSubscriptionOpen] = useState(false);
  const [isAddTransferOpen, setIsAddTransferOpen] = useState(false);
  const [isAddAIUsageOpen, setIsAddAIUsageOpen] = useState(false);
  const [isReceiptScanOpen, setIsReceiptScanOpen] = useState(false);

  // Edit Expense data
  const [editingExpenseData, setEditingExpenseData] = useState<any | null>(null);

  // Sync dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('nodzo_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('nodzo_theme', 'light');
    }
  }, [darkMode]);

  // Global Keyboard shortcuts: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleEditExpense = (expense: Expense) => {
    setEditingExpenseData(expense);
    setIsAddExpenseOpen(true);
  };

  const handleReceiptExtracted = (extractedData: any) => {
    setEditingExpenseData(extractedData);
    setIsAddExpenseOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAddExpense={() => {
            setEditingExpenseData(null);
            setIsAddExpenseOpen(true);
          }}
          onOpenAddRevenue={() => setIsAddRevenueOpen(true)}
          onOpenAddSubscription={() => setIsAddSubscriptionOpen(true)}
          onOpenAddTransfer={() => setIsAddTransferOpen(true)}
          onOpenAddAIUsage={() => setIsAddAIUsageOpen(true)}
          onOpenReceiptScan={() => setIsReceiptScanOpen(true)}
          onNavigate={(tab) => setActiveTab(tab)}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        <main className="flex-1 p-5 sm:p-7 max-w-7xl w-full mx-auto overflow-y-auto">
          {activeTab === 'overview' && <OverviewView />}
          {activeTab === 'expenses' && (
            <ExpensesView
              onOpenAddExpense={() => {
                setEditingExpenseData(null);
                setIsAddExpenseOpen(true);
              }}
              onEditExpense={handleEditExpense}
              onOpenReceiptScan={() => setIsReceiptScanOpen(true)}
            />
          )}
          {activeTab === 'revenue' && (
            <RevenueView onOpenAddRevenue={() => setIsAddRevenueOpen(true)} />
          )}
          {activeTab === 'subscriptions' && (
            <SubscriptionsView
              onOpenAddSubscription={() => setIsAddSubscriptionOpen(true)}
            />
          )}
          {activeTab === 'ai-costs' && (
            <AICostsView onOpenAddAIUsage={() => setIsAddAIUsageOpen(true)} />
          )}
          {activeTab === 'cash-flow' && (
            <CashFlowView onOpenAddTransfer={() => setIsAddTransferOpen(true)} />
          )}
          {activeTab === 'budgets' && <BudgetsView />}
          {activeTab === 'invoices-receipts' && (
            <InvoicesReceiptsView
              onOpenReceiptScan={() => setIsReceiptScanOpen(true)}
              onOpenAddExpense={() => {
                setEditingExpenseData(null);
                setIsAddExpenseOpen(true);
              }}
            />
          )}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Modals & Drawers */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setEditingExpenseData(null);
        }}
        initialData={editingExpenseData}
      />

      <AddRevenueModal
        isOpen={isAddRevenueOpen}
        onClose={() => setIsAddRevenueOpen(false)}
      />

      <AddSubscriptionModal
        isOpen={isAddSubscriptionOpen}
        onClose={() => setIsAddSubscriptionOpen(false)}
      />

      <AddTransferModal
        isOpen={isAddTransferOpen}
        onClose={() => setIsAddTransferOpen(false)}
      />

      <AddAIUsageModal
        isOpen={isAddAIUsageOpen}
        onClose={() => setIsAddAIUsageOpen(false)}
      />

      <ReceiptExtractorModal
        isOpen={isReceiptScanOpen}
        onClose={() => setIsReceiptScanOpen(false)}
        onExtracted={handleReceiptExtracted}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(tab) => setActiveTab(tab)}
      />
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <MainApp />
    </FinanceProvider>
  );
}
