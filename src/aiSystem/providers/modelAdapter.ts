/**
 * Ɔkwankyerɛfo Pa — Model Adapters
 * Provides both Local Deterministic Model Adapter (0ms latency, offline capable)
 * and Cloud Gemini Model Adapter with automatic fallback.
 */

import { AIProvider, ModelReasoningRequest, ModelReasoningResponse } from './aiProvider';
import { IntentEngine } from '../understanding/intentEngine';
import { EntityEngine } from '../understanding/entityEngine';
import { InputProcessor } from '../perception/inputProcessor';

export class LocalDeterministicModelAdapter implements AIProvider {
  public id = 'local-deterministic';
  public name = 'Local Deterministic Ghanaian NLU Engine';

  public isAvailable(): boolean {
    return true;
  }

  public async reason(request: ModelReasoningRequest): Promise<ModelReasoningResponse> {
    const inputContext = InputProcessor.process({
      channel: 'voice',
      text: request.transcript,
    });

    const intentClassification = IntentEngine.classify(inputContext);
    const entities = EntityEngine.extract(inputContext);

    return {
      intent: intentClassification.intent,
      confidence: intentClassification.confidence,
      entities,
      reasoning: 'Resolved via deterministic Ghanaian language pattern matching.',
    };
  }
}

export class GeminiModelAdapter implements AIProvider {
  public id = 'gemini-voice-intent';
  public name = 'Gemini Conversational & Tone Reasoner';

  public isAvailable(): boolean {
    return typeof fetch !== 'undefined';
  }

  public async reason(request: ModelReasoningRequest): Promise<ModelReasoningResponse> {
    try {
      const res = await fetch('/api/voice/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: request.transcript,
          currentPage: request.currentScreen || '/',
          conversationHistory: request.conversationHistory || [],
          permanentMemories: request.permanentMemories || [],
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      return {
        intent: (data.intent || data.type || 'UNKNOWN').toUpperCase(),
        confidence: data.confidence || 0.9,
        entities: data.entities || {},
        reasoning: data.reasoning,
        suggestedResponse: data.response,
        suggestedAction: data.action,
        detectedTone: data.detectedTone,
      };
    } catch {
      // Graceful fallback to deterministic local adapter
      const fallback = new LocalDeterministicModelAdapter();
      return fallback.reason(request);
    }
  }
}
