import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Sparkles, 
  ArrowUpRight, 
  TrendingUp, 
  MapPin, 
  Calendar, 
  ArrowRight,
  Flame,
  X
} from 'lucide-react';
import { Goal, CheckInRecord } from '../types/goal';
import { getGoalColorTheme } from '../utils/colors';

interface RecalculationResultModalProps {
  goal: Goal | null;
  checkInRecord: CheckInRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onViewRoadmap: (goal: Goal) => void;
}

export const RecalculationResultModal: React.FC<RecalculationResultModalProps> = ({
  goal,
  checkInRecord,
  isOpen,
  onClose,
  onViewRoadmap
}) => {
  if (!isOpen || !goal || !checkInRecord) return null;

  const theme = getGoalColorTheme(goal.color);

  // Counter animation from previousProgress to newProgress
  const [displayProgress, setDisplayProgress] = useState(checkInRecord.previousProgress);

  useEffect(() => {
    const start = checkInRecord.previousProgress;
    const end = checkInRecord.newProgress;
    const duration = 1200; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progressRatio = Math.min(1, elapsed / duration);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progressRatio, 3);
      const current = Math.round(start + (end - start) * ease);
      setDisplayProgress(current);

      if (progressRatio < 1) {
        requestAnimationFrame(animate);
      }
    };

    const animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [checkInRecord]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 24, stiffness: 300 }}
          className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 z-10 my-8 overflow-hidden"
        >
          {/* Top Celebration Glow */}
          <div 
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl opacity-25 pointer-events-none"
            style={{ backgroundColor: theme.glow }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge & Title */}
          <div className="text-center space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" /> Progress Recalculated by AI
            </span>
            <h2 className="text-2xl font-black text-slate-100 tracking-tight">
              {goal.title}
            </h2>
          </div>

          {/* Progress Delta Hero Card */}
          <div className="mt-6 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center relative overflow-hidden">
            <div className="flex items-center justify-center gap-4">
              <div className="text-right">
                <div className="text-xs text-slate-400 font-mono">Previous</div>
                <div className="text-xl font-bold text-slate-400 font-mono">
                  {checkInRecord.previousProgress}%
                </div>
              </div>

              <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ArrowRight className="w-4 h-4" />
              </div>

              <div className="text-left">
                <div className="text-xs text-emerald-400 font-mono font-semibold flex items-center gap-1">
                  <span>New Pace</span>
                  <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.2 rounded font-bold">
                    +{checkInRecord.progressDelta}%
                  </span>
                </div>
                <div className="text-3xl font-black text-slate-100 font-mono">
                  {displayProgress}%
                </div>
              </div>
            </div>

            {/* Dynamic Animated Progress Bar */}
            <div className="mt-4 h-3 w-full bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
              <motion.div
                initial={{ width: `${checkInRecord.previousProgress}%` }}
                animate={{ width: `${checkInRecord.newProgress}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className={`h-full rounded-full bg-gradient-to-r ${theme.barGradient}`}
              />
            </div>
          </div>

          {/* AI Coaching Feedback */}
          <div className="mt-5 p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs sm:text-sm text-indigo-200 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-indigo-300 text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Coach Analysis</span>
            </div>
            <p className="leading-relaxed text-slate-200">
              {checkInRecord.aiFeedback}
            </p>
          </div>

          {/* Milestones Shifting Note */}
          {checkInRecord.milestonesShiftSummary && (
            <div className="mt-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Roadmap Shift & Milestones Adjustment</span>
              </div>
              <p className="text-slate-300">
                {checkInRecord.milestonesShiftSummary}
              </p>
            </div>
          )}

          {/* Next Micro-Action */}
          {checkInRecord.nextActionSuggestion && (
            <div className="mt-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2.5">
              <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300">Recommended Next Step: </span>
                <span>{checkInRecord.nextActionSuggestion}</span>
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onClose}
              className={`w-full sm:flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white transition-all cursor-pointer shadow-lg ${theme.buttonBg}`}
            >
              Continue to Dashboard
            </button>
            <button
              onClick={() => {
                onClose();
                onViewRoadmap(goal);
              }}
              className="w-full sm:w-auto py-3 px-4 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer"
            >
              View Full Roadmap
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
