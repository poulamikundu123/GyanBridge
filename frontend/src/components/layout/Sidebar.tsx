"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  Target,
  Compass,
  BookOpen,
  Briefcase,
  FileCheck,
  Award,
  Users,
  Building2,
  PlusCircle,
  BarChart3,
  Network,
  School,
  FileText,
  UserCheck,
} from "lucide-react";

interface SidebarProps {
  role: "STUDENT" | "INDUSTRY" | "FACULTY" | "INSTITUTION";
  onNavigate?: () => void;
}

interface NavSection {
  heading: string;
  tone: "indigo" | "violet" | "amber" | "cyan";
  items: Array<{
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  }>;
}

export default function Sidebar({ role, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  const studentSections: NavSection[] = [
    {
      heading: "STUDY & READINESS",
      tone: "indigo",
      items: [
        { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/student/assessment", label: "Skill Assessment", icon: Target },
        { href: "/student/skills", label: "Skill Profile & Gaps", icon: BarChart3 },
      ],
    },
    {
      heading: "CAREER & LEARNING",
      tone: "violet",
      items: [
        { href: "/student/careers", label: "Career Explorer", icon: Compass },
        { href: "/student/resume", label: "Resume & AI Career Coach", icon: FileText },
        { href: "/student/learning", label: "Personalized Learning", icon: BookOpen },
        { href: "/student/opportunities", label: "Opportunities", icon: Briefcase },
      ],
    },
    {
      heading: "NETWORK & PORTFOLIO",
      tone: "amber",
      items: [
        { href: "/student/applications", label: "Applications", icon: FileCheck },
        { href: "/student/mentorship", label: "Mentorship", icon: Users },
        { href: "/student/portfolio", label: "Digital Portfolio", icon: Award },
        { href: "/student/onboarding", label: "Profile Settings", icon: GraduationCap },
      ],
    },
  ];

  const industrySections: NavSection[] = [
    {
      heading: "COMMAND & POSTING",
      tone: "indigo",
      items: [
        { href: "/industry/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/industry/opportunities/create", label: "Post Opportunity", icon: PlusCircle },
        { href: "/industry/opportunities", label: "Manage Opportunities", icon: Briefcase },
      ],
    },
    {
      heading: "TALENT & TRAINING",
      tone: "cyan",
      items: [
        { href: "/industry/candidates", label: "Applicants & Candidates", icon: Users },
        { href: "/industry/training", label: "Training Programs", icon: BookOpen },
      ],
    },
    {
      heading: "COLLABORATION",
      tone: "violet",
      items: [
        { href: "/industry/collaboration", label: "Research Projects", icon: Network },
        { href: "/industry/profile", label: "Organization Profile", icon: Building2 },
      ],
    },
  ];

  const facultySections: NavSection[] = [
    {
      heading: "ACADEMIC WORKSPACE",
      tone: "indigo",
      items: [
        { href: "/faculty/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/faculty/mentorship", label: "Student Mentorship", icon: Users },
      ],
    },
    {
      heading: "RESEARCH & OPPORTUNITIES",
      tone: "cyan",
      items: [
        { href: "/faculty/opportunities", label: "Faculty Opportunities (FDP)", icon: Briefcase },
        { href: "/faculty/research", label: "Research Collaboration", icon: Network },
        { href: "/faculty/profile", label: "Faculty Profile", icon: School },
      ],
    },
  ];

  const institutionSections: NavSection[] = [
    {
      heading: "COMMAND CENTER",
      tone: "indigo",
      items: [
        { href: "/institution/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/institution/demand", label: "Industry Demand Intelligence", icon: BarChart3 },
      ],
    },
    {
      heading: "COHORT & PLACEMENTS",
      tone: "cyan",
      items: [
        { href: "/institution/students", label: "Student Cohort Analytics", icon: Users },
        { href: "/institution/placements", label: "Placements & Internships", icon: FileCheck },
      ],
    },
    {
      heading: "INSTITUTIONAL PARTNERSHIPS",
      tone: "violet",
      items: [
        { href: "/institution/collaborations", label: "Institutional Partnerships", icon: Network },
        { href: "/institution/reports", label: "Accreditation Reports", icon: FileText },
      ],
    },
  ];

  let sections = studentSections;
  let title = "Student Workspace";
  if (role === "INDUSTRY") {
    sections = industrySections;
    title = "Industry Workspace";
  } else if (role === "FACULTY") {
    sections = facultySections;
    title = "Faculty Workspace";
  } else if (role === "INSTITUTION") {
    sections = institutionSections;
    title = "Institution Workspace";
  }

  const getToneColors = (tone: "indigo" | "violet" | "amber" | "cyan") => {
    switch (tone) {
      case "violet":
        return { accent: "#7C3AED", soft: "#F5F3FF", border: "#DDD6FE" };
      case "amber":
        return { accent: "#D97706", soft: "#FFFBEB", border: "#FDE68A" };
      case "cyan":
        return { accent: "#0891B2", soft: "#ECFEFF", border: "#A5F3FC" };
      case "indigo":
      default:
        return { accent: "#4F46E5", soft: "#EEF2FF", border: "#C7D2FE" };
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 h-full overflow-hidden select-none">
      {/* Workspace Header Tag */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
          {title}
        </span>
        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
      </div>

      {/* Grouped Navigation Sections */}
      <nav className="p-2.5 space-y-2.5 flex-1 overflow-y-auto">
        {sections.map((section) => {
          const colors = getToneColors(section.tone);

          return (
            <div key={section.heading}>
              <div className="font-heading font-medium text-[9.5px] text-slate-400 tracking-wider mb-1 px-2.5 uppercase">
                {section.heading}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== "/student/dashboard" && item.href !== "/industry/dashboard" && item.href !== "/faculty/dashboard" && item.href !== "/institution/dashboard" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      style={{
                        ...(isActive
                          ? {
                              background: colors.soft,
                              color: colors.accent,
                              borderColor: colors.border,
                              boxShadow: `inset 3px 0 0 ${colors.accent}`,
                            }
                          : {}),
                      }}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[7px] text-xs transition duration-120 ${
                        isActive
                          ? "font-medium border"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-normal border border-transparent"
                      }`}
                    >
                      <Icon
                        className="w-3.5 h-3.5 shrink-0"
                        style={{
                          color: isActive ? colors.accent : undefined,
                        }}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Account / Active Persona Footer */}
      <div className="p-2.5 mx-2.5 mb-1.5 rounded-[10px] bg-slate-50 border border-slate-200/80 text-xs text-slate-600 shrink-0">
        <div className="flex items-center gap-2 font-medium text-slate-900 mb-0.5">
          <div className="w-4.5 h-4.5 rounded-[5px] bg-[#003c33] text-white text-[9.5px] font-mono font-medium flex items-center justify-center shrink-0">
            {role[0]}
          </div>
          <span className="text-[10.5px] font-medium font-heading">Active Workspace</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-tight">
          Role: <strong className="text-slate-800">{role}</strong> • Switch: <kbd className="font-mono text-[8.5px] px-1 py-0.5 bg-white border border-slate-200 rounded">Alt+D</kbd>
        </p>
      </div>

      {/* Persistent Team HackHer Attribution Badge */}
      <div className="px-2.5 pb-2.5 pt-0.5 shrink-0">
        <div className="py-1.5 px-2.5 rounded-lg bg-emerald-50/90 border border-emerald-200/80 text-center flex items-center justify-center gap-1.5 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
          <span className="text-[10.5px] text-emerald-950 font-medium">
            Made by <strong className="font-bold text-emerald-900">Team HackHer</strong>
          </span>
        </div>
      </div>
    </aside>
  );
}
