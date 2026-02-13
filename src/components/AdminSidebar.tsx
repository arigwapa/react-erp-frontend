// ==========================================
// AdminSidebar.tsx
// Collapsible sidebar navigation for the Branch Admin panel.
// Features:
//   - Same expand/collapse behavior as Sidebar.tsx
//   - Collapsible nav groups (dropdown sections)
//   - Auto-expands group containing the active route
//   - Branch Admin + branch name indicator badge
//   - NO Branch Management, System Settings, or Archives
//   - All modules scoped to branch only
// ==========================================

import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Bell,
  Users,
  Shield,
  Factory,
  Warehouse,
  ClipboardCheck,
  BarChart3,
  FileText,
  LogOut,
  Layers,
  DollarSign,
  Download,
  User,
  Building2,
  Archive,
  ChevronDown,
  X,
} from "lucide-react";

import BrandLogo from "./ui/BrandLogo";
import weaveLogo from "../assets/Weave Logo.png";

// ------------------------------------------
// Props Interface
// ------------------------------------------
interface AdminSidebarProps {
  /** Whether the sidebar is collapsed (icons only) */
  isCollapsed: boolean;
  /** Callback to toggle the collapsed state */
  onToggleCollapse: () => void;
  /** Whether the mobile drawer overlay is open */
  isMobileOpen: boolean;
  /** Callback to close the mobile drawer */
  onCloseMobile: () => void;
}

// ------------------------------------------
// Navigation Menu Configuration
// Admin-specific: No Branch Management, No System Settings, No Archives
// ------------------------------------------
const menuGroups = [
  {
    label: "Overview",
    items: [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        path: "/branch-admin/dashboard",
      },
      {
        icon: Bell,
        label: "Notifications / Tasks",
        path: "/branch-admin/notification",
        badge: "3",
      },
    ],
  },
  {
    label: "Branch Administration",
    items: [
      {
        icon: Users,
        label: "User Management",
        path: "/branch-admin/user-management",
      },
      {
        icon: Shield,
        label: "Roles & Permissions",
        path: "/branch-admin/roles-permissions",
      },
      { icon: FileText, label: "Audit Logs", path: "/branch-admin/audit-logs" },
      { icon: Archive, label: "Archives", path: "/branch-admin/archives" },
    ],
  },
  {
    label: "Modules",
    items: [
      { icon: Layers, label: "PLM (Products)", path: "/branch-admin/plm" },
      { icon: Factory, label: "Production", path: "/branch-admin/production" },
      {
        icon: ClipboardCheck,
        label: "Quality (QA)",
        path: "/branch-admin/quality",
      },
      { icon: Warehouse, label: "Warehouse", path: "/branch-admin/warehouse" },
      { icon: DollarSign, label: "Finance", path: "/branch-admin/finance" },
    ],
  },
  {
    label: "Reports",
    items: [
      {
        icon: BarChart3,
        label: "Reports Center",
        path: "/branch-admin/reports-center",
      },
      {
        icon: Download,
        label: "Export Center",
        path: "/branch-admin/export-center",
      },
    ],
  },
];

