// ==========================================
// AlertPanel.tsx — Reusable Alerts Panel
// Table layout separating Alert message,
// Severity badge, and Action into clean columns.
// Used in dashboards for warnings and notifications.
// ==========================================

import React from "react";
import { AlertTriangle, AlertCircle, Info, Eye } from "lucide-react";

// ------------------------------------------
// Types
// ------------------------------------------
export type AlertSeverity = "critical" | "warning" | "info";

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface AlertPanelProps {
  /** Panel title */
  title: string;
  /** Alert items */
  items: AlertItem[];
  /** Empty state message */
  emptyMessage?: string;
}

// ------------------------------------------
// Severity config
// ------------------------------------------
const SEVERITY_CONFIG: Record<AlertSeverity, {
  icon: React.ReactNode;
  badge: string;
  label: string;
  dot: string;
}> = {
  critical: {
    icon: <AlertCircle size={14} className="text-rose-500" />,
    badge: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800",
    label: "Critical",
    dot: "bg-rose-500",
  },
  warning: {
    icon: <AlertTriangle size={14} className="text-amber-500" />,
    badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
    label: "Warning",
    dot: "bg-amber-500",
  },
  info: {
    icon: <Info size={14} className="text-blue-500" />,
    badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    label: "Info",
    dot: "bg-blue-500",
  },
};

// ------------------------------------------
// Component
// ------------------------------------------
const AlertPanel: React.FC<AlertPanelProps> = ({
  title,
  items,
  emptyMessage = "No active alerts.",
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-[0_1px_6px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] transition-shadow duration-300">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center">
            <AlertTriangle size={16} className="text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{title}</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
              {items.length === 0 ? "All clear" : `${items.length} active alert${items.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
        {items.length > 0 && (
          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2.5 py-1 rounded-full">
            {items.length}
          </span>
        )}
      </div>

      {/* Table */}
      {items.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            {/* Column headers */}
            <thead>
              <tr className="border-t border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-800/30">
                <th className="px-5 py-2.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Alert</th>
                <th className="px-3 py-2.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">Severity</th>
                <th className="px-5 py-2.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-left whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
              {items.map((item) => {
                const config = SEVERITY_CONFIG[item.severity];
                return (
                  <tr key={item.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Alert message */}
                    <td className="px-5 py-3">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="mt-0.5 shrink-0">{config.icon}</div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                          {item.message}
                        </p>
                      </div>
                    </td>

                    {/* Severity badge */}
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.badge}`}>
                        {config.label}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3 text-left">
                      {item.onAction ? (
                        <button
                          onClick={item.onAction}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap text-left"
                        >
                          <Eye size={12} className="shrink-0" />
                          {item.actionLabel || "View"}
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">—</span>
                      )}
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
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center mx-auto mb-3 opacity-50">
            <AlertTriangle size={18} className="text-rose-400" />
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
};

export default AlertPanel;
