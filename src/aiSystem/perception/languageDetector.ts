/**
 * Ɔkwankyerɛfo Pa — Language Detector
 * Accurately classifies English, Twi/Akan, Mixed Code-Switching (en-ak), Ga, and Ewe.
 */

import { SupportedLanguageCode } from '../core/aiTypes';

export interface LanguageDetectionResult {
  code: SupportedLanguageCode;
  confidence: number;
  isCodeSwitched: boolean;
  breakdown: {
    englishTokenRatio: number;
    twiTokenRatio: number;
    gaTokenRatio: number;
    eweTokenRatio: number;
  };
}

const TWI_WORDS = new Set([
  'mepɛ', 'me', 'pɛ', 'sɛ', 'kɔma', 'ma', 'kɔ', 'fa', 'aburo', 'bankye', 'bayere', 'borɔdeɛ',
  'ntosi', 'nntosi', 'cedis', 'sika', 'sikaɛ', 'bɔ', 'bɔne', 'papa', 'akwaaba', 'mate',
  'dabi', 'aane', 'yie', 'koraa', 'aduanan', 'adaduonum', 'aduasa', 'aduanan', 'ɔkyena',
  'nkyɛn', 'wo', 'mo', 'yɛ', 'yɛn', 'wɔ', 'sɛn', 'dodo', 'tie', 'kasa', 'nsɛm', 'hwɛ',
  'sesa', 'dane', 'sane', 'san', 'dware', 'tua', 'tɔ', 'tɔn', 'gye', 'gyina', 'nhyira'
]);

const GA_WORDS = new Set([
  'ojekoo', 'te', 'oyoo', 'tɛŋŋ', 'ba', 'ya', 'shika', 'amɛ̃', 'ablẽ', 'yele',
  'ekome', 'enyɔ', 'etɛ', 'ejwɛ', 'enumi', 'ekpaa', 'kpawo', 'kpaanyɔ', 'nɛɛhu', 'nyɔŋma'
]);

const EWE_WORDS = new Set([
  'ndi', 'na', 'mi', 'foɛ', 'nyuie', 'agbleli', 'teli', 'bli', 'ga', 'ɖeka', 'eve', 'etɔ̃', 'ene', 'atɔ̃', 'ade'
]);

export class LanguageDetector {
  public static detect(text: string): LanguageDetectionResult {
    if (!text || !text.trim()) {
      return {
        code: 'en',
        confidence: 0.8,
        isCodeSwitched: false,
        breakdown: { englishTokenRatio: 1, twiTokenRatio: 0, gaTokenRatio: 0, eweTokenRatio: 0 },
      };
    }

    const tokens = text.toLowerCase().replace(/[^a-zɔɛ\s]/g, ' ').split(/\s+/).filter(Boolean);
    if (tokens.length === 0) {
      return {
        code: 'en',
        confidence: 0.8,
        isCodeSwitched: false,
        breakdown: { englishTokenRatio: 1, twiTokenRatio: 0, gaTokenRatio: 0, eweTokenRatio: 0 },
      };
    }

    let twiCount = 0;
    let gaCount = 0;
    let eweCount = 0;
    let englishCount = 0;

    for (const t of tokens) {
      if (TWI_WORDS.has(t)) twiCount++;
      else if (GA_WORDS.has(t)) gaCount++;
      else if (EWE_WORDS.has(t)) eweCount++;
      else englishCount++;
    }

    const total = tokens.length;
    const twiRatio = twiCount / total;
    const gaRatio = gaCount / total;
    const eweRatio = eweCount / total;
    const englishRatio = englishCount / total;

    // Check code-switching (e.g. "Me pɛ sɛ me send 100 kɔma Ama", "Send 50 cedis ma Kwame")
    const isCodeSwitched = (twiCount > 0 && englishCount > 0) || (gaCount > 0 && englishCount > 0);

    let code: SupportedLanguageCode = 'en';
    let confidence = 0.85;

    if (isCodeSwitched && twiRatio >= 0.15) {
      code = 'en-ak';
      confidence = 0.94;
    } else if (twiRatio > 0.5) {
      code = 'ak';
      confidence = 0.95;
    } else if (gaRatio > 0.4) {
      code = 'ga';
      confidence = 0.92;
    } else if (eweRatio > 0.4) {
      code = 'ee';
      confidence = 0.92;
    } else {
      code = 'en';
      confidence = Math.max(0.85, englishRatio);
    }

    return {
      code,
      confidence,
      isCodeSwitched,
      breakdown: {
        englishTokenRatio: englishRatio,
        twiTokenRatio: twiRatio,
        gaTokenRatio: gaRatio,
        eweTokenRatio: eweRatio,
      },
    };
  }
}
