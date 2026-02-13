// ==========================================
// AdminPLMPage.tsx — Branch Admin PLM
// Product Lifecycle Management with 4 tabs:
//   Products | BOM | Revisions | Release to Production
// Branch scope only — Manila branch.
//
// Reusable UI components used:
//   TabBar, TableToolbar, FilterDropdown, PageModal,
//   DetailsModal, ConfirmationModal, Toast, InputGroup,
//   IconSelect, StatsCard, StatusBadge, Card, Pagination,
//   PrimaryButton, SecondaryButton
// ==========================================

import { useState, useMemo, useEffect } from "react";
import {
  Package,
  FileText,
  AlertTriangle,
  CheckCircle,
  Lock,
  History,
  Eye,
  Pencil,
  Plus,
  Trash2,
  Layers,
  Rocket,
  Send,
  Calendar,
  User,
  Clock,
  Tag,
  ShieldCheck,
  XCircle,
  Download,
} from "lucide-react";

// ------------------------------------------
// Layout
// ------------------------------------------
import AdminLayout from "../../layout/AdminLayout";

// ------------------------------------------
// Reusable UI Components (from components/ui)
// ------------------------------------------
import { Card } from "../../components/ui/Card";
import StatsCard from "../../components/ui/StatsCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import TabBar from "../../components/ui/TabBar";
import type { Tab } from "../../components/ui/TabBar";
import { TableToolbar } from "../../components/ui/TableToolbar";
import FilterDropdown from "../../components/ui/FilterDropdown";
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

type ProductStatus = "Draft" | "Under Review" | "Released";

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  status: ProductStatus;
  latestRevision: string;
  createdBy: string;
  description: string;
  season: string;
  lastModified: string;
  hasBOM: boolean;
  hasTechPack: boolean;
  hasQAChecklist: boolean;
}

interface BOMMaterial {
  id: number;
  name: string;
  unit: string;
  quantity: number;
  wastePct: number;
}

type RevisionStatus = "Pending" | "Approved" | "Released";

interface Revision {
  id: string;
  revisionNumber: string;
  product: string;
  changeSummary: string;
  createdBy: string;
  date: string;
  status: RevisionStatus;
}

interface ReleaseItem {
  id: string;
  revisionNumber: string;
  product: string;
  sku: string;
  bomComplete: boolean;
  qaReady: boolean;
}

// ==========================================
// MOCK DATA
// ==========================================

const INITIAL_PRODUCTS: Product[] = [
  { id: "P-001", sku: "MNL-JKT-001", name: "Classic Denim Jacket", category: "Outerwear", status: "Under Review", latestRevision: "v2", createdBy: "Design Team A", description: "Premium denim jacket with button-front closure, dual chest pockets, and adjustable waist tabs.", season: "FW 2026", lastModified: "Feb 12, 2026", hasBOM: true, hasTechPack: true, hasQAChecklist: true },
  { id: "P-002", sku: "MNL-DRS-002", name: "Floral Summer Dress", category: "Dresses", status: "Draft", latestRevision: "v1", createdBy: "Design Team B", description: "Lightweight floral print dress with A-line silhouette and adjustable spaghetti straps.", season: "SS 2026", lastModified: "Feb 11, 2026", hasBOM: true, hasTechPack: false, hasQAChecklist: false },
  { id: "P-003", sku: "MNL-TEE-003", name: "Basic Cotton Tee", category: "Tops", status: "Released", latestRevision: "v3", createdBy: "Production Manager", description: "Essential crew neck tee in 100% organic cotton. Available in 6 colorways.", season: "Core", lastModified: "Feb 10, 2026", hasBOM: true, hasTechPack: true, hasQAChecklist: true },
  { id: "P-004", sku: "MNL-COAT-004", name: "Wool Trench Coat", category: "Outerwear", status: "Under Review", latestRevision: "v2", createdBy: "Senior Designer", description: "Double-breasted trench coat in Italian wool blend with storm flap and epaulettes.", season: "FW 2026", lastModified: "Feb 9, 2026", hasBOM: true, hasTechPack: true, hasQAChecklist: false },
  { id: "P-005", sku: "MNL-SHT-005", name: "Linen Button-Down Shirt", category: "Tops", status: "Released", latestRevision: "v2", createdBy: "Design Team C", description: "Relaxed-fit linen shirt with mother-of-pearl buttons and chest pocket.", season: "SS 2026", lastModified: "Feb 8, 2026", hasBOM: true, hasTechPack: true, hasQAChecklist: true },
  { id: "P-006", sku: "MNL-SWT-006", name: "Knit Crew Sweater", category: "Knitwear", status: "Draft", latestRevision: "v1", createdBy: "Junior Designer", description: "Merino wool blend crew neck sweater with ribbed cuffs and hem.", season: "FW 2026", lastModified: "Feb 7, 2026", hasBOM: false, hasTechPack: true, hasQAChecklist: false },
  { id: "P-007", sku: "MNL-PNT-007", name: "Cargo Utility Pants", category: "Bottoms", status: "Released", latestRevision: "v4", createdBy: "Senior Designer", description: "Durable cotton-blend cargo pants with reinforced knee panels and multiple pockets.", season: "Core", lastModified: "Feb 5, 2026", hasBOM: true, hasTechPack: true, hasQAChecklist: true },
];

