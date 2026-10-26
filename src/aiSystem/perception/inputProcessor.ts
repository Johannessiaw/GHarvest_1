/**
 * Ɔkwankyerɛfo Pa — Unified Input Processor
 * Integrates DTMF telephone key inputs and Spoken Voice/Text into a coherent perception pipeline.
 */

import { InputChannel } from '../core/aiTypes';
import { LanguageDetector } from './languageDetector';
import { InputNormalizer } from './inputNormalizer';
import { NormalizedInputContext, AcousticContext } from './speechContext';

export interface RawInputPayload {
  channel: InputChannel;
  text?: string;
  dtmfDigit?: string;
  acousticFeatures?: AcousticContext;
}

export class InputProcessor {
  public static process(payload: RawInputPayload): NormalizedInputContext {
    const channel = payload.channel;
    let raw = payload.text || '';
    const dtmfDigit = payload.dtmfDigit;

    // Handle DTMF input translation into standard intents/tokens if text is absent
    if (channel === 'dtmf' || (!raw && dtmfDigit)) {
      raw = this.mapDtmfToSemanticToken(dtmfDigit || '');
    }

    const normalizedData = InputNormalizer.normalize(raw);
    const langData = LanguageDetector.detect(normalizedData.normalized);

    const containsGhanaianNames = /\b(kwame|kofi|ama|yaa|abena|kwesi|kwabena|kweku|yaw|mensah|osei|asante|addo|agyeman|boateng|owusu|antwi)\b/i.test(
      normalizedData.normalized
    );

    const containsMonetaryTerms = /\b(cedis?|ghs|amount|pesewas|sika)\b/i.test(
      normalizedData.normalized
    );

    const tokens = normalizedData.normalized
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    return {
      rawInput: payload.text || (dtmfDigit ? `[DTMF ${dtmfDigit}]` : ''),
      normalizedText: normalizedData.normalized,
      channel,
      detectedLanguage: langData.code,
      languageConfidence: langData.confidence,
      isCodeSwitched: langData.isCodeSwitched,
      containsGhanaianNames,
      containsMonetaryTerms,
      dtmfDigit,
      tokens,
    };
  }

  private static mapDtmfToSemanticToken(digit: string): string {
    switch (digit) {
      case '1':
        return 'option 1 select';
      case '2':
        return 'option 2 select';
      case '3':
        return 'option 3 select';
      case '*':
        return 'cancel go back';
      case '#':
        return 'confirm approve';
      case '0':
        return 'help speak to agent';
      default:
        return `dtmf key ${digit}`;
    }
  }
}
