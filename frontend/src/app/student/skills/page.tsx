import Link from "next/link";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { studentApi } from "@/lib/apiClient";
import {
  BarChart3,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  Info,
  Layers,
  Target,
} from "lucide-react";
import SkillCharts from "@/components/student/SkillCharts";
import { calculateRoleReadiness } from "@/lib/services/skillGapEngine";

export default async function StudentSkillsPage() {
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

  // Calculate role readiness and detailed gaps
  const roleReadiness = student.targetCareerRole
    ? calculateRoleReadiness(
        student.targetCareerRole,
        (student.skills || []).map((s) => ({
          skillId: s.skillId,
          proficiencyScore: s.proficiencyScore,
        }))
      )
    : null;

  const targetRole = student.targetCareerRole;
  const targetRoleSkills = targetRole?.skills || [];
  const studentSkillMap = new Map<string, (typeof student.skills)[0]>();
  (student.skills || []).forEach((s) => studentSkillMap.set(s.skillId, s));

  // Determine the competencies dynamically based on the selected career goal!
  const roleCompetencies = targetRoleSkills.length > 0
    ? targetRoleSkills.map((crs) => {
        const studentSkill = studentSkillMap.get(crs.skillId);
        const score = studentSkill ? studentSkill.proficiencyScore : 0;
        const isVerified = Boolean(studentSkill && studentSkill.proficiencyScore > 0);
        const gap = Math.max(0, crs.requiredProficiency - score);

        return {
          skillId: crs.skillId,
          skillName: crs.skill?.name || "Competency",
          categoryName: crs.skill?.category?.name || "Core Subject",
          requiredProficiency: crs.requiredProficiency,
          isMandatory: crs.isMandatory,
          weight: crs.weight,
          proficiencyScore: score,
          gap,
          verificationLevel: studentSkill ? studentSkill.verificationLevel : "PENDING",
          source: studentSkill?.source || null,
          isVerified,
        };
      })
    : (student.skills || []).map((s) => ({
        skillId: s.skillId,
        skillName: s.skill?.name || "Competency",
        categoryName: s.skill?.category?.name || "General",
        requiredProficiency: 70,
        isMandatory: true,
        weight: 1.0,
        proficiencyScore: s.proficiencyScore,
        gap: Math.max(0, 70 - s.proficiencyScore),
        verificationLevel: s.verificationLevel,
        source: s.source,
        isVerified: s.proficiencyScore > 0,
      }));

  // Prepare radar chart data based on the target career role's subjects!
  const radarData = roleCompetencies.slice(0, 6).map((rc) => ({
    subject: rc.skillName.length > 20 ? rc.skillName.slice(0, 18) + "..." : rc.skillName,
    studentScore: rc.proficiencyScore,
    benchmark: rc.requiredProficiency,
  }));

  const comparisonData = roleCompetencies.map((rc) => ({
    skillName: rc.skillName,
    studentScore: rc.proficiencyScore,
    requiredScore: rc.requiredProficiency,
    category: rc.categoryName,
  }));

  const getBadgeForLevel = (level: string) => {
    switch (level) {
      case "ASSESSMENT_VERIFIED":
        return { label: "Assessment Verified", color: "bg-emerald-50 text-emerald-800 border-emerald-300" };
      case "INDUSTRY_VERIFIED":
        return { label: "Industry Verified", color: "bg-blue-50 text-blue-800 border-blue-300" };
      case "INSTITUTION_VERIFIED":
        return { label: "Institution Verified", color: "bg-purple-50 text-purple-800 border-purple-300" };
      default:
        return { label: "Self Reported", color: "bg-slate-100 text-slate-700 border-slate-300" };
    }
  };

  return (
    <AppShell allowedRole="STUDENT">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-emerald-700" />
              <h1 className="font-heading font-bold text-2xl text-slate-900">Skill Intelligence & Gap Analysis</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Deep, explainable breakdown of verified competencies vs target career benchmarks
            </p>
          </div>
          <Link
            href="/student/assessment"
            className="px-4 py-2 rounded-[8px] bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RotateCcw className="w-4 h-4" /> Take Reassessment
          </Link>
        </div>

        {/* Architectural Principle Callout: General Skill Profile ≠ Industry Readiness */}
        <div className="p-5 rounded-[12px] bg-[#003c33] text-white shadow-xs border border-emerald-950/40">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-[8px] border border-emerald-400/30 text-emerald-300 flex-shrink-0 mt-0.5">
              <Info className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-xs">
              <h3 className="font-heading font-medium text-sm text-emerald-200">
                Architectural Principle: General Skill Profile ≠ Role-Specific Readiness
              </h3>
              <p className="text-emerald-100/80 leading-relaxed">
                A student can possess <strong className="text-white">90% AYUSH Knowledge</strong>, yet still have poor employability for <strong className="text-white">Clinical Research</strong> if they lack Biostatistics and Scientific Writing.
                The platform therefore computes both your overall knowledge base and your strict role-specific readiness.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="bg-white/10 px-3 py-1.5 rounded-[8px] border border-white/15">
                  <span className="text-[10px] text-emerald-300 uppercase font-semibold block">General Skill Average</span>
                  <span className="text-lg font-bold text-white font-mono">
                    {student.skills.length > 0 ? `${student.generalSkillScore}%` : "Pending Test"}
                  </span>
                </div>
                <div className="bg-white/10 px-3 py-1.5 rounded-[8px] border border-white/15">
                  <span className="text-[10px] text-emerald-300 uppercase font-semibold block">
                    Readiness: {student.targetCareerRole?.title || "Clinical Researcher"}
                  </span>
                  <span className="text-lg font-bold text-[#a4e797] font-mono">
                    {student.skills.length > 0 && roleReadiness ? `${roleReadiness.readinessPercentage}%` : "Pending Test"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {student.skills.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-[12px] bg-white border border-dashed border-emerald-300 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-[12px] bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
              <Target className="w-7 h-7" />
            </div>
            <h2 className="font-heading font-medium text-xl text-slate-900">Assessment Required to Calibrate Skill Profile</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              As a new scholar, your verified competency ledger is currently vacant. Complete your 30-question diagnostic for <strong>{student.targetCareerRole?.title || "your career goal"}</strong> to dynamically formulate your Skill Radar and Gap Audit table.
            </p>
            <Link
              href="/student/assessment"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[8px] bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs shadow-xs transition"
            >
              <Target className="w-4 h-4" /> Start Career Assessment Now
            </Link>
          </div>
        ) : (
          <>
            {/* Interactive Recharts Radar and Bar Graphs */}
            <SkillCharts radarData={radarData} comparisonData={comparisonData} />

            {/* Granular Skill Gap Table */}
            <div className="ayush-card p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                  <Layers className="w-4 h-4 text-emerald-700" />
                  <span>Role-Specific Gap Audit ({student.targetCareerRole?.title || "Target Role"})</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Classified by deterministic difference points
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/70">
                      <th className="p-3">Skill Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-center">Your Score</th>
                      <th className="p-3 text-center">Industry Benchmark</th>
                      <th className="p-3 text-center">Gap Points</th>
                      <th className="p-3">Classification</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {roleReadiness?.allGaps.map((item) => {
                      let badgeColor = "bg-emerald-50 text-emerald-800 border-emerald-200";
                      if (item.classification === "Minor Gap") badgeColor = "bg-yellow-50 text-yellow-800 border-yellow-200";
                      if (item.classification === "Moderate Gap") badgeColor = "bg-amber-50 text-amber-800 border-amber-200";
                      if (item.classification === "Major Gap") badgeColor = "bg-red-50 text-red-800 border-red-200";

                      return (
                        <tr key={item.skillId} className="hover:bg-slate-50/80 transition">
                          <td className="p-3 font-semibold text-slate-900">
                            <div className="flex items-center gap-1.5">
                              <span>{item.skillName}</span>
                              {item.isMandatory && (
                                <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.2 rounded">
                                  Mandatory
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-slate-500">{item.categoryName || "General"}</td>
                          <td className="p-3 text-center font-bold text-slate-800">{item.studentScore}%</td>
                          <td className="p-3 text-center text-slate-600">{item.requiredScore}%</td>
                          <td className="p-3 text-center">
                            <span className={`font-bold ${item.gap > 0 ? "text-red-600" : "text-emerald-700"}`}>
                              {item.gap > 0 ? `-${item.gap}` : "0"}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${badgeColor}`}>
                              {item.classification}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {item.gap > 0 ? (
                              <Link
                                href="/student/learning"
                                className="text-emerald-700 hover:text-emerald-900 font-bold inline-flex items-center gap-0.5"
                              >
                                Bridge Gap <ArrowRight className="w-3 h-3" />
                              </Link>
                            ) : (
                              <span className="text-emerald-700 font-semibold flex items-center justify-end gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Met
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Target Role Competencies & Verification Levels */}
            <div className="ayush-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
                <div>
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Registered Competencies & Verification Levels</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Calibrated specifically to your active career target: <strong className="text-slate-800">{targetRole?.title || "Target Career Goal"}</strong> ({roleCompetencies.length} subjects)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Goal: {targetRole?.title || "Clinical Researcher"}
                  </span>
                  <Link
                    href="/student/careers"
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                  >
                    Change Goal →
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {roleCompetencies.map((c) => {
                  const badge = c.isVerified
                    ? getBadgeForLevel(c.verificationLevel)
                    : { label: "Pending Assessment", color: "bg-amber-50 text-amber-800 border-amber-300" };

                  return (
                    <div key={c.skillId} className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-2 hover:border-emerald-300 transition">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-slate-900 block leading-snug">{c.skillName}</span>
                          <span className="text-[10px] text-slate-400">{c.categoryName}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-sm font-black ${c.isVerified ? "text-emerald-700" : "text-amber-600"}`}>
                            {c.isVerified ? `${c.proficiencyScore}%` : "0%"}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-medium">Req: {c.requiredProficiency}%</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            c.proficiencyScore >= c.requiredProficiency
                              ? "bg-emerald-600"
                              : c.proficiencyScore > 0
                              ? "bg-amber-500"
                              : "bg-slate-200"
                          }`}
                          style={{ width: `${Math.min(100, Math.max(5, c.proficiencyScore))}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] pt-1">
                        <span className={`px-2 py-0.5 rounded-full border font-medium ${badge.color}`}>
                          {badge.label}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {c.isMandatory && (
                            <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.2 rounded">
                              Mandatory
                            </span>
                          )}
                          <span className="text-slate-400 font-medium truncate max-w-[120px]">
                            {c.isVerified && c.source ? c.source : targetRole?.title || "Career Goal"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
