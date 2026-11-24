import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Search, X, ArrowRight, DollarSign, Receipt, Users, CreditCard, Cpu, Layers } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const { expenses, invoices, subscriptions, customers, activeCurrency } = useFinance();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle handled by parent
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedExpenses = expenses
    .filter(
      (e) =>
        !e.isDeleted &&
        (e.title.toLowerCase().includes(q) ||
          e.vendor.toLowerCase().includes(q) ||
          e.expenseNumber.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q))
    )
    .slice(0, 4);

  const matchedInvoices = invoices
    .filter(
      (i) =>
        !i.isDeleted &&
        (i.invoiceNumber.toLowerCase().includes(q) ||
          i.customerName.toLowerCase().includes(q) ||
          i.subscriptionPlan.toLowerCase().includes(q))
    )
    .slice(0, 3);

  const matchedSubscriptions = subscriptions
    .filter(
      (s) =>
        s.serviceName.toLowerCase().includes(q) ||
        s.vendor.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    )
    .slice(0, 3);

  const quickNav = [
    { label: 'Financial Overview', tab: 'overview', icon: Layers },
    { label: 'Expense Management', tab: 'expenses', icon: Receipt },
    { label: 'Revenue & Customers', tab: 'revenue', icon: DollarSign },
    { label: 'Recurring Subscriptions', tab: 'subscriptions', icon: CreditCard },
    { label: 'AI Cost Monitoring', tab: 'ai-costs', icon: Cpu },
  ].filter((n) => !q || n.label.toLowerCase().includes(q));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-20">
      <div className="relative w-full max-w-xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden text-foreground">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search expenses, invoices, customers, vendors, or quick actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-3.5 bg-transparent border-none text-foreground placeholder:text-muted-foreground focus:outline-none text-sm"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted border border-border rounded ml-2">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4 text-xs">
          {/* Quick Nav */}
          {quickNav.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Navigation
              </div>
              <div className="mt-1 space-y-1">
                {quickNav.map((n) => {
                  const Icon = n.icon;
                  return (
                    <button
                      key={n.tab}
                      onClick={() => {
                        onNavigate(n.tab);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted text-foreground transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span>{n.label}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Expenses */}
          {matchedExpenses.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Expenses
              </div>
              <div className="mt-1 space-y-1">
                {matchedExpenses.map((exp) => (
                  <button
                    key={exp.id}
                    onClick={() => {
                      onNavigate('expenses');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted text-foreground transition-colors text-left"
                  >
                    <div>
                      <div className="font-medium text-foreground">{exp.title}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {exp.vendor} • {exp.category}
                      </div>
                    </div>
                    <div className="text-right font-mono font-medium">
                      {formatCurrency(exp.totalAmount, exp.currency)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Invoices */}
          {matchedInvoices.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Revenue Invoices
              </div>
              <div className="mt-1 space-y-1">
                {matchedInvoices.map((inv) => (
                  <button
                    key={inv.id}
                    onClick={() => {
                      onNavigate('revenue');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted text-foreground transition-colors text-left"
                  >
                    <div>
                      <div className="font-medium text-foreground">{inv.customerName}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {inv.invoiceNumber} • {inv.subscriptionPlan}
                      </div>
                    </div>
                    <div className="text-right font-mono font-medium text-success">
                      {formatCurrency(inv.totalAmount, inv.currency)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subscriptions */}
          {matchedSubscriptions.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Subscriptions
              </div>
              <div className="mt-1 space-y-1">
                {matchedSubscriptions.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      onNavigate('subscriptions');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted text-foreground transition-colors text-left"
                  >
                    <div>
                      <div className="font-medium text-foreground">{sub.serviceName}</div>
                      <div className="text-[11px] text-muted-foreground">
                        Renews {sub.nextBillingDate} ({sub.billingFrequency})
                      </div>
                    </div>
                    <div className="text-right font-mono font-medium">
                      {formatCurrency(sub.amount, sub.currency)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
