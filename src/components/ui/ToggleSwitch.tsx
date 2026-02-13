import React from "react";

interface ToggleSwitchProps {
  active: boolean;
  onToggle: () => void;
  label: string;
  className?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  active,
  onToggle,
  label,
  className = "",
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={active}
    aria-label={label}
    onClick={onToggle}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${
      active ? "bg-emerald-500" : "bg-slate-200"
    } ${className}`}
  >
    <span
      className={`${
        active ? "translate-x-4" : "translate-x-1"
      } inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm`}
    />
  </button>
);

export default ToggleSwitch;
