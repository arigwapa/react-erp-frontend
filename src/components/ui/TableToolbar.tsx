import React from "react";
import { Search, Filter, ChevronDown, Plus } from "lucide-react";
import PrimaryButton from "./PrimaryButton";

interface TableToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (isOpen: boolean) => void;
  onAdd?: () => void; // Pass this function to show the button
  filterLabel?: string;
  placeholder?: string;
  children?: React.ReactNode;
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
  searchQuery,
  setSearchQuery,
  isFilterOpen,
  setIsFilterOpen,
  onAdd,
  filterLabel = "Filters",
  placeholder = "Search...",
  children,
}) => {
  return (
    // MAIN CONTAINER: "justify-between" pushes the two child divs apart (Left vs Right)
    <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
      {/* ================= LEFT SIDE (Search + Filter) ================= */}
      <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
        {/* 1. Search Input */}
        <div className="relative group flex-1 sm:flex-none">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors"
            size={14}
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder={placeholder}
            aria-label="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-4 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-full outline-none focus:bg-white focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* 2. Filter Button */}
        <div className="relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 ${
              isFilterOpen
                ? "bg-slate-900 text-white border-slate-900 shadow-md"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Filter size={14} aria-hidden="true" />
            <span>{filterLabel}</span>
            <ChevronDown
              size={12}
              className={`transition-transform duration-200 ${
                isFilterOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Filter Dropdown Body */}
          {isFilterOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-20 overflow-hidden">
              {children}
            </div>
          )}
        </div>
      </div>

      {/* ================= RIGHT SIDE (Add Button) ================= */}
      {/* This is the location you are looking for. It is outside the Left Side div. */}
      {onAdd && (
        <div className="w-full sm:w-auto">
          <PrimaryButton
            onClick={onAdd}
            className="w-full sm:w-auto !rounded-full !py-2 !px-4 !text-xs shadow-md"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add Branch</span>
          </PrimaryButton>
        </div>
      )}
    </div>
  );
};
