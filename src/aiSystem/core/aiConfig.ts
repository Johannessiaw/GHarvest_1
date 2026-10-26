/**
 * Ɔkwankyerɛfo Pa — AI Configuration
 */

export interface AIConfig {
  version: string;
  defaultLanguage: 'en' | 'ak' | 'en-ak';
  confidenceThresholds: {
    high: number; // >= 0.90 -> safe immediate navigation / action
    medium: number; // 0.60 - 0.89 -> confirm interpretation when necessary
    low: number; // < 0.60 -> clarify
  };
  speech: {
    defaultVoiceProfile: 'ghanaian-male' | 'ghanaian-female';
    defaultSpeechRate: number;
    maxSpeechLengthChars: number;
  };
  safety: {
    strictPinRejection: boolean;
    requireConfirmHighRisk: boolean;
    maxConsecutiveClarifications: number;
  };
  navigation: {
    homeScreen: string;
    momoScreen: string;
    maxHistoryStack: number;
  };
}

export const DEFAULT_AI_CONFIG: AIConfig = {
  version: '2.0.0-okwankyerɛfo-pa',
  defaultLanguage: 'en-ak',
  confidenceThresholds: {
    high: 0.9,
    medium: 0.6,
    low: 0.6,
  },
  speech: {
    defaultVoiceProfile: 'ghanaian-male',
    defaultSpeechRate: 1.0,
    maxSpeechLengthChars: 300,
  },
  safety: {
    strictPinRejection: true,
    requireConfirmHighRisk: true,
    maxConsecutiveClarifications: 3,
  },
  navigation: {
    homeScreen: 'HOME',
    momoScreen: 'MOBILE_MONEY',
    maxHistoryStack: 20,
  },
};
