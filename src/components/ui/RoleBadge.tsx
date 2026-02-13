import React from "react";

interface RoleBadgeProps {
  role: string;
}

const RoleBadge = ({ role }: RoleBadgeProps) => {
  // 1. Define color mappings based on department or hierarchy
  const getRoleStyle = (roleName: string) => {
    const normalizedRole = roleName.toLowerCase();

    // Admin / Super User (Purple/Indigo)
    if (normalizedRole.includes("admin")) {
      return "bg-purple-50 text-purple-700";
    }

    // Quality Assurance (Amber/Orange)
    if (normalizedRole.includes("qa") || normalizedRole.includes("quality")) {
      return "bg-amber-50 text-amber-700";
    }

    // Finance (Emerald/Green)
    if (
      normalizedRole.includes("finance") ||
      normalizedRole.includes("account")
    ) {
      return "bg-emerald-50 text-emerald-700";
    }

    // Production / Operations (Blue/Sky)
    if (
      normalizedRole.includes("production") ||
      normalizedRole.includes("operation")
    ) {
      return "bg-sky-50 text-sky-700";
    }

    // Default / General Staff (Slate/Gray)
    return "bg-slate-50 text-slate-600";
  };

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-md 
        text-xs font-bold capitalize
        ${getRoleStyle(role)}
      `}
    >
      {role}
    </span>
  );
};

export default RoleBadge;
