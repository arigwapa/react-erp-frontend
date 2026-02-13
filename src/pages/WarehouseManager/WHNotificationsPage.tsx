// ==========================================
// WHNotificationsPage.tsx
// Warehouse Manager — Notifications / Tasks
// Tabs: Tasks, Alerts, System Messages
// ==========================================

import React, { useState, useMemo } from "react";
import WarehouseLayout from "../../layout/WarehouseLayout";
import TabBar from "../../components/ui/TabBar";
import { StatusBadge } from "../../components/ui/StatusBadge";
import PageModal from "../../components/ui/PageModal";
import Toast from "../../components/ui/Toast";
import SecondaryButton from "../../components/ui/SecondaryButton";
import {
  PackageCheck,
  ClipboardEdit,
  ArrowLeftRight,
  AlertTriangle,
  PackageX,
  TrendingDown,
  Settings,
  Database,
  Eye,
  CheckCircle2,
} from "lucide-react";

// ------------------------------------------
// Types
// ------------------------------------------
interface Notification {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  time: string;
  status: string;
  tab: "tasks" | "alerts" | "system";
}

// ------------------------------------------
// Mock data
// ------------------------------------------
const notifications: Notification[] = [
  // Tasks
  { id: "t1", icon: PackageCheck, title: "Receive finished goods — WO-102", description: "500 pcs Basic Tee V2.0 approved by QA. Receive into warehouse.", time: "10 min ago", status: "Pending", tab: "tasks" },
  { id: "t2", icon: PackageCheck, title: "Receive finished goods — WO-096", description: "600 pcs Joggers V2.0 approved by QA.", time: "25 min ago", status: "Pending", tab: "tasks" },
  { id: "t3", icon: ClipboardEdit, title: "Approve adjustment — ADJ-045", description: "Denim Fabric −50 rolls. Reason: Physical count discrepancy.", time: "1 hour ago", status: "Under Review", tab: "tasks" },
  { id: "t4", icon: ClipboardEdit, title: "Approve adjustment — ADJ-046", description: "Elastic Band +10 rolls. Reason: Unreported return.", time: "2 hours ago", status: "Pending", tab: "tasks" },
  { id: "t5", icon: ArrowLeftRight, title: "Confirm transfer — TRF-012", description: "Silk Fabric: Storage A → Storage B, 30 rolls.", time: "3 hours ago", status: "Pending", tab: "tasks" },
  // Alerts
  { id: "a1", icon: AlertTriangle, title: "Low stock — Cotton Fabric (MAT-001)", description: "Current: 15m, Minimum: 100m. Reorder immediately.", time: "5 min ago", status: "Critical", tab: "alerts" },
  { id: "a2", icon: PackageX, title: "Negative inventory — Elastic Band (MAT-012)", description: "Current balance: −3 rolls. Investigate stock movement.", time: "30 min ago", status: "Critical", tab: "alerts" },
  { id: "a3", icon: TrendingDown, title: "Large discrepancy — Denim Fabric", description: "Physical count differs by −50 rolls from system record.", time: "1 hour ago", status: "Warning", tab: "alerts" },
  { id: "a4", icon: AlertTriangle, title: "Low stock — Polyester Thread (MAT-008)", description: "Current: 120 spools, approaching minimum of 100.", time: "3 hours ago", status: "Warning", tab: "alerts" },
  // System Messages
  { id: "s1", icon: Database, title: "Master data update — New material added", description: "Linen Blend (MAT-025) added to material library by PLM Manager.", time: "1 hour ago", status: "Info", tab: "system" },
  { id: "s2", icon: Settings, title: "Workflow rule change — Auto-reorder threshold", description: "Auto-reorder trigger changed from 20% to 15% of minimum.", time: "4 hours ago", status: "Info", tab: "system" },
  { id: "s3", icon: Settings, title: "System maintenance scheduled", description: "Inventory sync maintenance window: Feb 15, 2:00–4:00 AM.", time: "1 day ago", status: "Info", tab: "system" },
];

const tabs = [
  { id: "tasks", label: "Tasks", icon: PackageCheck, count: 5 },
  { id: "alerts", label: "Alerts", icon: AlertTriangle, count: 4 },
  { id: "system", label: "System Messages", icon: Settings, count: 3 },
];

// ==========================================
// Component
// ==========================================
const WHNotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("tasks");
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const filtered = useMemo(
    () => notifications.filter((n) => n.tab === activeTab),
    [activeTab]
  );

  const handleView = (notif: Notification) => {
    setSelectedNotif(notif);
  };

  const handleAction = (notif: Notification) => {
    setToast({ message: `Action started for: ${notif.title}`, type: "success" });
    setSelectedNotif(null);
  };

  return (
    <WarehouseLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications / Tasks</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Stay on top of warehouse tasks, alerts, and system messages</p>
      </div>

      {/* Tabs */}
      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Table */}
      <div className="mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Notification</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filtered.length > 0 ? (
                filtered.map((n) => {
                  const Icon = n.icon;
                  return (
                    <tr key={n.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                            <Icon size={14} className="text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{n.title}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">{n.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{n.time}</td>
                      <td className="px-6 py-3"><StatusBadge status={n.status} /></td>
                      <td className="px-6 py-3 text-left">
                        <div className="flex items-center justify-start gap-1">
                          <button onClick={() => handleView(n)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="View"><Eye size={14} /></button>
                          {n.tab === "tasks" && (
                            <button
                              onClick={() => handleAction(n)}
                              className="inline-flex items-center gap-1 whitespace-nowrap text-left.5 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-all active:scale-95"
                              title="Take Action"
                            >
                              <CheckCircle2 size={13} />
                              Action
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-400 italic">No notifications in this category.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <PageModal
        isOpen={!!selectedNotif}
        onClose={() => setSelectedNotif(null)}
        title={selectedNotif?.title || ""}
        subtitle={selectedNotif?.time}
        badges={selectedNotif ? <StatusBadge status={selectedNotif.status} /> : undefined}
        footer={
          selectedNotif?.tab === "tasks" ? (
            <div className="flex items-center gap-3">
              <SecondaryButton onClick={() => setSelectedNotif(null)}>Close</SecondaryButton>
              <button onClick={() => handleAction(selectedNotif)} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors">Take Action</button>
            </div>
          ) : undefined
        }
      >
        {selectedNotif && (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{selectedNotif.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</label>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-1 capitalize">{selectedNotif.tab}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Received</label>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedNotif.time}</p>
              </div>
            </div>
          </div>
        )}
      </PageModal>
    </WarehouseLayout>
  );
};

export default WHNotificationsPage;
