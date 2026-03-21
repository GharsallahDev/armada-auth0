"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Calendar,
  DollarSign,
  MessageSquare,
  FileText,
  CheckCircle,
  Circle,
  ExternalLink,
} from "lucide-react";

const services = [
  {
    name: "Google (Gmail, Calendar, Drive)",
    icon: Mail,
    status: "connected",
    scopes: ["Gmail.Readonly", "Gmail.Send", "Gmail.Compose", "Calendar", "Drive", "Tasks"],
  },
  {
    name: "Slack",
    icon: MessageSquare,
    status: "pending",
    scopes: ["channels:read", "chat:write", "users:read"],
  },
  {
    name: "Stripe",
    icon: DollarSign,
    status: "pending",
    scopes: ["read_write"],
  },
];

const trustConfig = [
  { label: "Level 0 → Level 1 (Draft)", threshold: "100 points" },
  { label: "Level 1 → Level 2 (Execute)", threshold: "300 points" },
  { label: "Level 2 → Level 3 (Autonomous)", threshold: "750 points" },
  { label: "Trust Decay Half-Life", threshold: "7 days" },
  { label: "CIBA Approval Timeout", threshold: "5 minutes" },
];

export default function SettingsPage() {
  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-neutral-500 mb-1">Configuration</p>
        <h1 className="text-xl font-semibold tracking-tight text-white">Settings</h1>
        <p className="text-[13px] text-neutral-500 mt-1">
          Manage connected accounts and agent configuration
        </p>
      </div>

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
          {services.map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between p-4 rounded-lg border border-border"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <service.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{service.name}</span>
                    {service.status === "connected" ? (
                      <Badge variant="secondary" className="bg-green-500/10 text-green-500 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        <Circle className="h-3 w-3 mr-1" />
                        Not Connected
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1 mt-1">
                    {service.scopes.map((scope) => (
                      <Badge key={scope} variant="outline" className="text-[10px]">
                        {scope}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <Button
                variant={service.status === "connected" ? "outline" : "default"}
                size="sm"
              >
                {service.status === "connected" ? "Manage" : "Connect"}
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          ))}
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
            <div
              key={item.label}
              className="flex items-center justify-between py-2"
            >
              <span className="text-sm">{item.label}</span>
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
            <span className="text-muted-foreground">Tenant</span>
            <code className="text-xs bg-muted px-2 py-0.5 rounded">
              dev-n0xwzuzwpzw70ed0.us.auth0.com
            </code>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Features</span>
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
