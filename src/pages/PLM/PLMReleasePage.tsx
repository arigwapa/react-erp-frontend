// ==========================================
// PLMReleasePage.tsx — Release to Production
// Branch-scoped controlled release page.
// Shows "Ready to Release" list with validation
// checklist, release modal with planned qty,
// start date, and notes.
// ==========================================

import { useState, useMemo, useEffect } from "react";
import {
  Rocket,
  Package,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Lock,
  Eye,
  FileText,
  Archive,
} from "lucide-react";

// ------------------------------------------
// Layout & Reusable UI
// ------------------------------------------
import PLMLayout from "../../layout/PLMLayout";
import { Card } from "../../components/ui/Card";
import StatsCard from "../../components/ui/StatsCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { TableToolbar } from "../../components/ui/TableToolbar";
import Pagination from "../../components/ui/Pagination";
import SecondaryButton from "../../components/ui/SecondaryButton";
import PrimaryButton from "../../components/ui/PrimaryButton";
import PageModal from "../../components/ui/PageModal";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Toast from "../../components/ui/Toast";
import InputGroup from "../../components/ui/InputGroup";
import ChecklistItem from "../../components/ui/ChecklistItem";

// ==========================================
// TYPES
// ==========================================

interface ReleaseCandidate {
  id: string;
  productSku: string;
  productName: string;
  versionNumber: string;
  approvalStatus: "Approved" | "Draft" | "Rejected";
  bomComplete: boolean;
  bomLineCount: number;
  branchConfirmed: boolean;
}

// ==========================================
// MOCK DATA
// ==========================================

const INITIAL_CANDIDATES: ReleaseCandidate[] = [
  { id: "REL-001", productSku: "MNL-TEE-003", productName: "Basic Cotton Tee", versionNumber: "V3.0", approvalStatus: "Approved", bomComplete: true, bomLineCount: 3, branchConfirmed: true },
  { id: "REL-002", productSku: "MNL-PNT-007", productName: "Cargo Utility Pants", versionNumber: "V4.0", approvalStatus: "Approved", bomComplete: true, bomLineCount: 4, branchConfirmed: true },
  { id: "REL-003", productSku: "MNL-SHT-005", productName: "Linen Button-Down Shirt", versionNumber: "V2.0", approvalStatus: "Approved", bomComplete: true, bomLineCount: 3, branchConfirmed: true },
  { id: "REL-004", productSku: "MNL-JKT-001", productName: "Classic Denim Jacket", versionNumber: "V2.1", approvalStatus: "Draft", bomComplete: true, bomLineCount: 6, branchConfirmed: true },
  { id: "REL-005", productSku: "MNL-SWT-006", productName: "Knit Crew Sweater", versionNumber: "V1.0", approvalStatus: "Draft", bomComplete: false, bomLineCount: 0, branchConfirmed: true },
  { id: "REL-006", productSku: "MNL-DRS-002", productName: "Floral Summer Dress", versionNumber: "V1.1", approvalStatus: "Draft", bomComplete: false, bomLineCount: 2, branchConfirmed: true },
];

// ==========================================
// CONSTANTS
// ==========================================

const ITEMS_PER_PAGE = 5;

// ==========================================
// MAIN COMPONENT
// ==========================================

