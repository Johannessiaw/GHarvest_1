/**
 * Ɔkwankyerɛfo Pa — Transaction Guard
 * Core Architectural Gate:
 * Enforces that the AI only produces an ActionRequest.
 * It NEVER calls external banking/payment APIs directly, NEVER handles raw PINs,
 * and passes the validated payload to the secure application transaction orchestrator.
 */

import { ActionRequest, SafetyDecision } from '../core/aiTypes';
import { ActionValidator } from '../actions/actionValidator';
import { ConfirmationGuard } from './confirmationGuard';
import { PiiGuard } from './piiGuard';

export class TransactionGuard {
  public static evaluate(
    action: ActionRequest | undefined,
    userConfirmationGiven: boolean
  ): SafetyDecision {
    if (!action) {
      return {
        permitted: true,
        riskLevel: 'LOW',
        requiresConfirmation: false,
        requiresPinAuth: false,
      };
    }

    // 1. Check if action payload contains illicit secrets (PINs)
    const stringified = JSON.stringify(action.payload);
    const piiResult = PiiGuard.scanAndSanitize(stringified);
    if (piiResult.hasSensitiveSecret) {
      return {
        permitted: false,
        riskLevel: 'HIGH',
        requiresConfirmation: false,
        requiresPinAuth: false,
        reason: 'Illicit credential/PIN pattern found in action payload. Execution blocked.',
      };
    }

    // 2. Validate action registry allowlist and required keys
    try {
      ActionValidator.validate(action);
    } catch (err: any) {
      return {
        permitted: false,
        riskLevel: 'HIGH',
        requiresConfirmation: false,
        requiresPinAuth: false,
        reason: err.message,
      };
    }

    // 3. Evaluate confirmation requirement
    const confirmationDecision = ConfirmationGuard.verifyConfirmation(action, userConfirmationGiven);
    return confirmationDecision;
  }
}
