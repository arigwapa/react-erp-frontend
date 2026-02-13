// ==========================================
// SuperAdminDashboard.tsx
// Main dashboard page for the Super Admin role.
// Displays KPI stats, priority alerts, branch
// performance table, quick reports, and audit log.
// ==========================================

// --- React & Hooks ---
import { useState, useMemo } from "react";

// --- Layout ---
import MainLayout from "../../layout/MainLayout";

// --- Icons (Lucide) ---
import {
  Users,
  Building,
  Activity,
  FileCheck,
  AlertTriangle,
  ClipboardList,
  AlertOctagon,
  TrendingUp,
  Wallet,
  CheckCircle2,
  Search,
  MoreHorizontal,
  ArrowUpRight,
  Filter,
  ChevronDown,
} from "lucide-react";

// --- Reusable UI Components (from components/ui) ---
import DashboardStatsCard from "../../components/ui/DashboardStatsCard"; // Themed KPI card with trend indicator
import { Card } from "../../components/ui/Card"; // Generic white card wrapper

// ==========================================
// SECTION 1: TYPES & INTERFACES
// ==========================================

/** Shape of each branch row in the performance table */
interface BranchData {
  name: string;
  output: string;
  reject: string;
  stock: number;
  budget: number;
}

// ==========================================
// SECTION 2: CONSTANTS & MOCK DATA
// ==========================================

/**
 * INITIAL_BRANCH_DATA — Seed data for the branch performance table.
 * Each entry tracks output volume, rejection rate, stock level, and budget utilization.
 * Replace with an API call in production.
 */
const INITIAL_BRANCH_DATA: BranchData[] = [
  {
    name: "Manila HQ",
    output: "12.4k",
    reject: "1.2%",
    stock: 5,
    budget: 45,
  },
  {
    name: "Cebu Plant",
    output: "8.2k",
    reject: "0.8%",
    stock: 12,
    budget: 62,
  },
  {
    name: "Laguna Factory",
    output: "15.1k",
    reject: "2.4%",
    stock: 8,
    budget: 78,
  },
  {
    name: "Davao Hub",
    output: "9.5k",
    reject: "1.1%",
    stock: 20,
    budget: 30,
  },
  {
    name: "Pampanga Warehouse",
    output: "4.2k",
    reject: "0.5%",
    stock: 45,
    budget: 15,
  },
];

/**
 * ALERT_DATA — Priority alerts shown in the "Requires Attention" panel.
 * Each alert has a severity, type tag, source user, and time since occurrence.
 */
const ALERT_DATA = [
  {
    title: "Failed Login Attempt",
    desc: "Unknown IP (192.168.x.x) detected",
    user: "System",
    time: "10m",
    type: "Security",
    severityText: "Critical Severity",
    dotColor: "bg-red-500",
  },
  {
    title: "Role Permission Changed",
    desc: "Admin privileges granted to User #402",
    user: "HQ Admin",
    time: "45m",
    type: "Admin",
    severityText: "Medium Severity",
    dotColor: "bg-orange-500",
  },
  {
    title: "Budget Limit Exceeded",
    desc: "Cebu Branch crossed 90% threshold",
    user: "Finance Bot",
    time: "4h",
    type: "Finance",
    severityText: "High Severity",
    dotColor: "bg-rose-500",
  },
];

/**
 * AUDIT_LOG_DATA — Recent audit timeline entries displayed in the sidebar.
 * Each entry has a description, source info, timestamp, and a severity type
 * that controls the color of the timeline dot.
 */
const AUDIT_LOG_DATA = [
  {
    text: "Approved WO-1023",
    sub: "QA Manager • Branch A",
    time: "10:30 AM",
    type: "success",
  },
  {
    text: "Stock Adj. (-20 Rolls)",
    sub: "Whse Mgr • Branch B",
    time: "09:15 AM",
    type: "warning",
  },
  {
    text: "Created user 'j.santos'",
    sub: "Admin • Branch A",
    time: "Yesterday",
    type: "info",
  },
  {
    text: "Plan #4002 finalized",
    sub: "System • Cebu Plant",
    time: "Yesterday",
    type: "success",
  },
];

/**
 * SECONDARY_STATS — Small summary pills shown below the main KPI cards.
 * Each has a label, count, Tailwind color name, and an icon.
 */
const SECONDARY_STATS = [
  {
    label: "Pending Approvals",
    count: "14 Approvals",
    color: "orange",
    icon: FileCheck,
  },
  {
    label: "Work Orders",
    count: "42 Open",
    color: "violet",
    icon: ClipboardList,
  },
  {
    label: "Inspections",
    count: "9 Priority",
    color: "teal",
    icon: CheckCircle2,
  },
  {
    label: "Inventory Alerts",
    count: "23 Low Stock",
    color: "rose",
    icon: AlertTriangle,
  },
];

