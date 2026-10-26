/**
 * Ɔkwankyerɛfo Pa — User Profile & Persistent Memory
 * Stores non-sensitive user preferences:
 * - Preferred spoken name
 * - Pronunciation preference
 * - Preferred language (English, Twi, Ga, Ewe)
 * - Accessibility preferences
 *
 * CRITICAL SECURITY INVARIANT:
 * NEVER stores MoMo PINs, bank credentials, or authentication secrets.
 */

import { UserProfile, SupportedLanguageCode } from '../core/aiTypes';

export class UserProfileStore {
  private static profiles = new Map<string, UserProfile>();

  public static getProfile(userId: string): UserProfile {
    let profile = this.profiles.get(userId);
    if (!profile) {
      profile = {
        id: userId,
        preferredLanguage: 'en-ak',
        displayName: 'Valued Customer',
        accessibilityPreferences: {
          dtmfAssistance: true,
          speechRate: 1.0,
        },
      };
      this.profiles.set(userId, profile);
    }
    return profile;
  }

  public static updatePreferences(
    userId: string,
    updates: Partial<UserProfile>
  ): UserProfile {
    // Security check: strip any illicit secret fields
    const safeUpdates: Partial<UserProfile> = { ...updates };
    delete (safeUpdates as any).pin;
    delete (safeUpdates as any).password;
    delete (safeUpdates as any).secret;

    const current = this.getProfile(userId);
    const updated = { ...current, ...safeUpdates };
    this.profiles.set(userId, updated);
    return updated;
  }

  public static setPronunciationPreference(
    userId: string,
    spokenName: string,
    phoneticGuide?: string
  ): void {
    const profile = this.getProfile(userId);
    profile.preferredSpokenName = spokenName;
    if (phoneticGuide) {
      profile.pronunciationPreference = phoneticGuide;
    }
    this.profiles.set(userId, profile);
  }
}
