import Link from "next/link";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { studentApi } from "@/lib/apiClient";
import {
  Award,
  FolderGit2,
  ShieldCheck,
  Star,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default async function PortfolioPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT" || !user.profileId) {
    redirect("/login");
  }

  const student = await studentApi.getProfile();

  if (!student) {
    return (
      <AppShell allowedRole="STUDENT">
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-600">Please complete your onboarding profile.</p>
          <Link href="/student/onboarding" className="mt-4 inline-block px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold">
            Complete Profile
          </Link>
        </div>
      </AppShell>
    );
  }

  const getBadgeStyle = (level: string) => {
    switch (level) {
      case "ASSESSMENT_VERIFIED":
        return { label: "Assessment Verified", color: "bg-emerald-50 text-emerald-800 border-emerald-300" };
      case "INDUSTRY_VERIFIED":
        return { label: "Industry Endorsed", color: "bg-blue-50 text-blue-800 border-blue-300" };
      case "INSTITUTION_VERIFIED":
        return { label: "Institution Certified", color: "bg-purple-50 text-purple-800 border-purple-300" };
      default:
        return { label: "Self Reported", color: "bg-slate-100 text-slate-700 border-slate-300" };
    }
  };

  return (
    <AppShell allowedRole="STUDENT">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header Portfolio Banner */}
        <div className="relative overflow-hidden rounded-[12px] bg-[#003c33] p-6 sm:p-8 text-white shadow-md border border-emerald-950/40">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-[12px] bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold text-2xl flex items-center justify-center shadow-xs">
                {user.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-heading font-medium text-2xl text-white">{user.name}</h1>
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase font-medium tracking-wider px-2.5 py-0.5 rounded-[8px] bg-white/10 border border-white/20 text-[#a4e797]">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified AYUSH Portfolio
                  </span>
                </div>
                <p className="text-xs text-emerald-100/80 mt-1">
                  {student.degree || "AYUSH Degree"} • {student.discipline?.name || "AYUSH"} • {student.institution || "AYUSH Institution"}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-emerald-200/70 mt-2">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {student.user?.email || user.email}
                  </span>
                  {student.user?.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {student.user.phone}
                    </span>
                  )}
                  {student.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {student.location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-[12px] p-4 border border-white/15 text-center sm:text-right min-w-[180px]">
              <div className="text-[10px] uppercase font-semibold text-[#a4e797]">Target Career Goal</div>
              <div className="font-heading font-medium text-sm text-white">{student.targetCareerRole?.title || "Clinical Researcher"}</div>
              <div className="text-[11px] text-emerald-200/80 mt-1">
                Readiness Score: <strong className="text-emerald-400">{student.readinessScore}%</strong>
              </div>
            </div>
          </div>

          {student.bio && (
            <p className="text-xs text-emerald-100/90 leading-relaxed mt-6 pt-4 border-t border-white/10">
              {student.bio}
            </p>
          )}
        </div>

        {/* Section 1: Verified Skill Competencies */}
        <div className="ayush-card p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
              <Award className="w-4 h-4 text-emerald-700" />
              <span>Skill Profile & Verification Ledger</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {(student.skills || []).length} Registered Competencies
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(student.skills || []).map((s) => {
              const badge = getBadgeStyle(s.verificationLevel);

              return (
                <div key={s.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{s.skill?.name || "Competency"}</span>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {s.proficiencyScore}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${s.proficiencyScore}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className={`px-2 py-0.5 rounded-full border font-semibold ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span>Source: {s.source || "Platform Evaluation"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Projects & Clinical Studies */}
        <div className="ayush-card p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
              <FolderGit2 className="w-4 h-4 text-emerald-700" />
              <span>Academic Projects & Clinical Case Studies</span>
            </div>
            <span className="text-xs text-slate-500">{(student.projects || []).length} Documented Projects</span>
          </div>

          <div className="space-y-4">
            {(student.projects || []).map((proj) => (
              <div key={proj.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="text-sm font-bold text-slate-900">{proj.title}</h4>
                  <span className="text-xs text-slate-500 font-medium">{proj.duration || "Term"} • {proj.role || "Contributor"}</span>
                </div>
                {proj.organization && (
                  <p className="text-xs text-slate-500 font-semibold">{proj.organization}</p>
                )}
                <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>
                <div className="pt-2 flex flex-wrap gap-1.5 text-[11px] text-emerald-800">
                  <span className="font-semibold text-slate-500">Skills Applied:</span>
                  {(proj.skillsUsed || "").split(",").filter(Boolean).map((s: string, idx: number) => (
                    <span key={idx} className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Verified Industry Endorsements & Feedback */}
        {(student.feedbackReceived || []).length > 0 && (
          <div className="ayush-card p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Verified Industry Testimonials & Competency Ratings</span>
              </div>
              <span className="text-xs text-slate-500">From verified employers</span>
            </div>

            <div className="space-y-4">
              {(student.feedbackReceived || []).map((fb) => (
                <div
                  key={fb.id}
                  className="p-4 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/40 to-white space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900">
                        {fb.reviewer?.name || "Verified Reviewer"}
                      </span>
                      <p className="text-[11px] text-slate-500">Reviewer • Verified Industry Partner</p>
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{fb.overallRating} / 5.0</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 italic leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                    &ldquo;{fb.writtenFeedback}&rdquo;
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {(fb.skillRatings || []).map((sr) => (
                      <div
                        key={sr.id}
                        className="p-2 bg-white rounded border border-slate-200 text-xs flex items-center justify-between"
                      >
                        <span className="text-slate-700 truncate">{sr.skill?.name || "Skill"}</span>
                        <strong className="text-emerald-700">{sr.rating}/5</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 4: Certifications & Credentials */}
        <div className="ayush-card p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Certifications & Credential Records</span>
            </div>
            <span className="text-xs text-slate-500">{(student.certifications || []).length} Credentials</span>
          </div>

          <div className="space-y-3">
            {(student.certifications || []).map((cert) => (
              <div
                key={cert.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{cert.name}</h4>
                  <p className="text-[11px] text-slate-500">
                    {cert.issuingOrg || "AYUSH Partner"} • Issued {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : "Recent"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                    {cert.verificationStatus || "VERIFIED"}
                  </span>
                  {cert.credentialId && (
                    <span className="text-[11px] text-slate-400 font-mono">ID: {cert.credentialId}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
