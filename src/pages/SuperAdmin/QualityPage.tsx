// ==========================================
// QualityPage.tsx — Quality Assurance (QA)
// Super Admin overview for system-wide quality
// monitoring, defect analysis, and compliance
// governance across all branches.
// ==========================================

import { useState, useMemo } from "react";
import {
  ClipboardCheck,
  AlertOctagon,
  CheckCircle,
  XCircle,
  BarChart2,
  Eye,
  RotateCcw,
  ShieldAlert,
  FileText,
  AlertTriangle,
  Download,
  Activity,
  GitBranch,
  Calendar,
  User,
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
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import PageModal from "../../components/ui/PageModal";
import ViewGapModal from "../../components/ui/ViewGapModal";
import Toast from "../../components/ui/Toast";

// ==========================================
// Types
// ==========================================
type InspectionStatus =
  | "Pending"
  | "Passed"
  | "Failed"
  | "Conditional"
  | "Archived";
type Severity = "Critical" | "Major" | "Minor";

interface Defect {
  id: string;
  description: string;
  severity: Severity;
  location: string;
}

interface Inspection {
  id: string;
  batchId: string;
  productName: string;
  sku: string;
  branch: string;
  inspector: string;
  date: string;
  status: InspectionStatus;
  defects: Defect[];
  checklistScore: number; // Percentage (0–100)
  capaRequired: boolean; // Corrective and Preventive Action
  isLocked: boolean;
}

// ==========================================
// Mock Data
// ==========================================
const MOCK_INSPECTIONS: Inspection[] = [
  {
    id: "INS-2026-001",
    batchId: "B-1029",
    productName: "Classic Denim Jacket",
    sku: "DNM-JKT-001",
    branch: "Manila Main",
    inspector: "J. Cruz",
    date: "Feb 11, 2026",
    status: "Failed",
    defects: [
      {
        id: "D1",
        description: "Uneven stitching on collar",
        severity: "Major",
        location: "Collar",
      },
      {
        id: "D2",
        description: "Button missing",
        severity: "Critical",
        location: "Front Placket",
      },
    ],
    checklistScore: 78,
    capaRequired: true,
    isLocked: true,
  },
  {
    id: "INS-2026-002",
    batchId: "B-1030",
    productName: "Cotton Basic Tee",
    sku: "TEE-WHT-S",
    branch: "Cebu Factory",
    inspector: "M. Santos",
    date: "Feb 11, 2026",
    status: "Passed",
    defects: [],
    checklistScore: 100,
    capaRequired: false,
    isLocked: true,
  },
  {
    id: "INS-2026-003",
    batchId: "B-1031",
    productName: "Silk Scarf",
    sku: "ACC-SLK-009",
    branch: "Davao Hub",
    inspector: "A. Reyes",
    date: "Feb 10, 2026",
    status: "Pending",
    defects: [],
    checklistScore: 0,
    capaRequired: false,
    isLocked: false,
  },
  {
    id: "INS-2026-004",
    batchId: "B-1032",
    productName: "Canvas Tote Bag",
    sku: "BAG-TOT-001",
    branch: "Manila Main",
    inspector: "L. Diaz",
    date: "Feb 09, 2026",
    status: "Conditional",
    defects: [
      {
        id: "D3",
        description: "Loose thread",
        severity: "Minor",
        location: "Handle",
      },
    ],
    checklistScore: 92,
    capaRequired: false,
    isLocked: true,
  },
  {
    id: "INS-2026-005",
    batchId: "B-1033",
    productName: "Polo Shirt Classic",
    sku: "PLO-BLU-M",
    branch: "Cebu Factory",
    inspector: "R. Garcia",
    date: "Feb 08, 2026",
    status: "Passed",
    defects: [],
    checklistScore: 97,
    capaRequired: false,
    isLocked: true,
  },
  {
    id: "INS-2026-006",
    batchId: "B-1034",
    productName: "Cargo Utility Pants",
    sku: "CRG-PNT-KHK",
    branch: "Manila Main",
    inspector: "J. Cruz",
    date: "Feb 07, 2026",
    status: "Failed",
    defects: [
      {
        id: "D4",
        description: "Zipper malfunction",
        severity: "Critical",
        location: "Front Fly",
      },
      {
        id: "D5",
        description: "Color inconsistency",
        severity: "Major",
        location: "Left Leg Panel",
      },
      {
        id: "D6",
        description: "Minor thread pull",
        severity: "Minor",
        location: "Pocket",
      },
    ],
    checklistScore: 62,
    capaRequired: true,
    isLocked: true,
  },
  {
    id: "INS-2026-007",
    batchId: "B-1035",
    productName: "Winter Parka Jacket",
    sku: "WNT-PRK-BLK",
    branch: "Davao Hub",
    inspector: "A. Reyes",
    date: "Feb 06, 2026",
    status: "Pending",
    defects: [],
    checklistScore: 0,
    capaRequired: false,
    isLocked: false,
  },
];

// ------------------------------------------
// Pagination Constants
// ------------------------------------------
const ITEMS_PER_PAGE = 5;

// ==========================================
// Main Component
// ==========================================
function QualityPage() {
  // ------------------------------------------
  // State: Data & Filtering
  // ------------------------------------------
  const [inspections, setInspections] =
    useState<Inspection[]>(MOCK_INSPECTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // ------------------------------------------
  // State: Review Modal (Inspection detail view)
  // ------------------------------------------
  const [selectedInspection, setSelectedInspection] =
    useState<Inspection | null>(null);

  // ------------------------------------------
  // State: View Gap Modal (Defect detail view)
  // Shows defect breakdown for an inspection
  // ------------------------------------------
  const [gapInspection, setGapInspection] = useState<Inspection | null>(null);

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
  // Used by StatsCard components in the header
  // ------------------------------------------
  const metrics = useMemo(() => {
    const total = inspections.length;
    const failed = inspections.filter((i) => i.status === "Failed").length;
    const pending = inspections.filter((i) => i.status === "Pending").length;
    const criticalDefects = inspections
      .flatMap((i) => i.defects)
      .filter((d) => d.severity === "Critical").length;
    const activeCAPAs = inspections.filter((i) => i.capaRequired).length;

    // Rejection Rate = failed / total * 100
    const rejectionRate =
      total > 0 ? ((failed / total) * 100).toFixed(1) : "0";

    return { total, failed, pending, criticalDefects, activeCAPAs, rejectionRate };
  }, [inspections]);

  // ------------------------------------------
  // Computed: Filtered Inspections
  // Matches search query and status filter
  // ------------------------------------------
  const filteredInspections = useMemo(() => {
    return inspections.filter((i) => {
      const matchesSearch =
        i.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.batchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.branch.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        filterStatus === "All" || i.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [inspections, searchQuery, filterStatus]);

  // ------------------------------------------
  // Computed: Pagination
  // Slices filteredInspections for the current page
  // ------------------------------------------
  const totalPages = Math.max(
    1,
    Math.ceil(filteredInspections.length / ITEMS_PER_PAGE),
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(
    startIndex + ITEMS_PER_PAGE,
    filteredInspections.length,
  );
  const paginatedInspections = filteredInspections.slice(startIndex, endIndex);

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
    triggerToast("Exporting Compliance Report...", "success");
  };

  // ------------------------------------------
  // Handler: Update inspection fields
  // Also updates selectedInspection if viewing
  // ------------------------------------------
  const updateInspection = (id: string, updates: Partial<Inspection>) => {
    setInspections((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    );
    setSelectedInspection((prev) =>
      prev && prev.id === id ? { ...prev, ...updates } : prev,
    );
  };

  // ------------------------------------------
  // Handler: Override inspection decision
  // Changes status to Passed or Failed (Super Admin)
  // ------------------------------------------
  const handleOverrideDecision = (
    inspection: Inspection,
    newStatus: InspectionStatus,
  ) => {
    setConfirmModal({
      isOpen: true,
      title: `Override Inspection to '${newStatus}'?`,
      message: `You are about to override the inspector's decision. This action will be logged in the Compliance Audit Trail.`,
      variant: newStatus === "Failed" ? "danger" : "primary",
      confirmText: `Confirm ${newStatus}`,
      action: () => {
        updateInspection(inspection.id, {
          status: newStatus,
          isLocked: true,
        });
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        triggerToast(
          `Inspection ${inspection.id} status changed to ${newStatus}.`,
          "success",
        );
      },
    });
  };

  // ------------------------------------------
  // Handler: Reopen inspection for editing
  // Unlocks the record (Super Admin)
  // ------------------------------------------
  const handleReopen = (inspection: Inspection) => {
    setConfirmModal({
      isOpen: true,
      title: "Reopen Inspection?",
      message:
        "This will unlock the record and allow the inspector to modify data. Use only for data correction.",
      variant: "primary",
      confirmText: "Reopen Record",
      action: () => {
        updateInspection(inspection.id, {
          status: "Pending",
          isLocked: false,
        });
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        triggerToast(
          `Inspection ${inspection.id} reopened for editing.`,
          "success",
        );
      },
    });
  };

  // ------------------------------------------
  // Handler: Force CAPA mandate
  // Flags batch as High Risk (Super Admin)
  // ------------------------------------------
  const handleForceCAPA = (inspection: Inspection) => {
    setConfirmModal({
      isOpen: true,
      title: "Mandate Corrective Action (CAPA)?",
      message:
        "This will flag the batch as High Risk and require a formal corrective action plan from the branch manager.",
      variant: "danger",
      confirmText: "Require CAPA",
      action: () => {
        updateInspection(inspection.id, { capaRequired: true });
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        triggerToast(
          `CAPA mandate issued for Batch ${inspection.batchId}.`,
          "success",
        );
      },
    });
  };

  // ------------------------------------------
  // Helper: Severity badge styling
  // ------------------------------------------
  const getSeverityStyle = (severity: Severity) => {
    switch (severity) {
      case "Critical":
        return "bg-rose-600 text-white";
      case "Major":
        return "bg-orange-100 text-orange-700";
      case "Minor":
        return "bg-slate-100 text-slate-600";
    }
  };

  // ------------------------------------------
  // Helper: Checklist score color
  // ------------------------------------------
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600";
    if (score >= 75) return "text-amber-600";
    return "text-rose-600";
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 90) return "bg-emerald-500";
    if (score >= 75) return "bg-amber-500";
    return "bg-rose-500";
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <>
      {/* ==========================================
          MAIN LAYOUT — Page content only
          All modals rendered OUTSIDE MainLayout
          so their fixed backdrop covers the entire
          viewport (including sidebar).
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
                Quality Assurance (QA)
              </h1>
              <p className="text-xs font-medium text-slate-500 mt-1">
                System-wide quality monitoring, defect analysis, and compliance
                governance.
              </p>
            </div>

            {/* Export Button — uses SecondaryButton for consistent rounded-full design */}
            <SecondaryButton
              onClick={handleExport}
              icon={Download}
              ariaLabel="Export Compliance Report"
            >
              Export Report
            </SecondaryButton>
          </div>

          {/* ==========================================
              SECTION 2: KPI STATS CARDS
              Uses StatsCard component for consistent look
              ========================================== */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard
              title="Rejection Rate"
              value={`${metrics.rejectionRate}%`}
              icon={Activity}
              color="bg-indigo-500"
            />
            <StatsCard
              title="Pending Inspections"
              value={metrics.pending}
              icon={RotateCcw}
              color="bg-amber-500"
            />
            <StatsCard
              title="Critical Defects"
              value={metrics.criticalDefects}
              icon={AlertOctagon}
              color="bg-rose-500"
            />
            <StatsCard
              title="Active CAPAs"
              value={metrics.activeCAPAs}
              icon={FileText}
              color="bg-slate-500"
            />
          </div>

          {/* ==========================================
              SECTION 3: INSPECTIONS TABLE
              Card wraps toolbar, table, and pagination
              ========================================== */}
          <Card className="overflow-hidden">
            {/* 3a. TableToolbar — Search & Status Filter inside the Card */}
            <div className="px-5 pt-5">
              <TableToolbar
                searchQuery={searchQuery}
                setSearchQuery={(q) => {
                  setSearchQuery(q);
                  setCurrentPage(1);
                }}
                isFilterOpen={isFilterOpen}
                setIsFilterOpen={setIsFilterOpen}
                placeholder="Search Batch ID, Product, or SKU..."
                filterLabel={
                  filterStatus === "All" ? "All Statuses" : filterStatus
                }
              >
                {/* Status filter options — rendered inside TableToolbar's dropdown */}
                <div
                  className="p-1.5"
                  role="group"
                  aria-label="Filter by Inspection Status"
                >
                  {[
                    "All",
                    "Passed",
                    "Failed",
                    "Pending",
                    "Conditional",
                  ].map((status) => (
                    <button
                      key={status}
                      role="option"
                      aria-selected={filterStatus === status}
                      onClick={() => {
                        setFilterStatus(status);
                        setIsFilterOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                        filterStatus === status
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {status === "All" ? "All Statuses" : status}
                    </button>
                  ))}
                </div>
              </TableToolbar>
            </div>

            {/* 3b. Inspections Data Table */}
            <div className="overflow-x-auto">
              <table
                className="w-full text-left border-collapse"
                aria-label="Inspection Records"
              >
                {/* Table Header — text-xs (12px) font-bold for column titles */}
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Batch Info
                    </th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Branch & Inspector
                    </th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Risk Factors
                    </th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-sm">
                  {paginatedInspections.map((inspection) => (
                    <tr
                      key={inspection.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Batch Info: Product name, batch ID, SKU */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                            <ClipboardCheck size={18} />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">
                              {inspection.productName}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                              {inspection.batchId} &bull; {inspection.sku}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Branch & Inspector */}
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-700">
                          {inspection.branch}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {inspection.inspector} &bull; {inspection.date}
                        </div>
                      </td>

                      {/* Status — uses StatusBadge + CAPA pill */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <StatusBadge status={inspection.status} />
                          {inspection.capaRequired && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700">
                              CAPA
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Risk Factors — clean pill badges for defects */}
                      <td className="px-6 py-4">
                        {inspection.defects.length > 0 ? (
                          <div className="flex items-center gap-2">
                            {/* Defect count pill */}
                            <span className="inline-flex items-center gap-1 whitespace-nowrap text-left text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full">
                              <AlertTriangle size={11} />
                              {inspection.defects.length} Defect
                              {inspection.defects.length > 1 ? "s" : ""}
                            </span>
                            {/* Critical indicator */}
                            {inspection.defects.some(
                              (d) => d.severity === "Critical",
                            ) && (
                              <span
                                className="inline-flex items-center gap-1 whitespace-nowrap text-left text-[10px] font-bold text-white bg-rose-600 px-2 py-0.5 rounded-full"
                                title="Critical Defect Present"
                              >
                                <ShieldAlert size={10} /> Critical
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 whitespace-nowrap text-left text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                            <CheckCircle size={12} /> Clean
                          </span>
                        )}
                      </td>

                      {/* Actions: Review button with Eye icon */}
                      <td className="px-6 py-4 text-left">
                        <button
                          onClick={() => setSelectedInspection(inspection)}
                          className="inline-flex items-center gap-1 whitespace-nowrap text-left.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                          aria-label={`Review ${inspection.batchId}`}
                        >
                          <Eye size={14} />
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Empty State */}
                  {filteredInspections.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-16 text-center text-slate-400 text-sm"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <ClipboardCheck
                            size={32}
                            className="text-slate-300"
                          />
                          <p className="font-medium">No inspections found</p>
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

            {/* 3c. Pagination — renders at the bottom of the Card */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              startIndex={startIndex}
              endIndex={endIndex}
              totalItems={filteredInspections.length}
              onPageChange={setCurrentPage}
            />
          </Card>
        </div>
      </MainLayout>

      {/* ==========================================
          MODALS — Rendered OUTSIDE MainLayout
          so their fixed backdrop + blur covers the
          entire viewport (including sidebar).
          Ordered bottom-to-top by z-index priority:
            1. Review Modal (z-50)
            2. View Gap DetailsModal (z-50, later DOM = on top)
            3. ConfirmationModal (z-50, last DOM = topmost)
            4. Toast (always on top)
          ========================================== */}

      {/* ---- SECTION 4: REVIEW INSPECTION MODAL ---- */}
      {/* Centered modal for inspection governance, defects, checklist */}
      {selectedInspection ? (
      <PageModal
        isOpen={!!selectedInspection}
        onClose={() => setSelectedInspection(null)}
        title="Inspection Details"
        badges={
          <>
            <StatusBadge status={selectedInspection?.status ?? "Pending"} className="!text-[10px] !py-0.5" />
            {selectedInspection?.capaRequired && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700">CAPA</span>
            )}
          </>
        }
        subtitle={selectedInspection ? <>Batch: {selectedInspection.batchId} &bull; Inspector: {selectedInspection.inspector}</> : undefined}
        ariaId="review-modal-title"
      >
        {/* A. Super Admin Governance Zone */}
              {/* Highlighted section for admin-only override actions */}
              <div className="bg-slate-50 border border-indigo-100 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-2 mb-2">
                  <ShieldAlert size={14} />
                  Admin Governance Actions
                </h3>
                <p className="text-[11px] text-slate-500 mb-4">
                  Override operational decisions or mandate compliance actions.
                  All actions are audited.
                </p>

                {/* Governance action buttons — uses SecondaryButton */}
                <div className="flex flex-wrap gap-2">
                  <SecondaryButton
                    onClick={() =>
                      handleOverrideDecision(selectedInspection, "Passed")
                    }
                    icon={CheckCircle}
                    className="!px-3 !py-2 !text-[11px]"
                  >
                    Force Pass
                  </SecondaryButton>
                  <SecondaryButton
                    onClick={() =>
                      handleOverrideDecision(selectedInspection, "Failed")
                    }
                    icon={XCircle}
                    className="!px-3 !py-2 !text-[11px]"
                  >
                    Force Fail
                  </SecondaryButton>
                  <SecondaryButton
                    onClick={() => handleReopen(selectedInspection)}
                    disabled={!selectedInspection.isLocked}
                    icon={RotateCcw}
                    className="!px-3 !py-2 !text-[11px]"
                  >
                    Reopen Inspection
                  </SecondaryButton>
                  <SecondaryButton
                    onClick={() => handleForceCAPA(selectedInspection)}
                    disabled={selectedInspection.capaRequired}
                    icon={FileText}
                    className="!px-3 !py-2 !text-[11px]"
                  >
                    Mandate CAPA
                  </SecondaryButton>
                </div>
              </div>

              {/* B. Defect Log — shows defects or clean status */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle size={14} className="text-slate-400" />
                    Defect Log
                  </h4>
                  {/* View Gap button — opens defect detail modal */}
                  {selectedInspection.defects.length > 0 && (
                    <button
                      onClick={() => setGapInspection(selectedInspection)}
                      className="inline-flex items-center gap-1 whitespace-nowrap text-left text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors"
                    >
                      <Eye size={12} />
                      View Gap
                    </button>
                  )}
                </div>
                {selectedInspection.defects.length > 0 ? (
                  <div className="space-y-2">
                    {selectedInspection.defects.map((defect) => (
                      <div
                        key={defect.id}
                        className="p-3 border border-rose-100 bg-rose-50/50 rounded-xl flex justify-between items-start"
                      >
                        <div>
                          <p className="text-sm font-semibold text-rose-900">
                            {defect.description}
                          </p>
                          <p className="text-[11px] text-rose-600 mt-0.5">
                            Location: {defect.location}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getSeverityStyle(defect.severity)}`}
                        >
                          {defect.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center text-sm text-slate-500">
                    <div className="flex flex-col items-center gap-1">
                      <CheckCircle size={20} className="text-emerald-500" />
                      <p className="font-medium text-emerald-700">
                        No defects recorded
                      </p>
                      <p className="text-xs text-slate-400">
                        Product marked as clean.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* C. Checklist Summary — compliance score bar */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <ClipboardCheck size={14} className="text-slate-400" />
                  Checklist Summary
                </h4>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-700 font-medium">
                      Overall Compliance Score
                    </span>
                    <span
                      className={`text-lg font-bold ${getScoreColor(selectedInspection.checklistScore)}`}
                    >
                      {selectedInspection.checklistScore}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${getScoreBarColor(selectedInspection.checklistScore)}`}
                      style={{
                        width: `${selectedInspection.checklistScore}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">
                    *Detailed checklist answers are archived and available in
                    the full report export.
                  </p>
                </div>
              </div>

              {/* D. Inspection Metadata — timeline and branch info */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <BarChart2 size={14} className="text-slate-400" />
                  Inspection Details
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm border-t border-slate-100 pt-4">
                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <Package size={10} /> Product
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {selectedInspection.productName}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <GitBranch size={10} /> Branch
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {selectedInspection.branch}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <Calendar size={10} /> Date
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {selectedInspection.date}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <User size={10} /> Inspector
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {selectedInspection.inspector}
                    </span>
                  </div>
                </div>
              </div>
      </PageModal>
      ) : null}

      {/* ---- VIEW GAP DETAILS MODAL ---- */}
      {/* Renders AFTER review modal so it stacks on top when both are open */}
      <ViewGapModal
        isOpen={!!gapInspection}
        onClose={() => setGapInspection(null)}
        title="Defect Gap Analysis"
        itemId={gapInspection?.batchId || ""}
        headerIcon={
          <div className="p-2 bg-rose-50 rounded-xl">
            <AlertTriangle size={20} className="text-rose-600" />
          </div>
        }
        fields={[
          {
            label: "Product",
            value: gapInspection?.productName || "",
            icon: Package,
          },
          {
            label: "Branch",
            value: gapInspection?.branch || "",
            icon: GitBranch,
          },
          {
            label: "Status",
            value: gapInspection ? (
              <StatusBadge status={gapInspection.status} />
            ) : (
              ""
            ),
            icon: ClipboardCheck,
          },
          {
            label: "Score",
            value: gapInspection
              ? `${gapInspection.checklistScore}%`
              : "",
            icon: BarChart2,
          },
        ]}
      >
        {/* Defect Breakdown */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Defect Breakdown ({gapInspection?.defects.length || 0} found)
          </p>
          {gapInspection && gapInspection.defects.length > 0 ? (
            <div className="space-y-2">
              {gapInspection.defects.map((defect) => (
                <div
                  key={defect.id}
                  className="flex items-center justify-between bg-white border border-slate-100 rounded-lg px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {defect.description}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Location: {defect.location}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${getSeverityStyle(defect.severity)}`}
                  >
                    {defect.severity}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">
              No defects recorded.
            </p>
          )}
          {gapInspection &&
            gapInspection.defects.some(
              (d) => d.severity === "Critical",
            ) && (
              <div className="mt-3 flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                <ShieldAlert size={12} />
                <span className="font-medium">
                  Critical defects detected — immediate corrective action
                  required.
                </span>
              </div>
            )}
        </div>
      </ViewGapModal>

      {/* ---- CONFIRMATION MODAL ---- */}
      {/* Renders LAST so it always appears on top of everything */}
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

export default QualityPage;
