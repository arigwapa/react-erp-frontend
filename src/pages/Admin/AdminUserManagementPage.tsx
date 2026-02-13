// ==========================================
// AdminUserManagementPage.tsx
// Branch Admin page for managing users within the branch — supports
// viewing, searching, filtering, adding, editing,
// toggling status, resetting passwords, and deleting user accounts.
// Branch scope only: shows users within the branch ONLY (no cross-branch users).
// ==========================================

// --- React & Hooks ---
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

// --- Icons (Lucide) ---
import {
  Search,
  Filter,
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  X,
  User,
  CheckCircle,
  AlertCircle,
  Check,
  KeyRound,
  MapPin,
  Archive,
} from "lucide-react";

// --- Layout ---
import AdminLayout from "../../layout/AdminLayout";

// --- Reusable UI Components (from components/ui) ---
import RoleBadge from "../../components/ui/RoleBadge"; // Colored badge for user roles
import Pagination from "../../components/ui/Pagination"; // Table pagination controls
import StatsCard from "../../components/ui/StatsCard"; // Summary stat cards (Total, Active, etc.)
import SecondaryButton from "../../components/ui/SecondaryButton"; // Styled secondary action button
import Toast from "../../components/ui/Toast"; // Success/error toast notifications
import ConfirmationModal from "../../components/ui/ConfirmationModal"; // Confirm before destructive actions
import { StatusBadge } from "../../components/ui/StatusBadge"; // Active/Disabled status pill
import ToggleSwitch from "../../components/ui/ToggleSwitch"; // Reusable toggle switch for enabling/disabling

// ==========================================
// SECTION 1: CONSTANTS & MOCK DATA
// ==========================================

/** Number of users displayed per page in the table */
const ITEMS_PER_PAGE = 5;

/**
 * INITIAL_USERS — Mock/seed data for the user table.
 * Each user has: id, name, email, role, status, and lastLogin.
 * All users belong to the same branch (Manila Main Branch).
 * No Super Admin users allowed in branch scope.
 * Replace this with an API call in production.
 */
const INITIAL_USERS = [
  {
    id: 1,
    name: "Maria Santos",
    email: "maria@erp.com",
    role: "PLM Manager",
    status: "Active",
    lastLogin: "Feb 2, 2026",
  },
  {
    id: 2,
    name: "Juan Dela Cruz",
    email: "juan@erp.com",
    role: "Finance Manager",
    status: "Active",
    lastLogin: "Feb 1, 2026",
  },
  {
    id: 3,
    name: "Ana Reyes",
    email: "ana@erp.com",
    role: "Production Manager",
    status: "Disabled",
    lastLogin: "Jan 15, 2026",
  },
  {
    id: 4,
    name: "Sarah Lim",
    email: "sarah@erp.com",
    role: "QA Manager",
    status: "Active",
    lastLogin: "Feb 5, 2026",
  },
  {
    id: 5,
    name: "Mike Tan",
    email: "mike@erp.com",
    role: "Warehouse Manager",
    status: "Active",
    lastLogin: "Feb 6, 2026",
  },
  {
    id: 6,
    name: "Lisa Garcia",
    email: "lisa@erp.com",
    role: "QA Manager",
    status: "Active",
    lastLogin: "Feb 10, 2026",
  },
];

// ==========================================
// SECTION 2: INLINE UTILITY COMPONENTS
// ==========================================

/**
 * ModernSelect — An accessible, custom-styled dropdown select.
 * Used in the filter panel for Role and Status filtering.
 * Props:
 *   - label: Display label above the dropdown
 *   - value: Currently selected value
 *   - onChange: Callback when user picks an option
 *   - options: Array of string options to display
 *   - placeholder: Placeholder text when nothing is selected
 */
interface ModernSelectProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
}

