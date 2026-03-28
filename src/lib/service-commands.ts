// Per-service slash commands for agent chat
// Commands are defined per tool/service — agents only see commands for their connected services

export interface ServiceCommand {
  command: string;
  label: string;
  description: string;
  args?: string;
  service: string;
}

// Global commands available to ALL agents regardless of services
export const GLOBAL_COMMANDS: ServiceCommand[] = [
  { command: "/status", label: "Status", description: "Check agent's current task and service health", service: "_global" },
  { command: "/permissions", label: "Permissions", description: "View or modify this agent's service scopes", args: "[service]", service: "_global" },
  { command: "/trust", label: "Trust", description: "View or request trust level change", args: "[level]", service: "_global" },
  { command: "/escalate", label: "Escalate", description: "Escalate current task to human supervisor", service: "_global" },
  { command: "/audit", label: "Audit", description: "View this agent's recent actions and Token Vault activity", args: "[n]", service: "_global" },
  { command: "/pause", label: "Pause", description: "Pause all current agent tasks", service: "_global" },
  { command: "/resume", label: "Resume", description: "Resume paused agent tasks", service: "_global" },
  { command: "/connect", label: "Connect", description: "Connect a new service through Token Vault", args: "<service>", service: "_global" },
  { command: "/revoke", label: "Revoke", description: "Revoke agent's access to a connected service", args: "<service>", service: "_global" },
];

