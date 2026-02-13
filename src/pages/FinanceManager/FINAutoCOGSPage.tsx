// ==========================================
// FINAutoCOGSPage.tsx
// Finance Manager — Auto-COGS (Cost Records)
// Auto-computed cost records linked to production orders.
// ==========================================

import React, { useState, useMemo } from "react";
import FinanceLayout from "../../layout/FinanceLayout";
import StatsCard from "../../components/ui/StatsCard";
import { TableToolbar } from "../../components/ui/TableToolbar";
import { StatusBadge } from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";
import PageModal from "../../components/ui/PageModal";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Toast from "../../components/ui/Toast";
import IconSelect from "../../components/ui/IconSelect";
import SecondaryButton from "../../components/ui/SecondaryButton";
import PrimaryButton from "../../components/ui/PrimaryButton";
import {
  Calculator,
  Wallet,
  TrendingUp,
  ClipboardCheck,
  Eye,
  Check,
  XCircle,
  Lock,
  Info,
  Archive,
} from "lucide-react";
import type { IconSelectOption } from "../../components/ui/IconSelect";

// ------------------------------------------
// Types
// ------------------------------------------
type CostStatus = "Draft" | "For Validation" | "Approved" | "Finalized";

interface CostBreakdown {
  materialsCost: number;
  laborCost: number;
  wasteCost: number;
  overheadCost?: number;
}

interface CostRecord {
  id: string;
  costId: string;
  orderId: string;
  sku: string;
  totalCogs: number;
  recordedDate: string;
  status: CostStatus;
  breakdown: CostBreakdown;
}

// ------------------------------------------
// Constants
// ------------------------------------------
const ITEMS_PER_PAGE = 6;

const statusOptions: IconSelectOption[] = [
  { value: "all", label: "All" },
  { value: "Draft", label: "Draft", icon: ClipboardCheck },
  { value: "For Validation", label: "For Validation", icon: Eye },
  { value: "Approved", label: "Approved", icon: Check },
  { value: "Finalized", label: "Finalized", icon: Lock },
];

// ------------------------------------------
// Mock data
// ------------------------------------------
const mockCostRecords: CostRecord[] = [
  {
    id: "1",
    costId: "COST-4501",
    orderId: "WO-102",
    sku: "SK-001 Polo Shirt",
    totalCogs: 145000,
    recordedDate: "2026-02-12",
    status: "For Validation",
    breakdown: {
      materialsCost: 89900,
      laborCost: 34800,
      wasteCost: 14500,
      overheadCost: 5800,
    },
  },
  {
    id: "2",
    costId: "COST-4502",
    orderId: "WO-103",
    sku: "SK-002 Denim Jacket",
    totalCogs: 278000,
    recordedDate: "2026-02-11",
    status: "Finalized",
    breakdown: {
      materialsCost: 172360,
      laborCost: 66720,
      wasteCost: 27800,
      overheadCost: 11120,
    },
  },
  {
    id: "3",
    costId: "COST-4503",
    orderId: "WO-104",
    sku: "SK-003 Cotton Dress",
    totalCogs: 92000,
    recordedDate: "2026-02-10",
    status: "Draft",
    breakdown: {
      materialsCost: 57040,
      laborCost: 22080,
      wasteCost: 9200,
      overheadCost: 3680,
    },
  },
  {
    id: "4",
    costId: "COST-4504",
    orderId: "WO-105",
    sku: "SK-004 Work Pants",
    totalCogs: 186000,
    recordedDate: "2026-02-09",
    status: "For Validation",
    breakdown: {
      materialsCost: 115320,
      laborCost: 44640,
      wasteCost: 18600,
      overheadCost: 7440,
    },
  },
  {
    id: "5",
    costId: "COST-4505",
    orderId: "WO-106",
    sku: "SK-005 Linen Blouse",
    totalCogs: 112000,
    recordedDate: "2026-02-08",
    status: "Draft",
    breakdown: {
      materialsCost: 69440,
      laborCost: 26880,
      wasteCost: 11200,
      overheadCost: 4480,
    },
  },
  {
    id: "6",
    costId: "COST-4506",
    orderId: "WO-107",
    sku: "SK-006 Hoodie",
    totalCogs: 198000,
    recordedDate: "2026-02-07",
    status: "Finalized",
    breakdown: {
      materialsCost: 122760,
      laborCost: 47520,
      wasteCost: 19800,
      overheadCost: 7920,
    },
  },
  {
    id: "7",
    costId: "COST-4507",
    orderId: "WO-108",
    sku: "SK-007 Chino Shorts",
    totalCogs: 76000,
    recordedDate: "2026-02-06",
    status: "For Validation",
    breakdown: {
      materialsCost: 47120,
      laborCost: 18240,
      wasteCost: 7600,
      overheadCost: 3040,
    },
  },
  {
    id: "8",
    costId: "COST-4508",
    orderId: "WO-109",
    sku: "SK-008 Tank Top",
    totalCogs: 54000,
    recordedDate: "2026-02-05",
    status: "Draft",
    breakdown: {
      materialsCost: 33480,
      laborCost: 12960,
      wasteCost: 5400,
      overheadCost: 2160,
    },
  },
];

