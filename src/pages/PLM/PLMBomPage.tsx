// ==========================================
// PLMBomPage.tsx — BOM (Bill of Materials)
// Branch-scoped BOM management per product version.
// Version selector, BOM lines table, CRUD for
// material lines, cost impact summary.
// ==========================================

import { useState, useMemo } from "react";
import {
  Layers,
  Package,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Lock,
  DollarSign,
  Archive,
} from "lucide-react";

// ------------------------------------------
// Layout & Reusable UI
// ------------------------------------------
import PLMLayout from "../../layout/PLMLayout";
import { Card } from "../../components/ui/Card";
import StatsCard from "../../components/ui/StatsCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
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

interface BOMLine {
  id: string;
  materialId: string;
  materialName: string;
  materialType: string;
  qtyRequired: number;
  unit: string;
  unitCost: number;
}

interface VersionOption {
  value: string;
  label: string;
  productName: string;
  approvalStatus: string;
  bomComplete: boolean;
}

// ==========================================
// MOCK DATA
// ==========================================

const VERSION_OPTIONS: VersionOption[] = [
  { value: "VER-001", label: "Classic Denim Jacket — V2.1", productName: "Classic Denim Jacket", approvalStatus: "Draft", bomComplete: true },
  { value: "VER-004", label: "Basic Cotton Tee — V3.0", productName: "Basic Cotton Tee", approvalStatus: "Approved", bomComplete: true },
  { value: "VER-006", label: "Knit Crew Sweater — V1.0", productName: "Knit Crew Sweater", approvalStatus: "Draft", bomComplete: false },
  { value: "VER-007", label: "Cargo Utility Pants — V4.0", productName: "Cargo Utility Pants", approvalStatus: "Approved", bomComplete: true },
];

const BOM_DATA: Record<string, BOMLine[]> = {
  "VER-001": [
    { id: "BOM-001", materialId: "MAT-001", materialName: "Cotton Twill Fabric", materialType: "Fabric", qtyRequired: 2.5, unit: "meters", unitCost: 12.50 },
    { id: "BOM-002", materialId: "MAT-002", materialName: "Polyester Thread", materialType: "Trim", qtyRequired: 3, unit: "spools", unitCost: 2.00 },
    { id: "BOM-003", materialId: "MAT-003", materialName: "YKK Metal Zipper 12\"", materialType: "Trim", qtyRequired: 1, unit: "pcs", unitCost: 4.50 },
    { id: "BOM-004", materialId: "MAT-004", materialName: "Metal Buttons (Set of 6)", materialType: "Trim", qtyRequired: 1, unit: "sets", unitCost: 3.00 },
    { id: "BOM-005", materialId: "MAT-005", materialName: "Woven Label Tag", materialType: "Trim", qtyRequired: 2, unit: "pcs", unitCost: 0.50 },
    { id: "BOM-006", materialId: "MAT-006", materialName: "Interfacing Fabric", materialType: "Fabric", qtyRequired: 0.8, unit: "meters", unitCost: 8.00 },
  ],
  "VER-004": [
    { id: "BOM-101", materialId: "MAT-007", materialName: "Organic Cotton Jersey", materialType: "Fabric", qtyRequired: 1.8, unit: "meters", unitCost: 10.00 },
    { id: "BOM-102", materialId: "MAT-002", materialName: "Polyester Thread", materialType: "Trim", qtyRequired: 2, unit: "spools", unitCost: 2.00 },
    { id: "BOM-103", materialId: "MAT-005", materialName: "Woven Label Tag", materialType: "Trim", qtyRequired: 1, unit: "pcs", unitCost: 0.50 },
  ],
  "VER-006": [],
  "VER-007": [
    { id: "BOM-201", materialId: "MAT-008", materialName: "Cotton Twill Canvas", materialType: "Fabric", qtyRequired: 3.0, unit: "meters", unitCost: 14.00 },
    { id: "BOM-202", materialId: "MAT-003", materialName: "YKK Metal Zipper 12\"", materialType: "Trim", qtyRequired: 2, unit: "pcs", unitCost: 4.50 },
    { id: "BOM-203", materialId: "MAT-002", materialName: "Polyester Thread", materialType: "Trim", qtyRequired: 4, unit: "spools", unitCost: 2.00 },
    { id: "BOM-204", materialId: "MAT-009", materialName: "Reinforced Knee Patches", materialType: "Trim", qtyRequired: 2, unit: "pcs", unitCost: 5.00 },
  ],
};

