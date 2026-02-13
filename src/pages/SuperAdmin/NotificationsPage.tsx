// ==========================================
// NotificationsPage.tsx
// Admin page for managing approvals, alerts, and
// system messages. Supports tabbed views, search,
// filtering, pagination, details modal, and
// confirmation-based actions (approve, resolve, re-open).
// ==========================================

// --- React & Hooks ---
import { useState, useMemo, useEffect } from "react";

// --- Layout ---
import MainLayout from "../../layout/MainLayout";

// --- Icons (Lucide) ---
import {
  Check,
  Eye,
  Bell,
  Info,
  CheckCircle2,
  Search,
  AlertTriangle,
  RotateCcw,
  User,
  CheckCircle,
  Calendar,
  Tag,
  MapPin,
  FileText,
} from "lucide-react";

// --- Reusable UI Components (from components/ui) ---
import Tooltip from "../../components/ui/Tooltip"; // Hover tooltip for icon buttons
import Toast from "../../components/ui/Toast"; // Success/error notification toast
import { StatusBadge } from "../../components/ui/StatusBadge"; // Colored status pill
import ConfirmationModal from "../../components/ui/ConfirmationModal"; // Confirm before actions
import DetailsModal from "../../components/ui/DetailsModal"; // View full item details
import Pagination from "../../components/ui/Pagination"; // Table pagination controls
import SecondaryButton from "../../components/ui/SecondaryButton"; // Styled secondary action button
import TabBar from "../../components/ui/TabBar"; // Reusable tab switcher
import FilterDropdown from "../../components/ui/FilterDropdown"; // Reusable filter dropdown
import { Card } from "../../components/ui/Card"; // White card wrapper

// ==========================================
// SECTION 1: CONSTANTS & MOCK DATA
// ==========================================

/**
 * APPROVALS_DATA — Pending approval requests from various modules.
 * Each entry has: id, module, task, branch, status, time, and full details.
 */
const APPROVALS_DATA = [
  {
    id: "PLM-3001",
    module: "PLM",
    task: "Product released to production needs approval",
    branch: "Manila HQ",
    status: "Pending",
    time: "30m ago",
    details:
      "Final design pack for Summer 2026 collection requires sign-off before BOM generation.",
  },
  {
    id: "INS-2025",
    module: "Quality",
    task: "Product inspection approval/rejection",
    branch: "Branch A",
    status: "Pending",
    time: "2 hours ago",
    details:
      "Batch #442 failed GSM check. Variance of 5% detected. Needs Manager override or rejection.",
  },
  {
    id: "WH-5501",
    module: "Warehouse",
    task: "Stock adjustment request",
    branch: "Davao Site",
    status: "Review",
    time: "4 hours ago",
    details:
      "Adjustment of -50kg Cotton due to moisture damage in Storage Zone B.",
  },
  {
    id: "FIN-9002",
    module: "Finance",
    task: "Budget approval or period locking",
    branch: "Cebu Plant",
    status: "Urgent",
    time: "5 hours ago",
    details:
      "Q1 Procurement budget exceeded by 12%. Requires CFO approval to unlock additional funds.",
  },
];

/**
 * ALERTS_DATA — System alerts with severity levels.
 * Active alerts require attention; resolved ones are historical.
 */
const ALERTS_DATA = [
  {
    id: "ALT-109",
    type: "Security",
    message: "5 failed login attempts detected",
    module: "Auth",
    branch: "Branch C",
    severity: "High",
    status: "Active",
    time: "Today",
    details:
      "IP Address 192.168.1.55 attempted to access Admin Panel 5 times within 1 minute.",
  },
  {
    id: "ALT-220",
    type: "Quality",
    message: "Rejection rate exceeded 15%",
    module: "Quality",
    branch: "Branch A",
    severity: "High",
    status: "Active",
    time: "2h ago",
    details: "Line 4 is showing abnormal defect rates on sewing operation.",
  },
  {
    id: "ALT-305",
    type: "Inventory",
    message: "Low stock for fabric rolls",
    module: "Warehouse",
    branch: "Cebu Plant",
    severity: "Medium",
    status: "Active",
    time: "Yesterday",
    details: "Denim-Blue-20oz dropped below safety stock level (200 yards).",
  },
  {
    id: "ALT-099",
    type: "Security",
    message: "Suspicious API traffic",
    module: "IT",
    branch: "Global",
    severity: "High",
    status: "Resolved",
    time: "3 days ago",
    details: "Resolved by Auto-Firewall rule #442.",
    resolvedBy: "System",
  },
  {
    id: "ALT-088",
    type: "Production",
    message: "Machine 4 Overheating",
    module: "Maintenance",
    branch: "Davao Site",
    severity: "Medium",
    status: "Resolved",
    time: "Last Week",
    details: "Coolant leak fixed by maintenance team.",
    resolvedBy: "Engr. Santos",
  },
];

