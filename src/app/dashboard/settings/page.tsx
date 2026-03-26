"use client";

import { useState } from "react";
import useSWR from "swr";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, ExternalLink, Settings, Shield,
  Link2, Lock, Search, ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  AUTH0_SOCIAL_CONNECTIONS,
  CATEGORY_LABELS,
  SocialIcon,
  type SocialConnection,
} from "@/lib/social-icons";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const tabs = [
  { id: "connections", label: "Connections", icon: Link2 },
  { id: "trust", label: "Trust Config", icon: Shield },
  { id: "auth0", label: "Auth0", icon: Lock },
] as const;

type TabId = (typeof tabs)[number]["id"];

const trustConfig = [
  { label: "L0 Probationary -> L1 Junior", threshold: "100 points" },
  { label: "L1 Junior -> L2 Senior", threshold: "300 points" },
  { label: "L2 Senior -> L3 Executive", threshold: "750 points" },
  { label: "Trust Decay Half-Life", threshold: "7 days" },
  { label: "CIBA Approval Timeout", threshold: "5 minutes" },
];

export default function SettingsPage() {
  const params = useSearchParams();
  const justConnected = params.get("connected");
  const { data: connectedServices } = useSWR<{ provider: string; connected: boolean }[]>("/api/services", fetcher);
  const [activeTab, setActiveTab] = useState<TabId>("connections");
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["popular"]);

  const isConnected = (provider: string) => {
    return connectedServices?.some((s) => s.provider === provider) || false;
  };

  const oauthProviders = ["google", "github", "discord", "facebook", "apple", "microsoft", "linkedin", "twitter", "spotify", "twitch", "figma", "shopify", "gitlab", "bitbucket", "notion", "atlassian", "zoom", "salesforce", "hubspot"];

  const TOKEN_VAULT_CONNECTIONS: Record<string, string> = {
    google: "google-oauth2",
    github: "github",
    discord: "discord",
    slack: "Sign-in-with-Slack",
    linkedin: "linkedin",
    shopify: "shopify",
    stripe: "Stripe-Connect",
    spotify: "spotify",
    facebook: "facebook",
    twitter: "twitter",
    twitch: "twitch",
    dropbox: "dropbox",
    paypal: "paypal",
    microsoft: "windowslive",
    apple: "apple",
    bitbucket: "bitbucket",
    box: "box",
    salesforce: "salesforce",
    figma: "figma",
  };

  const getConnectUrl = (id: string) => {
    const connection = TOKEN_VAULT_CONNECTIONS[id];
    if (connection) return `/api/services/connect?connection=${connection}`;
    return null;
  };

  const filteredConnections = search
    ? AUTH0_SOCIAL_CONNECTIONS.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : AUTH0_SOCIAL_CONNECTIONS;

  const categories = [...new Set(filteredConnections.map((c) => c.category))];

  function toggleCategory(cat: string) {
    setExpandedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  return (
    <div className="min-h-full">
      <div className="border-b border-border/50 px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/20 flex items-center justify-center">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Settings</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">Manage connected accounts and configuration</p>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
        {justConnected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4 flex items-center gap-3"
          >
            <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
            <p className="text-[13px] text-foreground">
              Successfully connected <span className="font-semibold">{justConnected}</span>!
            </p>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 gap-1 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-1.5 w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="settings-tab-bg"
                    className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* Connections Tab */}
            {activeTab === "connections" && (
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search connections..."
                    className="pl-10 h-11 rounded-xl bg-card/50 border-border/50"
                  />
                </div>

                {/* Categories */}
                {categories.map((cat) => {
                  const connectionsInCat = filteredConnections.filter((c) => c.category === cat);
                  const isExpanded = expandedCategories.includes(cat) || search.length > 0;
                  const connectedCount = connectionsInCat.filter((c) => isConnected(c.id)).length;

                  return (
                    <div key={cat} className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                      <button
                        onClick={() => toggleCategory(cat)}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <h3 className="text-[13px] font-semibold text-foreground">
                            {CATEGORY_LABELS[cat] || cat}
                          </h3>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted/50 text-muted-foreground border border-border/30">
                            {connectedCount}/{connectionsInCat.length} connected
                          </span>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {connectionsInCat.map((connection) => (
                                <ConnectionCard
                                  key={connection.id}
                                  connection={connection}
                                  connected={isConnected(connection.id)}
                                  connectUrl={getConnectUrl(connection.id)}
                                />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Trust Config Tab */}
            {activeTab === "trust" && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-border/30">
                    <h3 className="text-[13px] font-semibold text-foreground">Progressive Trust Thresholds</h3>
                    <p className="text-[11px] text-muted-foreground mt-1">Configure how agents earn trust and advance levels</p>
                  </div>
                  {trustConfig.map((item, i) => (
                    <div key={item.label} className={`flex items-center justify-between px-5 py-4 ${i < trustConfig.length - 1 ? "border-b border-border/20" : ""} hover:bg-muted/20 transition-colors`}>
                      <span className="text-[13px] text-foreground/80">{item.label}</span>
                      <span className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-primary/5 text-primary border border-primary/20">{item.threshold}</span>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    Trust scores decay over time using a <span className="font-semibold text-amber-400">7-day half-life</span>.
                    Agents must continuously demonstrate trustworthy behavior to maintain their level.
                    Critical actions (financial transactions, data deletion) always require <span className="font-semibold text-amber-400">CIBA human approval</span>.
                  </p>
                </div>
              </div>
            )}

            {/* Auth0 Tab */}
            {activeTab === "auth0" && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/20 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <span className="text-[14px] font-medium text-foreground block">Authentication & Authorization</span>
                      <span className="text-[11px] text-muted-foreground">Powered by Auth0 by Okta</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[13px] px-3 py-2.5 rounded-xl bg-muted/30 border border-border/30">
                      <span className="text-muted-foreground">Tenant</span>
                      <code className="text-[11px] text-foreground font-mono">
                        dev-n0xwzuzwpzw70ed0.us.auth0.com
                      </code>
                    </div>
                    <div className="flex justify-between items-center text-[13px] px-3 py-2.5 rounded-xl bg-muted/30 border border-border/30">
                      <span className="text-muted-foreground">Protocol</span>
                      <code className="text-[11px] text-foreground font-mono">OpenID Connect</code>
                    </div>
                    <div className="flex justify-between items-center text-[13px] px-3 py-2.5 rounded-xl bg-muted/30 border border-border/30">
                      <span className="text-muted-foreground">Features</span>
                      <div className="flex gap-1.5">
                        {["Token Vault", "CIBA", "Universal Login"].map((f) => (
                          <span key={f} className="text-[10px] px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-medium">{f}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                  <h4 className="text-[13px] font-semibold text-foreground mb-2">How Armada Uses Auth0</h4>
                  <ul className="space-y-2 text-[12px] text-muted-foreground leading-relaxed">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                      <span><strong className="text-foreground">Token Vault</strong> — Securely stores OAuth tokens for connected services. Agents access tokens through scoped permissions.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                      <span><strong className="text-foreground">CIBA (Client-Initiated Backchannel Auth)</strong> — Agents request human approval for sensitive actions via push notification.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                      <span><strong className="text-foreground">Universal Login</strong> — Unified authentication experience across all connected accounts.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function ConnectionCard({
  connection,
  connected,
  connectUrl,
}: {
  connection: SocialConnection;
  connected: boolean;
  connectUrl: string | null;
}) {
  return (
    <div className="group flex items-center justify-between px-3.5 py-3 rounded-xl border border-border/30 bg-card/30 hover:bg-muted/30 hover:border-border/50 transition-all">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-muted/50 border border-border/30">
          <SocialIcon id={connection.id} className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-foreground">{connection.name}</span>
            {connected && (
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-0.5">
                <CheckCircle className="h-2.5 w-2.5" />
              </span>
            )}
          </div>
        </div>
      </div>
      {connectUrl ? (
        <a
          href={connectUrl}
          className={`text-[10px] font-medium px-2.5 py-1 rounded-lg transition-all ${
            connected
              ? "text-muted-foreground border border-border/30 hover:bg-muted/50"
              : "text-primary bg-primary/5 border border-primary/20 hover:bg-primary/10"
          }`}
        >
          {connected ? "Reconnect" : "Connect"}
        </a>
      ) : (
        <span className={`text-[9px] px-2 py-0.5 rounded-md ${connected ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-muted/30 text-muted-foreground border border-border/30"}`}>
          {connected ? "Active" : "Available"}
        </span>
      )}
    </div>
  );
}
