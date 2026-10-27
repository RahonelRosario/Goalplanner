import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Loader2, 
  Clock, 
  Calendar, 
  TrendingUp, 
  ShieldCheck, 
  Layers,
  ChevronRight,
  Edit2,
  CheckCircle2,
  ListTodo,
  SlidersHorizontal
} from 'lucide-react';
import { Goal, PresetGoal } from '../types/goal';
import { PRESET_GOALS, instantiateGoalFromPreset } from '../data/presets';
import { GoalIcon } from './GoalIcon';
import { getGoalColorTheme } from '../utils/colors';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalCreated: (newGoal: Goal) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onGoalCreated
}) => {
  if (!isOpen) return null;

  const [promptInput, setPromptInput] = useState('');
  const [selectedDurationWeeks, setSelectedDurationWeeks] = useState<number>(12);
  const [isGenerating, setIsGenerating] = useState(false);
  const [plannedGoal, setPlannedGoal] = useState<Goal | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick preset deadline options
  const durationOptions = [
    { weeks: 4, label: '4 wks', sub: 'Fast Sprint' },
    { weeks: 8, label: '8 wks', sub: 'Focused' },
    { weeks: 12, label: '12 wks', sub: 'Standard' },
    { weeks: 16, label: '16 wks', sub: 'Paced' },
    { weeks: 24, label: '24 wks', sub: 'Long-term' }
  ];

  // If user picks a preset
  const handleSelectPreset = (preset: PresetGoal) => {
    const goal = instantiateGoalFromPreset(preset, selectedDurationWeeks);
    setPlannedGoal(goal);
  };

  // If user types a custom goal prompt
  const handleGeneratePlan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptInput.trim() || isGenerating) return;

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/goals/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: promptInput.trim(),
          customWeeks: selectedDurationWeeks
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate plan');
      }

      const data = await response.json();
      const now = new Date();
      const durationWeeks = selectedDurationWeeks || data.durationWeeks || 8;
      const targetDateObj = new Date(now.getTime() + durationWeeks * 7 * 24 * 60 * 60 * 1000);

      const milestones = (data.milestones || []).map((m: any, idx: number) => {
        const milestoneDate = new Date(now.getTime() + (m.targetWeek || (idx + 1)) * 7 * 24 * 60 * 60 * 1000);
        
        const actionTasks = (m.actionTasks || []).map((taskStr: string, tIdx: number) => ({
          id: 'task_' + Math.random().toString(36).substring(2, 9) + '_' + tIdx,
          text: typeof taskStr === 'string' ? taskStr : (taskStr as any)?.text || 'Contributing action task',
          completed: false
        }));

        return {
          id: 'm_' + Math.random().toString(36).substring(2, 9),
          title: m.title,
          description: m.description,
          targetWeek: m.targetWeek || idx + 1,
          targetDate: milestoneDate.toISOString().split('T')[0],
          weight: m.weight || 20,
          status: idx === 0 ? 'in_progress' : 'pending',
          actionTasks
        };
      });

      const newGoal: Goal = {
        id: 'goal_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
        title: data.title || promptInput.trim(),
        category: data.category || 'learning',
        icon: 'Target',
        color: data.color || 'indigo',
        createdAt: now.toISOString(),
        targetDate: targetDateObj.toISOString().split('T')[0],
        durationWeeks,
        assumedCadence: data.assumedCadence || '3 sessions per week',
        primaryMetric: data.primaryMetric || 'Consistency units',
        smartDefaultsReasoning: data.smartDefaultsReasoning || `Customized ${durationWeeks}-week roadmap with specific weekly contributing tasks.`,
        progress: 0,
        status: 'active',
        milestones,
        checkIns: [],
        quickCheckInOptions: data.quickCheckInOptions || [
          'Completed 30m focused practice session',
          'Accomplished key contributing milestone task',
          'Maintained daily streak and immersion'
        ],
        streak: 0
      };

      setPlannedGoal(newGoal);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Could not generate plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Adjust deadline in Step 2 preview
  const handleUpdatePlannedDeadline = (newWeeks: number) => {
    if (!plannedGoal || newWeeks < 1 || newWeeks > 52) return;
    const now = new Date();
    const newTargetDate = new Date(now.getTime() + newWeeks * 7 * 24 * 60 * 60 * 1000);

    const oldWeeks = plannedGoal.durationWeeks || 8;
    const updatedMilestones = plannedGoal.milestones.map((m) => {
      const scaledWeek = Math.max(1, Math.round((m.targetWeek / oldWeeks) * newWeeks));
      const mDate = new Date(now.getTime() + scaledWeek * 7 * 24 * 60 * 60 * 1000);
      return {
        ...m,
        targetWeek: scaledWeek,
        targetDate: mDate.toISOString().split('T')[0]
      };
    });

    setPlannedGoal({
      ...plannedGoal,
      durationWeeks: newWeeks,
      targetDate: newTargetDate.toISOString().split('T')[0],
      milestones: updatedMilestones
    });
  };

  const handleConfirm = () => {
    if (!plannedGoal) return;
    onGoalCreated(plannedGoal);
    onClose();
  };

  const theme = plannedGoal ? getGoalColorTheme(plannedGoal.color) : getGoalColorTheme('indigo');

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
          {/* Ambient Glow */}
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {!plannedGoal ? (
            <div className="flex-1 overflow-y-auto pr-1">
              {/* Step 1: Pick or Type a Goal + Set Your Own Deadline */}
              <div className="space-y-2 mb-5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Sparkles className="w-3.5 h-3.5" /> Set Goal & Custom Deadline
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                  What goal do you want to conquer?
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Choose your own target deadline and pick or type a goal. Each milestone will include concrete contributing tasks (like watching a movie or practicing dialogues).
                </p>
              </div>

              {/* Deadline Duration Selector (User sets their own timeline) */}
              <div className="mb-5 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Your Target Deadline:</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-indigo-400">
                    {selectedDurationWeeks} Weeks ({new Date(Date.now() + selectedDurationWeeks * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })})
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {durationOptions.map((opt) => (
                    <button
                      key={opt.weeks}
                      type="button"
                      onClick={() => setSelectedDurationWeeks(opt.weeks)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedDurationWeeks === opt.weeks
                          ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                      }`}
                    >
                      <div className="font-bold text-xs">{opt.label}</div>
                      <div className="text-[10px] text-slate-400 hidden sm:block">{opt.sub}</div>
                    </button>
                  ))}
                </div>

                {/* Custom weeks input */}
                <div className="mt-2.5 pt-2 border-t border-slate-850 flex items-center justify-between text-xs text-slate-400">
                  <span>Custom weeks count:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedDurationWeeks(prev => Math.max(1, prev - 1))}
                      className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={52}
                      value={selectedDurationWeeks}
                      onChange={(e) => setSelectedDurationWeeks(Math.max(1, Math.min(52, parseInt(e.target.value) || 1)))}
                      className="w-12 text-center bg-slate-900 border border-slate-700 rounded-md py-0.5 text-xs text-slate-100 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedDurationWeeks(prev => Math.min(52, prev + 1))}
                      className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                    <span className="text-[11px] text-slate-400 pl-1">weeks</span>
                  </div>
                </div>
              </div>

              {/* Freeform Prompt Input */}
              <form onSubmit={handleGeneratePlan} className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder="E.g. Learn conversational Spanish, Run my first 10k, Launch my SaaS MVP..."
                    className="w-full pl-4 pr-32 py-3.5 rounded-2xl bg-slate-950 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 placeholder-slate-500 outline-none shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={!promptInput.trim() || isGenerating}
                    className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Planning...</span>
                      </>
                    ) : (
                      <>
                        <span>Plan Goal</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
                {errorMessage && (
                  <p className="text-xs text-rose-400 mt-2">{errorMessage}</p>
                )}
              </form>

              {/* Presets Grid */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                  <span>Or pick a curated smart goal</span>
                  <span className="text-[11px] text-indigo-400">Uses your {selectedDurationWeeks}-week deadline</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {PRESET_GOALS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all text-left flex items-start gap-3 group cursor-pointer"
                    >
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 group-hover:scale-105 transition-transform">
                        <GoalIcon iconName={preset.icon} category={preset.category} className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-200 group-hover:text-white line-clamp-1">
                          {preset.title}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="text-indigo-300">{selectedDurationWeeks} weeks</span>
                          <span>•</span>
                          <span className="capitalize">{preset.category}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 self-center" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col justify-between">
              {/* Step 2: Smart Defaults Review & Instant Confirmation */}
              <div>
                <div className="space-y-1 mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${theme.bgBadge}`}>
                      <GoalIcon iconName={plannedGoal.icon} category={plannedGoal.category} className="w-3.5 h-3.5" />
                      <span className="capitalize">{plannedGoal.category}</span>
                    </span>
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Custom Deadline Configured
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                    {plannedGoal.title}
                  </h2>
                </div>

                {/* Editable Deadline Controls in Review View */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-indigo-500/30 mb-4 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-slate-400 text-[11px] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-400" /> Target Deadline:
                      </div>
                      <div className="text-sm font-bold text-slate-100 flex items-center gap-2 mt-0.5">
                        <span>{plannedGoal.durationWeeks} Weeks</span>
                        <span className="text-slate-400 text-xs font-normal">
                          (Target: {plannedGoal.targetDate})
                        </span>
                      </div>
                    </div>

                    {/* Quick weeks adjustment buttons */}
                    <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-900 p-1 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 px-1">Adjust:</span>
                      {[4, 8, 12, 16, 24].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => handleUpdatePlannedDeadline(w)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            plannedGoal.durationWeeks === w
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {w}w
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Milestone Roadmap with Concrete Bullet Point Tasks */}
                <div className="mb-4">
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ListTodo className="w-4 h-4 text-emerald-400" />
                      Milestone Plan & Action Tasks ({plannedGoal.milestones.length})
                    </span>
                    <span className="text-[11px] text-slate-400">Contributing daily/weekly steps</span>
                  </div>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {plannedGoal.milestones.map((m, idx) => (
                      <div
                        key={m.id || idx}
                        className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="font-bold text-slate-200">{m.title}</div>
                              <div className="text-[11px] text-slate-400 mt-0.5">{m.description}</div>
                            </div>
                          </div>
                          <span className="text-[11px] font-mono text-indigo-400 shrink-0 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            Week {m.targetWeek}
                          </span>
                        </div>

                        {/* Bullet points of things user would do that day or week */}
                        {m.actionTasks && m.actionTasks.length > 0 && (
                          <div className="mt-2 pl-7 pt-2 border-t border-slate-850 space-y-1">
                            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                              Tasks contributing to this milestone:
                            </div>
                            <ul className="space-y-1">
                              {m.actionTasks.map((task, tIdx) => (
                                <li key={task.id || tIdx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                                  <span className="text-emerald-400 font-bold">•</span>
                                  <span>{task.text}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-800 mt-3">
                <button
                  type="button"
                  onClick={() => setPlannedGoal(null)}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Change Goal
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${theme.buttonBg}`}
                >
                  <Check className="w-4 h-4" />
                  <span>Accept Plan & Add to Dashboard</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
