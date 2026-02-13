// ==========================================
// QADashboard.tsx
// Quality Manager — Dashboard Page
// Shows KPI cards, alerts panel, defect trends,
// and work queue for the branch.
// ==========================================

import React, { useState } from "react";
import QALayout from "../../layout/QALayout";
import StatsCard from "../../components/ui/StatsCard";
import WorkQueueCard, { type WorkQueueItem } from "../../components/ui/WorkQueueCard";
import AlertPanel, { type AlertItem } from "../../components/ui/AlertPanel";
import DefectTrendChart, { type TrendDataPoint } from "../../components/ui/DefectTrendChart";
import { StatusBadge } from "../../components/ui/StatusBadge";
import PageModal from "../../components/ui/PageModal";
import Toast from "../../components/ui/Toast";
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Percent,
  ShieldAlert,
  Bug,
  ListTodo,
  RotateCcw,
  TrendingDown,
  BarChart3,
  Lock,
} from "lucide-react";

// ------------------------------------------
// Mock data
// ------------------------------------------
const kpiCards = [
  { title: "Pending Inspections", value: 14, icon: ClipboardList, color: "bg-indigo-500", trend: "+3 today", trendUp: false },
  { title: "Approved Batches", value: 42, icon: CheckCircle2, color: "bg-emerald-500", trend: "+5 this week", trendUp: true },
  { title: "Rejected Batches", value: 6, icon: XCircle, color: "bg-rose-500", trend: "+2 this week", trendUp: false },
  { title: "Rejection Rate", value: "12.5%", icon: Percent, color: "bg-amber-500", trend: "+2.1% vs last week", trendUp: false },
  { title: "Open CAPA", value: 8, icon: ShieldAlert, color: "bg-violet-500", trend: "3 overdue", trendUp: false },
  { title: "Top Defect Type", value: "Stitching", icon: Bug, color: "bg-blue-500", trend: "34 occurrences", trendUp: false },
];

const defectTrendData: TrendDataPoint[] = [
  { label: "Mon", value: 8 },
  { label: "Tue", value: 12 },
  { label: "Wed", value: 6 },
  { label: "Thu", value: 15 },
  { label: "Fri", value: 9 },
  { label: "Sat", value: 3 },
  { label: "Sun", value: 1 },
];

const topDefectCategories: TrendDataPoint[] = [
  { label: "Stitching", value: 34 },
  { label: "Fabric", value: 18 },
  { label: "Color", value: 12 },
  { label: "Size", value: 8 },
  { label: "Finish", value: 5 },
];

// ------------------------------------------
// Alert items with modal support
// ------------------------------------------
interface DashboardAlert extends AlertItem {
  detail?: string;
  relatedId?: string;
}

const alertItemsData: DashboardAlert[] = [
  { id: "a1", severity: "critical", message: "Rejection rate exceeded 10% threshold — currently at 12.5%.", actionLabel: "View Report", detail: "The weekly rejection rate has crossed the 10% alert threshold. Current rate is 12.5%, up from 10.4% last week. Primarily driven by stitching defects on Hoodie V1.1 and Denim Jacket V1.0.", relatedId: "QA Reports" },
  { id: "a2", severity: "critical", message: "High severity defect detected in WO-105 — fabric tear on 15 units.", actionLabel: "View Inspection", detail: "INS-012 detected fabric tear on 15 units of Denim Jacket V1.0 (WO-105). Severity: High. CAPA-005 has been created. Rework recommended before re-inspection.", relatedId: "INS-012" },
  { id: "a3", severity: "warning", message: "Recurring stitching defect on SKU-002 (Hoodie) — reported 6 times in 7 days.", actionLabel: "View Defects", detail: "Stitching defect DEF-001 has been reported 6 times in 7 days on Hoodie V1.1 (SKU-002). Root cause analysis ongoing under CAPA-003. Machine #3 thread tension suspected.", relatedId: "DEF-001" },
  { id: "a4", severity: "warning", message: "Inspection INS-018 overdue by 2 days — WO-108 not yet inspected.", actionLabel: "View Inspection", detail: "INS-018 for Cargo Pants V1.2 (WO-108) was due on Feb 11 and is now 2 days overdue. No inspector has been assigned. Qty: 350 pcs.", relatedId: "INS-018" },
  { id: "a5", severity: "info", message: "CAPA-003 verification due tomorrow for stitching defect corrective action.", actionLabel: "View CAPA", detail: "CAPA-003 corrective actions have been completed. QA verification is scheduled for tomorrow to confirm that stitching defect recurrence has stopped after machine recalibration and operator retraining.", relatedId: "CAPA-003" },
];

