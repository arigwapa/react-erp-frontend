import React, { useState } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
/**
 * Component: InputGroup
 * Purpose: A standard text/password input field with label, icon, and focus effects.
 * Logic: Handles its own 'Show Password' toggle state.
 */
interface InputGroupProps {
  id: string; // Unique ID for accessibility (label-to-input connection)
  label: string; // Text shown above input
  type?: string; // 'text', 'email', 'password'
  placeholder?: string; // Hint text inside input
  icon?: LucideIcon; // Icon component from lucide-react
  value: string; // Controlled value from parent state
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Handler for typing
  isPassword?: boolean; // If true, adds the Eye/EyeOff toggle button
  disabled?: boolean; // If true, input is read-only
}
const InputGroup: React.FC<InputGroupProps> = ({
  id,
  label,
  type = "text",
  placeholder,
  icon: Icon,
  value,
  onChange,
  isPassword = false,
  disabled = false,
}) => {
  // Local state to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  // Local state to highlight the border when user clicks inside
  const [isFocused, setIsFocused] = useState(false);

  // Determine actual input type based on toggle state
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1.5 mb-5 group">
      {/* Label: Changes color when input is focused */}
      <label
        htmlFor={id}
        className={`text-xs font-semibold tracking-wide transition-colors duration-200 ${isFocused ? "text-indigo-600" : "text-slate-500"}`}
      >
        {label}
      </label>

      {/* Input Container: Handles the border, background, and blur effects */}
      <div
        className={`relative flex items-center bg-white/50 backdrop-blur-sm border rounded-xl transition-all duration-300 ${isFocused ? "border-indigo-500 ring-4 ring-indigo-500/10 shadow-sm" : "border-slate-200 hover:border-slate-300"}`}
      >
        {/* Left Icon (optional) */}
        {Icon && (
          <div className="pl-4 text-slate-400">
            <Icon size={18} />
          </div>
        )}

        {/* The actual HTML Input */}
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className="w-full bg-transparent border-none py-3 px-3 text-slate-700 placeholder:text-slate-400 focus:outline-none text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
          placeholder={placeholder}
        />

        {/* Right Icon: Password Toggle (only if isPassword is true) */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="pr-4 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default InputGroup;
