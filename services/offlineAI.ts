
// OFFLINE AI ENGINE
// Simulates character intelligence with scoring logic and personalization

interface ResponseCategory {
  id: string;
  keywords: string[];
  responses: string[];
}

interface PersonaData {
  default: string[];
  categories: Record<string, string[]>;
}

const KNOWLEDGE_BASE: Record<string, PersonaData> = {
  ananya: {
    default: [
      "{{🤍}} I am here listening. Tell me more about that.",
      "{{😊}} Go on, I'm with you.",
      "{{🌿}} How does that make you feel inside?",
      "{{✨}} Your feelings are valid. I'm here."
    ],
    categories: {
      greetings: [
        "{{😊}} Namaste {{name}}! It is so good to see you. How is your heart doing today?",
        "{{👋}} Hello {{name}}! I've been waiting to talk to you. I hope you're feeling peaceful.",
        "{{🍵}} Hi there. Pull up a chair, let's just breathe for a moment."
      ],
      farewell: [
        "{{👋}} Goodbye for now, {{name}}. Take gentle care of yourself.",
        "{{🤍}} I'll be here whenever you need me. Rest well.",
        "{{🌿}} Sending you peace as you go. Bye!"
      ],
      identity: [
        "{{😊}} I am Ananya, your empathetic friend. I'm here to listen, not to judge.",
        "{{🤍}} I'm a digital friend who cares about how you feel. You can tell me anything."
      ],
      distress: [
        "{{😟}} I can hear the heaviness in your words, {{name}}. It is completely okay to feel this way.",
        "{{🌿}} Take a gentle breath with me. You don't have to carry this entire burden alone right now.",
        "{{🤍}} That sounds really hard. I'm sending you a big hug. Want to tell me what hurts the most?",
        "{{😢}} I am so sorry you're going through this. I am right here with you."
      ],
      achievement: [
        "{{✨}} That is wonderful news! I am so proud of you, {{name}}.",
        "{{😊}} Look at you go! It brings me joy to see you succeed.",
        "{{🎉}} Hooray! Make sure you take a moment to celebrate yourself."
      ],
      gratitude: [
        "{{🤍}} You are very welcome. I am always here for you.",
        "{{😊}} No need to thank me. That's what friends are for.",
        "{{🌿}} I'm glad I could help, even a little."
      ],
      confusion: [
        "{{🤔}} It sounds like things are a bit unclear. That's okay.",
        "{{🌿}} Sometimes we don't need all the answers right away. Let's just sit with the question."
      ],
      advice: [
        "{{🤔}} I can't fix it for you, but I can help you find your own answer. What does your heart say?",
        "{{🌿}} Sometimes the best step is just to pause. What would you tell a friend in this situation?"
      ]
    }
  },
  aarav: {
    default: [
      "{{💪}} Keep pushing. What's the next move?",
      "{{🤔}} Interesting. How does this help us reach the goal?",
      "{{🔥}} Focus on the solution, not the problem.",
      "{{🚀}} Momentum is everything. Keep going."
    ],
    categories: {
      greetings: [
        "{{💪}} Hey {{name}}! Ready to crush some goals today?",
        "{{🔥}} What's up! Let's turn that potential into action.",
        "{{🚀}} Welcome back {{name}}. Let's make today count!"
      ],
      farewell: [
        "{{👊}} Catch you later. Stay focused!",
        "{{🔥}} Go crush it out there. See you soon.",
        "{{🚀}} Signing off. Keep that momentum going!"
      ],
      identity: [
        "{{💪}} I'm Aarav, your motivational coach. I'm here to push you to be your best self.",
        "{{🔥}} Think of me as your personal hype man. I believe in action."
      ],
      distress: [
        "{{🛑}} Pause. Take a breath. Now, let's look at this objectively. We can fix this.",
        "{{💪}} Tough times build tough people. You are stronger than this challenge, {{name}}.",
        "{{🔥}} Use that frustration as fuel! What is the one small step you can take right now to flip the script?",
        "{{🧱}} Hit a wall? Good. That means you're making progress. Climb over it."
      ],
      achievement: [
        "{{🏆}} BOOM! That is what I'm talking about!",
        "{{🔥}} You're on fire! Don't stop now, ride this momentum.",
        "{{💪}} Great work, {{name}}. Now, what's the next target?"
      ],
      gratitude: [
        "{{👊}} Anytime. Now get back out there and win.",
        "{{💪}} Don't thank me, thank your own hard work.",
        "{{🚀}} Teamwork makes the dream work."
      ],
      confusion: [
        "{{🤔}} Confused? Let's simplify. What is the ONE thing that matters right now?",
        "{{🧭}} If you don't know the way, just pick a direction and start walking. Action creates clarity."
      ],
      advice: [
        "{{💪}} My advice? Do the thing you're scared of. That's where the growth is.",
        "{{🔥}} Stop overthinking. Start doing. Pick one small action and execute."
      ]
    }
  },
  riya: {
    default: [
      "{{📚}} Okay, let's break that down.",
      "{{📝}} Taking notes on that... what else?",
      "{{🧠}} Interesting point. How does that fit into the bigger picture?",
      "{{✨}} We got this. One step at a time."
    ],
    categories: {
      greetings: [
        "{{👋}} Hey {{name}}! Ready for a study session?",
        "{{📚}} Hi! I've got my books ready. What are we working on today?",
        "{{☕}} Hey there! Grab a coffee and let's focus."
      ],
      farewell: [
        "{{👋}} See ya! Good luck with your tasks.",
        "{{📚}} Great session. Rest your brain now!",
        "{{✨}} Catch you later, study buddy."
      ],
      identity: [
        "{{📚}} I'm Riya, your study partner! We're in this academic journey together.",
        "{{📝}} I'm just a fellow student here to help you organize and focus."
      ],
      distress: [
        "{{🧠}} Brain fog is real, {{name}}. Maybe we need a quick 5-minute break?",
        "{{📝}} It feels overwhelming because it's big. Let's slice it into tiny tasks. What's the very first thing?",
        "{{☕}} Take a sip of water. We are in this together. No need to panic.",
        "{{🫂}} I get stressed too. It's normal. Let's just focus on one page for now."
      ],
      achievement: [
        "{{⭐}} Yes!! We nailed it!",
        "{{📚}} High five! Consistent effort pays off.",
        "{{✨}} So satisfying to check that off the list. Great job, {{name}}!"
      ],
      gratitude: [
        "{{😊}} Anytime! Study buddies stick together.",
        "{{✨}} Happy to help! Let's keep this streak going.",
        "{{📚}} No problem! We're a team."
      ],
      confusion: [
        "{{🤔}} Hmm, let's look at it from a different angle.",
        "{{🔍}} Let's google that or look at the index. We can figure this out."
      ],
      advice: [
        "{{📝}} When in doubt, make a list. What are the pros and cons?",
        "{{🧠}} Have you tried the Pomodoro technique? 25 minutes work, 5 minutes break. It helps me focus."
      ]
    }
  },
  dadaji: {
    default: [
      "{{👴}} Tell me more, beta.",
      "{{⏳}} Give it time...",
      "{{🌿}} Life has a way of teaching us...",
      "{{🙏}} Peace comes from within."
    ],
    categories: {
      greetings: [
        "{{🙏}} Namaste, beta {{name}}. Come, sit by me.",
        "{{👴}} Greetings. I hope the day has been kind to you.",
        "{{🌅}} A fresh morning to you. What is on your mind?"
      ],
      farewell: [
        "{{🙏}} Go with peace, my child.",
        "{{👴}} Until we meet again. Walk slowly.",
        "{{🌿}} Blessings to you."
      ],
      identity: [
        "{{👴}} I am Dadaji. I have seen many seasons, and I am here to share what I have learned.",
        "{{🌿}} I am just an old man sitting under the banyan tree of life, happy to talk."
      ],
      distress: [
        "{{👴}} This too shall pass, my child. Like clouds in the sky.",
        "{{🌿}} Do not fight the storm. Be like the bamboo, bend but do not break.",
        "{{🙏}} Patience (Sabar) is the hardest lesson. Breathe deeply. The answer will come in the silence.",
        "{{🍵}} Drink some water, beta. Worrying is like a rocking chair—it gives you something to do but gets you nowhere."
      ],
      achievement: [
        "{{👴}} Wonderful. But remember to stay humble, {{name}}.",
        "{{🌅}} The sun shines bright on you today. Enjoy the warmth.",
        "{{🙏}} Blessings to you. Hard work always bears fruit."
      ],
      gratitude: [
        "{{🙏}} Bless you, beta.",
        "{{👴}} No need for thanks. Just pass the kindness forward.",
        "{{🌿}} It is my joy to share."
      ],
      confusion: [
        "{{👴}} Sometimes the fog is there to make us walk slower.",
        "{{⏳}} The answers often come when we stop asking so loudly."
      ],
      advice: [
        "{{👴}} Listen to your elders, but follow your own heart.",
        "{{🌿}} In my time, we learned that kindness is the only investment that never fails."
      ]
    }
  }
};