// ==========================================
// Component
// ==========================================
const QADashboard: React.FC = () => {
  const [_refresh] = useState(0);
  void _refresh;

  // Modal state for alert details
  const [selectedAlert, setSelectedAlert] = useState<DashboardAlert | null>(null);
  // Modal state for work queue items
  const [selectedQueueItem, setSelectedQueueItem] = useState<{ label: string; sublabel?: string; actionLabel?: string; type: string } | null>(null);
  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Wire up alert items with onAction
  const alertItems: AlertItem[] = alertItemsData.map((a) => ({
    ...a,
    onAction: () => setSelectedAlert(a),
  }));

  // Wire up work queue items with modals
  const inspectionQueueItems: WorkQueueItem[] = [
    { id: "wq1", label: "INS-021 — Basic Tee V2.0 (WO-102)", sublabel: "500 pcs · Due: Today", status: <StatusBadge status="Pending" />, onAction: () => setSelectedQueueItem({ label: "INS-021 — Basic Tee V2.0 (WO-102)", sublabel: "500 pcs · Due: Today · Inspector: Ana Reyes", actionLabel: "Review", type: "inspection" }), actionLabel: "Review" },
    { id: "wq2", label: "INS-022 — Joggers V2.0 (WO-107)", sublabel: "400 pcs · Due: Today", status: <StatusBadge status="Pending" />, onAction: () => setSelectedQueueItem({ label: "INS-022 — Joggers V2.0 (WO-107)", sublabel: "400 pcs · Due: Today · Inspector: Ana Reyes", actionLabel: "Review", type: "inspection" }), actionLabel: "Review" },
    { id: "wq3", label: "INS-018 — Cargo Pants (WO-108)", sublabel: "350 pcs · Due: 2 days ago", status: <StatusBadge status="Overdue" />, onAction: () => setSelectedQueueItem({ label: "INS-018 — Cargo Pants (WO-108)", sublabel: "350 pcs · Due: 2 days ago · Inspector: Unassigned", actionLabel: "Review", type: "inspection" }), actionLabel: "Review" },
  ];

  const capaPendingItems: WorkQueueItem[] = [
    { id: "cp1", label: "CAPA-005 — Stitching defect (WO-101)", sublabel: "Root cause analysis pending · Due: Feb 18", status: <StatusBadge status="In Progress" />, onAction: () => setSelectedQueueItem({ label: "CAPA-005 — Stitching defect (WO-101)", sublabel: "Root cause analysis pending · Due: Feb 18 · Assigned: Maria Santos (Production)", actionLabel: "Update", type: "capa" }), actionLabel: "Update" },
    { id: "cp2", label: "CAPA-003 — Color bleed (WO-095)", sublabel: "Verification pending · Due: Feb 14", status: <StatusBadge status="Pending" />, onAction: () => setSelectedQueueItem({ label: "CAPA-003 — Color bleed (WO-095)", sublabel: "Verification pending · Due: Feb 14 · Assigned: Maria Santos (Production)", actionLabel: "Verify", type: "capa" }), actionLabel: "Verify" },
  ];

  const reinspectionItems: WorkQueueItem[] = [
    { id: "ri1", label: "INS-015 (Re-inspect) — Hoodie V1.1", sublabel: "15 pcs reworked — QA verification needed", status: <StatusBadge status="Under Review" />, onAction: () => setSelectedQueueItem({ label: "INS-015 (Re-inspect) — Hoodie V1.1", sublabel: "15 pcs reworked — QA verification needed · Inspector: Carlos Tan", actionLabel: "Inspect", type: "reinspect" }), actionLabel: "Inspect" },
  ];

  return (
    <QALayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div className="max-w-7xl mx-auto space-y-6 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Quality Dashboard</h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Real-time quality health — Manila Branch</p>
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

        {/* Alerts Panel + Work Queues — 2 per row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quality Risk Alerts */}
          <AlertPanel title="Quality Risk Alerts" items={alertItems} />

          {/* Inspections Waiting for Review */}
          <WorkQueueCard
            title="Inspections Waiting for Review"
            icon={ListTodo}
            iconColor="text-indigo-600 dark:text-indigo-400"
            iconBg="bg-indigo-50 dark:bg-indigo-900/30"
            accentColor="bg-indigo-500"
            items={inspectionQueueItems}
            emptyMessage="No inspections in queue."
          />

          {/* CAPA Pending Completion */}
          <WorkQueueCard
            title="CAPA Pending Completion"
            icon={ShieldAlert}
            iconColor="text-violet-600 dark:text-violet-400"
            iconBg="bg-violet-50 dark:bg-violet-900/30"
            accentColor="bg-violet-500"
            items={capaPendingItems}
            emptyMessage="No open CAPA items."
          />

          {/* Re-inspection Required */}
          <WorkQueueCard
            title="Re-inspection Required"
            icon={RotateCcw}
            iconColor="text-amber-600 dark:text-amber-400"
            iconBg="bg-amber-50 dark:bg-amber-900/30"
            accentColor="bg-amber-500"
            items={reinspectionItems}
            emptyMessage="No re-inspections needed."
          />
        </div>

        {/* Defect Trends — 2 per row, modernized */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DefectTrendChart
            title="Defects This Week"
            data={defectTrendData}
            gradientFrom="#f43f5e"
            gradientTo="#fb7185"
            icon={TrendingDown}
            iconBg="bg-rose-50 dark:bg-rose-900/30"
            iconColor="text-rose-600 dark:text-rose-400"
          />
          <DefectTrendChart
            title="Top 5 Defect Categories"
            data={topDefectCategories}
            gradientFrom="#f59e0b"
            gradientTo="#fbbf24"
            icon={BarChart3}
            iconBg="bg-amber-50 dark:bg-amber-900/30"
            iconColor="text-amber-600 dark:text-amber-400"
          />
        </div>
      </div>

      {/* Alert Detail Modal */}
      <PageModal
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        title="Alert Detail"
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
        subtitle={selectedQueueItem?.sublabel || ""}
        badges={selectedQueueItem ? <StatusBadge status={selectedQueueItem.type === "inspection" ? "Pending" : selectedQueueItem.type === "capa" ? "In Progress" : "Under Review"} /> : undefined}
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
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 capitalize">{selectedQueueItem.type === "reinspect" ? "Re-inspection" : selectedQueueItem.type.toUpperCase()}</p>
              </div>
            </div>
          </div>
        )}
      </PageModal>
    </QALayout>
  );
};

export default QADashboard;
