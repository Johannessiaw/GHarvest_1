/**
 * Ɔkwankyerɛfo Pa — Route Resolver & Navigation Planner
 * Resolves natural language commands into controlled navigation actions on the navigation graph.
 */

import { StandardIntent } from '../core/aiTypes';
import { NAVIGATION_GRAPH, NavigationNode } from './navigationGraph';

export interface NavigationPlanResult {
  targetNode: NavigationNode;
  actionName: string;
  appRoute: string; // maps to current app router ('home' | 'marketplace' | 'orders' | 'logistics')
  step?: string;
  isAllowed: boolean;
}

export class NavigationPlanner {
  public static planNavigation(
    intent: StandardIntent,
    currentNodeId = 'HOME',
    history: string[] = ['HOME']
  ): NavigationPlanResult {
    let targetNodeId = currentNodeId;

    switch (intent) {
      case 'GO_HOME':
        targetNodeId = 'HOME';
        break;

      case 'GO_BACK': {
        if (history.length > 1) {
          targetNodeId = history[history.length - 2];
        } else {
          targetNodeId = 'HOME';
        }
        break;
      }

      case 'SEND_MONEY':
        targetNodeId = 'SEND_MONEY';
        break;

      case 'CHECK_BALANCE':
        targetNodeId = 'MOBILE_MONEY';
        break;

      case 'BUY_AIRTIME':
      case 'BUY_DATA':
        targetNodeId = 'MOBILE_MONEY';
        break;

      case 'CONFIRM':
        if (currentNodeId === 'CONFIRMATION') {
          targetNodeId = 'SECURE_AUTHENTICATION';
        }
        break;

      case 'CANCEL':
      case 'DENY':
        targetNodeId = 'HOME';
        break;

      default:
        targetNodeId = currentNodeId;
        break;
    }

    const node = NAVIGATION_GRAPH[targetNodeId] || NAVIGATION_GRAPH.HOME;

    return {
      targetNode: node,
      actionName: `NAVIGATE_${node.id}`,
      appRoute: node.screenRoute,
      step: node.step,
      isAllowed: true,
    };
  }
}
