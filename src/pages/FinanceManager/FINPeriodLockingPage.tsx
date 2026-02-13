// ==========================================
// FINPeriodLockingPage.tsx
// Finance Manager — Period Locking
// Lock/unlock financial periods to prevent edits.
// ==========================================

import React, { useState } from "react";
import FinanceLayout from "../../layout/FinanceLayout";
import StatsCard from "../../components/ui/StatsCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import PageModal from "../../components/ui/PageModal";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Toast from "../../components/ui/Toast";
import SecondaryButton from "../../components/ui/SecondaryButton";
import PrimaryButton from "../../components/ui/PrimaryButton";
import {
  Lock,
  Unlock,
  Calendar,
  FileText,
  PiggyBank,
  AlertTriangle,
  Eye,
  Archive,
} from "lucide-react";

// ------------------------------------------
// Types
// ------------------------------------------
type PeriodType = "Month" | "Quarter";
type PeriodStatus = "Open" | "Locked";

interface FinancialPeriod {
  id: string;
  name: string;
  type: PeriodType;
  status: PeriodStatus;
  lockedBy?: string;
  lockedDate?: string;
  costRecordsCount: number;
  budgetItemsCount: number;
  totalCOGS?: number;
}

// ------------------------------------------
// Mock data — 8 periods (last 6 months + 2 quarters)
// ------------------------------------------
const initialPeriods: FinancialPeriod[] = [
  {
    id: "p1",
    name: "January 2026",
    type: "Month",
    status: "Open",
    costRecordsCount: 142,
    budgetItemsCount: 28,
  },
  {
    id: "p2",
    name: "February 2026",
    type: "Month",
    status: "Open",
    costRecordsCount: 89,
    budgetItemsCount: 12,
  },
  {
    id: "p3",
    name: "December 2025",
    type: "Month",
    status: "Locked",
    lockedBy: "Maria Santos",
    lockedDate: "2026-01-15",
    costRecordsCount: 198,
    budgetItemsCount: 35,
    totalCOGS: 1245000,
  },
  {
    id: "p4",
    name: "November 2025",
    type: "Month",
    status: "Locked",
    lockedBy: "Maria Santos",
    lockedDate: "2025-12-10",
    costRecordsCount: 176,
    budgetItemsCount: 32,
    totalCOGS: 1182000,
  },
  {
    id: "p5",
    name: "October 2025",
    type: "Month",
    status: "Open",
    costRecordsCount: 165,
    budgetItemsCount: 30,
  },
  {
    id: "p6",
    name: "September 2025",
    type: "Month",
    status: "Locked",
    lockedBy: "Juan Reyes",
    lockedDate: "2025-10-08",
    costRecordsCount: 152,
    budgetItemsCount: 28,
    totalCOGS: 1098000,
  },
  {
    id: "p7",
    name: "Q4 2025",
    type: "Quarter",
    status: "Locked",
    lockedBy: "Maria Santos",
    lockedDate: "2026-01-20",
    costRecordsCount: 534,
    budgetItemsCount: 97,
    totalCOGS: 3627000,
  },
  {
    id: "p8",
    name: "Q3 2025",
    type: "Quarter",
    status: "Locked",
    lockedBy: "Juan Reyes",
    lockedDate: "2025-10-15",
    costRecordsCount: 421,
    budgetItemsCount: 85,
    totalCOGS: 2985000,
  },
];

