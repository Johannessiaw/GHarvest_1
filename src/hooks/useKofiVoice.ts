import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LiveTranscriptionEngine,
  TranscriptionState,
} from '../services/liveTranscription';

interface UseKofiVoiceOptions {
  onFinalTranscript?: (transcript: string) => void;
  onPartialTranscript?: (transcript: string) => void;
  onFrequencies?: (frequencies: Uint8Array) => void;
  onError?: (error: Error) => void;
}

export function useKofiVoice(options: UseKofiVoiceOptions = {}) {
  const engineRef = useRef<LiveTranscriptionEngine | null>(null);
  const [state, setState] = useState<TranscriptionState>('IDLE');
  const [partialTranscript, setPartialTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [frequencies, setFrequencies] = useState<Uint8Array>(new Uint8Array(32));

  // Options ref to prevent recreation
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const engine = new LiveTranscriptionEngine({
      onState: (s) => setState(s),
      onPartial: (text) => {
        setPartialTranscript(text);
        optionsRef.current.onPartialTranscript?.(text);
      },
      onFinal: (text) => {
        setFinalTranscript(text);
        optionsRef.current.onFinalTranscript?.(text);
      },
      onAudioFrequencies: (freq) => {
        setFrequencies(freq);
        optionsRef.current.onFrequencies?.(freq);
      },
      onError: (error) => {
        console.warn('[Kofi Live Voice Notice]:', error?.message);
        optionsRef.current.onError?.(error);
      },
    });

    engineRef.current = engine;

    return () => {
      engine.stop();
      engineRef.current = null;
    };
  }, []);

  const startListening = useCallback(async () => {
    setPartialTranscript('');
    setFinalTranscript('');
    await engineRef.current?.start();
  }, []);

  const stopListening = useCallback(() => {
    engineRef.current?.stop();
  }, []);

  const interrupt = useCallback(() => {
    engineRef.current?.interrupt();
  }, []);

  return {
    state,
    isListening: state === 'LISTENING',
    isProcessing: state === 'PROCESSING',
    isSpeaking: state === 'SPEAKING',
    isInterrupted: state === 'INTERRUPTED',
    hasError: state === 'ERROR',
    partialTranscript,
    finalTranscript,
    frequencies,
    startListening,
    stopListening,
    interrupt,
  };
}
