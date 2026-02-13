// ==========================================
// FINVariancePage.tsx
// Finance Manager — Variance & Exceptions
// Budget vs actual variance by SKU/Collection/Period, plus exception list.
// ==========================================

import React, { useState, useMemo } from "react";
import FinanceLayout from "../../layout/FinanceLayout";
import StatsCard from "../../components/ui/StatsCard";
import { TableToolbar } from "../../components/ui/TableToolbar";
import { StatusBadge } from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";
import PageModal from "../../components/ui/PageModal";
import Toast from "../../components/ui/Toast";
import IconSelect from "../../components/ui/IconSelect";
import type { IconSelectOption } from "../../components/ui/IconSelect";
import SecondaryButton from "../../components/ui/SecondaryButton";
import PrimaryButton from "../../components/ui/PrimaryButton";
import DefectTrendChart, { type TrendDataPoint } from "../../components/ui/DefectTrendChart";
import {
  AlertTriangle,
  Download,
  Eye,
  FileText,
  Percent,
  TrendingUp,
  Archive,
} from "lucide-react";

// ------------------------------------------
// Types
// ------------------------------------------
type Severity = "Low" | "Medium" | "High";

interface VarianceItem {
  id: string;
  skuCollection: string;
  period: string;
  budget: number;
  actual: number;
  variance: number;
  variancePercent: number;
  severity: Severity;
  exceptionNote?: string;
  investigationNote?: string;
}

// ------------------------------------------
// Constants
// ------------------------------------------
const ITEMS_PER_PAGE = 6;

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

const getVarianceColor = (variancePercent: number): string => {
  const abs = Math.abs(variancePercent);
  if (abs < 5) return "text-emerald-600 dark:text-emerald-400";
  if (abs <= 10) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
};

const SEVERITY_OPTIONS: IconSelectOption[] = [
  { value: "", label: "All", icon: FileText },
  { value: "Low", label: "Low", icon: TrendingUp },
  { value: "Medium", label: "Medium", icon: AlertTriangle },
  { value: "High", label: "High", icon: AlertTriangle },
];

// ------------------------------------------
// Mock Data
// ------------------------------------------
const VARIANCE_TREND_DATA: TrendDataPoint[] = [
  { label: "Aug", value: 3.2 },
  { label: "Sep", value: 4.1 },
  { label: "Oct", value: 5.8 },
  { label: "Nov", value: 6.2 },
  { label: "Dec", value: 4.9 },
  { label: "Jan", value: 7.1 },
];

const MOCK_VARIANCE_ITEMS: VarianceItem[] = [
  {
    id: "VAR-001",
    skuCollection: "TEE-SUM-COT-001",
    period: "Jan 2026",
    budget: 125_000,
    actual: 143_750,
    variance: 18_750,
    variancePercent: 15.0,
    severity: "High",
    exceptionNote: "Material usage exceeded BOM by 15%",
  },
  {
    id: "VAR-002",
    skuCollection: "PNT-DEN-SLM-002",
    period: "Jan 2026",
    budget: 89_400,
    actual: 94_200,
    variance: 4_800,
    variancePercent: 5.4,
    severity: "Medium",
    exceptionNote: "Waste exceeded allowed allowance",
  },
  {
    id: "VAR-003",
    skuCollection: "JKT-BOM-001",
    period: "Dec 2025",
    budget: 156_200,
    actual: 172_500,
    variance: 16_300,
    variancePercent: 10.4,
    severity: "High",
    exceptionNote: "Labor overtime exceeded cap",
  },
  {
    id: "VAR-004",
    skuCollection: "SKT-MID-PLE-003",
    period: "Jan 2026",
    budget: 78_400,
    actual: 79_200,
    variance: 800,
    variancePercent: 1.0,
    severity: "Low",
  },
  {
    id: "VAR-005",
    skuCollection: "DRS-MAX-001",
    period: "Jan 2026",
    budget: 99_000,
    actual: 103_500,
    variance: 4_500,
    variancePercent: 4.5,
    severity: "Low",
  },
  {
    id: "VAR-006",
    skuCollection: "Collection: Summer 2026",
    period: "Jan 2026",
    budget: 450_000,
    actual: 486_000,
    variance: 36_000,
    variancePercent: 8.0,
    severity: "Medium",
    exceptionNote: "Material usage exceeded BOM by 15%",
  },
  {
    id: "VAR-007",
    skuCollection: "POL-BAS-001",
    period: "Dec 2025",
    budget: 79_200,
    actual: 82_000,
    variance: 2_800,
    variancePercent: 3.5,
    severity: "Low",
  },
  {
    id: "VAR-008",
    skuCollection: "BLZ-SIL-002",
    period: "Jan 2026",
    budget: 121_500,
    actual: 135_000,
    variance: 13_500,
    variancePercent: 11.1,
    severity: "High",
    exceptionNote: "Waste exceeded allowed allowance",
  },
];

