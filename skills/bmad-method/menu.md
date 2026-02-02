# BMad Menu System

Quick-access menu for all BMad agents and workflows via Telegram inline buttons.

## Menu Commands

### Main Menu
```
/bmad-menu           # Show main BMad menu (inline buttons)
```

### Menu Structure

```
┌─────────────────────────────────┐
│     🚀 BMad Method Menu      │
├─────────────────────────────────┤
│ 📋 Planning Workflows        │
│ [Parallel] [Full] [Quick]     │
│                             │
│ 👥 Agents                    │
│ [PM] [Arch] [Dev] [UX] [SM] │
│                             │
│ 🔄 Implementation             │
│ [Implement] [Code Review]     │
│                             │
│ 📊 Sprint & Tasks            │
│ [Sprint Plan] [Daily Standup] │
│                             │
│ 🎯 Actions                  │
│ [Help] [Kanban] [Status]    │
└─────────────────────────────────┘
```

## Button Actions

### Planning Workflows
- **[Parallel]** → `/bmad-parallel-planning` - Spawns 3 agents simultaneously (PM + Architect + UX)
- **[Full]** → `/bmad-full-planning` - Sequential: PM → Architect → UX → Sprint Planning
- **[Quick]** → `/bmad-quick-spec` - Fast tech-spec for small features

### Agents (Direct Access)
- **[PM]** → `/bmad-agent-pm` - Product Manager (PRD, epics, backlog)
- **[Arch]** → `/bmad-agent-architect` - Architect (technical design, API design)
- **[Dev]** → `/bmad-agent-dev` - Developer (dev-story, code-review)
- **[UX]** → `/bmad-agent-ux` - UX Designer (flows, wireframes)
- **[SM]** → `/bmad-agent-sm` - Scrum Master (sprint planning, retrospectives)

### Implementation
- **[Implement]** → `/bmad-implement` - Dev-story + code-review for backlog items
- **[Code Review]** → `/bmad-code-review` - Validate code quality

### Sprint & Tasks
- **[Sprint Plan]** → `/bmad-sprint-planning` - Organize sprint with prioritized stories
- **[Daily Standup]** → `/bmad-daily-standup` - 9 AM UTC cron, sprint status update

### Actions
- **[Help]** → `/bmad-help` - Guided next steps based on current state
- **[Kanban]** → `show kanban` - Display current kanban board
- **[Status]** → `/bmad-status` - Show active sprint and agent outputs

## Implementation

### Example Response

When user sends `/bmad-menu`:

```
🚀 BMad Method Menu

Choose an action:

[📋 Planning] [👥 Agents]
[🔄 Implement] [📊 Sprint]
[🎯 Actions] [❓ Help]
```

Sub-menu on [👥 Agents]:

```
👥 BMad Agents

Select agent to load:

[📦 PM - Product Manager]
[🏗️ Architect - Tech Design]
[💻 Dev - Development]
[🎨 UX - User Experience]
[📋 SM - Scrum Master]
[⬅️ Back to Main]
```

## Usage Examples

```
User: /bmad-menu
→ Shows inline buttons

User: [👥 Agents]
→ Shows agent buttons

User: [💻 Dev - Development]
→ Loads Dev Agent skill
→ Prompt: "What story should I implement?"

User: Implement login page with NextAuth
→ Dev agent creates story file + code
```

## Benefits

- **Fast Access** - No need to remember command names
- **Visual** - Inline buttons easy to navigate
- **Contextual** - Sub-menus group related commands
- **On-the-fly** - Trigger any BMad workflow in 2 taps
