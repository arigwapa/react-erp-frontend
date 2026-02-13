// ==========================================
// FINProfitabilityPage.tsx
// Finance Manager — Profitability Analysis
// Analyze profitability by SKU / Collection / Season.
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
import SecondaryButton from "../../components/ui/SecondaryButton";
import PrimaryButton from "../../components/ui/PrimaryButton";
import DefectTrendChart from "../../components/ui/DefectTrendChart";
import type { TrendDataPoint } from "../../components/ui/DefectTrendChart";
import type { IconSelectOption } from "../../components/ui/IconSelect";
import InputGroup from "../../components/ui/InputGroup";
import {
  Package,
  TrendingUp,
  Percent,
  PiggyBank,
  Download,
  Eye,
  Tag,
  Layers,
  Calendar,
  Archive,
} from "lucide-react";

// ------------------------------------------
// Types
// ------------------------------------------
type CategoryType = "SKU" | "Collection";

interface ProfitabilityItem {
  id: string;
  name: string;
  category: CategoryType;
  totalUnitsProduced: number;
  totalCOGS: number;
  costPerUnit: number;
  sellingPrice?: number;
  marginPct?: number;
  materialsPct: number;
  laborPct: number;
  wastePct: number;
  periodStart: string;
  periodEnd: string;
}

// ------------------------------------------
// Constants
// ------------------------------------------
const ITEMS_PER_PAGE = 6;

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

const CATEGORY_OPTIONS: IconSelectOption[] = [
  { value: "", label: "All", icon: Layers },
  { value: "SKU", label: "SKU", icon: Tag },
  { value: "Collection", label: "Collection", icon: Package },
];

// ------------------------------------------
// Mock Data
// ------------------------------------------
const MOCK_ITEMS: ProfitabilityItem[] = [
  {
    id: "1",
    name: "Summer Cotton Tee SKU-001",
    category: "SKU",
    totalUnitsProduced: 1250,
    totalCOGS: 187500,
    costPerUnit: 150,
    sellingPrice: 280,
    marginPct: 46.4,
    materialsPct: 55,
    laborPct: 35,
    wastePct: 10,
    periodStart: "2026-01-01",
    periodEnd: "2026-01-31",
  },
  {
    id: "2",
    name: "Denim Jacket Collection",
    category: "Collection",
    totalUnitsProduced: 420,
    totalCOGS: 378000,
    costPerUnit: 900,
    sellingPrice: 1450,
    marginPct: 37.9,
    materialsPct: 62,
    laborPct: 28,
    wastePct: 10,
    periodStart: "2026-01-15",
    periodEnd: "2026-02-15",
  },
  {
    id: "3",
    name: "Kids Polo SKU-042",
    category: "SKU",
    totalUnitsProduced: 2100,
    totalCOGS: 189000,
    costPerUnit: 90,
    materialsPct: 50,
    laborPct: 40,
    wastePct: 10,
    periodStart: "2026-02-01",
    periodEnd: "2026-02-28",
  },
  {
    id: "4",
    name: "Winter Essentials 2026",
    category: "Collection",
    totalUnitsProduced: 680,
    totalCOGS: 544000,
    costPerUnit: 800,
    materialsPct: 58,
    laborPct: 32,
    wastePct: 10,
    periodStart: "2025-11-01",
    periodEnd: "2025-12-31",
  },
  {
    id: "5",
    name: "Uniform Shirt SKU-089",
    category: "SKU",
    totalUnitsProduced: 3500,
    totalCOGS: 262500,
    costPerUnit: 75,
    sellingPrice: 120,
    marginPct: 37.5,
    materialsPct: 48,
    laborPct: 42,
    wastePct: 10,
    periodStart: "2026-01-01",
    periodEnd: "2026-03-31",
  },
  {
    id: "6",
    name: "Linen Blouse Collection",
    category: "Collection",
    totalUnitsProduced: 890,
    totalCOGS: 534000,
    costPerUnit: 600,
    sellingPrice: 950,
    marginPct: 36.8,
    materialsPct: 52,
    laborPct: 38,
    wastePct: 10,
    periodStart: "2026-02-01",
    periodEnd: "2026-02-28",
  },
  {
    id: "7",
    name: "Recycled Poly Hoodie SKU-112",
    category: "SKU",
    totalUnitsProduced: 520,
    totalCOGS: 156000,
    costPerUnit: 300,
    materialsPct: 60,
    laborPct: 30,
    wastePct: 10,
    periodStart: "2026-01-10",
    periodEnd: "2026-02-10",
  },
  {
    id: "8",
    name: "Corporate Line Q1 2026",
    category: "Collection",
    totalUnitsProduced: 1200,
    totalCOGS: 720000,
    costPerUnit: 600,
    sellingPrice: 980,
    marginPct: 38.8,
    materialsPct: 54,
    laborPct: 36,
    wastePct: 10,
    periodStart: "2026-01-01",
    periodEnd: "2026-03-31",
  },
];

