import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { UserRole, Currency } from '../../types/finance';
import {
  Search,
  Bell,
  Plus,
  Moon,
  Sun,
  Shield,
  CreditCard,
  Receipt,
  DollarSign,
  ArrowRightLeft,
  Cpu,
  Sparkles,
  CheckCircle,
  ExternalLink,
  FileSpreadsheet,
  RefreshCw,
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenAddExpense: () => void;
  onOpenAddRevenue: () => void;
  onOpenAddSubscription: () => void;
  onOpenAddTransfer: () => void;
  onOpenAddAIUsage: () => void;
  onOpenReceiptScan: () => void;
  onNavigate: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenAddExpense,
  onOpenAddRevenue,
  onOpenAddSubscription,
  onOpenAddTransfer,
  onOpenAddAIUsage,
  onOpenReceiptScan,
  onNavigate,
  darkMode,
  setDarkMode,
}) => {
  const {
    organization,
    currentUser,
    switchRole,
    activeCurrency,
    setActiveCurrency,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    googleSheetsConfig,
    syncToGoogleSheets,
  } = useFinance();

  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);

  const unreadNotifications = notifications.filter((n) => !n.isRead);

  const handleSyncSheets = async () => {
    if (!googleSheetsConfig.webAppUrl) {
      onNavigate('settings');
      return;
    }
    setIsSyncingSheets(true);
    await syncToGoogleSheets();
    setIsSyncingSheets(false);
  };

  return (
    <header className="sticky top-0 z-30 h-14 bg-background/80 backdrop-blur-md border-b border-border px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Organization Badge & Fiscal Year */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs tracking-wider shadow-subtle">
            N
          </div>
          <span className="font-semibold text-sm tracking-tight text-foreground">
            {organization.name}
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] bg-secondary text-muted-foreground border border-border">
          <span className="w-1.5 h-1.5 rounded-full bg-success inline-block"></span>
          <span>FY 2026-27 (Apr–Mar)</span>
          <span className="text-border">|</span>
          <span>IST (Asia/Kolkata)</span>
        </div>
      </div>

      {/* Center: Global Search shortcut trigger */}
      <button
        onClick={onOpenSearch}
        className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border rounded-lg text-xs transition-colors w-64 justify-between"
      >
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5" />
          <span>Search or jump to...</span>
        </div>
        <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-background border border-border rounded">
          ⌘K
        </kbd>
      </button>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Google Sheets Sync Pill */}
        <button
          onClick={handleSyncSheets}
          title={
            googleSheetsConfig.webAppUrl
              ? 'Click to sync all data to Google Sheets now'
              : 'Click to configure Google Sheets Database in Settings'
          }
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
            googleSheetsConfig.webAppUrl
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-secondary text-muted-foreground border-border hover:bg-secondary/80'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="truncate max-w-[120px]">
            {isSyncingSheets
              ? 'Syncing...'
              : googleSheetsConfig.webAppUrl
              ? 'Sheets DB'
              : 'Link Sheets'}
          </span>
          <RefreshCw
            className={`w-3 h-3 ml-0.5 ${isSyncingSheets ? 'animate-spin' : ''}`}
          />
        </button>

        {/* Currency Switcher */}
        <div className="flex items-center p-0.5 bg-secondary rounded-lg border border-border text-xs font-medium">
          <button
            onClick={() => setActiveCurrency('INR')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeCurrency === 'INR'
                ? 'bg-card text-foreground shadow-subtle'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            ₹ INR
          </button>
          <button
            onClick={() => setActiveCurrency('USD')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeCurrency === 'USD'
                ? 'bg-card text-foreground shadow-subtle'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            $ USD
          </button>
        </div>

        {/* User Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-secondary/80 hover:bg-secondary border border-border rounded-lg text-xs text-foreground transition-colors"
            title="Switch User Role to test permissions"
          >
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span className="capitalize font-medium">{currentUser.role.replace('_', ' ')}</span>
          </button>

          {isRoleMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl p-1.5 z-40 text-xs">
              <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase">
                Simulate Role (RBAC)
              </div>
              {(['owner', 'finance_manager', 'viewer'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    setIsRoleMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                    currentUser.role === r
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <span className="capitalize">{r.replace('_', ' ')}</span>
                  {currentUser.role === r && <CheckCircle className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg border border-border transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive ring-2 ring-background animate-pulse" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-2xl p-3 z-40 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="font-semibold text-foreground">
                  Notifications ({unreadNotifications.length})
                </span>
                {unreadNotifications.length > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto mt-2 space-y-2">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-muted-foreground">
                    No active notifications.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.link) onNavigate(n.link);
                        setIsNotifOpen(false);
                      }}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-colors ${
                        n.isRead
                          ? 'bg-background/40 border-border/50 text-muted-foreground'
                          : n.severity === 'critical'
                          ? 'bg-destructive/5 border-destructive/20 text-foreground'
                          : 'bg-primary/5 border-primary/20 text-foreground'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-semibold">{n.title}</span>
                        {!n.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="mt-1 text-muted-foreground leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg border border-border transition-colors"
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Prominent "+ Add" Action Button */}
        <div className="relative">
          <button
            onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground font-medium text-xs rounded-lg hover:bg-primary-hover shadow-subtle transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>

          {isAddMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-2xl p-1.5 z-40 text-xs">
              <button
                onClick={() => {
                  setIsAddMenuOpen(false);
                  onOpenAddExpense();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted text-foreground transition-colors text-left"
              >
                <Receipt className="w-4 h-4 text-primary" />
                <div>
                  <div className="font-medium">New Expense</div>
                  <div className="text-[10px] text-muted-foreground">Add bill, SaaS, or vendor spend</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsAddMenuOpen(false);
                  onOpenReceiptScan();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted text-foreground transition-colors text-left"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <div>
                  <div className="font-medium">AI Receipt Scanner</div>
                  <div className="text-[10px] text-muted-foreground">Upload invoice PDF or photo</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsAddMenuOpen(false);
                  onOpenAddRevenue();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted text-foreground transition-colors text-left"
              >
                <DollarSign className="w-4 h-4 text-success" />
                <div>
                  <div className="font-medium">New Revenue Invoice</div>
                  <div className="text-[10px] text-muted-foreground">Bill customer or add MRR</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsAddMenuOpen(false);
                  onOpenAddSubscription();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted text-foreground transition-colors text-left"
              >
                <CreditCard className="w-4 h-4 text-accent-foreground" />
                <div>
                  <div className="font-medium">New Subscription</div>
                  <div className="text-[10px] text-muted-foreground">Track recurring monthly software</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsAddMenuOpen(false);
                  onOpenAddTransfer();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted text-foreground transition-colors text-left"
              >
                <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Internal Transfer</div>
                  <div className="text-[10px] text-muted-foreground">Bank to card / petty cash</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsAddMenuOpen(false);
                  onOpenAddAIUsage();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted text-foreground transition-colors text-left"
              >
                <Cpu className="w-4 h-4 text-primary" />
                <div>
                  <div className="font-medium">Log AI Usage</div>
                  <div className="text-[10px] text-muted-foreground">STT, LLM tokens, or GPU run</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
