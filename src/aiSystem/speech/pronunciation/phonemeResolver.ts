/**
 * Ɔkwankyerɛfo Pa — Phoneme Resolver
 * Maps phonetic strings into target provider formats (IPA, SSML phoneme, or respelling).
 */

export class PhonemeResolver {
  public static toSsmlPhoneme(word: string, ipaPhonemes: string): string {
    return `<phoneme alphabet="ipa" ph="${ipaPhonemes}">${word}</phoneme>`;
  }

  public static toSpokenRespelling(spokenForm: string): string {
    return spokenForm;
  }
}
