/**
 * Ɔkwankyerɛfo Pa — Clarification Engine
 * Generates natural conversational clarification queries when inputs are ambiguous or missing slots.
 */

import { SupportedLanguageCode } from '../core/aiTypes';
import { SlotRequirement } from './slotManager';

export class ClarificationEngine {
  public static generateSlotPrompt(slot: SlotRequirement, lang: SupportedLanguageCode): string {
    const isTwi = lang === 'ak' || lang === 'tw';
    return isTwi ? slot.promptQuestionTw : slot.promptQuestionEn;
  }

  public static generateFallbackPrompt(lang: SupportedLanguageCode): string {
    const isTwi = lang === 'ak' || lang === 'tw';
    return isTwi
      ? 'Mente aseɛ yie. Wopɛ sɛ wosoma sika, hwɛ balance, anaa wotɔ airtime?'
      : 'I did not catch that clearly. Would you like to send money, check your balance, or buy airtime?';
  }

  public static generateAmountClarification(lang: SupportedLanguageCode): string {
    const isTwi = lang === 'ak' || lang === 'tw';
    return isTwi
      ? 'Mente sika dodoɔ no yie. Sika sɛn na wopɛ sɛ wosoma?'
      : "I didn't catch the amount. How much would you like to send?";
  }
}
