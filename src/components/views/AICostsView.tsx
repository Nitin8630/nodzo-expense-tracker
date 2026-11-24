import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useFinancialMetrics } from '../../hooks/useFinancialMetrics';
import {
  Cpu,
  Plus,
  TrendingUp,
  Clock,
  PhoneCall,
  Percent,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Download,
  Upload,
  ArrowRight,
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface AICostsViewProps {
  onOpenAddAIUsage: () => void;
}

export const AICostsView: React.FC<AICostsViewProps> = ({ onOpenAddAIUsage }) => {
  const {
    aiUsage,
    aiProviderInvoices,
    reconcileAIInvoice,
    activeCurrency,
    organization,
  } = useFinance();

  const { aiMetrics } = useFinancialMetrics();
  const [selectedProvider, setSelectedProvider] = useState<string>('all');

  const filteredUsage = aiUsage.filter((u) => {
    return selectedProvider === 'all' || u.provider === selectedProvider;
  });

  // Breakdown by provider
  const providerData = React.useMemo(() => {
    const map = new Map<string, number>();
    aiUsage.forEach((u) => {
      const cur = map.get(u.provider) || 0;
      map.set(u.provider, cur + (activeCurrency === 'INR' ? u.estimatedCostInr : u.estimatedCostUsd));
    });
    return Array.from(map.entries()).map(([name, value]) => ({
      name,
      value: Math.round(value),
    }));
  }, [aiUsage, activeCurrency]);

  const COLORS = ['#6366f1', '#0ea5e9', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/70">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            AI Operating Cost Analytics
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time inference costs, STT unit economics, and vendor invoice reconciliation for Nodzo AI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddAIUsage}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg text-xs font-medium shadow-subtle transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Log AI Usage</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: The 7 Core Nodzo AI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* 1. Calls Processed */}
        <div className="p-3.5 bg-card border border-border rounded-xl shadow-subtle">
          <div className="text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Calls Processed</span>
            <PhoneCall className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="mt-1.5 text-base font-bold font-mono text-foreground">
            {aiMetrics.totalCalls.toLocaleString()}
          </div>
          <div className="text-[10px] text-muted-foreground">Audio sales calls</div>
        </div>

        {/* 2. Audio Minutes */}
        <div className="p-3.5 bg-card border border-border rounded-xl shadow-subtle">
          <div className="text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Audio Minutes</span>
            <Clock className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="mt-1.5 text-base font-bold font-mono text-foreground">
            {aiMetrics.totalMinutes.toLocaleString()} min
          </div>
          <div className="text-[10px] text-muted-foreground">Transcribed & scored</div>
        </div>

        {/* 3. Avg Cost / Call */}
        <div className="p-3.5 bg-card border border-border rounded-xl shadow-subtle">
          <div className="text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Cost / Call</span>
            <Cpu className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="mt-1.5 text-base font-bold font-mono text-foreground">
            {formatCurrency(aiMetrics.avgCostPerCall, activeCurrency)}
          </div>
          <div className="text-[10px] text-muted-foreground">Blended AI inference</div>
        </div>

        {/* 4. Avg Cost / Min */}
        <div className="p-3.5 bg-card border border-border rounded-xl shadow-subtle">
          <div className="text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Cost / Min</span>
            <Clock className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="mt-1.5 text-base font-bold font-mono text-foreground">
            {formatCurrency(aiMetrics.avgCostPerMinute, activeCurrency)}
          </div>
          <div className="text-[10px] text-muted-foreground">STT + LLM pipeline</div>
        </div>

        {/* 5. Revenue / Min */}
        <div className="p-3.5 bg-card border border-border rounded-xl shadow-subtle">
          <div className="text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Revenue / Min</span>
            <TrendingUp className="w-3.5 h-3.5 text-success" />
          </div>
          <div className="mt-1.5 text-base font-bold font-mono text-success">
            {formatCurrency(aiMetrics.revenuePerMinute, activeCurrency)}
          </div>
          <div className="text-[10px] text-muted-foreground">Customer price yield</div>
        </div>

        {/* 6. Gross Margin / Min */}
        <div className="p-3.5 bg-card border border-border rounded-xl shadow-subtle">
          <div className="text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Margin / Min</span>
            <Percent className="w-3.5 h-3.5 text-success" />
          </div>
          <div className="mt-1.5 text-base font-bold font-mono text-success">
            {formatCurrency(aiMetrics.grossMarginPerMinute, activeCurrency)}
          </div>
          <div className="text-[10px] text-muted-foreground">Unit profit per minute</div>
        </div>

        {/* 7. Gross Margin % */}
        <div className="p-3.5 bg-card border border-border rounded-xl shadow-subtle">
          <div className="text-[11px] text-muted-foreground flex items-center justify-between">
            <span>AI Gross Margin</span>
            <Percent className="w-3.5 h-3.5 text-success" />
          </div>
          <div className="mt-1.5 text-base font-bold font-mono text-success">
            {aiMetrics.grossMarginPercent.toFixed(1)}%
          </div>
          <div className="text-[10px] text-muted-foreground">SaaS margin target &gt;75%</div>
        </div>
      </div>

      {/* Row 2: Charts (Provider Spend & Service Type Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 p-5 bg-card border border-border rounded-xl shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">AI Cost by Provider</h2>
              <p className="text-xs text-muted-foreground">
                Breakdown between OpenAI, Deepgram STT, Modal GPU, Anthropic & Gemini
              </p>
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={providerData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(v) => formatCurrency(v, activeCurrency, { compact: true, showSymbol: false })}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(val, activeCurrency), 'Cost']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Provider Donut */}
        <div className="p-5 bg-card border border-border rounded-xl shadow-subtle flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Provider Share</h2>
            <p className="text-xs text-muted-foreground">Relative spend percentage</p>
          </div>
          <div className="h-44 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={providerData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {providerData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [formatCurrency(val, activeCurrency), 'Amount']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1 pt-2 border-t border-border/60 text-xs">
            {providerData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span>{item.name}</span>
                </span>
                <span className="font-mono text-foreground font-medium">
                  {formatCurrency(item.value, activeCurrency, { compact: true })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reconciliation Module: Vendor Bills vs Internal Usage Logs */}
      <div className="p-5 bg-card border border-border rounded-xl shadow-subtle space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">
                AI Provider Invoice Reconciliation Hub
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Crucial: Reconciles actual vendor invoices with internal usage estimates to prevent double-counting.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-medium">
                <th className="py-2.5 px-3">Provider</th>
                <th className="py-2.5 px-3">Bill / Invoice #</th>
                <th className="py-2.5 px-3">Billing Period</th>
                <th className="py-2.5 px-3 text-right">Invoiced Amount</th>
                <th className="py-2.5 px-3 text-right">Estimated Internal Logs</th>
                <th className="py-2.5 px-3 text-right">Variance</th>
                <th className="py-2.5 px-3 text-center">Reconciliation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-mono">
              {aiProviderInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/30">
                  <td className="py-2.5 px-3 font-sans font-medium text-foreground">{inv.provider}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{inv.invoiceNumber}</td>
                  <td className="py-2.5 px-3 text-muted-foreground text-[11px] font-sans">
                    {inv.periodStart} to {inv.periodEnd}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-foreground">
                    ${inv.invoicedAmountUsd.toLocaleString()} (₹{inv.invoicedAmountInr.toLocaleString()})
                  </td>
                  <td className="py-2.5 px-3 text-right text-muted-foreground">
                    ₹{inv.estimatedUsageCostInr.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right text-success">
                    +₹{inv.varianceAmountInr.toLocaleString()} (
                    {((inv.varianceAmountInr / inv.invoicedAmountInr) * 100).toFixed(1)}%)
                  </td>
                  <td className="py-2.5 px-3 text-center font-sans">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-success/10 text-success">
                      <CheckCircle2 className="w-3 h-3" /> Reconciled
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Operational Usage Logs Table */}
      <div className="bg-card border border-border rounded-xl shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Operational Call Logging Pipeline</h2>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="px-2.5 py-1 bg-background border border-border rounded-lg text-xs"
          >
            <option value="all">All Providers</option>
            <option value="OpenAI">OpenAI</option>
            <option value="Deepgram">Deepgram</option>
            <option value="Modal">Modal GPU</option>
            <option value="Anthropic">Anthropic</option>
            <option value="Gemini">Gemini</option>
            <option value="Supabase">Supabase</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-muted-foreground font-medium">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Provider & Model</th>
                <th className="py-2.5 px-3">Service Type</th>
                <th className="py-2.5 px-3">Customer Attribution</th>
                <th className="py-2.5 px-3 text-right">Calls</th>
                <th className="py-2.5 px-3 text-right">Audio Minutes</th>
                <th className="py-2.5 px-3 text-right">Estimated Cost</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredUsage.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30">
                  <td className="py-3 px-3 text-muted-foreground">{u.date}</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-foreground">{u.provider}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{u.model}</div>
                  </td>
                  <td className="py-3 px-3 capitalize text-muted-foreground">
                    {u.serviceType.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3 px-3">
                    {u.customerName ? (
                      <span className="text-foreground font-medium">{u.customerName}</span>
                    ) : (
                      <span className="text-muted-foreground/60 italic">Platform Shared</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    {u.callsCount ? u.callsCount.toLocaleString() : '—'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    {u.audioMinutes ? `${u.audioMinutes.toLocaleString()} min` : '—'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                    ${u.estimatedCostUsd.toFixed(2)}
                    <span className="text-muted-foreground text-[10px] font-normal ml-1">
                      (₹{u.estimatedCostInr.toLocaleString()})
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        u.isReconciled
                          ? 'bg-success/10 text-success'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {u.isReconciled ? 'Reconciled' : 'Unbilled Estimate'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
