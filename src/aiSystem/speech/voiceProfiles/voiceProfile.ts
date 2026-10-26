/**
 * Ɔkwankyerɛfo Pa — Voice Profile Definitions
 */

export interface VoiceProfile {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female';
  naturalPitch: number;
  naturalRate: number;
  accent: 'ghanaian' | 'standard';
  description: string;
}

export const GHANAIAN_MALE_PROFILE: VoiceProfile = {
  id: 'kofi-ghanaian-male',
  name: 'Kofi (Ɔkwankyerɛfo Pa)',
  language: 'en-GH',
  gender: 'male',
  naturalPitch: 0.95,
  naturalRate: 0.98,
  accent: 'ghanaian',
  description: 'Warm, grounded Ghanaian male voice with authentic cadence and pronunciation.',
};

export const GHANAIAN_FEMALE_PROFILE: VoiceProfile = {
  id: 'ama-ghanaian-female',
  name: 'Ama (Ɔkwankyerɛfo Pa)',
  language: 'en-GH',
  gender: 'female',
  naturalPitch: 1.05,
  naturalRate: 1.0,
  accent: 'ghanaian',
  description: 'Clear, reassuring Ghanaian female voice with melodic Akan intonation.',
};
