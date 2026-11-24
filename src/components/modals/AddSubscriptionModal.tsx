import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Currency, BillingFrequency, SubscriptionStatus } from '../../types/finance';
import { X, Calendar } from 'lucide-react';

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddSubscriptionModal: React.FC<AddSubscriptionModalProps> = ({ isOpen, onClose }) => {
  const { categories, accounts, addSubscription } = useFinance();

  const [serviceName, setServiceName] = useState('');
  const [vendor, setVendor] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'AI & Infrastructure');
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [billingFrequency, setBillingFrequency] = useState<BillingFrequency>('monthly');
  const [nextBillingDate, setNextBillingDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentAccountId, setPaymentAccountId] = useState(accounts[0]?.id || '');
  const [autoRenewal, setAutoRenewal] = useState<boolean>(true);
  const [subscriptionOwner, setSubscriptionOwner] = useState('Nitin Sharma');
  const [status, setStatus] = useState<SubscriptionStatus>('active');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName || amount <= 0) return;

    addSubscription({
      serviceName,
      vendor: vendor || serviceName,
      category,
      amount,
      currency,
      billingFrequency,
      nextBillingDate,
      paymentAccountId: paymentAccountId || accounts[0]?.id,
      autoRenewal,
      subscriptionOwner,
      status,
      reminderDays: [7, 3, 1],
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl p-6 text-foreground my-8">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Track Recurring Subscription</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Set up automated reminders (7d, 3d, 1d) before auto-renewals.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-medium mb-1 text-muted-foreground">Service Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. OpenAI API, Cursor, Modal GPU, Supabase"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1 text-muted-foreground">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1 text-muted-foreground">Vendor / Merchant</label>
              <input
                type="text"
                placeholder="e.g. OpenAI Inc."
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium mb-1 text-muted-foreground">Amount *</label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-muted-foreground">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1 text-muted-foreground">Billing Frequency</label>
              <select
                value={billingFrequency}
                onChange={(e) => setBillingFrequency(e.target.value as BillingFrequency)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="half_yearly">Half-Yearly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1 text-muted-foreground">Next Billing Date *</label>
              <input
                type="date"
                required
                value={nextBillingDate}
                onChange={(e) => setNextBillingDate(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-muted-foreground">Payment Account</label>
              <select
                value={paymentAccountId}
                onChange={(e) => setPaymentAccountId(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.currency})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1 text-muted-foreground">Subscription Owner</label>
              <input
                type="text"
                value={subscriptionOwner}
                onChange={(e) => setSubscriptionOwner(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-muted-foreground">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-secondary/40 rounded-lg text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Important:</span> Subscription renewal will not be recorded as a paid expense until explicitly confirmed upon bank statement reconciliation.
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-b-0 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover font-medium shadow-subtle transition-colors"
            >
              Add Subscription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
