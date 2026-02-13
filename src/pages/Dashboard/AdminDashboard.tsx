// ==========================================
// AdminDashboard.tsx
// Branch Admin dashboard page.
// Sections:
//   A. KPI Summary Cards (branch metrics)
//   B. Alerts & Warnings Panel
//   C. Recent Activity Feed (branch only)
//   D. Pending Approvals Widget
//   E. Mini Analytics (trend bars)
// ==========================================

import { useState } from "react";

// --- Layout ---
import AdminLayout from "../../layout/AdminLayout";

// --- Icons (Lucide) ---
import {
  Package,
  ClipboardList,
  ClipboardCheck,
  AlertTriangle,
  Wallet,
  Search,
  ArrowUpRight,
  TrendingUp,
  AlertOctagon,
  Factory,
  Eye,
  Check,
  X,
  Clock,
  BarChart3,
  TrendingDown,
  ArrowRight,
  Boxes,
  Bell,
} from "lucide-react";

// --- Reusable UI Components ---
import DashboardStatsCard from "../../components/ui/DashboardStatsCard";
import { Card } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";
import Toast from "../../components/ui/Toast";

// ==========================================
// SECTION 1: TYPES & MOCK DATA
// ==========================================

/** A. KPI — Low Stock Items count (shown as 5th card) */

/** B. Alert items for the Alerts Panel */
const ALERT_DATA = [
  {
    id: "ALT-401",
    title: "High QA Rejection Rate",
    desc: "Rejection rate exceeded 5% threshold for batch B-4012",
    severity: "critical" as const,
    module: "Quality",
    time: "15m ago",
  },
  {
    id: "ALT-402",
    title: "Critical Low Inventory",
    desc: "Denim Fabric (DNM-001) below minimum stock level — 45 yards remaining",
    severity: "critical" as const,
    module: "Warehouse",
    time: "1h ago",
  },
  {
    id: "ALT-403",
    title: "Delayed Production Order",
    desc: "WO-1045 is 2 days behind schedule, blocking downstream orders",
    severity: "warning" as const,
    module: "Production",
    time: "3h ago",
  },
  {
    id: "ALT-404",
    title: "Budget Exceeded Warning",
    desc: "Monthly budget utilization reached 92% — only ₱88K remaining",
    severity: "warning" as const,
    module: "Finance",
    time: "5h ago",
  },
  {
    id: "ALT-405",
    title: "Too Many Failed Logins",
    desc: "5 failed login attempts from IP 192.168.1.55 in the last 10 minutes",
    severity: "critical" as const,
    module: "Security",
    time: "30m ago",
  },
];

/** C. Recent activity feed entries (branch-only) */
const ACTIVITY_FEED = [
  {
    text: "QA approved inspection INS-221",
    sub: "QA Manager • Quality Module",
    time: "10:30 AM",
    type: "success",
  },
  {
    text: "Warehouse adjusted −5 fabric rolls",
    sub: "Warehouse Mgr • Warehouse Module",
    time: "09:15 AM",
    type: "warning",
  },
  {
    text: "User Maria created new product SKU-009",
    sub: "PLM Staff • PLM Module",
    time: "08:45 AM",
    type: "info",
  },
  {
    text: "Work order WO-102 completed",
    sub: "Production Lead • Production Module",
    time: "08:00 AM",
    type: "success",
  },
  {
    text: "Budget approval request submitted",
    sub: "Finance Mgr • Finance Module",
    time: "Yesterday",
    type: "info",
  },
  {
    text: "Stock adjustment approved for Zone B",
    sub: "Branch Admin • Warehouse Module",
    time: "Yesterday",
    type: "success",
  },
];

