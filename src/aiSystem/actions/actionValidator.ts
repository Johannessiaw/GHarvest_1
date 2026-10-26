/**
 * Ɔkwankyerɛfo Pa — Action Validator
 * Ensures action requests strictly adhere to registered schemas and invariants.
 */

import { ActionRequest } from '../core/aiTypes';
import { ToolRegistry } from './toolRegistry';
import { ActionNotPermittedError } from '../core/aiErrors';

export class ActionValidator {
  public static validate(action: ActionRequest): boolean {
    const def = ToolRegistry.getAction(action.type);
    if (!def) {
      throw new ActionNotPermittedError(
        `Action "${action.type}" is not registered in Ɔkwankyerɛfo Pa ToolRegistry.`,
        action.type
      );
    }

    // Verify required payload keys
    for (const key of def.requiredPayloadKeys) {
      if (action.payload[key] === undefined || action.payload[key] === null) {
        throw new ActionNotPermittedError(
          `Action "${action.type}" requires payload key "${key}".`,
          action.type
        );
      }
    }

    return true;
  }
}
