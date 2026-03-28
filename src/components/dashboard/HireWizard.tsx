"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Mail, Calendar, HardDrive, Hash, CreditCard, Github, MessageCircle,
  ArrowRight, ArrowLeft, Sparkles, Check, Loader2, Search, ChevronDown,
  Code, BarChart3, Paintbrush, Headphones, Megaphone, FileText,
  Database, ShieldCheck, Workflow, Bot, BrainCircuit, GraduationCap,
  Dices, RefreshCw, User, TrendingUp,
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
  linkedin: ["linkedin"],
  twitter: ["twitter"],
  facebook: ["facebook"],
  instagram: ["instagram"],
  shopify: ["shopify"],
  paypal: ["paypal"],
  klarna: ["klarna"],
  dropbox: ["dropbox"],
  box: ["box"],
  figma: ["figma"],
  bitbucket: ["bitbucket"],
  salesforce: ["salesforce"],
  hubspot: ["hubspot"],
  spotify: ["spotify"],
  twitch: ["twitch"],
  vimeo: ["vimeo"],
  amazon: ["amazon"],
  microsoft: ["microsoft"],
  quickbooks: ["quickbooks"],
  freshbooks: ["freshbooks"],
  wordpress: ["wordpress"],
  snapchat: ["snapchat"],
  tumblr: ["tumblr"],
  apple: ["apple"],
  dribbble: ["dribbble"],
};

const RANDOM_NAMES = [
  "Atlas", "Nova", "Orion", "Sage", "Kai", "Echo", "Lyra", "Phoenix",
  "Aria", "Zephyr", "Cleo", "Dash", "Ember", "Flux", "Ivy", "Juno",
  "Luna", "Milo", "Neo", "Onyx", "Pixel", "Quinn", "Raven", "Silo",
  "Titan", "Vega", "Wren", "Xena", "Yuri", "Zen", "Axel", "Blaze",
  "Cipher", "Drift", "Eos", "Finn", "Glitch", "Halo", "Ion", "Jade",
];

// DiceBear avatar styles to cycle through
const AVATAR_STYLES = [
  "bottts", "bottts-neutral", "shapes", "identicon", "thumbs", "fun-emoji", "adventurer-neutral", "avataaars-neutral",
];

