// ==========================================
// PLMTechPackPage.tsx — Tech Pack & Versions
// Branch-scoped version management with approval.
// Shows product header, versions table, CRUD
// actions, and submit/approve/reject workflow.
// ==========================================

import { useState, useMemo, useEffect } from "react";
import {
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Plus,
  Send,
  Package,
  Calendar,
  User,
  Clock,
  Lock,
  History,
  Tag,
  Download,
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
import PrimaryButton from "../../components/ui/PrimaryButton";
import SecondaryButton from "../../components/ui/SecondaryButton";
import PageModal from "../../components/ui/PageModal";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Toast from "../../components/ui/Toast";
import InputGroup from "../../components/ui/InputGroup";
import IconSelect from "../../components/ui/IconSelect";
import type { IconSelectOption } from "../../components/ui/IconSelect";

// ==========================================
// TYPES
// ==========================================

type ApprovalStatus = "Draft" | "Approved" | "Rejected";
type LifecycleStage = "Concept" | "Design" | "Production-ready";

interface ProductVersion {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  versionNumber: string;
  approvalStatus: ApprovalStatus;
  lifecycleStage: LifecycleStage;
  techPackData: string;
  changeSummary: string;
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

// ==========================================
// MOCK DATA
// ==========================================

const INITIAL_VERSIONS: ProductVersion[] = [
  { id: "VER-001", productId: "P-001", productSku: "MNL-JKT-001", productName: "Classic Denim Jacket", versionNumber: "V2.1", approvalStatus: "Draft", lifecycleStage: "Design", techPackData: "Updated pocket placement and stitching pattern. Size chart: XS-XXL. Fabric: 100% Denim Cotton, 12oz weight.", changeSummary: "Updated pocket placement and stitching pattern for better aesthetics.", createdBy: "Design Team A", createdDate: "Feb 12, 2026", lastModified: "Feb 12, 2026" },
  { id: "VER-002", productId: "P-001", productSku: "MNL-JKT-001", productName: "Classic Denim Jacket", versionNumber: "V2.0", approvalStatus: "Approved", lifecycleStage: "Production-ready", techPackData: "Standard denim jacket specs. Dual chest pockets, adjustable waist tabs. Size chart: S-XL.", changeSummary: "Finalized design specifications and QA passed.", createdBy: "Design Team A", createdDate: "Feb 5, 2026", lastModified: "Feb 8, 2026" },
  { id: "VER-003", productId: "P-002", productSku: "MNL-DRS-002", productName: "Floral Summer Dress", versionNumber: "V1.1", approvalStatus: "Draft", lifecycleStage: "Design", techPackData: "Adjusted hemline length and fabric weight. A-line silhouette, spaghetti straps. Size: XS-L.", changeSummary: "Adjusted hemline length and reduced fabric weight for better draping.", createdBy: "Design Team B", createdDate: "Feb 10, 2026", lastModified: "Feb 11, 2026" },
  { id: "VER-004", productId: "P-003", productSku: "MNL-TEE-003", productName: "Basic Cotton Tee", versionNumber: "V3.0", approvalStatus: "Approved", lifecycleStage: "Production-ready", techPackData: "Changed collar style to crew neck. 100% Organic Cotton. 6 colorways. Size: XS-3XL.", changeSummary: "Changed collar style to crew neck per market feedback.", createdBy: "Production Manager", createdDate: "Feb 8, 2026", lastModified: "Feb 10, 2026" },
  { id: "VER-005", productId: "P-004", productSku: "MNL-COAT-004", productName: "Wool Trench Coat", versionNumber: "V2.0", approvalStatus: "Rejected", lifecycleStage: "Design", techPackData: "Upgraded lining material for better insulation. Double-breasted, storm flap. Size: S-XL.", changeSummary: "Upgraded lining material — rejected due to insufficient QA data.", createdBy: "Senior Designer", createdDate: "Feb 6, 2026", lastModified: "Feb 9, 2026" },
  { id: "VER-006", productId: "P-006", productSku: "MNL-SWT-006", productName: "Knit Crew Sweater", versionNumber: "V1.0", approvalStatus: "Draft", lifecycleStage: "Concept", techPackData: "Initial design specification. Merino wool blend, ribbed cuffs. Size: S-XL.", changeSummary: "Initial design specification — first version.", createdBy: "Junior Designer", createdDate: "Feb 7, 2026", lastModified: "Feb 7, 2026" },
  { id: "VER-007", productId: "P-007", productSku: "MNL-PNT-007", productName: "Cargo Utility Pants", versionNumber: "V4.0", approvalStatus: "Approved", lifecycleStage: "Production-ready", techPackData: "Added reinforced knee panels. Cotton-blend, multiple pockets. Size: 28-40.", changeSummary: "Added reinforced knee panels for durability.", createdBy: "Senior Designer", createdDate: "Feb 4, 2026", lastModified: "Feb 5, 2026" },
];

const PRODUCT_OPTIONS: IconSelectOption[] = [
  { value: "All Products", label: "All Products", icon: Package },
  { value: "MNL-JKT-001", label: "Classic Denim Jacket (MNL-JKT-001)", icon: Package },
  { value: "MNL-DRS-002", label: "Floral Summer Dress (MNL-DRS-002)", icon: Package },
  { value: "MNL-TEE-003", label: "Basic Cotton Tee (MNL-TEE-003)", icon: Package },
  { value: "MNL-COAT-004", label: "Wool Trench Coat (MNL-COAT-004)", icon: Package },
  { value: "MNL-SWT-006", label: "Knit Crew Sweater (MNL-SWT-006)", icon: Package },
  { value: "MNL-PNT-007", label: "Cargo Utility Pants (MNL-PNT-007)", icon: Package },
];

// ==========================================
// CONSTANTS
// ==========================================

const ITEMS_PER_PAGE = 5;
const STATUS_FILTERS = ["All", "Draft", "Approved", "Rejected"];

// ==========================================
// MAIN COMPONENT
// ==========================================

function PLMTechPackPage() {
  // ------------------------------------------
  // STATE
  // ------------------------------------------
  const [versions, setVersions] = useState<ProductVersion[]>(INITIAL_VERSIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [productFilter, setProductFilter] = useState("All Products");
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [detailVersion, setDetailVersion] = useState<ProductVersion | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVersion, setEditingVersion] = useState<ProductVersion | null>(null);

  // Form fields
  const [formVersionNum, setFormVersionNum] = useState("");
  const [formProductSku, setFormProductSku] = useState("");
  const [formTechPack, setFormTechPack] = useState("");
  const [formChangeSummary, setFormChangeSummary] = useState("");

  // Toast & Confirm
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean; title: string; message: string; action: () => void; variant: "primary" | "danger"; confirmText: string;
  }>({ isOpen: false, title: "", message: "", action: () => {}, variant: "primary", confirmText: "Confirm" });

  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, productFilter]);

  // ------------------------------------------
  // COMPUTED: Stats
  // ------------------------------------------
  const stats = useMemo(() => ({
    total: versions.length,
    drafts: versions.filter((v) => v.approvalStatus === "Draft").length,
    approved: versions.filter((v) => v.approvalStatus === "Approved").length,
    rejected: versions.filter((v) => v.approvalStatus === "Rejected").length,
  }), [versions]);

  // ------------------------------------------
  // COMPUTED: Filtered & Paginated
  // ------------------------------------------
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return versions.filter((v) => {
      const matchesSearch = v.productName.toLowerCase().includes(q) || v.versionNumber.toLowerCase().includes(q) || v.changeSummary.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || v.approvalStatus === statusFilter;
      const matchesProduct = productFilter === "All Products" || v.productSku === productFilter;
      return matchesSearch && matchesStatus && matchesProduct;
    });
  }, [versions, searchQuery, statusFilter, productFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filtered.length);
  const paginated = filtered.slice(startIndex, endIndex);

  // ------------------------------------------
  // HANDLERS
  // ------------------------------------------
  const openAddVersion = () => {
    setEditingVersion(null);
    setFormVersionNum(""); setFormProductSku(""); setFormTechPack(""); setFormChangeSummary("");
    setIsFormOpen(true);
  };

  const openEditVersion = (v: ProductVersion) => {
    setEditingVersion(v);
    setFormVersionNum(v.versionNumber); setFormProductSku(v.productSku); setFormTechPack(v.techPackData); setFormChangeSummary(v.changeSummary);
    setIsFormOpen(true);
  };

  const handleSaveVersion = () => {
    if (!formVersionNum.trim() || !formProductSku || !formTechPack.trim()) {
      setToast({ message: "Please fill in all required fields.", type: "error" }); return;
    }
    if (editingVersion) {
      setVersions((prev) => prev.map((v) => v.id === editingVersion.id ? { ...v, versionNumber: formVersionNum, techPackData: formTechPack, changeSummary: formChangeSummary, lastModified: "Feb 13, 2026" } : v));
      setToast({ message: `Version ${formVersionNum} updated successfully.`, type: "success" });
    } else {
      const newVersion: ProductVersion = {
        id: `VER-${String(versions.length + 1).padStart(3, "0")}`,
        productId: `P-NEW`, productSku: formProductSku,
        productName: PRODUCT_OPTIONS.find((o) => o.value === formProductSku)?.label.split(" (")[0] || formProductSku,
        versionNumber: formVersionNum, approvalStatus: "Draft", lifecycleStage: "Concept",
        techPackData: formTechPack, changeSummary: formChangeSummary,
        createdBy: "PLM Manager", createdDate: "Feb 13, 2026", lastModified: "Feb 13, 2026",
      };
      setVersions((prev) => [newVersion, ...prev]);
      setToast({ message: `Version ${formVersionNum} created successfully.`, type: "success" });
    }
    setIsFormOpen(false);
  };

  const handleSubmitApproval = (v: ProductVersion) => {
    setConfirmModal({
      isOpen: true, title: "Submit for Approval?", message: `Submit ${v.productName} ${v.versionNumber} for approval? The version will enter the review workflow.`,
      variant: "primary", confirmText: "Submit",
      action: () => {
        setVersions((prev) => prev.map((ver) => ver.id === v.id ? { ...ver, approvalStatus: "Approved" as ApprovalStatus, lifecycleStage: "Production-ready" as LifecycleStage, lastModified: "Feb 13, 2026" } : ver));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setToast({ message: `${v.versionNumber} approved successfully.`, type: "success" });
      },
    });
  };

  const handleReject = (v: ProductVersion) => {
    setConfirmModal({
      isOpen: true, title: "Reject Version?", message: `Reject ${v.productName} ${v.versionNumber}? The submitter will need to revise and resubmit.`,
      variant: "danger", confirmText: "Reject",
      action: () => {
        setVersions((prev) => prev.map((ver) => ver.id === v.id ? { ...ver, approvalStatus: "Rejected" as ApprovalStatus, lastModified: "Feb 13, 2026" } : ver));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setToast({ message: `${v.versionNumber} rejected.`, type: "success" });
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
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Tech Pack & Versions</h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Manage product versions, tech packs, and the approval workflow.</p>
            </div>
            <div className="flex items-center gap-3">
              <SecondaryButton onClick={() => setToast({ message: "Exporting versions report...", type: "success" })} icon={Download}>Export</SecondaryButton>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-semibold"><Lock size={12} />Branch: Manila</div>
            </div>
          </div>

          {/* KPI Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard title="Total Versions" value={stats.total} icon={History} color="bg-indigo-500" />
            <StatsCard title="Draft" value={stats.drafts} icon={FileText} color="bg-slate-500" />
            <StatsCard title="Approved" value={stats.approved} icon={CheckCircle} color="bg-emerald-500" />
            <StatsCard title="Rejected" value={stats.rejected} icon={XCircle} color="bg-rose-500" />
          </div>

          {/* Product Filter + Lifecycle Stage Info */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
            <div className="w-full sm:w-72">
              <IconSelect label="Filter by Product" value={productFilter} onChange={setProductFilter} options={PRODUCT_OPTIONS} placeholder="Select product" />
            </div>
            {/* Lifecycle Pipeline — Highlighted */}
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Product Lifecycle</p>
              <div className="flex items-center gap-0">
                {/* Concept */}
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-l-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-500 ring-2 ring-slate-400/20" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Concept</span>
                </div>
                {/* Arrow */}
                <div className="w-6 h-px bg-slate-300 dark:bg-slate-600 -mx-px relative z-10" />
                {/* Design */}
                <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-500/20" />
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-400">Design</span>
                </div>
                {/* Arrow */}
                <div className="w-6 h-px bg-blue-300 dark:bg-blue-700 -mx-px relative z-10" />
                {/* Production-ready */}
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-r-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 shadow-sm shadow-emerald-500/10">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Production-ready</span>
                </div>
              </div>
            </div>
          </div>

          {/* Versions Table */}
          <Card className="overflow-hidden">
            <div className="px-5 pt-5">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                  <TableToolbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} isFilterOpen={isFilterOpen} setIsFilterOpen={setIsFilterOpen} placeholder="Search versions..." filterLabel={statusFilter === "All" ? "All Statuses" : statusFilter}>
                    <div className="p-1.5" role="group" aria-label="Filter by Status">
                      {STATUS_FILTERS.map((s) => (
                        <button key={s} role="option" aria-selected={statusFilter === s}
                          onClick={() => { setStatusFilter(s); setIsFilterOpen(false); }}
                          className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${statusFilter === s ? "bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                        >{s === "All" ? "All Statuses" : s}</button>
                      ))}
                    </div>
                  </TableToolbar>
                </div>
                <PrimaryButton onClick={openAddVersion} className="!w-auto !py-2.5 !px-4 !text-xs !rounded-full"><Plus size={14} /> Create Version</PrimaryButton>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/80 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Version</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Lifecycle</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Approval</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">Created By / Date</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                  {paginated.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4"><span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{v.versionNumber}</span></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0"><Package size={16} /></div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 dark:text-white text-sm truncate">{v.productName}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{v.productSku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${v.lifecycleStage === "Production-ready" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : v.lifecycleStage === "Design" ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{v.lifecycleStage}</span>
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={v.approvalStatus} /></td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">{v.createdBy}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{v.createdDate}</div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex justify-start items-center gap-1">
                          <button onClick={() => setDetailVersion(v)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="View"><Eye size={14} /></button>
                          {v.approvalStatus === "Draft" && (
                            <>
                              <button onClick={() => openEditVersion(v)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Edit"><Edit size={14} /></button>
                              <button onClick={() => handleSubmitApproval(v)} className="inline-flex items-center gap-1 whitespace-nowrap text-left px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 rounded-lg transition-colors" title="Submit for Approval"><Send size={12} /> Submit</button>
                            </>
                          )}
                          {v.approvalStatus === "Draft" && (
                            <button onClick={() => handleReject(v)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors" title="Reject"><XCircle size={14} /></button>
                          )}
                          <button onClick={() => { setVersions((prev) => prev.filter((ver) => ver.id !== v.id)); setToast({ message: `${v.versionNumber} moved to archive.`, type: "success" }); }} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title="Archive"><Archive size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-slate-400 text-sm">
                        <div className="flex flex-col items-center gap-2">
                          <FileText size={32} className="text-slate-300" />
                          <p className="font-medium">No versions found</p>
                          <p className="text-xs">Try adjusting your search or filter criteria.</p>
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

      {/* ---- VERSION DETAIL MODAL ---- */}
      {detailVersion && (
        <PageModal isOpen={!!detailVersion} onClose={() => setDetailVersion(null)} title={`${detailVersion.productName} — ${detailVersion.versionNumber}`}
          badges={<><StatusBadge status={detailVersion.approvalStatus} className="!text-[10px] !py-0.5" /><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${detailVersion.lifecycleStage === "Production-ready" ? "bg-emerald-50 text-emerald-700" : detailVersion.lifecycleStage === "Design" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"}`}>{detailVersion.lifecycleStage}</span></>}
          subtitle={<>SKU: {detailVersion.productSku} · Created: {detailVersion.createdDate}</>}
          maxWidth="max-w-2xl"
          footer={
            <div className="flex justify-between items-center w-full">
              <SecondaryButton onClick={() => setDetailVersion(null)}>Close</SecondaryButton>
              {detailVersion.approvalStatus === "Draft" && (
                <div className="flex items-center gap-2">
                  <SecondaryButton onClick={() => { setDetailVersion(null); openEditVersion(detailVersion); }} icon={Edit}>Edit</SecondaryButton>
                  <SecondaryButton onClick={() => { setDetailVersion(null); handleSubmitApproval(detailVersion); }} icon={Send} className="!text-emerald-600 !border-emerald-200 hover:!bg-emerald-50">Submit</SecondaryButton>
                </div>
              )}
            </div>
          }
        >
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-3"><FileText size={14} className="text-slate-400" /> Tech Pack Data</h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">{detailVersion.techPackData}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-3"><History size={14} className="text-slate-400" /> Change Summary</h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">{detailVersion.changeSummary}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-700 pt-4">
            <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><User size={10} /> Created By</span><span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{detailVersion.createdBy}</span></div>
            <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Calendar size={10} /> Created Date</span><span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{detailVersion.createdDate}</span></div>
            <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Clock size={10} /> Last Modified</span><span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{detailVersion.lastModified}</span></div>
            <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Tag size={10} /> Product SKU</span><span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 font-mono">{detailVersion.productSku}</span></div>
          </div>
        </PageModal>
      )}

      {/* ---- CREATE/EDIT VERSION FORM MODAL ---- */}
      <PageModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingVersion ? "Edit Version" : "Create Version"} subtitle={editingVersion ? `Editing ${editingVersion.versionNumber}` : "Create a new tech pack version."} maxWidth="max-w-lg"
        footer={
          <div className="flex justify-end items-center gap-2 w-full">
            <SecondaryButton onClick={() => setIsFormOpen(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSaveVersion} className="!w-auto !py-2.5 !px-6 !text-xs !rounded-full">{editingVersion ? "Save Changes" : "Create Version"}</PrimaryButton>
          </div>
        }
      >
        <InputGroup id="ver-number" label="Version Number *" placeholder="e.g. V1.0" icon={History} value={formVersionNum} onChange={(e) => setFormVersionNum(e.target.value)} />
        {!editingVersion && <IconSelect label="Product *" value={formProductSku} onChange={setFormProductSku} options={PRODUCT_OPTIONS.filter((o) => o.value !== "All Products")} placeholder="Select product" />}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ver-techpack" className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">Tech Pack Data *</label>
          <textarea id="ver-techpack" rows={4} placeholder="Enter tech pack specifications, size chart, fabric details..." value={formTechPack} onChange={(e) => setFormTechPack(e.target.value)}
            className="w-full px-4 py-3 text-sm font-medium bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 resize-none text-slate-900 dark:text-white" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ver-summary" className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">Change Summary</label>
          <textarea id="ver-summary" rows={2} placeholder="What changed in this version..." value={formChangeSummary} onChange={(e) => setFormChangeSummary(e.target.value)}
            className="w-full px-4 py-3 text-sm font-medium bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 resize-none text-slate-900 dark:text-white" />
        </div>
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
          <Lock size={14} className="text-slate-400" /><span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Approval Status: Draft (auto-set on create)</span>
        </div>
      </PageModal>

      {/* ---- CONFIRMATION & TOAST ---- */}
      <ConfirmationModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))} onConfirm={confirmModal.action} title={confirmModal.title} message={confirmModal.message} variant={confirmModal.variant} confirmText={confirmModal.confirmText} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}

export default PLMTechPackPage;
