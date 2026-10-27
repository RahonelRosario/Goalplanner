import { PresetGoal, Goal } from '../types/goal';

export const PRESET_GOALS: PresetGoal[] = [
  {
    title: 'Learn conversational Spanish (CEFR A2)',
    category: 'learning',
    icon: 'Languages',
    color: 'amber',
    durationWeeks: 12,
    assumedCadence: '25 mins daily immersion & speaking drills',
    primaryMetric: 'Vocabulary count & 15-min speaking fluidity',
    smartDefaultsReasoning: 'Standard 12-week accelerated conversational framework focusing on the top 1,000 high-frequency words, present/past tenses, and live speech practice.',
    quickCheckInOptions: [
      'Completed 30m flashcard drill (50 new words)',
      '15-min live speech tutor exchange',
      'Watched a movie / episode in Spanish with subtitles',
      'Listened to 1 Spanish podcast episode',
      'Wrote daily journal in Spanish (100 words)',
      'Mastered past tense (Pretérito indefinido)'
    ],
    milestones: [
      {
        title: 'Core 300 Words & Pronunciation Rules',
        description: 'Master everyday pronouns, basic verbs (ser, estar, tener, ir), and essential phonetics.',
        targetWeek: 3,
        weight: 20,
        status: 'in_progress',
        actionTasks: [
          'Practice 20 minutes with Spanish flashcards (first 50 high-frequency words)',
          'Watch 1 Spanish pronunciation video guide on vowel sounds & the rolled "r"',
          'Label 15 household items in Spanish with sticky notes (la mesa, la cocina, etc.)',
          'Conjugate the 4 primary verbs (ser, estar, tener, ir) in present tense and speak 5 sentences'
        ]
      },
      {
        title: 'Everyday Situational Dialogue',
        description: 'Order food, ask directions, introduce yourself, and handle shopping exchanges.',
        targetWeek: 6,
        weight: 25,
        status: 'pending',
        actionTasks: [
          'Order food or coffee in Spanish at a local restaurant or market',
          'Listen to 2 beginner podcast episodes of Coffee Break Spanish or Notes in Spanish',
          'Record a 1-minute voice note introducing your family, job, and hobbies in Spanish',
          'Roleplay asking for street directions and train ticket prices out loud'
        ]
      },
      {
        title: 'Past and Future Tense Mastery',
        description: 'Tell stories about yesterday and describe plans for tomorrow with confidence.',
        targetWeek: 9,
        weight: 25,
        status: 'pending',
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
        targetWeek: 12,
        weight: 30,
        status: 'pending',
        actionTasks: [
          'Watch a full movie in Spanish with Spanish subtitles (e.g. Roma, Coco, or Pan\'s Labyrinth)',
          'Complete a 15-minute 1-on-1 live voice exchange with a native speaker on iTalki or HelloTalk',
          'Listen to an episode of Radio Ambulante podcast or news in slow Spanish without English subtitles',
          'Deliver a 3-minute impromptu speech in Spanish explaining your goals and routine',
          'Shadow a native Spanish monologue for 10 minutes to refine natural cadence and accent'
        ]
      }
    ]
  },
  {
    title: 'Run my first 10k race',
    category: 'fitness',
    icon: 'Flame',
    color: 'emerald',
    durationWeeks: 8,
    assumedCadence: '3 runs per week (2 easy, 1 long)',
    primaryMetric: 'Kilometers run & average pace',
    smartDefaultsReasoning: 'Standard 8-week aerobic progression that steadily builds mileage from 3km to 10km without risking shin splints or fatigue.',
    quickCheckInOptions: [
      'Completed 4km easy pace run',
      'Did 30-min interval sprint intervals',
      'Crushed Sunday long run (7km)',
      '30 min leg mobility & foam rolling recovery',
      'Ran 5km tempo run at target race pace'
    ],
    milestones: [
      {
        title: 'Aerobic Base (3km continuous run)',
        description: 'Complete 3km running without stopping or walk breaks at conversational pace.',
        targetWeek: 2,
        weight: 15,
        status: 'in_progress',
        actionTasks: [
          'Complete a 2.5km run/walk interval workout (run 3 mins, walk 1 min)',
          'Execute a continuous 3km jog with conversational nasal breathing',
          'Do a 20-minute post-run hip flexor and calf mobility routine',
          'Get fitted for proper running shoes and arch support'
        ]
      },
      {
        title: '5km Benchmark Milestone',
        description: 'Run 5 kilometers comfortably under 32 minutes.',
        targetWeek: 4,
        weight: 25,
        status: 'pending',
        actionTasks: [
          'Run a 4km mid-week tempo run at sustained target pace',
          'Complete 6x400m speed intervals on a track or flat path',
          'Hydrate with electrolytes and log 8 hours of sleep before long run',
          'Log official 5km benchmark run with GPS tracking'
        ]
      },
      {
        title: '7.5km Distance Push',
        description: 'First long run bridging into double-digit endurance territory.',
        targetWeek: 6,
        weight: 25,
        status: 'pending',
        actionTasks: [
          'Plan and map out a 7.5km scenic route with minimal street crossings',
          'Practice mid-run hydration and fuel testing with energy chews',
          'Perform a 30-minute glute and core strength stability circuit',
          'Complete Sunday 7.5km endurance run at an easy conversational effort'
        ]
      },
      {
        title: 'Race Pace Simulation (8km)',
        description: 'Sustain target 10k race pace for 8km with controlled breathing.',
        targetWeek: 7,
        weight: 20,
        status: 'pending',
        actionTasks: [
          'Warm up with 10 mins dynamic lunges, leg swings, and high knees',
          'Lock in target race pace for 8km split evenly across each kilometer',
          'Cold soak or contrast shower for active muscular recovery',
          'Review race day logistics, bib, and pacing strategy'
        ]
      },
      {
        title: '10K Race Day Finish',
        description: 'Cross the finish line of the 10,000-meter run with gas in the tank.',
        targetWeek: 8,
        weight: 15,
        status: 'pending',
        actionTasks: [
          'Taper week: 2 short 3km light shakeout jogs with strides',
          'Carb-conscious dinner and prep race outfit and gear the night before',
          'Arrive at starting line 45 minutes early for warm-up and mental focus',
          'Cross the 10km finish line, collect medal, and celebrate the milestone'
        ]
      }
    ]
  },
  {
    title: 'Launch SaaS MVP with 5 paying users',
    category: 'career',
    icon: 'Rocket',
    color: 'indigo',
    durationWeeks: 6,
    assumedCadence: '15-20 hours / week focused sprints',
    primaryMetric: 'Shipped features & user conversions',
    smartDefaultsReasoning: 'Lean startup methodology default: compresses development to 3 core weeks, followed by immediate outreach and closed beta validation.',
    quickCheckInOptions: [
      'Built core auth & database schema',
      'Implemented primary user workflow & UI',
      'Connected Stripe payments checkout',
      'Conducted 3 user discovery interviews',
      'Posted demo video on X / LinkedIn'
    ],
    milestones: [
      {
        title: 'Core Value Loop & Wireframe Spec',
        description: 'Define single killer feature and clickable wireframe mockup.',
        targetWeek: 1,
        weight: 15,
        status: 'in_progress',
        actionTasks: [
          'Draft a 1-page PRD defining the single core user problem solved',
          'Sketch wireframes for the 3 primary screens (Landing, App, Billing)',
          'Interview 3 prospective users about their current manual workflow',
          'Initialize Git repository and setup Tailwind/React project scaffolding'
        ]
      },
      {
        title: 'Working Functional Prototype',
        description: 'Frontend connected to backend with database persistence and primary action working.',
        targetWeek: 3,
        weight: 30,
        status: 'pending',
        actionTasks: [
          'Create database tables and ORM models for user data and entities',
          'Build primary dashboard action workflow and test with mock data',
          'Deploy staging environment to Vercel or Cloud Run with automated CI/CD',
          'Conduct end-to-end user flow test verifying zero fatal errors'
        ]
      },
      {
        title: 'Stripe Billing & Auth Integration',
        description: 'Secure authentication, user onboarding modal, and paid checkout tiers.',
        targetWeek: 4,
        weight: 20,
        status: 'pending',
        actionTasks: [
          'Configure Stripe Customer Portal and subscription pricing plans ($29/mo)',
          'Implement webhook listener for checkout.session.completed',
          'Add email magic link or Google OAuth authentication',
          'Perform live $1 real-card checkout verification'
        ]
      },
      {
        title: 'Beta Launch to 25 Waitlist Users',
        description: 'Deploy production instance, onboard first batch of beta testers, gather bug logs.',
        targetWeek: 5,
        weight: 20,
        status: 'pending',
        actionTasks: [
          'Send personalized invite emails with demo link to 25 waitlist signups',
          'Record a 90-second product demo video and post to Twitter/LinkedIn',
          'Add user analytics or feedback widget to capture drop-off friction',
          'Fix top 3 reported usability snags within 24 hours'
        ]
      },
      {
        title: '5 Paid Customer Conversions',
        description: 'Validate product-market fit signal with 5 paying subscription customers.',
        targetWeek: 6,
        weight: 15,
        status: 'pending',
        actionTasks: [
          'Schedule 15-minute onboarding walkthroughs with 10 active trial users',
          'Offer founder discount or annual prepayment incentive',
          'Secure 5th verified paying customer invoice',
          'Document customer testimonials and case studies for marketing site'
        ]
      }
    ]
  },
  {
    title: 'Save $5,000 emergency fund',
    category: 'finance',
    icon: 'PiggyBank',
    color: 'sky',
    durationWeeks: 16,
    assumedCadence: 'Weekly automated savings & bi-weekly budget check',
    primaryMetric: 'Dollars saved ($312.50 / week average)',
    smartDefaultsReasoning: '4-month realistic savings plan calibrated to automate transfers, trim subscription leakages, and build a resilient buffer.',
    quickCheckInOptions: [
      'Auto-transferred $150 to high-yield savings',
      'Cut 2 unused monthly recurring subscriptions',
      'Cooked all meals at home this week (saved ~$80)',
      'Sold unused gear online (+$120 to fund)',
      'Conducted weekly spending category audit'
    ],
    milestones: [
      {
        title: 'First $1,000 Safety Cushion',
        description: 'Initial hurdle: secure $1,000 into a high-yield savings account.',
        targetWeek: 3,
        weight: 20,
        status: 'in_progress',
        actionTasks: [
          'Open high-yield savings account (HYSA) earning >4% APY',
          'Audit bank statements from last 60 days to identify subscription leaks',
          'Automate recurring $150 transfer every payday',
          'Reach official $1,000 emergency milestone balance'
        ]
      },
      {
        title: 'Halfway Mark: $2,500',
        description: 'Consistent habit locked in; covers unexpected car or dental emergencies.',
        targetWeek: 8,
        weight: 30,
        status: 'pending',
        actionTasks: [
          'List 3 unused electronics or sports equipment on Facebook Marketplace',
          'Cook all weekday lunches and dinners at home for 2 consecutive weeks',
          'Negotiate internet or car insurance rate for annual savings',
          'Deposit additional earnings directly to push balance to $2,500'
        ]
      },
      {
        title: 'Home Stretch: $4,000',
        description: 'One full month of essential living expenses completely covered.',
        targetWeek: 13,
        weight: 30,
        status: 'pending',
        actionTasks: [
          'Implement a 48-hour pause rule before any non-essential purchase >$50',
          'Transfer tax refund or work bonus straight into emergency fund',
          'Conduct bi-weekly budget check-in against target projection',
          'Cross $4,000 milestone threshold'
        ]
      },
      {
        title: 'Target Reached: $5,000 Complete',
        description: 'Full $5,000 liquid emergency reserve locked and automated.',
        targetWeek: 16,
        weight: 20,
        status: 'pending',
        actionTasks: [
          'Transfer final deposit to hit exactly $5,000 balance',
          'Lock HYSA alerts to prevent non-emergency withdrawals',
          'Celebrate the achievement with a budget-friendly dinner',
          'Establish next financial tier (e.g. index fund investing)'
        ]
      }
    ]
  },
  {
    title: 'Read 12 non-fiction books this year',
    category: 'learning',
    icon: 'BookOpen',
    color: 'rose',
    durationWeeks: 12,
    assumedCadence: '20 pages / day (approx. 35 mins)',
    primaryMetric: 'Books completed & key chapter insights logged',
    smartDefaultsReasoning: 'Consistent pacing of 1 book every 3-4 weeks. Pacing based on typical 250-page books at standard reading speed.',
    quickCheckInOptions: [
      'Read 25 pages during morning coffee',
      'Finished Chapter 4 & highlighted key takeaways',
      'Completed full book #1 and wrote 3 takeaways',
      'Listened to 45 mins audiobook while commuting',
      'Read 40 pages uninterrupted evening session'
    ],
    milestones: [
      {
        title: 'Finish Book 1 & Establish Daily Reading Routine',
        description: 'Anchor reading 20-30 mins before bed or morning routinely.',
        targetWeek: 3,
        weight: 25,
        status: 'in_progress',
        actionTasks: [
          'Select and purchase first 3 curated books on your reading list',
          'Set a daily reminder for 25 minutes reading time without phone screens',
          'Highlight 3 profound passages in chapter 1-3',
          'Finish reading Book 1 and write a 3-bullet takeaway summary'
        ]
      },
      {
        title: 'Quarterly Milestone (3 Books Complete)',
        description: 'Maintain steady completion velocity across diverse topics.',
        targetWeek: 6,
        weight: 25,
        status: 'pending',
        actionTasks: [
          'Read 20 pages daily consistently for 14 straight days',
          'Listen to audiobook version while commuting or exercising',
          'Share favorite book quote or recommendation with a friend',
          'Complete Book 2 and Book 3 review notes'
        ]
      },
      {
        title: 'Halfway Checkpoint (6 Books Complete)',
        description: 'Synthesize overarching ideas into personal action notes.',
        targetWeek: 9,
        weight: 25,
        status: 'pending',
        actionTasks: [
          'Tackle a dense 350+ page volume with timed reading sprints',
          'Create a digital notes page compiling favorite frameworks from books 1-5',
          'Implement 1 actionable habit learned directly from a book',
          'Complete 6th book milestone'
        ]
      },
      {
        title: 'Double Digit Milestone (10 Books Complete)',
        description: 'Accelerate through high-impact reads in final stretch.',
        targetWeek: 12,
        weight: 25,
        status: 'pending',
        actionTasks: [
          'Host a mini discussion with peers on key themes',
          'Complete final stretch reads with weekend 40-page deep sessions',
          'Archive key insights into personal second brain notes system',
          'Hit 10+ books milestone mark'
        ]
      }
    ]
  },
  {
    title: 'Deadlift 300 lbs with clean form',
    category: 'fitness',
    icon: 'Dumbbell',
    color: 'purple',
    durationWeeks: 10,
    assumedCadence: '2-3 heavy pull sessions per week',
    primaryMetric: 'Working weight (lbs) & rep quality',
    smartDefaultsReasoning: 'Linear progressive overload cycle with deload week 5 to protect CNS and lower back while steadily ramping bar weight.',
    quickCheckInOptions: [
      'Completed 5x5 working sets at current baseline',
      'Form check recorded on video (neutral spine)',
      'Hit new 3-rep max with clean bar speed',
      'Dedicated posterior chain accessories (RDLs & glute bridges)',
      'Full rest & high protein nutrition day'
    ],
    milestones: [
      {
        title: 'Form Mastery & 225 lbs 5x5 Base',
        description: 'Lock in hinge pattern, brace, and bar path with 2 plates.',
        targetWeek: 3,
        weight: 25,
        status: 'in_progress',
        actionTasks: [
          'Record side-angle video of deadlift warmup sets to check lumbar neutrality',
          'Practice 360-degree Valsalva breathing brace with a lifting belt',
          'Perform 3 sets of 8 Romanian Deadlifts (RDLs) for hamstring hypertrophy',
          'Complete 5x5 working sets at 225 lbs with zero bar bounce'
        ]
      },
      {
        title: '250 lbs Solid Working Reps',
        description: 'Progressive overload without breakdown of spine position.',
        targetWeek: 5,
        weight: 25,
        status: 'pending',
        actionTasks: [
          'Train hook grip or chalk grip technique on heavy triples',
          'Incorporate heavy barbell hip thrusts and heavy farmer walks',
          'Hit 250 lbs for 3 clean, crisp reps with fast lockout speed',
          'Deload session: 50% intensity active recovery mobility'
        ]
      },
      {
        title: '275 lbs Heavy Single & Deload Week',
        description: 'Test top-end neural drive and allow connective tissue reset.',
        targetWeek: 8,
        weight: 25,
        status: 'pending',
        actionTasks: [
          'Warm up up to 260 lbs with controlled speed',
          'Pull 275 lbs heavy single with solid leg drive off the floor',
          'Foam roll lats, glutes, and perform 90/90 hip stretches',
          'Sleep 8.5 hours and ingest 1g protein per pound of bodyweight'
        ]
      },
      {
        title: 'The 300 lbs Lift',
        description: 'Execute a clean, lockout deadlift at 300 lbs with proper control.',
        targetWeek: 10,
        weight: 25,
        status: 'pending',
        actionTasks: [
          '3-day complete rest and high carbohydrate fueling prep',
          'Pre-lift checklist: chalk up, belt tight, bar over midfoot, lats engaged',
          'Execute the 300 lbs pull to full upright lockout with controlled descent',
          'Record the official PR lift and celebrate the strength milestone'
        ]
      }
    ]
  }
];

