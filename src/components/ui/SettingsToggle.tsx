// ==========================================
// SettingsToggle.tsx
// A labeled toggle row for settings pages.
// Combines a text label with the reusable
// ToggleSwitch in a flex row layout with a
// bottom border divider between items.
// Used in: SystemSettingsPage for security
// policies, workflow approvals, and alerts.
// ==========================================

import React from "react";
import ToggleSwitch from "./ToggleSwitch";

// ------------------------------------------
// Types
// ------------------------------------------
export interface SettingsToggleProps {
  /** The label text displayed on the left */
  label: string;
  /** Whether the toggle is currently on/off */
  checked: boolean;
  /** Callback when the toggle is flipped */
  onChange: (val: boolean) => void;
  /** Optional: description text below the label */
  description?: string;
}

// ------------------------------------------
// Component
// ------------------------------------------
const SettingsToggle: React.FC<SettingsToggleProps> = ({
  label,
  checked,
  onChange,
  description,
}) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
    <div className="flex-1 min-w-0 pr-4">
      <span className="text-xs font-medium text-slate-700">{label}</span>
      {description && (
        <p className="text-[10px] text-slate-400 mt-0.5">{description}</p>
      )}
    </div>
    <ToggleSwitch
      active={checked}
      onToggle={() => onChange(!checked)}
      label={`Toggle ${label}`}
    />
  </div>
);

export default SettingsToggle;
