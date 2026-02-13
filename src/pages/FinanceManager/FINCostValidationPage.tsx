// ==========================================
// FINCostValidationPage.tsx
// Finance Manager — Cost Entry Validation
// Queue of cost-impacting items from Production/Warehouse
// that need Finance validation.
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
  ClipboardCheck,
  Wallet,
  CheckCircle2,
  XCircle,
  Eye,
  Check,
  Send,
  HelpCircle,
  Factory,
  Warehouse,
  Archive,
} from "lucide-react";

// ------------------------------------------
// Types
// ------------------------------------------
interface CostEntry {
  id: string;
  refId: string;
  sourceModule: "Production" | "Warehouse";
  description: string;
  amountImpact: number;
  reasonNotes: string;
  evidence: string;
  status: "Pending" | "Approved" | "Rejected" | "Clarification";
}

// ------------------------------------------
// Constants
// ------------------------------------------
const ITEMS_PER_PAGE = 6;

// ------------------------------------------
// Mock data
// ------------------------------------------
const mockCostEntries: CostEntry[] = [
  {
    id: "1",
    refId: "CE-2026-001",
    sourceModule: "Warehouse",
    description: "Large material adjustment from Warehouse",
    amountImpact: 45000,
    reasonNotes: "Inventory count discrepancy. Physical count revealed 12 rolls of fabric missing from records.",
    evidence: "Invoice_WH_045.pdf",
    status: "Pending",
  },
  {
    id: "2",
    refId: "CE-2026-002",
    sourceModule: "Production",
    description: "Waste spike from Production",
    amountImpact: 18000,
    reasonNotes: "Higher than usual fabric waste during cutting phase. Machine calibration issue.",
    evidence: "N/A",
    status: "Pending",
  },
  {
    id: "3",
    refId: "CE-2026-003",
    sourceModule: "Production",
    description: "Unusual consumption variance from Production",
    amountImpact: 12000,
    reasonNotes: "Thread and trim consumption 15% above standard. BOM variance report attached.",
    evidence: "BOM_Variance_Prod_03.pdf",
    status: "Pending",
  },
  {
    id: "4",
    refId: "CE-2026-004",
    sourceModule: "Production",
    description: "Overtime labor from Production",
    amountImpact: 8500,
    reasonNotes: "Rush order deadline. 12 operators worked overtime to complete delivery.",
    evidence: "Timesheet_Prod_Week_06.pdf",
    status: "Approved",
  },
  {
    id: "5",
    refId: "CE-2026-005",
    sourceModule: "Warehouse",
    description: "Emergency material purchase from Warehouse",
    amountImpact: 32000,
    reasonNotes: "Supplier shortage. Emergency purchase from alternate vendor to avoid production halt.",
    evidence: "Invoice_WH_045.pdf",
    status: "Pending",
  },
  {
    id: "6",
    refId: "CE-2026-006",
    sourceModule: "Production",
    description: "Defect rework cost from Production",
    amountImpact: 6200,
    reasonNotes: "Rework of 50 units due to stitching defect. Quality issue identified and resolved.",
    evidence: "Rework_Report_Prod_012.pdf",
    status: "Rejected",
  },
  {
    id: "7",
    refId: "CE-2026-007",
    sourceModule: "Warehouse",
    description: "Storage reallocation from Warehouse",
    amountImpact: 4800,
    reasonNotes: "Temporary storage relocation for overflow inventory. Third-party warehouse fees.",
    evidence: "N/A",
    status: "Clarification",
  },
];

