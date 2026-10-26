/**
 * Ɔkwankyerɛfo Pa — Conversation Memory
 * Manages sliding window of recent multi-turn exchanges for conversational continuity.
 */

import { ConversationTurn } from '../core/aiTypes';

export class ConversationMemory {
  private static history = new Map<string, ConversationTurn[]>();
  private static readonly MAX_TURNS = 12;

  public static addTurn(sessionId: string, turn: ConversationTurn): void {
    const turns = this.getTurns(sessionId);
    turns.push(turn);
    if (turns.length > this.MAX_TURNS) {
      turns.shift();
    }
    this.history.set(sessionId, turns);
  }

  public static getTurns(sessionId: string): ConversationTurn[] {
    return this.history.get(sessionId) || [];
  }

  public static getLastUserTurn(sessionId: string): ConversationTurn | undefined {
    const turns = this.getTurns(sessionId);
    for (let i = turns.length - 1; i >= 0; i--) {
      if (turns[i].role === 'user') return turns[i];
    }
    return undefined;
  }

  public static clear(sessionId: string): void {
    this.history.delete(sessionId);
  }
}
