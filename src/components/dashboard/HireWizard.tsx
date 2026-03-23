"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Calendar, HardDrive, Hash, CreditCard, Github, MessageCircle,
  ArrowRight, ArrowLeft, Sparkles, Check, Loader2,
} from "lucide-react";
import { SERVICE_DISPLAY } from "@/lib/trust/levels";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Mail, Calendar, HardDrive, Hash, CreditCard, Github, MessageCircle,
};

// Map providers from /api/services to individual service names
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

  // Form state
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [instructions, setInstructions] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // Which services are available (connected)?
  const connectedServices = connectedProviders.flatMap(
    (p) => PROVIDER_TO_SERVICES[p] || []
  );
  const allServices = Object.keys(SERVICE_DISPLAY);

  function toggleService(service: string) {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
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
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-all duration-300 ${
              i <= step
                ? "bg-indigo-500 text-white"
                : "bg-white/[0.06] text-neutral-600"
            }`}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-[12px] font-medium ${
              i <= step ? "text-neutral-200" : "text-neutral-600"
            }`}>
              {label}
            </span>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px ${
                i < step ? "bg-indigo-500" : "bg-white/[0.06]"
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {step === 0 && (
            <div className="space-y-5">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 space-y-5">
                <div>
                  <label className="block text-[12px] font-medium text-neutral-400 mb-2">
                    Employee Name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex, Jordan, Atlas..."
                    className="w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[14px] text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-neutral-400 mb-2">
                    Role / Title
                  </label>
                  <input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Sales Development, Community Manager..."
                    className="w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[14px] text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-neutral-400 mb-2">
                    Instructions
                  </label>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value.slice(0, 2000))}
                    rows={4}
                    placeholder="Describe what this employee should do, how they should behave, and any constraints..."
                    className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[14px] text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none"
                  />
                  <p className="text-[11px] text-neutral-600 mt-1 text-right">
                    {instructions.length}/2000
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-[13px] text-neutral-400">
                Select which services this employee can access. Only connected services are available.
              </p>
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
                      className={`relative rounded-xl border p-4 text-left transition-all duration-200 ${
                        isSelected
                          ? "border-indigo-500/50 bg-indigo-500/[0.08]"
                          : isConnected
                            ? "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]"
                            : "border-white/[0.04] bg-white/[0.01] opacity-40 cursor-not-allowed"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                      <div className="flex items-center gap-3 mb-2">
                        {IconComp && <IconComp className={`h-5 w-5 ${isSelected ? "text-indigo-400" : "text-neutral-500"}`} />}
                        <span className={`text-[14px] font-medium ${isSelected ? "text-white" : "text-neutral-300"}`}>
                          {display.label}
                        </span>
                      </div>
                      {!isConnected && (
                        <p className="text-[11px] text-neutral-600">
                          Connect in Settings
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-xl font-bold text-white">
                  {name[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{name}</h3>
                  <p className="text-[13px] text-neutral-400">{role}</p>
                </div>
              </div>

              <div className="border-t border-white/[0.06] pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-600 mb-2">Instructions</p>
                <p className="text-[13px] text-neutral-300 leading-relaxed whitespace-pre-wrap">
                  {instructions.length > 200 ? instructions.slice(0, 200) + "..." : instructions}
                </p>
              </div>

              <div className="border-t border-white/[0.06] pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-600 mb-2">Assigned Services</p>
                <div className="flex flex-wrap gap-2">
                  {selectedServices.map((s) => {
                    const display = SERVICE_DISPLAY[s];
                    const IconComp = display ? ICON_MAP[display.icon] : null;
                    return (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 px-3 py-1.5 text-[12px] font-medium"
                      >
                        {IconComp && <IconComp className="h-3.5 w-3.5" />}
                        {display?.label || s}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-white/[0.06] pt-4">
                <p className="text-[11px] text-neutral-600">
                  This employee will start at <span className="text-amber-400 font-medium">Probationary</span> trust level with read-only access.
                  They will earn promotions through successful work.
                </p>
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-[13px] text-red-400">
                  {error}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg text-[13px] font-medium text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-all disabled:opacity-0 disabled:pointer-events-none"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {step < 2 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-lg text-[13px] font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 h-10 px-6 rounded-lg text-[13px] font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 transition-all disabled:opacity-60 shadow-lg shadow-indigo-500/25"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Hiring...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Hire {name || "Employee"}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
