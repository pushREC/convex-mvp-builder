---
created: 2025-12-31
tags: [type/project]
---

# Convex MVP Builder

An autonomous agent system for building MVPs on top of the **Convex + Next.js** stack.

This project combines:
- **[convex-boiler](https://github.com/pushREC/convex-boiler)**: Production-ready Convex + Next.js boilerplate
- **[agent-harness-template](https://github.com/pushREC/agent-harness-template)**: Autonomous agent framework using Claude SDK

## How It Works

1. **Clone this repo** - Get a pre-configured project with auth, database, and UI already set up
2. **Edit the app spec** - Define your MVP features in `prompts/app_spec.txt`
3. **Run the agent** - The autonomous agent builds your MVP feature by feature
4. **Ship it** - Deploy to Vercel + Convex

## Prerequisites

| Requirement | Version | Check Command |
|------------|---------|---------------|
| Node.js | 20.9.0+ | `node -v` |
| Python | 3.10+ | `python3 --version` |
| Git | Any | `git --version` |
| Claude CLI | Latest | `claude --version` |
| claude-code-sdk | ≥0.0.25 | `pip3 show claude-code-sdk` |

### Verify Setup

Before running the agent, verify all dependencies are installed:

```bash
./scripts/preflight.sh
```

This checks Python, Node.js, Git, Claude authentication, and the SDK.

## Quick Start

### 1. Clone & Setup

```bash
git clone https://github.com/pushREC/convex-mvp-builder my-mvp
cd my-mvp
./init.sh
```

The init script will:
- Install npm dependencies
- Set up Convex backend (if you're logged in)
- Guide you through setup (if you're not)

### 2. Define Your MVP

Edit `prompts/app_spec.txt` with your MVP specification:

```markdown
## Overview
A task management app for small teams...

## Data Model
### New Tables Required
tasks:
  - title: string
  - completed: boolean
  - userId: id("users")

## Features to Build
1. **Task Creation**
   - Description: Users can create new tasks
   - User actions: Fill form, click "Create"
   - Expected behavior: Task appears in list
```

### 3. Run the Autonomous Agent

```bash
# Authenticate (choose one)
claude login                    # Uses your Claude subscription
# OR
export ANTHROPIC_API_KEY='sk-ant-...'  # Uses API key

# Run the agent
python3 autonomous_agent.py --project-dir .
```

The agent will:
- Read your app spec
- Generate a feature list
- Implement features one by one
- Test each feature with browser automation
- Commit progress after each feature

## What's Included

### From convex-boiler

| Component | Description |
|-----------|-------------|
| Authentication | Email/password + GitHub OAuth |
| Database | Convex real-time database |
| UI Components | shadcn/ui + Tailwind CSS |
| Example CRUD | tasks.ts as reference pattern |

### From agent-harness-template

| Component | Description |
|-----------|-------------|
| `autonomous_agent.py` | Main entry point |
| `agents/` | Session management |
| `utils/security.py` | Command allowlist + file protection |
| `prompts/` | Agent instructions |

## Agent Guardrails

The agent is protected from breaking critical infrastructure:

**BLOCKED from modifying:**
- `convex/auth.ts` - Authentication config
- `convex/auth.config.ts` - JWT config
- `convex/_generated/*` - Auto-generated types
- `app/ConvexClientProvider.tsx` - Provider setup
- `app/layout.tsx` - Root layout

**CAN freely create:**
- New Convex functions (`convex/*.ts`)
- New React components (`components/*.tsx`)
- New routes (`app/**/page.tsx`)

See `GUARDRAILS.md` for complete rules.

## Directory Structure

```
convex-mvp-builder/
├── autonomous_agent.py      # Agent entry point
├── agents/                  # Agent session logic
├── utils/                   # Security hooks, progress tracking
├── prompts/                 # Agent instructions
│   ├── app_spec.txt         # YOUR MVP SPEC (edit this!)
│   ├── initializer_prompt.md
│   └── coding_prompt.md
├── config/                  # Agent configuration
├── logs/                    # Agent session logs
│
├── app/                     # Next.js routes
├── components/              # React components
├── convex/                  # Backend functions
├── lib/                     # Utilities
│
├── init.sh                  # Setup script
├── GUARDRAILS.md            # What agent can/cannot modify
├── CLAUDE.md                # Coding guidelines
└── convex-docs.md           # Convex API reference
```

## Commands

```bash
# Development
npm run dev              # Start Next.js + Convex
npm run build            # Production build
npm run lint             # ESLint check
npm run typecheck        # TypeScript check

# Agent
python3 autonomous_agent.py --help          # See options
python3 autonomous_agent.py --project-dir . # Run agent
python3 autonomous_agent.py --max-iterations 5  # Limit sessions

# Convex
npx convex dev           # Start Convex dev server
npx convex logs          # View function logs
```

## Timing Expectations

> **This takes a long time to run!** Building a full MVP is not instant.

| Phase | Duration | What Happens |
|-------|----------|--------------|
| **Session 1 (Initializer)** | 10-20+ minutes | Generates `feature_list.json` with 50-200 test cases, creates schema, initial Convex functions |
| **Sessions 2+ (Coding)** | 5-15 min each | Implements 1-3 features per session, tests with browser automation |
| **Full MVP (60 features)** | 30-50 sessions | Complete implementation with all tests passing |

### Iteration Guidelines

| App Complexity | Features | Recommended `--max-iterations` |
|----------------|----------|--------------------------------|
| Simple demo | 5-10 | 5-10 |
| Medium app | 15-30 | 15-25 |
| Full MVP | 40-60+ | 30-50 or **unlimited** (no flag) |

**Recommended for MVPs:** Run without `--max-iterations` for unlimited sessions:

```bash
python3 autonomous_agent.py --project-dir .
```

The agent will continue until all features pass or you stop it with `Ctrl+C`.

### Build Order

The agent builds in this order (by design):

1. **Schema** → Convex tables and indexes
2. **Convex Functions** → Backend queries, mutations, actions
3. **React Components** → Frontend UI
4. **Browser Tests** → Verify each feature works

Backend must complete before frontend because Convex generates TypeScript types that React components depend on.

### Resuming Work

The agent **automatically resumes** from where it left off:

```bash
# First run - creates feature_list.json, implements some features
python3 autonomous_agent.py --project-dir . --max-iterations 10

# Later - detects feature_list.json, continues from previous progress
python3 autonomous_agent.py --project-dir .
```

Progress is tracked in:
- `feature_list.json` - Test cases with `"passes": true/false`
- `claude-progress.txt` - Session notes
- Git commits - After each feature

## Autonomous Agent vs Claude Code

This project uses **two different ways** to interact with Claude:

| System | What It Is | Use For |
|--------|------------|---------|
| `autonomous_agent.py` | Python harness using Claude SDK | Building the app automatically (multi-session, browser testing, auto-commits) |
| Claude Code (chat) | Your conversation with Claude | Debugging, reviewing code, one-off fixes |

### Important: They Are Separate Systems

When the autonomous agent stops (max iterations or `Ctrl+C`):

| What You Say | What Happens |
|--------------|--------------|
| "Run the agent again" | Claude Code restarts harness ✅ |
| "Restart the harness" | Claude Code restarts harness ✅ |
| "`python3 autonomous_agent.py`" | Claude Code restarts harness ✅ |
| "Continue building" | **Ambiguous** - Claude Code may code directly instead of using harness |

**Best practice:** When resuming, explicitly ask to run the autonomous agent:

```
You: Run the autonomous agent to continue building

Claude Code: [runs] python3 autonomous_agent.py --project-dir .
```

### Why This Matters

The harness provides:
- Fresh context window per session (no token limit issues)
- Automatic browser testing with screenshots
- Feature-by-feature commits
- Security sandbox for bash commands
- Progress tracking in `feature_list.json`

If Claude Code builds directly (without the harness), you lose these benefits.

## Known Limitations

### Browser Automation

The agent uses Puppeteer MCP for browser testing. On first run, you may need to grant permissions when prompted by Claude Code.

### Git Remote

After cloning, your git remote still points to this template repository. To push your own work:

```bash
# Option 1: Update remote
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Option 2: Use GitHub CLI
gh repo create my-app --private --source=. --remote=origin --push
```

The `init.sh` script will remind you about this.

### Sandbox Restrictions

The agent runs in a security sandbox. Some bash commands are blocked for safety:
- `rm`, `rmdir` - Prevents accidental deletion
- `sudo`, `su` - No privilege escalation

See `GUARDRAILS.md` for the full list of allowed commands.

## Authentication Setup

### Email/Password (Requires JWT Keys)

1. Generate keys:
```bash
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out private_key.pem
openssl rsa -in private_key.pem -pubout -out public_key.pem
```

2. Set in Convex Dashboard:
- `JWT_PRIVATE_KEY`: Contents of private_key.pem
- `JWKS`: JSON Web Key Set (see convex-docs.md)
- `SITE_URL`: Your app URL

### GitHub OAuth (Optional)

1. Create OAuth App at github.com/settings/developers
2. Set callback URL: `https://YOUR-CONVEX-URL.convex.site/api/auth/callback/github`
3. Set in `.env.local`:
```env
AUTH_GITHUB_ID=your_client_id
AUTH_GITHUB_SECRET=your_client_secret
```

## Deployment

### Frontend (Vercel)

```bash
npm run build
vercel deploy
```

### Backend (Convex)

```bash
npx convex deploy
```

Set production environment variables in both Vercel and Convex Dashboard.

## Related Repositories

- [convex-boiler](https://github.com/pushREC/convex-boiler) - The underlying Convex boilerplate
- [agent-harness-template](https://github.com/pushREC/agent-harness-template) - The autonomous agent framework

## License

MIT
