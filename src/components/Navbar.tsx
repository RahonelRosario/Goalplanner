import React from 'react';
import { 
  Flame, 
  Sparkles, 
  Plus, 
  Volume2, 
  VolumeX, 
  Activity, 
  Compass, 
  RotateCcw 
} from 'lucide-react';
import { Goal } from '../types/goal';

interface NavbarProps {
  goals: Goal[];
  onOpenOnboarding: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetDemos: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  goals,
  onOpenOnboarding,
  soundEnabled,
  onToggleSound,
  onResetDemos
}) => {
  const activeCount = goals.filter(g => g.status === 'active').length;
  const totalCheckIns = goals.reduce((acc, g) => acc + (g.checkIns?.length || 0), 0);
  const maxStreak = Math.max(0, ...goals.map(g => g.streak || 0));

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-950/50 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg text-slate-100 tracking-tight">QWEEk</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Adaptive AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Smart defaults • Daily check-ins • Dynamic milestone shifting
            </p>
          </div>
        </div>

        {/* Center / Right stats & quick actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Quick Metrics */}
          <div className="hidden md:flex items-center gap-3 text-xs text-slate-400 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{activeCount} Active</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{maxStreak}d Streak</span>
            </div>
            <span className="text-slate-700">|</span>
            <span>{totalCheckIns} Updates</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute chimes' : 'Enable chimes'}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={onResetDemos}
            title="Reset sample goals"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors cursor-pointer hidden sm:block"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* New Goal Button */}
          <button
            onClick={onOpenOnboarding}
            className="flex items-center gap-1.5 py-2 px-3.5 sm:px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-950/60 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Goal</span>
          </button>
        </div>
      </div>
    </header>
  );
};
