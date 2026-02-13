// ==========================================
// QANotificationsPage.tsx
// Quality Manager — Notifications / Tasks
// Tabs: Approvals | Alerts | System Messages
// Each row shows Inspection ID, WO, SKU, Status,
// Timestamp, and Action button.
// ==========================================

import React, { useState, useMemo } from "react";
import QALayout from "../../layout/QALayout";
import TabBar from "../../components/ui/TabBar";
import { TableToolbar } from "../../components/ui/TableToolbar";
import { StatusBadge } from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";
import PageModal from "../../components/ui/PageModal";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Toast from "../../components/ui/Toast";
import {
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Eye,
} from "lucide-react";

// ------------------------------------------
// Types
// ------------------------------------------
interface QANotification {
  id: string;
  inspectionId: string;
  workOrder: string;
  sku: string;
  title: string;
  description: string;
  status: string;
  date: string;
  tab: "approvals" | "alerts" | "system";
}

// ------------------------------------------
// Mock data
// ------------------------------------------
const mockNotifications: QANotification[] = [
  { id: "n1", inspectionId: "INS-021", workOrder: "WO-102", sku: "SKU-001", title: "Batch awaiting QA approval", description: "Basic Tee V2.0 — 500 pcs inspected. 2 minor defects found. Inspector recommends Pass.", status: "Pending", date: "10 min ago", tab: "approvals" },
  { id: "n2", inspectionId: "INS-022", workOrder: "WO-107", sku: "SKU-004", title: "Batch awaiting QA approval", description: "Joggers V2.0 — 400 pcs inspected. 0 defects. Inspector recommends Pass.", status: "Pending", date: "25 min ago", tab: "approvals" },
  { id: "n3", inspectionId: "INS-019", workOrder: "WO-105", sku: "SKU-005", title: "Batch awaiting QA decision (re-inspect)", description: "Denim Jacket V1.0 — Re-inspection after rework. 200 pcs. 1 minor defect remaining.", status: "Under Review", date: "1 hour ago", tab: "approvals" },
  { id: "n4", inspectionId: "INS-020", workOrder: "WO-099", sku: "SKU-002", title: "Batch awaiting QA approval", description: "Hoodie V1.1 — 450 pcs inspected. No defects. Inspector recommends Pass.", status: "Pending", date: "2 hours ago", tab: "approvals" },
  { id: "n5", inspectionId: "INS-018", workOrder: "WO-108", sku: "SKU-007", title: "Overdue inspection", description: "Cargo Pants inspection overdue by 2 days. No inspector assigned.", status: "Overdue", date: "30 min ago", tab: "alerts" },
  { id: "n6", inspectionId: "—", workOrder: "WO-101", sku: "SKU-002", title: "Recurring defect pattern detected", description: "Stitching defect reported 6 times on Hoodie V1.1 within 7 days. CAPA recommended.", status: "Critical", date: "1 hour ago", tab: "alerts" },
  { id: "n7", inspectionId: "INS-016", workOrder: "WO-105", sku: "SKU-005", title: "High severity defect detected", description: "Fabric tear found on 15 units of Denim Jacket — severity: High.", status: "Critical", date: "3 hours ago", tab: "alerts" },
  { id: "n8", inspectionId: "—", workOrder: "—", sku: "—", title: "Checklist template updated", description: "Knitted Garments checklist V2.1 published by Super Admin. Review new criteria.", status: "Info", date: "1 hour ago", tab: "system" },
  { id: "n9", inspectionId: "—", workOrder: "—", sku: "—", title: "Workflow rule changed", description: "Rejection now requires mandatory CAPA creation — policy updated by Super Admin.", status: "Info", date: "6 hours ago", tab: "system" },
  { id: "n10", inspectionId: "—", workOrder: "—", sku: "—", title: "QA threshold updated", description: "Rejection rate threshold changed from 15% to 10% for all branch inspections.", status: "Info", date: "Yesterday", tab: "system" },
];

const tabs = [
  { id: "approvals", label: "Approvals", icon: CheckCircle2, count: 4 },
  { id: "alerts", label: "Alerts", icon: AlertTriangle, count: 3 },
  { id: "system", label: "System Messages", icon: MessageSquare, count: 3 },
];

const ITEMS_PER_PAGE = 8;

// ==========================================
// Component
// ==========================================
const QANotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("approvals");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [selectedNotification, setSelectedNotification] = useState<QANotification | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<QANotification | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Filtered data
  const filtered = useMemo(() => {
    let data = mockNotifications.filter((n) => n.tab === activeTab);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (n) =>
          n.inspectionId.toLowerCase().includes(q) ||
          n.workOrder.toLowerCase().includes(q) ||
          n.sku.toLowerCase().includes(q) ||
          n.title.toLowerCase().includes(q)
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

  const handleView = (n: QANotification) => {
    setSelectedNotification(n);
    setIsDetailOpen(true);
  };

  const handleReview = (n: QANotification) => {
    setConfirmAction(n);
  };

  const confirmReview = () => {
    if (confirmAction) {
      setToast({ message: `${confirmAction.inspectionId} — Marked as reviewed.`, type: "success" });
      setConfirmAction(null);
    }
  };

  return (
    <QALayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications / Tasks</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Quality approvals, alerts, and system messages</p>
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
        placeholder="Search by inspection ID, WO, or SKU…"
      />

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Inspection ID</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Work Order</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {paginatedData.length > 0 ? (
                paginatedData.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-3 text-xs font-bold text-indigo-600 dark:text-indigo-400">{n.inspectionId}</td>
                    <td className="px-6 py-3 text-xs text-slate-600 dark:text-slate-400">{n.workOrder}</td>
                    <td className="px-6 py-3 text-xs text-slate-600 dark:text-slate-400">{n.sku}</td>
                    <td className="px-6 py-3 text-xs font-medium text-slate-800 dark:text-slate-200 max-w-xs truncate">{n.title}</td>
                    <td className="px-6 py-3"><StatusBadge status={n.status} /></td>
                    <td className="px-6 py-3 text-[11px] text-slate-500 dark:text-slate-400">{n.date}</td>
                    <td className="px-6 py-3 text-left">
                      <div className="flex items-center justify-start gap-2">
                        <button onClick={() => handleView(n)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="View Details">
                          <Eye size={14} />
                        </button>
                        {activeTab === "approvals" && (
                          <button
                            onClick={() => handleReview(n)}
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
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400 italic">No notifications found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} startIndex={startIndex} endIndex={endIndex} totalItems={filtered.length} onPageChange={setCurrentPage} />
      </div>

      {/* Detail Modal */}
      <PageModal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={selectedNotification?.title || ""} subtitle={`${selectedNotification?.inspectionId} · ${selectedNotification?.workOrder}`} badges={selectedNotification ? <StatusBadge status={selectedNotification.status} /> : undefined}>
        {selectedNotification && (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{selectedNotification.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Inspection ID</label>
                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1">{selectedNotification.inspectionId}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Work Order</label>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">{selectedNotification.workOrder}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SKU</label>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedNotification.sku}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Timestamp</label>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedNotification.date}</p>
              </div>
            </div>
          </div>
        )}
      </PageModal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={confirmReview}
        title="Review Inspection"
        message={`Open the approval panel for "${confirmAction?.inspectionId} — ${confirmAction?.workOrder}"? You will be able to approve or reject this batch.`}
        confirmText="Review"
      />
    </QALayout>
  );
};

export default QANotificationsPage;
