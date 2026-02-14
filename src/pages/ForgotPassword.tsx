import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Mail } from "lucide-react";
import GlassAuthLayout from "../layout/GlassAuthLayout";
import BrandLogo from "../components/ui/BrandLogo";

// 1. Import your custom UI components
// (Adjust the path if your files are in 'components' instead of 'components/ui')
import InputGroup from "../components/ui/InputGroup";
import PrimaryButton from "../components/ui/PrimaryButton";

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple Validation
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    // Mock API Call
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <GlassAuthLayout>
      <div className="w-full max-w-md mx-auto">
        {/* Page Header */}
        <div className="mb-8 text-left">
          <div className="mb-6">
            <BrandLogo />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Reset Password
          </h1>
          <p className="text-slate-500 text-sm">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit}>
            {/* Error Banner */}
            {error && (
              <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm font-medium animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                {error}
              </div>
            )}

            {/* --- REPLACED WITH INPUT GROUP --- */}
            <InputGroup
              label="Work Email"
              type="email"
              placeholder="e.g. example@weave-apparel.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(""); // Clear error when typing
              }}
              icon={Mail} // Passes the Lucide Icon component
              id={""}
            />

            {/* --- REPLACED WITH PRIMARY BUTTON --- */}
            <PrimaryButton type="submit" isLoading={isLoading} className="mt-2">
              Send Reset Link
            </PrimaryButton>

            {/* Back to Login Link */}
            {/* Back to Login Link */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => navigate("/")}
                // Updated color below:
                className="text-sm font-bold text-[#000047] hover:opacity-80 transition-opacity flex items-center justify-center gap-2 mx-auto group"
              >
                <ArrowLeft
                  size={16}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                Back to Sign In
              </button>
            </div>
          </form>
        ) : (
          /* Success View (No changes needed here) */
          <div className="text-center py-8 animate-fade-in-up">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
              <Check size={32} strokeWidth={3} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              Check your email
            </h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              We've sent a password reset link to <br />
              <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                {email}
              </span>
            </p>
            <button
              onClick={() => navigate("/")}
              className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-2 mx-auto group"
            >
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </GlassAuthLayout>
  );
};

export default ForgotPasswordPage;
