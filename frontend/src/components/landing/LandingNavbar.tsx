"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X, LogIn } from "lucide-react";

interface LandingNavbarProps {
  currentUser?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  } | null;
}

export default function LandingNavbar({ currentUser }: LandingNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardUrl = () => {
    if (!currentUser?.role) return "/login";
    switch (currentUser.role) {
      case "STUDENT":
        return "/student/dashboard";
      case "INDUSTRY":
        return "/industry/dashboard";
      case "FACULTY":
        return "/faculty/dashboard";
      case "INSTITUTION":
        return "/institution/dashboard";
      default:
        return "/student/dashboard";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            style={{
              background: "#003c33",
              color: "#ffffff",
              width: "34px",
              height: "34px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "1.05rem",
            }}
            className="shadow-xs group-hover:scale-105 transition-transform"
          >
            A
          </div>
          <div>
            <div className="font-heading font-semibold text-base text-slate-900 leading-none tracking-tight">
              AYUSHAI
            </div>
            <div className="text-[9px] font-mono tracking-wider uppercase text-emerald-700 font-semibold mt-0.5">
              Skill Intelligence Platform
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-600">
          <a
            href="#ecosystem"
            className="hover:text-emerald-900 transition-colors"
          >
            Ecosystem
          </a>
          <a
            href="#personas"
            className="hover:text-emerald-900 transition-colors"
          >
            Personas
          </a>
          <a
            href="#capabilities"
            className="hover:text-emerald-900 transition-colors"
          >
            Core Engines
          </a>
          <a
            href="#workflow"
            className="hover:text-emerald-900 transition-colors"
          >
            How It Works
          </a>
          <a
            href="#metrics"
            className="hover:text-emerald-900 transition-colors"
          >
            Impact
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[8px] bg-[#003c33] hover:bg-[#002c25] text-white text-xs font-semibold transition shadow-xs cursor-pointer active:translate-y-[0.5px]"
          >
            <span>Sign In / Login</span>
            <LogIn className="w-3.5 h-3.5 text-emerald-300" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-700">
            <a
              href="#ecosystem"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-slate-50"
            >
              Ecosystem
            </a>
            <a
              href="#personas"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-slate-50"
            >
              Personas
            </a>
            <a
              href="#capabilities"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-slate-50"
            >
              Core Engines
            </a>
            <a
              href="#workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-slate-50"
            >
              How It Works
            </a>
            <a
              href="#metrics"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-slate-50"
            >
              Impact
            </a>
          </nav>
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/login"
              className="w-full text-center py-2.5 rounded-[8px] bg-[#003c33] text-white text-xs font-semibold flex items-center justify-center gap-2"
            >
              <span>Sign In / Login</span>
              <LogIn className="w-3.5 h-3.5 text-emerald-300" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
