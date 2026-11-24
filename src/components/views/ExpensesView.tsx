import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Expense, Currency } from '../../types/finance';
import {
  Search,
  Filter,
  Plus,
  Copy,
  Trash2,
  Edit,
  Download,
  Paperclip,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';

interface ExpensesViewProps {
  onOpenAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onOpenReceiptScan: () => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  onOpenAddExpense,
  onEditExpense,
  onOpenReceiptScan,
}) => {
  const { expenses, categories, accounts, deleteExpense, duplicateExpense, activeCurrency } = useFinance();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const activeExpenses = expenses.filter((e) => !e.isDeleted);

  const filteredExpenses = activeExpenses.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.vendor.toLowerCase().includes(search.toLowerCase()) ||
      e.expenseNumber.toLowerCase().includes(search.toLowerCase()) ||
      (e.invoiceNumber && e.invoiceNumber.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || e.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || e.paymentStatus === selectedStatus;
    const matchesAccount = selectedAccount === 'all' || e.accountId === selectedAccount;

    return matchesSearch && matchesCategory && matchesStatus && matchesAccount;
  });

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (sortField === 'date') {
      const dateA = new Date(a.expenseDate).getTime();
      const dateB = new Date(b.expenseDate).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      return sortOrder === 'asc' ? a.totalAmountInr - b.totalAmountInr : b.totalAmountInr - a.totalAmountInr;
    }
  });

  const totalFilteredInr = filteredExpenses.reduce((sum, e) => sum + e.totalAmountInr, 0);
  const totalFilteredGSTInr = filteredExpenses.reduce((sum, e) => sum + (e.gstAmount * (e.currency === 'USD' ? e.exchangeRate : 1)), 0);

  const handleExportCSV = () => {
    const headers = [
      'Expense #',
      'Date',
      'Title',
      'Category',
      'Subcategory',
      'Vendor',
      'Vendor GSTIN',
      'Amount',
      'Currency',
      'Exchange Rate',
      'Total Amount INR',
      'Base Amount',
      'GST %',
      'GST Amount',
      'CGST Amount',
      'SGST Amount',
      'IGST Amount',
      'ITC Eligible',
      'Payment Method',
      'Payment Status',
      'Invoice #',
      'Notes',
    ];

    const rows = sortedExpenses.map((e) => [
      e.expenseNumber,
      e.expenseDate,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.category}"`,
      `"${e.subcategory || ''}"`,
      `"${e.vendor}"`,
      e.vendorGstin || '',
      e.amount,
      e.currency,
      e.exchangeRate,
      e.totalAmountInr,
      e.baseAmount,
      e.gstPercentage,
      e.gstAmount,
      e.cgstAmount,
      e.sgstAmount,
      e.igstAmount,
      e.itcEligible ? 'YES' : 'NO',
      e.paymentMethod,
      e.paymentStatus,
      e.invoiceNumber || '',
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Nodzo_Expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/70">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Expense Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track, categorize, and reconcile operational bills, AI infrastructure, and SaaS costs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border rounded-lg text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenReceiptScan}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-foreground border border-border rounded-lg text-xs font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Scan Receipt</span>
          </button>
          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg text-xs font-medium shadow-subtle transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-card border border-border rounded-lg flex items-center justify-between">
          <div>
            <div className="text-[11px] text-muted-foreground">Filtered Expenses</div>
            <div className="text-base font-bold font-mono text-foreground mt-0.5">
              {formatCurrency(totalFilteredInr, activeCurrency)}
            </div>
          </div>
          <span className="text-xs text-muted-foreground font-mono">{filteredExpenses.length} records</span>
        </div>

        <div className="p-3 bg-card border border-border rounded-lg flex items-center justify-between">
          <div>
            <div className="text-[11px] text-muted-foreground">Input GST Credit (ITC)</div>
            <div className="text-base font-bold font-mono text-primary mt-0.5">
              {formatCurrency(totalFilteredGSTInr, activeCurrency)}
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground">Claimable against output tax</span>
        </div>

        <div className="p-3 bg-card border border-border rounded-lg flex items-center justify-between">
          <div>
            <div className="text-[11px] text-muted-foreground">Total Paid Out</div>
            <div className="text-base font-bold font-mono text-success mt-0.5">
              {formatCurrency(
                filteredExpenses.filter((e) => e.paymentStatus === 'paid').reduce((s, e) => s + e.totalAmountInr, 0),
                activeCurrency
              )}
            </div>
          </div>
          <span className="text-[10px] text-success">Cleared from accounts</span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="p-3 bg-card border border-border rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search expenses by title, vendor, invoice #, or expense ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs"
          >
            <option value="all">All Payment Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="scheduled">Scheduled</option>
            <option value="reimbursed">Reimbursed</option>
          </select>

          {/* Account Filter */}
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs"
          >
            <option value="all">All Accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-card border border-border rounded-xl shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-muted-foreground font-medium">
                <th className="py-2.5 px-3">Expense #</th>
                <th className="py-2.5 px-3">
                  <button
                    onClick={() => {
                      if (sortField === 'date') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else {
                        setSortField('date');
                        setSortOrder('desc');
                      }
                    }}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3">Title & Category</th>
                <th className="py-2.5 px-3">Vendor</th>
                <th className="py-2.5 px-3">Payment Account</th>
                <th className="py-2.5 px-3 text-right">
                  <button
                    onClick={() => {
                      if (sortField === 'amount') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else {
                        setSortField('amount');
                        setSortOrder('desc');
                      }
                    }}
                    className="flex items-center gap-1 ml-auto hover:text-foreground"
                  >
                    <span>Amount</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right">GST / Tax</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Receipt</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {sortedExpenses.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-muted-foreground">
                    No matching expenses found.
                  </td>
                </tr>
              ) : (
                sortedExpenses.map((exp) => {
                  const account = accounts.find((a) => a.id === exp.accountId);
                  return (
                    <tr key={exp.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-3 font-mono text-[11px] text-muted-foreground">
                        {exp.expenseNumber}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground whitespace-nowrap">
                        {formatDate(exp.expenseDate)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-foreground">{exp.title}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span>{exp.category}</span>
                          {exp.subcategory && <span>› {exp.subcategory}</span>}
                          {exp.isRecurring && (
                            <span className="px-1.5 py-0.2 bg-primary/10 text-primary rounded text-[9px] font-mono">
                              Recurring
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-foreground">{exp.vendor}</div>
                        {exp.vendorGstin && (
                          <div className="text-[10px] text-muted-foreground font-mono">
                            GST: {exp.vendorGstin}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">
                        <div className="truncate max-w-[140px] text-[11px]">
                          {account ? account.name : exp.paymentMethod}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                        {formatCurrency(exp.totalAmount, exp.currency)}
                        {exp.currency === 'USD' && (
                          <div className="text-[10px] text-muted-foreground font-normal">
                            ₹{exp.totalAmountInr.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-[11px]">
                        <div>
                          {exp.currency === 'INR' ? '₹' : '$'}
                          {exp.gstAmount.toFixed(2)} ({exp.gstPercentage}%)
                        </div>
                        {exp.itcEligible && (
                          <span className="text-[9px] text-success font-sans">ITC Eligible</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                            exp.paymentStatus === 'paid'
                              ? 'bg-success/10 text-success'
                              : exp.paymentStatus === 'pending'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {exp.paymentStatus === 'paid' && <CheckCircle2 className="w-3 h-3" />}
                          {exp.paymentStatus === 'pending' && <Clock className="w-3 h-3" />}
                          {exp.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {exp.attachments && exp.attachments.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline cursor-pointer">
                            <Paperclip className="w-3 h-3" />
                            <span>1</span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => duplicateExpense(exp.id)}
                            title="Duplicate Expense"
                            className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditExpense(exp)}
                            title="Edit Expense"
                            className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteExpense(exp.id)}
                            title="Delete Expense"
                            className="p-1 text-muted-foreground hover:text-destructive rounded hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
