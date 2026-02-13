// ==========================================
// FINCOGSReviewPage.tsx
// Finance Manager — COGS Review by Work Order
// Review COGS per work order with material usage comparison.
// KPI cards, filters, detail modal with material variance, anomaly flag, request correction.
// ==========================================

import React, { useState, useMemo } from "react";
import FinanceLayout from "../../layout/FinanceLayout";
import StatsCard from "../../components/ui/StatsCard";
import { TableToolbar } from "../../components/ui/TableToolbar";
import Pagination from "../../components/ui/Pagination";
import PageModal from "../../components/ui/PageModal";
import Toast from "../../components/ui/Toast";
import IconSelect from "../../components/ui/IconSelect";
import type { IconSelectOption } from "../../components/ui/IconSelect";
import SecondaryButton from "../../components/ui/SecondaryButton";
import PrimaryButton from "../../components/ui/PrimaryButton";
import {
  FileSearch,
  ClipboardList,
  Percent,
  AlertTriangle,
  Eye,
  Flag,
  Send,
  CheckCircle2,
  Link2,
  Archive,
} from "lucide-react";

// ------------------------------------------
// Types
// ------------------------------------------
interface MaterialUsage {
  materialName: string;
  plannedQty: number;
  actualQty: number;
  variance: number;
  variancePercent: number;
}

interface WorkOrder {
  id: string;
  sku: string;
  version: string;
  plannedQty: number;
  outputQty: number;
  yieldPercent: number;
  totalCOGS: number;
  anomalyFlag: boolean;
  materials: MaterialUsage[];
  wasteQtyImpact: number;
  costId?: string;
}

// ------------------------------------------
// Constants
// ------------------------------------------
const ITEMS_PER_PAGE = 6;

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

const ANOMALY_OPTIONS: IconSelectOption[] = [
  { value: "", label: "All", icon: ClipboardList },
  { value: "flagged", label: "Flagged", icon: Flag },
  { value: "clean", label: "Clean", icon: CheckCircle2 },
];

const getVarianceColor = (variancePercent: number): string => {
  const abs = Math.abs(variancePercent);
  if (abs < 5) return "text-emerald-600 dark:text-emerald-400";
  if (abs <= 10) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
};

