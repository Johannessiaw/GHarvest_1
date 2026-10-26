/**
 * Ɔkwankyerɛfo Pa — Central TTS Service
 * Dispatches synthesis requests to the active TTS provider.
 */

import { TTSProvider, TTSRequest, TTSResult } from './ttsProvider';
import { BrowserTTSAdapter } from './ttsAdapter';

export class TTSService {
  private static providers: Map<string, TTSProvider> = new Map([
    ['browser', new BrowserTTSAdapter()],
  ]);
  private static activeProviderId = 'browser';

  public static registerProvider(provider: TTSProvider): void {
    this.providers.set(provider.id, provider);
  }

  public static setActiveProvider(id: string): void {
    if (this.providers.has(id)) {
      this.activeProviderId = id;
    }
  }

  public static async synthesize(request: TTSRequest): Promise<TTSResult> {
    const provider = this.providers.get(this.activeProviderId) || new BrowserTTSAdapter();
    return provider.synthesize(request);
  }
}
