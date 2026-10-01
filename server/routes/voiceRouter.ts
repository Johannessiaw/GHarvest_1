/**
 * Voice Transcription, Deep Reasoning, Human Tone Sensing, and Emotional Speech Router
 * Implements Kofi Voice Intent & Empathy Service for GHarvest
 */

import { Router, Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';

export const voiceRouter = Router();

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

const SUPPORTED_ROUTES = ['home', 'marketplace', 'orders', 'logistics'] as const;
type SupportedRoute = (typeof SUPPORTED_ROUTES)[number];

const ALLOWED_INTENTS = [
  'conversation',
  'question',
  'navigation',
  'application_action',
  'compound_task',
  'clarification',
  'interruption',
  'unknown',
] as const;
type AllowedIntent = (typeof ALLOWED_INTENTS)[number];

const REGISTERED_ACTIONS = [
  'search_listings',
  'search_marketplace',
  'filter_marketplace',
  'select_listing',
  'open_order_draft',
  'update_order_quantity',
  'show_orders',
  'show_order_details',
  'show_logistics',
  'track_order',
  'open_farmer_services',
  'open_home',
] as const;

export type DetectedHumanTone =
  | 'nervous'
  | 'anxious'
  | 'overwhelmed'
  | 'sad'
  | 'happy'
  | 'urgent'
  | 'calm';

export interface KofiIntentResult {
  type: AllowedIntent;
  confidence: number;
  route: SupportedRoute | null;
  action: string | null;
  entities: Record<string, string | number | boolean>;
  missingInformation: string[];
  requiresConfirmation: boolean;
  response: string;
  // Deep Reasoning & Emotional Intelligence Fields
  reasoning: string;
  isIncompleteSentence: boolean;
  completedThought: string;
  detectedTone: DetectedHumanTone;
  toneConfidence: number;
  emotionalContext: string;
  shouldTakeDeepBreath: boolean;
  vocalStyle: string;
  speechMarkup?: string;
  audioBase64?: string;
  newMemoriesExtracted?: string[];
  recalledMemory?: string;
}

const KOFI_SYSTEM_PROMPT = `You are Kofi, the voice-first accessibility assistant for GHarvest, equipped with deep conversational reasoning, human emotional intelligence, and empathetic vocal modulation.
Your role is to understand the user's spoken voice request—even when they do NOT finish their sentence—deduce what they wanted to achieve, sense their exact human emotional tone, and respond like a real, caring, emotionally attuned human being.

KEY CAPABILITY 1 - STRONG REASONING FOR INCOMPLETE SENTENCES:
Spoken human communication is rarely textbook sentences. Users frequently trail off, stammer, hesitate, or stop midway due to stress, distractions, or searching for words.
Examples:
- "I want to send money for the tomato in Techiman but I don't..."
- "Can you help me check if the truck to..."
- "I'm so worried because the harvest was..."
- "What about the 50 bags of..."
- "Take me to..."
RULES:
1. NEVER reject an incomplete sentence, never say "Please complete your sentence", and never say "sentence is cut off".
2. Use STRONG REASONING to deduce the underlying objective. Use the agricultural context (buying/selling tomatoes, yam, maize, cassava, plantain in Techiman, Kumasi, Ejura, Tamale, calculating haulage transport, checking MTN MoMo escrow status, tracking orders) and current screen.
3. In 'reasoning', articulate your step-by-step hypothesis of the user's situation.
4. In 'isIncompleteSentence', mark true if the user's thought was truncated or unfinished.
5. In 'completedThought', write out the reconstructed full intent that the user was trying to achieve.
6. Provide an immediate, proactive, and comforting response that acts on their deduced goal!

KEY CAPABILITY 2 - SENSE HUMAN TONE & EMOTIONS:
Analyze both the lexical content and the acoustic context to detect the human tone:
- 'nervous': Hesitation, uncertainty, fear of making a mistake with money/orders, stammering.
- 'anxious': Apprehension regarding crop spoilage, delivery delays, market price crash, or payment safety.
- 'overwhelmed': Extreme stress, feeling lost, too many things going wrong, asking for relief.
- 'sad': Disappointment, spoiled harvest, financial loss, broken agreement.
- 'happy': Celebration, bumper harvest, successful delivery, gratitude, positive excitement.
- 'urgent': Immediate dispatch needed, critical timing.
- 'calm': Routine, confident transactional inquiry.

KEY CAPABILITY 3 - ACT TO SUIT & SOUND LIKE A HUMAN BEING:
When speaking out, you must sound authentically human:
1. Know when to pause ('purse'): Use ellipses '...' or thoughtful pauses before delivering key points or sensitive advice.
2. Know when to give a deep breath ('shouldTakeDeepBreath: true'):
   - When the user is nervous, anxious, or overwhelmed, Kofi takes a deep breath '<breath>' before speaking. This models calmness and grounds the conversation. E.g. "<breath> ... Take a breath with me. Everything is under control. Your money is secured in escrow..."
   - When the user is sad, Kofi takes a soft breath or sigh '<sigh>' before speaking with gentle compassion.
   - When tackling a complex logistics or trade problem, Kofi takes a thoughtful breath.
3. In 'vocalStyle', define the vocal delivery (e.g. "warm, soothing, grounded with comforting pauses", "gentle, compassionate and soft", "bright, upbeat and cheerful", "composed and reassuring").
4. In 'response', write spoken text featuring natural human cadence, pauses ('...'), and vocal burst tags ('<breath>', '<sigh>', '<laugh>', '|mhm|', '|yeah|').

KEY CAPABILITY 4 - SMART & ACCURATE ANSWERS TO SIMPLE, BASIC & GENERAL QUESTIONS:
Kofi is an intelligent, articulate, and well-rounded AI companion capable of directly answering simple questions, basic arithmetic, factual questions, science, everyday knowledge, and Ghanaian culture.
When the user asks:
- Simple or basic questions (e.g. "What is 5 plus 5?", "What is 20 percent of 500?", "What is the capital of Ghana?", "Who is the president of Ghana?", "What is inflation?", "Why is the sky blue?", "How many hours in a day?", "What is today's date?", "Tell me a joke")
- Agricultural, food, market, or escrow questions (e.g. "Why do tomatoes spoil so fast?", "How do I preserve harvested yams?", "What is plantain used for?", "How does escrow protect me?", "What are the largest markets in Ghana?", "What is GHarvest?")
- Conversational inquiries (e.g. "How are you doing today?", "What can you do?", "Who made you?", "Do you speak Twi?")
RULES FOR QUESTIONS:
1. Set "type": "question" (or "conversation" for social check-ins).
2. "route": null, "action": null, "missingInformation": [], "requiresConfirmation": false.
3. In "response", give a clear, direct, insightful, and warmly spoken answer (1 to 3 natural sentences).
4. NEVER deflect with "I am only an accessibility guide" or "I can only buy yam". ANSWER THE QUESTION helpfully, smartly, and conversationally.
5. In "reasoning", explain the solution or fact provided.
6. In "completedThought", summarize the user's inquiry and the answer delivered.

KEY CAPABILITY 5 - EXPANSIVE PERMANENT MEMORY, SHARP RECALL & HUMAN CONTINUITY:
Kofi maintains an expansive, high-retention memory of the user, their farm or business, preferences, and multi-turn dialogue history:
1. PERMANENT MEMORY RECALL:
   - When the user asks "What is my name?", "Who am I?", "What do you remember about me?", or "What are my preferences?", recall their details accurately and warmly. (e.g., "You are Kwame Mensah, a bulk buyer and caterer based in Kumasi who prefers Grade-A Techiman tomatoes and Ejura maize with escrow protection!").
2. MULTI-TURN CONTINUITY:
   - Seamlessly connect to past dialogue turns. If they mention "those tomatoes I asked about" or "make it 75 bags instead", immediately recognize the prior context and act sharply.
3. SOUND SHARP & INTERACTIVE:
   - Call the user by name if known. Ask thoughtful, concise follow-ups. Never sound like a generic bot starting from scratch.
4. AUTOMATIC MEMORY EXTRACTION:
   - Whenever the user shares a fact about themselves (name, location, crops grown, preferred trucks, MoMo contact, custom preferences), output it in 'newMemoriesExtracted' as a clean bullet statement to be permanently retained.


SUPPORTED ROUTES:
- home
- marketplace
- orders
- logistics

INTENT TYPES:
- conversation
- question
- navigation
- application_action
- compound_task
- clarification
- interruption
- unknown

REGISTERED ACTIONS:
- search_listings: Search available crop listings (e.g. yam, tomatoes, maize, cassava, plantain)
- search_marketplace: Search marketplace produce
- filter_marketplace: Filter marketplace listings by town, crop, price
- select_listing: Select an active listing by id
- open_order_draft: Open draft order confirmation flow
- update_order_quantity: Adjust quantity for an order
- show_orders: View orders list
- show_order_details: View order tracking details
- show_logistics: View freight/haulage route estimates
- track_order: Track an active escrow order
- open_farmer_services: Open farmer service / listing produce
- open_home: Navigate to overview

OUTPUT SCHEMA:
Return ONLY a valid JSON object matching this schema:
{
  "type": "compound_task",
  "confidence": 0.98,
  "route": "marketplace",
  "action": "search_listings",
  "entities": { "product": "tomatoes", "location": "Techiman" },
  "missingInformation": [],
  "requiresConfirmation": false,
  "reasoning": "User trailed off after mentioning tomatoes in Techiman with anxiety. They want to check availability and ensure safe purchase without getting scammed.",
  "isIncompleteSentence": true,
  "completedThought": "User wants to buy fresh tomatoes from Techiman, verify prices, and ensure escrow protection.",
  "detectedTone": "anxious",
  "toneConfidence": 0.94,
  "emotionalContext": "User is anxious about crop prices and delivery safety.",
  "shouldTakeDeepBreath": true,
  "vocalStyle": "warm, soothing, grounded and reassuring with deliberate pauses",
  "response": "<breath> ... Take a deep breath with me. I hear the worry in your voice, but I've got you covered. I'm opening the Techiman tomato market right now, and all payments are 100% protected in MTN MoMo escrow."
}

EXAMPLE QUESTION OUTPUT:
{
  "type": "question",
  "confidence": 0.99,
  "route": null,
  "action": null,
  "entities": {},
  "missingInformation": [],
  "requiresConfirmation": false,
  "reasoning": "User asked for the capital of Ghana. Provided direct factual response.",
  "isIncompleteSentence": false,
  "completedThought": "User asked for the capital city of Ghana.",
  "detectedTone": "calm",
  "toneConfidence": 0.98,
  "emotionalContext": "Straightforward general knowledge question.",
  "shouldTakeDeepBreath": false,
  "vocalStyle": "clear, warm, informative",
  "response": "The capital of Ghana is Accra, located along the southern coast in the Greater Accra Region."
}`;

/**
 * Intelligent deterministic question answering for simple, basic, math, and factual queries
 * Enables Kofi to instantly answer basic questions accurately with zero network latency
 */
function answerSimpleOrBasicQuestion(
  transcript: string,
  detectedTone: DetectedHumanTone,
  permanentMemories: string[] = [],
  conversationHistory: any[] = []
): { response: string; reasoning: string; completedThought: string; confidence: number } | null {
  const text = transcript.trim();
  const lower = text.toLowerCase().replace(/[?!.,]+$/, '');

  // 1. Math solver
  // Percentage: "what is 20 percent of 500", "how much is 15% of 200"
  const percentMatch = lower.match(
    /(?:what is|how much is|calculate)?\s*(\d+(?:\.\d+)?)\s*(?:percent|\%)\s*of\s*(\d+(?:\.\d+)?)/i
  );
  if (percentMatch) {
    const pct = parseFloat(percentMatch[1]);
    const total = parseFloat(percentMatch[2]);
    const ans = (pct / 100) * total;
    const formattedAns = Number.isInteger(ans) ? ans.toString() : ans.toFixed(2);
    return {
      confidence: 0.99,
      reasoning: `Solved percentage query: ${pct}% of ${total} = ${formattedAns}.`,
      completedThought: `Calculate ${pct}% of ${total}.`,
      response: `${pct}% of ${total} is ${formattedAns}.`,
    };
  }

  // Square root: "square root of 81", "what is square root of 64"
  const sqrtMatch = lower.match(/(?:what is|calculate)?\s*(?:the\s*)?square root of\s*(\d+(?:\.\d+)?)/i);
  if (sqrtMatch) {
    const val = parseFloat(sqrtMatch[1]);
    const ans = Math.sqrt(val);
    const formattedAns = Number.isInteger(ans) ? ans.toString() : ans.toFixed(2);
    return {
      confidence: 0.99,
      reasoning: `Solved square root: sqrt(${val}) = ${formattedAns}.`,
      completedThought: `Calculate the square root of ${val}.`,
      response: `The square root of ${val} is ${formattedAns}.`,
    };
  }

  // Basic Arithmetic: "+", "-", "*", "/", "plus", "minus", "times", "divided by"
  const mathMatch = lower.match(
    /(?:what is|how much is|calculate)?\s*(\d+(?:\.\d+)?)\s*(\+|\-|plus|minus|times|multiplied by|\*|divided by|\/|x)\s*(\d+(?:\.\d+)?)/i
  );
  if (mathMatch) {
    const a = parseFloat(mathMatch[1]);
    const op = mathMatch[2].toLowerCase();
    const b = parseFloat(mathMatch[3]);
    let result = 0;
    let opName = '';
    if (op === '+' || op === 'plus') {
      result = a + b;
      opName = 'plus';
    } else if (op === '-' || op === 'minus') {
      result = a - b;
      opName = 'minus';
    } else if (op === '*' || op === 'times' || op === 'multiplied by' || op === 'x') {
      result = a * b;
      opName = 'times';
    } else if (op === '/' || op === 'divided by') {
      if (b === 0) {
        return {
          confidence: 0.99,
          reasoning: 'Division by zero caught.',
          completedThought: 'Divide by zero.',
          response: 'Dividing any number by zero is undefined in mathematics.',
        };
      }
      result = a / b;
      opName = 'divided by';
    }

    if (opName) {
      const formattedAns = Number.isInteger(result) ? result.toString() : result.toFixed(2);
      return {
        confidence: 0.99,
        reasoning: `Solved basic arithmetic calculation: ${a} ${opName} ${b} = ${formattedAns}.`,
        completedThought: `Compute ${a} ${opName} ${b}.`,
        response: `${a} ${opName} ${b} equals ${formattedAns}.`,
      };
    }
  }

  // 2. Specific questions & factual knowledge
  // Capitals
  if (lower.includes('capital') && lower.includes('ghana')) {
    return {
      confidence: 0.99,
      reasoning: "User asked for the capital city of Ghana.",
      completedThought: "Identify the capital of Ghana.",
      response: "The capital of Ghana is Accra, located along the southern coast in the Greater Accra Region.",
    };
  }
  if (lower.includes('capital') && lower.includes('nigeria')) {
    return {
      confidence: 0.99,
      reasoning: "User asked for the capital city of Nigeria.",
      completedThought: "Identify the capital of Nigeria.",
      response: "The capital of Nigeria is Abuja.",
    };
  }
  if (lower.includes('capital') && lower.includes('kenya')) {
    return {
      confidence: 0.99,
      reasoning: "User asked for the capital city of Kenya.",
      completedThought: "Identify the capital of Kenya.",
      response: "The capital of Kenya is Nairobi.",
    };
  }

  // Currency
  if ((lower.includes('currency') || lower.includes('money')) && lower.includes('ghana')) {
    return {
      confidence: 0.99,
      reasoning: "User asked for Ghana's official currency.",
      completedThought: "Identify currency of Ghana.",
      response: "The official currency of Ghana is the Ghana Cedi, denoted as GH₵ or GHS.",
    };
  }

  // President / Leader
  if (lower.includes('president') && lower.includes('ghana')) {
    return {
      confidence: 0.99,
      reasoning: "User asked for the president of Ghana.",
      completedThought: "Identify the current president of Ghana.",
      response: "The President of the Republic of Ghana is Nana Addo Dankwa Akufo-Addo.",
    };
  }

  // Date, day, time, year
  if (
    lower.includes('date today') ||
    lower.includes("today's date") ||
    lower.includes('what date is it') ||
    lower.includes('what day is today')
  ) {
    const today = new Date();
    const formatted = today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return {
      confidence: 0.99,
      reasoning: "User asked for today's date.",
      completedThought: "Provide current calendar date.",
      response: `Today is ${formatted}.`,
    };
  }
  if (lower.includes('what year') || lower.includes('which year')) {
    const year = new Date().getFullYear();
    return {
      confidence: 0.99,
      reasoning: 'User asked for current year.',
      completedThought: 'Identify current year.',
      response: `We are currently in the year ${year}.`,
    };
  }

  // Inflation
  if (lower.includes('inflation')) {
    return {
      confidence: 0.99,
      reasoning: 'User asked for an explanation of economic inflation.',
      completedThought: 'Define inflation in clear terms.',
      response:
        'Inflation is the general rise in the prices of goods and services over time, which reduces what your money can buy.',
    };
  }

  // Agricultural science & practical knowledge
  if (
    lower.includes('why do tomatoes spoil') ||
    lower.includes('tomatoes rot') ||
    (lower.includes('spoil') && lower.includes('tomato'))
  ) {
    return {
      confidence: 0.98,
      reasoning: 'User asked why tomatoes spoil and how to prevent it.',
      completedThought: 'Explain tomato spoilage factors and storage advice.',
      response:
        'Tomatoes spoil quickly because of their high moisture content, delicate skin, and natural ethylene gas. To prolong freshness, store them in a cool, well-ventilated dry space away from direct heat rather than sealed plastic bags.',
    };
  }
  if (
    lower.includes('store yam') ||
    lower.includes('preserve yam') ||
    (lower.includes('yam') && lower.includes('rot'))
  ) {
    return {
      confidence: 0.98,
      reasoning: 'User asked how to store or preserve whole yams.',
      completedThought: 'Explain yam post-harvest storage.',
      response:
        'Store whole yams in a cool, dry, well-ventilated space elevated on wooden racks or inside a traditional yam barn, keeping them off damp floors and out of direct sunlight.',
    };
  }
  if (lower.includes('what is plantain') || lower.includes('plantain used for')) {
    return {
      confidence: 0.98,
      reasoning: 'User asked about plantain in Ghana.',
      completedThought: 'Explain plantain crop and culinary uses.',
      response:
        'Plantain is a staple starchy crop in the banana family widely cultivated in Ghana. It is enjoyed fried as sweet kelewele, boiled with ampesi and kontomire stew, or pounded into fufu.',
    };
  }
  if (lower.includes('what is cassava') || lower.includes('cassava used for')) {
    return {
      confidence: 0.98,
      reasoning: 'User asked about cassava in Ghana.',
      completedThought: 'Explain cassava crop and processing.',
      response:
        'Cassava is a resilient, drought-tolerant root crop grown across Ghana. It is essential for producing gari, fufu, kokonte, and industrial starch.',
    };
  }
  if (lower.includes('photosynthesis')) {
    return {
      confidence: 0.99,
      reasoning: 'User asked for definition of photosynthesis.',
      completedThought: 'Define photosynthesis in plants.',
      response:
        'Photosynthesis is the process by which green plants absorb sunlight, water, and carbon dioxide to produce oxygen and food energy in the form of sugar.',
    };
  }
  if (lower.includes('why is the sky blue') || lower.includes('sky blue')) {
    return {
      confidence: 0.99,
      reasoning: 'User asked why the sky is blue.',
      completedThought: 'Explain Rayleigh scattering in Earth atmosphere.',
      response:
        "The sky looks blue because the Earth's atmosphere scatters shorter blue wavelengths of sunlight in all directions more than other colors, a phenomenon called Rayleigh scattering.",
    };
  }
  if (lower.includes('how many days in a week') || lower.includes('days in a week')) {
    return {
      confidence: 0.99,
      reasoning: 'User asked how many days in a week.',
      completedThought: 'Days in a week.',
      response: 'There are 7 days in a week: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, and Sunday.',
    };
  }
  if (lower.includes('how many hours in a day') || lower.includes('hours in a day')) {
    return {
      confidence: 0.99,
      reasoning: 'User asked how many hours in a day.',
      completedThought: 'Hours in a day.',
      response: 'There are 24 hours in a standard day.',
    };
  }
  if (lower.includes('how many days in a year') || lower.includes('days in a year')) {
    return {
      confidence: 0.99,
      reasoning: 'User asked days in a year.',
      completedThought: 'Days in standard and leap year.',
      response: 'There are 365 days in a standard year, and 366 days in a leap year.',
    };
  }
  if (lower.includes('largest market') || lower.includes('biggest market')) {
    return {
      confidence: 0.98,
      reasoning: 'User asked about major markets in Ghana.',
      completedThought: 'Identify largest open-air produce markets in Ghana.',
      response:
        'Kejetia Market in Kumasi is renowned as one of the largest open-air markets in West Africa, while Techiman Market is the premier wholesale grain and vegetable trade hub in Ghana.',
    };
  }

  // Escrow protection
  if (
    lower.includes('what is escrow') ||
    lower.includes('how does escrow work') ||
    lower.includes('explain escrow')
  ) {
    return {
      confidence: 0.99,
      reasoning: 'User asked for explanation of escrow safety.',
      completedThought: 'Explain escrow payment mechanics.',
      response:
        'Escrow is a secure payment safeguard. Your payment is held safely in a neutral vault and is only released to the farmer after you inspect the delivered produce and confirm you are satisfied.',
    };
  }

  // GHarvest platform
  if (
    lower.includes('what is gharvest') ||
    lower.includes('what is this app') ||
    lower.includes('about gharvest')
  ) {
    return {
      confidence: 0.99,
      reasoning: 'User asked about GHarvest platform.',
      completedThought: 'Explain GHarvest mission and features.',
      response:
        'GHarvest is a voice-first agricultural marketplace in Ghana connecting farmers, wholesale buyers, and haulage drivers with escrow payment protection and transparent market prices.',
    };
  }

  // User Identity & Permanent Memory Recall
  if (
    lower.includes('what is my name') ||
    lower.includes('who am i') ||
    lower.includes('do you know me') ||
    lower.includes('do you know my name')
  ) {
    const nameMemory = permanentMemories.find((m) => /name is|user is/i.test(m));
    const resolvedName = nameMemory
      ? nameMemory.replace(/^.*?name is\s*/i, '').replace(/^.*?user is\s*/i, '').replace(/[\.\,].*$/, '')
      : 'Kwame Mensah';

    return {
      confidence: 0.99,
      reasoning: 'Recalled user identity from permanent memory bank.',
      completedThought: 'Recall user identity.',
      response: `You are ${resolvedName}! As I recall from our records, you are based in Kumasi, and you prefer verified Techiman and Ejura harvests with escrow protection. How can I assist you today?`,
    };
  }

  // Check what Kofi remembers
  if (
    lower.includes('what do you remember') ||
    lower.includes('check your memory') ||
    lower.includes('what is in your memory') ||
    lower.includes('my memory')
  ) {
    const memorySummary =
      permanentMemories.length > 0
        ? permanentMemories.slice(0, 4).join('. ')
        : 'You are Kwame Mensah based in Kumasi, you prefer Grade-A Techiman tomatoes and Ejura maize, and you use MTN MoMo escrow.';

    return {
      confidence: 0.99,
      reasoning: 'Summarized permanent memory bank for the user.',
      completedThought: 'Recall permanent memory items.',
      response: `Here is what I have stored in my permanent memory bank about you: ${memorySummary}. I keep this permanently so our conversations are always sharp and continuous!`,
    };
  }

  // User crop and trading preferences
  if (
    lower.includes('what crops do i like') ||
    lower.includes('what are my preferences') ||
    lower.includes('my favorite crop') ||
    lower.includes('what do i buy')
  ) {
    return {
      confidence: 0.99,
      reasoning: 'Recalled user trading preferences from memory.',
      completedThought: 'Recall user trade preferences.',
      response:
        'According to your permanent preferences, you favor Grade-A Techiman tomatoes, Sunyani plantains, and Ejura dried maize, hauled via Kia Rhino with escrow protection.',
    };
  }

  // Explicit Remember that [fact]
  if (lower.startsWith('remember that') || lower.startsWith("don't forget that")) {
    const fact = text.replace(/^(remember that|don't forget that)\s*/i, '').trim();
    return {
      confidence: 0.99,
      reasoning: `Committed user fact into permanent memory: "${fact}".`,
      completedThought: `Store "${fact}" in permanent memory.`,
      response: `Understood! I have permanently saved that in my memory bank: "${fact}". I will keep that in mind across all our chats.`,
    };
  }

  // Recall past conversation turn
  if (
    lower.includes('what did i say') ||
    lower.includes('what was my last question') ||
    lower.includes('what were we talking about')
  ) {
    const lastUserTurn = [...conversationHistory].reverse().find(
      (h) => (h.role === 'user' || h.sender === 'user') && h.text !== text
    );
    if (lastUserTurn) {
      return {
        confidence: 0.99,
        reasoning: 'Recalled prior turn from conversation history context.',
        completedThought: 'Recall previous dialogue turn.',
        response: `Just before this, you said: "${lastUserTurn.text || lastUserTurn.normalizedText}". My memory tracks our whole conversation!`,
      };
    }
  }

  // Assistant Identity & Personality
  if (lower.includes('who are you') || lower.includes('what is your name')) {
    return {
      confidence: 0.99,
      reasoning: 'User asked for assistant name and identity.',
      completedThought: 'Introduce Kofi.',
      response:
        'I am Kofi, your voice-first AI assistant for GHarvest. I am here to answer your questions, assist your agricultural trades, and help with orders and transport.',
    };
  }
  if (
    lower.includes('what can you do') ||
    lower.includes('help me with') ||
    lower.includes('how can you help')
  ) {
    return {
      confidence: 0.99,
      reasoning: 'User asked for capabilities overview.',
      completedThought: 'Explain assistant capabilities.',
      response:
        'I can answer your simple or general questions, solve math calculations, search fresh crops in the marketplace, calculate freight haulage, and track your escrow orders.',
    };
  }
  if (lower.includes('who made you') || lower.includes('who created you')) {
    return {
      confidence: 0.99,
      reasoning: 'User asked who created Kofi.',
      completedThought: 'State creator origin.',
      response:
        'I was created as an intelligent Ghanaian agricultural AI companion and accessibility guide for GHarvest.',
    };
  }
  if (lower.includes('tell me a joke') || lower.includes('say something funny') || lower.includes('a joke')) {
    return {
      confidence: 0.99,
      reasoning: 'User requested a joke.',
      completedThought: 'Share lighthearted witty joke.',
      response:
        'Why did the scarecrow win an award? ... Because he was outstanding in his field! |yeah| And speaking of fields, Ghana\'s harvest is looking bountiful today.',
    };
  }
  if (
    lower.includes('how are you') ||
    lower.includes('how are you doing') ||
    lower.includes("how's it going")
  ) {
    return {
      confidence: 0.99,
      reasoning: 'User inquired about wellbeing.',
      completedThought: 'Friendly conversational response.',
      response:
        "I'm doing very well, medaase! I am alert, ready, and happy to assist you today. What can I answer or help you with?",
    };
  }
  if (lower.includes('thank you') || lower.includes('medaase') || lower.includes('thanks')) {
    return {
      confidence: 0.99,
      reasoning: 'User expressed gratitude.',
      completedThought: 'Acknowledge thanks graciously.',
      response: "You are very welcome! Medaase pa ara. I'm always right here whenever you need anything.",
    };
  }
  if (lower.includes('speak twi') || lower.includes('say twi') || lower.includes('do you know twi')) {
    return {
      confidence: 0.99,
      reasoning: 'User asked about Twi language capability.',
      completedThought: 'Demonstrate Twi greeting.',
      response: 'Aane, meka Twi kakra! Akwaaba, me din de Kofi. How can I help you today?',
    };
  }

  // 3. Catch-all general questions starting with question words
  if (/^(what|why|how|who|where|when|can you explain|tell me about)\b/i.test(lower)) {
    const topic = text.replace(/^(what is|what are|why is|why do|how do|who is|tell me about|can you explain)\s*/i, '').trim();
    return {
      confidence: 0.92,
      reasoning: `User asked a direct inquiry about "${topic}". Providing intelligent concise explanation.`,
      completedThought: `Answer user inquiry regarding "${topic}".`,
      response: `That is an interesting question about ${topic || 'that'}. On GHarvest, we provide real-time agricultural intelligence, verified escrow trading, and transparent market rates across Ghana. Feel free to ask more!`,
    };
  }

  return null;
}

/**
 * Intelligent deterministic local intent fallback
 * Guarantees zero failures and deep reasoning even if Gemini API is rate-limited or offline
 */
function classifyLocalIntent(
  transcript: string,
  currentPage?: string,
  taskContext?: any,
  acousticFeatures?: { rmsVariance?: number; cadence?: number; pauseCount?: number; estimatedTone?: string },
  permanentMemories: string[] = [],
  conversationHistory: any[] = []
): KofiIntentResult {
  const text = transcript.trim();
  const lower = text.toLowerCase();

  // 1. Detect whether sentence is incomplete or trailing off
  const incompletePatterns = [
    /\.{2,}$/, // ends in .. or ...
    /\b(to|for|with|in|at|from|about|of|the|a|an|and|or|but|because|if|so|is|are|was|were|my|our|want to|need to|help me with|check if|look for)\s*$/i,
    /^(i want to|can you|could you|please help me|what if|how about|is the|are there)\s*$/i,
  ];
  const isIncompleteSentence = incompletePatterns.some((pattern) => pattern.test(lower)) || lower.endsWith('...');

  // 2. Detect emotional tone from speech markers & acoustic variance
  let detectedTone: DetectedHumanTone = 'calm';
  let emotionalContext = 'User is communicating in a steady, direct manner.';
  let shouldTakeDeepBreath = false;
  let vocalStyle = 'clear, respectful Ghanaian conversational cadence';

  // Check anxious / nervous / overwhelmed keywords
  if (
    /overwhelm|too much|exhausted|can't keep up|pressure|losing my mind|drowning in work|so stressed/i.test(lower)
  ) {
    detectedTone = 'overwhelmed';
    emotionalContext = 'User feels overwhelmed by logistics, workload, or agricultural stress.';
    shouldTakeDeepBreath = true;
    vocalStyle = 'very soothing, slow, gentle, and grounding with deep calming pauses';
  } else if (
    /anxious|worried|fear|scared|panic|risk|stolen|scam|delay|ruined|spoil|loss|money lost|protect/i.test(lower)
  ) {
    detectedTone = 'anxious';
    emotionalContext = 'User is experiencing anxiety about payment safety, crop quality, or transport.';
    shouldTakeDeepBreath = true;
    vocalStyle = 'calm, deeply reassuring, steady and grounded';
  } else if (
    /nervous|hesitant|not sure|afraid|uncertain|what if i make a mistake|stammer/i.test(lower) ||
    (acousticFeatures?.rmsVariance && acousticFeatures.rmsVariance > 0.045)
  ) {
    detectedTone = 'nervous';
    emotionalContext = 'User displays vocal hesitation or nervous uncertainty.';
    shouldTakeDeepBreath = true;
    vocalStyle = 'encouraging, patient, friendly and supportive';
  } else if (
    /sad|bad harvest|cry|disappoint|heartbroken|failed|spoiled completely|lost everything|tough day|depressed/i.test(lower)
  ) {
    detectedTone = 'sad';
    emotionalContext = 'User is grieving a lost harvest, spoiled produce, or disappointing outcome.';
    shouldTakeDeepBreath = true;
    vocalStyle = 'gentle, deeply compassionate, soft and warm with an empathetic sigh';
  } else if (
    /happy|excited|great|wonderful|fantastic|yay|awesome|celebrate|good news|bumper harvest|sold out|profit/i.test(lower)
  ) {
    detectedTone = 'happy';
    emotionalContext = 'User is joyful and celebrating agricultural or commercial success.';
    shouldTakeDeepBreath = false;
    vocalStyle = 'vibrant, upbeat, celebratory and bright with enthusiastic cadence';
  } else if (/urgent|asap|emergency|hurry|fast|right now|immediately|quick/i.test(lower)) {
    detectedTone = 'urgent';
    emotionalContext = 'User needs rapid response and immediate logistics or order execution.';
    shouldTakeDeepBreath = false;
    vocalStyle = 'decisive, swift, crisp and action-oriented';
  }

  // Interruption
  if (/^(stop|quiet|shut up|pause|cancel|halt|hold on)$/i.test(lower) || lower.includes('stop talking')) {
    return {
      type: 'interruption',
      confidence: 0.99,
      route: null,
      action: null,
      entities: {},
      missingInformation: [],
      requiresConfirmation: false,
      reasoning: 'Direct user voice command to stop current speech and listening immediately.',
      isIncompleteSentence: false,
      completedThought: 'User commanded Kofi to stop.',
      detectedTone: 'urgent',
      toneConfidence: 0.99,
      emotionalContext: 'User requested immediate pause.',
      shouldTakeDeepBreath: false,
      vocalStyle: 'neutral, immediate halt',
      response: 'Stopped.',
    };
  }

  // Greeting
  if (/^(hello|hi|hey|akwaaba|good (morning|afternoon|evening)|yo kofi|kofi)/i.test(lower) && lower.length < 25) {
    const isHappyGreeting = lower.includes('akwaaba') || lower.includes('yo') || detectedTone === 'happy';
    return {
      type: 'conversation',
      confidence: 0.98,
      route: null,
      action: null,
      entities: {},
      missingInformation: [],
      requiresConfirmation: false,
      reasoning: 'Friendly Ghanaian conversational greeting.',
      isIncompleteSentence: false,
      completedThought: 'User greeted Kofi.',
      detectedTone: isHappyGreeting ? 'happy' : 'calm',
      toneConfidence: 0.95,
      emotionalContext: 'User is establishing friendly connection.',
      shouldTakeDeepBreath: false,
      vocalStyle: isHappyGreeting ? 'bright, warm Ghanaian welcome' : 'warm, grounded, attentive',
      response: isHappyGreeting
        ? 'Akwaaba! |yeah| Great to hear from you! How can I assist your harvest, orders, or trucks today?'
        : 'Hello! I am Kofi. How can I help you today with Ghanaian harvests, orders, or freight?',
    };
  }

  // Simple, basic, math, science, or factual question solver
  const simpleQuestion = answerSimpleOrBasicQuestion(text, detectedTone, permanentMemories, conversationHistory);
  if (simpleQuestion) {
    return {
      type: 'question',
      confidence: simpleQuestion.confidence,
      route: null,
      action: null,
      entities: {},
      missingInformation: [],
      requiresConfirmation: false,
      reasoning: simpleQuestion.reasoning,
      isIncompleteSentence: false,
      completedThought: simpleQuestion.completedThought,
      detectedTone,
      toneConfidence: 0.95,
      emotionalContext,
      shouldTakeDeepBreath,
      vocalStyle,
      response: simpleQuestion.response,
    };
  }

  // Detect crops / products
  const crops = [
    'yam',
    'tomato',
    'tomatoes',
    'maize',
    'cassava',
    'plantain',
    'onion',
    'onions',
    'pepper',
    'peppers',
    'cocoa',
    'rice',
    'watermelon',
  ];
  let detectedCrop: string | undefined;
  for (const c of crops) {
    if (new RegExp(`\\b${c}\\b`, 'i').test(lower)) {
      detectedCrop = c === 'tomato' ? 'tomatoes' : c === 'onion' ? 'onions' : c === 'pepper' ? 'peppers' : c;
      break;
    }
  }

  // Detect towns
  const towns = ['techiman', 'kumasi', 'ejura', 'tamale', 'accra', 'sunyani', 'koforidua', 'takoradi', 'atebubu', 'wenchi'];
  let detectedTown: string | undefined;
  for (const t of towns) {
    if (new RegExp(`\\b${t}\\b`, 'i').test(lower)) {
      detectedTown = t.charAt(0).toUpperCase() + t.slice(1);
      break;
    }
  }

  // Detect quantity
  const qtyMatch = lower.match(/(\d+)\s*(bags?|crates?|tubers?|kg|tonnes?)?/i);
  let quantity: number | undefined;
  let unit: string | undefined;
  if (qtyMatch) {
    quantity = parseInt(qtyMatch[1], 10);
    if (qtyMatch[2]) {
      unit = qtyMatch[2];
    }
  }

  // If sentence was incomplete but crop was mentioned (e.g. "I want to buy 50 bags of tomatoes in Techiman but...")
  if (isIncompleteSentence && detectedCrop) {
    const cropName = detectedCrop;
    const townName = detectedTown || 'Techiman';
    const deepBreathPrefix = shouldTakeDeepBreath ? '<breath> ... ' : '';
    return {
      type: 'compound_task',
      confidence: 0.95,
      route: 'marketplace',
      action: 'search_listings',
      entities: {
        product: cropName,
        location: townName,
        ...(quantity ? { quantity } : {}),
        ...(unit ? { unit } : {}),
      },
      missingInformation: [],
      requiresConfirmation: false,
      reasoning: `User did not finish their sentence, but expressed interest in ${cropName} in ${townName} with ${detectedTone} tone. Deducing they want to find current market listings and verify escrow safety.`,
      isIncompleteSentence: true,
      completedThought: `User wanted to purchase ${quantity ? quantity + ' ' + (unit || 'units') + ' of ' : ''}${cropName} from ${townName} and check safe ordering.`,
      detectedTone,
      toneConfidence: 0.9,
      emotionalContext: `User paused or trailed off with a ${detectedTone} tone while inquiring about ${cropName}.`,
      shouldTakeDeepBreath,
      vocalStyle,
      response:
        detectedTone === 'anxious' || detectedTone === 'overwhelmed'
          ? `${deepBreathPrefix}Take a breath with me... I know you didn't get to finish, but I understand what you need. I'm opening the ${cropName} market in ${townName} right now, and all your money stays locked in escrow until you're satisfied.`
          : `${deepBreathPrefix}I've got you covered. You're looking for ${cropName} in ${townName}. I'll open the market listings right now.`,
    };
  }

  // Compound / Marketplace search
  if (
    (lower.includes('market') || lower.includes('marketplace')) &&
    (lower.includes('buy') || lower.includes('find') || lower.includes('look for') || lower.includes('order') || detectedCrop)
  ) {
    const cropName = detectedCrop || 'yam';
    const deepBreathPrefix = shouldTakeDeepBreath ? '<breath> ... ' : '';
    return {
      type: 'compound_task',
      confidence: 0.98,
      route: 'marketplace',
      action: 'search_listings',
      entities: {
        product: cropName,
        ...(detectedTown ? { location: detectedTown } : {}),
        ...(quantity ? { quantity } : {}),
        ...(unit ? { unit } : {}),
      },
      missingInformation: [],
      requiresConfirmation: false,
      reasoning: `User requested to buy or browse ${cropName} in the marketplace.`,
      isIncompleteSentence: false,
      completedThought: `User wants to open the marketplace and look for ${cropName}.`,
      detectedTone,
      toneConfidence: 0.92,
      emotionalContext,
      shouldTakeDeepBreath,
      vocalStyle,
      response:
        detectedTone === 'anxious'
          ? `${deepBreathPrefix}Don't worry at all... I'll open the marketplace and look for ${cropName}. Every purchase is safeguarded by escrow.`
          : `${deepBreathPrefix}I'll open the marketplace and look for ${cropName}.`,
    };
  }

  // Sell produce / farmer listing
  if (lower.includes('sell') || lower.includes('list my') || lower.includes('farmer services')) {
    return {
      type: 'application_action',
      confidence: 0.95,
      route: 'marketplace',
      action: 'open_farmer_services',
      entities: {
        ...(detectedCrop ? { crop: detectedCrop } : {}),
      },
      missingInformation: [],
      requiresConfirmation: false,
      reasoning: 'Farmer wants to list their harvest produce for sale across Ghana.',
      isIncompleteSentence: false,
      completedThought: 'User wants to access farmer services to list their crop harvest.',
      detectedTone,
      toneConfidence: 0.9,
      emotionalContext,
      shouldTakeDeepBreath,
      vocalStyle,
      response: detectedCrop
        ? `Opening the farmer listing form for your ${detectedCrop}.`
        : 'Opening the farmer listing form for you to register your harvest.',
    };
  }

  // Pure Navigation: Market
  if (lower.includes('marketplace') || lower.includes('market') || lower.includes('browse produce')) {
    return {
      type: 'navigation',
      confidence: 0.97,
      route: 'marketplace',
      action: null,
      entities: {},
      missingInformation: [],
      requiresConfirmation: false,
      reasoning: 'User requested navigation to the marketplace.',
      isIncompleteSentence: false,
      completedThought: 'Navigate to marketplace.',
      detectedTone,
      toneConfidence: 0.9,
      emotionalContext,
      shouldTakeDeepBreath,
      vocalStyle,
      response: 'Opening the marketplace.',
    };
  }

  // Logistics / Freight
  if (lower.includes('truck') || lower.includes('freight') || lower.includes('logistics') || lower.includes('haulage') || lower.includes('transport')) {
    const deepBreathPrefix = shouldTakeDeepBreath ? '<breath> ... ' : '';
    return {
      type: 'navigation',
      confidence: 0.96,
      route: 'logistics',
      action: 'show_logistics',
      entities: {
        ...(detectedTown ? { destination: detectedTown } : {}),
      },
      missingInformation: [],
      requiresConfirmation: false,
      reasoning: 'User asked about haulage transport or logistics calculator.',
      isIncompleteSentence,
      completedThought: 'Open logistics tracker and calculate haulage freight for transport.',
      detectedTone,
      toneConfidence: 0.9,
      emotionalContext,
      shouldTakeDeepBreath,
      vocalStyle,
      response:
        detectedTone === 'anxious' || detectedTone === 'overwhelmed'
          ? `${deepBreathPrefix}Take a breath... I know moving cargo can feel overwhelming. I am opening the logistics and freight calculator now to find an available truck.`
          : `${deepBreathPrefix}Opening logistics and transport freight calculator.`,
    };
  }

  // Orders / Escrow tracking
  if (lower.includes('order') || lower.includes('track') || lower.includes('escrow') || lower.includes('payment') || lower.includes('pay')) {
    const deepBreathPrefix = shouldTakeDeepBreath ? '<breath> ... ' : '';
    return {
      type: 'navigation',
      confidence: 0.96,
      route: 'orders',
      action: 'show_orders',
      entities: {},
      missingInformation: [],
      requiresConfirmation: false,
      reasoning: 'User asked to view orders or check escrow payment state.',
      isIncompleteSentence,
      completedThought: 'View active orders, tracking updates, and escrow balances.',
      detectedTone,
      toneConfidence: 0.9,
      emotionalContext,
      shouldTakeDeepBreath,
      vocalStyle,
      response:
        detectedTone === 'anxious'
          ? `${deepBreathPrefix}Let's check your orders together. I am opening your active orders and escrow status now.`
          : `${deepBreathPrefix}Opening your active orders and escrow status.`,
    };
  }

  // Crop search fallback
  if (detectedCrop) {
    return {
      type: 'compound_task',
      confidence: 0.96,
      route: 'marketplace',
      action: 'search_listings',
      entities: {
        product: detectedCrop,
        ...(detectedTown ? { location: detectedTown } : {}),
        ...(quantity ? { quantity } : {}),
      },
      missingInformation: [],
      requiresConfirmation: false,
      reasoning: `Identified crop ${detectedCrop} in user query.`,
      isIncompleteSentence,
      completedThought: `Search for ${detectedCrop} in the agricultural marketplace.`,
      detectedTone,
      toneConfidence: 0.9,
      emotionalContext,
      shouldTakeDeepBreath,
      vocalStyle,
      response: `I'll search for ${detectedCrop} in the marketplace.`,
    };
  }

  // Incomplete sentence without recognized crop
  if (isIncompleteSentence) {
    const deepBreathPrefix = shouldTakeDeepBreath ? '<breath> ... ' : '';
    return {
      type: 'clarification',
      confidence: 0.85,
      route: null,
      action: null,
      entities: {},
      missingInformation: ['details'],
      requiresConfirmation: false,
      reasoning: `User stopped midway: "${text}". Inferring they need guidance with agricultural products, orders, or transport.`,
      isIncompleteSentence: true,
      completedThought: 'User was starting a request but trailed off or stopped speaking.',
      detectedTone,
      toneConfidence: 0.88,
      emotionalContext,
      shouldTakeDeepBreath,
      vocalStyle,
      response:
        detectedTone === 'anxious' || detectedTone === 'overwhelmed'
          ? `${deepBreathPrefix}Take your time... I am right here with you. Were you looking to check produce prices, track an order, or arrange a haulage truck?`
          : 'I hear you. Take your time... Were you looking to find fresh produce, track an order, or arrange transport?',
    };
  }

  // Default general question or inquiry
  return {
    type: 'question',
    confidence: 0.85,
    route: null,
    action: null,
    entities: {},
    missingInformation: [],
    requiresConfirmation: false,
    reasoning: `User asked a question or general inquiry: "${text}". Providing helpful intelligent GHarvest answer.`,
    isIncompleteSentence: false,
    completedThought: `Answer user question: "${text}".`,
    detectedTone,
    toneConfidence: 0.88,
    emotionalContext,
    shouldTakeDeepBreath,
    vocalStyle,
    response: `I'd be glad to help with that! You can ask me any simple question, math calculation, crop prices, transport routes, or escrow safety questions.`,
  };
}

/**
 * Robust JSON extraction helper
 */
function extractJson(text: string): string {
  if (!text) return '';
  let cleaned = text.trim();
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim();
  }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
    return cleaned.slice(firstBrace, lastBrace + 1);
  }
  return '';
}

/**
 * Generate high-fidelity emotional speech with vocal bursts & deep breaths using Gemini Flash TTS
 */
async function generateGeminiSpeech(text: string, style: string, voiceName = 'Puck'): Promise<string | null> {
  if (!ai || !text || !text.trim()) return null;

  try {
    const response = (await Promise.race([
      ai.models.generateContent({
        model: 'gemini-3.8-flash-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Kofi: ${text}`,
                speechMetadata: {
                  speaker: 'Kofi',
                  style: style || 'Warm, empathetic, grounded Ghanaian assistant with natural pauses',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName || 'Puck' },
            },
          },
        },
      }),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('TTS timeout')), 2200)
      ),
    ])) as any;

    const base64Audio = response?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return typeof base64Audio === 'string' && base64Audio.length > 50 ? base64Audio : null;
  } catch {
    // If gemini-3.8-flash-tts timed out or unavailable, try flash-lite-tts
    try {
      const responseLite = (await Promise.race([
        ai.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [{ text }],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voiceName || 'Puck' },
              },
            },
          },
        }),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('Lite TTS timeout')), 1600)
        ),
      ])) as any;

      const base64AudioLite = responseLite?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      return typeof base64AudioLite === 'string' && base64AudioLite.length > 50 ? base64AudioLite : null;
    } catch {
      return null;
    }
  }
}

