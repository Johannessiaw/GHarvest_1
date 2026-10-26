/**
 * Ɔkwankyerɛfo Pa — Speech Context and Channel Metadata
 */

import { InputChannel, SupportedLanguageCode } from '../core/aiTypes';

export interface AcousticContext {
  rmsVariance?: number;
  cadence?: number;
  pauseCount?: number;
  isWhisper?: boolean;
  isShouting?: boolean;
}

export interface NormalizedInputContext {
  rawInput: string;
  normalizedText: string;
  channel: InputChannel;
  detectedLanguage: SupportedLanguageCode;
  languageConfidence: number;
  isCodeSwitched: boolean;
  containsGhanaianNames: boolean;
  containsMonetaryTerms: boolean;
  dtmfDigit?: string;
  tokens: string[];
}
