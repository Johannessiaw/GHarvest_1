/**
 * Ɔkwankyerɛfo Pa — Context Manager
 * Unifies session memory, active slots, user profile, and conversation turns.
 */

import { SessionMemory, ActiveSession } from './sessionMemory';
import { ConversationMemory } from './conversationMemory';
import { UserProfileStore } from './userProfile';
import { UserProfile, ConversationTurn } from '../core/aiTypes';

export interface UnifiedContextSnapshot {
  session: ActiveSession;
  recentTurns: ConversationTurn[];
  userProfile: UserProfile;
  activeSlots: Record<string, unknown>;
  currentStep: string;
}

export class ContextManager {
  public static getSnapshot(sessionId: string, userId = 'default-user'): UnifiedContextSnapshot {
    const session = SessionMemory.getOrCreate(sessionId);
    const recentTurns = ConversationMemory.getTurns(sessionId);
    const userProfile = UserProfileStore.getProfile(userId);

    return {
      session,
      recentTurns,
      userProfile,
      activeSlots: { ...session.transactionState.slots },
      currentStep: session.transactionState.step || 'idle',
    };
  }
}
