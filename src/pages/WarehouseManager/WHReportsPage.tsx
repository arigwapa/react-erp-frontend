// ==========================================
// WHReportsPage.tsx
// Warehouse Manager — Inventory Reports
// Reports: Inventory valuation, low-stock frequency,
// stock movement history, adjustment summary,
// slow-moving items. Filters: date range, item type,
// movement type.
// ==========================================

import React, { useState } from "react";
import WarehouseLayout from "../../layout/WarehouseLayout";
import StatsCard from "../../components/ui/StatsCard";
import ReportCard from "../../components/ui/ReportCard";
import DefectTrendChart, { type TrendDataPoint } from "../../components/ui/DefectTrendChart";
import SecondaryButton from "../../components/ui/SecondaryButton";
import Toast from "../../components/ui/Toast";
import IconSelect from "../../components/ui/IconSelect";
import {
  DollarSign,
  AlertTriangle,
  ArrowLeftRight,
  ClipboardEdit,
  Clock,
  Lock,
  Package,
  Download,
  TrendingUp,
  ArrowDownToLine,
} from "lucide-react";

// ------------------------------------------
// Mock report data
// ------------------------------------------
const inventoryValuation = [
  { label: "Raw Materials", value: "₱2,450,000", sublabel: "856 items" },
  { label: "Finished Goods", value: "₱3,120,000", sublabel: "391 items" },
  { label: "Total Inventory", value: "₱5,570,000", sublabel: "1,247 items" },
];

const lowStockFrequency = [
  { label: "Cotton Fabric", value: "5 times", sublabel: "Last 30 days" },
  { label: "Elastic Band", value: "4 times", sublabel: "Last 30 days" },
  { label: "Linen Blend", value: "3 times", sublabel: "Last 30 days" },
  { label: "Polyester Thread", value: "2 times", sublabel: "Last 30 days" },
];

const adjustmentSummary = [
  { label: "Total Requests", value: "24", sublabel: "This month" },
  { label: "Approved", value: "18", sublabel: "75%" },
  { label: "Rejected", value: "4", sublabel: "17%" },
  { label: "Pending", value: "2", sublabel: "8%" },
];

const slowMovingItems = [
  { label: "Silk Fabric (MAT-004)", value: "42 days", sublabel: "No movement since Jan 2" },
  { label: "Button - Shell (MAT-007)", value: "35 days", sublabel: "No movement since Jan 9" },
  { label: "Denim Jacket V1.0 (SKU-005)", value: "28 days", sublabel: "No movement since Jan 16" },
];

const movementTrendData: TrendDataPoint[] = [
  { label: "Week 1", value: 45 },
  { label: "Week 2", value: 62 },
  { label: "Week 3", value: 38 },
  { label: "Week 4", value: 71 },
  { label: "Week 5", value: 55 },
  { label: "Week 6", value: 48 },
];

const movementByType: TrendDataPoint[] = [
  { label: "Stock-In", value: 156 },
  { label: "Stock-Out", value: 128 },
  { label: "Transfer", value: 24 },
  { label: "Adjustment", value: 18 },
];

const typeOptions = [
  { value: "", label: "All Types" },
  { value: "Raw Material", label: "Raw Material" },
  { value: "Finished Good", label: "Finished Good" },
];

const movementTypeOptions = [
  { value: "", label: "All Movements" },
  { value: "Stock-In", label: "Stock-In" },
  { value: "Stock-Out", label: "Stock-Out" },
  { value: "Transfer", label: "Transfer" },
  { value: "Adjustment", label: "Adjustment" },
];

