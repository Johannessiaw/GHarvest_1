/**
 * Ɔkwankyerɛfo Pa — Input Normalizer
 * Normalizes mixed Twi/English, Ghanaian currency phrases, spoken digits, and telecom operators.
 */

import { normalizeGhanaianSpeech } from '../../services/ghanaNlp';

export interface NormalizedInput {
  original: string;
  normalized: string;
  detectedTelecom?: 'MTN' | 'Telecel' | 'AT';
  amount?: number;
  currency: 'GHS';
  hasCorrectionCue: boolean;
  correctionType?: 'amount' | 'recipient' | 'network';
}

const TWI_NUMBER_MAP: Record<string, number> = {
  'baako': 1,
  'mmienu': 2,
  'mmiensa': 3,
  'ɛnan': 4,
  'enum': 5,
  'nsia': 6,
  'nson': 7,
  'nwɔtwe': 8,
  'nkron': 9,
  'du': 10,
  'aduonu': 20,
  'aduasa': 30,
  'aduanan': 40,
  'adaduonum': 50,
  'aduonum': 50,
  'aduasia': 60,
  'aduonson': 70,
  'aduowɔtwe': 80,
  'aduonkron': 90,
  'ɔha': 100,
  'apem': 1000,
};

export class InputNormalizer {
  public static normalize(raw: string): NormalizedInput {
    if (!raw) {
      return { original: '', normalized: '', currency: 'GHS', hasCorrectionCue: false };
    }

    let text = raw.trim();

    // 1. First pass through GhanaNLP normalization
    const nlpResult = normalizeGhanaianSpeech(text);
    text = nlpResult.normalized || text;

    // 2. Identify telecom mentions
    let detectedTelecom: 'MTN' | 'Telecel' | 'AT' | undefined;
    if (/\b(mtn|yellow|spacefon)\b/i.test(text)) {
      detectedTelecom = 'MTN';
    } else if (/\b(telecel|vodafone|voda|red)\b/i.test(text)) {
      detectedTelecom = 'Telecel';
    } else if (/\b(airteltigo|airtel|tigo|at money|at)\b/i.test(text)) {
      detectedTelecom = 'AT';
    }

    // 3. Extract and normalize Twi Spoken Numbers to Arabic numerals
    for (const [twiWord, num] of Object.entries(TWI_NUMBER_MAP)) {
      const regex = new RegExp(`\\b${twiWord}\\b`, 'gi');
      if (regex.test(text)) {
        text = text.replace(regex, String(num));
      }
    }

    // 4. Extract amount if present
    let amount: number | undefined;
    const amountMatch = text.match(/\b(?:ghs|gh|cedis?|cedi|¢)?\s*(\d+(?:\.\d{1,2})?)\s*(?:ghs|gh|cedis?|cedi|¢)?\b/i);
    if (amountMatch && amountMatch[1]) {
      const parsed = parseFloat(amountMatch[1]);
      if (!isNaN(parsed) && parsed > 0 && parsed <= 50000) {
        amount = parsed;
      }
    }

    // 5. Detect correction cues
    const hasCorrectionCue =
      /\b(no|actually|sorry|instead|change|not that|make it|sane|sesa|dabi)\b/i.test(text);

    let correctionType: 'amount' | 'recipient' | 'network' | undefined;
    if (hasCorrectionCue) {
      if (/\b(amount|cedis?|ghs|\d+)\b/i.test(text)) {
        correctionType = 'amount';
      } else if (/\b(recipient|person|name|number|phone|kɔma|ma)\b/i.test(text)) {
        correctionType = 'recipient';
      } else if (/\b(network|mtn|telecel|vodafone|at)\b/i.test(text)) {
        correctionType = 'network';
      }
    }

    return {
      original: raw,
      normalized: text,
      detectedTelecom,
      amount,
      currency: 'GHS',
      hasCorrectionCue,
      correctionType,
    };
  }
}
