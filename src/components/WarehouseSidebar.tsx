// ==========================================
// WarehouseSidebar.tsx
// Collapsible sidebar navigation for the Warehouse Manager panel.
// Features:
//   - Same expand/collapse behavior as QASidebar.tsx
//   - Collapsible nav groups (dropdown sections)
//   - Auto-expands group containing the active route
//   - Branch-scoped: only Warehouse-related navigation
//   - Smooth width transition between expanded (w-72)
//     and collapsed (w-[72px]) states
// ==========================================

import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Bell,
  Package,
  ArrowLeftRight,
  ClipboardEdit,
  PackageCheck,
  BarChart3,
  Download,
  LogOut,
  User,
  Archive,
  ChevronDown,
  X,
} from "lucide-react";

import BrandLogo from "./ui/BrandLogo";
import weaveLogo from "../assets/Weave Logo.png";

// ------------------------------------------
// Props Interface
// ------------------------------------------
interface WarehouseSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

// ------------------------------------------
// Navigation Menu Configuration
// ------------------------------------------
const menuGroups = [
  {
    label: "Overview",
    items: [
      {
        icon: LayoutDashboard,
        label: "Warehouse Dashboard",
        path: "/warehouse-manager/dashboard",
      },
      {
        icon: Bell,
        label: "Notifications / Tasks",
        path: "/warehouse-manager/notifications",
        badge: "6",
      },
    ],
  },
  {
    label: "Inventory Operations",
    items: [
      {
        icon: Package,
        label: "Inventory List",
        path: "/warehouse-manager/inventory",
      },
      {
        icon: ArrowLeftRight,
        label: "Stock Movements",
        path: "/warehouse-manager/movements",
      },
      {
        icon: ClipboardEdit,
        label: "Stock Adjustments",
        path: "/warehouse-manager/adjustments",
      },
      {
        icon: PackageCheck,
        label: "Production Intake",
        path: "/warehouse-manager/intake",
      },
      {
        icon: Archive,
        label: "Archives",
        path: "/warehouse-manager/archives",
      },
    ],
  },
  {
    label: "Reports",
    items: [
      {
        icon: BarChart3,
        label: "Inventory Reports",
        path: "/warehouse-manager/reports",
      },
      {
        icon: Download,
        label: "Export Center",
        path: "/warehouse-manager/export",
      },
    ],
  },
];

// ==========================================
// Component
// ==========================================
const WarehouseSidebar: React.FC<WarehouseSidebarProps> = ({
  isCollapsed,
  onToggleCollapse: _onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  void _onToggleCollapse;
  const location = useLocation();

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );

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

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
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
        {/* ---- LOGO AREA ---- */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div
            className={`transition-all duration-300 overflow-hidden ${isCollapsed ? "w-0 opacity-0 hidden" : "w-full opacity-100"}`}
          >
            <BrandLogo
              role="branch-admin"
              branch="Manila"
              roleLabel="Warehouse"
            />
          </div>
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
          <button
            onClick={onCloseMobile}
            className="flex lg:hidden items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* ---- NAVIGATION ---- */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
          {menuGroups.map((group) => {
            const isExpanded = expandedGroups[group.label] ?? false;
            const hasActiveItem = group.items.some(
              (item) => location.pathname === item.path,
            );

            return (
              <div key={group.label}>
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
                      className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                ) : (
                  <div className="h-px bg-slate-100 dark:bg-slate-700 my-2 mx-2" />
                )}

                <div
                  className={`space-y-1 overflow-hidden transition-all duration-200 ease-in-out ${isCollapsed ? "max-h-[500px] opacity-100 mt-1" : isExpanded ? "max-h-[500px] opacity-100 mt-1" : "max-h-0 opacity-0 mt-0"}`}
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
                        ${isActive ? "bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"}
                      `}
                    >
                      <div
                        className={`flex items-center truncate ${isCollapsed ? "justify-center w-full" : "gap-3"}`}
                      >
                        <item.icon size={16} className="shrink-0" />
                        <span
                          className={`truncate transition-opacity duration-200 ${isCollapsed ? "hidden" : "block"}`}
                        >
                          {item.label}
                        </span>
                      </div>
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
              className={`text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-3 transition-opacity duration-200 whitespace-nowrap ${isCollapsed ? "opacity-0 h-0 mb-0 overflow-hidden" : "opacity-100"}`}
            >
              Account
            </h3>
            <div className="space-y-1">
              <NavLink
                to="/warehouse-manager/profile"
                title={isCollapsed ? "Profile" : undefined}
                className={({ isActive }) =>
                  `flex items-center rounded-xl text-xs font-medium transition-all ${isCollapsed ? "justify-center py-2.5" : "gap-3 px-3 py-2.5"} ${isActive ? "bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"}`
                }
              >
                <User size={16} className="shrink-0" />
                <span
                  className={`transition-opacity duration-200 ${isCollapsed ? "hidden" : "block"}`}
                >
                  Profile
                </span>
              </NavLink>
              <button
                title={isCollapsed ? "Logout" : undefined}
                className={`w-full flex items-center rounded-xl text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-left ${isCollapsed ? "justify-center py-2.5" : "gap-3 px-3 py-2.5"}`}
              >
                <LogOut size={16} className="shrink-0" />
                <span
                  className={`transition-opacity duration-200 ${isCollapsed ? "hidden" : "block"}`}
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

export default WarehouseSidebar;
