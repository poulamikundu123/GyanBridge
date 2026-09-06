import React from "react";
import { Target, BarChart3, BookOpen, Briefcase } from "lucide-react";

export default function AuthBanner() {
  return (
    <div
      style={{
        flex: "0 0 42%",
        background: "#003c33",
        padding: "36px 32px",
        color: "#fff",
      }}
      className="hidden md:flex flex-col justify-between"
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
          <div
            style={{
              background: "#ffffff",
              color: "#003c33",
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              fontSize: "1.1rem",
            }}
          >
            A
          </div>
          <div>
            <div className="font-heading font-medium text-base tracking-tight text-white">AYUSHAI</div>
            <div className="text-[9px] font-mono tracking-widest uppercase text-emerald-300">
              Skill Intelligence Platform
            </div>
          </div>
        </div>

        <h1 className="font-heading font-medium text-2xl lg:text-3xl text-white tracking-tight leading-tight mb-2.5">
          Your AYUSH career companion is ready.
        </h1>
        <p className="text-xs text-emerald-100/80 leading-relaxed max-w-xs">
          Adaptive clinical assessments, role-specific gap analysis, and explainable opportunity matching.
        </p>

        {/* Public Asset 1: study_character.jpg - Media Card with 12px corners */}
        <div className="relative mt-4 mb-3 rounded-[12px] overflow-hidden border border-white/15 shadow-sm bg-white">
          <img
            src="/study_character.jpg"
            alt="AYUSH Student Studying"
            className="w-full h-44 object-contain"
          />
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-[6px] bg-[#003c33]/85 backdrop-blur-sm border border-emerald-500/20 text-[10px] font-mono text-emerald-200 shadow-xs">
            National Skill Readiness Grid
          </div>
        </div>
      </div>

      {/* Feature list pills with 8px radius */}
      <div className="space-y-2 mt-2">
        {[
          { label: "Goal-Driven Assessment Engine", icon: <Target className="w-3.5 h-3.5 text-emerald-300" /> },
          { label: "Role-Specific Skill Gap Radar", icon: <BarChart3 className="w-3.5 h-3.5 text-emerald-300" /> },
          { label: "Personalized Learning Bridges", icon: <BookOpen className="w-3.5 h-3.5 text-emerald-300" /> },
          { label: "7-Factor Opportunity Matching", icon: <Briefcase className="w-3.5 h-3.5 text-emerald-300" /> },
        ].map((f) => (
          <div
            key={f.label}
            className="flex items-center gap-2.5 bg-white/10 rounded-[8px] px-3 py-2 text-xs font-medium text-white border border-white/10"
          >
            <span className="shrink-0">{f.icon}</span>
            <span>{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
