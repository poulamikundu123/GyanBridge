import AppShell from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { institutionApi } from "@/lib/apiClient";
import { Network } from "lucide-react";
import { redirect } from "next/navigation";

interface PartnerItem {
  id: string;
  company_name?: string;
  companyName?: string;
  sector?: string | { name?: string };
  location?: string;
  description?: string;
  active_opportunities_count?: number;
  _count?: { opportunities?: number };
}

export default async function InstitutionCollaborationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "INSTITUTION") redirect(`/${user.role.toLowerCase()}/dashboard`);

  const industryProfiles: PartnerItem[] = await institutionApi.getCollaborations().catch(() => []);

  return (
    <AppShell allowedRole="INSTITUTION">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <Network className="w-6 h-6 text-emerald-700" />
              <h1 className="font-heading font-bold text-2xl text-slate-900">Institutional & Industry Partnerships</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active enterprise partners and research consortiums connected through the AYUSH Skill Intelligence Layer
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {industryProfiles.length === 0 ? (
            <div className="col-span-2 ayush-card p-8 text-center text-slate-500 text-sm">
              No active industry partnerships found.
            </div>
          ) : (
            industryProfiles.map((ind) => {
              const compName = ind.companyName || ind.company_name || "AYUSH Partner";
              const sectorName = typeof ind.sector === "string" ? ind.sector : (ind.sector?.name || "AYUSH Healthcare");
              const oppCount = ind.active_opportunities_count ?? ind._count?.opportunities ?? 0;

              return (
                <div key={ind.id} className="ayush-card p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-[8px] bg-blue-100 text-blue-800">
                      {sectorName}
                    </span>
                    <span className="text-xs font-mono text-emerald-700 font-semibold">{oppCount} Active Postings</span>
                  </div>
                  <h3 className="font-heading font-medium text-base text-slate-900">{compName}</h3>
                  <p className="text-xs text-slate-500">{ind.location || "India"}</p>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{ind.description}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}
