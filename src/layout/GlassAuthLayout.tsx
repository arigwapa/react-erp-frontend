import React from "react";
import { Activity, ShieldCheck } from "lucide-react";
import FloatingWidget from "../components/ui/FloatingWidget";
// Import the image variable
import backgroundImg from "../assets/background.png";
/**
 * Component: GlassAuthLayout
 * Purpose: The main shell. It holds the background blobs, the split-screen card,
 * and handles responsiveness (stacking on mobile, side-by-side on desktop).
 */
interface GlassAuthLayoutProps {
  children: React.ReactNode; // The content of the Right Side (Forms)
}
const GlassAuthLayout: React.FC<GlassAuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-[#f3f4f6] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* --- Ambient Background Decorations (The blurred blobs) --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-200/30 rounded-full blur-[120px]" />

      {/* --- Main Glass Card Container --- */}
      <div className="w-full max-w-[1100px] bg-white/60 backdrop-blur-2xl border border-white/50 rounded-[32px] shadow-2xl shadow-slate-200/50 flex flex-col md:flex-row overflow-hidden relative z-10">
        {/* --- LEFT SIDE: Visuals & Illustration (Hidden on Mobile) --- */}
        <div className="hidden md:flex md:w-5/12 relative bg-slate-50 overflow-hidden group">
          {/* Background Image with Hover Zoom Effect */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] ease-linear group-hover:scale-110"
            style={{ backgroundImage: `url(${backgroundImg})` }}
          />
          {/* Dark Gradient Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-indigo-900/10 mix-blend-multiply" />

          {/* Content Layer (Text & Widgets) */}
          <div className="relative z-10 w-full h-full flex flex-col justify-between p-8">
            {/* Badge */}
            <div className="bg-white/20 backdrop-blur-md w-fit px-3 py-1 rounded-full border border-white/10">
              <span className="text-white text-xs font-medium tracking-wider">
                WEAVE ERP V1.0
              </span>
            </div>

            {/* Animated Widgets */}
            <FloatingWidget
              icon={Activity}
              title="Production Live"
              subtitle="Line A: 98% Efficiency"
              className="top-1/3 -right-6 animate-pulse-slow"
            />
            <FloatingWidget
              icon={ShieldCheck}
              title="Quality Control"
              subtitle="Defect Rate: < 0.01%"
              className="bottom-1/3 -left-6"
            />

            {/* Bottom Text */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2 shadow-sm">
                Seamless Lifecycle.
              </h2>
              <p className="text-slate-200 text-sm font-medium leading-relaxed max-w-[80%]">
                Connect design, production, and quality data in one unified
                platform.
              </p>
            </div>
          </div>
        </div>

        {/* --- RIGHT SIDE: Form Content (Injected via children prop) --- */}
        <div className="w-full md:w-7/12 p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative bg-white/40">
          {children}
        </div>
      </div>
    </div>
  );
};

export default GlassAuthLayout;
