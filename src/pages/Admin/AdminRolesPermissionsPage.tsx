// ==========================================
// AdminRolesPermissionsPage.tsx
// Branch Admin roles & permissions page (view-only).
// Displays branch-scoped roles and their permission
// matrix. All permissions are read-only - admin can
// view but cannot modify role permissions.
// ==========================================

import { useState } from "react";
import {
  Shield,
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
  Calendar,
  MapPin,
  Lock,
  Send,
  Archive,
} from "lucide-react";

// ==========================================
// SECTION 1: REUSABLE COMPONENT IMPORTS
// All shared UI components live in components/ui/
// to keep this page lean and consistent.
// ==========================================
import AdminLayout from "../../layout/AdminLayout";
import { Card } from "../../components/ui/Card";
import DetailsModal from "../../components/ui/DetailsModal";
import Toast from "../../components/ui/Toast";
import RoleScopeBadge from "../../components/ui/RoleScopeBadge";

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
  | "export";

/** Shape of a single Role object */
interface Role {
  id: string;
  name: string;
  description: string;
  scope: "branch";
  isActive: boolean;
  usersCount: number;
  createdAt: string;
}

// ==========================================
// SECTION 3: CONSTANTS & MOCK DATA
// Centralised at the top so they are easy to
// locate and eventually replace with API calls.
// ==========================================