// ------------------------------------------
// Mock Data
// ------------------------------------------
const MOCK_WORK_ORDERS: WorkOrder[] = [
  {
    id: "WO-2026-001",
    sku: "TEE-SUM-COT-001",
    version: "v1.2",
    plannedQty: 500,
    outputQty: 485,
    yieldPercent: 97,
    totalCOGS: 124_500,
    anomalyFlag: true,
    materials: [
      { materialName: "Cotton Jersey 180gsm", plannedQty: 550, actualQty: 572, variance: 22, variancePercent: 4.0 },
      { materialName: "Rib Trim White", plannedQty: 520, actualQty: 548, variance: 28, variancePercent: 5.4 },
      { materialName: "Thread White #40", plannedQty: 12, actualQty: 13, variance: 1, variancePercent: 8.3 },
    ],
    wasteQtyImpact: 15,
    costId: "COST-2026-0892",
  },
  {
    id: "WO-2026-002",
    sku: "PNT-DEN-SLM-002",
    version: "v2.0",
    plannedQty: 300,
    outputQty: 298,
    yieldPercent: 99.3,
    totalCOGS: 89_400,
    anomalyFlag: false,
    materials: [
      { materialName: "Denim 12oz Indigo", plannedQty: 360, actualQty: 358, variance: -2, variancePercent: -0.6 },
      { materialName: "YKK Zipper #5", plannedQty: 305, actualQty: 302, variance: -3, variancePercent: -1.0 },
      { materialName: "Rivets Set", plannedQty: 300, actualQty: 298, variance: -2, variancePercent: -0.7 },
    ],
    wasteQtyImpact: 2,
    costId: "COST-2026-0893",
  },
  {
    id: "WO-2026-003",
    sku: "JKT-BOM-001",
    version: "v1.0",
    plannedQty: 200,
    outputQty: 178,
    yieldPercent: 89,
    totalCOGS: 156_200,
    anomalyFlag: true,
    materials: [
      { materialName: "Bomber Shell Fabric", plannedQty: 220, actualQty: 245, variance: 25, variancePercent: 11.4 },
      { materialName: "Lining Polyester", plannedQty: 210, actualQty: 218, variance: 8, variancePercent: 3.8 },
      { materialName: "Elastic Cuff", plannedQty: 410, actualQty: 420, variance: 10, variancePercent: 2.4 },
    ],
    wasteQtyImpact: 22,
  },
  {
    id: "WO-2026-004",
    sku: "SKT-MID-PLE-003",
    version: "v1.1",
    plannedQty: 400,
    outputQty: 392,
    yieldPercent: 98,
    totalCOGS: 78_400,
    anomalyFlag: false,
    materials: [
      { materialName: "Pleated Polyester", plannedQty: 440, actualQty: 438, variance: -2, variancePercent: -0.5 },
      { materialName: "Waistband Elastic", plannedQty: 420, actualQty: 415, variance: -5, variancePercent: -1.2 },
    ],
    wasteQtyImpact: 8,
    costId: "COST-2026-0895",
  },
  {
    id: "WO-2026-005",
    sku: "DRS-MAX-001",
    version: "v2.1",
    plannedQty: 150,
    outputQty: 132,
    yieldPercent: 88,
    totalCOGS: 99_000,
    anomalyFlag: true,
    materials: [
      { materialName: "Maxi Dress Fabric", plannedQty: 165, actualQty: 182, variance: 17, variancePercent: 10.3 },
      { materialName: "Bias Binding", plannedQty: 320, actualQty: 335, variance: 15, variancePercent: 4.7 },
    ],
    wasteQtyImpact: 18,
  },
  {
    id: "WO-2026-006",
    sku: "POL-BAS-001",
    version: "v1.0",
    plannedQty: 800,
    outputQty: 792,
    yieldPercent: 99,
    totalCOGS: 79_200,
    anomalyFlag: false,
    materials: [
      { materialName: "Polo Pique Cotton", plannedQty: 880, actualQty: 875, variance: -5, variancePercent: -0.6 },
      { materialName: "Collar Rib", plannedQty: 850, actualQty: 848, variance: -2, variancePercent: -0.2 },
    ],
    wasteQtyImpact: 8,
    costId: "COST-2026-0897",
  },
  {
    id: "WO-2026-007",
    sku: "BLZ-SIL-002",
    version: "v1.3",
    plannedQty: 250,
    outputQty: 243,
    yieldPercent: 97.2,
    totalCOGS: 121_500,
    anomalyFlag: false,
    materials: [
      { materialName: "Silk Blend Shell", plannedQty: 275, actualQty: 278, variance: 3, variancePercent: 1.1 },
      { materialName: "Lining Satin", plannedQty: 265, actualQty: 270, variance: 5, variancePercent: 1.9 },
    ],
    wasteQtyImpact: 7,
    costId: "COST-2026-0898",
  },
];