// ------------------------------------------
// Component
// ------------------------------------------
const FINAutoCOGSPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<CostRecord | null>(null);
  const [showRejectSection, setShowRejectSection] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showFinalizeConfirm, setShowFinalizeConfirm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [records, setRecords] = useState<CostRecord[]>(mockCostRecords);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        r.costId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || r.status === statusFilter;
      const matchesDateStart = !dateStart || r.recordedDate >= dateStart;
      const matchesDateEnd = !dateEnd || r.recordedDate <= dateEnd;
      return matchesSearch && matchesStatus && matchesDateStart && matchesDateEnd;
    });
  }, [records, searchQuery, statusFilter, dateStart, dateEnd]);

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRecords.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRecords, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredRecords.length);

  const totalCogsPeriod = useMemo(
    () => filteredRecords.reduce((sum, r) => sum + r.totalCogs, 0),
    [filteredRecords]
  );
  const avgCogsPerOrder = useMemo(
    () =>
      filteredRecords.length > 0
        ? Math.round(totalCogsPeriod / filteredRecords.length)
        : 0,
    [filteredRecords.length, totalCogsPeriod]
  );
  const pendingValidation = useMemo(
    () => records.filter((r) => r.status === "For Validation").length,
    [records]
  );

  const handleApprove = () => {
    if (!selectedRecord) return;
    setRecords((prev) =>
      prev.map((r) =>
        r.id === selectedRecord.id ? { ...r, status: "Approved" as CostStatus } : r
      )
    );
    setSelectedRecord(null);
    setShowApproveConfirm(false);
    setToast({
      message: `Cost record ${selectedRecord.costId} approved.`,
      type: "success",
    });
  };

  const handleReject = () => {
    if (!selectedRecord || !rejectReason.trim()) return;
    setRecords((prev) =>
      prev.map((r) =>
        r.id === selectedRecord.id ? { ...r, status: "Draft" as CostStatus } : r
      )
    );
    setSelectedRecord(null);
    setShowRejectSection(false);
    setShowRejectConfirm(false);
    setRejectReason("");
    setToast({
      message: `Cost record ${selectedRecord.costId} rejected.`,
      type: "success",
    });
  };

  const handleFinalize = () => {
    if (!selectedRecord) return;
    setRecords((prev) =>
      prev.map((r) =>
        r.id === selectedRecord.id ? { ...r, status: "Finalized" as CostStatus } : r
      )
    );
    setSelectedRecord(null);
    setShowFinalizeConfirm(false);
    setToast({
      message: `Cost record ${selectedRecord.costId} finalized for reporting.`,
      type: "success",
    });
  };

  const openRejectConfirm = () => {
    if (!rejectReason.trim()) {
      setToast({ message: "Please enter a reason for rejection.", type: "error" });
      return;
    }
    setShowRejectConfirm(true);
  };

  const closeModal = () => {
    setSelectedRecord(null);
    setShowRejectSection(false);
    setRejectReason("");
  };

  const formatCurrency = (n: number) =>
    `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 0 })}`;

  const formatDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const getBreakdownPercentage = (amount: number, total: number) =>
    total > 0 ? Math.round((amount / total) * 100) : 0;

  const canFinalize = (r: CostRecord) =>
    r.status === "For Validation" || r.status === "Approved";

  return (
    <FinanceLayout>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Auto-COGS (Cost Records)
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Auto-computed cost records linked to production orders
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Cost Records"
          value={filteredRecords.length}
          icon={Calculator}
          color="bg-indigo-500"
        />
        <StatsCard
          title="Total COGS (Period)"
          value={formatCurrency(totalCogsPeriod)}
          icon={Wallet}
          color="bg-emerald-500"
        />
        <StatsCard
          title="Avg COGS per Order"
          value={formatCurrency(avgCogsPerOrder)}
          icon={TrendingUp}
          color="bg-amber-500"
        />
        <StatsCard
          title="Pending Validation"
          value={pendingValidation}
          icon={ClipboardCheck}
          color="bg-rose-500"
        />
      </div>

      {/* Toolbar */}
      <TableToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        placeholder="Search cost records..."
      >
        <div className="p-3 space-y-3 min-w-[220px]">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
              Date Range
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300"
              />
              <input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300"
              />
            </div>
          </div>
          <IconSelect
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            placeholder="All"
          />
        </div>
      </TableToolbar>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Cost ID
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Work Order / Order ID
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total COGS (₱)
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Recorded Date
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-3 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {r.costId}
                    </td>
                    <td className="px-6 py-3 text-xs font-medium text-slate-800 dark:text-slate-200">
                      {r.orderId}
                    </td>
                    <td className="px-6 py-3 text-xs font-medium text-slate-800 dark:text-slate-200">
                      {r.sku}
                    </td>
                    <td className="px-6 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {formatCurrency(r.totalCogs)}
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-600 dark:text-slate-400">
                      {formatDate(r.recordedDate)}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-6 py-3 text-left">
                      <div className="flex items-center justify-start gap-1">
                        <button
                          onClick={() => setSelectedRecord(r)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                          title="View Breakdown"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setRecords((prev) => prev.filter((x) => x.id !== r.id));
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
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-slate-400 italic"
                  >
                    No cost records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={filteredRecords.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* View Breakdown Modal */}
      <PageModal
        isOpen={!!selectedRecord}
        onClose={closeModal}
        title={`Cost Breakdown — ${selectedRecord?.costId || ""}`}
        subtitle={
          selectedRecord
            ? `${selectedRecord.orderId} · ${selectedRecord.sku} · ${formatDate(selectedRecord.recordedDate)}`
            : ""
        }
        badges={selectedRecord ? <StatusBadge status={selectedRecord.status} /> : undefined}
        maxWidth="max-w-2xl"
        footer={
          <div className="flex items-center gap-3">
            <SecondaryButton onClick={closeModal}>Close</SecondaryButton>
            {selectedRecord?.status === "For Validation" && (
              <>
                {!showRejectSection ? (
                  <button
                    onClick={() => setShowRejectSection(true)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors flex items-center gap-2 px-4 py-2.5 text-xs font-bold"
                  >
                    <XCircle size={14} />
                    Reject
                  </button>
                ) : (
                  <button
                    onClick={openRejectConfirm}
                    disabled={!rejectReason.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle size={14} />
                    Confirm Reject
                  </button>
                )}
                <PrimaryButton
                  onClick={() => setShowApproveConfirm(true)}
                  className="flex items-center gap-2 !py-2.5 !px-5 !text-xs !rounded-xl !bg-emerald-600 hover:!bg-emerald-700"
                >
                  <Check size={14} />
                  Approve
                </PrimaryButton>
              </>
            )}
            {selectedRecord &&
              canFinalize(selectedRecord) &&
              selectedRecord.status !== "Finalized" && (
                <PrimaryButton
                  onClick={() => setShowFinalizeConfirm(true)}
                  className="flex items-center gap-2 !py-2.5 !px-5 !text-xs !rounded-xl"
                >
                  <Lock size={14} />
                  Finalize
                </PrimaryButton>
              )}
          </div>
        }
      >
        {selectedRecord && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Cost ID
                </label>
                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  {selectedRecord.costId}
                </p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Order ID
                </label>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-1">
                  {selectedRecord.orderId}
                </p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  SKU
                </label>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-1">
                  {selectedRecord.sku}
                </p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Recorded Date
                </label>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-1">
                  {formatDate(selectedRecord.recordedDate)}
                </p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </label>
                <div className="mt-1">
                  <StatusBadge status={selectedRecord.status} />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Cost Breakdown
              </label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Materials Cost
                  </p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                    {formatCurrency(selectedRecord.breakdown.materialsCost)}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {getBreakdownPercentage(
                      selectedRecord.breakdown.materialsCost,
                      selectedRecord.totalCogs
                    )}
                    % of total
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Labor Cost
                  </p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                    {formatCurrency(selectedRecord.breakdown.laborCost)}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {getBreakdownPercentage(
                      selectedRecord.breakdown.laborCost,
                      selectedRecord.totalCogs
                    )}
                    % of total
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Waste Cost
                  </p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                    {formatCurrency(selectedRecord.breakdown.wasteCost)}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {getBreakdownPercentage(
                      selectedRecord.breakdown.wasteCost,
                      selectedRecord.totalCogs
                    )}
                    % of total
                  </p>
                </div>
                {selectedRecord.breakdown.overheadCost !== undefined && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Overhead
                    </p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                      {formatCurrency(selectedRecord.breakdown.overheadCost)}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {getBreakdownPercentage(
                        selectedRecord.breakdown.overheadCost,
                        selectedRecord.totalCogs
                      )}
                      % of total
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-4 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total COGS
                </p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {formatCurrency(selectedRecord.totalCogs)}
                </p>
              </div>
            </div>

            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl">
              <p className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium flex items-center gap-2">
                <Info size={14} />
                COGS is auto-computed from material usage, labor logs, and waste records.
              </p>
            </div>

            {showRejectSection && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Reason for Rejection (required)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  className="w-full px-4 py-3 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[80px] resize-none mt-2"
                />
              </div>
            )}
          </div>
        )}
      </PageModal>

      {/* Approve Confirmation */}
      <ConfirmationModal
        isOpen={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        onConfirm={handleApprove}
        title="Approve Cost Record"
        message={`Are you sure you want to approve ${selectedRecord?.costId}? This will finalize the record for reporting.`}
        confirmText="Approve"
      />

      {/* Reject Confirmation */}
      <ConfirmationModal
        isOpen={showRejectConfirm}
        onClose={() => setShowRejectConfirm(false)}
        onConfirm={handleReject}
        title="Reject Cost Record"
        message={`Are you sure you want to reject ${selectedRecord?.costId}? The record will return to Draft status.`}
        variant="danger"
        confirmText="Reject"
      />

      {/* Finalize Confirmation */}
      <ConfirmationModal
        isOpen={showFinalizeConfirm}
        onClose={() => setShowFinalizeConfirm(false)}
        onConfirm={handleFinalize}
        title="Finalize Cost Record"
        message={`Are you sure you want to finalize ${selectedRecord?.costId}? This will lock the record for reporting and it cannot be edited.`}
        confirmText="Finalize"
      />
    </FinanceLayout>
  );
};

export default FINAutoCOGSPage;