// ==========================================
// Component
// ==========================================
const WHReportsPage: React.FC = () => {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [filterDateFrom, setFilterDateFrom] = useState("2026-01-01");
  const [filterDateTo, setFilterDateTo] = useState("2026-02-13");
  const [filterType, setFilterType] = useState("");
  const [filterMovType, setFilterMovType] = useState("");

  const handleExportAll = () => {
    setToast({ message: "Exporting full inventory report…", type: "success" });
  };

  return (
    <WarehouseLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto space-y-6 pb-20">
        {/* Page Header — consistent with PLM / QA pages */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Inventory Reports</h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Comprehensive warehouse analytics and report generation</p>
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
          <StatsCard title="Total Inventory Value" value="₱5.57M" icon={DollarSign} color="bg-emerald-500" trend="1,247 items" trendUp={true} />
          <StatsCard title="Total Movements" value={326} icon={ArrowLeftRight} color="bg-indigo-500" trend="This period" trendUp={true} />
          <StatsCard title="Avg Turnover Days" value="12.4" icon={TrendingUp} color="bg-blue-500" trend="Fastest: 3 days" trendUp={true} />
        </div>

        {/* Report Filters */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Report Filters</p>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500">From:</label>
              <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500">To:</label>
              <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
            <div className="w-44">
              <IconSelect label="" value={filterType} onChange={setFilterType} options={typeOptions} placeholder="All Item Types" />
            </div>
            <div className="w-44">
              <IconSelect label="" value={filterMovType} onChange={setFilterMovType} options={movementTypeOptions} placeholder="All Movements" />
            </div>
          </div>
        </div>

        {/* Movement Trend Charts — modern with gradient & animation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DefectTrendChart
            title="Stock Movement Trend (Weekly)"
            data={movementTrendData}
            gradientFrom="#6366f1"
            gradientTo="#818cf8"
            icon={ArrowDownToLine}
            iconBg="bg-indigo-50 dark:bg-indigo-900/30"
            iconColor="text-indigo-600 dark:text-indigo-400"
          />
          <DefectTrendChart
            title="Movements by Type"
            data={movementByType}
            gradientFrom="#3b82f6"
            gradientTo="#60a5fa"
            icon={Package}
            iconBg="bg-blue-50 dark:bg-blue-900/30"
            iconColor="text-blue-600 dark:text-blue-400"
          />
        </div>

        {/* Report Cards — 2 per row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inventory Valuation */}
          <ReportCard
            title="Inventory Valuation"
            icon={DollarSign}
            iconColor="text-emerald-600 dark:text-emerald-400"
            iconBg="bg-emerald-50 dark:bg-emerald-900/30"
          >
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {inventoryValuation.map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{item.label}</p>
                    <p className="text-[10px] text-slate-400">{item.sublabel}</p>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </ReportCard>

          {/* Low-Stock Frequency */}
          <ReportCard
            title="Low-Stock Frequency (Top Items)"
            icon={AlertTriangle}
            iconColor="text-amber-600 dark:text-amber-400"
            iconBg="bg-amber-50 dark:bg-amber-900/30"
          >
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {lowStockFrequency.map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{item.label}</p>
                    <p className="text-[10px] text-slate-400">{item.sublabel}</p>
                  </div>
                  <p className="text-sm font-bold text-amber-600 dark:text-amber-400">{item.value}</p>
                </div>
              ))}
            </div>
          </ReportCard>

          {/* Adjustment Summary */}
          <ReportCard
            title="Adjustment Summary"
            icon={ClipboardEdit}
            iconColor="text-violet-600 dark:text-violet-400"
            iconBg="bg-violet-50 dark:bg-violet-900/30"
          >
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {adjustmentSummary.map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{item.label}</p>
                    <p className="text-[10px] text-slate-400">{item.sublabel}</p>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </ReportCard>

          {/* Slow-Moving Items */}
          <ReportCard
            title="Slow-Moving Items"
            icon={Clock}
            iconColor="text-rose-600 dark:text-rose-400"
            iconBg="bg-rose-50 dark:bg-rose-900/30"
          >
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {slowMovingItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{item.label}</p>
                    <p className="text-[10px] text-slate-400">{item.sublabel}</p>
                  </div>
                  <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{item.value}</p>
                </div>
              ))}
            </div>
          </ReportCard>
        </div>
      </div>
    </WarehouseLayout>
  );
};

export default WHReportsPage;
