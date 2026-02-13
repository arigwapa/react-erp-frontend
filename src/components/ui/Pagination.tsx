import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalItems,
  onPageChange,
  className = "",
}) => {
  // If no items, don't render the footer
  if (totalItems === 0) return null;

  return (
    <div
      className={`bg-slate-50/50 px-6 py-3 border-t border-slate-200 flex items-center justify-between transition-all ${className}`}
    >
      {/* Left Side: Counter */}
      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
        {startIndex + 1} - {endIndex} of {totalItems}
      </span>

      {/* Right Side: Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Go to previous page"
          className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-white rounded-md border border-transparent hover:border-slate-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-slate-200"
        >
          <ChevronLeft size={14} aria-hidden="true" />
        </button>

        <span
          className="text-xs font-bold text-slate-700 px-2 min-w-[3rem] text-center"
          aria-current="page"
        >
          Showing {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Go to next page"
          className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-white rounded-md border border-transparent hover:border-slate-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-slate-200"
        >
          <ChevronRight size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
