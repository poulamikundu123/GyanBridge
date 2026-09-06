import AppShell from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { industryApi } from "@/lib/apiClient";
import { MapPin, Globe, Mail } from "lucide-react";
import { redirect } from "next/navigation";

export default async function IndustryProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "INDUSTRY") redirect(`/${user.role.toLowerCase()}/dashboard`);

  const [industry, dashboard] = await Promise.all([
    industryApi.getProfile().catch(() => null),
    industryApi.getDashboard().catch(() => null),
  ]);

  if (!industry) {
    return (
      <AppShell allowedRole="INDUSTRY">
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500 text-sm">Industry profile details are loading or currently being initialized.</p>
        </div>
      </AppShell>
    );
  }

  const companyName = industry.company_name || industry.companyName || "AYUSH Enterprise";
  const sectorName = typeof industry.sector === "string" ? industry.sector : (industry.sector?.name || "AYUSH Healthcare");
  const location = industry.location || "India";
  const description = industry.description || "Leading innovations in AYUSH manufacturing and clinical applications.";
  const website = industry.website;

  return (
    <AppShell allowedRole="INDUSTRY">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-emerald-950 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-lg">
              {companyName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">{companyName}</h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
                  Verified Industry Partner
                </span>
              </div>
              <p className="text-xs text-blue-100/80 mt-1">{sectorName} • {location}</p>
            </div>
          </div>

          <p className="text-xs text-blue-100/90 leading-relaxed mt-4 pt-4 border-t border-white/10">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="ayush-card p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Contact & Organization Meta</h3>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{user.email}</span>
              </div>
              {website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <a href={website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                    {website}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{location}</span>
              </div>
            </div>
          </div>

          <div className="ayush-card p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Ecosystem Activity</h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-xl font-black text-slate-900">{dashboard?.active_opportunities_count ?? 0}</span>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Active Postings</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-xl font-black text-emerald-700">{dashboard?.total_applicants_count ?? 0}</span>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Applicants</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
