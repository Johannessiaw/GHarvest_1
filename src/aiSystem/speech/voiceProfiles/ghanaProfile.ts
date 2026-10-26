/**
 * Ɔkwankyerɛfo Pa — Ghana Voice Profile Registry
 */

import { VoiceProfile, GHANAIAN_MALE_PROFILE, GHANAIAN_FEMALE_PROFILE } from './voiceProfile';

export class GhanaVoiceProfileRegistry {
  private static profiles: Map<string, VoiceProfile> = new Map([
    ['ghanaian-male', GHANAIAN_MALE_PROFILE],
    ['ghanaian-female', GHANAIAN_FEMALE_PROFILE],
  ]);

  public static getProfile(id: 'ghanaian-male' | 'ghanaian-female' | string): VoiceProfile {
    return this.profiles.get(id) || GHANAIAN_MALE_PROFILE;
  }
}
