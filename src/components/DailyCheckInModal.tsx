import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sparkles, 
  Send, 
  Flame, 
  MapPin, 
  Check, 
  Loader2, 
  Activity, 
  HelpCircle,
  Clock
} from 'lucide-react';
import { Goal, CheckInRecord } from '../types/goal';
import { GoalIcon } from './GoalIcon';
import { getGoalColorTheme } from '../utils/colors';

interface DailyCheckInModalProps {
  goal: Goal | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitCheckIn: (
    goal: Goal,
    userUpdate: string,
    effortLevel: 'light' | 'moderate' | 'high' | 'breakthrough' | 'rest_recovery',
    metricValue?: string
  ) => Promise<void>;
  isSubmitting: boolean;
  initialText?: string;
}

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({
  goal,
  isOpen,
  onClose,
  onSubmitCheckIn,
  isSubmitting,
  initialText = ''
}) => {
  if (!isOpen || !goal) return null;

  const theme = getGoalColorTheme(goal.color);
  const activeMilestone = goal.milestones.find(m => m.status === 'in_progress') 
    || goal.milestones.find(m => m.status === 'pending') 
    || goal.milestones[goal.milestones.length - 1];

  const [updateText, setUpdateText] = useState(initialText);
  const [effortLevel, setEffortLevel] = useState<'light' | 'moderate' | 'high' | 'breakthrough' | 'rest_recovery'>('moderate');
  const [metricValue, setMetricValue] = useState('');
  const [selectedQuickChip, setSelectedQuickChip] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialText) {
      setUpdateText(initialText);
    }
  }, [initialText, isOpen]);

  const handleChipClick = (option: string) => {
    setSelectedQuickChip(option);
    if (!updateText.trim()) {
      setUpdateText(option);
    } else {
      setUpdateText(prev => `${prev.trim()} + ${option}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateText.trim() || isSubmitting) return;
    await onSubmitCheckIn(goal, updateText.trim(), effortLevel, metricValue.trim() || undefined);
  };

  const effortOptions: Array<{
    id: 'rest_recovery' | 'light' | 'moderate' | 'high' | 'breakthrough';
    label: string;
    sub: string;
    emoji: string;
  }> = [
    { id: 'rest_recovery', label: 'Rest / Recovery', sub: 'Mobility, rest & nutrition', emoji: '🌱' },
    { id: 'light', label: 'Light Session', sub: 'Gentle maintenance', emoji: '✨' },
    { id: 'moderate', label: 'Steady Pace', sub: 'Solid planned workout', emoji: '🔥' },
    { id: 'high', label: 'High Output', sub: 'Pushed limits & stamina', emoji: '⚡' },
    { id: 'breakthrough', label: 'Breakthrough', sub: 'Conquered major hurdle', emoji: '🚀' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-7 z-10 my-8 overflow-hidden"
        >
          {/* Ambient Corner Glow */}
          <div 
            className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{ backgroundColor: theme.glow }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Context */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${theme.bgBadge}`}>
              <GoalIcon iconName={goal.icon} category={goal.category} className="w-3.5 h-3.5" />
              <span>{goal.title}</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {Math.round(goal.progress)}% completed
            </span>
          </div>

          {/* Prominent Check-in Question */}
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight leading-snug">
            What did you do today (or this week) toward this goal?
          </h2>

          {/* Current Focus Milestone Reminder */}
          {activeMilestone && (
            <div className="mt-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-300">
              <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Targeting Milestone (Week {activeMilestone.targetWeek}):
                </div>
                <div className="font-medium text-slate-200 mt-0.5">{activeMilestone.title}</div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Quick Option Chips */}
            {goal.quickCheckInOptions && goal.quickCheckInOptions.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
                  <span>Quick-select an action:</span>
                  <span className="text-[11px] font-normal text-slate-400">Tap to auto-fill</span>
                </label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {goal.quickCheckInOptions.map((option, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleChipClick(option)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all text-left cursor-pointer flex items-center gap-1.5 ${
                        selectedQuickChip === option || updateText.includes(option)
                          ? 'bg-indigo-600/30 border-indigo-500/60 text-indigo-200 font-medium'
                          : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span>{option}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Freeform Textarea */}
            <div>
              <label htmlFor="checkin-update" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Your check-in update:
              </label>
              <textarea
                id="checkin-update"
                rows={3}
                required
                value={updateText}
                onChange={(e) => setUpdateText(e.target.value)}
                placeholder="E.g. Completed 5km tempo run with solid cadence, or built the user onboarding flow and fixed 2 styling bugs..."
                className="w-full rounded-xl bg-slate-950 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 placeholder-slate-500 p-3 outline-none resize-none"
              />
            </div>

            {/* Effort / Intensity Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Effort & Pacing Level:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {effortOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setEffortLevel(opt.id)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                      effortLevel === opt.id
                        ? 'bg-indigo-500/20 border-indigo-500/70 text-indigo-200 shadow-sm'
                        : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-700/50 text-slate-400'
                    }`}
                  >
                    <span className="text-base">{opt.emoji}</span>
                    <span className="text-[11px] font-semibold leading-tight">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Output Metric */}
            <div>
              <label htmlFor="metric-value" className="block text-xs font-semibold text-slate-400 mb-1 flex items-center justify-between">
                <span>Output Metric (Optional):</span>
                <span className="text-[11px] text-slate-500">{goal.primaryMetric}</span>
              </label>
              <input
                id="metric-value"
                type="text"
                value={metricValue}
                onChange={(e) => setMetricValue(e.target.value)}
                placeholder="E.g. 5.4 km, 45 mins, 2 chapters, $200"
                className="w-full rounded-xl bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-xs text-slate-200 placeholder-slate-600 px-3 py-2 outline-none"
              />
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!updateText.trim() || isSubmitting}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme.buttonBg
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>AI Recalculating Progress & Milestones...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Calculate Progress & Update Milestones</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-slate-400 mt-2">
                Gemini AI will evaluate your update, recalculate your progress %, and shift remaining milestones.
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
