/**
 * Gemini Live API Streaming Transcription Engine for Kofi
 * Captures microphone audio with noise suppression, streams 16-bit 16kHz PCM
 * through AudioWorklet to Gemini Live WebSocket, receiving continuous partial and final transcripts.
 */

export type TranscriptionState =
  | 'IDLE'
  | 'LISTENING'
  | 'PROCESSING'
  | 'SPEAKING'
  | 'INTERRUPTED'
  | 'ERROR';

export interface TranscriptionCallbacks {
  onState?: (state: TranscriptionState) => void;
  onPartial?: (text: string) => void;
  onFinal?: (text: string) => void;
  onError?: (error: Error) => void;
  onAudioFrequencies?: (frequencies: Uint8Array) => void;
}

export class LiveTranscriptionEngine {
  private socket: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private highpassFilter: BiquadFilterNode | null = null;
  private analyser: AnalyserNode | null = null;
  private processor: AudioWorkletNode | null = null;
  private animFrameId: number | null = null;

  private callbacks: TranscriptionCallbacks;
  private state: TranscriptionState = 'IDLE';
  private partialText = '';
  private finalText = '';
  private started = false;
  private intentionalClose = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(callbacks: TranscriptionCallbacks = {}) {
    this.callbacks = callbacks;
  }

  private setState(state: TranscriptionState) {
    this.state = state;
    this.callbacks.onState?.(state);
  }

  async start(): Promise<void> {
    if (this.started) return;

    this.started = true;
    this.intentionalClose = false;
    this.partialText = '';
    this.finalText = '';

    try {
      this.setState('LISTENING');
      await this.openSocket();
      await this.startMicrophone();

      this.send({
        type: 'start',
      });
    } catch (error) {
      this.started = false;
      this.setState('ERROR');
      this.callbacks.onError?.(
        error instanceof Error ? error : new Error('Could not start real-time transcription')
      );
    }
  }

  private openSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const defaultUrl = `${protocol}//${window.location.host}/ws/transcribe`;
      const url = import.meta.env.VITE_KOFI_VOICE_WS_URL || defaultUrl;

      const socket = new WebSocket(url);
      this.socket = socket;

      let resolved = false;

      socket.onopen = () => {
        this.reconnectAttempts = 0;
        if (!resolved) {
          resolved = true;
          resolve();
        }
      };

      socket.onmessage = (event) => {
        this.handleServerMessage(event.data);
      };

      socket.onerror = () => {
        if (!resolved) {
          resolved = true;
          reject(new Error('Voice WebSocket connection failed'));
        }
        this.callbacks.onError?.(new Error('Voice WebSocket error'));
      };