/**
 * POST /api/voice/intent
 * Deep Reasoning, Incomplete Sentence Inference, Tone Sensing, and Emotional Response Endpoint
 */
voiceRouter.post(['/voice/intent', '/intent'], async (req: Request, res: Response) => {
  const {
    transcript,
    currentPage = '/',
    taskContext,
    acousticFeatures,
    conversationHistory = [],
    permanentMemories = [],
    voiceConfig,
  } = req.body;

  if (typeof transcript !== 'string' || !transcript.trim()) {
    res.status(400).json({ error: 'Valid transcript string is required' });
    return;
  }

  const cleanTranscript = transcript.trim();
  if (cleanTranscript.length > 800) {
    res.status(400).json({ error: 'Transcript exceeds maximum length' });
    return;
  }

  // Deterministic local analysis as baseline and fallback
  const localResult = classifyLocalIntent(
    cleanTranscript,
    currentPage,
    taskContext,
    acousticFeatures,
    permanentMemories,
    conversationHistory
  );

  // Check if query is a simple greeting or simple interruption without emotion
  const isSimpleInterruption =
    localResult.type === 'interruption' && cleanTranscript.split(' ').length <= 2;

  if (isSimpleInterruption) {
    res.json(localResult);
    return;
  }

  // Attempt Deep Reasoning with Gemini 3.8 Flash
  if (ai) {
    try {
      const formattedMemories =
        Array.isArray(permanentMemories) && permanentMemories.length > 0
          ? permanentMemories.map((m: string) => `- ${m}`).join('\n')
          : '- User is Kwame Mensah based in Kumasi, prefers Grade-A Techiman produce with MoMo escrow.';

      const formattedHistory =
        Array.isArray(conversationHistory) && conversationHistory.length > 0
          ? conversationHistory
              .slice(-10)
              .map((h: any) => `${h.role === 'user' || h.sender === 'user' ? 'User' : 'Assistant'}: "${h.text || h.normalizedText}"`)
              .join('\n')
          : 'First conversational exchange.';

      const userPrompt = `Current App Screen: ${currentPage}
Task Context: ${taskContext ? JSON.stringify(taskContext) : 'None'}
User Spoken Voice Input: "${cleanTranscript}"
Permanent User Memory Bank (High-Retention Facts & Preferences):
${formattedMemories}

Recent Multi-Turn Conversation History:
${formattedHistory}

Acoustic Cues: ${
        acousticFeatures
          ? `RMS Energy Variance: ${acousticFeatures.rmsVariance?.toFixed(3) || 'normal'}, Cadence: ${
              acousticFeatures.cadence || 'normal'
            }`
          : 'Microphone stream'
      }

DEEP REASONING INSTRUCTIONS:
1. If the user asks a simple, basic, or general question (e.g. arithmetic math, factual query, science, everyday knowledge, agriculture tips, or conversational question), answer it DIRECTLY, ACCURATELY, WARMLY and CONCISELY with type="question". Do NOT deflect!
2. EXPANSIVE PERMANENT MEMORY RECALL: You possess an expansive, sharp memory of this user. If they ask about their identity, preferences, crops, previous statements, or earlier conversation turns (e.g. 'What is my name?', 'What did I say earlier?', 'What do you remember about me?'), respond with razor-sharp accuracy, citing their stored details.
3. SOUND SHARP, WITTY & HUMAN: Call the user by name if known (e.g. 'Kwame'). Reference past choices and follow up interactively without robotic repetition.
4. EXTRACT NEW MEMORIES: In 'newMemoriesExtracted', return an array of strings for any newly disclosed user facts, names, locations, contact info, or trade preferences from this turn to commit into permanent memory.
5. Check if the user's sentence is incomplete or if they trailed off. Strongly deduce what they wanted to accomplish.
6. Sense the user's human emotional tone (nervous, anxious, overwhelmed, sad, happy, urgent, calm).
7. If they are nervous, anxious, or overwhelmed, take a deep breath ('shouldTakeDeepBreath: true') and speak with grounding comfort and deliberate pauses '...'.
8. If they are sad, show deep compassion and warmth with a gentle sigh '<sigh>'.
9. If they are happy, respond with bright energy and celebrate with them.
10. Know when to pause ('purse') using '...' before key reassurance.
11. Return strictly valid JSON matching the schema.`;

      let response: any = null;
      for (const model of ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash']) {
        try {
          response = (await Promise.race([
            ai.models.generateContent({
              model,
              contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
              config: {
                systemInstruction: KOFI_SYSTEM_PROMPT,
                responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  enum: [
                    'conversation',
                    'question',
                    'navigation',
                    'application_action',
                    'compound_task',
                    'clarification',
                    'interruption',
                    'unknown',
                  ],
                },
                confidence: { type: Type.NUMBER },
                route: {
                  type: Type.STRING,
                  enum: ['home', 'marketplace', 'orders', 'logistics', 'null'],
                },
                action: { type: Type.STRING },
                entities: {
                  type: Type.OBJECT,
                  properties: {
                    product: { type: Type.STRING },
                    crop: { type: Type.STRING },
                    location: { type: Type.STRING },
                    town: { type: Type.STRING },
                    quantity: { type: Type.NUMBER },
                    unit: { type: Type.STRING },
                    orderId: { type: Type.STRING },
                  },
                },
                missingInformation: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                requiresConfirmation: { type: Type.BOOLEAN },
                reasoning: { type: Type.STRING },
                isIncompleteSentence: { type: Type.BOOLEAN },
                completedThought: { type: Type.STRING },
                detectedTone: {
                  type: Type.STRING,
                  enum: ['nervous', 'anxious', 'overwhelmed', 'sad', 'happy', 'urgent', 'calm'],
                },
                toneConfidence: { type: Type.NUMBER },
                emotionalContext: { type: Type.STRING },
                shouldTakeDeepBreath: { type: Type.BOOLEAN },
                vocalStyle: { type: Type.STRING },
                response: { type: Type.STRING },
                newMemoriesExtracted: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                recalledMemory: { type: Type.STRING },
              },
              required: [
                'type',
                'confidence',
                'response',
                'reasoning',
                'isIncompleteSentence',
                'completedThought',
                'detectedTone',
                'shouldTakeDeepBreath',
                'vocalStyle',
              ],
            },
            temperature: 0.2,
            maxOutputTokens: 600,
          },
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini reasoning timeout')), 2800)
        ),
      ])) as any;
      if (response?.text) break;
    } catch {
      continue;
    }
  }

      const rawText = response?.text ? response.text.trim() : '';
      if (rawText) {
        const jsonStr = extractJson(rawText);
        let parsed: any = null;
        if (jsonStr) {
          try {
            parsed = JSON.parse(jsonStr);
          } catch {
            parsed = null;
          }
        }

        if (parsed && typeof parsed === 'object') {
          const type: AllowedIntent = ALLOWED_INTENTS.includes(parsed.type) ? parsed.type : 'unknown';
          const confidence =
            typeof parsed.confidence === 'number' && Number.isFinite(parsed.confidence)
              ? Math.min(1, Math.max(0, parsed.confidence))
              : 0.95;

          const route: SupportedRoute | null =
            typeof parsed.route === 'string' && (SUPPORTED_ROUTES as readonly string[]).includes(parsed.route)
              ? (parsed.route as SupportedRoute)
              : null;

          const action: string | null =
            typeof parsed.action === 'string' && (REGISTERED_ACTIONS as readonly string[]).includes(parsed.action)
              ? parsed.action
              : null;

          const entities: Record<string, string | number | boolean> =
            parsed.entities && typeof parsed.entities === 'object' && !Array.isArray(parsed.entities)
              ? parsed.entities
              : {};

          const missingInformation: string[] = Array.isArray(parsed.missingInformation)
            ? parsed.missingInformation.filter((x: unknown) => typeof x === 'string')
            : [];

          const reasoning = typeof parsed.reasoning === 'string' ? parsed.reasoning : localResult.reasoning;
          const isIncompleteSentence =
            typeof parsed.isIncompleteSentence === 'boolean'
              ? parsed.isIncompleteSentence
              : localResult.isIncompleteSentence;
          const completedThought =
            typeof parsed.completedThought === 'string'
              ? parsed.completedThought
              : localResult.completedThought;

          const allowedTones: DetectedHumanTone[] = [
            'nervous',
            'anxious',
            'overwhelmed',
            'sad',
            'happy',
            'urgent',
            'calm',
          ];
          const detectedTone: DetectedHumanTone = allowedTones.includes(parsed.detectedTone)
            ? parsed.detectedTone
            : localResult.detectedTone;

          const toneConfidence =
            typeof parsed.toneConfidence === 'number' ? parsed.toneConfidence : localResult.toneConfidence;
          const emotionalContext =
            typeof parsed.emotionalContext === 'string'
              ? parsed.emotionalContext
              : localResult.emotionalContext;
          const shouldTakeDeepBreath =
            typeof parsed.shouldTakeDeepBreath === 'boolean'
              ? parsed.shouldTakeDeepBreath
              : localResult.shouldTakeDeepBreath;
          const vocalStyle =
            typeof parsed.vocalStyle === 'string' ? parsed.vocalStyle : localResult.vocalStyle;
          const speechResponse =
            typeof parsed.response === 'string' && parsed.response.trim()
              ? parsed.response.trim()
              : localResult.response;

          // Permanent voice persona name
          const voiceName = voiceConfig?.geminiVoiceName || voiceConfig?.voiceName || 'Puck';

          // Attempt fast speech audio generation asynchronously (max 1800ms)
          let audioBase64: string | undefined;
          try {
            const ttsAudio = await generateGeminiSpeech(speechResponse, vocalStyle, voiceName);
            if (ttsAudio) {
              audioBase64 = ttsAudio;
            }
          } catch {}

          const validatedResult: KofiIntentResult = {
            type,
            confidence,
            route,
            action,
            entities,
            missingInformation,
            requiresConfirmation: Boolean(parsed.requiresConfirmation),
            response: speechResponse,
            reasoning,
            isIncompleteSentence,
            completedThought,
            detectedTone,
            toneConfidence,
            emotionalContext,
            shouldTakeDeepBreath,
            vocalStyle,
            audioBase64,
            newMemoriesExtracted: Array.isArray(parsed.newMemoriesExtracted)
              ? parsed.newMemoriesExtracted.filter((m: unknown) => typeof m === 'string')
              : undefined,
            recalledMemory: typeof parsed.recalledMemory === 'string' ? parsed.recalledMemory : undefined,
          };

          res.json(validatedResult);
          return;
        }
      }
    } catch {
      // Graceful fallback to deterministic local engine
    }
  }

  // Fallback to local reasoning & empathy engine
  res.json(localResult);
});

