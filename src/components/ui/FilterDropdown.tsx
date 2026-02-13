// ==========================================
// FilterDropdown.tsx
// A reusable filter button with a dropdown list of
// selectable options. Highlights the active filter
// and auto-closes after selection.
// ==========================================

import React, { useState } from "react";
import { Filter, ChevronDown } from "lucide-react";

// ------------------------------------------
// Types
// ------------------------------------------
export interface FilterDropdownProps {
  /** Array of filter option strings (e.g. ["All", "Pending", "Active"]) */
  options: string[];
  /** Currently selected filter value */
  selected: string;
  /** Callback when a filter option is chosen */
  onSelect: (option: string) => void;
  /** Optional custom label for the button (defaults to selected value) */
  label?: string;
}

// ------------------------------------------
// Component
// ------------------------------------------
const FilterDropdown: React.FC<FilterDropdownProps> = ({
  options,
  selected,
  onSelect,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Determine if a non-default filter is active (i.e. not starting with "All")
  const isFiltering = selected && !selected.startsWith("All");

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Filter options"
        className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 ${
          isOpen || isFiltering
            ? "bg-slate-900 text-white border-slate-900 shadow-md"
            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
        }`}
      >
        <Filter size={14} aria-hidden="true" />
        <span className="hidden sm:inline">{label || selected}</span>
        <ChevronDown
          size={12}
          aria-hidden="true"
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Invisible overlay to close on outside click */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Options List */}
          <div
            className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-20"
            role="listbox"
            aria-label="Filter options"
          >
            <div className="p-1.5 max-h-60 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option}
                  role="option"
                  aria-selected={selected === option}
                  onClick={() => {
                    onSelect(option);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    selected === option
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FilterDropdown;
