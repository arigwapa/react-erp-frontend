// components/ui/RoleScopeBadge.tsx
import React from "react";
import { Globe, MapPin, HelpCircle } from "lucide-react";

interface RoleScopeBadgeProps {
  scope: string; // accepting string to handle "global" | "branch"
  className?: string;
}

const RoleScopeBadge = ({ scope, className = "" }: RoleScopeBadgeProps) => {
  const normalizedScope = scope.toLowerCase();

  // 1. Configuration for Global Scope
  if (normalizedScope === "global") {
    return (
      <span
        className={`
          inline-flex items-center gap-1 whitespace-nowrap text-left.5 px-2.5 py-0.5 rounded-full 
          text-xs font-bold
          bg-blue-50 text-blue-700
          ${className}
        `}
      >
        <Globe size={12} strokeWidth={2.5} />
        Global
      </span>
    );
  }

  // 2. Configuration for Branch Scope
  if (normalizedScope === "branch") {
    return (
      <span
        className={`
          inline-flex items-center gap-1 whitespace-nowrap text-left.5 px-2.5 py-0.5 rounded-full 
          text-xs font-bold
          bg-amber-50 text-amber-700
          ${className}
        `}
      >
        <MapPin size={12} strokeWidth={2.5} />
        Branch
      </span>
    );
  }

  // 3. Fallback for unknown scopes
  return (
    <span
      className={`
        inline-flex items-center gap-1 whitespace-nowrap text-left.5 px-2.5 py-0.5 rounded-full 
        text-xs font-bold capitalize
        bg-slate-50 text-slate-600
        ${className}
      `}
    >
      <HelpCircle size={12} />
      {scope}
    </span>
  );
};

export default RoleScopeBadge;
