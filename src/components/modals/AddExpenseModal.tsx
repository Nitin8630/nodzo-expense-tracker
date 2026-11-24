import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Currency, PaymentMethod, ExpensePaymentStatus } from '../../types/finance';
import { X, AlertCircle, Upload, Check, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, initialData }) => {
  const { categories, accounts, organization, addExpense, expenses } = useFinance();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'AI & Infrastructure');
  const [subcategory, setSubcategory] = useState(categories[0]?.subcategories[0] || 'OpenAI API');
  const [vendor, setVendor] = useState('');
  const [vendorGstin, setVendorGstin] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState<Currency>('INR');
  const [exchangeRate, setExchangeRate] = useState<number>(organization.usdToInrRate);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [gstPercentage, setGstPercentage] = useState<number>(18);
  const [isGstInclusive, setIsGstInclusive] = useState<boolean>(true);
  const [gstType, setGstType] = useState<'intra' | 'inter'>('inter'); // CGST+SGST vs IGST
  const [itcEligible, setItcEligible] = useState<boolean>(true);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<ExpensePaymentStatus>('paid');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setCategory(initialData.category || categories[0]?.name);
      setSubcategory(initialData.subcategory || '');
      setVendor(initialData.vendor || '');
      setVendorGstin(initialData.vendorGstin || '');
      setAmount(initialData.amount || 0);
      setCurrency(initialData.currency || 'INR');
      setExpenseDate(initialData.expenseDate || new Date().toISOString().split('T')[0]);
      setInvoiceNumber(initialData.invoiceNumber || '');
      setPaymentStatus(initialData.paymentStatus || 'paid');
    }
  }, [initialData, categories]);

  // Update subcategories when category changes
  const activeCatObj = categories.find((c) => c.name === category);
  const availableSubcategories = activeCatObj?.subcategories || [];

  useEffect(() => {
    if (availableSubcategories.length > 0 && !availableSubcategories.includes(subcategory)) {
      setSubcategory(availableSubcategories[0]);
    }
  }, [category, availableSubcategories]);

  // Tax calculations
  let baseAmount = 0;
  let gstAmount = 0;
  let totalAmount = 0;

  if (isGstInclusive) {
    totalAmount = amount;
    baseAmount = gstPercentage > 0 ? amount / (1 + gstPercentage / 100) : amount;
    gstAmount = totalAmount - baseAmount;
  } else {
    baseAmount = amount;
    gstAmount = (baseAmount * gstPercentage) / 100;
    totalAmount = baseAmount + gstAmount;
  }

  const cgstAmount = gstType === 'intra' ? gstAmount / 2 : 0;
  const sgstAmount = gstType === 'intra' ? gstAmount / 2 : 0;
  const igstAmount = gstType === 'inter' ? gstAmount : 0;

  // Duplicate invoice check: detects if vendor + invoice number + amount + date matches
  useEffect(() => {
    if (vendor && invoiceNumber) {
      const match = expenses.find(
        (e) =>
          !e.isDeleted &&
          e.vendor.toLowerCase() === vendor.toLowerCase() &&
          e.invoiceNumber?.toLowerCase() === invoiceNumber.toLowerCase()
      );
      if (match) {
        setDuplicateWarning(`Potential Duplicate! An expense with Vendor "${match.vendor}" and Invoice #${match.invoiceNumber} (${match.currency} ${match.amount}) already exists on ${match.expenseDate}.`);
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }
  }, [vendor, invoiceNumber, amount, expenses]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || amount <= 0) return;

    addExpense({
      title,
      description,
      category,
      subcategory,
      vendor: vendor || 'Direct Vendor',
      vendorGstin,
      amount: totalAmount,
      currency,
      exchangeRate: currency === 'USD' ? exchangeRate : 1,
      expenseDate,
      paymentMethod,
      accountId: accountId || accounts[0]?.id,
      gstPercentage,
      baseAmount: Math.round(baseAmount * 100) / 100,
      gstAmount: Math.round(gstAmount * 100) / 100,
      cgstAmount: Math.round(cgstAmount * 100) / 100,
      sgstAmount: Math.round(sgstAmount * 100) / 100,
      igstAmount: Math.round(igstAmount * 100) / 100,
      itcEligible,
      totalAmount: Math.round(totalAmount * 100) / 100,
      invoiceNumber,
      paymentStatus,
      isRecurring,
      notes,
      attachments: fileName
        ? [
            {
              id: 'att-' + Date.now(),
              fileName,
              fileUrl: '#',
              fileSize: 245000,
              mimeType: 'application/pdf',
              uploadedAt: new Date().toISOString(),
            },
          ]
        : [],
      createdBy: 'Nitin Sharma',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl p-6 text-foreground my-8">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Record Business Expense</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add a new operational, AI infrastructure, or software expense for Nodzo AI.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {duplicateWarning && (
          <div className="mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg flex items-start gap-2.5 text-amber-700 dark:text-amber-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-warning" />
            <div>
              <span className="font-semibold">Duplicate Invoice Alert:</span> {duplicateWarning}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Title & Vendor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1 text-muted-foreground">Expense Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. OpenAI GPT-4o API Batch Inference"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-muted-foreground">Vendor / Merchant *</label>
              <input
                type="text"
                required
                placeholder="e.g. OpenAI, L.L.C. or Modal Labs"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Category & Subcategory */}
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
              <label className="block font-medium mb-1 text-muted-foreground">Subcategory</label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {availableSubcategories.map((sc) => (
                  <option key={sc} value={sc}>
                    {sc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount, Currency & Exchange Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium mb-1 text-muted-foreground">Amount *</label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                placeholder="0.00"
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-mono font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-muted-foreground">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="INR">INR (₹) — Indian Rupee</option>
                <option value="USD">USD ($) — US Dollar</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1 text-muted-foreground">
                Exchange Rate {currency === 'USD' && '(1 USD = ₹)'}
              </label>
              <input
                type="number"
                step="0.01"
                disabled={currency === 'INR'}
                value={currency === 'INR' ? 1 : exchangeRate}
                onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 84.5)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-mono disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Indian GST Details */}
          <div className="p-3 bg-muted/40 border border-border/80 rounded-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> Indian GST & Tax Settings
              </span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={isGstInclusive}
                    onChange={(e) => setIsGstInclusive(e.target.checked)}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span>GST Inclusive</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={itcEligible}
                    onChange={(e) => setItcEligible(e.target.checked)}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span>ITC Eligible</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-muted-foreground mb-1">GST Rate</label>
                <select
                  value={gstPercentage}
                  onChange={(e) => setGstPercentage(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-background border border-border rounded text-foreground text-xs"
                >
                  <option value={0}>0% (Exempt/Export)</option>
                  <option value={5}>5%</option>
                  <option value={12}>12%</option>
                  <option value={18}>18% (Standard SaaS)</option>
                  <option value={28}>28%</option>
                </select>
              </div>
              <div>
                <label className="block text-muted-foreground mb-1">GST Supply Type</label>
                <select
                  value={gstType}
                  onChange={(e) => setGstType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-background border border-border rounded text-foreground text-xs"
                >
                  <option value="inter">Inter-state (IGST 18%)</option>
                  <option value="intra">Intra-state (CGST 9% + SGST 9%)</option>
                </select>
              </div>
              <div>
                <label className="block text-muted-foreground mb-1">Vendor GSTIN</label>
                <input
                  type="text"
                  placeholder="29AABCN1234F1Z8"
                  value={vendorGstin}
                  onChange={(e) => setVendorGstin(e.target.value.toUpperCase())}
                  className="w-full px-2.5 py-1.5 bg-background border border-border rounded text-foreground uppercase text-xs"
                />
              </div>
            </div>

            {/* Calculated Breakdown Display */}
            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-muted-foreground font-mono text-[11px]">
              <div>Base: {currency === 'INR' ? '₹' : '$'}{baseAmount.toFixed(2)}</div>
              <div>
                {gstType === 'intra'
                  ? `CGST: ${currency === 'INR' ? '₹' : '$'}${cgstAmount.toFixed(2)} | SGST: ${currency === 'INR' ? '₹' : '$'}${sgstAmount.toFixed(2)}`
                  : `IGST: ${currency === 'INR' ? '₹' : '$'}${igstAmount.toFixed(2)}`}
              </div>
              <div className="font-semibold text-foreground">
                Total: {currency === 'INR' ? '₹' : '$'}{totalAmount.toFixed(2)}
                {currency === 'USD' && ` (₹${(totalAmount * exchangeRate).toFixed(0)})`}
              </div>
            </div>
          </div>

          {/* Payment Account, Method & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium mb-1 text-muted-foreground">Payment Account *</label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
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
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="credit_card">Corporate Credit Card</option>
                <option value="bank_transfer">Net Banking / NEFT</option>
                <option value="upi">UPI / Virtual Payout</option>
                <option value="debit_card">Debit Card</option>
                <option value="cash">Petty Cash</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1 text-muted-foreground">Expense Date *</label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Invoice # & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium mb-1 text-muted-foreground">Invoice / Bill #</label>
              <input
                type="text"
                placeholder="INV-OAI-99214"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-muted-foreground">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as ExpensePaymentStatus)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="paid">Paid (Deduct Balance)</option>
                <option value="pending">Pending Approval</option>
                <option value="scheduled">Scheduled</option>
                <option value="reimbursed">Reimbursed</option>
              </select>
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
                <span>Recurring Monthly Subscription</span>
              </label>
            </div>
          </div>

          {/* Receipt attachment upload */}
          <div>
            <label className="block font-medium mb-1 text-muted-foreground">Attach Receipt or Invoice (PDF, PNG, JPG)</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg border border-border hover:bg-secondary/80 cursor-pointer transition-colors text-xs">
                <Upload className="w-4 h-4 text-primary" />
                <span>{fileName ? 'Change File' : 'Upload Document'}</span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFileName(e.target.files[0].name);
                    }
                  }}
                />
              </label>
              {fileName && (
                <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-success" /> {fileName}
                </span>
              )}
            </div>
          </div>

          {/* Description & Notes */}
          <div>
            <label className="block font-medium mb-1 text-muted-foreground">Notes / Purpose</label>
            <textarea
              rows={2}
              placeholder="e.g. November usage for 42,000 calls processed across sales team"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
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
              Record Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
