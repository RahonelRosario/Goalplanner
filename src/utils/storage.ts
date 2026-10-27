import { Goal } from '../types/goal';
import { PRESET_GOALS, instantiateGoalFromPreset } from '../data/presets';

const STORAGE_KEY = 'stride_goals_data_v2';
const SOUND_KEY = 'stride_sound_enabled';

export function loadGoalsFromStorage(): Goal[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('stride_goals_data_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure all milestones have actionTasks
        const repaired = parsed.map((g: Goal) => ({
          ...g,
          milestones: (g.milestones || []).map((m, mIdx) => {
            if (!m.actionTasks || m.actionTasks.length === 0) {
              const defaultTasks = [
                `Review core milestone objective: ${m.title}`,
                `Complete 30-minute focused session contributing to this phase`,
                `Log key milestone output and evaluate progress`
              ];
              return {
                ...m,
                actionTasks: defaultTasks.map((t, tIdx) => ({
                  id: `task_${m.id || mIdx}_${tIdx}`,
                  text: t,
                  completed: false
                }))
              };
            }
            return m;
          })
        }));
        return repaired;
      }
    }
  } catch (e) {
    console.error('Failed to load goals from localStorage:', e);
  }

  // Pre-populate with Learn conversational Spanish & 10k Run
  const spanishGoal = instantiateGoalFromPreset(PRESET_GOALS[0]); // Spanish (index 0)
  spanishGoal.progress = 20;
  spanishGoal.streak = 4;
  spanishGoal.lastCheckInDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  if (spanishGoal.milestones[0]) {
    spanishGoal.milestones[0].status = 'completed';
    spanishGoal.milestones[0].completedAt = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();
    spanishGoal.milestones[0].shiftedNote = 'Mastered 300 core words; rolling pronunciation smoothly';
    if (spanishGoal.milestones[0].actionTasks) {
      spanishGoal.milestones[0].actionTasks.forEach(t => t.completed = true);
    }
  }
  if (spanishGoal.milestones[1]) {
    spanishGoal.milestones[1].status = 'in_progress';
  }
  spanishGoal.checkIns = [
    {
      id: 'c_spanish_1',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      dateFormatted: 'Yesterday',
      userUpdate: 'Completed 25 minutes of flashcards and ordered dinner in Spanish at a local restaurant.',
      effortLevel: 'high',
      previousProgress: 12,
      newProgress: 20,
      progressDelta: 8,
      aiFeedback: 'Ordering food live with native speakers is the fastest way to build conversational confidence. Great practical execution!',
      milestonesShiftSummary: 'Advanced situational dialogue milestone pacing by 2 days.',
      nextActionSuggestion: 'Watch a Spanish short film with Spanish subtitles or listen to a 15-minute podcast.'
    }
  ];

  const runGoal = instantiateGoalFromPreset(PRESET_GOALS[1]); // 10k Run
  runGoal.progress = 25;
  runGoal.streak = 3;
  runGoal.lastCheckInDate = new Date().toISOString().split('T')[0];
  if (runGoal.milestones[0]) {
    runGoal.milestones[0].status = 'completed';
    runGoal.milestones[0].completedAt = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  }
  if (runGoal.milestones[1]) {
    runGoal.milestones[1].status = 'in_progress';
  }

  const initialList = [spanishGoal, runGoal];
  saveGoalsToStorage(initialList);
  return initialList;
}

export function saveGoalsToStorage(goals: Goal[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  } catch (e) {
    console.error('Failed to save goals to localStorage:', e);
  }
}

export function getSoundPreference(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const v = localStorage.getItem(SOUND_KEY);
    return v === null ? true : v === 'true';
  } catch {
    return true;
  }
}

export function setSoundPreference(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SOUND_KEY, String(enabled));
  } catch {
    // ignore
  }
}