// ==========================================
// Component
// ==========================================
const FINVariancePage: React.FC = () => {
  const [items, setItems] = useState<VarianceItem[]>(MOCK_VARIANCE_ITEMS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<VarianceItem | null>(null);
  const [investigationNote, setInvestigationNote] = useState("");

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // ------------------------------------------
  // Computed
  // ------------------------------------------
  const totalExceptions = items.length;
  const criticalVariances = useMemo(() => items.filter((i) => i.severity === "High").length, [items]);
  const avgVariancePercent = useMemo(() => {
    if (items.length === 0) return 0;
    const sum = items.reduce((s, i) => s + Math.abs(i.variancePercent), 0);
    return (sum / items.length).toFixed(1);
  }, [items]);

  const filteredItems = useMemo(() => {
    let data = items;
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      data = data.filter(
        (i) =>
          i.id.toLowerCase().includes(q) ||
          i.skuCollection.toLowerCase().includes(q) ||
          i.period.toLowerCase().includes(q)
      );
    }
    if (filterSeverity) {
      data = data.filter((i) => i.severity === filterSeverity);
    }
    return data;
  }, [items, searchQuery, filterSeverity]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredItems.length);
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  // ------------------------------------------
  // Handlers
  // ------------------------------------------
  const openDetail = (item: VarianceItem) => {
    setSelectedItem(item);
    setInvestigationNote(item.investigationNote ?? "");
    setIsDetailOpen(true);
  };

  const handleSaveInvestigationNote = () => {
    if (!selectedItem) return;
    setItems((prev) =>
      prev.map((i) =>
        i.id === selectedItem.id ? { ...i, investigationNote } : i
      )
    );
    setSelectedItem((prev) => (prev ? { ...prev, investigationNote } : null));
    setToast({ message: "Investigation note saved.", type: "success" });
  };

  const handleExportExceptions = () => {
    setToast({ message: "Exception list exported.", type: "success" });
  };

  const filterLabel =
    filterSeverity === "Low"
      ? "Low"
      : filterSeverity === "Medium"
        ? "Medium"
        : filterSeverity === "High"
          ? "High"
          : "Filters";

  return (
    <FinanceLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Variance & Exceptions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Budget vs actual variance by SKU/Collection/Period, plus exception list.
          </p>
        </div>
        <SecondaryButton icon={Download} onClick={handleExportExceptions}>
          Export Exceptions
        </SecondaryButton>
      </div>

      {/* Variance Trend Chart */}
      <div className="mb-8">
        <DefectTrendChart
          title="Variance % Trend (Monthly)"
          data={VARIANCE_TREND_DATA}
          barColor="bg-amber-500"
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatsCard title="Total Exceptions" value={totalExceptions} icon={AlertTriangle} color="bg-amber-500" />
        <StatsCard title="Critical Variances (>10%)" value={criticalVariances} icon={TrendingUp} color="bg-rose-500" />
        <StatsCard title="Avg Variance %" value={`${avgVariancePercent}%`} icon={Percent} color="bg-indigo-500" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <TableToolbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
          placeholder="Search by ID, SKU, Period..."
          filterLabel={filterLabel}
        >
          <div className="p-3 space-y-2 min-w-[180px]">
            <IconSelect
              label="Severity"
              value={filterSeverity}
              onChange={(v) => {
                setFilterSeverity(v);
                setCurrentPage(1);
              }}
              options={SEVERITY_OPTIONS}
              placeholder="All"
            />
          </div>
        </TableToolbar>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">SKU/Collection</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Period</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Budget (₱)</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actual (₱)</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Variance (₱)</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Variance %</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Investigation Note</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {paginatedItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-3 text-xs font-bold text-indigo-600 dark:text-indigo-400">{item.id}</td>
                  <td className="px-6 py-3 text-sm font-medium text-slate-800 dark:text-slate-200">{item.skuCollection}</td>
                  <td className="px-6 py-3 text-xs text-slate-600 dark:text-slate-400">{item.period}</td>
                  <td className="px-6 py-3 text-sm text-slate-700 dark:text-slate-300">{formatCurrency(item.budget)}</td>
                  <td className="px-6 py-3 text-sm text-slate-700 dark:text-slate-300">{formatCurrency(item.actual)}</td>
                  <td className="px-6 py-3 text-sm font-medium text-slate-800 dark:text-slate-200">{formatCurrency(item.variance)}</td>
                  <td className={`px-6 py-3 text-sm font-semibold ${getVarianceColor(item.variancePercent)}`}>
                    {item.variancePercent >= 0 ? `+${item.variancePercent.toFixed(1)}%` : `${item.variancePercent.toFixed(1)}%`}
                  </td>
                  <td className="px-6 py-3">
                    <StatusBadge status={item.severity} />
                  </td>
                  <td className="px-6 py-3 text-xs text-slate-500 dark:text-slate-400 max-w-[160px] truncate">
                    {item.investigationNote || "—"}
                  </td>
                  <td className="px-6 py-3 text-left">
                    <div className="flex items-center justify-start gap-1">
                      <button
                        onClick={() => openDetail(item)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setItems((prev) => prev.filter((x) => x.id !== item.id));
                          setToast({ message: "Record archived successfully", type: "success" });
                        }}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                        title="Archive"
                      >
                        <Archive size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredItems.length === 0 && (
          <div className="px-6 py-16 text-center">
            <AlertTriangle size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No variance items found</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try adjusting your search or filter criteria.</p>
          </div>
        )}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={filteredItems.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Detail Modal */}
      <PageModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedItem(null);
          setInvestigationNote("");
        }}
        title={selectedItem ? `Variance ${selectedItem.id}` : "Variance Details"}
        subtitle={selectedItem ? `${selectedItem.skuCollection} · ${selectedItem.period}` : undefined}
        maxWidth="max-w-2xl"
        footer={
          <div className="flex justify-end gap-3">
            <SecondaryButton
              onClick={() => {
                setIsDetailOpen(false);
                setSelectedItem(null);
                setInvestigationNote("");
              }}
            >
              Close
            </SecondaryButton>
            {selectedItem && (
              <PrimaryButton
                onClick={handleSaveInvestigationNote}
                className="!w-auto !py-2.5 !px-4 !rounded-xl !text-xs"
              >
                <FileText size={14} />
                Save Investigation Note
              </PrimaryButton>
            )}
          </div>
        }
      >
        {selectedItem && (
          <>
            {/* Variance Header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">SKU/Collection</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{selectedItem.skuCollection}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Period</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{selectedItem.period}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Budget</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{formatCurrency(selectedItem.budget)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Actual</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{formatCurrency(selectedItem.actual)}</p>
              </div>
            </div>

            {/* Breakdown */}
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Breakdown</p>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                      <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Metric</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-2 font-medium text-slate-800 dark:text-slate-200">Variance (₱)</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{formatCurrency(selectedItem.variance)}</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-2 font-medium text-slate-800 dark:text-slate-200">Variance %</td>
                      <td className={`px-4 py-2 font-semibold ${getVarianceColor(selectedItem.variancePercent)}`}>
                        {selectedItem.variancePercent >= 0 ? `+${selectedItem.variancePercent.toFixed(1)}%` : `${selectedItem.variancePercent.toFixed(1)}%`}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-2 font-medium text-slate-800 dark:text-slate-200">Severity</td>
                      <td className="px-4 py-2">
                        <StatusBadge status={selectedItem.severity} />
                      </td>
                    </tr>
                    {selectedItem.exceptionNote && (
                      <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-2 font-medium text-slate-800 dark:text-slate-200">Exception</td>
                        <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{selectedItem.exceptionNote}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Create Investigation Note */}
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Investigation Note</p>
              <textarea
                value={investigationNote}
                onChange={(e) => setInvestigationNote(e.target.value)}
                placeholder="Add investigation notes for this variance..."
                className="w-full px-4 py-3 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[80px] resize-none"
              />
            </div>
          </>
        )}
      </PageModal>
    </FinanceLayout>
  );
};

export default FINVariancePage;
