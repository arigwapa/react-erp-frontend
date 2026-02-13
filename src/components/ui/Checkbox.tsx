import React from "react";
import { Check } from "lucide-react";

/**
 * Component: Checkbox
 * Purpose: Custom styled checkbox (since default browser checkboxes are hard to style).
 */
interface CheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}
const Checkbox: React.FC<CheckboxProps> = ({
  id,
  label,
  checked,
  onChange,
}) => (
  <div
    className="flex items-center gap-2 cursor-pointer"
    onClick={() => onChange(!checked)}
  >
    {/* Custom Box */}
    <div
      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 
      ${checked ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-300 text-transparent hover:border-indigo-400"}`}
    >
      <Check size={14} strokeWidth={3} />
    </div>
    {/* Label Text */}
    <label
      htmlFor={id}
      className="text-sm font-medium text-slate-600 cursor-pointer select-none"
    >
      {label}
    </label>
  </div>
);

export default Checkbox;