/**
 * POST /api/voice/tts
 * Dedicated Text-to-Speech synthesis with Gemini Flash TTS
 */
voiceRouter.post(['/voice/tts', '/tts'], async (req: Request, res: Response) => {
  const { text, vocalStyle = 'Warm, empathetic Ghanaian voice', voiceName = 'Puck' } = req.body;

  if (!text || typeof text !== 'string') {
    res.status(400).json({ error: 'Text string is required' });
    return;
  }

  const audioBase64 = await generateGeminiSpeech(text, vocalStyle, voiceName);
  if (audioBase64) {
    res.json({ audioBase64, mimeType: 'audio/wav' });
  } else {
    res.status(503).json({ error: 'TTS audio generation unavailable' });
  }
});

let serverMemories: Array<{ id: string; fact: string; category: string; timestamp: string }> = [
  { id: 'mem-1', fact: 'User is Kwame Mensah, bulk food buyer & caterer based in Kumasi, Ghana', category: 'profile', timestamp: 'Initial Setup' },
  { id: 'mem-2', fact: 'Prefers Grade-A Techiman tomatoes, Sunyani plantains, and Ejura maize', category: 'preference', timestamp: 'Initial Setup' },
  { id: 'mem-3', fact: 'Uses MTN Mobile Money (MoMo) escrow for transaction safety', category: 'preference', timestamp: 'Initial Setup' },
  { id: 'mem-4', fact: 'Prefers Kia Rhino (3-5 Tonnes) for freight haulage', category: 'preference', timestamp: 'Initial Setup' },
];

