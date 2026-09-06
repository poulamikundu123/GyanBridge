"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus, AlertCircle } from "lucide-react";
import AuthBanner from "@/components/auth/AuthBanner";
import LoginForm from "@/components/auth/LoginForm";
import RegisterWizard from "@/components/auth/RegisterWizard";

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"LOGIN" | "REGISTER">("LOGIN");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuthSuccess = (redirectUrl: string) => {
    router.push(redirectUrl);
    router.refresh();
  };

  return (
    <div className="nz-grid-bg min-h-screen flex items-center justify-center p-4 sm:p-6 font-sans">
      <div
        style={{
          width: "100%",
          maxWidth: "1040px",
          minHeight: "640px",
          background: "var(--nz-surface)",
          borderRadius: "12px",
          boxShadow: "var(--nz-shadow-lg)",
          border: "1px solid var(--nz-border)",
          overflow: "hidden",
        }}
        className="flex flex-col md:flex-row my-auto"
      >
        {/* Left Brand Panel */}
        <AuthBanner />

        {/* Right Content Panel - Form */}
        <div
          style={{
            flex: "1 1 60%",
            background: "var(--nz-surface)",
            overflowY: "auto",
            maxHeight: "90vh",
          }}
          className="w-full flex flex-col justify-start"
        >
          {/* Main Mode Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/80">
            <button
              type="button"
              onClick={() => {
                setAuthMode("LOGIN");
                setError(null);
              }}
              className={`flex-1 py-3 px-3 text-xs font-medium flex items-center justify-center gap-1.5 transition border-b-2 cursor-pointer ${
                authMode === "LOGIN"
                  ? "border-slate-900 text-slate-950 bg-white font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode("REGISTER");
                setError(null);
              }}
              className={`flex-1 py-3 px-3 text-xs font-medium flex items-center justify-center gap-1.5 transition border-b-2 cursor-pointer ${
                authMode === "REGISTER"
                  ? "border-slate-900 text-slate-950 bg-white font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-3.5 rounded-[8px] bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {authMode === "LOGIN" && (
              <LoginForm
                onSuccess={handleAuthSuccess}
                onError={setError}
                onSwitchToRegister={() => {
                  setAuthMode("REGISTER");
                  setError(null);
                }}
                loading={loading}
                setLoading={setLoading}
              />
            )}

            {authMode === "REGISTER" && (
              <RegisterWizard
                onSuccess={handleAuthSuccess}
                onError={setError}
                onSwitchToLogin={() => {
                  setAuthMode("LOGIN");
                  setError(null);
                }}
                loading={loading}
                setLoading={setLoading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
