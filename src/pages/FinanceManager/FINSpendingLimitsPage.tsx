// ==========================================
// FINSpendingLimitsPage.tsx
// Finance Manager — Spending Limits & Thresholds
// Configure spending limit rules and approval thresholds.
// ==========================================

import React, { useState } from "react";
import FinanceLayout from "../../layout/FinanceLayout";
import PageModal from "../../components/ui/PageModal";
import Toast from "../../components/ui/Toast";
import IconSelect from "../../components/ui/IconSelect";
import InputGroup from "../../components/ui/InputGroup";
import SecondaryButton from "../../components/ui/SecondaryButton";
import PrimaryButton from "../../components/ui/PrimaryButton";
import {
  Plus,
  Edit,
  TrendingUp,
  Wallet,
  PieChart,
  Trash2,
  Clock,
  Info,
  Archive,
} from "lucide-react";
import type { IconSelectOption } from "../../components/ui/IconSelect";

// ------------------------------------------
// Types
// ------------------------------------------
type ConditionType = "Variance" | "Expense" | "Budget" | "Waste" | "Labor";

interface ThresholdRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  type: ConditionType;
  thresholdValue: string;
  enabled: boolean;
}

// ------------------------------------------
// Mock data
// ------------------------------------------
const initialRules: ThresholdRule[] = [
  {
    id: "r1",
    name: "Variance Approval Threshold",
    description: "Requires Finance Manager approval when budget variance exceeds the threshold.",
    condition: "If variance > 10% → requires Finance Manager approval",
    type: "Variance",
    thresholdValue: "10%",
    enabled: true,
  },
  {
    id: "r2",
    name: "Large Expense Approval",
    description: "Single expense entries above this amount require approval before posting.",
    condition: "If single expense entry > ₱50,000 → requires approval",
    type: "Expense",
    thresholdValue: "₱50,000",
    enabled: true,
  },
  {
    id: "r3",
    name: "Budget Overspend Alert",
    description: "Triggers an alert when budget utilization approaches or exceeds the threshold.",
    condition: "If utilization > 90% → trigger alert",
    type: "Budget",
    thresholdValue: "90%",
    enabled: true,
  },
  {
    id: "r4",
    name: "Waste Cost Threshold",
    description: "Flags production batches for review when waste rate exceeds threshold.",
    condition: "If waste rate > 5% of production cost → flag for review",
    type: "Waste",
    thresholdValue: "5%",
    enabled: true,
  },
  {
    id: "r5",
    name: "Overtime Labor Cap",
    description: "Monthly overtime labor above this amount requires approval.",
    condition: "If overtime labor > ₱25,000/month → requires approval",
    type: "Labor",
    thresholdValue: "₱25,000/month",
    enabled: false,
  },
  {
    id: "r6",
    name: "Period Lock Reminder",
    description: "Automatically reminds when a period remains open past the configured days.",
    condition: "Auto-remind if period open > 15 days after close",
    type: "Budget",
    thresholdValue: "15 days",
    enabled: true,
  },
];

const conditionTypeOptions: IconSelectOption[] = [
  { value: "Variance", label: "Variance", icon: TrendingUp },
  { value: "Expense", label: "Expense", icon: Wallet },
  { value: "Budget", label: "Budget", icon: PieChart },
  { value: "Waste", label: "Waste", icon: Trash2 },
  { value: "Labor", label: "Labor", icon: Clock },
];