// ==========================================
// Component
// ==========================================
const FINCOGSReviewPage: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(MOCK_WORK_ORDERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAnomaly, setFilterAnomaly] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [showCorrectionForm, setShowCorrectionForm] = useState(false);
  const [correctionDetails, setCorrectionDetails] = useState("");

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // ------------------------------------------
  // Computed
  // ------------------------------------------
  const totalReviewed = workOrders.length;
  const avgYield = useMemo(() => {
    if (workOrders.length === 0) return 0;
    const sum = workOrders.reduce((s, w) => s + w.yieldPercent, 0);
    return (sum / workOrders.length).toFixed(1);
  }, [workOrders]);
  const flaggedCount = useMemo(() => workOrders.filter((w) => w.anomalyFlag).length, [workOrders]);

  const filteredWOs = useMemo(() => {
    let data = workOrders;
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      data = data.filter(
        (w) =>
          w.id.toLowerCase().includes(q) ||
          w.sku.toLowerCase().includes(q) ||
          w.version.toLowerCase().includes(q)
      );
    }
    if (filterAnomaly === "flagged") {
      data = data.filter((w) => w.anomalyFlag);
    } else if (filterAnomaly === "clean") {
      data = data.filter((w) => !w.anomalyFlag);
    }
    return data;
  }, [workOrders, searchQuery, filterAnomaly]);

  const totalPages = Math.max(1, Math.ceil(filteredWOs.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredWOs.length);
  const paginatedWOs = filteredWOs.slice(startIndex, endIndex);

  // ------------------------------------------
  // Handlers
  // ------------------------------------------
  const openDetail = (wo: WorkOrder) => {
    setSelectedWO(wo);
    setShowCorrectionForm(false);
    setCorrectionDetails("");
    setIsDetailOpen(true);
  };

  const handleFlagAnomaly = () => {
    if (!selectedWO) return;
    setWorkOrders((prev) =>
      prev.map((w) =>
        w.id === selectedWO.id ? { ...w, anomalyFlag: !w.anomalyFlag } : w
      )
    );
    setSelectedWO((prev) => (prev ? { ...prev, anomalyFlag: !prev.anomalyFlag } : null));
    setToast({
      message: selectedWO.anomalyFlag ? "Anomaly flag removed." : "Anomaly flagged for review.",
      type: "success",
    });
  };

  const handleRequestCorrection = () => {
    if (!selectedWO) return;
    if (!correctionDetails.trim()) {
      setToast({ message: "Please enter correction details.", type: "error" });
      return;
    }
    setToast({
      message: `Correction request sent to Production/Warehouse for ${selectedWO.id}.`,
      type: "success",
    });
    setShowCorrectionForm(false);
    setCorrectionDetails("");
    setIsDetailOpen(false);
    setSelectedWO(null);
  };

  const filterLabel =
    filterAnomaly === "flagged"
      ? "Flagged"
      : filterAnomaly === "clean"
        ? "Clean"
        : "Filters";

  return (
    <FinanceLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">COGS Review by Work Order</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review COGS per work order with material usage comparison — Manila Branch</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatsCard title="Total WOs Reviewed" value={totalReviewed} icon={ClipboardList} color="bg-indigo-500" />
        <StatsCard title="Avg Yield %" value={`${avgYield}%`} icon={Percent} color="bg-emerald-500" />
        <StatsCard title="Flagged Anomalies" value={flaggedCount} icon={AlertTriangle} color="bg-amber-500" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <TableToolbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
          placeholder="Search by Order ID, SKU..."
          filterLabel={filterLabel}
        >
          <div className="p-3 space-y-2 min-w-[180px]">
            <IconSelect
              label="Anomaly Flag"
              value={filterAnomaly}
              onChange={(v) => {
                setFilterAnomaly(v);
                setCurrentPage(1);
              }}
              options={ANOMALY_OPTIONS}
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
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Version</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Planned Qty</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Output Qty</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Yield %</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total COGS (₱)</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Anomaly Flag</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {paginatedWOs.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-3 text-xs font-bold text-indigo-600 dark:text-indigo-400">{w.id}</td>
                  <td className="px-6 py-3 text-sm font-medium text-slate-800 dark:text-slate-200">{w.sku}</td>
                  <td className="px-6 py-3 text-xs text-slate-600 dark:text-slate-400">{w.version}</td>
                  <td className="px-6 py-3 text-sm text-slate-700 dark:text-slate-300">{w.plannedQty}</td>
                  <td className="px-6 py-3 text-sm text-slate-700 dark:text-slate-300">{w.outputQty}</td>
                  <td className="px-6 py-3 text-sm font-medium text-slate-800 dark:text-slate-200">{w.yieldPercent}%</td>
                  <td className="px-6 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(w.totalCOGS)}</td>
                  <td className="px-6 py-3">
                    {w.anomalyFlag ? (
                      <span className="inline-flex items-center gap-1 whitespace-nowrap text-left px-2 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        <Flag size={10} /> Flagged
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 whitespace-nowrap text-left px-2 py-1 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                        <CheckCircle2 size={10} /> Clean
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-left">
                    <div className="flex items-center justify-start gap-1">
                      <button
                        onClick={() => openDetail(w)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setWorkOrders((prev) => prev.filter((x) => x.id !== w.id));
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
        {filteredWOs.length === 0 && (
          <div className="px-6 py-16 text-center">
            <FileSearch size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No work orders found</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try adjusting your search or filter criteria.</p>
          </div>
        )}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={filteredWOs.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Detail Modal */}
      <PageModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedWO(null);
          setShowCorrectionForm(false);
          setCorrectionDetails("");
        }}
        title={selectedWO ? `Work Order ${selectedWO.id}` : "Work Order Details"}
        subtitle={selectedWO ? `${selectedWO.sku} · ${selectedWO.version}` : undefined}
        maxWidth="max-w-2xl"
        footer={
          <div className="flex justify-end gap-3">
            <SecondaryButton
              onClick={() => {
                setIsDetailOpen(false);
                setSelectedWO(null);
                setShowCorrectionForm(false);
                setCorrectionDetails("");
              }}
            >
              Close
            </SecondaryButton>
            {selectedWO && (
              <>
                <SecondaryButton onClick={handleFlagAnomaly} className="!w-auto !py-2.5 !px-4 !rounded-xl !text-xs">
                  <Flag size={14} />
                  {selectedWO.anomalyFlag ? "Remove Flag" : "Flag Anomaly"}
                </SecondaryButton>
                {!showCorrectionForm ? (
                  <PrimaryButton
                    onClick={() => setShowCorrectionForm(true)}
                    className="!w-auto !py-2.5 !px-4 !rounded-xl !text-xs"
                  >
                    <Send size={14} />
                    Request Correction
                  </PrimaryButton>
                ) : (
                  <PrimaryButton
                    onClick={handleRequestCorrection}
                    className="!w-auto !py-2.5 !px-4 !rounded-xl !text-xs"
                  >
                    <Send size={14} />
                    Send Request
                  </PrimaryButton>
                )}
              </>
            )}
          </div>
        }
      >
        {selectedWO && (
          <>
            {/* Order Header */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">SKU</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{selectedWO.sku}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Version</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{selectedWO.version}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Planned Qty</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{selectedWO.plannedQty}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Output Qty</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{selectedWO.outputQty}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Yield %</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{selectedWO.yieldPercent}%</p>
              </div>
            </div>

            {/* Material Usage Summary */}
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Material Usage Summary</p>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                      <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Material Name</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Planned Qty</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Actual Qty</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Variance</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Variance %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {selectedWO.materials.map((m, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-2 font-medium text-slate-800 dark:text-slate-200">{m.materialName}</td>
                        <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{m.plannedQty}</td>
                        <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{m.actualQty}</td>
                        <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{m.variance >= 0 ? `+${m.variance}` : m.variance}</td>
                        <td className={`px-4 py-2 font-semibold ${getVarianceColor(m.variancePercent)}`}>
                          {m.variancePercent >= 0 ? `+${m.variancePercent.toFixed(1)}%` : `${m.variancePercent.toFixed(1)}%`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Waste Quantity Impact */}
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Waste Quantity Impact</p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{selectedWO.wasteQtyImpact} units</p>
            </div>

            {/* Final Total COGS Record */}
            {selectedWO.costId && (
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Final Total COGS Record</p>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="inline-flex items-center gap-1 whitespace-nowrap text-left.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <Link2 size={14} />
                  {selectedWO.costId}
                </a>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{formatCurrency(selectedWO.totalCOGS)}</p>
              </div>
            )}

            {/* Request Correction Form */}
            {showCorrectionForm && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Correction Details</p>
                <textarea
                  value={correctionDetails}
                  onChange={(e) => setCorrectionDetails(e.target.value)}
                  placeholder="Describe the correction needed (e.g., material variance, yield discrepancy)..."
                  rows={4}
                  className="w-full px-4 py-3 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            )}
          </>
        )}
      </PageModal>
    </FinanceLayout>
  );
};

export default FINCOGSReviewPage;
