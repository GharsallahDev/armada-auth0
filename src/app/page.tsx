import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { Nav } from "@/components/landing/nav";
import { HeroSection } from "@/components/landing/hero-section";
import { Terminal } from "@/components/landing/terminal";
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

        {/* Terminal visual */}
        <section className="pb-24 px-6">
          <Terminal />
        </section>

        {/* Divider */}
        <div className="max-w-3xl mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-primary/[0.12] to-transparent" />
        </div>

        <HowItWorks />

        {/* Divider */}
        <div className="max-w-3xl mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-primary/[0.12] to-transparent" />
        </div>

        <TrustLevels />

        {/* Divider */}
        <div className="max-w-3xl mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-primary/[0.12] to-transparent" />
        </div>

        <PoweredBy />

        {/* Divider */}
        <div className="max-w-3xl mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-primary/[0.12] to-transparent" />
        </div>

        <CtaSection />
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center">
        <p className="text-[12px] text-muted-foreground tracking-[-0.01em]">
          Armada -- Built for the{" "}
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
