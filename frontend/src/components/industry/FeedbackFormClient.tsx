"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, CheckCircle2, ArrowRight, ShieldCheck, Award } from "lucide-react";
import confetti from "canvas-confetti";

interface FeedbackFormClientProps {
  applicationId: string;
  candidateName: string;
  opportunityTitle: string;
  skills: Array<{ id: string; name: string }>;
  initialRating?: number;
  initialFeedback?: string;
  initialStrengths?: string;
  initialImprovements?: string;
  initialSkillRatings?: Record<string, number>;
}

export default function FeedbackFormClient({
  applicationId,
  candidateName,
  opportunityTitle,
  skills,
  initialRating = 5,
  initialFeedback = "",
  initialStrengths = "",
  initialImprovements = "",
  initialSkillRatings = {},
}: FeedbackFormClientProps) {
  const router = useRouter();
  const [overallRating, setOverallRating] = useState<number>(initialRating);
  const [writtenFeedback, setWrittenFeedback] = useState(initialFeedback);
  const [strengths, setStrengths] = useState(initialStrengths);
  const [improvements, setImprovements] = useState(initialImprovements);
  const [skillRatings, setSkillRatings] = useState<Record<string, number>>(initialSkillRatings);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRatingChange = (skillId: string, rating: number) => {
    setSkillRatings((prev) => ({ ...prev, [skillId]: rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setSubmitting(true);
      const skillRatingsPayload = Object.entries(skillRatings).map(([skillId, rating]) => ({
        skillId,
        rating,
      }));

      const res = await fetch("/api/industry/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          overallRating,
          writtenFeedback,
          strengths,
          improvements,
          skillRatings: skillRatingsPayload,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
        try {
          confetti({
            particleCount: 90,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
        setTimeout(() => {
          router.push("/industry/candidates");
          router.refresh();
        }, 1500);
      } else {
        setError(data.detail || data.message || "Failed to submit feedback. Please check ratings.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "An unexpected network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ayush-card p-6 sm:p-8 space-y-6 max-w-3xl mx-auto">
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Award className="w-5 h-5 text-emerald-700" />
          <h2 className="text-lg font-bold text-slate-900">Official Industry Competency Endorsement</h2>
        </div>
        <p className="text-xs text-slate-500">
          Evaluating <strong className="text-slate-800">{candidateName}</strong> for tenure on &ldquo;
          <strong className="text-slate-800">{opportunityTitle}</strong>&rdquo;. Your rating upgrades the candidate&apos;s verified credentials.
        </p>
      </div>

      {/* Overall Star Rating */}
      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-emerald-900">
            Overall Candidate Performance Rating
          </label>
          <span className="text-sm font-black text-emerald-800">{overallRating} of 5 Stars</span>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setOverallRating(star)}
              className="p-1 text-2xl transition hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= overallRating ? "fill-amber-400 text-amber-400" : "text-slate-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Granular Skill Competency 1-5 Ratings */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          Individual Competency Endorsements (1 - 5 Stars):
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {skills.map((sk) => {
            const currentVal = skillRatings[sk.id] || 4;

            return (
              <div
                key={sk.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-slate-800">{sk.name}</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleRatingChange(sk.id, s)}
                      className="p-0.5"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          s <= currentVal ? "fill-amber-400 text-amber-400" : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Written Evaluation */}
      <div className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Written Testimonial / Performance Review *
          </label>
          <textarea
            required
            rows={3}
            value={writtenFeedback}
            onChange={(e) => setWrittenFeedback(e.target.value)}
            placeholder="Describe the candidate's dedication, clinical reasoning, protocol adherence, or formulation skills..."
            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Notable Strengths</label>
            <input
              type="text"
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              placeholder="e.g. Classical literature mastery, Case documentation"
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Recommended Growth Areas</label>
            <input
              type="text"
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              placeholder="e.g. Hands-on R/Python data packages"
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 border border-slate-200 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <span>This review permanently updates the student&apos;s digital portfolio with verified industry credentials.</span>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition flex items-center gap-2 disabled:opacity-50"
        >
          <CheckCircle2 className="w-4 h-4" />
          {submitted ? "Endorsement Published!" : submitting ? "Submitting..." : "Submit Official Endorsement"}
        </button>
      </div>
    </form>
  );
}
