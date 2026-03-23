import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { Nav } from "@/components/landing/nav";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { TrustLevels } from "@/components/landing/trust-levels";
import { PoweredBy } from "@/components/landing/powered-by";
import { CtaSection } from "@/components/landing/cta-section";

export default async function Home() {
  const session = await auth0.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/10">
      <Nav />

      <main>
        <HeroSection />
        <HowItWorks />
        <TrustLevels />
        <PoweredBy />
        <CtaSection />
      </main>

      {/* Footer */}
      <footer className="relative border-t border-border/50 px-6 py-8 text-center">
        <p className="text-[12px] text-muted-foreground tracking-[-0.01em]">
          Armada — Built for the{" "}
          <a
            href="https://authorizedtoact.devpost.com"
            className="text-primary/60 hover:text-primary transition-colors underline underline-offset-2 decoration-primary/20"
            target="_blank"
            rel="noreferrer"
          >
            Authorized to Act
          </a>{" "}
          hackathon by Auth0.
        </p>
      </footer>
    </div>
  );
}
