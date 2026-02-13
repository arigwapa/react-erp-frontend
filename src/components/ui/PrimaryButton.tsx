import React from "react";

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: React.ReactNode;
  icon?: any;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  isLoading,
  children,
  className = "",
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      className={`
        w-full 
        bg-slate-900 hover:bg-slate-800 
        text-white font-bold py-3.5 rounded-xl 
        shadow-lg shadow-slate-900/20 
        transition-all 
        disabled:opacity-70 disabled:cursor-not-allowed 
        flex items-center justify-center gap-2 
        ${className}
      `}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
};

export default PrimaryButton;
