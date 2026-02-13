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
import PageModal from "../../components/ui/PageModal";
import Toast from "../../components/ui/Toast";
import {
  Wallet,
  Calculator,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Unlock,
  ShieldCheck,
  CheckSquare,
  Lock,
  BarChart3,
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

// Alert items with detail data for modals
interface DashboardAlert extends AlertItem {
  detail?: string;
  relatedId?: string;
}

const alertItemsData: DashboardAlert[] = [
  { id: "a1", severity: "critical", message: "Budget threshold exceeded — Summer Collection 2026 at 94% utilization.", actionLabel: "View Budget", detail: "Summer Collection 2026 budget has reached 94% utilization, exceeding the 90% threshold. Remaining budget: ₱300K. Immediate review required to prevent overspend.", relatedId: "BUD-2026-003" },
  { id: "a2", severity: "critical", message: "COGS spike: SKU-005 Denim Jacket increased 23% vs last batch.", actionLabel: "Review COGS", detail: "Denim Jacket (SKU-005) COGS per unit increased from ₱780 to ₱960 (+23%). Root cause: material price increase and higher waste rate in WO-105.", relatedId: "SKU-005" },
  { id: "a3", severity: "warning", message: "High waste impact: WO-105 waste rate at 8.5% (threshold: 5%).", actionLabel: "View Variance", detail: "Work Order WO-105 recorded 8.5% waste rate, significantly above the 5% threshold. Cost impact: +₱18K. Investigation needed with Production Manager.", relatedId: "WO-105" },
  { id: "a4", severity: "warning", message: "January 2026 period still unlocked — overdue for closing.", actionLabel: "Lock Period", detail: "January 2026 financial period is still open. All cost records have been finalized. Period should be locked to prevent further edits and enable accurate reporting.", relatedId: "PER-2026-01" },
  { id: "a5", severity: "info", message: "New cost record generated for WO-102 — awaiting validation.", actionLabel: "Validate", detail: "Auto-COGS record COST-4501 generated for WO-102 (Basic Tee V2.0). Total COGS: ₱124,500. Awaiting Finance Manager validation before finalization.", relatedId: "COST-4501" },
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

// ==========================================
// Component
// ==========================================
const FINDashboard: React.FC = () => {
  const [_refresh] = useState(0);
  void _refresh;

  // Modal states
  const [selectedAlert, setSelectedAlert] = useState<DashboardAlert | null>(null);
  const [selectedQueueItem, setSelectedQueueItem] = useState<{ label: string; sublabel?: string; actionLabel?: string; type: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Wire alerts with modal
  const alertItems: AlertItem[] = alertItemsData.map((a) => ({
    ...a,
    onAction: () => setSelectedAlert(a),
  }));

  // Wire work queue items with modals
  const budgetApprovalItems: WorkQueueItem[] = [
    { id: "ba1", label: "Summer Collection 2026 — Budget Increase", sublabel: "₱500K additional requested · Submitted: Feb 12", status: <StatusBadge status="Pending" />, onAction: () => setSelectedQueueItem({ label: "Summer Collection 2026 — Budget Increase", sublabel: "₱500K additional budget requested for Summer Collection materials. Justification: raw material price increase from suppliers.", actionLabel: "Review", type: "budget" }), actionLabel: "Review" },
    { id: "ba2", label: "Q2 Maintenance Budget", sublabel: "₱120K · Submitted: Feb 10", status: <StatusBadge status="Pending" />, onAction: () => setSelectedQueueItem({ label: "Q2 Maintenance Budget", sublabel: "₱120K maintenance budget for sewing equipment. Covers quarterly servicing and spare parts replacement.", actionLabel: "Review", type: "budget" }), actionLabel: "Review" },
  ];

  const costValidationItems: WorkQueueItem[] = [
    { id: "cv1", label: "WO-102 — Material adjustment ₱45K", sublabel: "Source: Warehouse · Large cotton adjustment", status: <StatusBadge status="Pending" />, onAction: () => setSelectedQueueItem({ label: "WO-102 — Material adjustment ₱45K", sublabel: "Large cotton fabric adjustment from Warehouse (ADJ-045). Impact: +₱45K to COGS. Needs validation before finalization.", actionLabel: "Validate", type: "cost" }), actionLabel: "Validate" },
    { id: "cv2", label: "WO-105 — Waste spike ₱18K", sublabel: "Source: Production · 8.5% waste rate", status: <StatusBadge status="Under Review" />, onAction: () => setSelectedQueueItem({ label: "WO-105 — Waste spike ₱18K", sublabel: "Abnormal waste rate at 8.5% (threshold: 5%). Production Manager has been notified. Review COGS impact.", actionLabel: "Review", type: "cost" }), actionLabel: "Review" },
    { id: "cv3", label: "WO-107 — Labor overtime ₱12K", sublabel: "Source: Production · Weekend overtime", status: <StatusBadge status="Pending" />, onAction: () => setSelectedQueueItem({ label: "WO-107 — Labor overtime ₱12K", sublabel: "Weekend overtime labor cost from Production. ₱12K additional labor cost for Joggers V2.0 batch.", actionLabel: "Validate", type: "cost" }), actionLabel: "Validate" },
  ];

  const periodLockItems: WorkQueueItem[] = [
    { id: "pl1", label: "January 2026", sublabel: "All cost records finalized · Ready for locking", status: <StatusBadge status="Open" />, onAction: () => setSelectedQueueItem({ label: "January 2026", sublabel: "All cost records finalized. 24 cost entries validated. No pending adjustments. Period is ready for locking.", actionLabel: "Lock", type: "period" }), actionLabel: "Lock" },
    { id: "pl2", label: "February 2026", sublabel: "8 cost records still pending validation", status: <StatusBadge status="Open" />, onAction: () => setSelectedQueueItem({ label: "February 2026", sublabel: "Current period. 8 cost records still awaiting validation. Cannot lock until all records are finalized.", actionLabel: "View", type: "period" }), actionLabel: "View" },
  ];

  return (
    <FinanceLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto space-y-6 pb-20">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Finance Dashboard</h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Budget, costing & expense health — Manila Branch</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-semibold">
            <Lock size={12} />Branch: Manila
          </div>
        </div>

        {/* KPI Cards — 3 per row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpiCards.map((kpi) => (
            <StatsCard key={kpi.title} title={kpi.title} value={kpi.value} icon={kpi.icon} color={kpi.color} trend={kpi.trend} trendUp={kpi.trendUp} />
          ))}
        </div>

        {/* Alerts Panel — full width, modern */}
        <AlertPanel title="Finance Risk Alerts" items={alertItems} />

        {/* Charts Row — modern with gradient & animation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DefectTrendChart
            title="Budget Utilization % (Monthly)"
            data={budgetVsActual}
            gradientFrom="#6366f1"
            gradientTo="#818cf8"
            icon={TrendingUp}
            iconBg="bg-indigo-50 dark:bg-indigo-900/30"
            iconColor="text-indigo-600 dark:text-indigo-400"
          />
          <DefectTrendChart
            title="Total COGS Trend (₱ thousands)"
            data={cogsTrend}
            gradientFrom="#10b981"
            gradientTo="#34d399"
            icon={BarChart3}
            iconBg="bg-emerald-50 dark:bg-emerald-900/30"
            iconColor="text-emerald-600 dark:text-emerald-400"
          />
        </div>

        {/* Action Queue — 2 per row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WorkQueueCard
            title="Pending Budget Approvals"
            icon={CheckSquare}
            iconColor="text-amber-600 dark:text-amber-400"
            iconBg="bg-amber-50 dark:bg-amber-900/30"
            accentColor="bg-amber-500"
            items={budgetApprovalItems}
            emptyMessage="No pending budget approvals."
          />
          <WorkQueueCard
            title="Cost Records Awaiting Validation"
            icon={ShieldCheck}
            iconColor="text-violet-600 dark:text-violet-400"
            iconBg="bg-violet-50 dark:bg-violet-900/30"
            accentColor="bg-violet-500"
            items={costValidationItems}
            emptyMessage="No pending cost validations."
          />
          <WorkQueueCard
            title="Period Locking Reminders"
            icon={Lock}
            iconColor="text-rose-600 dark:text-rose-400"
            iconBg="bg-rose-50 dark:bg-rose-900/30"
            accentColor="bg-rose-500"
            items={periodLockItems}
            emptyMessage="All periods locked."
          />
        </div>
      </div>

      {/* Alert Detail Modal */}
      <PageModal
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        title="Finance Alert Detail"
        subtitle={selectedAlert?.relatedId || ""}
        badges={selectedAlert ? <StatusBadge status={selectedAlert.severity === "critical" ? "Critical" : selectedAlert.severity === "warning" ? "Warning" : "Info"} /> : undefined}
      >
        {selectedAlert && (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alert Message</label>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{selectedAlert.message}</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Details</label>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{selectedAlert.detail}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Severity</label>
                <p className="mt-1"><StatusBadge status={selectedAlert.severity === "critical" ? "Critical" : selectedAlert.severity === "warning" ? "Warning" : "Info"} /></p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Related</label>
                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1">{selectedAlert.relatedId}</p>
              </div>
            </div>
          </div>
        )}
      </PageModal>

      {/* Work Queue Item Modal */}
      <PageModal
        isOpen={!!selectedQueueItem}
        onClose={() => setSelectedQueueItem(null)}
        title={selectedQueueItem?.label || ""}
        subtitle={selectedQueueItem?.type ? `Category: ${selectedQueueItem.type}` : ""}
        badges={selectedQueueItem ? <StatusBadge status="Pending" /> : undefined}
      >
        {selectedQueueItem && (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Item</label>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{selectedQueueItem.label}</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Details</label>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{selectedQueueItem.sublabel}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Action Required</label>
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">{selectedQueueItem.actionLabel}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</label>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 capitalize">{selectedQueueItem.type}</p>
              </div>
            </div>
          </div>
        )}
      </PageModal>
    </FinanceLayout>
  );
};

export default FINDashboard;
