/**
 * Ɔkwankyerɛfo Pa — Tool & Action Registry
 * Single authoritative registry of all allowed actions.
 */

import { ControlledActionType, ActionDefinition } from './actionTypes';

export const REGISTERED_ACTIONS: Record<ControlledActionType, ActionDefinition> = {
  navigate_home: {
    type: 'navigate_home',
    description: 'Navigate to the main home overview screen',
    riskLevel: 'LOW',
    requiresConfirmation: false,
    requiredPayloadKeys: [],
  },
  navigate_momo: {
    type: 'navigate_momo',
    description: 'Navigate to Mobile Money hub',
    riskLevel: 'LOW',
    requiresConfirmation: false,
    requiredPayloadKeys: [],
  },
  navigate_send_money: {
    type: 'navigate_send_money',
    description: 'Navigate to Send Money flow',
    riskLevel: 'LOW',
    requiresConfirmation: false,
    requiredPayloadKeys: [],
  },
  navigate_balance: {
    type: 'navigate_balance',
    description: 'Navigate to Balance view',
    riskLevel: 'LOW',
    requiresConfirmation: false,
    requiredPayloadKeys: [],
  },
  select_network: {
    type: 'select_network',
    description: 'Select telecom provider (MTN, Telecel, AT)',
    riskLevel: 'MEDIUM',
    requiresConfirmation: false,
    requiredPayloadKeys: ['network'],
  },
  set_recipient: {
    type: 'set_recipient',
    description: 'Set recipient name or phone number for transaction',
    riskLevel: 'MEDIUM',
    requiresConfirmation: false,
    requiredPayloadKeys: [],
  },
  set_amount: {
    type: 'set_amount',
    description: 'Set monetary amount in GHS',
    riskLevel: 'MEDIUM',
    requiresConfirmation: false,
    requiredPayloadKeys: ['amount'],
  },
  request_confirmation: {
    type: 'request_confirmation',
    description: 'Present transaction review card for user voice or DTMF confirmation',
    riskLevel: 'MEDIUM',
    requiresConfirmation: false,
    requiredPayloadKeys: ['amount'],
  },
  confirm_transaction: {
    type: 'confirm_transaction',
    description: 'Hand off transaction to secure application execution layer for PIN authentication',
    riskLevel: 'HIGH',
    requiresConfirmation: true,
    requiredPayloadKeys: ['amount'],
  },
  cancel_transaction: {
    type: 'cancel_transaction',
    description: 'Cancel the ongoing transaction and reset slots',
    riskLevel: 'LOW',
    requiresConfirmation: false,
    requiredPayloadKeys: [],
  },
  go_back: {
    type: 'go_back',
    description: 'Go back to previous screen in history',
    riskLevel: 'LOW',
    requiresConfirmation: false,
    requiredPayloadKeys: [],
  },
  repeat_prompt: {
    type: 'repeat_prompt',
    description: 'Repeat the last prompt to the user',
    riskLevel: 'LOW',
    requiresConfirmation: false,
    requiredPayloadKeys: [],
  },
  request_help: {
    type: 'request_help',
    description: 'Provide voice guidance and explain available features',
    riskLevel: 'LOW',
    requiresConfirmation: false,
    requiredPayloadKeys: [],
  },
  end_session: {
    type: 'end_session',
    description: 'Conclude the voice/call session gracefully',
    riskLevel: 'LOW',
    requiresConfirmation: false,
    requiredPayloadKeys: [],
  },
  search_marketplace: {
    type: 'search_marketplace',
    description: 'Search agricultural produce',
    riskLevel: 'LOW',
    requiresConfirmation: false,
    requiredPayloadKeys: ['query'],
  },
  filter_marketplace: {
    type: 'filter_marketplace',
    description: 'Filter produce listings by location or price',
    riskLevel: 'LOW',
    requiresConfirmation: false,
    requiredPayloadKeys: [],
  },
  show_logistics: {
    type: 'show_logistics',
    description: 'Show freight transport rates across Ghana',
    riskLevel: 'LOW',
    requiresConfirmation: false,
    requiredPayloadKeys: [],
  },
};

export class ToolRegistry {
  public static getAction(type: string): ActionDefinition | undefined {
    return REGISTERED_ACTIONS[type as ControlledActionType];
  }

  public static isAllowed(type: string): boolean {
    return type in REGISTERED_ACTIONS;
  }
}