function getAvatarUrl(seed: string, style: string) {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}&size=128&backgroundColor=transparent`;
}

function generateRandomName() {
  return RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
}

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
    id: "devops",
    icon: Workflow,
    title: "DevOps Engineer",
    role: "DevOps Engineer",
    gradient: "from-teal-500 to-cyan-600",
    description: "CI/CD pipelines, deployments, infrastructure automation",
    instructions: "You are a DevOps engineer. Manage GitHub repositories, automate CI/CD pipelines, monitor deployments, and handle infrastructure tasks. Prioritize reliability and automation.",
    defaultServices: ["github", "slack"],
  },
  {
    id: "data",
    icon: Database,
    title: "Data Analyst",
    role: "Data Analyst",
    gradient: "from-violet-500 to-purple-600",
    description: "Data extraction, reporting, spreadsheet management",
    instructions: "You are a data analyst. Extract data from connected services, create reports, manage spreadsheets in Drive, and provide data-driven insights. Be precise and thorough with numbers.",
    defaultServices: ["drive", "gmail", "slack"],
  },
  {
    id: "compliance",
    icon: ShieldCheck,
    title: "Compliance Officer",
    role: "Compliance & Security Officer",
    gradient: "from-red-500 to-rose-600",
    description: "Audit reviews, policy enforcement, security monitoring",
    instructions: "You are a compliance officer. Monitor agent activities, review audit logs, enforce security policies, and flag suspicious behaviors. Always prioritize security and compliance.",
    defaultServices: ["gmail", "slack"],
  },
  {
    id: "researcher",
    icon: BrainCircuit,
    title: "Research Assistant",
    role: "Research Assistant",
    gradient: "from-sky-500 to-blue-600",
    description: "Information gathering, summarization, knowledge management",
    instructions: "You are a research assistant. Gather information from various sources, summarize findings, organize knowledge, and support decision-making with well-researched insights.",
    defaultServices: ["gmail", "drive", "slack"],
  },
  {
    id: "onboarding",
    icon: GraduationCap,
    title: "Onboarding Specialist",
    role: "Onboarding Specialist",
    gradient: "from-lime-500 to-green-600",
    description: "New hire setup, training workflows, documentation",
    instructions: "You are an onboarding specialist. Help set up new team members, manage onboarding workflows, send welcome emails, schedule orientation meetings, and maintain training documentation.",
    defaultServices: ["gmail", "calendar", "slack"],
  },
  {
    id: "sales",
    icon: TrendingUp,
    title: "Sales Development",
    role: "Sales Development Representative",
    gradient: "from-orange-500 to-amber-500",
    description: "Lead management, customer outreach, payment tracking",
    instructions: "You are a sales development representative. Manage customer relationships via email, track invoices and payments in Stripe, schedule meetings with prospects, and follow up with leads. Be proactive and maintain strong customer relationships.",
    defaultServices: ["gmail", "stripe", "calendar"],
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

const ROLE_SUGGESTIONS = [
  { label: "Software Engineer", icon: Code, color: "text-indigo-400" },
  { label: "Business Analyst", icon: BarChart3, color: "text-emerald-400" },
  { label: "Design Coordinator", icon: Paintbrush, color: "text-pink-400" },
  { label: "Customer Support Representative", icon: Headphones, color: "text-amber-400" },
  { label: "Marketing Manager", icon: Megaphone, color: "text-cyan-400" },
  { label: "DevOps Engineer", icon: Workflow, color: "text-teal-400" },
  { label: "Data Analyst", icon: Database, color: "text-violet-400" },
  { label: "Compliance & Security Officer", icon: ShieldCheck, color: "text-red-400" },
  { label: "Research Assistant", icon: BrainCircuit, color: "text-sky-400" },
  { label: "Onboarding Specialist", icon: GraduationCap, color: "text-lime-400" },
  { label: "Project Manager", icon: Workflow, color: "text-orange-400" },
  { label: "Sales Development Rep", icon: Megaphone, color: "text-blue-400" },
  { label: "Community Manager", icon: MessageCircle, color: "text-purple-400" },
  { label: "Content Writer", icon: FileText, color: "text-rose-400" },
  { label: "QA Engineer", icon: ShieldCheck, color: "text-green-400" },
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
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [roleSearch, setRoleSearch] = useState("");
  const [avatarStyle, setAvatarStyle] = useState(AVATAR_STYLES[0]);
  const [avatarSeed, setAvatarSeed] = useState(() => Math.random().toString(36).slice(2));
  const [isGeneratingName, setIsGeneratingName] = useState(false);

  const connectedServices = connectedProviders.flatMap((p) => PROVIDER_TO_SERVICES[p] || []);
  const allServices = Object.keys(SERVICE_DISPLAY);

  const avatarUrl = getAvatarUrl(avatarSeed + (name || "employee"), avatarStyle);

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

  const handleRandomName = useCallback(() => {
    setIsGeneratingName(true);
    // Quick shuffle animation
    let count = 0;
    const interval = setInterval(() => {
      setName(generateRandomName());
      count++;
      if (count >= 6) {
        clearInterval(interval);
        setIsGeneratingName(false);
      }
    }, 60);
  }, []);

  function regenerateAvatar() {
    const currentIdx = AVATAR_STYLES.indexOf(avatarStyle);
    const nextIdx = (currentIdx + 1) % AVATAR_STYLES.length;
    setAvatarStyle(AVATAR_STYLES[nextIdx]);
    setAvatarSeed(Math.random().toString(36).slice(2));
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, instructions, services: selectedServices, avatarUrl }),
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
    <div className="w-full max-w-5xl mx-auto">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
            <div className="space-y-6 max-w-3xl mx-auto">
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

              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative group">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/10 to-violet-500/10 border-2 border-border/50 overflow-hidden flex items-center justify-center shadow-lg">
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={regenerateAvatar}
                    className="absolute -bottom-1 -right-1 h-7 w-7 rounded-lg bg-card border border-border/50 shadow-md flex items-center justify-center hover:bg-muted/50 hover:border-primary/30 transition-all group-hover:scale-110"
                    title="Regenerate avatar"
                  >
                    <RefreshCw className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground/50">Click to regenerate avatar</p>
              </div>

              <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 space-y-5">
                {/* Name with random generator */}
                <div>
                  <label className="block text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Employee Name</label>
                  <div className="flex gap-2">
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex, Jordan, Atlas..." className="h-11 rounded-xl bg-muted/30 border-border/50 flex-1" autoFocus />
                    <button
                      type="button"
                      onClick={handleRandomName}
                      disabled={isGeneratingName}
                      className={cn(
                        "h-11 px-3.5 rounded-xl border flex items-center gap-2 transition-all duration-300 shrink-0",
                        isGeneratingName
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border/50 bg-muted/30 text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                      )}
                      title="Generate random name"
                    >
                      <Dices className={cn("h-4 w-4 transition-transform", isGeneratingName && "animate-spin")} />
                      <motion.span
                        animate={{
                          display: "inline",
                          opacity: 1,
                        }}
                        className="text-[12px] font-medium hidden sm:inline"
                      >
                        Random
                      </motion.span>
                    </button>
                  </div>
                </div>

                {/* Role / Title searchable dropdown */}
                <div className="relative">
                  <label className="block text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Role / Title</label>
                  <div className="relative">
                    <div
                      className={cn(
                        "flex items-center h-11 rounded-xl border transition-all duration-200 cursor-text",
                        roleDropdownOpen
                          ? "border-primary/40 ring-2 ring-primary/10 bg-background"
                          : "border-border/50 bg-muted/30 hover:border-border"
                      )}
                      onClick={() => setRoleDropdownOpen(true)}
                    >
                      <Search className="h-3.5 w-3.5 text-muted-foreground/50 ml-3 shrink-0" />
                      <input
                        value={roleDropdownOpen ? roleSearch : role}
                        onChange={(e) => {
                          setRoleSearch(e.target.value);
                          setRole(e.target.value);
                        }}
                        onFocus={() => {
                          setRoleDropdownOpen(true);
                          setRoleSearch(role);
                        }}
                        onBlur={() => setTimeout(() => setRoleDropdownOpen(false), 200)}
                        placeholder="Search roles or type custom..."
                        className="flex-1 h-full bg-transparent border-none outline-none text-sm px-2 placeholder:text-muted-foreground/40"
                      />
                      <ChevronDown className={cn(
                        "h-3.5 w-3.5 text-muted-foreground/50 mr-3 shrink-0 transition-transform duration-200",
                        roleDropdownOpen && "rotate-180"
                      )} />
                    </div>
                    <AnimatePresence>
                      {roleDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: "auto" }}
                          exit={{ opacity: 0, y: -4, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="absolute z-20 top-full left-0 right-0 mt-1.5 rounded-xl border border-border/50 bg-card/95 dark:bg-card/98 backdrop-blur-xl shadow-xl shadow-black/10 overflow-hidden"
                        >
                          <div className="max-h-[220px] overflow-y-auto py-1.5 px-1.5">
                            {ROLE_SUGGESTIONS
                              .filter((r) => !roleSearch || r.label.toLowerCase().includes(roleSearch.toLowerCase()))
                              .map((suggestion) => {
                                const Icon = suggestion.icon;
                                const isSelected = role === suggestion.label;
                                return (
                                  <button
                                    key={suggestion.label}
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      setRole(suggestion.label);
                                      setRoleSearch(suggestion.label);
                                      setRoleDropdownOpen(false);
                                    }}
                                    className={cn(
                                      "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors",
                                      isSelected
                                        ? "bg-primary/10 text-foreground"
                                        : "text-muted-foreground hover:bg-muted/40 dark:hover:bg-white/[0.06] hover:text-foreground"
                                    )}
                                  >
                                    <div className={cn(
                                      "h-7 w-7 rounded-lg flex items-center justify-center shrink-0",
                                      isSelected ? "bg-primary/15" : "bg-muted/40 dark:bg-white/[0.06]"
                                    )}>
                                      <Icon className={cn("h-3.5 w-3.5", isSelected ? "text-primary" : suggestion.color)} />
                                    </div>
                                    <span className="text-[13px] font-medium">{suggestion.label}</span>
                                    {isSelected && <Check className="h-3.5 w-3.5 text-primary ml-auto shrink-0" />}
                                  </button>
                                );
                              })}
                            {roleSearch && !ROLE_SUGGESTIONS.some((r) => r.label.toLowerCase() === roleSearch.toLowerCase()) && (
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setRole(roleSearch);
                                  setRoleDropdownOpen(false);
                                }}
                                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-muted-foreground hover:bg-muted/40 dark:hover:bg-white/[0.06] hover:text-foreground transition-colors"
                              >
                                <div className="h-7 w-7 rounded-lg bg-muted/40 dark:bg-white/[0.06] flex items-center justify-center shrink-0">
                                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <span className="text-[13px] font-medium">Use &ldquo;{roleSearch}&rdquo; as custom role</span>
                              </button>
                            )}
                          </div>
                          <div className="px-3 py-2 border-t border-border/30 flex items-center justify-between text-[10px] text-muted-foreground/50">
                            <span>Type to filter or create custom</span>
                            <span>ESC to close</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
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
            <div className="max-w-3xl mx-auto">
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
            <div className="max-w-3xl mx-auto">
              <h2 className="text-lg font-bold text-foreground mb-1">Review & Hire</h2>
              <p className="text-sm text-muted-foreground mb-6">Confirm your new employee&apos;s details</p>
              <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-violet-500/20 border border-border/50 shadow-lg flex items-center justify-center">
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
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
        <div className="flex items-center justify-between mt-8 max-w-3xl mx-auto">
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
