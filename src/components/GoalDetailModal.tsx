import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Flame, 
  MapPin, 
  Trash2, 
  TrendingUp, 
  History,
  Layers,
  ArrowUpRight,
  Plus,
  Activity,
  Zap,
  Target,
  Edit2,
  Check,
  Send,
  ListTodo,
  Square,
  CheckSquare
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { Goal, Milestone, CheckInRecord, ActionTask } from '../types/goal';
import { GoalIcon } from './GoalIcon';
import { getGoalColorTheme } from '../utils/colors';

interface GoalDetailModalProps {
  goal: Goal | null;
  isOpen: boolean;
  onClose: () => void;
  onStartCheckIn: (goal: Goal, prefillUpdate?: string) => void;
  onDeleteGoal: (goalId: string) => void;
  onToggleMilestoneStatus: (goalId: string, milestoneId: string) => void;
  onToggleActionTask: (goalId: string, milestoneId: string, taskId: string) => void;
  onAddActionTask: (goalId: string, milestoneId: string, taskText: string) => void;
  onUpdateDeadline: (goalId: string, newWeeks: number) => void;
}

export const GoalDetailModal: React.FC<GoalDetailModalProps> = ({
  goal,
  isOpen,
  onClose,
  onStartCheckIn,
  onDeleteGoal,
  onToggleMilestoneStatus,
  onToggleActionTask,
  onAddActionTask,
  onUpdateDeadline
}) => {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'trajectory' | 'history'>('roadmap');
  const [isEditingDeadline, setIsEditingDeadline] = useState(false);
  const [tempWeeks, setTempWeeks] = useState(goal?.durationWeeks || 12);
  const [newTaskInputs, setNewTaskInputs] = useState<Record<string, string>>({});

  if (!isOpen || !goal) return null;

  const theme = getGoalColorTheme(goal.color);

  const chartStrokeColor = useMemo(() => {
    switch (goal.color) {
      case 'emerald': return '#10b981';
      case 'indigo': return '#6366f1';
      case 'amber': return '#f59e0b';
      case 'sky': return '#0ea5e9';
      case 'rose': return '#f43f5e';
      case 'purple': return '#a855f7';
      default: return '#06b6d4';
    }
  }, [goal.color]);

  // Construct trajectory data points over time based on check-ins
  const trajectoryData = useMemo(() => {
    const points: Array<{
      date: string;
      progress: number;
      delta: number;
      update: string;
      effort?: string;
    }> = [];

    const createdDate = goal.createdAt ? new Date(goal.createdAt) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const firstCheckIn = goal.checkIns?.[0];
    const initialProgress = firstCheckIn ? firstCheckIn.previousProgress : 0;

    points.push({
      date: createdDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      progress: initialProgress,
      delta: 0,
      update: 'Goal initiated with smart defaults',
      effort: 'Baseline'
    });

    if (goal.checkIns && goal.checkIns.length > 0) {
      const sorted = [...goal.checkIns].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      sorted.forEach((chk) => {
        const d = new Date(chk.timestamp);
        const label = chk.dateFormatted || d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

        points.push({
          date: label,
          progress: chk.newProgress,
          delta: chk.progressDelta,
          update: chk.userUpdate,
          effort: chk.effortLevel
        });
      });
    } else {
      points.push({
        date: 'Today',
        progress: goal.progress,
        delta: 0,
        update: 'Ready for first check-in',
        effort: 'Planned'
      });
    }

    return points;
  }, [goal]);

  const stats = useMemo(() => {
    const checkInsCount = goal.checkIns?.length || 0;
    const totalDelta = goal.checkIns?.reduce((sum, c) => sum + (c.progressDelta || 0), 0) || 0;
    const avgDelta = checkInsCount > 0 ? (totalDelta / checkInsCount).toFixed(1) : '0';
    const remainingProgress = Math.max(0, 100 - goal.progress);
    const estimatedCheckInsLeft = avgDelta !== '0' ? Math.ceil(remainingProgress / parseFloat(avgDelta)) : '—';

    return {
      checkInsCount,
      totalDelta,
      avgDelta,
      remainingProgress,
      estimatedCheckInsLeft
    };
  }, [goal]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950/95 border border-slate-700/90 p-3 rounded-xl shadow-2xl text-xs backdrop-blur-md max-w-xs z-50">
          <div className="flex items-center justify-between gap-3 text-slate-400 mb-1.5 border-b border-slate-800 pb-1">
            <span className="font-semibold text-slate-200">{data.date}</span>
            <span className="font-mono text-emerald-400 font-bold">
              {data.delta > 0 ? `+${data.delta}%` : ''} ({data.progress}%)
            </span>
          </div>
          <p className="text-slate-300 italic line-clamp-2">
            "{data.update}"
          </p>
          {data.effort && (
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider">
              <span>Effort: <strong className="text-indigo-300">{data.effort.replace('_', ' ')}</strong></span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const handleSaveDeadline = () => {
    if (tempWeeks > 0 && tempWeeks <= 52) {
      onUpdateDeadline(goal.id, tempWeeks);
      setIsEditingDeadline(false);
    }
  };

  const handleAddTaskSubmit = (milestoneId: string, e: React.FormEvent) => {
    e.preventDefault();
    const val = newTaskInputs[milestoneId]?.trim();
    if (!val) return;
    onAddActionTask(goal.id, milestoneId, val);
    setNewTaskInputs(prev => ({ ...prev, [milestoneId]: '' }));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 z-10 my-8 overflow-hidden max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${theme.bgBadge}`}>
                  <GoalIcon iconName={goal.icon} category={goal.category} className="w-3.5 h-3.5" />
                  <span className="capitalize">{goal.category}</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {Math.round(goal.progress)}% completed
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100">
                {goal.title}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress bar overview with User-Configurable Deadline */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 mb-5">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400 font-medium">Goal Completion Trajectory</span>
              <span className="font-bold font-mono text-slate-200">{Math.round(goal.progress)}%</span>
            </div>
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/40">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${theme.barGradient}`}
                style={{ width: `${Math.min(100, Math.max(0, goal.progress))}%` }}
              />
            </div>

            {/* Target Deadline display & inline editor */}
            <div className="mt-3 pt-2.5 border-t border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              {!isEditingDeadline ? (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Deadline: <strong>{goal.durationWeeks} Weeks</strong></span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">Target: {goal.targetDate}</span>
                  </div>
                  <button
                    onClick={() => {
                      setTempWeeks(goal.durationWeeks || 12);
                      setIsEditingDeadline(true);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white transition-all cursor-pointer text-[11px] font-semibold border border-slate-700/80"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Set Deadline</span>
                  </button>
                </div>
              ) : (
                <div className="w-full bg-slate-900 p-2.5 rounded-xl border border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300 font-medium text-xs">Adjust Weeks:</span>
                    <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setTempWeeks(prev => Math.max(1, prev - 1))}
                        className="w-5 h-5 flex items-center justify-center text-slate-300 hover:text-white font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={52}
                        value={tempWeeks}
                        onChange={(e) => setTempWeeks(Math.max(1, Math.min(52, parseInt(e.target.value) || 1)))}
                        className="w-10 text-center bg-transparent text-white font-mono font-bold text-xs outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setTempWeeks(prev => Math.min(52, prev + 1))}
                        className="w-5 h-5 flex items-center justify-center text-slate-300 hover:text-white font-bold cursor-pointer"
                      >
                        +
                      </button>
                      <span className="text-slate-400 text-[11px]">wks</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    {[4, 8, 12, 16, 24].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setTempWeeks(w)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                          tempWeeks === w ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {w}w
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleSaveDeadline}
                      className="ml-2 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3 h-3" /> Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingDeadline(false)}
                      className="px-2 py-1 rounded-lg text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'roadmap'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Milestones & Action Tasks ({goal.milestones.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('trajectory')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'trajectory'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Progress Trajectory</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Check-in Logs ({goal.checkIns?.length || 0})</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {activeTab === 'roadmap' ? (
              <div className="space-y-4">
                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span>Each milestone contains daily & weekly tasks contributing to this goal.</span>
                  <span className="text-[11px] text-indigo-400">Tap task to log check-in</span>
                </div>

                {goal.milestones.map((m, idx) => {
                  const isCompleted = m.status === 'completed';
                  const isInProgress = m.status === 'in_progress';
                  const tasks = m.actionTasks || [];

                  return (
                    <div
                      key={m.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isCompleted
                          ? 'bg-emerald-950/20 border-emerald-500/30'
                          : isInProgress
                          ? 'bg-indigo-950/30 border-indigo-500/40 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                      }`}
                    >
                      {/* Milestone Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => onToggleMilestoneStatus(goal.id, m.id)}
                            title="Click to toggle milestone completion"
                            className={`mt-0.5 p-1 rounded-lg border transition-all cursor-pointer ${
                              isCompleted
                                ? 'bg-emerald-500 text-white border-emerald-400'
                                : isInProgress
                                ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50'
                                : 'bg-slate-800 text-slate-500 border-slate-700'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-200">
                                {m.title}
                              </span>
                              {isInProgress && (
                                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.2 rounded font-semibold uppercase">
                                  Current Focus
                                </span>
                              )}
                              {isCompleted && (
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.2 rounded font-semibold">
                                  Done
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              {m.description}
                            </p>
                            {m.shiftedNote && (
                              <div className="mt-2 text-[11px] text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20 flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
                                <span>{m.shiftedNote}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[11px] font-mono text-slate-400">
                            Week {m.targetWeek}
                          </span>
                          <div className="text-[10px] text-slate-500">{m.targetDate}</div>
                        </div>
                      </div>

                      {/* Contributing Action Tasks Bullet Points */}
                      <div className="mt-3.5 pt-3 border-t border-slate-800/80">
                        <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <ListTodo className="w-3.5 h-3.5 text-emerald-400" />
                            Contributing Tasks ({tasks.filter(t => t.completed).length}/{tasks.length})
                          </span>
                          <span className="text-[10px] text-slate-500 font-normal">Things to do this week</span>
                        </div>

                        {/* Task List */}
                        <div className="space-y-1.5 pl-1">
                          {tasks.map((task) => (
                            <div
                              key={task.id}
                              className={`p-2 rounded-lg flex items-start justify-between gap-2.5 text-xs transition-colors ${
                                task.completed 
                                  ? 'bg-emerald-950/15 text-slate-400' 
                                  : 'bg-slate-900/60 hover:bg-slate-900 text-slate-200'
                              }`}
                            >
                              <div className="flex items-start gap-2 min-w-0">
                                <button
                                  type="button"
                                  onClick={() => onToggleActionTask(goal.id, m.id, task.id)}
                                  className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
                                >
                                  {task.completed ? (
                                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Square className="w-3.5 h-3.5 text-slate-500" />
                                  )}
                                </button>
                                <span className={`leading-snug ${task.completed ? 'line-through text-slate-500' : ''}`}>
                                  {task.text}
                                </span>
                              </div>

                              {/* Button to quickly log this task in daily check-in */}
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onStartCheckIn(goal, task.text);
                                }}
                                title="Log this task in your daily check-in"
                                className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 flex items-center gap-1 shrink-0 transition-all cursor-pointer"
                              >
                                <Send className="w-2.5 h-2.5" />
                                <span>Check-in</span>
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Inline Add Task Form */}
                        <form
                          onSubmit={(e) => handleAddTaskSubmit(m.id, e)}
                          className="mt-2.5 flex items-center gap-2"
                        >
                          <input
                            type="text"
                            placeholder="Add a new contributing task (e.g. watch Spanish video)..."
                            value={newTaskInputs[m.id] || ''}
                            onChange={(e) => setNewTaskInputs(prev => ({ ...prev, [m.id]: e.target.value }))}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500"
                          />
                          <button
                            type="submit"
                            disabled={!newTaskInputs[m.id]?.trim()}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add</span>
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : activeTab === 'trajectory' ? (
              <div className="space-y-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-indigo-400" />
                      Trajectory Over Time
                    </span>
                    <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[11px]">
                      Current: {Math.round(goal.progress)}%
                    </span>
                  </div>

                  <div className="w-full h-56 sm:h-64 pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={trajectoryData}
                        margin={{ top: 10, right: 12, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id={`gradient-${goal.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartStrokeColor} stopOpacity={0.4} />
                            <stop offset="95%" stopColor={chartStrokeColor} stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          stroke="#64748b" 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                        />
                        <YAxis 
                          domain={[0, 100]} 
                          stroke="#64748b" 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={false}
                          tickFormatter={(v) => `${v}%`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine 
                          y={100} 
                          stroke="rgba(255, 255, 255, 0.2)" 
                          strokeDasharray="4 4" 
                          label={{ value: 'Target: 100%', fill: '#94a3b8', fontSize: 10, position: 'top' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="progress"
                          stroke={chartStrokeColor}
                          strokeWidth={3}
                          fillOpacity={1}
                          fill={`url(#gradient-${goal.id})`}
                          activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: chartStrokeColor }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="text-[11px] text-slate-400 mb-0.5">Check-Ins</div>
                    <div className="text-base font-black text-slate-100 font-mono">
                      {stats.checkInsCount}
                    </div>
                    <div className="text-[10px] text-slate-500">Updates logged</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="text-[11px] text-slate-400 mb-0.5">Avg Velocity</div>
                    <div className="text-base font-black text-emerald-400 font-mono">
                      +{stats.avgDelta}%
                    </div>
                    <div className="text-[10px] text-slate-500">Per check-in</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="text-[11px] text-slate-400 mb-0.5">Remaining</div>
                    <div className="text-base font-black text-slate-100 font-mono">
                      {stats.remainingProgress}%
                    </div>
                    <div className="text-[10px] text-slate-500">To goal finish</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="text-[11px] text-slate-400 mb-0.5">Est. Sessions</div>
                    <div className="text-base font-black text-indigo-400 font-mono">
                      ~{stats.estimatedCheckInsLeft}
                    </div>
                    <div className="text-[10px] text-slate-500">At current pace</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {(!goal.checkIns || goal.checkIns.length === 0) ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No check-ins logged yet. Tap "Daily Check-In" to log your first update!
                  </div>
                ) : (
                  goal.checkIns.slice().reverse().map((chk) => (
                    <div
                      key={chk.id}
                      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span className="font-semibold text-slate-300">{chk.dateFormatted}</span>
                        <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          +{chk.progressDelta}% ({chk.newProgress}%)
                        </span>
                      </div>

                      <div className="text-slate-200 font-medium bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                        "{chk.userUpdate}"
                      </div>

                      {chk.aiFeedback && (
                        <div className="text-indigo-200/90 text-[11px] bg-indigo-950/20 p-2.5 rounded-lg border border-indigo-500/20">
                          <span className="font-semibold text-indigo-300">AI Feedback: </span>
                          {chk.aiFeedback}
                        </div>
                      )}

                      {chk.milestonesShiftSummary && (
                        <div className="text-slate-400 text-[11px] italic">
                          ↳ {chk.milestonesShiftSummary}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                if (window.confirm('Delete this goal and its check-in history?')) {
                  onDeleteGoal(goal.id);
                  onClose();
                }
              }}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 p-2 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Goal</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onStartCheckIn(goal);
              }}
              className={`py-2.5 px-5 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center gap-2 transition-all cursor-pointer shadow-md ${theme.buttonBg}`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Log Daily Check-In</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
