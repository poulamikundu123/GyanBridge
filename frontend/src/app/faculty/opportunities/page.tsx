import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { facultyApi } from "@/lib/apiClient";
import { Briefcase, Building2 } from "lucide-react";

interface FacultyOpportunityItem {
  id: string;
  title: string;
  type?: string;
  opportunity_type?: string;
  opportunityType?: string;
  company?: string;
  company_name?: string;
  industryProfile?: { companyName?: string };
  location?: string;
  work_mode?: string;
  workMode?: string;
  description?: string;
  duration?: string;
  deadline?: string | null;
  eligibilityDegree?: string;
  eligibility_degree?: string;
}

export default async function FacultyOpportunitiesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "FACULTY") {
    redirect("/login");
  }

  const opportunities: FacultyOpportunityItem[] = await facultyApi.getOpportunities().catch(() => []);

  return (
    <AppShell allowedRole="FACULTY">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-purple-700" />
              <h1 className="font-heading font-bold text-2xl text-slate-900">Faculty Development Programs & Immersion</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Browse sponsored industrial internships, advanced FDPs, and consultancy roles tailored for AYUSH academicians
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {opportunities.length > 0 ? (
            opportunities.map((opp) => {
              const oppType = opp.opportunityType || opp.opportunity_type || opp.type || "FDP";
              const compName = opp.company || opp.company_name || opp.industryProfile?.companyName || "AYUSH Partner";
              const workMode = opp.work_mode || opp.workMode || "HYBRID";
              const deadlineStr = opp.deadline ? new Date(opp.deadline).toLocaleDateString() : "Rolling Admission";
              const eligibility = opp.eligibilityDegree || opp.eligibility_degree || "MD / MS / PhD in AYUSH Disciplines";

              return (
                <div key={opp.id} className="ayush-card p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-[8px] bg-purple-100 text-purple-800">
                      {oppType}
                    </span>
                    <span className="text-xs text-slate-500">
                      Deadline: {deadlineStr}
                    </span>
                  </div>

                  <h3 className="font-heading font-medium text-base text-slate-900">{opp.title}</h3>
                  <p className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    {compName} • {opp.location || "Online"} ({workMode})
                  </p>

                  <p className="text-xs text-slate-600 leading-relaxed">{opp.description}</p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Eligibility: {eligibility}</span>
                    <button className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition">
                      Apply for Faculty Seat
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="ayush-card p-8 text-center text-slate-500 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
              <Briefcase className="w-10 h-10 mx-auto text-slate-400 mb-2 opacity-60" />
              <p className="font-semibold text-slate-800 text-sm">No Faculty Development Programs Currently Open</p>
              <p className="text-xs text-slate-500 mt-1">New sponsored industrial internships and FDP cohorts will appear here once announced by AYUSH industry partners.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
