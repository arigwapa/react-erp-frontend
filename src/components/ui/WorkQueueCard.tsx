// ==========================================
// WorkQueueCard.tsx — Reusable Work Queue Panel
// Modern card with table layout separating
// Item info, Status, and Actions into columns.
// Used in dashboards for pending tasks and queues.
// ==========================================

import React from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";

// ------------------------------------------
// Types
// ------------------------------------------
export interface WorkQueueItem {
  id: string;
  label: string;
  sublabel?: string;
  status?: React.ReactNode;
  onAction?: () => void;
  actionLabel?: string;
}

interface WorkQueueCardProps {
  /** Panel title */
  title: string;
  /** Lucide icon for the header */
  icon: LucideIcon;
  /** Header accent color class */
  iconColor?: string;
  /** Background color for the icon container */
  iconBg?: string;
  /** Accent color for the top border */
  accentColor?: string;
  /** Items to display */
  items: WorkQueueItem[];
  /** Optional empty state message */
  emptyMessage?: string;
}

// ------------------------------------------
// Component
// ------------------------------------------
const WorkQueueCard: React.FC<WorkQueueCardProps> = ({
  title,
  icon: Icon,
  iconColor = "text-slate-600",
  iconBg = "bg-slate-100",
  accentColor = "bg-slate-400",
  items,
  emptyMessage = "No items to display.",
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-[0_1px_6px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] transition-shadow duration-300">
      {/* Accent top bar */}
      <div className={`h-1 ${accentColor}`} />

      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center`}>
            <Icon size={16} className={iconColor} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{title}</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
              {items.length === 0 ? "All clear" : `${items.length} item${items.length !== 1 ? "s" : ""} require attention`}
            </p>
          </div>
        </div>
        <span className={`text-xs font-bold min-w-[28px] h-7 flex items-center justify-center rounded-full ${items.length > 0 ? `${iconBg} ${iconColor}` : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
          {items.length}
        </span>
      </div>

      {/* Table */}
      {items.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            {/* Column headers */}
            <thead>
              <tr className="border-t border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-800/30">
                <th className="px-5 py-2.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Item</th>
                <th className="px-3 py-2.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-5 py-2.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-left whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
              {items.map((item) => (
                <tr key={item.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  {/* Item info */}
                  <td className="px-5 py-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${accentColor} opacity-60`} />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug truncate">
                          {item.label}
                        </p>
                        {item.sublabel && (
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-snug truncate">
                            {item.sublabel}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-3 py-3">
                    {item.status || <span className="text-[10px] text-slate-400">—</span>}
                  </td>

                  {/* Action */}
                  <td className="px-5 py-3 text-left">
                    {item.onAction ? (
                      <button
                        onClick={item.onAction}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap text-left"
                      >
                        {item.actionLabel || "Review"}
                        <ChevronRight size={12} className="shrink-0" />
                      </button>
                    ) : (
                      <ChevronRight size={14} className="text-slate-300 dark:text-slate-600 ml-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Empty state */
        <div className="px-5 py-10 text-center border-t border-slate-100 dark:border-slate-700/60">
          <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mx-auto mb-3 opacity-50`}>
            <Icon size={18} className={iconColor} />
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
};

export default WorkQueueCard;
