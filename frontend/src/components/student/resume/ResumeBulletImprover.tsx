"use client";

import React, { useState } from "react";
import { Bot, Check, Edit3, Copy, Award } from "lucide-react";

export interface BulletItem {
  id?: string;
  originalText: string;
  improvedText: string;
  explanation: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "EDITED";
}

export interface Recommendation {
  category: "SKILLS" | "KEYWORDS" | "EXPERIENCE" | "STRUCTURE" | "CERTIFICATIONS";
  recommendation: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

interface ResumeBulletImproverProps {
  careerTitle: string;
  improvedBullets: BulletItem[];
  recommendations: Recommendation[];
  onBulletStatus: (idx: number, status: "ACCEPTED" | "REJECTED", customText?: string) => void;
}

export default function ResumeBulletImprover({
  careerTitle,
  improvedBullets,
  recommendations,
  onBulletStatus,
}: ResumeBulletImproverProps) {
  const [copiedBulletId, setCopiedBulletId] = useState<number | null>(null);
  const [editingBulletIndex, setEditingBulletIndex] = useState<number | null>(null);
  const [customEditText, setCustomEditText] = useState("");

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedBulletId(idx);
    setTimeout(() => setCopiedBulletId(null), 2000);
  };

  return (
    <>
      {/* AI BULLET POINT IMPROVER */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1.5px solid #E2E8F0",
          borderRadius: "16px",
          padding: "26px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-amber-600" />
              <h3 className="font-heading font-medium text-base text-slate-900">AI Bullet Point Improver</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Optimized using: <strong>Action Verb + Responsibilities + Context + Method</strong> without inventing fake claims.
            </p>
          </div>
          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-[8px]">
            {improvedBullets.length} Bullets Detected
          </span>
        </div>

        <div className="space-y-4 mt-6">
          {improvedBullets.map((bullet, idx) => (
            <div
              key={idx}
              style={{
                background: bullet.status === "ACCEPTED" ? "#F0FDF4" : "#F8FAFC",
                border: bullet.status === "ACCEPTED" ? "1.5px solid #86EFAC" : "1.5px solid #E2E8F0",
                borderRadius: "12px",
                padding: "20px",
              }}
              className="space-y-3 transition"
            >
              {/* Before / Original */}
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  ORIGINAL RESUME BULLET
                </span>
                <p className="text-xs text-slate-700 bg-white p-3 rounded-[8px] border border-slate-200 line-through opacity-85">
                  &ldquo;{bullet.originalText}&rdquo;
                </p>
              </div>

              {/* After / AI Improved */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800">
                    AI IMPROVED VERSION
                  </span>
                  {bullet.status === "ACCEPTED" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-[8px]">
                      <Check className="w-3 h-3 text-emerald-700" /> Accepted
                    </span>
                  )}
                </div>

                {editingBulletIndex === idx ? (
                  <div className="space-y-2">
                    <textarea
                      value={customEditText}
                      onChange={(e) => setCustomEditText(e.target.value)}
                      className="w-full p-2.5 text-xs text-slate-900 bg-white border border-emerald-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          onBulletStatus(idx, "ACCEPTED", customEditText);
                          setEditingBulletIndex(null);
                        }}
                        className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-bold cursor-pointer"
                      >
                        Save &amp; Accept
                      </button>
                      <button
                        onClick={() => setEditingBulletIndex(null)}
                        className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs font-bold text-slate-900 bg-emerald-50/60 p-3 rounded-lg border border-emerald-200/80 leading-relaxed">
                    {bullet.improvedText}
                  </p>
                )}
              </div>

              {/* Why this is better */}
              <div className="text-[11px] text-slate-600 bg-white/70 p-2.5 rounded-lg border border-slate-100 flex items-start gap-2">
                <span className="font-bold text-emerald-700 shrink-0">Why this works:</span>
                <span>{bullet.explanation}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 flex-wrap gap-2">
                <button
                  onClick={() => handleCopy(bullet.improvedText, idx)}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedBulletId === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy to Clipboard</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingBulletIndex(idx);
                      setCustomEditText(bullet.improvedText);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600 flex items-center gap-1 transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  {bullet.status !== "ACCEPTED" && (
                    <button
                      onClick={() => onBulletStatus(idx, "ACCEPTED")}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition shadow-sm cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept</span>
                    </button>
                  )}

                  {bullet.status !== "REJECTED" && (
                    <button
                      onClick={() => onBulletStatus(idx, "REJECTED")}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition cursor-pointer"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RESUME IMPROVEMENT RECOMMENDATIONS */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1.5px solid #E2E8F0",
          borderRadius: "16px",
          padding: "26px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        }}
      >
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
          <Award className="w-5 h-5 text-amber-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900">
              How to Improve Your Resume for {careerTitle}
            </h3>
            <p className="text-xs text-slate-500">Actionable modifications prioritizing highest ATS conversion</p>
          </div>
        </div>

        <div className="space-y-3">
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start gap-3"
            >
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase mt-0.5 shrink-0 ${
                  rec.priority === "HIGH"
                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                    : rec.priority === "MEDIUM"
                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {rec.priority}
              </span>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {rec.category}
                </span>
                <p className="text-xs text-slate-800 font-medium leading-relaxed">
                  {rec.recommendation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
