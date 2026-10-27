import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// SEO: robots.txt and sitemap.xml for Google Search Engine crawlers
app.get('/robots.txt', (_req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\n\nSitemap: https://ais-pre-fju3ihlefini6umxbdbhml-872050116545.us-east1.run.app/sitemap.xml\n`);
});

app.get('/sitemap.xml', (_req, res) => {
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://ais-pre-fju3ihlefini6umxbdbhml-872050116545.us-east1.run.app/</loc>
    <lastmod>2026-10-26</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
});

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Endpoint 1: Generate Smart Plan for a Goal
app.post('/api/goals/plan', async (req, res) => {
  try {
    const { prompt, categoryHint, customWeeks } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Goal prompt is required' });
    }

    if (!ai) {
      // Fallback rule-based generator
      return res.json(generateFallbackPlan(prompt, categoryHint, customWeeks));
    }

    const systemInstruction = `You are an elite goal coach and product architect. 
Given a brief user goal (e.g. "Run a half marathon", "Build a mobile app in flutter", "Save $3,000", "Learn conversational Spanish"), 
construct a realistic milestone plan.
${customWeeks ? `IMPORTANT: The user explicitly specified a target deadline of ${customWeeks} weeks. Calibrate all milestone target weeks and pacing to fit exactly within ${customWeeks} weeks.` : 'Assume a sensible default timeline (e.g. 6 to 12 weeks), standard milestones, weekly cadence, and core metrics.'}
For EVERY milestone, provide 3 to 5 CONCRETE, ACTIONABLE bullet points/tasks of specific things the user can do that day or that week contributing to the goal (e.g. for learning Spanish: "Watch a movie in Spanish with subtitles", "Listen to a 15-minute beginner podcast", "Practice 20 mins flashcards", "Order food in Spanish", "Record 1-minute audio memo").
Also supply 5 realistic, quick check-in options they could tap when logging daily/weekly progress.`;

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Create a plan for: "${prompt}". ${customWeeks ? `Target duration: ${customWeeks} weeks.` : ''} Category hint: ${categoryHint || 'auto-detect'}.`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Refined, punchy goal title' },
            category: { 
              type: Type.STRING, 
              description: 'One of: fitness, career, learning, finance, creative, health, productivity, other' 
            },
            color: { 
              type: Type.STRING, 
              description: 'One of: emerald, indigo, sky, rose, amber, purple, teal' 
            },
            durationWeeks: { type: Type.INTEGER, description: 'Duration in weeks (respect user choice if provided)' },
            assumedCadence: { type: Type.STRING, description: 'e.g. "3x / week (30 mins)" or "Daily 20m practice"' },
            primaryMetric: { type: Type.STRING, description: 'e.g. "Kilometers run", "Chapters read", "MRR & signups"' },
            smartDefaultsReasoning: { 
              type: Type.STRING, 
              description: '1-2 sentences explaining why this timeline and cadence are the recommended baseline.' 
            },
            milestones: {
              type: Type.ARRAY,
              description: '4 to 6 ordered milestones from start to completion',
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  targetWeek: { type: Type.INTEGER },
                  weight: { type: Type.INTEGER, description: 'Percentage weight (e.g. 15, 20, 25)' },
                  actionTasks: {
                    type: Type.ARRAY,
                    description: '3 to 5 concrete action tasks/bullet points the user would do that day or week toward this milestone (e.g. watching a movie in Spanish, ordering food, doing flashcard drills)',
                    items: { type: Type.STRING }
                  }
                },
                required: ['title', 'description', 'targetWeek', 'weight', 'actionTasks']
              }
            },
            quickCheckInOptions: {
              type: Type.ARRAY,
              description: '5 quick selectable check-in actions the user can tap to log progress',
              items: { type: Type.STRING }
            }
          },
          required: [
            'title',
            'category',
            'color',
            'durationWeeks',
            'assumedCadence',
            'primaryMetric',
            'smartDefaultsReasoning',
            'milestones',
            'quickCheckInOptions'
          ]
        }
      }
    });

    // 10-second timeout guarantee
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Gemini API timeout')), 10000)
    );

    const response = (await Promise.race([generatePromise, timeoutPromise])) as any;
    const parsed = JSON.parse(response.text || '{}');
    if (customWeeks) parsed.durationWeeks = Number(customWeeks);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating goal plan:', error);
    const fallback = generateFallbackPlan(req.body?.prompt || 'My Goal', req.body?.categoryHint, req.body?.customWeeks);
    return res.json(fallback);
  }
});

// Endpoint 2: Evaluate Daily/Weekly Check-In & Recalculate Progress + Shift Milestones
app.post('/api/goals/checkin', async (req, res) => {
  try {
    const { goal, checkInUpdate, effortLevel, metricValue } = req.body;
    if (!goal || !checkInUpdate) {
      return res.status(400).json({ error: 'Goal and checkInUpdate are required' });
    }

    if (!ai) {
      return res.json(calculateFallbackCheckIn(goal, checkInUpdate, effortLevel));
    }

    const systemInstruction = `You are an adaptive AI Goal Progression Engine.
The user is checking in on their goal with an update on what they did today or this week.
Current Goal State:
- Title: ${goal.title}
- Current Progress: ${goal.progress}%
- Total Duration: ${goal.durationWeeks} weeks
- Milestones: ${JSON.stringify(goal.milestones)}
- Streak: ${goal.streak || 0}
- Check-In Log: "${checkInUpdate}" (Effort: ${effortLevel || 'moderate'}, Metric: ${metricValue || 'none'})

Your Task:
1. Calculate the NEW overall progress percentage (0 - 100).
   - Ensure progress moves forward sensibly (e.g. +3% to +15% depending on effort, milestone advancement, or consistency).
   - If user reports finishing an entire milestone, ensure progress reflects completion of that milestone's weight.
   - Never regress progress unless the user explicitly reports a major reset.
2. Evaluate Milestone States:
   - For each milestone in the goal:
     - Determine status: 'completed', 'in_progress', or 'pending'.
     - If the user made notable progress or moved fast, note any shifting of target dates (e.g. "Shifted forward by 3 days due to strong pace").
     - If pacing was light, adjust dates or pacing note constructively (e.g. "Paced by +2 days to allow proper recovery").
3. Generate punchy, encouraging AI Coaching Feedback (2-3 sentences):
   - Acknowledge specifically what they did.
   - Mention why this pushes them closer to the target.
4. Summarize how milestones shifted (1 sentence for the user).
5. Suggest ONE crisp Next Micro-Action for tomorrow or the next session.
6. Provide 4-5 fresh quick check-in option chips tailored to the current milestone status.`;

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Evaluate check-in: "${checkInUpdate}", Effort: ${effortLevel}. Goal: "${goal.title}".`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            newProgress: { type: Type.INTEGER, description: 'Adjusted total progress percentage from 0 to 100' },
            progressDelta: { type: Type.INTEGER, description: 'Difference between new and previous progress' },
            aiFeedback: { type: Type.STRING, description: 'Inspiring, concrete coaching feedback' },
            milestonesShiftSummary: { type: Type.STRING, description: 'How remaining milestones adapted to this check-in' },
            nextActionSuggestion: { type: Type.STRING, description: 'One clear micro-action for the next check-in' },
            updatedMilestones: {
              type: Type.ARRAY,
              description: 'All milestones with updated status and shiftedNote',
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  status: { type: Type.STRING, description: 'completed, in_progress, or pending' },
                  shiftedNote: { type: Type.STRING }
                },
                required: ['id', 'status']
              }
            },
            freshQuickOptions: {
              type: Type.ARRAY,
              description: 'Fresh quick check-in suggestions for next time',
              items: { type: Type.STRING }
            }
          },
          required: [
            'newProgress',
            'progressDelta',
            'aiFeedback',
            'milestonesShiftSummary',
            'nextActionSuggestion',
            'updatedMilestones',
            'freshQuickOptions'
          ]
        }
      }
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Gemini API timeout')), 10000)
    );

    const response = (await Promise.race([generatePromise, timeoutPromise])) as any;
    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error calculating check-in:', error);
    const fallback = calculateFallbackCheckIn(req.body.goal, req.body.checkInUpdate, req.body.effortLevel);
    return res.json(fallback);
  }
});

