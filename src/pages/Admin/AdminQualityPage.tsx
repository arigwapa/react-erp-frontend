// ==========================================
// AdminQualityPage.tsx — Branch Admin Quality (QA)
// 3 tabs: Inspections | Approvals / Rejections | CAPA
// Branch scope only — Manila branch.
//
// Reusable UI: TabBar, TableToolbar, PageModal, DetailsModal,
//   ConfirmationModal, Toast, InputGroup, IconSelect,
//   StatsCard, StatusBadge, Card, Pagination, Buttons
// ==========================================

import { useState, useMemo, useEffect } from "react";

// --- Layout ---
import AdminLayout from "../../layout/AdminLayout";

// --- Icons ---
import {
  ClipboardCheck,
  AlertOctagon,
  BarChart2,
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  MessageSquarePlus,
  Plus,
  Pencil,
  Lock,
  Calendar,
  User,
  Package,
  Wrench,
  Download,
  AlertTriangle,
  Hash,
  Shield,
  Clock,
  Archive,
} from "lucide-react";

// --- Reusable UI Components (from components/ui) ---
import { Card } from "../../components/ui/Card";
import StatsCard from "../../components/ui/StatsCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import TabBar from "../../components/ui/TabBar";
import type { Tab } from "../../components/ui/TabBar";
import { TableToolbar } from "../../components/ui/TableToolbar";
import Pagination from "../../components/ui/Pagination";
import PrimaryButton from "../../components/ui/PrimaryButton";
import SecondaryButton from "../../components/ui/SecondaryButton";
import PageModal from "../../components/ui/PageModal";
import DetailsModal from "../../components/ui/DetailsModal";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Toast from "../../components/ui/Toast";
import InputGroup from "../../components/ui/InputGroup";
import IconSelect from "../../components/ui/IconSelect";
import type { IconSelectOption } from "../../components/ui/IconSelect";

// ==========================================
// TYPES
// ==========================================

interface Inspection {
  id: string;
  workOrder: string;
  product: string;
  batch: string;
  inspector: string;
  result: "Pass" | "Fail" | "Pending";
  defectCount: number;
  date: string;
  findings: string;
  capaRequired: boolean;
}

interface ApprovalItem {
  id: string;
  inspectionId: string;
  product: string;
  inspectionSummary: string;
  defectCount: number;
  requestedBy: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
}

interface CapaItem {
  id: string;
  relatedDefect: string;
  rootCause: string;
  assignedStaff: string;
  description: string;
  createdDate: string;
  targetDate: string;
  status: "Open" | "In Progress" | "Closed";
}

// ==========================================
// MOCK DATA (enriched for detail modals)
// ==========================================

const MOCK_INSPECTIONS: Inspection[] = [
  { id: "INS-2026-001", workOrder: "WO-2026-045", product: "Cotton Denim Fabric", batch: "B-4012", inspector: "Maria Santos", result: "Pass", defectCount: 0, date: "Feb 12, 2026", findings: "All quality parameters within acceptable range. Fabric weight, color fastness, and tensile strength passed.", capaRequired: false },
  { id: "INS-2026-002", workOrder: "WO-2026-046", product: "Polyester Blend Shirt", batch: "B-4015", inspector: "Sarah Lim", result: "Fail", defectCount: 3, date: "Feb 11, 2026", findings: "Three defects found: 1) Color inconsistency in dye lot, 2) Stitching irregularity on sleeve seam, 3) Button alignment issue.", capaRequired: true },
  { id: "INS-2026-003", workOrder: "WO-2026-047", product: "Wool Blend Sweater", batch: "B-4018", inspector: "Juan Dela Cruz", result: "Pending", defectCount: 0, date: "Feb 13, 2026", findings: "Inspection in progress. Awaiting final quality assessment on pilling resistance.", capaRequired: false },
  { id: "INS-2026-004", workOrder: "WO-2026-048", product: "Silk Scarf", batch: "B-4020", inspector: "Maria Santos", result: "Pass", defectCount: 0, date: "Feb 10, 2026", findings: "Excellent quality. Color vibrancy and weave density meet premium specifications.", capaRequired: false },
  { id: "INS-2026-005", workOrder: "WO-2026-049", product: "Cotton T-Shirt", batch: "B-4010", inspector: "Sarah Lim", result: "Fail", defectCount: 2, date: "Feb 9, 2026", findings: "Two defects: 1) Collar stretching beyond tolerance, 2) Misaligned print on front panel.", capaRequired: true },
  { id: "INS-2026-006", workOrder: "WO-2026-050", product: "Linen Tablecloth", batch: "B-4022", inspector: "Juan Dela Cruz", result: "Pass", defectCount: 0, date: "Feb 8, 2026", findings: "All specifications met. Ready for packaging and shipment.", capaRequired: false },
  { id: "INS-2026-007", workOrder: "WO-2026-051", product: "Bamboo Fiber Towel", batch: "B-4019", inspector: "Maria Santos", result: "Pending", defectCount: 0, date: "Feb 13, 2026", findings: "Absorbency test in progress. Initial results slightly below standard — may need treatment.", capaRequired: false },
];

