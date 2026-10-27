import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Plus, 
  Target, 
  Flame, 
  Layers, 
  Compass, 
  Calendar, 
  CheckCircle2, 
  ChevronRight, 
  TrendingUp, 
  Clock,
  ArrowRight
} from 'lucide-react';
import { Goal, CheckInRecord, GoalCategory } from './types/goal';
import { 
  loadGoalsFromStorage, 
  saveGoalsToStorage, 
  getSoundPreference, 
  setSoundPreference 
} from './utils/storage';
import { playSuccessChime, playMilestoneUnlockChime } from './utils/sound';
import { Navbar } from './components/Navbar';
import { GoalCard } from './components/GoalCard';
import { OnboardingModal } from './components/OnboardingModal';
import { DailyCheckInModal } from './components/DailyCheckInModal';
import { RecalculationResultModal } from './components/RecalculationResultModal';
import { GoalDetailModal } from './components/GoalDetailModal';
import { PRESET_GOALS, instantiateGoalFromPreset } from './data/presets';

export default function App() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);

  // Modals state
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [checkInGoal, setCheckInGoal] = useState<Goal | null>(null);
  const [checkInPrefill, setCheckInPrefill] = useState<string>('');
  const [isSubmittingCheckIn, setIsSubmittingCheckIn] = useState(false);

  const [detailGoal, setDetailGoal] = useState<Goal | null>(null);
  const [recalcResult, setRecalcResult] = useState<{ goal: Goal; record: CheckInRecord } | null>(null);

  // Load initial goals from localStorage
  useEffect(() => {
    const loaded = loadGoalsFromStorage();
    setGoals(loaded);
    setSoundEnabledState(getSoundPreference());
  }, []);

  // Sync to storage
  const updateGoals = (updated: Goal[]) => {
    setGoals(updated);
    saveGoalsToStorage(updated);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabledState(next);
    setSoundPreference(next);
  };

  const handleResetDemos = () => {
    if (window.confirm('Reset goals back to initial smart sample goals?')) {
      localStorage.removeItem('stride_goals_data_v2');
      localStorage.removeItem('stride_goals_data_v1');
      const fresh = loadGoalsFromStorage();
      setGoals(fresh);
    }
  };

  // Onboarding: user created a new goal
  const handleGoalCreated = (newGoal: Goal) => {
    const updated = [newGoal, ...goals];
    updateGoals(updated);
    if (soundEnabled) playSuccessChime();
  };

  // Open check-in modal
  const handleStartCheckIn = (goal: Goal, prefillUpdate?: string) => {
    setCheckInGoal(goal);
    setCheckInPrefill(prefillUpdate || '');
  };

  // Execute Daily Check-In & AI Recalculation
  const handleDailyCheckInSubmit = async (
    targetGoal: Goal,
    userUpdate: string,
    effortLevel: 'light' | 'moderate' | 'high' | 'breakthrough' | 'rest_recovery',
    metricValue?: string
  ) => {
    setIsSubmittingCheckIn(true);
    try {
      const response = await fetch('/api/goals/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: targetGoal,
          checkInUpdate: userUpdate,
          effortLevel,
          metricValue
        })
      });

      if (!response.ok) {
        throw new Error('Failed to recalculate progress');
      }

      const result = await response.json();
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      // Formulate new check-in record
      const checkInRecord: CheckInRecord = {
        id: 'chk_' + Date.now().toString(36),
        timestamp: now.toISOString(),
        dateFormatted: 'Today',
        userUpdate,
        effortLevel,
        previousProgress: targetGoal.progress,
        newProgress: result.newProgress,
        progressDelta: result.progressDelta,
        aiFeedback: result.aiFeedback,
        milestonesShiftSummary: result.milestonesShiftSummary,
        nextActionSuggestion: result.nextActionSuggestion
      };

      // Merge updated milestones
      const mergedMilestones = targetGoal.milestones.map((m) => {
        const updateFromAI = (result.updatedMilestones || []).find((u: any) => u.id === m.id || u.title === m.title);
        if (updateFromAI) {
          return {
            ...m,
            status: updateFromAI.status || m.status,
            shiftedNote: updateFromAI.shiftedNote || m.shiftedNote,
            completedAt: updateFromAI.status === 'completed' && !m.completedAt ? now.toISOString() : m.completedAt
          };
        }
        return m;
      });

      // Update goal state
      const wasCheckedInToday = targetGoal.lastCheckInDate === todayStr;
      const newStreak = wasCheckedInToday ? targetGoal.streak : (targetGoal.streak || 0) + 1;

      const updatedGoal: Goal = {
        ...targetGoal,
        progress: result.newProgress,
        status: result.newProgress >= 100 ? 'completed' : 'active',
        milestones: mergedMilestones,
        checkIns: [...(targetGoal.checkIns || []), checkInRecord],
        quickCheckInOptions: result.freshQuickOptions || targetGoal.quickCheckInOptions,
        streak: newStreak,
        lastCheckInDate: todayStr
      };

      const newGoalsList = goals.map(g => g.id === targetGoal.id ? updatedGoal : g);
      updateGoals(newGoalsList);

      // Play audio celebratory chime
      if (soundEnabled) {
        if (result.newProgress >= 100 || mergedMilestones.some(m => m.status === 'completed' && !targetGoal.milestones.find(oldM => oldM.id === m.id && oldM.status === 'completed'))) {
          playMilestoneUnlockChime();
        } else {
          playSuccessChime();
        }
      }

      // Close check-in modal and show recalculation results
      setCheckInGoal(null);
      setRecalcResult({ goal: updatedGoal, record: checkInRecord });
    } catch (error) {
      console.error('Error during check-in:', error);
      alert('Could not update progress. Please check your network and try again.');
    } finally {
      setIsSubmittingCheckIn(false);
    }
  };

  // Toggle milestone manually in details modal
  const handleToggleMilestoneStatus = (goalId: string, milestoneId: string) => {
    const targetGoal = goals.find(g => g.id === goalId);
    if (!targetGoal) return;

    const updatedMilestones = targetGoal.milestones.map(m => {
      if (m.id === milestoneId) {
        const nextStatus = m.status === 'completed' ? 'in_progress' : 'completed';
        return {
          ...m,
          status: nextStatus as any,
          completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined
        };
      }
      return m;
    });

    const completedWeight = updatedMilestones
      .filter(m => m.status === 'completed')
      .reduce((sum, m) => sum + (m.weight || 20), 0);

    const updatedGoal: Goal = {
      ...targetGoal,
      milestones: updatedMilestones,
      progress: Math.min(100, Math.max(targetGoal.progress, completedWeight))
    };

    const nextGoals = goals.map(g => g.id === goalId ? updatedGoal : g);
    updateGoals(nextGoals);
    if (detailGoal && detailGoal.id === goalId) {
      setDetailGoal(updatedGoal);
    }
    if (soundEnabled) playSuccessChime();
  };

  // Toggle individual contributing task within a milestone
  const handleToggleActionTask = (goalId: string, milestoneId: string, taskId: string) => {
    const targetGoal = goals.find(g => g.id === goalId);
    if (!targetGoal) return;

    const updatedMilestones = targetGoal.milestones.map(m => {
      if (m.id === milestoneId) {
        const nextTasks = (m.actionTasks || []).map(t => {
          if (t.id === taskId) {
            return { ...t, completed: !t.completed };
          }
          return t;
        });
        return { ...m, actionTasks: nextTasks };
      }
      return m;
    });

    const updatedGoal: Goal = {
      ...targetGoal,
      milestones: updatedMilestones
    };

    const nextGoals = goals.map(g => g.id === goalId ? updatedGoal : g);
    updateGoals(nextGoals);
    if (detailGoal && detailGoal.id === goalId) {
      setDetailGoal(updatedGoal);
    }
    if (soundEnabled) playSuccessChime();
  };

  // Add custom contributing action task to a milestone
  const handleAddActionTask = (goalId: string, milestoneId: string, taskText: string) => {
    const targetGoal = goals.find(g => g.id === goalId);
    if (!targetGoal) return;

    const updatedMilestones = targetGoal.milestones.map(m => {
      if (m.id === milestoneId) {
        const newTask = {
          id: 'task_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 5),
          text: taskText.trim(),
          completed: false
        };
        return {
          ...m,
          actionTasks: [...(m.actionTasks || []), newTask]
        };
      }
      return m;
    });

    const updatedGoal: Goal = {
      ...targetGoal,
      milestones: updatedMilestones
    };

    const nextGoals = goals.map(g => g.id === goalId ? updatedGoal : g);
    updateGoals(nextGoals);
    if (detailGoal && detailGoal.id === goalId) {
      setDetailGoal(updatedGoal);
    }
  };

  // Update target deadline weeks and rescale milestones
  const handleUpdateDeadline = (goalId: string, newWeeks: number) => {
    const targetGoal = goals.find(g => g.id === goalId);
    if (!targetGoal || newWeeks < 1) return;

    const createdTime = targetGoal.createdAt ? new Date(targetGoal.createdAt).getTime() : Date.now();
    const newTargetDate = new Date(createdTime + newWeeks * 7 * 24 * 60 * 60 * 1000);
    const oldWeeks = targetGoal.durationWeeks || 8;

    const updatedMilestones = targetGoal.milestones.map(m => {
      const scaledWeek = Math.max(1, Math.round((m.targetWeek / oldWeeks) * newWeeks));
      const mDate = new Date(createdTime + scaledWeek * 7 * 24 * 60 * 60 * 1000);
      return {
        ...m,
        targetWeek: scaledWeek,
        targetDate: mDate.toISOString().split('T')[0]
      };
    });

    const updatedGoal: Goal = {
      ...targetGoal,
      durationWeeks: newWeeks,
      targetDate: newTargetDate.toISOString().split('T')[0],
      milestones: updatedMilestones
    };

    const nextGoals = goals.map(g => g.id === goalId ? updatedGoal : g);
    updateGoals(nextGoals);
    if (detailGoal && detailGoal.id === goalId) {
      setDetailGoal(updatedGoal);
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    const filtered = goals.filter(g => g.id !== goalId);
    updateGoals(filtered);
    if (detailGoal && detailGoal.id === goalId) setDetailGoal(null);
  };

  const filteredGoals = goals.filter(g => {
    if (categoryFilter === 'all') return true;
    return g.category === categoryFilter;
  });

  const categories: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'All Goals' },
    { id: 'fitness', label: 'Fitness' },
    { id: 'career', label: 'Career & SaaS' },
    { id: 'learning', label: 'Learning' },
    { id: 'finance', label: 'Finance' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        goals={goals}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onResetDemos={handleResetDemos}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Banner / Smart Defaults Concept Explanation */}
        <div className="mb-8 p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/20 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                  <Sparkles className="w-3 h-3" /> Adaptive Planning Engine
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">No 20-question setup forms</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                Tap any goal card to log your daily check-in.
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Log a quick update or tap a quick chip. The AI recalculates your progress percentage in real time and automatically shifts remaining milestone deadlines.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => setIsOnboardingOpen(true)}
                className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-950/60"
              >
                <Plus className="w-4 h-4" />
                <span>Add Goal with Smart Defaults</span>
              </button>
            </div>
          </div>
        </div>

        {/* Categories Bar & Active Goal Count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  categoryFilter === cat.id
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>Showing {filteredGoals.length} {filteredGoals.length === 1 ? 'goal' : 'goals'}</span>
          </div>
        </div>

        {/* Dashboard Goals Grid */}
        {filteredGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {filteredGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onCheckIn={handleStartCheckIn}
                  onViewDetails={(g) => setDetailGoal(g)}
                  onDeleteGoal={handleDeleteGoal}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800/60 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-200">No goals found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {categoryFilter !== 'all' 
                  ? 'No goals in this category. Switch filter or create a new one.' 
                  : 'Start by picking or typing a goal to generate an instant plan.'}
              </p>
            </div>
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Goal</span>
            </button>
          </div>
        )}
      </main>

      {/* Onboarding Setup Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onGoalCreated={handleGoalCreated}
      />

      {/* Daily Check-In Modal: "What did you do today (or this week) toward this goal?" */}
      <DailyCheckInModal
        goal={checkInGoal}
        isOpen={!!checkInGoal}
        onClose={() => {
          setCheckInGoal(null);
          setCheckInPrefill('');
        }}
        onSubmitCheckIn={handleDailyCheckInSubmit}
        isSubmitting={isSubmittingCheckIn}
        initialText={checkInPrefill}
      />

      {/* Progress & Milestone Recalculation Modal */}
      <RecalculationResultModal
        goal={recalcResult?.goal || null}
        checkInRecord={recalcResult?.record || null}
        isOpen={!!recalcResult}
        onClose={() => setRecalcResult(null)}
        onViewRoadmap={(g) => {
          setRecalcResult(null);
          setDetailGoal(g);
        }}
      />

      {/* Detailed Milestone Roadmap Modal with Action Tasks & Deadline Editor */}
      <GoalDetailModal
        goal={detailGoal}
        isOpen={!!detailGoal}
        onClose={() => setDetailGoal(null)}
        onStartCheckIn={(g, prefill) => {
          setDetailGoal(null);
          handleStartCheckIn(g, prefill);
        }}
        onDeleteGoal={handleDeleteGoal}
        onToggleMilestoneStatus={handleToggleMilestoneStatus}
        onToggleActionTask={handleToggleActionTask}
        onAddActionTask={handleAddActionTask}
        onUpdateDeadline={handleUpdateDeadline}
      />
    </div>
  );
}
