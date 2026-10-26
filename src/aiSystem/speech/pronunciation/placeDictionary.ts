/**
 * Ɔkwankyerɛfo Pa — Ghanaian Places & Markets Pronunciation Dictionary
 */

export interface PlacePronunciationRecord {
  displayName: string;
  spokenForm: string;
  region: string;
  phonemes: string;
  aliases: string[];
}

export const GHANAIAN_PLACES_DICTIONARY: Record<string, PlacePronunciationRecord> = {
  techiman: {
    displayName: 'Techiman',
    spokenForm: 'Teh-chee-man',
    region: 'Bono East',
    phonemes: 't e tʃ i m a n',
    aliases: ['Tekiman', 'Techiman Market'],
  },
  kumasi: {
    displayName: 'Kumasi',
    spokenForm: 'Koo-mah-see',
    region: 'Ashanti',
    phonemes: 'k u m a s i',
    aliases: ['K-si', 'Garden City'],
  },
  kejetia: {
    displayName: 'Kejetia',
    spokenForm: 'Keh-jeh-tee-ah',
    region: 'Ashanti',
    phonemes: 'k e dʒ e t i a',
    aliases: ['Kejetia Market'],
  },
  ejura: {
    displayName: 'Ejura',
    spokenForm: 'Eh-joo-rah',
    region: 'Ashanti',
    phonemes: 'e dʒ u r a',
    aliases: ['Ejura Sekyedumase'],
  },
  accra: {
    displayName: 'Accra',
    spokenForm: 'Uh-krah',
    region: 'Greater Accra',
    phonemes: 'ə k r ɑ:',
    aliases: ['Nkran', 'Greater Accra'],
  },
  agbogbloshie: {
    displayName: 'Agbogbloshie',
    spokenForm: 'Ag-bog-blo-shee',
    region: 'Greater Accra',
    phonemes: 'a g b o g b l o ʃ i',
    aliases: ['Agbogbloshie Market'],
  },
  makola: {
    displayName: 'Makola',
    spokenForm: 'Mah-koh-lah',
    region: 'Greater Accra',
    phonemes: 'm a k o l a',
    aliases: ['Makola Market'],
  },
  tamale: {
    displayName: 'Tamale',
    spokenForm: 'Tah-mah-lay',
    region: 'Northern',
    phonemes: 't a m a l e',
    aliases: ['Tamle', 'Gbewaa'],
  },
  somanya: {
    displayName: 'Somanya',
    spokenForm: 'Soh-mahn-yah',
    region: 'Eastern',
    phonemes: 's o m a n j a',
    aliases: ['Somanya Krobo'],
  },
  koforidua: {
    displayName: 'Koforidua',
    spokenForm: 'Koh-foh-ree-doo-ah',
    region: 'Eastern',
    phonemes: 'k o f o r i d u a',
    aliases: ['K-dua', 'KoFTown'],
  },
  takoradi: {
    displayName: 'Takoradi',
    spokenForm: 'Tah-koh-rah-dee',
    region: 'Western',
    phonemes: 't a k o r a d i',
    aliases: ['Taadi', 'Oil City'],
  },
};