// Per-service command definitions
export const SERVICE_COMMANDS: Record<string, ServiceCommand[]> = {
  // ── Google Suite ──────────────────────────────────────────
  gmail: [
    { command: "/gmail:send", label: "Send Email", description: "Compose and send an email via Gmail", args: "<to> <subject>", service: "gmail" },
    { command: "/gmail:reply", label: "Reply", description: "Reply to the latest email in a thread", args: "<thread-id>", service: "gmail" },
    { command: "/gmail:forward", label: "Forward", description: "Forward an email to another recipient", args: "<email-id> <to>", service: "gmail" },
    { command: "/gmail:inbox", label: "Inbox", description: "Show recent unread emails", args: "[count]", service: "gmail" },
    { command: "/gmail:search", label: "Search", description: "Search emails by query", args: "<query>", service: "gmail" },
    { command: "/gmail:label", label: "Label", description: "Apply label to email(s)", args: "<email-id> <label>", service: "gmail" },
    { command: "/gmail:archive", label: "Archive", description: "Archive email(s)", args: "<email-id>", service: "gmail" },
    { command: "/gmail:draft", label: "Draft", description: "Create an email draft without sending", args: "<to> <subject>", service: "gmail" },
  ],
  calendar: [
    { command: "/cal:create", label: "Create Event", description: "Schedule a new calendar event", args: "<title> <time>", service: "calendar" },
    { command: "/cal:list", label: "List Events", description: "Show upcoming events", args: "[days]", service: "calendar" },
    { command: "/cal:cancel", label: "Cancel Event", description: "Cancel a scheduled event", args: "<event-id>", service: "calendar" },
    { command: "/cal:reschedule", label: "Reschedule", description: "Move an event to a new time", args: "<event-id> <new-time>", service: "calendar" },
    { command: "/cal:invite", label: "Invite", description: "Add attendees to an event", args: "<event-id> <emails>", service: "calendar" },
    { command: "/cal:free", label: "Free Slots", description: "Find available time slots", args: "<date> [duration]", service: "calendar" },
  ],
  drive: [
    { command: "/drive:upload", label: "Upload", description: "Upload a file to Google Drive", args: "<file>", service: "drive" },
    { command: "/drive:share", label: "Share", description: "Share a file or folder with someone", args: "<file-id> <email>", service: "drive" },
    { command: "/drive:list", label: "List Files", description: "List files in a folder", args: "[folder]", service: "drive" },
    { command: "/drive:search", label: "Search", description: "Search files by name or content", args: "<query>", service: "drive" },
    { command: "/drive:create", label: "Create Doc", description: "Create a new Google Doc/Sheet/Slide", args: "<type> <title>", service: "drive" },
  ],
  sheets: [
    { command: "/sheets:list", label: "List Sheets", description: "List recent Google Sheets spreadsheets", args: "[count]", service: "sheets" },
    { command: "/sheets:read", label: "Read Sheet", description: "Read data from a spreadsheet", args: "<spreadsheet-id> [range]", service: "sheets" },
    { command: "/sheets:create", label: "Create Sheet", description: "Create a new spreadsheet", args: "<title>", service: "sheets" },
    { command: "/sheets:append", label: "Append Rows", description: "Append rows to a spreadsheet", args: "<spreadsheet-id> <data>", service: "sheets" },
  ],
  contacts: [
    { command: "/contacts:list", label: "List Contacts", description: "List Google contacts", args: "[count]", service: "contacts" },
    { command: "/contacts:search", label: "Search", description: "Search contacts by name or email", args: "<query>", service: "contacts" },
    { command: "/contacts:get", label: "Get Contact", description: "Get full details for a contact", args: "<contact-id>", service: "contacts" },
  ],
  tasks: [
    { command: "/tasks:list", label: "List Tasks", description: "List tasks from Google Tasks", args: "[list-id]", service: "tasks" },
    { command: "/tasks:add", label: "Add Task", description: "Create a new task", args: "<title> [due-date]", service: "tasks" },
    { command: "/tasks:done", label: "Complete Task", description: "Mark a task as completed", args: "<task-id>", service: "tasks" },
    { command: "/tasks:lists", label: "Task Lists", description: "List all task lists", service: "tasks" },
  ],

  // ── Communication ─────────────────────────────────────────
  slack: [
    { command: "/slack:send", label: "Send Message", description: "Send a message to a Slack channel or user", args: "<channel> <message>", service: "slack" },
    { command: "/slack:channels", label: "Channels", description: "List available Slack channels", service: "slack" },
    { command: "/slack:thread", label: "Thread Reply", description: "Reply in a message thread", args: "<thread-id> <message>", service: "slack" },
    { command: "/slack:status", label: "Set Status", description: "Update Slack status", args: "<emoji> <text>", service: "slack" },
    { command: "/slack:pin", label: "Pin", description: "Pin a message in a channel", args: "<message-id>", service: "slack" },
    { command: "/slack:search", label: "Search", description: "Search Slack messages", args: "<query>", service: "slack" },
  ],
  discord: [
    { command: "/discord:send", label: "Send Message", description: "Send a message to a Discord channel", args: "<channel> <message>", service: "discord" },
    { command: "/discord:channels", label: "Channels", description: "List available Discord channels", service: "discord" },
    { command: "/discord:thread", label: "Thread", description: "Create or reply in a thread", args: "<channel> <message>", service: "discord" },
    { command: "/discord:react", label: "React", description: "Add reaction to a message", args: "<message-id> <emoji>", service: "discord" },
  ],

  // ── Payments & Commerce ───────────────────────────────────
  stripe: [
    { command: "/stripe:charge", label: "Charge", description: "Create a payment charge", args: "<amount> <customer>", service: "stripe" },
    { command: "/stripe:invoice", label: "Invoice", description: "Create and send an invoice", args: "<customer> <amount>", service: "stripe" },
    { command: "/stripe:refund", label: "Refund", description: "Refund a payment", args: "<payment-id> [amount]", service: "stripe" },
    { command: "/stripe:customers", label: "Customers", description: "List or search customers", args: "[query]", service: "stripe" },
    { command: "/stripe:balance", label: "Balance", description: "Check Stripe account balance", service: "stripe" },
    { command: "/stripe:subscriptions", label: "Subscriptions", description: "List active subscriptions", args: "[customer]", service: "stripe" },
    { command: "/stripe:payout", label: "Payout", description: "Initiate a payout to bank", args: "<amount>", service: "stripe" },
  ],
  paypal: [
    { command: "/paypal:send", label: "Send Payment", description: "Send money to a PayPal account", args: "<email> <amount>", service: "paypal" },
    { command: "/paypal:invoice", label: "Invoice", description: "Create and send a PayPal invoice", args: "<email> <amount>", service: "paypal" },
    { command: "/paypal:balance", label: "Balance", description: "Check PayPal account balance", service: "paypal" },
    { command: "/paypal:transactions", label: "Transactions", description: "List recent transactions", args: "[count]", service: "paypal" },
    { command: "/paypal:refund", label: "Refund", description: "Refund a transaction", args: "<transaction-id>", service: "paypal" },
  ],
  klarna: [
    { command: "/klarna:order", label: "Create Order", description: "Create a Klarna payment order", args: "<amount> <customer>", service: "klarna" },
    { command: "/klarna:capture", label: "Capture", description: "Capture a Klarna payment", args: "<order-id>", service: "klarna" },
    { command: "/klarna:refund", label: "Refund", description: "Refund a Klarna order", args: "<order-id> [amount]", service: "klarna" },
    { command: "/klarna:status", label: "Order Status", description: "Check status of a Klarna order", args: "<order-id>", service: "klarna" },
  ],
  shopify: [
    { command: "/shopify:orders", label: "Orders", description: "List recent Shopify orders", args: "[status]", service: "shopify" },
    { command: "/shopify:fulfill", label: "Fulfill", description: "Mark an order as fulfilled with tracking", args: "<order-id> [tracking]", service: "shopify" },
    { command: "/shopify:refund", label: "Refund", description: "Refund a Shopify order", args: "<order-id> [amount]", service: "shopify" },
    { command: "/shopify:products", label: "Products", description: "List or search products", args: "[query]", service: "shopify" },
    { command: "/shopify:inventory", label: "Inventory", description: "Check or update inventory levels", args: "<product-id> [qty]", service: "shopify" },
    { command: "/shopify:customers", label: "Customers", description: "List or search customers", args: "[query]", service: "shopify" },
    { command: "/shopify:discount", label: "Discount", description: "Create a discount code", args: "<code> <amount>", service: "shopify" },
  ],

  // ── Social Media ──────────────────────────────────────────
  linkedin: [
    { command: "/linkedin:post", label: "Post", description: "Publish a post on LinkedIn", args: "<content>", service: "linkedin" },
    { command: "/linkedin:schedule", label: "Schedule", description: "Schedule a post for later", args: "<content> <time>", service: "linkedin" },
    { command: "/linkedin:analytics", label: "Analytics", description: "Get post engagement analytics", args: "[post-id]", service: "linkedin" },
    { command: "/linkedin:profile", label: "Profile", description: "View or update company profile", service: "linkedin" },
    { command: "/linkedin:connections", label: "Connections", description: "View recent connection activity", service: "linkedin" },
  ],
  twitter: [
    { command: "/twitter:post", label: "Tweet", description: "Post a tweet", args: "<content>", service: "twitter" },
    { command: "/twitter:reply", label: "Reply", description: "Reply to a tweet", args: "<tweet-id> <content>", service: "twitter" },
    { command: "/twitter:schedule", label: "Schedule", description: "Schedule a tweet for later", args: "<content> <time>", service: "twitter" },
    { command: "/twitter:dm", label: "DM", description: "Send a direct message", args: "<user> <message>", service: "twitter" },
    { command: "/twitter:mentions", label: "Mentions", description: "Show recent mentions", args: "[count]", service: "twitter" },
    { command: "/twitter:analytics", label: "Analytics", description: "Get tweet engagement metrics", args: "[tweet-id]", service: "twitter" },
  ],
  facebook: [
    { command: "/fb:post", label: "Post", description: "Publish a post on Facebook Page", args: "<content>", service: "facebook" },
    { command: "/fb:schedule", label: "Schedule", description: "Schedule a Facebook post", args: "<content> <time>", service: "facebook" },
    { command: "/fb:insights", label: "Insights", description: "Get page insights and analytics", service: "facebook" },
    { command: "/fb:reply", label: "Reply", description: "Reply to a comment", args: "<comment-id> <reply>", service: "facebook" },
    { command: "/fb:messages", label: "Messages", description: "View recent page messages", args: "[count]", service: "facebook" },
  ],
  instagram: [
    { command: "/ig:post", label: "Post", description: "Publish a photo or carousel post", args: "<media> <caption>", service: "instagram" },
    { command: "/ig:story", label: "Story", description: "Post an Instagram Story", args: "<media>", service: "instagram" },
    { command: "/ig:schedule", label: "Schedule", description: "Schedule a post", args: "<media> <caption> <time>", service: "instagram" },
    { command: "/ig:insights", label: "Insights", description: "Get account insights", service: "instagram" },
    { command: "/ig:reply", label: "Reply", description: "Reply to a comment", args: "<comment-id> <reply>", service: "instagram" },
  ],
  snapchat: [
    { command: "/snap:post", label: "Post", description: "Post to Snapchat Spotlight or Story", args: "<media>", service: "snapchat" },
    { command: "/snap:insights", label: "Insights", description: "View Snapchat analytics", service: "snapchat" },
  ],
  tumblr: [
    { command: "/tumblr:post", label: "Post", description: "Publish a Tumblr post", args: "<content>", service: "tumblr" },
    { command: "/tumblr:queue", label: "Queue", description: "Add post to queue", args: "<content>", service: "tumblr" },
    { command: "/tumblr:drafts", label: "Drafts", description: "List post drafts", service: "tumblr" },
  ],

  // ── Dev Tools ─────────────────────────────────────────────
  github: [
    { command: "/gh:pr", label: "Pull Request", description: "Create or list pull requests", args: "[repo] [title]", service: "github" },
    { command: "/gh:issue", label: "Issue", description: "Create or list issues", args: "[repo] [title]", service: "github" },
    { command: "/gh:review", label: "Review", description: "Review a pull request", args: "<pr-number>", service: "github" },
    { command: "/gh:merge", label: "Merge", description: "Merge a pull request", args: "<pr-number>", service: "github" },
    { command: "/gh:release", label: "Release", description: "Create a new release", args: "<tag> [notes]", service: "github" },
    { command: "/gh:actions", label: "Actions", description: "View or trigger GitHub Actions", args: "[workflow]", service: "github" },
  ],
  bitbucket: [
    { command: "/bb:pr", label: "Pull Request", description: "Create or list pull requests", args: "[repo] [title]", service: "bitbucket" },
    { command: "/bb:issue", label: "Issue", description: "Create or list issues", args: "[repo] [title]", service: "bitbucket" },
    { command: "/bb:pipelines", label: "Pipelines", description: "View or trigger pipelines", args: "[repo]", service: "bitbucket" },
  ],

  // ── Productivity ──────────────────────────────────────────
  figma: [
    { command: "/figma:files", label: "Files", description: "List recent Figma files", service: "figma" },
    { command: "/figma:comments", label: "Comments", description: "View or add comments on a file", args: "<file-id> [comment]", service: "figma" },
    { command: "/figma:export", label: "Export", description: "Export frames or components", args: "<file-id> <node-id>", service: "figma" },
  ],
  dropbox: [
    { command: "/dropbox:upload", label: "Upload", description: "Upload a file to Dropbox", args: "<file> [path]", service: "dropbox" },
    { command: "/dropbox:share", label: "Share", description: "Create a shared link", args: "<path>", service: "dropbox" },
    { command: "/dropbox:list", label: "List", description: "List files in a folder", args: "[path]", service: "dropbox" },
    { command: "/dropbox:search", label: "Search", description: "Search files", args: "<query>", service: "dropbox" },
  ],
  box: [
    { command: "/box:upload", label: "Upload", description: "Upload a file to Box", args: "<file> [folder]", service: "box" },
    { command: "/box:share", label: "Share", description: "Share a file or folder", args: "<id> <email>", service: "box" },
    { command: "/box:list", label: "List", description: "List files in a folder", args: "[folder-id]", service: "box" },
  ],

  // ── CRM & Business ────────────────────────────────────────
  salesforce: [
    { command: "/sf:lead", label: "Create Lead", description: "Create a new Salesforce lead", args: "<name> <email>", service: "salesforce" },
    { command: "/sf:opportunity", label: "Opportunity", description: "Create or update an opportunity", args: "<name> <amount>", service: "salesforce" },
    { command: "/sf:search", label: "Search", description: "Search Salesforce records", args: "<query>", service: "salesforce" },
    { command: "/sf:report", label: "Report", description: "Run a Salesforce report", args: "<report-id>", service: "salesforce" },
    { command: "/sf:task", label: "Task", description: "Create a task for a record", args: "<subject> <record-id>", service: "salesforce" },
  ],
  hubspot: [
    { command: "/hs:contact", label: "Contact", description: "Create or update a HubSpot contact", args: "<email> [name]", service: "hubspot" },
    { command: "/hs:deal", label: "Deal", description: "Create or update a deal", args: "<name> <amount>", service: "hubspot" },
    { command: "/hs:email", label: "Send Email", description: "Send a marketing email", args: "<campaign-id>", service: "hubspot" },
    { command: "/hs:search", label: "Search", description: "Search CRM records", args: "<query>", service: "hubspot" },
  ],

  // ── Finance ───────────────────────────────────────────────
  quickbooks: [
    { command: "/qb:invoice", label: "Invoice", description: "Create and send a QuickBooks invoice", args: "<customer> <amount>", service: "quickbooks" },
    { command: "/qb:expense", label: "Expense", description: "Record an expense", args: "<amount> <category>", service: "quickbooks" },
    { command: "/qb:report", label: "Report", description: "Generate a financial report", args: "<type>", service: "quickbooks" },
    { command: "/qb:customers", label: "Customers", description: "List or search customers", args: "[query]", service: "quickbooks" },
    { command: "/qb:balance", label: "Balance", description: "Check account balance", service: "quickbooks" },
  ],
  freshbooks: [
    { command: "/fb:invoice", label: "Invoice", description: "Create a FreshBooks invoice", args: "<client> <amount>", service: "freshbooks" },
    { command: "/fb:expense", label: "Expense", description: "Log an expense", args: "<amount> <category>", service: "freshbooks" },
    { command: "/fb:time", label: "Time Entry", description: "Log time for a project", args: "<project> <hours>", service: "freshbooks" },
    { command: "/fb:clients", label: "Clients", description: "List or search clients", args: "[query]", service: "freshbooks" },
  ],

  // ── Media ─────────────────────────────────────────────────
  spotify: [
    { command: "/spotify:search", label: "Search", description: "Search for tracks, albums, or artists", args: "<query>", service: "spotify" },
    { command: "/spotify:playlist", label: "Playlist", description: "Create or modify a playlist", args: "<name> [tracks]", service: "spotify" },
    { command: "/spotify:playing", label: "Now Playing", description: "Get currently playing track", service: "spotify" },
  ],
  twitch: [
    { command: "/twitch:stream", label: "Stream Info", description: "Get or update stream information", args: "[title]", service: "twitch" },
    { command: "/twitch:chat", label: "Chat", description: "Send a message in Twitch chat", args: "<channel> <message>", service: "twitch" },
    { command: "/twitch:clip", label: "Clip", description: "Create a clip of current stream", args: "<channel>", service: "twitch" },
  ],
  vimeo: [
    { command: "/vimeo:upload", label: "Upload", description: "Upload a video to Vimeo", args: "<file> [title]", service: "vimeo" },
    { command: "/vimeo:videos", label: "Videos", description: "List uploaded videos", service: "vimeo" },
  ],

  // ── E-commerce & Shopping ─────────────────────────────────
  amazon: [
    { command: "/amazon:orders", label: "Orders", description: "List recent Amazon orders", args: "[status]", service: "amazon" },
    { command: "/amazon:track", label: "Track", description: "Track an order shipment", args: "<order-id>", service: "amazon" },
    { command: "/amazon:search", label: "Search", description: "Search Amazon products", args: "<query>", service: "amazon" },
  ],

  // ── Misc ──────────────────────────────────────────────────
  wordpress: [
    { command: "/wp:post", label: "Post", description: "Create a WordPress blog post", args: "<title>", service: "wordpress" },
    { command: "/wp:draft", label: "Draft", description: "Save post as draft", args: "<title>", service: "wordpress" },
    { command: "/wp:pages", label: "Pages", description: "List or manage pages", args: "[query]", service: "wordpress" },
    { command: "/wp:comments", label: "Comments", description: "Moderate comments", args: "[status]", service: "wordpress" },
  ],

  microsoft: [
    { command: "/ms:email", label: "Send Email", description: "Send email via Outlook", args: "<to> <subject>", service: "microsoft" },
    { command: "/ms:teams", label: "Teams Message", description: "Send a Teams message", args: "<channel> <message>", service: "microsoft" },
    { command: "/ms:calendar", label: "Calendar", description: "Create or list calendar events", args: "[title] [time]", service: "microsoft" },
    { command: "/ms:onedrive", label: "OneDrive", description: "Upload or share OneDrive files", args: "<action> <file>", service: "microsoft" },
  ],
};

/**
 * Get all available commands for a given set of agent services.
 * Returns global commands + per-service commands for each connected service.
 */
export function getCommandsForServices(services: string[]): ServiceCommand[] {
  const commands = [...GLOBAL_COMMANDS];
  for (const service of services) {
    const serviceCommands = SERVICE_COMMANDS[service];
    if (serviceCommands) {
      commands.push(...serviceCommands);
    }
  }
  return commands;
}
