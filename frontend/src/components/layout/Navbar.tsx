"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf, LogOut, ChevronDown, Award, UserCheck, Menu, X, Search } from "lucide-react";
import NotificationBell from "./NotificationBell";

interface NavbarProps {
  user?: {
    name?: string;
    email: string;
    role: "STUDENT" | "INDUSTRY" | "FACULTY" | "INSTITUTION";
  } | null;
  onToggleMobileNav?: () => void;
  isMobileNavOpen?: boolean;
}

export default function Navbar({ user, onToggleMobileNav, isMobileNavOpen }: NavbarProps) {
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Keyboard shortcut for command palette (Ctrl+K or Cmd+K) and Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "STUDENT":
        return { label: "Student", bg: "bg-[#edfce9] text-[#003c33] border-[#a7f3d0]" };
      case "INDUSTRY":
        return { label: "Industry Partner", bg: "bg-[#f1f5ff] text-[#1863dc] border-[#bae6fd]" };
      case "FACULTY":
        return { label: "Faculty / Academia", bg: "bg-[#f5f3ff] text-[#7c3aed] border-[#ddd6fe]" };
      case "INSTITUTION":
        return { label: "Institution Admin", bg: "bg-[#fffbeb] text-[#b45309] border-[#fde68a]" };
      default:
        return { label: "Guest", bg: "bg-slate-100 text-slate-700 border-slate-300" };
    }
  };

  const roleInfo = getRoleBadge(user?.role);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Emblem + Mobile Menu Button */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {onToggleMobileNav && (
              <button
                type="button"
                id="mobile-drawer-toggle"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("[Navbar] Hamburger clicked, invoking onToggleMobileNav");
                  onToggleMobileNav();
                }}
                className="p-2 -ml-1 mr-1 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-slate-100 lg:hidden transition cursor-pointer relative z-50 pointer-events-auto"
                aria-label={isMobileNavOpen ? "Close navigation drawer" : "Open navigation drawer"}
              >
                {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[8px] bg-[#003c33] flex items-center justify-center text-white shadow-xs group-hover:bg-[#044e43] transition shrink-0">
                <Leaf className="w-4 h-4 text-emerald-200" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-medium text-sm sm:text-base tracking-tight text-slate-950">
                    AYUSH<span className="text-[#003c33]">AI</span>
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase hidden md:block">
                  Skill Intelligence Platform
                </p>
              </div>
            </Link>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Dynamic Date display */}
            <span className="text-[11px] font-mono text-slate-400 hidden md:inline-block tracking-wide">
              {(() => {
                const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const d = new Date();
                return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
              })()}
            </span>

            {/* Mobile Search Button (< sm) */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 sm:hidden transition cursor-pointer"
              aria-label="Search or ask AYUSHAI"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Desktop Search / Command Palette trigger (sm+) */}
            <div
              className="relative w-44 lg:w-48 cursor-pointer hidden sm:block"
              onClick={() => setIsSearchOpen(true)}
              title="Search or ask AYUSHAI (⌘K)"
            >
              <input
                type="text"
                placeholder="Ask AYUSHAI..."
                readOnly
                className="w-full h-8 pl-7 pr-12 rounded-[8px] border border-slate-200 bg-slate-50 text-xs text-slate-700 outline-none cursor-pointer hover:border-slate-300 hover:bg-white transition"
              />
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="absolute left-2.5 top-2.5 text-slate-400"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <kbd className="absolute right-1.5 top-1 text-[9px] font-mono font-medium text-slate-400 bg-white border border-slate-200 rounded-[4px] px-1.5 py-0.5">
                ⌘K
              </kbd>
            </div>

            {user ? (
              <>
                <NotificationBell />

                {/* Profile Pill */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 sm:gap-2 p-1 rounded-[8px] hover:bg-slate-100 transition border border-transparent hover:border-slate-200 cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-[6px] bg-[#003c33] text-white font-medium text-xs flex items-center justify-center shadow-xs shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div className="text-left hidden lg:block">
                      <div className="text-xs font-medium text-slate-900 leading-tight truncate max-w-[120px]">{user.name}</div>
                      <div className={`text-[9px] font-medium px-1.5 py-0.2 rounded-[4px] border inline-block font-mono ${roleInfo.bg}`}>
                        {roleInfo.label}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-60 max-w-[calc(100vw-2rem)] bg-white rounded-[12px] shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-120">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <div className="text-xs font-medium text-slate-900">{user.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                        <div className={`text-[9px] font-medium px-1.5 py-0.5 rounded-[4px] border inline-block mt-1 font-mono ${roleInfo.bg}`}>
                          {roleInfo.label}
                        </div>
                      </div>

                      {user.role === "STUDENT" && (
                        <Link
                          href="/student/portfolio"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Award className="w-3.5 h-3.5 text-emerald-600" />
                          My Digital Portfolio
                        </Link>
                      )}

                      <div className="pt-1 mt-1 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 text-left transition cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-[8px] bg-[#17171c] hover:bg-[#282830] text-white text-xs font-medium shadow-xs transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Command Palette / Search Modal Dialog */}
      {isSearchOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSearchOpen(false);
          }}
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-center items-start pt-24 px-4"
        >
          <div className="w-full max-w-lg bg-white rounded-[12px] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-120">
            {/* Search Input Row */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search navigation or ask AYUSHAI..."
                autoFocus
                className="flex-1 border-0 bg-transparent text-xs text-slate-900 outline-none font-medium"
              />
              <kbd
                onClick={() => setIsSearchOpen(false)}
                className="text-[9px] font-mono font-medium text-slate-500 bg-slate-100 border border-slate-200 rounded-[4px] px-1.5 py-0.5 cursor-pointer"
              >
                ESC
              </kbd>
            </div>

            {/* List options */}
            <div className="p-2 space-y-1">
              {[
                { label: "Take Career Readiness Assessment", href: "/student/assessment" },
                { label: "Resume & AI Career Coach", href: "/student/resume" },
                { label: "Open Career Goal Explorer", href: "/student/careers" },
                { label: "Inspect Skill Radar & Priority Gaps", href: "/student/skills" },
                { label: "View Personalized Learning Roadmaps", href: "/student/learning" },
                { label: "Browse Matched Industry Opportunities", href: "/student/opportunities" },
                { label: "View Verified Digital Portfolio", href: "/student/portfolio" },
              ].map((item, idx) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsSearchOpen(false)}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`flex items-center justify-between px-3 py-2 rounded-[8px] text-xs font-medium transition ${
                    hoveredIndex === idx
                      ? "bg-slate-100 text-[#003c33]"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Jump →</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
