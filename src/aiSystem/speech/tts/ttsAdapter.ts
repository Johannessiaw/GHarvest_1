/**
 * Ɔkwankyerɛfo Pa — Browser Web Speech TTS Adapter
 * Adapts browser speech synthesis with Ghanaian pronunciation hints and natural cadence.
 */

import { TTSProvider, TTSRequest, TTSResult } from './ttsProvider';
import { SpeechNormalizer } from '../speechNormalizer';
import { PronunciationEngine } from '../pronunciation/pronunciationEngine';

export class BrowserTTSAdapter implements TTSProvider {
  public id = 'browser-speech-synthesis';
  public name = 'Browser Web Speech Synthesis';

  public isAvailable(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public async synthesize(request: TTSRequest): Promise<TTSResult> {
    const normalized = SpeechNormalizer.normalizeForSpeech(request.text);
    const transform = PronunciationEngine.transform(normalized, 'respelling');

    return {
      spokenText: transform.annotatedText,
      providerUsed: this.id,
    };
  }
}
