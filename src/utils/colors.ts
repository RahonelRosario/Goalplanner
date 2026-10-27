export function getGoalColorTheme(color: string) {
  switch (color) {
    case 'emerald':
      return {
        bgBadge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        barGradient: 'from-emerald-500 to-teal-400',
        ringFocus: 'focus:ring-emerald-500/40',
        accentBorder: 'border-emerald-500/30 hover:border-emerald-500/50',
        glow: 'rgba(16, 185, 129, 0.15)',
        textAccent: 'text-emerald-400',
        buttonBg: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
      };
    case 'indigo':
      return {
        bgBadge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        barGradient: 'from-indigo-500 to-violet-500',
        ringFocus: 'focus:ring-indigo-500/40',
        accentBorder: 'border-indigo-500/30 hover:border-indigo-500/50',
        glow: 'rgba(99, 102, 241, 0.15)',
        textAccent: 'text-indigo-400',
        buttonBg: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/40'
      };
    case 'amber':
      return {
        bgBadge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        barGradient: 'from-amber-500 to-orange-400',
        ringFocus: 'focus:ring-amber-500/40',
        accentBorder: 'border-amber-500/30 hover:border-amber-500/50',
        glow: 'rgba(245, 158, 11, 0.15)',
        textAccent: 'text-amber-400',
        buttonBg: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/40'
      };
    case 'sky':
      return {
        bgBadge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
        barGradient: 'from-sky-500 to-cyan-400',
        ringFocus: 'focus:ring-sky-500/40',
        accentBorder: 'border-sky-500/30 hover:border-sky-500/50',
        glow: 'rgba(14, 165, 233, 0.15)',
        textAccent: 'text-sky-400',
        buttonBg: 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-950/40'
      };
    case 'rose':
      return {
        bgBadge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        barGradient: 'from-rose-500 to-pink-500',
        ringFocus: 'focus:ring-rose-500/40',
        accentBorder: 'border-rose-500/30 hover:border-rose-500/50',
        glow: 'rgba(244, 63, 94, 0.15)',
        textAccent: 'text-rose-400',
        buttonBg: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/40'
      };
    case 'purple':
      return {
        bgBadge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        barGradient: 'from-purple-500 to-fuchsia-500',
        ringFocus: 'focus:ring-purple-500/40',
        accentBorder: 'border-purple-500/30 hover:border-purple-500/50',
        glow: 'rgba(168, 85, 247, 0.15)',
        textAccent: 'text-purple-400',
        buttonBg: 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-950/40'
      };
    default:
      return {
        bgBadge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        barGradient: 'from-cyan-500 to-blue-500',
        ringFocus: 'focus:ring-cyan-500/40',
        accentBorder: 'border-cyan-500/30 hover:border-cyan-500/50',
        glow: 'rgba(6, 182, 212, 0.15)',
        textAccent: 'text-cyan-400',
        buttonBg: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-950/40'
      };
  }
}
