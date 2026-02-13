// ==========================================
// WHDashboard.tsx
// Warehouse Manager — Dashboard Page
// Shows KPI cards, alerts panel, recent activity
// feed, and pending actions widget for the branch.
// ==========================================

import React, { useState } from "react";
import WarehouseLayout from "../../layout/WarehouseLayout";
import StatsCard from "../../components/ui/StatsCard";
import WorkQueueCard, { type WorkQueueItem } from "../../components/ui/WorkQueueCard";
import AlertPanel, { type AlertItem } from "../../components/ui/AlertPanel";
import ActivityFeed, { type ActivityItem } from "../../components/ui/ActivityFeed";
import { StatusBadge } from "../../components/ui/StatusBadge";
import PageModal from "../../components/ui/PageModal";
import Toast from "../../components/ui/Toast";
import {
  Package,
  AlertTriangle,
  PackageX,
  ArrowDownToLine,
  ArrowUpFromLine,
  PackageCheck,
  ClipboardEdit,
  ArrowLeftRight,
  Lock,
} from "lucide-react";

// ------------------------------------------
// Mock data
// ------------------------------------------
const kpiCards = [
  { title: "Total Materials in Stock", value: 1247, icon: Package, color: "bg-indigo-500", trend: "+12 today", trendUp: true },
  { title: "Low-Stock Items", value: 18, icon: AlertTriangle, color: "bg-amber-500", trend: "+3 vs yesterday", trendUp: false },
  { title: "Out-of-Stock Items", value: 4, icon: PackageX, color: "bg-rose-500", trend: "2 critical", trendUp: false },
  { title: "Today's Stock-In", value: 340, icon: ArrowDownToLine, color: "bg-emerald-500", trend: "units received", trendUp: true },
  { title: "Today's Stock-Out", value: 185, icon: ArrowUpFromLine, color: "bg-blue-500", trend: "units dispatched", trendUp: true },
  { title: "Pending Production Intake", value: 5, icon: PackageCheck, color: "bg-violet-500", trend: "QA-approved batches", trendUp: false },
];

// Alert items with detail data for modals
interface DashboardAlert extends AlertItem {
  detail?: string;
  relatedId?: string;
}

const alertItemsData: DashboardAlert[] = [
  { id: "a1", severity: "critical", message: "Cotton Fabric (MAT-001) below minimum level — 15m remaining, minimum is 100m.", actionLabel: "View Inventory", detail: "MAT-001 Cotton Fabric is critically low at 15 meters. The minimum reorder level is 100 meters. Immediate reorder from supplier recommended. This affects ongoing production for Basic Tee V2.0 (WO-102).", relatedId: "MAT-001" },
  { id: "a2", severity: "critical", message: "Negative stock anomaly detected on Elastic Band (MAT-012) — current: −3 rolls.", actionLabel: "View Movement", detail: "MAT-012 Elastic Band shows negative inventory (−3 rolls). This indicates a stock-out occurred without proper adjustment. Investigation required — likely an unrecorded issue.", relatedId: "MAT-012" },
  { id: "a3", severity: "warning", message: "Unreceived QA-approved batch from WO-102 — approved 2 days ago, still pending intake.", actionLabel: "View Intake", detail: "Work Order WO-102 (Basic Tee V2.0, 500 pcs) was approved by QA on Feb 11 but has not been received into the warehouse. This delays inventory availability and finance costing.", relatedId: "WO-102" },
  { id: "a4", severity: "warning", message: "Large manual adjustment pending approval: Denim Fabric −50 rolls (ADJ-045).", actionLabel: "View Adjustment", detail: "ADJ-045 requests a −50 roll adjustment for Denim Fabric. Reason: Physical count discrepancy found during warehouse audit. This is a large adjustment and requires Branch Admin review.", relatedId: "ADJ-045" },
  { id: "a5", severity: "info", message: "Polyester Thread (MAT-008) approaching minimum level — 120 spools remaining (min: 100).", actionLabel: "View Inventory", detail: "MAT-008 Polyester Thread is at 120 spools, approaching the minimum threshold of 100. No immediate action required but reorder should be planned.", relatedId: "MAT-008" },
];

const recentActivities: ActivityItem[] = [
  { id: "ac1", message: "Stock-in: 50m Cotton Fabric received from Supplier PO-2045", timestamp: "2 minutes ago", type: "success" },
  { id: "ac2", message: "Stock-out: 200 pcs SKU-Dress-01 to Shipment SHP-089", timestamp: "15 minutes ago", type: "info" },
  { id: "ac3", message: "Adjustment: −5 rolls Denim Fabric (approved by Branch Admin)", timestamp: "1 hour ago", type: "warning" },
  { id: "ac4", message: "Received finished goods from WO-099: 450 pcs Hoodie", timestamp: "2 hours ago", type: "success" },
  { id: "ac5", message: "Transfer: 30 rolls Silk from Storage A to Storage B", timestamp: "3 hours ago", type: "info" },
  { id: "ac6", message: "Stock-out: 150 pcs SKU-Tee-02 to Production WO-107", timestamp: "4 hours ago", type: "info" },
];

