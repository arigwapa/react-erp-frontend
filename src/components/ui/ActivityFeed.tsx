// ==========================================
// ActivityFeed.tsx — Reusable Activity Feed
// Table layout separating Event, Type badge,
// and Timestamp into clean columns.
// Used in dashboards for audit trails.
// ==========================================

import React from "react";
import { Clock, Activity } from "lucide-react";

// ------------------------------------------
// Types
// ------------------------------------------
export interface ActivityItem {
  id: string;
  message: string;
  timestamp: string;
  type?: "info" | "success" | "warning" | "error";
}

interface ActivityFeedProps {
  /** Feed title */
  title: string;
  /** Activity items */
  items: ActivityItem[];
  /** Optional empty state message */
  emptyMessage?: string;
}

// ------------------------------------------
// Helpers
// ------------------------------------------
const typeConfig: Record<string, { badge: string; label: string; dot: string }> = {
  info: {
    badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    label: "Info",
    dot: "bg-blue-500",
  },
  success: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
    label: "Success",
    dot: "bg-emerald-500",
  },
  warning: {
    badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
    label: "Warning",
    dot: "bg-amber-500",
  },
  error: {
    badge: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800",
    label: "Error",
    dot: "bg-rose-500",
  },
};

// ------------------------------------------
// Component
// ------------------------------------------
const ActivityFeed: React.FC<ActivityFeedProps> = ({
  title,
  items,
  emptyMessage = "No recent activity.",
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-[0_1px_6px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] transition-shadow duration-300">
      {/* Accent top bar */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500" />

      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
            <Activity size={16} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{title}</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
              {items.length > 0 ? `${items.length} recent event${items.length !== 1 ? "s" : ""}` : "No events"}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      {items.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            {/* Column headers */}
            <thead>
              <tr className="border-t border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-800/30">
                <th className="px-5 py-2.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Event</th>
                <th className="px-3 py-2.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">Type</th>
                <th className="px-5 py-2.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-left whitespace-nowrap">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
              {items.map((item) => {
                const config = typeConfig[item.type || "info"];
                return (
                  <tr key={item.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Event description */}
                    <td className="px-5 py-3">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${config.dot}`} />
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                          {item.message}
                        </p>
                      </div>
                    </td>

                    {/* Type badge */}
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.badge}`}>
                        {config.label}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="px-5 py-3 text-left">
                      <span className="inline-flex items-center gap-1 whitespace-nowrap text-left text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        <Clock size={10} className="opacity-60" />
                        {item.timestamp}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Empty state */
        <div className="px-5 py-10 text-center border-t border-slate-100 dark:border-slate-700/60">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 opacity-50">
            <Activity size={18} className="text-slate-400" />
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
