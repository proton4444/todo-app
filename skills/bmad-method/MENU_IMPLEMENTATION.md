# BMad Menu - Telegram Implementation Guide

## Quick Start

The menu is triggered with `/bmad-menu` and shows inline buttons for quick access to all BMad agents and workflows.

## Menu Structure

### Level 1: Main Menu
```
🚀 BMad Method Menu

[📋 Planning] [👥 Agents]
[🔄 Implement] [📊 Sprint]
[❓ Help] [📋 Kanban]
```

### Level 2: Planning Sub-menu
```
📋 Planning Workflows

[Parallel Planning] - PM + Architect + UX (simultaneous)
[Full Planning] - Sequential workflow
[Quick Spec] - Fast tech-spec

[⬅️ Back]
```

### Level 2: Agents Sub-menu
```
👥 BMad Agents

[📦 PM - Product Manager]
[🏗️ Architect]
[💻 Developer]
[🎨 UX Designer]
[📋 Scrum Master]

[⬅️ Back]
```

## Button Callbacks

Each button maps to a command:

| Button | Command | Description |
|--------|---------|-------------|
| [📋 Planning] | /bmad-planning-menu | Show planning workflows |
| [👥 Agents] | /bmad-agents-menu | Show agent list |
| [Parallel Planning] | /bmad-parallel-planning [feature] | Spawns 3 agents |
| [Full Planning] | /bmad-full-planning | Sequential workflow |
| [Quick Spec] | /bmad-quick-spec | Fast tech-spec |
| [📦 PM] | /bmad-agent-pm | Load PM agent |
| [🏗️ Architect] | /bmad-agent-architect | Load Architect agent |
| [💻 Dev] | /bmad-agent-dev | Load Dev agent |
| [🎨 UX] | /bmad-agent-ux | Load UX agent |
| [📋 SM] | /bmad-agent-sm | Load Scrum Master agent |
| [🔄 Implement] | /bmad-implement | Dev-story + code-review |
| [📊 Sprint Plan] | /bmad-sprint-planning | Organize sprint |
| [Daily Standup] | /bmad-daily-standup | Sprint status |
| [❓ Help] | /bmad-help | Guided next steps |
| [📋 Kanban] | show kanban | Display tasks |

## Usage Examples

### Example 1: Parallel Planning for New Feature
```
User: /bmad-menu
→ [📋 Planning]

User: [Parallel Planning]
→ Prompt: "What feature should we plan?"

User: Build a T-shirt business web app
→ Spawns 3 parallel agents (PM, Architect, UX)
→ Collects outputs in 30-60s
→ Returns merged plan
→ Updates Kanban with tasks
```

### Example 2: Direct Agent Access
```
User: /bmad-menu
→ [👥 Agents]

User: [🏗️ Architect]
→ Loads Architect agent skill
→ Prompt: "What should I design?"

User: Design API architecture for user authentication
→ Creates architecture.md with API endpoints, auth flow, security
→ Updates Kanban: "Review architecture"
```

### Example 3: Sprint Management
```
User: /bmad-menu
→ [📊 Sprint]

User: [Sprint Plan]
→ Loads Scrum Master agent
→ Prompts for sprint details (duration, team, backlog items)
→ Creates sprint-status.yaml
→ Updates Kanban with sprint tasks
```

## Implementation Notes

### Inline Button Format

```javascript
// Example menu response using message tool
{
  "action": "send",
  "message": "🚀 BMad Method Menu\n\nChoose an action:",
  "buttons": [[
    { "text": "📋 Planning", "callback_data": "/bmad-planning-menu" },
    { "text": "👥 Agents", "callback_data": "/bmad-agents-menu" }
  ], [
    { "text": "🔄 Implement", "callback_data": "/bmad-implement" },
    { "text": "📊 Sprint", "callback_data": "/bmad-sprint-menu" }
  ], [
    { "text": "❓ Help", "callback_data": "/bmad-help" },
    { "text": "📋 Kanban", "callback_data": "show kanban" }
  ]]
}
```

### State Navigation

```
Main Menu
  ├─ Planning Sub-menu
  │   ├─ Parallel Planning → /bmad-parallel-planning
  │   ├─ Full Planning → /bmad-full-planning
  │   └─ Quick Spec → /bmad-quick-spec
  │
  ├─ Agents Sub-menu
  │   ├─ PM → /bmad-agent-pm
  │   ├─ Architect → /bmad-agent-architect
  │   ├─ Dev → /bmad-agent-dev
  │   ├─ UX → /bmad-agent-ux
  │   └─ SM → /bmad-agent-sm
  │
  └─ Direct Actions
      ├─ Implement → /bmad-implement
      ├─ Sprint Plan → /bmad-sprint-planning
      ├─ Daily Standup → /bmad-daily-standup
      ├─ Help → /bmad-help
      └─ Kanban → show kanban
```

## Commands to Add to OpenClaw

Add these new commands to support the menu:

```
/bmad-menu              # Show main menu (inline buttons)
/bmad-planning-menu      # Show planning workflows (sub-menu)
/bmad-agents-menu       # Show agents (sub-menu)
/bmad-sprint-menu       # Show sprint management (sub-menu)
/bmad-status            # Show current sprint and agent outputs
```

## Benefits

1. **Visual Navigation** - Tap buttons instead of typing commands
2. **Grouped Workflows** - Related commands in sub-menus
3. **Fast Access** - Get to any agent in 2-3 taps
4. **Discoverable** - See all available options without memorizing
5. **Mobile-Friendly** - Inline buttons work perfectly on Telegram mobile
