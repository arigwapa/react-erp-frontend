// ==========================================
// MainLayout.tsx
// Top-level layout wrapper used by all admin pages.
// Manages the sidebar collapsed/expanded state, mobile
// drawer toggle, breadcrumb generation, and the
// top header with user profile info.
// ==========================================

import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { ChevronRight, Home, Menu, ChevronsLeft, ChevronsRight } from "lucide-react";

// ------------------------------------------
// Props
// ------------------------------------------
interface MainLayoutProps {
  children: React.ReactNode;
}

// ------------------------------------------
// Component
// ------------------------------------------
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();

  // ------------------------------------------
  // Sidebar State
  // ------------------------------------------
  /** Controls desktop sidebar collapse (icons only) */
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  /** Controls mobile sidebar drawer visibility */
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // ------------------------------------------
  // Breadcrumb Generation
  // Maps URL segments to friendly display names and valid routes.
  // ------------------------------------------
  const SEGMENT_LABELS: Record<string, string> = {
    admin: "Admin",
    dashboard: "Dashboard",
    notification: "Notifications",
    "user-management": "User Management",
    "roles-permissions": "Roles & Permissions",
    "branch-management": "Branch Management",
    "audit-logs": "Audit Logs",
    "system-settings": "System Settings",
    plm: "PLM (Products)",
    production: "Production",
    quality: "Quality (QA)",
    warehouse: "Warehouse",
    finance: "Finance",
    "reports-center": "Reports Center",
    "export-center": "Export Center",
    archives: "Archives",
    profile: "Profile",
  };

  // Segments that don't have their own page — redirect to dashboard instead
  const SEGMENT_REDIRECT: Record<string, string> = {
    admin: "/admin/dashboard",
  };

  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] dark:bg-slate-950">
      {/* ---- SIDEBAR ---- */}
      {/* Renders the collapsible sidebar, passing state + handlers as props */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* ---- MAIN CONTENT AREA ---- */}
      {/* Left margin adjusts based on sidebar width:
          - Desktop expanded: ml-72 (288px)
          - Desktop collapsed: ml-[72px]
          - Mobile: ml-0 (sidebar is an overlay) */}
      <div
        className={`
          flex-1 flex flex-col transition-all duration-300
          ml-0
          ${isSidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-72"}
        `}
      >
        {/* ---- TOP HEADER BAR ---- */}
        <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 pl-0 pr-4 sm:pr-8 flex items-center justify-between">
          {/* LEFT SIDE: Sidebar toggle + Mobile hamburger + Breadcrumbs */}
          <div className="flex items-center gap-3">
            {/* Hamburger Menu — visible only on mobile (<lg) to open the sidebar drawer */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              aria-label="Open sidebar menu"
            >
              <Menu size={20} />
            </button>

            {/* Sidebar Collapse/Expand Toggle — visible on desktop only */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? (
                <ChevronsRight size={18} />
              ) : (
                <ChevronsLeft size={18} />
              )}
            </button>

            {/* Breadcrumbs — shows the current navigation path */}
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              {/* Home Icon */}
              <Link
                to="/admin/dashboard"
                className="hover:text-indigo-600 transition-colors flex items-center gap-1"
              >
                <Home size={16} />
              </Link>

              {/* Path Segments */}
              {pathnames.map((value, index) => {
                const rawTo = `/${pathnames.slice(0, index + 1).join("/")}`;
                const to = SEGMENT_REDIRECT[value] ?? rawTo;
                const isLast = index === pathnames.length - 1;

                // Use friendly label or fall back to formatted segment
                const name =
                  SEGMENT_LABELS[value] ??
                  value
                    .replace(/-/g, " ")
                    .replace(/^\w/, (c) => c.toUpperCase());

                return (
                  <div key={rawTo} className="flex items-center gap-2">
                    <ChevronRight size={14} className="text-slate-400" />
                    {isLast ? (
                      <span className="font-semibold text-slate-800 dark:text-slate-200 pointer-events-none">
                        {name}
                      </span>
                    ) : (
                      <Link
                        to={to}
                        className="hover:text-indigo-600 transition-colors"
                      >
                        {name}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT SIDE: User Profile */}
          <div className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-slate-700 h-10 my-auto">
            {/* User name/role — hidden on small screens */}
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Admin User</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Super Admin</p>
            </div>
            {/* User avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:shadow-md transition-shadow ring-2 ring-white dark:ring-slate-800">
              AU
            </div>
          </div>
        </header>

        {/* ---- PAGE CONTENT ---- */}
        {/* The actual page content (children) rendered here */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
