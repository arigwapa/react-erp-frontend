// ==========================================
// ProductionReportsPage.tsx
// Production Manager — Production Reports
// Shows: Completion rate, delay analysis,
// output vs planned, efficiency trend.
// Filters: date range, product, status.
// Export: PDF / Excel (branch only).
// ==========================================

import React, { useState } from "react";
import ProductionLayout from "../../layout/ProductionLayout";
import ReportCard from "../../components/ui/ReportCard";
import StatsCard from "../../components/ui/StatsCard";
import IconSelect from "../../components/ui/IconSelect";
import Toast from "../../components/ui/Toast";
import ProgressBar from "../../components/ui/ProgressBar";
import { StatusBadge } from "../../components/ui/StatusBadge";
import SecondaryButton from "../../components/ui/SecondaryButton";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Download,
  Lock,
  Activity,
} from "lucide-react";

// ------------------------------------------
// Filter options
// ------------------------------------------
const dateRangeOptions = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "ytd", label: "Year to Date" },
];

const productOptions = [
  { value: "", label: "All Products" },
  { value: "Basic Tee", label: "Basic Tee" },
  { value: "Hoodie", label: "Hoodie" },
  { value: "Polo Shirt", label: "Polo Shirt" },
  { value: "Joggers", label: "Joggers" },
  { value: "Denim Jacket", label: "Denim Jacket" },
];

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "Completed", label: "Completed" },
  { value: "In Progress", label: "In Progress" },
  { value: "Delayed", label: "Delayed" },
];

// ------------------------------------------
// Mock report data
// ------------------------------------------
const completionData = [
  { period: "Week 1", completed: 8, total: 10, rate: 80 },
  { period: "Week 2", completed: 12, total: 14, rate: 86 },
  { period: "Week 3", completed: 9, total: 11, rate: 82 },
  { period: "Week 4", completed: 15, total: 16, rate: 94 },
];

const delayData = [
  { woNumber: "WO-105", product: "Denim Jacket", delayDays: 3, reason: "Fabric shortage", severity: "Critical" },
  { woNumber: "WO-109", product: "Polo Shirt", delayDays: 1, reason: "Machine downtime", severity: "Warning" },
  { woNumber: "WO-098", product: "Cargo Pants", delayDays: 2, reason: "QA rework required", severity: "Warning" },
];

const outputData = [
  { product: "Basic Tee", planned: 1000, actual: 920, ratio: 92 },
  { product: "Hoodie", planned: 450, actual: 450, ratio: 100 },
  { product: "Joggers", planned: 1000, actual: 880, ratio: 88 },
  { product: "Polo Shirt", planned: 300, actual: 120, ratio: 40 },
  { product: "Denim Jacket", planned: 200, actual: 150, ratio: 75 },
];

const efficiencyData = [
  { line: "Line A", efficiency: 92, status: "On Track" },
  { line: "Line B", efficiency: 78, status: "At Risk" },
  { line: "Line C", efficiency: 88, status: "On Track" },
  { line: "Line D", efficiency: 65, status: "Delayed" },
];

