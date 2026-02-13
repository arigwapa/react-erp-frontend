// ==========================================
// RolesPermissionsPage.tsx
// Admin page for managing system roles and their
// module-level permissions (RBAC). Supports viewing,
// creating, editing, toggling, and archiving roles,
// plus a permission matrix with preset options.
// ==========================================

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  Shield,
  RotateCcw,
  Lock,
  Search,
  Users,
  Layers,
  ShieldCheck,
  Factory,
  Warehouse,
  DollarSign,
  Check,
  Info,
  Eye,
  X,
  Calendar,
  Globe,
  MapPin,
} from "lucide-react";

// ==========================================
// SECTION 1: REUSABLE COMPONENT IMPORTS
// All shared UI components live in components/ui/
// to keep this page lean and consistent.
// ==========================================
import MainLayout from "../../layout/MainLayout";
import { Card } from "../../components/ui/Card";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import DetailsModal from "../../components/ui/DetailsModal";
import PrimaryButton from "../../components/ui/PrimaryButton";
import Toast from "../../components/ui/Toast";
import RoleScopeBadge from "../../components/ui/RoleScopeBadge";
import IconSelect from "../../components/ui/IconSelect";
import ActionMenu from "../../components/ui/ActionMenu";

// ==========================================
// SECTION 2: TYPES & INTERFACES
// ==========================================

/** All possible actions that can be assigned to a module */
type ActionType =
  | "view"
  | "create"
  | "update"
  | "delete"
  | "approve"
  | "configure"
  | "export";

/** Shape of a single Role object */
interface Role {
  id: string;
  name: string;
  description: string;
  scope: "global" | "branch";
  isSystem?: boolean;
  isActive: boolean;
  usersCount?: number;
  createdAt?: string;
}

// ==========================================
// SECTION 3: CONSTANTS & MOCK DATA
// Centralised at the top so they are easy to
// locate and eventually replace with API calls.
// ==========================================

/** Pre-seeded roles for demo / dev */
const ROLES: Role[] = [
  {
    id: "super_admin",
    name: "Super Admin",
    description: "Full system access",
    scope: "global",
    isSystem: true,
    isActive: true,
    usersCount: 2,
    createdAt: "2023-01-01",
  },
  {
    id: "branch_admin",
    name: "Branch Admin",
    description: "Manage specific branch operations",
    scope: "branch",
    isActive: true,
    usersCount: 5,
    createdAt: "2023-03-15",
  },
  {
    id: "plm_manager",
    name: "PLM Manager",
    description: "Product Lifecycle Management",
    scope: "global",
    isActive: true,
    usersCount: 3,
    createdAt: "2023-06-20",
  },
  {
    id: "qa_manager",
    name: "QA Manager",
    description: "Quality control & inspections",
    scope: "branch",
    isActive: true,
    usersCount: 4,
    createdAt: "2023-02-10",
  },
];

/** Modules that appear as rows in the permission matrix */
const MODULES = [
  { id: "plm", label: "PLM System", icon: Layers },
  { id: "quality", label: "Quality Control", icon: ShieldCheck },
  { id: "production", label: "Production", icon: Factory },
  { id: "warehouse", label: "Warehouse", icon: Warehouse },
  { id: "finance", label: "Finance", icon: DollarSign },
];

/** Actions that appear as columns in the permission matrix */
const ACTIONS: { id: ActionType; label: string }[] = [
  { id: "view", label: "View" },
  { id: "create", label: "Create" },
  { id: "update", label: "Update" },
  { id: "delete", label: "Delete" },
  { id: "approve", label: "Approve" },
  { id: "configure", label: "Config" },
  { id: "export", label: "Export" },
];

/** Options for the role scope dropdown (Add / Edit modals) */
const SCOPE_OPTIONS = [
  { value: "global", label: "Global Scope", icon: Globe },
  { value: "branch", label: "Branch Specific", icon: MapPin },
];

/** Default permission state for seeded roles */
const INITIAL_PERMISSIONS: Record<
  string,
  Record<string, Record<string, boolean>>
> = {
  super_admin: {},
  plm_manager: {
    plm: {
      view: true,
      create: true,
      update: true,
      approve: true,
      export: true,
    },
    quality: { view: true },
  },
};

