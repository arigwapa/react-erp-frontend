// ==========================================
// QADefectManagementPage.tsx
// Quality Manager — Defect Management
// Track defect patterns, recurring issues.
// CRUD: create, update, tag recurring, link to CAPA.
// ==========================================

import React, { useState, useMemo } from "react";
import QALayout from "../../layout/QALayout";
import StatsCard from "../../components/ui/StatsCard";
import { TableToolbar } from "../../components/ui/TableToolbar";
import { StatusBadge } from "../../components/ui/StatusBadge";
import SeverityBadge, { type Severity } from "../../components/ui/SeverityBadge";
import Pagination from "../../components/ui/Pagination";
import PageModal from "../../components/ui/PageModal";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Toast from "../../components/ui/Toast";
import IconSelect from "../../components/ui/IconSelect";
import InputGroup from "../../components/ui/InputGroup";
import SecondaryButton from "../../components/ui/SecondaryButton";
import PrimaryButton from "../../components/ui/PrimaryButton";
import {
  Bug,
  AlertTriangle,
  Repeat,
  CheckCircle2,
  Plus,
  Eye,
  Edit,
  Link2,
  Tag,
  FileText,
  Package,
  Archive,
} from "lucide-react";

// ------------------------------------------
// Types
// ------------------------------------------
interface Defect {
  id: string;
  defectId: string;
  productSku: string;
  productName: string;
  defectType: string;
  severity: Severity;
  quantityAffected: number;
  status: "Open" | "Closed" | "Recurring";
  recurrenceCount: number;
  linkedCapa: string;
  inspectionId: string;
  reportedDate: string;
  notes: string;
}

// ------------------------------------------
// Mock data
// ------------------------------------------
const mockDefects: Defect[] = [
  { id: "1", defectId: "DEF-001", productSku: "SKU-002", productName: "Hoodie V1.1", defectType: "Stitching", severity: "High", quantityAffected: 18, status: "Recurring", recurrenceCount: 6, linkedCapa: "CAPA-003", inspectionId: "INS-013", reportedDate: "2026-02-08", notes: "Loose thread at collar area." },
  { id: "2", defectId: "DEF-002", productSku: "SKU-005", productName: "Denim Jacket V1.0", defectType: "Fabric Defect", severity: "High", quantityAffected: 15, status: "Open", recurrenceCount: 1, linkedCapa: "CAPA-005", inspectionId: "INS-012", reportedDate: "2026-02-07", notes: "Fabric tear near seam." },
  { id: "3", defectId: "DEF-003", productSku: "SKU-002", productName: "Hoodie V1.0 (B2)", defectType: "Stitching", severity: "High", quantityAffected: 22, status: "Closed", recurrenceCount: 4, linkedCapa: "CAPA-003", inspectionId: "INS-008", reportedDate: "2026-02-03", notes: "Same stitching issue as DEF-001." },
  { id: "4", defectId: "DEF-004", productSku: "SKU-004", productName: "Joggers V1.8", defectType: "Color Issue", severity: "Medium", quantityAffected: 2, status: "Closed", recurrenceCount: 1, linkedCapa: "—", inspectionId: "INS-011", reportedDate: "2026-02-06", notes: "Slight color variation on 2 units." },
  { id: "5", defectId: "DEF-005", productSku: "SKU-006", productName: "Tank Top V1.0", defectType: "Finishing", severity: "Low", quantityAffected: 3, status: "Open", recurrenceCount: 1, linkedCapa: "—", inspectionId: "INS-009", reportedDate: "2026-02-04", notes: "Uneven hem finish." },
  { id: "6", defectId: "DEF-006", productSku: "SKU-001", productName: "Basic Tee V1.5", defectType: "Label Error", severity: "Low", quantityAffected: 5, status: "Closed", recurrenceCount: 1, linkedCapa: "—", inspectionId: "INS-010", reportedDate: "2026-02-05", notes: "Wrong size label attached." },
  { id: "7", defectId: "DEF-007", productSku: "SKU-003", productName: "Polo Shirt V1.2", defectType: "Size Mismatch", severity: "Medium", quantityAffected: 1, status: "Closed", recurrenceCount: 1, linkedCapa: "—", inspectionId: "INS-015", reportedDate: "2026-02-10", notes: "Collar measurements 1cm off spec." },
  { id: "8", defectId: "DEF-008", productSku: "SKU-001", productName: "Basic Tee V2.0", defectType: "Stitching", severity: "Medium", quantityAffected: 4, status: "Open", recurrenceCount: 2, linkedCapa: "—", inspectionId: "INS-021", reportedDate: "2026-02-13", notes: "Thread tension issue on side seams." },
];

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "Open", label: "Open" },
  { value: "Closed", label: "Closed" },
  { value: "Recurring", label: "Recurring" },
];

