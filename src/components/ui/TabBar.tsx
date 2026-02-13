// ==========================================
// TabBar.tsx
// A reusable horizontal tab switcher with icons
// and optional count badges. Used for switching
// between content views (e.g. Approvals / Alerts / System).
// ==========================================

import React from "react";
import type { LucideIcon } from "lucide-react";

// ------------------------------------------
// Types
// ------------------------------------------

/** Shape of a single tab item */
export interface Tab {
  /** Unique identifier for this tab */
  id: string;
  /** Display label */
  label: string;
  /** Lucide icon shown next to the label */
  icon: LucideIcon;
  /** Optional count badge (e.g. number of pending items) */
  count?: number;
}

export interface TabBarProps {
  /** Array of tab items to render */
  tabs: Tab[];
  /** The currently active tab id */
  activeTab: string;
  /** Callback fired when a tab is clicked */
  onTabChange: (id: string) => void;
}

// ------------------------------------------
// Component
// ------------------------------------------
const TabBar: React.FC<TabBarProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div
      className="bg-slate-100/80 p-1.5 rounded-full w-full md:w-fit inline-flex overflow-x-auto max-w-full"
      role="tablist"
      aria-label="Content tabs"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex-1 md:flex-none min-w-[120px] flex items-center justify-center gap-2
              px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-200
              ${
                isActive
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }
            `}
          >
            {/* Tab Icon */}
            <Icon
              size={14}
              className={isActive ? "text-indigo-600" : "text-slate-400"}
              aria-hidden="true"
            />

            {/* Tab Label */}
            {tab.label}

            {/* Optional Count Badge */}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`ml-1 text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default TabBar;
