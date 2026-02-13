// ==========================================
// FINReportsPage.tsx
// Finance Manager — Finance Reports
// Cost summary, expense breakdown, budget variance,
// profit/loss insights. Filters: date range, collection/SKU, status.
// ==========================================

import React, { useState } from "react";
import FinanceLayout from "../../layout/FinanceLayout";
import StatsCard from "../../components/ui/StatsCard";
import ReportCard from "../../components/ui/ReportCard";
import DefectTrendChart from "../../components/ui/DefectTrendChart";
import type { TrendDataPoint } from "../../components/ui/DefectTrendChart";
import SecondaryButton from "../../components/ui/SecondaryButton";
import IconSelect from "../../components/ui/IconSelect";
import type { IconSelectOption } from "../../components/ui/IconSelect";
import Toast from "../../components/ui/Toast";
import {
  BarChart3,
  PieChart,
  Wallet,
  TrendingUp,
  Tag,
  Layers,
  Lock,
  LockOpen,
  CheckCircle,
  Download,
  Calculator,
  AlertTriangle,
} from "lucide-react";

// ------------------------------------------
// Mock Data
// ------------------------------------------
const COGS_TREND_DATA: TrendDataPoint[] = [
  { label: "Sep", value: 420 },
  { label: "Oct", value: 485 },
  { label: "Nov", value: 512 },
  { label: "Dec", value: 478 },
  { label: "Jan", value: 545 },
  { label: "Feb", value: 598 },
];

const COST_SUMMARY_ROWS = [
  { category: "Materials", thisPeriod: 245000, lastPeriod: 228000, variance: 17000, variancePct: 7.5 },
  { category: "Labor", thisPeriod: 156000, lastPeriod: 162000, variance: -6000, variancePct: -3.7 },
  { category: "Waste", thisPeriod: 42000, lastPeriod: 38000, variance: 4000, variancePct: 10.5 },
  { category: "Overhead", thisPeriod: 78000, lastPeriod: 75000, variance: 3000, variancePct: 4.0 },
  { category: "Total COGS", thisPeriod: 521000, lastPeriod: 503000, variance: 18000, variancePct: 3.6 },
];

const EXPENSE_BREAKDOWN = [
  { label: "Raw Materials", pct: 45 },
  { label: "Labor", pct: 28 },
  { label: "Waste", pct: 12 },
  { label: "Overhead", pct: 10 },
  { label: "Other", pct: 5 },
];

const BUDGET_VARIANCE_ROWS = [
  { name: "Production Materials Q1", budget: 720000, actual: 698000, variance: -22000, status: "Under" },
  { name: "Labor & Wages Feb", budget: 180000, actual: 192000, variance: 12000, status: "Over" },
  { name: "Factory Overhead", budget: 95000, actual: 95000, variance: 0, status: "On Track" },
  { name: "Quality & Rework", budget: 45000, actual: 52000, variance: 7000, status: "Over" },
];

const PROFIT_LOSS_ROWS = [
  { category: "Basic Tee Line", revenue: 350000, cogs: 187500, grossMargin: 162500, marginPct: 46.4 },
  { category: "Denim Jacket", revenue: 609000, cogs: 378000, grossMargin: 231000, marginPct: 37.9 },
  { category: "Kids Polo", revenue: 0, cogs: 189000, grossMargin: 0, marginPct: null },
  { category: "Hoodie Collection", revenue: 427500, cogs: 270000, grossMargin: 157500, marginPct: 36.8 },
];

const COLLECTION_SKU_OPTIONS: IconSelectOption[] = [
  { value: "", label: "All", icon: Layers },
  { value: "collection", label: "Collection", icon: Layers },
  { value: "sku", label: "SKU", icon: Tag },
];

const STATUS_OPTIONS: IconSelectOption[] = [
  { value: "", label: "All", icon: CheckCircle },
  { value: "locked", label: "Locked", icon: Lock },
  { value: "open", label: "Open", icon: LockOpen },
];

// ------------------------------------------
// Helpers
// ------------------------------------------
const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

const hasSellingData = PROFIT_LOSS_ROWS.some((r) => r.revenue > 0);