// ==========================================
// SECTION 4: MAIN PAGE COMPONENT
// ==========================================
const RolesPermissionsPage = () => {
  // ------------------------------------------
  // 4a. State — Core Data
  // ------------------------------------------
  const [selectedRole, setSelectedRole] = useState<Role>(ROLES[0]);
  const [rolesList, setRolesList] = useState<Role[]>(ROLES);
  const [permissions, setPermissions] = useState(INITIAL_PERMISSIONS);
  const [hasChanges, setHasChanges] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // ------------------------------------------
  // 4b. State — Modals
  // ------------------------------------------
  /** Confirmation modal for saving permission changes */
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  /** Action modal for toggle / archive / duplicate */
  const [roleAction, setRoleAction] = useState<{
    type: "toggle" | "archive" | "duplicate" | null;
    role: Role | null;
  }>({ type: null, role: null });

  /** View Details modal — shows full role info */
  const [detailRole, setDetailRole] = useState<Role | null>(null);

  /** Add Role modal fields */
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newRoleScope, setNewRoleScope] = useState<string>("global");

  /** Edit Role modal fields */
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editRoleName, setEditRoleName] = useState("");
  const [editRoleDesc, setEditRoleDesc] = useState("");
  const [editRoleScope, setEditRoleScope] = useState<string>("global");

  /** Toast notification state */
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // ------------------------------------------
  // 4c. Permission Helpers
  // ------------------------------------------

  /**
   * Check whether a given role has a specific
   * permission on a module. Super Admin always true.
   */
  const hasPermission = (
    roleId: string,
    moduleId: string,
    actionId: string,
  ) => {
    if (roleId === "super_admin") return true;
    return permissions[roleId]?.[moduleId]?.[actionId] || false;
  };

  /**
   * Toggle a single permission checkbox.
   * Blocked for the immutable Super Admin role.
   */
  const handleTogglePermission = (moduleId: string, actionId: string) => {
    if (selectedRole.isSystem && selectedRole.id === "super_admin") return;
    setPermissions((prev) => {
      const rolePerms = prev[selectedRole.id] || {};
      const modulePerms = rolePerms[moduleId] || {};
      return {
        ...prev,
        [selectedRole.id]: {
          ...rolePerms,
          [moduleId]: { ...modulePerms, [actionId]: !modulePerms[actionId] },
        },
      };
    });
    setHasChanges(true);
  };

  /**
   * Apply a preset to the selected role:
   * "all" = full access, "readonly" = view+export, "none" = reset all
   */
  const applyPreset = (type: "all" | "none" | "readonly") => {
    if (selectedRole.id === "super_admin") return;
    const newRolePerms: Record<string, Record<string, boolean>> = {};
    MODULES.forEach((mod) => {
      newRolePerms[mod.id] = {};
      ACTIONS.forEach((act) => {
        let value = false;
        if (type === "all") value = true;
        if (type === "readonly" && (act.id === "view" || act.id === "export"))
          value = true;
        newRolePerms[mod.id][act.id] = value;
      });
    });
    setPermissions((prev) => ({ ...prev, [selectedRole.id]: newRolePerms }));
    setHasChanges(true);
  };

  // ------------------------------------------
  // 4d. Role CRUD Handlers
  // ------------------------------------------

  /** Create a brand-new role from modal fields */
  const handleCreateRole = () => {
    if (!newRoleName.trim()) {
      setToast({ message: "Role Name is required.", type: "error" });
      return;
    }
    const nameExists = rolesList.some(
      (r) => r.name.toLowerCase() === newRoleName.trim().toLowerCase(),
    );
    if (nameExists) {
      setToast({
        message: "Role Name must be unique. This name already exists.",
        type: "error",
      });
      return;
    }

    const newId =
      newRoleName.toLowerCase().replace(/\s+/g, "_") +
      "_" +
      Date.now().toString().slice(-4);
    const today = new Date().toISOString().split("T")[0];

    const newRole: Role = {
      id: newId,
      name: newRoleName.trim(),
      description: newRoleDesc.trim() || "No description provided.",
      scope: newRoleScope as "global" | "branch",
      isActive: true,
      usersCount: 0,
      createdAt: today,
      isSystem: false,
    };

    setRolesList((prev) => [...prev, newRole]);
    setPermissions((prev) => ({ ...prev, [newId]: {} }));
    setSelectedRole(newRole);

    // Reset modal fields
    setNewRoleName("");
    setNewRoleDesc("");
    setNewRoleScope("global");
    setIsAddModalOpen(false);

    setToast({
      message: `Role "${newRoleName}" created successfully.`,
      type: "success",
    });
  };

  /** Populate and open the Edit modal for a role */
  const openEditModal = (role: Role, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingRole(role);
    setEditRoleName(role.name);
    setEditRoleDesc(role.description);
    setEditRoleScope(role.scope);
    setIsEditModalOpen(true);
  };

  /** Save edits to an existing role */
  const handleUpdateRole = () => {
    if (!editingRole) return;
    if (!editRoleName.trim()) {
      setToast({ message: "Role Name is required.", type: "error" });
      return;
    }

    const updatedRoles = rolesList.map((r) =>
      r.id === editingRole.id
        ? {
            ...r,
            name: editRoleName,
            description: editRoleDesc,
            scope: editRoleScope as "global" | "branch",
          }
        : r,
    );
    setRolesList(updatedRoles);

    // Sync the selected role if it was the one edited
    if (selectedRole.id === editingRole.id) {
      setSelectedRole({
        ...selectedRole,
        name: editRoleName,
        description: editRoleDesc,
        scope: editRoleScope as "global" | "branch",
      });
    }

    setIsEditModalOpen(false);
    setToast({ message: "Role updated successfully.", type: "success" });
  };

  /** Open a confirmation modal for toggle or archive */
  const openActionModal = (
    type: "toggle" | "archive",
    role: Role,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setRoleAction({ type, role });
  };

  /** Execute the confirmed role action (toggle / archive) */
  const confirmRoleAction = () => {
    if (!roleAction.role || !roleAction.type) return;

    if (roleAction.type === "archive") {
      const updatedRoles = rolesList.filter(
        (r) => r.id !== roleAction.role!.id,
      );
      setRolesList(updatedRoles);

      // Auto-select the first remaining role if the archived one was selected
      if (selectedRole.id === roleAction.role.id && updatedRoles.length > 0) {
        setSelectedRole(updatedRoles[0]);
      }
      setToast({
        message: `Role archived successfully.`,
        type: "success",
      });
    } else if (roleAction.type === "toggle") {
      const updatedRoles = rolesList.map((r) =>
        r.id === roleAction.role!.id ? { ...r, isActive: !r.isActive } : r,
      );
      setRolesList(updatedRoles);
      if (selectedRole.id === roleAction.role.id) {
        setSelectedRole({ ...selectedRole, isActive: !selectedRole.isActive });
      }
      setToast({
        message: `Role updated successfully.`,
        type: "success",
      });
    }

    setRoleAction({ type: null, role: null });
  };

  // ------------------------------------------
  // 4e. Save Permissions Handler
  // ------------------------------------------

  /** Open the save-confirmation modal */
  const handleSaveClick = () => setIsSaveModalOpen(true);

  /** Simulate an API save with a short delay */
  const confirmSave = () => {
    setIsSaving(true);
    setIsSaveModalOpen(false);
    setTimeout(() => {
      setHasChanges(false);
      setIsSaving(false);
      setToast({
        message: "Permissions updated successfully.",
        type: "success",
      });
    }, 1000);
  };

  // ------------------------------------------
  // 4f. Derived / Filtered Data
  // ------------------------------------------

  /** Role list filtered by search query */
  const filteredRoles = rolesList.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ==========================================
  // SECTION 5: JSX RENDER
  // ==========================================
  return (
    <MainLayout>
      {/* ---- TOAST NOTIFICATION ---- */}
      {/* Displays ephemeral success / error messages at the top */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="space-y-6">
        {/* ---- PAGE HEADER ---- */}
        {/* Title and description only — action buttons live below the
            permission table per the "content first, actions at the end" pattern */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Roles & Permissions
          </h1>
          <p className="text-slate-500 mt-1 text-xs font-medium">
            Manage access rights and RBAC configuration.
          </p>
        </div>

        {/* ---- TWO-COLUMN LAYOUT ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ===== LEFT PANEL: Role List ===== */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-6">
            <Card className="flex flex-col h-[650px] overflow-hidden">
              {/* -- Search Header -- */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="font-bold text-slate-800 text-xs mb-3">
                  System Roles
                </h2>
                <div className="relative group flex-1 sm:flex-none">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors"
                    size={14}
                  />
                  <input
                    type="text"
                    placeholder="Search roles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs font-medium bg-white border border-slate-200 rounded-full outline-none focus:bg-white focus:ring-2 focus:ring-slate-300 focus:border-transparent transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* -- Scrollable Role Cards -- */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredRoles.map((role) => (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRole(role)}
                    className={`group relative flex items-center justify-between w-full p-3 rounded-xl transition-all duration-200 cursor-pointer border ${
                      selectedRole.id === role.id
                        ? "bg-slate-100 border-slate-700 shadow-sm ring-1 ring-slate-300"
                        : "bg-transparent border-transparent hover:bg-slate-50"
                    }`}
                  >
                    {/* Role info (name, badge, description) */}
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold truncate ${
                            selectedRole.id === role.id
                              ? "text-indigo-900"
                              : "text-slate-700"
                          }`}
                        >
                          {role.name}
                        </span>

                        {/* Scope badge — uses reusable RoleScopeBadge */}
                        {role.scope === "branch" && (
                          <RoleScopeBadge scope={role.scope} />
                        )}

                        {/* System lock icon */}
                        {role.isSystem && (
                          <Lock size={12} className="text-slate-400 shrink-0" />
                        )}

                        {/* Inactive pill — rounded-full for a pill look */}
                        {!role.isActive && !role.isSystem && (
                          <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                        {role.description}
                      </p>
                    </div>

                    {/* Quick actions (View + ActionMenu) */}
                    <div className="flex items-center gap-1">
                      {/* View Details Button */}
                      <button
                        aria-label="View Details"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetailRole(role);
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                      >
                        <Eye size={14} />
                      </button>

                      {/* ActionMenu dropdown — imported from components/ui */}
                      {!role.isSystem && (
                        <ActionMenu
                          isActive={role.isActive}
                          onEdit={(e) => openEditModal(role, e)}
                          onToggle={(e) => openActionModal("toggle", role, e)}
                          onArchive={(e) => openActionModal("archive", role, e)}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* -- Add Role Button -- */}
              <div className="p-4 border-t border-slate-100">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-slate-600 border border-slate-200 border-dashed rounded-lg hover:bg-slate-50 hover:border-slate-300 transition"
                >
                  <Users size={14} /> Add New Role
                </button>
              </div>
            </Card>
          </div>

          {/* ===== RIGHT PANEL: Permission Matrix ===== */}
          <div className="lg:col-span-8 space-y-4">
            {/* -- Selected Role Header Card -- */}
            <Card className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900">
                    Permissions:{" "}
                    <span className="text-indigo-900">{selectedRole.name}</span>
                  </h2>

                  {/* Scope pill — rounded-full for a pill look */}
                  {selectedRole.scope === "global" ? (
                    <span className="inline-flex items-center gap-1 whitespace-nowrap text-left px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                      <Globe size={10} /> Global
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 whitespace-nowrap text-left px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                      <MapPin size={10} /> Branch Specific
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-xs mt-1">
                  {selectedRole.id === "super_admin"
                    ? "This role has unrestricted access to all modules."
                    : "Configure what actions this role can perform."}
                </p>
              </div>

              {/* Preset buttons — rounded-xl to match Discard button */}
              {selectedRole.id !== "super_admin" && (
                <div className="flex gap-2">
                  {/* Full Access preset */}
                  <button
                    onClick={() => applyPreset("all")}
                    disabled={!selectedRole.isActive}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:text-slate-600 hover:border-slate-300 transition shadow-sm disabled:opacity-50"
                  >
                    Full Access
                  </button>

                  {/* Read Only preset */}
                  <button
                    onClick={() => applyPreset("readonly")}
                    disabled={!selectedRole.isActive}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:text-slate-600 hover:border-slate-300 transition shadow-sm disabled:opacity-50"
                  >
                    Read Only
                  </button>

                  {/* Reset preset — red accent for destructive hint */}
                  <button
                    onClick={() => applyPreset("none")}
                    disabled={!selectedRole.isActive}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-slate-200 rounded-xl hover:bg-red-50 hover:border-red-200 transition shadow-sm flex items-center gap-1 disabled:opacity-50"
                  >
                    <RotateCcw size={12} /> Reset
                  </button>
                </div>
              )}
            </Card>

            {/* -- Permission Matrix Table Card -- */}
            <Card className="overflow-hidden">
              {/* Super Admin immutable notice */}
              {selectedRole.id === "super_admin" && (
                <div className="bg-indigo-50/50 border-b border-indigo-100 p-3 flex items-center justify-center gap-2 text-xs font-medium text-slate-700">
                  <Info size={14} /> Super Admin permissions are immutable.
                </div>
              )}

              {/* Table wrapper — greyed out when role is inactive */}
              <div
                className={`overflow-x-auto ${!selectedRole.isActive && !selectedRole.isSystem ? "opacity-50 pointer-events-none grayscale" : ""}`}
              >
                <table className="min-w-full divide-y divide-slate-100">
                  {/* Table Head */}
                  <thead>
                    <tr className="bg-slate-50/80">
                      <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50 z-10 min-w-[200px]">
                        Module
                      </th>
                      {ACTIONS.map((action) => (
                        <th
                          key={action.id}
                          className="px-4 py-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider min-w-[80px]"
                        >
                          {action.label}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {/* Table Body — one row per module */}
                  <tbody className="bg-white divide-y divide-slate-50">
                    {MODULES.map((module) => {
                      const ModuleIcon = module.icon;
                      return (
                        <tr
                          key={module.id}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          {/* Module name cell (sticky on horizontal scroll) */}
                          <td className="px-6 py-3 whitespace-nowrap sticky left-0 bg-white z-10 group-hover:bg-slate-50">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                                <ModuleIcon size={14} />
                              </div>
                              <span className="text-xs font-semibold text-slate-700">
                                {module.label}
                              </span>
                            </div>
                          </td>

                          {/* Permission checkboxes — one per action */}
                          {ACTIONS.map((action) => {
                            const isActive = hasPermission(
                              selectedRole.id,
                              module.id,
                              action.id,
                            );
                            const isSuperAdmin =
                              selectedRole.id === "super_admin";
                            return (
                              <td
                                key={`${module.id}-${action.id}`}
                                className="px-4 py-3 text-center whitespace-nowrap"
                              >
                                <button
                                  onClick={() =>
                                    handleTogglePermission(
                                      module.id,
                                      action.id,
                                    )
                                  }
                                  disabled={isSuperAdmin}
                                  aria-label={`${action.label} permission for ${module.label}`}
                                  className={`relative inline-flex items-center justify-center p-1.5 rounded-lg transition-all duration-200 focus:outline-none ${isSuperAdmin ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-100 active:scale-95"}`}
                                >
                                  {isActive ? (
                                    <div className="bg-slate-600 text-white rounded-md shadow-sm p-0.5">
                                      <Check size={12} strokeWidth={3} />
                                    </div>
                                  ) : (
                                    <div className="w-4 h-4 border border-slate-200 rounded-md bg-white"></div>
                                  )}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* ---- DISCARD / SAVE BUTTONS ---- */}
            {/* Placed below the permission matrix table following the UI/UX pattern:
                users interact with checkboxes first, then confirm with action buttons
                at the bottom. Only visible when permissions have been modified. */}
            {hasChanges && (
              <div className="flex items-center justify-start gap-3 pt-2">
                {/* Discard — resets to original state */}
                <button
                  onClick={() => {
                    setPermissions(INITIAL_PERMISSIONS);
                    setHasChanges(false);
                  }}
                  disabled={isSaving}
                  className="px-5 py-2.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 transition-all shadow-sm"
                >
                  Discard Changes
                </button>

                {/* Save — opens confirmation modal */}
                <PrimaryButton
                  onClick={handleSaveClick}
                  disabled={!hasChanges}
                  isLoading={isSaving}
                  className="!w-auto !py-2.5 !px-5 !text-xs !rounded-xl"
                >
                  Save Changes
                </PrimaryButton>
              </div>
            )}
          </div>
        </div>

        {/* ==========================================
            SECTION 6: MODALS
            All modals are rendered at the bottom of the
            component tree so they overlay the full page.
            ========================================== */}

        {/* ---- View Details Modal ---- */}
        {/* Uses reusable DetailsModal with grid fields */}
        <DetailsModal
          isOpen={!!detailRole}
          onClose={() => setDetailRole(null)}
          title="Role Details"
          itemId={detailRole?.id || ""}
          headerIcon={
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Shield size={18} />
            </div>
          }
          gridFields={[
            {
              label: "Scope",
              value: (
                <span className="capitalize">
                  {detailRole?.scope === "global"
                    ? "Global Access"
                    : "Branch Specific"}
                </span>
              ),
              icon: Globe,
            },
            {
              label: "Created On",
              value: detailRole?.createdAt || "N/A",
              icon: Calendar,
            },
            {
              label: "Active Users",
              value: `${detailRole?.usersCount ?? 0} Users assigned`,
              icon: Users,
            },
            {
              label: "Status",
              value: (
                // Status pill — rounded-full for pill shape
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                    detailRole?.isActive
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {detailRole?.isActive ? "Active" : "Inactive"}
                </span>
              ),
              icon: Info,
            },
          ]}
        >
          {/* Extra description content inside the details modal */}
          <span className="block text-xs font-bold text-slate-800 mb-2">
            Description
          </span>
          <p className="text-xs text-slate-500 leading-relaxed">
            {detailRole?.description}
          </p>
          {detailRole?.isSystem && (
            <div className="mt-3 pt-3 border-t border-slate-200/50 flex items-center gap-2">
              <Lock size={12} className="text-amber-500" />
              <span className="text-xs text-amber-700 font-medium">
                System Role - Cannot be deleted or have core permissions
                revoked.
              </span>
            </div>
          )}
        </DetailsModal>

        {/* ---- Save Confirmation Modal ---- */}
        <ConfirmationModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          onConfirm={confirmSave}
          title="Confirm Permission Changes"
          message={`You are about to update permissions for the "${selectedRole.name}" role.`}
          confirmText="Yes, Update Permissions"
        />

        {/* ---- Toggle / Archive Confirmation Modal ---- */}
        <ConfirmationModal
          isOpen={roleAction.type !== null}
          onClose={() => setRoleAction({ type: null, role: null })}
          onConfirm={confirmRoleAction}
          title={
            roleAction.type === "archive"
              ? "Archive Role?"
              : roleAction.type === "toggle"
                ? "Change Role Status?"
                : "Duplicate Role"
          }
          message={
            roleAction.type === "archive"
              ? "Are you sure? Users with this role will lose permissions."
              : roleAction.type === "toggle"
                ? `Are you sure you want to ${roleAction.role?.isActive ? "deactivate" : "activate"} this role?`
                : "Create a copy of this role?"
          }
          confirmText={
            roleAction.type === "archive"
              ? "Archive"
              : roleAction.type === "toggle"
                ? roleAction.role?.isActive
                  ? "Deactivate"
                  : "Activate"
                : "Duplicate"
          }
          variant={
            roleAction.type === "archive" ||
            (roleAction.type === "toggle" && roleAction.role?.isActive)
              ? "danger"
              : "primary"
          }
        />

        {/* ---- Add Role Modal ---- */}
        {/* A simple form modal for creating a new role with name, scope, description */}
        {isAddModalOpen && createPortal(
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-900">
                  Add New Role
                </h3>
                <button
                  aria-label="Close Modal"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body — form fields */}
              <div className="p-6 space-y-4">
                {/* Role Name — required */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Role Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="e.g. Sales Manager"
                    className="w-full px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 transition-all placeholder:text-slate-400"
                    autoFocus
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Must be unique within the system.
                  </p>
                </div>

                {/* Role Scope — uses reusable IconSelect */}
                <IconSelect
                  label="Role Scope"
                  value={newRoleScope}
                  onChange={setNewRoleScope}
                  options={SCOPE_OPTIONS}
                />

                {/* Description — optional */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={newRoleDesc}
                    onChange={(e) => setNewRoleDesc(e.target.value)}
                    placeholder="Briefly describe what this role does..."
                    rows={3}
                    className="w-full px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 transition-all placeholder:text-slate-400 resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer — Cancel / Create buttons */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <PrimaryButton
                  onClick={handleCreateRole}
                  className="px-4 py-2 text-xs rounded-xl"
                >
                  Create Role
                </PrimaryButton>
              </div>
            </div>
          </div>,
          document.body,
        )}

        {/* ---- Edit Role Modal ---- */}
        {/* Same layout as Add, pre-populated with the selected role's data */}
        {isEditModalOpen && createPortal(
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-900">Edit Role</h3>
                <button
                  aria-label="Close Modal"
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body — pre-filled form fields */}
              <div className="p-6 space-y-4">
                {/* Role Name — required */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Role Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editRoleName}
                    onChange={(e) => setEditRoleName(e.target.value)}
                    placeholder="e.g. Sales Manager"
                    className="w-full px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Role Scope — uses reusable IconSelect */}
                <IconSelect
                  label="Role Scope"
                  value={editRoleScope}
                  onChange={setEditRoleScope}
                  options={SCOPE_OPTIONS}
                />

                {/* Description — optional */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={editRoleDesc}
                    onChange={(e) => setEditRoleDesc(e.target.value)}
                    placeholder="Briefly describe what this role does..."
                    rows={3}
                    className="w-full px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 transition-all placeholder:text-slate-400 resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer — Cancel / Update buttons */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <PrimaryButton
                  onClick={handleUpdateRole}
                  className="px-4 py-2 text-xs rounded-xl"
                >
                  Update Role
                </PrimaryButton>
              </div>
            </div>
          </div>,
          document.body,
        )}
      </div>
    </MainLayout>
  );
};

export default RolesPermissionsPage;
