import React from 'react';
import {
  Flame,
  Rocket,
  Languages,
  PiggyBank,
  BookOpen,
  Dumbbell,
  Target,
  Sparkles,
  Zap,
  Activity,
  Heart,
  Briefcase
} from 'lucide-react';
import { GoalCategory } from '../types/goal';

interface GoalIconProps {
  iconName?: string;
  category?: GoalCategory;
  className?: string;
}

export const GoalIcon: React.FC<GoalIconProps> = ({ iconName, category, className = 'w-5 h-5' }) => {
  const icon = (iconName || '').toLowerCase();
  
  if (icon.includes('flame') || icon.includes('run') || category === 'fitness') {
    return <Flame className={className} />;
  }
  if (icon.includes('rocket') || icon.includes('saas') || category === 'career') {
    return <Rocket className={className} />;
  }
  if (icon.includes('languages') || icon.includes('spanish') || icon.includes('learn')) {
    return <Languages className={className} />;
  }
  if (icon.includes('piggy') || icon.includes('save') || icon.includes('money') || category === 'finance') {
    return <PiggyBank className={className} />;
  }
  if (icon.includes('book') || icon.includes('read')) {
    return <BookOpen className={className} />;
  }
  if (icon.includes('dumbbell') || icon.includes('lift')) {
    return <Dumbbell className={className} />;
  }
  if (icon.includes('heart') || category === 'health') {
    return <Heart className={className} />;
  }
  if (icon.includes('briefcase')) {
    return <Briefcase className={className} />;
  }
  if (icon.includes('activity')) {
    return <Activity className={className} />;
  }
  if (icon.includes('zap') || category === 'productivity') {
    return <Zap className={className} />;
  }
  if (icon.includes('sparkles')) {
    return <Sparkles className={className} />;
  }

  return <Target className={className} />;
};