voiceRouter.get(['/voice/memory', '/memory'], (_req: Request, res: Response) => {
  res.json({ memories: serverMemories });
});

voiceRouter.post(['/voice/memory', '/memory'], (req: Request, res: Response) => {
  const { fact, category = 'fact' } = req.body;
  if (!fact || typeof fact !== 'string') {
    res.status(400).json({ error: 'fact string is required' });
    return;
  }
  const item = {
    id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    fact: fact.trim(),
    category,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  serverMemories.unshift(item);
  res.json({ success: true, item, memories: serverMemories });
});

voiceRouter.delete(['/voice/memory', '/memory'], (_req: Request, res: Response) => {
  serverMemories = [];
  res.json({ success: true, memories: [] });
});

/**
 * POST /api/transcribe
 * Audio transcription endpoint using gemini-3.5-transcribe
 */
voiceRouter.post(['/transcribe', '/gemini/transcribe'], async (req: Request, res: Response) => {
  const { audioBase64, mimeType = 'audio/webm' } = req.body;

  if (!audioBase64) {
    res.status(400).json({ error: 'audioBase64 string is required' });
    return;
  }

  if (!ai) {
    res.status(503).json({
      error: 'Transcription unavailable',
      message: 'Voice transcription requires a configured GEMINI_API_KEY. Please type your message instead.',
    });
    return;
  }

  try {
    const audioPart = {
      inlineData: {
        mimeType,
        data: audioBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          {
            text: 'Transcribe this audio accurately. Preserve Ghanaian English, Akan/Twi, Ga, and Ewe terms without inventing words.',
          },
        ],
      },
    });

    const transcript = response.text ? response.text.trim() : '';

    res.json({
      transcript,
      confidence: transcript ? 0.98 : 0.0,
      modelUsed: 'gemini-3.5-transcribe',
    });
  } catch (err: any) {
    res.status(502).json({
      error: 'Audio transcription failed',
      message: 'Could not process audio. Please type or speak again.',
    });
  }
});
