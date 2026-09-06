import Link from "next/link";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { facultyApi } from "@/lib/apiClient";
import {
  School,
  Users,
  ArrowRight,
  Compass,
} from "lucide-react";

export default async function FacultyDashboard() {
  const user = await getCurrentUser();
  if (!user || user.role !== "FACULTY") {
    redirect("/login");
  }

  const [dashboard, opportunities, researchProjects, mentorships] = await Promise.all([
    facultyApi.getDashboard().catch(() => null),
    facultyApi.getOpportunities().catch(() => []),
    facultyApi.getResearch().catch(() => []),
    facultyApi.getMentorships().catch(() => []),
  ]);

  const profile = dashboard?.profile || {};
  const designation = profile.designation || "Associate Professor";
  const department = profile.department || "Dravyaguna (Herbal Pharmacology)";
  const institution = profile.institution || "All India Institute of Ayurveda";
  const specialization = profile.specialization || "Clinical Research";

  const allRequests: any[] = Array.isArray(mentorships) && mentorships.length > 0 
    ? mentorships 
    : (dashboard?.mentorship_requests || []);

  const fdpOpportunities: any[] = Array.isArray(opportunities) ? opportunities.slice(0, 3) : [];
  const collaborationProjects: any[] = Array.isArray(researchProjects) ? researchProjects.slice(0, 2) : [];
  const isFreshFaculty = allRequests.length === 0;

  return (
    <AppShell allowedRole="FACULTY">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-[12px] bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-medium mb-3">
                <School className="w-3.5 h-3.5" />
                {designation} • {department}
              </div>
              <h1 className="font-heading font-medium text-2xl sm:text-3xl text-white tracking-tight">
                Welcome, {user.name}
              </h1>
              <p className="text-xs text-purple-100/80 mt-1 max-w-xl">
                {isFreshFaculty
                  ? "Welcome to the AYUSH Academia–Industry Collaborative Hub. Connect with industry R&D and guide student research scholars."
                  : `${institution} • Specialization in ${specialization}`}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-[12px] p-4 border border-white/15 text-center sm:text-right min-w-[180px]">
              <div className="text-[10px] uppercase font-semibold text-purple-300">Mentorship Queue</div>
              <div className="text-2xl font-bold text-white">{allRequests.length}</div>
              <div className="text-[11px] text-purple-200/80">Active Student Mentees</div>
            </div>
          </div>
        </div>

        {/* FIRST-TIME FACULTY ONBOARDING GUIDE */}
        {isFreshFaculty && (
          <div className="p-6 sm:p-7 rounded-[12px] bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[8px] bg-purple-50 border border-purple-200/80 flex items-center justify-center text-purple-700">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-heading font-medium text-base text-slate-900">
                    First-Time Faculty Onboarding &amp; Academia–Industry Guide
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Connect with industry R&amp;D teams and guide student scholars
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-[8px] border border-purple-200/80 self-start sm:self-auto">
                Orientation
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="p-4 rounded-[12px] bg-slate-50/70 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700 block mb-1">
                    Step 1 • Profile
                  </span>
                  <h4 className="font-heading font-medium text-xs text-slate-900">Research &amp; Mentorship Profile</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Specify your domain expertise, research publications, and guidance availability hours.
                  </p>
                </div>
                <Link
                  href="/faculty/profile"
                  className="mt-3 px-3.5 py-2 rounded-[8px] bg-purple-700 hover:bg-purple-800 text-white font-medium text-xs text-center transition flex items-center justify-center gap-1 shadow-xs"
                >
                  <span>View Academic Profile</span> <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-4 rounded-[12px] bg-slate-50/70 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Step 2 • FDPs
                  </span>
                  <h4 className="font-heading font-medium text-xs text-slate-900">Faculty Immersion Programs</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Apply for sponsored industrial internships, advanced FDPs, and consultancy opportunities.
                  </p>
                </div>
                <Link
                  href="/faculty/opportunities"
                  className="mt-3 px-3.5 py-2 rounded-[8px] bg-[#17171c] hover:bg-purple-800 text-white font-medium text-xs text-center transition flex items-center justify-center gap-1 shadow-xs"
                >
                  <span>Browse FDPs</span> <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-4 rounded-[12px] bg-slate-50/70 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Step 3 • Research
                  </span>
                  <h4 className="font-heading font-medium text-xs text-slate-900">Joint Research Projects</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Submit proposals to industry R&amp;D teams for clinical trials and botanical standardization.
                  </p>
                </div>
                <Link
                  href="/faculty/research"
                  className="mt-3 px-3.5 py-2 rounded-[8px] bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs text-center transition flex items-center justify-center gap-1"
                >
                  <span>Explore Research Hub</span> <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="ayush-card p-5">
            <div className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">Sponsored FDP Opportunities</div>
            <div className="font-heading font-bold text-3xl sm:text-4xl text-purple-700 mt-1">{dashboard?.available_fdps_count ?? fdpOpportunities.length}</div>
            <div className="text-[11px] font-mono text-slate-500 mt-1">Industrial Faculty Immersion</div>
          </div>

          <div className="ayush-card p-5">
            <div className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">Research Collaborations</div>
            <div className="font-heading font-bold text-3xl sm:text-4xl text-emerald-700 mt-1">{collaborationProjects.length}</div>
            <div className="text-[11px] font-mono text-slate-500 mt-1">Open Industry Joint Projects</div>
          </div>

          <div className="ayush-card p-5">
            <div className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">Pending Mentorship Requests</div>
            <div className="font-heading font-bold text-3xl sm:text-4xl text-amber-600 mt-1">
              {allRequests.filter((r) => r.status === "REQUESTED").length}
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-1">Student Inquiries</div>
          </div>
        </div>

        {/* Section 1: Mentorship Requests */}
        <div className="ayush-card p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Users className="w-4 h-4 text-purple-700" />
                <span>Student Mentorship Requests</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Undergraduate and postgraduate scholars seeking research mentorship</p>
            </div>
            <Link href="/faculty/mentorship" className="text-xs font-bold text-purple-700 hover:text-purple-900">
              Manage Requests →
            </Link>
          </div>

          <div className="space-y-3">
            {allRequests.map((req) => {
              const studentName = req.student_name || req.studentProfile?.user?.name || "Student";
              const degree = req.degree || req.studentProfile?.degree || "Scholar";
              const discipline = req.studentProfile?.discipline?.name || "AYUSH";
              const reqStatus = req.status || "REQUESTED";

              return (
                <div
                  key={req.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{req.topic || "Research Guidance"}</span>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      From <strong className="text-slate-700">{studentName}</strong> • {degree} ({discipline})
                    </div>
                    <p className="text-slate-600 italic mt-1">&ldquo;{req.message}&rdquo;</p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        reqStatus === "ACCEPTED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {reqStatus}
                    </span>
                  </div>
                </div>
              );
            })}

            {allRequests.length === 0 && (
              <div className="p-8 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-300 space-y-2">
                <Users className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="font-bold text-slate-800 text-xs">No Student Mentorship Requests Yet</p>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  As students browse faculty mentors across AYUSH disciplines, incoming guidance inquiries for clinical protocols and theses will appear here with 1-click accept.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Industry FDP & Immersion Opportunities */}
        <div className="ayush-card p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Sponsored Faculty Immersion & FDP Programs
            </h2>
            <Link href="/faculty/opportunities" className="text-xs font-bold text-purple-700">
              View All FDPs →
            </Link>
          </div>

          <div className="space-y-3">
            {fdpOpportunities.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No faculty immersion programs available currently.</p>
            ) : (
              fdpOpportunities.map((opp) => {
                const oppType = opp.opportunity_type || opp.opportunityType || opp.type || "FDP";
                const companyName = opp.company || opp.company_name || opp.industryProfile?.companyName || "Industry Partner";

                return (
                  <div key={opp.id} className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                          {oppType}
                        </span>
                        <span className="text-slate-500">• {opp.duration || "4 Weeks"}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{opp.title}</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Host: {companyName} • {opp.location || "Online"}
                      </p>
                    </div>

                    <Link
                      href="/faculty/opportunities"
                      className="px-4 py-2 rounded-xl bg-purple-700 text-white font-bold text-xs hover:bg-purple-800 transition"
                    >
                      View Details & Apply
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
