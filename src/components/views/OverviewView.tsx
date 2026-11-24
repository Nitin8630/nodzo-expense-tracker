import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useFinancialMetrics } from '../../hooks/useFinancialMetrics';
import { DateFilterType } from '../../types/finance';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Cpu,
  Wallet,
  Calendar,
  AlertCircle,
  Clock,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';

export const OverviewView: React.FC = () => {
  const {
    dateFilter,
    setDateFilter,
    customDateRange,
    setCustomDateRange,
    activeCurrency,
    seedDemoData,
    expenses,
  } = useFinance();

  const {
    totalExpenses,
    expensesMoM,
    totalRevenue,
    revenueMoM,
    netProfitLoss,
    monthlyCashBurn,
    availableCashBalance,
    outstandingPayments,
    upcomingBills,
    aiInfraSpending,
    mrr,
    arr,
    cashRunwayMonths,
    categoryBreakdown,
    topVendors,
    monthlyTrendData,
    cashFlowForecast,
  } = useFinancialMetrics();

  const dateFilterButtons: { id: DateFilterType; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: 'this_month', label: 'This Month' },
    { id: 'last_month', label: 'Last Month' },
    { id: 'quarter', label: 'Q3 FY26' },
    { id: 'fy', label: 'FY 2026-27' },
  ];

  const COLORS = ['#6366f1', '#0ea5e9', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];

  const isEmpty = expenses.filter((e) => !e.isDeleted).length === 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Date Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/70">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Financial Executive Overview
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time cash flow, AI operating burn, MRR, and India FY profitability for Nodzo AI.
          </p>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-secondary rounded-lg border border-border text-xs">
          {dateFilterButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setDateFilter(btn.id)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                dateFilter === btn.id
                  ? 'bg-card text-foreground shadow-subtle'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {isEmpty && (
        <div className="p-6 bg-card border border-border rounded-xl text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-sm">Clean Production State</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            There are currently no financial records recorded in this system. You can start by adding real expenses or load sample Nodzo SaaS data for demonstration.
          </p>
          <button
            onClick={seedDemoData}
            className="px-4 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary-hover shadow-subtle transition-colors"
          >
            Load Sample Nodzo SaaS Data
          </button>
        </div>
      )}

      {/* 10 KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* 1. Total Expenses */}
        <div className="p-4 bg-card border border-border rounded-xl shadow-subtle">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Expenses</span>
            <Receipt className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-2 text-lg font-bold font-mono text-foreground">
            {formatCurrency(totalExpenses, activeCurrency, { compact: true })}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px]">
            {expensesMoM >= 0 ? (
              <span className="text-amber-500 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" />+{expensesMoM.toFixed(1)}%
              </span>
            ) : (
              <span className="text-success flex items-center">
                <ArrowDownRight className="w-3.5 h-3.5" />{expensesMoM.toFixed(1)}%
              </span>
            )}
            <span className="text-muted-foreground">vs prev month</span>
          </div>
        </div>

        {/* 2. Total Revenue */}
        <div className="p-4 bg-card border border-border rounded-xl shadow-subtle">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Revenue</span>
            <DollarSign className="w-4 h-4 text-success" />
          </div>
          <div className="mt-2 text-lg font-bold font-mono text-foreground">
            {formatCurrency(totalRevenue, activeCurrency, { compact: true })}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px]">
            <span className="text-success flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />+{revenueMoM.toFixed(1)}%
            </span>
            <span className="text-muted-foreground">vs prev month</span>
          </div>
        </div>

        {/* 3. Net Profit / Loss */}
        <div className="p-4 bg-card border border-border rounded-xl shadow-subtle">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Net Profit</span>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div
            className={`mt-2 text-lg font-bold font-mono ${
              netProfitLoss >= 0 ? 'text-success' : 'text-destructive'
            }`}
          >
            {formatCurrency(netProfitLoss, activeCurrency, { compact: true })}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground font-mono">
            Margin: {totalRevenue > 0 ? ((netProfitLoss / totalRevenue) * 100).toFixed(1) : 0}%
          </div>
        </div>

        {/* 4. Monthly Cash Burn */}
        <div className="p-4 bg-card border border-border rounded-xl shadow-subtle">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Cash Burn</span>
            <Clock className="w-4 h-4 text-warning" />
          </div>
          <div className="mt-2 text-lg font-bold font-mono text-foreground">
            {formatCurrency(monthlyCashBurn, activeCurrency, { compact: true })}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">Actual cash outflow</div>
        </div>

        {/* 5. Available Cash Balance */}
        <div className="p-4 bg-card border border-border rounded-xl shadow-subtle">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Cash In Bank</span>
            <Wallet className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-2 text-lg font-bold font-mono text-foreground">
            {formatCurrency(availableCashBalance, activeCurrency, { compact: true })}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">Across 5 accounts</div>
        </div>

        {/* 6. Outstanding Receivables */}
        <div className="p-4 bg-card border border-border rounded-xl shadow-subtle">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Receivables</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-lg font-bold font-mono text-foreground">
            {formatCurrency(outstandingPayments, activeCurrency, { compact: true })}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">Pending customer bills</div>
        </div>

        {/* 7. Upcoming Bills */}
        <div className="p-4 bg-card border border-border rounded-xl shadow-subtle">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Upcoming Bills</span>
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-2 text-lg font-bold font-mono text-foreground">
            {formatCurrency(upcomingBills, activeCurrency, { compact: true })}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">Due next 30 days</div>
        </div>

        {/* 8. AI Infrastructure Spend */}
        <div className="p-4 bg-card border border-border rounded-xl shadow-subtle">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>AI Infra Spend</span>
            <Cpu className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-2 text-lg font-bold font-mono text-foreground">
            {formatCurrency(aiInfraSpending, activeCurrency, { compact: true })}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {totalExpenses > 0 ? ((aiInfraSpending / totalExpenses) * 100).toFixed(0) : 0}% of opex
          </div>
        </div>

        {/* 9. MRR (Contractual) */}
        <div className="p-4 bg-card border border-border rounded-xl shadow-subtle">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Contract MRR</span>
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <div className="mt-2 text-lg font-bold font-mono text-foreground">
            {formatCurrency(mrr, activeCurrency, { compact: true })}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            ARR: {formatCurrency(arr, activeCurrency, { compact: true })}
          </div>
        </div>

        {/* 10. Cash Runway */}
        <div className="p-4 bg-card border border-border rounded-xl shadow-subtle">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Cash Runway</span>
            <PiggyBank className="w-4 h-4 text-success" />
          </div>
          <div className="mt-2 text-lg font-bold font-mono text-foreground">
            {cashRunwayMonths >= 999 ? 'Profitable' : `${cashRunwayMonths.toFixed(1)} mos`}
          </div>
          <div className="mt-1 text-[11px] text-success">Positive operational flow</div>
        </div>
      </div>

      {/* Row 1 Charts: Revenue vs Expenses & Expense Breakdown Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart 1: Revenue vs Expenses Monthly Bar */}
        <div className="lg:col-span-2 p-5 bg-card border border-border rounded-xl shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Revenue vs Expenses (6 Months)</h2>
              <p className="text-xs text-muted-foreground">Operating revenue vs total cash expenses</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-sm bg-success inline-block"></span>
                <span>Revenue</span>
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-sm bg-primary inline-block"></span>
                <span>Expenses</span>
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendData} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(v) => formatCurrency(v, activeCurrency, { compact: true, showSymbol: false })}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(val, activeCurrency), '']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Expense Breakdown Donut */}
        <div className="p-5 bg-card border border-border rounded-xl shadow-subtle flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Expense Category Breakdown</h2>
            <p className="text-xs text-muted-foreground">Distribution across core operations</p>
          </div>
          <div className="h-56 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [formatCurrency(val, activeCurrency), 'Amount']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-border/60 text-xs">
            {categoryBreakdown.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground truncate">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="truncate">{item.name}</span>
                </span>
                <span className="font-mono text-foreground font-medium">
                  {formatCurrency(item.value, activeCurrency, { compact: true })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2 Charts: Profit/Loss Trend & AI Infrastructure Cost Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 3: Profit/Loss Trend Area/Line */}
        <div className="p-5 bg-card border border-border rounded-xl shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Net Profit & EBITDA Trend</h2>
              <p className="text-xs text-muted-foreground">Net monthly trajectory</p>
            </div>
            <div className="text-xs font-mono text-success font-semibold">
              Current: {formatCurrency(netProfitLoss, activeCurrency)}
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData}>
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(v) => formatCurrency(v, activeCurrency, { compact: true, showSymbol: false })}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(val, activeCurrency), 'Profit']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#profitGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: AI Infrastructure Cost Trend */}
        <div className="p-5 bg-card border border-border rounded-xl shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">AI Infrastructure Cost Trend</h2>
              <p className="text-xs text-muted-foreground">OpenAI, Deepgram STT, Modal GPU & Vector DB</p>
            </div>
            <div className="text-xs font-mono text-primary font-semibold">
              Current: {formatCurrency(aiInfraSpending, activeCurrency)}
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(v) => formatCurrency(v, activeCurrency, { compact: true, showSymbol: false })}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(val, activeCurrency), 'AI Costs']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="aiCost"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#6366f1' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Cash Flow Forecast & Top 10 Expense Vendors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 5: Cash Flow Forecast */}
        <div className="p-5 bg-card border border-border rounded-xl shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Cash Flow Forecast (3 Months Forward)</h2>
              <p className="text-xs text-muted-foreground">Actual cash + projection based on MRR contracts</p>
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashFlowForecast}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(v) => formatCurrency(v, activeCurrency, { compact: true, showSymbol: false })}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(val, activeCurrency), 'Balance']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="actualBalance"
                  name="Actual Balance"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="forecastBalance"
                  name="Projected Runway"
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 10 Expense Vendors Table */}
        <div className="p-5 bg-card border border-border rounded-xl shadow-subtle flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Top Operational Vendors</h2>
            <p className="text-xs text-muted-foreground">Highest expenditure partners in current period</p>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/80 text-muted-foreground text-[11px]">
                  <th className="pb-2 font-medium">Vendor</th>
                  <th className="pb-2 font-medium">Category</th>
                  <th className="pb-2 font-medium text-right">Bills</th>
                  <th className="pb-2 font-medium text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono">
                {topVendors.slice(0, 6).map((v) => (
                  <tr key={v.vendor} className="hover:bg-muted/40 transition-colors">
                    <td className="py-2.5 font-sans font-medium text-foreground">{v.vendor}</td>
                    <td className="py-2.5 font-sans text-muted-foreground text-[11px]">{v.category}</td>
                    <td className="py-2.5 text-right text-muted-foreground">{v.count}</td>
                    <td className="py-2.5 text-right font-semibold text-foreground">
                      {formatCurrency(v.amount, activeCurrency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
