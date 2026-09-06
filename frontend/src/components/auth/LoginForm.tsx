"use client";

import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  GraduationCap,
  Building2,
  Microscope,
  Landmark,
} from "lucide-react";

interface LoginFormProps {
  onSuccess: (redirectUrl: string) => void;
  onError: (msg: string) => void;
  onSwitchToRegister: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export default function LoginForm({
  onSuccess,
  onError,
  onSwitchToRegister,
  loading,
  setLoading,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        onSuccess(data.redirectUrl || data.redirect_url || "/student/dashboard");
      } else {
        const errorMsg = typeof data.detail === "string" ? data.detail : data.error || data.message || "Invalid credentials provided";
        onError(errorMsg);
        setLoading(false);
      }
    } catch {
      onError("Network or server connection issue");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <div className="text-center pb-2">
        <h2 className="font-heading font-medium text-lg text-slate-900">Welcome Back</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Sign in with your email address to access your role dashboard
        </p>
      </div>

      <div>
        <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 mb-1.5">
          Email Address
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. name@example.com"
            className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-300 rounded-[8px] focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 mb-1.5">
          Password
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-10 pr-10 py-2.5 text-xs border border-slate-300 rounded-[8px] focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-[8px] bg-[#17171c] hover:bg-[#282830] text-white font-medium text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:translate-y-[0.5px] disabled:opacity-60"
        >
          {loading ? (
            <span>Authenticating...</span>
          ) : (
            <>
              <span>Sign In to AYUSH Platform</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      <div className="pt-2 border-t border-slate-100">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2 text-center">
          Quick Demo Accounts (Click to Fill)
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              setEmail("student@demo.com");
              setPassword("password123");
            }}
            className="p-2 rounded-[8px] border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 font-medium text-left transition cursor-pointer"
          >
            <div className="font-bold text-[11px] flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Student</span>
            </div>
            <div className="text-[10px] text-emerald-700 font-mono">student@demo.com</div>
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("industry@demo.com");
              setPassword("password123");
            }}
            className="p-2 rounded-[8px] border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-900 font-medium text-left transition cursor-pointer"
          >
            <div className="font-bold text-[11px] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span>Industry</span>
            </div>
            <div className="text-[10px] text-blue-700 font-mono">industry@demo.com</div>
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("faculty@demo.com");
              setPassword("password123");
            }}
            className="p-2 rounded-[8px] border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-900 font-medium text-left transition cursor-pointer"
          >
            <div className="font-bold text-[11px] flex items-center gap-1.5">
              <Microscope className="w-3.5 h-3.5 text-purple-700 shrink-0" />
              <span>Faculty</span>
            </div>
            <div className="text-[10px] text-purple-700 font-mono">faculty@demo.com</div>
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("admin@demo.com");
              setPassword("password123");
            }}
            className="p-2 rounded-[8px] border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-900 font-medium text-left transition cursor-pointer"
          >
            <div className="font-bold text-[11px] flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>Institution</span>
            </div>
            <div className="text-[10px] text-amber-700 font-mono">admin@demo.com</div>
          </button>
        </div>
      </div>

      <div className="pt-2 text-center">
        <p className="text-xs text-slate-500">
          New to AYUSHAI?{" "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-medium text-[#003c33] hover:underline cursor-pointer"
          >
            Create an account now
          </button>
        </p>
      </div>
    </form>
  );
}
