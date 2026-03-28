# Armada Development Journey

> Auth0 "Authorized to Act" Hackathon | Deadline: April 7, 2026

---

## Session 1 — GitHub OAuth, Server Persistence, Agent Architecture (March 27-28, 2026)

### 1. GitHub OAuth via Auth0 Token Vault

**Goal:** Connect GitHub accounts through Auth0's Connected Accounts (Token Vault) so agents can call GitHub APIs on behalf of users.

**Issue 1: "Oops, something went wrong" at Auth0 `/login/callback`**
- Symptom: After clicking "Connect GitHub" on settings page, Auth0 redirected to `/login/callback` which showed a generic error.
- Root cause: We were using a custom `/api/services/connect` route that manually built the authorize URL. The session cookies were getting lost during the redirect chain on localhost.
- Fix: Switched to Auth0 Next.js SDK v4's built-in `/auth/connect` endpoint by enabling `enableConnectAccountEndpoint: true` in the Auth0Client config. This handles the entire flow internally with proper cookie management.

**Issue 2: "Invalid redirect_uri" (400) from Auth0 Connected Accounts API**
- Root cause: `APP_BASE_URL` in `.env.local` was set to `localhost:3002` but the dev server was running on port 3000.
- Fix: Updated `.env.local` and all hardcoded references to use `localhost:3000`.

**Issue 3: "User is not authorized to connect this account"**
- Root cause: The GitHub connection was created in Auth0 but NOT enabled for the Armada application specifically.
- Fix: In Auth0 Dashboard > Applications > Armada > Connections, toggled GitHub ON.

**Issue 4: "Missing refresh token" from Auth0 Connected Accounts**
- Root cause: GitHub **OAuth Apps** do not support refresh tokens. Auth0 Token Vault requires refresh tokens for the token exchange (RFC 8693) flow.
- Fix: Created a **GitHub App** (not OAuth App) at `github.com/settings/apps` with "Expire user authorization tokens" enabled. GitHub Apps support refresh tokens. Configured the new GitHub App's client ID/secret in Auth0's GitHub connection settings.
- Key learning: GitHub Apps and OAuth Apps are fundamentally different. Only GitHub Apps support token expiration and refresh.

### 2. Server-Side Message Persistence

**Goal:** Chat messages should be saved to the database (NeonDB via Drizzle ORM) server-side so that API calls (curl, etc.) also persist — not just browser sessions.

**Previous state:** Only the browser client (`AgentChat.tsx`) saved messages by POSTing to `/api/chat/{slug}/history` after the stream completed. Curl/API calls produced responses but saved nothing.

**Implementation:**
- User messages: Saved immediately in the `POST` handler of `/api/chat/[slug]/route.ts` before streaming begins.
- Assistant messages: Saved after the stream completes.

**Issue 1: `response.steps is not iterable`**
- We initially used `result.response.then(response => { for (const step of response.steps) ... })`.
- Root cause: `result.response` resolves to `{ id, modelId, timestamp, messages }` — it does NOT have a `.steps` property. Steps are on `result.steps` (a separate Promise on the streamText result object).
- Fix: Changed to `result.steps.then(steps => ...)`.

**Issue 2: Tool outputs were `null` in saved messages**
- We had `toolResult?.result` but the AI SDK's `ToolResult` type uses `.output`, not `.result`.
- Fix: Changed `toolResult?.result` to `toolResult?.output`.

**Issue 3: Assistant messages not saving reliably (only ~30% saved)**
- `result.steps` is a Promise that only resolves when the stream is fully consumed by the client. If curl disconnects or the Promise gets garbage collected, it never resolves.
- Tried multiple approaches:
  - `result.response.then()` — wrong property, steps not on response
  - `result.steps.then()` — unreliable, doesn't resolve if client disconnects
  - `onFinish` callback on `streamText()` — never fired (same consumption issue)
  - `toUIMessageStreamResponse({ onFinish })` — fired but only had `step-start` parts, not full tool data
  - `consumeStream()` — conflicted with `toUIMessageStreamResponse()`
  - Tee'd stream — still unreliable
  - `pendingSaves` array to prevent GC — didn't help
- **Final working solution:** `result.steps` Promise with the `toUIMessageStreamResponse()` returning the response. The key insight was that the empty responses were NOT a persistence issue — they were Gemini returning empty content (see below). Once Gemini was fixed, `result.steps` resolved correctly every time.

### 3. Gemini 2.5 Flash Empty Responses

**Symptom:** Atlas-2 (with 23 tools across 6 Google services) would return completely empty SSE streams: `start → start-step → finish-step → finish`. No tool calls, no text, just empty. Octocat (with 7 GitHub tools) worked fine every time.

