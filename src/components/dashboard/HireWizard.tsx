"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Calendar, HardDrive, Hash, CreditCard, Github, MessageCircle,
  ArrowRight, ArrowLeft, Sparkles, Check, Loader2,
  Code, BarChart3, Paintbrush, Headphones, Megaphone, FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SERVICE_DISPLAY } from "@/lib/trust/levels";
import {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperSeparator,
  StepperTitle,
  StepperNav,
} from "@/components/ui/stepper";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Mail, Calendar, HardDrive, Hash, CreditCard, Github, MessageCircle,
};

const PROVIDER_TO_SERVICES: Record<string, string[]> = {
  google: ["gmail", "calendar", "drive"],
  slack: ["slack"],
  stripe: ["stripe"],
  github: ["github"],
  discord: ["discord"],
};

const ROLE_TEMPLATES = [
  {
    id: "engineer",
    icon: Code,
    title: "Software Engineer",
    role: "Software Engineer",
    gradient: "from-indigo-500 to-violet-500",
    description: "Code reviews, issue triage, PR management",
    instructions: "You are a software engineer. Help with code reviews on GitHub, triage issues, create and comment on PRs, and assist with development workflows. Be thorough and follow best practices.",
    defaultServices: ["github", "slack"],
  },
  {
    id: "analyst",
    icon: BarChart3,
    title: "Business Analyst",
    role: "Business Analyst",
    gradient: "from-emerald-500 to-green-500",
    description: "Financial reports, invoice management, data analysis",
    instructions: "You are a business analyst. Help with Stripe financial data, create and manage invoices, analyze payment trends, and provide business insights. Be accurate with numbers and clear in explanations.",
    defaultServices: ["stripe", "gmail"],
  },
  {
    id: "designer",
    icon: Paintbrush,
    title: "Design Coordinator",
    role: "Design Coordinator",
    gradient: "from-pink-500 to-rose-500",
    description: "File management, feedback collection, design handoffs",
    instructions: "You are a design coordinator. Manage design files on Drive, collect feedback via email, coordinate design reviews, and organize assets. Keep things well-organized and communicate clearly.",
    defaultServices: ["drive", "gmail", "slack"],
  },
  {
    id: "support",
    icon: Headphones,
    title: "Support Agent",
    role: "Customer Support Representative",
    gradient: "from-amber-500 to-orange-500",
    description: "Email responses, ticket management, customer communication",
    instructions: "You are a customer support representative. Respond to customer emails professionally, manage support threads, escalate critical issues, and maintain a helpful tone. Prioritize customer satisfaction.",
    defaultServices: ["gmail", "slack"],
  },
  {
    id: "marketing",
    icon: Megaphone,
    title: "Marketing Manager",
    role: "Marketing Manager",
    gradient: "from-cyan-500 to-blue-500",
    description: "Campaign emails, scheduling, community management",
    instructions: "You are a marketing manager. Draft and send marketing emails, manage calendar for campaigns, engage with the community on Discord and Slack. Be creative and on-brand.",
    defaultServices: ["gmail", "calendar", "discord", "slack"],
  },
  {
    id: "custom",
    icon: FileText,
    title: "Custom Role",
    role: "",
    gradient: "from-gray-500 to-slate-600",
    description: "Define a completely custom employee from scratch",
    instructions: "",
    defaultServices: [],
  },
];

interface HireWizardProps {
  connectedProviders: string[];
}