const ModernSelect = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select option",
}: ModernSelectProps) => {
  // Tracks whether the dropdown is open or closed
  const [isOpen, setIsOpen] = useState(false);

  // Generate a unique ID for accessibility (aria) attributes
  const selectId = `select-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="relative group min-w-[140px]">
      {/* Dropdown Label */}
      <label
        id={`${selectId}-label`}
        className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5 ml-1"
      >
        {label}
      </label>

      {/* Trigger Button — shows the current value or placeholder */}
      <button
        type="button"
        id={`${selectId}-button`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={`${selectId}-label ${selectId}-button`}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 bg-white border border-slate-200 rounded-xl transition-all outline-none focus:ring-2 focus:ring-slate-300 text-xs font-medium ${
          isOpen
            ? "ring-2 ring-slate-300 border-slate-300 shadow-sm"
            : "hover:bg-slate-50"
        } ${value ? "text-slate-700" : "text-slate-400"}`}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Options List — only renders when open */}
      {isOpen && (
        <>
          {/* Invisible overlay to close dropdown when clicking outside */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Options List */}
          <ul
            role="listbox"
            aria-labelledby={`${selectId}-label`}
            className="absolute z-50 mt-2 w-full bg-white rounded-xl border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-100 origin-top"
          >
            <div className="p-1.5 max-h-48 overflow-y-auto custom-scrollbar">
              {options.map((option) => (
                <li key={option} role="none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={value === option}
                    onClick={() => {
                      onChange(option);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between group/item ${
                      value === option
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {option}
                    {/* Checkmark icon for the currently selected option */}
                    {value === option && (
                      <Check
                        size={14}
                        className="text-emerald-500"
                        strokeWidth={3}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </li>
              ))}
            </div>
          </ul>
        </>
      )}
    </div>
  );
};

/**
 * ModalSelect — A modern custom dropdown used inside the Add/Edit User modal.
 * Consistent with the ModernSelect style (rounded corners, checkmark, animations).
 * Props:
 *   - label: Display label above the dropdown
 *   - value: Currently selected value
 *   - onChange: Callback when user picks an option
 *   - options: Array of string options to display
 *   - placeholder: Placeholder text when nothing is selected
 */
interface ModalSelectProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
}

const ModalSelect = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select option",
}: ModalSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectId = `modal-select-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="relative">
      {/* Label */}
      <label
        id={`${selectId}-label`}
        className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1"
      >
        {label}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        id={`${selectId}-button`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={`${selectId}-label ${selectId}-button`}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 bg-white border border-slate-200 rounded-xl transition-all outline-none focus:ring-2 focus:ring-slate-300 text-xs font-medium ${
          isOpen
            ? "ring-2 ring-slate-300 border-slate-300 shadow-sm"
            : "hover:bg-slate-50"
        } ${value ? "text-slate-700" : "text-slate-400"}`}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Options — only rendered when open */}
      {isOpen && (
        <>
          {/* Invisible overlay to close on outside click */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Options List */}
          <ul
            role="listbox"
            aria-labelledby={`${selectId}-label`}
            className="absolute z-50 mt-2 w-full bg-white rounded-xl border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-100 origin-top"
          >
            <div className="p-1.5 max-h-48 overflow-y-auto custom-scrollbar">
              {options.map((option) => (
                <li key={option} role="none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={value === option}
                    onClick={() => {
                      onChange(option);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                      value === option
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {option}
                    {/* Checkmark for selected option */}
                    {value === option && (
                      <Check
                        size={14}
                        className="text-emerald-500"
                        strokeWidth={3}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </li>
              ))}
            </div>
          </ul>
        </>
      )}
    </div>
  );
};

// ==========================================
// SECTION 3: MAIN PAGE COMPONENT
// ==========================================

function AdminUserManagementPage() {
  // ------------------------------------------
  // 3A. STATE — Core Data
  // ------------------------------------------
  const [users, setUsers] = useState(INITIAL_USERS); // Master list of users (branch scope only)
  const [searchQuery, setSearchQuery] = useState(""); // Search bar input value
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls Add/Edit modal visibility
  const [editingUser, setEditingUser] = useState<any>(null); // Holds the user being edited (null = adding new)

  // ------------------------------------------
  // 3B. STATE — Toast Notifications
  // ------------------------------------------
  // Toast is a brief message shown after actions (e.g. "User added successfully")
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // ------------------------------------------
  // 3C. STATE — Confirmation Modal
  // ------------------------------------------
  // Used before destructive actions like deleting or disabling a user
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: "primary" | "danger";
    confirmText?: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    variant: "primary",
    confirmText: "Confirm",
  });

  // ------------------------------------------
  // 3D. STATE — Form Data (Add/Edit Modal)
  // ------------------------------------------
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    status: "Active",
  });

  // ------------------------------------------
  // 3E. STATE — Pagination & Filters
  // ------------------------------------------
  const [currentPage, setCurrentPage] = useState(1); // Current active page number
  const [isFilterOpen, setIsFilterOpen] = useState(false); // Controls filter panel visibility
  const [roleFilter, setRoleFilter] = useState("All"); // Role dropdown filter value
  const [statusFilter, setStatusFilter] = useState("All"); // Status dropdown filter value

  // ------------------------------------------
  // 3F. DERIVED VALUES — Stats for StatsCards
  // ------------------------------------------
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const disabledUsers = users.filter((u) => u.status === "Disabled").length;
  // Calculate new users this month (February 2026)
  const newUsersThisMonth = users.filter((u) => {
    // Mock logic: consider users created in February (for demo, assume IDs 5 and 6 are new)
    return u.id >= 5;
  }).length;

  // ------------------------------------------
  // 3G. EFFECT — Sync form data when editing a user or opening the modal
  // ------------------------------------------
  // When editingUser changes (e.g. user clicks Edit), pre-fill the form.
  // When editingUser is null (Add mode), reset the form to empty defaults.
  useEffect(() => {
    if (editingUser) {
      setFormData({
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        status: editingUser.status,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        role: "",
        status: "Active",
      });
    }
  }, [editingUser, isModalOpen]);

  // ------------------------------------------
  // 3H. HANDLERS — User Actions
  // ------------------------------------------

  /** Opens the modal in "Add" mode (no user pre-filled) */
  const handleAddUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  /** Opens the modal in "Edit" mode with the selected user's data */
  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  /**
   * handleSaveUser — Handles form submission for both Add and Edit.
   * Validates required fields, then either updates an existing user
   * or appends a new one to the list. Shows a toast on success/error.
   * RESTRICTIONS: Cannot assign "Super Admin" role (not in options).
   */
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.email || !formData.role) {
      setToast({
        message: "Please fill in all required fields.",
        type: "error",
      });
      return;
    }

    // Validate restricted roles (should not be possible from UI, but double-check)
    if (formData.role === "Super Admin" || formData.role === "Branch Admin") {
      setToast({
        message: `${formData.role} role cannot be assigned at branch level.`,
        type: "error",
      });
      return;
    }

    if (editingUser) {
      // Update existing user in the list
      setUsers(
        users.map((u) => (u.id === editingUser.id ? { ...u, ...formData } : u)),
      );
      setToast({
        message: `User ${formData.name} updated successfully.`,
        type: "success",
      });
    } else {
      // Add new user to the list
      const newUser = {
        id: users.length + 1,
        ...formData,
        lastLogin: "Never",
      };
      setUsers([...users, newUser]);
      setToast({
        message: `User ${formData.name} added successfully.`,
        type: "success",
      });
    }

    setIsModalOpen(false);
  };

  /**
   * handleToggleStatus — Toggles a user between "Active" and "Disabled".
   * Shows a confirmation modal before applying the change.
   * Triggered by the ToggleSwitch component in each table row.
   */
  const handleToggleStatus = (user: any) => {
    const newStatus = user.status === "Active" ? "Disabled" : "Active";
    const isDisabling = newStatus === "Disabled";
    setConfirmConfig({
      isOpen: true,
      title: isDisabling ? "Disable User Account?" : "Activate User Account?",
      message: `Are you sure you want to ${
        isDisabling ? "disable" : "activate"
      } access for ${user.name}?`,
      variant: isDisabling ? "danger" : "primary",
      confirmText: isDisabling ? "Disable Account" : "Activate Account",
      onConfirm: () => {
        setUsers(
          users.map((u) =>
            u.id === user.id ? { ...u, status: newStatus } : u,
          ),
        );
        setToast({
          message: `User ${user.name} is now ${newStatus}.`,
          type: "success",
        });
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  /**
   * handleDeleteClick — Deletes a user from the list after confirmation.
   * Shows a danger confirmation modal before permanently removing the user.
   */
  const handleDeleteClick = (user: any) => {
    setConfirmConfig({
      isOpen: true,
      title: "Delete User?",
      message: `This action cannot be undone. Are you sure you want to delete ${user.name}?`,
      variant: "danger",
      confirmText: "Delete User",
      onConfirm: () => {
        setUsers(users.filter((u) => u.id !== user.id));
        setToast({
          message: `User ${user.name} has been deleted.`,
          type: "success",
        });
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  /**
   * handleResetPassword — Resets a user's password after confirmation.
   * Shows a confirmation modal before sending password reset email/link.
   */
  const handleResetPassword = (user: any) => {
    setConfirmConfig({
      isOpen: true,
      title: "Reset Password?",
      message: `A password reset link will be sent to ${user.email}. Are you sure you want to proceed?`,
      variant: "primary",
      confirmText: "Send Reset Link",
      onConfirm: () => {
        // In production, this would trigger an API call to send reset email
        setToast({
          message: `Password reset link sent to ${user.email}.`,
          type: "success",
        });
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // ------------------------------------------
  // 3I. FILTERING LOGIC
  // ------------------------------------------
  // Filters users by search query (name or email) AND the selected Role/Status filters.
  // Branch filter is not needed since all users belong to the same branch.
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return (
      matchesSearch &&
      (roleFilter === "All" || user.role === roleFilter) &&
      (statusFilter === "All" || user.status === statusFilter)
    );
  });

  // Reset to page 1 whenever any search/filter criteria changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, statusFilter]);

  // ------------------------------------------
  // 3J. PAGINATION LOGIC
  // ------------------------------------------
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE); // Total number of pages
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE; // First item index on current page
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  ); // Users visible on the current page

  // Safely cap endIndex so it doesn't exceed the total filtered count
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length);

  /** Navigates to a new page if within valid range */
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  // Available roles for Branch Admin — LIMITED TO 5 MODULE ROLES ONLY
  // Cannot assign: Super Admin, Branch Admin, or custom roles
  const availableRoles = [
    "PLM Manager",
    "QA Manager",
    "Production Manager",
    "Warehouse Manager",
    "Finance Manager",
  ];

  // ==========================================
  // SECTION 4: JSX RENDER
  // ==========================================
  return (
    <AdminLayout>
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
      {/* Prompts user to confirm destructive actions (delete, disable, reset password) */}
      <ConfirmationModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        variant={confirmConfig.variant}
        confirmText={confirmConfig.confirmText}
      />

      <div className="space-y-6">
        {/* ---- 4C. PAGE HEADER ---- */}
        {/* Title, subtitle, branch indicator */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              User Management (Branch)
            </h1>
            <p className="text-slate-500 mt-2 text-xs font-medium">
              Manage users and roles for this branch only.
            </p>
          </div>
          {/* Branch locked indicator */}
          <div className="flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 px-4 py-2 rounded-full border border-amber-200 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider">Branch:</span>
            <span className="font-bold">Manila Main</span>
            <span className="text-[9px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-bold">Locked</span>
          </div>
        </div>

        {/* ---- 4D. STATS CARDS ---- */}
        {/* Overview cards showing Total Users, Active Sessions, Restricted, and New users */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          role="region"
          aria-label="Key Statistics"
        >
          <StatsCard
            title="Total Users"
            value={totalUsers}
            icon={User}
            color="bg-blue-600"
            trend="+12%"
          />
          <StatsCard
            title="Active Sessions"
            value={activeUsers}
            icon={CheckCircle}
            color="bg-emerald-600"
          />
          <StatsCard
            title="Restricted"
            value={disabledUsers}
            icon={AlertCircle}
            color="bg-red-500"
          />
          <StatsCard
            title="New (Feb)"
            value={newUsersThisMonth}
            icon={Plus}
            color="bg-indigo-600"
          />
        </div>

        {/* ---- 4E. TOOLBAR — Search, Filters Toggle, Add User Button ---- */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input — filters users by name or email */}
            <div className="relative group flex-1 sm:flex-none">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors"
                size={14}
                aria-hidden="true"
              />
              <input
                type="text"
                placeholder="Search users..."
                aria-label="Search users by name or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-full outline-none focus:bg-white focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Filter Toggle Button — shows/hides the filter panel below */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                aria-expanded={isFilterOpen}
                aria-label="Toggle filter panel"
                className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 ${
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

          {/* Add User Button — opens the Add/Edit modal in "Add" mode */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-start">
            <SecondaryButton
              onClick={handleAddUser}
              icon={Plus}
              ariaLabel="Add new user"
            >
              Add User
            </SecondaryButton>
          </div>
        </div>

        {/* ---- 4F. FILTER PANEL ---- */}
        {/* Conditionally rendered when isFilterOpen is true.
            Contains dropdowns for Role and Status filtering (no Branch filter). */}
        {isFilterOpen && (
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-5 animate-in fade-in slide-in-from-top-2 z-10 relative">
            {/* Role Filter Dropdown */}
            <ModernSelect
              label="Role"
              value={roleFilter}
              onChange={setRoleFilter}
              options={["All", ...availableRoles]}
              placeholder="All Roles"
            />
            {/* Status Filter Dropdown */}
            <ModernSelect
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={["All", "Active", "Disabled"]}
              placeholder="All Status"
            />
          </div>
        )}

        {/* ---- 4G. USER TABLE ---- */}
        {/* Displays the paginated list of users with columns:
            User (avatar + name + email), Role, Status, Last Login, Actions */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              {/* Table Header */}
              <thead className="bg-slate-50/50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell"
                  >
                    Last Login
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              {/* Table Body — maps over paginated users or shows empty state */}
              <tbody className="bg-white divide-y divide-slate-50">
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Column: User Avatar + Name + Email */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {/* Avatar circle with first letter of name */}
                          <div
                            className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0"
                            aria-hidden="true"
                          >
                            <span className="font-bold text-slate-500 text-[10px]">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">
                              {user.name}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column: Role — uses RoleBadge UI component */}
                      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        <RoleBadge role={user.role} />
                      </td>

                      {/* Column: Status — uses StatusBadge UI component */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={user.status} />
                      </td>

                      {/* Column: Last Login */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-600 hidden md:table-cell">
                        {user.lastLogin}
                      </td>

                      {/* Column: Actions — Edit, Reset Password, Delete, and Toggle Switch */}
                      <td className="px-6 py-4 whitespace-nowrap text-left text-xs font-medium">
                        <div className="flex justify-start items-center gap-3">
                          {/* Edit Button */}
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-slate-400 hover:text-blue-600 transition-colors focus:outline-none focus:text-blue-600"
                            aria-label={`Edit user ${user.name}`}
                            title="Edit User"
                          >
                            <Edit size={14} aria-hidden="true" />
                          </button>

                          {/* Reset Password Button */}
                          <button
                            onClick={() => handleResetPassword(user)}
                            className="text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none focus:text-indigo-600"
                            aria-label={`Reset password for ${user.name}`}
                            title="Reset Password"
                          >
                            <KeyRound size={14} aria-hidden="true" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="text-slate-400 hover:text-red-600 transition-colors focus:outline-none focus:text-red-600"
                            aria-label={`Delete user ${user.name}`}
                            title="Delete User"
                          >
                            <Trash2 size={14} aria-hidden="true" />
                          </button>

                          {/* Archive Button */}
                          <button
                            onClick={() => {
                              setUsers(prev => prev.filter(u => u.id !== user.id));
                              setToast({
                                message: `User ${user.name} has been archived.`,
                                type: "success",
                              });
                            }}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                            title="Archive"
                          >
                            <Archive size={14} />
                          </button>

                          {/* Toggle Switch — enables/disables the user account */}
                          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                            <ToggleSwitch
                              active={user.status === "Active"}
                              onToggle={() => handleToggleStatus(user)}
                              label={`Toggle status for ${user.name}`}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  /* ---- Empty State — shown when no users match the search/filters ---- */
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-slate-50 p-4 rounded-full mb-3">
                          <Search
                            size={20}
                            className="text-slate-400"
                            aria-hidden="true"
                          />
                        </div>
                        <h3 className="text-slate-900 font-bold text-xs">
                          No users found
                        </h3>
                        <p className="text-slate-500 text-[10px] mt-1">
                          Try adjusting your filters or search terms.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ---- 4H. PAGINATION CONTROLS ---- */}
          {/* Shows page numbers and "Showing X-Y of Z" info below the table */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={filteredUsers.length}
            onPageChange={handlePageChange}
          />
        </div>

        {/* ---- 4I. ADD / EDIT USER MODAL ---- */}
        {/* Full-screen overlay modal for creating or editing a user.
            Renders conditionally when isModalOpen is true.
            All fields are stacked vertically for better readability (UI/UX best practice).
            Dropdowns use a custom ModalSelect-style component consistent with the filter panel.
            RESTRICTIONS: No Super Admin role option, no Branch field (always current branch). */}
        {isModalOpen && createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
              {/* Modal Header — title and close button */}
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingUser ? "Edit User" : "Add New User"}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    {editingUser
                      ? "Update the user's information below."
                      : "Fill in the details to create a new account."}
                  </p>
                </div>
                <button
                  aria-label="Close Modal"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors p-2 rounded-full"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Form — all fields stacked vertically */}
              <form onSubmit={handleSaveUser} className="p-6 space-y-5">
                {/* Field 1: Full Name */}
                <div>
                  <label
                    htmlFor="user-name"
                    className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1"
                  >
                    Full Name
                  </label>
                  <input
                    id="user-name"
                    type="text"
                    placeholder="e.g. Maria Santos"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 transition-all placeholder:text-slate-400"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Field 2: Email Address */}
                <div>
                  <label
                    htmlFor="user-email"
                    className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="user-email"
                    type="email"
                    placeholder="e.g. maria@erp.com"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 transition-all placeholder:text-slate-400"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Field 3: Temporary Password (only for new users) */}
                {!editingUser && (
                  <div>
                    <label
                      htmlFor="user-password"
                      className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1"
                    >
                      Temporary Password
                    </label>
                    <input
                      id="user-password"
                      type="password"
                      placeholder="Enter temporary password or leave blank to send reset link"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 transition-all placeholder:text-slate-400"
                    />
                    <p className="text-[9px] text-slate-400 mt-1 ml-1">
                      Leave blank to automatically send a password reset link to the user's email.
                    </p>
                  </div>
                )}

                {/* Field 4: Role — LIMITED TO 5 MODULE ROLES ONLY
                    Cannot assign: Super Admin, Branch Admin */}
                <ModalSelect
                  label="Role"
                  value={formData.role}
                  onChange={(val) => setFormData({ ...formData, role: val })}
                  options={availableRoles}
                  placeholder="Select Role"
                />

                {/* Field 5: Branch — Auto-filled and disabled */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                    Branch
                  </label>
                  <div className="w-full flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-500 cursor-not-allowed">
                    <MapPin size={12} className="text-slate-400 shrink-0" />
                    <span>Manila Main</span>
                    <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold ml-auto">Fixed</span>
                  </div>
                </div>

                {/* Field 6: Status Toggle */}
                <div>
                  <label
                    htmlFor="user-status"
                    className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1"
                  >
                    Status
                  </label>
                  <div className="flex items-center gap-3 mt-2">
                    <ToggleSwitch
                      active={formData.status === "Active"}
                      onToggle={() =>
                        setFormData({
                          ...formData,
                          status: formData.status === "Active" ? "Disabled" : "Active",
                        })
                      }
                      label="Toggle user status"
                    />
                    <span className="text-xs font-medium text-slate-700">
                      {formData.status}
                    </span>
                  </div>
                </div>

                {/* Form Action Buttons — Cancel and Submit */}
                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-lg shadow-slate-900/20 transition-all active:scale-95"
                  >
                    {editingUser ? "Save Changes" : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminUserManagementPage;
