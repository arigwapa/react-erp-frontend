import React from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  return (
    <div className="group relative flex items-center justify-center">
      {children}
      <div className="absolute bottom-full mb-2 hidden group-hover:block w-max px-2 py-1 bg-slate-800 text-white text-xs rounded shadow-lg z-50 animate-in fade-in duration-200">
        {content}
        {/* Tiny Triangle Pointer */}
        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-slate-800"></div>
      </div>
    </div>
  );
};

export default Tooltip;
