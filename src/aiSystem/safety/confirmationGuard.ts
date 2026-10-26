/**
 * Ɔkwankyerɛfo Pa — Confirmation Guard
 * Ensures high-risk operations cannot proceed without explicit user confirmation.
 */

import { ActionRequest, SafetyDecision } from '../core/aiTypes';
import { RiskEngine } from './riskEngine';

export class ConfirmationGuard {
  public static verifyConfirmation(
    action: ActionRequest,
    isConfirmedByUser: boolean
  ): SafetyDecision {
    const riskLevel = RiskEngine.assessActionRisk(action);

    if (riskLevel === 'HIGH') {
      if (!isConfirmedByUser) {
        return {
          permitted: false,
          riskLevel: 'HIGH',
          requiresConfirmation: true,
          requiresPinAuth: true,
          reason: 'High-risk financial action requires explicit spoken or DTMF confirmation before auth handoff.',
        };
      }
    }

    return {
      permitted: true,
      riskLevel,
      requiresConfirmation: false,
      requiresPinAuth: riskLevel === 'HIGH',
    };
  }
}
