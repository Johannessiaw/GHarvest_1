/**
 * Permanent Voice System Configuration & Persona Store
 * Manages permanent voice personas, speaking parameters, and persistent hands-free mode.
 */

export type VoicePersonaId = 'kofi' | 'ama' | 'kwesi' | 'akosua';

export interface VoicePersona {
  id: VoicePersonaId;
  name: string;
  tagline: string;
  description: string;
  accent: string;
  geminiVoiceName: string; // 'Puck' | 'Kore' | 'Fenrir' | 'Aoede'
  defaultRate: number;
  defaultPitch: number;
  avatarEmoji: string;
  samplePhrase: string;
}

export const VOICE_PERSONAS: Record<VoicePersonaId, VoicePersona> = {
  kofi: {
    id: 'kofi',
    name: 'Kofi',
    tagline: 'Warm Ghanaian Baritone',
    description: 'Grounding, reassuring, authentic Ghanaian accent with natural cadence and comforting pauses.',
    accent: 'Ghanaian English / Akan Inflection',
    geminiVoiceName: 'Puck',
    defaultRate: 1.02,
    defaultPitch: 1.0,
    avatarEmoji: '🇬🇭',
    samplePhrase: 'Akwaaba! I am Kofi. All your harvest orders and payments are secured under escrow.',
  },
  ama: {
    id: 'ama',
    name: 'Ama',
    tagline: 'Ashanti Gentle & Grounded',
    description: 'Soft, melodic, compassionate delivery with deep empathy for farmers and traders.',
    accent: 'Ashanti Ghanaian English',
    geminiVoiceName: 'Kore',
    defaultRate: 0.96,
    defaultPitch: 1.05,
    avatarEmoji: '🌾',
    samplePhrase: 'Hello, take your time. I am right here to help you check produce quality and fair market prices.',
  },
  kwesi: {
    id: 'kwesi',
    name: 'Kwesi',
    tagline: 'Sharp Market Trader',
    description: 'Fast, vibrant, crisp and decisive. Perfect for rapid logistics and high-volume commodity trading.',
    accent: 'Urban Accra / Takoradi Fast Flow',
    geminiVoiceName: 'Fenrir',
    defaultRate: 1.08,
    defaultPitch: 1.02,
    avatarEmoji: '⚡',
    samplePhrase: 'Quick update: 50 bags of maize from Ejura are ready for immediate dispatch to Kejetia!',
  },
  akosua: {
    id: 'akosua',
    name: 'Akosua',
    tagline: 'Expressive Storyteller & Advisor',
    description: 'Articulate, warm, engaging, and rich tone for detailed market insights and agricultural guidance.',
    accent: 'Cultured West African English',
    geminiVoiceName: 'Aoede',
    defaultRate: 0.98,
    defaultPitch: 1.02,
    avatarEmoji: '🌟',
    samplePhrase: 'Let me explain how escrow protection works for your tomato haulage today.',
  },
};

export interface PermanentVoiceConfig {
  permanentModeEnabled: boolean; // Continuous hands-free listener always on across pages
  personaId: VoicePersonaId;
  geminiVoiceName: string;
  rate: number;
  pitch: number;
  deepBreathsEnabled: boolean;
  thinkingAcknowledgmentEnabled: boolean;
  autoSpeakResponses: boolean;
}

const STORAGE_KEY = 'gharvest_kofi_permanent_voice_config_v2';

export const DEFAULT_VOICE_CONFIG: PermanentVoiceConfig = {
  permanentModeEnabled: true, // Permanent continuous voice on by default
  personaId: 'kofi',
  geminiVoiceName: 'Puck',
  rate: 1.02,
  pitch: 1.0,
  deepBreathsEnabled: true,
  thinkingAcknowledgmentEnabled: true,
  autoSpeakResponses: true,
};

export class PermanentVoiceStore {
  private static cachedConfig: PermanentVoiceConfig | null = null;

  public static getConfig(): PermanentVoiceConfig {
    if (typeof window === 'undefined') return DEFAULT_VOICE_CONFIG;

    if (this.cachedConfig) return this.cachedConfig;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const loaded: PermanentVoiceConfig = { ...DEFAULT_VOICE_CONFIG, ...parsed };
        this.cachedConfig = loaded;
        return loaded;
      }
    } catch (e) {
      console.warn('Failed to load permanent voice config:', e);
    }

    const fallback: PermanentVoiceConfig = { ...DEFAULT_VOICE_CONFIG };
    this.cachedConfig = fallback;
    this.saveConfig(fallback);
    return fallback;
  }

  public static saveConfig(config: PermanentVoiceConfig): void {
    if (typeof window === 'undefined') return;
    this.cachedConfig = config;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      window.dispatchEvent(new CustomEvent('kofi-voice-config-updated', { detail: config }));
    } catch (e) {
      console.warn('Failed to save permanent voice config:', e);
    }
  }

  public static updateConfig(partial: Partial<PermanentVoiceConfig>): PermanentVoiceConfig {
    const current = this.getConfig();
    const updated = { ...current, ...partial };
    this.saveConfig(updated);
    return updated;
  }

  public static setPersona(personaId: VoicePersonaId): PermanentVoiceConfig {
    const persona = VOICE_PERSONAS[personaId] || VOICE_PERSONAS.kofi;
    return this.updateConfig({
      personaId,
      geminiVoiceName: persona.geminiVoiceName,
      rate: persona.defaultRate,
      pitch: persona.defaultPitch,
    });
  }

  public static togglePermanentMode(): boolean {
    const current = this.getConfig();
    const nextState = !current.permanentModeEnabled;
    this.updateConfig({ permanentModeEnabled: nextState });
    return nextState;
  }
}