// Helper Fallbacks
function generateFallbackPlan(prompt: string, categoryHint?: string, customWeeks?: number) {
  const p = prompt.toLowerCase();
  let category = categoryHint || 'productivity';
  let color = 'indigo';
  let durationWeeks = customWeeks ? Number(customWeeks) : 8;
  let assumedCadence = '3-4 sessions / week';
  let primaryMetric = 'Consistency & completion units';
  
  if (p.includes('spanish') || p.includes('learn') || p.includes('language') || p.includes('french')) {
    category = 'learning';
    color = 'amber';
    assumedCadence = '25 mins daily immersion & speaking drills';
    primaryMetric = 'Vocabulary count & speaking fluidity';
    if (!customWeeks) durationWeeks = 12;

    return {
      title: prompt.trim(),
      category,
      color,
      durationWeeks,
      assumedCadence,
      primaryMetric,
      smartDefaultsReasoning: `Calibrated for sustainable language acquisition across ${durationWeeks} weeks, balancing daily vocabulary, grammar, and native immersion.`,
      milestones: [
        {
          title: 'Core Vocabulary & Pronunciation Rules',
          description: 'Master everyday pronouns, basic verbs (ser, estar, tener, ir), and essential phonetics.',
          targetWeek: Math.max(1, Math.round(durationWeeks * 0.25)),
          weight: 20,
          actionTasks: [
            'Practice 20 minutes with Spanish flashcards (first 50 high-frequency words)',
            'Watch 1 Spanish pronunciation video guide on vowel sounds & the rolled "r"',
            'Label 15 household items in Spanish with sticky notes (la mesa, la cocina)',
            'Conjugate the 4 primary verbs (ser, estar, tener, ir) and speak 5 sentences'
          ]
        },
        {
          title: 'Everyday Situational Dialogue',
          description: 'Order food, ask directions, introduce yourself, and handle shopping exchanges.',
          targetWeek: Math.max(2, Math.round(durationWeeks * 0.5)),
          weight: 25,
          actionTasks: [
            'Order food or coffee in Spanish at a local restaurant or market',
            'Listen to 2 beginner podcast episodes of Coffee Break Spanish',
            'Record a 1-minute voice note introducing your family and hobbies in Spanish',
            'Roleplay asking for street directions and train ticket prices out loud'
          ]
        },
        {
          title: 'Past and Future Tense Mastery',
          description: 'Tell stories about yesterday and describe plans for tomorrow with confidence.',
          targetWeek: Math.max(3, Math.round(durationWeeks * 0.75)),
          weight: 25,
          actionTasks: [
            'Write a short 5-sentence daily journal entry in Spanish about what you did yesterday',
            'Read 1 short story in Spanish (graded reader for beginners)',
            'Describe your upcoming weekend plans out loud using the near future tense ("Voy a...")',
            'Complete a 20-minute drill differentiating Pretérito vs Imperfecto verbs'
          ]
        },
        {
          title: '15-Minute Uninterrupted Native Conversation',
          description: 'Hold a spontaneous 15-minute voice conversation entirely in Spanish with a tutor or native speaker.',
          targetWeek: durationWeeks,
          weight: 30,
          actionTasks: [
            'Watch a full movie in Spanish with Spanish subtitles (e.g. Roma or Pan\'s Labyrinth)',
            'Complete a 15-minute 1-on-1 live voice exchange with a native speaker on iTalki or HelloTalk',
            'Listen to an episode of Radio Ambulante podcast without English subtitles',
            'Deliver a 3-minute impromptu speech in Spanish explaining your goals and routine',
            'Shadow a native Spanish monologue for 10 minutes to refine natural cadence'
          ]
        }
      ],
      quickCheckInOptions: [
        'Completed 30m flashcard drill (50 new words)',
        '15-min live speech tutor exchange',
        'Watched a movie / episode in Spanish with subtitles',
        'Listened to 1 Spanish podcast episode',
        'Wrote daily journal in Spanish (100 words)'
      ]
    };
  }

  if (p.includes('run') || p.includes('marathon') || p.includes('weight') || p.includes('lift') || p.includes('fitness') || p.includes('gym')) {
    category = 'fitness';
    color = 'emerald';
    assumedCadence = '3-4 training sessions / week';
    primaryMetric = 'Session volume & distance / weight';
    if (!customWeeks) durationWeeks = 10;
  } else if (p.includes('saas') || p.includes('app') || p.includes('launch') || p.includes('business') || p.includes('code')) {
    category = 'career';
    color = 'indigo';
    assumedCadence = '10-15 focus hours / week';
    primaryMetric = 'Shipped features & user traction';
    if (!customWeeks) durationWeeks = 6;
  } else if (p.includes('save') || p.includes('money') || p.includes('invest') || p.includes('$')) {
    category = 'finance';
    color = 'sky';
    assumedCadence = 'Weekly budget check & auto-transfer';
    primaryMetric = 'Dollars accumulated in reserve';
    if (!customWeeks) durationWeeks = 12;
  }

  return {
    title: prompt.trim(),
    category,
    color,
    durationWeeks,
    assumedCadence,
    primaryMetric,
    smartDefaultsReasoning: `Calibrated for sustainable progress across ${durationWeeks} weeks with actionable daily and weekly checkpoints.`,
    milestones: [
      {
        title: 'Foundation & Baseline Setup',
        description: 'Establish initial cadence, gather tools, and log first benchmark.',
        targetWeek: Math.max(1, Math.round(durationWeeks * 0.25)),
        weight: 20,
        actionTasks: [
          'Set up dedicated workspace and tools for the goal',
          'Complete initial baseline benchmark session',
          'Block 30-minute recurring sessions on calendar for the week'
        ]
      },
      {
        title: 'Core Momentum & Skill Building',
        description: 'Consistent execution through intermediate hurdles and steady progress.',
        targetWeek: Math.max(2, Math.round(durationWeeks * 0.5)),
        weight: 30,
        actionTasks: [
          'Complete 3 scheduled training/work sessions without missing a day',
          'Review progress notes and optimize weak points',
          'Connect with peer or mentor for constructive feedback'
        ]
      },
      {
        title: 'Intensity Push & Advanced Checkpoint',
        description: 'Ramp up volume, test capabilities, and clear major barriers.',
        targetWeek: Math.max(3, Math.round(durationWeeks * 0.75)),
        weight: 30,
        actionTasks: [
          'Execute high-intensity breakthrough session testing max limits',
          'Document key lessons and adjust tactical approach',
          'Take dedicated rest/recovery day to prevent burnout'
        ]
      },
      {
        title: 'Final Stretch & Goal Achievement',
        description: 'Execute final push and validate complete goal criteria.',
        targetWeek: durationWeeks,
        weight: 20,
        actionTasks: [
          'Complete final milestone evaluation and verify all completion criteria',
          'Conduct comprehensive retrospective review',
          'Celebrate achievement and set next higher-level benchmark'
        ]
      }
    ],
    quickCheckInOptions: [
      'Completed 45m focused session',
      'Hit weekly benchmark target early',
      'Overcame friction & logged steady effort',
      'Light review & recovery maintenance',
      'Shipped breakthrough task item'
    ]
  };
}

