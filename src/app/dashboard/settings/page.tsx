"use client";

import useSWR from "swr";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail, DollarSign, MessageSquare, CheckCircle, Circle, ExternalLink,
  Github, MessageCircle, Settings, Shield,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const serviceConfig = [
  { provider: "google", name: "Google (Gmail, Calendar, Drive)", icon: Mail, connectUrl: "/api/auth/google", scopes: ["Gmail", "Calendar", "Drive"], alwaysConnected: false, gradient: "from-blue-500 to-cyan-500" },
  { provider: "slack", name: "Slack", icon: MessageSquare, connectUrl: null, scopes: ["channels:read", "chat:write"], alwaysConnected: true, gradient: "from-violet-500 to-purple-500" },
  { provider: "stripe", name: "Stripe", icon: DollarSign, connectUrl: null, scopes: ["read_write"], alwaysConnected: true, gradient: "from-emerald-500 to-green-500" },
  { provider: "github", name: "GitHub", icon: Github, connectUrl: "/api/auth/github", scopes: ["repo", "read:user"], alwaysConnected: false, gradient: "from-gray-500 to-slate-600" },
  { provider: "discord", name: "Discord", icon: MessageCircle, connectUrl: "/api/auth/discord", scopes: ["identify", "guilds"], alwaysConnected: false, gradient: "from-indigo-500 to-violet-500" },
];

const trustConfig = [
  { label: "L0 Probationary → L1 Junior", threshold: "100 points" },
  { label: "L1 Junior → L2 Senior", threshold: "300 points" },
  { label: "L2 Senior → L3 Executive", threshold: "750 points" },
  { label: "Trust Decay Half-Life", threshold: "7 days" },
  { label: "CIBA Approval Timeout", threshold: "5 minutes" },
];

export default function SettingsPage() {
  const params = useSearchParams();
  const justConnected = params.get("connected");
  const { data: connectedServices } = useSWR<{ provider: string; connected: boolean }[]>("/api/services", fetcher);

  const isConnected = (provider: string) => {
    const svc = serviceConfig.find((s) => s.provider === provider);
    if (svc?.alwaysConnected) return true;
    return connectedServices?.some((s) => s.provider === provider) || false;
  };

  return (
    <div className="min-h-full">
      <div className="border-b border-border/50 px-8 py-6">
        <div className="max-w-4xl flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/20 flex items-center justify-center">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Settings</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">Manage connected accounts and configuration</p>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 max-w-4xl space-y-8">
        {justConnected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4 flex items-center gap-3"
          >
            <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
            <p className="text-[13px] text-foreground">
              Successfully connected <span className="font-semibold">{justConnected}</span>! Your agents can now access {justConnected} services.
            </p>
          </motion.div>
        )}

        {/* Connected Accounts */}
        <div>
          <h2 className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">Connected Accounts (Token Vault)</h2>
          <div className="space-y-3">
            {serviceConfig.map((service, i) => {
              const connected = isConnected(service.provider);
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.provider}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 flex items-center justify-between transition-all hover:border-border"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center shadow-sm`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-medium text-foreground">{service.name}</span>
                        {connected ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />Connected
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted/50 text-muted-foreground border border-border/30 flex items-center gap-1">
                            <Circle className="h-3 w-3" />Not Connected
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 mt-1.5">
                        {service.scopes.map((scope) => (
                          <span key={scope} className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted/30 text-muted-foreground border border-border/30">{scope}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {service.connectUrl ? (
                    <a
                      href={service.connectUrl}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200 ${
                        connected
                          ? "text-muted-foreground border border-border/50 hover:bg-muted/50"
                          : "text-foreground bg-gradient-to-b from-primary/20 to-primary/5 border border-primary/20 hover:shadow-md hover:shadow-primary/10"
                      }`}
                    >
                      {connected ? "Reconnect" : "Connect"}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-[10px] px-2 py-1 rounded-lg bg-muted/30 text-muted-foreground border border-border/30">
                      {service.provider === "stripe" ? "API Key" : "Bot Token"}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Trust Config */}
        <div>
          <h2 className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">Progressive Trust Configuration</h2>
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
            {trustConfig.map((item, i) => (
              <div key={item.label} className={`flex items-center justify-between px-5 py-4 ${i < trustConfig.length - 1 ? "border-b border-border/30" : ""}`}>
                <span className="text-[13px] text-foreground/80">{item.label}</span>
                <span className="text-[12px] font-semibold px-2.5 py-1 rounded-lg bg-muted/50 text-foreground border border-border/50">{item.threshold}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Auth0 */}
        <div>
          <h2 className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">Auth0 Integration</h2>
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-[14px] font-medium text-foreground">Authentication & Authorization</span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-muted-foreground">Tenant</span>
              <code className="text-[11px] bg-muted/30 text-foreground px-2.5 py-1 rounded-lg border border-border/30 font-mono">
                dev-n0xwzuzwpzw70ed0.us.auth0.com
              </code>
            </div>
            <div className="h-px bg-border/30" />
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-muted-foreground">Features</span>
              <div className="flex gap-1.5">
                {["Token Vault", "CIBA", "Universal Login"].map((f) => (
                  <span key={f} className="text-[10px] px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">{f}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
