import React from "react";
import type { LucideIcon } from "lucide-react";

interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon;
  ariaLabel?: string;
}

const SecondaryButton = ({
  children,
  onClick,
  icon: Icon,
  ariaLabel,
  className = "",
  ...props
}: SecondaryButtonProps) => {
  return (
    <button
      onClick={onClick}
      aria-label={
        ariaLabel || (typeof children === "string" ? children : "Button")
      }
      className={`
        flex items-center gap-2 
        bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 
        text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white 
        border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500
        text-xs font-semibold px-5 py-2.5 rounded-full 
        transition-all duration-200 
        shadow-sm hover:shadow-md 
        active:scale-95 active:bg-slate-100 dark:active:bg-slate-700
        focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-600 focus:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${className}
      `}
      {...props}
    >
      {Icon && (
        <Icon
          size={14}
          aria-hidden="true"
          className="text-slate-500 group-hover:text-slate-700"
        />
      )}
      {children}
    </button>
  );
};

export default SecondaryButton;
