/**
 * Ɔkwankyerɛfo Pa — Speech Normalizer
 * Prepares raw text for clear, natural Ghanaian audio pronunciation.
 * Expands currency signs, acronyms, and formats phone numbers for voice-friendly cadence.
 */

export class SpeechNormalizer {
  public static normalizeForSpeech(text: string): string {
    if (!text) return '';

    let out = text;

    // 1. Currency expansions: GHS 50 -> 50 Ghana cedis
    out = out.replace(/\bGHS\s*(\d+(?:\.\d{1,2})?)/gi, '$1 Ghana cedis');
    out = out.replace(/¢\s*(\d+(?:\.\d{1,2})?)/g, '$1 cedis');

    // 2. Acronyms & Telecoms
    out = out.replace(/\bMTN\b/g, 'M-T-N');
    out = out.replace(/\bECG\b/g, 'E-C-G');
    out = out.replace(/\bGWCL\b/g, 'Ghana Water');

    // 3. Spaced Phone Numbers for voice clarity: 0241234567 -> "0 2 4, 1 2 3, 4 5 6 7"
    out = out.replace(/\b(0[25]\d)(\d{3})(\d{4})\b/g, '$1, $2, $3');

    // 4. Remove unpronounceable punctuation or markdown brackets
    out = out.replace(/[#*_[\]]/g, ' ');

    return out.replace(/\s+/g, ' ').trim();
  }
}