// ------------------------------------------
// Component
// ------------------------------------------
const FINProfitabilityPage: React.FC = () => {
  const [items, setItems] = useState<ProfitabilityItem[]>(MOCK_ITEMS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<ProfitabilityItem | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // ------------------------------------------
  // Filtered data (useMemo)
  // ------------------------------------------
  const filteredItems = useMemo(() => {
    let data = items;
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      data = data.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q)
      );
    }
    if (filterCategory) {
      data = data.filter((i) => i.category === filterCategory);
    }
    if (dateStart) {
      data = data.filter((i) => i.periodEnd >= dateStart);
    }
    if (dateEnd) {
      data = data.filter((i) => i.periodStart <= dateEnd);
    }
    return data;
  }, [items, searchQuery, filterCategory, dateStart, dateEnd]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / ITEMS_PER_PAGE)
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(
    startIndex + ITEMS_PER_PAGE,
    filteredItems.length
  );
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  // ------------------------------------------
  // KPI values
  // ------------------------------------------
  const totalAnalyzed = filteredItems.length;
  const avgCostPerUnit = useMemo(() => {
    if (filteredItems.length === 0) return 0;
    const sum = filteredItems.reduce((s, i) => s + i.costPerUnit, 0);
    return Math.round(sum / filteredItems.length);
  }, [filteredItems]);
  const bestMargin = useMemo(() => {
    const withMargin = filteredItems.filter((i) => i.marginPct != null);
    if (withMargin.length === 0) return null;
    return Math.max(...withMargin.map((i) => i.marginPct!));
  }, [filteredItems]);
  const highestCOGS = useMemo(() => {
    if (filteredItems.length === 0) return 0;
    return Math.max(...filteredItems.map((i) => i.totalCOGS));
  }, [filteredItems]);

  // Cost Per Unit Trend by collection (for DefectTrendChart)
  const costPerUnitTrendData: TrendDataPoint[] = useMemo(() => {
    const collections = filteredItems.filter((i) => i.category === "Collection");
    return collections.map((c) => ({
      label: c.name.length > 12 ? c.name.slice(0, 12) + "…" : c.name,
      value: c.costPerUnit,
    }));
  }, [filteredItems]);

  // ------------------------------------------
  // Handlers
  // ------------------------------------------
  const handleExportPdf = () => {
    setToast({ message: "Export ready.", type: "success" });
  };
  const handleExportExcel = () => {
    setToast({ message: "Export ready.", type: "success" });
  };

  const filterLabel =
    filterCategory || dateStart || dateEnd
      ? [filterCategory, dateStart, dateEnd].filter(Boolean).join(" · ")
      : "Filters";

  return (
    <FinanceLayout>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Profitability Analysis
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Analyze profitability by SKU, collection, and season.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SecondaryButton icon={Download} onClick={handleExportPdf}>
            Export PDF
          </SecondaryButton>
          <SecondaryButton icon={Download} onClick={handleExportExcel}>
            Export Excel
          </SecondaryButton>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total SKUs Analyzed"
          value={totalAnalyzed}
          icon={Package}
          color="bg-indigo-500"
        />
        <StatsCard
          title="Avg Cost Per Unit"
          value={formatCurrency(avgCostPerUnit)}
          icon={TrendingUp}
          color="bg-emerald-500"
        />
        <StatsCard
          title="Best Margin"
          value={bestMargin != null ? `${bestMargin.toFixed(1)}%` : "—"}
          icon={Percent}
          color="bg-amber-500"
        />
        <StatsCard
          title="Highest COGS"
          value={formatCurrency(highestCOGS)}
          icon={PiggyBank}
          color="bg-violet-500"
        />
      </div>

      {/* Cost Per Unit Trend Chart */}
      <div className="mb-8">
        <DefectTrendChart
          title="Cost Per Unit Trend"
          data={costPerUnitTrendData}
          barColor="bg-emerald-500"
          emptyMessage="No collection data available for trend."
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <TableToolbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
          placeholder="Search by name or ID..."
          filterLabel={filterLabel}
        >
          <div className="p-3 space-y-2 min-w-[200px]">
            <IconSelect
              label="Category"
              value={filterCategory}
              onChange={(v) => {
                setFilterCategory(v);
                setCurrentPage(1);
              }}
              options={CATEGORY_OPTIONS}
              placeholder="All"
            />
            <InputGroup
              id="date-start"
              label="Date Start"
              type="date"
              value={dateStart}
              onChange={(e) => {
                setDateStart(e.target.value);
                setCurrentPage(1);
              }}
              icon={Calendar}
            />
            <InputGroup
              id="date-end"
              label="Date End"
              type="date"
              value={dateEnd}
              onChange={(e) => {
                setDateEnd(e.target.value);
                setCurrentPage(1);
              }}
              icon={Calendar}
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
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  SKU/Collection
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Units Produced
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total COGS (₱)
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Cost Per Unit (₱)
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Margin Estimate
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {paginatedItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-6 py-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                    {item.name}
                  </td>
                  <td className="px-6 py-3">
                    <StatusBadge status={item.category} />
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-400">
                    {item.totalUnitsProduced.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {formatCurrency(item.totalCOGS)}
                  </td>
                  <td className="px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {formatCurrency(item.costPerUnit)}
                  </td>
                  <td className="px-6 py-3 text-xs">
                    {item.marginPct != null ? (
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {item.marginPct.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 italic">
                        Cost-only view
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-left">
                    <div className="flex items-center justify-start gap-1">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                        title="View details"
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
            <Package size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              No profitability data found
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Try adjusting your search or filter criteria.
            </p>
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

      {/* View Detail Modal */}
      <PageModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.name ?? "Profitability Details"}
        subtitle={
          selectedItem
            ? `${selectedItem.id} · ${selectedItem.category}`
            : undefined
        }
        badges={
          selectedItem ? (
            <StatusBadge status={selectedItem.category} className="ml-2" />
          ) : undefined
        }
        maxWidth="max-w-2xl"
        footer={
          <div className="flex justify-start">
            <PrimaryButton onClick={() => setSelectedItem(null)} className="!w-auto !py-2.5 !px-6 !rounded-xl !text-xs">
              Close
            </PrimaryButton>
          </div>
        }
      >
        {selectedItem && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Units Produced
                </p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {selectedItem.totalUnitsProduced.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Total COGS
                </p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {formatCurrency(selectedItem.totalCOGS)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Cost Per Unit
                </p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {formatCurrency(selectedItem.costPerUnit)}
                </p>
              </div>
              {selectedItem.sellingPrice != null && (
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Selling Price
                  </p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {formatCurrency(selectedItem.sellingPrice)}
                  </p>
                </div>
              )}
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                COGS Breakdown
              </p>
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5">Materials</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {selectedItem.materialsPct}%
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5">Labor</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {selectedItem.laborPct}%
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5">Waste</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {selectedItem.wastePct}%
                  </p>
                </div>
              </div>
            </div>

            {selectedItem.marginPct != null ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
                  Margin
                </p>
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  {selectedItem.marginPct.toFixed(1)}% margin
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                  Based on selling price {formatCurrency(selectedItem.sellingPrice!)} vs cost per unit{" "}
                  {formatCurrency(selectedItem.costPerUnit)}.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Cost-only view — no selling price available for margin calculation.
                </p>
              </div>
            )}
          </>
        )}
      </PageModal>
    </FinanceLayout>
  );
};

export default FINProfitabilityPage;
