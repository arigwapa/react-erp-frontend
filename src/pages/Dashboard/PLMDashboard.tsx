// ==========================================
// PLMDashboard.tsx — PLM Manager Dashboard
// Branch-scoped dashboard showing KPI cards,
// work queue panels (pending approvals, missing
// BOM, blocked releases), and recent activity.
// ==========================================

import { useState, useMemo } from "react";
import {
  Package,
  FileText,
  CheckCircle,
  AlertTriangle,
  Rocket,
  Clock,
  Layers,
  Lock,
  Download,
} from "lucide-react";

// ------------------------------------------
// Layout & Reusable UI Components
// ------------------------------------------
import PLMLayout from "../../layout/PLMLayout";
import StatsCard from "../../components/ui/StatsCard";
import WorkQueueCard from "../../components/ui/WorkQueueCard";
import type { WorkQueueItem } from "../../components/ui/WorkQueueCard";
import ActivityFeed from "../../components/ui/ActivityFeed";
import type { ActivityItem } from "../../components/ui/ActivityFeed";
import { StatusBadge } from "../../components/ui/StatusBadge";
import SecondaryButton from "../../components/ui/SecondaryButton";
import Toast from "../../components/ui/Toast";

// ==========================================
// Mock Data — KPI Source
// ==========================================

const MOCK_STATS = {
  totalProducts: 24,
  draftVersions: 6,
  pendingApproval: 4,
  approvedVersions: 10,
  readyForRelease: 5,
  releasedToProduction: 8,
};

// ==========================================
// Mock Data — Work Queue
// ==========================================

const PENDING_APPROVALS: WorkQueueItem[] = [
  { id: "VA-001", label: "Classic Denim Jacket v2.1", sublabel: "Submitted by Design Team A · Feb 12, 2026", status: <StatusBadge status="Pending" /> },
  { id: "VA-002", label: "Floral Summer Dress v1.1", sublabel: "Submitted by Design Team B · Feb 11, 2026", status: <StatusBadge status="Pending" /> },
  { id: "VA-003", label: "Knit Crew Sweater v1.0", sublabel: "Submitted by Junior Designer · Feb 10, 2026", status: <StatusBadge status="Pending" /> },
  { id: "VA-004", label: "Wool Trench Coat v2.0", sublabel: "Submitted by Senior Designer · Feb 9, 2026", status: <StatusBadge status="Pending" /> },
];

const MISSING_BOM: WorkQueueItem[] = [
  { id: "MB-001", label: "Knit Crew Sweater v1.0", sublabel: "SKU: MNL-SWT-006 · No BOM lines found" },
  { id: "MB-002", label: "Floral Summer Dress v1.1", sublabel: "SKU: MNL-DRS-002 · BOM incomplete (2/5 lines)" },
];

const BLOCKED_RELEASES: WorkQueueItem[] = [
  { id: "BR-001", label: "Classic Denim Jacket v2.1", sublabel: "Reason: Version not approved" },
  { id: "BR-002", label: "Knit Crew Sweater v1.0", sublabel: "Reason: No BOM + Not approved" },
  { id: "BR-003", label: "Floral Summer Dress v1.1", sublabel: "Reason: BOM incomplete" },
];

// ==========================================
// Mock Data — Recent Activity
// ==========================================

const RECENT_ACTIVITY: ActivityItem[] = [
  { id: "ACT-001", message: "SKU-001 V1.2 updated tech pack", timestamp: "5 minutes ago", type: "info" },
  { id: "ACT-002", message: "BOM updated: added Cotton Fabric to MNL-JKT-001", timestamp: "15 minutes ago", type: "success" },
  { id: "ACT-003", message: "Released VersionID 45 to Production", timestamp: "1 hour ago", type: "success" },
  { id: "ACT-004", message: "Version v2.1 submitted for approval — Classic Denim Jacket", timestamp: "2 hours ago", type: "info" },
  { id: "ACT-005", message: "Wool Trench Coat v2.0 rejected — insufficient QA data", timestamp: "3 hours ago", type: "warning" },
  { id: "ACT-006", message: "New material added: Organic Cotton Blend", timestamp: "5 hours ago", type: "info" },
  { id: "ACT-007", message: "Cargo Utility Pants v4.0 released to production line", timestamp: "Yesterday", type: "success" },
];

// ==========================================
// Main Component
// ==========================================
function PLMDashboard() {
  // ------------------------------------------
  // State: Toast
  // ------------------------------------------
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // ------------------------------------------
  // Computed: KPI Metrics
  // ------------------------------------------
  const stats = useMemo(() => MOCK_STATS, []);

  // ------------------------------------------
  // Handler: Export
  // ------------------------------------------
  const handleExport = () => {
    setToast({ message: "Exporting PLM Dashboard report...", type: "success" });
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <>
      <PLMLayout>
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
          {/* ============================================================
              PAGE HEADER
              ============================================================ */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                PLM Dashboard
              </h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                Branch-scoped overview of products, versions, approvals, and release readiness.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <SecondaryButton onClick={handleExport} icon={Download}>
                Export
              </SecondaryButton>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-semibold">
                <Lock size={12} />
                Branch: Manila
              </div>
            </div>
          </div>

          {/* ============================================================
              KPI STATS CARDS — 3 per row
              ============================================================ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatsCard title="Total Products" value={stats.totalProducts} icon={Package} color="bg-indigo-500" />
            <StatsCard title="Draft Versions" value={stats.draftVersions} icon={FileText} color="bg-slate-500" />
            <StatsCard title="Pending Approval" value={stats.pendingApproval} icon={Clock} color="bg-amber-500" />
            <StatsCard title="Approved" value={stats.approvedVersions} icon={CheckCircle} color="bg-blue-500" />
            <StatsCard title="Ready for Release" value={stats.readyForRelease} icon={Layers} color="bg-emerald-500" />
            <StatsCard title="Released" value={stats.releasedToProduction} icon={Rocket} color="bg-indigo-600" />
          </div>

          {/* ============================================================
              WORK QUEUE PANELS + RECENT ACTIVITY — 2 per row
              ============================================================ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WorkQueueCard
              title="Pending Version Approvals"
              icon={Clock}
              iconColor="text-amber-600"
              iconBg="bg-amber-50 dark:bg-amber-900/30"
              accentColor="bg-amber-500"
              items={PENDING_APPROVALS}
              emptyMessage="No pending approvals."
            />
            <WorkQueueCard
              title="Missing BOM"
              icon={AlertTriangle}
              iconColor="text-rose-600"
              iconBg="bg-rose-50 dark:bg-rose-900/30"
              accentColor="bg-rose-500"
              items={MISSING_BOM}
              emptyMessage="All versions have complete BOMs."
            />
            <WorkQueueCard
              title="Blocked Releases"
              icon={Rocket}
              iconColor="text-slate-600"
              iconBg="bg-slate-100 dark:bg-slate-800"
              accentColor="bg-slate-500"
              items={BLOCKED_RELEASES}
              emptyMessage="No blocked releases."
            />
            <ActivityFeed
              title="Recent Activity"
              items={RECENT_ACTIVITY}
              emptyMessage="No recent activity for this branch."
            />
          </div>
        </div>
      </PLMLayout>

      {/* ---- TOAST NOTIFICATION ---- */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

export default PLMDashboard;
