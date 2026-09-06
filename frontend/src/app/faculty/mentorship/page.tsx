import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { facultyApi } from "@/lib/apiClient";
import { Users, Sparkles } from "lucide-react";
import FacultyMentorshipActionButtons from "@/components/faculty/FacultyMentorshipActionButtons";
import FacultyMentorshipProfileCard from "@/components/faculty/FacultyMentorshipProfileCard";

interface MentorshipRequestItem {
  id: string;
  topic?: string;
  message?: string;
  status: string;
  requested_at?: string;
  requestedAt?: string;
  student_name?: string;
  degree?: string;
  institution?: string;
  studentProfile?: {
    user?: { name?: string };
    degree?: string;
    discipline?: { name?: string };
  };
}

export default async function FacultyMentorshipManagementPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "FACULTY") {
    redirect("/login");
  }

  const [requests, offering] = await Promise.all([
    facultyApi.getMentorships().catch(() => []),
    facultyApi.getMentorshipOffering().catch(() => null),
  ]);

  return (
    <AppShell allowedRole="FACULTY">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-700" />
              <h1 className="font-heading font-bold text-2xl text-slate-900">Student Mentorship Management</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Review scholar applications, manage your published mentoring profile, and support students on study protocols
            </p>
          </div>
        </div>

        {/* Public Mentorship Profile Card */}
        <FacultyMentorshipProfileCard
          offering={offering}
          facultyName={user.name}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Incoming Student Requests ({requests.length})
            </h2>
          </div>
          {requests.map((req) => {
            const studentName = req.student_name || req.studentProfile?.user?.name || "Student";
            const degree = req.degree || req.studentProfile?.degree || "Scholar";
            const discipline = req.studentProfile?.discipline?.name || "AYUSH";
            const reqDate = req.requested_at || req.requestedAt;
            const formattedDate = reqDate ? new Date(reqDate).toLocaleDateString() : "Recently";

            return (
              <div key={req.id} className="ayush-card p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-heading font-medium text-base text-slate-900">{req.topic || "Research Guidance"}</h3>
                    <p className="text-xs text-slate-500">
                      From <strong className="text-slate-700">{studentName}</strong> • {degree} ({discipline})
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] self-start sm:self-auto ${
                      req.status === "ACCEPTED"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed italic">
                  &ldquo;{req.message}&rdquo;
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <span className="text-xs text-slate-500">
                    Requested on {formattedDate}
                  </span>
                  <FacultyMentorshipActionButtons requestId={req.id} currentStatus={req.status} />
                </div>
              </div>
            );
          })}

          {requests.length === 0 && (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <p className="text-slate-500 text-xs">No mentorship requests in your queue.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
