export const TRUST_LEVELS = {
  READ_ONLY: 0,
  DRAFT: 1,
  EXECUTE_CONFIRM: 2,
  AUTONOMOUS: 3,
} as const;

export const TRUST_THRESHOLDS = {
  [TRUST_LEVELS.READ_ONLY]: 0,
  [TRUST_LEVELS.DRAFT]: 100,
  [TRUST_LEVELS.EXECUTE_CONFIRM]: 300,
  [TRUST_LEVELS.AUTONOMOUS]: 750,
} as const;

export const TRUST_POINTS = {
  READ_SUCCESS: 5,
  DRAFT_APPROVED: 15,
  EXECUTION_SUCCESS: 25,
  CIBA_APPROVED: 30,
} as const;

// Trust decays with a 7-day half-life
export const TRUST_DECAY_HALF_LIFE_DAYS = 7;

export type TrustLevel = (typeof TRUST_LEVELS)[keyof typeof TRUST_LEVELS];

export const TRUST_LEVEL_NAMES: Record<TrustLevel, string> = {
  [TRUST_LEVELS.READ_ONLY]: "Probationary",
  [TRUST_LEVELS.DRAFT]: "Junior",
  [TRUST_LEVELS.EXECUTE_CONFIRM]: "Senior",
  [TRUST_LEVELS.AUTONOMOUS]: "Executive",
};

export const TRUST_LEVEL_COLORS: Record<TrustLevel, string> = {
  [TRUST_LEVELS.READ_ONLY]: "#ef4444",
  [TRUST_LEVELS.DRAFT]: "#f97316",
  [TRUST_LEVELS.EXECUTE_CONFIRM]: "#eab308",
  [TRUST_LEVELS.AUTONOMOUS]: "#22c55e",
};

// Actions that ALWAYS require CIBA regardless of trust level
export const CIBA_REQUIRED_ACTIONS = [
  "send_email_external",
  "create_invoice",
  "send_invoice",
  "schedule_external_meeting",
  "share_document_external",
  "financial_transaction",
] as const;

export type AgentName = string;

export const AGENT_COLOR_PALETTE = [
  { gradient: "from-indigo-500 to-violet-500", text: "text-indigo-400", bg: "bg-indigo-500/10" },
  { gradient: "from-cyan-500 to-blue-500", text: "text-cyan-400", bg: "bg-cyan-500/10" },
  { gradient: "from-emerald-500 to-green-500", text: "text-emerald-400", bg: "bg-emerald-500/10" },
  { gradient: "from-amber-500 to-orange-500", text: "text-amber-400", bg: "bg-amber-500/10" },
  { gradient: "from-rose-500 to-pink-500", text: "text-rose-400", bg: "bg-rose-500/10" },
  { gradient: "from-violet-500 to-purple-500", text: "text-violet-400", bg: "bg-violet-500/10" },
];

export const SERVICE_DISPLAY: Record<string, { label: string; icon: string }> = {
  // Google suite
  gmail: { label: "Gmail", icon: "Mail" },
  calendar: { label: "Google Calendar", icon: "Calendar" },
  drive: { label: "Google Drive", icon: "HardDrive" },
  sheets: { label: "Google Sheets", icon: "Table" },
  contacts: { label: "Google Contacts", icon: "Users" },
  tasks: { label: "Google Tasks", icon: "CheckSquare" },
  // Communication
  slack: { label: "Slack", icon: "Hash" },
  discord: { label: "Discord", icon: "MessageCircle" },
  // Dev tools
  github: { label: "GitHub", icon: "Github" },
  bitbucket: { label: "Bitbucket", icon: "GitBranch" },
  figma: { label: "Figma", icon: "Figma" },
  // Payments & Commerce
  stripe: { label: "Stripe", icon: "CreditCard" },
  paypal: { label: "PayPal", icon: "Wallet" },
  klarna: { label: "Klarna", icon: "CreditCard" },
  shopify: { label: "Shopify", icon: "ShoppingBag" },
  // Social media
  linkedin: { label: "LinkedIn", icon: "Linkedin" },
  twitter: { label: "Twitter / X", icon: "Twitter" },
  facebook: { label: "Facebook", icon: "Facebook" },
  instagram: { label: "Instagram", icon: "Camera" },
  // Productivity & CRM
  salesforce: { label: "Salesforce", icon: "Cloud" },
  dropbox: { label: "Dropbox", icon: "Archive" },
  box: { label: "Box", icon: "Box" },
  // Video & Streaming
  twitch: { label: "Twitch", icon: "Tv" },
  spotify: { label: "Spotify", icon: "Music" },
  vimeo: { label: "Vimeo", icon: "Video" },
  // Auth & Identity
  microsoft: { label: "Microsoft", icon: "Monitor" },
  apple: { label: "Apple", icon: "Smartphone" },
  amazon: { label: "Amazon", icon: "ShoppingCart" },
  // Design
  dribbble: { label: "Dribbble", icon: "Palette" },
  // Other
  quickbooks: { label: "QuickBooks", icon: "Receipt" },
  freshbooks: { label: "FreshBooks", icon: "BookOpen" },
  hubspot: { label: "HubSpot", icon: "Target" },
  wordpress: { label: "WordPress", icon: "Globe" },
  tumblr: { label: "Tumblr", icon: "Type" },
  snapchat: { label: "Snapchat", icon: "Ghost" },
};
