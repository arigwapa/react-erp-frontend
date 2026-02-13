// ==========================================
// AdminReportsCenterPage.tsx — Branch Reports Center
// View operational and performance reports for this branch.
// Auto-filtered to branch scope — no cross-branch analytics.
//
// 5 Report Categories: PLM, Production, Quality, Warehouse, Finance
// Each category has specific sub-reports shown as glass analytics cards.
// Global filters: Date Range + Module selector (branch locked).
//
// Reusable UI: TabBar, TableToolbar, PageModal, Card, StatsCard,
//   SecondaryButton, PrimaryButton, Toast, IconSelect
// ==========================================

import { useState, useMemo } from "react";

// --- Layout ---
import AdminLayout from "../../layout/AdminLayout";

// --- Icons ---
import {
  BarChart3,
  Calendar,
  Download,
  Layers,
  Factory,
  ShieldCheck,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  FileText,
  Eye,
  Clock,
  Lock,
  Info,
  Database,
  LayoutDashboard,
  FileBarChart,
  Filter,
  ClipboardCheck,
  AlertTriangle,
  Wrench,
  CheckCircle,
  Hash,
  User,
  PieChart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// --- Reusable UI Components ---
import { Card } from "../../components/ui/Card";
import StatsCard from "../../components/ui/StatsCard";
import TabBar from "../../components/ui/TabBar";
import type { Tab } from "../../components/ui/TabBar";
import SecondaryButton from "../../components/ui/SecondaryButton";
import PrimaryButton from "../../components/ui/PrimaryButton";
import PageModal from "../../components/ui/PageModal";
import Toast from "../../components/ui/Toast";

// ==========================================
// TYPES
// ==========================================

type ModuleType = "All" | "PLM" | "Production" | "Quality" | "Warehouse" | "Finance";
type DateRange = "last-7" | "last-30" | "last-90" | "ytd";

interface ReportCard {
  id: string;
  module: Exclude<ModuleType, "All">;
  title: string;
  description: string;
  kpiLabel: string;
  kpiValue: string;
  trend: "up" | "down" | "neutral";
  trendValue: string;
  chartType: "bar" | "line" | "pie";
  lastGenerated: string;
  insights: string[];
}

// ==========================================
// MOCK DATA — Branch-scoped report cards
// ==========================================

const REPORT_CARDS: ReportCard[] = [
  // --- PLM Reports ---
  { id: "PLM-01", module: "PLM", title: "Products by Status", description: "Distribution of products across Draft, Under Review, and Released statuses.", kpiLabel: "Released Products", kpiValue: "43 / 52", trend: "up", trendValue: "+5 this month", chartType: "pie", lastGenerated: "Feb 12, 2026", insights: ["43 products fully released", "6 products under review", "3 products in draft — missing BOM approval"] },
  { id: "PLM-02", module: "PLM", title: "Revision Frequency", description: "Average number of revisions per product before final release.", kpiLabel: "Avg Revisions", kpiValue: "2.4", trend: "down", trendValue: "-0.3 vs last month", chartType: "line", lastGenerated: "Feb 12, 2026", insights: ["Revision frequency decreasing — fewer rework cycles", "Fabric products average 3.1 revisions", "Accessories average 1.8 revisions"] },
  { id: "PLM-03", module: "PLM", title: "Released to Production", description: "Products approved and released to the production module this period.", kpiLabel: "Released This Month", kpiValue: "12", trend: "up", trendValue: "+3 vs last month", chartType: "bar", lastGenerated: "Feb 11, 2026", insights: ["12 products released to production in Feb", "Fastest release: Cotton T-Shirt (2 days)", "Slowest release: Luxury Bed Cover (14 days)"] },

  // --- Production Reports ---
  { id: "PROD-01", module: "Production", title: "Work Order Completion Rate", description: "Percentage of work orders completed on time vs scheduled.", kpiLabel: "Completion Rate", kpiValue: "94.5%", trend: "up", trendValue: "+1.2% vs last week", chartType: "line", lastGenerated: "Feb 12, 2026", insights: ["67 of 71 work orders completed on schedule", "Average cycle time improved by 0.8 days", "2 delayed orders pending resolution"] },
  { id: "PROD-02", module: "Production", title: "Delayed Production Count", description: "Active production runs behind schedule with root cause breakdown.", kpiLabel: "Delayed Orders", kpiValue: "4", trend: "down", trendValue: "-2 vs last week", chartType: "bar", lastGenerated: "Feb 12, 2026", insights: ["4 work orders currently delayed", "Primary cause: Material shortage (2 orders)", "Secondary cause: Equipment downtime (1 order)", "1 order delayed by QA hold"] },
  { id: "PROD-03", module: "Production", title: "Output vs Planned", description: "Actual production output compared to planned quantities.", kpiLabel: "Output Ratio", kpiValue: "91%", trend: "up", trendValue: "+3% vs last month", chartType: "bar", lastGenerated: "Feb 11, 2026", insights: ["Overall output at 91% of planned quantity", "Weaving department: 95% output", "Cutting department: 88% output — staffing issue"] },

  // --- Quality Reports (Core) ---
  { id: "QA-01", module: "Quality", title: "Approval vs Rejection Rate", description: "First-pass yield across all inspection points and defect categories.", kpiLabel: "Pass Rate", kpiValue: "88%", trend: "neutral", trendValue: "Stable for 3 periods", chartType: "pie", lastGenerated: "Feb 12, 2026", insights: ["First-pass yield stable at 88%", "Stitching defects account for 42% of rejections", "Color consistency defects trending down"] },
  { id: "QA-02", module: "Quality", title: "Defect Trends per Product", description: "Defect occurrence patterns across product lines over time.", kpiLabel: "Defect Rate", kpiValue: "12%", trend: "down", trendValue: "-2% vs last month", chartType: "line", lastGenerated: "Feb 12, 2026", insights: ["Overall defect rate decreased to 12%", "Cotton products: 8% defect rate (improved)", "Polyester blends: 18% defect rate (needs attention)", "CAPA actions reduced repeat defects by 35%"] },
  { id: "QA-03", module: "Quality", title: "Open CAPA Count", description: "Active corrective and preventive actions requiring attention.", kpiLabel: "Open CAPAs", kpiValue: "7", trend: "down", trendValue: "-3 closed this week", chartType: "bar", lastGenerated: "Feb 12, 2026", insights: ["7 CAPAs currently open", "3 CAPAs closed this week", "Oldest open CAPA: 18 days (dye lot variance)", "2 CAPAs in progress — equipment calibration"] },
  { id: "QA-04", module: "Quality", title: "Inspection Turnaround Time", description: "Average time from inspection start to result submission.", kpiLabel: "Avg Turnaround", kpiValue: "1.4 days", trend: "up", trendValue: "-0.3 days improvement", chartType: "line", lastGenerated: "Feb 11, 2026", insights: ["Average turnaround improved to 1.4 days", "Fastest: Accessory inspections (0.5 days)", "Slowest: Fabric QC (2.1 days)", "3 inspectors above 95% individual pass rate"] },

  // --- Warehouse Reports ---
  { id: "WH-01", module: "Warehouse", title: "Inventory Valuation", description: "Total value of raw materials and finished goods by category.", kpiLabel: "Total Value", kpiValue: "₱1.2M", trend: "up", trendValue: "+₱50K vs last month", chartType: "pie", lastGenerated: "Feb 12, 2026", insights: ["Raw materials: ₱720K (60% of total)", "Finished goods: ₱480K (40% of total)", "Top category by value: Fabrics (₱450K)"] },
  { id: "WH-02", module: "Warehouse", title: "Low-Stock Frequency", description: "How often items fall below minimum stock levels.", kpiLabel: "Low Stock Items", kpiValue: "22", trend: "down", trendValue: "-5 restocked this week", chartType: "bar", lastGenerated: "Feb 12, 2026", insights: ["22 items currently below minimum level", "5 items restocked this week", "Critical: Cotton Thread Spool — 4 days until stockout", "Replenishment orders placed for 15 items"] },
  { id: "WH-03", module: "Warehouse", title: "Stock Adjustment History", description: "Summary of inventory adjustments with approval status.", kpiLabel: "Adjustments", kpiValue: "18", trend: "neutral", trendValue: "Normal volume", chartType: "bar", lastGenerated: "Feb 11, 2026", insights: ["18 adjustments this month", "14 approved, 2 rejected, 2 pending", "Most common reason: Physical count correction", "Total adjustment value: ₱12,400"] },

  // --- Finance Reports ---
  { id: "FIN-01", module: "Finance", title: "Budget vs Actual Usage", description: "Overall spending utilization against allocated budgets by category.", kpiLabel: "Utilization", kpiValue: "83%", trend: "up", trendValue: "On track", chartType: "bar", lastGenerated: "Feb 12, 2026", insights: ["Overall budget utilization: 83%", "Materials: 82% utilized", "Marketing: 107% — over budget", "R&D: 63% — well under budget"] },
  { id: "FIN-02", module: "Finance", title: "Product Costing Summary", description: "Aggregated cost breakdown across all products: materials, labor, QA.", kpiLabel: "Avg Cost/Unit", kpiValue: "₱189", trend: "down", trendValue: "-₱12 vs last month", chartType: "pie", lastGenerated: "Feb 11, 2026", insights: ["Average cost per unit: ₱189", "Materials: 58% of total cost", "Labor: 32% of total cost", "QA defects: 10% of total cost"] },
  { id: "FIN-03", module: "Finance", title: "Profit Margin per Product", description: "Profitability analysis per product line in the branch.", kpiLabel: "Avg Margin", kpiValue: "23%", trend: "up", trendValue: "+2% vs last month", chartType: "line", lastGenerated: "Feb 10, 2026", insights: ["Average profit margin: 23%", "Highest: Classic Weave Blanket (31%)", "Lowest: Eco Fiber Mat (9%) — review needed", "3 products above 25% target margin"] },
];

// ==========================================
// CONSTANTS
// ==========================================

const REPORT_TABS: Tab[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "module-reports", label: "Module Reports", icon: FileBarChart },
  { id: "trends", label: "Trends", icon: TrendingUp },
];

