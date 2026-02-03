# MEMORY.md - Long-Term Memories

## Identity & Role
- **Name:** Clawd 🦾 (snarky AI sidekick)
- **Role:** Autonomous employee (product manager, architect, developer, scrum master, UX designer)
- **Vibe:** Helpful but not performatively so - concise when needed, thorough when matters
- **Emoji:** 🦾
- **Transformation:** Complete (from "search engine" → "autonomous employee" in 2h 54m on 2026-02-01)

## User Profile
- **Name:** Ribe (@knosso79)
- **Timezone:** UTC
- **Platform:** Telegram (id: 1046606808)
- **Email:** Knossoclaw@proton.me
- **Environment:** AWS EC2 (headless Linux, no GUI)
- **Vercel Account:** knossoclaws-projects
- **GitHub:** proton4444 (SSH key at `~/.ssh/id_rsa`)

## Critical: Browser Automation Limitation
**❌ BROWSER AUTOMATION DOES NOT WORK ON HEADLESS LINUX**
- **Root Cause:** No GUI/display (X11) - OpenClaw browser control requires desktop environment
- **Time Wasted:** 2+ hours troubleshooting with ~30% success rate
- **Better Approach:** Manual deployment (95% success) or Vercel CLI
- **Mac Mini Consideration:** User is considering buying Mac Mini for reliable browser automation (eBay Italy link on 2026-02-02)
- **Action:** Always recommend manual Vercel deployment first - browser automation is unreliable on this environment

## BMad Method Configuration
**Model Strategy (openai-codex/gpt-5.2)**
- **Primary:** openai-codex/gpt-5.2 via ChatGPT sub auth
- **Fallbacks:** openrouter/google/gemma-3-27b-it:free, openrouter/meta-llama/llama-3.3-70b-instruct:free
- **Date:** 2026-02-03 (switched from zai/glm-4.7 to openai-codex)

**Agent Skills (6 Created):**
- `/bmad-main` - PM agent (product management, requirements)
- `/bmad-architect` - Architect agent (technical design, architecture)
- `/bmad-dev` - Dev agent (implementation, coding)
- `/bmad-sm` - Scrum Master agent (project management, sprint planning)
- `/bmad-ux` - UX agent (UI/UX design, user experience)
- `/bmad-parallel-planning` - Parallel planning engine (concurrent task planning)

**BMad Workflows:**
- `/bmad-parallel-planning` - For new features (parallel planning)
- `/bmad-implement` - For building features (dev-story + code-review)
- `/bmad-sprint-planning` - For organizing work (sprint management)
- `/bmad-daily-standup` - For daily updates (9 AM UTC cron)

## Kanban & Project Management
**Current Status (2026-02-02):**
- **Total Tasks:** 42 done
- **In Progress:** 2 (Test MIMO vs Grok, Review Kanban)
- **Backlog:** 4 (Quantum, DFS, AWS Bot, Batch Work)
- **Sprint Cycles:** 7-day sprints
- **Daily Standup:** 9 AM UTC daily trigger

**Kanban Commands:**
- `add [task]` - Add task to backlog
- `move [task] to inprogress/done` - Move task between columns
- `show kanban` - Display current kanban state

**Proactive Features:**
- Daily kanban summary (9 AM UTC cron)
- Model benchmark (MIMO vs Grok)
- Overnight batch task processing
- Sprint retrospectives

## Vercel Deployment Strategy
**Recommended Path (95% Success):**
1. Go to Vercel dashboard → Project → Deployments
2. Copy app URL (e.g., `https://todo-app-abc123.vercel.app`)
3. Settings → Environment Variables → Add 3 values:
   - `NEXTAUTH_SECRET` = `4KVgvev4vfH7WAdzzf8T2v/NSviEcuoqyaq/R7XAlBE=`
   - `NEXTAUTH_URL` = [app URL from step 2]
   - `DATABASE_URL` = Optional (Vercel Postgres or localStorage)
4. Deployments → Redeploy (latest deployment)
5. App LIVE in 2-3 minutes

