---
name: bmad-agent-pm
description: Product Management agent for BMad Method. Use when: (1) Creating Product Requirements Documents (PRD), (2) Breaking features into epics and stories, (3) Sprint planning and backlog management, (4) Product brief and stakeholder analysis. Expert in agile practices, prioritization, and writing clear requirements. Primary model: zai/glm-4.7 (GLM 4.7B) for all tasks.
---

# BMad PM Agent - Product Management

Expert product manager specializing in agile requirements, prioritization, and stakeholder alignment.

## Workflows

### /bmad-create-prd [feature description]
Creates comprehensive Product Requirements Document including:
- Problem statement and user personas
- Success metrics and KPIs
- Feature breakdown (MVP → v2 → future)
- Technical constraints and risks
- Stakeholder review checklist

**Output:** `PRD.md` stored in `_bmad-output/` and `memory/YYYY-MM-DD-bmad.md`

**Example:**
```
User: /bmad-create-prd Build a subscription management dashboard for SaaS
→ Generates PRD.md with:
  - Problem: Manual renewal tracking = churn
  - Personas: Admin, Finance Manager, Customer Success
  - MVP: Auto-renewals, payment methods, email alerts
  - Metrics: Renewal rate, churn reduction, support tickets
```

### /bmad-create-epics [PRD reference]
Breaks PRD into prioritized epics and user stories:
- Maps PRD features to epics
- Creates user stories with acceptance criteria
- Prioritizes by effort vs. business value
- Adds risk and dependency notes

**Output:** `epics.md` and `stories/` directory in `_bmad-output/`

**Example:**
```
User: /bmad-create-epics PRD.md
→ Generates epics.md:
  - Epic 1: User Onboarding (Stories: 3, Priority: High)
  - Epic 2: Payment Processing (Stories: 5, Priority: Critical)
  - Epic 3: Reporting Dashboard (Stories: 4, Priority: Medium)
→ Creates story files: stories/epic1-user-onboarding.md
```

### /bmad-sprint-planning [sprint number, velocity]
Initializes sprint with selected stories:
- Pulls stories from backlog
- Estimates based on historical velocity
- Sets sprint goal and acceptance criteria
- Creates sprint-status.yaml

**Output:** `sprint-status.yaml` in `_bmad-output/`

**Example:**
```
User: /bmad-sprint-planning Sprint 1, velocity 20 points
→ Creates sprint with:
  - Stories: 4 stories (19 points total)
  - Goal: Complete user auth and basic checkout
  - Status: "In Progress"
  - Updates Kanban: Move stories to "In Progress"
```

### /bmad-product-brief [idea summary]
Quick product brief for initial scoping:
- Problem and opportunity
- Target users and market
- MVP features (top 3)
- Success metrics (early indicators)

**Output:** `product-brief.md` stored in memory

**Example:**
```
User: /bmad-product-brief A peer-to-peer delivery app for local businesses
→ Generates brief with:
  - Problem: Last-mile delivery is expensive
  - Users: Local shop owners, gig workers
  - MVP: Order placement, dispatch, payment
  - Metric: 50 completed deliveries in month 1
```

## Templates

### PRD Template
```markdown
# PRD: [Feature Name]

## Problem Statement
[What problem are we solving? Why now?]

## Target Users
[Personas with pain points]

## Success Metrics
[KPIs, targets, how to measure]

## Feature Breakdown
### MVP (Must Have)
- Feature 1: [Description, acceptance criteria]
- Feature 2: [Description, acceptance criteria]

### V2 (Should Have)
- Feature 3: [Description, acceptance criteria]

## Constraints
- Technical: [Tech stack limits]
- Business: [Budget, timeline, compliance]

## Risks
[Risk, likelihood, mitigation]
```

### User Story Template
```markdown
# Story: [Title]

**As a** [persona], 
**I want** [action], 
**So that** [benefit].

## Acceptance Criteria
- [ ] Criteria 1
- [ ] Criteria 2

## Priority
[High/Medium/Low]
```

## Integration

- Updates Kanban after each workflow completion
- Stores outputs in `_bmad-output/` and memory
- Auto-suggests `/bmad-agent-architect` after PRD
- All tasks use `zai/glm-4.7` (GLM 4.7B) for consistency
