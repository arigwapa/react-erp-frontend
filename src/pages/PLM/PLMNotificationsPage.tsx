// ==========================================
// PLMNotificationsPage.tsx — PLM Manager Notifications
// Branch-scoped notifications and tasks with tabs:
//   Approvals | Alerts | System Messages
// Each row shows Reference ID, Module, Status,
// Timestamp, and Action button.
// ==========================================

import { useState, useMemo, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Bell,
  Send,
  Eye,
  Clock,
  Package,
  FileText,
  Settings,
  Layers,
  Lock,
} from "lucide-react";

// ------------------------------------------
// Layout & Reusable UI
// ------------------------------------------
import PLMLayout from "../../layout/PLMLayout";
import { Card } from "../../components/ui/Card";
import TabBar from "../../components/ui/TabBar";
import type { Tab } from "../../components/ui/TabBar";
import { TableToolbar } from "../../components/ui/TableToolbar";
import { StatusBadge } from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import PageModal from "../../components/ui/PageModal";
import Toast from "../../components/ui/Toast";
import SecondaryButton from "../../components/ui/SecondaryButton";

// ==========================================
// TYPES
// ==========================================

type NotificationType = "approval" | "alert" | "system";

interface PLMNotification {
  id: string;
  referenceId: string;
  module: string;
  type: NotificationType;
  title: string;
  message: string;
  status: string;
  timestamp: string;
  isRead: boolean;
}

// ==========================================
// MOCK DATA
// ==========================================

const MOCK_NOTIFICATIONS: PLMNotification[] = [
  // Approvals
  { id: "N-001", referenceId: "VER-045", module: "PLM", type: "approval", title: "Version Approval Request", message: "Classic Denim Jacket v2.1 submitted for approval. Review tech pack and BOM before approving.", status: "Pending", timestamp: "Feb 13, 2026 · 10:30 AM", isRead: false },
  { id: "N-002", referenceId: "VER-042", module: "PLM", type: "approval", title: "Version Approval Request", message: "Floral Summer Dress v1.1 — adjustments to hemline length. Requires PLM review.", status: "Pending", timestamp: "Feb 12, 2026 · 3:15 PM", isRead: false },
  { id: "N-003", referenceId: "REL-012", module: "PLM", type: "approval", title: "Release Request", message: "Cargo Utility Pants v4.0 release to production requested. BOM and QA passed.", status: "Pending", timestamp: "Feb 12, 2026 · 1:00 PM", isRead: true },
  { id: "N-004", referenceId: "VER-039", module: "PLM", type: "approval", title: "Version Approved", message: "Basic Cotton Tee v3.0 has been approved and is ready for release.", status: "Approved", timestamp: "Feb 11, 2026 · 11:00 AM", isRead: true },
  // Alerts
  { id: "N-005", referenceId: "P-006", module: "PLM", type: "alert", title: "BOM Missing", message: "Knit Crew Sweater (MNL-SWT-006) has no BOM lines. Cannot proceed to release.", status: "Action Required", timestamp: "Feb 13, 2026 · 9:00 AM", isRead: false },
  { id: "N-006", referenceId: "P-002", module: "PLM", type: "alert", title: "BOM Incomplete", message: "Floral Summer Dress BOM has only 2 of 5 required material lines.", status: "Action Required", timestamp: "Feb 12, 2026 · 4:00 PM", isRead: false },
  { id: "N-007", referenceId: "VER-041", module: "PLM", type: "alert", title: "Material Cost Missing", message: "Organic Cotton Blend material has no unit cost set. BOM costing incomplete.", status: "Warning", timestamp: "Feb 12, 2026 · 2:30 PM", isRead: true },
  { id: "N-008", referenceId: "VER-040", module: "PLM", type: "alert", title: "Version Rejected", message: "Wool Trench Coat v2.0 rejected — insufficient QA data. Resubmit after update.", status: "Rejected", timestamp: "Feb 11, 2026 · 5:00 PM", isRead: true },
  // System Messages
  { id: "N-009", referenceId: "SYS-001", module: "System", type: "system", title: "Master Data Updated", message: "Category 'Activewear' has been added to the product categories by Super Admin.", status: "Info", timestamp: "Feb 13, 2026 · 8:00 AM", isRead: false },
  { id: "N-010", referenceId: "SYS-002", module: "System", type: "system", title: "Workflow Policy Change", message: "Maker-checker approval now requires 2 reviewers for release. Effective immediately.", status: "Info", timestamp: "Feb 12, 2026 · 9:00 AM", isRead: true },
  { id: "N-011", referenceId: "SYS-003", module: "System", type: "system", title: "Material Types Updated", message: "New material type 'Recycled Polyester' added to the materials library.", status: "Info", timestamp: "Feb 11, 2026 · 10:00 AM", isRead: true },
];

