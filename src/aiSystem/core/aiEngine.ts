/**
 * Ɔkwankyerɛfo Pa — Central AI Engine
 * Orchestrates Perception -> Understanding -> Memory -> Dialogue -> Navigation -> Action -> Safety -> Speech.
 * Core Invariant: AI = Brain, Application = Body, Security/Transaction Layer = Controlled Execution.
 */

import { AIProcessInput, AIProcessOutput } from './aiTypes';
import { InputProcessor } from '../perception/inputProcessor';
import { PiiGuard } from '../safety/piiGuard';
import { SessionMemory } from '../memory/sessionMemory';
import { ConversationMemory } from '../memory/conversationMemory';
import { IntentEngine } from '../understanding/intentEngine';
import { EntityEngine } from '../understanding/entityEngine';
import { AmbiguityEngine } from '../understanding/ambiguityEngine';
import { CorrectionEngine } from '../understanding/correctionEngine';
import { ConfidenceEngine } from '../understanding/confidenceEngine';
import { DialogueManager } from '../dialogue/dialogueManager';
import { NavigationPlanner } from '../navigation/navigationPlanner';
import { ActionPlanner } from '../actions/actionPlanner';
import { TransactionGuard } from '../safety/transactionGuard';
import { SpeechNormalizer } from '../speech/speechNormalizer';
import { PronunciationEngine } from '../speech/pronunciation/pronunciationEngine';

export class AIEngine {
  public static async process(input: AIProcessInput): Promise<AIProcessOutput> {
    const t0 = performance.now();

    // 1. Safety Pre-check: PII Guard (Redact spoken PINs, protect customer credentials)
    const piiResult = PiiGuard.scanAndSanitize(input.input);
    const sanitizedInput = piiResult.sanitizedText;

    // 2. Perception: Normalization, Language Detection, DTMF unification
    const tPerceptionStart = performance.now();
    const perception = InputProcessor.process({
      channel: input.channel,
      text: sanitizedInput,
      dtmfDigit: input.dtmfDigit,
      acousticFeatures: input.acousticFeatures,
    });
    const tPerceptionEnd = performance.now();

    // 3. Retrieve Session and Transaction State
    const session = SessionMemory.getOrCreate(input.sessionId, input.currentScreen || 'HOME');
    const transactionState = input.transactionState || session.transactionState;

    // 4. Understanding: Intent, Entities, Ambiguity, Confidence, Corrections
    const tUnderstandingStart = performance.now();
    const intentResult = IntentEngine.classify(perception);
    if (intentResult.intent === 'UNKNOWN' && session.currentIntent && session.transactionState.step !== 'idle') {
      intentResult.intent = session.currentIntent;
      intentResult.confidence = 0.95;
    }
    const extractedEntities = EntityEngine.extract(perception);
    const ambiguity = AmbiguityEngine.checkAmbiguity(perception);
    const confidenceAssessment = ConfidenceEngine.assess(
      intentResult.confidence,
      Object.keys(extractedEntities).length > 1,
      ambiguity.isAmbiguous
    );

    // Check for conversational slot corrections ("make it 200 instead", "actually to Ama")
    const correctionResult = CorrectionEngine.applyCorrection(
      transactionState,
      perception,
      extractedEntities
    );
    const tUnderstandingEnd = performance.now();

    // 5. Dialogue Management: Multi-turn slot manager & response planner
    const tDialogueStart = performance.now();
    const resolvedLanguage = input.language || perception.detectedLanguage;

    let dialogueResult = DialogueManager.manageDialogue(
      intentResult.intent,
      resolvedLanguage,
      transactionState,
      extractedEntities,
      correctionResult
    );

    // If ambiguous and low confidence, present targeted clarification
    if (ambiguity.isAmbiguous && confidenceAssessment.tier === 'LOW') {
      const prompt =
        resolvedLanguage === 'ak' || resolvedLanguage === 'tw'
          ? ambiguity.clarificationPromptTwi || ambiguity.clarificationPrompt!
          : ambiguity.clarificationPrompt!;
      dialogueResult = {
        plan: {
          type: 'CLARIFY',
          response: prompt,
          promptQuestion: prompt,
        },
        updatedState: dialogueResult.updatedState,
        isReadyForConfirmation: false,
      };
    }

    // If user attempted to speak their PIN, prepend security warning
    if (piiResult.hasSensitiveSecret && piiResult.warningPrompt) {
      dialogueResult.plan.response = `${piiResult.warningPrompt} ${dialogueResult.plan.response}`;
    }
    const tDialogueEnd = performance.now();

    // 6. Navigation Planning on the Navigation Graph
    const navHistory = [input.currentScreen || 'HOME'];
    const navPlan = NavigationPlanner.planNavigation(
      intentResult.intent,
      input.currentScreen || 'HOME',
      navHistory
    );

    // 7. Action Planning & Tool Registry Resolution
    const actionRequest = ActionPlanner.planAction(
      intentResult.intent,
      dialogueResult.updatedState,
      extractedEntities,
      dialogueResult.isReadyForConfirmation
    );

    // 8. Safety Gate: Transaction Guard & Confirmation Guard
    const tSafetyStart = performance.now();
    const userConfirmationGiven =
      intentResult.intent === 'CONFIRM' || extractedEntities.confirmation === true;
    const safetyDecision = TransactionGuard.evaluate(actionRequest, userConfirmationGiven);
    const tSafetyEnd = performance.now();

    // 9. Speech Normalization & Pronunciation Engine
    const tSpeechStart = performance.now();
    const speechText = SpeechNormalizer.normalizeForSpeech(dialogueResult.plan.response);
    const pronunciationTransform = PronunciationEngine.transform(speechText, 'respelling');
    const tSpeechEnd = performance.now();

    // 10. Update Ephemeral Session & Conversation Memory
    SessionMemory.updateSession(input.sessionId, {
      currentIntent: intentResult.intent,
      currentScreen: navPlan.targetNode.id,
      transactionState: dialogueResult.updatedState,
    });

    ConversationMemory.addTurn(input.sessionId, {
      role: 'user',
      content: perception.normalizedText,
      timestamp: Date.now(),
      intent: intentResult.intent,
      entities: extractedEntities,
    });

    ConversationMemory.addTurn(input.sessionId, {
      role: 'assistant',
      content: pronunciationTransform.annotatedText,
      timestamp: Date.now(),
    });

    const totalLatency = performance.now() - t0;

    return {
      intent: intentResult.intent,
      confidence: confidenceAssessment.score,
      language: resolvedLanguage,
      entities: extractedEntities,
      dialogue: dialogueResult.plan,
      navigation: {
        action: navPlan.actionName,
        targetScreen: navPlan.appRoute,
        targetStep: navPlan.step,
      },
      action: actionRequest,
      safety: safetyDecision,
      speech: {
        text: pronunciationTransform.annotatedText,
        language: resolvedLanguage,
        voiceProfile: 'ghanaian-male',
        pronunciationHints: pronunciationTransform.hints,
        tone: 'calm',
      },
      latencyMs: {
        perception: tPerceptionEnd - tPerceptionStart,
        understanding: tUnderstandingEnd - tUnderstandingStart,
        dialogue: tDialogueEnd - tDialogueStart,
        safety: tSafetyEnd - tSafetyStart,
        speech: tSpeechEnd - tSpeechStart,
        total: totalLatency,
      },
    };
  }
}
