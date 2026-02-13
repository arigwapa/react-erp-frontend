// ==========================================
// AdminNotificationsPage.tsx
// Branch Admin notifications & tasks page.
// Sections:
//   A. Page Header with subtitle
//   B. Tabs: Approvals | Alerts | System Messages
//   C. Filters: Module, Status, Date Range
//   D. Bulk Actions: Approve selected, Mark as read
//   E. Tables with Approve/Reject actions
// ==========================================

// --- React & Hooks ---
import { useState, useMemo, useEffect } from "react";

// --- Layout ---
import AdminLayout from "../../layout/AdminLayout";

// --- Icons (Lucide) ---
import {
  Check,
  X,
  Eye,
  Bell,
  Info,
  CheckCircle2,
  Search,
  AlertTriangle,
  RotateCcw,
  Calendar,
  Tag,
  MapPin,
  FileText,
  CheckCircle,
  MessageSquare,
  ExternalLink,
  CheckCheck,
  BellOff,
} from "lucide-react";

// --- Reusable UI Components (from components/ui) ---
import Tooltip from "../../components/ui/Tooltip";
import Toast from "../../components/ui/Toast";
import { StatusBadge } from "../../components/ui/StatusBadge";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import DetailsModal from "../../components/ui/DetailsModal";
import Pagination from "../../components/ui/Pagination";
import SecondaryButton from "../../components/ui/SecondaryButton";
import TabBar from "../../components/ui/TabBar";
import FilterDropdown from "../../components/ui/FilterDropdown";
import { Card } from "../../components/ui/Card";

// ==========================================
// SECTION 1: CONSTANTS & MOCK DATA
// ==========================================

/**
 * APPROVALS_DATA — Pending approval requests from branch modules.
 * Includes requestedBy field and branch is auto-filled.
 */
const APPROVALS_DATA = [
  {
    id: "PLM-3001",
    module: "PLM",
    task: "Product released to production needs approval",
    requestedBy: "Maria Santos",
    branch: "Manila Main",
    status: "Pending",
    time: "30m ago",
    details:
      "Final design pack for Summer 2026 collection requires sign-off before BOM generation.",
  },
  {
    id: "QA-2025",
    module: "QA",
    task: "Product inspection approval/rejection",
    requestedBy: "Lisa Garcia",
    branch: "Manila Main",
    status: "Pending",
    time: "2 hours ago",
    details:
      "Batch #442 failed GSM check. Variance of 5% detected. Needs Manager override or rejection.",
  },
  {
    id: "PROD-5501",
    module: "Production",
    task: "Production schedule change request",
    requestedBy: "Juan Dela Cruz",
    branch: "Manila Main",
    status: "Review",
    time: "4 hours ago",
    details:
      "Request to reschedule Line 3 production from 2pm to 4pm due to material delay.",
  },
  {
    id: "WH-5502",
    module: "Warehouse",
    task: "Stock adjustment request",
    requestedBy: "Ana Reyes",
    branch: "Manila Main",
    status: "Pending",
    time: "5 hours ago",
    details:
      "Adjustment of -50kg Cotton due to moisture damage in Storage Zone B.",
  },
  {
    id: "FIN-9002",
    module: "Finance",
    task: "Budget approval or period locking",
    requestedBy: "Mark Reyes",
    branch: "Manila Main",
    status: "Urgent",
    time: "6 hours ago",
    details:
      "Q1 Procurement budget exceeded by 12%. Requires approval to unlock additional funds.",
  },
  {
    id: "PROD-5503",
    module: "Production",
    task: "Machine maintenance approval",
    requestedBy: "Engr. Santos",
    branch: "Manila Main",
    status: "Pending",
    time: "1 day ago",
    details:
      "Sewing machine #12 requires scheduled maintenance. Approval needed to halt production.",
  },
];

/**
 * ALERTS_DATA — System alerts for the branch.
 * Includes severity, "Go to module" capability.
 */
