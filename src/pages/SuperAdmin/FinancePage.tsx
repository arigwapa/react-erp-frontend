// ==========================================
// FinancePage.tsx — Financial Oversight
// Super Admin overview for cross-branch cost
// monitoring, budget governance, and
// profitability analysis.
// ==========================================

import { useState, useMemo } from "react";
import {
  DollarSign,
  PieChart,
  TrendingUp,
  AlertTriangle,
  Lock,
  Unlock,
  FileText,
  Download,
  ShieldAlert,
  Coins,
  Activity,
  BarChart4,
  Eye,
  GitBranch,
  Calendar,
  Package,
} from "lucide-react";

// ------------------------------------------
// Layout & Reusable UI Components
// ------------------------------------------
import MainLayout from "../../layout/MainLayout";
import { Card } from "../../components/ui/Card";
import StatsCard from "../../components/ui/StatsCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { TableToolbar } from "../../components/ui/TableToolbar";
import Pagination from "../../components/ui/Pagination";
import SecondaryButton from "../../components/ui/SecondaryButton";
import PageModal from "../../components/ui/PageModal";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Toast from "../../components/ui/Toast";

// ==========================================
// Types
// ==========================================
type FinancialStatus = "Open" | "Locked" | "Audited";
type BudgetStatus = "Within Budget" | "At Risk" | "Over Budget";

interface CostBreakdown {
  materials: number;
  labor: number;
  overhead: number;
  waste: number; // Cost of defects/QA failures
}

interface FinancialRecord {
  id: string;
  periodOrBatch: string;
  type: "Monthly Period" | "Production Batch";
  branch: string;
  budgetAllocated: number;
  actualSpend: number;
  revenue: number;
  status: FinancialStatus;
  cogs: CostBreakdown;
  lastAudited: string;
}

// ==========================================
// Mock Data
// ==========================================
const MOCK_FINANCE_RECORDS: FinancialRecord[] = [
  {
    id: "FIN-2026-001",
    periodOrBatch: "Feb 2026 (Current)",
    type: "Monthly Period",
    branch: "Manila Main",
    budgetAllocated: 50000,
    actualSpend: 42000,
    revenue: 65000,
    status: "Open",
    cogs: { materials: 25000, labor: 12000, overhead: 3000, waste: 2000 },
    lastAudited: "Pending",
  },
  {
    id: "FIN-2026-002",
    periodOrBatch: "Batch-1029 (Denim Jackets)",
    type: "Production Batch",
    branch: "Cebu Factory",
    budgetAllocated: 12000,
    actualSpend: 13500,
    revenue: 15000,
    status: "Locked",
    cogs: { materials: 8000, labor: 4000, overhead: 500, waste: 1000 },
    lastAudited: "Feb 10, 2026",
  },
  {
    id: "FIN-2026-003",
    periodOrBatch: "Jan 2026",
    type: "Monthly Period",
    branch: "Davao Hub",
    budgetAllocated: 30000,
    actualSpend: 28000,
    revenue: 45000,
    status: "Audited",
    cogs: { materials: 15000, labor: 10000, overhead: 2500, waste: 500 },
    lastAudited: "Feb 01, 2026",
  },
  {
    id: "FIN-2026-004",
    periodOrBatch: "Batch-1035 (Polo Shirts)",
    type: "Production Batch",
    branch: "Cebu Factory",
    budgetAllocated: 8000,
    actualSpend: 7200,
    revenue: 11000,
    status: "Locked",
    cogs: { materials: 4500, labor: 2000, overhead: 400, waste: 300 },
    lastAudited: "Feb 08, 2026",
  },
  {
    id: "FIN-2026-005",
    periodOrBatch: "Feb 2026 (Current)",
    type: "Monthly Period",
    branch: "Cebu Factory",
    budgetAllocated: 35000,
    actualSpend: 33500,
    revenue: 48000,
    status: "Open",
    cogs: { materials: 18000, labor: 11000, overhead: 2500, waste: 2000 },
    lastAudited: "Pending",
  },
  {
    id: "FIN-2026-006",
    periodOrBatch: "Batch-1040 (Canvas Totes)",
    type: "Production Batch",
    branch: "Manila Main",
    budgetAllocated: 5000,
    actualSpend: 5800,
    revenue: 7200,
    status: "Open",
    cogs: { materials: 3200, labor: 1800, overhead: 300, waste: 500 },
    lastAudited: "Pending",
  },
  {
    id: "FIN-2026-007",
    periodOrBatch: "Jan 2026",
    type: "Monthly Period",
    branch: "Manila Main",
    budgetAllocated: 48000,
    actualSpend: 46000,
    revenue: 62000,
    status: "Audited",
    cogs: { materials: 26000, labor: 14000, overhead: 3500, waste: 2500 },
    lastAudited: "Feb 02, 2026",
  },
];

