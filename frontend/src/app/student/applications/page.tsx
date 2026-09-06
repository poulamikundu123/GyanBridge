import AppShell from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { studentApi } from "@/lib/apiClient";
import {
  FileCheck,
  Building2,
  Clock,
  Award,
  Star,
} from "lucide-react";
import { redirect } from "next/navigation";

export default async function ApplicationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "STUDENT") redirect(`/${user.role.toLowerCase()}/dashboard`);

  const rawApplications = await studentApi.getApplications();
  const applications = Array.isArray(rawApplications) ? rawApplications : [];

  const stages = ["APPLIED", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEW", "SELECTED", "JOINED", "COMPLETED"];

  const getStageIndex = (status: string) => {
    const idx = stages.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <AppShell allowedRole="STUDENT">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-6 h-6 text-emerald-700" />
              <h1 className="font-heading font-bold text-2xl text-slate-900">Application Pipeline & Tracking</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Track the progress of your submissions, review recruiter stage notes, and access verified industry endorsements
            </p>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-[12px] border border-slate-200/90 shadow-xs">
            <p className="text-slate-500 text-xs">You have not applied for any opportunities yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((app) => {
              const currentStageIdx = getStageIndex(app.status);

              return (
                <div key={app.id} className="ayush-card p-6 space-y-6">
                  {/* Top Meta */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {app.opportunity?.opportunityType || "INTERNSHIP"}
                        </span>
                        <span className="text-xs text-slate-500">• {app.opportunity?.sector?.name || "AYUSH Healthcare"}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{app.opportunity?.title || "Opportunity"}</h3>
                      <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <strong className="text-slate-800">{app.opportunity?.industryProfile?.companyName || "AYUSH Partner"}</strong> •{" "}
                        {app.opportunity?.location || "Remote"}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Match Compatibility</div>
                      <div className="text-2xl font-black text-emerald-700">{app.matchScorePercentage ?? app.match_score ?? 0}%</div>
                      <div className="text-[11px] text-slate-500">
                        Applied {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : app.applied_at ? new Date(app.applied_at).toLocaleDateString() : "Recently"}
                      </div>
                    </div>
                  </div>

                  {/* Visual Pipeline Progress */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Application Pipeline Status
                    </div>
                    <div className="grid grid-cols-7 gap-1 sm:gap-2">
                      {stages.map((stage, idx) => {
                        const isDone = idx <= currentStageIdx;
                        const isCurrent = idx === currentStageIdx;

                        return (
                          <div key={stage} className="text-center space-y-1">
                            <div
                              className={`h-2.5 rounded-full transition-all ${
                                isCurrent
                                  ? "bg-emerald-500 ring-2 ring-emerald-300"
                                  : isDone
                                  ? "bg-emerald-700"
                                  : "bg-slate-200"
                              }`}
                            />
                            <span
                              className={`text-[9px] sm:text-[10px] font-bold block truncate ${
                                isCurrent
                                  ? "text-emerald-800"
                                  : isDone
                                  ? "text-slate-700"
                                  : "text-slate-400"
                              }`}
                            >
                              {stage.replace("_", " ")}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Status History Logs */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      Status Timeline & Recruiter Notes:
                    </div>
                    <div className="space-y-2 text-xs">
                      {(app.statusHistory || app.status_history || []).map((sh: any) => (
                        <div key={sh.id || Math.random()} className="flex items-start justify-between gap-4 py-1 border-b border-slate-200/60 last:border-b-0">
                          <div>
                            <span className="font-bold text-slate-800 mr-2">{sh.status}:</span>
                            <span className="text-slate-600">{sh.notes || sh.note || "Status updated"}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 flex-shrink-0">
                            {sh.changedAt ? new Date(sh.changedAt).toLocaleDateString() : sh.changed_at ? new Date(sh.changed_at).toLocaleDateString() : "Recently"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Verified Industry Feedback (if provided) */}
                  {app.feedback && (
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/70 border border-emerald-300 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-emerald-700" />
                          <h4 className="text-sm font-bold text-slate-900">
                            Verified Industry Competency Review & Feedback
                          </h4>
                        </div>
                        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{app.feedback.overallRating} / 5.0</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 italic leading-relaxed bg-white/70 p-3 rounded-xl border border-emerald-200">
                        &ldquo;{app.feedback.writtenFeedback}&rdquo;
                      </p>

                      {/* Evaluated Competencies */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                        {app.feedback.skillRatings.map((sr) => (
                          <div
                            key={sr.id}
                            className="p-2.5 bg-white rounded-lg border border-emerald-200 text-xs flex items-center justify-between"
                          >
                            <span className="font-semibold text-slate-800 truncate">{sr.skill.name}</span>
                            <span className="font-bold text-emerald-700 flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                              {sr.rating}/5
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
