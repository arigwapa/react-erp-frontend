// ==========================================
// SystemSettingsPage.tsx
// Admin page for configuring security policies,
// workflow approvals, and master data (the system
// dictionary). Uses the same modern TabBar design
// as NotificationsPage and reusable UI components
// from components/ui/ for consistency.
// ==========================================

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  Shield,
  GitBranch,
  Database,
  Save,
  Lock,
  Clock,
  UserCheck,
  AlertTriangle,
  Plus,
  Edit2,
  X,
  Info,
} from "lucide-react";

// ==========================================
// SECTION 1: REUSABLE COMPONENT IMPORTS
// All shared UI components from components/ui/
// ==========================================
import MainLayout from "../../layout/MainLayout";
import { Card } from "../../components/ui/Card";
import PrimaryButton from "../../components/ui/PrimaryButton";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Toast from "../../components/ui/Toast";
import TabBar from "../../components/ui/TabBar";
import ToggleSwitch from "../../components/ui/ToggleSwitch";
import SettingsToggle from "../../components/ui/SettingsToggle";
import IconSelect from "../../components/ui/IconSelect";
import { StatusBadge } from "../../components/ui/StatusBadge";
import SecondaryButton from "../../components/ui/SecondaryButton";

// ==========================================
// SECTION 2: TYPES & INTERFACES
// ==========================================

type TabType = "security" | "workflow" | "master-data";

type MasterDataCategory =
  | "categories"
  | "sizes"
  | "colors"
  | "units"
  | "materials";

interface MasterDataItem {
  id: string;
  name: string;
  code?: string;
  status: "Active" | "Inactive";
}

interface SecuritySettings {
  passwordMinLength: number;
  requireUppercase: boolean;
  requireNumbers: boolean;
  requireSpecial: boolean;
  sessionTimeout: string; // stored as string for IconSelect compatibility
  lockoutEnabled: boolean;
  maxFailedAttempts: number;
  lockoutDuration: string; // stored as string for IconSelect compatibility
  twoFactorEnabled: boolean;
}

interface WorkflowSettings {
  approvals: {
    plm: boolean;
    quality: boolean;
    warehouse: boolean;
    finance: boolean;
  };
  autoApproveStock: {
    enabled: boolean;
    threshold: number;
  };
  alerts: {
    highValueStock: boolean;
    budgetExceeded: boolean;
  };
}

// ==========================================
// SECTION 3: CONSTANTS & MOCK DATA
// ==========================================

/** Tab definitions for the TabBar component */
const TABS = [
  { id: "security", label: "Security", icon: Shield },
  { id: "workflow", label: "Workflow", icon: GitBranch },
  { id: "master-data", label: "Master Data", icon: Database },
];

/** Options for Session Timeout dropdown */
const SESSION_TIMEOUT_OPTIONS = [
  { value: "15", label: "15 Minutes" },
  { value: "30", label: "30 Minutes" },
  { value: "60", label: "1 Hour" },
  { value: "120", label: "2 Hours" },
];

/** Options for Lockout Duration dropdown */
const LOCKOUT_DURATION_OPTIONS = [
  { value: "5", label: "5 Minutes" },
  { value: "15", label: "15 Minutes" },
  { value: "30", label: "30 Minutes" },
  { value: "60", label: "1 Hour" },
];

/** Initial mock master data records */
const INITIAL_MASTER_DATA: Record<MasterDataCategory, MasterDataItem[]> = {
  categories: [
    { id: "1", name: "Dresses", status: "Active" },
    { id: "2", name: "Tops", status: "Active" },
  ],
  sizes: [
    { id: "1", name: "Small", code: "S", status: "Active" },
    { id: "2", name: "Medium", code: "M", status: "Active" },
  ],
  colors: [
    { id: "1", name: "Black", code: "#000", status: "Active" },
    { id: "2", name: "Navy", code: "#000080", status: "Active" },
  ],
  units: [
    { id: "1", name: "Pieces", code: "PCS", status: "Active" },
    { id: "2", name: "Meters", code: "M", status: "Active" },
  ],
  materials: [
    { id: "1", name: "Cotton", status: "Active" },
    { id: "2", name: "Polyester", status: "Active" },
  ],
};

