import React from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, Lightbulb, Clock, Target, Compass } from "lucide-react";

interface LearningRecommendationsSectionProps {
  recommendedTraining: any[];
  student: any;
}

export default function LearningRecommendationsSection({
  recommendedTraining,
  student,
}: LearningRecommendationsSectionProps) {
  return (
    <div className="ayush-card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-slate-900">Personalized Learning Recommendations</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Programs scientifically mapped to address your specific skill gaps and increase opportunity match scores
          </p>
        </div>
        <Link
          href="/student/learning"
          className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 self-start sm:self-auto"
        >
          Browse All Courses <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {recommendedTraining.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendedTraining.map((tr) => (
            <div
              key={tr.trainingId}
              className="nz-card p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition bg-gradient-to-br from-white to-slate-50/60 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {tr.category}
                  </span>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {tr.matchScore}% Match Fit
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">{tr.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{tr.providerName}</p>
                <p className="text-xs text-slate-600 mt-2 bg-emerald-50/50 p-2.5 rounded-[8px] border border-emerald-100 flex items-start gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <span>{tr.reason}</span>
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{tr.durationHours} Hours</span>
                  <span>• {tr.mode}</span>
                </div>
                <Link
                  href={`/student/learning?enroll=${tr.trainingId}`}
                  className="nz-btn-primary py-1.5 px-3 text-xs rounded-[8px]"
                >
                  Enroll Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-[12px] bg-gradient-to-r from-emerald-50/60 via-slate-50 to-white border-2 border-dashed border-emerald-300 text-center flex flex-col items-center justify-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-[12px] bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center shadow-xs">
            <Target className="w-6 h-6" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="font-heading font-medium text-sm text-slate-900">
              Take the Assessment to Receive Tailored Learning Suggestions
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your personalized course suggestions are dynamically generated based on your diagnostic results. Complete your{" "}
              <strong className="text-emerald-800 font-bold">
                {student?.targetCareerRole?.title || "Career Readiness"}
              </strong>{" "}
              assessment to detect your exact skill gaps and unlock calibrated learning modules.
            </p>
          </div>
          <div className="pt-2 flex items-center gap-3 flex-wrap justify-center">
            <Link
              href="/student/assessment"
              className="nz-btn-primary inline-flex items-center gap-2 rounded-[8px]"
            >
              <Compass size={14} strokeWidth={2.2} />
              <span>Take Career Assessment Now</span>
              <ChevronRight size={14} strokeWidth={2.5} />
            </Link>
            <Link
              href="/student/learning"
              className="nz-btn-ghost inline-flex items-center gap-1.5"
            >
              <BookOpen size={14} />
              <span>Browse General Catalog</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
