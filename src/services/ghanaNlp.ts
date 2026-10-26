import { ASR_CORRECTIONS_DICT, GHANAIAN_CROPS, GHANAIAN_TOWNS, GHANAIAN_UNITS } from './ghanaNlpData';

export interface NormalizedResult {
  raw: string;
  normalized: string;
  detectedLanguage: 'en-GH' | 'ak-GH' | 'ga-GH' | 'ee-GH' | 'pcm-GH' | 'mixed';
  correctionsApplied: { from: string; to: string }[];
  entities: {
    crop?: string;
    quantity?: number;
    unit?: string;
    location?: string;
    deliveryDate?: string;
    price?: number;
    currency?: string;
    phone?: string;
  };
  confidence: number;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createSafeRegex(term: string, flags = 'gi'): RegExp {
  const escaped = escapeRegex(term);
  // Word boundaries only work if term starts and ends with alphanumeric word characters
  const startWord = /^\w/.test(term) ? '\\b' : '';
  const endWord = /\w$/.test(term) ? '\\b' : '';
  return new RegExp(`${startWord}${escaped}${endWord}`, flags);
}

/**
 * Normalizes raw speech transcription into verified Ghanaian agricultural terms,
 * applying GhanaNLP phonetic mappings, town resolution, and code-switching interpretation.
 */
export function normalizeGhanaianSpeech(rawText: string): NormalizedResult {
  if (!rawText || !rawText.trim()) {
    return {
      raw: '',
      normalized: '',
      detectedLanguage: 'en-GH',
      correctionsApplied: [],
      entities: {},
      confidence: 1.0,
    };
  }

  let text = rawText.trim();
  const lower = text.toLowerCase();
  const correctionsApplied: { from: string; to: string }[] = [];
  let isTwi = false;
  let isGa = false;
  let isEwe = false;
  let isEnglish = true;

  // 1. Check for Language Markers
  const twiMarkers = ['me pɛ', 'sɛ me', 'aduasa', 'aduanan', 'adaduonum', 'aburo', 'bankye', 'bayere', 'borɔdeɛ', 'wɔ', 'fa kɔ', 'sɛn na', 'akye'];
  for (const marker of twiMarkers) {
    if (lower.includes(marker)) {
      isTwi = true;
      break;
    }
  }

  const gaMarkers = ['ojekoo', 'te oyoo', 'mi tao', 'mi ngɛ', 'amɛ̃', 'ablẽ', 'yele', 'duade', 'amadaa', 'kpakpo shito', 'ekome', 'enyɔ'];
  for (const marker of gaMarkers) {
    if (lower.includes(marker)) {
      isGa = true;
      break;
    }
  }

  const eweMarkers = ['ndi na mi', 'foɛ nyuie', 'me di be', 'teli', 'bli', 'agbleli', 'agbaɖu', 'atadi', 'ɖeka', 'eve', 'etɔ̃'];
  for (const marker of eweMarkers) {
    if (lower.includes(marker)) {
      isEwe = true;
      break;
    }
  }

  // 2. Apply ASR corrections dictionary
  let normalizedText = text;
  // Sort keys by length descending to match multi-word phrases first
  const sortedKeys = Object.keys(ASR_CORRECTIONS_DICT).sort((a, b) => b.length - a.length);

  const TWI_CROP_WORDS = new Set([
    'aburo', 'aburoo', 'bankye', 'bayere', 'bayeri', 'borode', 'borodee', 'mako',
    'gyeene', 'geene', 'emo', 'kooko', 'kookoo', 'nkatie', 'asee', 'mankani',
    'nkruma', 'nsusuwa', 'aborobe'
  ]);

  for (const errorKey of sortedKeys) {
    if (isTwi && TWI_CROP_WORDS.has(errorKey.toLowerCase())) {
      continue;
    }
    try {
      const regex = createSafeRegex(errorKey, 'gi');
      if (regex.test(normalizedText)) {
        const target = ASR_CORRECTIONS_DICT[errorKey];
        normalizedText = normalizedText.replace(regex, target);
        correctionsApplied.push({ from: errorKey, to: target });
      }
    } catch {}
  }

  // 3. Normalize specific town common errors
  for (const town of GHANAIAN_TOWNS) {
    for (const err of town.commonErrors) {
      try {
        const regex = createSafeRegex(err, 'gi');
        if (regex.test(normalizedText)) {
          normalizedText = normalizedText.replace(regex, town.name);
          correctionsApplied.push({ from: err, to: town.name });
        }
      } catch {}
    }
  }

  // 4. Entity Extraction
  const entities: NormalizedResult['entities'] = {};

  // Extract Crop
  for (const crop of GHANAIAN_CROPS) {
    const cropTerms = [crop.name.toLowerCase(), crop.localName.toLowerCase(), crop.twi.toLowerCase()];
    for (const term of cropTerms) {
      if (normalizedText.toLowerCase().includes(term)) {
        entities.crop = crop.name;
        break;
      }
    }
    if (entities.crop) break;
  }

  // Extract Location (Town)
  for (const town of GHANAIAN_TOWNS) {
    const regex = new RegExp(`\\b${town.name}\\b`, 'i');
    if (regex.test(normalizedText)) {
      entities.location = town.name;
      break;
    }
  }

  // Extract Unit
  for (const unit of GHANAIAN_UNITS) {
    const simpleUnitName = unit.name.split(' ')[0].toLowerCase();
    const regex = new RegExp(`\\b(${simpleUnitName}|crates|crate|bags|bag|sacks|sack|tubers|tuber|tonnes|tonne|boxes|box|baskets|basket|load|loads)\\b`, 'i');
    const match = normalizedText.match(regex);
    if (match) {
      entities.unit = match[0].toLowerCase();
      break;
    }
  }

  // Extract Quantity (numbers, both digits and words)
  const numRegex = /\b(\d+)\b/;
  const numMatch = normalizedText.match(numRegex);
  if (numMatch) {
    entities.quantity = parseInt(numMatch[1], 10);
  } else {
    // Check written numbers
    const writtenNumbers: Record<string, number> = {
      'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'ten': 10, 'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50,
      'hundred': 100, 'two hundred': 200, 'three hundred': 300, 'five hundred': 500,
      'thousand': 1000, 'two thousand': 2000, 'five thousand': 5000,
    };
    for (const [word, val] of Object.entries(writtenNumbers)) {
      if (normalizedText.toLowerCase().includes(word)) {
        entities.quantity = val;
        break;
      }
    }
  }

  // Extract Ghana Phone number pattern: e.g. 024..., 055..., 020..., 050..., 027...
  const phoneRegex = /\b(0(?:24|25|53|54|55|59|20|50|27|57|26)\s?\d{3}\s?\d{4})\b/;
  const phoneMatch = normalizedText.match(phoneRegex);
  if (phoneMatch) {
    entities.phone = phoneMatch[0].replace(/\s/g, '');
  }

  // Extract Price / Currency
  const priceRegex = /(?:ghs|gh¢|cedis)\s*(\d+(?:,\d+)?(?:\.\d+)?)/i;
  const priceMatch = normalizedText.match(priceRegex);
  if (priceMatch) {
    entities.price = parseFloat(priceMatch[1].replace(/,/g, ''));
    entities.currency = 'GHS';
  }

  const detectedLanguage = isGa ? 'ga-GH' : isEwe ? 'ee-GH' : isTwi ? (isEnglish ? 'mixed' : 'ak-GH') : 'en-GH';

  return {
    raw: rawText,
    normalized: normalizedText,
    detectedLanguage,
    correctionsApplied,
    entities,
    confidence: correctionsApplied.length > 0 ? 0.95 : 0.88,
  };
}

/**
 * Ghana Phonetic Dictionary for natural Text-To-Speech (TTS)
 * Replaces hard-to-pronounce Ghanaian words with phonetic spellings
 * so standard TTS engines speak with authentic Ghanaian cadence.
 */
export const GHANAIAN_TTS_PRONUNCIATION_MAP: Record<string, string> = {
  'Techiman': 'Teh-chee-mahn',
  'Kumasi': 'Koo-mah-see',
  'Sunyani': 'Soon-yah-nee',
  'Tamale': 'Tah-mah-lay',
  'Ejura': 'Eh-joo-rah',
  'Koforidua': 'Koh-foh-ree-dwah',
  'Takoradi': 'Tah-koh-rah-dee',
  'Atebubu': 'Ah-teh-boo-boo',
  'Nkoranza': 'En-koh-ran-zah',
  'Wenchi': 'Wen-chee',
  'Kejetia': 'Keh-jeh-tee-ah',
  'Agbogbloshie': 'Ah-gbog-bloh-shee',
  'GHarvest': 'G-Harvest',
  'Kofi': 'Koh-fee',
  'Aboagye': 'Ah-bwah-jeh',
  'Aburo': 'Ah-boo-roh',
  'Bankye': 'Bahn-chay',
  'Bayere': 'Bah-yeh-reh',
  'Borode': 'Baw-raw-deh',
  'Mankani': 'Mahn-kah-nee',
  'Nsusuwa': 'En-soo-soo-wah',
  'Ojekoo': 'Oh-jeh-koh',
  'Ndi na mi': 'En-dee nah mee',
  'GHS': 'Ghana cedis',
  'GH₵': 'Ghana cedis',
  'cedis': 'cedis',
};

/**
 * Formats text for Ghanaian speech output
 */
export function prepareGhanaianSpeechText(text: string): string {
  if (!text) return '';
  let output = text;
  // Ensure currency symbols are read aloud as "Ghana cedis" first
  output = output.replace(/GH[₵c]\s*(\d+(?:,\d+)?)/gi, '$1 Ghana cedis');
  output = output.replace(/GHS\s*(\d+(?:,\d+)?)/gi, '$1 Ghana cedis');

  for (const [word, phonetic] of Object.entries(GHANAIAN_TTS_PRONUNCIATION_MAP)) {
    try {
      const regex = createSafeRegex(word, 'g');
      output = output.replace(regex, phonetic);
    } catch {}
  }
  return output;
}

export interface SpeechContinuityResult {
  isIncomplete: boolean;
  isLongConversation: boolean;
  wordCount: number;
  reason?: string;
  recommendedPauseMs: number;
}

/**
 * Analyzes spoken speech in real-time to detect conversational continuation vs completion.
 * Prevents prematurely cutting off users during mid-sentence thinking pauses,
 * compound clauses, or extended conversational narratives.
 */
export function detectSpeechContinuity(rawText: string, defaultPauseMs = 750): SpeechContinuityResult {
  if (!rawText || !rawText.trim()) {
    return {
      isIncomplete: false,
      isLongConversation: false,
      wordCount: 0,
      recommendedPauseMs: defaultPauseMs,
    };
  }

  const text = rawText.trim();
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lastWord = (words[words.length - 1] || '').toLowerCase().replace(/[^a-z0-9ɛɔ]/gi, '');

  // 1. Trailing conjunctions, prepositions, or hesitation markers indicating speaker has more to say:
  // English:
  const ENGLISH_CONTINUATIONS = new Set([
    'and', 'because', 'but', 'so', 'then', 'also', 'or', 'if', 'when', 'while',
    'after', 'before', 'since', 'although', 'though', 'even', 'plus', 'with',
    'for', 'to', 'like', 'as', 'about', 'that', 'which', 'where', 'whose', 'who',
    'actually', 'meanwhile', 'furthermore', 'however', 'uh', 'um', 'er', 'ah', 'well'
  ]);

  // Twi (Akan):
  const TWI_CONTINUATIONS = new Set([
    'na', 'nanso', 'efisɛ', 'efise', 'sɛ', 'se', 'enti', 'afei', 'bio', 'anaa',
    'ne', 'kasa', 'kyerɛ', 'kyere', 'mma', 'wɔ', 'wo', 'mu', 'ho', 'so', 'nso'
  ]);

  // Ghanaian Pidgin:
  const PIDGIN_CONTINUATIONS = new Set([
    'con', 'dey', 'say', 'so tey', 'wey', 'make', 'na so', 'plus', 'for', 'den'
  ]);

  let isIncomplete = false;
  let reason: string | undefined;

  // Check punctuation markers
  if (text.endsWith('...') || text.endsWith('…') || text.endsWith(',') || text.endsWith('—') || text.endsWith('--')) {
    isIncomplete = true;
    reason = 'Trailing hesitation or clause separator';
  } else if (ENGLISH_CONTINUATIONS.has(lastWord) || TWI_CONTINUATIONS.has(lastWord) || PIDGIN_CONTINUATIONS.has(lastWord)) {
    isIncomplete = true;
    reason = `Trailing connecting word "${lastWord}"`;
  }

  // 2. Identify long conversations:
  // User has spoken >= 8 words or multiple sentences/clauses
  const clauseCount = (text.match(/[,;:.!?]|\b(and|because|nanso|efisɛ|enti|but|also)\b/gi) || []).length;
  const isLongConversation = wordCount >= 8 || clauseCount >= 2;

  // Adaptive endpoint calculation:
  // - If user ended on an incomplete connector ("and...", "na..."), give 1800ms to allow them to formulate their thought
  // - If it's a long conversation with multi-clause context, give 1350ms so they can comfortably breathe between sentences
  // - If it's a short, finished utterance ("Tomatoes", "Yes", "Medaase"), give crisp 650ms-750ms
  let recommendedPauseMs = defaultPauseMs;
  if (isIncomplete) {
    recommendedPauseMs = Math.max(1750, Math.round(defaultPauseMs * 2.3));
  } else if (isLongConversation) {
    recommendedPauseMs = Math.max(1250, Math.round(defaultPauseMs * 1.6));
  } else {
    recommendedPauseMs = Math.max(650, defaultPauseMs);
  }

  return {
    isIncomplete,
    isLongConversation,
    wordCount,
    reason,
    recommendedPauseMs,
  };
}

/**
 * Splits long conversational text into natural prosodic chunks for Web Speech API and TTS engines.
 * Solves the Web Speech API 15-second cutoff / memory freeze bug,
 * maintains human breathing cadence, and formats Ghanaian currency/towns cleanly.
 */
export function chunkSpeechForTts(rawText: string, maxChunkLength = 130): string[] {
  if (!rawText || !rawText.trim()) return [];

  // 1. Clean markdown, emojis, HTML, and audio markup tags (<breath>, <sigh>, |yeah|, etc.)
  let text = rawText
    .replace(/<breath>|<sigh>|<laugh>|<gasp>/gi, '')
    .replace(/\|yeah\||\|mhm\|/gi, '')
    .replace(/[*_#`~[\]()]/g, ' ')
    .replace(/https?:\/\/\S+/g, 'link')
    .replace(/\s+/g, ' ')
    .trim();

  // Apply Ghanaian pronunciation and currency formatting to ensure natural phonetics
  text = prepareGhanaianSpeechText(text);

  if (!text) return [];

  // If text is already comfortably short and doesn't contain multiple sentence terminators
  if (text.length <= maxChunkLength && !/[.?!;]\s+[A-Z0-9\u0190\u0186]/i.test(text)) {
    return [text];
  }

  // 2. Primary split: Sentence-level boundaries (. , ? , ! , ;\n)
  const rawSentences = text
    .split(/(?<=[.?!;])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks: string[] = [];

  for (const sentence of rawSentences) {
    if (sentence.length <= maxChunkLength) {
      chunks.push(sentence);
      continue;
    }

    // 3. Secondary split: Clause-level boundaries (commas, dashes, or major conjunctions)
    const clauses = sentence
      .split(/(?<=[,:\u2014\u2013]|\s+-\s+)\s+|(?<=\b(?:and|because|nanso|efisɛ|enti|but|also|so tey)\b)\s+/i)
      .map((c) => c.trim())
      .filter(Boolean);

    let current = '';
    for (const clause of clauses) {
      if (!current) {
        current = clause;
      } else if ((current + ' ' + clause).length <= maxChunkLength) {
        current = current + ' ' + clause;
      } else {
        chunks.push(current);
        current = clause;
      }
    }
    if (current) {
      chunks.push(current);
    }
  }

  // Fallback: If any chunk is still longer than maxChunkLength * 1.5, break cleanly at word boundaries
  const finalChunks: string[] = [];
  for (const chunk of chunks) {
    if (chunk.length <= maxChunkLength * 1.5) {
      finalChunks.push(chunk);
    } else {
      const words = chunk.split(/\s+/);
      let cur = '';
      for (const w of words) {
        if (!cur) {
          cur = w;
        } else if ((cur + ' ' + w).length <= maxChunkLength) {
          cur = cur + ' ' + w;
        } else {
          finalChunks.push(cur + '.');
          cur = w;
        }
      }
      if (cur) finalChunks.push(cur);
    }
  }

  return finalChunks.filter((c) => c.length > 0 && /[a-zA-Z0-9\u00C0-\u024F\u0250-\u02AF]/.test(c));
}

