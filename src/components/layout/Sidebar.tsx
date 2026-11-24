import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  TrendingUp,
  CreditCard,
  Cpu,
  Wallet,
  PiggyBank,
  FileCheck2,
  BarChart3,
  Settings,
  Database,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { isSupabaseMode, currentUser } = useFinance();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'revenue', label: 'Revenue', icon: TrendingUp },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'ai-costs', label: 'AI Costs', icon: Cpu, badge: 'Nodzo AI' },
    { id: 'cash-flow', label: 'Cash Flow', icon: Wallet },
    { id: 'budgets', label: 'Budgets', icon: PiggyBank },
    { id: 'invoices-receipts', label: 'Invoices & Receipts', icon: FileCheck2 },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-56 shrink-0 h-screen sticky top-0 bg-surface border-r border-border flex flex-col justify-between p-3 select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 px-3 py-3 mb-3 border-b border-border/60">
          <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm tracking-wider shadow-subtle">
            N
          </div>
          <div>
            <div className="font-semibold text-xs text-foreground tracking-tight flex items-center gap-1.5">
              <span>Nodzo Finance</span>
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">v1.0 • Internal</div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-secondary text-foreground font-semibold shadow-subtle'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-primary/10 text-primary font-mono font-medium">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Sync Status */}
      <div className="pt-3 border-t border-border/80 space-y-2">
        <div className="flex items-center justify-between px-2 text-[11px]">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Database className="w-3.5 h-3.5 text-primary" />
            <span>DB Engine</span>
          </div>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
              isSupabaseMode
                ? 'bg-success/15 text-success'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {isSupabaseMode ? 'Supabase Live' : 'Local Vault'}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-secondary/60 border border-border/60">
          <div className="text-xs font-semibold text-foreground truncate">
            {currentUser.fullName}
          </div>
          <div className="text-[10px] text-muted-foreground truncate font-mono">
            {currentUser.email}
          </div>
        </div>
      </div>
    </aside>
  );
};
