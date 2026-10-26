/**
 * Ɔkwankyerɛfo Pa — Response Planner
 * Formulates concise, voice-first, culturally authentic Ghanaian responses.
 * Never sounds robotic. Designed for visually impaired and low-literacy users.
 */

import { StandardIntent, SupportedLanguageCode, DialoguePlan, TransactionSessionState } from '../core/aiTypes';

export class ResponsePlanner {
  public static planResponse(
    intent: StandardIntent,
    lang: SupportedLanguageCode,
    state: TransactionSessionState,
    correctionExplanation?: string
  ): DialoguePlan {
    const isTwi = lang === 'ak' || lang === 'tw';

    // 1. If a correction was applied, announce the update and confirm next action
    if (correctionExplanation) {
      const response = isTwi
        ? `Masesa no. Sika no yɛ GHS ${state.slots.amount || 0}. Yɛnkɔ so?`
        : `${correctionExplanation} Should I proceed?`;
      return {
        type: 'CONTINUE_TRANSACTION',
        response,
      };
    }

    // 2. Specific intent responses
    switch (intent) {
      case 'CHECK_BALANCE': {
        const response = isTwi
          ? 'Wo MTN MoMo balance yɛ GHS 1,450.20. Biribi foforɔ wɔ hɔ a mebɛtumi ayɛ ama wo?'
          : 'Your Mobile Money balance is 1,450 Ghana cedis and 20 pesewas. Can I help with anything else?';
        return {
          type: 'INFORM',
          response,
        };
      }

      case 'GO_BACK': {
        const response = isTwi ? 'Masane akɔ akyi.' : 'Taking you back.';
        return {
          type: 'NAVIGATE',
          response,
        };
      }

      case 'GO_HOME': {
        const response = isTwi ? 'Yɛwɔ fie mfiaseɛ.' : 'Taking you to the main home screen.';
        return {
          type: 'NAVIGATE',
          response,
        };
      }

      case 'CANCEL': {
        const response = isTwi ? 'Magyae transaction no.' : 'Transaction cancelled.';
        return {
          type: 'TERMINATE',
          response,
        };
      }

      case 'REPEAT': {
        const response = isTwi
          ? 'Mese: Wopɛ sɛ wosoma sika, hwɛ wo balance, anaa wotɔ airtime?'
          : 'I said: Would you like to send money, check your balance, or buy airtime?';
        return {
          type: 'INFORM',
          response,
        };
      }

      case 'HELP': {
        const response = isTwi
          ? 'Ɔkwankyerɛfo Pa bɛtumi aboa wo ma woasoma sika, atɔ airtime, atua bills, anaa woatɔ nnuane. Kasa kɛkɛ na mebɛtie.'
          : "I am Ɔkwankyerɛfo Pa, your voice guide. You can ask me to send money, buy airtime, pay bills, or order agricultural produce. Just speak naturally.";
        return {
          type: 'INFORM',
          response,
        };
      }

      case 'CONFIRM': {
        const response = isTwi
          ? 'Yoo, merekɔ secure authentication layer no mu ama woagye PIN.'
          : 'Understood. Please authorize the transaction on your secure keypad.';
        return {
          type: 'CONFIRM_TRANSACTION',
          response,
        };
      }

      case 'DENY': {
        const response = isTwi ? 'Yoo, masoɛ mu. Yɛnkɔ fie?' : 'Stopped. Shall we return home?';
        return {
          type: 'TERMINATE',
          response,
        };
      }

      default: {
        const response = isTwi
          ? 'Mete wo nka. Kyerɛ me nea wopɛ sɛ meyɛ ma wo.'
          : 'I am listening. How can I help you today?';
        return {
          type: 'INFORM',
          response,
        };
      }
    }
  }

  public static planConfirmationPrompt(
    intent: StandardIntent,
    lang: SupportedLanguageCode,
    state: TransactionSessionState
  ): string {
    const isTwi = lang === 'ak' || lang === 'tw';
    const amount = state.slots.amount;
    const recipient = state.slots.recipientName || state.slots.recipientPhone || 'recipient';
    const network = state.slots.network || 'Mobile Money';

    if (intent === 'SEND_MONEY') {
      return isTwi
        ? `Wopɛ sɛ wosoma GHS ${amount} kɔma ${recipient} wɔ ${network} so. Yɛnkɔ so?`
        : `You want to send ${amount} Ghana cedis to ${recipient} on ${network}. Should I proceed?`;
    }

    if (intent === 'BUY_AIRTIME') {
      return isTwi
        ? `Wopɛ sɛ wotɔ GHS ${amount} airtime wɔ ${network} so. Yɛnkɔ so?`
        : `You want to buy ${amount} Ghana cedis airtime on ${network}. Should I proceed?`;
    }

    return isTwi ? 'Wopɛ sɛ yɛkɔ so?' : 'Should I continue?';
  }
}
