// ==========================================
// AuditLogsPage.tsx
// Admin page for viewing system audit logs —
// tracks user activities, security events, and
// system changes. Supports searching, filtering
// by date / branch / module / action, pagination,
// and viewing full log details via a modal.
// ==========================================

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Calendar,
  ShieldAlert,
  ChevronDown,
  X,
  Eye,
  MapPin,
  Wifi,
  Layers,
  User,
  History,
  Clock,
} from "lucide-react";

// ==========================================
// SECTION 1: REUSABLE COMPONENT IMPORTS
// All shared UI components from components/ui/
// to keep this page lean and consistent.
// ==========================================
import MainLayout from "../../layout/MainLayout";
import { Card } from "../../components/ui/Card";
import SecondaryButton from "../../components/ui/SecondaryButton";
import { StatusBadge } from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";
import DetailsModal from "../../components/ui/DetailsModal";
import Toast from "../../components/ui/Toast";
import IconSelect from "../../components/ui/IconSelect";

// ==========================================
// SECTION 2: TYPES & INTERFACES
// ==========================================

/** Shape of a single audit log entry */
interface LogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: "Create" | "Update" | "Delete" | "Login" | "Security";
  module: "PLM" | "Quality" | "Production" | "Admin";
  details: string;
  ipAddress: string;
  branch: string;
}

// ==========================================
// SECTION 3: CONSTANTS & MOCK DATA
// Centralised at the top so they are easy to
// locate and eventually replace with API calls.
// ==========================================

/** Number of log entries displayed per page */
const ITEMS_PER_PAGE = 5;

/** Pre-seeded audit log entries for demo / dev */
const MOCK_LOGS: LogEntry[] = [
  {
    id: "LOG-001",
    timestamp: "2026-02-12 09:15 AM",
    user: "Alexandra Hamilton",
    role: "Super Admin",
    action: "Update",
    module: "PLM",
    details: "Approved BOM revision for Denim Jkt v2",
    ipAddress: "192.168.1.45",
    branch: "Manila Main",
  },
  {
    id: "LOG-002",
    timestamp: "2026-02-12 08:45 AM",
    user: "John Doe",
    role: "QA Manager",
    action: "Create",
    module: "Quality",
    details: "Logged new defect report #DEF-209",
    ipAddress: "112.203.20.10",
    branch: "Cebu Warehouse",
  },
  {
    id: "LOG-003",
    timestamp: "2026-02-11 04:30 PM",
    user: "System",
    role: "System",
    action: "Security",
    module: "Admin",
    details: "Failed login attempt detected",
    ipAddress: "45.12.90.11",
    branch: "Unknown",
  },
  {
    id: "LOG-004",
    timestamp: "2026-02-10 01:15 PM",
    user: "Sarah Jenkins",
    role: "Production Lead",
    action: "Delete",
    module: "Production",
    details: "Deleted duplicate batch record #992",
    ipAddress: "192.168.1.88",
    branch: "Manila Main",
  },
];

/** Options for filter dropdowns — formatted for IconSelect */
const BRANCH_OPTIONS = [
  { value: "All", label: "All Branches" },
  { value: "Manila Main", label: "Manila Main" },
  { value: "Cebu Warehouse", label: "Cebu Warehouse" },
  { value: "Unknown", label: "Unknown" },
];

const MODULE_OPTIONS = [
  { value: "All", label: "All Modules" },
  { value: "PLM", label: "PLM" },
  { value: "Quality", label: "Quality" },
  { value: "Production", label: "Production" },
  { value: "Admin", label: "Admin" },
];

const ACTION_OPTIONS = [
  { value: "All", label: "All Actions" },
  { value: "Create", label: "Create" },
  { value: "Update", label: "Update" },
  { value: "Delete", label: "Delete" },
  { value: "Login", label: "Login" },
  { value: "Security", label: "Security" },
];

