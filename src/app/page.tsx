'use client';

import { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { GripVertical, X, Plus, Play, Clock, BarChart3, Zap, FolderOpen, MoreVertical } from 'lucide-react';

type Task = {
  id: string;
  text: string;
  column: 'backlog' | 'inprogress' | 'done';
  createdAt: number;
};

type Column = 'backlog' | 'inprogress' | 'done';

const COLUMN_TITLES: Record<Column, string> = {
  backlog: 'Backlog',
  inprogress: 'In Progress',
  done: 'Done'
};

const COLUMN_COLORS: Record<Column, string> = {
  backlog: 'from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/20',
  inprogress: 'from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20',
  done: 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20'
};

const COLUMN_BORDER_COLORS: Record<Column, string> = {
  backlog: 'border-orange-200 dark:border-orange-800',
  inprogress: 'border-blue-200 dark:border-blue-800',
  done: 'border-green-200 dark:border-green-800'
};

const COLUMN_ACCENTS: Record<Column, string> = {
  backlog: 'text-orange-600 dark:text-orange-400',
  inprogress: 'text-blue-600 dark:text-blue-400',
  done: 'text-green-600 dark:text-green-400'
};

// Task Card Component
function TaskCard({ task, onDelete }: { task: Task; onDelete: (id: string) => void }) {
  const [{ isDragging }, drag, preview] = useDrag({
    type: 'TASK',
    item: { id: task.id, text: task.text, column: task.column },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  useEffect(() => {
    preview(document.createElement('div'), drag);
  }, [drag, preview]);

  return (
    <div
      ref={drag as any}
      className={`
        bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 cursor-move
        transition-all duration-200 ease-out
        hover:shadow-md hover:scale-[1.02]
        ${isDragging ? 'opacity-50 scale-95' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 flex-1">
          <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
            {task.text}
          </p>
        </div>
        <button
          onClick={() => onDelete(task.id)}
          className="text-gray-400 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-colors flex-shrink-0 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="text-xs text-gray-400 dark:text-gray-600 mt-2">
        {new Date(task.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}

// Column Component
function KanbanColumn({ 
  column, 
  tasks, 
  onAddTask, 
  onMoveTask,
  onDeleteTask
}: { 
  column: Column; 
  tasks: Task[]; 
  onAddTask: (column: Column, text: string) => void;
  onMoveTask: (taskId: string, from: Column, to: Column) => void;
  onDeleteTask: (id: string) => void;
}) {
  const [{ isOver }, drop] = useDrop({
    accept: 'TASK',
    drop: (item: { id: string; column: Column }, monitor: any) => {
      if (item.column !== column) {
        onMoveTask(item.id, item.column, column);
      }
    },
    collect: (monitor: any) => ({
      isOver: monitor.isOver()
    })
  });

  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAddTask(column, inputValue.trim());
      setInputValue('');
      setShowInput(false);
    }
  };

  return (
    <div
      ref={drop as any}
      className={`
        flex-1 min-w-[280px] bg-gradient-to-br ${COLUMN_COLORS[column]}
        rounded-2xl border-2 ${COLUMN_BORDER_COLORS[column]}
        p-4 flex flex-col
        transition-all duration-300
        ${isOver ? 'ring-2 ring-blue-500 scale-[1.02]' : ''}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold ${COLUMN_ACCENTS[column]} flex items-center gap-2`}>
          {COLUMN_TITLES[column]}
          <span className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-2.5 py-1 rounded-full font-semibold">
            {tasks.length}
          </span>
        </h3>
        <button
          onClick={() => setShowInput(!showInput)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${showInput ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        >
          {showInput ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {showInput && (
        <div className="mb-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            placeholder={`Add to ${COLUMN_TITLES[column]}...`}
            className="w-full px-3 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-colors"
            autoFocus
          />
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto min-h-[200px]">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDelete={onDeleteTask}
          />
        ))}
      </div>
    </div>
  );
}

// Main Mission Control Component
export default function MissionControl() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Load tasks from kanban.md on mount
  useEffect(() => {
    loadTasks();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(loadTasks, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadTasks = async () => {
    try {
      const response = await fetch('/api/kanban');
      const data = await response.json();
      if (data.tasks) {
        setTasks(data.tasks);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const addTask = (column: Column, text: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      text,
      column,
      createdAt: Date.now()
    };
    setTasks([...tasks, newTask]);
    saveTasks([...tasks, newTask]);
  };

  const deleteTask = (id: string) => {
    const newTasks = tasks.filter(t => t.id !== id);
    setTasks(newTasks);
    saveTasks(newTasks);
  };

  const moveTask = (taskId: string, from: Column, to: Column) => {
    const newTasks = tasks.map(task =>
      task.id === taskId ? { ...task, column: to } : task
    );
    setTasks(newTasks);
    saveTasks(newTasks);
  };

  const saveTasks = async (tasksToSave: Task[]) => {
    try {
      await fetch('/api/kanban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: tasksToSave })
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  };

  const stats = {
    done: tasks.filter(t => t.column === 'done').length,
    inProgress: tasks.filter(t => t.column === 'inprogress').length,
    backlog: tasks.filter(t => t.column === 'backlog').length,
    total: tasks.length
  };

  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Header */}
        <header className="bg-white/5 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">🎮</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mission Control</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Real-time Task Dashboard</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* Live Status */}
                <div className="flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">Live</span>
                </div>

                {/* Last Updated */}
                {lastUpdated && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{lastUpdated.toLocaleTimeString()}</span>
                  </div>
                )}

                {/* Quick Actions Toggle */}
                <button
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className="bg-white/10 hover:bg-white/20 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Bar */}
        <div className="bg-white/5 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* Completion Rate */}
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20 dark:border-green-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">Progress</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{completionRate}%</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stats.done} of {stats.total} done</div>
              </div>

              {/* In Progress */}
              <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl p-4 border border-blue-500/20 dark:border-blue-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <Play className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">In Progress</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inProgress}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active tasks</div>
              </div>

              {/* Backlog */}
              <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-4 border border-orange-500/20 dark:border-orange-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <FolderOpen className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">Backlog</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.backlog}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Queued tasks</div>
              </div>

              {/* Quick Add to Backlog */}
              <div className="md:col-span-2 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20 dark:border-purple-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Quick Add</span>
                </div>
                <input
                  type="text"
                  placeholder="Add task to backlog..."
                  className="w-full px-3 py-2 bg-white/10 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-white dark:text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                      addTask('backlog', (e.target as HTMLInputElement).value.trim());
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Menu */}
        {showQuickActions && (
          <div className="fixed top-20 right-6 z-50 bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 p-2 min-w-[200px]">
            <button
              onClick={() => { loadTasks(); setShowQuickActions(false); }}
              className="w-full px-4 py-3 text-left text-white hover:bg-gray-700/20 rounded-lg transition-colors flex items-center gap-2 mb-2"
            >
              <Zap className="w-4 h-4" />
              <span>Refresh Tasks</span>
            </button>
            <button
              onClick={() => { setShowQuickActions(false); }}
              className="w-full px-4 py-3 text-left text-white hover:bg-gray-700/20 rounded-lg transition-colors flex items-center gap-2 mb-2"
            >
              <FolderOpen className="w-4 h-4" />
              <span>View All Tasks</span>
            </button>
            <button
              onClick={() => { 
                setShowQuickActions(false); 
                const newTasks = tasks.filter(t => t.column !== 'done'); 
                setTasks(newTasks); 
                saveTasks(newTasks); 
              }}
              className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/20 rounded-lg transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              <span>Clear Done</span>
            </button>
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Kanban Board */}
          <div className="flex gap-6 overflow-x-auto pb-4">
            {(Object.keys(COLUMN_TITLES) as Column[]).map((column) => (
              <KanbanColumn
                key={column}
                column={column}
                tasks={tasks.filter(t => t.column === column)}
                onAddTask={addTask}
                onMoveTask={moveTask}
                onDeleteTask={deleteTask}
              />
            ))}
          </div>

          {/* Batch Add Section */}
          <div className="mt-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl border border-indigo-500/20 dark:border-indigo-500/30 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Batch Add Tasks
            </h3>
            <textarea
              placeholder="Add multiple tasks (one per line) to backlog..."
              className="w-full h-32 px-4 py-3 bg-white/10 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-white dark:text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  const lines = (e.target as HTMLTextAreaElement).value.split('\n').map(l => l.trim()).filter(l => l);
                  lines.forEach(line => addTask('backlog', line));
                  (e.target as HTMLTextAreaElement).value = '';
                }
              }}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Press Ctrl+Enter to add all lines</p>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-white/10 bg-white/5 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <span>Powered by Clawd 🦾</span>
                <span className="text-gray-400 dark:text-gray-600">|</span>
                <span>BMad Method v2.0</span>
              </div>
              <div className="flex items-center gap-2">
                <a href="/api/kanban" className="hover:text-gray-900 dark:hover:text-white transition-colors">API</a>
                <span className="text-gray-400 dark:text-gray-600">|</span>
                <span>Updated {lastUpdated?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </DndProvider>
  );
}
