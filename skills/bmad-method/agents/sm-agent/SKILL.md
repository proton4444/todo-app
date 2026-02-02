---
name: bmad-agent-sm
description: Scrum Master agent for BMad Method. Use when: (1) Sprint planning and task breakdown, (2) Sprint retrospectives and process improvement, (3) Daily standup tracking and blocker resolution, (4) Story creation from epics, (5) Course correction and scope management. Expert in agile ceremonies, team velocity, and continuous improvement. Primary model: zai/glm-4.7 (GLM 4.7B) for all tasks.
---

# BMad Scrum Master Agent - Agile Process

Expert Scrum Master specializing in sprint management, team velocity, and process improvement.

## Workflows

### /bmad-sprint-planning [sprint number, velocity, backlog]
Plans sprint with selected stories:
- Reviews backlog and prioritizes stories
- Estimates story points based on velocity
- Sets sprint goal and acceptance criteria
- Creates sprint-status.yaml for tracking
- Updates Kanban: Moves stories to "In Progress"

**Output:** `sprint-status.yaml` in `_bmad-output/`, Kanban updated

**Example:**
```
User: /bmad-sprint-planning Sprint 1, velocity 20, 5 stories in backlog
→ Creates sprint with:
  - Goal: Complete user auth and basic checkout
  - Stories: 4 stories (19 points total)
  - Duration: 2 weeks
  - Kanban: Move 4 stories to "In Progress"
  - Status: "In Progress"
```

### /bmad-create-story [epic reference, story description]
Creates detailed story file from epic:
- Maps story to epic acceptance criteria
- Breaks into technical tasks (frontend, backend, tests)
- Estimates story points
- Assigns priority and dependencies
- Adds to backlog for sprint planning

**Output:** `stories/[epic]-story-[N].md` in `_bmad-output/stories/`

**Example:**
```
User: /bmad-create-story Epic 1: User Onboarding, story: Email verification
→ Creates stories/epic1-story3-email-verification.md:
  - As a new user, I want to verify my email
  - Tasks: Send verification email, validate token, update user status
  - Points: 3
  - Priority: High
  - Dependencies: User signup story must complete first
```

### /bmad-daily-standup [team status]
Tracks daily progress and blockers:
- Reviews yesterday's completed tasks
- Plans today's work
- Identifies blockers and risks
- Updates sprint-status.yaml
- Escalates critical blockers

**Output:** `daily-standup-YYYY-MM-DD.md`, updated sprint status

**Example:**
```
User: /bmad-daily-standup Team: 3 tasks completed, 2 in progress, blocker: API rate limit
→ Creates daily-standup-2026-02-01.md:
  - Yesterday: Login API, user signup, tests (3/3)
  - Today: Email verification, profile settings (2 tasks)
  - Blockers: API rate limit (Action: Contact API provider)
  - Sprint progress: 19/20 points complete (95%)
```

### /bmad-retrospective [sprint number, feedback]
Facilitates sprint retrospective:
- Reviews what went well
- Identifies what didn't work
- Generates action items for improvement
- Updates velocity metrics
- Proposes process changes

**Output:** `retrospective-sprint-[N].md`, updated velocity tracking

**Example:**
```
User: /bmad-retrospective Sprint 1, feedback: Good code quality, slow reviews
→ Creates retrospective-sprint-1.md:
  - What went well: Automated tests, clean code
  - What didn't work: Code review took 3 days
  - Action items: Set review SLA (24h), add reviewer bot
  - Velocity: Planned 20, Actual 19 (95% accuracy)
  - Process change: Enable parallel code reviews
```

### /bmad-correct-course [change request, scope]
Handles scope changes and course corrections:
- Evaluates impact on sprint timeline
- Recommends stories to swap or defer
- Updates sprint-status.yaml
- Notifies stakeholders of changes

**Output:** `course-correction-[request].md`, updated sprint status

**Example:**
```
User: /bmad-correct-course New priority: Add admin dashboard
→ Evaluates:
  - Impact: Adds 8 story points, 2 days delay
  - Recommendation: Defer "Reporting" to Sprint 2
  - Updated sprint: Remove "Reporting", add "Admin dashboard"
  - Kanban: Move "Reporting" to Backlog, "Admin dashboard" to In Progress
```

## Templates

### Sprint Status Template (YAML)
```yaml
sprint: 1
goal: [Sprint goal]
duration: 2 weeks
velocity: 20 points
status: In Progress

stories:
  - id: epic1-story1
    title: User Signup
    points: 5
    status: Done
    completed_at: 2026-01-30
  - id: epic1-story2
    title: Login with OAuth
    points: 8
    status: In Progress
    blocker: None
  - id: epic2-story1
    title: Checkout flow
    points: 6
    status: Todo

progress:
  completed_points: 13
  remaining_points: 7
  percentage: 65%
```

### Daily Standup Template
```markdown
# Daily Standup: [Date]

## Team
[Team members and availability]

## Yesterday's Progress
- [ ] Task 1 - Status
- [ ] Task 2 - Status
- [ ] Task 3 - Status

## Today's Plan
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

## Blockers
- [Blocker] - [Action taken]

## Sprint Status
- Completed: [X] / [Y] points
- Percentage: [N]%
- Target: [End date]
```

### Retrospective Template
```markdown
# Retrospective: Sprint [N]

## What Went Well
- [Positive 1]
- [Positive 2]

## What Didn't Work
- [Negative 1]
- [Negative 2]

## Action Items
1. [Action 1] - [Owner] - [Due date]
2. [Action 2] - [Owner] - [Due date]

## Velocity Analysis
- Planned: [X] points
- Actual: [Y] points
- Accuracy: [N]%
- Trend: [Increasing/Decreasing/Stable]

## Process Changes
[Changes to adopt for next sprint]
```

## Sprint Best Practices

### Planning
- Capacity planning: Don't overcommit (aim for 80-90% velocity accuracy)
- Story dependencies: Identify and sequence them upfront
- Sprint goal: Have a clear, measurable goal
- Definition of Done: Agree on DoD upfront (code, tests, review, docs)

### Daily Standups
- Keep it brief: 15 minutes max
- Focus on blockers: Escalate immediately if blocking
- Update status: Mark completed stories in sprint-status.yaml
- Track velocity: Update completed points daily

### Retrospectives
- Blameless culture: Focus on process, not people
- Action items: Assign owners and due dates
- Follow up: Review previous action items first
- Experiment: Try one process change per sprint

## Integration

- Updates Kanban after sprint planning and story creation
- Stores sprint status in `_bmad-output/sprint-status.yaml`
- Stores retrospectives in `memory/YYYY-MM-DD-bmad.md`
- Auto-suggests `/bmad-daily-standup` each morning (cron)
- Auto-suggests `/bmad-retrospective` at sprint end
- All tasks use `zai/glm-4.7` (GLM 4.7B) for consistency