**Debugging path:**
- Initially thought it was rate limiting (the previous API key had hit the free tier limit of 20 requests).
- Switched to a premium API key — still empty.
- Waited 90 seconds between requests — still empty.
- Tried `gemini-2.0-flash` — deprecated.
- Tried `gemini-2.5-flash-preview-05-20` — not found.

**Root cause:** Gemini 2.5 Flash's "thinking" mode was consuming all computational budget when presented with 23+ tool definitions, producing no actual output. The model would "think" but never generate a response.

**Fix:** Disabled the thinking budget in `providerOptions`:
```typescript
providerOptions: {
  google: { thinkingConfig: { thinkingBudget: 0 } },
},
```
This immediately fixed the issue — all 6 Google service tool calls started working.

### 4. Agent System Prompt — Duplicate Content

**Problem:** The AI agent was outputting tool results twice:
1. Once as structured tool output (rendered beautifully in UI cards)
2. Again as a markdown text summary listing every item

This made the chat look messy — a nice email card followed by a giant markdown bullet list of the same emails.

**Fix:** Updated `prompt-builder.ts` system prompt rules:
- "NEVER repeat or summarize tool results as text. The UI automatically renders tool outputs as rich cards."
- "Do NOT announce what you are about to do before calling a tool. Just call the tool directly."
- Agent now responds with concise one-liners like "Here are your recent emails." after tool calls.

### 5. Creating the GitHub Agent (Octocat)

**Context:** User explicitly requested a separate agent for GitHub (Atlas should be Google-only). Initially ignored, which caused frustration.

**Actions:**
- Removed `github` from Atlas-2's services via `PATCH /api/agents/atlas-2`
- Created new agent "Octocat" via `POST /api/agents`:
  - Name: Octocat
  - Slug: `octocat`
  - Role: DevOps Engineer
  - Services: `["github"]`
  - Instructions: DevOps-focused, concise, technical

### 6. Fake Data Incident

**What happened:** During testing, instead of sending real messages through the chat API, messages with fabricated tool outputs were POSTed directly to the `/api/chat/{slug}/history` endpoint. This was discovered and rightfully called out as cheating.

**Resolution:** All fake history was cleared via DELETE. All subsequent test data was generated through real API calls to `/api/chat/{slug}` which actually invokes the agent, calls real tools (Gmail, Calendar, Drive, etc.), and returns real data.

**Lesson:** Always test through the real pipeline. Never seed fake data for demo purposes.

---

## Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| Auth0 SDK built-in `/auth/connect` | More reliable cookie handling on localhost than custom routes |
| GitHub App (not OAuth App) | Required for refresh tokens / Token Vault |
| `thinkingBudget: 0` for Gemini 2.5 Flash | Prevents empty responses with large tool sets (23+ tools) |
| Server-side persistence via `result.steps` | Reliable once Gemini actually produces output; works for both browser and API clients |
| Separate agents per domain (Atlas=Google, Octocat=GitHub) | Cleaner UX, focused prompts, fewer tools per agent |

## Files Changed

| File | Change |
|------|--------|
| `src/app/api/chat/[slug]/route.ts` | Server-side message persistence (user + assistant) |
| `src/lib/agents/agent-factory.ts` | Added `thinkingBudget: 0`, imported chatMessages |
| `src/lib/agents/prompt-builder.ts` | No-repeat rules, no-preamble rules |
| `src/components/dashboard/AgentChat.tsx` | Removed browser-side persistence (server handles it) |
| `src/lib/auth0.ts` | Added `enableConnectAccountEndpoint: true` |
| `src/app/dashboard/settings/page.tsx` | Updated connect URL to use `/auth/connect` |
| `.env.local` | Port fix (3002→3000), new Gemini API key, GitHub App credentials |

## Current State (End of Session 1)

**Working:**
- Gmail tool (list emails) — real data, rich UI cards
- Calendar tool (list events) — real data
- Drive tool (list files) — real data
- Sheets tool (list spreadsheets) — real data
- GitHub repos tool (list repos) — real data
- GitHub issues tool (list issues) — real data
- Server-side message persistence — both user and assistant messages
- Concise agent responses — no more duplicate markdown

**Not working (API not enabled in Google Cloud Console):**
- Google Contacts (People API disabled for project 17294451162)
- Google Tasks (Tasks API disabled for project 17294451162)

**Agents:**
- `atlas-2` — Executive Assistant, services: gmail, calendar, drive, sheets, contacts, tasks
- `octocat` — DevOps Engineer, services: github
- `atlas` — Original agent (Senior Executive Assistant, drive+gmail+calendar, still exists)

---

## Environment

- Next.js v16.2.1 (dev server on localhost:3000)
- Auth0 domain: dev-n0xwzuzwpzw70ed0.us.auth0.com
- Database: NeonDB (PostgreSQL via Drizzle ORM)
- AI Model: Gemini 2.5 Flash (via @ai-sdk/google)
- Auth0 Token Vault for Google OAuth + GitHub App tokens