/**
 * QUICK_REPORTS — List of report shortcuts displayed in the Quick Reports card.
 */
const QUICK_REPORTS = [
  "Users & Roles Report",
  "Quality Summary",
  "Inventory Summary",
  "Finance Summary",
];

// ==========================================
// SECTION 3: MAIN PAGE COMPONENT
// ==========================================

const SuperAdminDashboard = () => {
  // ------------------------------------------
  // 3A. STATE — Filter & Search for Branch Table
  // ------------------------------------------
  const [isFilterOpen, setIsFilterOpen] = useState(false); // Controls filter dropdown visibility
  const [selectedFilter, setSelectedFilter] = useState("Best Performance"); // Active sort/filter option
  const [searchQuery, setSearchQuery] = useState(""); // Branch search input value

  // ------------------------------------------
  // 3B. DERIVED DATA — Filtered & Sorted Branches
  // ------------------------------------------
  // Filters branches by search query, then sorts by the selected filter option.
  const filteredData = useMemo(() => {
    let data = [...INITIAL_BRANCH_DATA];

    // Filter by search query (branch name)
    if (searchQuery) {
      data = data.filter((branch) =>
        branch.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Helper: parse output strings like "12.4k" into numeric values for sorting
    const parseOutput = (val: string) => {
      if (val.includes("k")) return parseFloat(val) * 1000;
      return parseFloat(val);
    };

    // Sort based on the selected filter
    if (selectedFilter === "Best Performance") {
      data.sort((a, b) => parseOutput(b.output) - parseOutput(a.output));
    } else if (selectedFilter === "Lowest Performance") {
      data.sort((a, b) => parseOutput(a.output) - parseOutput(b.output));
    } else if (selectedFilter === "Arrange Alphabetically") {
      data.sort((a, b) => a.name.localeCompare(b.name));
    }

    return data;
  }, [searchQuery, selectedFilter]);

  // ==========================================
  // SECTION 4: JSX RENDER
  // ==========================================
  return (
    <MainLayout>
      <div className="space-y-6 pb-10">
        {/* ---- 4A. PAGE HEADER ---- */}
        {/* Title, welcome message, and online status indicator */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-slate-500 text-xs mt-1 font-medium">
              Welcome back! Here's what's happening today.
            </p>
          </div>
          {/* Online status badge */}
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

        {/* ---- 4B. KPI STATS GRID ---- */}
        {/* Primary dashboard cards: Total Users, Active Branches, System Health, Budget */}
        <section
          aria-label="Key Performance Indicators"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Primary Stats — uses DashboardStatsCard from components/ui */}
          <DashboardStatsCard
            title="Total Users"
            value="2,543"
            icon={Users}
            colorTheme="indigo"
            trend="+12%"
            trendUp={true}
            subText="140 new this week"
          />
          <DashboardStatsCard
            title="Active Branches"
            value="8"
            icon={Building}
            colorTheme="blue"
            trend="100%"
            trendUp={true}
            subText="All systems operational"
          />
          <DashboardStatsCard
            title="System Health"
            value="99.9%"
            icon={Activity}
            colorTheme="emerald"
            trend="Stable"
            trendUp={true}
            subText="Response time: 45ms"
          />
          <DashboardStatsCard
            title="Budget Utilization"
            value="72%"
            icon={Wallet}
            colorTheme="cyan"
            trend="On Track"
            trendUp={true}
            subText="₱4.2M remaining"
          />

          {/* ---- 4C. SECONDARY STATS ROW ---- */}
          {/* Smaller summary pills for Approvals, Work Orders, Inspections, Inventory */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {SECONDARY_STATS.map((stat, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3 bg-${stat.color}-50 rounded-2xl border border-${stat.color}-100`}
                role="group"
                aria-label={`${stat.label}: ${stat.count}`}
              >
                {/* Icon wrapper */}
                <div
                  className={`p-1.5 bg-white rounded-xl text-${stat.color}-600 shadow-sm`}
                  aria-hidden="true"
                >
                  <stat.icon size={16} />
                </div>
                {/* Label & Count */}
                <div>
                  <p
                    className={`text-[10px] text-${stat.color}-600 font-bold uppercase tracking-wider`}
                  >
                    {stat.label}
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {stat.count}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---- 4D. MAIN CONTENT GRID ---- */}
        {/* Two-column layout: Left = Alerts + Table, Right = Reports + Audit Log */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* =============================== */}
          {/* LEFT COLUMN (spans 2 cols on xl) */}
          {/* =============================== */}
          <div className="xl:col-span-2 space-y-6">
            {/* ---- 4E. PRIORITY ALERTS PANEL ---- */}
            {/* Displays critical alerts that require admin attention */}
            <Card className="overflow-hidden">
              {/* Panel Header */}
              <div className="flex justify-between items-center p-5 pb-0">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <div
                    className="p-1 bg-red-100 text-red-600 rounded-lg"
                    aria-hidden="true"
                  >
                    <AlertOctagon size={16} />
                  </div>
                  Requires Attention
                  <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                    {ALERT_DATA.length}
                  </span>
                </h3>
                <button className="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors">
                  Dismiss All
                </button>
              </div>

              {/* Alert Table */}
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-t border-slate-100 bg-slate-50/50 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                      <th className="px-5 py-3">Alert</th>
                      <th className="px-5 py-3 whitespace-nowrap">Severity</th>
                      <th className="px-5 py-3 whitespace-nowrap">Type</th>
                      <th className="px-5 py-3 hidden md:table-cell whitespace-nowrap">Source</th>
                      <th className="px-5 py-3 text-left whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {ALERT_DATA.map((alert, idx) => (
                      <tr
                        key={idx}
                        className="group hover:bg-slate-50/80 transition-colors"
                        role="alert"
                      >
                        {/* Alert info */}
                        <td className="px-5 py-3">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div
                              className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${alert.dotColor}`}
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
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                            alert.dotColor === "bg-red-500"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : alert.dotColor === "bg-rose-500"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-orange-50 text-orange-700 border-orange-200"
                          }`}>
                            {alert.severityText.replace(" Severity", "")}
                          </span>
                        </td>

                        {/* Type badge */}
                        <td className="px-5 py-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded-md">
                            {alert.type}
                          </span>
                        </td>

                        {/* Source */}
                        <td className="px-5 py-3 hidden md:table-cell">
                          <span className="text-[10px] text-slate-400">
                            {alert.user} &bull; {alert.time} ago
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-5 py-3 text-left">
                          <button
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all whitespace-nowrap text-left"
                            aria-label={`Review alert: ${alert.title}`}
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* ---- 4F. BRANCH PERFORMANCE TABLE ---- */}
            {/* Sortable & searchable table showing output, rejection, and budget per branch */}
            <Card className="p-5">
              {/* Table Header: Title + Search + Filter */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h3 className="font-bold text-sm text-slate-800">
                  Branch Performance
                </h3>

                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  {/* Search Input — filters branches by name */}
                  <div className="relative group flex-1 sm:flex-none">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors"
                      size={14}
                    />
                    <input
                      type="text"
                      placeholder="Search..."
                      aria-label="Search branches by name"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-40 pl-9 pr-4 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-full outline-none focus:bg-white focus:ring-2 focus:ring-slate-300 focus:border-transparent transition-all placeholder:text-slate-400"
                    />
                  </div>

                  {/* Filter Dropdown — sort by performance or alphabetically */}
                  <div className="relative">
                    <button
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      aria-expanded={isFilterOpen}
                      aria-label="Toggle sort options"
                      className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border rounded-full transition-all ${
                        isFilterOpen
                          ? "bg-slate-900 text-white border-slate-900 shadow-md"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <Filter size={14} />
                      <span className="hidden sm:inline">
                        {selectedFilter === "Best Performance"
                          ? "Filter"
                          : selectedFilter}
                      </span>
                      <span className="sm:hidden">Filter</span>
                      <ChevronDown
                        size={12}
                        className={`transition-transform duration-200 ${
                          isFilterOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Dropdown Options */}
                    {isFilterOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-20">
                        <div className="p-1">
                          {[
                            "Best Performance",
                            "Lowest Performance",
                            "Arrange Alphabetically",
                          ].map((option) => (
                            <button
                              key={option}
                              onClick={() => {
                                setSelectedFilter(option);
                                setIsFilterOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
                                selectedFilter === option
                                  ? "bg-indigo-50 text-indigo-600"
                                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Table Content — scrollable on small screens */}
              <div className="overflow-x-auto min-h-[250px]">
                <table className="w-full text-xs text-left">
                  <caption className="sr-only">
                    Table showing performance metrics for filtered branches
                  </caption>

                  {/* Table Head */}
                  <thead className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100">
                    <tr>
                      <th scope="col" className="px-3 py-3 pl-0">
                        Branch
                      </th>
                      <th scope="col" className="px-3 py-3">
                        Output
                      </th>
                      <th scope="col" className="px-3 py-3">
                        Rejection
                      </th>
                      <th scope="col" className="px-3 py-3">
                        Utilization
                      </th>
                      <th scope="col" className="px-3 py-3 text-left">
                        Action
                      </th>
                    </tr>
                  </thead>

                  {/* Table Body — maps branches or shows empty state */}
                  <tbody className="divide-y divide-slate-50">
                    {filteredData.length > 0 ? (
                      filteredData.map((row, idx) => (
                        <tr
                          key={idx}
                          className="group hover:bg-slate-50/80 transition-colors"
                        >
                          {/* Branch Name with Avatar Initial */}
                          <th
                            scope="row"
                            className="px-3 py-3 pl-0 font-normal"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[10px] shrink-0"
                                aria-hidden="true"
                              >
                                {row.name.charAt(0)}
                              </div>
                              <span className="font-semibold text-slate-700 whitespace-nowrap">
                                {row.name}
                              </span>
                            </div>
                          </th>

                          {/* Output Volume */}
                          <td className="px-3 py-3 font-medium text-slate-600">
                            {row.output}
                          </td>

                          {/* Rejection Rate — red if > 2%, green otherwise */}
                          <td className="px-3 py-3">
                            <span
                              className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                                parseFloat(row.reject) > 2
                                  ? "bg-red-50 text-red-600"
                                  : "bg-emerald-50 text-emerald-600"
                              }`}
                              aria-label={`Rejection rate: ${row.reject}`}
                            >
                              {row.reject}
                            </span>
                          </td>

                          {/* Budget Utilization — progress bar */}
                          <td className="px-3 py-3 w-32">
                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                                <span>Budget</span>
                                <span>{row.budget}%</span>
                              </div>
                              {/* Accessible Progress Bar */}
                              <div
                                className="w-full h-1 bg-slate-100 rounded-full overflow-hidden"
                                role="progressbar"
                                aria-valuenow={row.budget || 0}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label={`Budget utilization for ${row.name}`}
                              >
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    row.budget > 75
                                      ? "bg-gradient-to-r from-orange-400 to-red-500"
                                      : "bg-gradient-to-r from-emerald-400 to-teal-500"
                                  }`}
                                  style={{ width: `${row.budget}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>

                          {/* Action — More Options Button */}
                          <td className="px-3 py-3 text-left">
                            <button
                              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              aria-label={`More options for ${row.name}`}
                            >
                              <MoreHorizontal size={14} aria-hidden="true" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      /* Empty State — no branches match the search */
                      <tr>
                        <td
                          colSpan={5}
                          className="px-3 py-10 text-center text-slate-400"
                        >
                          <p>No branches found matching "{searchQuery}"</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* =============================== */}
          {/* RIGHT COLUMN — Sidebar Cards    */}
          {/* =============================== */}
          <aside
            className="space-y-6"
            aria-label="Sidebar: Reports and Audit Log"
          >
            {/* ---- 4G. QUICK REPORTS CARD ---- */}
            {/* Dark-themed card with shortcut links to generate common reports */}
            <div className="relative overflow-hidden bg-slate-900 p-5 rounded-2xl shadow-xl text-white">
              {/* Decorative Background Glows */}
              <div
                className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20"
                aria-hidden="true"
              ></div>
              <div
                className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20"
                aria-hidden="true"
              ></div>

              {/* Section Title */}
              <h3 className="relative font-bold text-sm mb-4 flex items-center gap-2">
                <TrendingUp
                  size={16}
                  className="text-indigo-400"
                  aria-hidden="true"
                />
                Quick Reports
              </h3>

              {/* Report Link Buttons */}
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

            {/* ---- 4H. AUDIT LOG (Table Layout) ---- */}
            {/* Displays recent system actions in a clean table format */}
            <Card className="overflow-hidden h-fit">
              {/* Section Title */}
              <div className="flex justify-between items-center p-5 pb-0">
                <h3 className="font-bold text-sm text-slate-800">
                  Audit Highlights
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">
                  {AUDIT_LOG_DATA.length} events
                </span>
              </div>

              {/* Audit Table */}
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
                    {AUDIT_LOG_DATA.map((item, idx) => (
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
                              ? "Done"
                              : item.type === "warning"
                                ? "Warn"
                                : "Info"}
                          </span>
                        </td>

                        {/* Time */}
                        <td className="px-5 py-3 text-left">
                          <time
                            className="text-[10px] text-slate-400 font-medium"
                            dateTime={item.time}
                          >
                            {item.time}
                          </time>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* View Full Log Button */}
              <div className="p-5 pt-3">
                <button className="w-full py-2.5 text-xs font-semibold text-slate-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all border border-indigo-100 hover:shadow-sm">
                  View Full Audit Log
                </button>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
};

export default SuperAdminDashboard;
