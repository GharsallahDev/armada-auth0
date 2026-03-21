import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import {
  Shield,
  Brain,
  Activity,
  Lock,
  ChevronRight,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth0.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight">Armada</span>
        </div>
        <a href="/auth/login">
          <Button variant="outline" size="sm">
            Sign In
          </Button>
        </a>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
            <Zap className="h-3.5 w-3.5" />
            Built on Auth0 Token Vault + CIBA + Progressive Trust
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            A fleet of AI agents,
            <br />
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              each authorized, audited,
            </span>
            <br />
            and accountable.
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Armada manages your business operations across Gmail, Calendar,
            Stripe, Slack, and Drive — with agents that{" "}
            <strong className="text-foreground">earn your trust</strong> over
            time, not demand it upfront.
          </p>

          <div className="flex gap-4 justify-center">
            <a href="/auth/login?screen_hint=signup">
              <Button size="lg" className="gap-2">
                Get Started <ChevronRight className="h-4 w-4" />
              </Button>
            </a>
            <a href="/auth/login">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </a>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto mt-24">
          {[
            {
              icon: Lock,
              title: "Progressive Trust",
              desc: "Agents start read-only and earn permissions through successful operations. Trust decays over time.",
            },
            {
              icon: Brain,
              title: "Multi-Agent Fleet",
              desc: "4 specialized agents — Comms, Scheduler, Finance, Docs — coordinated by an intelligent orchestrator.",
            },
            {
              icon: Shield,
              title: "CIBA Approvals",
              desc: "High-stakes actions require real-time human approval via push notification. Always in control.",
            },
            {
              icon: Activity,
              title: "Full Audit Trail",
              desc: "Every agent action logged with trust level, service, duration, and CIBA status. Complete transparency.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-card p-6 space-y-3"
            >
              <f.icon className="h-8 w-8 text-muted-foreground" />
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-6 text-center text-sm text-muted-foreground">
        Armada — Built for the{" "}
        <a
          href="https://authorizedtoact.devpost.com"
          className="underline hover:text-foreground"
          target="_blank"
          rel="noreferrer"
        >
          Authorized to Act
        </a>{" "}
        hackathon with Auth0 for AI Agents.
      </footer>
    </div>
  );
}
