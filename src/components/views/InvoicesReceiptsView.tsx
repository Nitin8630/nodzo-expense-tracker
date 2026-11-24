import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  FileText,
  Upload,
  Sparkles,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  Trash2,
  Calendar,
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../lib/utils';

interface InvoicesReceiptsViewProps {
  onOpenReceiptScan: () => void;
  onOpenAddExpense: () => void;
}

export const InvoicesReceiptsView: React.FC<InvoicesReceiptsViewProps> = ({
  onOpenReceiptScan,
  onOpenAddExpense,
}) => {
  const { expenses, activeCurrency } = useFinance();
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  // Collect all expenses with attachments or invoice numbers
  const documentedExpenses = expenses.filter(
    (e) => !e.isDeleted && (e.invoiceNumber || (e.attachments && e.attachments.length > 0))
  );

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/70">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Invoices & Receipts Repository
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Store documents securely in Supabase Storage, scan with AI extraction, and detect duplicates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenReceiptScan}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg text-xs font-medium shadow-subtle transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Receipt Scanner</span>
          </button>
        </div>
      </div>

      {/* Upload Callout Card */}
      <div className="p-5 bg-gradient-to-r from-primary/5 via-card to-card border border-primary/20 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" /> AI Smart Extraction & Audit Trail
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Upload PDF receipts, vendor bills, or GST invoices. Nodzo's scanner identifies vendor GSTIN, line items, and detects duplicate invoices before committing them to the general ledger.
          </p>
        </div>

        <button
          onClick={onOpenReceiptScan}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary-hover shrink-0 transition-colors shadow-subtle"
        >
          Upload & Auto-Scan
        </button>
      </div>

      {/* Documents Grid / Table */}
      <div className="bg-card border border-border rounded-xl shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Attached Receipts & Verified Invoices ({documentedExpenses.length})
          </h2>
          <span className="text-xs text-muted-foreground font-mono">
            {documentedExpenses.filter((e) => e.attachments && e.attachments.length > 0).length} Files Attached
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-muted-foreground font-medium">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Vendor / Merchant</th>
                <th className="py-2.5 px-3">Invoice #</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-center">Attachment</th>
                <th className="py-2.5 px-3 text-center">Verification</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {documentedExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-muted/30">
                  <td className="py-3 px-3 text-muted-foreground whitespace-nowrap">
                    {formatDate(exp.expenseDate)}
                  </td>
                  <td className="py-3 px-3 font-semibold text-foreground">{exp.vendor}</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-muted-foreground">
                    {exp.invoiceNumber || 'Manual Entry'}
                  </td>
                  <td className="py-3 px-3 text-muted-foreground">{exp.category}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                    {formatCurrency(exp.totalAmount, exp.currency)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {exp.attachments && exp.attachments.length > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary font-mono font-medium">
                        <Paperclip className="w-3 h-3" />
                        <span>{exp.attachments[0].fileName}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground/60 italic">No PDF attached</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] text-success font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedDoc(exp)}
                      className="px-2.5 py-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded text-[11px] font-medium transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Inspector Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl p-6 max-w-lg w-full text-foreground text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-semibold text-sm">Invoice Inspector</h3>
                <p className="text-muted-foreground text-[11px] font-mono">
                  {selectedDoc.expenseNumber} • {selectedDoc.vendor}
                </p>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-muted/30 border border-border rounded-lg space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Title:</span>
                <span className="font-medium text-foreground">{selectedDoc.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice #:</span>
                <span className="font-mono text-foreground">{selectedDoc.invoiceNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vendor GSTIN:</span>
                <span className="font-mono text-foreground">{selectedDoc.vendorGstin || 'Unregistered / Foreign'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expense Date:</span>
                <span className="text-foreground">{formatDate(selectedDoc.expenseDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Status:</span>
                <span className="capitalize text-success font-medium">{selectedDoc.paymentStatus}</span>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-2 font-semibold">
                <span>Total Amount:</span>
                <span className="font-mono text-primary text-sm">
                  {formatCurrency(selectedDoc.totalAmount, selectedDoc.currency)}
                </span>
              </div>
            </div>

            {selectedDoc.attachments && selectedDoc.attachments.length > 0 && (
              <div className="p-3 bg-secondary/50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium">{selectedDoc.attachments[0].fileName}</div>
                    <div className="text-[10px] text-muted-foreground">Supabase Storage Secure S3</div>
                  </div>
                </div>
                <button
                  onClick={() => alert(`Simulated downloading ${selectedDoc.attachments[0].fileName}`)}
                  className="px-2.5 py-1 bg-background border border-border rounded text-[11px] hover:bg-muted flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover font-medium"
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
