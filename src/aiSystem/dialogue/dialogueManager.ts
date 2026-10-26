/**
 * Ɔkwankyerɛfo Pa — Dialogue Manager
 * Orchestrates multi-turn conversation progression, slot filling, and confirmation triggers.
 */

import { StandardIntent, SupportedLanguageCode, DialoguePlan, TransactionSessionState, ExtractedEntities } from '../core/aiTypes';
import { SlotManager, SlotRequirement } from './slotManager';
import { ClarificationEngine } from './clarificationEngine';
import { ResponsePlanner } from './responsePlanner';
import { CorrectionResult } from '../understanding/correctionEngine';

export interface DialogueManagementResult {
  plan: DialoguePlan;
  updatedState: TransactionSessionState;
  isReadyForConfirmation: boolean;
  missingSlot?: SlotRequirement;
}

export class DialogueManager {
  public static manageDialogue(
    intent: StandardIntent,
    lang: SupportedLanguageCode,
    currentState: TransactionSessionState,
    entities: ExtractedEntities,
    correctionResult: CorrectionResult
  ): DialogueManagementResult {
    // 1. If correction was made, state was updated by correctionEngine
    let state = correctionResult.isCorrection ? correctionResult.updatedState : currentState;

    // 2. Ingest any newly extracted entities into slots
    state = SlotManager.updateStateWithEntities(state, entities);

    // 3. If user issued a direct navigation, balance check, help, or cancel, resolve directly
    if (['CHECK_BALANCE', 'GO_BACK', 'GO_HOME', 'CANCEL', 'REPEAT', 'HELP', 'DENY'].includes(intent)) {
      const plan = ResponsePlanner.planResponse(
        intent,
        lang,
        state,
        correctionResult.isCorrection ? correctionResult.explanation : undefined
      );
      return {
        plan,
        updatedState: state,
        isReadyForConfirmation: false,
      };
    }

    // 4. For transactional intents (SEND_MONEY, BUY_AIRTIME), check missing slots
    if (['SEND_MONEY', 'BUY_AIRTIME', 'BUY_DATA', 'PAY_BILL'].includes(intent)) {
      state.type = intent.toLowerCase().replace(/_/g, '') as any;
      const nextMissing = SlotManager.findNextMissingSlot(intent, state);

      if (nextMissing) {
        state.step = nextMissing.name as any;
        const prompt = ClarificationEngine.generateSlotPrompt(nextMissing, lang);
        return {
          plan: {
            type: 'REQUEST_NEXT_SLOT',
            response: prompt,
            targetSlot: nextMissing.name,
            promptQuestion: prompt,
          },
          updatedState: state,
          isReadyForConfirmation: false,
          missingSlot: nextMissing,
        };
      }

      // All required slots filled! Prompt user for clear voice confirmation
      state.step = 'review';
      state.status = 'awaiting_confirmation';
      const confirmPrompt = ResponsePlanner.planConfirmationPrompt(intent, lang, state);
      return {
        plan: {
          type: 'CONFIRM_TRANSACTION',
          response: confirmPrompt,
          promptQuestion: confirmPrompt,
        },
        updatedState: state,
        isReadyForConfirmation: true,
      };
    }

    // 5. Default plan
    const plan = ResponsePlanner.planResponse(
      intent,
      lang,
      state,
      correctionResult.isCorrection ? correctionResult.explanation : undefined
    );
    return {
      plan,
      updatedState: state,
      isReadyForConfirmation: false,
    };
  }
}
