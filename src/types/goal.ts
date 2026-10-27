export type GoalCategory =
  | 'fitness'
  | 'career'
  | 'learning'
  | 'finance'
  | 'creative'
  | 'health'
  | 'productivity'
  | 'other';

export type MilestoneStatus = 'pending' | 'in_progress' | 'completed';

export interface ActionTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetWeek: number;
  targetDate: string; // ISO or YYYY-MM-DD
  weight: number; // percentage contribution (total 100)
  status: MilestoneStatus;
  completedAt?: string;
  shiftedNote?: string; // e.g. "Paced +3 days earlier due to solid tempo run"
  actionTasks?: ActionTask[]; // Concrete contributing bullet points & tasks to do that day or week
}

export interface CheckInRecord {
  id: string;
  timestamp: string; // ISO
  dateFormatted: string; // e.g. "Oct 19, 2026"
  userUpdate: string;
  effortLevel: 'light' | 'moderate' | 'high' | 'breakthrough' | 'rest_recovery';
  previousProgress: number;
  newProgress: number;
  progressDelta: number;
  aiFeedback: string;
  milestonesShiftSummary?: string;
  nextActionSuggestion?: string;
}

export interface Goal {
  id: string;
  title: string;
  category: GoalCategory;
  icon: string;
  color: string; // e.g., 'emerald', 'indigo', 'sky', 'rose', 'amber', 'purple'
  createdAt: string;
  targetDate: string;
  durationWeeks: number;
  assumedCadence: string; // e.g., "3x per week", "Daily 20 mins"
  primaryMetric: string; // e.g., "Kilometers logged", "Chapters read"
  smartDefaultsReasoning: string;
  progress: number; // 0 to 100
  status: 'active' | 'completed' | 'paused';
  milestones: Milestone[];
  checkIns: CheckInRecord[];
  quickCheckInOptions: string[];
  streak: number;
  lastCheckInDate?: string;
}

export interface PresetMilestone {
  title: string;
  description: string;
  targetWeek: number;
  weight: number;
  status: MilestoneStatus;
  actionTasks: string[];
}

export interface PresetGoal {
  title: string;
  category: GoalCategory;
  icon: string;
  color: string;
  durationWeeks: number;
  assumedCadence: string;
  primaryMetric: string;
  smartDefaultsReasoning: string;
  milestones: PresetMilestone[];
  quickCheckInOptions: string[];
}
