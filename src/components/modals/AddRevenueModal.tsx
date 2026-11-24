import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Currency, PaymentMethod, RevenuePaymentStatus } from '../../types/finance';
import { X, Sparkles } from 'lucide-react';
import { generateId } from '../../lib/utils';

interface AddRevenueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddRevenueModal: React.FC<AddRevenueModalProps> = ({ isOpen, onClose }) => {
  const { customers, accounts, addInvoice } = useFinance();

  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [customerName, setCustomerName] = useState(customers[0]?.companyName || '');
  const [subscriptionPlan, setSubscriptionPlan] = useState('Enterprise Call Analytics (50 Seats)');
  const [agentSeats, setAgentSeats] = useState<number>(50);
  const [subscriptionDurationMonths, setSubscriptionDurationMonths] = useState<number>(1);
  const [subscriptionAmount, setSubscriptionAmount] = useState<number>(250000);
  const [aiUsageCharges, setAiUsageCharges] = useState<number>(28000);
  const [discount, setDiscount] = useState<number>(0);
  const [gstPercentage, setGstPercentage] = useState<number>(18);
  const [currency, setCurrency] = useState<Currency>('INR');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  
  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 15);
  const [paymentDueDate, setPaymentDueDate] = useState(defaultDueDate.toISOString().split('T')[0]);
  
  const [paymentStatus, setPaymentStatus] = useState<RevenuePaymentStatus>('pending');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleCustomerChange = (id: string) => {
    setCustomerId(id);
    const found = customers.find((c) => c.id === id);
    if (found) {
      setCustomerName(found.companyName);
      setAgentSeats(found.agentSeats);
      setSubscriptionAmount(found.mrr);
    }
  };

  const subtotal = Math.max(0, subscriptionAmount + aiUsageCharges - discount);
  const gstAmount = (subtotal * gstPercentage) / 100;
  const totalAmount = subtotal + gstAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || totalAmount <= 0) return;

    addInvoice({
      customerId: customerId || generateId('cust'),
      customerName,
      subscriptionPlan,
      agentSeats,
      subscriptionDurationMonths,
      subscriptionAmount,
      aiUsageCharges,
      discount,
      subtotal,
      gstPercentage,
      gstAmount,
      totalAmount,
      currency,
      invoiceDate,
      paymentDueDate,
      paymentReceivedDate: paymentStatus === 'paid' ? new Date().toISOString().split('T')[0] : undefined,
      paymentStatus,
      paymentMethod: paymentStatus === 'paid' ? paymentMethod : undefined,
      accountId: paymentStatus === 'paid' ? accountId : undefined,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl p-6 text-foreground my-8">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Create Customer Invoice & Revenue</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Generate SaaS subscription contract or usage-based invoice for Nodzo AI.
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
          {/* Customer Selection or Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1 text-muted-foreground">Select Customer *</label>
              <select
                value={customerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName} ({c.agentSeats} Seats)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1 text-muted-foreground">Customer Company Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Plan & Agent Seats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-medium mb-1 text-muted-foreground">Subscription Plan Description</label>
              <input
                type="text"
                required
                placeholder="e.g. Enterprise Call Intelligence 50 Seats"
                value={subscriptionPlan}
                onChange={(e) => setSubscriptionPlan(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-muted-foreground">Agent Seats / Users</label>
              <input
                type="number"
                min="1"
                value={agentSeats}
                onChange={(e) => setAgentSeats(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="p-3 bg-muted/40 border border-border/80 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> Pricing & Invoiced Contract
              </span>
              <span className="text-[11px] text-muted-foreground">
                MRR is calculated specifically from the recurring base contract.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-muted-foreground mb-1">Contract Base (MRR)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={subscriptionAmount}
                  onChange={(e) => setSubscriptionAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-background border border-border rounded text-foreground font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1">AI Usage Overage</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={aiUsageCharges}
                  onChange={(e) => setAiUsageCharges(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-background border border-border rounded text-foreground font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1">Discount</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-background border border-border rounded text-foreground font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-muted-foreground mb-1">GST Rate (%)</label>
                <select
                  value={gstPercentage}
                  onChange={(e) => setGstPercentage(parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-background border border-border rounded text-foreground text-xs"
                >
                  <option value={18}>18% (Standard GST)</option>
                  <option value={0}>0% (SEZ / Export)</option>
                </select>
              </div>
              <div>
                <label className="block text-muted-foreground mb-1">Duration (Months)</label>
                <input
                  type="number"
                  min="1"
                  value={subscriptionDurationMonths}
                  onChange={(e) => setSubscriptionDurationMonths(parseInt(e.target.value) || 1)}
                  className="w-full px-2.5 py-1.5 bg-background border border-border rounded text-foreground font-mono text-xs"
                />
              </div>
              <div className="flex flex-col justify-end">
                <div className="text-[11px] text-muted-foreground">Taxable Subtotal: ₹{subtotal.toLocaleString()}</div>
                <div className="text-xs font-semibold text-foreground">
                  Total (incl. GST): ₹{totalAmount.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Dates & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium mb-1 text-muted-foreground">Invoice Date *</label>
              <input
                type="date"
                required
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-muted-foreground">Payment Due Date *</label>
              <input
                type="date"
                required
                value={paymentDueDate}
                onChange={(e) => setPaymentDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-muted-foreground">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as RevenuePaymentStatus)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="pending">Pending Payment</option>
                <option value="paid">Paid (Deposit to Bank)</option>
                <option value="draft">Draft</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          {paymentStatus === 'paid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-success/5 border border-success/20 rounded-lg">
              <div>
                <label className="block font-medium mb-1 text-muted-foreground">Deposit to Account</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-xs"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.currency})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1 text-muted-foreground">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-xs"
                >
                  <option value="bank_transfer">Direct RTGS / NEFT</option>
                  <option value="upi">UPI / Razorpay</option>
                  <option value="credit_card">Corporate Credit Card</option>
                </select>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block font-medium mb-1 text-muted-foreground">Notes / Internal Reference</label>
            <input
              type="text"
              placeholder="e.g. Annual renewal PO #PW-2026-401"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
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
              Create Revenue Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
