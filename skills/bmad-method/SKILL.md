---
name: bmad-method
description: Breakthrough Method for Agile AI Driven Development with 21 specialized agents and 50+ workflows. Use for: (1) Full software development lifecycle (Analysis → Planning → Solutioning → Implementation), (2) Parallel planning with multiple agents, (3) Agile best practices with structured workflows, (4) Batch task generation for Kanban. Supports 3 planning tracks: Quick Flow (tech-spec), BMad Method (PRD + Architecture), Enterprise (compliance + DevOps). Primary model: zai/glm-4.7 (GLM 4.7B) for all tasks - simple, consistent, fast.
---

# BMad Method - OpenClaw Integration

Breakthrough Method for Agile AI Driven Development, adapted for OpenClaw's autonomous agent architecture.

## Model Strategy

**Primary Model:** `zai/glm-4.7` (GLM 4.7B) - Used for all BMad Method tasks.

**Simplicity:** Consistent model across planning, development, and deployment. No routing complexity.

## Quick Start

```
/bmad-menu              # Show inline button menu (fastest way to access everything)
/bmad-help              # Get guided next steps based on current state
/bmad-parallel-planning     # Parallel: Generate PRD + Architecture + UX simultaneously
/bmad-full-planning       # Sequential: PM → Architect → UX → Sprint Planning
/bmad-implement           # Dev-story + code-review for backlog items
```

## Planning Tracks

### Quick Flow (1-15 stories, bug fixes)
- `/bmad-quick-spec` - Analyze codebase → generate tech-spec → skip to implementation
- Use for: Small features, clear scope, bug fixes

### BMad Method (10-50 stories, products/platforms)
- `/bmad-create-prd` - Product Requirements Document (personas, metrics, risks)
- `/bmad-create-architecture` - Technical decisions, system design
- `/bmad-create-epics` - Break PRD + Architecture → prioritized epics + stories
- Use for: Products, platforms, complex features

### Enterprise (30+ stories, compliance)
- `/bmad-enterprise-planning` - Adds security, DevOps, compliance gates
- Use for: Multi-tenant, regulated industries, enterprise systems

## Agent Workflows

### Parallel Planning Mode (Max Efficiency)
```
/bmad-parallel-planning [feature description]
```
Spawns 3 sub-agents simultaneously:
1. **PM Agent** - Creates PRD.md (product requirements)
2. **Architect Agent** - Creates architecture.md (technical design)
3. **UX Agent** - Creates ux-flows.md (user experience)

Collects all outputs → Merges into unified plan → Updates Kanban

**Example:**
```
User: /bmad-parallel-planning Build a T-shirt business web app
→ Spawns 3 parallel sub-agents
→ Collects PRD, Architecture, UX docs
→ Merges into "T-shirt Business Platform Plan"
→ Adds to Kanban: "Review merged plan", "Create epics", "Sprint planning"
```

### Sequential Planning Mode
1. `/bmad-create-prd` → Load PM agent skill → Output: `PRD.md`
2. `/bmad-create-architecture` → Load Architect agent → Output: `architecture.md`
3. `/bmad-create-epics` → Load PM agent → Output: `epics.md`
4. `/bmad-sprint-planning` → Load SM agent → Output: `sprint-status.yaml`

### Implementation Mode
For each story in Kanban backlog:
1. `/bmad-create-story` → SM agent creates story file
2. `/bmad-dev-story` → Dev agent implements code
3. `/bmad-code-review` → Dev agent validates quality

## Agent Skills (Load Individually)

- `/bmad-agent-pm` - Product Manager (PRD, epics, backlog)
- `/bmad-agent-architect` - Architect (architecture, tech decisions)
- `/bmad-agent-dev` - Developer (dev-story, code-review)
- `/bmad-agent-ux` - UX Designer (flows, wireframes)
- `/bmad-agent-sm` - Scrum Master (sprint planning, retro)
- `/bmad-agent-qa` - QA (test automation, test strategy)

## Integration with OpenClaw

### Memory Storage
- All artifacts stored in `memory/YYYY-MM-DD-bmad.md` (durable)
- Project artifacts in `_bmad-output/` directory:
  - `PRD.md` - Product requirements
  - `architecture.md` - Technical design
  - `epics/` - Epic and story files
  - `sprint-status.yaml` - Sprint tracking

### Kanban Integration
- `/bmad-full-planning` auto-updates Kanban:
  - Adds "Planning: Create PRD" to In Progress
  - Moves to Done when complete → Auto-adds next task
- `/bmad-parallel-planning` adds batch tasks to Kanban

### Cron Automation
- `bmad-daily-standup` cron (9 AM UTC) - Reviews sprint progress, updates Kanban
- `bmad-weekly-retro` cron (Sun 5 PM UTC) - Generates retrospective

## Sub-Agent Parallel System

**Maximize efficiency** with `sessions_spawn`:

```python
# Parallel planning pattern
sub_agents = [
  ("prd", "Create PRD for: {feature}", "pm-agent"),
  ("arch", "Design architecture for: {feature}", "architect-agent"),
  ("ux", "Design UX flows for: {feature}", "ux-agent")
]

# Spawn all in parallel (max 8 concurrent)
for name, task, skill in sub_agents:
  sessions_spawn(task, agentId="main", skill=skill)

# Collect and merge results
outputs = [sessions_history(sid) for sid in session_ids]
merged_plan = merge_outputs(outputs)
```

**Use when:** Product launches, new features, parallel architecture decisions

## Agent Skills (Load Individually)

- `/bmad-agent-pm` - Product Management (PRD, epics, sprint planning)
- `/bmad-agent-architect` - Software Architect (architecture, API design, tech stack)
- `/bmad-agent-dev` - Developer (dev-story, code-review, testing)
- `/bmad-agent-sm` - Scrum Master (sprint planning, retrospectives, standups)
- `/bmad-agent-ux` - UX Designer (user flows, personas, wireframes)

## References

- BMad Method Docs: http://docs.bmad-method.org
- Workflow Map: http://docs.bmad-method.org/reference/workflow-map/
- BMad Builder: https://github.com/bmad-code-org/bmad-builder

## Proactive Mode

When proactive mode is enabled:
- After `/bmad-dev-story` completion → Auto-suggest `/bmad-code-review`
- After sprint complete → Auto-suggest `/bmad-retrospective`
- Daily standup → Updates Kanban with sprint status

## Example Workflow

```
User: /bmad-parallel-planning Build a scalable e-commerce platform

→ Spawns 3 parallel sub-agents (PM, Architect, UX)
→ After 30s, collects outputs:
   - PRD: Multi-tenant, 10k users, marketplace features
   - Architecture: Microservices, PostgreSQL, Redis cache
   - UX: Seller dashboard, buyer checkout, admin panel
→ Merges into "E-commerce Platform Plan"
→ Updates Kanban:
   - [x] Parallel planning complete
   - [ ] Review merged plan (add task)
   - [ ] Create 12 epics from plan (add task)
   - [ ] Sprint planning: Sprint 1 (MVP features)

User: add Implement user auth, Build checkout flow, Create seller dashboard

→ Kanban updated: 3 tasks added to Backlog
→ Auto-move to In Progress when sprint starts
```

## Tips

- Use `/bmad-help` when stuck - it analyzes current state and suggests next steps
- Parallel mode for new features, sequential for complex products
- All artifacts stored in memory for context continuity across sessions
- Kanban batch mode: "add Task1, Task2, Task3" to add multiple tasks
