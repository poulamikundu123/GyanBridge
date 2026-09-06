"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Clock, Sparkles, Edit3, Check, X, ShieldCheck } from "lucide-react";

interface MentorshipOffering {
  id: string;
  expertise: string;
  availability: string;
  bio?: string | null;
}

interface Props {
  offering: MentorshipOffering | null;
  facultyName: string;
  institution?: string;
  designation?: string;
}

export default function FacultyMentorshipProfileCard({
  offering,
  facultyName,
  institution = "AYUSH Institution",
  designation = "Faculty Member",
}: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [expertise, setExpertise] = useState(offering?.expertise || "Ayurvedic Clinical Guidance & Research Protocols");
  const [availability, setAvailability] = useState(offering?.availability || "3 hrs/week");
  const [bio, setBio] = useState(offering?.bio || `Faculty mentor in research and clinical studies at ${institution}.`);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/faculty/mentorship-offering", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expertise, availability, bio }),
      });
      const data = await res.json();
      if (data.success) {
        setIsEditing(false);
        setSuccessMsg("Mentorship profile updated successfully!");
        setTimeout(() => setSuccessMsg(""), 4000);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to update mentorship offering", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ayush-card p-6 border-2 border-purple-100 bg-gradient-to-br from-white via-purple-50/20 to-slate-50 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-base text-slate-900">
                Your Public Mentorship Profile
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Active &amp; Visible to Students
              </span>
            </div>
            <p className="text-xs text-slate-500">
              This card is published on the Student Mentorship portal for all students to discover and send guidance requests.
            </p>
          </div>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-300 bg-white text-purple-800 hover:bg-purple-50 text-xs font-semibold shadow-2xs transition self-start sm:self-auto"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Profile &amp; Slots
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mentoring Focus &amp; Expertise Areas
              </label>
              <input
                type="text"
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
                placeholder="e.g. Clinical Protocols, Dravyaguna Standardization, CTRI"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mentoring Availability
              </label>
              <input
                type="text"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                placeholder="e.g. 3 hrs/week (Weekends & Evenings)"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mentorship Guidance Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell students about your research domain, thesis topics you can guide, and expectations..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              {saving ? "Saving..." : "Save Mentorship Profile"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
          <div className="p-3.5 rounded-xl bg-white border border-slate-200">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Mentoring Focus &amp; Expertise
            </div>
            <p className="font-semibold text-slate-900 leading-snug">
              {offering?.expertise || expertise}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              Availability Commitment
            </div>
            <p className="font-semibold text-slate-900 leading-snug">
              {offering?.availability || availability}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              <Users className="w-3.5 h-3.5 text-purple-600" />
              Mentoring Bio
            </div>
            <p className="text-slate-600 leading-snug line-clamp-2">
              {offering?.bio || bio}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
