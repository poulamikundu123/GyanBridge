"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, XCircle } from "lucide-react";

interface ActionButtonsProps {
  requestId: string;
  currentStatus: string;
}

export default function FacultyMentorshipActionButtons({ requestId, currentStatus }: ActionButtonsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async (status: string) => {
    try {
      setLoading(true);
      const res = await fetch("/api/faculty/mentorship-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status }),
      });
      const data = await res.json();
      if (data.success) {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {currentStatus === "REQUESTED" ? (
        <>
          <button
            onClick={() => handleAction("ACCEPTED")}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" /> Accept Mentorship
          </button>
          <button
            onClick={() => handleAction("DECLINED")}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 font-semibold text-xs transition"
          >
            Decline
          </button>
        </>
      ) : currentStatus === "ACCEPTED" ? (
        <button
          onClick={() => handleAction("COMPLETED")}
          disabled={loading}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-800 text-white font-bold text-xs transition"
        >
          Mark Completed
        </button>
      ) : (
        <span className="text-xs text-slate-500 font-semibold">Mentorship {currentStatus}</span>
      )}
    </div>
  );
}
