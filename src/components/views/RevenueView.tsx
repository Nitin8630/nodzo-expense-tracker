import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { RevenueInvoice, RevenuePaymentStatus } from '../../types/finance';
import {
  DollarSign,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Users,
  TrendingUp,
  Download,
  Check,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';

interface RevenueViewProps {
  onOpenAddRevenue: () => void;
}

export const RevenueView: React.FC<RevenueViewProps> = ({ onOpenAddRevenue }) => {
  const { invoices, customers, accounts, markInvoicePaid, activeCurrency, organization } = useFinance();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reportingBasis, setReportingBasis] = useState<'accrual' | 'cash'>('accrual');
  const [reconcilingInvoiceId, setReconcilingInvoiceId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [selectedMethod, setSelectedMethod] = useState('bank_transfer');

  const activeInvoices = invoices.filter((i) => !i.isDeleted);

  const filteredInvoices = activeInvoices.filter((inv) => {
    const matchesSearch =
      inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.subscriptionPlan.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || inv.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate SaaS Financial Metrics
  // Contract MRR specifically from recurring subscription amount
  const contractMRR = activeInvoices
    .filter((i) => i.paymentStatus !== 'refunded')
    .reduce((sum, i) => sum + i.subscriptionAmount, 0);

  const contractARR = contractMRR * 12;

  // Accrual Revenue: Total Subtotal Invoiced (Excluding GST collected)
  const accrualRevenue = activeInvoices.reduce((sum, i) => sum + i.subtotal, 0);

  // Cash Received: Actual payments settled into accounts
  const cashCollected = activeInvoices
    .filter((i) => i.paymentStatus === 'paid')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  // Pending / Overdue receivables
  const accountsReceivable = activeInvoices
    .filter((i) => i.paymentStatus === 'pending' || i.paymentStatus === 'overdue')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const totalAgentSeats = customers.reduce((sum, c) => sum + c.agentSeats, 0);

  const handleExportCSV = () => {
    const headers = [
      'Invoice #',
      'Customer',
      'Plan',
      'Agents',
      'Contract Base (MRR)',
      'AI Usage Overage',
      'Discount',
      'Subtotal (Operating Revenue)',
      'GST %',
      'GST Amount',
      'Total Amount Invoiced',
      'Invoice Date',
      'Due Date',
      'Received Date',
      'Payment Status',
    ];

    const rows = filteredInvoices.map((i) => [
      i.invoiceNumber,
      `"${i.customerName}"`,
      `"${i.subscriptionPlan}"`,
      i.agentSeats,
      i.subscriptionAmount,
      i.aiUsageCharges,
      i.discount,
      i.subtotal,
      i.gstPercentage,
      i.gstAmount,
      i.totalAmount,
      i.invoiceDate,
      i.paymentDueDate,
      i.paymentReceivedDate || '',
      i.paymentStatus,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Nodzo_Revenue_Invoices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmPayment = (id: string) => {
    markInvoicePaid(id, selectedAccountId, selectedMethod);
    setReconcilingInvoiceId(null);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/70">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Revenue & Subscription Contracts
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            SaaS MRR, customer call agent seats, AI usage overage, and cash collections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Cash vs Accrual Basis Toggle */}
          <div className="flex items-center p-0.5 bg-secondary rounded-lg border border-border text-xs">
            <button
              onClick={() => setReportingBasis('accrual')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                reportingBasis === 'accrual'
                  ? 'bg-card text-foreground shadow-subtle'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Accrual Basis
            </button>
            <button
              onClick={() => setReportingBasis('cash')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                reportingBasis === 'cash'
                  ? 'bg-card text-foreground shadow-subtle'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Cash Basis
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border rounded-lg text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenAddRevenue}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg text-xs font-medium shadow-subtle transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 bg-card border border-border rounded-xl shadow-subtle">
          <div className="text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Contract MRR</span>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-1.5 text-lg font-bold font-mono text-foreground">
            {formatCurrency(contractMRR, activeCurrency)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            ARR: {formatCurrency(contractARR, activeCurrency, { compact: true })}
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl shadow-subtle">
          <div className="text-[11px] text-muted-foreground flex items-center justify-between">
            <span>
              {reportingBasis === 'accrual' ? 'Operating Invoiced (Accrual)' : 'Cash Collected'}
            </span>
            <DollarSign className="w-4 h-4 text-success" />
          </div>
          <div className="mt-1.5 text-lg font-bold font-mono text-success">
            {formatCurrency(
              reportingBasis === 'accrual' ? accrualRevenue : cashCollected,
              activeCurrency
            )}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {reportingBasis === 'accrual' ? 'Excludes GST collected' : 'Settled to bank accounts'}
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl shadow-subtle">
          <div className="text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Receivables (Unpaid)</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-1.5 text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
            {formatCurrency(accountsReceivable, activeCurrency)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Pending / Overdue invoices
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl shadow-subtle">
          <div className="text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Active Enterprise Seats</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-1.5 text-lg font-bold font-mono text-foreground">
            {totalAgentSeats} Agents
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Across {customers.length} enterprise customers
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3 bg-card border border-border rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by customer, invoice #, or plan..."
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
          <option value="all">All Invoice Statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div className="bg-card border border-border rounded-xl shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-muted-foreground font-medium">
                <th className="py-2.5 px-3">Invoice #</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Plan & Seats</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Contract MRR</th>
                <th className="py-2.5 px-3 text-right">AI Overage</th>
                <th className="py-2.5 px-3 text-right">Total (incl. GST)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-muted-foreground">
                    No matching revenue records found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-3 font-mono text-[11px] font-medium text-foreground">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-foreground">{inv.customerName}</div>
                      {inv.customerGstin && (
                        <div className="text-[10px] text-muted-foreground font-mono">
                          GST: {inv.customerGstin}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-foreground">{inv.subscriptionPlan}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {inv.agentSeats} seats
                      </div>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground whitespace-nowrap">
                      <div>Issued: {formatDate(inv.invoiceDate)}</div>
                      <div className="text-[10px]">Due: {formatDate(inv.paymentDueDate)}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-foreground">
                      {formatCurrency(inv.subscriptionAmount, inv.currency)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-muted-foreground">
                      {formatCurrency(inv.aiUsageCharges, inv.currency)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                      {formatCurrency(inv.totalAmount, inv.currency)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                          inv.paymentStatus === 'paid'
                            ? 'bg-success/10 text-success'
                            : inv.paymentStatus === 'overdue'
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {inv.paymentStatus === 'paid' && <CheckCircle2 className="w-3 h-3" />}
                        {inv.paymentStatus === 'overdue' && <AlertCircle className="w-3 h-3" />}
                        {inv.paymentStatus === 'pending' && <Clock className="w-3 h-3" />}
                        {inv.paymentStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {inv.paymentStatus !== 'paid' ? (
                        <button
                          onClick={() => setReconcilingInvoiceId(inv.id)}
                          className="px-2.5 py-1 bg-success/15 hover:bg-success/25 text-success rounded text-[11px] font-medium transition-colors inline-flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Mark Paid</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          Cleared {inv.paymentReceivedDate && formatDate(inv.paymentReceivedDate)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reconcile Payment Modal */}
      {reconcilingInvoiceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl p-5 max-w-sm w-full text-foreground text-xs space-y-4">
            <h3 className="font-semibold text-sm">Confirm Customer Payment</h3>
            <p className="text-muted-foreground">
              Select the bank or UPI account that received the remittance.
            </p>

            <div>
              <label className="block text-muted-foreground mb-1 font-medium">Deposit to Account</label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
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
              <label className="block text-muted-foreground mb-1 font-medium">Payment Mode</label>
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-xs"
              >
                <option value="bank_transfer">RTGS / NEFT / IMPS</option>
                <option value="upi">Razorpay UPI</option>
                <option value="credit_card">Card Payment</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setReconcilingInvoiceId(null)}
                className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmPayment(reconcilingInvoiceId)}
                className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover font-medium shadow-subtle"
              >
                Confirm Deposit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