// ==========================================
// CONSTANTS
// ==========================================

const ITEMS_PER_PAGE = 5;

const NOTIFICATION_TABS: Tab[] = [
  { id: "approvals", label: "Approvals", icon: CheckCircle, count: MOCK_NOTIFICATIONS.filter((n) => n.type === "approval" && n.status === "Pending").length },
  { id: "alerts", label: "Alerts", icon: AlertTriangle, count: MOCK_NOTIFICATIONS.filter((n) => n.type === "alert" && !n.isRead).length },
  { id: "system", label: "System Messages", icon: Settings },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

function PLMNotificationsPage() {
  // ------------------------------------------
  // STATE
  // ------------------------------------------
  const [activeTab, setActiveTab] = useState("approvals");
  const [notifications, setNotifications] = useState<PLMNotification[]>(MOCK_NOTIFICATIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNotif, setSelectedNotif] = useState<PLMNotification | null>(null);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
    variant: "primary" | "danger";
    confirmText: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
    action: () => {},
    variant: "primary",
    confirmText: "Confirm",
  });

  // Reset page on tab/search change
  useEffect(() => { setCurrentPage(1); }, [activeTab, searchQuery]);

  // ------------------------------------------
  // COMPUTED: Filter by tab and search
  // ------------------------------------------
  const filtered = useMemo(() => {
    const typeMap: Record<string, NotificationType> = { approvals: "approval", alerts: "alert", system: "system" };
    const targetType = typeMap[activeTab];
    const q = searchQuery.toLowerCase();
    return notifications.filter((n) => {
      const matchesType = n.type === targetType;
      const matchesSearch = n.title.toLowerCase().includes(q) || n.referenceId.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [notifications, activeTab, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filtered.length);
  const paginated = filtered.slice(startIndex, endIndex);

  // ------------------------------------------
  // HANDLERS
  // ------------------------------------------
  const handleApprove = (notif: PLMNotification) => {
    setConfirmModal({
      isOpen: true,
      title: "Approve Version?",
      message: `Approve ${notif.referenceId}? This will mark the version as approved and allow it to proceed to release.`,
      variant: "primary",
      confirmText: "Approve",
      action: () => {
        setNotifications((prev) =>
          prev.map((n) => n.id === notif.id ? { ...n, status: "Approved", isRead: true } : n)
        );
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setToast({ message: `${notif.referenceId} approved successfully.`, type: "success" });
      },
    });
  };

  const handleReject = (notif: PLMNotification) => {
    setConfirmModal({
      isOpen: true,
      title: "Reject Version?",
      message: `Reject ${notif.referenceId}? The submitter will be notified and must revise before resubmitting.`,
      variant: "danger",
      confirmText: "Reject",
      action: () => {
        setNotifications((prev) =>
          prev.map((n) => n.id === notif.id ? { ...n, status: "Rejected", isRead: true } : n)
        );
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setToast({ message: `${notif.referenceId} rejected.`, type: "success" });
      },
    });
  };

  const handleMarkRead = (notif: PLMNotification) => {
    setNotifications((prev) =>
      prev.map((n) => n.id === notif.id ? { ...n, isRead: true } : n)
    );
  };

  // ------------------------------------------
  // HELPER: Status icon
  // ------------------------------------------
  const getStatusIcon = (status: string) => {
    if (status === "Pending") return <Clock size={14} className="text-amber-500" />;
    if (status === "Approved") return <CheckCircle size={14} className="text-emerald-500" />;
    if (status === "Rejected") return <XCircle size={14} className="text-rose-500" />;
    if (status === "Action Required") return <AlertTriangle size={14} className="text-rose-500" />;
    if (status === "Warning") return <AlertTriangle size={14} className="text-amber-500" />;
    return <Bell size={14} className="text-blue-500" />;
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <>
      <PLMLayout>
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Notifications / Tasks
              </h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                Approvals, alerts, and system messages for your PLM workflow.
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-semibold">
              <Lock size={12} />
              Branch: Manila
            </div>
          </div>

          {/* Tab Bar */}
          <TabBar tabs={NOTIFICATION_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Notification Table */}
          <Card className="overflow-hidden">
            <div className="px-5 pt-5">
              <TableToolbar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isFilterOpen={isFilterOpen}
                setIsFilterOpen={setIsFilterOpen}
                placeholder="Search by title, reference, or message..."
                filterLabel="Filters"
              >
                <div className="p-3 text-xs text-slate-500 italic">No additional filters.</div>
              </TableToolbar>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/80 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Notification</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Reference ID</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Module</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">Timestamp</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                  {paginated.map((notif) => (
                    <tr
                      key={notif.id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors ${!notif.isRead ? "bg-indigo-50/30 dark:bg-indigo-900/10" : ""}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                            {notif.type === "approval" ? <Send size={16} className="text-indigo-500" /> : notif.type === "alert" ? <AlertTriangle size={16} className="text-amber-500" /> : <Settings size={16} className="text-slate-400" />}
                          </div>
                          <div className="min-w-0">
                            <div className={`font-semibold text-sm truncate ${!notif.isRead ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>{notif.title}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-xs">{notif.message}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{notif.referenceId}</span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="inline-flex items-center gap-1 whitespace-nowrap text-left text-xs font-medium text-slate-600 dark:text-slate-400">
                          {notif.module === "PLM" ? <Layers size={12} /> : <Package size={12} />}
                          {notif.module}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {getStatusIcon(notif.status)}
                          <StatusBadge status={notif.status} />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 hidden lg:table-cell">{notif.timestamp}</td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex justify-start items-center gap-2">
                          <button
                            onClick={() => { handleMarkRead(notif); setSelectedNotif(notif); }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                            title="Review"
                          >
                            <Eye size={14} />
                          </button>
                          {notif.type === "approval" && notif.status === "Pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(notif)}
                                className="inline-flex items-center gap-1 whitespace-nowrap text-left.5 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-all active:scale-95"
                                title="Approve"
                              >
                                <CheckCircle size={13} />
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(notif)}
                                className="inline-flex items-center gap-1 whitespace-nowrap text-left.5 px-3 py-1.5 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800 rounded-lg transition-all active:scale-95"
                                title="Reject"
                              >
                                <XCircle size={13} />
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-slate-400 text-sm">
                        <div className="flex flex-col items-center gap-2">
                          <Bell size={32} className="text-slate-300" />
                          <p className="font-medium">No notifications found</p>
                          <p className="text-xs">Try adjusting your search or check another tab.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} startIndex={startIndex} endIndex={endIndex} totalItems={filtered.length} onPageChange={setCurrentPage} />
          </Card>
        </div>
      </PLMLayout>

      {/* ---- NOTIFICATION DETAIL MODAL ---- */}
      {selectedNotif && (
        <PageModal
          isOpen={!!selectedNotif}
          onClose={() => setSelectedNotif(null)}
          title={selectedNotif.title}
          badges={<StatusBadge status={selectedNotif.status} className="!text-[10px] !py-0.5" />}
          subtitle={<>Ref: {selectedNotif.referenceId} · {selectedNotif.module} · {selectedNotif.timestamp}</>}
          maxWidth="max-w-lg"
          footer={
            <div className="flex justify-between items-center w-full">
              <SecondaryButton onClick={() => setSelectedNotif(null)}>Close</SecondaryButton>
              {selectedNotif.type === "approval" && selectedNotif.status === "Pending" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setSelectedNotif(null); handleReject(selectedNotif); }}
                    className="inline-flex items-center gap-1 whitespace-nowrap text-left.5 px-4 py-2.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-full transition-all active:scale-95"
                  >
                    <XCircle size={14} />
                    Reject
                  </button>
                  <button
                    onClick={() => { setSelectedNotif(null); handleApprove(selectedNotif); }}
                    className="inline-flex items-center gap-1 whitespace-nowrap text-left.5 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-full shadow-sm shadow-emerald-600/20 transition-all active:scale-95"
                  >
                    <CheckCircle size={14} />
                    Approve
                  </button>
                </div>
              )}
            </div>
          }
        >
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-3">
              <FileText size={14} className="text-slate-400" /> Details
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              {selectedNotif.message}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-700 pt-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reference ID</span>
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 font-mono block">{selectedNotif.referenceId}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Module</span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">{selectedNotif.module}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
              <div><StatusBadge status={selectedNotif.status} /></div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Timestamp</span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">{selectedNotif.timestamp}</span>
            </div>
          </div>
        </PageModal>
      )}

      {/* ---- CONFIRMATION MODAL ---- */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.action}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmText={confirmModal.confirmText}
      />

      {/* ---- TOAST ---- */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </>
  );
}

export default PLMNotificationsPage;