/** Branch-scoped roles only - no Super Admin */
const ROLES: Role[] = [
  {
    id: "plm_manager",
    name: "PLM Manager",
    description: "Manage product lifecycle, BOM revisions, and release workflows",
    scope: "branch",
    isActive: true,
    usersCount: 5,
    createdAt: "2023-03-15",
  },
  {
    id: "qa_manager",
    name: "QA Manager",
    description: "Quality control & inspections for branch operations",
    scope: "branch",
    isActive: true,
    usersCount: 4,
    createdAt: "2023-02-10",
  },
  {
    id: "production_manager",
    name: "Production Manager",
    description: "Oversee production workflows and manage production teams",
    scope: "branch",
    isActive: true,
    usersCount: 8,
    createdAt: "2023-04-20",
  },
  {
    id: "finance_manager",
    name: "Finance Manager",
    description: "Handle financial operations and reporting for the branch",
    scope: "branch",
    isActive: true,
    usersCount: 3,
    createdAt: "2023-05-12",
  },
  {
    id: "warehouse_manager",
    name: "Warehouse Manager",
    description: "Manage inventory, stock movements, and warehouse operations",
    scope: "branch",
    isActive: true,
    usersCount: 12,
    createdAt: "2023-06-01",
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
  { id: "export", label: "Export" },
];

/** Default permission state for branch roles */
const INITIAL_PERMISSIONS: Record<
  string,
  Record<string, Record<string, boolean>>
> = {
  plm_manager: {
    plm: {
      view: true,
      create: true,
      update: true,
      delete: true,
      approve: true,
      export: true,
    },
    quality: {
      view: true,
      create: false,
      update: false,
      delete: false,
      approve: false,
      export: true,
    },
    production: {
      view: true,
      create: true,
      update: true,
      delete: false,
      approve: true,
      export: true,
    },
    warehouse: {
      view: true,
      create: false,
      update: false,
      delete: false,
      approve: false,
      export: true,
    },
    finance: {
      view: true,
      create: false,
      update: false,
      delete: false,
      approve: false,
      export: false,
    },
  },
  qa_manager: {
    plm: {
      view: true,
      create: false,
      update: false,
      delete: false,
      approve: false,
      export: false,
    },
    quality: {
      view: true,
      create: true,
      update: true,
      delete: false,
      approve: true,
      export: true,
    },
    production: {
      view: true,
      create: false,
      update: false,
      delete: false,
      approve: false,
      export: false,
    },
    warehouse: {
      view: true,
      create: false,
      update: false,
      delete: false,
      approve: false,
      export: false,
    },
    finance: {
      view: false,
      create: false,
      update: false,
      delete: false,
      approve: false,
      export: false,
    },
  },
  production_manager: {
    plm: {
      view: true,
      create: true,
      update: true,
      delete: false,
      approve: false,
      export: true,
    },
    quality: {
      view: true,
      create: false,
      update: false,
      delete: false,
      approve: false,
      export: false,
    },
    production: {
      view: true,
      create: true,
      update: true,
      delete: false,
      approve: true,
      export: true,
    },
    warehouse: {
      view: true,
      create: true,
      update: true,
      delete: false,
      approve: false,
      export: true,
    },
    finance: {
      view: true,
      create: false,
      update: false,
      delete: false,
      approve: false,
      export: false,
    },
  },
  finance_manager: {
    plm: {
      view: true,
      create: false,
      update: false,
      delete: false,
      approve: false,
      export: false,
    },
    quality: {
      view: true,
      create: false,
      update: false,
      delete: false,
      approve: false,
      export: false,
    },
    production: {
      view: true,
      create: false,
      update: false,
      delete: false,
      approve: false,
      export: false,
    },
    warehouse: {
      view: true,
      create: false,
      update: false,
      delete: false,
      approve: false,
      export: false,
    },
    finance: {
      view: true,
      create: true,
      update: true,
      delete: false,
      approve: true,
      export: true,
    },
  },
  warehouse_manager: {
    plm: {
      view: true,
      create: false,
      update: false,
      delete: false,
      approve: false,
      export: false,
    },
    quality: {
      view: true,
      create: false,
      update: false,
      delete: false,
      approve: false,
      export: false,
    },
    production: {
      view: true,
      create: false,
      update: false,
      delete: false,
      approve: false,
      export: false,
    },
    warehouse: {
      view: true,
      create: true,
      update: true,
      delete: false,
      approve: false,
      export: true,
    },
    finance: {
      view: false,
      create: false,
      update: false,
      delete: false,
      approve: false,
      export: false,
    },
  },
};

// ==========================================
// SECTION 4: MAIN PAGE COMPONENT
// ==========================================
const AdminRolesPermissionsPage = () => {
  // ------------------------------------------
  // 4a. State — Core Data
  // ------------------------------------------
  const [roles, setRoles] = useState<Role[]>(ROLES);
  const [selectedRole, setSelectedRole] = useState<Role>(ROLES[0]);
  const [searchQuery, setSearchQuery] = useState("");

  // ------------------------------------------
  // 4b. State — Modals
  // ------------------------------------------
  /** View Details modal — shows full role info */
  const [detailRole, setDetailRole] = useState<Role | null>(null);

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
   * permission on a module.
   */
  const hasPermission = (
    roleId: string,
    moduleId: string,
    actionId: string,
  ) => {
    return permissions[roleId]?.[moduleId]?.[actionId] || false;
  };

  // Use initial permissions (read-only)
  const permissions = INITIAL_PERMISSIONS;

  // ------------------------------------------
  // 4d. Derived / Filtered Data
  // ------------------------------------------

  /** Role list filtered by search query */
  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ==========================================
  // SECTION 5: JSX RENDER
  // ==========================================
  return (
    <AdminLayout>
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Roles & Permissions
            </h1>
            <p className="text-slate-500 mt-1 text-xs font-medium">
              View branch-scoped roles and their assigned permissions. Permissions are managed by Super Admin.
            </p>
          </div>
          {/* Branch locked indicator */}
          <div className="flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 px-4 py-2 rounded-full border border-amber-200 shadow-sm shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider">Branch:</span>
            <span className="font-bold">Manila Main</span>
            <span className="text-[9px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-bold">Locked</span>
          </div>
        </div>

        {/* ---- TWO-COLUMN LAYOUT ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ===== LEFT PANEL: Role List ===== */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-6">
            <Card className="flex flex-col h-[650px] overflow-hidden">
              {/* -- Search Header -- */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="font-bold text-slate-800 text-xs mb-3">
                  Branch Roles
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
                {filteredRoles.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                    No roles found
                  </div>
                ) : (
                  filteredRoles.map((role) => (
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
                          <RoleScopeBadge scope={role.scope} />

                          {/* Inactive pill — rounded-full for a pill look */}
                          {!role.isActive && (
                            <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                          {role.description}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Users size={10} className="text-slate-400" />
                          <span className="text-[10px] text-slate-400">
                            {role.usersCount} users
                          </span>
                        </div>
                      </div>

                      {/* View Details Button */}
                      <div className="flex items-center gap-1">
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
                        {/* Archive Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const remaining = roles.filter((r) => r.id !== role.id);
                            setRoles(remaining);
                            if (selectedRole.id === role.id && remaining.length > 0) {
                              setSelectedRole(remaining[0]);
                            }
                            setToast({
                              message: `Role ${role.name} has been archived.`,
                              type: "success",
                            });
                          }}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                          title="Archive"
                        >
                          <Archive size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
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
                  <RoleScopeBadge scope={selectedRole.scope} />
                </div>
                <p className="text-slate-500 text-xs mt-1">
                  View-only mode: Permissions are displayed for reference only.
                </p>
              </div>
            </Card>

            {/* -- Permission Matrix Table Card -- */}
            <Card className="overflow-hidden">
              {/* View-only notice with lock icon and Request Change button */}
              <div className="bg-amber-50/50 border-b border-amber-100 p-3 flex items-center justify-between gap-3 px-5">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <Lock size={13} className="text-amber-500" />
                  <span>Permissions are managed by Super Admin. View-only mode.</span>
                </div>
                <button
                  onClick={() =>
                    setToast({
                      message: "Permission change request sent to Super Admin.",
                      type: "success",
                    })
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all shrink-0"
                >
                  <Send size={11} />
                  Request Change
                </button>
              </div>

              {/* Table wrapper */}
              <div className="overflow-x-auto">
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

                          {/* Permission checkboxes — one per action (read-only) */}
                          {ACTIONS.map((action) => {
                            const isActive = hasPermission(
                              selectedRole.id,
                              module.id,
                              action.id,
                            );
                            return (
                              <td
                                key={`${module.id}-${action.id}`}
                                className="px-4 py-3 text-center whitespace-nowrap"
                              >
                                <div
                                  aria-label={`${action.label} permission for ${module.label} - ${isActive ? "Granted" : "Not granted"}`}
                                  className="relative inline-flex items-center justify-center p-1.5 rounded-lg opacity-75 cursor-default"
                                >
                                  {isActive ? (
                                    <div className="bg-slate-600 text-white rounded-md shadow-sm p-0.5">
                                      <Check size={12} strokeWidth={3} />
                                    </div>
                                  ) : (
                                    <div className="w-4 h-4 border border-slate-200 rounded-md bg-white"></div>
                                  )}
                                </div>
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
                <span className="capitalize">Branch Specific</span>
              ),
              icon: MapPin,
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
        </DetailsModal>
      </div>
    </AdminLayout>
  );
};

export default AdminRolesPermissionsPage;