const MOCK_APPROVALS: ApprovalItem[] = [
  { id: "APR-001", inspectionId: "INS-2026-002", product: "Polyester Blend Shirt", inspectionSummary: "Color inconsistency, stitching defect, button alignment issue.", defectCount: 3, requestedBy: "Sarah Lim", date: "Feb 11, 2026", status: "Pending" },
  { id: "APR-002", inspectionId: "INS-2026-003", product: "Wool Blend Sweater", inspectionSummary: "Minor pilling detected; rework required before release.", defectCount: 1, requestedBy: "Juan Dela Cruz", date: "Feb 13, 2026", status: "Pending" },
  { id: "APR-003", inspectionId: "INS-2026-005", product: "Cotton T-Shirt", inspectionSummary: "Collar stretching and print misalignment.", defectCount: 2, requestedBy: "Sarah Lim", date: "Feb 9, 2026", status: "Pending" },
  { id: "APR-004", inspectionId: "INS-2026-007", product: "Bamboo Fiber Towel", inspectionSummary: "Absorbency below standard — treatment needed.", defectCount: 1, requestedBy: "Maria Santos", date: "Feb 13, 2026", status: "Pending" },
  { id: "APR-005", inspectionId: "INS-2026-001", product: "Cotton Denim Fabric", inspectionSummary: "All parameters within range. No action required.", defectCount: 0, requestedBy: "Maria Santos", date: "Feb 12, 2026", status: "Approved" },
];

const MOCK_CAPA: CapaItem[] = [
  { id: "CAPA-001", relatedDefect: "INS-2026-002 — Color inconsistency", rootCause: "Dye lot variance from supplier batch #DL-4502", assignedStaff: "Maria Santos", description: "Investigate dye lot from supplier; establish incoming QC checks for color matching before production.", createdDate: "Feb 11, 2026", targetDate: "Feb 20, 2026", status: "Open" },
  { id: "CAPA-002", relatedDefect: "INS-2026-005 — Button alignment", rootCause: "Template misalignment on button sewing machine B2", assignedStaff: "Sarah Lim", description: "Recalibrate button sewing machine B2; add alignment check to daily startup procedure.", createdDate: "Feb 9, 2026", targetDate: "Feb 16, 2026", status: "In Progress" },
  { id: "CAPA-003", relatedDefect: "INS-2026-006 — Fabric tear", rootCause: "Handling damage during cutting due to worn blade", assignedStaff: "Juan Dela Cruz", description: "Replaced cutting blade. Implemented weekly blade inspection checklist.", createdDate: "Feb 8, 2026", targetDate: "Feb 12, 2026", status: "Closed" },
  { id: "CAPA-004", relatedDefect: "INS-2026-007 — Absorbency", rootCause: "Treatment process step skipped in finishing line", assignedStaff: "Maria Santos", description: "Investigate finishing line workflow; add mandatory treatment step confirmation before packaging.", createdDate: "Feb 13, 2026", targetDate: "Feb 22, 2026", status: "Open" },
  { id: "CAPA-005", relatedDefect: "INS-2026-003 — Pilling", rootCause: "Under-curing in finishing oven; temperature 10°C below spec", assignedStaff: "Sarah Lim", description: "Calibrate finishing oven thermostat. Add temperature logging to batch records.", createdDate: "Feb 10, 2026", targetDate: "Feb 18, 2026", status: "In Progress" },
];

// ==========================================
// CONSTANTS
// ==========================================

const ITEMS_PER_PAGE = 5;

const QA_TABS: Tab[] = [
  { id: "inspections", label: "Inspections", icon: ClipboardCheck, count: MOCK_INSPECTIONS.filter((i) => i.result === "Pending").length },
  { id: "approvals", label: "Approvals / Rejections", icon: Shield, count: MOCK_APPROVALS.filter((a) => a.status === "Pending").length },
  { id: "capa", label: "CAPA", icon: Wrench, count: MOCK_CAPA.filter((c) => c.status !== "Closed").length },
];

const INSPECTION_RESULT_FILTERS = ["All Results", "Pass", "Fail", "Pending"];
const APPROVAL_STATUS_FILTERS = ["All Statuses", "Pending", "Approved", "Rejected"];
const CAPA_STATUS_FILTERS = ["All Statuses", "Open", "In Progress", "Closed"];