function PLMReleasePage() {
  // ------------------------------------------
  // STATE
  // ------------------------------------------
  const [candidates, setCandidates] = useState<ReleaseCandidate[]>(INITIAL_CANDIDATES);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Release modal
  const [releaseTarget, setReleaseTarget] = useState<ReleaseCandidate | null>(null);
  const [plannedQty, setPlannedQty] = useState("");
  const [startDate, setStartDate] = useState("");
  const [releaseNotes, setReleaseNotes] = useState("");

  // Detail modal
  const [detailCandidate, setDetailCandidate] = useState<ReleaseCandidate | null>(null);

  // Toast & Confirm
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean; title: string; message: string; action: () => void; variant: "primary" | "danger"; confirmText: string;
  }>({ isOpen: false, title: "", message: "", action: () => {}, variant: "primary", confirmText: "Confirm" });

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  // ------------------------------------------
  // COMPUTED
  // ------------------------------------------
  const stats = useMemo(() => ({
    total: candidates.length,
    ready: candidates.filter((c) => c.approvalStatus === "Approved" && c.bomComplete && c.branchConfirmed).length,
    blocked: candidates.filter((c) => c.approvalStatus !== "Approved" || !c.bomComplete).length,
  }), [candidates]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return candidates.filter((c) => c.productName.toLowerCase().includes(q) || c.productSku.toLowerCase().includes(q));
  }, [candidates, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filtered.length);
  const paginated = filtered.slice(startIndex, endIndex);

  // ------------------------------------------
  // HELPERS
  // ------------------------------------------
  const canRelease = (c: ReleaseCandidate) => c.approvalStatus === "Approved" && c.bomComplete && c.branchConfirmed;

  // ------------------------------------------
  // HANDLERS
  // ------------------------------------------
  const openReleaseModal = (c: ReleaseCandidate) => {
    setReleaseTarget(c);
    setPlannedQty(""); setStartDate(""); setReleaseNotes("");
  };

  const handleRelease = () => {
    if (!releaseTarget) return;
    const qty = parseInt(plannedQty);
    if (isNaN(qty) || qty <= 0 || !startDate) {
      setToast({ message: "Please enter a valid quantity and start date.", type: "error" }); return;
    }

    setConfirmModal({
      isOpen: true, title: "Confirm Release to Production",
      message: `Release "${releaseTarget.productName}" (${releaseTarget.versionNumber}) to production with ${qty} planned units starting ${startDate}? A Production Order will be created.`,
      variant: "primary", confirmText: "Release to Production",
      action: () => {
        setCandidates((prev) => prev.filter((c) => c.id !== releaseTarget.id));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setReleaseTarget(null);
        setToast({ message: `Released to Production successfully. Production Order created for ${releaseTarget.productName}.`, type: "success" });
      },
    });
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <>
      <PLMLayout>
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Release to Production</h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Release approved and BOM-complete versions to the Production module.</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-semibold"><Lock size={12} />Branch: Manila (Locked)</div>
          </div>

          {/* KPI Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatsCard title="Total Candidates" value={stats.total} icon={Package} color="bg-indigo-500" />
            <StatsCard title="Ready for Release" value={stats.ready} icon={Rocket} color="bg-emerald-500" />
            <StatsCard title="Blocked" value={stats.blocked} icon={AlertTriangle} color="bg-rose-500" />
          </div>

          {/* Release Candidates Table */}
          <Card className="overflow-hidden">
            <div className="px-5 pt-5">
              <TableToolbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} isFilterOpen={isFilterOpen} setIsFilterOpen={setIsFilterOpen} placeholder="Search by product name or SKU..." filterLabel="Filters">
                <div className="p-3 text-xs text-slate-500 dark:text-slate-400 italic">Only versions with BOM data are shown.</div>
              </TableToolbar>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/80 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Version</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Approval</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">BOM</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">Branch</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                  {paginated.map((c) => {
                    const ready = canRelease(c);
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0"><Package size={16} /></div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 dark:text-white text-sm truncate">{c.productName}</div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{c.productSku}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell"><span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{c.versionNumber}</span></td>
                        <td className="px-6 py-4"><StatusBadge status={c.approvalStatus} /></td>
                        <td className="px-6 py-4">
                          {c.bomComplete
                            ? <span className="inline-flex items-center gap-1 whitespace-nowrap text-left text-[11px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-1 rounded-full"><CheckCircle size={12} /> Complete ({c.bomLineCount})</span>
                            : <span className="inline-flex items-center gap-1 whitespace-nowrap text-left text-[11px] font-semibold text-rose-700 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-400 px-2.5 py-1 rounded-full"><XCircle size={12} /> Incomplete</span>}
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <span className="inline-flex items-center gap-1 whitespace-nowrap text-left text-[11px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-1 rounded-full"><CheckCircle size={12} /> Confirmed</span>
                        </td>
                        <td className="px-6 py-4 text-left">
                          <div className="flex justify-start items-center gap-1">
                            <button onClick={() => setDetailCandidate(c)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="View Checklist"><Eye size={14} /></button>
                            <button onClick={() => openReleaseModal(c)} disabled={!ready}
                              className={`inline-flex items-center gap-1 whitespace-nowrap text-left.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${ready ? "text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50" : "text-slate-300 dark:text-slate-600 bg-slate-50 dark:bg-slate-800 cursor-not-allowed"}`}
                              title={ready ? "Release to Production" : "Checklist incomplete"}
                            ><Rocket size={14} /> Release</button>
                            <button onClick={() => { setCandidates((prev) => prev.filter((cand) => cand.id !== c.id)); setToast({ message: `${c.productName} moved to archive.`, type: "success" }); }} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title="Archive"><Archive size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-slate-400 text-sm">
                        <div className="flex flex-col items-center gap-2">
                          <Rocket size={32} className="text-slate-300" />
                          <p className="font-medium">No release candidates found</p>
                          <p className="text-xs">Approved versions with BOM data will appear here.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} startIndex={startIndex} endIndex={endIndex} totalItems={filtered.length} onPageChange={setCurrentPage} />
          </Card>
        </div>
      </PLMLayout>

      {/* ---- RELEASE VALIDATION / CHECKLIST DETAIL MODAL ---- */}
      {detailCandidate && (
        <PageModal isOpen={!!detailCandidate} onClose={() => setDetailCandidate(null)}
          title={`Release Checklist — ${detailCandidate.productName}`}
          subtitle={<>SKU: {detailCandidate.productSku} · {detailCandidate.versionNumber}</>}
          maxWidth="max-w-md"
          footer={
            <div className="flex justify-between items-center w-full">
              <SecondaryButton onClick={() => setDetailCandidate(null)}>Close</SecondaryButton>
              {canRelease(detailCandidate) && (
                <SecondaryButton onClick={() => { setDetailCandidate(null); openReleaseModal(detailCandidate); }} icon={Rocket} className="!text-indigo-600 !border-indigo-200 hover:!bg-indigo-50">Release</SecondaryButton>
              )}
            </div>
          }
        >
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-700 overflow-hidden">
            <ChecklistItem label="Version Approved" passed={detailCandidate.approvalStatus === "Approved"} description={detailCandidate.approvalStatus === "Approved" ? "Version has been approved by the reviewer." : `Current status: ${detailCandidate.approvalStatus}`} />
            <ChecklistItem label="BOM exists and complete" passed={detailCandidate.bomComplete} description={detailCandidate.bomComplete ? `${detailCandidate.bomLineCount} material lines in BOM.` : "BOM is missing or incomplete."} />
            <ChecklistItem label="Branch context confirmed" passed={detailCandidate.branchConfirmed} description="Branch: Manila (locked)" />
          </div>
          {!canRelease(detailCandidate) && (
            <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg px-3 py-2">
              <AlertTriangle size={12} /><span className="font-medium">This version cannot be released until all checklist items pass.</span>
            </div>
          )}
        </PageModal>
      )}

      {/* ---- RELEASE MODAL (with form fields) ---- */}
      {releaseTarget && (
        <PageModal isOpen={!!releaseTarget} onClose={() => setReleaseTarget(null)}
          title={`Release — ${releaseTarget.productName}`}
          badges={<StatusBadge status={releaseTarget.approvalStatus} className="!text-[10px] !py-0.5" />}
          subtitle={<>SKU: {releaseTarget.productSku} · {releaseTarget.versionNumber}</>}
          maxWidth="max-w-lg"
          footer={
            <div className="flex justify-end items-center gap-2 w-full">
              <SecondaryButton onClick={() => setReleaseTarget(null)}>Cancel</SecondaryButton>
              <PrimaryButton onClick={handleRelease} className="!w-auto !py-2.5 !px-6 !text-xs !rounded-full"><Rocket size={14} /> Release to Production</PrimaryButton>
            </div>
          }
        >
          {/* Validation Checklist */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Release Validation</h4>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-700 overflow-hidden">
              <ChecklistItem label="Version Approved" passed={releaseTarget.approvalStatus === "Approved"} />
              <ChecklistItem label="BOM exists and complete" passed={releaseTarget.bomComplete} />
              <ChecklistItem label="Branch context confirmed (locked)" passed={releaseTarget.branchConfirmed} />
            </div>
          </div>

          {/* Release Form */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Production Order Details</h4>
            <div className="space-y-4">
              <InputGroup id="rel-qty" label="Planned Quantity *" type="number" placeholder="e.g. 500" icon={Package} value={plannedQty} onChange={(e) => setPlannedQty(e.target.value)} />
              <InputGroup id="rel-date" label="Start Date *" type="date" placeholder="Select date" icon={Calendar} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <div className="flex flex-col gap-1.5">
                <label htmlFor="rel-notes" className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">Notes / Instructions (optional)</label>
                <textarea id="rel-notes" rows={2} placeholder="Any special instructions for production..." value={releaseNotes} onChange={(e) => setReleaseNotes(e.target.value)}
                  className="w-full px-4 py-3 text-sm font-medium bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 resize-none text-slate-900 dark:text-white" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500 dark:text-slate-400">
            <FileText size={14} className="text-slate-400 shrink-0" />
            <span>A Production Order will be created linked to VersionID and BranchID. An audit log entry will be recorded.</span>
          </div>
        </PageModal>
      )}

      {/* ---- CONFIRMATION & TOAST ---- */}
      <ConfirmationModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))} onConfirm={confirmModal.action} title={confirmModal.title} message={confirmModal.message} variant={confirmModal.variant} confirmText={confirmModal.confirmText} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}

export default PLMReleasePage;
