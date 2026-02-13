// ==========================================
// QALayout.tsx
// Top-level layout wrapper for all Quality Manager pages.
// Mirrors ProductionLayout.tsx but uses QASidebar
// and displays "Quality Manager" in the header.
// Branch-scoped layout — Manila branch.
// Theme color: Teal (from-teal-500 to-teal-600)
// ==========================================

import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import QASidebar from "../components/QASidebar";
import { ChevronRight, Home, Menu, ChevronsLeft, ChevronsRight } from "lucide-react";

// ------------------------------------------
// Props
// ------------------------------------------
interface QALayoutProps {
  children: React.ReactNode;
}

// ------------------------------------------
// Component
// ------------------------------------------
const QALayout: React.FC<QALayoutProps> = ({ children }) => {
  const location = useLocation();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const SEGMENT_LABELS: Record<string, string> = {
    "qa-manager": "Quality Manager",
    dashboard: "Quality Dashboard",
    notifications: "Notifications / Tasks",
    "inspection-queue": "Inspection Queue",
    "inspection-records": "Inspection Records",
    defects: "Defect Management",
    approvals: "Approvals / Rejections",
    capa: "CAPA",
    checklists: "Quality Standards & Checklists",
    reports: "Quality Reports",
    export: "Export Center",
    archives: "Archives",
    profile: "Profile",
  };

  const SEGMENT_REDIRECT: Record<string, string> = {
    "qa-manager": "/qa-manager/dashboard",
  };

  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] dark:bg-slate-950">
      <QASidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ml-0 ${isSidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-72"}`}>
        <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 pl-0 pr-4 sm:pr-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors" aria-label="Open sidebar menu">
              <Menu size={20} />
            </button>
            <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
              {isSidebarCollapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Link to="/qa-manager/dashboard" className="hover:text-indigo-600 transition-colors flex items-center gap-1"><Home size={16} /></Link>
              {pathnames.map((value, index) => {
                const rawTo = `/${pathnames.slice(0, index + 1).join("/")}`;
                const to = SEGMENT_REDIRECT[value] ?? rawTo;
                const isLast = index === pathnames.length - 1;
                const name = SEGMENT_LABELS[value] ?? value.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
                return (
                  <div key={rawTo} className="flex items-center gap-2">
                    <ChevronRight size={14} className="text-slate-400" />
                    {isLast ? (
                      <span className="font-semibold text-slate-800 dark:text-slate-200 pointer-events-none">{name}</span>
                    ) : (
                      <Link to={to} className="hover:text-indigo-600 transition-colors">{name}</Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-slate-700 h-10 my-auto">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Quality Manager</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manila</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:shadow-md transition-shadow ring-2 ring-white dark:ring-slate-800">
              QM
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default QALayout;