/**
 * SYSTEM_MESSAGES_DATA — Informational logs for system-level events.
 */
const SYSTEM_MESSAGES_DATA = [
  {
    id: "MSG-501",
    message: "Role updated for QA Manager",
    user: "Super Admin",
    branch: "Global",
    time: "Yesterday",
    details:
      "Permissions added: 'Override Inspection Results', 'Edit Master Data'.",
  },
  {
    id: "MSG-502",
    message: "New user account created",
    user: "HR System",
    branch: "Manila HQ",
    time: "2 days ago",
    details: "User 'J.Doe' created with 'Line Supervisor' role.",
  },
];

/**
 * FILTER_OPTIONS — Available filter choices per tab.
 * Each key corresponds to a tab id.
 */
const FILTER_OPTIONS: Record<string, string[]> = {
  approvals: [
    "All Requests",
    "Pending",
    "Urgent",
    "Review",
    "PLM",
    "Quality",
    "Warehouse",
    "Finance",
  ],
  alerts: [
    "All Alerts",
    "High Severity",
    "Medium Severity",
    "Security",
    "Quality",
    "Inventory",
  ],
  messages: ["All Messages", "System", "Super Admin", "Global"],
};

/**
 * DEFAULT_FILTERS — Default "All" filter per tab, used on tab switch.
 */
const DEFAULT_FILTERS: Record<string, string> = {
  approvals: "All Requests",
  alerts: "All Alerts",
  messages: "All Messages",
};

/** Number of items displayed per page in the table */
const ITEMS_PER_PAGE = 5;

// ==========================================
// SECTION 2: TAB CONFIGURATION
// ==========================================

/**
 * TAB_CONFIG — Defines the tabs for the TabBar component.
 * Each tab has an id, label, icon, and a count of relevant items.
 */
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
    label: "System",
    icon: Bell,
    count: 0,
  },
];

// ==========================================
// SECTION 3: MAIN PAGE COMPONENT
// ==========================================

