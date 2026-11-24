import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  Wallet,
  ArrowRightLeft,
  Building,
  CreditCard,
  Smartphone,
  Banknote,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Plus,
  RefreshCw,
  Info,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';

interface CashFlowViewProps {
  onOpenAddTransfer: () => void;
}

export const CashFlowView: React.FC<CashFlowViewProps> = ({ onOpenAddTransfer }) => {
  const {
    accounts,
    transfers,
    expenses,
    invoices,
    updateAccountBalance,
    activeCurrency,
    organization,
  } = useFinance();

  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [newBalanceInput, setNewBalanceInput] = useState<number>(0);

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'business_bank':
        return Building;
      case 'personal_business':
        return Wallet;
      case 'upi':
        return Smartphone;
      case 'credit_card':
        return CreditCard;
      default:
        return Banknote;
    }
  };

  const rate = organization.usdToInrRate;
  const totalLiquidityInr = accounts
    .filter((a) => a.isActive)
    .reduce((sum, a) => {
      const balInr = a.currency === 'USD' ? a.currentBalance * rate : a.currentBalance;
      return sum + balInr;
    }, 0);

  const handleSaveBalance = (accId: string) => {
    updateAccountBalance(accId, newBalanceInput);
    setEditingAccountId(null);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/70">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Multi-Account Liquidity & Cash Flow
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor real-time company bank balances, credit line usage, and internal account transfers.
          </p>
        </div>

        <button
          onClick={onOpenAddTransfer}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg text-xs font-medium shadow-subtle transition-colors"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>New Internal Transfer</span>
        </button>
      </div>

      {/* Total Treasury Liquidity Card */}
      <div className="p-5 bg-card border border-border rounded-xl shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Consolidated Treasury Balance
          </span>
          <div className="mt-1 text-2xl font-bold font-mono text-foreground">
            {formatCurrency(totalLiquidityInr, activeCurrency)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Reconciled across {accounts.length} active financial holding accounts.
          </div>
        </div>

        <div className="p-3 bg-secondary/80 rounded-lg border border-border text-xs text-muted-foreground max-w-sm flex items-start gap-2">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span>
            Transfers between internal bank accounts alter individual account balances without impacting Net P&L or tax liabilities.
          </span>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => {
          const Icon = getAccountIcon(acc.type);
          const isEditing = editingAccountId === acc.id;

          return (
            <div
              key={acc.id}
              className="p-4 bg-card border border-border rounded-xl shadow-subtle flex flex-col justify-between hover:border-primary/40 transition-colors text-xs"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-secondary rounded-lg text-primary">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">{acc.name}</h3>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {acc.accountNumberMask}
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-secondary font-mono font-medium uppercase text-muted-foreground">
                    {acc.currency}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60">
                  <span className="text-[11px] text-muted-foreground">Current Balance:</span>
                  {isEditing ? (
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="number"
                        step="any"
                        value={newBalanceInput}
                        onChange={(e) => setNewBalanceInput(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 bg-background border border-border rounded font-mono text-xs"
                      />
                      <button
                        onClick={() => handleSaveBalance(acc.id)}
                        className="px-2 py-1 bg-primary text-primary-foreground rounded text-[11px] font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingAccountId(null)}
                        className="px-2 py-1 border border-border rounded text-[11px]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-baseline justify-between mt-1">
                      <div className="text-xl font-bold font-mono text-foreground">
                        {formatCurrency(acc.currentBalance, acc.currency)}
                      </div>
                      <button
                        onClick={() => {
                          setEditingAccountId(acc.id);
                          setNewBalanceInput(acc.currentBalance);
                        }}
                        className="text-[11px] text-primary hover:underline"
                      >
                        Reconcile
                      </button>
                    </div>
                  )}

                  {acc.currency === 'USD' && (
                    <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                      ≈ ₹{(acc.currentBalance * rate).toLocaleString()} INR
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-border/40 flex justify-between text-[11px] text-muted-foreground">
                  <span>Opening Bal:</span>
                  <span className="font-mono">{formatCurrency(acc.openingBalance, acc.currency)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Internal Transfers History */}
      <div className="p-5 bg-card border border-border rounded-xl shadow-subtle space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Internal Transfers Audit Log
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            Strictly segregated from revenue & expenses
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-medium">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Source Account (From)</th>
                <th className="py-2.5 px-3">Destination Account (To)</th>
                <th className="py-2.5 px-3 text-right">Transfer Amount</th>
                <th className="py-2.5 px-3">Reference / UTR</th>
                <th className="py-2.5 px-3">Purpose / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {transfers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted-foreground">
                    No internal transfers recorded.
                  </td>
                </tr>
              ) : (
                transfers.map((tr) => (
                  <tr key={tr.id} className="hover:bg-muted/30">
                    <td className="py-3 px-3 text-muted-foreground whitespace-nowrap">
                      {formatDate(tr.transferDate)}
                    </td>
                    <td className="py-3 px-3 font-medium text-foreground">{tr.fromAccountName}</td>
                    <td className="py-3 px-3 font-medium text-foreground">{tr.toAccountName}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                      ₹{tr.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-muted-foreground">
                      {tr.referenceNumber || '—'}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">{tr.notes || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
