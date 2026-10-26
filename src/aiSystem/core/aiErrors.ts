/**
 * Ɔkwankyerɛfo Pa — Custom AI Error Hierarchy
 */

export class AISystemError extends Error {
  constructor(message: string, public code: string, public details?: unknown) {
    super(message);
    this.name = 'AISystemError';
  }
}

export class SafetyViolationError extends AISystemError {
  constructor(message: string, public riskLevel: string, details?: unknown) {
    super(message, 'SAFETY_VIOLATION', details);
    this.name = 'SafetyViolationError';
  }
}

export class AmbiguousIntentError extends AISystemError {
  constructor(message: string, public candidateIntents: string[]) {
    super(message, 'AMBIGUOUS_INTENT', { candidateIntents });
    this.name = 'AmbiguousIntentError';
  }
}

export class ActionNotPermittedError extends AISystemError {
  constructor(message: string, public actionType: string) {
    super(message, 'ACTION_NOT_PERMITTED', { actionType });
    this.name = 'ActionNotPermittedError';
  }
}

export class PronunciationLookupError extends AISystemError {
  constructor(message: string, public token: string) {
    super(message, 'PRONUNCIATION_LOOKUP_FAILED', { token });
    this.name = 'PronunciationLookupError';
  }
}
