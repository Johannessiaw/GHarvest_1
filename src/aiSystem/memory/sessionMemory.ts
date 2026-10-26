/**
 * Ɔkwankyerɛfo Pa — Session Memory
 * Manages active in-call or active screen session state.
 * Ephemeral memory cleared when session terminates.
 */

import { StandardIntent, TransactionSessionState, TelecomNetwork } from '../core/aiTypes';

export interface ActiveSession {
  sessionId: string;
  startTime: number;
  lastActiveTime: number;
  currentIntent?: StandardIntent;
  currentScreen: string;
  currentStep?: string;
  transactionState: TransactionSessionState;
  consecutiveClarifications: number;
  dtmfBuffer: string[];
}

export class SessionMemory {
  private static sessions = new Map<string, ActiveSession>();

  public static getOrCreate(sessionId: string, initialScreen = 'HOME'): ActiveSession {
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = {
        sessionId,
        startTime: Date.now(),
        lastActiveTime: Date.now(),
        currentScreen: initialScreen,
        consecutiveClarifications: 0,
        dtmfBuffer: [],
        transactionState: {
          step: 'idle',
          slots: {},
          filledSlots: [],
          missingSlots: [],
          requiresPinAuth: false,
          pinEnteredInSecureLayer: false,
          status: 'draft',
        },
      };
      this.sessions.set(sessionId, session);
    } else {
      session.lastActiveTime = Date.now();
    }
    return session;
  }

  public static updateSession(sessionId: string, updates: Partial<ActiveSession>): ActiveSession {
    const session = this.getOrCreate(sessionId);
    Object.assign(session, updates, { lastActiveTime: Date.now() });
    return session;
  }

  public static updateSlots(sessionId: string, newSlots: Record<string, unknown>): ActiveSession {
    const session = this.getOrCreate(sessionId);
    for (const [key, val] of Object.entries(newSlots)) {
      if (val !== undefined && val !== null && val !== '') {
        session.transactionState.slots[key] = val;
        if (!session.transactionState.filledSlots.includes(key)) {
          session.transactionState.filledSlots.push(key);
        }
      }
    }
    return session;
  }

  public static resetTransaction(sessionId: string): ActiveSession {
    const session = this.getOrCreate(sessionId);
    session.transactionState = {
      step: 'idle',
      slots: {},
      filledSlots: [],
      missingSlots: [],
      requiresPinAuth: false,
      pinEnteredInSecureLayer: false,
      status: 'draft',
    };
    session.currentIntent = undefined;
    session.consecutiveClarifications = 0;
    return session;
  }

  public static clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
}