const severityOptions = [
  { value: "", label: "All Severities" },
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
];

const defectTypeOptions = [
  { value: "Stitching", label: "Stitching" },
  { value: "Fabric Defect", label: "Fabric Defect" },
  { value: "Color Issue", label: "Color Issue" },
  { value: "Size Mismatch", label: "Size Mismatch" },
  { value: "Finishing", label: "Finishing" },
  { value: "Label Error", label: "Label Error" },
  { value: "Other", label: "Other" },
];

const ITEMS_PER_PAGE = 6;

// ==========================================
// Component
// ==========================================
const QADefectManagementPage: React.FC = () => {
  const [defects, setDefects] = useState<Defect[]>(mockDefects);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDefect, setSelectedDefect] = useState<Defect | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tagRecurring, setTagRecurring] = useState<Defect | null>(null);
  const [linkCapa, setLinkCapa] = useState<Defect | null>(null);
  const [capaId, setCapaId] = useState("");

  // Form state
  const [formDefectType, setFormDefectType] = useState("");
  const [formSeverity, setFormSeverity] = useState("");
  const [formSku, setFormSku] = useState("");
  const [formQty, setFormQty] = useState("");
  const [formInspection, setFormInspection] = useState("");
  const [formNotes, setFormNotes] = useState("");

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // KPI calculations
  const kpis = useMemo(() => ({
    total: defects.length,
    open: defects.filter((d) => d.status === "Open").length,
    recurring: defects.filter((d) => d.status === "Recurring").length,
    closed: defects.filter((d) => d.status === "Closed").length,
  }), [defects]);

  // Filtered data
  const filtered = useMemo(() => {
    let data = [...defects];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (d) =>
          d.defectId.toLowerCase().includes(q) ||
          d.productName.toLowerCase().includes(q) ||
          d.productSku.toLowerCase().includes(q) ||
          d.defectType.toLowerCase().includes(q)
      );
    }
    if (filterStatus) data = data.filter((d) => d.status === filterStatus);
    if (filterSeverity) data = data.filter((d) => d.severity === filterSeverity);
    return data;
  }, [defects, searchQuery, filterStatus, filterSeverity]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filtered.length);
  const paginatedData = filtered.slice(startIndex, endIndex);

  const resetForm = () => {
    setFormDefectType("");
    setFormSeverity("");
    setFormSku("");
    setFormQty("");
    setFormInspection("");
    setFormNotes("");
  };

  const handleCreate = () => {
    resetForm();
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const handleEdit = (defect: Defect) => {
    setFormDefectType(defect.defectType);
    setFormSeverity(defect.severity);
    setFormSku(defect.productSku);
    setFormQty(String(defect.quantityAffected));
    setFormInspection(defect.inspectionId);
    setFormNotes(defect.notes);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!formDefectType || !formSeverity || !formQty) {
      setToast({ message: "Please fill in all required fields.", type: "error" });
      return;
    }
    setToast({ message: isEditing ? "Defect record updated." : "Defect record created.", type: "success" });
    setIsFormOpen(false);
    resetForm();
  };

  const handleView = (defect: Defect) => {
    setSelectedDefect(defect);
    setIsDetailOpen(true);
  };

  const handleTagRecurring = (defect: Defect) => {
    setTagRecurring(defect);
  };

  const confirmTagRecurring = () => {
    if (tagRecurring) {
      setToast({ message: `${tagRecurring.defectId} tagged as recurring defect.`, type: "success" });
      setTagRecurring(null);
    }
  };

  const handleLinkCapa = (defect: Defect) => {
    setLinkCapa(defect);
    setCapaId("");
  };

  const confirmLinkCapa = () => {
    if (!capaId) {
      setToast({ message: "Please enter a CAPA ID.", type: "error" });
      return;
    }
    setToast({ message: `${linkCapa?.defectId} linked to ${capaId}.`, type: "success" });
    setLinkCapa(null);
  };

  return (
    <QALayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Defect Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track defect patterns, recurring issues, and link to CAPA</p>
        </div>
        <SecondaryButton icon={Plus} onClick={handleCreate}>Log Defect</SecondaryButton>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Defects" value={kpis.total} icon={Bug} color="bg-indigo-500" />
        <StatsCard title="Open" value={kpis.open} icon={AlertTriangle} color="bg-amber-500" />
        <StatsCard title="Recurring" value={kpis.recurring} icon={Repeat} color="bg-rose-500" />
        <StatsCard title="Closed" value={kpis.closed} icon={CheckCircle2} color="bg-emerald-500" />
      </div>

      {/* Toolbar */}
      <TableToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        placeholder="Search by Defect ID, Product, or Type…"
      >
        <div className="p-3 space-y-3">
          <IconSelect label="Status" value={filterStatus} onChange={(v) => { setFilterStatus(v); setCurrentPage(1); }} options={statusOptions} placeholder="All Statuses" />
          <IconSelect label="Severity" value={filterSeverity} onChange={(v) => { setFilterSeverity(v); setCurrentPage(1); }} options={severityOptions} placeholder="All Severities" />
        </div>
      </TableToolbar>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Defect ID</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Qty</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Recurrence</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">CAPA</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {paginatedData.length > 0 ? (
                paginatedData.map((defect) => (
                  <tr key={defect.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-3 text-xs font-bold text-indigo-600 dark:text-indigo-400">{defect.defectId}</td>
                    <td className="px-6 py-3">
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{defect.productName}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{defect.productSku}</p>
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-600 dark:text-slate-400">{defect.defectType}</td>
                    <td className="px-6 py-3"><SeverityBadge severity={defect.severity} /></td>
                    <td className="px-6 py-3 text-xs font-bold text-slate-800 dark:text-slate-200">{defect.quantityAffected}</td>
                    <td className="px-6 py-3"><StatusBadge status={defect.status} /></td>
                    <td className="px-6 py-3">
                      {defect.recurrenceCount > 1 ? (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap text-left text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-full">
                          <Repeat size={10} /> {defect.recurrenceCount}x
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-xs font-medium text-slate-600 dark:text-slate-400">{defect.linkedCapa}</td>
                    <td className="px-6 py-3 text-[11px] text-slate-600 dark:text-slate-400">{defect.reportedDate}</td>
                    <td className="px-6 py-3 text-left">
                      <div className="flex items-center justify-start gap-1">
                        <button onClick={() => handleView(defect)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="View"><Eye size={14} /></button>
                        {defect.status !== "Closed" && (
                          <button onClick={() => handleEdit(defect)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Edit"><Edit size={14} /></button>
                        )}
                        {defect.status !== "Recurring" && defect.recurrenceCount > 1 && (
                          <button
                            onClick={() => handleTagRecurring(defect)}
                            className="inline-flex items-center gap-1 whitespace-nowrap text-left.5 px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800 rounded-lg transition-all active:scale-95"
                            title="Tag as Recurring"
                          >
                            <Tag size={12} />
                            Recurring
                          </button>
                        )}
                        {defect.linkedCapa === "—" && (
                          <button
                            onClick={() => handleLinkCapa(defect)}
                            className="inline-flex items-center gap-1 whitespace-nowrap text-left.5 px-2.5 py-1.5 text-[11px] font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400 dark:hover:bg-violet-900/50 border border-violet-200 dark:border-violet-800 rounded-lg transition-all active:scale-95"
                            title="Link to CAPA"
                          >
                            <Link2 size={12} />
                            Link CAPA
                          </button>
                        )}
                        <button onClick={() => { setDefects(prev => prev.filter(x => x.id !== defect.id)); setToast({ message: "Item archived successfully", type: "success" }); }} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title="Archive"><Archive size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-sm text-slate-400 italic">No defects found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} startIndex={startIndex} endIndex={endIndex} totalItems={filtered.length} onPageChange={setCurrentPage} />
      </div>

      {/* Detail Modal */}
      <PageModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedDefect?.defectId || ""}
        subtitle={`${selectedDefect?.productSku} — ${selectedDefect?.productName} · Inspection: ${selectedDefect?.inspectionId}`}
        badges={selectedDefect ? <><SeverityBadge severity={selectedDefect.severity} /><StatusBadge status={selectedDefect.status} /></> : undefined}
      >
        {selectedDefect && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Defect Type</label><p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{selectedDefect.defectType}</p></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Qty Affected</label><p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{selectedDefect.quantityAffected}</p></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recurrence Count</label><p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{selectedDefect.recurrenceCount}x</p></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Linked CAPA</label><p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1">{selectedDefect.linkedCapa}</p></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reported Date</label><p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedDefect.reportedDate}</p></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Inspection ID</label><p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedDefect.inspectionId}</p></div>
            </div>
            {selectedDefect.notes && (
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Notes</label><p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{selectedDefect.notes}</p></div>
            )}
          </div>
        )}
      </PageModal>

      {/* Create / Edit Modal */}
      <PageModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); resetForm(); }}
        title={isEditing ? "Update Defect Record" : "Log New Defect"}
        subtitle={isEditing ? "Update defect details" : "Record a new defect from inspection"}
        footer={
          <div className="flex items-center gap-3">
            <SecondaryButton onClick={() => { setIsFormOpen(false); resetForm(); }}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave} className="!w-auto !py-2.5 !px-6 !rounded-xl !text-xs">{isEditing ? "Update" : "Create"}</PrimaryButton>
          </div>
        }
      >
        <div className="space-y-1">
          <IconSelect label="Defect Type *" value={formDefectType} onChange={setFormDefectType} options={defectTypeOptions} placeholder="Select type…" />
          <IconSelect label="Severity *" value={formSeverity} onChange={setFormSeverity} options={[{ value: "Low", label: "Low" }, { value: "Medium", label: "Medium" }, { value: "High", label: "High" }]} placeholder="Select severity…" />
          <InputGroup id="def-sku" label="Product SKU" placeholder="e.g. SKU-001" icon={Package} value={formSku} onChange={(e) => setFormSku(e.target.value)} />
          <InputGroup id="def-qty" label="Quantity Affected *" type="number" placeholder="e.g. 15" icon={Package} value={formQty} onChange={(e) => setFormQty(e.target.value)} />
          <InputGroup id="def-insp" label="Inspection ID" placeholder="e.g. INS-021" icon={FileText} value={formInspection} onChange={(e) => setFormInspection(e.target.value)} />
          <InputGroup id="def-notes" label="Notes" placeholder="Describe the defect…" icon={FileText} value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
        </div>
      </PageModal>

      {/* Tag Recurring Confirmation */}
      <ConfirmationModal
        isOpen={!!tagRecurring}
        onClose={() => setTagRecurring(null)}
        onConfirm={confirmTagRecurring}
        title="Tag as Recurring Defect"
        message={`Mark ${tagRecurring?.defectId} as a recurring defect? This flags it for priority review and may trigger CAPA.`}
        variant="danger"
        confirmText="Tag Recurring"
      />

      {/* Link CAPA Modal */}
      <PageModal
        isOpen={!!linkCapa}
        onClose={() => setLinkCapa(null)}
        title={`Link CAPA — ${linkCapa?.defectId}`}
        subtitle="Associate this defect with a corrective action"
        footer={
          <div className="flex items-center gap-3">
            <SecondaryButton onClick={() => setLinkCapa(null)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={confirmLinkCapa} className="!w-auto !py-2.5 !px-6 !rounded-xl !text-xs">Link CAPA</PrimaryButton>
          </div>
        }
      >
        <InputGroup id="capa-link" label="CAPA ID *" placeholder="e.g. CAPA-005" icon={Link2} value={capaId} onChange={(e) => setCapaId(e.target.value)} />
      </PageModal>
    </QALayout>
  );
};

export default QADefectManagementPage;
