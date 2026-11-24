import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { RecurringSubscription, SubscriptionStatus } from '../../types/finance';
import {
  CreditCard,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  User,
  ShieldCheck,
  RefreshCw,
  Search,
  Check,
  X,
  History,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';

interface SubscriptionsViewProps {
  onOpenAddSubscription: () => void;
}

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({ onOpenAddSubscription }) => {
  const {
    subscriptions,
    accounts,
    confirmSubscriptionRenewal,
    cancelSubscription,
    activeCurrency,
    organization,
  } = useFinance();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSubForHistory, setSelectedSubForHistory] = useState<RecurringSubscription | null>(null);

  const filteredSubscriptions = subscriptions.filter((s) => {
    const matchesSearch =
      s.serviceName.toLowerCase().includes(search.toLowerCase()) ||
      s.vendor.toLowerCase().includes(search.toLowerCase()) ||
      s.subscriptionOwner.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate annual commitment
  const rate = organization.usdToInrRate;
  const annualTotalInr = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => {
      const amtInr = s.currency === 'USD' ? s.amount * rate : s.amount;
      const multiplier =
        s.billingFrequency === 'monthly'
          ? 12
          : s.billingFrequency === 'quarterly'
          ? 4
          : s.billingFrequency === 'half_yearly'
          ? 2
          : 1;
      return sum + amtInr * multiplier;
    }, 0);

  const monthlyTotalInr = annualTotalInr / 12;

  // Identify upcoming renewals within 7 days
  const today = new Date('2026-11-17T00:00:00');
  const getDaysUntilRenewal = (dateStr: string) => {
    const renewalDate = new Date(dateStr);
    const diffTime = renewalDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/70">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Recurring Subscriptions Tracker
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage SaaS commitments, renewal dates, automated reminders, and reconciliation.
          </p>
        </div>

        <button
          onClick={onOpenAddSubscription}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg text-xs font-medium shadow-subtle transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subscription</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 bg-card border border-border rounded-xl shadow-subtle">
          <div className="text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Monthly Run-Rate Spend</span>
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-1.5 text-lg font-bold font-mono text-foreground">
            {formatCurrency(monthlyTotalInr, activeCurrency)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Active recurring software
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl shadow-subtle">
          <div className="text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Annual Software Commitment</span>
            <CreditCard className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-1.5 text-lg font-bold font-mono text-foreground">
            {formatCurrency(annualTotalInr, activeCurrency)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Annualized contract value
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl shadow-subtle">
          <div className="text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Renewing This Month</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-1.5 text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
            {subscriptions.filter((s) => s.status === 'active').length} Subscriptions
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Automatic reminder emails active
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-3 bg-card border border-border rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search subscriptions by service, vendor, or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="paused">Paused</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Subscriptions Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubscriptions.map((sub) => {
          const daysLeft = getDaysUntilRenewal(sub.nextBillingDate);
          const isDueSoon = daysLeft <= 7 && daysLeft >= 0;
          const isOverdue = daysLeft < 0;
          const account = accounts.find((a) => a.id === sub.paymentAccountId);

          return (
            <div
              key={sub.id}
              className="p-4 bg-card border border-border rounded-xl shadow-subtle flex flex-col justify-between hover:border-primary/40 transition-colors text-xs"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{sub.serviceName}</h3>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{sub.category}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                      sub.status === 'active'
                        ? 'bg-success/10 text-success'
                        : sub.status === 'paused'
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>

                {/* Amount */}
                <div className="mt-3 py-2 border-y border-border/60 flex items-center justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-foreground">
                      {formatCurrency(sub.amount, sub.currency)}
                    </span>
                    <span className="text-muted-foreground text-[10px] ml-1">
                      / {sub.billingFrequency}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-3 space-y-1.5 text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Payment Account:</span>
                    <span className="text-foreground truncate max-w-[150px]">
                      {account ? account.name : 'Corporate Card'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Subscription Owner:</span>
                    <span className="text-foreground">{sub.subscriptionOwner}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Next Renewal:</span>
                    <span className="font-mono text-foreground">{formatDate(sub.nextBillingDate)}</span>
                  </div>
                </div>

                {/* Renewal Reminder Banner */}
                {sub.status === 'active' && (
                  <div className="mt-3 p-2 rounded-lg bg-secondary/70 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Renewal Status:</span>
                    {isDueSoon ? (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Due in {daysLeft} days!
                      </span>
                    ) : isOverdue ? (
                      <span className="text-destructive font-semibold">Overdue ({Math.abs(daysLeft)}d)</span>
                    ) : (
                      <span className="text-muted-foreground">{daysLeft} days remaining</span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedSubForHistory(sub)}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-muted text-[11px] flex items-center gap-1"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>History ({sub.renewalHistory.length})</span>
                </button>

                {sub.status === 'active' && (
                  <button
                    onClick={() => confirmSubscriptionRenewal(sub.id)}
                    className="px-2.5 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-medium rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                    title="Confirm payment on bank statement and create a paid Expense record"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm & Record Bill</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Renewal History Modal */}
      {selectedSubForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl p-5 max-w-md w-full text-foreground text-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div>
                <h3 className="font-semibold text-sm">{selectedSubForHistory.serviceName}</h3>
                <p className="text-[11px] text-muted-foreground">Historical payment & renewal audit log</p>
              </div>
              <button
                onClick={() => setSelectedSubForHistory(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {selectedSubForHistory.renewalHistory.length === 0 ? (
                <div className="py-4 text-center text-muted-foreground">
                  No confirmed renewals recorded yet.
                </div>
              ) : (
                selectedSubForHistory.renewalHistory.map((h) => (
                  <div
                    key={h.id}
                    className="p-2.5 bg-muted/40 border border-border/60 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-foreground">{formatDate(h.date)}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {h.expenseId ? `Expense Link: ${h.expenseId}` : 'Confirmed Renewal'}
                      </div>
                    </div>
                    <div className="font-mono font-semibold text-foreground">
                      {formatCurrency(h.amount, h.currency)}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                onClick={() => setSelectedSubForHistory(null)}
                className="px-4 py-1.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
