// ==========================================
// PLMProductsPage.tsx — Products (Styles & SKU)
// Branch-scoped CRUD for product setup.
// Create/manage product styles and SKU records.
// Columns: SKU, Product Name, Category, Status,
// Latest Version, Approval Status.
// ==========================================

import { useState, useMemo, useEffect } from "react";
import {
  Package,
  FileText,
  CheckCircle,
  Eye,
  Edit,
  Plus,
  Trash2,
  Tag,
  Calendar,
  User,
  Clock,
  Lock,
  Download,
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
import ToggleSwitch from "../../components/ui/ToggleSwitch";

// ==========================================
// TYPES
// ==========================================

type ProductStatus = "Active" | "Archived";
type ApprovalStatus = "Draft" | "Pending" | "Approved" | "Rejected";

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  status: ProductStatus;
  latestVersion: string;
  approvalStatus: ApprovalStatus;
  createdBy: string;
  description: string;
  season: string;
  lastModified: string;
}

// ==========================================
// MOCK DATA
// ==========================================

const INITIAL_PRODUCTS: Product[] = [
  { id: "P-001", sku: "MNL-JKT-001", name: "Classic Denim Jacket", category: "Outerwear", status: "Active", latestVersion: "V2.1", approvalStatus: "Pending", createdBy: "Design Team A", description: "Premium denim jacket with button-front closure, dual chest pockets, and adjustable waist tabs.", season: "FW 2026", lastModified: "Feb 12, 2026" },
  { id: "P-002", sku: "MNL-DRS-002", name: "Floral Summer Dress", category: "Dresses", status: "Active", latestVersion: "V1.1", approvalStatus: "Draft", createdBy: "Design Team B", description: "Lightweight floral print dress with A-line silhouette and adjustable spaghetti straps.", season: "SS 2026", lastModified: "Feb 11, 2026" },
  { id: "P-003", sku: "MNL-TEE-003", name: "Basic Cotton Tee", category: "Tops", status: "Active", latestVersion: "V3.0", approvalStatus: "Approved", createdBy: "Production Manager", description: "Essential crew neck tee in 100% organic cotton. Available in 6 colorways.", season: "Core", lastModified: "Feb 10, 2026" },
  { id: "P-004", sku: "MNL-COAT-004", name: "Wool Trench Coat", category: "Outerwear", status: "Active", latestVersion: "V2.0", approvalStatus: "Rejected", createdBy: "Senior Designer", description: "Double-breasted trench coat in Italian wool blend with storm flap and epaulettes.", season: "FW 2026", lastModified: "Feb 9, 2026" },
  { id: "P-005", sku: "MNL-SHT-005", name: "Linen Button-Down Shirt", category: "Tops", status: "Active", latestVersion: "V2.0", approvalStatus: "Approved", createdBy: "Design Team C", description: "Relaxed-fit linen shirt with mother-of-pearl buttons and chest pocket.", season: "SS 2026", lastModified: "Feb 8, 2026" },
  { id: "P-006", sku: "MNL-SWT-006", name: "Knit Crew Sweater", category: "Knitwear", status: "Active", latestVersion: "V1.0", approvalStatus: "Draft", createdBy: "Junior Designer", description: "Merino wool blend crew neck sweater with ribbed cuffs and hem.", season: "FW 2026", lastModified: "Feb 7, 2026" },
  { id: "P-007", sku: "MNL-PNT-007", name: "Cargo Utility Pants", category: "Bottoms", status: "Active", latestVersion: "V4.0", approvalStatus: "Approved", createdBy: "Senior Designer", description: "Durable cotton-blend cargo pants with reinforced knee panels and multiple pockets.", season: "Core", lastModified: "Feb 5, 2026" },
  { id: "P-008", sku: "MNL-PLO-008", name: "Polo Shirt Classic", category: "Tops", status: "Archived", latestVersion: "V2.0", approvalStatus: "Approved", createdBy: "Design Team A", description: "Classic polo shirt in pique cotton. Discontinued season line.", season: "SS 2025", lastModified: "Jan 15, 2026" },
];

// ==========================================
// CONSTANTS
// ==========================================

const ITEMS_PER_PAGE = 5;

const CATEGORY_OPTIONS: IconSelectOption[] = [
  { value: "Outerwear", label: "Outerwear", icon: Package },
  { value: "Tops", label: "Tops", icon: Package },
  { value: "Bottoms", label: "Bottoms", icon: Package },
  { value: "Dresses", label: "Dresses", icon: Package },
  { value: "Knitwear", label: "Knitwear", icon: Package },
  { value: "Accessories", label: "Accessories", icon: Tag },
];

const STATUS_FILTERS = ["All", "Active", "Archived"];
// ==========================================
// MAIN COMPONENT
// ==========================================