const ALERTS_DATA = [
  {
    id: "ALT-109",
    type: "Security",
    message: "5 failed login attempts detected",
    priority: "High",
    status: "Active",
    time: "Today",
    details:
      "IP Address 192.168.1.55 attempted to access Admin Panel 5 times within 1 minute.",
  },
  {
    id: "ALT-220",
    type: "Quality",
    message: "QA defect spike — rejection rate exceeded 15%",
    priority: "High",
    status: "Active",
    time: "2h ago",
    details: "Line 4 is showing abnormal defect rates on sewing operation.",
  },
  {
    id: "ALT-305",
    type: "Inventory",
    message: "Low stock for Denim-Blue-20oz fabric rolls",
    priority: "Medium",
    status: "Active",
    time: "Yesterday",
    details: "Denim-Blue-20oz dropped below safety stock level (200 yards).",
  },
  {
    id: "ALT-310",
    type: "Production",
    message: "Production delay on WO-1045 (2 days behind)",
    priority: "Medium",
    status: "Active",
    time: "Yesterday",
    details: "Work order WO-1045 blocked due to pending material delivery.",
  },
  {
    id: "ALT-315",
    type: "Finance",
    message: "Budget threshold reached — 92% consumed",
    priority: "High",
    status: "Active",
    time: "2 days ago",
    details: "Monthly budget utilization exceeded warning threshold of 90%.",
  },
  {
    id: "ALT-099",
    type: "Production",
    message: "Machine 4 Overheating",
    priority: "Medium",
    status: "Resolved",
    time: "3 days ago",
    details: "Coolant leak fixed by maintenance team.",
    resolvedBy: "Engr. Santos",
  },
  {
    id: "ALT-088",
    type: "Warehouse",
    message: "Temperature threshold exceeded",
    priority: "High",
    status: "Resolved",
    time: "Last Week",
    details: "Storage Zone A temperature normalized. HVAC system repaired.",
    resolvedBy: "Maintenance Team",
  },
];

/**
 * SYSTEM_MESSAGES — Informational notices (read-only, no approvals).
 */
const SYSTEM_MESSAGES = [
  {
    id: "SYS-001",
    category: "User",
    message: "New user Ana Reyes added to Manila Main branch",
    time: "Today",
    isRead: false,
  },
  {
    id: "SYS-002",
    category: "Role",
    message: "Role 'QA Manager' permissions updated by Super Admin",
    time: "Yesterday",
    isRead: false,
  },
  {
    id: "SYS-003",
    category: "Workflow",
    message: "Approval workflow rule updated for Production module",
    time: "2 days ago",
    isRead: true,
  },
  {
    id: "SYS-004",
    category: "System",
    message: "Scheduled maintenance on Feb 20, 2026 — 2:00 AM to 4:00 AM",
    time: "3 days ago",
    isRead: true,
  },
  {
    id: "SYS-005",
    category: "User",
    message: "User Maria Santos changed from PLM Staff to PLM Manager",
    time: "5 days ago",
    isRead: true,
  },
  {
    id: "SYS-006",
    category: "System",
    message: "New ERP version 2.4.1 deployed — see changelog for details",
    time: "1 week ago",
    isRead: true,
  },
];

/**
 * FILTER_OPTIONS — Available filter choices per tab.
 */
const FILTER_OPTIONS: Record<string, string[]> = {
  approvals: [
    "All Requests",
    "Pending",
    "Urgent",
    "Review",
    "PLM",
    "QA",
    "Production",
    "Warehouse",
    "Finance",
  ],
  alerts: [
    "All Alerts",
    "High Priority",
    "Medium Priority",
    "Security",
    "Quality",
    "Inventory",
    "Production",
    "Warehouse",
    "Finance",
  ],
  messages: [
    "All Messages",
    "Unread",
    "Read",
    "User",
    "Role",
    "Workflow",
    "System",
  ],
};

const DEFAULT_FILTERS: Record<string, string> = {
  approvals: "All Requests",
  alerts: "All Alerts",
  messages: "All Messages",
};

