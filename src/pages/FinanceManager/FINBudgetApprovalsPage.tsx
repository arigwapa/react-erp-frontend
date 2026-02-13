// ==========================================
// FINBudgetApprovalsPage.tsx
// Finance Manager — Budget Approvals
// Pending budgets waiting for approval/rejection.
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
import BudgetUtilizationBar from "../../components/ui/BudgetUtilizationBar";
import {
  ClipboardCheck,
  Wallet,
  CheckCircle2,
  Eye,
  Check,
  XCircle,
  Send,
  Archive,
} from "lucide-react";

// ------------------------------------------
// Types
// ------------------------------------------
interface BudgetApproval {
  id: string;
  budgetId: string;
  budgetName: string;
  requestedAmount: number;
  justification: string;
  expectedCogsVsBudget: string;
  status: string;
  impactSummary: string;
  breakdown: {
    materials: number;
    labor: number;
    waste: number;
  };
}

// ------------------------------------------
// Constants
// ------------------------------------------
const ITEMS_PER_PAGE = 5;

// ------------------------------------------
// Mock data
// ------------------------------------------
const mockBudgets: BudgetApproval[] = [
  {
    id: "1",
    budgetId: "BUD-2026-001",
    budgetName: "Summer Collection 2026",
    requestedAmount: 500_000,
    justification: "Additional materials budget required for expanded fabric inventory. Cotton prices increased 12% YoY. Need buffer for premium denim and linen for new product lines.",
    expectedCogsVsBudget: "92% of budget",
    status: "Pending",
    impactSummary: "Expected COGS will remain within 92% of allocated budget. Materials cost increase offset by efficiency gains in labor.",
    breakdown: { materials: 320_000, labor: 140_000, waste: 40_000 },
  },
  {
    id: "2",
    budgetId: "BUD-2026-002",
    budgetName: "Q2 Maintenance & Equipment",
    requestedAmount: 120_000,
    justification: "Sewing machine maintenance and calibration. 3 units require major overhaul. Preventive maintenance to avoid production downtime.",
    expectedCogsVsBudget: "88% of budget",
    status: "Pending",
    impactSummary: "Maintenance costs are one-time. No recurring COGS impact. Equipment reliability improves output by ~5%.",
    breakdown: { materials: 45_000, labor: 60_000, waste: 15_000 },
  },
  {
    id: "3",
    budgetId: "BUD-2026-003",
    budgetName: "Raw Materials Buffer — Cotton",
    requestedAmount: 280_000,
    justification: "Cotton price volatility. Lock in current rates before Q3 spike. Supplier offering 5% discount for bulk order.",
    expectedCogsVsBudget: "95% of budget",
    status: "Pending",
    impactSummary: "Bulk purchase reduces per-unit cost. Expected COGS at 95% of budget with 8% safety margin.",
    breakdown: { materials: 220_000, labor: 45_000, waste: 15_000 },
  },
  {
    id: "4",
    budgetId: "BUD-2026-004",
    budgetName: "Training & Skills Development",
    requestedAmount: 85_000,
    justification: "New operator training for automated cutting machines. Reduces waste and improves throughput. ROI within 6 months.",
    expectedCogsVsBudget: "78% of budget",
    status: "Pending",
    impactSummary: "Training reduces waste by ~3%. Labor efficiency gains offset training cost. COGS projected at 78% of budget.",
    breakdown: { materials: 10_000, labor: 65_000, waste: 10_000 },
  },
  {
    id: "5",
    budgetId: "BUD-2026-005",
    budgetName: "Packaging & Logistics Upgrade",
    requestedAmount: 95_000,
    justification: "Eco-friendly packaging materials and improved logistics. Reduces damage and returns. Aligns with sustainability goals.",
    expectedCogsVsBudget: "90% of budget",
    status: "Pending",
    impactSummary: "Packaging upgrade reduces damage-related COGS by 4%. Net impact: 90% of budget utilization.",
    breakdown: { materials: 70_000, labor: 15_000, waste: 10_000 },
  },
];