const INITIAL_BOM_MATERIALS: BOMMaterial[] = [
  { id: 1, name: "Cotton Twill Fabric", unit: "meters", quantity: 2.5, wastePct: 5 },
  { id: 2, name: "Polyester Thread", unit: "spools", quantity: 3, wastePct: 2 },
  { id: 3, name: "YKK Metal Zipper 12\"", unit: "pcs", quantity: 1, wastePct: 0 },
  { id: 4, name: "Metal Buttons (Set of 6)", unit: "sets", quantity: 1, wastePct: 0 },
  { id: 5, name: "Woven Label Tag", unit: "pcs", quantity: 2, wastePct: 5 },
  { id: 6, name: "Interfacing Fabric", unit: "meters", quantity: 0.8, wastePct: 3 },
];

const INITIAL_REVISIONS: Revision[] = [
  { id: "REV-001", revisionNumber: "v2.1", product: "Classic Denim Jacket", changeSummary: "Updated pocket placement and stitching pattern", createdBy: "Design Team A", date: "Feb 12, 2026", status: "Pending" },
  { id: "REV-002", revisionNumber: "v3.0", product: "Basic Cotton Tee", changeSummary: "Changed collar style to crew neck", createdBy: "Production Manager", date: "Feb 11, 2026", status: "Approved" },
  { id: "REV-003", revisionNumber: "v1.1", product: "Floral Summer Dress", changeSummary: "Adjusted hemline length and fabric weight", createdBy: "Design Team B", date: "Feb 10, 2026", status: "Pending" },
  { id: "REV-004", revisionNumber: "v2.0", product: "Wool Trench Coat", changeSummary: "Upgraded lining material for better insulation", createdBy: "Senior Designer", date: "Feb 9, 2026", status: "Released" },
  { id: "REV-005", revisionNumber: "v4.0", product: "Cargo Utility Pants", changeSummary: "Added reinforced knee panels", createdBy: "Senior Designer", date: "Feb 8, 2026", status: "Approved" },
  { id: "REV-006", revisionNumber: "v1.0", product: "Knit Crew Sweater", changeSummary: "Initial design specification", createdBy: "Junior Designer", date: "Feb 7, 2026", status: "Pending" },
];

const INITIAL_RELEASE_ITEMS: ReleaseItem[] = [
  { id: "REL-001", revisionNumber: "v3.0", product: "Basic Cotton Tee", sku: "MNL-TEE-003", bomComplete: true, qaReady: true },
  { id: "REL-002", revisionNumber: "v4.0", product: "Cargo Utility Pants", sku: "MNL-PNT-007", bomComplete: true, qaReady: true },
  { id: "REL-003", revisionNumber: "v2.0", product: "Linen Button-Down Shirt", sku: "MNL-SHT-005", bomComplete: true, qaReady: false },
  { id: "REL-004", revisionNumber: "v2.1", product: "Classic Denim Jacket", sku: "MNL-JKT-001", bomComplete: false, qaReady: false },
];

// ==========================================
// CONSTANTS
// ==========================================

const ITEMS_PER_PAGE = 5;

/** Tab definitions for TabBar component */
const PLM_TABS: Tab[] = [
  { id: "products", label: "Products", icon: Package, count: INITIAL_PRODUCTS.length },
  { id: "bom", label: "BOM", icon: Layers },
  { id: "revisions", label: "Revisions", icon: History, count: INITIAL_REVISIONS.filter((r) => r.status === "Pending").length },
  { id: "release", label: "Release to Production", icon: Rocket },
];

/** Category options for product form */
const CATEGORY_OPTIONS: IconSelectOption[] = [
  { value: "Outerwear", label: "Outerwear", icon: Package },
  { value: "Tops", label: "Tops", icon: Package },
  { value: "Bottoms", label: "Bottoms", icon: Package },
  { value: "Dresses", label: "Dresses", icon: Package },
  { value: "Knitwear", label: "Knitwear", icon: Package },
  { value: "Accessories", label: "Accessories", icon: Tag },
];

/** Status options for product form */
const STATUS_OPTIONS: IconSelectOption[] = [
  { value: "Draft", label: "Draft", icon: FileText },
  { value: "Under Review", label: "Under Review", icon: Clock },
  { value: "Released", label: "Released", icon: CheckCircle },
];

/** Product filter options for Products table */
const PRODUCT_STATUS_FILTERS = ["All Statuses", "Draft", "Under Review", "Released"];

/** Revision filter options */
const REVISION_STATUS_FILTERS = ["All Statuses", "Pending", "Approved", "Released"];

// ==========================================
// MAIN COMPONENT
// ==========================================

