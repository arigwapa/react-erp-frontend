// ==========================================
// BranchManagementPage.tsx
// Admin page for managing branches — supports
// viewing, searching, filtering, adding, editing,
// and toggling branch status (active / inactive).
// Each branch has a code, assigned admin, and
// operates under the branch isolation protocol.
// ==========================================

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Building2,
  Search,
  MapPin,
  X,
  Plus,
  Edit,
  // Icons for Stats Cards
  Activity,
  Archive,
  UserX,
  ShieldCheck,
} from "lucide-react";

// ==========================================
// SECTION 1: REUSABLE COMPONENT IMPORTS
// All shared UI components from components/ui/
// to keep this page lean and consistent.
// ==========================================
import MainLayout from "../../layout/MainLayout";
import { Card } from "../../components/ui/Card";
import PrimaryButton from "../../components/ui/PrimaryButton";
import SecondaryButton from "../../components/ui/SecondaryButton";
import { StatusBadge } from "../../components/ui/StatusBadge";
import StatsCard from "../../components/ui/StatsCard";
import ToggleSwitch from "../../components/ui/ToggleSwitch";
import IconSelect from "../../components/ui/IconSelect";
import Pagination from "../../components/ui/Pagination";
import FilterDropdown from "../../components/ui/FilterDropdown";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Toast from "../../components/ui/Toast";

// ==========================================
// SECTION 2: TYPES & INTERFACES
// ==========================================

/** Shape of a single Branch object */
interface Branch {
  id: string;
  name: string;
  code: string;
  status: "Active" | "Inactive";
  adminName: string | null;
  description: string;
  createdAt: string;
}

// ==========================================
// SECTION 3: CONSTANTS & MOCK DATA
// Centralised at the top so they are easy to
// locate and eventually replace with API calls.
// ==========================================

/** Number of branches displayed per page in the table */
const ITEMS_PER_PAGE = 5;

/** Pre-seeded branches for demo / dev */
const MOCK_BRANCHES: Branch[] = [
  {
    id: "1",
    name: "Manila Main",
    code: "BR-MNL",
    status: "Active",
    adminName: "Juan Cruz",
    description: "Headquarters and main distribution center.",
    createdAt: "Jan 10, 2026",
  },
  {
    id: "2",
    name: "Cebu Warehouse",
    code: "BR-CEB",
    status: "Active",
    adminName: "Maria Santos",
    description: "Visayas logistic hub.",
    createdAt: "Jan 12, 2026",
  },
  {
    id: "3",
    name: "Davao Outlet",
    code: "BR-DVO",
    status: "Inactive",
    adminName: null,
    description: "Currently under renovation.",
    createdAt: "Feb 01, 2026",
  },
];

/** Available admins for the dropdown */
const MOCK_ADMINS = ["Juan Cruz", "Maria Santos", "Pedro Reyes", "Ana Lim"];

/** Options formatted for the reusable IconSelect component (icon is optional) */
const ADMIN_OPTIONS = [
  { value: "", label: "No Administrator Assigned" },
  ...MOCK_ADMINS.map((admin) => ({ value: admin, label: admin })),
];

