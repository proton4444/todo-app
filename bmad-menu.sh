#!/bin/bash
# BMad Menu - Quick-access menu for BMad agents and workflows

# Main menu function
bmad_menu() {
  echo "🚀 BMad Method Menu

Choose an action:

- [📋 Planning](/bmad-parallel-planning) - Parallel: PM + Architect + UX
- [📋 Full Planning](/bmad-full-planning) - Sequential workflow
- [📋 Quick Spec](/bmad-quick-spec) - Fast tech-spec

- [👥 Agents](/bmad-agents-menu) - Direct agent access

- [🔄 Implement](/bmad-implement) - Dev-story + code-review
- [📊 Sprint Plan](/bmad-sprint-planning) - Organize sprint
- [📊 Daily Standup](/bmad-daily-standup) - Sprint status

- [❓ Help](/bmad-help) - Guided next steps
- [📋 Kanban](show kanban) - View tasks

Type any command or use /bmad-agents-menu for agent list"
}

# Agents menu
bmad_agents_menu() {
  echo "👥 BMad Agents

Select agent:

- [📦 PM - Product Manager](/bmad-agent-pm) - PRD, epics, backlog
- [🏗️ Architect](/bmad-agent-architect) - Tech design, API design
- [💻 Dev](/bmad-agent-dev) - dev-story, code-review
- [🎨 UX](/bmad-agent-ux) - Flows, wireframes
- [📋 SM - Scrum Master](/bmad-agent-sm) - Sprint planning, retros

- [⬅️ Back to Menu](/bmad-menu)"
}

# Handle command
case "$1" in
  menu)
    bmad_menu
    ;;
  agents-menu)
    bmad_agents_menu
    ;;
  *)
    echo "Usage: ./bmad-menu.sh [menu|agents-menu]"
    ;;
esac