function calculateFallbackCheckIn(goal: any, update: string, effortLevel: string = 'moderate') {
  let delta = 6;
  if (effortLevel === 'breakthrough') delta = 14;
  else if (effortLevel === 'high') delta = 10;
  else if (effortLevel === 'light') delta = 3;
  else if (effortLevel === 'rest_recovery') delta = 2;

  const currentProgress = goal.progress || 0;
  const newProgress = Math.min(100, currentProgress + delta);

  // Update milestones status based on progress thresholds
  const totalMilestones = goal.milestones.length || 1;
  const updatedMilestones = goal.milestones.map((m: any, idx: number) => {
    const milestoneThreshold = ((idx + 1) / totalMilestones) * 90;
    let status = m.status;
    let shiftedNote = m.shiftedNote;

    if (newProgress >= milestoneThreshold) {
      status = 'completed';
      shiftedNote = 'Completed milestone ahead of initial schedule';
    } else if (status === 'completed') {
      status = 'completed';
    } else if (newProgress >= milestoneThreshold - (100 / totalMilestones)) {
      status = 'in_progress';
      shiftedNote = 'Active focus milestone: pace trending steadily';
    } else {
      status = 'pending';
    }
    return {
      id: m.id,
      title: m.title,
      status,
      shiftedNote
    };
  });

  return {
    newProgress,
    progressDelta: delta,
    aiFeedback: `Great check-in! Consistent logging keeps your momentum alive. Your effort on "${update.slice(0, 45)}" pushed your goal progress forward by +${delta}%.`,
    milestonesShiftSummary: `Paced remaining milestones forward to reflect your active check-in cadence.`,
    nextActionSuggestion: `Keep the momentum: schedule your next small check-in session for tomorrow.`,
    updatedMilestones,
    freshQuickOptions: [
      'Completed scheduled follow-up session',
      'Maintained consistent 30m work block',
      'Handled recovery & planned next sprint',
      'Pushed through key milestone deliverable'
    ]
  };
}

// Serve Vite in development or static dist in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