// ------------------------------------------
// Component
// ------------------------------------------
const FINSpendingLimitsPage: React.FC = () => {
  const [rules, setRules] = useState<ThresholdRule[]>(initialRules);
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [editingRule, setEditingRule] = useState<ThresholdRule | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form state for Add/Edit modal
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formConditionType, setFormConditionType] = useState<ConditionType>("Variance");
  const [formThresholdValue, setFormThresholdValue] = useState("");
  const [formCondition, setFormCondition] = useState("");

  const openAddModal = () => {
    setFormName("");
    setFormDescription("");
    setFormConditionType("Variance");
    setFormThresholdValue("");
    setFormCondition("");
    setModalMode("add");
  };

  const openEditModal = (rule: ThresholdRule) => {
    setEditingRule(rule);
    setFormName(rule.name);
    setFormDescription(rule.description);
    setFormConditionType(rule.type);
    setFormThresholdValue(rule.thresholdValue);
    setFormCondition(rule.condition);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingRule(null);
  };

  const handleSaveRule = () => {
    if (!formName.trim() || !formThresholdValue.trim()) {
      setToast({ message: "Rule name and threshold value are required.", type: "error" });
      return;
    }
    const conditionText = formCondition.trim() || `If ${formConditionType.toLowerCase()} exceeds ${formThresholdValue} → requires approval`;
    if (modalMode === "add") {
      const newRule: ThresholdRule = {
        id: `r${Date.now()}`,
        name: formName.trim(),
        description: formDescription.trim(),
        condition: conditionText,
        type: formConditionType,
        thresholdValue: formThresholdValue.trim(),
        enabled: true,
      };
      setRules((prev) => [newRule, ...prev]);
      setToast({ message: "Rule added successfully.", type: "success" });
    } else if (editingRule) {
      setRules((prev) =>
        prev.map((r) =>
          r.id === editingRule.id
            ? {
                ...r,
                name: formName.trim(),
                description: formDescription.trim(),
                condition: conditionText,
                type: formConditionType,
                thresholdValue: formThresholdValue.trim(),
              }
            : r
        )
      );
      setToast({ message: "Rule updated successfully.", type: "success" });
    }
    closeModal();
  };

  const handleToggleEnabled = (rule: ThresholdRule) => {
    setRules((prev) =>
      prev.map((r) => (r.id === rule.id ? { ...r, enabled: !r.enabled } : r))
    );
    setToast({
      message: rule.enabled ? "Rule disabled." : "Rule enabled.",
      type: "success",
    });
  };


  const getTypeBadgeColor = (type: ConditionType) => {
    const map: Record<ConditionType, string> = {
      Variance: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
      Expense: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
      Budget: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
      Waste: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
      Labor: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    };
    return map[type];
  };

  return (
    <FinanceLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Spending Limits & Thresholds
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure spending limit rules and approval thresholds.
          </p>
        </div>
        <SecondaryButton icon={Plus} onClick={openAddModal}>
          Add Rule
        </SecondaryButton>
      </div>

      <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl mb-6">
        <p className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium flex items-center gap-2">
          <Info size={14} />
          Threshold rules control when approvals or alerts are triggered. Enable or disable rules as needed.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        <div className="p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`p-4 rounded-xl border transition-colors ${
                rule.enabled
                  ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                  : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-75"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {rule.name}
                </h3>
                <span
                  className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold ${getTypeBadgeColor(rule.type)}`}
                >
                  {rule.type}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 line-clamp-2">
                {rule.description}
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mb-3 flex items-center gap-1">
                <span className="text-slate-400">Condition:</span> {rule.condition}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4">
                Threshold: <span className="font-semibold text-slate-700 dark:text-slate-300">{rule.thresholdValue}</span>
              </p>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  role="switch"
                  aria-checked={rule.enabled}
                  aria-label={rule.enabled ? "Disable rule" : "Enable rule"}
                  onClick={() => handleToggleEnabled(rule)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                    rule.enabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                  }`}
                >
                  <span
                    className={`absolute top-1 inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                      rule.enabled ? "left-7" : "left-1"
                    }`}
                  />
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(rule)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => {
                      setRules((prev) => prev.filter((x) => x.id !== rule.id));
                      setToast({ message: "Record archived successfully", type: "success" });
                    }}
                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                    title="Archive"
                  >
                    <Archive size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Rule Modal */}
      <PageModal
        isOpen={!!modalMode}
        onClose={closeModal}
        title={modalMode === "add" ? "Add Rule" : "Edit Rule"}
        subtitle={modalMode === "edit" ? editingRule?.name : ""}
        footer={
          <div className="flex items-center gap-3">
            <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSaveRule} className="!w-auto min-w-[120px]">
              {modalMode === "add" ? "Add Rule" : "Save Changes"}
            </PrimaryButton>
          </div>
        }
      >
        <div className="space-y-4">
          <InputGroup
            id="rule-name"
            label="Rule name"
            placeholder="e.g. Variance Approval Threshold"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />
          <InputGroup
            id="rule-desc"
            label="Description"
            placeholder="Brief description of the rule..."
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
          />
          <IconSelect
            label="Condition type"
            value={formConditionType}
            onChange={(v) => setFormConditionType(v as ConditionType)}
            options={conditionTypeOptions}
            placeholder="Select type"
          />
          <InputGroup
            id="rule-threshold"
            label="Threshold value"
            placeholder="e.g. 10%, ₱50,000, 90%"
            value={formThresholdValue}
            onChange={(e) => setFormThresholdValue(e.target.value)}
          />
          <InputGroup
            id="rule-condition"
            label="Condition (optional)"
            placeholder="e.g. If variance > 10% → requires approval"
            value={formCondition}
            onChange={(e) => setFormCondition(e.target.value)}
          />
        </div>
      </PageModal>

    </FinanceLayout>
  );
};

export default FINSpendingLimitsPage;