export function HireWizard({ connectedProviders }: HireWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [instructions, setInstructions] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const connectedServices = connectedProviders.flatMap((p) => PROVIDER_TO_SERVICES[p] || []);
  const allServices = Object.keys(SERVICE_DISPLAY);

  function selectTemplate(templateId: string) {
    const template = ROLE_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    setSelectedTemplate(templateId);
    setRole(template.role);
    setInstructions(template.instructions);
    setSelectedServices(template.defaultServices.filter((s) => connectedServices.includes(s)));
    setStep(1);
  }

  function toggleService(service: string) {
    setSelectedServices((prev) => prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]);
  }

  function canProceed() {
    if (step === 1) return name.trim() && role.trim() && instructions.trim();
    if (step === 2) return selectedServices.length > 0;
    return true;
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, instructions, services: selectedServices }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to hire employee");
      }
      const agent = await res.json();
      router.push(`/dashboard/employee/${agent.slug}`);
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  }

  const steps = [
    { label: "Role", description: "Choose template" },
    { label: "Identity", description: "Name & configure" },
    { label: "Tools", description: "Assign services" },
    { label: "Review", description: "Confirm & hire" },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Premium Stepper */}
      <Stepper value={step + 1} className="mb-10">
        <StepperNav className="gap-0">
          {steps.map((s, i) => (
            <StepperItem key={s.label} step={i + 1} completed={i < step}>
              <StepperTrigger
                className="gap-3 px-2"
                onClick={() => {
                  if (i < step) setStep(i);
                }}
              >
                <StepperIndicator
                  className={`h-9 w-9 text-xs font-bold transition-all duration-300 ${
                    i < step
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : i === step
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 ring-4 ring-primary/10"
                      : "bg-muted/50 text-muted-foreground border border-border/50"
                  }`}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </StepperIndicator>
                <div className="hidden sm:block text-left">
                  <StepperTitle className={`text-[13px] ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>
                    {s.label}
                  </StepperTitle>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.description}</p>
                </div>
              </StepperTrigger>
              {i < steps.length - 1 && (
                <StepperSeparator className={`mx-2 ${i < step ? "bg-primary/40" : "bg-border/50"}`} />
              )}
            </StepperItem>
          ))}
        </StepperNav>
      </Stepper>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
          {/* Step 0: Role Templates */}
          {step === 0 && (
            <div>
              <h2 className="text-lg font-bold text-foreground mb-1">Choose a Role</h2>
              <p className="text-sm text-muted-foreground mb-6">Start from a template or create a custom role</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ROLE_TEMPLATES.map((template) => {
                  const Icon = template.icon;
                  return (
                    <button
                      key={template.id}
                      onClick={() => selectTemplate(template.id)}
                      className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative">
                        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${template.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-[14px] font-semibold text-foreground mb-1">{template.title}</h3>
                        <p className="text-[12px] text-muted-foreground leading-relaxed">{template.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 1: Identity */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-foreground mb-1">Employee Identity</h2>
                <p className="text-sm text-muted-foreground mb-6">Name your employee and customize their role</p>
              </div>
              {selectedTemplate && selectedTemplate !== "custom" && (
                <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3 flex items-center gap-3 mb-2">
                  <Sparkles className="h-4 w-4 text-primary shrink-0" />
                  <p className="text-[13px] text-foreground/80">
                    Pre-filled from <span className="font-semibold text-primary">{ROLE_TEMPLATES.find(t => t.id === selectedTemplate)?.title}</span> template. Customize as needed.
                  </p>
                </div>
              )}
              <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 space-y-5">
                <div>
                  <label className="block text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Employee Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex, Jordan, Atlas..." className="h-11 rounded-xl bg-muted/30 border-border/50" autoFocus />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Role / Title</label>
                  <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Sales Development, Community Manager..." className="h-11 rounded-xl bg-muted/30 border-border/50" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Instructions</label>
                  <Textarea value={instructions} onChange={(e) => setInstructions(e.target.value.slice(0, 2000))} rows={5} placeholder="Describe what this employee should do..." className="rounded-xl bg-muted/30 border-border/50" />
                  <p className="text-[11px] text-muted-foreground mt-1.5 text-right tabular-nums">{instructions.length}/2000</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Tools */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-bold text-foreground mb-1">Assign Tools</h2>
              <p className="text-sm text-muted-foreground mb-6">Select which services this employee can access</p>
              <div className="grid grid-cols-2 gap-3">
                {allServices.map((service) => {
                  const display = SERVICE_DISPLAY[service];
                  if (!display) return null;
                  const IconComp = ICON_MAP[display.icon];
                  const isConnected = connectedServices.includes(service);
                  const isSelected = selectedServices.includes(service);
                  return (
                    <button
                      key={service}
                      onClick={() => isConnected && toggleService(service)}
                      disabled={!isConnected}
                      className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${
                        isSelected
                          ? "border-primary/40 bg-primary/5 shadow-sm shadow-primary/10"
                          : isConnected
                          ? "border-border/50 bg-card/50 hover:border-border hover:bg-card/80"
                          : "border-border/30 bg-muted/20 opacity-40 cursor-not-allowed"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        {IconComp && <IconComp className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />}
                        <div>
                          <span className={`text-sm font-medium ${isSelected ? "text-foreground" : "text-foreground/80"}`}>{display.label}</span>
                          {!isConnected && <p className="text-[11px] text-muted-foreground">Connect in Settings</p>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-bold text-foreground mb-1">Review & Hire</h2>
              <p className="text-sm text-muted-foreground mb-6">Confirm your new employee&apos;s details</p>
              <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-xl font-bold text-primary-foreground shadow-lg ring-1 ring-white/20">
                    {name[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{name}</h3>
                    <p className="text-sm text-muted-foreground">{role}</p>
                  </div>
                </div>
                <div className="h-px bg-border/50" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Instructions</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">{instructions.length > 200 ? instructions.slice(0, 200) + "..." : instructions}</p>
                </div>
                <div className="h-px bg-border/50" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Assigned Services</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedServices.map((s) => {
                      const display = SERVICE_DISPLAY[s];
                      const IconComp = display ? ICON_MAP[display.icon] : null;
                      return (
                        <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 text-sm text-foreground/80 border border-border/50">
                          {IconComp && <IconComp className="h-3.5 w-3.5" />}
                          {display?.label || s}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div className="h-px bg-border/50" />
                <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 px-4 py-3">
                  <p className="text-[13px] text-muted-foreground">
                    Starts at <span className="font-semibold text-amber-400">L0 Probationary</span> with read-only access. Trust earned through successful work.
                  </p>
                </div>
                {error && (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {step > 0 && (
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />Back
          </button>
          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-foreground bg-gradient-to-b from-primary/20 to-primary/5 border border-primary/20 backdrop-blur-sm shadow-sm hover:shadow-md hover:shadow-primary/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              Continue <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-primary-foreground bg-primary shadow-lg shadow-primary/25 hover:bg-primary/90 disabled:opacity-50 transition-all duration-200"
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Hiring...</>
              ) : (
                <><Sparkles className="h-4 w-4" />Hire {name || "Employee"}</>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