// ------------------------------------------
// Component
// ------------------------------------------
const FINCostValidationPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState<CostEntry | null>(null);
  const [showRejectSection, setShowRejectSection] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showClarificationSection, setShowClarificationSection] = useState(false);
  const [clarificationRequest, setClarificationRequest] = useState("");
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showClarificationConfirm, setShowClarificationConfirm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [entries, setEntries] = useState<CostEntry[]>(mockCostEntries);

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const matchesSearch =
        e.refId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.reasonNotes.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSource =
        sourceFilter === "all" ||
        e.sourceModule.toLowerCase() === sourceFilter;
      const matchesStatus =
        statusFilter === "all" ||
        e.status.toLowerCase() === statusFilter;
      return matchesSearch && matchesSource && matchesStatus;
    });
  }, [entries, searchQuery, sourceFilter, statusFilter]);

  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEntries.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEntries, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredEntries.length);

  const pendingCount = entries.filter((e) => e.status === "Pending").length;
  const totalImpactPending = entries
    .filter((e) => e.status === "Pending")
    .reduce((sum, e) => sum + e.amountImpact, 0);
  const approvedThisWeek = entries.filter((e) => e.status === "Approved").length;
  const rejectedThisWeek = entries.filter((e) => e.status === "Rejected").length;

  const handleApprove = () => {
    if (!selectedEntry) return;
    setEntries((prev) =>
      prev.map((e) =>
        e.id === selectedEntry.id ? { ...e, status: "Approved" as const } : e
      )
    );
    setSelectedEntry(null);
    setShowApproveConfirm(false);
    setToast({ message: `Cost entry ${selectedEntry.refId} approved successfully.`, type: "success" });
  };

  const handleReject = () => {
    if (!selectedEntry || !rejectReason.trim()) return;
    setEntries((prev) =>
      prev.map((e) =>
        e.id === selectedEntry.id ? { ...e, status: "Rejected" as const } : e
      )
    );
    setSelectedEntry(null);
    setShowRejectSection(false);
    setShowRejectConfirm(false);
    setRejectReason("");
    setToast({ message: `Cost entry ${selectedEntry.refId} rejected.`, type: "success" });
  };

  const handleClarification = () => {
    if (!selectedEntry || !clarificationRequest.trim()) return;
    setEntries((prev) =>
      prev.map((e) =>
        e.id === selectedEntry.id ? { ...e, status: "Clarification" as const } : e
      )
    );
    setSelectedEntry(null);
    setShowClarificationSection(false);
    setShowClarificationConfirm(false);
    setClarificationRequest("");
    setToast({ message: `Clarification requested for ${selectedEntry.refId}. Task sent back.`, type: "success" });
  };

  const openRejectConfirm = () => {
    if (!rejectReason.trim()) {
      setToast({ message: "Please enter a reason for rejection.", type: "error" });
      return;
    }
    setShowRejectConfirm(true);
  };

  const openClarificationConfirm = () => {
    if (!clarificationRequest.trim()) {
      setToast({ message: "Please enter your clarification request.", type: "error" });
      return;
    }
    setShowClarificationConfirm(true);
  };

  const closeModal = () => {
    setSelectedEntry(null);
    setShowRejectSection(false);
    setShowClarificationSection(false);
    setRejectReason("");
    setClarificationRequest("");
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
          Cost Entry Validation
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Queue of cost-impacting items from Production/Warehouse that need Finance validation
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Pending Validations"
          value={pendingCount}
          icon={ClipboardCheck}
          color="bg-amber-500"
        />
        <StatsCard
          title="Total Impact (Pending)"
          value={formatCurrency(totalImpactPending)}
          icon={Wallet}
          color="bg-indigo-500"
        />
        <StatsCard
          title="Approved This Week"
          value={approvedThisWeek}
          icon={CheckCircle2}
          color="bg-emerald-500"
        />
        <StatsCard
          title="Rejected This Week"
          value={rejectedThisWeek}
          icon={XCircle}
          color="bg-rose-500"
        />
      </div>

      {/* Toolbar */}
      <TableToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        placeholder="Search cost entries..."
      >
        <div className="p-3 space-y-3 min-w-[200px]">
          <IconSelect
            label="Source"
            value={sourceFilter}
            onChange={setSourceFilter}
            options={[
              { value: "all", label: "All", icon: ClipboardCheck },
              { value: "production", label: "Production", icon: Factory },
              { value: "warehouse", label: "Warehouse", icon: Warehouse },
            ]}
          />
          <IconSelect
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: "All Statuses" },
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
              { value: "clarification", label: "Clarification" },
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
                  Ref ID
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Source Module
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Amount Impact (₱)
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Reason/Notes
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Evidence
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
              {paginatedEntries.length > 0 ? (
                paginatedEntries.map((e) => (
                  <tr
                    key={e.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-3 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {e.refId}
                    </td>
                    <td className="px-6 py-3 text-xs font-medium text-slate-800 dark:text-slate-200">
                      {e.sourceModule}
                    </td>
                    <td className="px-6 py-3 text-xs font-medium text-slate-800 dark:text-slate-200">
                      {e.description}
                    </td>
                    <td className="px-6 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {formatCurrency(e.amountImpact)}
                    </td>
                    <td className="px-6 py-3 text-[11px] text-slate-600 dark:text-slate-400 max-w-[180px] truncate">
                      {e.reasonNotes}
                    </td>
                    <td className="px-6 py-3 text-[11px] text-slate-600 dark:text-slate-400">
                      {e.evidence}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={e.status} />
                    </td>
                    <td className="px-6 py-3 text-left">
                      <div className="flex items-center justify-start gap-1">
                        <button
                          onClick={() => setSelectedEntry(e)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                          title="Review"
                        >
                          <Eye size={14} />
                        </button>
                        {e.status === "Pending" && (
                          <button
                            onClick={() => setSelectedEntry(e)}
                            className="inline-flex items-center gap-1 whitespace-nowrap text-left.5 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-all active:scale-95"
                            title="Validate"
                          >
                            <CheckCircle2 size={12} />
                            Validate
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEntries((prev) => prev.filter((x) => x.id !== e.id));
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
                    colSpan={8}
                    className="px-6 py-12 text-center text-sm text-slate-400 italic"
                  >
                    No cost entries found.
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
          totalItems={filteredEntries.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Review Modal */}
      <PageModal
        isOpen={!!selectedEntry}
        onClose={closeModal}
        title={selectedEntry?.description || ""}
        subtitle={selectedEntry ? `${selectedEntry.refId} · ${selectedEntry.sourceModule} · ${selectedEntry.status}` : ""}
        badges={selectedEntry ? <StatusBadge status={selectedEntry.status} /> : undefined}
        maxWidth="max-w-2xl"
        footer={
          selectedEntry && selectedEntry.status === "Pending" ? (
            <div className="flex items-center gap-3 flex-wrap">
              <SecondaryButton onClick={closeModal}>Close</SecondaryButton>
              {!showClarificationSection && !showRejectSection && (
                <button
                  onClick={() => setShowClarificationSection(true)}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl shadow-sm transition-colors bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800"
                >
                  <HelpCircle size={14} />
                  Request Clarification
                </button>
              )}
              {showClarificationSection && (
                <button
                  onClick={openClarificationConfirm}
                  disabled={!clarificationRequest.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl shadow-sm transition-colors bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={14} />
                  Send Clarification
                </button>
              )}
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
            <SecondaryButton onClick={closeModal}>Close</SecondaryButton>
          )
        }
      >
        {selectedEntry && (
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Ref ID
              </label>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                {selectedEntry.refId}
              </p>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Source Module
              </label>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                {selectedEntry.sourceModule}
              </p>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Description
              </label>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                {selectedEntry.description}
              </p>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Amount Impact (₱)
              </label>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1">
                {formatCurrency(selectedEntry.amountImpact)}
              </p>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Reason/Notes
              </label>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                {selectedEntry.reasonNotes}
              </p>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Evidence
              </label>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                {selectedEntry.evidence}
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

            {showClarificationSection && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Clarification Request (required)
                </label>
                <textarea
                  value={clarificationRequest}
                  onChange={(e) => setClarificationRequest(e.target.value)}
                  placeholder="Enter your clarification request..."
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
        title="Approve Cost Entry"
        message={`Are you sure you want to approve ${selectedEntry?.refId} (${selectedEntry?.description})?`}
        confirmText="Approve"
      />

      {/* Reject Confirmation */}
      <ConfirmationModal
        isOpen={showRejectConfirm}
        onClose={() => setShowRejectConfirm(false)}
        onConfirm={handleReject}
        title="Reject Cost Entry"
        message={`Are you sure you want to reject ${selectedEntry?.refId}? This action cannot be undone.`}
        variant="danger"
        confirmText="Reject"
      />

      {/* Clarification Confirmation */}
      <ConfirmationModal
        isOpen={showClarificationConfirm}
        onClose={() => setShowClarificationConfirm(false)}
        onConfirm={handleClarification}
        title="Request Clarification"
        message={`Send clarification request for ${selectedEntry?.refId}? The task will be sent back to the requester.`}
        confirmText="Send"
      />
    </FinanceLayout>
  );
};

export default FINCostValidationPage;
