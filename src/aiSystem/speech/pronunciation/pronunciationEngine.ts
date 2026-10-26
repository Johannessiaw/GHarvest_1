/**
 * Ɔkwankyerɛfo Pa — Pronunciation Engine
 * Applies pronunciation dictionary lookups to output text before TTS synthesis.
 */

import { PronunciationLexicon, LexiconRecord } from './pronunciationLexicon';

export interface PronunciationTransformResult {
  originalText: string;
  annotatedText: string;
  hints: Array<{ word: string; phoneme: string; spokenAs: string }>;
}

export class PronunciationEngine {
  public static transform(text: string, mode: 'respelling' | 'ssml' = 'respelling'): PronunciationTransformResult {
    const hints: Array<{ word: string; phoneme: string; spokenAs: string }> = [];
    const words = text.split(/(\s+|,|\.|\?|!|;)/);

    const transformedWords = words.map((chunk) => {
      // Check if chunk is a word
      if (/^[a-zA-ZɛɔƐƆ]+$/.test(chunk)) {
        const rec = PronunciationLexicon.lookup(chunk);
        if (rec) {
          hints.push({
            word: chunk,
            phoneme: rec.phonemes,
            spokenAs: rec.spokenForm,
          });

          if (mode === 'respelling' && rec.category === 'name') {
            // Return phonetic respelling if significantly different
            return chunk; // keep readable display name in standard responses
          }
        }
      }
      return chunk;
    });

    return {
      originalText: text,
      annotatedText: transformedWords.join(''),
      hints,
    };
  }
}
