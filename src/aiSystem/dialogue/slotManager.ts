/**
 * Ɔkwankyerɛfo Pa — Slot Manager
 * Tracks required slots for transactions and determines the next missing piece of information.
 */

import { StandardIntent, TransactionSessionState, ExtractedEntities } from '../core/aiTypes';

export interface SlotRequirement {
  name: string;
  type: 'string' | 'number' | 'telecom' | 'phone';
  promptQuestionEn: string;
  promptQuestionTw: string;
  validationRegex?: RegExp;
}

const SEND_MONEY_SLOTS: SlotRequirement[] = [
  {
    name: 'network',
    type: 'telecom',
    promptQuestionEn: 'Which network? MTN, Telecel, or AT?',
    promptQuestionTw: 'Network bɛn na wopɛ sɛ wode kɔ? MTN, Telecel, anaa AT?',
  },
  {
    name: 'recipient',
    type: 'string',
    promptQuestionEn: 'Who do you want to send the money to?',
    promptQuestionTw: 'Hwan na wopɛ sɛ wosoma sika no kɔma no?',
  },
  {
    name: 'amount',
    type: 'number',
    promptQuestionEn: 'How much would you like to send?',
    promptQuestionTw: 'Sika dodoɔ sɛn na wopɛ sɛ wosoma?',
  },
];

const BUY_AIRTIME_SLOTS: SlotRequirement[] = [
  {
    name: 'network',
    type: 'telecom',
    promptQuestionEn: 'Which network do you want airtime for?',
    promptQuestionTw: 'Network bɛn airtime na wopɛ sɛ wotɔ?',
  },
  {
    name: 'amount',
    type: 'number',
    promptQuestionEn: 'How much airtime do you want to buy?',
    promptQuestionTw: 'Airtime bɛyɛ sɛn na wopɛ sɛ wotɔ?',
  },
];

export class SlotManager {
  public static getRequiredSlots(intent: StandardIntent): SlotRequirement[] {
    switch (intent) {
      case 'SEND_MONEY':
        return SEND_MONEY_SLOTS;
      case 'BUY_AIRTIME':
      case 'BUY_DATA':
        return BUY_AIRTIME_SLOTS;
      default:
        return [];
    }
  }

  public static updateStateWithEntities(
    state: TransactionSessionState,
    entities: ExtractedEntities
  ): TransactionSessionState {
    const updated: TransactionSessionState = {
      ...state,
      slots: { ...state.slots },
      filledSlots: [...state.filledSlots],
      missingSlots: [],
    };

    if (entities.network && entities.network !== 'unknown') {
      updated.slots.network = entities.network;
      if (!updated.filledSlots.includes('network')) updated.filledSlots.push('network');
    }

    if (entities.recipientName) {
      updated.slots.recipientName = entities.recipientName;
      if (!updated.filledSlots.includes('recipient')) updated.filledSlots.push('recipient');
    }

    if (entities.recipientPhone) {
      updated.slots.recipientPhone = entities.recipientPhone;
      if (!updated.filledSlots.includes('recipient')) updated.filledSlots.push('recipient');
    }

    if (entities.amount !== undefined && entities.amount > 0) {
      updated.slots.amount = entities.amount;
      if (!updated.filledSlots.includes('amount')) updated.filledSlots.push('amount');
    }

    return updated;
  }

  public static findNextMissingSlot(
    intent: StandardIntent,
    state: TransactionSessionState
  ): SlotRequirement | null {
    const requirements = this.getRequiredSlots(intent);
    for (const req of requirements) {
      if (req.name === 'recipient') {
        if (!state.slots.recipientName && !state.slots.recipientPhone) {
          return req;
        }
      } else if (!state.slots[req.name]) {
        return req;
      }
    }
    return null;
  }
}
