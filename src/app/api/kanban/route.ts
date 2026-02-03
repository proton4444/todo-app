import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const KANBAN_PATH = join(process.cwd(), 'kanban.md');

// Define proper task types
type Task = {
  id: string;
  text: string;
  phase: string;
  status: 'backlog' | 'inprogress' | 'done';
  priority: 'high' | 'medium' | 'low';
  column: 'backlog' | 'inprogress' | 'done';
  createdAt: number;
};

// Parse kanban.md file to extract tasks
async function parseKanbanFile(): Promise<Task[]> {
  try {
    const md = await readFile(KANBAN_PATH, 'utf-8');
    const lines = md.split('\n');
    const tasks: Task[] = [];
    
    let currentPhase = '';
    let taskIdCounter = Date.now();

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Check for phase headers
      if (trimmed.startsWith('### Phase') || trimmed.startsWith('## ')) {
        const match = trimmed.match(/Phase (\d+):/);
        if (match && match[1]) {
          currentPhase = `phase${match[1].trim()}`;
        }
        continue;
      }
      
      // Check for task items
      if (trimmed.startsWith('- [')) {
        const match = trimmed.match(/\[(.*?)\]/);
        if (match) {
          const text = match[1];
          const id = `t${taskIdCounter++}`;
          const status = trimmed.includes('x]') ? 'done' : 'backlog';
          
          tasks.push({
            id,
            text,
            phase: currentPhase || 'Phase 1',
            status,
            priority: 'medium',
            column: status,
            createdAt: Date.now()
          });
        }
      }
    }
    
    return tasks;
  } catch (error) {
    console.error('Error parsing kanban.md:', error);
    return [];
  }
}

// GET endpoint - Retrieve all tasks
export async function GET(req: NextRequest) {
  const tasks = await parseKanbanFile();
  return NextResponse.json({ tasks });
}

// POST endpoint - Save all tasks
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tasks, task } = body;
    
    if (task) {
      // Add a single task
      const currentTasks = await parseKanbanFile();
      const newTasks = [...currentTasks, task];
      await saveKanbanFile(newTasks);
      return NextResponse.json({ success: true, tasks: newTasks });
    } else if (tasks) {
      // Save all tasks
      await saveKanbanFile(tasks);
      return NextResponse.json({ success: true, tasks });
    }
    
    return NextResponse.json({ success: false, error: 'Invalid request' });
  } catch (error) {
    console.error('Error saving tasks:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

// Helper function to save tasks to kanban.md
async function saveKanbanFile(tasks: Task[]): Promise<void> {
  try {
    const md = await readFile(KANBAN_PATH, 'utf-8');
    const lines = md.split('\n');
    const newLines: string[] = [];
    
    // Keep header sections
    for (const line of lines) {
      if (line.startsWith('#') || line.startsWith('##') || line.startsWith('---')) {
        newLines.push(line);
      }
    }
    
    // Add Backlog section
    const backlogTasks = tasks.filter(t => t.column === 'backlog');
    if (backlogTasks.length > 0) {
      newLines.push('## Backlog');
      backlogTasks.forEach(task => {
        const checkbox = task.status === 'done' ? 'x' : ' ';
        newLines.push(`- [${checkbox}] ${task.id}: ${task.text} ${task.status !== 'done' ? `(${task.phase})` : `✅ ${task.phase}`}`);
      });
    }
    
    // Add In Progress section
    const inProgressTasks = tasks.filter(t => t.column === 'inprogress');
    if (inProgressTasks.length > 0) {
      newLines.push('## In Progress');
      inProgressTasks.forEach(task => {
        newLines.push(`- [ ] ${task.id}: ${task.text} (${task.phase})`);
      });
    }
    
    // Add Done section
    const doneTasks = tasks.filter(t => t.column === 'done');
    if (doneTasks.length > 0) {
      newLines.push('## Done');
      doneTasks.forEach(task => {
        newLines.push(`- [x] ${task.id}: ${task.text} (${task.phase})`);
      });
    }
    
    // Keep existing footer sections
    let inFooter = false;
    for (const line of lines) {
      if (line.startsWith('---')) {
        newLines.push(line);
        inFooter = true;
      } else if (!inFooter) {
        newLines.push(line);
      }
    }
    
    await writeFile(KANBAN_PATH, newLines.join('\n'), 'utf-8');
  } catch (error) {
    console.error('Error saving kanban.md:', error);
    throw error;
  }
}
