/**
 * Ɔkwankyerɛfo Pa — Correction Engine
 * Handles natural conversational corrections gracefully.
 * Modifies ONLY the affected slot without wiping the rest of the transaction.
 */

import { TransactionSessionState, ExtractedEntities } from '../core/aiTypes';
import { NormalizedInputContext } from '../perception/speechContext';

export interface CorrectionResult {
  isCorrection: boolean;
  modifiedSlot?: string;
  previousValue?: unknown;
  newValue?: unknown;
  updatedState: TransactionSessionState;
  explanation: string;
}

export class CorrectionEngine {
  public static applyCorrection(
    currentState: TransactionSessionState,
    input: NormalizedInputContext,
    newEntities: ExtractedEntities
  ): CorrectionResult {
    const text = input.normalizedText.toLowerCase();

    // Check if user is issuing a correction
    const isExplicitCorrection =
      /\b(no|actually|sorry|instead|change|not that|make it|sane|sesa|dabi|that's not|wrong)\b/i.test(
        text
      );

    if (!isExplicitCorrection && !newEntities.correctionSlot) {
      return {
        isCorrection: false,
        updatedState: currentState,
        explanation: 'No correction detected.',
      };
    }

    const updatedState: TransactionSessionState = {
      ...currentState,
      slots: { ...currentState.slots },
      filledSlots: [...currentState.filledSlots],
    };

    // 1. Amount correction: e.g. "No, I said 200", "Actually make it 200", "Change the amount to 50"
    if (newEntities.amount !== undefined) {
      const prev = updatedState.slots.amount;
      updatedState.slots.amount = newEntities.amount;
      if (!updatedState.filledSlots.includes('amount')) {
        updatedState.filledSlots.push('amount');
      }
      return {
        isCorrection: true,
        modifiedSlot: 'amount',
        previousValue: prev,
        newValue: newEntities.amount,
        updatedState,
        explanation: `Updated amount to ${newEntities.amount} GHS without changing other details.`,
      };
    }

    // 2. Recipient correction: e.g. "Actually send it to Ama", "No, I said Ama"
    if (newEntities.recipientName) {
      const prev = updatedState.slots.recipientName;
      updatedState.slots.recipientName = newEntities.recipientName;
      if (!updatedState.filledSlots.includes('recipientName')) {
        updatedState.filledSlots.push('recipientName');
      }
      return {
        isCorrection: true,
        modifiedSlot: 'recipientName',
        previousValue: prev,
        newValue: newEntities.recipientName,
        updatedState,
        explanation: `Changed recipient to ${newEntities.recipientName}.`,
      };
    }

    // 3. Phone correction: e.g. "That's not the right number, use 0244567891"
    if (newEntities.recipientPhone) {
      const prev = updatedState.slots.recipientPhone;
      updatedState.slots.recipientPhone = newEntities.recipientPhone;
      if (!updatedState.filledSlots.includes('recipientPhone')) {
        updatedState.filledSlots.push('recipientPhone');
      }
      return {
        isCorrection: true,
        modifiedSlot: 'recipientPhone',
        previousValue: prev,
        newValue: newEntities.recipientPhone,
        updatedState,
        explanation: `Updated recipient phone to ${newEntities.recipientPhone}.`,
      };
    }

    // 4. Network correction: e.g. "Sorry, I meant Telecel", "Change network to MTN"
    if (newEntities.network && newEntities.network !== 'unknown') {
      const prev = updatedState.slots.network;
      updatedState.slots.network = newEntities.network;
      if (!updatedState.filledSlots.includes('network')) {
        updatedState.filledSlots.push('network');
      }
      return {
        isCorrection: true,
        modifiedSlot: 'network',
        previousValue: prev,
        newValue: newEntities.network,
        updatedState,
        explanation: `Switched network to ${newEntities.network}.`,
      };
    }

    return {
      isCorrection: false,
      updatedState: currentState,
      explanation: 'Unrecognized correction slot.',
    };
  }
}
