// ==========================================
// FINDashboard.tsx
// Finance Manager — Dashboard Page
// KPI cards, budget vs actual trend, COGS trend,
// action queue (pending approvals, cost validation,
// period locking reminders).
// ==========================================

import React, { useState } from "react";
import FinanceLayout from "../../layout/FinanceLayout";
import StatsCard from "../../components/ui/StatsCard";
import WorkQueueCard, { type WorkQueueItem } from "../../components/ui/WorkQueueCard";
import AlertPanel, { type AlertItem } from "../../components/ui/AlertPanel";
import DefectTrendChart, { type TrendDataPoint } from "../../components/ui/DefectTrendChart";
import { StatusBadge } from "../../components/ui/StatusBadge";
import {
  Wallet,
  Calculator,
  TrendingUp,
  AlertTriangle,
  Unlock,
  ShieldCheck,
  CheckSquare,
  Lock,
} from "lucide-react";

// ------------------------------------------
// Mock data
// ------------------------------------------
const kpiCards = [
  { title: "Budget Utilization", value: "72%", icon: Wallet, color: "bg-indigo-500", trend: "₱4.2M remaining", trendUp: true },
  { title: "Total COGS (Period)", value: "₱3.8M", icon: Calculator, color: "bg-emerald-500", trend: "+8% vs last month", trendUp: false },
  { title: "Top Cost Driver", value: "Materials", icon: TrendingUp, color: "bg-blue-500", trend: "62% of COGS", trendUp: false },
  { title: "Variance Alerts", value: 12, icon: AlertTriangle, color: "bg-amber-500", trend: "3 critical", trendUp: false },
  { title: "Unlocked Periods", value: 2, icon: Unlock, color: "bg-rose-500", trend: "Jan & Feb 2026", trendUp: false },
  { title: "Pending Validations", value: 8, icon: ShieldCheck, color: "bg-violet-500", trend: "5 from Production", trendUp: false },
];

const alertItems: AlertItem[] = [
  { id: "a1", severity: "critical", message: "Budget threshold exceeded — Summer Collection 2026 at 94% utilization.", actionLabel: "View Budget", onAction: () => {} },
  { id: "a2", severity: "critical", message: "COGS spike: SKU-005 Denim Jacket increased 23% vs last batch.", actionLabel: "Review COGS", onAction: () => {} },
  { id: "a3", severity: "warning", message: "High waste impact: WO-105 waste rate at 8.5% (threshold: 5%).", actionLabel: "View Variance", onAction: () => {} },
  { id: "a4", severity: "warning", message: "January 2026 period still unlocked — overdue for closing.", actionLabel: "Lock Period", onAction: () => {} },
  { id: "a5", severity: "info", message: "New cost record generated for WO-102 — awaiting validation.", actionLabel: "Validate", onAction: () => {} },
];

const budgetVsActual: TrendDataPoint[] = [
  { label: "Sep", value: 68 },
  { label: "Oct", value: 72 },
  { label: "Nov", value: 75 },
  { label: "Dec", value: 80 },
  { label: "Jan", value: 85 },
  { label: "Feb", value: 72 },
];

const cogsTrend: TrendDataPoint[] = [
  { label: "Sep", value: 3200 },
  { label: "Oct", value: 3400 },
  { label: "Nov", value: 3100 },
  { label: "Dec", value: 3600 },
  { label: "Jan", value: 3900 },
  { label: "Feb", value: 3800 },
];

const budgetApprovalItems: WorkQueueItem[] = [
  { id: "ba1", label: "Summer Collection 2026 — Budget Increase", sublabel: "₱500K additional requested · Submitted: Feb 12", status: <StatusBadge status="Pending" />, onAction: () => {}, actionLabel: "Review" },
  { id: "ba2", label: "Q2 Maintenance Budget", sublabel: "₱120K · Submitted: Feb 10", status: <StatusBadge status="Pending" />, onAction: () => {}, actionLabel: "Review" },
];

const costValidationItems: WorkQueueItem[] = [
  { id: "cv1", label: "WO-102 — Material adjustment ₱45K", sublabel: "Source: Warehouse · Large cotton adjustment", status: <StatusBadge status="Pending" />, onAction: () => {}, actionLabel: "Validate" },
  { id: "cv2", label: "WO-105 — Waste spike ₱18K", sublabel: "Source: Production · 8.5% waste rate", status: <StatusBadge status="Under Review" />, onAction: () => {}, actionLabel: "Review" },
  { id: "cv3", label: "WO-107 — Labor overtime ₱12K", sublabel: "Source: Production · Weekend overtime", status: <StatusBadge status="Pending" />, onAction: () => {}, actionLabel: "Validate" },
];

const periodLockItems: WorkQueueItem[] = [
  { id: "pl1", label: "January 2026", sublabel: "All cost records finalized · Ready for locking", status: <StatusBadge status="Open" />, onAction: () => {}, actionLabel: "Lock" },
  { id: "pl2", label: "February 2026", sublabel: "8 cost records still pending validation", status: <StatusBadge status="Open" />, onAction: () => {}, actionLabel: "View" },
];

// ==========================================
// Component
// ==========================================
const FINDashboard: React.FC = () => {
  const [_refresh] = useState(0);
  void _refresh;

  return (
    <FinanceLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Finance Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Budget, costing & expense health — Manila Branch</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {kpiCards.map((kpi) => (
          <StatsCard key={kpi.title} title={kpi.title} value={kpi.value} icon={kpi.icon} color={kpi.color} trend={kpi.trend} trendUp={kpi.trendUp} />
        ))}
      </div>

      {/* Alerts Panel */}
      <div className="mb-8">
        <AlertPanel title="Finance Risk Alerts" items={alertItems} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DefectTrendChart title="Budget Utilization % (Monthly)" data={budgetVsActual} barColor="bg-indigo-500" />
        <DefectTrendChart title="Total COGS Trend (₱ thousands)" data={cogsTrend} barColor="bg-emerald-500" />
      </div>

      {/* Action Queue Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <WorkQueueCard
          title="Pending Budget Approvals"
          icon={CheckSquare}
          iconColor="text-amber-600 dark:text-amber-400"
          iconBg="bg-amber-50 dark:bg-amber-900/30"
          items={budgetApprovalItems}
          emptyMessage="No pending budget approvals."
        />
        <WorkQueueCard
          title="Cost Records Awaiting Validation"
          icon={ShieldCheck}
          iconColor="text-violet-600 dark:text-violet-400"
          iconBg="bg-violet-50 dark:bg-violet-900/30"
          items={costValidationItems}
          emptyMessage="No pending cost validations."
        />
        <WorkQueueCard
          title="Period Locking Reminders"
          icon={Lock}
          iconColor="text-rose-600 dark:text-rose-400"
          iconBg="bg-rose-50 dark:bg-rose-900/30"
          items={periodLockItems}
          emptyMessage="All periods locked."
        />
      </div>
    </FinanceLayout>
  );
};

export default FINDashboard;
