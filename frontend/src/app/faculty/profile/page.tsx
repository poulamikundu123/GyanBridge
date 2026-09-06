import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { facultyApi } from "@/lib/apiClient";

export default async function FacultyProfilePage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "FACULTY") {
    redirect("/login");
  }

  const dashboard = await facultyApi.getDashboard().catch(() => null);
  const profile = dashboard?.profile || {};
  const mentorshipRequests = dashboard?.mentorship_requests || [];

  const designation = profile.designation || "Associate Professor";
  const department = profile.department || "Dravyaguna (Herbal Pharmacology)";
  const institution = profile.institution || "All India Institute of Ayurveda";
  const specialization = profile.specialization || "Standardization of Ayurvedic Formulations & Clinical Trials";
  const discipline = profile.discipline || "Ayurveda";
  const mentoredCount = mentorshipRequests.length;

  return (
    <AppShell allowedRole="FACULTY">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="p-8 rounded-[12px] bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[12px] bg-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-xs">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-medium text-2xl text-white">{user.name}</h1>
                <span className="text-[10px] font-medium uppercase tracking-wider px-2.5 py-0.5 rounded-[8px] bg-purple-500/20 border border-purple-400/40 text-purple-200">
                  AYUSH Faculty & Research Guide
                </span>
              </div>
              <p className="text-xs text-purple-100/80 mt-1">
                {designation} • {department}
              </p>
              <p className="text-xs text-purple-200/70">{institution}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 space-y-1 text-xs text-purple-100/90">
            <strong className="text-white block font-semibold">Research Specialization:</strong>
            <p>{specialization}</p>
          </div>
        </div>

        <div className="ayush-card p-6 space-y-4">
          <h3 className="font-heading font-medium text-xs uppercase tracking-wider text-slate-700">Academic & Mentorship Record</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-slate-50 rounded-[8px]">
              <span className="text-2xl font-bold text-purple-800 font-mono">10+</span>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block mt-1">Years Research Experience</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-[8px]">
              <span className="text-2xl font-bold text-emerald-700">{discipline}</span>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block mt-1">Domain Expertise</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-[8px]">
              <span className="text-2xl font-bold text-slate-900 font-mono">
                {mentoredCount}
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block mt-1">Scholars Mentored</span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
