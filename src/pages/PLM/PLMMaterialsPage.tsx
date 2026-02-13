// ==========================================
// PLMMaterialsPage.tsx — Materials Library
// Branch-scoped materials management.
// PLM Manager can create/update materials for
// BOM usage. Master data types managed by Super Admin.
// ==========================================

import { useState, useMemo, useEffect } from "react";
import {
  BookOpen,
  Layers,
  Plus,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  DollarSign,
  Tag,
  Lock,
  Download,
  Package,
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

type MaterialStatus = "Active" | "Inactive";

interface Material {
  id: string;
  name: string;
  type: string;
  unitCost: number;
  unit: string;
  status: MaterialStatus;
  lastModified: string;
}

// ==========================================
// MOCK DATA
// ==========================================

const INITIAL_MATERIALS: Material[] = [
  { id: "MAT-001", name: "Cotton Twill Fabric", type: "Fabric", unitCost: 12.50, unit: "meters", status: "Active", lastModified: "Feb 12, 2026" },
  { id: "MAT-002", name: "Polyester Thread", type: "Trim", unitCost: 2.00, unit: "spools", status: "Active", lastModified: "Feb 11, 2026" },
  { id: "MAT-003", name: "YKK Metal Zipper 12\"", type: "Trim", unitCost: 4.50, unit: "pcs", status: "Active", lastModified: "Feb 10, 2026" },
  { id: "MAT-004", name: "Metal Buttons (Set of 6)", type: "Trim", unitCost: 3.00, unit: "sets", status: "Active", lastModified: "Feb 10, 2026" },
  { id: "MAT-005", name: "Woven Label Tag", type: "Trim", unitCost: 0.50, unit: "pcs", status: "Active", lastModified: "Feb 9, 2026" },
  { id: "MAT-006", name: "Interfacing Fabric", type: "Fabric", unitCost: 8.00, unit: "meters", status: "Active", lastModified: "Feb 9, 2026" },
  { id: "MAT-007", name: "Organic Cotton Jersey", type: "Fabric", unitCost: 10.00, unit: "meters", status: "Active", lastModified: "Feb 8, 2026" },
  { id: "MAT-008", name: "Cotton Twill Canvas", type: "Fabric", unitCost: 14.00, unit: "meters", status: "Active", lastModified: "Feb 7, 2026" },
  { id: "MAT-009", name: "Reinforced Knee Patches", type: "Trim", unitCost: 5.00, unit: "pcs", status: "Active", lastModified: "Feb 6, 2026" },
  { id: "MAT-010", name: "Silk Lining", type: "Fabric", unitCost: 22.00, unit: "meters", status: "Inactive", lastModified: "Jan 30, 2026" },
  { id: "MAT-011", name: "Recycled Polyester Blend", type: "Fabric", unitCost: 11.50, unit: "meters", status: "Active", lastModified: "Feb 5, 2026" },
];

// ==========================================
// CONSTANTS
// ==========================================

const ITEMS_PER_PAGE = 6;
const STATUS_FILTERS = ["All", "Active", "Inactive"];
const TYPE_FILTERS = ["All Types", "Fabric", "Trim"];

const TYPE_OPTIONS: IconSelectOption[] = [
  { value: "Fabric", label: "Fabric", icon: Layers },
  { value: "Trim", label: "Trim", icon: Tag },
  { value: "Packaging", label: "Packaging", icon: Package },
  { value: "Label", label: "Label", icon: Tag },
];

const UNIT_OPTIONS: IconSelectOption[] = [
  { value: "meters", label: "meters", icon: Layers },
  { value: "spools", label: "spools", icon: Layers },
  { value: "pcs", label: "pcs", icon: Layers },
  { value: "sets", label: "sets", icon: Layers },
  { value: "yards", label: "yards", icon: Layers },
  { value: "kg", label: "kg", icon: Layers },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

function PLMMaterialsPage() {
  // ------------------------------------------
  // STATE
  // ------------------------------------------
  const [materials, setMaterials] = useState<Material[]>(INITIAL_MATERIALS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [detailMaterial, setDetailMaterial] = useState<Material | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  // Form
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("");
  const [formUnitCost, setFormUnitCost] = useState("");
  const [formUnit, setFormUnit] = useState("");

  // Toast & Confirm
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean; title: string; message: string; action: () => void; variant: "primary" | "danger"; confirmText: string;
  }>({ isOpen: false, title: "", message: "", action: () => {}, variant: "primary", confirmText: "Confirm" });

  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter]);

  // ------------------------------------------
  // COMPUTED
  // ------------------------------------------
  const stats = useMemo(() => ({
    total: materials.length,
    active: materials.filter((m) => m.status === "Active").length,
    inactive: materials.filter((m) => m.status === "Inactive").length,
    avgCost: materials.length > 0 ? (materials.reduce((s, m) => s + m.unitCost, 0) / materials.length).toFixed(2) : "0.00",
  }), [materials]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return materials.filter((m) => {
      const matchesSearch = m.name.toLowerCase().includes(q) || m.type.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || m.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [materials, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filtered.length);
  const paginated = filtered.slice(startIndex, endIndex);

  // ------------------------------------------
  // HANDLERS
  // ------------------------------------------
  const openAdd = () => {
    setEditingMaterial(null);
    setFormName(""); setFormType(""); setFormUnitCost(""); setFormUnit("");
    setIsFormOpen(true);
  };

  const openEdit = (m: Material) => {
    setEditingMaterial(m);
    setFormName(m.name); setFormType(m.type); setFormUnitCost(String(m.unitCost)); setFormUnit(m.unit);
    setIsFormOpen(true);
  };

  const handleSave = () => {
    const cost = parseFloat(formUnitCost);
    if (!formName.trim() || !formType || isNaN(cost) || cost < 0 || !formUnit) {
      setToast({ message: "Please fill in all required fields.", type: "error" }); return;
    }
    if (editingMaterial) {
      setMaterials((prev) => prev.map((m) => m.id === editingMaterial.id ? { ...m, name: formName, type: formType, unitCost: cost, unit: formUnit, lastModified: "Feb 13, 2026" } : m));
      setToast({ message: `Material "${formName}" updated.`, type: "success" });
    } else {
      const newMat: Material = {
        id: `MAT-${String(materials.length + 1).padStart(3, "0")}`,
        name: formName, type: formType, unitCost: cost, unit: formUnit,
        status: "Active", lastModified: "Feb 13, 2026",
      };
      setMaterials((prev) => [newMat, ...prev]);
      setToast({ message: `Material "${formName}" created.`, type: "success" });
    }
    setIsFormOpen(false);
  };

  const handleToggleStatus = (m: Material) => {
    const newStatus: MaterialStatus = m.status === "Active" ? "Inactive" : "Active";
    setConfirmModal({
      isOpen: true, title: `${newStatus === "Inactive" ? "Disable" : "Enable"} Material?`,
      message: `${newStatus === "Inactive" ? "Disable" : "Re-enable"} "${m.name}"? ${newStatus === "Inactive" ? "It will no longer be available for BOM selection." : "It will be available for BOM selection again."}`,
      variant: newStatus === "Inactive" ? "danger" : "primary",
      confirmText: newStatus === "Inactive" ? "Disable" : "Enable",
      action: () => {
        setMaterials((prev) => prev.map((mat) => mat.id === m.id ? { ...mat, status: newStatus, lastModified: "Feb 13, 2026" } : mat));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setToast({ message: `Material "${m.name}" ${newStatus === "Inactive" ? "disabled" : "enabled"}.`, type: "success" });
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
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Materials Library</h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Manage materials available for BOM usage. Master data types are managed by Super Admin.</p>
            </div>
            <div className="flex items-center gap-3">
              <SecondaryButton onClick={() => setToast({ message: "Exporting materials report...", type: "success" })} icon={Download}>Export</SecondaryButton>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-semibold"><Lock size={12} />Branch: Manila</div>
            </div>
          </div>

          {/* KPI Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard title="Total Materials" value={stats.total} icon={BookOpen} color="bg-indigo-500" />
            <StatsCard title="Active" value={stats.active} icon={CheckCircle} color="bg-emerald-500" />
            <StatsCard title="Inactive" value={stats.inactive} icon={XCircle} color="bg-slate-500" />
            <StatsCard title="Avg. Unit Cost" value={`$${stats.avgCost}`} icon={DollarSign} color="bg-blue-500" />
          </div>

          {/* Materials Table */}
          <Card className="overflow-hidden">
            <div className="px-5 pt-5">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                  <TableToolbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} isFilterOpen={isFilterOpen} setIsFilterOpen={setIsFilterOpen} placeholder="Search materials..." filterLabel={statusFilter === "All" ? "All Statuses" : statusFilter}>
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
                <PrimaryButton onClick={openAdd} className="!w-auto !py-2.5 !px-4 !text-xs !rounded-full"><Plus size={14} /> Add Material</PrimaryButton>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/80 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Material Name</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Type</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Unit Cost</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Unit</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                  {paginated.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-400 shrink-0"><Layers size={14} /></div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 dark:text-white text-sm truncate">{m.name}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{m.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{m.type}</span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-800 dark:text-slate-200">${m.unitCost.toFixed(2)}</td>
                      <td className="px-6 py-4 hidden md:table-cell text-xs font-medium text-slate-600 dark:text-slate-400">{m.unit}</td>
                      <td className="px-6 py-4"><StatusBadge status={m.status} /></td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex justify-start items-center gap-1">
                          <button onClick={() => setDetailMaterial(m)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="View"><Eye size={14} /></button>
                          <button onClick={() => openEdit(m)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Edit"><Edit size={14} /></button>
                          <button onClick={() => handleToggleStatus(m)}
                            className={`p-1.5 rounded-lg transition-colors ${m.status === "Active" ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20" : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"}`}
                            title={m.status === "Active" ? "Disable" : "Enable"}
                          >{m.status === "Active" ? <XCircle size={14} /> : <CheckCircle size={14} />}</button>
                          <button onClick={() => { setMaterials((prev) => prev.filter((mat) => mat.id !== m.id)); setToast({ message: `${m.name} moved to archive.`, type: "success" }); }} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title="Archive"><Archive size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-slate-400 text-sm">
                        <div className="flex flex-col items-center gap-2">
                          <BookOpen size={32} className="text-slate-300" />
                          <p className="font-medium">No materials found</p>
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

      {/* ---- MATERIAL DETAIL MODAL ---- */}
      {detailMaterial && (
        <PageModal isOpen={!!detailMaterial} onClose={() => setDetailMaterial(null)} title={detailMaterial.name}
          badges={<StatusBadge status={detailMaterial.status} className="!text-[10px] !py-0.5" />}
          subtitle={<>ID: {detailMaterial.id} · Type: {detailMaterial.type}</>} maxWidth="max-w-md"
          footer={<div className="flex justify-between items-center w-full"><SecondaryButton onClick={() => setDetailMaterial(null)}>Close</SecondaryButton><SecondaryButton onClick={() => { setDetailMaterial(null); openEdit(detailMaterial); }} icon={Edit}>Edit</SecondaryButton></div>}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unit Cost</span><span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 block">${detailMaterial.unitCost.toFixed(2)}</span></div>
            <div className="space-y-1"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unit</span><span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">{detailMaterial.unit}</span></div>
            <div className="space-y-1"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</span><span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">{detailMaterial.type}</span></div>
            <div className="space-y-1"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Modified</span><span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">{detailMaterial.lastModified}</span></div>
          </div>
        </PageModal>
      )}

      {/* ---- ADD/EDIT MATERIAL FORM ---- */}
      <PageModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingMaterial ? "Edit Material" : "Add Material"} subtitle={editingMaterial ? `Editing ${editingMaterial.name}` : "Add a new material to the library."} maxWidth="max-w-md"
        footer={<div className="flex justify-end items-center gap-2 w-full"><SecondaryButton onClick={() => setIsFormOpen(false)}>Cancel</SecondaryButton><PrimaryButton onClick={handleSave} className="!w-auto !py-2.5 !px-6 !text-xs !rounded-full">{editingMaterial ? "Save Changes" : "Add Material"}</PrimaryButton></div>}
      >
        <InputGroup id="mat-name" label="Material Name *" placeholder="e.g. Cotton Twill Fabric" icon={Layers} value={formName} onChange={(e) => setFormName(e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <IconSelect label="Type *" value={formType} onChange={setFormType} options={TYPE_OPTIONS} placeholder="Select type" />
          <IconSelect label="Unit *" value={formUnit} onChange={setFormUnit} options={UNIT_OPTIONS} placeholder="Select unit" />
        </div>
        <InputGroup id="mat-cost" label="Unit Cost ($) *" type="number" placeholder="e.g. 12.50" icon={DollarSign} value={formUnitCost} onChange={(e) => setFormUnitCost(e.target.value)} />
      </PageModal>

      {/* ---- CONFIRMATION & TOAST ---- */}
      <ConfirmationModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))} onConfirm={confirmModal.action} title={confirmModal.title} message={confirmModal.message} variant={confirmModal.variant} confirmText={confirmModal.confirmText} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}

export default PLMMaterialsPage;
