import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { X, Sparkles, Upload, FileText, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface ReceiptExtractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtracted: (extractedData: any) => void;
}

export const ReceiptExtractorModal: React.FC<ReceiptExtractorModalProps> = ({ isOpen, onClose, onExtracted }) => {
  const { expenses } = useFinance();
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractionResult, setExtractionResult] = useState<any | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      simulateAiExtraction(selected.name);
    }
  };

  const simulateAiExtraction = (filename: string) => {
    setIsAnalyzing(true);
    setExtractionResult(null);
    setDuplicateWarning(null);

    setTimeout(() => {
      let mockResult = {
        title: 'OpenAI Platform Usage Invoice',
        vendor: 'OpenAI, L.L.C.',
        vendorGstin: '',
        invoiceNumber: 'INV-OAI-' + Math.floor(10000 + Math.random() * 90000),
        expenseDate: new Date().toISOString().split('T')[0],
        amount: 850.00,
        currency: 'USD',
        gstPercentage: 18,
        category: 'AI & Infrastructure',
        subcategory: 'OpenAI API',
        paymentStatus: 'paid',
        confidenceScore: 98,
      };

      if (filename.toLowerCase().includes('modal')) {
        mockResult = {
          title: 'Modal Labs GPU Compute Bill',
          vendor: 'Modal Labs Inc.',
          vendorGstin: '',
          invoiceNumber: 'MDL-2026-' + Math.floor(100 + Math.random() * 900),
          expenseDate: new Date().toISOString().split('T')[0],
          amount: 640.00,
          currency: 'USD',
          gstPercentage: 18,
          category: 'AI & Infrastructure',
          subcategory: 'Modal GPU',
          paymentStatus: 'paid',
          confidenceScore: 99,
        };
      } else if (filename.toLowerCase().includes('gst') || filename.toLowerCase().includes('ca')) {
        mockResult = {
          title: 'Shanker Associates CA Retainer Fee',
          vendor: 'Shanker Associates LLP',
          vendorGstin: '29AAAFS8832H1Z2',
          invoiceNumber: 'SA-2026-' + Math.floor(10 + Math.random() * 90),
          expenseDate: new Date().toISOString().split('T')[0],
          amount: 35400.00,
          currency: 'INR',
          gstPercentage: 18,
          category: 'Legal & Compliance',
          subcategory: 'CA fees',
          paymentStatus: 'paid',
          confidenceScore: 96,
        };
      }

      // Check duplicates
      const exists = expenses.find(
        (e) =>
          !e.isDeleted &&
          e.vendor.toLowerCase() === mockResult.vendor.toLowerCase() &&
          e.invoiceNumber?.toLowerCase() === mockResult.invoiceNumber.toLowerCase()
      );
      if (exists) {
        setDuplicateWarning(`Invoice #${mockResult.invoiceNumber} from ${mockResult.vendor} was already recorded!`);
      }

      setExtractionResult(mockResult);
      setIsAnalyzing(false);
    }, 1200);
  };

  const handleConfirmAndProceed = () => {
    if (extractionResult) {
      onExtracted(extractionResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-card border border-border rounded-xl shadow-2xl p-6 text-foreground my-8">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">AI Receipt & Invoice Scanner</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Upload PDF or image receipts to auto-extract vendor, amounts, GST, and category.
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

        {/* Upload Zone */}
        {!file && (
          <div className="mt-5 border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors bg-secondary/20">
            <input
              type="file"
              id="receipt-file-input"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="receipt-file-input" className="cursor-pointer flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">Click to upload invoice or drag & drop</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG files up to 15MB</p>
            </label>
          </div>
        )}

        {/* Analyzing Animation */}
        {isAnalyzing && (
          <div className="mt-6 py-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <div className="text-sm font-medium text-foreground">Analyzing receipt with Nodzo OCR...</div>
            <p className="text-xs text-muted-foreground">Extracting vendor, tax breakdown, and checking for duplicate bills...</p>
          </div>
        )}

        {/* Extracted Confirmation Card */}
        {extractionResult && !isAnalyzing && (
          <div className="mt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-success/10 border border-success/30 rounded-lg text-success">
              <span className="flex items-center gap-1.5 font-medium">
                <Check className="w-4 h-4" /> Receipt parsed successfully with {extractionResult.confidenceScore}% confidence
              </span>
              <button
                onClick={() => {
                  setFile(null);
                  setExtractionResult(null);
                }}
                className="text-[11px] underline hover:text-foreground"
              >
                Scan Another
              </button>
            </div>

            {duplicateWarning && (
              <div className="p-2.5 bg-warning/10 border border-warning/30 rounded-lg text-warning flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{duplicateWarning}</span>
              </div>
            )}

            <div className="p-4 bg-muted/30 border border-border rounded-lg space-y-2.5">
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Identified Vendor:</span>
                <span className="font-semibold text-foreground">{extractionResult.vendor}</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Invoice Number:</span>
                <span className="font-mono font-medium text-foreground">{extractionResult.invoiceNumber}</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Date of Issue:</span>
                <span className="font-medium text-foreground">{extractionResult.expenseDate}</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Suggested Category:</span>
                <span className="font-medium text-primary">{extractionResult.category} › {extractionResult.subcategory}</span>
              </div>
              <div className="flex justify-between items-center pt-1 font-semibold text-foreground text-sm">
                <span>Extracted Total:</span>
                <span className="text-primary font-mono">
                  {extractionResult.currency === 'USD' ? '$' : '₹'}{extractionResult.amount.toLocaleString()} {extractionResult.currency}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground italic">
              * Please review and confirm the extracted values in the expense form before recording into books.
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAndProceed}
                className="px-5 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover font-medium shadow-subtle flex items-center gap-1.5 transition-colors"
              >
                <span>Confirm & Populate Expense</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