// ==========================================
// SECTION 4: MAIN PAGE COMPONENT
// ==========================================
export default function SystemSettingsPage() {
  // ------------------------------------------
  // 4a. State — Tabs
  // ------------------------------------------
  const [activeTab, setActiveTab] = useState<TabType>("security");

  // ------------------------------------------
  // 4b. State — Feedback (Toast + Confirmation)
  // ------------------------------------------
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // ------------------------------------------
  // 4c. State — Security Settings
  // ------------------------------------------
  const [security, setSecurity] = useState<SecuritySettings>({
    passwordMinLength: 10,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecial: false,
    sessionTimeout: "30",
    lockoutEnabled: true,
    maxFailedAttempts: 5,
    lockoutDuration: "15",
    twoFactorEnabled: false,
  });

  // ------------------------------------------
  // 4d. State — Workflow Settings
  // ------------------------------------------
  const [workflow, setWorkflow] = useState<WorkflowSettings>({
    approvals: {
      plm: true,
      quality: true,
      warehouse: false,
      finance: true,
    },
    autoApproveStock: {
      enabled: true,
      threshold: 5,
    },
    alerts: {
      highValueStock: true,
      budgetExceeded: true,
    },
  });

  // ------------------------------------------
  // 4e. State — Master Data
  // ------------------------------------------
  const [masterData, setMasterData] =
    useState<Record<MasterDataCategory, MasterDataItem[]>>(INITIAL_MASTER_DATA);

  /** Master data modal state */
  const [mdModal, setMdModal] = useState<{
    isOpen: boolean;
    category: MasterDataCategory | null;
    item: MasterDataItem | null;
  }>({
    isOpen: false,
    category: null,
    item: null,
  });

  /** Form fields for the master data modal */
  const [mdFormName, setMdFormName] = useState("");
  const [mdFormCode, setMdFormCode] = useState("");
  const [mdFormStatus, setMdFormStatus] = useState<"Active" | "Inactive">(
    "Active",
  );

  // ------------------------------------------
  // 4f. Handlers
  // ------------------------------------------

  /** Display a toast notification */
  const triggerToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  /** Open the save-confirmation modal for security or workflow settings */
  const requestSaveSettings = (type: "security" | "workflow") => {
    setConfirmModal({
      isOpen: true,
      title: `Save ${type === "security" ? "Security" : "Workflow"} Settings?`,
      message:
        "These changes will apply system-wide immediately. Are you sure you want to proceed?",
      onConfirm: () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        triggerToast(
          `${type === "security" ? "Security" : "Workflow"} settings saved successfully.`,
          "success",
        );
      },
    });
  };

  // ------------------------------------------
  // 4g. Master Data CRUD Handlers
  // ------------------------------------------

  /** Open the add/edit modal for a master data item */
  const openMasterDataModal = (
    category: MasterDataCategory,
    item: MasterDataItem | null,
  ) => {
    setMdModal({ isOpen: true, category, item });
    setMdFormName(item?.name || "");
    setMdFormCode(item?.code || "");
    setMdFormStatus(item?.status || "Active");
  };

  /** Save master data item (add or edit) */
  const saveMasterData = () => {
    if (!mdFormName || !mdModal.category) return;

    setMasterData((prev) => {
      const list = [...prev[mdModal.category!]];

      if (mdModal.item) {
        // Edit existing item
        const index = list.findIndex((i) => i.id === mdModal.item!.id);
        if (index > -1) {
          list[index] = {
            ...mdModal.item!,
            name: mdFormName,
            code: mdFormCode,
            status: mdFormStatus,
          };
        }
      } else {
        // Add new item
        list.push({
          id: Date.now().toString(),
          name: mdFormName,
          code: mdFormCode,
          status: mdFormStatus,
        });
      }
      return { ...prev, [mdModal.category!]: list };
    });

    setMdModal({ isOpen: false, category: null, item: null });
    triggerToast("Master data updated successfully.", "success");
  };

  // ==========================================
  // SECTION 5: JSX RENDER
  // ==========================================
  return (
    <MainLayout>
      {/* ---- TOAST NOTIFICATION ---- */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ---- CONFIRMATION MODAL ---- */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant="primary"
        confirmText="Confirm Save"
      />

      <div className="max-w-6xl mx-auto space-y-6 pb-20">
        {/* ---- PAGE HEADER ---- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              System Settings
            </h1>
            <p className="text-slate-500 text-xs font-medium mt-1">
              Configure security policies, workflow approvals, and master data
              for all modules.
            </p>
          </div>
          {/* Info badge — subtle reminder about system-wide impact */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold border border-indigo-100">
            <Info size={12} />
            Changes apply system-wide
          </div>
        </div>

        {/* ---- TAB BAR ---- */}
        {/* Uses reusable TabBar component (same design as NotificationsPage) */}
        <TabBar
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as TabType)}
        />

        {/* ==========================================
            TAB 1: SECURITY SETTINGS
            ========================================== */}
        {activeTab === "security" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ---- Password Policy Card ---- */}
              <Card className="p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Lock size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Password Policy
                  </h3>
                </div>

                <div className="space-y-5">
                  {/* Minimum Length Input */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                      Minimum Password Length
                    </label>
                    <input
                      type="number"
                      value={security.passwordMinLength}
                      onChange={(e) =>
                        setSecurity({
                          ...security,
                          passwordMinLength: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 transition-all"
                      aria-label="Minimum password length"
                    />
                  </div>

                  {/* Complexity Requirements — uses SettingsToggle */}
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                      Complexity Requirements
                    </p>
                    <div className="bg-slate-50 rounded-xl px-4 border border-slate-100">
                      <SettingsToggle
                        label="Require Uppercase Letters"
                        checked={security.requireUppercase}
                        onChange={(val) =>
                          setSecurity({ ...security, requireUppercase: val })
                        }
                      />
                      <SettingsToggle
                        label="Require Numbers"
                        checked={security.requireNumbers}
                        onChange={(val) =>
                          setSecurity({ ...security, requireNumbers: val })
                        }
                      />
                      <SettingsToggle
                        label="Require Special Characters"
                        checked={security.requireSpecial}
                        onChange={(val) =>
                          setSecurity({ ...security, requireSpecial: val })
                        }
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* ---- Right Column: Session + Lockout ---- */}
              <div className="space-y-6">
                {/* Session Settings Card */}
                <Card className="p-6">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Clock size={16} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Session Settings
                    </h3>
                  </div>

                  {/* Session Timeout — uses reusable IconSelect */}
                  <IconSelect
                    label="Session Timeout (Inactivity)"
                    value={security.sessionTimeout}
                    onChange={(val) =>
                      setSecurity({ ...security, sessionTimeout: val })
                    }
                    options={SESSION_TIMEOUT_OPTIONS}
                    placeholder="Select timeout"
                  />
                </Card>

                {/* Account Lockout Card */}
                <Card className="p-6">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                      <UserCheck size={16} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Account Lockout
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {/* Enable Lockout Toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-700">
                        Enable Lockout on Failed Logins
                      </span>
                      <ToggleSwitch
                        active={security.lockoutEnabled}
                        onToggle={() =>
                          setSecurity({
                            ...security,
                            lockoutEnabled: !security.lockoutEnabled,
                          })
                        }
                        label="Toggle lockout"
                      />
                    </div>

                    {/* Lockout settings — visible only when enabled */}
                    {security.lockoutEnabled && (
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                        {/* Max Attempts */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                            Max Attempts
                          </label>
                          <input
                            type="number"
                            value={security.maxFailedAttempts}
                            onChange={(e) =>
                              setSecurity({
                                ...security,
                                maxFailedAttempts:
                                  parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 transition-all"
                            aria-label="Maximum failed login attempts"
                          />
                        </div>

                        {/* Lock Duration — uses reusable IconSelect */}
                        <IconSelect
                          label="Lock Duration"
                          value={security.lockoutDuration}
                          onChange={(val) =>
                            setSecurity({ ...security, lockoutDuration: val })
                          }
                          options={LOCKOUT_DURATION_OPTIONS}
                          placeholder="Select duration"
                        />
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>

            {/* ---- 2FA Banner ---- */}
            {/* Full-width dark card for visual emphasis */}
            <Card className="!bg-gradient-to-r !from-slate-800 !to-slate-900 !border-slate-700 p-6 text-white">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Shield size={16} className="text-emerald-400" />
                    Two-Factor Authentication (2FA)
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Require all users to verify identity via Email OTP or
                    Authenticator App.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-300">
                    {security.twoFactorEnabled ? "Enabled" : "Disabled"}
                  </span>
                  <ToggleSwitch
                    active={security.twoFactorEnabled}
                    onToggle={() =>
                      setSecurity({
                        ...security,
                        twoFactorEnabled: !security.twoFactorEnabled,
                      })
                    }
                    label="Toggle Two-Factor Authentication"
                  />
                </div>
              </div>
            </Card>

            {/* ---- Action Buttons ---- */}
            <div className="flex justify-end pt-2 gap-3">
              <button
                onClick={() =>
                  triggerToast("Settings reset to defaults.", "success")
                }
                className="px-5 py-2.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl transition-all"
              >
                Reset to Default
              </button>
              <PrimaryButton
                onClick={() => requestSaveSettings("security")}
                className="!w-auto !py-2.5 !px-5 !text-xs !rounded-xl"
              >
                <Save size={14} />
                Save Security Settings
              </PrimaryButton>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 2: WORKFLOW SETTINGS
            ========================================== */}
        {activeTab === "workflow" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ---- Approval Rules Card ---- */}
              <Card className="p-6 h-fit">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <UserCheck size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Approval Rules (Maker-Checker)
                  </h3>
                </div>
                <p className="text-[10px] text-slate-500 mb-5 ml-1">
                  Enable to require a second person to approve actions.
                </p>

                {/* Toggle rows for each module — uses SettingsToggle */}
                <div className="bg-slate-50 rounded-xl px-4 border border-slate-100">
                  <SettingsToggle
                    label="PLM: Product Release"
                    checked={workflow.approvals.plm}
                    onChange={(val) =>
                      setWorkflow((prev) => ({
                        ...prev,
                        approvals: { ...prev.approvals, plm: val },
                      }))
                    }
                  />
                  <SettingsToggle
                    label="Quality: Inspection Results"
                    checked={workflow.approvals.quality}
                    onChange={(val) =>
                      setWorkflow((prev) => ({
                        ...prev,
                        approvals: { ...prev.approvals, quality: val },
                      }))
                    }
                  />
                  <SettingsToggle
                    label="Warehouse: Stock Adjustments"
                    checked={workflow.approvals.warehouse}
                    onChange={(val) =>
                      setWorkflow((prev) => ({
                        ...prev,
                        approvals: { ...prev.approvals, warehouse: val },
                      }))
                    }
                  />
                  <SettingsToggle
                    label="Finance: Budget & Period Lock"
                    checked={workflow.approvals.finance}
                    onChange={(val) =>
                      setWorkflow((prev) => ({
                        ...prev,
                        approvals: { ...prev.approvals, finance: val },
                      }))
                    }
                  />
                </div>
              </Card>

              {/* ---- Right Column: Auto-Approval + Alerts ---- */}
              <div className="space-y-6">
                {/* Auto-Approval Rules Card */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                        <AlertTriangle size={16} />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Auto-Approval Rules
                      </h3>
                    </div>
                    <span className="text-[10px] bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full font-bold border border-amber-100">
                      Caution
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* Auto-approve toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-700">
                        Auto-approve Stock Adjustments
                      </span>
                      <ToggleSwitch
                        active={workflow.autoApproveStock.enabled}
                        onToggle={() =>
                          setWorkflow((prev) => ({
                            ...prev,
                            autoApproveStock: {
                              ...prev.autoApproveStock,
                              enabled: !prev.autoApproveStock.enabled,
                            },
                          }))
                        }
                        label="Toggle auto-approve stock"
                      />
                    </div>

                    {/* Threshold — visible only when enabled */}
                    {workflow.autoApproveStock.enabled && (
                      <div className="pl-4 border-l-2 border-emerald-100 mt-3">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                          Threshold (Units)
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-600">Below</span>
                          <input
                            type="number"
                            value={workflow.autoApproveStock.threshold}
                            onChange={(e) =>
                              setWorkflow((prev) => ({
                                ...prev,
                                autoApproveStock: {
                                  ...prev.autoApproveStock,
                                  threshold: parseInt(e.target.value) || 0,
                                },
                              }))
                            }
                            className="w-20 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-center outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 transition-all"
                            aria-label="Auto-approval threshold"
                          />
                          <span className="text-xs text-slate-600">units</span>
                        </div>
                        <p className="text-[10px] text-amber-600 mt-2 flex items-center gap-1">
                          <AlertTriangle size={10} />
                          Reduces manual control. Use with caution.
                        </p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Admin Alerts Card */}
                <Card className="p-6">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                      <AlertTriangle size={16} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Admin Alerts
                    </h3>
                  </div>

                  <div className="bg-slate-50 rounded-xl px-4 border border-slate-100">
                    <SettingsToggle
                      label="Notify on High-Value Adjustments"
                      checked={workflow.alerts.highValueStock}
                      onChange={(val) =>
                        setWorkflow((prev) => ({
                          ...prev,
                          alerts: { ...prev.alerts, highValueStock: val },
                        }))
                      }
                    />
                    <SettingsToggle
                      label="Notify on Budget Exceeded"
                      checked={workflow.alerts.budgetExceeded}
                      onChange={(val) =>
                        setWorkflow((prev) => ({
                          ...prev,
                          alerts: { ...prev.alerts, budgetExceeded: val },
                        }))
                      }
                    />
                  </div>
                </Card>
              </div>
            </div>

            {/* ---- Action Buttons ---- */}
            <div className="flex justify-end pt-2 gap-3">
              <button
                onClick={() =>
                  triggerToast("Workflow settings reset.", "success")
                }
                className="px-5 py-2.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl transition-all"
              >
                Reset to Default
              </button>
              <PrimaryButton
                onClick={() => requestSaveSettings("workflow")}
                className="!w-auto !py-2.5 !px-5 !text-xs !rounded-xl"
              >
                <Save size={14} />
                Save Workflow Settings
              </PrimaryButton>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 3: MASTER DATA
            ========================================== */}
        {activeTab === "master-data" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Explanatory note */}
            <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <Info size={14} className="text-slate-400 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-500">
                Manage the dropdown values used across the ERP. These act as the
                system dictionary for categories, sizes, colors, units, and
                materials.
              </p>
            </div>

            {/* Master Data Category Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(Object.keys(masterData) as MasterDataCategory[]).map(
                (category) => (
                  <Card
                    key={category}
                    className="flex flex-col h-[420px] overflow-hidden"
                  >
                    {/* Card Header — title + SecondaryButton */}
                    <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        {category}
                      </h3>
                      <SecondaryButton
                        onClick={() => openMasterDataModal(category, null)}
                        icon={Plus}
                        ariaLabel={`Add item to ${category}`}
                        className="!px-3 !py-1.5 !text-[10px]"
                      >
                        Add New Item
                      </SecondaryButton>
                    </div>

                    {/* Card Body — scrollable table */}
                    <div className="flex-1 overflow-y-auto">
                      <table
                        className="w-full text-left text-xs"
                        aria-label={`List of ${category}`}
                      >
                        {/* Column Titles */}
                        <thead className="bg-slate-50/80 sticky top-0 z-10">
                          <tr>
                            <th className="px-5 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-5 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">
                              Status
                            </th>
                            <th className="px-5 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left w-16">
                              Edit
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {masterData[category].map((item) => (
                            <tr key={item.id}>
                              <td className="px-5 py-3">
                                <div className="font-semibold text-slate-800 text-xs">
                                  {item.name}
                                </div>
                                {item.code && (
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                    {item.code}
                                  </div>
                                )}
                              </td>
                              <td className="px-5 py-3 text-left">
                                <StatusBadge status={item.status} />
                              </td>
                              <td className="px-5 py-3 text-left">
                                <button
                                  onClick={() =>
                                    openMasterDataModal(category, item)
                                  }
                                  className="text-slate-400 p-1"
                                  aria-label={`Edit ${item.name}`}
                                >
                                  <Edit2 size={12} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                ),
              )}
            </div>
          </div>
        )}
      </div>

      {/* ==========================================
          SECTION 6: MODALS
          ========================================== */}

      {/* ---- MASTER DATA ADD/EDIT MODAL ---- */}
      {/* Consistent modal design matching UserManagement & BranchManagement */}
      {mdModal.isOpen && createPortal(
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {mdModal.item ? "Edit Item" : "Add New Item"}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5 capitalize">
                  in {mdModal.category}
                </p>
              </div>
              <button
                onClick={() => setMdModal({ ...mdModal, isOpen: false })}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors p-2 rounded-full"
                aria-label="Close modal"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {/* Modal Body — vertically stacked fields */}
            <div className="p-6 space-y-5">
              {/* Name field */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={mdFormName}
                  onChange={(e) => setMdFormName(e.target.value)}
                  placeholder="e.g. Extra Large"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 transition-all placeholder:text-slate-400"
                  autoFocus
                />
              </div>

              {/* Code field (optional) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                  Code (Optional)
                </label>
                <input
                  type="text"
                  value={mdFormCode}
                  onChange={(e) => setMdFormCode(e.target.value)}
                  placeholder="e.g. XL"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Status field — uses ToggleSwitch */}
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                  Status
                </span>
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
                  <ToggleSwitch
                    active={mdFormStatus === "Active"}
                    onToggle={() =>
                      setMdFormStatus(
                        mdFormStatus === "Active" ? "Inactive" : "Active",
                      )
                    }
                    label="Toggle item status"
                  />
                  <span
                    className={`text-xs font-semibold ${
                      mdFormStatus === "Active"
                        ? "text-emerald-600"
                        : "text-slate-500"
                    }`}
                  >
                    {mdFormStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer — Cancel + Save */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setMdModal({ ...mdModal, isOpen: false })}
                className="px-5 py-2.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl transition-all"
              >
                Cancel
              </button>
              <PrimaryButton
                onClick={saveMasterData}
                className="!w-auto !py-2.5 !px-5 !text-xs !rounded-xl"
              >
                {mdModal.item ? "Save Changes" : "Add Item"}
              </PrimaryButton>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </MainLayout>
  );
}
