/**
 * Ɔkwankyerɛfo Pa — Pronunciation Lexicon
 * Authoritative lookup combining names, places, telecom, and custom user pronunciations.
 */

import { GHANAIAN_NAMES_DICTIONARY, NamePronunciationRecord } from './nameDictionary';
import { GHANAIAN_PLACES_DICTIONARY, PlacePronunciationRecord } from './placeDictionary';

export interface LexiconRecord {
  term: string;
  spokenForm: string;
  phonemes: string;
  category: 'name' | 'place' | 'telecom' | 'financial' | 'custom';
}

const TELECOM_LEXICON: Record<string, LexiconRecord> = {
  mtn: { term: 'MTN', spokenForm: 'M-T-N', phonemes: 'ɛ m t i: ɛ n', category: 'telecom' },
  telecel: { term: 'Telecel', spokenForm: 'Teh-leh-sel', phonemes: 't e l e s e l', category: 'telecom' },
  at: { term: 'AT', spokenForm: 'A-T', phonemes: 'eɪ t i:', category: 'telecom' },
  momo: { term: 'MoMo', spokenForm: 'Moh-Moh', phonemes: 'm o: m o:', category: 'financial' },
  cedis: { term: 'cedis', spokenForm: 'see-dees', phonemes: 's i: d i: z', category: 'financial' },
  pesewas: { term: 'pesewas', spokenForm: 'peh-seh-wahs', phonemes: 'p e s e w a z', category: 'financial' },
};

export class PronunciationLexicon {
  private static customUserMap = new Map<string, LexiconRecord>();

  public static lookup(token: string): LexiconRecord | undefined {
    const key = token.trim().toLowerCase();

    // 1. Custom user override
    if (this.customUserMap.has(key)) {
      return this.customUserMap.get(key);
    }

    // 2. Telecom / Financial
    if (TELECOM_LEXICON[key]) {
      return TELECOM_LEXICON[key];
    }

    // 3. Names
    if (GHANAIAN_NAMES_DICTIONARY[key]) {
      const rec = GHANAIAN_NAMES_DICTIONARY[key];
      return {
        term: rec.displayName,
        spokenForm: rec.spokenForm,
        phonemes: rec.phonemes,
        category: 'name',
      };
    }

    // 4. Places
    if (GHANAIAN_PLACES_DICTIONARY[key]) {
      const rec = GHANAIAN_PLACES_DICTIONARY[key];
      return {
        term: rec.displayName,
        spokenForm: rec.spokenForm,
        phonemes: rec.phonemes,
        category: 'place',
      };
    }

    return undefined;
  }

  public static registerCustomWord(term: string, spokenForm: string, phonemes = ''): void {
    const key = term.trim().toLowerCase();
    this.customUserMap.set(key, {
      term,
      spokenForm,
      phonemes,
      category: 'custom',
    });
  }
}
