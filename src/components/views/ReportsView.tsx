import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useFinancialMetrics } from '../../hooks/useFinancialMetrics';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  Calendar,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Cpu,
  Layers,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';

type ReportType =
  | 'pnl'
  | 'gst'
  | 'monthly_expense'
  | 'revenue'
  | 'cash_flow'
  | 'ai_infra'
  | 'vendor_wise'
  | 'customer_profitability'
  | 'budget_variance';

export const ReportsView: React.FC = () => {
  const {
    expenses,
    invoices,
    subscriptions,
    customers,
    accounts,
    budgets,
    activeCurrency,
    organization,
  } = useFinance();

  const {
    totalRevenue,
    totalExpenses,
    netProfitLoss,
    aiInfraSpending,
    topVendors,
    categoryBreakdown,
  } = useFinancialMetrics();

  const [activeReport, setActiveReport] = useState<ReportType>('gst');

  const rate = organization.usdToInrRate;

  // Active records
  const validExpenses = expenses.filter((e) => !e.isDeleted);
  const validInvoices = invoices.filter((i) => !i.isDeleted);

  // ---------------- GST Summary Calculations (India GSTR-3B / GSTR-1) ----------------
  // Output GST (collected on customer sales)
  const outputGstTotal = validInvoices.reduce((sum, i) => sum + i.gstAmount, 0);
  const outputTaxableTotal = validInvoices.reduce((sum, i) => sum + i.subtotal, 0);

  // Input GST (paid on vendor purchases)
  const itcEligibleExpenses = validExpenses.filter((e) => e.itcEligible);
  const inputGstTotal = itcEligibleExpenses.reduce((sum, e) => {
    const gstInr = e.currency === 'USD' ? e.gstAmount * rate : e.gstAmount;
    return sum + gstInr;
  }, 0);

  const inputGstBlocked = validExpenses
    .filter((e) => !e.itcEligible)
    .reduce((sum, e) => {
      const gstInr = e.currency === 'USD' ? e.gstAmount * rate : e.gstAmount;
      return sum + gstInr;
    }, 0);

  // Net GST Payable or Net ITC Carry-Forward
  const netGstPayable = outputGstTotal - inputGstTotal;

  // Customer profitability metrics
  const customerProfitability = customers.map((c) => {
    const custInvoices = validInvoices.filter((i) => i.customerId === c.id);
    const revenueInr = custInvoices.reduce((sum, i) => sum + i.subtotal, 0);

    // AI cost attribution (e.g. estimate direct STT + LLM per agent)
    const directAiCostInr = c.agentSeats * 1850; // ₹1,850 avg AI cost per active agent
    const grossMarginInr = revenueInr - directAiCostInr;
    const marginPercent = revenueInr > 0 ? (grossMarginInr / revenueInr) * 100 : 0;

    return {
      id: c.id,
      companyName: c.companyName,
      agentSeats: c.agentSeats,
      revenueInr,
      directAiCostInr,
      grossMarginInr,
      marginPercent,
    };
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: any[][] = [];
    let filename = `Nodzo_${activeReport}_${new Date().toISOString().split('T')[0]}.csv`;

    if (activeReport === 'gst') {
      headers = ['Category', 'Taxable Value (INR)', 'CGST (INR)', 'SGST (INR)', 'IGST (INR)', 'Total Tax (INR)'];
      rows = [
        ['Outward Supplies (Revenue Invoices)', outputTaxableTotal, outputGstTotal / 2, outputGstTotal / 2, 0, outputGstTotal],
        ['Inward Supplies - Eligible ITC (Expenses)', 980000, 0, 0, inputGstTotal, inputGstTotal],
        ['Inward Supplies - Blocked ITC (Section 17(5))', 680000, 0, 0, inputGstBlocked, inputGstBlocked],
        ['Net GST Cash Payable / (Carry-Forward)', 0, 0, 0, 0, netGstPayable],
      ];
    } else if (activeReport === 'pnl') {
      headers = ['Line Item', 'Amount INR', 'Notes'];
      rows = [
        ['Operating Revenue (Excl GST)', totalRevenue, 'Invoiced customer subscriptions & usage'],
        ['Direct AI Pipeline Costs (COGS)', aiInfraSpending, 'Speech-to-text, LLM tokens, GPU compute'],
        ['Gross Profit', totalRevenue - aiInfraSpending, 'Revenue minus direct AI COGS'],
        ['Operating Expenses (SaaS, Salaries, Legal)', totalExpenses - aiInfraSpending, 'Team payroll, rent, CA retainer'],
        ['Net Operating Profit / Loss (EBITDA)', netProfitLoss, 'Clean operational profitability'],
      ];
    } else {
      headers = ['Metric / Entity', 'Value', 'Currency'];
      rows = [
        ['Total Revenue', totalRevenue, activeCurrency],
        ['Total Expenses', totalExpenses, activeCurrency],
        ['Net Profit', netProfitLoss, activeCurrency],
      ];
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/70">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Financial Statements & India Tax Compliance
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit-ready P&L, GSTR-3B input tax credit summaries, customer unit profitability, and exports.
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
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg text-xs font-medium shadow-subtle transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-secondary rounded-lg border border-border text-xs">
        {[
          { id: 'gst', label: 'GST & Tax Summary (India)' },
          { id: 'pnl', label: 'Profit & Loss (P&L)' },
          { id: 'customer_profitability', label: 'Customer Unit Margins' },
          { id: 'vendor_wise', label: 'Vendor-wise Spend' },
          { id: 'budget_variance', label: 'Budget Variance' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReport(tab.id as ReportType)}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeReport === tab.id
                ? 'bg-card text-foreground shadow-subtle font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ----------------- REPORT 1: INDIA GST & TAX MODULE ----------------- */}
      {activeReport === 'gst' && (
        <div className="space-y-4">
          {/* GST Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
            <div className="p-4 bg-card border border-border rounded-xl shadow-subtle">
              <span className="text-[11px] text-muted-foreground">Output GST (Collected)</span>
              <div className="mt-1.5 text-lg font-bold font-mono text-foreground">
                ₹{outputGstTotal.toLocaleString()}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                From customer revenue invoices
              </div>
            </div>

            <div className="p-4 bg-card border border-border rounded-xl shadow-subtle">
              <span className="text-[11px] text-muted-foreground">Input GST Credit (ITC Eligible)</span>
              <div className="mt-1.5 text-lg font-bold font-mono text-primary">
                ₹{inputGstTotal.toLocaleString()}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Claimable against output liability
              </div>
            </div>

            <div className="p-4 bg-card border border-border rounded-xl shadow-subtle">
              <span className="text-[11px] text-muted-foreground">Blocked ITC (Sec 17(5))</span>
              <div className="mt-1.5 text-lg font-bold font-mono text-muted-foreground">
                ₹{inputGstBlocked.toLocaleString()}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Salaries / non-qualifying bills
              </div>
            </div>

            <div className="p-4 bg-card border border-border rounded-xl shadow-subtle">
              <span className="text-[11px] text-muted-foreground">Net GST Cash Payable</span>
              <div
                className={`mt-1.5 text-lg font-bold font-mono ${
                  netGstPayable > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-success'
                }`}
              >
                ₹{netGstPayable > 0 ? netGstPayable.toLocaleString() : '0 (ITC Surplus)'}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Filing due 20th of every month
              </div>
            </div>
          </div>

          {/* GSTR-3B Format Table */}
          <div className="p-5 bg-card border border-border rounded-xl shadow-subtle space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Form GSTR-3B Computation Summary</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Nodzo AI Private Limited • GSTIN: {organization.gstin} • State: Karnataka (29)
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 bg-secondary rounded-lg border border-border">
                Period: November 2026
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-medium font-sans">
                    <th className="py-2.5 px-3">Nature of Supplies</th>
                    <th className="py-2.5 px-3 text-right">Taxable Value</th>
                    <th className="py-2.5 px-3 text-right">Integrated Tax (IGST)</th>
                    <th className="py-2.5 px-3 text-right">Central Tax (CGST)</th>
                    <th className="py-2.5 px-3 text-right">State Tax (SGST)</th>
                    <th className="py-2.5 px-3 text-right">Total Tax</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr className="hover:bg-muted/30">
                    <td className="py-3 px-3 font-sans font-medium text-foreground">
                      3.1 (a) Outward Taxable Supplies (Revenue Invoices)
                    </td>
                    <td className="py-3 px-3 text-right">₹{outputTaxableTotal.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right">₹0</td>
                    <td className="py-3 px-3 text-right">₹{(outputGstTotal / 2).toLocaleString()}</td>
                    <td className="py-3 px-3 text-right">₹{(outputGstTotal / 2).toLocaleString()}</td>
                    <td className="py-3 px-3 text-right font-bold text-foreground">
                      ₹{outputGstTotal.toLocaleString()}
                    </td>
                  </tr>

                  <tr className="hover:bg-muted/30">
                    <td className="py-3 px-3 font-sans font-medium text-primary">
                      4.A (5) All Other Input Tax Credit (ITC - Expenses)
                    </td>
                    <td className="py-3 px-3 text-right">₹1,240,000</td>
                    <td className="py-3 px-3 text-right">₹{inputGstTotal.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right">₹0</td>
                    <td className="py-3 px-3 text-right">₹0</td>
                    <td className="py-3 px-3 text-right font-bold text-primary">
                      ₹{inputGstTotal.toLocaleString()}
                    </td>
                  </tr>

                  <tr className="hover:bg-muted/30">
                    <td className="py-3 px-3 font-sans text-muted-foreground">
                      4.D Ineligible ITC as per Section 17(5)
                    </td>
                    <td className="py-3 px-3 text-right">₹680,000</td>
                    <td className="py-3 px-3 text-right">₹0</td>
                    <td className="py-3 px-3 text-right">₹0</td>
                    <td className="py-3 px-3 text-right">₹0</td>
                    <td className="py-3 px-3 text-right text-muted-foreground">
                      ₹{inputGstBlocked.toLocaleString()}
                    </td>
                  </tr>

                  <tr className="bg-secondary/40 font-bold text-foreground font-sans">
                    <td className="py-3 px-3">
                      5. Net Tax Payable in Cash (Output Tax - Eligible ITC)
                    </td>
                    <td className="py-3 px-3 text-right font-mono">—</td>
                    <td className="py-3 px-3 text-right font-mono">—</td>
                    <td className="py-3 px-3 text-right font-mono">—</td>
                    <td className="py-3 px-3 text-right font-mono">—</td>
                    <td className="py-3 px-3 text-right font-mono text-base text-success">
                      ₹{netGstPayable > 0 ? netGstPayable.toLocaleString() : '0 (Nil Liability)'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- REPORT 2: P&L STATEMENT ----------------- */}
      {activeReport === 'pnl' && (
        <div className="p-6 bg-card border border-border rounded-xl shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Statement of Profit and Loss (P&L)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Nodzo AI Private Limited • Financial Year 2026-27 (April 1 to March 31)
              </p>
            </div>
            <span className="text-xs font-mono text-muted-foreground">All figures in {activeCurrency}</span>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Revenue Section */}
            <div>
              <div className="font-sans font-bold text-foreground text-sm pb-1 border-b border-border flex justify-between">
                <span>I. REVENUE FROM OPERATIONS</span>
                <span>{formatCurrency(totalRevenue, activeCurrency)}</span>
              </div>
              <div className="py-2 space-y-1.5 pl-4 text-muted-foreground font-sans">
                <div className="flex justify-between">
                  <span>SaaS Subscription Licenses (Recurring MRR Contracts)</span>
                  <span className="font-mono">{formatCurrency(totalRevenue * 0.88, activeCurrency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>AI Usage Charges & Overage Billing</span>
                  <span className="font-mono">{formatCurrency(totalRevenue * 0.12, activeCurrency)}</span>
                </div>
              </div>
            </div>

            {/* Direct COGS Section */}
            <div>
              <div className="font-sans font-bold text-foreground text-sm pb-1 border-b border-border flex justify-between">
                <span>II. DIRECT OPERATING EXPENSES (COGS)</span>
                <span>{formatCurrency(aiInfraSpending, activeCurrency)}</span>
              </div>
              <div className="py-2 space-y-1.5 pl-4 text-muted-foreground font-sans">
                <div className="flex justify-between">
                  <span>Speech-to-Text Transcription (Deepgram Nova-2 / Whisper)</span>
                  <span className="font-mono">{formatCurrency(aiInfraSpending * 0.42, activeCurrency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>LLM Sentiment & Objection Analysis (OpenAI / Claude / Gemini)</span>
                  <span className="font-mono">{formatCurrency(aiInfraSpending * 0.38, activeCurrency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GPU Compute Clusters (Modal Labs A10G)</span>
                  <span className="font-mono">{formatCurrency(aiInfraSpending * 0.20, activeCurrency)}</span>
                </div>
              </div>
            </div>

            {/* Gross Profit */}
            <div className="p-3 bg-secondary/50 rounded-lg flex items-center justify-between font-sans font-bold text-foreground text-sm">
              <span>III. GROSS PROFIT (I - II)</span>
              <span className="font-mono text-success">
                {formatCurrency(totalRevenue - aiInfraSpending, activeCurrency)} (
                {totalRevenue > 0 ? (((totalRevenue - aiInfraSpending) / totalRevenue) * 100).toFixed(1) : 0}%)
              </span>
            </div>

            {/* Operating Expenses (OPEX) */}
            <div>
              <div className="font-sans font-bold text-foreground text-sm pb-1 border-b border-border flex justify-between">
                <span>IV. OPERATING EXPENSES (OPEX)</span>
                <span>{formatCurrency(totalExpenses - aiInfraSpending, activeCurrency)}</span>
              </div>
              <div className="py-2 space-y-1.5 pl-4 text-muted-foreground font-sans">
                <div className="flex justify-between">
                  <span>Core Engineering & Leadership Salaries</span>
                  <span className="font-mono">
                    {formatCurrency(680000 / (activeCurrency === 'USD' ? rate : 1), activeCurrency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Office Desks & Coworking Rent</span>
                  <span className="font-mono">
                    {formatCurrency(70800 / (activeCurrency === 'USD' ? rate : 1), activeCurrency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Marketing, LinkedIn Sponsored B2B Ads</span>
                  <span className="font-mono">
                    {formatCurrency(110000 / (activeCurrency === 'USD' ? rate : 1), activeCurrency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Legal, Audit & CA Retainers</span>
                  <span className="font-mono">
                    {formatCurrency(35400 / (activeCurrency === 'USD' ? rate : 1), activeCurrency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Developer Tooling (Cursor, GitHub, Lovable)</span>
                  <span className="font-mono">
                    {formatCurrency(33800 / (activeCurrency === 'USD' ? rate : 1), activeCurrency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Net Operating Profit */}
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between font-sans font-bold text-foreground text-base">
              <span>V. NET OPERATING PROFIT / LOSS (EBITDA)</span>
              <span className="font-mono text-primary">{formatCurrency(netProfitLoss, activeCurrency)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- REPORT 3: CUSTOMER UNIT MARGINS ----------------- */}
      {activeReport === 'customer_profitability' && (
        <div className="p-5 bg-card border border-border rounded-xl shadow-subtle space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Customer Unit Economics & Contribution Margins
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Allocates shared AI infrastructure compute across customer accounts based on active seats.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-medium">
                  <th className="py-2.5 px-3">Customer Company</th>
                  <th className="py-2.5 px-3 text-right">Agent Seats</th>
                  <th className="py-2.5 px-3 text-right">Invoiced Revenue</th>
                  <th className="py-2.5 px-3 text-right">Direct AI Processing Cost</th>
                  <th className="py-2.5 px-3 text-right">Gross Profit</th>
                  <th className="py-2.5 px-3 text-right">Gross Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-mono">
                {customerProfitability.map((cust) => (
                  <tr key={cust.id} className="hover:bg-muted/30">
                    <td className="py-3 px-3 font-sans font-semibold text-foreground">
                      {cust.companyName}
                    </td>
                    <td className="py-3 px-3 text-right text-muted-foreground">{cust.agentSeats}</td>
                    <td className="py-3 px-3 text-right text-foreground font-semibold">
                      ₹{cust.revenueInr.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-muted-foreground">
                      ₹{cust.directAiCostInr.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-success font-semibold">
                      ₹{cust.grossMarginInr.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-success font-bold">
                      {cust.marginPercent.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- REPORT 4: VENDOR-WISE SPEND ----------------- */}
      {activeReport === 'vendor_wise' && (
        <div className="p-5 bg-card border border-border rounded-xl shadow-subtle space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Vendor-wise Expenditure Report</h2>
              <p className="text-xs text-muted-foreground">Aggregated spending ranked by volume</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-medium">
                  <th className="py-2.5 px-3">Vendor / Merchant</th>
                  <th className="py-2.5 px-3">Primary Category</th>
                  <th className="py-2.5 px-3 text-right">Total Invoices</th>
                  <th className="py-2.5 px-3 text-right">Total Paid Out</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {topVendors.map((v) => (
                  <tr key={v.vendor} className="hover:bg-muted/30">
                    <td className="py-3 px-3 font-medium text-foreground">{v.vendor}</td>
                    <td className="py-3 px-3 text-muted-foreground">{v.category}</td>
                    <td className="py-3 px-3 text-right font-mono text-muted-foreground">{v.count}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                      {formatCurrency(v.amount, activeCurrency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- REPORT 5: BUDGET VARIANCE ----------------- */}
      {activeReport === 'budget_variance' && (
        <div className="p-5 bg-card border border-border rounded-xl shadow-subtle space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Monthly Budget Variance Report</h2>
              <p className="text-xs text-muted-foreground">Actual vs Plan variance analysis</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-medium">
                  <th className="py-2.5 px-3">Department Category</th>
                  <th className="py-2.5 px-3 text-right">Budget Limit</th>
                  <th className="py-2.5 px-3 text-right">Actual Spend</th>
                  <th className="py-2.5 px-3 text-right">Variance (INR)</th>
                  <th className="py-2.5 px-3 text-right">Utilization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-mono">
                {budgets.map((b) => {
                  const actual = expenses
                    .filter((e) => !e.isDeleted && e.category === b.category)
                    .reduce((s, e) => s + e.totalAmountInr, 0);
                  const variance = b.budgetAmount - actual;
                  const util = (actual / b.budgetAmount) * 100;

                  return (
                    <tr key={b.id} className="hover:bg-muted/30">
                      <td className="py-3 px-3 font-sans font-medium text-foreground">{b.category}</td>
                      <td className="py-3 px-3 text-right">₹{b.budgetAmount.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-foreground font-semibold">
                        ₹{actual.toLocaleString()}
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-bold ${
                          variance >= 0 ? 'text-success' : 'text-destructive'
                        }`}
                      >
                        {variance >= 0 ? `+₹${variance.toLocaleString()}` : `-₹${Math.abs(variance).toLocaleString()}`}
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-bold ${
                          util > 100 ? 'text-destructive' : util > 80 ? 'text-amber-500' : 'text-success'
                        }`}
                      >
                        {util.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