// ------------------------------------------
// Pagination Constants
// ------------------------------------------
const ITEMS_PER_PAGE = 5;

// ==========================================
// Main Component
// ==========================================
function FinancePage() {
  // ------------------------------------------
  // State: Data & Filtering
  // ------------------------------------------
  const [records, setRecords] =
    useState<FinancialRecord[]>(MOCK_FINANCE_RECORDS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBranch, setFilterBranch] = useState<string>("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // ------------------------------------------
  // State: Details Modal
  // ------------------------------------------
  const [selectedRecord, setSelectedRecord] =
    useState<FinancialRecord | null>(null);

  // ------------------------------------------
  // State: Toast & Confirmation Modal
  // ------------------------------------------
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
    variant: "primary" | "danger";
    confirmText: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
    action: () => {},
    variant: "primary",
    confirmText: "Confirm",
  });

  // ------------------------------------------
  // Computed: KPI Metrics
  // ------------------------------------------
  const metrics = useMemo(() => {
    const totalRevenue = records.reduce((acc, r) => acc + r.revenue, 0);
    const totalSpend = records.reduce((acc, r) => acc + r.actualSpend, 0);
    const totalWaste = records.reduce((acc, r) => acc + r.cogs.waste, 0);
    const netProfit = totalRevenue - totalSpend;
    const profitMargin =
      totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const overBudgetCount = records.filter(
      (r) => r.actualSpend > r.budgetAllocated,
    ).length;

    return {
      totalRevenue,
      totalSpend,
      netProfit,
      profitMargin,
      totalWaste,
      overBudgetCount,
    };
  }, [records]);

  // ------------------------------------------
  // Computed: Filtered Records
  // ------------------------------------------
  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        record.periodOrBatch
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        record.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBranch =
        filterBranch === "All" || record.branch === filterBranch;
      return matchesSearch && matchesBranch;
    });
  }, [records, searchQuery, filterBranch]);

  // ------------------------------------------
  // Computed: Pagination
  // ------------------------------------------
  const totalPages = Math.max(
    1,
    Math.ceil(filteredRecords.length / ITEMS_PER_PAGE),
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(
    startIndex + ITEMS_PER_PAGE,
    filteredRecords.length,
  );
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

  // ------------------------------------------
  // Handler: Toast
  // ------------------------------------------
  const triggerToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  // ------------------------------------------
  // Handler: Export
  // ------------------------------------------
  const handleExport = () => {
    triggerToast("Exporting P&L Report...", "success");
  };

  // ------------------------------------------
  // Handler: Update record fields
  // ------------------------------------------
  const updateRecord = (id: string, updates: Partial<FinancialRecord>) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    );
    setSelectedRecord((prev) =>
      prev && prev.id === id ? { ...prev, ...updates } : prev,
    );
  };

  // ------------------------------------------
  // Handler: Toggle Lock/Unlock (Super Admin)
  // ------------------------------------------
  const handleToggleLock = (record: FinancialRecord) => {
    const isLocked =
      record.status === "Locked" || record.status === "Audited";
    const newStatus: FinancialStatus = isLocked ? "Open" : "Locked";

    setConfirmModal({
      isOpen: true,
      title: isLocked
        ? "Unlock Financial Period?"
        : "Lock Financial Period?",
      message: isLocked
        ? "Unlocking allows operational users to modify cost data. This may affect generated reports."
        : "Locking prevents any further modification to expenses and production costs for this period.",
      variant: isLocked ? "danger" : "primary",
      confirmText: isLocked ? "Unlock Period" : "Lock Period",
      action: () => {
        updateRecord(record.id, { status: newStatus });
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        triggerToast(
          `Record ${record.id} is now ${newStatus}.`,
          "success",
        );
      },
    });
  };

  // ------------------------------------------
  // Handler: Authorize Budget Override (Super Admin)
  // ------------------------------------------
  const handleOverrideBudget = (record: FinancialRecord) => {
    setConfirmModal({
      isOpen: true,
      title: "Authorize Budget Overflow?",
      message: `You are authorizing an overspend of $${(record.actualSpend - record.budgetAllocated).toLocaleString()}. This will be flagged in the Executive Audit.`,
      variant: "danger",
      confirmText: "Authorize Override",
      action: () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        triggerToast(
          `Budget overflow authorized for ${record.periodOrBatch}.`,
          "success",
        );
      },
    });
  };

  // ------------------------------------------
  // Helper: Budget status from spend vs allocated
  // ------------------------------------------
  const getBudgetStatus = (
    allocated: number,
    spent: number,
  ): BudgetStatus => {
    const ratio = spent / allocated;
    if (ratio > 1) return "Over Budget";
    if (ratio > 0.9) return "At Risk";
    return "Within Budget";
  };

  // ------------------------------------------
  // Helper: Budget bar color
  // ------------------------------------------
  const getBudgetBarColor = (status: BudgetStatus) => {
    if (status === "Over Budget") return "bg-rose-500";
    if (status === "At Risk") return "bg-amber-500";
    return "bg-emerald-500";
  };

  // ------------------------------------------
  // Helper: COGS bar width (proportional)
  // ------------------------------------------
  const getCOGSPercent = (amount: number, total: number) =>
    total > 0 ? Math.round((amount / total) * 100) : 0;

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <>
      {/* ==========================================
          MAIN LAYOUT — Page content only
          All modals rendered OUTSIDE MainLayout
          so backdrop covers entire viewport.
          ========================================== */}
      <MainLayout>
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
          {/* ==========================================
              SECTION 1: PAGE HEADER
              Title (no icon) + Subtitle + Export Button
              ========================================== */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Financial Oversight
              </h1>
              <p className="text-xs font-medium text-slate-500 mt-1">
                Cross-branch cost monitoring, budget governance, and
                profitability analysis.
              </p>
            </div>

            {/* Export Button — uses SecondaryButton */}
            <SecondaryButton
              onClick={handleExport}
              icon={Download}
              ariaLabel="Export P&L Report"
            >
              Export Report
            </SecondaryButton>
          </div>

          {/* ==========================================
              SECTION 2: KPI STATS CARDS
              Uses StatsCard component
              ========================================== */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard
              title="Net Profit"
              value={`$${metrics.netProfit.toLocaleString()}`}
              icon={TrendingUp}
              color="bg-emerald-500"
              trend={`${metrics.profitMargin.toFixed(1)}% Margin`}
              trendUp={metrics.profitMargin > 15}
            />
            <StatsCard
              title="Total Spend"
              value={`$${metrics.totalSpend.toLocaleString()}`}
              icon={Coins}
              color="bg-blue-500"
            />
            <StatsCard
              title="Cost Leakage"
              value={`$${metrics.totalWaste.toLocaleString()}`}
              icon={AlertTriangle}
              color="bg-rose-500"
            />
            <StatsCard
              title="Budget Alerts"
              value={metrics.overBudgetCount}
              icon={ShieldAlert}
              color="bg-indigo-500"
            />
          </div>

          {/* ==========================================
              SECTION 3: FINANCIAL RECORDS TABLE
              Card wraps toolbar, table, and pagination
              ========================================== */}
          <Card className="overflow-hidden">
            {/* 3a. TableToolbar — Search & Branch Filter */}
            <div className="px-5 pt-5">
              <TableToolbar
                searchQuery={searchQuery}
                setSearchQuery={(q) => {
                  setSearchQuery(q);
                  setCurrentPage(1);
                }}
                isFilterOpen={isFilterOpen}
                setIsFilterOpen={setIsFilterOpen}
                placeholder="Search Period, Batch, or Branch..."
                filterLabel={
                  filterBranch === "All" ? "All Branches" : filterBranch
                }
              >
                {/* Branch filter options */}
                <div
                  className="p-1.5"
                  role="group"
                  aria-label="Filter by Branch"
                >
                  {[
                    "All",
                    "Manila Main",
                    "Cebu Factory",
                    "Davao Hub",
                  ].map((branch) => (
                    <button
                      key={branch}
                      role="option"
                      aria-selected={filterBranch === branch}
                      onClick={() => {
                        setFilterBranch(branch);
                        setIsFilterOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                        filterBranch === branch
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {branch === "All" ? "All Branches" : branch}
                    </button>
                  ))}
                </div>
              </TableToolbar>
            </div>

            {/* 3b. Financial Records Data Table */}
            <div className="overflow-x-auto">
              <table
                className="w-full text-left border-collapse"
                aria-label="Financial Records"
              >
                {/* Table Header — text-xs (12px) font-bold */}
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Period / Batch
                    </th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Branch
                    </th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Budget Progress
                    </th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-sm">
                  {paginatedRecords.map((record) => {
                    const percentage = Math.min(
                      100,
                      Math.round(
                        (record.actualSpend / record.budgetAllocated) * 100,
                      ),
                    );
                    const budgetStatus = getBudgetStatus(
                      record.budgetAllocated,
                      record.actualSpend,
                    );

                    return (
                      <tr
                        key={record.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        {/* Period/Batch Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                              {record.type === "Monthly Period" ? (
                                <Activity size={18} />
                              ) : (
                                <FileText size={18} />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 text-sm">
                                {record.periodOrBatch}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                {record.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Branch */}
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-700">
                            {record.branch}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {record.type}
                          </div>
                        </td>

                        {/* Budget Progress — bar + StatusBadge for budget status */}
                        <td className="px-6 py-4 w-52">
                          <div className="flex justify-between text-[11px] mb-1.5">
                            <span className="text-slate-500">
                              ${record.actualSpend.toLocaleString()}
                            </span>
                            <span className="text-slate-400">
                              / ${record.budgetAllocated.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-2">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${getBudgetBarColor(budgetStatus)}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <StatusBadge
                            status={budgetStatus}
                            className="!text-[10px] !py-0.5 !px-2"
                          />
                        </td>

                        {/* Financial Status — uses StatusBadge + Lock icon */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={record.status} />
                            {(record.status === "Locked" ||
                              record.status === "Audited") && (
                              <Lock
                                size={12}
                                className="text-slate-400"
                                aria-label="Period locked"
                              />
                            )}
                          </div>
                        </td>

                        {/* Actions: Details button */}
                        <td className="px-6 py-4 text-left">
                          <button
                            onClick={() => setSelectedRecord(record)}
                            className="inline-flex items-center gap-1 whitespace-nowrap text-left.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                            aria-label={`View details for ${record.periodOrBatch}`}
                          >
                            <Eye size={14} />
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Empty State */}
                  {filteredRecords.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-16 text-center text-slate-400 text-sm"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <DollarSign
                            size={32}
                            className="text-slate-300"
                          />
                          <p className="font-medium">
                            No financial records found
                          </p>
                          <p className="text-xs">
                            Try adjusting your search or filter criteria.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 3c. Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              startIndex={startIndex}
              endIndex={endIndex}
              totalItems={filteredRecords.length}
              onPageChange={setCurrentPage}
            />
          </Card>
        </div>
      </MainLayout>

      {/* ==========================================
          MODALS — Rendered OUTSIDE MainLayout
          so backdrop + blur covers the entire viewport.
          Ordered: Details → Confirmation → Toast
          ========================================== */}

      {/* ---- SECTION 4: DETAILS MODAL (uses PageModal) ---- */}
      {selectedRecord && (() => {
        const totalCOGS =
          selectedRecord.cogs.materials +
          selectedRecord.cogs.labor +
          selectedRecord.cogs.overhead +
          selectedRecord.cogs.waste;
        const recordBudgetStatus = getBudgetStatus(
          selectedRecord.budgetAllocated,
          selectedRecord.actualSpend,
        );
        const recordMargin =
          selectedRecord.revenue > 0
            ? (
                ((selectedRecord.revenue - selectedRecord.actualSpend) /
                  selectedRecord.revenue) *
                100
              ).toFixed(1)
            : "0";

        return (
          <PageModal
            isOpen
            onClose={() => setSelectedRecord(null)}
            title={selectedRecord.periodOrBatch}
            badges={
              <StatusBadge
                status={selectedRecord.status}
                className="!text-[10px] !py-0.5"
              />
            }
            subtitle={
              <>
                {selectedRecord.branch} &bull; {selectedRecord.type} &bull;{" "}
                {selectedRecord.id}
              </>
            }
            ariaId="details-modal-title"
          >
            {/* A. Fiscal Governance Zone */}
            <div className="bg-slate-50 border border-indigo-100 rounded-xl p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
              <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-2 mb-2">
                <ShieldAlert size={14} />
                Fiscal Governance
              </h3>
              <p className="text-[11px] text-slate-500 mb-4">
                Control the financial state of this period. Locking
                prevents operational changes.
              </p>
              <div className="flex flex-wrap gap-2">
                <SecondaryButton
                  onClick={() => handleToggleLock(selectedRecord)}
                  icon={selectedRecord.status === "Locked" ? Unlock : Lock}
                  className="!px-3 !py-2 !text-[11px]"
                >
                  {selectedRecord.status === "Locked"
                    ? "Unlock Period"
                    : "Lock Period"}
                </SecondaryButton>
                <SecondaryButton
                  onClick={() => handleOverrideBudget(selectedRecord)}
                  disabled={
                    selectedRecord.actualSpend <=
                    selectedRecord.budgetAllocated
                  }
                  icon={ShieldAlert}
                  className="!px-3 !py-2 !text-[11px]"
                >
                  Authorize Overflow
                </SecondaryButton>
              </div>
            </div>

            {/* B. Budget Overview */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                <BarChart4 size={14} className="text-slate-400" />
                Budget Overview
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-slate-200 rounded-xl">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <DollarSign size={10} /> Allocated
                  </span>
                  <p className="text-xl font-bold text-slate-900 mt-2">
                    ${selectedRecord.budgetAllocated.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-white border border-slate-200 rounded-xl">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <Coins size={10} /> Spent
                  </span>
                  <p className="text-xl font-bold text-slate-900 mt-2">
                    ${selectedRecord.actualSpend.toLocaleString()}
                  </p>
                  <StatusBadge
                    status={recordBudgetStatus}
                    className="!text-[10px] !py-0.5 !px-2 mt-2"
                  />
                </div>
              </div>
            </div>

            {/* C. Cost Transparency (COGS) */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                <PieChart size={14} className="text-slate-400" />
                Cost Transparency (COGS)
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Materials</span>
                  <p className="text-base font-bold text-slate-800 mt-1">${selectedRecord.cogs.materials.toLocaleString()}</p>
                  <div className="w-full bg-slate-100 h-1 mt-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${getCOGSPercent(selectedRecord.cogs.materials, totalCOGS)}%` }} />
                  </div>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Labor</span>
                  <p className="text-base font-bold text-slate-800 mt-1">${selectedRecord.cogs.labor.toLocaleString()}</p>
                  <div className="w-full bg-slate-100 h-1 mt-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-1 rounded-full" style={{ width: `${getCOGSPercent(selectedRecord.cogs.labor, totalCOGS)}%` }} />
                  </div>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Overhead</span>
                  <p className="text-base font-bold text-slate-800 mt-1">${selectedRecord.cogs.overhead.toLocaleString()}</p>
                  <div className="w-full bg-slate-100 h-1 mt-2 rounded-full overflow-hidden">
                    <div className="bg-slate-400 h-1 rounded-full" style={{ width: `${getCOGSPercent(selectedRecord.cogs.overhead, totalCOGS)}%` }} />
                  </div>
                </div>
                <div className="p-3 border border-rose-100 bg-rose-50/50 rounded-xl">
                  <span className="text-[10px] text-rose-600 uppercase font-bold flex items-center gap-1">
                    <AlertTriangle size={10} /> Waste / Defects
                  </span>
                  <p className="text-base font-bold text-rose-700 mt-1">${selectedRecord.cogs.waste.toLocaleString()}</p>
                  <p className="text-[10px] text-rose-500 mt-1">Direct cost of quality failures</p>
                </div>
              </div>
            </div>

            {/* D. Profitability Analysis — dark card */}
            <div className="bg-slate-900 text-white p-5 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <BarChart4 size={14} className="text-indigo-400" />
                  Profitability Analysis
                </h4>
                <span className="text-[10px] bg-slate-800 px-2 py-1 rounded-full text-slate-300 font-bold">
                  {recordMargin}% Margin
                </span>
              </div>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400 text-xs">Total Revenue</span>
                  <span className="font-mono text-emerald-400 text-xs font-bold">+ ${selectedRecord.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-xs">Total Cost (COGS)</span>
                  <span className="font-mono text-rose-400 text-xs font-bold">- ${selectedRecord.actualSpend.toLocaleString()}</span>
                </div>
                <div className="h-px bg-slate-700" />
                <div className="flex justify-between text-base font-bold">
                  <span>Net Profit</span>
                  <span>${(selectedRecord.revenue - selectedRecord.actualSpend).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* E. Record Metadata */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                <FileText size={14} className="text-slate-400" />
                Record Details
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm border-t border-slate-100 pt-4">
                <div className="space-y-1">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><GitBranch size={10} /> Branch</span>
                  <span className="text-sm font-semibold text-slate-700">{selectedRecord.branch}</span>
                </div>
                <div className="space-y-1">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Calendar size={10} /> Last Audited</span>
                  <span className="text-sm font-semibold text-slate-700">{selectedRecord.lastAudited}</span>
                </div>
                <div className="space-y-1">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Package size={10} /> Type</span>
                  <span className="text-sm font-semibold text-slate-700">{selectedRecord.type}</span>
                </div>
                <div className="space-y-1">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><DollarSign size={10} /> Revenue</span>
                  <span className="text-sm font-semibold text-slate-700">${selectedRecord.revenue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </PageModal>
        );
      })()}

      {/* ---- CONFIRMATION MODAL ---- */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.action}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmText={confirmModal.confirmText}
      />

      {/* ---- TOAST NOTIFICATION ---- */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

export default FinancePage;