// ------------------------------------------
// Component
// ------------------------------------------
const FINPeriodLockingPage: React.FC = () => {
  const [periods, setPeriods] = useState<FinancialPeriod[]>(initialPeriods);
  const [lockTarget, setLockTarget] = useState<FinancialPeriod | null>(null);
  const [detailPeriod, setDetailPeriod] = useState<FinancialPeriod | null>(null);
  const [unlockTarget, setUnlockTarget] = useState<FinancialPeriod | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const openPeriods = periods.filter((p) => p.status === "Open").length;
  const lockedPeriods = periods.filter((p) => p.status === "Locked").length;
  const lastLockedPeriod = periods
    .filter((p) => p.status === "Locked" && p.lockedDate)
    .sort((a, b) => (b.lockedDate || "").localeCompare(a.lockedDate || ""))[0];
  const lastLockedLabel = lastLockedPeriod
    ? `${lastLockedPeriod.name} (${lastLockedPeriod.lockedDate})`
    : "—";

  const handleLockConfirm = () => {
    if (lockTarget) {
      setPeriods((prev) =>
        prev.map((p) =>
          p.id === lockTarget.id
            ? {
                ...p,
                status: "Locked" as PeriodStatus,
                lockedBy: "Maria Santos",
                lockedDate: new Date().toISOString().split("T")[0],
                totalCOGS: (p.costRecordsCount || 0) * 7000,
              }
            : p
        )
      );
      setToast({ message: "Period locked successfully.", type: "success" });
      setLockTarget(null);
    }
  };

  const handleUnlockConfirm = () => {
    if (unlockTarget) {
      setPeriods((prev) =>
        prev.map((p) =>
          p.id === unlockTarget.id
            ? {
                ...p,
                status: "Open" as PeriodStatus,
                lockedBy: undefined,
                lockedDate: undefined,
                totalCOGS: undefined,
              }
            : p
        )
      );
      setToast({ message: "Period unlocked. Audit log updated.", type: "success" });
      setUnlockTarget(null);
      setDetailPeriod(null);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 0 }).format(val);

  return (
    <FinanceLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Period Locking
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage period locking (lock/unlock financial periods to prevent edits).
        </p>
      </div>

      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3 mb-6">
        <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
          Locking a period prevents all edits to cost records, budgets, and expense entries for that period. This action is logged for audit purposes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatsCard
          title="Open Periods"
          value={openPeriods}
          icon={Unlock}
          color="bg-emerald-500"
        />
        <StatsCard
          title="Locked Periods"
          value={lockedPeriods}
          icon={Lock}
          color="bg-slate-600"
        />
        <StatsCard
          title="Last Locked"
          value={lastLockedLabel}
          icon={Calendar}
          color="bg-indigo-500"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        <div className="p-6">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Financial Periods</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {periods.map((period) => (
              <div
                key={period.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {period.name}
                  </h3>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      period.type === "Quarter"
                        ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400"
                        : "bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {period.type}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <StatusBadge status={period.status} />
                </div>
                {period.status === "Locked" && period.lockedBy && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                    Locked by {period.lockedBy}
                    {period.lockedDate && ` • ${period.lockedDate}`}
                  </p>
                )}
                <div className="flex items-center gap-4 text-[11px] text-slate-600 dark:text-slate-400 mb-4">
                  <span className="flex items-center gap-1">
                    <FileText size={12} />
                    {period.costRecordsCount} cost records
                  </span>
                  <span className="flex items-center gap-1">
                    <PiggyBank size={12} />
                    {period.budgetItemsCount} budget items
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {period.status === "Open" ? (
                    <PrimaryButton
                      onClick={() => setLockTarget(period)}
                      className="!flex-1 !py-2.5 text-xs"
                    >
                      <Lock size={14} />
                      Lock Period
                    </PrimaryButton>
                  ) : (
                    <SecondaryButton
                      onClick={() => setDetailPeriod(period)}
                      icon={Eye}
                      className="flex-1 justify-center"
                    >
                      View Details
                    </SecondaryButton>
                  )}
                  <button
                    onClick={() => {
                      setPeriods((prev) => prev.filter((x) => x.id !== period.id));
                      setToast({ message: "Record archived successfully", type: "success" });
                    }}
                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors shrink-0"
                    title="Archive"
                  >
                    <Archive size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lock Period Confirmation */}
      <ConfirmationModal
        isOpen={!!lockTarget}
        onClose={() => setLockTarget(null)}
        onConfirm={handleLockConfirm}
        title="Lock Period"
        message={
          lockTarget
            ? `Are you sure you want to lock "${lockTarget.name}"? This will prevent all edits to cost records, budgets, and expense entries for this period. This action is logged for audit purposes.`
            : ""
        }
        variant="danger"
        confirmText="Lock Period"
      />

      {/* View Details Modal */}
      <PageModal
        isOpen={!!detailPeriod}
        onClose={() => setDetailPeriod(null)}
        title={detailPeriod?.name ?? ""}
        subtitle={detailPeriod ? `${detailPeriod.type} • ${detailPeriod.status}` : ""}
        badges={detailPeriod && <StatusBadge status={detailPeriod.status} />}
        footer={
          <div className="flex items-center gap-3">
            <SecondaryButton onClick={() => setDetailPeriod(null)}>Close</SecondaryButton>
            {detailPeriod?.status === "Locked" && (
              <SecondaryButton
                icon={Unlock}
                onClick={() => setUnlockTarget(detailPeriod)}
              >
                Unlock Period
              </SecondaryButton>
            )}
          </div>
        }
      >
        {detailPeriod && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Period Name</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{detailPeriod.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Period Type</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{detailPeriod.type}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</p>
                <StatusBadge status={detailPeriod.status} />
              </div>
              {detailPeriod.status === "Locked" && (
                <>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Locked By</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{detailPeriod.lockedBy ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Locked Date</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{detailPeriod.lockedDate ?? "—"}</p>
                  </div>
                </>
              )}
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Summary</p>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Cost records</span>
                  <span className="font-bold text-slate-900 dark:text-white">{detailPeriod.costRecordsCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Budget items</span>
                  <span className="font-bold text-slate-900 dark:text-white">{detailPeriod.budgetItemsCount}</span>
                </div>
                {detailPeriod.totalCOGS != null && (
                  <div className="flex justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-600">
                    <span className="text-slate-600 dark:text-slate-400">Total COGS</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(detailPeriod.totalCOGS)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </PageModal>

      {/* Unlock Period Confirmation */}
      <ConfirmationModal
        isOpen={!!unlockTarget}
        onClose={() => setUnlockTarget(null)}
        onConfirm={handleUnlockConfirm}
        title="Unlock Period"
        message={
          unlockTarget
            ? `Unlocking "${unlockTarget.name}" will allow edits again. This action requires manager approval and will be recorded in the audit trail. Are you sure you want to proceed?`
            : ""
        }
        variant="danger"
        confirmText="Unlock Period"
      />
    </FinanceLayout>
  );
};

export default FINPeriodLockingPage;