const MODULE_FILTERS: { value: ModuleType; label: string; icon: LucideIcon }[] = [
  { value: "All", label: "All Modules", icon: LayoutDashboard },
  { value: "PLM", label: "PLM", icon: Layers },
  { value: "Production", label: "Production", icon: Factory },
  { value: "Quality", label: "Quality", icon: ShieldCheck },
  { value: "Warehouse", label: "Warehouse", icon: Package },
  { value: "Finance", label: "Finance", icon: DollarSign },
];

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "last-7", label: "Last 7 days" },
  { value: "last-30", label: "Last 30 days" },
  { value: "last-90", label: "Last 90 days" },
  { value: "ytd", label: "Year to Date" },
];

// ==========================================
// HELPERS
// ==========================================

const getCategoryTheme = (mod: string) => {
  switch (mod) {
    case "PLM": return { color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", icon: Layers };
    case "Production": return { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", icon: Factory };
    case "Quality": return { color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", icon: ShieldCheck };
    case "Warehouse": return { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: Package };
    case "Finance": return { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: DollarSign };
    default: return { color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", icon: FileText };
  }
};

/** Mini chart placeholder */
const MiniChart = ({ type, colorClass }: { type: "bar" | "line" | "pie"; colorClass: string }) => {
  if (type === "bar") return (<div className="flex items-end gap-0.5 h-8 w-16" aria-hidden="true"><div className={`w-2.5 rounded-t ${colorClass} opacity-30`} style={{ height: "35%" }} /><div className={`w-2.5 rounded-t ${colorClass} opacity-50`} style={{ height: "65%" }} /><div className={`w-2.5 rounded-t ${colorClass} opacity-70`} style={{ height: "45%" }} /><div className={`w-2.5 rounded-t ${colorClass} opacity-90`} style={{ height: "85%" }} /></div>);
  if (type === "line") return (<svg width="64" height="32" viewBox="0 0 64 32" className={colorClass} fill="none" aria-hidden="true"><path d="M2 28L18 16L32 22L62 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
  return (<div className={`h-8 w-8 rounded-full border-[3px] border-current ${colorClass} opacity-50`} style={{ borderRightColor: "transparent" }} aria-hidden="true" />);
};

// ==========================================
// OVERVIEW SUMMARIES (per module)
// ==========================================

interface ModuleOverview {
  module: Exclude<ModuleType, "All">;
  title: string;
  icon: LucideIcon;
  metrics: { label: string; value: string; trend: "up" | "down" | "neutral" }[];
}

const MODULE_OVERVIEWS: ModuleOverview[] = [
  { module: "PLM", title: "Product Lifecycle", icon: Layers, metrics: [{ label: "Product Readiness", value: "82%", trend: "up" }, { label: "Avg Revisions", value: "2.4", trend: "down" }, { label: "Released This Month", value: "12", trend: "up" }] },
  { module: "Production", title: "Production", icon: Factory, metrics: [{ label: "WO Completion", value: "94.5%", trend: "up" }, { label: "Delayed Orders", value: "4", trend: "down" }, { label: "Output Ratio", value: "91%", trend: "up" }] },
  { module: "Quality", title: "Quality Assurance", icon: ShieldCheck, metrics: [{ label: "Pass Rate", value: "88%", trend: "neutral" }, { label: "Defect Rate", value: "12%", trend: "down" }, { label: "Open CAPAs", value: "7", trend: "down" }] },
  { module: "Warehouse", title: "Warehouse", icon: Package, metrics: [{ label: "Inventory Value", value: "₱1.2M", trend: "up" }, { label: "Low Stock Items", value: "22", trend: "down" }, { label: "Adjustments", value: "18", trend: "neutral" }] },
  { module: "Finance", title: "Finance", icon: DollarSign, metrics: [{ label: "Budget Usage", value: "83%", trend: "up" }, { label: "Avg Cost/Unit", value: "₱189", trend: "down" }, { label: "Profit Margin", value: "23%", trend: "up" }] },
];

// ==========================================
// TREND DATA
// ==========================================

interface TrendItem {
  id: string;
  title: string;
  value: string;
  trend: "up" | "down" | "neutral";
  trendValue: string;
  module: Exclude<ModuleType, "All">;
  icon: LucideIcon;
}

const TREND_DATA: TrendItem[] = [
  { id: "t1", title: "Production Completion Trend", value: "94.5%", trend: "up", trendValue: "+1.2% vs last week", module: "Production", icon: Factory },
  { id: "t2", title: "QA Rejection Trend", value: "12%", trend: "down", trendValue: "-2% vs last month", module: "Quality", icon: ShieldCheck },
  { id: "t3", title: "Inventory Usage Trend", value: "4.2x", trend: "up", trendValue: "+0.3 turnover", module: "Warehouse", icon: Package },
  { id: "t4", title: "Budget Utilization Trend", value: "83%", trend: "up", trendValue: "On track", module: "Finance", icon: DollarSign },
  { id: "t5", title: "Product Release Velocity", value: "12/mo", trend: "up", trendValue: "+3 vs last month", module: "PLM", icon: Layers },
  { id: "t6", title: "CAPA Resolution Rate", value: "75%", trend: "up", trendValue: "+10% improvement", module: "Quality", icon: Wrench },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

const AdminReportsCenterPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [moduleFilter, setModuleFilter] = useState<ModuleType>("All");
  const [dateRange, setDateRange] = useState<DateRange>("last-30");
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateFilterOpen, setDateFilterOpen] = useState(false);

  const [previewReport, setPreviewReport] = useState<ReportCard | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // --- Filtered reports ---
  const filteredReports = useMemo(() => {
    if (moduleFilter === "All") return REPORT_CARDS;
    return REPORT_CARDS.filter((r) => r.module === moduleFilter);
  }, [moduleFilter]);

  const filteredTrends = useMemo(() => {
    if (moduleFilter === "All") return TREND_DATA;
    return TREND_DATA.filter((t) => t.module === moduleFilter);
  }, [moduleFilter]);

  const filteredOverviews = useMemo(() => {
    if (moduleFilter === "All") return MODULE_OVERVIEWS;
    return MODULE_OVERVIEWS.filter((o) => o.module === moduleFilter);
  }, [moduleFilter]);

  const handleDownload = (report: ReportCard) => {
    setToast({ message: `Exporting ${report.title}...`, type: "success" });
    setPreviewReport(null);
  };

  return (
    <>
      <AdminLayout>
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
          {/* ---- PAGE HEADER ---- */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Reports Center</h1>
              <p className="text-xs font-medium text-slate-500 mt-1">View operational and performance reports for this branch.</p>
            </div>
            <div className="flex items-center gap-3">
              <SecondaryButton onClick={() => setToast({ message: "Exporting all reports...", type: "success" })} icon={Download}>Export All</SecondaryButton>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold"><Lock size={12} />Branch: Manila (Auto-filtered)</div>
            </div>
          </div>

          {/* ---- GLOBAL FILTERS ---- */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><Filter size={14} /> Filters:</div>
              {/* Module Filter */}
              <div className="relative">
                <button onClick={() => { setFilterOpen(!filterOpen); setDateFilterOpen(false); }} className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${moduleFilter !== "All" ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                  {(() => { const f = MODULE_FILTERS.find((m) => m.value === moduleFilter); const FIcon = f?.icon || LayoutDashboard; return <FIcon size={12} />; })()}
                  {MODULE_FILTERS.find((m) => m.value === moduleFilter)?.label}
                </button>
                {filterOpen && (
                  <div className="absolute z-50 mt-1 w-44 bg-white rounded-xl border border-slate-100 shadow-xl overflow-hidden">
                    <div className="p-1.5">{MODULE_FILTERS.map((m) => { const MIcon = m.icon; return (<button key={m.value} onClick={() => { setModuleFilter(m.value); setFilterOpen(false); }} className={`w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${moduleFilter === m.value ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}><MIcon size={12} /> {m.label}</button>); })}</div>
                  </div>
                )}
              </div>
              {/* Date Range Filter */}
              <div className="relative">
                <button onClick={() => { setDateFilterOpen(!dateFilterOpen); setFilterOpen(false); }} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl border bg-white text-slate-600 border-slate-200 hover:bg-slate-50 transition-all">
                  <Calendar size={12} />
                  {DATE_RANGE_OPTIONS.find((d) => d.value === dateRange)?.label}
                </button>
                {dateFilterOpen && (
                  <div className="absolute z-50 mt-1 w-40 bg-white rounded-xl border border-slate-100 shadow-xl overflow-hidden">
                    <div className="p-1.5">{DATE_RANGE_OPTIONS.map((d) => (<button key={d.value} onClick={() => { setDateRange(d.value); setDateFilterOpen(false); }} className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${dateRange === d.value ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>{d.label}</button>))}</div>
                  </div>
                )}
              </div>
              {/* Branch locked notice */}
              <div className="flex items-center gap-1.5 ml-auto text-[10px] font-medium text-slate-400"><Lock size={10} /> Branch filter is locked to your assigned branch.</div>
            </div>
          </Card>

          {/* ---- TAB BAR ---- */}
          <TabBar tabs={REPORT_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* ============================================================
              TAB 1: OVERVIEW — Module summary cards
              ============================================================ */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredOverviews.map((summary) => {
                const theme = getCategoryTheme(summary.module);
                const Icon = summary.icon;
                return (
                  <Card key={summary.module} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                    <div className="p-5 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${theme.bg} ${theme.color}`}><Icon size={20} /></div>
                          <div><span className={`text-[10px] font-bold uppercase tracking-wider ${theme.color}`}>{summary.module}</span><h3 className="text-sm font-bold text-slate-900 leading-tight">{summary.title}</h3></div>
                        </div>
                      </div>
                      <div className="space-y-2.5 mb-4 flex-1">
                        {summary.metrics.map((m, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">{m.label}</span>
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1">{m.value}{m.trend === "up" ? <TrendingUp size={11} className="text-emerald-500" /> : m.trend === "down" ? <TrendingDown size={11} className="text-rose-500" /> : <Activity size={11} className="text-slate-400" />}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-3 border-t border-slate-100">
                        <button onClick={() => { setActiveTab("module-reports"); setModuleFilter(summary.module); }} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"><Eye size={13} /> View Reports</button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* ============================================================
              TAB 2: MODULE REPORTS — Glass analytics cards
              ============================================================ */}
          {activeTab === "module-reports" && (
            <>
              {moduleFilter !== "All" && (
                <div className="flex items-center gap-2 text-xs text-slate-500"><Info size={12} /> Showing {filteredReports.length} reports for <span className="font-bold text-slate-700">{moduleFilter}</span> module. <button onClick={() => setModuleFilter("All")} className="text-indigo-600 font-semibold hover:underline">Show all</button></div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredReports.map((report) => {
                  const theme = getCategoryTheme(report.module);
                  const Icon = theme.icon;
                  return (
                    <Card key={report.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200 group">
                      <div className="p-5 flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${theme.bg} ${theme.color}`}><Icon size={18} /></div>
                          <div className="min-w-0 flex-1">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.color}`}>{report.module}</span>
                            <h3 className="text-sm font-bold text-slate-900 leading-tight truncate">{report.title}</h3>
                          </div>
                        </div>
                        {/* Description */}
                        <p className="text-[11px] text-slate-500 leading-relaxed mb-4 line-clamp-2 flex-1">{report.description}</p>
                        {/* KPI + Chart */}
                        <div className={`flex items-center justify-between p-3 rounded-xl ${theme.bg} border ${theme.border} mb-4`}>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{report.kpiLabel}</span>
                            <p className="text-xl font-extrabold text-slate-900 mt-0.5">{report.kpiValue}</p>
                            <div className={`flex items-center gap-1 text-[10px] font-bold mt-0.5 ${report.trend === "up" ? "text-emerald-600" : report.trend === "down" ? "text-rose-600" : "text-slate-500"}`}>
                              {report.trend === "up" ? <TrendingUp size={10} /> : report.trend === "down" ? <TrendingDown size={10} /> : <Activity size={10} />}
                              {report.trendValue}
                            </div>
                          </div>
                          <div className={`p-2 rounded-lg ${theme.bg}`}><MiniChart type={report.chartType} colorClass={theme.color} /></div>
                        </div>
                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400"><Clock size={10} /> {report.lastGenerated}</div>
                          <button onClick={() => setPreviewReport(report)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"><Eye size={12} /> View Details</button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
              {filteredReports.length === 0 && (
                <Card className="p-16 text-center"><div className="flex flex-col items-center gap-2"><FileBarChart size={40} className="text-slate-300" /><p className="text-sm font-medium text-slate-500">No reports found for this filter.</p><button onClick={() => setModuleFilter("All")} className="text-xs font-semibold text-indigo-600 hover:underline mt-1">Reset filter</button></div></Card>
              )}
            </>
          )}

          {/* ============================================================
              TAB 3: TRENDS — KPI trend cards
              ============================================================ */}
          {activeTab === "trends" && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredTrends.map((trend) => {
                const theme = getCategoryTheme(trend.module);
                const Icon = trend.icon;
                return (
                  <Card key={trend.id} className="p-5 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${theme.bg} ${theme.color}`}><Icon size={18} /></div>
                      <div className="min-w-0 flex-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.color}`}>{trend.module}</span>
                        <h3 className="text-xs font-bold text-slate-900 leading-tight mb-1">{trend.title}</h3>
                        <p className="text-2xl font-extrabold text-slate-800">{trend.value}</p>
                        <div className={`flex items-center gap-1 text-[11px] font-bold mt-1 ${trend.trend === "up" ? "text-emerald-600" : trend.trend === "down" ? "text-rose-600" : "text-slate-500"}`}>
                          {trend.trend === "up" ? <TrendingUp size={11} /> : trend.trend === "down" ? <TrendingDown size={11} /> : <Activity size={11} />}
                          {trend.trendValue}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
              {filteredTrends.length === 0 && (
                <Card className="p-16 text-center col-span-full"><div className="flex flex-col items-center gap-2"><TrendingUp size={40} className="text-slate-300" /><p className="text-sm font-medium text-slate-500">No trends found for this filter.</p></div></Card>
              )}
            </div>
          )}
        </div>
      </AdminLayout>

      {/* ==================================================================
          REPORT DETAIL MODAL
          ================================================================== */}
      {previewReport && (() => {
        const theme = getCategoryTheme(previewReport.module);
        const Icon = theme.icon;
        return (
          <PageModal isOpen={!!previewReport} onClose={() => setPreviewReport(null)} title={previewReport.title} badges={<span className={`inline-flex items-center gap-1 whitespace-nowrap text-left.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${theme.bg} ${theme.color} border ${theme.border}`}><Icon size={11} /> {previewReport.module}</span>} subtitle={<>{previewReport.id} · Branch Scope · {previewReport.lastGenerated}</>} maxWidth="max-w-lg" footer={<div className="flex justify-between items-center w-full"><SecondaryButton onClick={() => setPreviewReport(null)}>Close</SecondaryButton><PrimaryButton onClick={() => handleDownload(previewReport)} className="!w-auto !py-2.5 !px-5 !text-xs !rounded-full"><Download size={14} /> Export Report</PrimaryButton></div>}>
            {/* Overview */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-2"><Info size={13} className="text-slate-400" /> Overview</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{previewReport.description}</p>
            </div>
            {/* KPI highlight */}
            <div className={`flex items-center justify-between p-4 rounded-xl ${theme.bg} border ${theme.border}`}>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{previewReport.kpiLabel}</span>
                <p className="text-3xl font-extrabold text-slate-900 mt-1">{previewReport.kpiValue}</p>
                <div className={`flex items-center gap-1 text-xs font-bold mt-1 ${previewReport.trend === "up" ? "text-emerald-600" : previewReport.trend === "down" ? "text-rose-600" : "text-slate-500"}`}>
                  {previewReport.trend === "up" ? <TrendingUp size={12} /> : previewReport.trend === "down" ? <TrendingDown size={12} /> : <Activity size={12} />}
                  {previewReport.trendValue}
                </div>
              </div>
              <div className={`p-3 rounded-xl ${theme.bg}`}><MiniChart type={previewReport.chartType} colorClass={theme.color} /></div>
            </div>
            {/* Key Insights */}
            {previewReport.insights.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3"><Database size={13} className="text-slate-400" /> Key Insights</h4>
                <div className="space-y-2">
                  {previewReport.insights.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 bg-white border border-slate-100 rounded-xl px-3.5 py-2.5">
                      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5"><span className="text-[9px] font-bold text-slate-500">{idx + 1}</span></div>
                      <p className="text-xs text-slate-600 leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </PageModal>
        );
      })()}

      {/* ---- TOAST ---- */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
};

export default AdminReportsCenterPage;