// ==========================================
// Component
// ==========================================
const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const location = useLocation();

  // ------------------------------------------
  // Collapsible Group State
  // Tracks which groups are expanded (by label)
  // ------------------------------------------
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );

  // Auto-expand the group containing the active route on mount / route change
  useEffect(() => {
    const newExpanded: Record<string, boolean> = {};
    menuGroups.forEach((group) => {
      const hasActiveItem = group.items.some(
        (item) => location.pathname === item.path,
      );
      newExpanded[group.label] =
        hasActiveItem || expandedGroups[group.label] || false;
    });
    setExpandedGroups(newExpanded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  /** Toggle a single group open/closed */
  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <>
      {/* ---- MOBILE OVERLAY ---- */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* ---- SIDEBAR CONTAINER ---- */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen bg-white dark:bg-slate-900
          flex flex-col overflow-hidden transition-all duration-300 ease-in-out
          ${isCollapsed ? "w-[72px]" : "w-72"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* ---- LOGO AREA (h-16 to align with navbar) ---- */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          {/* Full BrandLogo — shown when expanded */}
          <div
            className={`transition-all duration-300 overflow-hidden ${
              isCollapsed ? "w-0 opacity-0 hidden" : "w-full opacity-100"
            }`}
          >
            <BrandLogo role="branch-admin" branch="Manila" />
          </div>

          {/* Logo icon only — shown when collapsed */}
          {isCollapsed && (
            <div className="w-full flex items-center justify-center">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center overflow-hidden p-1 shrink-0">
                <img
                  src={weaveLogo}
                  alt="Weave Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          {/* Close Button — visible only on mobile */}
          <button
            onClick={onCloseMobile}
            className="flex lg:hidden items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* ---- NAVIGATION (Scrollable) — border-r starts here (not on header) ---- */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
          {menuGroups.map((group) => {
            const isExpanded = expandedGroups[group.label] ?? false;
            const hasActiveItem = group.items.some(
              (item) => location.pathname === item.path,
            );

            return (
              <div key={group.label}>
                {/* ---- Group Header (clickable to expand/collapse) ---- */}
                {!isCollapsed ? (
                  <button
                    onClick={() => toggleGroup(group.label)}
                    aria-expanded={isExpanded}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 group/header ${
                      hasActiveItem && !isExpanded
                        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20"
                        : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <span>{group.label}</span>
                    <ChevronDown
                      size={12}
                      className={`transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                ) : (
                  /* When collapsed, show a thin separator line */
                  <div className="h-px bg-slate-100 dark:bg-slate-700 my-2 mx-2" />
                )}

                {/* ---- Navigation Items (collapsible) ---- */}
                <div
                  className={`space-y-1 overflow-hidden transition-all duration-200 ease-in-out ${
                    isCollapsed
                      ? "max-h-[500px] opacity-100 mt-1"
                      : isExpanded
                        ? "max-h-[500px] opacity-100 mt-1"
                        : "max-h-0 opacity-0 mt-0"
                  }`}
                >
                  {group.items.map((item, itemIdx) => (
                    <NavLink
                      key={itemIdx}
                      to={item.path}
                      onClick={onCloseMobile}
                      title={isCollapsed ? item.label : undefined}
                      className={({ isActive }) => `
                        flex items-center justify-between rounded-xl text-xs font-medium transition-all group
                        ${isCollapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2.5"}
                        ${
                          isActive
                            ? "bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                        }
                      `}
                    >
                      <div
                        className={`flex items-center truncate ${
                          isCollapsed ? "justify-center w-full" : "gap-3"
                        }`}
                      >
                        <item.icon size={16} className="shrink-0" />
                        <span
                          className={`truncate transition-opacity duration-200 ${
                            isCollapsed ? "hidden" : "block"
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>

                      {/* Badge — only shown when expanded and badge exists */}
                      {"badge" in item && item.badge && !isCollapsed && (
                        <span className="ml-2 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm shrink-0">
                          {item.badge}
                        </span>
                      )}

                      {"badge" in item && item.badge && isCollapsed && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}

          {/* ---- ACCOUNT SECTION ---- */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
            <h3
              className={`text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-3 transition-opacity duration-200 whitespace-nowrap ${
                isCollapsed
                  ? "opacity-0 h-0 mb-0 overflow-hidden"
                  : "opacity-100"
              }`}
            >
              Account
            </h3>

            <div className="space-y-1">
              {/* Profile Link */}
              <NavLink
                to="/branch-admin/profile"
                title={isCollapsed ? "Profile" : undefined}
                className={`flex items-center rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-all ${
                  isCollapsed ? "justify-center py-2.5" : "gap-3 px-3 py-2.5"
                }`}
              >
                <User size={16} className="shrink-0" />
                <span
                  className={`transition-opacity duration-200 ${
                    isCollapsed ? "hidden" : "block"
                  }`}
                >
                  Profile
                </span>
              </NavLink>

              {/* Logout Button */}
              <button
                title={isCollapsed ? "Logout" : undefined}
                className={`w-full flex items-center rounded-xl text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-left ${
                  isCollapsed ? "justify-center py-2.5" : "gap-3 px-3 py-2.5"
                }`}
              >
                <LogOut size={16} className="shrink-0" />
                <span
                  className={`transition-opacity duration-200 ${
                    isCollapsed ? "hidden" : "block"
                  }`}
                >
                  Logout
                </span>
              </button>
            </div>
          </div>

          <div className="h-12"></div>
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;