const CAPA_STATUS_OPTIONS: IconSelectOption[] = [
  { value: "Open", label: "Open", icon: AlertOctagon },
  { value: "In Progress", label: "In Progress", icon: Clock },
  { value: "Closed", label: "Closed", icon: CheckCircle },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

function AdminQualityPage() {
  // --- Tab ---
  const [activeTab, setActiveTab] = useState("inspections");

  // --- Inspections state ---
  const [inspections, setInspections] = useState<Inspection[]>(MOCK_INSPECTIONS);
  const [searchInsp, setSearchInsp] = useState("");
  const [filterInspOpen, setFilterInspOpen] = useState(false);
  const [filterInspResult, setFilterInspResult] = useState("All Results");
  const [pageInsp, setPageInsp] = useState(1);

  // --- Approvals state ---
  const [approvals, setApprovals] = useState<ApprovalItem[]>(MOCK_APPROVALS);
  const [searchAppr, setSearchAppr] = useState("");
  const [filterApprOpen, setFilterApprOpen] = useState(false);
  const [filterApprStatus, setFilterApprStatus] = useState("All Statuses");
  const [pageAppr, setPageAppr] = useState(1);

  // --- CAPA state ---
  const [capaList, setCapaList] = useState<CapaItem[]>(MOCK_CAPA);
  const [searchCapa, setSearchCapa] = useState("");
  const [filterCapaOpen, setFilterCapaOpen] = useState(false);
  const [filterCapaStatus, setFilterCapaStatus] = useState("All Statuses");
  const [pageCapa, setPageCapa] = useState(1);

  // --- Modal: Inspection Detail ---
  const [detailInspection, setDetailInspection] = useState<Inspection | null>(null);

  // --- Modal: CAPA Detail ---
  const [detailCapa, setDetailCapa] = useState<CapaItem | null>(null);

  // --- Modal: Add Remarks ---
  const [remarksItem, setRemarksItem] = useState<ApprovalItem | null>(null);
  const [remarksText, setRemarksText] = useState("");

  // --- Modal: Create/Edit CAPA ---
  const [isCapaFormOpen, setIsCapaFormOpen] = useState(false);
  const [editingCapa, setEditingCapa] = useState<CapaItem | null>(null);
  const [formCapaDefect, setFormCapaDefect] = useState("");
  const [formCapaRoot, setFormCapaRoot] = useState("");
  const [formCapaStaff, setFormCapaStaff] = useState("");
  const [formCapaDesc, setFormCapaDesc] = useState("");
  const [formCapaTarget, setFormCapaTarget] = useState("");
  const [formCapaStatus, setFormCapaStatus] = useState("Open");

  // --- Toast & Confirm ---
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
    variant: "primary" | "danger";
    confirmText: string;
  }>({ isOpen: false, title: "", message: "", action: () => {}, variant: "primary", confirmText: "Confirm" });

  // --- Reset pagination on filter changes ---
  useEffect(() => { setPageInsp(1); }, [searchInsp, filterInspResult]);
  useEffect(() => { setPageAppr(1); }, [searchAppr, filterApprStatus]);
  useEffect(() => { setPageCapa(1); }, [searchCapa, filterCapaStatus]);

  // ==========================================
  // COMPUTED: Stats
  // ==========================================
  const totalInspections = inspections.length;
  const passedCount = inspections.filter((i) => i.result === "Pass").length;
  const failedCount = inspections.filter((i) => i.result === "Fail").length;
  const passRate = totalInspections > 0 ? Math.round((passedCount / totalInspections) * 100) : 0;
  const openCapaCount = capaList.filter((c) => c.status !== "Closed").length;

  // ==========================================
  // COMPUTED: Filtered — Inspections
  // ==========================================
  const filteredInsp = useMemo(() => {
    const q = searchInsp.toLowerCase();
    return inspections.filter((i) => {
      const matchSearch = i.id.toLowerCase().includes(q) || i.product.toLowerCase().includes(q) || i.inspector.toLowerCase().includes(q) || i.workOrder.toLowerCase().includes(q);
      const matchResult = filterInspResult === "All Results" || i.result === filterInspResult;
      return matchSearch && matchResult;
    });
  }, [inspections, searchInsp, filterInspResult]);

  const inspTotalPages = Math.max(1, Math.ceil(filteredInsp.length / ITEMS_PER_PAGE));
  const inspStart = (pageInsp - 1) * ITEMS_PER_PAGE;
  const inspEnd = Math.min(inspStart + ITEMS_PER_PAGE, filteredInsp.length);
  const paginatedInsp = filteredInsp.slice(inspStart, inspEnd);

  // ==========================================
  // COMPUTED: Filtered — Approvals
  // ==========================================
  const filteredAppr = useMemo(() => {
    const q = searchAppr.toLowerCase();
    return approvals.filter((a) => {
      const matchSearch = a.inspectionId.toLowerCase().includes(q) || a.product.toLowerCase().includes(q) || a.requestedBy.toLowerCase().includes(q);
      const matchStatus = filterApprStatus === "All Statuses" || a.status === filterApprStatus;
      return matchSearch && matchStatus;
    });
  }, [approvals, searchAppr, filterApprStatus]);

  const apprTotalPages = Math.max(1, Math.ceil(filteredAppr.length / ITEMS_PER_PAGE));
  const apprStart = (pageAppr - 1) * ITEMS_PER_PAGE;
  const apprEnd = Math.min(apprStart + ITEMS_PER_PAGE, filteredAppr.length);
  const paginatedAppr = filteredAppr.slice(apprStart, apprEnd);

  // ==========================================
  // COMPUTED: Filtered — CAPA
  // ==========================================
  const filteredCapa = useMemo(() => {
    const q = searchCapa.toLowerCase();
    return capaList.filter((c) => {
      const matchSearch = c.id.toLowerCase().includes(q) || c.relatedDefect.toLowerCase().includes(q) || c.assignedStaff.toLowerCase().includes(q);
      const matchStatus = filterCapaStatus === "All Statuses" || c.status === filterCapaStatus;
      return matchSearch && matchStatus;
    });
  }, [capaList, searchCapa, filterCapaStatus]);

  const capaTotalPages = Math.max(1, Math.ceil(filteredCapa.length / ITEMS_PER_PAGE));
  const capaStart = (pageCapa - 1) * ITEMS_PER_PAGE;
  const capaEnd = Math.min(capaStart + ITEMS_PER_PAGE, filteredCapa.length);
  const paginatedCapa = filteredCapa.slice(capaStart, capaEnd);

  // ==========================================
  // HANDLERS: Approvals
  // ==========================================
  const handleApprove = (item: ApprovalItem) => {
    setConfirmModal({ isOpen: true, title: "Approve Inspection?", message: `Approve QA decision for ${item.inspectionId} (${item.product})?`, variant: "primary", confirmText: "Approve", action: () => { setApprovals((prev) => prev.map((a) => (a.id === item.id ? { ...a, status: "Approved" as const } : a))); setToast({ message: `${item.inspectionId} approved.`, type: "success" }); setConfirmModal((p) => ({ ...p, isOpen: false })); } });
  };

  const handleReject = (item: ApprovalItem) => {
    setConfirmModal({ isOpen: true, title: "Reject Inspection?", message: `Reject QA for ${item.inspectionId}? This may require CAPA.`, variant: "danger", confirmText: "Reject", action: () => { setApprovals((prev) => prev.map((a) => (a.id === item.id ? { ...a, status: "Rejected" as const } : a))); setToast({ message: `${item.inspectionId} rejected.`, type: "success" }); setConfirmModal((p) => ({ ...p, isOpen: false })); } });
  };

  const handleSaveRemarks = () => {
    if (!remarksText.trim()) { setToast({ message: "Please enter remarks.", type: "error" }); return; }
    setToast({ message: `Remarks saved for ${remarksItem?.inspectionId}.`, type: "success" });
    setRemarksItem(null);
    setRemarksText("");
  };

  // ==========================================
  // HANDLERS: CAPA Form
  // ==========================================
  const openCreateCapa = () => {
    setEditingCapa(null); setFormCapaDefect(""); setFormCapaRoot(""); setFormCapaStaff(""); setFormCapaDesc(""); setFormCapaTarget(""); setFormCapaStatus("Open"); setIsCapaFormOpen(true);
  };

  const openEditCapa = (capa: CapaItem) => {
    setEditingCapa(capa); setFormCapaDefect(capa.relatedDefect); setFormCapaRoot(capa.rootCause); setFormCapaStaff(capa.assignedStaff); setFormCapaDesc(capa.description); setFormCapaTarget(capa.targetDate); setFormCapaStatus(capa.status); setIsCapaFormOpen(true);
  };

  const handleSaveCapa = () => {
    if (!formCapaDefect.trim() || !formCapaRoot.trim() || !formCapaStaff.trim()) { setToast({ message: "Please fill in all required fields.", type: "error" }); return; }
    if (editingCapa) {
      setCapaList((prev) => prev.map((c) => (c.id === editingCapa.id ? { ...c, relatedDefect: formCapaDefect, rootCause: formCapaRoot, assignedStaff: formCapaStaff, description: formCapaDesc, targetDate: formCapaTarget || c.targetDate, status: formCapaStatus as CapaItem["status"] } : c)));
      setToast({ message: `${editingCapa.id} updated successfully.`, type: "success" });
    } else {
      const newCapa: CapaItem = { id: `CAPA-${String(capaList.length + 1).padStart(3, "0")}`, relatedDefect: formCapaDefect, rootCause: formCapaRoot, assignedStaff: formCapaStaff, description: formCapaDesc, createdDate: "Feb 13, 2026", targetDate: formCapaTarget || "TBD", status: formCapaStatus as CapaItem["status"] };
      setCapaList((prev) => [newCapa, ...prev]);
      setToast({ message: `${newCapa.id} created successfully.`, type: "success" });
    }
    setIsCapaFormOpen(false);
  };

  const handleCloseCapa = (capa: CapaItem) => {
    setConfirmModal({ isOpen: true, title: "Close CAPA?", message: `Mark ${capa.id} as Closed? This confirms corrective actions are complete.`, variant: "primary", confirmText: "Close CAPA", action: () => { setCapaList((prev) => prev.map((c) => (c.id === capa.id ? { ...c, status: "Closed" as const } : c))); setToast({ message: `${capa.id} closed.`, type: "success" }); setConfirmModal((p) => ({ ...p, isOpen: false })); } });
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <>
      <AdminLayout>
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
          {/* ---- PAGE HEADER ---- */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Quality (QA)</h1>
              <p className="text-xs font-medium text-slate-500 mt-1">Monitor inspections, approvals, and corrective actions for this branch.</p>
            </div>
            <div className="flex items-center gap-3">
              <SecondaryButton onClick={() => setToast({ message: "Exporting QA report...", type: "success" })} icon={Download}>Export</SecondaryButton>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold"><Lock size={12} />Branch: Manila (Locked)</div>
            </div>
          </div>

          {/* ---- KPI STATS ---- */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard title="Total Inspections" value={totalInspections} icon={ClipboardCheck} color="bg-blue-500" />
            <StatsCard title="Pass Rate" value={`${passRate}%`} icon={BarChart2} color="bg-emerald-500" trend={passRate >= 80 ? "On Target" : "Below Target"} trendUp={passRate >= 80} />
            <StatsCard title="Failed / Rejected" value={failedCount} icon={AlertOctagon} color="bg-rose-500" />
            <StatsCard title="Open CAPA" value={openCapaCount} icon={Wrench} color="bg-amber-500" />
          </div>

          {/* ---- TAB BAR ---- */}
          <TabBar tabs={QA_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* ============================================================
              TAB 1: INSPECTIONS
              ============================================================ */}
          {activeTab === "inspections" && (
            <Card className="overflow-hidden">
              <div className="px-5 pt-5">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                    <TableToolbar searchQuery={searchInsp} setSearchQuery={setSearchInsp} isFilterOpen={filterInspOpen} setIsFilterOpen={setFilterInspOpen} placeholder="Search inspections..." filterLabel={filterInspResult === "All Results" ? "All Results" : filterInspResult}>
                      <div className="p-1.5" role="group">{INSPECTION_RESULT_FILTERS.map((s) => (<button key={s} role="option" aria-selected={filterInspResult === s} onClick={() => { setFilterInspResult(s); setFilterInspOpen(false); }} className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${filterInspResult === s ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>{s}</button>))}</div>
                    </TableToolbar>
                  </div>
                  <PrimaryButton onClick={() => setToast({ message: "Record inspection form coming soon.", type: "success" })} className="!w-auto !py-2.5 !px-4 !text-xs !rounded-full"><Plus size={14} /> Record Inspection</PrimaryButton>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Inspection Info</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Inspector</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Result</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Defects</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {paginatedInsp.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-400 shrink-0"><ClipboardCheck size={18} /></div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 text-sm truncate">{row.product}</div>
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5">{row.id} · {row.workOrder} · Batch {row.batch}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-600 hidden md:table-cell">{row.inspector}</td>
                        <td className="px-6 py-4"><StatusBadge status={row.result === "Pass" ? "Passed" : row.result === "Fail" ? "Failed" : "Pending"} /></td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          {row.defectCount > 0 ? (
                            <span className="inline-flex items-center gap-1 whitespace-nowrap text-left text-[11px] font-bold text-rose-600"><AlertTriangle size={12} /> {row.defectCount}</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 whitespace-nowrap text-left text-[11px] font-medium text-emerald-600"><CheckCircle size={12} /> 0</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 hidden lg:table-cell">{row.date}</td>
                        <td className="px-6 py-4 text-left">
                          <div className="flex justify-start items-center gap-1">
                            <button onClick={() => setDetailInspection(row)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Details"><Eye size={14} /></button>
                            <button onClick={() => { setInspections(prev => prev.filter(i => i.id !== row.id)); setToast({ message: `Inspection ${row.id} has been archived.`, type: "success" }); }} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title="Archive"><Archive size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredInsp.length === 0 && (<tr><td colSpan={6} className="px-6 py-16 text-center text-slate-400 text-sm"><div className="flex flex-col items-center gap-2"><ClipboardCheck size={32} className="text-slate-300" /><p className="font-medium">No inspections found</p><p className="text-xs">Try adjusting your search or filter criteria.</p></div></td></tr>)}
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={pageInsp} totalPages={inspTotalPages} startIndex={inspStart} endIndex={inspEnd} totalItems={filteredInsp.length} onPageChange={setPageInsp} />
            </Card>
          )}

          {/* ============================================================
              TAB 2: APPROVALS / REJECTIONS
              ============================================================ */}
          {activeTab === "approvals" && (
            <Card className="overflow-hidden">
              <div className="px-5 pt-5">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                  <TableToolbar searchQuery={searchAppr} setSearchQuery={setSearchAppr} isFilterOpen={filterApprOpen} setIsFilterOpen={setFilterApprOpen} placeholder="Search approvals..." filterLabel={filterApprStatus === "All Statuses" ? "All Statuses" : filterApprStatus}>
                    <div className="p-1.5" role="group">{APPROVAL_STATUS_FILTERS.map((s) => (<button key={s} role="option" aria-selected={filterApprStatus === s} onClick={() => { setFilterApprStatus(s); setFilterApprOpen(false); }} className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${filterApprStatus === s ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>{s}</button>))}</div>
                  </TableToolbar>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Inspection</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Summary</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Defects</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Requested By</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {paginatedAppr.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-400 shrink-0"><Shield size={18} /></div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 text-sm truncate">{row.product}</div>
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5">{row.inspectionId} · {row.date}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 max-w-[200px] truncate hidden md:table-cell">{row.inspectionSummary}</td>
                        <td className="px-6 py-4">
                          {row.defectCount > 0 ? <span className="inline-flex items-center gap-1 whitespace-nowrap text-left text-[11px] font-bold text-rose-600"><AlertTriangle size={12} /> {row.defectCount}</span> : <span className="text-[11px] font-medium text-emerald-600">0</span>}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 hidden md:table-cell">{row.requestedBy}</td>
                        <td className="px-6 py-4"><StatusBadge status={row.status} /></td>
                        <td className="px-6 py-4 text-left">
                          <div className="flex justify-start items-center gap-1">
                            {row.status === "Pending" && (
                              <>
                                <button onClick={() => handleApprove(row)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Approve"><CheckCircle size={14} /></button>
                                <button onClick={() => handleReject(row)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Reject"><XCircle size={14} /></button>
                              </>
                            )}
                            <button onClick={() => { setRemarksItem(row); setRemarksText(""); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Add Remarks"><MessageSquarePlus size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredAppr.length === 0 && (<tr><td colSpan={6} className="px-6 py-16 text-center text-slate-400 text-sm"><div className="flex flex-col items-center gap-2"><Shield size={32} className="text-slate-300" /><p className="font-medium">No approval items found</p><p className="text-xs">Try adjusting your search or filter criteria.</p></div></td></tr>)}
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={pageAppr} totalPages={apprTotalPages} startIndex={apprStart} endIndex={apprEnd} totalItems={filteredAppr.length} onPageChange={setPageAppr} />
            </Card>
          )}

          {/* ============================================================
              TAB 3: CAPA
              ============================================================ */}
          {activeTab === "capa" && (
            <Card className="overflow-hidden">
              <div className="px-5 pt-5">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                    <TableToolbar searchQuery={searchCapa} setSearchQuery={setSearchCapa} isFilterOpen={filterCapaOpen} setIsFilterOpen={setFilterCapaOpen} placeholder="Search CAPA..." filterLabel={filterCapaStatus === "All Statuses" ? "All Statuses" : filterCapaStatus}>
                      <div className="p-1.5" role="group">{CAPA_STATUS_FILTERS.map((s) => (<button key={s} role="option" aria-selected={filterCapaStatus === s} onClick={() => { setFilterCapaStatus(s); setFilterCapaOpen(false); }} className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${filterCapaStatus === s ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>{s}</button>))}</div>
                    </TableToolbar>
                  </div>
                  <PrimaryButton onClick={openCreateCapa} className="!w-auto !py-2.5 !px-4 !text-xs !rounded-full"><Plus size={14} /> Create CAPA</PrimaryButton>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">CAPA Info</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Root Cause</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Assigned</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {paginatedCapa.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${row.status === "Closed" ? "bg-emerald-50 text-emerald-400" : row.status === "In Progress" ? "bg-blue-50 text-blue-400" : "bg-rose-50 text-rose-400"}`}><Wrench size={18} /></div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 text-sm truncate">{row.relatedDefect}</div>
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5">{row.id} · Target: {row.targetDate}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 max-w-[180px] truncate hidden md:table-cell">{row.rootCause}</td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-600 hidden lg:table-cell">{row.assignedStaff}</td>
                        <td className="px-6 py-4"><StatusBadge status={row.status} /></td>
                        <td className="px-6 py-4 text-left">
                          <div className="flex justify-start items-center gap-1">
                            <button onClick={() => setDetailCapa(row)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Details"><Eye size={14} /></button>
                            {row.status !== "Closed" && (
                              <>
                                <button onClick={() => openEditCapa(row)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Pencil size={14} /></button>
                                <button onClick={() => handleCloseCapa(row)} className="inline-flex items-center gap-1 whitespace-nowrap text-left px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors" title="Close CAPA"><CheckCircle size={12} /> Close</button>
                              </>
                            )}
                            <button onClick={() => { setCapaList(prev => prev.filter(c => c.id !== row.id)); setToast({ message: `CAPA ${row.id} has been archived.`, type: "success" }); }} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title="Archive"><Archive size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredCapa.length === 0 && (<tr><td colSpan={5} className="px-6 py-16 text-center text-slate-400 text-sm"><div className="flex flex-col items-center gap-2"><Wrench size={32} className="text-slate-300" /><p className="font-medium">No CAPA entries found</p><p className="text-xs">Try adjusting your search or filter criteria.</p></div></td></tr>)}
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={pageCapa} totalPages={capaTotalPages} startIndex={capaStart} endIndex={capaEnd} totalItems={filteredCapa.length} onPageChange={setPageCapa} />
            </Card>
          )}
        </div>
      </AdminLayout>

      {/* ==================================================================
          MODALS
          ================================================================== */}

      {/* ---- INSPECTION DETAIL (PageModal) ---- */}
      {detailInspection && (
        <PageModal isOpen={!!detailInspection} onClose={() => setDetailInspection(null)} title={`Inspection ${detailInspection.id}`} badges={<><StatusBadge status={detailInspection.result === "Pass" ? "Passed" : detailInspection.result === "Fail" ? "Failed" : "Pending"} className="!text-[10px] !py-0.5" />{detailInspection.capaRequired && <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-orange-50 text-orange-700 border border-orange-200">CAPA Required</span>}</>} subtitle={<>{detailInspection.product} · Batch {detailInspection.batch} · {detailInspection.workOrder}</>} maxWidth="max-w-2xl">
          {/* Details Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3"><ClipboardCheck size={14} className="text-slate-400" /> Inspection Details</h4>
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><User size={10} /> Inspector</span><span className="text-sm font-semibold text-slate-700">{detailInspection.inspector}</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Calendar size={10} /> Date</span><span className="text-sm font-semibold text-slate-700">{detailInspection.date}</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Hash size={10} /> Defect Count</span><span className="text-sm font-semibold text-slate-700">{detailInspection.defectCount}</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Package size={10} /> Product</span><span className="text-sm font-semibold text-slate-700">{detailInspection.product}</span></div>
            </div>
          </div>
          {/* Findings */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3"><FileText size={14} className="text-slate-400" /> Findings</h4>
            <p className="text-sm text-slate-700 leading-relaxed bg-white border border-slate-200 rounded-xl p-4">{detailInspection.findings}</p>
          </div>
          {/* CAPA Notice */}
          {detailInspection.capaRequired && (
            <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <div className="p-2 bg-orange-100 rounded-lg"><AlertOctagon size={18} className="text-orange-600" /></div>
              <div><h4 className="text-xs font-bold text-orange-900 uppercase tracking-wider mb-1">CAPA Required</h4><p className="text-xs text-orange-700">This inspection requires Corrective and Preventive Action. Review findings and initiate CAPA procedures.</p></div>
            </div>
          )}
        </PageModal>
      )}

      {/* ---- CAPA DETAIL (PageModal) ---- */}
      {detailCapa && (
        <PageModal isOpen={!!detailCapa} onClose={() => setDetailCapa(null)} title={`CAPA ${detailCapa.id}`} badges={<StatusBadge status={detailCapa.status} className="!text-[10px] !py-0.5" />} subtitle={detailCapa.relatedDefect} maxWidth="max-w-2xl" footer={<div className="flex justify-between items-center w-full"><SecondaryButton onClick={() => setDetailCapa(null)}>Close</SecondaryButton>{detailCapa.status !== "Closed" && <SecondaryButton onClick={() => { setDetailCapa(null); openEditCapa(detailCapa); }} icon={Pencil}>Edit CAPA</SecondaryButton>}</div>}>
          {/* Details Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3"><Wrench size={14} className="text-slate-400" /> CAPA Details</h4>
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><User size={10} /> Assigned Staff</span><span className="text-sm font-semibold text-slate-700">{detailCapa.assignedStaff}</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Calendar size={10} /> Created</span><span className="text-sm font-semibold text-slate-700">{detailCapa.createdDate}</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Calendar size={10} /> Target Date</span><span className="text-sm font-semibold text-slate-700">{detailCapa.targetDate}</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><AlertOctagon size={10} /> Root Cause</span><span className="text-sm font-semibold text-slate-700">{detailCapa.rootCause}</span></div>
            </div>
          </div>
          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3"><FileText size={14} className="text-slate-400" /> Corrective Actions</h4>
            <p className="text-sm text-slate-700 leading-relaxed bg-white border border-slate-200 rounded-xl p-4">{detailCapa.description || "No description available."}</p>
          </div>
        </PageModal>
      )}

      {/* ---- ADD REMARKS MODAL (PageModal + InputGroup) ---- */}
      {remarksItem && (
        <PageModal isOpen={!!remarksItem} onClose={() => { setRemarksItem(null); setRemarksText(""); }} title="Add Remarks" subtitle={`For ${remarksItem.inspectionId} — ${remarksItem.product}`} maxWidth="max-w-md" footer={<div className="flex justify-end items-center gap-2 w-full"><SecondaryButton onClick={() => { setRemarksItem(null); setRemarksText(""); }}>Cancel</SecondaryButton><PrimaryButton onClick={handleSaveRemarks} className="!w-auto !py-2.5 !px-6 !text-xs !rounded-full">Save Remarks</PrimaryButton></div>}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="remarks-text" className="text-xs font-semibold text-slate-500 tracking-wide">Remarks *</label>
            <textarea id="remarks-text" rows={4} placeholder="Enter your remarks or observations..." value={remarksText} onChange={(e) => setRemarksText(e.target.value)} className="w-full px-4 py-3 text-sm font-medium bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 hover:border-slate-300 resize-none" />
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-500"><strong>Inspection:</strong> {remarksItem.inspectionId} · <strong>Defects:</strong> {remarksItem.defectCount} · <strong>Status:</strong> {remarksItem.status}</div>
        </PageModal>
      )}

      {/* ---- CREATE/EDIT CAPA FORM (PageModal + InputGroup + IconSelect) ---- */}
      <PageModal isOpen={isCapaFormOpen} onClose={() => setIsCapaFormOpen(false)} title={editingCapa ? "Edit CAPA" : "Create CAPA"} subtitle={editingCapa ? `Editing ${editingCapa.id}` : "Create a new corrective & preventive action."} maxWidth="max-w-lg" footer={<div className="flex justify-end items-center gap-2 w-full"><SecondaryButton onClick={() => setIsCapaFormOpen(false)}>Cancel</SecondaryButton><PrimaryButton onClick={handleSaveCapa} className="!w-auto !py-2.5 !px-6 !text-xs !rounded-full">{editingCapa ? "Save Changes" : "Create CAPA"}</PrimaryButton></div>}>
        <InputGroup id="capa-defect" label="Related Defect *" placeholder="e.g. INS-2026-002 — Color inconsistency" icon={AlertOctagon} value={formCapaDefect} onChange={(e) => setFormCapaDefect(e.target.value)} />
        <InputGroup id="capa-root" label="Root Cause *" placeholder="e.g. Dye lot variance from supplier" icon={Wrench} value={formCapaRoot} onChange={(e) => setFormCapaRoot(e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <InputGroup id="capa-staff" label="Assigned Staff *" placeholder="e.g. Maria Santos" icon={User} value={formCapaStaff} onChange={(e) => setFormCapaStaff(e.target.value)} />
          <InputGroup id="capa-target" label="Target Date" placeholder="e.g. Feb 20, 2026" icon={Calendar} value={formCapaTarget} onChange={(e) => setFormCapaTarget(e.target.value)} />
        </div>
        <IconSelect label="Status" value={formCapaStatus} onChange={setFormCapaStatus} options={CAPA_STATUS_OPTIONS} placeholder="Select status" />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="capa-desc" className="text-xs font-semibold text-slate-500 tracking-wide">Description / Corrective Actions</label>
          <textarea id="capa-desc" rows={3} placeholder="Describe the corrective and preventive actions to be taken..." value={formCapaDesc} onChange={(e) => setFormCapaDesc(e.target.value)} className="w-full px-4 py-3 text-sm font-medium bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 hover:border-slate-300 resize-none" />
        </div>
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"><Lock size={14} className="text-slate-400" /><span className="text-xs font-semibold text-slate-500">Branch: Manila (Fixed)</span></div>
      </PageModal>

      {/* ---- CONFIRMATION MODAL ---- */}
      <ConfirmationModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal((p) => ({ ...p, isOpen: false }))} onConfirm={confirmModal.action} title={confirmModal.title} message={confirmModal.message} variant={confirmModal.variant} confirmText={confirmModal.confirmText} />

      {/* ---- TOAST ---- */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}

export default AdminQualityPage;