      socket.onclose = () => {
        if (!this.intentionalClose && this.started) {
          this.reconnect();
        }
      };
    });
  }

  private async reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.setState('ERROR');
      this.callbacks.onError?.(new Error('Voice connection could not be restored'));
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(500 * 2 ** this.reconnectAttempts, 4000);
    await new Promise((resolve) => setTimeout(resolve, delay));

    if (!this.started || this.intentionalClose) return;

    try {
      await this.openSocket();
      this.send({ type: 'start' });
    } catch {
      this.reconnect();
    }
  }

  private async startMicrophone() {
    // Advanced hardware-level noise suppression & acoustic echo cancellation
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    });

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    this.audioContext = new AudioCtx({
      sampleRate: 16000,
      latencyHint: 'interactive',
    });

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    // Highpass filter (cuts sub-85Hz background hum, HVAC noise, desk rumbles)
    this.highpassFilter = this.audioContext.createBiquadFilter();
    this.highpassFilter.type = 'highpass';
    this.highpassFilter.frequency.value = 85;

    // Audio Visualizer Analyser Node
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 64;

    // Load AudioWorklet for low-latency 16kHz PCM streaming
    await this.audioContext.audioWorklet.addModule('/pcmProcessor.worklet.js');

    this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
    this.processor = new AudioWorkletNode(this.audioContext, 'kofi-pcm-processor');

    this.processor.port.onmessage = (event) => {
      if (!this.started || this.state === 'SPEAKING') return;

      const float32 = event.data as Float32Array;
      const pcm16 = this.floatToPCM16(float32);
      const base64 = this.arrayBufferToBase64(pcm16.buffer);

      this.send({
        type: 'audio',
        data: base64,
      });
    };

    // Chain: Source -> Highpass (noise filter) -> Analyser -> Processor -> Silent Gain -> Destination
    const silentGain = this.audioContext.createGain();
    silentGain.gain.value = 0;

    this.source.connect(this.highpassFilter);
    this.highpassFilter.connect(this.analyser);
    this.analyser.connect(this.processor);
    this.processor.connect(silentGain);
    silentGain.connect(this.audioContext.destination);

    // Start frequency feedback loop
    this.startFrequencyLoop();
  }

  private startFrequencyLoop() {
    const dataArray = new Uint8Array(32);
    const loop = () => {
      if (!this.analyser || this.state !== 'LISTENING') return;
      this.analyser.getByteFrequencyData(dataArray);
      this.callbacks.onAudioFrequencies?.(dataArray);
      this.animFrameId = requestAnimationFrame(loop);
    };
    loop();
  }

  private floatToPCM16(input: Float32Array): Int16Array {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const sample = Math.max(-1, Math.min(1, input[i]));
      output[i] = sample < 0 ? sample * 32768 : sample * 32767;
    }
    return output;
  }

  private arrayBufferToBase64(buffer: ArrayBufferLike): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
      binary += String.fromCharCode(...chunk);
    }
    return btoa(binary);
  }

  private handleServerMessage(raw: string) {
    let message: any;
    try {
      message = JSON.parse(raw);
    } catch {
      return;
    }

    switch (message.type) {
      case 'ready':
        break;

      case 'partial':
        this.handlePartial(message.text || '');
        break;

      case 'state':
        this.handleState(message.message);
        break;

      case 'error':
        this.setState('ERROR');
        this.callbacks.onError?.(
          new Error(message.message || 'Live transcription error')
        );
        break;
    }
  }

  private handlePartial(incoming: string) {
    if (!incoming.trim()) return;

    this.partialText = this.mergeTranscript(this.partialText, incoming);
    this.callbacks.onPartial?.(this.partialText);
  }

  private mergeTranscript(current: string, incoming: string): string {
    if (!current) return incoming.trim();
    const a = current.trim();
    const b = incoming.trim();
    if (!b) return a;

    if (b.toLowerCase().startsWith(a.toLowerCase())) {
      return b;
    }
    if (a.toLowerCase().endsWith(b.toLowerCase())) {
      return a;
    }
    return `${a} ${b}`;
  }

  private handleState(message?: string) {
    if (message === 'TRANSCRIPTION_COMPLETE') {
      const completed = this.partialText.trim();
      if (!completed) return;

      this.finalText = completed;
      this.partialText = '';

      this.callbacks.onFinal?.(this.finalText);
      this.setState('PROCESSING');
    }

    if (message === 'INTERRUPTED') {
      this.setState('INTERRUPTED');
    }
  }

  interrupt() {
    this.send({ type: 'interrupt' });
    this.setState('INTERRUPTED');
  }

  stop() {
    if (!this.started) return;
    this.send({ type: 'stop' });
    this.cleanup();
    this.setState('IDLE');
  }

  private send(message: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  private cleanup() {
    this.started = false;
    this.intentionalClose = true;

    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    try {
      this.processor?.disconnect();
    } catch {}
    try {
      this.highpassFilter?.disconnect();
    } catch {}
    try {
      this.analyser?.disconnect();
    } catch {}
    try {
      this.source?.disconnect();
    } catch {}
    try {
      this.audioContext?.close();
    } catch {}

    this.mediaStream?.getTracks().forEach((track) => track.stop());

    try {
      this.socket?.close();
    } catch {}

    this.processor = null;
    this.highpassFilter = null;
    this.analyser = null;
    this.source = null;
    this.audioContext = null;
    this.mediaStream = null;
    this.socket = null;
  }

  getPartialTranscript() {
    return this.partialText;
  }

  getFinalTranscript() {
    return this.finalText;
  }

  getState() {
    return this.state;
  }
}