/** D. Pending Approvals — items requiring Branch Admin decision */
const PENDING_APPROVALS = [
  {
    id: "PROD-5501",
    module: "Production",
    description: "Work order WO-1048 completion approval",
    requestedBy: "Juan Dela Cruz",
    time: "30m ago",
    status: "Pending",
  },
  {
    id: "WH-5502",
    module: "Warehouse",
    description: "Stock adjustment −50kg Cotton (Zone B damage)",
    requestedBy: "Ana Santos",
    time: "2h ago",
    status: "Pending",
  },
  {
    id: "FIN-9002",
    module: "Finance",
    description: "Q1 procurement budget unlock request (₱120K)",
    requestedBy: "Mark Reyes",
    time: "4h ago",
    status: "Urgent",
  },
  {
    id: "QA-2030",
    module: "Quality",
    description: "Escalation: Batch #442 GSM variance override",
    requestedBy: "Lisa Garcia",
    time: "5h ago",
    status: "Pending",
  },
  {
    id: "PROD-5504",
    module: "Production",
    description: "Machine #12 maintenance halt approval",
    requestedBy: "Engr. Santos",
    time: "1d ago",
    status: "Pending",
  },
];

/** E. Mini Analytics — simple trend data */
const ANALYTICS_DATA = [
  {
    label: "Production Completion",
    value: 82,
    trend: "+5%",
    trendUp: true,
    color: "bg-indigo-500",
    bgColor: "bg-indigo-100",
  },
  {
    label: "QA Rejection Rate",
    value: 12,
    trend: "+3%",
    trendUp: false,
    color: "bg-rose-500",
    bgColor: "bg-rose-100",
  },
  {
    label: "Inventory Utilization",
    value: 68,
    trend: "-2%",
    trendUp: true,
    color: "bg-emerald-500",
    bgColor: "bg-emerald-100",
  },
  {
    label: "Budget Consumption",
    value: 78,
    trend: "On Track",
    trendUp: true,
    color: "bg-amber-500",
    bgColor: "bg-amber-100",
  },
];

/** Quick Reports shortcuts */
const QUICK_REPORTS = [
  "Production Summary",
  "Quality Summary",
  "Inventory Summary",
  "Finance Summary",
];

// ==========================================
// SECTION 2: HELPER — Severity Styling
// ==========================================
const SEVERITY_STYLES = {
  critical: {
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-700 border-red-200",
    label: "Critical",
  },
  warning: {
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    label: "Warning",
  },
  info: {
    dot: "bg-blue-500",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    label: "Info",
  },
};

// ==========================================
// SECTION 3: MAIN COMPONENT
// ==========================================

