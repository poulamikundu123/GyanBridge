import AppShell from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { studentApi } from "@/lib/apiClient";
import { Users } from "lucide-react";
import MentorshipCardWithModal from "@/components/student/MentorshipCardWithModal";
import { redirect } from "next/navigation";

export default async function MentorshipPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "STUDENT") redirect(`/${user.role.toLowerCase()}/dashboard`);

  const mentors = await studentApi.getMentors();
  const myRequests = await studentApi.getMentorshipRequests();

  return (
    <AppShell allowedRole="STUDENT">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-emerald-700" />
              <h1 className="font-heading font-bold text-2xl text-slate-900">Academic & Industry Mentorship</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Connect with senior AYUSH faculty, research directors, and clinical trial coordinators for 1-on-1 career guidance
            </p>
          </div>
        </div>

        {/* Existing Active Requests */}
        {myRequests.length > 0 && (
          <div className="ayush-card p-6">
            <h2 className="font-heading font-medium text-sm uppercase tracking-wider text-slate-900 mb-3">
              Your Active Mentorship Engagements
            </h2>
            <div className="space-y-3">
              {myRequests.map((req: any, reqIdx: number) => {
                const reqId = req.id || `request-${reqIdx}`;
                const mentorName = req.mentorship?.facultyProfile?.user?.name || req.mentor_name || req.mentorName || "Faculty Mentor";
                const institution = req.mentorship?.facultyProfile?.institution || req.institution || "AYUSH Institution";

                return (
                  <div
                    key={reqId}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{req.topic}</div>
                      <div className="text-slate-500 text-[11px]">
                        Mentor: <strong className="text-slate-700">{mentorName}</strong> • {institution}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full font-bold uppercase text-[10px] self-start sm:self-auto ${
                        req.status === "ACCEPTED"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-amber-100 text-amber-800 border border-amber-300"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Mentors */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Available Faculty Mentors</h2>
          {mentors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mentors.map((m: any, idx: number) => {
                const mentorId = m.id || m.mentorship_id || m.mentorshipId || `mentor-${idx}`;
                const mentorName = m.mentorName || m.mentor_name || m.facultyProfile?.user?.name || "Faculty Mentor";
                const institution = m.institution || m.facultyProfile?.institution || "AYUSH Institution";
                const designation = m.designation || m.facultyProfile?.designation || "Faculty Member";
                const disciplineName = m.disciplineName || m.discipline_name || m.facultyProfile?.discipline?.name || "Ayurveda";

                return (
                  <MentorshipCardWithModal
                    key={mentorId}
                    mentor={{
                      id: mentorId,
                      mentorName,
                      institution,
                      designation,
                      disciplineName,
                      expertise: m.expertise || "Clinical Guidance",
                      availability: m.availability || "WEEKLY",
                      bio: m.bio || "",
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <div className="ayush-card p-8 text-center text-slate-500 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
              <Users className="w-10 h-10 mx-auto text-slate-400 mb-2 opacity-60" />
              <p className="font-semibold text-slate-800 text-sm">No faculty mentors currently listed</p>
              <p className="text-xs text-slate-500 mt-1">Check back soon as AYUSH faculty members publish their mentoring slots.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
