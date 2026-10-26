/**
 * Ɔkwankyerɛfo Pa — Risk Engine
 * Assigns risk tiers to user intents and action requests.
 */

import { StandardIntent, RiskLevel, ActionRequest } from '../core/aiTypes';
import { ToolRegistry } from '../actions/toolRegistry';

export class RiskEngine {
  public static assessIntentRisk(intent: StandardIntent): RiskLevel {
    switch (intent) {
      case 'SEND_MONEY':
      case 'PAY_BILL':
      case 'CASH_OUT':
      case 'CONFIRM':
        return 'HIGH';

      case 'BUY_AIRTIME':
      case 'BUY_DATA':
      case 'CHANGE_INFORMATION':
        return 'MEDIUM';

      case 'CHECK_BALANCE':
      case 'CHECK_ACCOUNT':
      case 'HELP':
      case 'GO_BACK':
      case 'GO_HOME':
      case 'CANCEL':
      case 'REPEAT':
      case 'DENY':
      default:
        return 'LOW';
    }
  }

  public static assessActionRisk(action?: ActionRequest): RiskLevel {
    if (!action) return 'LOW';
    const def = ToolRegistry.getAction(action.type);
    return def ? def.riskLevel : 'HIGH';
  }
}
