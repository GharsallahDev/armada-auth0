"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Calendar, HardDrive, Hash, CreditCard, Github, MessageCircle,
  ArrowRight, ArrowLeft, Sparkles, Check, Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SERVICE_DISPLAY } from "@/lib/trust/levels";

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

interface HireWizardProps {
  connectedProviders: string[];
}

export function HireWizard({ connectedProviders }: HireWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [instructions, setInstructions] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const connectedServices = connectedProviders.flatMap((p) => PROVIDER_TO_SERVICES[p] || []);
  const allServices = Object.keys(SERVICE_DISPLAY);

  function toggleService(service: string) {
    setSelectedServices((prev) => prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]);
  }

  function canProceed() {
    if (step === 0) return name.trim() && role.trim() && instructions.trim();
    if (step === 1) return selectedServices.length > 0;
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

  const steps = ["Identity", "Tools", "Review"];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-8">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : "bg-muted text-muted-foreground"
            }`}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-xs font-medium ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
            {i < steps.length - 1 && <div className={`flex-1 h-px ${i < step ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
          {step === 0 && (
            <Card>
              <CardContent className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">Employee Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex, Jordan, Atlas..." className="h-10" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">Role / Title</label>
                  <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Sales Development, Community Manager..." className="h-10" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">Instructions</label>
                  <Textarea value={instructions} onChange={(e) => setInstructions(e.target.value.slice(0, 2000))} rows={4} placeholder="Describe what this employee should do, how they should behave, and any constraints..." />
                  <p className="text-[11px] text-muted-foreground mt-1 text-right tabular-nums">{instructions.length}/2000</p>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Select which services this employee can access. Only connected services are available.</p>
              <div className="grid grid-cols-2 gap-3">
                {allServices.map((service) => {
                  const display = SERVICE_DISPLAY[service];
                  if (!display) return null;
                  const IconComp = ICON_MAP[display.icon];
                  const isConnected = connectedServices.includes(service);
                  const isSelected = selectedServices.includes(service);
                  return (
                    <Card
                      key={service}
                      className={`cursor-pointer transition-all duration-200 ${
                        isSelected ? "ring-2 ring-primary bg-primary/[0.05]" : isConnected ? "hover:ring-1 hover:ring-border" : "opacity-40 cursor-not-allowed"
                      }`}
                      onClick={() => isConnected && toggleService(service)}
                    >
                      <CardContent className="relative py-3">
                        {isSelected && (
                          <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                        <div className="flex items-center gap-3 mb-1">
                          {IconComp && <IconComp className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />}
                          <span className={`text-sm font-medium ${isSelected ? "text-foreground" : "text-foreground/80"}`}>{display.label}</span>
                        </div>
                        {!isConnected && <p className="text-[11px] text-muted-foreground ml-8">Connect in Settings</p>}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <Card>
              <CardContent className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-xl font-bold text-primary-foreground shadow-lg ring-1 ring-border">
                    {name[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{name}</h3>
                    <p className="text-sm text-muted-foreground">{role}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Instructions</p>
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{instructions.length > 200 ? instructions.slice(0, 200) + "..." : instructions}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Assigned Services</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedServices.map((s) => {
                      const display = SERVICE_DISPLAY[s];
                      const IconComp = display ? ICON_MAP[display.icon] : null;
                      return (
                        <Badge key={s} variant="secondary" className="gap-1.5 px-2.5 py-1">
                          {IconComp && <IconComp className="h-3.5 w-3.5" />}
                          {display?.label || s}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                <Separator />
                <p className="text-xs text-muted-foreground">
                  This employee will start at <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 mx-1">Probationary</Badge> trust level with read-only access. They will earn promotions through successful work.
                </p>
                {error && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between mt-6">
        <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0} className={step === 0 ? "invisible" : ""}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />Back
        </Button>
        {step < 2 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
            Continue<ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting} className="shadow-lg shadow-primary/25">
            {isSubmitting ? (<><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Hiring...</>) : (<><Sparkles className="h-4 w-4 mr-1.5" />Hire {name || "Employee"}</>)}
          </Button>
        )}
      </div>
    </div>
  );
}
