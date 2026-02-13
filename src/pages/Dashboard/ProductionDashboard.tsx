// ==========================================
// ProductionDashboard.tsx
// Production Manager — Dashboard Page
// Shows KPI cards, alerts panel, pending actions,
// and recent activity feed for the branch.
// ==========================================

import React, { useState } from "react";
import ProductionLayout from "../../layout/ProductionLayout";
import StatsCard from "../../components/ui/StatsCard";
import WorkQueueCard, { type WorkQueueItem } from "../../components/ui/WorkQueueCard";
import ActivityFeed, { type ActivityItem } from "../../components/ui/ActivityFeed";
import AlertPanel, { type AlertItem } from "../../components/ui/AlertPanel";
import { StatusBadge } from "../../components/ui/StatusBadge";
import {
  ClipboardList,
  Hammer,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  ListTodo,
  PackageCheck,
} from "lucide-react";

// ------------------------------------------
// Mock data
// ------------------------------------------
const kpiCards = [
  { title: "Active Plans", value: 12, icon: ClipboardList, color: "bg-indigo-500", trend: "+2 this week", trendUp: true },
  { title: "Open Work Orders", value: 28, icon: Hammer, color: "bg-blue-500", trend: "3 created today", trendUp: true },
  { title: "Delayed Work Orders", value: 4, icon: AlertTriangle, color: "bg-rose-500", trend: "+1 since yesterday", trendUp: false },
  { title: "Completed Today", value: 7, icon: CheckCircle2, color: "bg-emerald-500", trend: "vs 5 yesterday", trendUp: true },
  { title: "Avg Completion Time", value: "3.2d", icon: Clock, color: "bg-amber-500", trend: "-0.5d from last week", trendUp: true },
  { title: "Output vs Target", value: "87%", icon: TrendingUp, color: "bg-violet-500", trend: "+4% this month", trendUp: true },
];

const alertItems: AlertItem[] = [
  { id: "a1", severity: "critical", message: "WO-105 is 3 days past due date — immediate attention required.", actionLabel: "View WO", onAction: () => {} },
  { id: "a2", severity: "warning", message: "Missing materials for WO-108 — Cotton Twill not available in warehouse.", actionLabel: "View WO", onAction: () => {} },
  { id: "a3", severity: "warning", message: "QA rejection spike: 12% reject rate on WO-101 batch.", actionLabel: "View WO", onAction: () => {} },
  { id: "a4", severity: "info", message: "Low efficiency warning: Line B running at 62% capacity.", actionLabel: "View", onAction: () => {} },
];

const pendingStartItems: WorkQueueItem[] = [
  { id: "ps1", label: "WO-110 — Basic Tee V2.0", sublabel: "Planned Qty: 500 pcs · Start: Feb 15", status: <StatusBadge status="Pending" />, onAction: () => {}, actionLabel: "Start" },
  { id: "ps2", label: "WO-111 — Polo Shirt V1.3", sublabel: "Planned Qty: 300 pcs · Start: Feb 16", status: <StatusBadge status="Pending" />, onAction: () => {}, actionLabel: "Start" },
];

const pendingCloseItems: WorkQueueItem[] = [
  { id: "pc1", label: "WO-099 — Hoodie V1.1", sublabel: "Produced: 450/450 pcs · 100%", status: <StatusBadge status="Completed" />, onAction: () => {}, actionLabel: "Close" },
  { id: "pc2", label: "WO-096 — Joggers V2.0", sublabel: "Produced: 600/600 pcs · 100%", status: <StatusBadge status="Completed" />, onAction: () => {}, actionLabel: "Close" },
];

const reworkItems: WorkQueueItem[] = [
  { id: "rw1", label: "WO-101 — Denim Jacket V1.0", sublabel: "QA rejected 15 pcs — stitching defect", status: <StatusBadge status="Rejected" />, onAction: () => {}, actionLabel: "Review" },
];

const recentActivities: ActivityItem[] = [
  { id: "ra1", message: "WO-102 started production (500 pcs)", timestamp: "10 minutes ago", type: "info" },
  { id: "ra2", message: "WO-099 completed — 450 units produced", timestamp: "32 minutes ago", type: "success" },
  { id: "ra3", message: "QA rejected batch from WO-101 — 15 pcs failed inspection", timestamp: "1 hour ago", type: "error" },
  { id: "ra4", message: "Production Plan PP-015 created for Polo Shirt V1.3", timestamp: "2 hours ago", type: "info" },
  { id: "ra5", message: "WO-098 handed over to warehouse — 300 pcs", timestamp: "3 hours ago", type: "success" },
  { id: "ra6", message: "Material request fulfilled for WO-107", timestamp: "4 hours ago", type: "info" },
];

// ==========================================
// Component
// ==========================================
const ProductionDashboard: React.FC = () => {
  const [_refresh] = useState(0);
  void _refresh;

  return (
    <ProductionLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Production Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time manufacturing health — Manila Branch</p>
      </div>

      {/* KPI Cards — 3 per row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {kpiCards.map((kpi) => (
          <StatsCard key={kpi.title} title={kpi.title} value={kpi.value} icon={kpi.icon} color={kpi.color} trend={kpi.trend} trendUp={kpi.trendUp} />
        ))}
      </div>

      {/* Alerts Panel */}
      <div className="mb-8">
        <AlertPanel title="Active Alerts" items={alertItems} />
      </div>

      {/* Work Queues + Recent Activity — 2 per row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WorkQueueCard
          title="Work Orders Waiting to Start"
          icon={ListTodo}
          iconColor="text-amber-600 dark:text-amber-400"
          iconBg="bg-amber-50 dark:bg-amber-900/30"
          accentColor="bg-amber-500"
          items={pendingStartItems}
          emptyMessage="No work orders waiting to start."
        />
        <WorkQueueCard
          title="Work Orders Waiting to Close"
          icon={PackageCheck}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-50 dark:bg-emerald-900/30"
          accentColor="bg-emerald-500"
          items={pendingCloseItems}
          emptyMessage="No work orders waiting to close."
        />
        <WorkQueueCard
          title="QA Rework Required"
          icon={AlertTriangle}
          iconColor="text-rose-600 dark:text-rose-400"
          iconBg="bg-rose-50 dark:bg-rose-900/30"
          accentColor="bg-rose-500"
          items={reworkItems}
          emptyMessage="No rework items."
        />
        <ActivityFeed title="Recent Activity" items={recentActivities} />
      </div>
    </ProductionLayout>
  );
};

export default ProductionDashboard;
