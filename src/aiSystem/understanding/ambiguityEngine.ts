/**
 * Ɔkwankyerɛfo Pa — Ambiguity Engine
 * Resolves underspecified requests into targeted options rather than guessing.
 */

import { StandardIntent } from '../core/aiTypes';
import { NormalizedInputContext } from '../perception/speechContext';

export interface AmbiguityResult {
  isAmbiguous: boolean;
  possibleIntents: StandardIntent[];
  clarificationPrompt?: string;
  clarificationPromptTwi?: string;
}

export class AmbiguityEngine {
  public static checkAmbiguity(input: NormalizedInputContext): AmbiguityResult {
    const text = input.normalizedText.toLowerCase().trim();

    // Example: "Take me to the money thing" / "money" / "sika no"
    if (/^(?:take\s+me\s+to\s+the\s+)?money(?:\s+thing)?$/i.test(text) || text === 'sika' || text === 'momo') {
      return {
        isAmbiguous: true,
        possibleIntents: ['SEND_MONEY', 'CHECK_BALANCE', 'BUY_AIRTIME'],
        clarificationPrompt: 'Do you want to send money, check your balance, or buy airtime?',
        clarificationPromptTwi: 'Wopɛ sɛ wosoma sika, hwɛ wo balance, anaa wotɔ airtime?',
      };
    }

    // Example: "pay" / "payment" without specifying bill or recipient
    if (/^(?:pay|make\s+payment|payment|tua\s*sika)$/i.test(text)) {
      return {
        isAmbiguous: true,
        possibleIntents: ['SEND_MONEY', 'PAY_BILL'],
        clarificationPrompt: 'Would you like to pay an electricity or water bill, or send money to someone?',
        clarificationPromptTwi: 'Wopɛ sɛ wotua light/nsuo bill, anaa wode sika soma obi?',
      };
    }

    // Example: "account"
    if (/^(?:account|my\s+account)$/i.test(text)) {
      return {
        isAmbiguous: true,
        possibleIntents: ['CHECK_BALANCE', 'CHECK_ACCOUNT'],
        clarificationPrompt: 'Would you like to check your balance or view your account profile?',
        clarificationPromptTwi: 'Wopɛ sɛ wohwɛ wo balance anaa wo account ho nsɛm?',
      };
    }

    return {
      isAmbiguous: false,
      possibleIntents: [],
    };
  }
}
