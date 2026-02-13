// ==========================================
// PLMLayout.tsx
// Top-level layout wrapper used by all PLM Manager pages.
// Mirrors AdminLayout.tsx but uses PLMSidebar instead
// and displays "PLM Manager" in the header.
// Branch-scoped layout — Manila branch.
// ==========================================

import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import PLMSidebar from "../components/PLMSidebar";
import { ChevronRight, Home, Menu, ChevronsLeft, ChevronsRight } from "lucide-react";

// ------------------------------------------
// Props
// ------------------------------------------
interface PLMLayoutProps {
  children: React.ReactNode;
}

// ------------------------------------------
// Component
// ------------------------------------------
const PLMLayout: React.FC<PLMLayoutProps> = ({ children }) => {
  const location = useLocation();

  // ------------------------------------------
  // Sidebar State
  // ------------------------------------------
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // ------------------------------------------
  // Breadcrumb Generation
  // Maps URL segments to friendly display names.
  // ------------------------------------------
  const SEGMENT_LABELS: Record<string, string> = {
    "plm-manager": "PLM Manager",
    dashboard: "Dashboard",
    notifications: "Notifications / Tasks",
    products: "Products (Styles & SKU)",
    "tech-pack": "Tech Pack & Versions",
    bom: "BOM (Bill of Materials)",
    materials: "Materials Library",
    release: "Release to Production",
    reports: "PLM Reports",
    export: "Export Center",
    archives: "Archives",
    profile: "Profile",
  };

  // Segments that don't have their own page — redirect to dashboard
  const SEGMENT_REDIRECT: Record<string, string> = {
    "plm-manager": "/plm-manager/dashboard",
  };

  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] dark:bg-slate-950">
      {/* ---- SIDEBAR ---- */}
      <PLMSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* ---- MAIN CONTENT AREA ---- */}
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
            {/* Hamburger Menu — visible only on mobile */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              aria-label="Open sidebar menu"
            >
              <Menu size={20} />
            </button>

            {/* Sidebar Collapse/Expand Toggle — desktop only */}
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

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Link
                to="/plm-manager/dashboard"
                className="hover:text-indigo-600 transition-colors flex items-center gap-1"
              >
                <Home size={16} />
              </Link>

              {pathnames.map((value, index) => {
                const rawTo = `/${pathnames.slice(0, index + 1).join("/")}`;
                const to = SEGMENT_REDIRECT[value] ?? rawTo;
                const isLast = index === pathnames.length - 1;

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
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">PLM Manager</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manila</p>
            </div>
            {/* User avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:shadow-md transition-shadow ring-2 ring-white dark:ring-slate-800">
              PM
            </div>
          </div>
        </header>

        {/* ---- PAGE CONTENT ---- */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default PLMLayout;
