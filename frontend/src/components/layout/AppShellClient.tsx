"use client";

import { useState, useEffect, ReactNode } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";

interface AppShellClientProps {
  children: ReactNode;
  user: {
    name?: string;
    email: string;
    role: "STUDENT" | "INDUSTRY" | "FACULTY" | "INSTITUTION";
  };
}

export default function AppShellClient({ children, user }: AppShellClientProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const pathname = usePathname();

  // Listen for global custom event if needed
  useEffect(() => {
    const handleCustomToggle = () => {
      console.log("[AppShellClient] Custom toggle event received");
      setIsMobileNavOpen((prev) => !prev);
    };
    window.addEventListener("toggle-ayush-mobile-nav", handleCustomToggle);
    return () => window.removeEventListener("toggle-ayush-mobile-nav", handleCustomToggle);
  }, []);

  // Automatically close mobile nav on route change
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileNavOpen]);

  const toggleMobileNav = () => {
    console.log("[AppShellClient] toggleMobileNav called, current state:", isMobileNavOpen);
    setIsMobileNavOpen((prev) => !prev);
  };

  return (
    <div className="h-screen flex flex-col bg-[#fafafa] overflow-hidden relative" data-mobile-drawer-open={isMobileNavOpen ? "true" : "false"}>
      {/* Mobile Navigation Drawer Overlay (Visible on < lg when open) */}
      {isMobileNavOpen && (
        <div id="mobile-navigation-drawer" className="fixed inset-0 z-[100] lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={(e) => {
              e.stopPropagation();
              setIsMobileNavOpen(false);
            }}
            aria-hidden="true"
          />

          {/* Slide-in Drawer Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-200"
          >
            {/* Mobile Drawer Header with Close Button */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
              <span className="text-xs font-heading font-bold text-slate-800 uppercase tracking-wider">
                Menu Navigation
              </span>
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 transition cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sidebar Content inside Drawer */}
            <div className="flex-1 overflow-y-auto">
              <Sidebar
                role={user.role}
                onNavigate={() => setIsMobileNavOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        user={user}
        onToggleMobileNav={toggleMobileNav}
        isMobileNavOpen={isMobileNavOpen}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Static Sidebar (Visible on lg: 1024px+) */}
        <div className="hidden lg:flex shrink-0 h-full">
          <Sidebar role={user.role} />
        </div>

        {/* Main Viewport Content Area */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 lg:p-8 max-w-7xl w-full mx-auto flex flex-col justify-between">
          <div className="flex-1">
            {children}
          </div>

          {/* Universal Footer - Made by Team HackHer */}
          <footer className="mt-8 sm:mt-12 pt-5 pb-4 border-t border-slate-200/80 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-slate-600 text-[11px] sm:text-xs">
              <span className="font-semibold text-slate-800">AYUSHAI</span>
              <span className="text-slate-300">•</span>
              <span className="truncate">Skill Intelligence & Academia–Industry Platform</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white border border-emerald-200/80 shadow-2xs text-[11px] sm:text-xs">
              <span className="text-slate-600">Made with <span className="text-rose-500 font-bold">♥</span> by</span>
              <span className="font-bold text-emerald-800 tracking-wide">Team HackHer</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
