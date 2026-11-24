import { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { convertCurrency } from '../lib/utils';
import { Expense, RevenueInvoice } from '../types/finance';

export function useFinancialMetrics() {
  const {
    expenses,
    invoices,
    subscriptions,
    accounts,
    aiUsage,
    budgets,
    activeCurrency,
    dateFilter,
    customDateRange,
    organization,
  } = useFinance();

  const rate = organization.usdToInrRate || 84.50;

  // Convert an INR amount to current view currency
  const toActiveCurrency = (inrAmount: number) => {
    if (activeCurrency === 'INR') return inrAmount;
    return inrAmount / rate;
  };

  // Date range filter resolution
  const { startDate, endDate, prevStartDate, prevEndDate } = useMemo(() => {
    // Current reference date: Nov 2026 (or today)
    const now = new Date('2026-11-17T00:00:00');
    let start = new Date(now);
    let end = new Date(now);
    let prevStart = new Date(now);
    let prevEnd = new Date(now);

    switch (dateFilter) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        prevStart.setDate(start.getDate() - 1);
        prevEnd.setDate(end.getDate() - 1);
        break;
      case '7d':
        start.setDate(now.getDate() - 7);
        prevStart.setDate(start.getDate() - 7);
        prevEnd.setDate(start.getDate());
        break;
      case '30d':
        start.setDate(now.getDate() - 30);
        prevStart.setDate(start.getDate() - 30);
        prevEnd.setDate(start.getDate());
        break;
      case 'this_month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        break;
      case 'last_month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        prevStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        prevEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59);
        break;
      case 'quarter':
        // Indian FY Q3: Oct 1 to Dec 31
        start = new Date(2026, 9, 1);
        end = new Date(2026, 11, 31, 23, 59, 59);
        prevStart = new Date(2026, 6, 1);
        prevEnd = new Date(2026, 8, 30, 23, 59, 59);
        break;
      case 'fy':
        // Indian FY: April 1, 2026 to March 31, 2027
        start = new Date(2026, 3, 1);
        end = new Date(2027, 2, 31, 23, 59, 59);
        prevStart = new Date(2025, 3, 1);
        prevEnd = new Date(2026, 2, 31, 23, 59, 59);
        break;
      case 'custom':
        start = new Date(customDateRange.from);
        end = new Date(customDateRange.to);
        const duration = end.getTime() - start.getTime();
        prevEnd = new Date(start.getTime() - 1);
        prevStart = new Date(prevEnd.getTime() - duration);
        break;
    }

    return { startDate: start, endDate: end, prevStartDate: prevStart, prevEndDate: prevEnd };
  }, [dateFilter, customDateRange]);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (e.isDeleted) return false;
      const d = new Date(e.expenseDate);
      return d >= startDate && d <= endDate;
    });
  }, [expenses, startDate, endDate]);

  const prevExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (e.isDeleted) return false;
      const d = new Date(e.expenseDate);
      return d >= prevStartDate && d <= prevEndDate;
    });
  }, [expenses, prevStartDate, prevEndDate]);

  // Filtered revenue invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((i) => {
      if (i.isDeleted) return false;
      const d = new Date(i.invoiceDate);
      return d >= startDate && d <= endDate;
    });
  }, [invoices, startDate, endDate]);

  const prevInvoices = useMemo(() => {
    return invoices.filter((i) => {
      if (i.isDeleted) return false;
      const d = new Date(i.invoiceDate);
      return d >= prevStartDate && d <= prevEndDate;
    });
  }, [invoices, prevStartDate, prevEndDate]);

  // 1. Total expenses (excluding GST for true cost, or gross)
  const totalExpensesInr = filteredExpenses.reduce((sum, e) => sum + e.totalAmountInr, 0);
  const prevExpensesInr = prevExpenses.reduce((sum, e) => sum + e.totalAmountInr, 0);
  const expensesMoM = prevExpensesInr === 0 ? 0 : ((totalExpensesInr - prevExpensesInr) / prevExpensesInr) * 100;

  // 2. Total revenue (Operating revenue = Subtotal without GST collected)
  const totalInvoicedRevenueInr = filteredInvoices.reduce((sum, i) => sum + i.subtotal, 0);
  const prevInvoicedRevenueInr = prevInvoices.reduce((sum, i) => sum + i.subtotal, 0);
  const revenueMoM = prevInvoicedRevenueInr === 0 ? 0 : ((totalInvoicedRevenueInr - prevInvoicedRevenueInr) / prevInvoicedRevenueInr) * 100;

  // Cash received (Cash-basis revenue)
  const totalCashReceivedInr = filteredInvoices
    .filter((i) => i.paymentStatus === 'paid')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  // 3. Net Profit / Loss
  const netProfitLossInr = totalInvoicedRevenueInr - totalExpensesInr;

  // 4. Monthly cash burn (Cash basis outflows)
  const monthlyCashBurnInr = totalExpensesInr;

  // 5. Available Cash Balance across accounts
  const availableCashBalanceInr = accounts
    .filter((a) => a.isActive)
    .reduce((sum, a) => {
      const balInr = a.currency === 'USD' ? a.currentBalance * rate : a.currentBalance;
      return sum + balInr;
    }, 0);

  // 6. Outstanding customer payments
  const outstandingPaymentsInr = invoices
    .filter((i) => !i.isDeleted && (i.paymentStatus === 'pending' || i.paymentStatus === 'overdue'))
    .reduce((sum, i) => sum + i.totalAmount, 0);

  // 7. Upcoming bills in next 30 days
  const upcomingBillsInr = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => {
      const amtInr = s.currency === 'USD' ? s.amount * rate : s.amount;
      return sum + amtInr;
    }, 0);

  // 8. AI Infrastructure Spending
  const aiInfraSpendingInr = filteredExpenses
    .filter((e) => e.category === 'AI & Infrastructure')
    .reduce((sum, e) => sum + e.totalAmountInr, 0);

  // 9. MRR & ARR from active subscription contracts
  const mrrInr = invoices
    .filter((i) => !i.isDeleted && i.paymentStatus !== 'refunded')
    .reduce((sum, i) => sum + i.subscriptionAmount, 0);
  const arrInr = mrrInr * 12;

  // 10. Cash Runway in months
  const netMonthlyBurn = Math.max(1, monthlyCashBurnInr - totalCashReceivedInr);
  const cashRunwayMonths = netProfitLossInr >= 0 ? 999 : availableCashBalanceInr / netMonthlyBurn;

  // Category breakdown for donut chart
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    filteredExpenses.forEach((e) => {
      const current = map.get(e.category) || 0;
      map.set(e.category, current + toActiveCurrency(e.totalAmountInr));
    });
    return Array.from(map.entries()).map(([name, value]) => ({
      name,
      value: Math.round(value),
    }));
  }, [filteredExpenses, activeCurrency, rate]);

  // Top 10 Expense Categories & Vendors
  const topVendors = useMemo(() => {
    const map = new Map<string, { amount: number; count: number; category: string }>();
    filteredExpenses.forEach((e) => {
      const existing = map.get(e.vendor) || { amount: 0, count: 0, category: e.category };
      existing.amount += toActiveCurrency(e.totalAmountInr);
      existing.count += 1;
      map.set(e.vendor, existing);
    });
    return Array.from(map.entries())
      .map(([vendor, data]) => ({ vendor, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }, [filteredExpenses, activeCurrency, rate]);

  // Monthly trends for Bar & Line charts (Past 6 months + Current)
  const monthlyTrendData = useMemo(() => {
    const months = [
      { name: 'Jun', revenue: 980000, expenses: 740000, aiCost: 180000, profit: 240000 },
      { name: 'Jul', revenue: 1120000, expenses: 810000, aiCost: 210000, profit: 310000 },
      { name: 'Aug', revenue: 1250000, expenses: 890000, aiCost: 245000, profit: 360000 },
      { name: 'Sep', revenue: 1420000, expenses: 960000, aiCost: 275000, profit: 460000 },
      { name: 'Oct', revenue: 1680000, expenses: 1040000, aiCost: 295000, profit: 640000 },
      {
        name: 'Nov (Current)',
        revenue: totalInvoicedRevenueInr,
        expenses: totalExpensesInr,
        aiCost: aiInfraSpendingInr,
        profit: netProfitLossInr,
      },
    ];

    return months.map((m) => ({
      ...m,
      revenue: Math.round(toActiveCurrency(m.revenue)),
      expenses: Math.round(toActiveCurrency(m.expenses)),
      aiCost: Math.round(toActiveCurrency(m.aiCost)),
      profit: Math.round(toActiveCurrency(m.profit)),
    }));
  }, [totalInvoicedRevenueInr, totalExpensesInr, aiInfraSpendingInr, netProfitLossInr, activeCurrency, rate]);

  // Cash Flow Forecast (historical balances + projected 3 months)
  const cashFlowForecast = useMemo(() => {
    const currentBal = toActiveCurrency(availableCashBalanceInr);
    const projectedNet = toActiveCurrency(totalCashReceivedInr - totalExpensesInr);

    return [
      { month: 'Sep', actualBalance: Math.round(currentBal * 0.82), forecastBalance: null },
      { month: 'Oct', actualBalance: Math.round(currentBal * 0.91), forecastBalance: null },
      { month: 'Nov (Now)', actualBalance: Math.round(currentBal), forecastBalance: Math.round(currentBal) },
      { month: 'Dec (Proj)', actualBalance: null, forecastBalance: Math.round(currentBal + projectedNet) },
      { month: 'Jan (Proj)', actualBalance: null, forecastBalance: Math.round(currentBal + projectedNet * 2) },
      { month: 'Feb (Proj)', actualBalance: null, forecastBalance: Math.round(currentBal + projectedNet * 3) },
    ];
  }, [availableCashBalanceInr, totalCashReceivedInr, totalExpensesInr, activeCurrency, rate]);

  // AI Cost Analytics
  const aiMetrics = useMemo(() => {
    const totalCalls = aiUsage.reduce((acc, u) => acc + u.callsCount, 0);
    const totalMinutes = aiUsage.reduce((acc, u) => acc + u.audioMinutes, 0);
    const totalAiCostInr = aiUsage.reduce((acc, u) => acc + u.estimatedCostInr, 0);

    const avgCostPerCall = totalCalls > 0 ? totalAiCostInr / totalCalls : 0;
    const avgCostPerMinute = totalMinutes > 0 ? totalAiCostInr / totalMinutes : 0;
    
    // Revenue per analyzed audio minute
    const revenuePerMinute = totalMinutes > 0 ? totalInvoicedRevenueInr / totalMinutes : 0;
    const grossMarginPerMinute = revenuePerMinute - avgCostPerMinute;
    const grossMarginPercent = revenuePerMinute > 0 ? (grossMarginPerMinute / revenuePerMinute) * 100 : 0;

    return {
      totalCalls,
      totalMinutes,
      totalAiCostInr,
      avgCostPerCall: toActiveCurrency(avgCostPerCall),
      avgCostPerMinute: toActiveCurrency(avgCostPerMinute),
      revenuePerMinute: toActiveCurrency(revenuePerMinute),
      grossMarginPerMinute: toActiveCurrency(grossMarginPerMinute),
      grossMarginPercent,
    };
  }, [aiUsage, totalInvoicedRevenueInr, activeCurrency, rate]);

  return {
    toActiveCurrency,
    totalExpenses: toActiveCurrency(totalExpensesInr),
    expensesMoM,
    totalRevenue: toActiveCurrency(totalInvoicedRevenueInr),
    revenueMoM,
    totalCashReceived: toActiveCurrency(totalCashReceivedInr),
    netProfitLoss: toActiveCurrency(netProfitLossInr),
    monthlyCashBurn: toActiveCurrency(monthlyCashBurnInr),
    availableCashBalance: toActiveCurrency(availableCashBalanceInr),
    outstandingPayments: toActiveCurrency(outstandingPaymentsInr),
    upcomingBills: toActiveCurrency(upcomingBillsInr),
    aiInfraSpending: toActiveCurrency(aiInfraSpendingInr),
    mrr: toActiveCurrency(mrrInr),
    arr: toActiveCurrency(arrInr),
    cashRunwayMonths,
    filteredExpenses,
    filteredInvoices,
    categoryBreakdown,
    topVendors,
    monthlyTrendData,
    cashFlowForecast,
    aiMetrics,
  };
}