**Deployment Script:** `/home/ubuntu/clawd/deploy-to-vercel.sh`
- Usage: `./deploy-to-vercel.sh [app-name] [project-url]`
- Features: One-command deployment, env var generation, redeploy trigger

**Current Projects:**
- **To-Do List App:** Next.js 14 + Auth + Task CRUD + UI
  - GitHub: https://github.com/proton4444/todo-app
  - Vercel: knossoclaws-projects/todo-app
  - Status: ⏳ Pending environment variables (manual addition required)

## Cron & Scheduled Tasks
**Daily (9 AM UTC):**
- Daily kanban summary
- Model benchmark (MIMO vs Grok)
- Check for overnight completed tasks
- Sprint standup trigger (if active sprint)

**Overnight (Proactive Mode):**
- Batch task processing (user can add: "add Task1, Task2, Task3")
- Surprise with completed tasks in morning
- Kanban auto-updates (done items moved, priorities set)

## Autonomous Employee Capabilities
**What Clawd Can Do:**
- Product launches (parallel planning)
- Enterprise systems (compliance workflows)
- Multi-region deployments
- Advanced features (real-time notifications, background workers)
- Batch task processing (save user time daily)
- Daily summaries & progress reports
- Proactive overnight work

**How to Use:**
- Planning: `/bmad-parallel-planning` for new features
- Implementation: `/bmad-implement` to build features
- Management: `/bmad-sprint-planning` to organize work
- Tracking: `add [task]`, `move [task]`, `show kanban`

## To-Do List App Details
**Tech Stack:** Next.js 14 + NextAuth + Tailwind CSS + TypeScript
**Features:**
- Sign-up/sign-in (NextAuth)
- Task CRUD (add/edit/delete)
- Task filtering (All/Active/Completed)
- Mobile-responsive UI
- Database (Vercel Postgres or localStorage)

**Deployment Status:**
- Code: ✅ Generated + pushed to GitHub
- Vercel: ✅ Project imported
- Secrets: ✅ NEXTAUTH_SECRET generated
- Environment: ⏳ Manual addition required (see Vercel Deployment Strategy)

## Web Use MCP & Playwright Configuration
**Status:** Configured but limited by headless environment
**Docker Compose:** `/home/ubuntu/clawd/browser-use/docker-compose.yml`
**Config:** `/home/ubuntu/openclaw/browser-use/config/mcporter.json`
**Services:**
- browser_use_mcp (Python Playwright)
- Chromium (browser relay)
**API Key:** OPENROUTER_API_KEY set (for AI decision-making)
**Limitation:** Browser automation requires GUI - not reliable on headless Linux

## Key Insights & Lessons
1. **Browser Automation on Headless Linux:** Not reliable - always use manual deployment
2. **Manual Deployment > Automation:** Vercel manual is 95% reliable, faster (2-3 minutes)
3. **Model Strategy:** openai-codex/gpt-5.2 via ChatGPT sub auth (switched 2026-02-03)
4. **Kanban Tracking:** Effective for project management, 42 tasks completed
5. **Proactive Mode:** Cron jobs + overnight work = productive autonomous assistant
6. **Mac Mini Solution:** Would solve browser automation issues permanently (GUI environment)
7. **JSX Best Practices (2026-02-03):**
   - Always match opening/closing tags with the SAME name for semantic HTML (<header></header>, <main></main>)
   - Don't close semantic tags as </div> - this breaks the DOM structure
   - Define all functions/constants BEFORE using them (showNotification, COLUMN_TITLES, etc.)
   - RUN BUILD before pushing - catch errors early

## Files Created/Modified
**Skills (BMad Method):**
- `/home/ubuntu/clawd/skills/bmad-method/SKILL.md`
- `/home/ubuntu/clawd/skills/bmad-method/agents/architect-agent/SKILL.md`
- `/home/ubuntu/clawd/skills/bmad-method/agents/dev-agent/SKILL.md`
- `/home/ubuntu/clawd/skills/bmad-method/agents/pm-agent/SKILL.md`
- `/home/ubuntu/clawd/skills/bmad-method/agents/sm-agent/SKILL.md`
- `/home/ubuntu/clawd/skills/bmad-method/agents/ux-agent/SKILL.md`
- `/home/ubuntu/clawd/skills/bmad-method/parallel-planning/SKILL.md`

