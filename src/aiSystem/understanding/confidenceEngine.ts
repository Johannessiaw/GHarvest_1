/**
 * Ɔkwankyerɛfo Pa — Confidence Engine
 * Policy:
 * >= 0.90: Execute safe action or navigation immediately.
 * 0.60 - 0.89: Confirm interpretation with user.
 * < 0.60: Ask targeted clarification question.
 */

export type ConfidenceTier = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ConfidenceAssessment {
  score: number;
  tier: ConfidenceTier;
  recommendedAction: 'EXECUTE' | 'CONFIRM' | 'CLARIFY';
  reasoning: string;
}

export class ConfidenceEngine {
  public static assess(
    intentConfidence: number,
    hasEntities: boolean,
    isAmbiguous: boolean
  ): ConfidenceAssessment {
    let score = intentConfidence;

    if (isAmbiguous) {
      score = Math.min(score, 0.55);
    } else if (hasEntities) {
      score = Math.min(1.0, score + 0.05);
    }

    if (score >= 0.9) {
      return {
        score,
        tier: 'HIGH',
        recommendedAction: 'EXECUTE',
        reasoning: 'High confidence. Safe to proceed or execute navigation immediately.',
      };
    } else if (score >= 0.6) {
      return {
        score,
        tier: 'MEDIUM',
        recommendedAction: 'CONFIRM',
        reasoning: 'Moderate confidence. Confirm user interpretation before continuing.',
      };
    } else {
      return {
        score,
        tier: 'LOW',
        recommendedAction: 'CLARIFY',
        reasoning: 'Low confidence or ambiguity detected. Clarification question required.',
      };
    }
  }
}
