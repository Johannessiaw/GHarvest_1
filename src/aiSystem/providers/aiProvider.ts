/**
 * Ɔkwankyerɛfo Pa — AI Model Provider Interface
 * Decouples reasoning and language model calls from navigation, safety, memory, and transactions.
 */

import { StandardIntent, ExtractedEntities, SupportedLanguageCode } from '../core/aiTypes';

export interface ModelReasoningRequest {
  transcript: string;
  language: SupportedLanguageCode;
  currentScreen?: string;
  activeSlots?: Record<string, unknown>;
  conversationHistory?: Array<{ role: string; text: string }>;
  permanentMemories?: string[];
}

export interface ModelReasoningResponse {
  intent: StandardIntent;
  confidence: number;
  entities: ExtractedEntities;
  reasoning?: string;
  suggestedResponse?: string;
  suggestedAction?: string;
  detectedTone?: 'calm' | 'anxious' | 'urgent' | 'happy' | 'sad';
}

export interface AIProvider {
  id: string;
  name: string;
  reason(request: ModelReasoningRequest): Promise<ModelReasoningResponse>;
  isAvailable(): boolean;
}
