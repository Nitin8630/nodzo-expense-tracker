import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { X, ArrowRightLeft, Info } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface AddTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTransferModal: React.FC<AddTransferModalProps> = ({ isOpen, onClose }) => {
  const { accounts, addTransfer } = useFinance();

  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts[3]?.id || accounts[1]?.id || '');
  const [amount, setAmount] = useState<number>(50000);
  const [transferFee, setTransferFee] = useState<number>(0);
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const fromAcc = accounts.find((a) => a.id === fromAccountId);
  const toAcc = accounts.find((a) => a.id === toAccountId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromAccountId === toAccountId) {
      setError('Source and destination accounts must be different.');
      return;
    }
    if (amount <= 0) {
      setError('Transfer amount must be greater than zero.');
      return;
    }
    if (fromAcc && fromAcc.currentBalance < amount + transferFee) {
      setError(`Insufficient funds in ${fromAcc.name}. Available: ${formatCurrency(fromAcc.currentBalance, fromAcc.currency)}`);
      return;
    }

    addTransfer({
      fromAccountId,
      toAccountId,
      amount,
      transferFee,
      transferDate,
      referenceNumber,
      notes,
      createdBy: 'Nitin Sharma',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl p-6 text-foreground my-8">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Internal Account Transfer</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Move cash between company bank accounts, credit cards, or petty cash.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 p-3 bg-accent/20 border border-accent/40 rounded-lg flex items-start gap-2.5 text-accent-foreground text-xs">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
          <div>
            <span className="font-semibold">GAAP & Tax Compliance Rule:</span> Internal transfers do not count towards business revenue or operational expenses. They update liquidity and account reconciliation only.
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* From Account */}
          <div>
            <label className="block font-medium mb-1 text-muted-foreground">From Account (Source)</label>
            <select
              value={fromAccountId}
              onChange={(e) => {
                setFromAccountId(e.target.value);
                setError(null);
              }}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — Bal: {formatCurrency(a.currentBalance, a.currency)}
                </option>
              ))}
            </select>
          </div>

          {/* To Account */}
          <div>
            <label className="block font-medium mb-1 text-muted-foreground">To Account (Destination)</label>
            <select
              value={toAccountId}
              onChange={(e) => {
                setToAccountId(e.target.value);
                setError(null);
              }}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — Bal: {formatCurrency(a.currentBalance, a.currency)}
                </option>
              ))}
            </select>
          </div>

          {/* Amount & Fee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1 text-muted-foreground">Transfer Amount *</label>
              <input
                type="number"
                step="any"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-muted-foreground">Bank Charges / Transfer Fee</label>
              <input
                type="number"
                step="any"
                min="0"
                value={transferFee}
                onChange={(e) => setTransferFee(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Date & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1 text-muted-foreground">Transfer Date *</label>
              <input
                type="date"
                required
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-muted-foreground">UTR / Reference Number</label>
              <input
                type="text"
                placeholder="e.g. NEFT-994120"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1 text-muted-foreground">Notes / Purpose</label>
            <input
              type="text"
              placeholder="e.g. Monthly forex card reload for AWS & OpenAI billing"
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
              Execute Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