const AdminDashboard = () => {
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  /** Handle approval action from widget */
  const handleApprove = (id: string) => {
    setToast({ message: `Request ${id} approved successfully`, type: "success" });
  };

  return (
    <AdminLayout>
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="space-y-6 pb-10">
        {/* ---- PAGE HEADER ---- */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Branch Dashboard
            </h1>
            <p className="text-slate-500 text-xs mt-1 font-medium">
              Welcome back! Here's your branch overview for today.
            </p>
          </div>
          <div
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm text-slate-600 text-xs font-medium"
            aria-label="System is online"
          >
            <span
              className="w-2 h-2 rounded-full bg-emerald-500"
              aria-hidden="true"
            ></span>
            Online
          </div>
        </header>

        {/* ==================================================
            A. KPI SUMMARY CARDS (Top Row)
            ================================================== */}
        <section
          aria-label="Key Performance Indicators"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          <DashboardStatsCard
            title="Active Products"
            value="147"
            icon={Package}
            colorTheme="indigo"
            trend="+8%"
            trendUp={true}
            subText="12 new this month"
          />
          <DashboardStatsCard
            title="Open Work Orders"
            value="18"
            icon={Factory}
            colorTheme="blue"
            trend="3 urgent"
            trendUp={false}
            subText="5 completing today"
          />
          <DashboardStatsCard
            title="Pending Inspections"
            value="6"
            icon={ClipboardCheck}
            colorTheme="emerald"
            trend="-2 from last week"
            trendUp={true}
            subText="2 high priority"
          />
          <DashboardStatsCard
            title="Low Stock Items"
            value="11"
            icon={Boxes}
            colorTheme="cyan"
            trend="4 critical"
            trendUp={false}
            subText="Below safety level"
          />
          <DashboardStatsCard
            title="Budget Usage"
            value="78%"
            icon={Wallet}
            colorTheme="cyan"
            trend="On Track"
            trendUp={true}
            subText="₱1.1M remaining"
          />
        </section>

        {/* ==================================================
            MAIN CONTENT GRID — 2 columns
            ================================================== */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* ===== LEFT COLUMN (2/3 width) ===== */}
          <div className="xl:col-span-2 space-y-6">
            {/* -------- B. ALERTS & WARNINGS PANEL -------- */}
            <Card className="overflow-hidden">
              <div className="flex justify-between items-center p-5 pb-0">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <div
                    className="p-1 bg-red-100 text-red-600 rounded-lg"
                    aria-hidden="true"
                  >
                    <AlertOctagon size={16} />
                  </div>
                  Alerts & Warnings
                  <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                    {ALERT_DATA.length}
                  </span>
                </h3>
                <button className="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors">
                  Dismiss All
                </button>
              </div>

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-t border-slate-100 bg-slate-50/50 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                      <th className="px-5 py-3">Alert</th>
                      <th className="px-5 py-3 whitespace-nowrap">Severity</th>
                      <th className="px-5 py-3 whitespace-nowrap">Module</th>
                      <th className="px-5 py-3 hidden md:table-cell whitespace-nowrap">Time</th>
                      <th className="px-5 py-3 text-left whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {ALERT_DATA.map((alert) => {
                      const severity = SEVERITY_STYLES[alert.severity];
                      return (
                        <tr
                          key={alert.id}
                          className="group hover:bg-slate-50/80 transition-colors"
                          role="alert"
                        >
                          {/* Alert info */}
                          <td className="px-5 py-3">
                            <div className="flex items-start gap-2.5 min-w-0">
                              <div
                                className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${severity.dot}`}
                                aria-hidden="true"
                              ></div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-slate-800 leading-snug truncate">
                                  {alert.title}
                                </h4>
                                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                                  {alert.desc}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Severity badge */}
                          <td className="px-5 py-3">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${severity.badge}`}
                            >
                              {severity.label}
                            </span>
                          </td>

                          {/* Module badge */}
                          <td className="px-5 py-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded-md">
                              {alert.module}
                            </span>
                          </td>

                          {/* Time */}
                          <td className="px-5 py-3 hidden md:table-cell">
                            <span className="text-[10px] text-slate-400">
                              {alert.time}
                            </span>
                          </td>

                          {/* Action */}
                          <td className="px-5 py-3 text-left">
                            <button
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all whitespace-nowrap text-left"
                              aria-label={`View details for alert: ${alert.title}`}
                            >
                              <Eye size={12} />
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* -------- D. PENDING APPROVALS WIDGET -------- */}
            <Card className="overflow-hidden">
              <div className="flex justify-between items-center p-5 pb-0">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <div
                    className="p-1 bg-amber-100 text-amber-600 rounded-lg"
                    aria-hidden="true"
                  >
                    <ClipboardList size={16} />
                  </div>
                  Pending Approvals
                  <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                    {PENDING_APPROVALS.length}
                  </span>
                </h3>
                <button className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors flex items-center gap-1">
                  View All <ArrowRight size={12} />
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-t border-slate-100 bg-slate-50/50 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                      <th className="px-5 py-3">Ref ID</th>
                      <th className="px-5 py-3">Module</th>
                      <th className="px-5 py-3">Description</th>
                      <th className="px-5 py-3 hidden sm:table-cell">Requested By</th>
                      <th className="px-5 py-3 hidden md:table-cell">Time</th>
                      <th className="px-5 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {PENDING_APPROVALS.map((item) => (
                      <tr
                        key={item.id}
                        className="group hover:bg-slate-50/80 transition-colors"
                      >
                        {/* Ref ID */}
                        <td className="px-5 py-3">
                          <span className="font-mono text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {item.id}
                          </span>
                        </td>

                        {/* Module */}
                        <td className="px-5 py-3">
                          <span className="text-xs font-bold text-slate-800">
                            {item.module}
                          </span>
                        </td>

                        {/* Description */}
                        <td className="px-5 py-3">
                          <span className="text-xs text-slate-600 line-clamp-1">
                            {item.description}
                          </span>
                        </td>

                        {/* Requested By */}
                        <td className="px-5 py-3 hidden sm:table-cell">
                          <span className="text-xs text-slate-500">
                            {item.requestedBy}
                          </span>
                        </td>

                        {/* Time */}
                        <td className="px-5 py-3 hidden md:table-cell">
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock size={11} />
                            {item.time}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-start gap-1.5">
                            {/* View */}
                            <button
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                              aria-label={`View ${item.id}`}
                            >
                              <Eye size={14} />
                            </button>
                            {/* Approve */}
                            <button
                              onClick={() => handleApprove(item.id)}
                              className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 shadow-sm transition-all hover:scale-105 active:scale-95"
                              aria-label={`Approve ${item.id}`}
                            >
                              <Check size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* -------- E. MINI ANALYTICS -------- */}
            <Card className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <div
                    className="p-1 bg-indigo-100 text-indigo-600 rounded-lg"
                    aria-hidden="true"
                  >
                    <BarChart3 size={16} />
                  </div>
                  Branch Analytics
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">
                  Last 30 days
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ANALYTICS_DATA.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-semibold text-slate-600">
                        {item.label}
                      </span>
                      <div
                        className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.trendUp
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {item.trendUp ? (
                          <TrendingUp size={10} />
                        ) : (
                          <TrendingDown size={10} />
                        )}
                        {item.trend}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center gap-3">
                      <div className={`flex-1 h-2.5 rounded-full ${item.bgColor}`}>
                        <div
                          className={`h-full rounded-full ${item.color} transition-all duration-500`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-slate-800 w-10 text-left">
                        {item.value}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* ===== RIGHT COLUMN (1/3 width) ===== */}
          <aside
            className="space-y-6"
            aria-label="Sidebar: Reports and Activity"
          >
            {/* ---- QUICK REPORTS ---- */}
            <div className="relative overflow-hidden bg-slate-900 p-5 rounded-2xl shadow-xl text-white">
              <div
                className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20"
                aria-hidden="true"
              ></div>
              <div
                className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20"
                aria-hidden="true"
              ></div>

              <h3 className="relative font-bold text-sm mb-4 flex items-center gap-2">
                <TrendingUp
                  size={16}
                  className="text-indigo-400"
                  aria-hidden="true"
                />
                Quick Reports
              </h3>

              <div className="relative grid grid-cols-1 gap-2.5">
                {QUICK_REPORTS.map((report, i) => (
                  <button
                    key={i}
                    className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-2xl text-xs font-medium transition-all group backdrop-blur-sm"
                    aria-label={`Generate ${report}`}
                  >
                    <span className="text-slate-200 group-hover:text-white">
                      {report}
                    </span>
                    <div
                      className="p-1 rounded-lg bg-white/5 group-hover:bg-indigo-500 transition-colors"
                      aria-hidden="true"
                    >
                      <ArrowUpRight
                        size={12}
                        className="text-slate-400 group-hover:text-white"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* -------- C. RECENT ACTIVITY FEED -------- */}
            <Card className="overflow-hidden h-fit">
              <div className="flex justify-between items-center p-5 pb-0">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  Recent Activity
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">
                  Branch only
                </span>
              </div>

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-t border-slate-100 bg-slate-50/50 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                      <th className="px-5 py-3">Event</th>
                      <th className="px-5 py-3 whitespace-nowrap">Type</th>
                      <th className="px-5 py-3 text-left whitespace-nowrap">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {ACTIVITY_FEED.map((item, idx) => (
                      <tr
                        key={idx}
                        className="group hover:bg-slate-50/80 transition-colors"
                      >
                        {/* Event */}
                        <td className="px-5 py-3">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div
                              className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                                item.type === "success"
                                  ? "bg-emerald-500"
                                  : item.type === "warning"
                                    ? "bg-amber-500"
                                    : "bg-blue-500"
                              }`}
                            ></div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-700 leading-snug truncate">
                                {item.text}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                                {item.sub}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Type badge */}
                        <td className="px-5 py-3">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                              item.type === "success"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : item.type === "warning"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {item.type === "success"
                              ? "Success"
                              : item.type === "warning"
                                ? "Warning"
                                : "Info"}
                          </span>
                        </td>

                        {/* Time */}
                        <td className="px-5 py-3 text-left">
                          <div className="flex items-center justify-start gap-1 text-[10px] text-slate-400">
                            <Clock size={10} className="opacity-60" />
                            {item.time}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-5 pt-3">
                <button className="w-full py-2.5 text-xs font-semibold text-slate-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all border border-indigo-100 hover:shadow-sm">
                  View Full Activity Log
                </button>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