const MATERIAL_OPTIONS: IconSelectOption[] = [
  { value: "MAT-001", label: "Cotton Twill Fabric", icon: Layers },
  { value: "MAT-002", label: "Polyester Thread", icon: Layers },
  { value: "MAT-003", label: "YKK Metal Zipper 12\"", icon: Layers },
  { value: "MAT-004", label: "Metal Buttons (Set of 6)", icon: Layers },
  { value: "MAT-005", label: "Woven Label Tag", icon: Layers },
  { value: "MAT-006", label: "Interfacing Fabric", icon: Layers },
  { value: "MAT-007", label: "Organic Cotton Jersey", icon: Layers },
  { value: "MAT-008", label: "Cotton Twill Canvas", icon: Layers },
  { value: "MAT-009", label: "Reinforced Knee Patches", icon: Layers },
  { value: "MAT-010", label: "Silk Lining", icon: Layers },
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

function PLMBomPage() {
  // ------------------------------------------
  // STATE
  // ------------------------------------------
  const [selectedVersion, setSelectedVersion] = useState(VERSION_OPTIONS[0].value);
  const [bomLines, setBomLines] = useState<Record<string, BOMLine[]>>(BOM_DATA);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<BOMLine | null>(null);

  // Form fields
  const [formMaterial, setFormMaterial] = useState("");
  const [formQty, setFormQty] = useState("");
  const [formUnit, setFormUnit] = useState("");

  // Toast & Confirm
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean; title: string; message: string; action: () => void; variant: "primary" | "danger"; confirmText: string;
  }>({ isOpen: false, title: "", message: "", action: () => {}, variant: "primary", confirmText: "Confirm" });

  // ------------------------------------------
  // COMPUTED
  // ------------------------------------------
  const currentLines = bomLines[selectedVersion] || [];
  const currentVersion = VERSION_OPTIONS.find((v) => v.value === selectedVersion);

  const totals = useMemo(() => {
    const totalQty = currentLines.reduce((s, l) => s + l.qtyRequired, 0);
    const totalCost = currentLines.reduce((s, l) => s + l.qtyRequired * l.unitCost, 0);
    return { count: currentLines.length, totalQty: totalQty.toFixed(2), totalCost: totalCost.toFixed(2) };
  }, [currentLines]);

  // ------------------------------------------
  // HANDLERS
  // ------------------------------------------
  const openAddLine = () => {
    setEditingLine(null);
    setFormMaterial(""); setFormQty(""); setFormUnit("");
    setIsFormOpen(true);
  };

  const openEditLine = (line: BOMLine) => {
    setEditingLine(line);
    setFormMaterial(line.materialId); setFormQty(String(line.qtyRequired)); setFormUnit(line.unit);
    setIsFormOpen(true);
  };

  const handleSaveLine = () => {
    const qty = parseFloat(formQty);
    if (!formMaterial || isNaN(qty) || qty <= 0 || !formUnit) {
      setToast({ message: "Please fill in all required fields.", type: "error" }); return;
    }
    const mat = MATERIAL_OPTIONS.find((m) => m.value === formMaterial);
    if (editingLine) {
      setBomLines((prev) => ({
        ...prev,
        [selectedVersion]: prev[selectedVersion].map((l) =>
          l.id === editingLine.id ? { ...l, materialId: formMaterial, materialName: mat?.label || formMaterial, qtyRequired: qty, unit: formUnit } : l
        ),
      }));
      setToast({ message: `BOM line updated.`, type: "success" });
    } else {
      const newLine: BOMLine = {
        id: `BOM-${Date.now()}`, materialId: formMaterial,
        materialName: mat?.label || formMaterial, materialType: "Fabric",
        qtyRequired: qty, unit: formUnit, unitCost: Math.round(Math.random() * 15 * 100) / 100 + 1,
      };
      setBomLines((prev) => ({
        ...prev,
        [selectedVersion]: [...(prev[selectedVersion] || []), newLine],
      }));
      setToast({ message: `Material added to BOM.`, type: "success" });
    }
    setIsFormOpen(false);
  };

  const handleRemoveLine = (line: BOMLine) => {
    setConfirmModal({
      isOpen: true, title: "Remove BOM Line?", message: `Remove "${line.materialName}" from this BOM? This cannot be undone.`,
      variant: "danger", confirmText: "Remove",
      action: () => {
        setBomLines((prev) => ({
          ...prev,
          [selectedVersion]: prev[selectedVersion].filter((l) => l.id !== line.id),
        }));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setToast({ message: `${line.materialName} removed from BOM.`, type: "success" });
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
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">BOM (Bill of Materials)</h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Manage material requirements per product version.</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-semibold"><Lock size={12} />Branch: Manila</div>
          </div>

          {/* Version Selector */}
          <Card className="p-5">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="w-full sm:w-80">
                <IconSelect label="Select Product → Version *" value={selectedVersion} onChange={setSelectedVersion}
                  options={VERSION_OPTIONS.map((v) => ({ value: v.value, label: v.label, icon: Package }))}
                  placeholder="Choose a version" />
              </div>
              {currentVersion && (
                <div className="flex items-center gap-3">
                  <StatusBadge status={currentVersion.approvalStatus} />
                  {currentVersion.bomComplete ? (
                    <span className="inline-flex items-center gap-1 whitespace-nowrap text-left text-[11px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-1 rounded-full"><CheckCircle size={12} /> BOM Complete</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 whitespace-nowrap text-left text-[11px] font-semibold text-rose-700 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-400 px-2.5 py-1 rounded-full"><AlertTriangle size={12} /> BOM Incomplete</span>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* KPI Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatsCard title="Materials" value={totals.count} icon={Layers} color="bg-indigo-500" />
            <StatsCard title="Total Qty" value={totals.totalQty} icon={Package} color="bg-blue-500" />
            <StatsCard title="Est. Cost" value={`$${totals.totalCost}`} icon={DollarSign} color="bg-emerald-500" />
          </div>

          {/* BOM Lines Table */}
          <Card className="overflow-hidden">
            <div className="px-5 pt-5 flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">BOM Lines</h3>
              <PrimaryButton onClick={openAddLine} className="!w-auto !py-2.5 !px-4 !text-xs !rounded-full"><Plus size={14} /> Add Material</PrimaryButton>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/80 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Material</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Type</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Qty Required</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Unit</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Est. Cost</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                  {currentLines.map((line) => (
                    <tr key={line.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-400 shrink-0"><Layers size={14} /></div>
                          <span className="font-semibold text-slate-900 dark:text-white text-sm">{line.materialName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{line.materialType}</span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-800 dark:text-slate-200">{line.qtyRequired}</td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-400">{line.unit}</td>
                      <td className="px-6 py-4 hidden md:table-cell text-xs font-bold text-slate-800 dark:text-slate-200">${(line.qtyRequired * line.unitCost).toFixed(2)}</td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex justify-start items-center gap-1">
                          <button onClick={() => openEditLine(line)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Edit"><Edit size={14} /></button>
                          <button onClick={() => handleRemoveLine(line)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors" title="Remove"><Trash2 size={14} /></button>
                          <button onClick={() => { setBomLines((prev) => ({ ...prev, [selectedVersion]: prev[selectedVersion].filter((l) => l.id !== line.id) })); setToast({ message: `${line.materialName} moved to archive.`, type: "success" }); }} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title="Archive"><Archive size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {currentLines.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-slate-400 text-sm">
                        <div className="flex flex-col items-center gap-2">
                          <Layers size={32} className="text-slate-300" />
                          <p className="font-medium">No materials in BOM</p>
                          <p className="text-xs">Add materials to build the Bill of Materials for this version.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* BOM Summary Footer — Highlighted */}
            {currentLines.length > 0 && (
              <div className="px-5 py-4 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Materials count */}
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800">
                    <Layers size={14} className="text-indigo-500" />
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Materials</span>
                    <span className="text-sm font-extrabold text-indigo-700 dark:text-indigo-300 ml-1">{totals.count}</span>
                  </div>
                  {/* Total Qty */}
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800">
                    <Package size={14} className="text-blue-500" />
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Total Qty</span>
                    <span className="text-sm font-extrabold text-blue-700 dark:text-blue-300 ml-1">{totals.totalQty}</span>
                  </div>
                  {/* Est. Total Cost */}
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800">
                    <DollarSign size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Est. Total Cost</span>
                    <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300 ml-1">${totals.totalCost}</span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </PLMLayout>

      {/* ---- ADD/EDIT BOM LINE MODAL ---- */}
      <PageModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingLine ? `Edit: ${editingLine.materialName}` : "Add BOM Line"} subtitle={editingLine ? `Editing material line` : "Add a material to this version's BOM."} maxWidth="max-w-md"
        footer={
          <div className="flex justify-end items-center gap-2 w-full">
            <SecondaryButton onClick={() => setIsFormOpen(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSaveLine} className="!w-auto !py-2.5 !px-6 !text-xs !rounded-full">{editingLine ? "Save Changes" : "Add Material"}</PrimaryButton>
          </div>
        }
      >
        <IconSelect label="Material *" value={formMaterial} onChange={setFormMaterial} options={MATERIAL_OPTIONS} placeholder="Select material" />
        <InputGroup id="bom-qty" label="Qty Required *" type="number" placeholder="Enter quantity" icon={Package} value={formQty} onChange={(e) => setFormQty(e.target.value)} />
        <IconSelect label="Unit *" value={formUnit} onChange={setFormUnit} options={UNIT_OPTIONS} placeholder="Select unit" />
      </PageModal>

      {/* ---- CONFIRMATION & TOAST ---- */}
      <ConfirmationModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))} onConfirm={confirmModal.action} title={confirmModal.title} message={confirmModal.message} variant={confirmModal.variant} confirmText={confirmModal.confirmText} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}

export default PLMBomPage;
