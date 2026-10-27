import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Calendar, 
  Flame, 
  ChevronRight, 
  Sparkles, 
  Clock, 
  TrendingUp,
  MapPin,
  MoreVertical
} from 'lucide-react';
import { Goal } from '../types/goal';
import { GoalIcon } from './GoalIcon';
import { getGoalColorTheme } from '../utils/colors';

interface GoalCardProps {
  goal: Goal;
  onCheckIn: (goal: Goal) => void;
  onViewDetails: (goal: Goal) => void;
  onDeleteGoal?: (goalId: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onCheckIn,
  onViewDetails,
  onDeleteGoal
}) => {
  const theme = getGoalColorTheme(goal.color);
  
  // Find current focus milestone
  const activeMilestone = goal.milestones.find(m => m.status === 'in_progress') 
    || goal.milestones.find(m => m.status === 'pending') 
    || goal.milestones[goal.milestones.length - 1];

  const completedCount = goal.milestones.filter(m => m.status === 'completed').length;
  const totalCount = goal.milestones.length;

  // Check if checked in today
  const todayStr = new Date().toISOString().split('T')[0];
  const checkedInToday = goal.lastCheckInDate === todayStr;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      className={`group relative overflow-hidden rounded-2xl bg-slate-900/90 border ${theme.accentBorder} p-5 sm:p-6 shadow-xl backdrop-blur-md transition-all duration-200 flex flex-col justify-between`}
      style={{
        boxShadow: `0 10px 30px -10px ${theme.glow}`
      }}
    >
      {/* Top ambient glow */}
      <div 
        className="absolute top-0 right-0 w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none -mr-10 -mt-10"
        style={{ backgroundColor: theme.glow }}
      />

      <div>
        {/* Header Row: Category Badge & Streak */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${theme.bgBadge}`}>
              <GoalIcon iconName={goal.icon} category={goal.category} className="w-3.5 h-3.5" />
              <span className="capitalize">{goal.category}</span>
            </span>

            {goal.streak > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Flame className="w-3 h-3 fill-amber-400/20 text-amber-400" />
                <span>{goal.streak} streak</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            {checkedInToday ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-medium">
                <CheckCircle2 className="w-3 h-3" /> Done today
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50">
                <Clock className="w-3 h-3 text-slate-500" /> Check-in ready
              </span>
            )}
          </div>
        </div>

        {/* Goal Title */}
        <h3 className="text-lg sm:text-xl font-bold text-slate-100 group-hover:text-white transition-colors line-clamp-2 leading-snug">
          {goal.title}
        </h3>

        {/* Smart Defaults Cadence & Metric */}
        <p className="mt-1 text-xs text-slate-400 line-clamp-1 flex items-center gap-1.5">
          <span className="text-slate-300 font-medium">{goal.assumedCadence}</span>
          <span>•</span>
          <span className="truncate">{goal.primaryMetric}</span>
        </p>

        {/* Progress Bar Section */}
        <div className="mt-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-slate-400" /> Progress
            </span>
            <span className="font-bold text-sm text-slate-100 font-mono">
              {Math.round(goal.progress)}%
            </span>
          </div>

          {/* Dynamic Progress Bar */}
          <div className="h-2.5 w-full bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-700/40">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(0, goal.progress))}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full bg-gradient-to-r ${theme.barGradient}`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
            <span>{completedCount} of {totalCount} milestones</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" />
              Target: {goal.targetDate}
            </span>
          </div>
        </div>

        {/* Active Focus Milestone Card */}
        {activeMilestone && (
          <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-indigo-400" /> Current Milestone
              </span>
              <span className="font-mono text-slate-400">Week {activeMilestone.targetWeek}</span>
            </div>
            <div className="font-medium text-slate-200 line-clamp-1">
              {activeMilestone.title}
            </div>
            {activeMilestone.shiftedNote && (
              <div className="mt-1 text-[11px] text-indigo-300/90 flex items-center gap-1 italic">
                <Sparkles className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                <span className="truncate">{activeMilestone.shiftedNote}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Button Card Actions */}
      <div className="mt-6 pt-3 border-t border-slate-800/60 flex items-center gap-2">
        {/* Primary Tactile Check-In Button */}
        <button
          onClick={() => onCheckIn(goal)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-150 cursor-pointer shadow-md ${theme.buttonBg} active:scale-[0.98]`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Daily Check-In</span>
        </button>

        {/* View Detailed Roadmap & History Button */}
        <button
          onClick={() => onViewDetails(goal)}
          title="View milestone roadmap & check-in history"
          className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
