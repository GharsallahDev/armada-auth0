# Armada - AI Agent Fleet Command

> **Progressive Trust meets Auth0 for AI Agents.** A multi-agent orchestrator where AI earns your trust through demonstrated reliability, not blind faith.

**Live Demo:** [armada-eight.vercel.app](https://armada-eight.vercel.app)

## The Problem

AI agents need access to your email, calendar, finances, and documents. But giving an AI full access from day one is reckless. Current solutions offer binary access - either full permissions or none.

## The Solution

**Armada** introduces **Progressive Trust** - a novel authorization model where AI agents start with zero privileges and earn capabilities over time through successful operations, with trust that naturally decays when unused.

### Trust Levels

| Level | Name | Capabilities |
|-------|------|-------------|
| 0 | Read Only | Observe data across services |
| 1 | Draft | Prepare actions for human review |
| 2 | Execute w/ Confirm | Act with CIBA confirmation |
| 3 | Autonomous | Operate independently on routine tasks |

Trust points are earned through successful operations and decay with a 7-day half-life. CIBA (Client-Initiated Backchannel Authentication) ensures sensitive actions always require human approval, regardless of trust level.

## Architecture

```
User ── Web Dashboard ──┐
                        ├── Orchestrator Agent
User ── Flutter App ────┘         │
        (CIBA Push)      ┌───────┼───────┐
                         │       │       │
                      Comms   Sched   Finance   Docs
                      Agent   Agent   Agent     Agent
                         │       │       │       │
                         └───────┴───────┴───────┘
                                 │
                         Auth0 Token Vault
                    (Gmail, Calendar, Stripe, Drive)
```

## Auth0 Features Used

| Feature | Usage |
|---------|-------|
| **Universal Login** | Secure auth for web + mobile |
| **Token Vault** | OAuth token exchange (RFC 8693) - tokens never touch frontend or LLM |
| **CIBA** | Async human-in-the-loop approval pushed to mobile |
| **Authorization** | Per-agent, per-service, per-trust-level permission matrix |

## Tech Stack

- **Web:** Next.js 15, React 19, TailwindCSS, shadcn/ui, Framer Motion
- **Mobile:** Flutter + Auth0 AppAuth + Firebase FCM
- **AI:** Google Gemini 2.5 Flash via Vercel AI SDK v6
- **Auth:** Auth0 (Universal Login, Token Vault, CIBA)
- **Database:** Neon PostgreSQL + Drizzle ORM
- **Deploy:** Vercel (web), Firebase (push notifications)

## Project Structure

```
armada/                    # Next.js web app
  src/
    app/                   # Pages + API routes
    components/            # UI components
    lib/
      agents/              # AI orchestrator + agent types
      audit/               # Action logging
      auth0.ts             # Auth0 client
      db/                  # Drizzle schema + client
      trust/               # Progressive trust engine
armada_mobile/             # Flutter companion app
  lib/
    models/                # CibaRequest, TrustScore
    screens/               # Login, Home (Fleet/Approvals/Profile)
    services/              # Auth, API, Notifications
```

## Running Locally

### Web App

```bash
cd armada
npm install
cp .env.example .env.local   # Fill in Auth0 + API keys
npm run dev
```

### Flutter App

```bash
cd armada_mobile
flutter pub get
# Add your google-services.json to android/app/
flutter run
```

### Environment Variables

```
AUTH0_DOMAIN=           # Your Auth0 tenant
AUTH0_CLIENT_ID=        # Auth0 application client ID
AUTH0_CLIENT_SECRET=    # Auth0 application client secret
AUTH0_SECRET=           # Random 32-byte hex for session encryption
GOOGLE_GENERATIVE_AI_API_KEY=  # Gemini API key
DATABASE_URL=           # Neon PostgreSQL connection string
APP_BASE_URL=           # Your deployment URL
```

## Key Screens

- **Permission Control Center** - Agent cards with animated trust gauges, live activity feed, permission matrix
- **Chat** - Natural language interface to the orchestrator, delegates to specialist agents
- **Audit Trail** - Complete log of every agent action with CIBA status
- **Settings** - Connected accounts (Token Vault), trust configuration
- **Mobile App** - CIBA approval cards with approve/deny, agent fleet monitoring, emergency kill switch

## Hackathon

Built for [Authorized to Act: Auth0 for AI Agents](https://authorizedtoact.devpost.com/)
