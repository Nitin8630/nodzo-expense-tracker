import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { UserRole } from '../../types/finance';
import {
  Settings,
  Shield,
  Database,
  Building,
  History,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Key,
  Save,
  Check,
  FileSpreadsheet,
  ExternalLink,
  Copy,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { updateSupabaseConfig, getSupabaseCredentials } from '../../lib/supabase';
import { getGoogleAppsScriptTemplate } from '../../lib/googleSheets';

export const SettingsView: React.FC = () => {
  const {
    organization,
    currentUser,
    switchRole,
    auditLogs,
    resetToCleanState,
    seedDemoData,
    isSupabaseMode,
    googleSheetsConfig,
    updateGoogleSheetsConfig,
    syncToGoogleSheets,
    syncFromGoogleSheets,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'profile' | 'roles' | 'sheets' | 'supabase' | 'audit' | 'reset'>('sheets');

  // Supabase input fields
  const currentCreds = getSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(currentCreds.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(currentCreds.anonKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Google Sheets state
  const [sheetUrlInput, setSheetUrlInput] = useState(googleSheetsConfig.spreadsheetUrl);
  const [webAppUrlInput, setWebAppUrlInput] = useState(googleSheetsConfig.webAppUrl);
  const [autoSyncInput, setAutoSyncInput] = useState(googleSheetsConfig.autoSync);
  const [copiedCode, setCopiedCode] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    updateSupabaseConfig(supabaseUrl, supabaseAnonKey);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveGoogleSheetsConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateGoogleSheetsConfig({
      spreadsheetUrl: sheetUrlInput,
      webAppUrl: webAppUrlInput,
      autoSync: autoSyncInput,
    });
    setSyncFeedback({ success: true, message: 'Google Sheets database configuration saved!' });
    setTimeout(() => setSyncFeedback(null), 3500);
  };

  const handleManualSyncNow = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    updateGoogleSheetsConfig({
      spreadsheetUrl: sheetUrlInput,
      webAppUrl: webAppUrlInput,
      autoSync: autoSyncInput,
    });
    const result = await syncToGoogleSheets();
    setIsSyncing(false);
    setSyncFeedback(result);
  };

  const handleManualPullNow = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    const result = await syncFromGoogleSheets();
    setIsSyncing(false);
    setSyncFeedback(result);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(getGoogleAppsScriptTemplate());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/70">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            System Settings & Database Architecture
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure Google Sheets database sync, Supabase PostgreSQL, role-based security, and audit logs.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-secondary rounded-lg border border-border text-xs">
        {[
          { id: 'sheets', label: 'Google Sheets Database', icon: FileSpreadsheet, badge: 'Live Sync' },
          { id: 'profile', label: 'Organization & GSTIN', icon: Building },
          { id: 'roles', label: 'User Roles & RLS', icon: Shield },
          { id: 'supabase', label: 'Supabase PostgreSQL DB', icon: Database },
          { id: 'audit', label: 'Financial Audit Logs', icon: History },
          { id: 'reset', label: 'Data Seed & Reset', icon: RotateCcw },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-card text-foreground shadow-subtle font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-primary" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-primary/10 text-primary font-mono font-medium">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ----------------- TAB: GOOGLE SHEETS DATABASE ----------------- */}
      {activeTab === 'sheets' && (
        <div className="space-y-4 max-w-4xl text-xs">
          {/* Header Card */}
          <div className="p-5 bg-card border border-border rounded-xl shadow-subtle space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    Google Sheets as Central Financial Database
                  </h2>
                  <p className="text-muted-foreground text-[11px] mt-0.5">
                    Real-time two-way synchronization between Nodzo Finance and your company Google Spreadsheet.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold ${
                    googleSheetsConfig.webAppUrl
                      ? 'bg-success/15 text-success'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {googleSheetsConfig.webAppUrl ? '● Sheets Engine Configured' : '○ Not Connected'}
                </span>
              </div>
            </div>

            {/* Sync Status Banner */}
            <div className="p-3 bg-secondary/50 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <RefreshCw
                  className={`w-4 h-4 text-primary ${
                    isSyncing ? 'animate-spin' : ''
                  }`}
                />
                <div>
                  <span className="text-foreground font-medium">Sync Engine Status: </span>
                  <span className="text-muted-foreground capitalize">
                    {isSyncing ? 'Synchronizing records...' : googleSheetsConfig.syncStatus}
                  </span>
                  {googleSheetsConfig.lastSyncedAt && (
                    <span className="text-[11px] text-muted-foreground font-mono ml-1.5">
                      (Last synced: {formatDate(googleSheetsConfig.lastSyncedAt)} at{' '}
                      {googleSheetsConfig.lastSyncedAt.slice(11, 19)})
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleManualPullNow}
                  disabled={isSyncing || !webAppUrlInput}
                  className="px-3 py-1.5 bg-background border border-border rounded-lg hover:bg-muted font-medium transition-colors disabled:opacity-50 text-xs"
                >
                  Pull from Sheet
                </button>
                <button
                  onClick={handleManualSyncNow}
                  disabled={isSyncing || !webAppUrlInput}
                  className="px-3.5 py-1.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary-hover shadow-subtle flex items-center gap-1.5 transition-colors disabled:opacity-50 text-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync to Sheet Now</span>
                </button>
              </div>
            </div>

            {syncFeedback && (
              <div
                className={`p-3 rounded-lg border flex items-center gap-2 text-xs ${
                  syncFeedback.success
                    ? 'bg-success/10 border-success/30 text-success'
                    : 'bg-destructive/10 border-destructive/30 text-destructive'
                }`}
              >
                {syncFeedback.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{syncFeedback.message}</span>
              </div>
            )}

            {/* Configuration Form */}
            <form onSubmit={handleSaveGoogleSheetsConfig} className="space-y-4 pt-2">
              <div>
                <label className="block text-muted-foreground font-medium mb-1">
                  Google Apps Script Web App Endpoint URL *
                </label>
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  value={webAppUrlInput}
                  onChange={(e) => setWebAppUrlInput(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-mono text-xs focus:ring-1 focus:ring-primary"
                />
                <span className="text-[10px] text-muted-foreground mt-0.5 block">
                  The Web App URL provided by Google Apps Script when deploying as a web application.
                </span>
              </div>

              <div>
                <label className="block text-muted-foreground font-medium mb-1">
                  Google Sheet View Link (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                    value={sheetUrlInput}
                    onChange={(e) => setSheetUrlInput(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-xs focus:ring-1 focus:ring-primary"
                  />
                  {sheetUrlInput && (
                    <a
                      href={sheetUrlInput}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg border border-border hover:bg-secondary/80 flex items-center gap-1 shrink-0 text-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Sheet</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Auto Sync Toggle */}
              <div className="p-3 bg-muted/40 border border-border/80 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold text-foreground">Real-Time Auto Synchronization</div>
                  <div className="text-[11px] text-muted-foreground">
                    Automatically push every newly created expense, customer invoice, and subscription to Google Sheets immediately.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSyncInput}
                    onChange={(e) => setAutoSyncInput(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary-hover shadow-subtle flex items-center gap-1.5 transition-colors text-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Configuration</span>
                </button>
              </div>
            </form>
          </div>

          {/* Setup Guide & Apps Script Code Box */}
          <div className="p-5 bg-card border border-border rounded-xl shadow-subtle space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div>
                <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Deploy Google Sheets REST API Database (2 Minutes)</span>
                </h3>
                <p className="text-muted-foreground text-[11px] mt-0.5">
                  Turn any blank Google Sheet into a full multi-table database with automatic tabs for Expenses, Revenue, Subscriptions, and Accounts.
                </p>
              </div>

              <button
                onClick={handleCopyScript}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-foreground border border-border rounded-lg text-xs font-medium transition-colors"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied Code!' : 'Copy Apps Script'}</span>
              </button>
            </div>

            {/* 3 Step Visual Guide */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3 bg-secondary/40 rounded-lg border border-border/60 space-y-1">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span>Open Apps Script</span>
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Open your Google Sheet, click <strong className="text-foreground">Extensions &gt; Apps Script</strong> in the top menu.
                </p>
              </div>

              <div className="p-3 bg-secondary/40 rounded-lg border border-border/60 space-y-1">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span>Paste & Deploy</span>
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Paste the copied script, click <strong className="text-foreground">Deploy &gt; New deployment</strong>, select <strong className="text-foreground">Web app</strong>.
                </p>
              </div>

              <div className="p-3 bg-secondary/40 rounded-lg border border-border/60 space-y-1">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px]">
                    3
                  </span>
                  <span>Set Access & Save</span>
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Set "Who has access" to <strong className="text-foreground">Anyone</strong>, click Deploy, and paste the URL above.
                </p>
              </div>
            </div>

            {/* Script preview */}
            <div className="mt-3">
              <div className="text-[11px] text-muted-foreground mb-1 font-mono">
                Script Preview (Click "Copy Apps Script" above to copy entire script):
              </div>
              <pre className="p-3 bg-muted/60 border border-border rounded-lg font-mono text-[11px] max-h-48 overflow-y-auto text-muted-foreground">
                {getGoogleAppsScriptTemplate()}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB: ORGANIZATION PROFILE ----------------- */}
      {activeTab === 'profile' && (
        <div className="p-5 bg-card border border-border rounded-xl shadow-subtle space-y-4 max-w-2xl text-xs">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Company Entity Profile</h2>
            <p className="text-muted-foreground mt-0.5">
              Core legal registration, GSTIN, PAN, and primary currencies.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-muted-foreground font-medium mb-1">Company Legal Name</label>
              <input
                type="text"
                disabled
                value={organization.name}
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-lg text-foreground font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-muted-foreground font-medium mb-1">GSTIN (India)</label>
                <input
                  type="text"
                  disabled
                  value={organization.gstin}
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-lg text-foreground font-mono"
                />
              </div>
              <div>
                <label className="block text-muted-foreground font-medium mb-1">PAN Number</label>
                <input
                  type="text"
                  disabled
                  value={organization.pan}
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-lg text-foreground font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-muted-foreground font-medium mb-1">Primary Currency</label>
                <input
                  type="text"
                  disabled
                  value="INR (₹)"
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-lg text-foreground font-medium"
                />
              </div>
              <div>
                <label className="block text-muted-foreground font-medium mb-1">Secondary Currency</label>
                <input
                  type="text"
                  disabled
                  value="USD ($)"
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-lg text-foreground font-medium"
                />
              </div>
              <div>
                <label className="block text-muted-foreground font-medium mb-1">Exchange Rate (USD/INR)</label>
                <input
                  type="text"
                  disabled
                  value={`₹${organization.usdToInrRate}`}
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-lg text-foreground font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-muted-foreground font-medium mb-1">Registered Office Address</label>
              <input
                type="text"
                disabled
                value={organization.address}
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-lg text-foreground"
              />
            </div>

            <div className="p-3 bg-secondary/50 rounded-lg text-muted-foreground">
              <span className="font-semibold text-foreground">Fiscal Calendar:</span> Nodzo AI operates on the Indian financial year calendar starting April 1 and concluding March 31.
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB: USER ROLES & RBAC ----------------- */}
      {activeTab === 'roles' && (
        <div className="space-y-4 max-w-3xl">
          <div className="p-5 bg-card border border-border rounded-xl shadow-subtle space-y-3 text-xs">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Active User Role Simulation</h2>
              <p className="text-muted-foreground mt-0.5">
                Toggle between permissions live to verify Row Level Security and action gates.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {[
                {
                  role: 'owner' as UserRole,
                  title: 'Owner',
                  desc: 'Full access, manage users, integrations, and delete financial records.',
                },
                {
                  role: 'finance_manager' as UserRole,
                  title: 'Finance Manager',
                  desc: 'Manage expenses, invoices, reconcile transactions, generate audit reports.',
                },
                {
                  role: 'viewer' as UserRole,
                  title: 'Viewer',
                  desc: 'Read-only access to authorized financial dashboards and reports.',
                },
              ].map((item) => (
                <div
                  key={item.role}
                  onClick={() => switchRole(item.role)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    currentUser.role === item.role
                      ? 'bg-primary/5 border-primary shadow-subtle'
                      : 'bg-card border-border hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-foreground">{item.title}</span>
                    {currentUser.role === item.role && (
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <p className="mt-1 text-muted-foreground text-[11px] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-muted-foreground">
              <span>Current Simulated User:</span>
              <span className="font-mono text-foreground font-semibold">
                {currentUser.fullName} ({currentUser.email})
              </span>
            </div>
          </div>

          {/* Permissions Matrix */}
          <div className="p-5 bg-card border border-border rounded-xl shadow-subtle space-y-3 text-xs">
            <h3 className="font-semibold text-sm text-foreground">Role Permissions Matrix</h3>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-medium">
                  <th className="py-2 px-3">Permission / Capability</th>
                  <th className="py-2 px-3 text-center">Owner</th>
                  <th className="py-2 px-3 text-center">Finance Manager</th>
                  <th className="py-2 px-3 text-center">Viewer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {[
                  { name: 'View Overview & Financial Dashboards', o: true, fm: true, v: true },
                  { name: 'Record, Edit & Categorize Expenses', o: true, fm: true, v: false },
                  { name: 'Issue Invoices & Reconcile Payments', o: true, fm: true, v: false },
                  { name: 'Execute Internal Bank Transfers', o: true, fm: true, v: false },
                  { name: 'Execute Soft Deletes & Reversals', o: true, fm: false, v: false },
                  { name: 'Configure Supabase & Database Schema', o: true, fm: false, v: false },
                  { name: 'Export GST & P&L Tax Reports', o: true, fm: true, v: true },
                ].map((p, idx) => (
                  <tr key={idx} className="hover:bg-muted/30">
                    <td className="py-2.5 px-3 text-foreground">{p.name}</td>
                    <td className="py-2.5 px-3 text-center">
                      {p.o ? <Check className="w-4 h-4 text-success mx-auto" /> : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {p.fm ? <Check className="w-4 h-4 text-success mx-auto" /> : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {p.v ? <Check className="w-4 h-4 text-success mx-auto" /> : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- TAB: SUPABASE DATABASE CONFIG ----------------- */}
      {activeTab === 'supabase' && (
        <div className="p-5 bg-card border border-border rounded-xl shadow-subtle space-y-4 max-w-2xl text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Supabase PostgreSQL Connection</h2>
              <p className="text-muted-foreground mt-0.5">
                Connect your live Supabase project or use local persistent offline storage.
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-medium ${
                isSupabaseMode
                  ? 'bg-success/15 text-success'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {isSupabaseMode ? 'Connected to Supabase' : 'Local Vault Active'}
            </span>
          </div>

          <form onSubmit={handleSaveSupabase} className="space-y-3 pt-2">
            <div>
              <label className="block text-muted-foreground font-medium mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://your-project.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-mono"
              />
            </div>

            <div>
              <label className="block text-muted-foreground font-medium mb-1">
                Supabase Anon / Public API Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground font-mono"
              />
            </div>

            <div className="p-3 bg-secondary/50 rounded-lg text-muted-foreground text-[11px] leading-relaxed">
              <span className="font-semibold text-foreground">Migration Ready:</span> Full database migrations are ready at <code className="bg-background px-1 py-0.5 rounded font-mono">supabase/migrations/20261118000001_nodzo_schema.sql</code> and seed script at <code className="bg-background px-1 py-0.5 rounded font-mono">supabase/seed.sql</code>.
            </div>

            {savedSuccess && (
              <div className="p-2.5 bg-success/10 border border-success/20 text-success rounded-lg flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Supabase credentials updated successfully!</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary-hover flex items-center gap-1.5 transition-colors shadow-subtle"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Credentials</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ----------------- TAB: AUDIT LOGS ----------------- */}
      {activeTab === 'audit' && (
        <div className="p-5 bg-card border border-border rounded-xl shadow-subtle space-y-3 text-xs">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Immutable Financial Audit Logs</h2>
            <p className="text-muted-foreground mt-0.5">
              Strict audit trail for all record creations, edits, reversals, transfers, and reconciliations.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-medium">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Actor</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Entity</th>
                  <th className="py-2.5 px-3">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30">
                    <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                      {formatDate(log.timestamp)} {log.timestamp.slice(11, 19)}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-foreground">{log.userEmail}</td>
                    <td className="py-2.5 px-3 uppercase text-primary font-sans">{log.userRole}</td>
                    <td className="py-2.5 px-3 capitalize font-semibold">{log.action}</td>
                    <td className="py-2.5 px-3 uppercase text-muted-foreground">{log.entityType}</td>
                    <td className="py-2.5 px-3 font-sans text-foreground">{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- TAB: DATA SEED & RESET ----------------- */}
      {activeTab === 'reset' && (
        <div className="p-5 bg-card border border-border rounded-xl shadow-subtle space-y-4 max-w-xl text-xs">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Data Environment Control</h2>
            <p className="text-muted-foreground mt-0.5">
              Switch between empty production state with onboarding guidance or seed demo data.
            </p>
          </div>

          <div className="p-4 bg-muted/40 border border-border rounded-xl space-y-3">
            <h3 className="font-semibold text-foreground">1. Seed Nodzo SaaS Sample Dataset</h3>
            <p className="text-muted-foreground leading-relaxed">
              Populates realistic Nodzo AI figures: OpenAI GPT-4o bills, Deepgram STT usage, Reliance Retail enterprise invoices, Axis Forex card balances, and Indian GST splits.
            </p>
            <button
              onClick={() => {
                seedDemoData();
                alert('Sample Nodzo AI financial dataset seeded successfully!');
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary-hover transition-colors shadow-subtle"
            >
              Seed Sample Dataset
            </button>
          </div>

          <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-xl space-y-3">
            <h3 className="font-semibold text-destructive">2. Reset to Clean Production State</h3>
            <p className="text-muted-foreground leading-relaxed">
              Wipes all mock data, zeroing all balances, expenses, and invoices. Prepares the system for real production operations.
            </p>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset to clean production state? All records will be cleared.')) {
                  resetToCleanState();
                }
              }}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 transition-colors shadow-subtle"
            >
              Reset to Clean State
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
