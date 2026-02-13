// ==========================================
// FINNotificationsPage.tsx
// Finance Manager — Notifications / Tasks
// Tabs: Approvals, Alerts, System Messages
// ==========================================

import React, { useState, useMemo } from "react";
import FinanceLayout from "../../layout/FinanceLayout";
import TabBar from "../../components/ui/TabBar";
import { StatusBadge } from "../../components/ui/StatusBadge";
import PageModal from "../../components/ui/PageModal";
import Toast from "../../components/ui/Toast";
import SecondaryButton from "../../components/ui/SecondaryButton";
import {
  Wallet,
  Lock,
  AlertTriangle,
  TrendingUp,
  Calculator,
  Settings,
  FileText,
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
  tab: "approvals" | "alerts" | "system";
  refId: string;
  type: string;
}

// ------------------------------------------
// Mock data
// ------------------------------------------
const notifications: Notification[] = [
  { id: "t1", icon: Wallet, refId: "BUD-2026-003", type: "Budget", title: "Budget approval — Summer Collection 2026", description: "₱500K additional budget requested for Summer Collection materials.", time: "15 min ago", status: "Pending", tab: "approvals" },
  { id: "t2", icon: Wallet, refId: "BUD-2026-004", type: "Budget", title: "Budget approval — Q2 Maintenance", description: "₱120K maintenance budget for sewing equipment.", time: "2 hours ago", status: "Pending", tab: "approvals" },
  { id: "t3", icon: Lock, refId: "PER-2026-01", type: "Lock", title: "Lock period confirmation — January 2026", description: "All cost records finalized. Ready for period closure.", time: "1 day ago", status: "Pending", tab: "approvals" },
  { id: "a1", icon: AlertTriangle, refId: "BUD-2026-003", type: "Budget", title: "Budget threshold exceeded — Summer Collection", description: "Utilization reached 94%, exceeding 90% threshold.", time: "10 min ago", status: "Critical", tab: "alerts" },
  { id: "a2", icon: TrendingUp, refId: "WO-105", type: "COGS", title: "High waste spike — WO-105", description: "8.5% waste rate detected. COGS impact: +₱18K.", time: "1 hour ago", status: "Warning", tab: "alerts" },
  { id: "a3", icon: Calculator, refId: "SKU-005", type: "COGS", title: "Sudden COGS increase — Denim Jacket", description: "COGS per unit increased 23% vs previous batch.", time: "3 hours ago", status: "Warning", tab: "alerts" },
  { id: "s1", icon: FileText, refId: "COST-4501", type: "COGS", title: "New cost record — WO-102", description: "Auto-COGS record generated for completed work order WO-102.", time: "30 min ago", status: "Info", tab: "system" },
  { id: "s2", icon: FileText, refId: "COST-4502", type: "COGS", title: "New cost record — WO-099", description: "Auto-COGS record generated for completed work order WO-099.", time: "2 hours ago", status: "Info", tab: "system" },
  { id: "s3", icon: Settings, refId: "POL-001", type: "Policy", title: "Threshold policy update", description: "Variance threshold changed from 10% to 8% by Branch Admin.", time: "1 day ago", status: "Info", tab: "system" },
];

const tabs = [
  { id: "approvals", label: "Approvals", icon: Wallet, count: 3 },
  { id: "alerts", label: "Alerts", icon: AlertTriangle, count: 3 },
  { id: "system", label: "System Messages", icon: Settings, count: 3 },
];

// ==========================================
// Component
// ==========================================
const FINNotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("approvals");
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const filtered = useMemo(
    () => notifications.filter((n) => n.tab === activeTab),
    [activeTab]
  );

  const handleAction = (notif: Notification) => {
    setToast({ message: `Action started for: ${notif.title}`, type: "success" });
    setSelectedNotif(null);
  };

  return (
    <FinanceLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto space-y-6 pb-20">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Notifications / Tasks</h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Stay on top of finance approvals, alerts, and system messages</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-semibold">
            <Lock size={12} />Branch: Manila
          </div>
        </div>

      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ref ID</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Notification</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
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
                      <td className="px-6 py-3 text-xs font-bold text-indigo-600 dark:text-indigo-400">{n.refId}</td>
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
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{n.type}</span>
                      </td>
                      <td className="px-6 py-3 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{n.time}</td>
                      <td className="px-6 py-3"><StatusBadge status={n.status} /></td>
                      <td className="px-6 py-3 text-left">
                        <div className="flex items-center justify-start gap-1">
                          <button onClick={() => setSelectedNotif(n)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="View"><Eye size={14} /></button>
                          {n.tab === "approvals" && (
                            <button
                              onClick={() => handleAction(n)}
                              className="inline-flex items-center gap-1 whitespace-nowrap text-left.5 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-all active:scale-95"
                              title="Review"
                            >
                              <CheckCircle2 size={13} />
                              Review
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400 italic">No notifications in this category.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      </div>

      <PageModal
        isOpen={!!selectedNotif}
        onClose={() => setSelectedNotif(null)}
        title={selectedNotif?.title || ""}
        subtitle={`${selectedNotif?.refId} · ${selectedNotif?.time}`}
        badges={selectedNotif ? <StatusBadge status={selectedNotif.status} /> : undefined}
        footer={
          selectedNotif?.tab === "approvals" ? (
            <div className="flex items-center gap-3">
              <SecondaryButton onClick={() => setSelectedNotif(null)}>Close</SecondaryButton>
              <button onClick={() => handleAction(selectedNotif)} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors">Take Action</button>
            </div>
          ) : undefined
        }
      >
        {selectedNotif && (
          <div className="space-y-4">
            <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</label><p className="text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{selectedNotif.description}</p></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type</label><p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-1">{selectedNotif.type}</p></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</label><p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-1 capitalize">{selectedNotif.tab}</p></div>
            </div>
          </div>
        )}
      </PageModal>
    </FinanceLayout>
  );
};

export default FINNotificationsPage;
