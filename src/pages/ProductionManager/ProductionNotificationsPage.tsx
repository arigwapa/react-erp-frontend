// ==========================================
// ProductionNotificationsPage.tsx
// Production Manager — Notifications / Tasks
// Tabs: Tasks | Alerts | Messages
// Each row shows Reference ID, Module, Status,
// Timestamp, and Action button.
// ==========================================

import React, { useState, useMemo } from "react";
import ProductionLayout from "../../layout/ProductionLayout";
import TabBar from "../../components/ui/TabBar";
import { TableToolbar } from "../../components/ui/TableToolbar";
import { StatusBadge } from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";
import PageModal from "../../components/ui/PageModal";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Toast from "../../components/ui/Toast";
import {
  ListTodo,
  AlertTriangle,
  MessageSquare,
  Eye,
  CheckCircle2,
} from "lucide-react";

// ------------------------------------------
// Types
// ------------------------------------------
interface Notification {
  id: string;
  refId: string;
  module: string;
  title: string;
  description: string;
  status: string;
  timestamp: string;
  tab: "tasks" | "alerts" | "messages";
}

// ------------------------------------------
// Mock data
// ------------------------------------------
const mockNotifications: Notification[] = [
  { id: "n1", refId: "WO-110", module: "Production", title: "Work order assigned", description: "WO-110 (Basic Tee V2.0) assigned to production floor — 500 pcs.", status: "Pending", timestamp: "5 min ago", tab: "tasks" },
  { id: "n2", refId: "WO-101", module: "Production", title: "Rework request from QA", description: "QA rejected 15 pcs from WO-101 — stitching defect. Rework required.", status: "Urgent", timestamp: "25 min ago", tab: "tasks" },
  { id: "n3", refId: "WO-099", module: "Production", title: "Confirm work order completion", description: "WO-099 (Hoodie V1.1) has reached 100% — confirm completion.", status: "Pending", timestamp: "1 hour ago", tab: "tasks" },
  { id: "n4", refId: "WO-096", module: "Production", title: "Start confirmation needed", description: "WO-096 (Joggers V2.0) is scheduled to start today.", status: "Pending", timestamp: "2 hours ago", tab: "tasks" },
  { id: "n5", refId: "WO-105", module: "Production", title: "Work order delayed", description: "WO-105 is 3 days past the target end date.", status: "Delayed", timestamp: "30 min ago", tab: "alerts" },
  { id: "n6", refId: "WO-108", module: "Production", title: "Missing materials", description: "Cotton Twill not available in warehouse for WO-108.", status: "Critical", timestamp: "1 hour ago", tab: "alerts" },
  { id: "n7", refId: "WO-107", module: "Production", title: "Over-production warning", description: "WO-107 produced 520 pcs against planned 500. Excess: 20 pcs.", status: "At Risk", timestamp: "3 hours ago", tab: "alerts" },
  { id: "n8", refId: "PP-012", module: "Production", title: "Under-production alert", description: "PP-012 target: 1000 pcs. Current output: 680 pcs with 1 day remaining.", status: "Delayed", timestamp: "4 hours ago", tab: "alerts" },
  { id: "n9", refId: "SYS", module: "System", title: "Schedule change notice", description: "Production schedule updated: Line A maintenance moved to Feb 20.", status: "Info", timestamp: "1 hour ago", tab: "messages" },
  { id: "n10", refId: "SYS", module: "System", title: "Workflow policy updated", description: "Work order cancellation now requires manager approval.", status: "Info", timestamp: "6 hours ago", tab: "messages" },
  { id: "n11", refId: "SYS", module: "System", title: "Material catalog updated", description: "3 new materials added to the global materials library.", status: "Info", timestamp: "Yesterday", tab: "messages" },
];

const tabs = [
  { id: "tasks", label: "Tasks", icon: ListTodo, count: 4 },
  { id: "alerts", label: "Alerts", icon: AlertTriangle, count: 4 },
  { id: "messages", label: "Messages", icon: MessageSquare, count: 3 },
];

const ITEMS_PER_PAGE = 8;

// ==========================================
// Component
// ==========================================
const ProductionNotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("tasks");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<Notification | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Filtered data
  const filtered = useMemo(() => {
    let data = mockNotifications.filter((n) => n.tab === activeTab);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (n) =>
          n.refId.toLowerCase().includes(q) ||
          n.title.toLowerCase().includes(q) ||
          n.description.toLowerCase().includes(q)
      );
    }
    return data;
  }, [activeTab, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filtered.length);
  const paginatedData = filtered.slice(startIndex, endIndex);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery("");
  };

  const handleView = (n: Notification) => {
    setSelectedNotification(n);
    setIsDetailOpen(true);
  };

  const handleAcknowledge = (n: Notification) => {
    setConfirmAction(n);
  };

  const confirmAcknowledge = () => {
    if (confirmAction) {
      setToast({ message: `${confirmAction.refId} — Action acknowledged successfully.`, type: "success" });
      setConfirmAction(null);
    }
  };

  return (
    <ProductionLayout>
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications / Tasks</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Production tasks, alerts, and system messages</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* Toolbar */}
      <TableToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        placeholder="Search by reference or title…"
      />

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Module</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {paginatedData.length > 0 ? (
                paginatedData.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-3 text-xs font-bold text-indigo-600 dark:text-indigo-400">{n.refId}</td>
                    <td className="px-6 py-3 text-xs text-slate-600 dark:text-slate-400">{n.module}</td>
                    <td className="px-6 py-3 text-xs font-medium text-slate-800 dark:text-slate-200 max-w-xs truncate">{n.title}</td>
                    <td className="px-6 py-3"><StatusBadge status={n.status} /></td>
                    <td className="px-6 py-3 text-[11px] text-slate-500 dark:text-slate-400">{n.timestamp}</td>
                    <td className="px-6 py-3 text-left">
                      <div className="flex items-center justify-start gap-2">
                        <button onClick={() => handleView(n)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="View Details">
                          <Eye size={14} />
                        </button>
                        {activeTab === "tasks" && (
                          <button
                            onClick={() => handleAcknowledge(n)}
                            className="inline-flex items-center gap-1 whitespace-nowrap text-left.5 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-all active:scale-95"
                            title="Mark as Done"
                          >
                            <CheckCircle2 size={13} />
                            Mark Done
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400 italic">No notifications found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} startIndex={startIndex} endIndex={endIndex} totalItems={filtered.length} onPageChange={setCurrentPage} />
      </div>

      {/* Detail Modal */}
      <PageModal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={selectedNotification?.title || ""} subtitle={`${selectedNotification?.refId} · ${selectedNotification?.module}`} badges={selectedNotification ? <StatusBadge status={selectedNotification.status} /> : undefined}>
        {selectedNotification && (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{selectedNotification.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reference ID</label>
                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1">{selectedNotification.refId}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Timestamp</label>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedNotification.timestamp}</p>
              </div>
            </div>
          </div>
        )}
      </PageModal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={confirmAcknowledge}
        title="Acknowledge Task"
        message={`Are you sure you want to acknowledge "${confirmAction?.title}"? This will mark the task as reviewed.`}
        confirmText="Acknowledge"
      />
    </ProductionLayout>
  );
};

export default ProductionNotificationsPage;
