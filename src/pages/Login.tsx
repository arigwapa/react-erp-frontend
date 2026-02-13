import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";

// Import your custom components
import GlassAuthLayout from "../layout/GlassAuthLayout";
import InputGroup from "../components/ui/InputGroup";
import PrimaryButton from "../components/ui/PrimaryButton";
import Checkbox from "../components/ui/Checkbox";
import BrandLogo from "../components/ui/BrandLogo";

const Login = () => {
  const navigate = useNavigate();

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle Login Logic
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API Call (Fake delay)
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to Dashboard after "login"
      navigate("/dashboard");
    }, 2000);
  };

  return (
    <GlassAuthLayout>
      {/* 1. Header Section */}
      <div className="mb-8 text-center sm:text-left">
        <BrandLogo className="mb-6 justify-center sm:justify-start" />
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome back</h1>
        <p className="text-slate-500">Please enter your details to sign in.</p>
      </div>

      {/* 2. Login Form */}
      <form onSubmit={handleLogin} className="space-y-6">
        {/* Inputs */}
        <div className="space-y-4">
          <InputGroup
            id="email"
            label="Email Address"
            type="email"
            placeholder="enter@email.com"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <InputGroup
            id="password"
            label="Password"
            isPassword={true} // Enables the eye toggle
            placeholder="••••••••"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <Checkbox
            id="remember"
            label="Remember for 30 days"
            checked={rememberMe}
            onChange={setRememberMe}
          />
          <a
            href="/forgot-password"
            onClick={(e) => {
              e.preventDefault();
              navigate("/forgot-password");
            }}
            // Updated color below:
            className="text-xs font-bold text-[#000047] hover:opacity-80 transition-opacity"
          >
            Forgot Password?
          </a>
        </div>

        {/* Submit Button */}
        <PrimaryButton onClick={handleLogin} isLoading={isLoading}>
          <span className="flex items-center justify-center gap-2">
            Sign in <ArrowRight size={18} />
          </span>
        </PrimaryButton>
      </form>
    </GlassAuthLayout>
  );
};

export default Login;
