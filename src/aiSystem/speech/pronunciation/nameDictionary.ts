/**
 * Ɔkwankyerɛfo Pa — Ghanaian Names Pronunciation Dictionary
 * Provider-independent representations of Ghanaian day-names, surnames, and Akan phonology.
 */

export interface NamePronunciationRecord {
  displayName: string;
  spokenForm: string;
  language: 'ak' | 'en' | 'ga' | 'ee';
  phonemes: string;
  aliases: string[];
  gender?: 'male' | 'female';
}

export const GHANAIAN_NAMES_DICTIONARY: Record<string, NamePronunciationRecord> = {
  kwame: {
    displayName: 'Kwame',
    spokenForm: 'Kwah-meh',
    language: 'ak',
    phonemes: 'k w a: m e',
    aliases: ['Kwame', 'Kwami', 'Kwamboy'],
    gender: 'male',
  },
  kofi: {
    displayName: 'Kofi',
    spokenForm: 'Koh-fee',
    language: 'ak',
    phonemes: 'k o: f i',
    aliases: ['Kofi', 'Coffie'],
    gender: 'male',
  },
  ama: {
    displayName: 'Ama',
    spokenForm: 'Ah-mah',
    language: 'ak',
    phonemes: 'a: m a',
    aliases: ['Ama', 'Amma'],
    gender: 'female',
  },
  yaa: {
    displayName: 'Yaa',
    spokenForm: 'Yah-ah',
    language: 'ak',
    phonemes: 'j a:',
    aliases: ['Yaa'],
    gender: 'female',
  },
  abena: {
    displayName: 'Abena',
    spokenForm: 'Ah-beh-nah',
    language: 'ak',
    phonemes: 'a b e n a',
    aliases: ['Abena', 'Abenaa'],
    gender: 'female',
  },
  kwesi: {
    displayName: 'Kwesi',
    spokenForm: 'Kweh-see',
    language: 'ak',
    phonemes: 'k w e s i',
    aliases: ['Kwesi', 'Kwesi boy'],
    gender: 'male',
  },
  kwabena: {
    displayName: 'Kwabena',
    spokenForm: 'Kwah-beh-nah',
    language: 'ak',
    phonemes: 'k w a b e n a',
    aliases: ['Kwabena', 'Kobby'],
    gender: 'male',
  },
  kweku: {
    displayName: 'Kweku',
    spokenForm: 'Kweh-koo',
    language: 'ak',
    phonemes: 'k w e k u',
    aliases: ['Kweku', 'Kuuku'],
    gender: 'male',
  },
  yaw: {
    displayName: 'Yaw',
    spokenForm: 'Yah-oo',
    language: 'ak',
    phonemes: 'j a w',
    aliases: ['Yaw'],
    gender: 'male',
  },
  nhyira: {
    displayName: 'Nhyira',
    spokenForm: 'N-hyeer-ah',
    language: 'ak',
    phonemes: 'n h j i r a',
    aliases: ['Nhyira', 'Nyira'],
  },
  mensah: {
    displayName: 'Mensah',
    spokenForm: 'Men-sah',
    language: 'ak',
    phonemes: 'm e n s a:',
    aliases: ['Mensah'],
  },
  osei: {
    displayName: 'Osei',
    spokenForm: 'Oh-say',
    language: 'ak',
    phonemes: 'o s e i',
    aliases: ['Osei'],
  },
  asante: {
    displayName: 'Asante',
    spokenForm: 'Ah-sahn-teh',
    language: 'ak',
    phonemes: 'a s a n t e',
    aliases: ['Asante', 'Ashanti'],
  },
  boateng: {
    displayName: 'Boateng',
    spokenForm: 'Bwah-teng',
    language: 'ak',
    phonemes: 'b w a t e ŋ',
    aliases: ['Boateng'],
  },
};
