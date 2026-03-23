"use client";

import useSWR from "swr";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  DollarSign,
  MessageSquare,
  CheckCircle,
  Circle,
  ExternalLink,
  Github,
  MessageCircle,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const serviceConfig = [
  {
    provider: "google",
    name: "Google (Gmail, Calendar, Drive)",
    icon: Mail,
    connectUrl: "/api/auth/google",
    scopes: ["Gmail", "Calendar", "Drive"],
    alwaysConnected: false,
  },
  {
    provider: "slack",
    name: "Slack",
    icon: MessageSquare,
    connectUrl: null, // Connected via bot token (server-side)
    scopes: ["channels:read", "chat:write", "users:read"],
    alwaysConnected: true, // Bot token based
  },
  {
    provider: "stripe",
    name: "Stripe",
    icon: DollarSign,
    connectUrl: null, // API key based
    scopes: ["read_write"],
    alwaysConnected: true, // API key based
  },
  {
    provider: "github",
    name: "GitHub",
    icon: Github,
    connectUrl: "/api/auth/github",
    scopes: ["repo", "read:user"],
    alwaysConnected: false,
  },
  {
    provider: "discord",
    name: "Discord",
    icon: MessageCircle,
    connectUrl: "/api/auth/discord",
    scopes: ["identify", "guilds", "messages.read"],
    alwaysConnected: false,
  },
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
  const { data: connectedServices } = useSWR<{ provider: string; connected: boolean }[]>(
    "/api/services",
    fetcher
  );

  const isConnected = (provider: string) => {
    const svc = serviceConfig.find((s) => s.provider === provider);
    if (svc?.alwaysConnected) return true;
    return connectedServices?.some((s) => s.provider === provider) || false;
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-neutral-500 mb-1">Configuration</p>
        <h1 className="text-xl font-semibold tracking-tight text-white">Settings</h1>
        <p className="text-[13px] text-neutral-500 mt-1">
          Manage connected accounts and agent configuration
        </p>
      </div>

      {justConnected && (
        <div className="rounded-lg border border-green-500/20 bg-green-500/5 px-4 py-3 text-sm text-green-400">
          <CheckCircle className="h-4 w-4 inline mr-2" />
          Successfully connected {justConnected}! Your agents can now access {justConnected} services.
        </div>
      )}

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts (Token Vault)</CardTitle>
          <CardDescription>
            Services your AI agents can access on your behalf via Auth0 Token Vault.
            Tokens are securely stored and never exposed to the frontend or LLM.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {serviceConfig.map((service) => {
            const connected = isConnected(service.provider);
            return (
              <div
                key={service.provider}
                className="flex items-center justify-between p-4 rounded-lg border border-white/[0.06]"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-white/[0.04] flex items-center justify-center">
                    <service.icon className="h-5 w-5 text-neutral-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-200">{service.name}</span>
                      {connected ? (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-500 text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs text-neutral-500">
                          <Circle className="h-3 w-3 mr-1" />
                          Not Connected
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1 mt-1">
                      {service.scopes.map((scope) => (
                        <Badge key={scope} variant="outline" className="text-[10px] text-neutral-500 border-white/[0.08]">
                          {scope}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                {service.connectUrl ? (
                  <a href={service.connectUrl}>
                    <Button
                      variant={connected ? "outline" : "default"}
                      size="sm"
                      className={!connected ? "bg-indigo-600 hover:bg-indigo-500 text-white" : ""}
                    >
                      {connected ? "Reconnect" : "Connect"}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </a>
                ) : (
                  <Badge variant="outline" className="text-xs text-neutral-500 border-white/[0.08]">
                    {service.provider === "stripe" ? "API Key" : "Bot Token"}
                  </Badge>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Trust Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Progressive Trust Configuration</CardTitle>
          <CardDescription>
            How agents earn and lose trust. These thresholds determine what each agent can do.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {trustConfig.map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2">
              <span className="text-sm text-neutral-300">{item.label}</span>
              <Badge variant="secondary">{item.threshold}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Auth0 Info */}
      <Card>
        <CardHeader>
          <CardTitle>Auth0 Integration</CardTitle>
          <CardDescription>
            Authentication and authorization powered by Auth0 for AI Agents.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Tenant</span>
            <code className="text-xs bg-white/[0.04] text-neutral-300 px-2 py-0.5 rounded">
              dev-n0xwzuzwpzw70ed0.us.auth0.com
            </code>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Features</span>
            <div className="flex gap-1">
              <Badge variant="outline" className="text-xs">Token Vault</Badge>
              <Badge variant="outline" className="text-xs">CIBA</Badge>
              <Badge variant="outline" className="text-xs">Universal Login</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
