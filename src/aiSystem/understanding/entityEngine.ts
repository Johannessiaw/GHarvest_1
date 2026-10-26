/**
 * Ɔkwankyerɛfo Pa — Entity Engine
 * Extracts recipients, Ghanaian phone numbers, monetary amounts, telecom carriers, and billers.
 */

import { ExtractedEntities, TelecomNetwork } from '../core/aiTypes';
import { NormalizedInputContext } from '../perception/speechContext';

const GHANA_NAMES = [
  'Kwame', 'Ama', 'Kofi', 'Yaa', 'Abena', 'Kwesi', 'Kwabena', 'Kweku', 'Yaw',
  'Akua', 'Afia', 'Kojo', 'Mensah', 'Osei', 'Asante', 'Addo', 'Agyeman',
  'Boateng', 'Owusu', 'Antwi', 'Appiah', 'Dankwa', 'Acheampong', 'Frimpong',
  'Sarkodie', 'Aboagye', 'Boadu', 'Nhyira', 'Adwoa', 'Gifty', 'Emmanuel'
];

export class EntityEngine {
  public static extract(input: NormalizedInputContext): ExtractedEntities {
    const text = input.normalizedText;
    const entities: ExtractedEntities = {
      currency: 'GHS',
    };

    // 1. Ghanaian Mobile Phone Number extraction (e.g. 0241234567, 055 456 7891, +233 24 123 4567)
    const phoneMatch = text.match(/(?:\+?233|0)[25]\d[\s-]?\d{3}[\s-]?\d{4}/);
    if (phoneMatch) {
      const cleanPhone = phoneMatch[0].replace(/[\s-]/g, '').replace(/^\+233/, '0');
      entities.recipientPhone = cleanPhone;
    }

    // 2. Amount Extraction (e.g. "50 cedis", "100 GHS", "send 200", "make it 200")
    const amountRegex = /\b(?:send|transfer|pay|top\s*up|make\s*it|actually|change\s+to)?\s*(?:ghs|gh|cedis?|cedi|¢)?\s*(\d+(?:\.\d{1,2})?)\s*(?:ghs|gh|cedis?|cedi|¢)?\b/i;
    const amountMatch = text.match(amountRegex);
    if (amountMatch && amountMatch[1]) {
      const val = parseFloat(amountMatch[1]);
      if (!isNaN(val) && val > 0 && val <= 50000) {
        entities.amount = val;
      }
    }

    // 3. Recipient Name Extraction (e.g. "to Kwame", "kɔma Ama", "ma Kofi", "send it to Ama")
    const STOP_WORDS = new Set([
      'send', 'transfer', 'buy', 'pay', 'check', 'the', 'where', 'a', 'an', 'my', 'me',
      'our', 'his', 'her', 'this', 'that', 'someone', 'somebody', 'money', 'funds',
      'cash', 'airtime', 'data', 'balance', 'momo', 'cedis', 'ghs', 'it', 'be', 'do', 'go'
    ]);
    const namePattern = new RegExp(`\\b(?:to|ma|kɔma|send\\s+(?:it\\s+)?to)\\s+([a-zA-ZɛɔƐƆ]+)\\b`, 'i');
    const nameMatch = text.match(namePattern);
    if (nameMatch && nameMatch[1] && !STOP_WORDS.has(nameMatch[1].trim().toLowerCase())) {
      const candidate = nameMatch[1].trim();
      const properName = candidate.charAt(0).toUpperCase() + candidate.slice(1).toLowerCase();
      entities.recipientName = properName;
    } else {
      // Direct name check from registered name lexicon
      for (const known of GHANA_NAMES) {
        const regex = new RegExp(`\\b${known}\\b`, 'i');
        if (regex.test(text)) {
          entities.recipientName = known;
          break;
        }
      }
    }

    // 4. Telecom Network Detection
    let network: TelecomNetwork = 'unknown';
    if (/\b(mtn|yellow|spacefon)\b/i.test(text)) {
      network = 'MTN';
    } else if (/\b(telecel|vodafone|voda)\b/i.test(text)) {
      network = 'Telecel';
    } else if (/\b(airteltigo|airtel|tigo|at\s*money|at)\b/i.test(text)) {
      network = 'AT';
    }
    if (network !== 'unknown') {
      entities.network = network;
    }

    // 5. Biller / Utility Extraction
    if (/\b(ecg|electricity|light\s*bill|prepaid)\b/i.test(text)) {
      entities.biller = 'Electricity Company of Ghana (ECG)';
    } else if (/\b(gwcl|water\s*bill|water)\b/i.test(text)) {
      entities.biller = 'Ghana Water Company (GWCL)';
    } else if (/\b(dstv|multichoice)\b/i.test(text)) {
      entities.biller = 'DStv Ghana';
    } else if (/\b(gotv)\b/i.test(text)) {
      entities.biller = 'GOtv Ghana';
    }

    // 6. Confirmation / Denial
    if (/^(?:yes|yeah|yep|confirm|proceed|okay|sure|aane|yoo|mate)$/i.test(text.trim())) {
      entities.confirmation = true;
    } else if (/^(?:no|nope|cancel|stop|dabi|reject)$/i.test(text.trim())) {
      entities.confirmation = false;
    }

    // 7. Correction Slot Target Identification
    if (/\b(amount|cedis?|ghs|\d+)\b/i.test(text) && /\b(instead|actually|change|no)\b/i.test(text)) {
      entities.correctionSlot = 'amount';
    } else if (/\b(name|person|recipient|to)\b/i.test(text) && /\b(instead|actually|change|no)\b/i.test(text)) {
      entities.correctionSlot = 'recipient';
    } else if (/\b(network|mtn|telecel|at)\b/i.test(text) && /\b(instead|actually|change|no)\b/i.test(text)) {
      entities.correctionSlot = 'network';
    }

    return entities;
  }
}
