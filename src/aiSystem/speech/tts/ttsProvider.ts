/**
 * Ɔkwankyerɛfo Pa — Provider-Independent TTS Interface
 * Designed to support Web Speech Synthesis, Ghanaian Local TTS, and Cloud neural TTS interchangeably.
 */

import { SupportedLanguageCode } from '../../core/aiTypes';

export interface TTSRequest {
  text: string;
  language: SupportedLanguageCode;
  voiceProfile: 'ghanaian-male' | 'ghanaian-female' | 'standard';
  pronunciationHints?: Array<{ word: string; phoneme: string; spokenAs: string }>;
  speed?: number;
  pitch?: number;
  provider?: 'browser' | 'ghana-local' | 'cloud';
}

export interface TTSResult {
  audioBuffer?: ArrayBuffer;
  audioBase64?: string;
  durationMs?: number;
  spokenText: string;
  providerUsed: string;
}

export interface TTSProvider {
  id: string;
  name: string;
  synthesize(request: TTSRequest): Promise<TTSResult>;
  isAvailable(): boolean;
}