const NotificationsPage = () => {
  // ------------------------------------------
  // 3A. STATE — Tab & Sub-Tab Navigation
  // ------------------------------------------
  const [activeTab, setActiveTab] = useState<
    "approvals" | "alerts" | "messages"
  >("approvals");

  /** Alerts sub-tab: switch between "active" alerts and "resolved" history */
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
  // 3E. STATE — Modals (Details + Confirmation)
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
  // 3F. EFFECT — Reset page on filter/tab changes
  // ------------------------------------------
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, selectedFilter, alertSubTab]);

  // ------------------------------------------
  // 3G. DERIVED DATA — Filtered & Paginated Items
  // ------------------------------------------
  const filteredData = useMemo(() => {
    let data: any[] = [];

    // Pick the dataset based on the active tab
    if (activeTab === "approvals") {
      data = APPROVALS_DATA;
    } else if (activeTab === "alerts") {
      // Further split by active/resolved sub-tab
      data = ALERTS_DATA.filter((item) =>
        alertSubTab === "active"
          ? item.status === "Active"
          : item.status === "Resolved",
      );
    } else {
      data = SYSTEM_MESSAGES_DATA;
    }

    // Apply search query across task/message, branch, and id
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      data = data.filter(
        (item) =>
          (item.task && item.task.toLowerCase().includes(lowerQuery)) ||
          (item.message && item.message.toLowerCase().includes(lowerQuery)) ||
          (item.branch && item.branch.toLowerCase().includes(lowerQuery)) ||
          item.id.toLowerCase().includes(lowerQuery),
      );
    }

    // Apply filter dropdown selection (skip if "All ..." is selected)
    if (selectedFilter && !selectedFilter.startsWith("All")) {
      data = data.filter((item) => {
        const filterLower = selectedFilter.toLowerCase();
        return (
          item.status?.toLowerCase() === filterLower ||
          item.severity
            ?.toLowerCase()
            .includes(filterLower.replace(" severity", "")) ||
          item.module?.toLowerCase() === filterLower ||
          item.type?.toLowerCase() === filterLower ||
          item.user?.toLowerCase() === filterLower
        );
      });
    }

    return data;
  }, [activeTab, searchQuery, selectedFilter, alertSubTab]);

  // Pagination calculations
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // ------------------------------------------
  // 3H. HANDLERS — Tab Navigation
  // ------------------------------------------

  /** Switches the active tab and resets search/filter to defaults */
  const handleTabChange = (tabId: string) => {
    const tab = tabId as "approvals" | "alerts" | "messages";
    setActiveTab(tab);
    setSearchQuery("");
    setSelectedFilter(DEFAULT_FILTERS[tab] || "All");
  };

  // ------------------------------------------
  // 3I. HANDLERS — Modal Actions
  // ------------------------------------------

  /** Opens the details modal for a given item */
  const handleViewDetails = (item: any) => {
    setSelectedItem(item);
    setDetailsModalOpen(true);
  };

  /** Opens the confirmation modal for a given action type */
  const handleActionClick = (item: any, type: any) => {
    setSelectedItem(item);
    setModalActionType(type);
    setConfirmModalOpen(true);
  };

  /** Executes the confirmed action and shows a success toast */
  const handleConfirmAction = () => {
    let msg = "Action completed";
    if (modalActionType === "confirm-resolve") msg = "Alert marked as resolved";
    if (modalActionType === "confirm-reopen") msg = "Alert re-opened";
    if (modalActionType === "confirm-approve")
      msg = "Request approved successfully";

    setToast({ message: msg, type: "success" });
    setConfirmModalOpen(false);
    setModalActionType(null);
  };

  /** Navigates to a new page if within valid range */
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  // ------------------------------------------
  // 3J. HELPER — Confirmation Modal Props
  // ------------------------------------------
  /** Returns title, message, confirmText, and variant based on the current action type */
  const getConfirmationProps = () => {
    switch (modalActionType) {
      case "confirm-approve":
        return {
          title: "Approve Request",
          message: `Are you sure you want to approve request ${selectedItem?.id}? This action will trigger the next stage in the workflow.`,
          confirmText: "Approve Request",
          variant: "primary" as const,
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
    <MainLayout>
      <div className="space-y-6 pb-10">
        {/* ---- 4A. TOAST NOTIFICATION ---- */}
        {/* Displays a temporary success/error message after user actions */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* ---- 4B. CONFIRMATION MODAL ---- */}
        {/* Prompts user before approve, resolve, or re-open actions */}
        <ConfirmationModal
          isOpen={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={handleConfirmAction}
          title={confirmProps.title}
          message={confirmProps.message}
          confirmText={confirmProps.confirmText}
          variant={confirmProps.variant}
        />

        {/* ---- 4C. DETAILS MODAL ---- */}
        {/* Shows full information for a selected item (approval, alert, or message) */}
        <DetailsModal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          title={activeTab === "messages" ? "System Log" : "Request Details"}
          itemId={selectedItem?.id || ""}
          headerIcon={
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <FileText size={18} />
            </div>
          }
          gridFields={[
            {
              label: "Module",
              value: selectedItem?.module || selectedItem?.type,
              icon: Tag,
            },
            {
              label: "Time",
              value: selectedItem?.time,
              icon: Calendar,
            },
            {
              label: "Branch",
              value: selectedItem?.branch,
              icon: MapPin,
            },
            {
              label: "Status",
              value: (
                <StatusBadge
                  status={
                    selectedItem?.status || selectedItem?.severity || "Info"
                  }
                />
              ),
              icon: Info,
            },
          ]}
        >
          {/* Subject / Task */}
          <span className="block text-xs font-bold text-slate-800 mb-2">
            Subject / Task
          </span>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            {selectedItem?.task || selectedItem?.message}
          </p>

          {/* Full Description */}
          <span className="block text-xs font-bold text-slate-800 mb-2">
            Full Description
          </span>
          <p className="text-xs text-slate-500 leading-relaxed">
            {selectedItem?.details}
          </p>

          {/* Resolved By indicator (only for resolved alerts) */}
          {selectedItem?.resolvedBy && (
            <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center gap-2">
              <CheckCircle size={12} className="text-emerald-500" />
              <span className="text-xs text-emerald-700 font-medium">
                Resolved by {selectedItem.resolvedBy}
              </span>
            </div>
          )}
        </DetailsModal>

        {/* ---- 4D. PAGE HEADER ---- */}
        {/* Title, description */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Notifications
            </h1>
            <p className="text-slate-500 mt-2 text-xs font-medium">
              Manage approvals, alerts, and system logs.
            </p>
          </div>
        </div>

        {/* ---- 4E. TAB BAR ---- */}
        {/* Switches between Approvals, Alerts, and System Messages tabs */}
        <TabBar
          tabs={TAB_CONFIG}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* ---- 4F. CONTENT CARD — Toolbar + Table + Pagination ---- */}
        <Card className="overflow-hidden flex flex-col min-h-[400px]">
          {/* ---- 4F-1. TOOLBAR inside table card — Search + Filter side by side ---- */}
          <div className="flex items-center gap-2 px-6 pt-5 pb-4 border-b border-slate-100">
            {/* Search Input */}
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

            {/* Filter Dropdown — directly beside the search input */}
            <FilterDropdown
              options={FILTER_OPTIONS[activeTab]}
              selected={selectedFilter}
              onSelect={setSelectedFilter}
            />
          </div>
          {/* === ALERTS SUB-TABS (only shown when Alerts tab is active) === */}
          {activeTab === "alerts" && (
            <div className="px-6 pt-5 pb-0 border-b border-slate-100">
              <div className="flex gap-6">
                {/* Active Alerts Tab */}
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

                {/* Resolved History Tab */}
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
                {/* Table Header */}
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    <th className="px-6 py-4">Ref ID</th>
                    <th className="px-6 py-4">Module</th>
                    <th className="px-6 py-4 hidden md:table-cell">Branch</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 hidden sm:table-cell">Time</th>
                    <th className="px-6 py-4 text-left">Action</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.map((row: any) => (
                    <tr
                      key={row.id}
                      className="group hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Ref ID — monospace pill */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">
                          {row.id}
                        </span>
                      </td>

                      {/* Module + Task */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800">
                            {row.module}
                          </span>
                          <span className="text-[10px] text-slate-500 line-clamp-1">
                            {row.task}
                          </span>
                        </div>
                      </td>

                      {/* Branch — hidden on small screens */}
                      <td className="px-6 py-4 text-xs text-slate-600 font-medium hidden md:table-cell">
                        {row.branch}
                      </td>

                      {/* Status — uses StatusBadge */}
                      <td className="px-6 py-4">
                        <StatusBadge status={row.status} />
                      </td>

                      {/* Time — hidden on mobile */}
                      <td className="px-6 py-4 text-xs text-slate-500 hidden sm:table-cell">
                        {row.time}
                      </td>

                      {/* Actions — View Details + Approve */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-start gap-2">
                          {/* View Details Icon Button */}
                          <Tooltip content="View Details">
                            <button
                              aria-label="View Details"
                              onClick={() => handleViewDetails(row)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                            >
                              <Eye size={16} aria-hidden="true" />
                            </button>
                          </Tooltip>

                          {/* Divider */}
                          <div className="w-px h-4 bg-slate-200" />

                          {/* Approve Button — primary action */}
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
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* Empty State */}
                  {paginatedData.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
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
                {/* Table Header */}
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    <th className="px-6 py-4">Alert ID</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4 hidden lg:table-cell">Module</th>
                    <th className="px-6 py-4 hidden md:table-cell">Branch</th>
                    <th className="px-6 py-4">Severity</th>
                    <th className="px-6 py-4 hidden sm:table-cell">Time</th>
                    <th className="px-6 py-4 text-left">Action</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.map((row: any) => (
                    <tr
                      key={row.id}
                      className="group hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Alert ID */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-medium text-slate-700">
                          {row.id}
                        </span>
                      </td>

                      {/* Alert Type + Message Preview */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800">
                            {row.type}
                          </span>
                          <span className="text-[10px] text-slate-500 line-clamp-1">
                            {row.message}
                          </span>
                        </div>
                      </td>

                      {/* Module — hidden on smaller screens */}
                      <td className="px-6 py-4 text-xs text-slate-600 hidden lg:table-cell">
                        {row.module}
                      </td>

                      {/* Branch — hidden on mobile */}
                      <td className="px-6 py-4 text-xs text-slate-600 hidden md:table-cell">
                        {row.branch}
                      </td>

                      {/* Severity — uses StatusBadge */}
                      <td className="px-6 py-4">
                        <StatusBadge status={row.severity} />
                      </td>

                      {/* Time — hidden on mobile */}
                      <td className="px-6 py-4 text-xs text-slate-500 hidden sm:table-cell">
                        {row.time}
                      </td>

                      {/* Actions — View + Resolve/Re-open */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-start gap-2">
                          {/* View Details */}
                          <Tooltip content="View Details">
                            <button
                              aria-label="View Details"
                              onClick={() => handleViewDetails(row)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                            >
                              <Eye size={16} aria-hidden="true" />
                            </button>
                          </Tooltip>

                          {/* Conditional Action: Resolve (active) or Re-open (resolved) */}
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

                  {/* Empty State */}
                  {paginatedData.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
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

          {/* ======================= */}
          {/* TAB 3: SYSTEM MESSAGES   */}
          {/* ======================= */}
          {activeTab === "messages" && (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                {/* Table Header */}
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    <th className="px-6 py-4">Msg ID</th>
                    <th className="px-6 py-4">Message</th>
                    <th className="px-6 py-4 hidden md:table-cell">
                      User / Actor
                    </th>
                    <th className="px-6 py-4 hidden md:table-cell">Branch</th>
                    <th className="px-6 py-4 hidden sm:table-cell">Time</th>
                    <th className="px-6 py-4 text-left">Action</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.map((row: any) => (
                    <tr
                      key={row.id}
                      className="group hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Message ID */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-slate-500">
                          {row.id}
                        </span>
                      </td>

                      {/* Message Content with icon */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0"
                            aria-hidden="true"
                          >
                            <Info size={13} />
                          </div>
                          <span className="text-xs font-bold text-slate-800">
                            {row.message}
                          </span>
                        </div>
                      </td>

                      {/* User/Actor — hidden on mobile */}
                      <td className="px-6 py-4 text-xs text-slate-600 font-medium hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                          <User
                            size={12}
                            className="text-slate-400"
                            aria-hidden="true"
                          />
                          {row.user}
                        </div>
                      </td>

                      {/* Branch — hidden on mobile */}
                      <td className="px-6 py-4 text-xs text-slate-600 hidden md:table-cell">
                        {row.branch}
                      </td>

                      {/* Time — hidden on mobile */}
                      <td className="px-6 py-4 text-xs text-slate-500 hidden sm:table-cell">
                        {row.time}
                      </td>

                      {/* View Log Action */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-start">
                          <SecondaryButton
                            onClick={() => handleViewDetails(row)}
                            icon={Eye}
                            ariaLabel={`View log ${row.id}`}
                            className="!px-3 !py-1.5 !text-[10px] !font-bold"
                          >
                            View Log
                          </SecondaryButton>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* Empty State */}
                  {paginatedData.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="p-3 bg-slate-50 rounded-full">
                            <Bell
                              size={18}
                              className="text-slate-400"
                              aria-hidden="true"
                            />
                          </div>
                          <p className="text-xs font-bold text-slate-500">
                            No messages found
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

          {/* ---- 4H. PAGINATION CONTROLS ---- */}
          {/* Shows page navigation at the bottom of the table card */}
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
    </MainLayout>
  );
};

export default NotificationsPage;