// ------------------------------------------
// Component
// ------------------------------------------
const FINBudgetApprovalsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBudget, setSelectedBudget] = useState<BudgetApproval | null>(null);
  const [showRejectSection, setShowRejectSection] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [budgets, setBudgets] = useState<BudgetApproval[]>(mockBudgets);

  const filteredBudgets = useMemo(() => {
    return budgets.filter((b) => {
      const matchesSearch =
        b.budgetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.budgetName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || b.status.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [budgets, searchQuery, statusFilter]);

  const paginatedBudgets = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBudgets.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBudgets, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredBudgets.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredBudgets.length);

  const pendingCount = budgets.filter((b) => b.status === "Pending").length;
  const totalRequested = budgets
    .filter((b) => b.status === "Pending")
    .reduce((sum, b) => sum + b.requestedAmount, 0);
  const approvedThisMonth = 12;

  const handleApprove = () => {
    if (!selectedBudget) return;
    setBudgets((prev) =>
      prev.map((b) =>
        b.id === selectedBudget.id ? { ...b, status: "Approved" } : b
      )
    );
    setSelectedBudget(null);
    setShowApproveConfirm(false);
    setToast({ message: `Budget ${selectedBudget.budgetId} approved successfully.`, type: "success" });
  };

  const handleReject = () => {
    if (!selectedBudget || !rejectReason.trim()) return;
    setBudgets((prev) =>
      prev.map((b) =>
        b.id === selectedBudget.id ? { ...b, status: "Rejected" } : b
      )
    );
    setSelectedBudget(null);
    setShowRejectSection(false);
    setShowRejectConfirm(false);
    setRejectReason("");
    setToast({ message: `Budget ${selectedBudget.budgetId} rejected.`, type: "success" });
  };

  const openRejectConfirm = () => {
    if (!rejectReason.trim()) {
      setToast({ message: "Please enter a reason for rejection.", type: "error" });
      return;
    }
    setShowRejectConfirm(true);
  };

  const closeModal = () => {
    setSelectedBudget(null);
    setShowRejectSection(false);
    setRejectReason("");
  };

  const formatCurrency = (n: number) =>
    `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 0 })}`;

  return (
    <FinanceLayout>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Budget Approvals
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review and approve or reject pending budget requests
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatsCard
          title="Pending Approvals"
          value={pendingCount}
          icon={ClipboardCheck}
          color="bg-amber-500"
        />
        <StatsCard
          title="Total Requested"
          value={formatCurrency(totalRequested)}
          icon={Wallet}
          color="bg-indigo-500"
        />
        <StatsCard
          title="Approved This Month"
          value={approvedThisMonth}
          icon={CheckCircle2}
          color="bg-emerald-500"
        />
      </div>

      {/* Toolbar */}
      <TableToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        placeholder="Search budgets..."
      >
        <div className="p-3 space-y-3">
          <IconSelect
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: "All Statuses" },
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
            ]}
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
                  Budget ID
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Budget Name
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Requested Amount (₱)
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Justification
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Expected COGS vs Budget
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
              {paginatedBudgets.length > 0 ? (
                paginatedBudgets.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-3 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {b.budgetId}
                    </td>
                    <td className="px-6 py-3 text-xs font-medium text-slate-800 dark:text-slate-200">
                      {b.budgetName}
                    </td>
                    <td className="px-6 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {formatCurrency(b.requestedAmount)}
                    </td>
                    <td className="px-6 py-3 text-[11px] text-slate-600 dark:text-slate-400 max-w-[200px] truncate">
                      {b.justification}
                    </td>
                    <td className="px-6 py-3 text-[11px] text-slate-600 dark:text-slate-400">
                      {b.expectedCogsVsBudget}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-6 py-3 text-left">
                      <div className="flex items-center justify-start gap-1">
                        <button
                          onClick={() => setSelectedBudget(b)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={14} />
                        </button>
                        {b.status === "Pending" && (
                          <button
                            onClick={() => setSelectedBudget(b)}
                            className="inline-flex items-center gap-1 whitespace-nowrap text-left.5 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-all active:scale-95"
                            title="Review"
                          >
                            <CheckCircle2 size={12} />
                            Review
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setBudgets((prev) => prev.filter((x) => x.id !== b.id));
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
                    No pending budgets found.
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
          totalItems={filteredBudgets.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Review Modal */}
      <PageModal
        isOpen={!!selectedBudget}
        onClose={closeModal}
        title={selectedBudget?.budgetName || ""}
        subtitle={selectedBudget ? `${selectedBudget.budgetId} · ${selectedBudget.status}` : ""}
        badges={selectedBudget ? <StatusBadge status={selectedBudget.status} /> : undefined}
        maxWidth="max-w-2xl"
        footer={
          selectedBudget && selectedBudget.status === "Pending" ? (
            <div className="flex items-center gap-3">
              <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
              <SecondaryButton
                onClick={() => {
                  setToast({ message: "Request changes sent to requester.", type: "success" });
                  closeModal();
                }}
              >
                Request Changes
              </SecondaryButton>
              {!showRejectSection ? (
                <button
                  onClick={() => setShowRejectSection(true)}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl shadow-sm transition-colors bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800"
                >
                  <XCircle size={14} />
                  Reject
                </button>
              ) : (
                <button
                  onClick={openRejectConfirm}
                  disabled={!rejectReason.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl shadow-sm transition-colors bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={14} />
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
            </div>
          ) : (
            <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
          )
        }
      >
        {selectedBudget && (
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Requested Amount
              </label>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1">
                {formatCurrency(selectedBudget.requestedAmount)}
              </p>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Justification
              </label>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                {selectedBudget.justification}
              </p>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Expected COGS vs Budget
              </label>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                {selectedBudget.impactSummary}
              </p>
              <div className="mt-2">
                <BudgetUtilizationBar
                  spent={
                    selectedBudget.breakdown.materials +
                    selectedBudget.breakdown.labor +
                    selectedBudget.breakdown.waste
                  }
                  total={selectedBudget.requestedAmount}
                  showLabels
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Breakdown
              </label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Materials
                  </p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                    {formatCurrency(selectedBudget.breakdown.materials)}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Labor
                  </p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                    {formatCurrency(selectedBudget.breakdown.labor)}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Waste
                  </p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                    {formatCurrency(selectedBudget.breakdown.waste)}
                  </p>
                </div>
              </div>
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
        title="Approve Budget"
        message={`Are you sure you want to approve ${selectedBudget?.budgetName} (${selectedBudget?.budgetId})?`}
        confirmText="Approve"
      />

      {/* Reject Confirmation */}
      <ConfirmationModal
        isOpen={showRejectConfirm}
        onClose={() => setShowRejectConfirm(false)}
        onConfirm={handleReject}
        title="Reject Budget"
        message={`Are you sure you want to reject ${selectedBudget?.budgetName}? This action cannot be undone.`}
        variant="danger"
        confirmText="Reject"
      />
    </FinanceLayout>
  );
};

export default FINBudgetApprovalsPage;