// ------------------------------------------
// Component
// ------------------------------------------
const FINReportsPage: React.FC = () => {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [dateStart, setDateStart] = useState("2026-01-01");
  const [dateEnd, setDateEnd] = useState("2026-02-14");
  const [filterCollectionSku, setFilterCollectionSku] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const handleExport = () => {
    setToast({ message: "Report exported.", type: "success" });
  };

  const handleExportAll = () => {
    setToast({ message: "Exporting full finance report…", type: "success" });
  };

  // KPI computations
  const totalCOGS = COST_SUMMARY_ROWS.find((r) => r.category === "Total COGS");
  const totalVariance = totalCOGS ? totalCOGS.variancePct : 0;

  return (
    <FinanceLayout>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="max-w-7xl mx-auto space-y-6 pb-20">
        {/* Page Header — consistent with PLM / QA / WH pages */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Finance Reports</h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Cost summary, expense breakdown, budget variance, and profit/loss insights</p>
          </div>
          <div className="flex items-center gap-3">
            <SecondaryButton icon={Download} onClick={handleExportAll}>Export All</SecondaryButton>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-semibold">
              <Lock size={12} />Branch: Manila
            </div>
          </div>
        </div>

        {/* KPI Summary Cards — 3 per row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard title="Total COGS (Period)" value={totalCOGS ? `₱${(totalCOGS.thisPeriod / 1000).toFixed(0)}K` : "—"} icon={Calculator} color="bg-emerald-500" trend={`${totalVariance >= 0 ? "+" : ""}${totalVariance}% vs last period`} trendUp={totalVariance <= 0} />
          <StatsCard title="Variance Alerts" value={BUDGET_VARIANCE_ROWS.filter((r) => r.status === "Over").length} icon={AlertTriangle} color="bg-amber-500" trend="Over-budget items" trendUp={false} />
          <StatsCard title="Avg Margin" value="40.4%" icon={TrendingUp} color="bg-indigo-500" trend="Across product lines" trendUp={true} />
        </div>

        {/* Report Filters */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Report Filters</p>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500">From:</label>
              <input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500">To:</label>
              <input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="w-44">
              <IconSelect
                label=""
                value={filterCollectionSku}
                onChange={setFilterCollectionSku}
                options={COLLECTION_SKU_OPTIONS}
                placeholder="Collection / SKU"
              />
            </div>
            <div className="w-44">
              <IconSelect
                label=""
                value={filterStatus}
                onChange={setFilterStatus}
                options={STATUS_OPTIONS}
                placeholder="Status"
              />
            </div>
          </div>
        </div>

        {/* COGS Trend Chart — modern with gradient & animation */}
        <DefectTrendChart
          title="COGS Trend (Monthly)"
          data={COGS_TREND_DATA}
          gradientFrom="#10b981"
          gradientTo="#34d399"
          icon={TrendingUp}
          iconBg="bg-emerald-50 dark:bg-emerald-900/30"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />

        {/* Report Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Summary Report */}
        <ReportCard
          title="Cost Summary Report"
          icon={BarChart3}
          iconColor="text-slate-600"
          iconBg="bg-slate-50 dark:bg-slate-800"
          onExport={handleExport}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2 pr-2 font-bold text-slate-500 dark:text-slate-400">Category</th>
                  <th className="py-2 pr-2 font-bold text-slate-500 dark:text-slate-400">This Period (₱)</th>
                  <th className="py-2 pr-2 font-bold text-slate-500 dark:text-slate-400">Last Period (₱)</th>
                  <th className="py-2 pr-2 font-bold text-slate-500 dark:text-slate-400">Variance (₱)</th>
                  <th className="py-2 font-bold text-slate-500 dark:text-slate-400">Variance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {COST_SUMMARY_ROWS.map((row) => (
                  <tr key={row.category}>
                    <td className="py-2.5 pr-2 font-medium text-slate-800 dark:text-slate-200">{row.category}</td>
                    <td className="py-2.5 pr-2 text-slate-600 dark:text-slate-400">{formatCurrency(row.thisPeriod)}</td>
                    <td className="py-2.5 pr-2 text-slate-600 dark:text-slate-400">{formatCurrency(row.lastPeriod)}</td>
                    <td className="py-2.5 pr-2">
                      <span
                        className={
                          row.variance >= 0
                            ? "text-red-600 dark:text-red-400 font-semibold"
                            : "text-emerald-600 dark:text-emerald-400 font-semibold"
                        }
                      >
                        {row.variance >= 0 ? "+" : ""}
                        {formatCurrency(row.variance)}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span
                        className={
                          row.variance >= 0
                            ? "text-red-600 dark:text-red-400 font-semibold"
                            : "text-emerald-600 dark:text-emerald-400 font-semibold"
                        }
                      >
                        {row.variance >= 0 ? "+" : ""}
                        {row.variancePct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportCard>

        {/* Expense Breakdown */}
        <ReportCard
          title="Expense Breakdown"
          icon={PieChart}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50 dark:bg-emerald-900/30"
          onExport={handleExport}
        >
          <div className="space-y-3">
            {EXPENSE_BREAKDOWN.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{item.label}</span>
                  <span className="font-semibold text-slate-600 dark:text-slate-400">{item.pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ReportCard>

        {/* Budget Variance */}
        <ReportCard
          title="Budget Variance"
          icon={Wallet}
          iconColor="text-amber-600"
          iconBg="bg-amber-50 dark:bg-amber-900/30"
          onExport={handleExport}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2 pr-2 font-bold text-slate-500 dark:text-slate-400">Budget Name</th>
                  <th className="py-2 pr-2 font-bold text-slate-500 dark:text-slate-400">Budget (₱)</th>
                  <th className="py-2 pr-2 font-bold text-slate-500 dark:text-slate-400">Actual (₱)</th>
                  <th className="py-2 pr-2 font-bold text-slate-500 dark:text-slate-400">Variance (₱)</th>
                  <th className="py-2 font-bold text-slate-500 dark:text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {BUDGET_VARIANCE_ROWS.map((row) => (
                  <tr key={row.name}>
                    <td className="py-2.5 pr-2 font-medium text-slate-800 dark:text-slate-200">{row.name}</td>
                    <td className="py-2.5 pr-2 text-slate-600 dark:text-slate-400">{formatCurrency(row.budget)}</td>
                    <td className="py-2.5 pr-2 text-slate-600 dark:text-slate-400">{formatCurrency(row.actual)}</td>
                    <td className="py-2.5 pr-2 font-medium text-slate-700 dark:text-slate-300">{formatCurrency(row.variance)}</td>
                    <td className="py-2.5">
                      <span
                        className={
                          row.status === "Under"
                            ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                            : row.status === "Over"
                              ? "text-red-600 dark:text-red-400 font-semibold"
                              : "text-slate-600 dark:text-slate-400 font-semibold"
                        }
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportCard>

        {/* Profit/Loss Insights */}
        <ReportCard
          title="Profit/Loss Insights"
          icon={TrendingUp}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50 dark:bg-indigo-900/30"
          onExport={handleExport}
        >
          {hasSellingData ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2 pr-2 font-bold text-slate-500 dark:text-slate-400">Category</th>
                    <th className="py-2 pr-2 font-bold text-slate-500 dark:text-slate-400">Revenue (₱)</th>
                    <th className="py-2 pr-2 font-bold text-slate-500 dark:text-slate-400">COGS (₱)</th>
                    <th className="py-2 pr-2 font-bold text-slate-500 dark:text-slate-400">Gross Margin</th>
                    <th className="py-2 font-bold text-slate-500 dark:text-slate-400">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {PROFIT_LOSS_ROWS.map((row) => (
                    <tr key={row.category}>
                      <td className="py-2.5 pr-2 font-medium text-slate-800 dark:text-slate-200">{row.category}</td>
                      <td className="py-2.5 pr-2 text-slate-600 dark:text-slate-400">{row.revenue ? formatCurrency(row.revenue) : "—"}</td>
                      <td className="py-2.5 pr-2 text-slate-600 dark:text-slate-400">{formatCurrency(row.cogs)}</td>
                      <td className="py-2.5 pr-2 text-slate-600 dark:text-slate-400">{row.grossMargin ? formatCurrency(row.grossMargin) : "—"}</td>
                      <td className="py-2.5">
                        {row.marginPct != null ? (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{row.marginPct}%</span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 italic">Cost-only</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-4">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">Cost-only insights</p>
              <div className="space-y-2">
                {PROFIT_LOSS_ROWS.map((row) => (
                  <div key={row.category} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{row.category}</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(row.cogs)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ReportCard>
        </div>
      </div>
    </FinanceLayout>
  );
};

export default FINReportsPage;
