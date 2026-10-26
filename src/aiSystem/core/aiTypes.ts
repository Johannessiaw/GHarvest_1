/**
 * Ɔkwankyerɛfo Pa — Central AI System Type Definitions
 * Strict types for perception, understanding, dialogue, navigation, actions, safety, and speech.
 */

export type SupportedLanguageCode = 'en' | 'ak' | 'tw' | 'en-ak' | 'ga' | 'ee' | 'unknown';

export type InputChannel = 'voice' | 'dtmf' | 'text' | 'ivr';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type StandardIntent =
  | 'SEND_MONEY'
  | 'PAY_BILL'
  | 'BUY_AIRTIME'
  | 'BUY_DATA'
  | 'CASH_OUT'
  | 'CHECK_BALANCE'
  | 'CHECK_ACCOUNT'
  | 'HELP'
  | 'GO_BACK'
  | 'GO_HOME'
  | 'CANCEL'
  | 'REPEAT'
  | 'CHANGE_INFORMATION'
  | 'CONFIRM'
  | 'DENY'
  | 'UNKNOWN';

export type TelecomNetwork = 'MTN' | 'Telecel' | 'AT' | 'unknown';

export interface ExtractedEntities {
  recipientName?: string;
  recipientPhone?: string;
  amount?: number;
  currency?: 'GHS' | 'USD';
  network?: TelecomNetwork;
  biller?: string;
  account?: string;
  transactionType?: string;
  location?: string;
  crop?: string;
  quantity?: number;
  unit?: string;
  service?: string;
  confirmation?: boolean;
  correctionSlot?: string;
  rawEntities?: Record<string, unknown>;
}

export interface ConversationTurn {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  intent?: StandardIntent;
  entities?: ExtractedEntities;
}

export interface UserProfile {
  id?: string;
  displayName?: string;
  preferredSpokenName?: string;
  pronunciationPreference?: string;
  preferredLanguage?: SupportedLanguageCode;
  phone?: string;
  primaryNetwork?: TelecomNetwork;
  accessibilityPreferences?: {
    highContrast?: boolean;
    speechRate?: number;
    dtmfAssistance?: boolean;
  };
}

export interface TransactionSessionState {
  transactionId?: string;
  type?: 'send_money' | 'pay_bill' | 'buy_airtime' | 'buy_data' | 'cash_out' | 'escrow_order';
  step?: 'idle' | 'network' | 'recipient' | 'amount' | 'review' | 'authentication' | 'processing' | 'completed' | 'failed' | 'cancelled';
  slots: Record<string, unknown>;
  filledSlots: string[];
  missingSlots: string[];
  requiresPinAuth?: boolean;
  pinEnteredInSecureLayer?: boolean; // AI never sees the actual PIN
  status?: 'draft' | 'awaiting_confirmation' | 'pending_auth' | 'executed' | 'cancelled';
}

export interface NavigationState {
  currentScreen: string;
  currentStep?: string;
  previousScreen?: string;
  allowedTransitions: string[];
  history: string[];
}

export interface SafetyDecision {
  permitted: boolean;
  riskLevel: RiskLevel;
  requiresConfirmation: boolean;
  requiresPinAuth: boolean;
  reason?: string;
  blockedFields?: string[];
}

export interface SpokenSpeechPlan {
  text: string;
  language: SupportedLanguageCode;
  voiceProfile: 'ghanaian-male' | 'ghanaian-female' | 'standard';
  pronunciationHints?: Array<{ word: string; phoneme: string; spokenAs: string }>;
  tone?: 'calm' | 'reassuring' | 'urgent' | 'happy' | 'direct';
  rate?: number;
  pitch?: number;
}

export interface ActionRequest {
  type: string;
  payload: Record<string, unknown>;
  riskLevel: RiskLevel;
  requiresConfirmation: boolean;
}

export interface DialoguePlan {
  type: 'CONTINUE_TRANSACTION' | 'REQUEST_NEXT_SLOT' | 'CONFIRM_TRANSACTION' | 'NAVIGATE' | 'CLARIFY' | 'INFORM' | 'TERMINATE';
  response: string;
  targetSlot?: string;
  promptQuestion?: string;
}

export interface AIProcessInput {
  sessionId: string;
  channel: InputChannel;
  input: string;
  language?: SupportedLanguageCode;
  currentScreen?: string;
  currentStep?: string;
  conversationHistory?: ConversationTurn[];
  transactionState?: TransactionSessionState;
  availableActions?: string[];
  userProfile?: UserProfile;
  dtmfDigit?: string;
  acousticFeatures?: {
    rmsVariance?: number;
    cadence?: number;
    pauseCount?: number;
  };
}

export interface AIProcessOutput {
  intent: StandardIntent;
  confidence: number;
  language: SupportedLanguageCode;
  entities: ExtractedEntities;
  dialogue: DialoguePlan;
  navigation?: {
    action: string;
    targetScreen: string;
    targetStep?: string;
  };
  action?: ActionRequest;
  safety: SafetyDecision;
  speech: SpokenSpeechPlan;
  extractedMemories?: string[];
  latencyMs?: {
    perception: number;
    understanding: number;
    dialogue: number;
    safety: number;
    speech: number;
    total: number;
  };
}
