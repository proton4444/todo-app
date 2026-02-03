'use client';

import { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { GripVertical, X, Plus, Play, Clock, BarChart3, Zap, Settings, FolderOpen, MoreVertical, TrendingUp, Activity, Shield, Database, Server, Key, ArrowUpRight, RefreshCw, AlertCircle, CheckCircle, Circle, Edit, Trash, Download, ExternalLink } from 'lucide-react';

type Task = {
  id: string;
  text: string;
  phase: string;
  status: 'backlog' | 'inprogress' | 'done';
  priority: 'high' | 'medium' | 'low';
  column: 'backlog' | 'inprogress' | 'done';
  createdAt: number;
};

type Column = 'backlog' | 'inprogress' | 'done';
const COLUMN_TITLES: Record<Column, string> = {  backlog: "Backlog",  inprogress: "In Progress",  done: "Done",};

type Phase = {
  id: string;
  name: string;
  duration: string;
  tasks: Task[];
  color: string;
  icon: any;
};

export default function MissionControl() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Column[]>(['backlog', 'inprogress', 'done']);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddText, setQuickAddText] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string, visible: boolean }>({ type: 'success', message: '', visible: false });

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message, visible: true });
    setTimeout(() => setNotification(prev => ({ ...prev, visible: false })), 3000);
  };
  // Load tasks from API on mount
  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadTasks = async () => {
    try {
      const response = await fetch('/api/kanban');
      const data = await response.json();
      if (data.tasks) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const addTask = async (text: string, phase: string, priority: 'high' | 'medium' | 'low') => {
    const newTask: Task = {
      id: Date.now().toString(),
      text,
      phase,
      status: 'backlog',
      priority,
      column: 'backlog',
      createdAt: Date.now()
    };
    await saveTask(newTask);
    showNotification('success', 'Task added successfully!');
  };

  const saveTask = async (task: Task) => {
    try {
      await fetch('/api/kanban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task })
      });
      loadTasks(); // Reload tasks after save
    } catch (error) {
      showNotification('error', 'Failed to save task');
    }
  };

  const moveTask = async (taskId: string, toColumn: Column) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const updatedTasks = tasks.map(t =>
        t.id === taskId ? { ...t, status: (toColumn === 'done' ? 'done' : 'inprogress') as 'backlog' | 'inprogress' | 'done', column: toColumn, phase: toColumn } : t
      );
      await saveTasks(updatedTasks);
    }
  };

  const saveTasks = async (tasksToSave: Task[]) => {
    try {
      await fetch('/api/kanban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: tasksToSave })
      });
      loadTasks(); // Reload tasks after save
    } catch (error) {
      showNotification('error', 'Failed to save tasks');
    }
  };

  const phases: Phase[] = [
    {
      id: 'phase1',
      name: 'Phase 1: Project Initialization',
      duration: '1 hr',
      color: 'from-orange-500 to-red-500',
      icon: <Zap className="w-5 h-5" />,
      tasks: [
        { id: 't1', text: 'Create Next.js project structure', status: 'backlog', priority: 'high', phase: 'Phase 1: Project Initialization', column: 'backlog', createdAt: Date.now() },
        { id: 't2', text: 'Initialize package.json with dependencies', status: 'backlog', priority: 'high', phase: 'Phase 1: Project Initialization', column: 'backlog', createdAt: Date.now() },
        { id: 't3', text: 'Create TypeScript configuration (tsconfig.json, next.config.ts)', status: 'backlog', priority: 'high', phase: 'Phase 1: Project Initialization', column: 'backlog', createdAt: Date.now() },
        { id: 't4', text: 'Create Tailwind CSS setup (tailwind.config.ts, globals.css)', status: 'backlog', priority: 'medium', phase: 'Phase 1: Project Initialization', column: 'backlog', createdAt: Date.now() },
        { id: 't5', text: 'Create basic app layout (header, main, footer)', status: 'backlog', priority: 'medium', phase: 'Phase 1: Project Initialization', column: 'backlog', createdAt: Date.now() },
        { id: 't6', text: 'Set up environment variables (.env.local for API keys)', status: 'backlog', priority: 'high', phase: 'Phase 1: Project Initialization', column: 'backlog', createdAt: Date.now() },
        { id: 't7', text: 'Create placeholder components (TradingDashboard, OrderEntry, PositionsTable)', status: 'backlog', priority: 'medium', phase: 'Phase 1: Project Initialization', column: 'backlog', createdAt: Date.now() },
        { id: 't8', text: 'Create API route structure (/api/trading, /api/market, /api/positions)', status: 'backlog', priority: 'medium', phase: 'Phase 1: Project Initialization', column: 'backlog', createdAt: Date.now() },
        { id: 't9', text: 'Initialize Git repository with proper .gitignore', status: 'backlog', priority: 'medium', phase: 'Phase 1: Project Initialization', column: 'backlog', createdAt: Date.now() },
        { id: 't10', text: 'Set up Docker configuration for testing', status: 'backlog', priority: 'low', phase: 'Phase 1: Project Initialization', column: 'backlog', createdAt: Date.now() }
      ]
    },
    {
      id: 'phase2',
      name: 'Phase 2: Core Trading Dashboard',
      duration: '3 hr',
      color: 'from-purple-500 to-pink-500',
      icon: <Activity className="w-5 h-5" />,
      tasks: [
        { id: 't11', text: 'Create main dashboard with market data', status: 'backlog', priority: 'high', phase: 'Phase 2: Core Trading Dashboard', column: 'backlog', createdAt: Date.now() },
        { id: 't12', text: 'Implement order entry form (symbol, side, amount)', status: 'backlog', priority: 'high', phase: 'Phase 2: Core Trading Dashboard', column: 'backlog', createdAt: Date.now() },
        { id: 't13', text: 'Create positions display table (symbol, side, size, PnL)', status: 'backlog', priority: 'high', phase: 'Phase 2: Core Trading Dashboard', column: 'backlog', createdAt: Date.now() },
        { id: 't14', text: 'Implement recent trades history', status: 'backlog', priority: 'high', phase: 'Phase 2: Core Trading Dashboard', column: 'backlog', createdAt: Date.now() },
        { id: 't15', text: 'Add quick order buttons (Buy BTC, Sell ETH)', status: 'backlog', priority: 'medium', phase: 'Phase 2: Core Trading Dashboard', column: 'backlog', createdAt: Date.now() },
        { id: 't16', text: 'Create portfolio summary card (total PnL, open positions)', status: 'backlog', priority: 'medium', phase: 'Phase 2: Core Trading Dashboard', column: 'backlog', createdAt: Date.now() },
        { id: 't17', text: 'Add refresh functionality (real-time updates)', status: 'backlog', priority: 'medium', phase: 'Phase 2: Core Trading Dashboard', column: 'backlog', createdAt: Date.now() },
        { id: 't18', text: 'Implement responsive design (mobile, tablet, desktop)', status: 'backlog', priority: 'high', phase: 'Phase 2: Core Trading Dashboard', column: 'backlog', createdAt: Date.now() },
        { id: 't19', text: 'Add dark mode support with gradient background', status: 'backlog', priority: 'medium', phase: 'Phase 2: Core Trading Dashboard', column: 'backlog', createdAt: Date.now() },
        { id: 't20', text: 'Create API endpoints in Mission Control for trading', status: 'backlog', priority: 'medium', phase: 'Phase 2: Core Trading Dashboard', column: 'backlog', createdAt: Date.now() },
      ]
    },
    {
      id: 'phase3',
      name: 'Phase 3: MCP Integration',
      duration: '2 hr',
      color: 'from-green-500 to-emerald-500',
      icon: <Database className="w-5 h-5" />,
      tasks: [
        { id: 't21', text: 'Integrate vkdnjznd/crypto-trading-mcp (primary MCP server)', status: 'backlog', priority: 'high', phase: 'Phase 3: MCP Integration', column: 'backlog', createdAt: Date.now() },
        { id: 't22', text: 'Create MCP client connection handler', status: 'backlog', priority: 'high', phase: 'Phase 3: MCP Integration', column: 'backlog', createdAt: Date.now() },
        { id: 't23', text: 'Implement tool discovery (list exchanges, get prices)', status: 'backlog', priority: 'high', phase: 'Phase 3: MCP Integration', column: 'backlog', createdAt: Date.now() },
        { id: 't24', text: 'Create order placement through MCP', status: 'backlog', priority: 'high', phase: 'Phase 3: MCP Integration', column: 'backlog', createdAt: Date.now() },
        { id: 't25', text: 'Add real-time market data streaming', status: 'backlog', priority: 'high', phase: 'Phase 3: MCP Integration', column: 'backlog', createdAt: Date.now() },
        { id: 't26', text: 'Implement WebSocket connection for live prices', status: 'backlog', priority: 'high', phase: 'Phase 3: MCP Integration', column: 'backlog', createdAt: Date.now() },
        { id: 't27', text: 'Handle MCP errors and reconnection logic', status: 'backlog', priority: 'high', phase: 'Phase 3: MCP Integration', column: 'backlog', createdAt: Date.now() },
        { id: 't28', text: 'Test MCP authentication (API keys management)', status: 'backlog', priority: 'high', phase: 'Phase 3: MCP Integration', column: 'backlog', createdAt: Date.now() },
      ]
    },
    {
      id: 'phase4',
      name: 'Phase 4: Data Layer',
      duration: '1.5 hr',
      color: 'from-blue-500 to-indigo-500',
      icon: <FolderOpen className="w-5 h-5" />,
      tasks: [
        { id: 't31', text: 'Create database models (Trade, Position, MarketData)', status: 'backlog', priority: 'high', phase: 'Phase 4: Data Layer', column: 'backlog', createdAt: Date.now() },
        { id: 't32', text: 'Implement local storage fallback (localStorage for browser)', status: 'backlog', priority: 'medium', phase: 'Phase 4: Data Layer', column: 'backlog', createdAt: Date.now() },
        { id: 't33', text: 'Create data validation layer (price checks, amount validation)', status: 'backlog', priority: 'high', phase: 'Phase 4: Data Layer', column: 'backlog', createdAt: Date.now() },
        { id: 't34', text: 'Add data normalization (price scaling, timestamp handling)', status: 'backlog', priority: 'medium', phase: 'Phase 4: Data Layer', column: 'backlog', createdAt: Date.now() },
        { id: 't35', text: 'Create data export functionality (CSV download of trades)', status: 'backlog', priority: 'medium', phase: 'Phase 4: Data Layer', column: 'backlog', createdAt: Date.now() },
        { id: 't36', text: 'Implement caching layer (Redis/in-memory for performance)', status: 'backlog', priority: 'medium', phase: 'Phase 4: Data Layer', column: 'backlog', createdAt: Date.now() },
        { id: 't37', text: 'Create data persistence (save to localStorage on changes)', status: 'backlog', priority: 'high', phase: 'Phase 4: Data Layer', column: 'backlog', createdAt: Date.now() },
        { id: 't38', text: 'Implement backup system (database backups, config backups)', status: 'backlog', priority: 'low', phase: 'Phase 4: Data Layer', column: 'backlog', createdAt: Date.now() },
      ]
    },
    {
      id: 'phase5',
      name: 'Phase 5: Strategy Layer',
      duration: '2 hr',
      color: 'from-orange-500 to-amber-500',
      icon: <TrendingUp className="w-5 h-5" />,
      tasks: [
        { id: 't41', text: 'Integrate Alpha Arena model (Claude/GPT-4 style)', status: 'backlog', priority: 'high', phase: 'Phase 5: Strategy Layer', column: 'backlog', createdAt: Date.now() },
        { id: 't42', text: 'Implement multi-timeframe analysis (1m, 5m, 15m, 1h)', status: 'backlog', priority: 'high', phase: 'Phase 5: Strategy Layer', column: 'backlog', createdAt: Date.now() },
        { id: 't43', text: 'Create signal generation engine (confidence scoring 0-100%)', status: 'backlog', priority: 'high', phase: 'Phase 5: Strategy Layer', column: 'backlog', createdAt: Date.now() },
        { id: 't44', text: 'Implement backtesting validation framework (profitability metrics, Sharpe ratio, max drawdown)', status: 'backlog', priority: 'high', phase: 'Phase 5: Strategy Layer', column: 'backlog', createdAt: Date.now() },
        { id: 't45', text: 'Implement strategy performance tracking (win rate, profit factor, average PnL)', status: 'backlog', priority: 'medium', phase: 'Phase 5: Strategy Layer', column: 'backlog', createdAt: Date.now() },
      ]
    },
    {
      id: 'phase6',
      name: 'Phase 6: Risk Management',
      duration: '1.5 hr',
      color: 'from-red-500 to-pink-500',
      icon: <Shield className="w-5 h-5" />,
      tasks: [
        { id: 't51', text: 'Implement VaR calculator (Historical VaR simulation with 99% confidence)', status: 'backlog', priority: 'high', phase: 'Phase 6: Risk Management', column: 'backlog', createdAt: Date.now() },
        { id: 't52', text: 'Create position sizing engine (Kelly Criterion, Fixed Fractional)', status: 'backlog', priority: 'high', phase: 'Phase 6: Risk Management', column: 'backlog', createdAt: Date.now() },
        { id: 't53', text: 'Implement max drawdown monitoring (daily, weekly, monthly)', status: 'backlog', priority: 'high', phase: 'Phase 6: Risk Management', column: 'backlog', createdAt: Date.now() },
        { id: 't54', text: 'Create dynamic risk limits (adjust based on volatility, correlation)', status: 'backlog', priority: 'high', phase: 'Phase 6: Risk Management', column: 'backlog', createdAt: Date.now() },
        { id: 't55', text: 'Implement correlation matrix (asset correlation analysis)', status: 'backlog', priority: 'medium', phase: 'Phase 6: Risk Management', column: 'backlog', createdAt: Date.now() },
        { id: 't56', text: 'Create risk alerts (email, Telegram, Slack, Discord)', status: 'backlog', priority: 'high', phase: 'Phase 6: Risk Management', column: 'backlog', createdAt: Date.now() },
        { id: 't57', text: 'Implement kill-switch safety mechanism', status: 'backlog', priority: 'high', phase: 'Phase 6: Risk Management', column: 'backlog', createdAt: Date.now() },
        { id: 't58', text: 'Create risk dashboard (VaR, drawdown heatmap, correlation matrix)', status: 'backlog', priority: 'high', phase: 'Phase 6: Risk Management', column: 'backlog', createdAt: Date.now() },
        { id: 't59', text: 'Implement daily PnL tracking (daily profit/loss reports)', status: 'backlog', priority: 'medium', phase: 'Phase 6: Risk Management', column: 'backlog', createdAt: Date.now() },
      ]
    },
    {
      id: 'phase7',
      name: 'Phase 7: Testing & Validation',
      duration: '2 hr',
      color: 'from-purple-600 to-violet-600',
      icon: <CheckCircle className="w-5 h-5" />,
      tasks: [
        { id: 't61', text: 'Set up Playwright testing environment', status: 'backlog', priority: 'high', phase: 'Phase 7: Testing & Validation', column: 'backlog', createdAt: Date.now() },
        {  id: 't62', text: 'Create E2E test cases (happy path, error cases, edge cases)', status: 'backlog', priority: 'high', phase: 'Phase 7: Testing & Validation', column: 'backlog', createdAt: Date.now() },
        { id: 't63', text: 'Create performance tests (load times, render times)', status: 'backlog', priority: 'medium', phase: 'Phase 7: Testing & Validation', column: 'backlog', createdAt: Date.now() },
        { id: 't64', text: 'Perform load testing (simulated 100+ concurrent users)', status: 'backlog', priority: 'medium', phase: 'Phase 7: Testing & Validation', column: 'backlog', createdAt: Date.now() },
        { id: 't65', text: 'Create stress testing suite (high frequency trading, volatile markets)', status: 'backlog', priority: 'high', phase: 'Phase 7: Testing & Validation', column: 'backlog', createdAt: Date.now() },
        { id: 't66', text: 'Create monitoring dashboard (real-time performance metrics)', status: 'backlog', priority: 'high', phase: 'Phase 7: Testing & Validation', column: 'backlog', createdAt: Date.now() },
      ]
    },
    {
      id: 'phase8',
      name: 'Phase 8: Documentation & Handover',
      duration: '1 hr',
      color: 'from-slate-500 to-gray-500',
      icon: <Edit className="w-5 h-5" />,
      tasks: [
        { id: 't71', text: 'Write technical documentation for Mission Control trading features', status: 'backlog', priority: 'medium', phase: 'Phase 8: Documentation & Handover', column: 'backlog', createdAt: Date.now() },
        { id: 't72', text: 'Write user manual for Mission Control trading dashboard', status: 'backlog', priority: 'medium', phase: 'Phase 8: Documentation & Handover', column: 'backlog', createdAt: Date.now() },
        { id: 't73', text: 'Create API documentation (endpoints, request/response examples, authentication, rate limiting)', status: 'backlog', priority: 'medium', phase: 'Phase 8: Documentation & Handover', column: 'backlog', createdAt: Date.now() },
        { id: 't74', text: 'Write deployment guide (Vercel setup, environment variables, monitoring setup)', status: 'backlog', priority: 'high', phase: 'Phase 8: Documentation & Handover', column: 'backlog', createdAt: Date.now() },
        { id: 't75', text: 'Write maintenance guide (updates, backups, log rotation, database optimization)', status: 'backlog', priority: 'medium', phase: 'Phase 8: Documentation & Handover', column: 'backlog', createdAt: Date.now() },
        { id: 't76', text: 'Create handover documentation (code walkthrough, architecture overview)', status: 'backlog', priority: 'medium', phase: 'Phase 8: Documentation & Handover', column: 'backlog', createdAt: Date.now() },
      ]
    },
    {
      id: 'phase9',
      name: 'Phase 9: Deployment & Monitoring',
      duration: '1 hr',
      color: 'from-indigo-500 to-blue-500',
      icon: <RefreshCw className="w-5 h-5" />,
      tasks: [
        { id: 't81', text: 'Set up monitoring dashboard (trades, positions, PnL, risk metrics, server health)', status: 'backlog', priority: 'high', phase: 'Phase 9: Deployment & Monitoring', column: 'backlog', createdAt: Date.now() },
        { id: 't82', text: 'Implement alerting system (email, Telegram, Slack, Discord)', status: 'backlog', priority: 'high', phase: 'Phase 9: Deployment & Monitoring', column: 'backlog', createdAt: Date.now() },
        { id: 't83', text: 'Create health check API (system status, latency, error rates)', status: 'backlog', priority: 'high', phase: 'Phase 9: Deployment & Monitoring', column: 'backlog', createdAt: Date.now() },
        { id: 't84', text: 'Set up error tracking (Sentry for errors, Datadog for metrics)', status: 'backlog', priority: 'medium', phase: 'Phase 9: Deployment & Monitoring', column: 'backlog', createdAt: Date.now() },
        { id: 't85', text: 'Create logging pipeline (structured logs, log aggregation)', status: 'backlog', priority: 'medium', phase: 'Phase 9: Deployment & Monitoring', column: 'backlog', createdAt: Date.now() },
        { id: 't86', text: 'Create backup system (database backups, config backups)', status: 'backlog', priority: 'medium', phase: 'Phase 9: Deployment & Monitoring', column: 'backlog', createdAt: Date.now() },
        { id: 't87', text: 'Create deployment pipeline (CI/CD, automated tests)', status: 'backlog', priority: 'high', phase: 'Phase 9: Deployment & Monitoring', column: 'backlog', createdAt: Date.now() },
        { id: 't88', text: 'Write deployment documentation (pre-deployment checks)', status: 'backlog', priority: 'medium', phase: 'Phase 9: Deployment & Monitoring', column: 'backlog', createdAt: Date.now() },
        { id: 't89', text: 'Create rollback plan (emergency disable features)', status: 'backlog', priority: 'high', phase: 'Phase 9: Deployment & Monitoring', column: 'backlog', createdAt: Date.now() },
        { id: 't90', text: 'Perform production deployment to Vercel', status: 'backlog', priority: 'high', phase: 'Phase 9: Deployment & Monitoring', column: 'backlog', createdAt: Date.now() },
      ]
    }
  ];

  const getColumnTasks = (column: Column) => {
    return tasks.filter(t => t.column === column);
  };

  const getTasksByPhase = (phaseId: string) => {
    const phase = phases.find(p => p.id === phaseId);
    return phase ? phase.tasks : [];
  };

  const getTasksByPhaseAndColumn = (phaseId: string, column: Column) => {
    const phase = phases.find(p => p.id === phaseId);
    return phase ? phase.tasks.filter(t => t.column === column) : [];
  };

  const getPhaseStats = (phaseId: string) => {
    const phaseTasks = getTasksByPhase(phaseId);
    const total = phaseTasks.length;
    const backlog = phaseTasks.filter(t => t.status === 'backlog').length;
    const inprogress = phaseTasks.filter(t => t.status === 'inprogress').length;
    const done = phaseTasks.filter(t => t.status === 'done').length;
    const percentage = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, backlog, inprogress, done, percentage };
  };

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
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mission Control - Professional Trading Agent</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">MCP-Integrated • 10 Phases • 66 Tasks</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* MCP Status */}
                <div className="flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-lg">
                  <Database className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <div className="text-sm text-green-600 dark:text-green-400">
                    <span className="font-semibold">MCP Connected</span>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>Last sync: 30s ago</span>
                </div>

                {/* Quick Add Task Button */}
                <button
                  onClick={() => setShowQuickAdd(!showQuickAdd)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg px-4 py-2 transition-all hover:from-purple-700 to-pink-700 flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Add Task</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Phase Selection */}
            <div className="lg:col-span-1 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Development Phases
              </h2>

              {/* Progress Bar */}
              <div className="space-y-4">
                {phases.map((phase) => {
                  const stats = getPhaseStats(phase.id);
                  const isPhaseSelected = selectedPhase === phase.id;
                  return (
                    <div key={phase.id}>
                      <button
                        onClick={() => setSelectedPhase(isPhaseSelected ? null : phase.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                          isPhaseSelected 
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white ring-2 ring-purple-500' 
                            : 'bg-white/10 hover:bg-white/20 text-gray-700 dark:bg-gray-800 dark:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {phase.icon}
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {phase.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {phase.duration}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {stats.percentage}%
                            </div>
                            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {stats.done}/{stats.total}
                            </div>
                        </div>
                        </div>
                      </button>

                      {/* Progress Bar */}
                      <div className="mt-2">
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-300`}
                            style={{ width: `${stats.percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Task Counts */}
                      <div className="mt-2 flex gap-4 text-xs">
                        <span className="text-gray-500 dark:text-gray-400">
                          {stats.backlog} backlog
                        </span>
                        <span className="text-yellow-600 dark:text-yellow-400">
                          {stats.inprogress} in progress
                        </span>
                        <span className="text-green-600 dark:text-green-400">
                          {stats.done} done
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Kanban Board */}
            <div className="lg:col-span-3 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  {selectedPhase 
                    ? (() => {
                        const phase = phases.find(p => p.id === selectedPhase);
                        return (
                          <>
                            <span className="text-purple-600 dark:text-purple-400">{phase?.name}</span>
                            <button
                              onClick={() => setSelectedPhase(null)}
                              className="ml-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                              (Close)
                            </button>
                          </>
                        );
                      })()
                    : 'Backlog'}
                </h2>

                {/* Phase Stats Detail */}
                {selectedPhase && (() => {
                  const stats = getPhaseStats(selectedPhase);
                  return (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                        <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
                          Total Tasks
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          {stats.total}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-700">
                        <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium mb-2">
                          In Progress
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          {stats.inprogress}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-700">
                        <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-2">
                          Completed
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          {stats.done}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Columns */}
                <div className="grid grid-cols-3 gap-4">
                  {columns.map((column) => (
                    <div key={column} className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900/20 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            column === 'done' ? 'bg-green-600 dark:bg-green-500' : 
                            column === 'inprogress' ? 'bg-yellow-600 dark:bg-yellow-500' : 
                            'bg-orange-600 dark:bg-orange-500'
                          }`}>
                            <span className="text-xs font-bold text-white">
                              {getColumnTasks(column).length}
                            </span>
                        </div>
                        </div>
                        <h3 className={`font-semibold text-gray-900 dark:text-white ${
                          column === 'done' ? 'text-green-600 dark:text-green-400' : 
                          column === 'inprogress' ? 'text-yellow-600 dark:text-yellow-400' : 
                          'text-orange-600 dark:text-orange-400'
                        }`}>
                          {COLUMN_TITLES[column]}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Add Modal */}
              {showQuickAdd && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-lg">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      Add Task
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Task Description
                        </label>
                        <textarea
                          value={quickAddText}
                          onChange={(e) => setQuickAddText(e.target.value)}
                          placeholder="Enter task description..."
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phase
                        </label>
                        <select
                          value={selectedPhase || 'phase1'}
                          onChange={(e) => setSelectedPhase(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          {phases.map((phase) => (
                            <option key={phase.id} value={phase.id}>
                              {phase.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Priority
                        </label>
                        <select
                          value="medium"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            if (quickAddText.trim() && selectedPhase) {
                              addTask(quickAddText.trim(), selectedPhase, 'medium');
                              setQuickAddText('');
                              setShowQuickAdd(false);
                            }
                          }}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg py-2 font-medium hover:from-green-700 to-emerald-700 transition-all"
                        >
                          Add Task
                        </button>
                        <button
                          onClick={() => {
                            setQuickAddText('');
                            setShowQuickAdd(false);
                          }}
                          className="flex-1 bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-white rounded-lg py-2 font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => {
                          if (quickAddText.trim() && selectedPhase) {
                            addTask(quickAddText.trim(), selectedPhase, 'high');
                            setQuickAddText('');
                            setShowQuickAdd(false);
                          }
                        }}
                          className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg py-3 font-medium hover:from-orange-700 to-red-700 transition-all"
                        >
                        High Priority
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-auto border-t border-white/10 bg-white/5 backdrop-blur-lg">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  <span>Powered by</span>
                  <span className="text-gray-400 dark:text-gray-600">|</span>
                  <span className="text-gray-900 dark:text-white">Mission Control Dashboard</span>
                  <span className="text-gray-400 dark:text-gray-600">|</span>
                  <span className="text-gray-500 dark:text-gray-400">Model Context Protocol (MCP)</span>
                  <span className="text-gray-400 dark:text-gray-600">|</span>
                  <span className="text-gray-500 dark:text-gray-400">vkdnjznd/crypto-trading-mcp</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Updated</span>
                  <span className="text-gray-400 dark:text-gray-600">|</span>
                  <span>{new Date().toLocaleString()}</span>
                </div>
              </div>
            </div>
          </footer>
        </main>
        </div>
      </DndProvider>
    );
}
