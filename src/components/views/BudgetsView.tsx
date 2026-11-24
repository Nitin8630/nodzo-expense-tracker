import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  PiggyBank,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Edit,
  Sparkles,
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export const BudgetsView: React.FC = () => {
  const { budgets, expenses, subscriptions, categories, updateBudget, activeCurrency, organization } = useFinance();

  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [budgetInput, setBudgetInput] = useState<number>(0);

  const rate = organization.usdToInrRate;

  // Calculate actual spending per category in current month (Nov 2026)
  const categorySpending = categories.map((cat) => {
    const matchingExpenses = expenses.filter(
      (e) => !e.isDeleted && e.category === cat.name && e.expenseDate.startsWith('2026-11')
    );
    const actualSpentInr = matchingExpenses.reduce((sum, e) => sum + e.totalAmountInr, 0);

    const budgetObj = budgets.find((b) => b.category === cat.name);
    const budgetAmountInr = budgetObj ? budgetObj.budgetAmount : 300000;

    // Upcoming subscriptions in this category
    const upcomingSubInr = subscriptions
      .filter((s) => s.status === 'active' && s.category === cat.name)
      .reduce((sum, s) => {
        const amt = s.currency === 'USD' ? s.amount * rate : s.amount;
        return sum + amt;
      }, 0);

    // Month-end forecast: actual + upcoming recurring commitments
    const forecastedEndSpendInr = actualSpentInr + upcomingSubInr * 0.4;
    const utilizationPct = budgetAmountInr > 0 ? (actualSpentInr / budgetAmountInr) * 100 : 0;
    const forecastedUtilizationPct = budgetAmountInr > 0 ? (forecastedEndSpendInr / budgetAmountInr) * 100 : 0;

    return {
      category: cat.name,
      icon: cat.icon,
      color: cat.color,
      actualSpentInr,
      budgetAmountInr,
      forecastedEndSpendInr,
      utilizationPct,
      forecastedUtilizationPct,
    };
  });

  const totalBudgetInr = categorySpending.reduce((s, c) => s + c.budgetAmountInr, 0);
  const totalActualSpentInr = categorySpending.reduce((s, c) => s + c.actualSpentInr, 0);
  const overallUtilization = (totalActualSpentInr / totalBudgetInr) * 100;

  const handleSaveBudget = (catName: string) => {
    updateBudget(catName, budgetInput);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/70">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Budget Planning & Threshold Alerts
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor spend vs budgeted caps, utilization thresholds (80%, 100%, 120%), and forecasted run-rates.
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 bg-card border border-border rounded-xl shadow-subtle">
          <div className="text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Total Monthly Budget</span>
            <PiggyBank className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-1.5 text-lg font-bold font-mono text-foreground">
            {formatCurrency(totalBudgetInr, activeCurrency)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Allocated across {categories.length} operational departments
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl shadow-subtle">
          <div className="text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Total Spent Month-to-Date</span>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-1.5 text-lg font-bold font-mono text-foreground">
            {formatCurrency(totalActualSpentInr, activeCurrency)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {totalBudgetInr > totalActualSpentInr
              ? `${formatCurrency(totalBudgetInr - totalActualSpentInr, activeCurrency)} remaining`
              : 'Budget exceeded'}
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl shadow-subtle">
          <div className="text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Overall Utilization</span>
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-1.5 text-lg font-bold font-mono text-foreground">
            {overallUtilization.toFixed(1)}%
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {overallUtilization > 100 ? (
              <span className="text-destructive font-medium">Over budget threshold</span>
            ) : overallUtilization > 80 ? (
              <span className="text-amber-500 font-medium">Caution: Near 80% mark</span>
            ) : (
              <span className="text-success font-medium">Within safe envelope</span>
            )}
          </div>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categorySpending.map((cat) => {
          const isOverBudget = cat.actualSpentInr > cat.budgetAmountInr;
          const isWarning = cat.utilizationPct >= 80 && cat.utilizationPct <= 100;
          const isCritical = cat.utilizationPct > 120;
          const isEditing = editingCategory === cat.category;

          return (
            <div
              key={cat.category}
              className="p-5 bg-card border border-border rounded-xl shadow-subtle flex flex-col justify-between space-y-4 hover:border-primary/40 transition-colors text-xs"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{cat.category}</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Forecasted Month-End: {formatCurrency(cat.forecastedEndSpendInr, activeCurrency)}
                    </p>
                  </div>
                  <div>
                    {isCritical ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/15 text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Critical &gt;120%
                      </span>
                    ) : isOverBudget ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/15 text-destructive flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Exceeded 100%
                      </span>
                    ) : isWarning ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> 80% Warning
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-success/15 text-success flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Healthy
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-muted-foreground">
                      Spent: {formatCurrency(cat.actualSpentInr, activeCurrency)}
                    </span>
                    <span className="font-bold text-foreground">
                      {cat.utilizationPct.toFixed(1)}% of cap
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCritical
                          ? 'bg-destructive'
                          : isOverBudget
                          ? 'bg-destructive'
                          : isWarning
                          ? 'bg-amber-500'
                          : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(100, cat.utilizationPct)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Budget Limit & Edit */}
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-muted-foreground">Monthly Cap: </span>
                  {isEditing ? (
                    <div className="inline-flex items-center gap-1.5 ml-1">
                      <input
                        type="number"
                        value={budgetInput}
                        onChange={(e) => setBudgetInput(parseFloat(e.target.value) || 0)}
                        className="w-28 px-2 py-0.5 bg-background border border-border rounded font-mono text-xs"
                      />
                      <button
                        onClick={() => handleSaveBudget(cat.category)}
                        className="px-2 py-0.5 bg-primary text-primary-foreground rounded text-[10px]"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="px-2 py-0.5 border border-border rounded text-[10px]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <span className="font-mono font-semibold text-foreground">
                      {formatCurrency(cat.budgetAmountInr, activeCurrency)}
                    </span>
                  )}
                </div>

                {!isEditing && (
                  <button
                    onClick={() => {
                      setEditingCategory(cat.category);
                      setBudgetInput(cat.budgetAmountInr);
                    }}
                    className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted flex items-center gap-1 text-[11px]"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Edit Limit</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
