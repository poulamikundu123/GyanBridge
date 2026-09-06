import { getCurrentUser } from "@/lib/auth";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingHero from "@/components/landing/LandingHero";
import PersonaShowcase from "@/components/landing/PersonaShowcase";
import PlatformFeatures from "@/components/landing/PlatformFeatures";
import WorkflowSection from "@/components/landing/WorkflowSection";
import ImpactMetrics from "@/components/landing/ImpactMetrics";
import LandingCta from "@/components/landing/LandingCta";
import LandingFooter from "@/components/landing/LandingFooter";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      <LandingNavbar currentUser={user} />
      <main className="flex-1">
        <LandingHero />
        <PersonaShowcase />
        <PlatformFeatures />
        <WorkflowSection />
        <ImpactMetrics />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
