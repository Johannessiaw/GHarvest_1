/**
 * Ɔkwankyerɛfo Pa — Action Planner
 * Formulates controlled ActionRequest objects for the application execution layer.
 */

import { StandardIntent, ActionRequest, TransactionSessionState, ExtractedEntities } from '../core/aiTypes';
import { ToolRegistry } from './toolRegistry';
import { ControlledActionType } from './actionTypes';

export class ActionPlanner {
  public static planAction(
    intent: StandardIntent,
    state: TransactionSessionState,
    entities: ExtractedEntities,
    isReadyForConfirmation: boolean
  ): ActionRequest | undefined {
    let actionType: ControlledActionType | undefined;
    const payload: Record<string, unknown> = {};

    switch (intent) {
      case 'GO_HOME':
        actionType = 'navigate_home';
        break;

      case 'GO_BACK':
        actionType = 'go_back';
        break;

      case 'CHECK_BALANCE':
        actionType = 'navigate_balance';
        break;

      case 'CANCEL':
        actionType = 'cancel_transaction';
        break;

      case 'REPEAT':
        actionType = 'repeat_prompt';
        break;

      case 'HELP':
        actionType = 'request_help';
        break;

      case 'CONFIRM':
        if (state.status === 'awaiting_confirmation' || isReadyForConfirmation) {
          actionType = 'confirm_transaction';
          payload.amount = state.slots.amount || 0;
          payload.recipientName = state.slots.recipientName;
          payload.recipientPhone = state.slots.recipientPhone;
          payload.network = state.slots.network;
        }
        break;

      case 'SEND_MONEY':
        if (isReadyForConfirmation) {
          actionType = 'request_confirmation';
          payload.amount = state.slots.amount || 0;
          payload.recipientName = state.slots.recipientName;
          payload.recipientPhone = state.slots.recipientPhone;
          payload.network = state.slots.network;
        } else if (entities.network) {
          actionType = 'select_network';
          payload.network = entities.network;
        } else if (entities.recipientName || entities.recipientPhone) {
          actionType = 'set_recipient';
          payload.recipient = entities.recipientName || entities.recipientPhone;
        } else if (entities.amount) {
          actionType = 'set_amount';
          payload.amount = entities.amount;
        } else {
          actionType = 'navigate_send_money';
        }
        break;

      default:
        break;
    }

    if (!actionType) return undefined;

    const def = ToolRegistry.getAction(actionType);
    if (!def) return undefined;

    return {
      type: actionType,
      payload,
      riskLevel: def.riskLevel,
      requiresConfirmation: def.requiresConfirmation,
    };
  }
}