// ==========================================
// SECTION 4: MAIN PAGE COMPONENT
// ==========================================
function AuditLogsPage() {
  // ------------------------------------------
  // 4a. State — Core Data
  // ------------------------------------------
  const [logs] = useState<LogEntry[]>(MOCK_LOGS);

  // ------------------------------------------
  // 4b. State — Filters
  // ------------------------------------------
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateStart: "",
    branch: "All",
    module: "All",
    action: "All",
    search: "",
  });

  // ------------------------------------------
  // 4c. State — Toast
  // ------------------------------------------
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // ------------------------------------------
  // 4d. State — Pagination
  // ------------------------------------------
  const [currentPage, setCurrentPage] = useState(1);

  // ------------------------------------------
  // 4e. State — Details Modal
  // ------------------------------------------
  /** The log entry currently being viewed in the modal (null = closed) */
  const [detailLog, setDetailLog] = useState<LogEntry | null>(null);

  // ------------------------------------------
  // 4f. Filtering Logic
  // ------------------------------------------
  /** Filters logs by search query AND all dropdown filters */
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Search — matches user, IP, ID, or details
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        filters.search === "" ||
        log.user.toLowerCase().includes(searchLower) ||
        log.ipAddress.includes(searchLower) ||
        log.id.toLowerCase().includes(searchLower) ||
        log.details.toLowerCase().includes(searchLower);

      // 2. Date — substring match on timestamp
      const matchesDate =
        filters.dateStart === "" ||
        log.timestamp.startsWith(filters.dateStart);

      // 3. Dropdown filters
      const matchesBranch =
        filters.branch === "All" || log.branch === filters.branch;
      const matchesModule =
        filters.module === "All" || log.module === filters.module;
      const matchesAction =
        filters.action === "All" || log.action === filters.action;

      return (
        matchesSearch &&
        matchesDate &&
        matchesBranch &&
        matchesModule &&
        matchesAction
      );
    });
  }, [filters, logs]);

  /** Reset to page 1 whenever filter criteria change */
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // ------------------------------------------
  // 4g. Pagination Logic
  // ------------------------------------------
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredLogs.length);
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  /** Navigates to a new page if within valid range */
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  // ------------------------------------------
  // 4h. Handlers
  // ------------------------------------------
  const handleExport = () => {
    setToast({ message: "Exporting Audit Logs...", type: "success" });
  };

  // ==========================================
  // SECTION 5: JSX RENDER
  // ==========================================
  return (
    <MainLayout>
      {/* ---- TOAST NOTIFICATION ---- */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-7xl mx-auto space-y-6 pb-20">
        {/* ---- PAGE HEADER ---- */}
        {/* Title without icon (removed per user request) + Export button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              System Audit Logs
            </h1>
            <p className="text-slate-500 text-xs font-medium mt-1">
              Track all user activities, security events, and system changes.
            </p>
          </div>

          {/* Export Button — uses SecondaryButton for consistent corner radius */}
          <SecondaryButton
            onClick={handleExport}
            icon={Download}
            ariaLabel="Export Logs"
          >
            Export Logs
          </SecondaryButton>
        </div>

        {/* ---- SEARCH & FILTER BAR ---- */}
        {/* Positioned with z-20 so filter dropdowns overlay the table below */}
        <div className="space-y-4 relative z-20">
          {/* Main Search + Filter Toggle Row */}
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Search Input — filters by user, IP, ID, or details */}
              <div className="relative group w-full sm:w-72">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors"
                  size={14}
                  aria-hidden="true"
                />
                <input
                  type="text"
                  placeholder="Search User, IP, ID..."
                  aria-label="Search audit logs"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="w-full pl-9 pr-8 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-full outline-none focus:bg-white focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all placeholder:text-slate-400"
                />
                {/* Clear search button */}
                {filters.search && (
                  <button
                    aria-label="Clear search"
                    onClick={() => setFilters({ ...filters, search: "" })}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Filter Toggle Button — shows/hides the filter panel */}
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                aria-expanded={isFilterOpen}
                aria-label="Toggle filter panel"
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 ${
                  isFilterOpen
                    ? "bg-slate-900 text-white border-slate-900 shadow-md"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Filter size={14} aria-hidden="true" />
                <span>Filters</span>
                <ChevronDown
                  size={12}
                  aria-hidden="true"
                  className={`transition-transform duration-200 ${
                    isFilterOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* ---- COLLAPSIBLE FILTER PANEL ---- */}
          {/* Uses reusable IconSelect for each dropdown filter */}
          {isFilterOpen && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 animate-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Date Filter */}
                <div>
                  <label
                    htmlFor="startDate"
                    className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1"
                  >
                    Date
                  </label>
                  <div className="relative group">
                    <Calendar
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-slate-600 transition-colors"
                      size={14}
                    />
                    <input
                      id="startDate"
                      type="date"
                      className="w-full bg-white text-slate-700 text-xs font-medium border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-300 transition-all cursor-pointer hover:border-slate-300 hover:bg-slate-50"
                      value={filters.dateStart}
                      onChange={(e) =>
                        setFilters({ ...filters, dateStart: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Branch Filter — uses reusable IconSelect */}
                <IconSelect
                  label="Branch"
                  value={filters.branch}
                  onChange={(val) => setFilters({ ...filters, branch: val })}
                  options={BRANCH_OPTIONS}
                  placeholder="All Branches"
                />

                {/* Module Filter — uses reusable IconSelect */}
                <IconSelect
                  label="Module"
                  value={filters.module}
                  onChange={(val) => setFilters({ ...filters, module: val })}
                  options={MODULE_OPTIONS}
                  placeholder="All Modules"
                />

                {/* Action Type Filter — uses reusable IconSelect */}
                <IconSelect
                  label="Action Type"
                  value={filters.action}
                  onChange={(val) => setFilters({ ...filters, action: val })}
                  options={ACTION_OPTIONS}
                  placeholder="All Actions"
                />
              </div>
            </div>
          )}
        </div>

        {/* ---- LOGS TABLE ---- */}
        {/* Uses reusable Card component; z-0 ensures filter dropdowns overlay it */}
        <Card className="overflow-hidden relative z-0">
          <div className="overflow-x-auto">
            <table
              className="w-full text-left text-xs text-slate-600"
              aria-label="Audit Logs"
            >
              {/* Table Header — 12px font (text-xs) */}
              <thead className="bg-slate-50/50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    Timestamp
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    User & Role
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    Module
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    Action
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left"
                  >
                    Details
                  </th>
                </tr>
              </thead>

              {/* Table Body — maps over paginated logs or shows empty state */}
              <tbody className="divide-y divide-slate-100">
                {paginatedLogs.length > 0 ? (
                  paginatedLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Column: Timestamp */}
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                        {log.timestamp}
                      </td>

                      {/* Column: User & Role */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 ring-2 ring-white shrink-0"
                            aria-hidden="true"
                          >
                            {log.user.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">
                              {log.user}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {log.role}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column: Module — round pill badge */}
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          {log.module}
                        </span>
                      </td>

                      {/* Column: Action — uses reusable StatusBadge */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {log.action === "Security" && (
                            <ShieldAlert size={14} className="text-rose-600" />
                          )}
                          <StatusBadge status={log.action} />
                        </div>
                      </td>

                      {/* Column: Details — Eye icon opens the DetailsModal */}
                      <td className="px-6 py-4 text-left">
                        <button
                          onClick={() => setDetailLog(log)}
                          className="p-1.5 text-slate-400 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-all"
                          aria-label={`View details for ${log.id}`}
                          title="View Details"
                        >
                          <Eye size={14} aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  /* ---- Empty State ---- */
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <div className="bg-slate-50 p-4 rounded-full mb-3">
                          <Search
                            size={20}
                            className="text-slate-400"
                            aria-hidden="true"
                          />
                        </div>
                        <p className="text-xs font-bold text-slate-900">
                          No logs found
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Try adjusting your filters or search terms.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ---- PAGINATION ---- */}
          {/* Uses reusable Pagination component below the table */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={filteredLogs.length}
            onPageChange={handlePageChange}
          />
        </Card>

        {/* ==========================================
            SECTION 6: MODALS
            ========================================== */}

        {/* ---- LOG DETAILS MODAL ---- */}
        {/* Opens when the Eye icon is clicked on a table row.
            Uses the reusable DetailsModal with grid fields for
            structured display of all log entry data. */}
        <DetailsModal
          isOpen={!!detailLog}
          onClose={() => setDetailLog(null)}
          title="Audit Log Entry"
          itemId={detailLog?.id || ""}
          headerIcon={
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <History size={18} />
            </div>
          }
          gridFields={[
            {
              label: "Timestamp",
              value: detailLog?.timestamp || "N/A",
              icon: Clock,
            },
            {
              label: "User",
              value: detailLog?.user || "N/A",
              icon: User,
            },
            {
              label: "Module",
              value: (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  {detailLog?.module}
                </span>
              ),
              icon: Layers,
            },
            {
              label: "Action",
              value: detailLog ? (
                <StatusBadge status={detailLog.action} />
              ) : (
                "N/A"
              ),
              icon: ShieldAlert,
            },
            {
              label: "Branch",
              value: detailLog?.branch || "N/A",
              icon: MapPin,
            },
            {
              label: "IP Address",
              value: (
                <span className="font-mono text-[11px]">
                  {detailLog?.ipAddress}
                </span>
              ),
              icon: Wifi,
            },
          ]}
        >
          {/* Extra content: full description + role info */}
          <span className="block text-xs font-bold text-slate-800 mb-2">
            Activity Details
          </span>
          <p className="text-xs text-slate-500 leading-relaxed">
            {detailLog?.details}
          </p>
          <div className="mt-3 pt-3 border-t border-slate-200/50 flex items-center gap-2">
            <User size={12} className="text-slate-400" />
            <span className="text-[10px] text-slate-500 font-medium">
              Role: <strong className="text-slate-700">{detailLog?.role}</strong>
            </span>
          </div>
        </DetailsModal>
      </div>
    </MainLayout>
  );
}

export default AuditLogsPage;
