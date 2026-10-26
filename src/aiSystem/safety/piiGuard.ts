/**
 * Ɔkwankyerɛfo Pa — PII & Secret Guard
 * Prevents the AI from ever ingesting, logging, or storing user PINs or banking credentials.
 */

export interface PiiScanResult {
  hasSensitiveSecret: boolean;
  sanitizedText: string;
  detectedSecretType?: 'PIN' | 'PASSWORD' | 'CVV';
  warningPrompt?: string;
}

export class PiiGuard {
  public static scanAndSanitize(input: string): PiiScanResult {
    let text = input;
    let hasSensitiveSecret = false;
    let detectedSecretType: 'PIN' | 'PASSWORD' | 'CVV' | undefined;

    // Detect spoken PIN statements: e.g. "my pin is 1234", "pin 5678", "enter pin"
    const pinRegex = /\b(?:pin|momo\s*pin|secret\s*code|keypad|password)\s*(?:is|:)?\s*(\d{4,6})\b/i;
    const pinMatch = text.match(pinRegex);

    if (pinMatch) {
      hasSensitiveSecret = true;
      detectedSecretType = 'PIN';
      // Redact immediately
      text = text.replace(pinRegex, '[REDACTED_PIN_PROTECTED]');
    }

    // Standalone 4-digit sequence when prompted for confirmation
    const standalonePinRegex = /^\s*(\d{4})\s*$/;
    if (standalonePinRegex.test(text)) {
      hasSensitiveSecret = true;
      detectedSecretType = 'PIN';
      text = '[REDACTED_STANDALONE_PIN]';
    }

    const warningPrompt = hasSensitiveSecret
      ? "For your security, please never speak your PIN aloud to Kofi or the AI. When ready, enter your PIN on your phone's private secure keypad."
      : undefined;

    return {
      hasSensitiveSecret,
      sanitizedText: text,
      detectedSecretType,
      warningPrompt,
    };
  }
}