// ==========================================
// Component
// ==========================================
const WHDashboard: React.FC = () => {
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
  const intakeItems: WorkQueueItem[] = [
    { id: "pi1", label: "WO-102 — Basic Tee V2.0", sublabel: "500 pcs · QA Approved: Feb 11", status: <StatusBadge status="Pending" />, onAction: () => setSelectedQueueItem({ label: "WO-102 — Basic Tee V2.0", sublabel: "500 pcs · QA Approved: Feb 11 · Storage: TBD", actionLabel: "Receive", type: "intake" }), actionLabel: "Receive" },
    { id: "pi2", label: "WO-096 — Joggers V2.0", sublabel: "600 pcs · QA Approved: Feb 12", status: <StatusBadge status="Pending" />, onAction: () => setSelectedQueueItem({ label: "WO-096 — Joggers V2.0", sublabel: "600 pcs · QA Approved: Feb 12 · Storage: TBD", actionLabel: "Receive", type: "intake" }), actionLabel: "Receive" },
    { id: "pi3", label: "WO-099 — Hoodie V1.1 (Rework)", sublabel: "15 pcs · QA Approved: Feb 13", status: <StatusBadge status="Pending" />, onAction: () => setSelectedQueueItem({ label: "WO-099 — Hoodie V1.1 (Rework)", sublabel: "15 pcs · QA Approved: Feb 13 · Rework batch", actionLabel: "Receive", type: "intake" }), actionLabel: "Receive" },
  ];

  const adjustmentItems: WorkQueueItem[] = [
    { id: "aj1", label: "ADJ-045 — Denim Fabric", sublabel: "−50 rolls · Reason: Physical count discrepancy", status: <StatusBadge status="Under Review" />, onAction: () => setSelectedQueueItem({ label: "ADJ-045 — Denim Fabric", sublabel: "−50 rolls · Physical count discrepancy · Requested by: Warehouse Manager", actionLabel: "Review", type: "adjustment" }), actionLabel: "Review" },
    { id: "aj2", label: "ADJ-046 — Elastic Band", sublabel: "+10 rolls · Reason: Unreported return", status: <StatusBadge status="Pending" />, onAction: () => setSelectedQueueItem({ label: "ADJ-046 — Elastic Band", sublabel: "+10 rolls · Unreported return · Requested by: Warehouse Staff B", actionLabel: "Review", type: "adjustment" }), actionLabel: "Review" },
  ];

  const transferItems: WorkQueueItem[] = [
    { id: "tf1", label: "TRF-012 — Silk Fabric", sublabel: "Storage A → Storage B · 30 rolls", status: <StatusBadge status="Pending" />, onAction: () => setSelectedQueueItem({ label: "TRF-012 — Silk Fabric", sublabel: "Storage A → Storage B · 30 rolls · Initiated by: Warehouse Staff A", actionLabel: "Confirm", type: "transfer" }), actionLabel: "Confirm" },
  ];

  return (
    <WarehouseLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto space-y-6 pb-20">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Warehouse Dashboard</h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Real-time inventory health — Manila Branch</p>
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

        {/* Alerts + Activity — 2 per row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AlertPanel title="Inventory Risk Alerts" items={alertItems} />
          <ActivityFeed title="Recent Activity Feed" items={recentActivities} />
        </div>

        {/* Pending Actions — 2 per row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WorkQueueCard
            title="QA-Approved Batches for Intake"
            icon={PackageCheck}
            iconColor="text-violet-600 dark:text-violet-400"
            iconBg="bg-violet-50 dark:bg-violet-900/30"
            accentColor="bg-violet-500"
            items={intakeItems}
            emptyMessage="No pending production intake."
          />
          <WorkQueueCard
            title="Adjustment Approvals Required"
            icon={ClipboardEdit}
            iconColor="text-amber-600 dark:text-amber-400"
            iconBg="bg-amber-50 dark:bg-amber-900/30"
            accentColor="bg-amber-500"
            items={adjustmentItems}
            emptyMessage="No pending adjustments."
          />
          <WorkQueueCard
            title="Transfer Confirmations Pending"
            icon={ArrowLeftRight}
            iconColor="text-blue-600 dark:text-blue-400"
            iconBg="bg-blue-50 dark:bg-blue-900/30"
            accentColor="bg-blue-500"
            items={transferItems}
            emptyMessage="No pending transfers."
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
    </WarehouseLayout>
  );
};

export default WHDashboard;
