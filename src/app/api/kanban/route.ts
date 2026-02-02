import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const KANBAN_PATH = join(process.cwd(), '../../kanban.md');

export async function GET() {
  try {
    const md = await readFile(KANBAN_PATH, 'utf-8');
    
    // Simple parsing
    const tasks: Array<{ id: string; text: string; column: 'backlog' | 'inprogress' | 'done'; createdAt: number }> = [];
    const now = Date.now();
    
    const sections = {
      backlog: [] as string[],
      inprogress: [] as string[],
      done: [] as string[]
    };
    
    let currentSection: 'backlog' | 'inprogress' | 'done' | null = null;
    const lines = md.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('## Backlog')) {
        currentSection = 'backlog';
      } else if (trimmed.startsWith('## In Progress')) {
        currentSection = 'inprogress';
      } else if (trimmed.startsWith('## Done')) {
        currentSection = 'done';
      } else if (currentSection && trimmed.startsWith('- [x]')) {
        const text = trimmed.replace('- [x]', '').trim();
        if (text && currentSection === 'done') {
          sections.done.push(text);
        }
      } else if (currentSection && trimmed.startsWith('- [ ]')) {
        const text = trimmed.replace('- [ ]', '').trim();
        if (text) {
          if (currentSection === 'backlog') {
            sections.backlog.push(text);
          } else if (currentSection === 'inprogress') {
            sections.inprogress.push(text);
          }
        }
      }
    }
    
    // Convert to task objects
    sections.backlog.forEach((text, idx) => {
      tasks.push({ id: `backlog-${now}-${idx}`, text, column: 'backlog', createdAt: now });
    });
    sections.inprogress.forEach((text, idx) => {
      tasks.push({ id: `inprogress-${now}-${idx}`, text, column: 'inprogress', createdAt: now });
    });
    sections.done.forEach((text, idx) => {
      tasks.push({ id: `done-${now}-${idx}`, text, column: 'done', createdAt: now });
    });
    
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error reading kanban.md:', error);
    return NextResponse.json({ tasks: [] }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tasks } = await request.json();
    
    // Convert tasks back to markdown
    const sections = {
      backlog: tasks.filter((t: any) => t.column === 'backlog').map((t: any) => t.text),
      inprogress: tasks.filter((t: any) => t.column === 'inprogress').map((t: any) => t.text),
      done: tasks.filter((t: any) => t.column === 'done').map((t: any) => t.text)
    };
    
    const md = `# Kanban Board for Ribe (@knosso79)

Updated: ${new Date().toISOString()}

## Backlog
${sections.backlog.map((t: string) => `- [ ] ${t}`).join('\n')}

## In Progress
${sections.inprogress.map((t: string) => `- [ ] ${t}`).join('\n')}

## Done
${sections.done.map((t: string) => `- [x] ${t}`).join('\n')}

## Notes
- Ask me to "add [task]" to backlog, "move [task] to inprogress/done", or "show kanban" for summary.
- I'll update kanban.md in workspace.
`;
    
    await writeFile(KANBAN_PATH, md, 'utf-8');
    
    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    console.error('Error writing kanban.md:', error);
    return NextResponse.json({ error: 'Failed to save tasks' }, { status: 500 });
  }
}
