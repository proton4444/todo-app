---
name: bmad-parallel-planning
description: Parallel planning engine for BMad Method. Use when: (1) Generating PRD, Architecture, and UX simultaneously for maximum efficiency, (2) Product launches or new features requiring rapid planning, (3) When time is critical and parallel execution needed, (4) Multiple perspectives needed upfront (product, technical, user experience). Spawns 3 sub-agents in parallel (PM, Architect, UX), collects outputs, merges into unified plan. Maximum 3x speedup over sequential planning. Primary model: zai/glm-4.7 (GLM 4.7B) for all agents.
---

# BMad Parallel Planning - Maximum Efficiency

Spawns multiple BMad agents simultaneously to generate PRD, Architecture, and UX designs in parallel.

## How It Works

### Parallel Execution Flow
```
User: /bmad-parallel-planning [feature description]

→ Step 1: Parse feature description and context
→ Step 2: Spawn 3 sub-agents in parallel:
  - Sub-agent 1: PM Agent → Creates PRD.md
  - Sub-agent 2: Architect Agent → Creates architecture.md
  - Sub-agent 3: UX Agent → Creates ux-flows.md
→ Step 3: Wait for all 3 to complete (max 8 concurrent)
→ Step 4: Collect outputs from all sub-agents
→ Step 5: Merge into unified plan
→ Step 6: Update Kanban with batch tasks
→ Step 7: Present integrated plan to user
```

### Performance Gain
- **Sequential**: ~15 minutes (5 min per agent)
- **Parallel**: ~5 minutes (all agents run simultaneously)
- **Speedup**: 3x faster

## Workflow: /bmad-parallel-planning

### Syntax
```
/bmad-parallel-planning [feature description]
```

### Example
```
User: /bmad-parallel-planning Build a subscription management dashboard for SaaS

→ Spawns 3 parallel sub-agents (each in isolated session):
  - PM Agent: "Create PRD for subscription management dashboard"
    → Output: PRD.md (product requirements, personas, metrics)
  - Architect Agent: "Design architecture for subscription management dashboard"
    → Output: architecture.md (tech stack, APIs, data model)
  - UX Agent: "Design UX flows for subscription management dashboard"
    → Output: ux-flows.md (user journeys, wireframes)

→ After ~5 minutes, collects all outputs
→ Merges into: unified-plan-subscription-dashboard.md
→ Updates Kanban:
  - [x] Parallel planning complete
  - [ ] Review merged plan (add task)
  - [ ] Create epics from merged plan (add task)
  - [ ] Sprint planning: Sprint 1 (add task)

→ Presents integrated plan:
  "Plan complete! Generated in parallel (5 min vs 15 min sequential).
  
  **Key Highlights:**
  - PRD: Admin dashboard, payment methods, auto-renewals
  - Architecture: Node.js, PostgreSQL, Redis, REST APIs
  - UX: Admin view, customer portal, settings page
  
  **Next Steps:**
  1. Review unified-plan-subscription-dashboard.md
  2. Add tasks: 'Implement user auth', 'Build checkout flow', 'Create admin dashboard'
  3. Start Sprint 1
  "
```

## Output Structure

### Unified Plan Template
```markdown
# Unified Plan: [Feature Name]

Generated via parallel planning on [Date]

## Overview
[Summary of feature and business value]

## PRD Highlights (from PM Agent)
### Problem Statement
[What problem are we solving?]

### Target Users
[User personas from PM Agent]

### Success Metrics
[KPIs from PRD]

### MVP Features
[Top features from PRD]

## Architecture Highlights (from Architect Agent)
### Technology Stack
[Stack from Architecture]

### System Components
[Components from Architecture]

### Data Model
[Key entities from Architecture]

## UX Highlights (from UX Agent)
### User Flows
[Flows from UX Agent]

### Wireframes
[Wireframe descriptions from UX Agent]

### Edge Cases
[Edge cases from UX Agent]

## Integrated Plan
### Epics
1. [Epic 1]: [Description] - [Priority]
2. [Epic 2]: [Description] - [Priority]

### Recommended Sprint 1
- Stories: [List of 3-5 stories]
- Goal: [Sprint goal]
- Velocity: [Estimated points]

## Risks and Mitigations
[Risks from all agents]

## Next Steps
1. Review unified plan
2. Create epics from merged plan
3. Sprint planning
```

## Advanced Usage

### Custom Agent Selection
You can specify which agents to run in parallel:
```
/bmad-parallel-planning [feature] --agents pm,architect
→ Only runs PM and Architect (no UX)
```

### Custom Model Selection
You can specify models for each agent:
```
/bmad-parallel-planning [feature] --models glm-4.7,glm-4.7,mimo
→ PM: GLM-4.7, Architect: GLM-4.7, UX: MIMO
```

### Timeout Control
Set max wait time for parallel agents:
```
/bmad-parallel-planning [feature] --timeout 300
→ Waits max 300 seconds (5 min) for all agents to complete
```

## Integration with Kanban

### Batch Task Addition
After parallel planning, automatically adds tasks to Kanban:
```
User: add Implement user auth, Build checkout flow, Create admin dashboard

→ Kanban updated: 3 tasks added to Backlog
→ User can then: "move Implement user auth to In Progress"
```

### Progress Tracking
- Parallel planning task appears in Kanban as "Parallel planning: [feature]"
- Moves to "Done" when all sub-agents complete
- Auto-adds "Review merged plan" task
- User can continue with "add [tasks]" to batch-add next work

## Error Handling

### Sub-Agent Failure
If one sub-agent fails:
- Logs error to `_bmad-output/parallel-errors.log`
- Continues with other agents' outputs
- Presents partial plan with error note
- Suggests retry or manual completion

### Timeout
If timeout is reached:
- Returns outputs from completed agents
- Marks incomplete agents as "Skipped"
- Suggests running individual workflows for missing outputs

## Integration

- Updates Kanban after each workflow completion
- Stores all outputs in `_bmad-output/`
- Unified plan stored in `memory/YYYY-MM-DD-bmad.md`
- Errors logged to `_bmad-output/parallel-errors.log`
- All tasks use `zai/glm-4.7` (GLM 4.7B) for consistency
- Auto-suggests `/bmad-create-epics` after parallel planning
- Auto-suggests `/bmad-sprint-planning` after epics creation