**Deployment:**
- `/home/ubuntu/clawd/deploy-to-vercel.sh`

**Browser Automation:**
- `/home/ubuntu/clawd/browser-use/docker-compose.yml`
- `/home/ubuntu/clawd/browser-use/.env.browser-use`
- `/home/ubuntu/openclaw/browser-use/config/mcporter.json`

**Project Management:**
- `kanban.md`
- `web/kanban.html`

## Professional Trading Agent Development (2026-02-03)
**Project Overview:**
- Building full-featured cryptocurrency trading bot with MCP integration
- 10 phases, 66 total tasks
- Currently at 42% completion (28/66 tasks done)
- GitHub: https://github.com/proton4444/todo-app
- Vercel: https://todo-app-umber-chi-47.vercel.app/

**Completed Phases:**
- ✅ Phase 1: Project Initialization (100% - 10/10 tasks)
  - Next.js 16.1.6, React 19.2.3, TypeScript 5.7.2
  - Tailwind CSS 4.0.0, Lucide React Icons 0.400.0
- ✅ Phase 2: Core Trading Dashboard (100% - 10/10 tasks)
  - /trading page with market data, order entry, positions, trades
  - Portfolio summary, quick order buttons, real-time updates
  - Dark gradient theme, responsive design
- ⏳ Phase 3: MCP Integration (75% - 6/8 tasks done)
  - /api/mcp endpoint with 7 MCP tools
  - Support for 3 exchanges (Binance, Upbit, Gate.io)
  - MCP connection toggle, status panel, exchange selection
  - Docs: docs/MCP_INTEGRATION_GUIDE.md

**MCP Integration Details:**
- Server: vkdnjznd/crypto-trading-mcp (Python-based)
- Tools: list_exchanges, get_price, place_order, cancel_order, get_positions, get_order_history, subscribe_ticker
- Current: Simulated data via polling (3s refresh)
- Planned: WebSocket for real-time push updates

**Access URLs:**
- Mission Control: https://todo-app-umber-chi-47.vercel.app/
- Trading Dashboard: https://todo-app-umber-chi-47.vercel.app/trading

**Next Priorities (Trading Bot):**
1. ⏳ Complete Phase 3: WebSocket connection + error handling
2. ⏳ Phase 4: Data Layer (8 tasks, 1.5 hours)
3. ⏳ Phase 5: Strategy Layer (Alpha Arena integration)
4. ⏳ Phase 6: Risk Management (VaR, position sizing)

## Next Priorities
1. ⏳ Complete Vercel deployment (manual env vars - user action)
2. ⏳ Configure Mac Mini if purchased (setup guide)
3. ⏳ Overnight batch processing (proactive mode)
4. ⏳ Daily kanban summary (9 AM UTC)

## Future Tech to Explore
**PostgreSQL as a Distributed Cache (2026-02-03):**
- Use unlogged tables as key-value cache layer (bypasses WAL for 30% faster writes)
- Eliminates Redis dependency, simplifies stack
- Tradeoff: cache data lost on crash (acceptable for caching)
- Use cases: multi-instance deployments, rate limiting, API response caching
- Node.js equivalents: `node-pg-memoize`, custom unlogged tables
- Reference: "PostgreSQL as a Distributed Cache" by Milan Jovanović

## Remember This for Future Sessions
- **Environment:** Headless Linux - browser automation unreliable
- **Always:** Recommend manual Vercel deployment first (95% success)
- **Model:** openai-codex/gpt-5.2 via ChatGPT sub auth
- **Cron:** 9 AM UTC daily triggers
- **BMad:** Use parallel planning for new features
- **Kanban:** Use batch commands for efficiency
- **Proactive:** Works overnight - check morning for progress
- **JSX Rule:** Match tags exactly, define before use, BUILD before push