function PLMProductsPage() {
  // ------------------------------------------
  // STATE
  // ------------------------------------------
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form fields
  const [formName, setFormName] = useState("");
  const [formSku, setFormSku] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formStatus, setFormStatus] = useState("Active");
  const [formSeason, setFormSeason] = useState("");
  const [formDescription, setFormDescription] = useState("");

  // Toast & Confirm
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
    variant: "primary" | "danger";
    confirmText: string;
  }>({
    isOpen: false, title: "", message: "", action: () => {}, variant: "primary", confirmText: "Confirm",
  });

  // Reset pagination on filter/search
  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter]);

  // ------------------------------------------
  // COMPUTED: Stats
  // ------------------------------------------
  const stats = useMemo(() => ({
    total: products.length,
    active: products.filter((p) => p.status === "Active").length,
    archived: products.filter((p) => p.status === "Archived").length,
    pendingApproval: products.filter((p) => p.approvalStatus === "Pending").length,
  }), [products]);

  // ------------------------------------------
  // COMPUTED: Filtered & Paginated
  // ------------------------------------------
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [products, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filtered.length);
  const paginated = filtered.slice(startIndex, endIndex);

  // ------------------------------------------
  // HANDLERS: Form
  // ------------------------------------------
  const openAdd = () => {
    setEditingProduct(null);
    setFormName(""); setFormSku(""); setFormCategory(""); setFormStatus("Active"); setFormSeason(""); setFormDescription("");
    setIsFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name); setFormSku(product.sku); setFormCategory(product.category); setFormStatus(product.status); setFormSeason(product.season); setFormDescription(product.description);
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!formName.trim() || !formSku.trim() || !formCategory) {
      setToast({ message: "Please fill in all required fields.", type: "error" });
      return;
    }
    if (editingProduct) {
      setProducts((prev) => prev.map((p) => p.id === editingProduct.id ? { ...p, name: formName, sku: formSku, category: formCategory, status: formStatus as ProductStatus, season: formSeason, description: formDescription, lastModified: "Feb 13, 2026" } : p));
      setToast({ message: `Product ${formSku} updated successfully.`, type: "success" });
    } else {
      const newProduct: Product = {
        id: `P-${String(products.length + 1).padStart(3, "0")}`,
        sku: formSku, name: formName, category: formCategory, status: formStatus as ProductStatus,
        latestVersion: "V1.0", approvalStatus: "Draft", createdBy: "PLM Manager",
        description: formDescription, season: formSeason, lastModified: "Feb 13, 2026",
      };
      setProducts((prev) => [newProduct, ...prev]);
      setToast({ message: `Product ${formSku} created successfully.`, type: "success" });
    }
    setIsFormOpen(false);
  };

  // ------------------------------------------
  // HANDLERS: Archive
  // ------------------------------------------
  const handleArchive = (product: Product) => {
    setConfirmModal({
      isOpen: true,
      title: "Archive Product?",
      message: `Are you sure you want to archive "${product.name}" (${product.sku})? The product will be marked as Archived.`,
      variant: "danger",
      confirmText: "Archive",
      action: () => {
        setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, status: "Archived" as ProductStatus } : p));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setToast({ message: `Product ${product.sku} archived successfully.`, type: "success" });
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
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Products (Styles & SKU)</h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Create and manage product styles and SKU records for this branch.</p>
            </div>
            <div className="flex items-center gap-3">
              <SecondaryButton onClick={() => setToast({ message: "Exporting products report...", type: "success" })} icon={Download}>Export</SecondaryButton>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-semibold">
                <Lock size={12} />Branch: Manila
              </div>
            </div>
          </div>

          {/* KPI Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard title="Total Products" value={stats.total} icon={Package} color="bg-indigo-500" />
            <StatsCard title="Active" value={stats.active} icon={CheckCircle} color="bg-emerald-500" />
            <StatsCard title="Archived" value={stats.archived} icon={Trash2} color="bg-slate-500" />
            <StatsCard title="Pending Approval" value={stats.pendingApproval} icon={Clock} color="bg-amber-500" />
          </div>

          {/* Products Table */}
          <Card className="overflow-hidden">
            <div className="px-5 pt-5">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                  <TableToolbar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    isFilterOpen={isFilterOpen}
                    setIsFilterOpen={setIsFilterOpen}
                    placeholder="Search by SKU or Product Name..."
                    filterLabel={statusFilter === "All" ? "All Statuses" : statusFilter}
                  >
                    <div className="p-1.5" role="group" aria-label="Filter by Status">
                      {STATUS_FILTERS.map((s) => (
                        <button key={s} role="option" aria-selected={statusFilter === s}
                          onClick={() => { setStatusFilter(s); setIsFilterOpen(false); }}
                          className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${statusFilter === s ? "bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
                        >{s === "All" ? "All Statuses" : s}</button>
                      ))}
                    </div>
                  </TableToolbar>
                </div>
                <PrimaryButton onClick={openAdd} className="!w-auto !py-2.5 !px-4 !text-xs !rounded-full">
                  <Plus size={14} /> Add Product
                </PrimaryButton>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/80 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Product Info</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Category</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Latest Version</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">Approval</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                  {paginated.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0"><Package size={18} /></div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 dark:text-white text-sm truncate">{product.name}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{product.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{product.category}</span>
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={product.status} /></td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{product.latestVersion}</span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell"><StatusBadge status={product.approvalStatus} /></td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex justify-start items-center gap-1">
                          <button onClick={() => setDetailProduct(product)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="View"><Eye size={14} /></button>
                          <button onClick={() => openEdit(product)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Edit"><Edit size={14} /></button>
                          {product.status !== "Archived" && (
                            <button onClick={() => handleArchive(product)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors" title="Archive"><Trash2 size={14} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-slate-400 text-sm">
                        <div className="flex flex-col items-center gap-2">
                          <Package size={32} className="text-slate-300" />
                          <p className="font-medium">No products found</p>
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

      {/* ---- PRODUCT DETAIL MODAL ---- */}
      {detailProduct && (
        <PageModal
          isOpen={!!detailProduct}
          onClose={() => setDetailProduct(null)}
          title={detailProduct.name}
          badges={<><StatusBadge status={detailProduct.status} className="!text-[10px] !py-0.5" /><StatusBadge status={detailProduct.approvalStatus} className="!text-[10px] !py-0.5" /></>}
          subtitle={<>SKU: {detailProduct.sku} · {detailProduct.latestVersion} · {detailProduct.season}</>}
          maxWidth="max-w-2xl"
          footer={
            <div className="flex justify-between items-center w-full">
              <SecondaryButton onClick={() => setDetailProduct(null)}>Close</SecondaryButton>
              <SecondaryButton onClick={() => { setDetailProduct(null); openEdit(detailProduct); }} icon={Edit}>Edit Product</SecondaryButton>
            </div>
          }
        >
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-3"><FileText size={14} className="text-slate-400" /> Description</h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">{detailProduct.description}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-3"><Package size={14} className="text-slate-400" /> Technical Details</h4>
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-700 pt-4">
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Tag size={10} /> Category</span><span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{detailProduct.category}</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Calendar size={10} /> Season</span><span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{detailProduct.season}</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><User size={10} /> Created By</span><span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{detailProduct.createdBy}</span></div>
              <div className="space-y-1"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Clock size={10} /> Last Modified</span><span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{detailProduct.lastModified}</span></div>
            </div>
          </div>
        </PageModal>
      )}

      {/* ---- ADD/EDIT PRODUCT FORM MODAL ---- */}
      <PageModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingProduct ? "Edit Product" : "Create Product"}
        subtitle={editingProduct ? `Editing ${editingProduct.sku}` : "Create a new product for this branch."}
        maxWidth="max-w-lg"
        footer={
          <div className="flex justify-end items-center gap-2 w-full">
            <SecondaryButton onClick={() => setIsFormOpen(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave} className="!w-auto !py-2.5 !px-6 !text-xs !rounded-full">{editingProduct ? "Save Changes" : "Create Product"}</PrimaryButton>
          </div>
        }
      >
        <InputGroup id="product-sku" label="SKU *" placeholder="e.g. MNL-JKT-001" icon={Tag} value={formSku} onChange={(e) => setFormSku(e.target.value)} />
        <InputGroup id="product-name" label="Product Name *" placeholder="e.g. Classic Denim Jacket" icon={Package} value={formName} onChange={(e) => setFormName(e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <IconSelect label="Category *" value={formCategory} onChange={setFormCategory} options={CATEGORY_OPTIONS} placeholder="Select category" />
          {/* Status Toggle — Active / Disabled */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Status</label>
            <div className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
              <ToggleSwitch
                active={formStatus === "Active"}
                onToggle={() => setFormStatus(formStatus === "Active" ? "Archived" : "Active")}
                label="Product status toggle"
              />
              <span className={`text-xs font-semibold ${formStatus === "Active" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}`}>
                {formStatus === "Active" ? "Active" : "Disabled"}
              </span>
            </div>
          </div>
        </div>
        <InputGroup id="product-season" label="Season" placeholder="e.g. FW 2026, SS 2026, Core" icon={Calendar} value={formSeason} onChange={(e) => setFormSeason(e.target.value)} />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="product-description" className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">Description</label>
          <textarea id="product-description" rows={3} placeholder="Product description..." value={formDescription} onChange={(e) => setFormDescription(e.target.value)}
            className="w-full px-4 py-3 text-sm font-medium bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 resize-none text-slate-900 dark:text-white" />
        </div>
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
          <Lock size={14} className="text-slate-400" /><span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Branch: Manila (Fixed)</span>
        </div>
      </PageModal>

      {/* ---- CONFIRMATION MODAL ---- */}
      <ConfirmationModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))} onConfirm={confirmModal.action} title={confirmModal.title} message={confirmModal.message} variant={confirmModal.variant} confirmText={confirmModal.confirmText} />

      {/* ---- TOAST ---- */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}

export default PLMProductsPage;
