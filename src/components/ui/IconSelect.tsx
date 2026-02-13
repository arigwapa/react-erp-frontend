// ==========================================
// IconSelect.tsx
// A modern custom dropdown select that supports
// optional icons per option. Features rounded corners,
// chevron animation, click-outside-to-close, and a
// checkmark on the selected item.
// Used in: Role modals (Add/Edit) for scope selection.
// ==========================================

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";

// ------------------------------------------
// Types
// ------------------------------------------

/** Shape of each dropdown option */
export interface IconSelectOption {
  /** Unique value identifier */
  value: string;
  /** Display label */
  label: string;
  /** Optional Lucide icon component */
  icon?: React.ElementType;
}

export interface IconSelectProps {
  /** Optional label displayed above the dropdown */
  label?: string;
  /** Currently selected value */
  value: string;
  /** Callback when a new option is selected */
  onChange: (val: string) => void;
  /** Array of selectable options */
  options: IconSelectOption[];
  /** Placeholder text when nothing is selected */
  placeholder?: string;
}

// ------------------------------------------
// Component
// ------------------------------------------
const IconSelect: React.FC<IconSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
}) => {
  // Controls dropdown visibility
  const [isOpen, setIsOpen] = useState(false);
  // Ref for click-outside detection
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside the component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Find the currently selected option object for display
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Optional Label */}
      {label && (
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium bg-white border rounded-xl outline-none transition-all duration-200 ${
          isOpen
            ? "border-slate-300 ring-2 ring-slate-300 shadow-sm"
            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
        }`}
      >
        {/* Selected value display (with optional icon) */}
        <div className="flex items-center gap-2 text-slate-700">
          {selectedOption?.icon && (
            <selectedOption.icon size={14} className="text-slate-500" />
          )}
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
        </div>

        {/* Chevron with rotation animation */}
        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Options Panel */}
      {isOpen && (
        <div
          className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          role="listbox"
        >
          <div className="p-1.5 max-h-48 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={value === option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium rounded-lg transition-colors text-left ${
                  value === option.value
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {/* Option icon */}
                {option.icon && (
                  <option.icon
                    size={14}
                    className={
                      value === option.value
                        ? "text-slate-700"
                        : "text-slate-400"
                    }
                  />
                )}

                {/* Option label — left-aligned, truncates long text */}
                <span className="text-left flex-1 truncate">{option.label}</span>

                {/* Checkmark for selected option */}
                {value === option.value && (
                  <Check
                    size={12}
                    className="ml-auto text-emerald-500"
                    strokeWidth={3}
                    aria-hidden="true"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IconSelect;