// ==========================================
// SECTION 4: MAIN PAGE COMPONENT
// ==========================================
function BranchManagementPage() {
  // ------------------------------------------
  // 4a. State — Core Data
  // ------------------------------------------
  const [branches, setBranches] = useState<Branch[]>(MOCK_BRANCHES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // ------------------------------------------
  // 4b. State — Modals
  // ------------------------------------------
  /** Controls the Add / Edit modal visibility */
  const [isModalOpen, setIsModalOpen] = useState(false);
  /** Holds the branch being edited (null = adding new) */
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  /** Confirmation modal for status toggle */
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [branchToToggle, setBranchToToggle] = useState<Branch | null>(null);

  // ------------------------------------------
  // 4c. State — Toast Notification
  // ------------------------------------------
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // ------------------------------------------
  // 4d. State — Form Data (Add / Edit Modal)
  // ------------------------------------------
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    status: "Active" as "Active" | "Inactive",
    adminName: "" as string,
    description: "",
  });

  // ------------------------------------------
  // 4e. State — Pagination
  // ------------------------------------------
  const [currentPage, setCurrentPage] = useState(1);

  // ------------------------------------------
  // 4f. Metrics — Computed from branch list
  // ------------------------------------------
  const metrics = useMemo(
    () => ({
      total: branches.length,
      active: branches.filter((b) => b.status === "Active").length,
      inactive: branches.filter((b) => b.status === "Inactive").length,
      noAdmin: branches.filter((b) => !b.adminName).length,
    }),
    [branches],
  );

  // ------------------------------------------
  // 4g. Filtering Logic
  // ------------------------------------------
  /** Filters branches by search query AND status filter */
  const filteredBranches = useMemo(
    () =>
      branches.filter((branch) => {
        const matchesSearch =
          branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          branch.code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
          statusFilter === "All" || branch.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [branches, searchQuery, statusFilter],
  );

  /** Reset to page 1 whenever search or filter criteria change */
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // ------------------------------------------
  // 4h. Pagination Logic
  // ------------------------------------------
  const totalPages = Math.ceil(filteredBranches.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(
    startIndex + ITEMS_PER_PAGE,
    filteredBranches.length,
  );
  const paginatedBranches = filteredBranches.slice(startIndex, endIndex);

  /** Navigates to a new page if within valid range */
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  // ------------------------------------------
  // 4i. Handlers — Branch CRUD
  // ------------------------------------------

  /** Show a toast message */
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  /** Open modal in "Add" mode (empty form) */
  const openAddModal = () => {
    setEditingBranch(null);
    setFormData({
      name: "",
      code: "",
      status: "Active",
      adminName: "",
      description: "",
    });
    setIsModalOpen(true);
  };

  /** Open modal in "Edit" mode with pre-filled data */
  const openEditModal = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      code: branch.code,
      status: branch.status,
      adminName: branch.adminName || "",
      description: branch.description,
    });
    setIsModalOpen(true);
  };

  /** Save handler for both Add and Edit operations */
  const handleSave = () => {
    if (!formData.name || !formData.code)
      return showToast("Name and Code are required.", "error");

    if (editingBranch) {
      // Update existing branch
      setBranches((prev) =>
        prev.map((b) =>
          b.id === editingBranch.id
            ? { ...b, ...formData, adminName: formData.adminName || null }
            : b,
        ),
      );
      showToast("Branch updated successfully.", "success");
    } else {
      // Create new branch
      const newBranch: Branch = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        adminName: formData.adminName || null,
        createdAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      };
      setBranches([...branches, newBranch]);
      showToast("New branch created successfully.", "success");
    }
    setIsModalOpen(false);
  };

  // ------------------------------------------
  // 4j. Handlers — Status Toggle
  // ------------------------------------------

  /** Opens the confirmation modal before toggling status */
  const confirmToggleStatus = (branch: Branch) => {
    setBranchToToggle(branch);
    setIsConfirmOpen(true);
  };

  /** Executes the status toggle after user confirms */
  const handleStatusToggle = () => {
    if (branchToToggle) {
      setBranches((prev) =>
        prev.map((b) =>
          b.id === branchToToggle.id
            ? {
                ...b,
                status: b.status === "Active" ? "Inactive" : "Active",
              }
            : b,
        ),
      );
      showToast(
        `Branch marked as ${
          branchToToggle.status === "Active" ? "Inactive" : "Active"
        }`,
        "success",
      );
      setIsConfirmOpen(false);
      setBranchToToggle(null);
    }
  };

  // ==========================================
  // SECTION 5: JSX RENDER
  // ==========================================
  return (
    <MainLayout>
      {/* ---- TOAST NOTIFICATION ---- */}
      {/* Displays ephemeral success / error messages */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-7xl mx-auto space-y-8 pb-10">
        {/* ---- PAGE HEADER ---- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Branch Management
            </h1>
            <p className="text-slate-500 mt-1 text-xs font-medium">
              Oversee branch operations, assignments, and access control.
            </p>
          </div>
        </div>

        {/* ---- SECURITY / ISOLATION CALLOUT ---- */}
        {/* Informs admins about data-scoping rules */}
        <div
          role="note"
          aria-label="Security Information"
          className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-100 rounded-xl p-5 flex items-start gap-4 shadow-sm"
        >
          <div
            className="bg-white p-2 rounded-lg shadow-sm text-blue-600"
            aria-hidden="true"
          >
            <ShieldCheck size={18} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide">
              Branch Isolation Protocol Active
            </h3>
            <p className="text-xs text-blue-700/80 mt-1 leading-relaxed max-w-2xl">
              Data visibility is strictly scoped. Users can only access records
              within their assigned branch. Only <strong>Super Admins</strong>{" "}
              retain cross-branch visibility.
            </p>
          </div>
        </div>

        {/* ---- STATS CARDS ---- */}
        {/* Quick-glance metrics computed from branch list */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          aria-label="Dashboard Metrics"
        >
          <StatsCard
            title="Total Branches"
            value={metrics.total}
            icon={Building2}
            color="bg-blue-500"
          />
          <StatsCard
            title="Active Operations"
            value={metrics.active}
            icon={Activity}
            color="bg-emerald-500"
            trend="+2"
            trendUp={true}
          />
          <StatsCard
            title="Inactive / Closed"
            value={metrics.inactive}
            icon={Archive}
            color="bg-slate-500"
          />
          <StatsCard
            title="Unassigned Admins"
            value={metrics.noAdmin}
            icon={UserX}
            color="bg-amber-500"
          />
        </div>

        {/* ---- MAIN CONTENT CARD (Toolbar + Table + Pagination) ---- */}
        {/* Uses reusable Card component for consistent styling */}
        <Card className="overflow-hidden">
          {/* -- Toolbar: Search + Filter + Add Branch -- */}
          {/* Layout matches the UserManagement toolbar pattern */}
          <div className="p-5 border-b border-slate-100 bg-white">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              {/* Left side: Search + Filter */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Search Input — filters by name or branch code */}
                <div className="relative group flex-1 sm:flex-none">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors"
                    size={14}
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    placeholder="Search by name or code..."
                    aria-label="Search branches"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 pl-9 pr-4 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-full outline-none focus:bg-white focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Filter Dropdown — uses reusable FilterDropdown component */}
                <FilterDropdown
                  options={["All Statuses", "Active", "Inactive"]}
                  selected={
                    statusFilter === "All" ? "All Statuses" : statusFilter
                  }
                  onSelect={(opt) =>
                    setStatusFilter(opt === "All Statuses" ? "All" : opt)
                  }
                  label={
                    statusFilter === "All" ? "All Statuses" : statusFilter
                  }
                />
              </div>

              {/* Right side: Add Branch — copies the Add User design (SecondaryButton) */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-start">
                <SecondaryButton
                  onClick={openAddModal}
                  icon={Plus}
                  ariaLabel="Add new branch"
                >
                  Add Branch
                </SecondaryButton>
              </div>
            </div>
          </div>

          {/* -- Branch Table -- */}
          <div className="overflow-x-auto">
            <table
              className="w-full text-left text-xs text-slate-600"
              aria-label="Branches List"
            >
              {/* Table Header — 12px font size (text-xs) per user request */}
              <thead className="bg-slate-50/50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    Branch Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    Code
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    Assigned Admin
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    Created
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left"
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              {/* Table Body — maps over paginated branches or shows empty state */}
              <tbody className="divide-y divide-slate-100">
                {paginatedBranches.length > 0 ? (
                  paginatedBranches.map((branch) => (
                    <tr
                      key={branch.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Column: Branch Name with map icon */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400"
                            aria-hidden="true"
                          >
                            <MapPin size={14} />
                          </div>
                          <span className="font-semibold text-slate-900">
                            {branch.name}
                          </span>
                        </div>
                      </td>

                      {/* Column: Code — round pill badge */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-[10px] bg-slate-100 px-2.5 py-1 rounded-full text-slate-600 border border-slate-200">
                          {branch.code}
                        </span>
                      </td>

                      {/* Column: Status — uses reusable StatusBadge (already rounded-full) */}
                      <td className="px-6 py-4">
                        <StatusBadge status={branch.status} />
                      </td>

                      {/* Column: Assigned Admin */}
                      <td className="px-6 py-4">
                        {branch.adminName ? (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] text-indigo-700 font-bold ring-2 ring-white"
                              aria-hidden="true"
                            >
                              {branch.adminName.charAt(0)}
                            </div>
                            <span className="text-slate-700">
                              {branch.adminName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Column: Created Date */}
                      <td className="px-6 py-4 text-slate-500">
                        {branch.createdAt}
                      </td>

                      {/* Column: Actions — Edit button + ToggleSwitch */}
                      {/* Replaced the Power icon with a reusable ToggleSwitch */}
                      <td className="px-6 py-4 text-left">
                        <div className="flex items-center justify-start gap-3">
                          {/* Edit button */}
                          <button
                            onClick={() => openEditModal(branch)}
                            className="p-1.5 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 rounded-lg text-slate-500 transition-all"
                            title="Edit Details"
                            aria-label={`Edit ${branch.name}`}
                          >
                            <Edit size={14} aria-hidden="true" />
                          </button>

                          {/* Archive Button */}
                          <button
                            onClick={() => {
                              setBranches(prev => prev.filter(b => b.id !== branch.id));
                              showToast(`Branch ${branch.name} has been archived.`, "success");
                            }}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                            title="Archive"
                          >
                            <Archive size={14} />
                          </button>

                          {/* Toggle Switch — enable / disable branch */}
                          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                            <ToggleSwitch
                              active={branch.status === "Active"}
                              onToggle={() => confirmToggleStatus(branch)}
                              label={`Toggle status for ${branch.name}`}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  /* ---- Empty State ---- */
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <div className="bg-slate-50 p-4 rounded-full mb-3">
                          <Search
                            size={20}
                            className="text-slate-400"
                            aria-hidden="true"
                          />
                        </div>
                        <p className="text-xs font-bold text-slate-900">
                          No branches found
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto">
                          We couldn't find any branches matching "
                          {searchQuery}". Try adjusting your filters.
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
            totalItems={filteredBranches.length}
            onPageChange={handlePageChange}
          />
        </Card>

        {/* ==========================================
            SECTION 6: MODALS
            All modals are rendered at the bottom of the
            component tree so they overlay the full page.
            ========================================== */}

        {/* ---- ADD / EDIT BRANCH MODAL ---- */}
        {/* Design copied from UserManagement modal for consistency:
            - Clean header with title + subtitle + X close button
            - Vertically stacked fields
            - IconSelect for admin dropdown
            - ToggleSwitch for status
            - Footer with Cancel + Submit */}
        {isModalOpen && createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3
                    id="modal-title"
                    className="text-base font-bold text-slate-900"
                  >
                    {editingBranch ? "Edit Branch" : "Add New Branch"}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    {editingBranch
                      ? "Update branch details and access."
                      : "Establish a new operation location."}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors p-2 rounded-full"
                  aria-label="Close modal"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              {/* Modal Body — vertically stacked fields for readability */}
              <div className="p-6 space-y-5">
                {/* Field: Branch Name (required) */}
                <div>
                  <label
                    htmlFor="branch-name"
                    className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1"
                  >
                    Branch Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="branch-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 transition-all placeholder:text-slate-400"
                    placeholder="e.g. Manila Headquarters"
                    autoFocus
                  />
                </div>

                {/* Field: Branch Code (required) */}
                <div>
                  <label
                    htmlFor="branch-code"
                    className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1"
                  >
                    Branch Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="branch-code"
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium font-mono uppercase outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 transition-all placeholder:text-slate-400"
                    placeholder="BR-XXX"
                  />
                </div>

                {/* Field: Status — uses reusable ToggleSwitch */}
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                    Status
                  </span>
                  <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
                    <ToggleSwitch
                      active={formData.status === "Active"}
                      onToggle={() =>
                        setFormData({
                          ...formData,
                          status:
                            formData.status === "Active"
                              ? "Inactive"
                              : "Active",
                        })
                      }
                      label="Toggle branch status"
                    />
                    <span
                      className={`text-xs font-semibold ${
                        formData.status === "Active"
                          ? "text-emerald-600"
                          : "text-slate-500"
                      }`}
                    >
                      {formData.status}
                    </span>
                  </div>
                </div>

                {/* Field: Assigned Admin — uses reusable IconSelect */}
                <IconSelect
                  label="Assigned Admin"
                  value={formData.adminName}
                  onChange={(val) =>
                    setFormData({ ...formData, adminName: val })
                  }
                  options={ADMIN_OPTIONS}
                  placeholder="No Administrator Assigned"
                />

                {/* Field: Notes / Description (optional) */}
                <div>
                  <label
                    htmlFor="branch-desc"
                    className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1"
                  >
                    Notes
                  </label>
                  <textarea
                    id="branch-desc"
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 transition-all placeholder:text-slate-400 resize-none"
                    placeholder="Add optional details about this branch..."
                  />
                </div>
              </div>

              {/* Modal Footer — Cancel + Submit (consistent with other modals) */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <PrimaryButton
                  onClick={handleSave}
                  className="!w-auto !py-2.5 !px-5 !text-xs !rounded-xl"
                >
                  {editingBranch ? "Save Changes" : "Create Branch"}
                </PrimaryButton>
              </div>
            </div>
          </div>,
          document.body,
        )}

        {/* ---- CONFIRMATION MODAL (Status Toggle) ---- */}
        {/* Asks the user to confirm before activating / deactivating a branch */}
        <ConfirmationModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleStatusToggle}
          title={
            branchToToggle?.status === "Active"
              ? "Deactivate Branch"
              : "Activate Branch"
          }
          message={
            branchToToggle?.status === "Active"
              ? `Are you sure you want to deactivate ${branchToToggle.name}? This will restrict new data entry for this branch.`
              : `Re-activate ${branchToToggle?.name}? The branch will become available for assignment.`
          }
          variant={branchToToggle?.status === "Active" ? "danger" : "primary"}
          confirmText={
            branchToToggle?.status === "Active"
              ? "Yes, Deactivate"
              : "Activate"
          }
        />
      </div>
    </MainLayout>
  );
}

export default BranchManagementPage;
