/**
 * Gemini Live API Real-Time Streaming Transcription Server for Kofi
 * Streams 16-bit 16kHz PCM audio and emits live partial and final transcription events
 */

import http from 'http';
import { GoogleGenAI, Modality } from '@google/genai';
import WebSocket, { WebSocketServer } from 'ws';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

const MODEL = 'gemini-3.5-transcribe-live';

interface ClientMessage {
  type: 'start' | 'audio' | 'stop' | 'interrupt' | 'ping';
  data?: string;
}

interface ServerMessage {
  type: 'ready' | 'state' | 'partial' | 'final' | 'error' | 'pong';
  text?: string;
  message?: string;
}

function send(socket: WebSocket, message: ServerMessage) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}

function safeBase64ToBytes(base64: string): Buffer {
  return Buffer.from(base64, 'base64');
}

async function createGeminiSession(socket: WebSocket) {
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  const session = await ai.live.connect({
    model: MODEL,
    callbacks: {
      onopen() {
        send(socket, {
          type: 'ready',
        });
      },

      onmessage(message: any) {
        const serverContent = message?.serverContent;
        if (!serverContent) return;

        // Gemini sends real-time incremental user speech transcription
        if (serverContent.inputTranscription) {
          const text = serverContent.inputTranscription.text || '';
          if (text.trim()) {
            send(socket, {
              type: 'partial',
              text,
            });
          }
        }

        // When Gemini finishes the utterance turn
        if (serverContent.turnComplete) {
          send(socket, {
            type: 'state',
            message: 'TRANSCRIPTION_COMPLETE',
          });
        }
      },

      onerror(error: any) {
        console.error('[Gemini Live] error:', error);
        send(socket, {
          type: 'error',
          message: error?.message || 'Gemini transcription error',
        });
      },

      onclose(event: any) {
        console.log('[Gemini Live] session closed:', event?.reason || 'normal');
      },
    },

    config: {
      responseModalities: [Modality.TEXT],
      inputAudioTranscription: {
        languageCodes: [], // Automatic language detection (English, Ghanaian English, Twi, etc.)
      },
      systemInstruction: `You are the real-time speech transcription engine for Kofi, an accessibility assistant inside GHarvest.
Your job is transcription.
Do not answer the user.
Do not interpret the user's request.
Do not execute commands.
Do not summarize.
Filter out background noise, ambient sounds, television noise, engine rumble, and non-speech sounds.
Transcribe only the primary speaker's words as accurately as possible.
Preserve names, places (Techiman, Kumasi, Ejura, Tamale, Accra), products (yam, tomatoes, maize, cassava, plantain), Ghanaian English, Twi words, mixed English/Twi speech, numbers, and application terminology.
Do not invent words that were not spoken.
This transcript will be passed to a separate intent-processing system.`,
    },
  });

  return session;
}

export function setupLiveTranscriptionWebSocket(wss: WebSocketServer) {
  wss.on('connection', async (socket, request) => {
    console.log(`[Kofi Live Voice] Client connected from ${request.socket.remoteAddress}`);

    let session: any = null;

    try {
      session = await createGeminiSession(socket);
    } catch (error: any) {
      console.error('[Kofi Live Voice] Failed to create Gemini session:', error?.message);
      send(socket, {
        type: 'error',
        message: error?.message || 'Could not create Gemini transcription session',
      });
      socket.close();
      return;
    }

    socket.on('message', async (raw) => {
      try {
        const message = JSON.parse(raw.toString()) as ClientMessage;

        switch (message.type) {
          case 'start': {
            send(socket, {
              type: 'state',
              message: 'LISTENING',
            });
            session?.sendRealtimeInput({
              activityStart: {},
            });
            break;
          }

          case 'audio': {
            if (!message.data || !session) return;
            const pcm = safeBase64ToBytes(message.data);
            session.sendRealtimeInput({
              audio: {
                data: pcm.toString('base64'),
                mimeType: 'audio/pcm;rate=16000',
              },
            });
            break;
          }

          case 'stop': {
            session?.sendRealtimeInput({
              activityEnd: {},
            });
            break;
          }

          case 'interrupt': {
            session?.sendRealtimeInput({
              activityEnd: {},
            });
            send(socket, {
              type: 'state',
              message: 'INTERRUPTED',
            });
            break;
          }

          case 'ping': {
            send(socket, {
              type: 'pong',
            });
            break;
          }
        }
      } catch (error: any) {
        console.error('[Kofi Voice] client message error:', error);
        send(socket, {
          type: 'error',
          message: error?.message || 'Voice processing error',
        });
      }
    });

    socket.on('close', () => {
      console.log('[Kofi Live Voice] client disconnected');
      try {
        session?.close?.();
      } catch {}
    });
  });
}

// Attach to existing HTTP server at /ws/transcribe path
export function attachLiveTranscriptionServer(server: http.Server) {
  const wss = new WebSocketServer({
    server,
    path: '/ws/transcribe',
  });
  setupLiveTranscriptionWebSocket(wss);
  console.log('[Kofi Voice] Transcription WebSocket mounted on HTTP server path /ws/transcribe');
  return wss;
}
