/**
 * Ɔkwankyerɛfo Pa — Controlled Action Types
 * Explicit allowlist of permissible actions the AI is allowed to request.
 */

import { RiskLevel } from '../core/aiTypes';

export type ControlledActionType =
  | 'navigate_home'
  | 'navigate_momo'
  | 'navigate_send_money'
  | 'navigate_balance'
  | 'select_network'
  | 'set_recipient'
  | 'set_amount'
  | 'request_confirmation'
  | 'confirm_transaction'
  | 'cancel_transaction'
  | 'go_back'
  | 'repeat_prompt'
  | 'request_help'
  | 'end_session'
  | 'search_marketplace'
  | 'filter_marketplace'
  | 'show_logistics';

export interface ActionDefinition {
  type: ControlledActionType;
  description: string;
  riskLevel: RiskLevel;
  requiresConfirmation: boolean;
  requiredPayloadKeys: string[];
}