export function instantiateGoalFromPreset(preset: PresetGoal, customWeeks?: number): Goal {
  const durationWeeks = customWeeks && customWeeks > 0 ? customWeeks : preset.durationWeeks;
  const now = new Date();
  const targetDateObj = new Date(now.getTime() + durationWeeks * 7 * 24 * 60 * 60 * 1000);
  
  const milestones = preset.milestones.map((m, idx) => {
    // scale target week if customWeeks differs from preset
    const scaledWeek = Math.max(1, Math.round((m.targetWeek / preset.durationWeeks) * durationWeeks));
    const milestoneDate = new Date(now.getTime() + scaledWeek * 7 * 24 * 60 * 60 * 1000);

    const actionTasks = (m.actionTasks || []).map((t, tIdx) => ({
      id: 'task_' + Math.random().toString(36).substring(2, 9) + '_' + tIdx,
      text: t,
      completed: false
    }));

    return {
      id: 'm_' + Math.random().toString(36).substring(2, 9),
      title: m.title,
      description: m.description,
      targetWeek: scaledWeek,
      targetDate: milestoneDate.toISOString().split('T')[0],
      weight: m.weight,
      status: idx === 0 ? 'in_progress' : 'pending',
      actionTasks
    } as const;
  });

  return {
    id: 'goal_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
    title: preset.title,
    category: preset.category,
    icon: preset.icon,
    color: preset.color,
    createdAt: now.toISOString(),
    targetDate: targetDateObj.toISOString().split('T')[0],
    durationWeeks,
    assumedCadence: preset.assumedCadence,
    primaryMetric: preset.primaryMetric,
    smartDefaultsReasoning: preset.smartDefaultsReasoning,
    progress: 0,
    status: 'active',
    milestones,
    checkIns: [],
    quickCheckInOptions: preset.quickCheckInOptions,
    streak: 0
  };
}