// ==========================================
// Component
// ==========================================
const ProductionReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState("30d");
  const [filterProduct, setFilterProduct] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleExport = (reportName: string) => {
    setToast({ message: `${reportName} exported successfully (branch only).`, type: "success" });
  };

  // Computed KPIs for reports overview
  const avgCompletion = Math.round(completionData.reduce((s, r) => s + r.rate, 0) / completionData.length);
  const avgEfficiency = Math.round(efficiencyData.reduce((s, e) => s + e.efficiency, 0) / efficiencyData.length);

  return (
    <ProductionLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto space-y-6 pb-20">
        {/* Page Header — consistent with PLM pages */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Production Reports</h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Completion rate, delay analysis, output vs planned, efficiency trends.</p>
          </div>
          <div className="flex items-center gap-3">
            <SecondaryButton onClick={() => handleExport("Full Report")} icon={Download}>Export All</SecondaryButton>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-semibold">
              <Lock size={12} />Branch: Manila
            </div>
          </div>
        </div>

        {/* KPI Summary Cards — 3 per row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard title="Avg Completion Rate" value={`${avgCompletion}%`} icon={CheckCircle2} color="bg-emerald-500" trend="Last 4 weeks" trendUp={true} />
          <StatsCard title="Delayed Orders" value={delayData.length} icon={AlertTriangle} color="bg-rose-500" trend={`${delayData.length} active delays`} trendUp={false} />
          <StatsCard title="Avg Line Efficiency" value={`${avgEfficiency}%`} icon={Activity} color="bg-violet-500" trend="Across all lines" trendUp={avgEfficiency >= 80} />
        </div>

        {/* Filters — inside Card for consistency */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Report Filters</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <IconSelect label="Date Range" value={dateRange} onChange={setDateRange} options={dateRangeOptions} placeholder="Select period" />
            <IconSelect label="Product" value={filterProduct} onChange={setFilterProduct} options={productOptions} placeholder="All Products" />
            <IconSelect label="Status" value={filterStatus} onChange={setFilterStatus} options={statusOptions} placeholder="All Statuses" />
          </div>
        </div>

        {/* Report Cards Grid — 2 per row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* 1. Completion Rate per Period */}
          <ReportCard title="Completion Rate per Period" icon={CheckCircle2} iconColor="text-emerald-600 dark:text-emerald-400" iconBg="bg-emerald-50 dark:bg-emerald-900/30" onExport={() => handleExport("Completion Rate")} exportLabel="Export PDF">
            <div className="space-y-3">
              {completionData.map((row) => (
                <div key={row.period} className="flex items-center justify-between gap-4">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 w-20 shrink-0">{row.period}</span>
                  <div className="flex-1">
                    <ProgressBar value={row.rate} showPercent={false} status={row.rate >= 90 ? "on-track" : row.rate >= 75 ? "at-risk" : "delayed"} height="h-2" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 w-20 text-left">{row.completed}/{row.total} ({row.rate}%)</span>
                </div>
              ))}
            </div>
          </ReportCard>

          {/* 2. Delay Analysis */}
          <ReportCard title="Delay Analysis" icon={AlertTriangle} iconColor="text-rose-600 dark:text-rose-400" iconBg="bg-rose-50 dark:bg-rose-900/30" onExport={() => handleExport("Delay Analysis")} exportLabel="Export Excel">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">WO#</th>
                    <th className="pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product</th>
                    <th className="pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Delay</th>
                    <th className="pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reason</th>
                    <th className="pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {delayData.map((row) => (
                    <tr key={row.woNumber} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-2.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">{row.woNumber}</td>
                      <td className="py-2.5 text-xs text-slate-600 dark:text-slate-400">{row.product}</td>
                      <td className="py-2.5 text-xs font-bold text-rose-600">{row.delayDays}d</td>
                      <td className="py-2.5 text-xs text-slate-600 dark:text-slate-400">{row.reason}</td>
                      <td className="py-2.5"><StatusBadge status={row.severity} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ReportCard>

          {/* 3. Output vs Planned Quantity */}
          <ReportCard title="Output vs Planned Quantity" icon={BarChart3} iconColor="text-blue-600 dark:text-blue-400" iconBg="bg-blue-50 dark:bg-blue-900/30" onExport={() => handleExport("Output Report")} exportLabel="Export PDF">
            <div className="space-y-3">
              {outputData.map((row) => (
                <div key={row.product}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{row.product}</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{row.actual.toLocaleString()} / {row.planned.toLocaleString()}</span>
                  </div>
                  <ProgressBar value={row.ratio} showPercent={true} status={row.ratio >= 90 ? "on-track" : row.ratio >= 70 ? "at-risk" : "delayed"} height="h-2" />
                </div>
              ))}
            </div>
          </ReportCard>

          {/* 4. Efficiency Trend */}
          <ReportCard title="Efficiency Trend by Line" icon={TrendingUp} iconColor="text-violet-600 dark:text-violet-400" iconBg="bg-violet-50 dark:bg-violet-900/30" onExport={() => handleExport("Efficiency Report")} exportLabel="Export Excel">
            <div className="space-y-4">
              {efficiencyData.map((row) => (
                <div key={row.line} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-28 shrink-0">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{row.line}</span>
                    <StatusBadge status={row.status} />
                  </div>
                  <div className="flex-1">
                    <ProgressBar
                      value={row.efficiency}
                      showPercent={true}
                      status={row.efficiency >= 85 ? "on-track" : row.efficiency >= 70 ? "at-risk" : "delayed"}
                      height="h-2"
                    />
                  </div>
                </div>
              ))}

              {/* Summary — highlighted */}
              <div className="mt-2 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Average Efficiency</span>
                <span className={`text-sm font-extrabold ${avgEfficiency >= 80 ? "text-emerald-600" : "text-amber-600"}`}>
                  {avgEfficiency}%
                </span>
              </div>
            </div>
          </ReportCard>
        </div>

        {/* Export notice — consistent with PLM pages */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start gap-3">
          <Calendar size={16} className="text-blue-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-blue-700 dark:text-blue-400">Branch-Only Exports</p>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">All exports contain data for Manila branch only. Cross-branch reports are managed by the Super Admin.</p>
          </div>
        </div>
      </div>
    </ProductionLayout>
  );
};

export default ProductionReportsPage;
