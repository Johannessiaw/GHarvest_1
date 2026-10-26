/**
 * Ɔkwankyerɛfo Pa — Extensible Intent Engine
 * Accurately classifies user intents across English, Twi/Akan, code-switching, and DTMF.
 */

import { StandardIntent } from '../core/aiTypes';
import { NormalizedInputContext } from '../perception/speechContext';

export interface IntentClassification {
  intent: StandardIntent;
  confidence: number;
  matchedPattern?: string;
  isFallback: boolean;
}

interface IntentPattern {
  intent: StandardIntent;
  patterns: RegExp[];
  twiPatterns: RegExp[];
  baseConfidence: number;
}

const INTENT_PATTERNS: IntentPattern[] = [
  {
    intent: 'SEND_MONEY',
    patterns: [
      /\b(send|transfer|forward|give)\s+(money|funds|cash|cedis?|ghs|\d+)/i,
      /\b(send\s+(?:to|ma|kɔma)|transfer\s+to)\b/i,
      /\b(momo|mobile\s*money)\s*(transfer|send)?\b/i,
    ],
    twiPatterns: [
      /\b(me\s*pɛ\s*sɛ\s*me\s*send|fa\s*kɔma|send.*ma|fa\s*sika.*kɔ|yɛ\s*send\s*money)\b/i,
      /\b(tua\s*sika|soma\s*sika)\b/i,
    ],
    baseConfidence: 0.95,
  },
  {
    intent: 'CHECK_BALANCE',
    patterns: [
      /\b(?:check|show|view|see|what\s+is|tell\s+me)?\s*(?:me\s+)?(?:my\s+)?balance\b/i,
      /\b(how\s+much\s+(?:do\s+I\s+have|is\s+in\s+my\s+account|left))\b/i,
      /\b(account\s+balance|wallet\s+balance)\b/i,
    ],
    twiPatterns: [
      /\b(me\s*pɛ\s*sɛ\s*me\s*check\s*balance|fa\s*me\s*kɔ\s*balance|sika\s*dodoɔ\s*a\s*aka|me\s*balance)\b/i,
      /\b(hwɛ\s*me\s*sika\s*so)\b/i,
    ],
    baseConfidence: 0.96,
  },
  {
    intent: 'BUY_AIRTIME',
    patterns: [
      /\b(buy|purchase|get|top\s*up|recharge)\s+(?:airtime|credit|scratch\s*card)\b/i,
      /\b(airtime|credit\s+top\s*up)\b/i,
    ],
    twiPatterns: [
      /\b(tɔ\s*airtime|tɔ\s*credit|tɔ\s*kredit|me\s*pɛ\s*airtime)\b/i,
    ],
    baseConfidence: 0.95,
  },
  {
    intent: 'BUY_DATA',
    patterns: [
      /\b(buy|purchase|get)\s+(?:data|bundle|internet|gigabytes|mb|gb)\b/i,
      /\b(internet\s+bundle|data\s+package)\b/i,
    ],
    twiPatterns: [
      /\b(tɔ\s*data|tɔ\s*bundle|internet\s*data)\b/i,
    ],
    baseConfidence: 0.95,
  },
  {
    intent: 'PAY_BILL',
    patterns: [
      /\b(pay|settle)\s+(?:bill|ecg|gwcl|water|light|electricity|dstv|gotv)\b/i,
      /\b(utility\s+payment|bill\s+payment)\b/i,
    ],
    twiPatterns: [
      /\b(tua\s*bill|tua\s*light\s*bill|tua\s*ecg|tua\s*nsuo)\b/i,
    ],
    baseConfidence: 0.94,
  },
  {
    intent: 'CASH_OUT',
    patterns: [
      /\b(cash\s*out|withdraw|withdrawal|agent\s+cashout)\b/i,
    ],
    twiPatterns: [
      /\b(gye\s*sika|yi\s*sika\s*firi|cash\s*out)\b/i,
    ],
    baseConfidence: 0.95,
  },
  {
    intent: 'CHECK_ACCOUNT',
    patterns: [
      /\b(my\s+account|account\s+details|profile|account\s+number)\b/i,
    ],
    twiPatterns: [
      /\b(hwɛ\s*me\s*account|me\s*din\s*wɔ\s*mu)\b/i,
    ],
    baseConfidence: 0.92,
  },
  {
    intent: 'CHANGE_INFORMATION',
    patterns: [
      /\b(actually\s+make\s+it|change\s+(?:the\s+)?(?:amount|recipient|number|network)|instead|no\s+I\s+said)\b/i,
      /\b(not\s+(?:that|him|her|this)|correction|correct\s+it)\b/i,
      /^(?:actually|make\s+it|sorry|change)\s+\d+/i,
    ],
    twiPatterns: [
      /\b(sesa\s*no|dane\s*no|dabi\s*ɛnyɛ\s*saa|sesa\s*sika\s*no)\b/i,
    ],
    baseConfidence: 0.97,
  },
  {
    intent: 'GO_BACK',
    patterns: [
      /\b(go\s*back|take\s*me\s*back|back|previous\s*step|previous\s*menu|return)\b/i,
      /^back$/i,
    ],
    twiPatterns: [
      /\b(sane\s*kɔ\s*akyi|san\s*kɔ\s*akyi|kɔ\s*akyi)\b/i,
    ],
    baseConfidence: 0.98,
  },
  {
    intent: 'GO_HOME',
    patterns: [
      /\b(take\s*me\s*home|go\s*home|main\s*menu|start\s*over|beginning)\b/i,
      /^home$/i,
    ],
    twiPatterns: [
      /\b(fa\s*me\s*kɔ\s*home|kɔ\s*fitiaseɛ|mfiaseɛ)\b/i,
    ],
    baseConfidence: 0.98,
  },
  {
    intent: 'CANCEL',
    patterns: [
      /\b(cancel\s*(?:this|transaction|order)?|stop|abort|quit|nevermind|never\s*mind)\b/i,
      /^cancel$/i,
    ],
    twiPatterns: [
      /\b(gyae|mma\s*ɛnkɔ|gyae\s*mu)\b/i,
    ],
    baseConfidence: 0.98,
  },
  {
    intent: 'REPEAT',
    patterns: [
      /\b(repeat|say\s*again|what\s+did\s+you\s+say|pardon|pardon\s*me|come\s*again)\b/i,
    ],
    twiPatterns: [
      /\b(ka\s*bio|ka\s*sane|san\s*ka)\b/i,
    ],
    baseConfidence: 0.97,
  },
  {
    intent: 'CONFIRM',
    patterns: [
      /^(?:yes|yeah|yep|correct|proceed|confirm|ok|okay|sure|approve|continue|send\s*it|do\s*it)$/i,
      /\b(yes\s+please|that\s+is\s+correct|confirm\s+it)\b/i,
    ],
    twiPatterns: [
      /\b(aane|ɛyɛ|yoo|mate|kɔ\s*so|soma)\b/i,
    ],
    baseConfidence: 0.97,
  },
  {
    intent: 'DENY',
    patterns: [
      /^(?:no|nope|do\s*not|don't|stop|reject|wrong|incorrect)$/i,
      /\b(no\s+stop|do\s+not\s+send)\b/i,
    ],
    twiPatterns: [
      /\b(dabi|ɛnyɛ\s*saa|mma\s*ɛnkɔ|dabi\s*koraa)\b/i,
    ],
    baseConfidence: 0.97,
  },
  {
    intent: 'HELP',
    patterns: [
      /\b(help|assist|support|guidance|what\s+can\s+you\s+do|how\s+does\s+this\s+work)\b/i,
      /\b(I\s+don't\s+understand|agent|customer\s*care)\b/i,
    ],
    twiPatterns: [
      /\b(boa\s*me|me\s*hia\s*mmoa|nkyerɛkyerɛ\s*me|mmoa)\b/i,
    ],
    baseConfidence: 0.95,
  },
];

export class IntentEngine {
  public static classify(input: NormalizedInputContext): IntentClassification {
    const text = input.normalizedText.trim().toLowerCase();

    // Check DTMF shortcut digits first
    if (input.dtmfDigit) {
      if (input.dtmfDigit === '*') return { intent: 'CANCEL', confidence: 0.99, isFallback: false };
      if (input.dtmfDigit === '#') return { intent: 'CONFIRM', confidence: 0.99, isFallback: false };
      if (input.dtmfDigit === '0') return { intent: 'HELP', confidence: 0.99, isFallback: false };
    }

    if (!text) {
      return { intent: 'UNKNOWN', confidence: 0.1, isFallback: true };
    }

    // Match across registered pattern matrices
    for (const entry of INTENT_PATTERNS) {
      // 1. Check English/general patterns
      for (const pattern of entry.patterns) {
        if (pattern.test(text)) {
          return {
            intent: entry.intent,
            confidence: entry.baseConfidence,
            matchedPattern: pattern.source,
            isFallback: false,
          };
        }
      }

      // 2. Check Twi/Akan/Code-switched patterns
      for (const twiPattern of entry.twiPatterns) {
        if (twiPattern.test(text)) {
          return {
            intent: entry.intent,
            confidence: entry.baseConfidence + 0.02,
            matchedPattern: twiPattern.source,
            isFallback: false,
          };
        }
      }
    }

    return {
      intent: 'UNKNOWN',
      confidence: 0.4,
      isFallback: true,
    };
  }
}