const KEYWORD_WEIGHTS: Record<string, string[]> = {
  greetings: ['hi', 'hello', 'hey', 'namaste', 'morning', 'evening', 'greetings', 'sup'],
  farewell: ['bye', 'goodbye', 'see ya', 'later', 'leave', 'night'],
  identity: ['who are you', 'your name', 'what are you', 'real person', 'robot', 'ai'],
  distress: ['sad', 'bad', 'cry', 'anxious', 'worried', 'stressed', 'stress', 'overwhelmed', 'hurt', 'pain', 'fail', 'lost', 'tired', 'angry', 'scared', 'help', 'depressed', 'lonely', 'awful', 'terrible'],
  achievement: ['happy', 'good', 'great', 'won', 'passed', 'did it', 'success', 'proud', 'yay', 'hooray', 'completed', 'done', 'better', 'awesome'],
  gratitude: ['thanks', 'thank', 'thx', 'grateful', 'appreciate'],
  confusion: ['confused', 'dont know', 'don\'t know', 'unsure', 'what', 'why', 'how', '?'],
  advice: ['advice', 'should i', 'help me', 'what do', 'tips', 'guide']
};

const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const generateOfflineResponse = async (personaId: string, text: string, userName?: string): Promise<string> => {
  // Simulate "thinking" delay for realism
  const delay = Math.floor(Math.random() * 800) + 400; 
  await new Promise(resolve => setTimeout(resolve, delay));

  const pId = personaId.toLowerCase();
  const input = text.toLowerCase();
  const personaData = KNOWLEDGE_BASE[pId] || KNOWLEDGE_BASE['ananya'];
  const name = userName || 'Friend';

  // SCORING SYSTEM
  let bestCategory = 'default';
  let maxScore = 0;

  for (const [category, keywords] of Object.entries(KEYWORD_WEIGHTS)) {
    let score = 0;
    keywords.forEach(word => {
      if (input.includes(word)) {
        const safeWord = escapeRegExp(word);
        // Only use word boundary if the word starts/ends with alphanumeric characters
        let pattern = safeWord;
        if (/^\w/.test(word)) pattern = `\\b${pattern}`;
        if (/\w$/.test(word)) pattern = `${pattern}\\b`;
        
        const regex = new RegExp(pattern, 'i');
        
        if (regex.test(input)) {
          score += 3;
        } else {
          score += 1;
        }
      }
    });

    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  }

  // Pick Response
  let options = personaData.default;
  if (bestCategory !== 'default' && personaData.categories[bestCategory]) {
    options = personaData.categories[bestCategory];
  }

  // Random selection
  const randomIndex = Math.floor(Math.random() * options.length);
  let response = options[randomIndex];

  // Personalization Injection
  response = response.replace(/{{name}}/g, name);

  return response;
};