function AdminPLMPage() {
  // ------------------------------------------
  // STATE: Tab
  // ------------------------------------------
  const [activeTab, setActiveTab] = useState("products");

  // ------------------------------------------
  // STATE: Products
  // ------------------------------------------
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [productSearch, setProductSearch] = useState("");
  const [productFilterOpen, setProductFilterOpen] = useState(false);
  const [productStatusFilter, setProductStatusFilter] = useState("All Statuses");
  const [productPage, setProductPage] = useState(1);

  // ------------------------------------------
  // STATE: BOM
  // ------------------------------------------
  const [bomMaterials, setBomMaterials] = useState<BOMMaterial[]>(INITIAL_BOM_MATERIALS);
  const [bomProductFilter, setBomProductFilter] = useState(INITIAL_PRODUCTS[0].sku);

  // ------------------------------------------
  // STATE: Revisions
  // ------------------------------------------
  const [revisions, setRevisions] = useState<Revision[]>(INITIAL_REVISIONS);
  const [revisionSearch, setRevisionSearch] = useState("");
  const [revisionFilterOpen, setRevisionFilterOpen] = useState(false);
  const [revisionStatusFilter, setRevisionStatusFilter] = useState("All Statuses");
  const [revisionPage, setRevisionPage] = useState(1);

  // ------------------------------------------
  // STATE: Release
  // ------------------------------------------
  const [releaseItems, setReleaseItems] = useState<ReleaseItem[]>(INITIAL_RELEASE_ITEMS);
  const [releaseSearch, setReleaseSearch] = useState("");
  const [releaseFilterOpen, setReleaseFilterOpen] = useState(false);
  const [releasePage, setReleasePage] = useState(1);

  // ------------------------------------------
  // STATE: Modals — Product Detail
  // ------------------------------------------
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  // ------------------------------------------
  // STATE: Modals — Add/Edit Product Form
  // ------------------------------------------
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formName, setFormName] = useState("");
  const [formSku, setFormSku] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formStatus, setFormStatus] = useState("Draft");
  const [formSeason, setFormSeason] = useState("");
  const [formDescription, setFormDescription] = useState("");

  // ------------------------------------------
  // STATE: Modals — BOM Material Edit
  // ------------------------------------------
  const [editingMaterial, setEditingMaterial] = useState<BOMMaterial | null>(null);
  const [matQty, setMatQty] = useState("");
  const [matWaste, setMatWaste] = useState("");

  // ------------------------------------------
  // STATE: Modals — Revision Detail
  // ------------------------------------------
  const [detailRevision, setDetailRevision] = useState<Revision | null>(null);

  // ------------------------------------------
  // STATE: Toast & Confirm
  // ------------------------------------------
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
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
  // Reset pagination on filter/search changes
  // ------------------------------------------
  useEffect(() => { setProductPage(1); }, [productSearch, productStatusFilter]);
  useEffect(() => { setRevisionPage(1); }, [revisionSearch, revisionStatusFilter]);
  useEffect(() => { setReleasePage(1); }, [releaseSearch]);

  // ==========================================
  // COMPUTED: Stats
  // ==========================================
  const stats = useMemo(() => ({
    totalSKUs: products.length,
    awaitingReview: products.filter((p) => p.status === "Under Review").length,
    bomAlerts: products.filter((p) => !p.hasBOM || !p.hasTechPack || !p.hasQAChecklist).length,
    productionReady: products.filter((p) => p.status === "Released").length,
  }), [products]);

  // ==========================================
  // COMPUTED: Filtered & Paginated — Products
  // ==========================================
  const filteredProducts = useMemo(() => {
    const q = productSearch.toLowerCase();
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      const matchesStatus = productStatusFilter === "All Statuses" || p.status === productStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [products, productSearch, productStatusFilter]);

  const prodTotalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const prodStart = (productPage - 1) * ITEMS_PER_PAGE;
  const prodEnd = Math.min(prodStart + ITEMS_PER_PAGE, filteredProducts.length);
  const paginatedProducts = filteredProducts.slice(prodStart, prodEnd);

  // ==========================================
  // COMPUTED: Filtered & Paginated — Revisions
  // ==========================================
  const filteredRevisions = useMemo(() => {
    const q = revisionSearch.toLowerCase();
    return revisions.filter((r) => {
      const matchesSearch = r.product.toLowerCase().includes(q) || r.revisionNumber.toLowerCase().includes(q) || r.changeSummary.toLowerCase().includes(q);
      const matchesStatus = revisionStatusFilter === "All Statuses" || r.status === revisionStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [revisions, revisionSearch, revisionStatusFilter]);

  const revTotalPages = Math.max(1, Math.ceil(filteredRevisions.length / ITEMS_PER_PAGE));
  const revStart = (revisionPage - 1) * ITEMS_PER_PAGE;
  const revEnd = Math.min(revStart + ITEMS_PER_PAGE, filteredRevisions.length);
  const paginatedRevisions = filteredRevisions.slice(revStart, revEnd);

  // ==========================================
  // COMPUTED: Filtered & Paginated — Release
  // ==========================================
  const filteredRelease = useMemo(() => {
    const q = releaseSearch.toLowerCase();
    return releaseItems.filter((r) => r.product.toLowerCase().includes(q) || r.sku.toLowerCase().includes(q));
  }, [releaseItems, releaseSearch]);

  const relTotalPages = Math.max(1, Math.ceil(filteredRelease.length / ITEMS_PER_PAGE));
  const relStart = (releasePage - 1) * ITEMS_PER_PAGE;
  const relEnd = Math.min(relStart + ITEMS_PER_PAGE, filteredRelease.length);
  const paginatedRelease = filteredRelease.slice(relStart, relEnd);

  // ==========================================
  // COMPUTED: BOM
  // ==========================================
  const bomTotals = useMemo(() => {
    const totalQty = bomMaterials.reduce((s, m) => s + m.quantity * (1 + m.wastePct / 100), 0);
    const wasteTotal = bomMaterials.reduce((s, m) => s + m.quantity * (m.wastePct / 100), 0);
    return { totalQty: totalQty.toFixed(2), wasteTotal: wasteTotal.toFixed(2), count: bomMaterials.length };
  }, [bomMaterials]);

  // ==========================================
  // HELPERS: Compliance
  // ==========================================
  const getComplianceItems = (p: Product) => [
    { label: "Bill of Materials (BOM)", complete: p.hasBOM },
    { label: "Tech Pack Upload", complete: p.hasTechPack },
    { label: "QA Checklist", complete: p.hasQAChecklist },
  ];

  const isFullyCompliant = (p: Product) => p.hasBOM && p.hasTechPack && p.hasQAChecklist;

  // ==========================================
  // HANDLERS: Product Form (Add/Edit)
  // ==========================================
  const openAddProduct = () => {
    setEditingProduct(null);
    setFormName("");
    setFormSku("");
    setFormCategory("");
    setFormStatus("Draft");
    setFormSeason("");
    setFormDescription("");
    setIsProductFormOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormSku(product.sku);
    setFormCategory(product.category);
    setFormStatus(product.status);
    setFormSeason(product.season);
    setFormDescription(product.description);
    setIsProductFormOpen(true);
  };

  const handleSaveProduct = () => {
    if (!formName.trim() || !formSku.trim() || !formCategory) {
      setToast({ message: "Please fill in all required fields.", type: "error" });
      return;
    }

    if (editingProduct) {
      // Edit existing
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? { ...p, name: formName, sku: formSku, category: formCategory, status: formStatus as ProductStatus, season: formSeason, description: formDescription, lastModified: "Feb 13, 2026" }
            : p
        )
      );
      setToast({ message: `Product ${formSku} updated successfully.`, type: "success" });
    } else {
      // Add new
      const newProduct: Product = {
        id: `P-${String(products.length + 1).padStart(3, "0")}`,
        sku: formSku,
        name: formName,
        category: formCategory,
        status: formStatus as ProductStatus,
        latestRevision: "v1",
        createdBy: "Branch Admin",
        description: formDescription,
        season: formSeason,
        lastModified: "Feb 13, 2026",
        hasBOM: false,
        hasTechPack: false,
        hasQAChecklist: false,
      };
      setProducts((prev) => [newProduct, ...prev]);
      setToast({ message: `Product ${formSku} created successfully.`, type: "success" });
    }
    setIsProductFormOpen(false);
  };

  // ==========================================
  // HANDLERS: Archive Product
  // ==========================================
  const handleArchiveProduct = (product: Product) => {
    setConfirmModal({
      isOpen: true,
      title: "Archive Product?",
      message: `Are you sure you want to archive "${product.name}" (${product.sku})? This action cannot be undone.`,
      variant: "danger",
      confirmText: "Archive",
      action: () => {
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setToast({ message: `Product ${product.sku} archived successfully.`, type: "success" });
      },
    });
  };

  // ==========================================
  // HANDLERS: BOM Material Edit
  // ==========================================
  const openEditMaterial = (material: BOMMaterial) => {
    setEditingMaterial(material);
    setMatQty(String(material.quantity));
    setMatWaste(String(material.wastePct));
  };

  const handleSaveMaterial = () => {
    if (!editingMaterial) return;
    const qty = parseFloat(matQty);
    const waste = parseFloat(matWaste);
    if (isNaN(qty) || isNaN(waste) || qty <= 0 || waste < 0) {
      setToast({ message: "Please enter valid quantity and waste percentage.", type: "error" });
      return;
    }
    setBomMaterials((prev) =>
      prev.map((m) => (m.id === editingMaterial.id ? { ...m, quantity: qty, wastePct: waste } : m))
    );
    setEditingMaterial(null);
    setToast({ message: `${editingMaterial.name} updated.`, type: "success" });
  };

  const handleRemoveBomMaterial = (material: BOMMaterial) => {
    setConfirmModal({
      isOpen: true,
      title: "Remove Material?",
      message: `Remove "${material.name}" from the BOM? This cannot be undone.`,
      variant: "danger",
      confirmText: "Remove",
      action: () => {
        setBomMaterials((prev) => prev.filter((m) => m.id !== material.id));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setToast({ message: `${material.name} removed from BOM.`, type: "success" });
      },
    });
  };

  // ==========================================
  // HANDLERS: Revisions
  // ==========================================
  const handleSubmitRevision = (revision: Revision) => {
    setConfirmModal({
      isOpen: true,
      title: "Submit for Approval?",
      message: `Submit revision ${revision.revisionNumber} for "${revision.product}" to the approval workflow?`,
      variant: "primary",
      confirmText: "Submit",
      action: () => {
        setRevisions((prev) =>
          prev.map((r) => (r.id === revision.id ? { ...r, status: "Approved" as RevisionStatus } : r))
        );
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setToast({ message: `Revision ${revision.revisionNumber} submitted for approval.`, type: "success" });
      },
    });
  };

  // ==========================================
  // HANDLERS: Release
  // ==========================================
  const handleRelease = (item: ReleaseItem) => {
    setConfirmModal({
      isOpen: true,
      title: "Release to Production?",
      message: `Release "${item.product}" (${item.revisionNumber}) to production? This action is final and will be logged.`,
      variant: "primary",
      confirmText: "Release",
      action: () => {
        setReleaseItems((prev) => prev.filter((r) => r.id !== item.id));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setToast({ message: `${item.product} (${item.revisionNumber}) released to production.`, type: "success" });
      },
    });
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <>
      <AdminLayout>
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
          {/* ============================================================
              PAGE HEADER
              ============================================================ */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                PLM (Products)
              </h1>
              <p className="text-xs font-medium text-slate-500 mt-1">
                Manage product lifecycle, BOMs, revisions, and releases for this branch.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <SecondaryButton onClick={() => setToast({ message: "Exporting PLM report...", type: "success" })} icon={Download}>
                Export
              </SecondaryButton>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold">
                <Lock size={12} />
                Branch: Manila (Locked)
              </div>
            </div>
          </div>

          {/* ============================================================
              KPI STATS CARDS
              ============================================================ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard title="Total SKUs" value={stats.totalSKUs} icon={Package} color="bg-indigo-500" />
            <StatsCard title="Awaiting Review" value={stats.awaitingReview} icon={History} color="bg-amber-500" />
            <StatsCard title="Compliance Alerts" value={stats.bomAlerts} icon={AlertTriangle} color="bg-rose-500" />
            <StatsCard title="Production Ready" value={stats.productionReady} icon={CheckCircle} color="bg-emerald-500" />
          </div>

          {/* ============================================================
              TAB BAR (Reusable TabBar component with icons & counts)
              ============================================================ */}
          <TabBar
            tabs={PLM_TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* ============================================================
              TAB 1: PRODUCTS
              ============================================================ */}
          {activeTab === "products" && (
            <Card className="overflow-hidden">
              {/* Toolbar: TableToolbar (search + filter) + Add button */}
              <div className="px-5 pt-5">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                    <TableToolbar
                      searchQuery={productSearch}
                      setSearchQuery={setProductSearch}
                      isFilterOpen={productFilterOpen}
                      setIsFilterOpen={setProductFilterOpen}
                      placeholder="Search by SKU, name, or category..."
                      filterLabel={productStatusFilter === "All Statuses" ? "All Statuses" : productStatusFilter}
                    >
                      {/* Filter options rendered inside TableToolbar dropdown */}
                      <div className="p-1.5" role="group" aria-label="Filter by Status">
                        {PRODUCT_STATUS_FILTERS.map((status) => (
                          <button
                            key={status}
                            role="option"
                            aria-selected={productStatusFilter === status}
                            onClick={() => {
                              setProductStatusFilter(status);
                              setProductFilterOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                              productStatusFilter === status
                                ? "bg-slate-100 text-slate-900"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </TableToolbar>
                  </div>
                  <PrimaryButton onClick={openAddProduct} className="!w-auto !py-2.5 !px-4 !text-xs !rounded-full">
                    <Plus size={14} />
                    Add Product
                  </PrimaryButton>
                </div>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product Info</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Compliance</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Last Modified</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {paginatedProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                        {/* Product Info: icon + name + SKU */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                              <Package size={18} />
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 text-sm truncate">{product.name}</div>
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5">{product.sku} · {product.latestRevision}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">{product.category}</span>
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={product.status} /></td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          {isFullyCompliant(product) ? (
                            <span className="inline-flex items-center gap-1 whitespace-nowrap text-left text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full"><CheckCircle size={12} /> Complete</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {!product.hasBOM && <span className="inline-flex items-center gap-1 whitespace-nowrap text-left text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full"><AlertTriangle size={10} /> BOM</span>}
                              {!product.hasTechPack && <span className="inline-flex items-center gap-1 whitespace-nowrap text-left text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full"><FileText size={10} /> Tech</span>}
                              {!product.hasQAChecklist && <span className="inline-flex items-center gap-1 whitespace-nowrap text-left text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full"><FileText size={10} /> QA</span>}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 hidden lg:table-cell">{product.lastModified}</td>
                        <td className="px-6 py-4 text-left">
                          <div className="flex justify-start items-center gap-1">
                            <button onClick={() => setDetailProduct(product)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Details"><Eye size={14} /></button>
                            <button onClick={() => openEditProduct(product)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Pencil size={14} /></button>
                            <button onClick={() => handleArchiveProduct(product)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Archive"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
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
              <Pagination currentPage={productPage} totalPages={prodTotalPages} startIndex={prodStart} endIndex={prodEnd} totalItems={filteredProducts.length} onPageChange={setProductPage} />
            </Card>
          )}

          {/* ============================================================
              TAB 2: BOM (Bill of Materials)
              ============================================================ */}
          {activeTab === "bom" && (
            <Card className="overflow-hidden">
              <div className="px-5 pt-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <IconSelect
                    label="Product"
                    value={bomProductFilter}
                    onChange={setBomProductFilter}
                    options={products.map((p) => ({ value: p.sku, label: `${p.name} (${p.sku})`, icon: Package }))}
                    placeholder="Select a product"
                  />
                </div>
                <PrimaryButton onClick={() => setToast({ message: "Add material form coming soon.", type: "success" })} className="!w-auto !py-2.5 !px-4 !text-xs !rounded-full">
                  <Plus size={14} />
                  Add Material
                </PrimaryButton>
              </div>

              {/* BOM Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Material Name</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unit</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Waste %</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Effective Qty</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {bomMaterials.map((material) => (
                      <tr key={material.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-400 shrink-0"><Layers size={14} /></div>
                            <span className="font-semibold text-slate-900 text-sm">{material.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-600">{material.unit}</td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-800">{material.quantity}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${material.wastePct > 0 ? "bg-amber-50 text-amber-700" : "bg-slate-50 text-slate-500"}`}>{material.wastePct}%</span>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-800">{(material.quantity * (1 + material.wastePct / 100)).toFixed(2)}</td>
                        <td className="px-6 py-4 text-left">
                          <div className="flex justify-start items-center gap-1">
                            <button onClick={() => openEditMaterial(material)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Pencil size={14} /></button>
                            <button onClick={() => handleRemoveBomMaterial(material)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Remove"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {bomMaterials.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center text-slate-400 text-sm">
                          <div className="flex flex-col items-center gap-2">
                            <Layers size={32} className="text-slate-300" />
                            <p className="font-medium">No materials in BOM</p>
                            <p className="text-xs">Add materials to build the Bill of Materials.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* BOM Summary */}
              {bomMaterials.length > 0 && (
                <div className="px-5 py-4 bg-slate-50 border-t border-slate-200">
                  <div className="flex flex-wrap items-center gap-6 text-xs">
                    <div><span className="text-slate-500 font-medium">Materials: </span><span className="font-bold text-slate-900">{bomTotals.count}</span></div>
                    <div><span className="text-slate-500 font-medium">Total Qty (incl. waste): </span><span className="font-bold text-slate-900">{bomTotals.totalQty}</span></div>
                    <div><span className="text-slate-500 font-medium">Waste Total: </span><span className="font-bold text-amber-700">{bomTotals.wasteTotal}</span></div>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* ============================================================
              TAB 3: REVISIONS
              ============================================================ */}
          {activeTab === "revisions" && (
            <Card className="overflow-hidden">
              <div className="px-5 pt-5">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                    <TableToolbar
                      searchQuery={revisionSearch}
                      setSearchQuery={setRevisionSearch}
                      isFilterOpen={revisionFilterOpen}
                      setIsFilterOpen={setRevisionFilterOpen}
                      placeholder="Search revisions..."
                      filterLabel={revisionStatusFilter === "All Statuses" ? "All Statuses" : revisionStatusFilter}
                    >
                      <div className="p-1.5" role="group" aria-label="Filter by Status">
                        {REVISION_STATUS_FILTERS.map((status) => (
                          <button
                            key={status}
                            role="option"
                            aria-selected={revisionStatusFilter === status}
                            onClick={() => { setRevisionStatusFilter(status); setRevisionFilterOpen(false); }}
                            className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${revisionStatusFilter === status ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </TableToolbar>
                  </div>
                  <PrimaryButton onClick={() => setToast({ message: "Create revision form coming soon.", type: "success" })} className="!w-auto !py-2.5 !px-4 !text-xs !rounded-full">
                    <Plus size={14} />
                    Create Revision
                  </PrimaryButton>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Revision #</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Change Summary</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Created By</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Date</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {paginatedRevisions.map((revision) => (
                      <tr key={revision.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4"><span className="font-mono text-xs font-bold text-indigo-600">{revision.revisionNumber}</span></td>
                        <td className="px-6 py-4 font-semibold text-slate-900 text-sm">{revision.product}</td>
                        <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate hidden md:table-cell">{revision.changeSummary}</td>
                        <td className="px-6 py-4 text-xs text-slate-500 hidden lg:table-cell">{revision.createdBy}</td>
                        <td className="px-6 py-4 text-xs text-slate-500 hidden md:table-cell">{revision.date}</td>
                        <td className="px-6 py-4"><StatusBadge status={revision.status} /></td>
                        <td className="px-6 py-4 text-left">
                          <div className="flex justify-start items-center gap-1">
                            <button onClick={() => setDetailRevision(revision)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Details"><Eye size={14} /></button>
                            {revision.status === "Pending" && (
                              <button onClick={() => handleSubmitRevision(revision)} className="inline-flex items-center gap-1 whitespace-nowrap text-left px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors" title="Submit for Approval"><Send size={12} /> Submit</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredRevisions.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-16 text-center text-slate-400 text-sm">
                          <div className="flex flex-col items-center gap-2">
                            <FileText size={32} className="text-slate-300" />
                            <p className="font-medium">No revisions found</p>
                            <p className="text-xs">Try adjusting your search or filter criteria.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={revisionPage} totalPages={revTotalPages} startIndex={revStart} endIndex={revEnd} totalItems={filteredRevisions.length} onPageChange={setRevisionPage} />
            </Card>
          )}

          {/* ============================================================
              TAB 4: RELEASE TO PRODUCTION
              ============================================================ */}
          {activeTab === "release" && (
            <Card className="overflow-hidden">
              <div className="px-5 pt-5">
                <TableToolbar
                  searchQuery={releaseSearch}
                  setSearchQuery={setReleaseSearch}
                  isFilterOpen={releaseFilterOpen}
                  setIsFilterOpen={setReleaseFilterOpen}
                  placeholder="Search approved items..."
                  filterLabel="Filters"
                >
                  <div className="p-3 text-xs text-slate-500 italic">No additional filters available.</div>
                </TableToolbar>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Revision</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">SKU</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">BOM Complete</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">QA Ready</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {paginatedRelease.map((item) => {
                      const canRelease = item.bomComplete && item.qaReady;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4"><span className="font-mono text-xs font-bold text-indigo-600">{item.revisionNumber}</span></td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0"><Package size={16} /></div>
                              <span className="font-semibold text-slate-900 text-sm">{item.product}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-600 hidden md:table-cell">{item.sku}</td>
                          <td className="px-6 py-4">
                            {item.bomComplete
                              ? <span className="inline-flex items-center gap-1 whitespace-nowrap text-left text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full"><CheckCircle size={12} /> Complete</span>
                              : <span className="inline-flex items-center gap-1 whitespace-nowrap text-left text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full"><XCircle size={12} /> Incomplete</span>}
                          </td>
                          <td className="px-6 py-4">
                            {item.qaReady
                              ? <span className="inline-flex items-center gap-1 whitespace-nowrap text-left text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full"><CheckCircle size={12} /> Ready</span>
                              : <span className="inline-flex items-center gap-1 whitespace-nowrap text-left text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full"><XCircle size={12} /> Not Ready</span>}
                          </td>
                          <td className="px-6 py-4 text-left">
                            <button
                              onClick={() => handleRelease(item)}
                              disabled={!canRelease}
                              className={`inline-flex items-center gap-1 whitespace-nowrap text-left.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${canRelease ? "text-indigo-700 bg-indigo-50 hover:bg-indigo-100" : "text-slate-300 bg-slate-50 cursor-not-allowed"}`}
                              title={canRelease ? "Release to Production" : "Checklist incomplete"}
                            >
                              <Rocket size={14} />
                              Release
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredRelease.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center text-slate-400 text-sm">
                          <div className="flex flex-col items-center gap-2">
                            <Rocket size={32} className="text-slate-300" />
                            <p className="font-medium">No items ready for release</p>
                            <p className="text-xs">Approved revisions will appear here.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={releasePage} totalPages={relTotalPages} startIndex={relStart} endIndex={relEnd} totalItems={filteredRelease.length} onPageChange={setReleasePage} />
            </Card>
          )}
        </div>
      </AdminLayout>

      {/* ==================================================================
          MODALS — Rendered outside AdminLayout (portals handle stacking)
          ================================================================== */}

      {/* ---- PRODUCT DETAIL MODAL (PageModal) ---- */}
      {detailProduct && (
        <PageModal
          isOpen={!!detailProduct}
          onClose={() => setDetailProduct(null)}
          title={detailProduct.name}
          badges={<StatusBadge status={detailProduct.status} className="!text-[10px] !py-0.5" />}
          subtitle={<>SKU: {detailProduct.sku} · {detailProduct.latestRevision} · {detailProduct.season}</>}
          maxWidth="max-w-2xl"
          footer={
            <div className="flex justify-between items-center w-full">
              <SecondaryButton onClick={() => setDetailProduct(null)}>Close</SecondaryButton>
              <div className="flex items-center gap-2">
                <SecondaryButton onClick={() => { setDetailProduct(null); openEditProduct(detailProduct); }} icon={Pencil}>Edit Product</SecondaryButton>
              </div>
            </div>
          }
        >
          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
              <FileText size={14} className="text-slate-400" /> Description
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed bg-white border border-slate-200 rounded-xl p-4">{detailProduct.description}</p>
          </div>

          {/* Technical Specs Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
              <Package size={14} className="text-slate-400" /> Technical Details
            </h4>
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div className="space-y-1">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Tag size={10} /> Category</span>
                <span className="text-sm font-semibold text-slate-700">{detailProduct.category}</span>
              </div>
              <div className="space-y-1">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Calendar size={10} /> Season</span>
                <span className="text-sm font-semibold text-slate-700">{detailProduct.season}</span>
              </div>
              <div className="space-y-1">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><User size={10} /> Created By</span>
                <span className="text-sm font-semibold text-slate-700">{detailProduct.createdBy}</span>
              </div>
              <div className="space-y-1">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Clock size={10} /> Last Modified</span>
                <span className="text-sm font-semibold text-slate-700">{detailProduct.lastModified}</span>
              </div>
            </div>
          </div>

          {/* Compliance Checklist */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
              <ShieldCheck size={14} className="text-slate-400" /> Readiness & Compliance
            </h4>
            <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
              {getComplianceItems(detailProduct).map((item) => (
                <div key={item.label} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${item.complete ? "bg-emerald-500" : "bg-rose-500"}`} />
                    <span className="text-sm text-slate-700">{item.label}</span>
                  </div>
                  <span className={`text-[11px] font-semibold ${item.complete ? "text-emerald-600" : "text-rose-600"}`}>{item.complete ? "Complete" : "Missing"}</span>
                </div>
              ))}
            </div>
          </div>
        </PageModal>
      )}

      {/* ---- ADD/EDIT PRODUCT FORM MODAL (PageModal + InputGroup + IconSelect) ---- */}
      <PageModal
        isOpen={isProductFormOpen}
        onClose={() => setIsProductFormOpen(false)}
        title={editingProduct ? "Edit Product" : "Add New Product"}
        subtitle={editingProduct ? `Editing ${editingProduct.sku}` : "Create a new product for this branch."}
        maxWidth="max-w-lg"
        footer={
          <div className="flex justify-end items-center gap-2 w-full">
            <SecondaryButton onClick={() => setIsProductFormOpen(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSaveProduct} className="!w-auto !py-2.5 !px-6 !text-xs !rounded-full">
              {editingProduct ? "Save Changes" : "Create Product"}
            </PrimaryButton>
          </div>
        }
      >
        <InputGroup
          id="product-name"
          label="Product Name *"
          placeholder="e.g. Classic Denim Jacket"
          icon={Package}
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
        />
        <InputGroup
          id="product-sku"
          label="Product Code / SKU *"
          placeholder="e.g. MNL-JKT-001"
          icon={Tag}
          value={formSku}
          onChange={(e) => setFormSku(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-4">
          <IconSelect
            label="Category *"
            value={formCategory}
            onChange={setFormCategory}
            options={CATEGORY_OPTIONS}
            placeholder="Select category"
          />
          <IconSelect
            label="Status"
            value={formStatus}
            onChange={setFormStatus}
            options={STATUS_OPTIONS}
            placeholder="Select status"
          />
        </div>
        <InputGroup
          id="product-season"
          label="Season"
          placeholder="e.g. FW 2026, SS 2026, Core"
          icon={Calendar}
          value={formSeason}
          onChange={(e) => setFormSeason(e.target.value)}
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="product-description" className="text-xs font-semibold text-slate-500 tracking-wide">Description</label>
          <textarea
            id="product-description"
            rows={3}
            placeholder="Product description..."
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            className="w-full px-4 py-3 text-sm font-medium bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 hover:border-slate-300 resize-none"
          />
        </div>

        {/* Branch field — auto-filled and disabled */}
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
          <Lock size={14} className="text-slate-400" />
          <span className="text-xs font-semibold text-slate-500">Branch: Manila (Fixed)</span>
        </div>
      </PageModal>

      {/* ---- BOM MATERIAL EDIT MODAL (PageModal + InputGroup) ---- */}
      {editingMaterial && (
        <PageModal
          isOpen={!!editingMaterial}
          onClose={() => setEditingMaterial(null)}
          title={`Edit Material: ${editingMaterial.name}`}
          subtitle={`Unit: ${editingMaterial.unit}`}
          maxWidth="max-w-sm"
          footer={
            <div className="flex justify-end items-center gap-2 w-full">
              <SecondaryButton onClick={() => setEditingMaterial(null)}>Cancel</SecondaryButton>
              <PrimaryButton onClick={handleSaveMaterial} className="!w-auto !py-2.5 !px-6 !text-xs !rounded-full">
                Save Changes
              </PrimaryButton>
            </div>
          }
        >
          <InputGroup
            id="mat-qty"
            label="Quantity"
            type="number"
            placeholder="Enter quantity"
            icon={Layers}
            value={matQty}
            onChange={(e) => setMatQty(e.target.value)}
          />
          <InputGroup
            id="mat-waste"
            label="Waste Percentage (%)"
            type="number"
            placeholder="Enter waste %"
            icon={AlertTriangle}
            value={matWaste}
            onChange={(e) => setMatWaste(e.target.value)}
          />
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs">
            <div className="flex justify-between mb-1">
              <span className="text-slate-500">Effective Qty:</span>
              <span className="font-bold text-slate-900">
                {(!isNaN(parseFloat(matQty)) && !isNaN(parseFloat(matWaste)))
                  ? (parseFloat(matQty) * (1 + parseFloat(matWaste) / 100)).toFixed(2)
                  : "—"}
              </span>
            </div>
          </div>
        </PageModal>
      )}

      {/* ---- REVISION DETAIL MODAL (DetailsModal) ---- */}
      {detailRevision && (
        <DetailsModal
          isOpen={!!detailRevision}
          onClose={() => setDetailRevision(null)}
          title={`Revision ${detailRevision.revisionNumber}`}
          itemId={detailRevision.id}
          headerIcon={
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <History size={20} />
            </div>
          }
          gridFields={[
            { label: "Product", value: detailRevision.product, icon: Package },
            { label: "Status", value: <StatusBadge status={detailRevision.status} />, icon: CheckCircle },
            { label: "Created By", value: detailRevision.createdBy, icon: User },
            { label: "Date", value: detailRevision.date, icon: Calendar },
          ]}
        >
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Change Summary</h4>
          <p className="text-sm text-slate-700 leading-relaxed">{detailRevision.changeSummary}</p>
        </DetailsModal>
      )}

      {/* ---- CONFIRMATION MODAL ---- */}
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

export default AdminPLMPage;
