import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { industryApi } from "@/lib/apiClient";
import { Network } from "lucide-react";

interface CollaborationProjectItem {
  id: string;
  title: string;
  projectType?: string;
  project_type?: string;
  status?: string;
  description?: string;
  seekingTypes?: string;
  seeking_types?: string;
  requiredAreas?: string;
  required_areas?: string;
  creator?: { name?: string };
  company_name?: string;
  discipline?: { name?: string } | string;
  requests?: Array<{ id: string }>;
}

export default async function IndustryCollaborationPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "INDUSTRY") {
    redirect("/login");
  }

  const projects: CollaborationProjectItem[] = await industryApi.getCollaborations().catch(() => []);

  return (
    <AppShell allowedRole="INDUSTRY">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <Network className="w-6 h-6 text-emerald-700" />
              <h1 className="font-heading font-bold text-2xl text-slate-900">Industry–Academia Research Collaborations</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Publish collaborative R&D endeavors, clinical trial consortiums, and marker standardization projects
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="ayush-card p-8 text-center text-slate-500 text-sm">
              No active research collaborations found.
            </div>
          ) : (
            projects.map((proj) => {
              const projectType = proj.projectType || proj.project_type || "R&D Initiative";
              const creatorName = proj.company_name || proj.creator?.name || "Industry Partner";
              const seeking = proj.seekingTypes || proj.seeking_types || "Academic Partners & Clinical Trials";
              const areas = proj.requiredAreas || proj.required_areas || "Standardization, AYUSH Therapeutics";
              const reqCount = (proj.requests || []).length;

              return (
                <div key={proj.id} className="ayush-card p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-[8px] bg-purple-100 text-purple-800">
                      {projectType}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-[8px] border border-emerald-200">
                      Status: {proj.status || "ACTIVE"}
                    </span>
                  </div>

                  <h3 className="font-heading font-medium text-base text-slate-900">{proj.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
                    <div className="text-slate-600">
                      <strong className="text-slate-800">Seeking:</strong> {seeking}
                    </div>
                    <div className="text-slate-600">
                      <strong className="text-slate-800">Required Expertise:</strong> {areas}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>Posted by {creatorName}</span>
                    <span className="font-semibold text-purple-700">{reqCount} Collaboration Requests</span>
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
