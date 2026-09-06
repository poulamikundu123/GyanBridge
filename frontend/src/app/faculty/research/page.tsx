import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { facultyApi } from "@/lib/apiClient";
import { Network } from "lucide-react";

interface ResearchProjectItem {
  id: string;
  title: string;
  description?: string;
  projectType?: string;
  project_type?: string;
  status?: string;
  creator_name?: string;
  creator?: { name?: string };
  seekingTypes?: string;
  seeking_types?: string;
  requiredAreas?: string;
  required_areas?: string;
}

export default async function FacultyResearchPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "FACULTY") {
    redirect("/login");
  }

  const projects: ResearchProjectItem[] = await facultyApi.getResearch().catch(() => []);

  return (
    <AppShell allowedRole="FACULTY">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <Network className="w-6 h-6 text-purple-700" />
              <h1 className="font-heading font-bold text-2xl text-slate-900">Industry–Academia Research Projects</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Join active clinical trial consortiums, reverse pharmacology investigations, and formulation standardization schemes
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="ayush-card p-8 text-center text-slate-500 text-sm">
              No active research projects currently listed.
            </div>
          ) : (
            projects.map((proj) => {
              const projectType = proj.projectType || proj.project_type || "R&D Collaboration";
              const creatorName = proj.creator_name || proj.creator?.name || "AYUSH Consortium";
              const seeking = proj.seekingTypes || proj.seeking_types || "Academic Partners";
              const areas = proj.requiredAreas || proj.required_areas || "Standardization & Clinical Pharmacology";

              return (
                <div key={proj.id} className="ayush-card p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-[8px] bg-purple-100 text-purple-800">
                      {projectType}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-[8px] border border-emerald-200">
                      {proj.status || "OPEN"}
                    </span>
                  </div>

                  <h3 className="font-heading font-medium text-base text-slate-900">{proj.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
                    <div className="text-slate-600">
                      <strong className="text-slate-800">Seeking:</strong> {seeking}
                    </div>
                    <div className="text-slate-600">
                      <strong className="text-slate-800">Key Focus Areas:</strong> {areas}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Initiated by {creatorName}</span>
                    <button className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition">
                      Submit Research Proposal
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}