const ITEMS_PER_PAGE = 5;

// ==========================================
// SECTION 2: TAB CONFIGURATION
// ==========================================

const TAB_CONFIG = [
  {
    id: "approvals",
    label: "Approvals",
    icon: CheckCircle2,
    count: APPROVALS_DATA.length,
  },
  {
    id: "alerts",
    label: "Alerts",
    icon: AlertTriangle,
    count: ALERTS_DATA.filter((a) => a.status === "Active").length,
  },
  {
    id: "messages",
    label: "System Messages",
    icon: MessageSquare,
    count: SYSTEM_MESSAGES.filter((m) => !m.isRead).length,
  },
];

// ==========================================
// SECTION 3: MAIN PAGE COMPONENT
// ==========================================

const AdminNotificationsPage = () => {
  // ------------------------------------------
  // 3A. STATE — Tab & Sub-Tab Navigation
  // ------------------------------------------
  const [activeTab, setActiveTab] = useState<
    "approvals" | "alerts" | "messages"
  >("approvals");

  const [alertSubTab, setAlertSubTab] = useState<"active" | "resolved">(
    "active",
  );

  // ------------------------------------------
  // 3B. STATE — Search & Filter
  // ------------------------------------------
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All Requests");

  // ------------------------------------------
  // 3C. STATE — Pagination
  // ------------------------------------------
  const [currentPage, setCurrentPage] = useState(1);

  // ------------------------------------------
  // 3D. STATE — Toast Notifications
  // ------------------------------------------
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // ------------------------------------------
  // 3E. STATE — Modals
  // ------------------------------------------
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [modalActionType, setModalActionType] = useState<
    | "confirm-approve"
    | "confirm-reject"
    | "confirm-resolve"
    | "confirm-reopen"
    | null
  >(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // ------------------------------------------
  // 3F. STATE — Bulk Selection (Approvals)
  // ------------------------------------------
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ------------------------------------------
  // 3G. EFFECT — Reset page on filter/tab changes
  // ------------------------------------------
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds(new Set());
  }, [activeTab, searchQuery, selectedFilter, alertSubTab]);

  // ------------------------------------------
  // 3H. DERIVED DATA — Filtered & Paginated Items
  // ------------------------------------------
  const filteredData = useMemo(() => {
    let data: any[] = [];

    if (activeTab === "approvals") {
      data = APPROVALS_DATA;
    } else if (activeTab === "alerts") {
      data = ALERTS_DATA.filter((item) =>
        alertSubTab === "active"
          ? item.status === "Active"
          : item.status === "Resolved",
      );
    } else {
      data = [...SYSTEM_MESSAGES];
    }

    // Apply search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      data = data.filter(
        (item) =>
          (item.task && item.task.toLowerCase().includes(lowerQuery)) ||
          (item.message && item.message.toLowerCase().includes(lowerQuery)) ||
          item.id.toLowerCase().includes(lowerQuery),
      );
    }

    // Apply filter
    if (selectedFilter && !selectedFilter.startsWith("All")) {
      data = data.filter((item) => {
        const filterLower = selectedFilter.toLowerCase();

        // Messages tab filters
        if (activeTab === "messages") {
          if (filterLower === "unread") return !item.isRead;
          if (filterLower === "read") return item.isRead;
          return item.category?.toLowerCase() === filterLower;
        }

        // Approvals/Alerts filters
        return (
          item.status?.toLowerCase() === filterLower ||
          item.priority
            ?.toLowerCase()
            .includes(filterLower.replace(" priority", "")) ||
          item.module?.toLowerCase() === filterLower ||
          item.type?.toLowerCase() === filterLower
        );
      });
    }

    return data;
  }, [activeTab, searchQuery, selectedFilter, alertSubTab]);

  // Pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // ------------------------------------------
  // 3I. HANDLERS
  // ------------------------------------------

  const handleTabChange = (tabId: string) => {
    const tab = tabId as "approvals" | "alerts" | "messages";
    setActiveTab(tab);
    setSearchQuery("");
    setSelectedFilter(DEFAULT_FILTERS[tab] || "All");
  };

  const handleViewDetails = (item: any) => {
    setSelectedItem(item);
    setDetailsModalOpen(true);
  };

  const handleActionClick = (item: any, type: any) => {
    setSelectedItem(item);
    setModalActionType(type);
    setConfirmModalOpen(true);
  };

  const handleConfirmAction = () => {
    let msg = "Action completed";
    if (modalActionType === "confirm-resolve")
      msg = "Alert marked as resolved";
    if (modalActionType === "confirm-reopen") msg = "Alert re-opened";
    if (modalActionType === "confirm-approve")
      msg = `Request ${selectedItem?.id} approved successfully`;
    if (modalActionType === "confirm-reject")
      msg = `Request ${selectedItem?.id} rejected`;

    setToast({ message: msg, type: "success" });
    setConfirmModalOpen(false);
    setModalActionType(null);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  /** Bulk selection toggle */
  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedData.map((r: any) => r.id)));
    }
  };

  /** Bulk approve selected */
  const handleBulkApprove = () => {
    setToast({
      message: `${selectedIds.size} request(s) approved successfully`,
      type: "success",
    });
    setSelectedIds(new Set());
  };

  /** Bulk mark alerts as read */
  const handleBulkMarkRead = () => {
    setToast({
      message: `${selectedIds.size} message(s) marked as read`,
      type: "success",
    });
    setSelectedIds(new Set());
  };

  // ------------------------------------------
  // 3J. HELPER — Confirmation Modal Props
  // ------------------------------------------
  const getConfirmationProps = () => {
    switch (modalActionType) {
      case "confirm-approve":
        return {
          title: "Approve Request",
          message: `Are you sure you want to approve request ${selectedItem?.id}? This action will trigger the next stage in the workflow.`,
          confirmText: "Approve Request",
          variant: "primary" as const,
        };
      case "confirm-reject":
        return {
          title: "Reject Request",
          message: `Are you sure you want to reject request ${selectedItem?.id}? The requester will be notified.`,
          confirmText: "Reject Request",
          variant: "danger" as const,
        };
      case "confirm-resolve":
        return {
          title: "Resolve Alert",
          message: `Mark alert ${selectedItem?.id} as resolved? This indicates corrective action has been taken.`,
          confirmText: "Mark Resolved",
          variant: "primary" as const,
        };
      case "confirm-reopen":
        return {
          title: "Re-open Alert",
          message: `Are you sure you want to re-open alert ${selectedItem?.id}? It will be moved back to the active queue.`,
          confirmText: "Re-open Alert",
          variant: "danger" as const,
        };
      default:
        return {
          title: "Confirm Action",
          message: "Are you sure you want to proceed?",
          confirmText: "Confirm",
          variant: "primary" as const,
        };
    }
  };

  const confirmProps = getConfirmationProps();

  // ==========================================
  // SECTION 4: JSX RENDER
  // ==========================================
  return (
    <AdminLayout>
      <div className="space-y-6 pb-10">
        {/* ---- TOAST ---- */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* ---- CONFIRMATION MODAL ---- */}
        <ConfirmationModal
          isOpen={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={handleConfirmAction}
          title={confirmProps.title}
          message={confirmProps.message}
          confirmText={confirmProps.confirmText}
          variant={confirmProps.variant}
        />

        {/* ---- DETAILS MODAL ---- */}
        <DetailsModal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          title={
            activeTab === "alerts"
              ? "Alert Details"
              : activeTab === "messages"
                ? "System Message"
                : "Request Details"
          }
          itemId={selectedItem?.id || ""}
          headerIcon={
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <FileText size={18} />
            </div>
          }
          gridFields={[
            {
              label:
                activeTab === "alerts"
                  ? "Type"
                  : activeTab === "messages"
                    ? "Category"
                    : "Module",
              value:
                selectedItem?.module ||
                selectedItem?.type ||
                selectedItem?.category,
              icon: Tag,
            },
            {
              label: "Time",
              value: selectedItem?.time,
              icon: Calendar,
            },
            ...(activeTab === "approvals"
              ? [
                  {
                    label: "Requested By",
                    value: selectedItem?.requestedBy || "N/A",
                    icon: MapPin,
                  },
                ]
              : []),
            {
              label:
                activeTab === "alerts"
                  ? "Priority"
                  : activeTab === "messages"
                    ? "Status"
                    : "Status",
              value: (
                <StatusBadge
                  status={
                    selectedItem?.priority ||
                    selectedItem?.status ||
                    (selectedItem?.isRead ? "Read" : "Unread") ||
                    "Info"
                  }
                />
              ),
              icon: Info,
            },
          ]}
        >
          {/* Content */}
          <span className="block text-xs font-bold text-slate-800 mb-2">
            {activeTab === "alerts"
              ? "Alert Message"
              : activeTab === "messages"
                ? "Message"
                : "Subject / Task"}
          </span>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            {selectedItem?.task ||
              selectedItem?.message ||
              selectedItem?.details}
          </p>

          {selectedItem?.details &&
            selectedItem?.task !== selectedItem?.details && (
              <>
                <span className="block text-xs font-bold text-slate-800 mb-2">
                  Full Description
                </span>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {selectedItem?.details}
                </p>
              </>
            )}

          {selectedItem?.resolvedBy && (
            <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center gap-2">
              <CheckCircle size={12} className="text-emerald-500" />
              <span className="text-xs text-emerald-700 font-medium">
                Resolved by {selectedItem.resolvedBy}
              </span>
            </div>
          )}
        </DetailsModal>

        {/* ---- A. PAGE HEADER ---- */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Notifications & Tasks
            </h1>
            <p className="text-slate-500 mt-2 text-xs font-medium">
              View approvals, system alerts, and operational messages for this
              branch.
            </p>
          </div>
        </div>

        {/* ---- B. TAB BAR ---- */}
        <TabBar
          tabs={TAB_CONFIG}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* ---- CONTENT CARD ---- */}
        <Card className="overflow-hidden flex flex-col min-h-[400px]">
          {/* ---- C. TOOLBAR: Search + Filter + Bulk Actions ---- */}
          <div className="flex flex-wrap items-center gap-2 px-6 pt-5 pb-4 border-b border-slate-100">
            {/* Search */}
            <div className="relative group flex-1 sm:flex-none">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors"
                size={14}
                aria-hidden="true"
              />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                aria-label={`Search ${activeTab}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-full outline-none focus:bg-white focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Filter */}
            <FilterDropdown
              options={FILTER_OPTIONS[activeTab]}
              selected={selectedFilter}
              onSelect={setSelectedFilter}
            />

            {/* Spacer */}
            <div className="flex-1" />

            {/* D. BULK ACTIONS */}
            {activeTab === "approvals" && selectedIds.size > 0 && (
              <button
                onClick={handleBulkApprove}
                className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-white rounded-full hover:bg-emerald-600 shadow-sm transition-all"
              >
                <CheckCheck size={13} />
                Approve Selected ({selectedIds.size})
              </button>
            )}

            {activeTab === "messages" && selectedIds.size > 0 && (
              <button
                onClick={handleBulkMarkRead}
                className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider bg-indigo-500 text-white rounded-full hover:bg-indigo-600 shadow-sm transition-all"
              >
                <BellOff size={13} />
                Mark as Read ({selectedIds.size})
              </button>
            )}
          </div>

          {/* === ALERTS SUB-TABS === */}
          {activeTab === "alerts" && (
            <div className="px-6 pt-5 pb-0 border-b border-slate-100">
              <div className="flex gap-6">
                <button
                  onClick={() => setAlertSubTab("active")}
                  className={`pb-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-all ${
                    alertSubTab === "active"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Active Alerts
                  <span className="ml-2 bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
                    {ALERTS_DATA.filter((a) => a.status === "Active").length}
                  </span>
                </button>
                <button
                  onClick={() => setAlertSubTab("resolved")}
                  className={`pb-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-all ${
                    alertSubTab === "resolved"
                      ? "border-emerald-600 text-emerald-600"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Resolved History
                </button>
              </div>
            </div>
          )}

          {/* ======================= */}
          {/* TAB 1: APPROVALS TABLE  */}
          {/* ======================= */}
          {activeTab === "approvals" && (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    {/* Select All Checkbox */}
                    <th className="px-6 py-4 w-10">
                      <input
                        type="checkbox"
                        checked={
                          paginatedData.length > 0 &&
                          selectedIds.size === paginatedData.length
                        }
                        onChange={toggleSelectAll}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-4">Ref ID</th>
                    <th className="px-6 py-4">Module</th>
                    <th className="px-6 py-4">Task</th>
                    <th className="px-6 py-4 hidden lg:table-cell">
                      Requested By
                    </th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 hidden sm:table-cell">Time</th>
                    <th className="px-6 py-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.map((row: any) => (
                    <tr
                      key={row.id}
                      className={`group hover:bg-slate-50/80 transition-colors ${
                        selectedIds.has(row.id) ? "bg-indigo-50/40" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(row.id)}
                          onChange={() => toggleSelectItem(row.id)}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      {/* Ref ID */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">
                          {row.id}
                        </span>
                      </td>

                      {/* Module */}
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-800">
                          {row.module}
                        </span>
                      </td>

                      {/* Task */}
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-600 line-clamp-2">
                          {row.task}
                        </span>
                      </td>

                      {/* Requested By */}
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="text-xs text-slate-500">
                          {row.requestedBy}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <StatusBadge status={row.status} />
                      </td>

                      {/* Time */}
                      <td className="px-6 py-4 text-xs text-slate-500 hidden sm:table-cell">
                        {row.time}
                      </td>

                      {/* Actions: View + Approve + Reject */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-start gap-1.5">
                          {/* View */}
                          <Tooltip content="View Details">
                            <button
                              aria-label="View Details"
                              onClick={() => handleViewDetails(row)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                            >
                              <Eye size={16} aria-hidden="true" />
                            </button>
                          </Tooltip>

                          <div className="w-px h-4 bg-slate-200" />

                          {/* Approve */}
                          <Tooltip content="Approve">
                            <button
                              aria-label="Approve Request"
                              onClick={() =>
                                handleActionClick(row, "confirm-approve")
                              }
                              className="p-1.5 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 shadow-sm shadow-emerald-200 transition-all hover:scale-105 active:scale-95"
                            >
                              <Check size={16} aria-hidden="true" />
                            </button>
                          </Tooltip>

                          {/* Reject */}
                          <Tooltip content="Reject">
                            <button
                              aria-label="Reject Request"
                              onClick={() =>
                                handleActionClick(row, "confirm-reject")
                              }
                              className="p-1.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 shadow-sm shadow-rose-200 transition-all hover:scale-105 active:scale-95"
                            >
                              <X size={16} aria-hidden="true" />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* Empty State */}
                  {paginatedData.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="p-3 bg-slate-50 rounded-full">
                            <Search
                              size={18}
                              className="text-slate-400"
                              aria-hidden="true"
                            />
                          </div>
                          <p className="text-xs font-bold text-slate-500">
                            No approvals found
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Try adjusting your search or filters.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ======================= */}
          {/* TAB 2: ALERTS TABLE     */}
          {/* ======================= */}
          {activeTab === "alerts" && (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Message</th>
                    <th className="px-6 py-4">Severity</th>
                    <th className="px-6 py-4 hidden sm:table-cell">Time</th>
                    <th className="px-6 py-4 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.map((row: any) => (
                    <tr
                      key={row.id}
                      className="group hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-medium text-slate-700">
                          {row.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-800">
                          {row.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-600 line-clamp-2">
                          {row.message}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={row.priority} />
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 hidden sm:table-cell">
                        {row.time}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-start gap-2">
                          <Tooltip content="View Details">
                            <button
                              aria-label="View Details"
                              onClick={() => handleViewDetails(row)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                            >
                              <Eye size={16} aria-hidden="true" />
                            </button>
                          </Tooltip>

                          {alertSubTab === "active" ? (
                            <SecondaryButton
                              onClick={() =>
                                handleActionClick(row, "confirm-resolve")
                              }
                              icon={CheckCircle}
                              ariaLabel={`Resolve alert ${row.id}`}
                              className="!px-3 !py-1.5 !text-[10px] !font-bold hover:!bg-emerald-50 hover:!text-emerald-600 hover:!border-emerald-200"
                            >
                              Resolve
                            </SecondaryButton>
                          ) : (
                            <SecondaryButton
                              onClick={() =>
                                handleActionClick(row, "confirm-reopen")
                              }
                              icon={RotateCcw}
                              ariaLabel={`Re-open alert ${row.id}`}
                              className="!px-3 !py-1.5 !text-[10px] !font-bold !text-slate-400 !bg-slate-50 !border-slate-100 hover:!text-indigo-600 hover:!border-indigo-200 hover:!bg-white"
                            >
                              Re-open
                            </SecondaryButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {paginatedData.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="p-3 bg-slate-50 rounded-full">
                            <AlertTriangle
                              size={18}
                              className="text-slate-400"
                              aria-hidden="true"
                            />
                          </div>
                          <p className="text-xs font-bold text-slate-500">
                            {alertSubTab === "active"
                              ? "No active alerts"
                              : "No resolved alerts found"}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Try adjusting your search or filters.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ================================ */}
          {/* TAB 3: SYSTEM MESSAGES TABLE     */}
          {/* ================================ */}
          {activeTab === "messages" && (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    <th className="px-6 py-4 w-10">
                      <input
                        type="checkbox"
                        checked={
                          paginatedData.length > 0 &&
                          selectedIds.size === paginatedData.length
                        }
                        onChange={toggleSelectAll}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Message</th>
                    <th className="px-6 py-4 hidden sm:table-cell">Time</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.map((row: any) => (
                    <tr
                      key={row.id}
                      className={`group hover:bg-slate-50/80 transition-colors ${
                        !row.isRead ? "bg-indigo-50/30" : ""
                      } ${selectedIds.has(row.id) ? "bg-indigo-50/50" : ""}`}
                    >
                      {/* Checkbox */}
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(row.id)}
                          onChange={() => toggleSelectItem(row.id)}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      {/* ID */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-medium text-slate-700">
                          {row.id}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                          {row.category}
                        </span>
                      </td>

                      {/* Message */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {!row.isRead && (
                            <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                          )}
                          <span
                            className={`text-xs line-clamp-2 ${
                              !row.isRead
                                ? "font-bold text-slate-800"
                                : "text-slate-600"
                            }`}
                          >
                            {row.message}
                          </span>
                        </div>
                      </td>

                      {/* Time */}
                      <td className="px-6 py-4 text-xs text-slate-500 hidden sm:table-cell">
                        {row.time}
                      </td>

                      {/* Read/Unread status */}
                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            row.isRead
                              ? "bg-slate-100 text-slate-500"
                              : "bg-indigo-100 text-indigo-700"
                          }`}
                        >
                          {row.isRead ? "Read" : "Unread"}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-start">
                          <Tooltip content="View Details">
                            <button
                              aria-label="View Details"
                              onClick={() => handleViewDetails(row)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                            >
                              <Eye size={16} aria-hidden="true" />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {paginatedData.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="p-3 bg-slate-50 rounded-full">
                            <MessageSquare
                              size={18}
                              className="text-slate-400"
                              aria-hidden="true"
                            />
                          </div>
                          <p className="text-xs font-bold text-slate-500">
                            No system messages found
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Try adjusting your search or filters.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ---- PAGINATION ---- */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={totalItems}
            onPageChange={handlePageChange}
          />
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminNotificationsPage;
