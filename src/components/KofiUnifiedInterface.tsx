import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  VolumeX,
  Keyboard,
  Settings,
  Maximize2,
  Minimize2,
  Send,
  X,
  Sparkles,
  ChevronUp,
  ChevronDown,
  ShoppingBag,
  Truck,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MapPin,
  RefreshCw,
  Volume2,
  RotateCcw,
  Trash2,
  Brain,
} from 'lucide-react';
import { VoiceState } from '../services/voiceEngine';
import { VoiceMessage, SupportedLanguage, AppRoute, AppContextState, Order } from '../types';
import { KofiWaveform } from './KofiWaveform';

interface KofiUnifiedInterfaceProps {
  voiceState: VoiceState;
  frequencies: Uint8Array;
  onToggleMic: () => void;
  onInterrupt: () => void;
  onSubmitText: (text: string) => void;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  appContext: AppContextState;
  onNavigate: (route: AppRoute) => void;
  messages: VoiceMessage[];
  onConfirmOrder: (orderData: any) => void;
  onSelectPrompt: (prompt: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  errorMessage?: string | null;
  onRepeatResponse?: (text: string) => void;
  onClearHistory?: () => void;
  onDoneSpeaking?: () => void;
  partialTranscript?: string;
  finalTranscript?: string;
  onOpenMemoryBank?: () => void;
  onOpenVoiceSettings?: () => void;
  isPermanentVoiceEnabled?: boolean;
}

export const KofiUnifiedInterface: React.FC<KofiUnifiedInterfaceProps> = ({
  voiceState,
  frequencies,
  onToggleMic,
  onInterrupt,
  onSubmitText,
  language,
  onLanguageChange,
  appContext,
  onNavigate,
  messages,
  onConfirmOrder,
  onSelectPrompt,
  isExpanded,
  onToggleExpand,
  errorMessage,
  onRepeatResponse,
  onClearHistory,
  onDoneSpeaking,
  partialTranscript = '',
  finalTranscript = '',
  onOpenMemoryBank,
  onOpenVoiceSettings,
  isPermanentVoiceEnabled = true,
}) => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto focus input when keyboard tray opens
  useEffect(() => {
    if (isKeyboardOpen) {
      inputRef.current?.focus();
    }
  }, [isKeyboardOpen]);

  // Scroll to bottom of message list
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isHistoryDrawerOpen, isExpanded]);

  // Latest model message for contextual display
  const lastKofiMessage = [...messages].reverse().find((m) => m.sender === 'kofi');
  const latestMessage = messages[messages.length - 1];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    onSubmitText(textInput.trim());
    setTextInput('');
  };

  // Determine top status text based on state
  const getStatusLabel = () => {
    switch (voiceState) {
      case 'listening':
        return partialTranscript || finalTranscript ? 'Intensive Live Transcribing...' : 'Hands-Free Active • Speak anytime';
      case 'processing':
        return 'Checking... Sensed question done • AI reasoning';
      case 'speaking':
        return 'Kofi speaking back to you...';
      case 'interrupted':
        return 'Interrupted';
      case 'standby':
        return 'Kofi Voice Assistant Ready';
      default:
        return 'What can I help you with?';
    }
  };

  // -------------------------------------------------------------
  // FULL SCREEN SMARTPHONE MODE
  // -------------------------------------------------------------
  if (isExpanded) {
    return (
      <div className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between p-6 select-none animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-xs text-black">
              GH
            </div>
            <div>
              <div className="font-display font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                Kofi Voice Guide
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              </div>
              <p className="text-[10px] text-gray-400">
                Viewing: <span className="text-gray-200 uppercase">{appContext.currentPageTitle}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenVoiceSettings && (
              <button
                onClick={onOpenVoiceSettings}
                className="px-3 py-1.5 rounded-full bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                title="Permanent Voice Settings Studio"
              >
                <Mic className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Voice Studio</span>
              </button>
            )}

            {onOpenMemoryBank && (
              <button
                onClick={onOpenMemoryBank}
                className="px-3 py-1.5 rounded-full bg-purple-950/90 hover:bg-purple-900 border border-purple-500/60 text-purple-200 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                title="Kofi Permanent Memory Bank"
              >
                <Brain className="w-3.5 h-3.5 text-purple-400" />
                <span>Memory Bank</span>
              </button>
            )}

            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 transition"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleExpand}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1 text-xs px-3"
              title="Return to visual app"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to App</span>
            </button>
          </div>
        </div>

        {/* Settings Popover */}
        {isSettingsOpen && (
          <div className="absolute top-16 right-6 z-50 bg-[#121212] border border-white/10 rounded-2xl p-4 shadow-2xl w-64 space-y-3">
            <div className="text-xs font-semibold text-gray-200">Language Preference</div>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {(
                [
                  { code: 'en-GH', label: 'English (GH)' },
                  { code: 'ak-GH', label: 'Twi (Akan)' },
                  { code: 'ga-GH', label: 'Ga' },
                  { code: 'ee-GH', label: 'Ewe' },
                  { code: 'pcm-GH', label: 'Pidgin' },
                ] as const
              ).map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onLanguageChange(lang.code);
                    setIsSettingsOpen(false);
                  }}
                  className={`p-2 rounded-lg text-left transition ${
                    language === lang.code
                      ? 'bg-white text-black font-semibold'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Upper Focus Area: Minimal Typography */}
        <div className="my-auto max-w-xl mx-auto w-full text-center space-y-6">
          <div className="space-y-3">
            {/* High-visibility Live Transcribing Indicator */}
            {voiceState === 'listening' && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold shadow-lg animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <span>
                  {partialTranscript || finalTranscript
                    ? '🎯 Intensive Transcribing: Live phonetic correction...'
                    : 'Listening for your voice...'}
                </span>
              </div>
            )}
            {voiceState === 'processing' && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-semibold shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-spin" />
                <span>Checking... Sensed question done • AI reasoning in progress...</span>
              </div>
            )}
            {voiceState === 'speaking' && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-lg">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Kofi is speaking aloud</span>
              </div>
            )}

            {/* Live Words Box */}
            <div
              aria-live="polite"
              aria-atomic="true"
              className="text-center text-base sm:text-lg text-gray-100 min-h-12 flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 max-w-lg mx-auto"
            >
              {partialTranscript || finalTranscript ? (
                <div className="space-y-2 w-full">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Transcribing:</span>
                    {onDoneSpeaking && (
                      <button
                        onClick={onDoneSpeaking}
                        className="text-[10px] font-bold bg-cyan-400 hover:bg-cyan-300 text-black px-2 py-0.5 rounded-md shadow"
                      >
                        Submit ↵
                      </button>
                    )}
                  </div>
                  <div className="text-white font-medium break-words">
                    <span>{finalTranscript} </span>
                    <span className="text-cyan-300 font-semibold underline decoration-cyan-400/60">{partialTranscript}</span>
                  </div>
                </div>
              ) : voiceState === 'listening' ? (
                <span className="text-cyan-200/80 italic text-sm">Say: "Take me to the market and help me buy yam"...</span>
              ) : (
                <span className="text-gray-400 text-sm">{lastKofiMessage?.normalizedText || 'What can I help you with?'}</span>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-sans font-light text-white tracking-tight leading-snug">
                {voiceState === 'speaking' || voiceState === 'processing'
                  ? lastKofiMessage?.normalizedText || 'Thinking...'
                  : 'Speak or ask Kofi anything'}
              </h1>
              {lastKofiMessage && (
                <button
                  onClick={() => onRepeatResponse?.(lastKofiMessage.normalizedText)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-cyan-400 transition"
                  title="Repeat response aloud"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Smooth Glowing Horizontal Waveform */}
          <div className="py-4">
            <KofiWaveform
              voiceState={voiceState}
              frequencies={frequencies}
              height={100}
            />
          </div>

          {/* Error Message if any */}
          {errorMessage && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/60 border border-red-500/40 text-red-300 text-xs">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Deep Reasoning & Emotional Tone Sensing Display */}
          {lastKofiMessage && (lastKofiMessage.isIncompleteSentence || lastKofiMessage.detectedTone || lastKofiMessage.shouldTakeDeepBreath) && (
            <div className="max-w-md mx-auto w-full flex flex-col gap-2 my-1 animate-in fade-in slide-in-from-top-2 duration-300">
              {/* Inferred Goal Pill */}
              {lastKofiMessage.isIncompleteSentence && lastKofiMessage.completedThought && (
                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-left text-xs text-amber-200 shadow-lg backdrop-blur-sm">
                  <span className="p-1 rounded-lg bg-amber-500/20 text-amber-300 shrink-0 mt-0.5 text-sm">💡</span>
                  <div>
                    <div className="font-semibold text-amber-300 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                      <span>Reasoned Incomplete Speech</span>
                      <span className="text-[9px] bg-amber-500/30 px-1.5 py-0.5 rounded text-amber-100 font-bold">Goal Inferred</span>
                    </div>
                    <div className="text-white font-medium mt-0.5">{lastKofiMessage.completedThought}</div>
                    {lastKofiMessage.reasoning && (
                      <div className="text-[11px] text-amber-300/80 mt-1 italic leading-relaxed">{lastKofiMessage.reasoning}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Sensed Human Tone & Vocal Empathy Badge */}
              <div className="flex flex-wrap items-center justify-center gap-2 text-[11px]">
                {lastKofiMessage.detectedTone && (
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-sm ${
                    lastKofiMessage.detectedTone === 'anxious'
                      ? 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                      : lastKofiMessage.detectedTone === 'nervous'
                      ? 'bg-amber-950/60 border-amber-500/40 text-amber-200'
                      : lastKofiMessage.detectedTone === 'overwhelmed'
                      ? 'bg-purple-950/60 border-purple-500/40 text-purple-200'
                      : lastKofiMessage.detectedTone === 'sad'
                      ? 'bg-blue-950/60 border-blue-500/40 text-blue-200'
                      : lastKofiMessage.detectedTone === 'happy'
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-300'
                  }`}>
                    <span className="text-sm">
                      {lastKofiMessage.detectedTone === 'anxious' ? '😰' :
                       lastKofiMessage.detectedTone === 'nervous' ? '😟' :
                       lastKofiMessage.detectedTone === 'overwhelmed' ? '😫' :
                       lastKofiMessage.detectedTone === 'sad' ? '😢' :
                       lastKofiMessage.detectedTone === 'happy' ? '😊' : '🧘'}
                    </span>
                    <span className="font-semibold capitalize">Tone Sensed: {lastKofiMessage.detectedTone}</span>
                    <span className="text-gray-400">• Kofi: {lastKofiMessage.vocalStyle || 'Empathetic'}</span>
                  </div>
                )}

                {lastKofiMessage.shouldTakeDeepBreath && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 shadow-sm animate-pulse">
                    <span>🌬️</span>
                    <span className="font-semibold">Deep Breath Taken</span>
                    <span className="text-cyan-300/80">• Calming Presence</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Latest Context Card if available */}
          {lastKofiMessage?.actionCard && (
            <div className="text-left max-w-md mx-auto bg-[#0e0e0e] border border-white/10 p-4 rounded-2xl shadow-xl">
              {lastKofiMessage.actionCard.type === 'harvest_list' && (
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
                    Found Harvest Listings
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {lastKofiMessage.actionCard.data.slice(0, 3).map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-xs"
                      >
                        <div>
                          <div className="font-semibold text-white">{item.crop} - {item.variety}</div>
                          <div className="text-[11px] text-gray-400">
                            {item.farmerName} • {item.locationTown}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-400">GH₵ {item.unitPriceGHS}</div>
                          <div className="text-[10px] text-gray-500">per {item.unit}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {lastKofiMessage.actionCard.type === 'price_check' && (
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-pink-400 uppercase tracking-wider">
                    MoFA / Esoko Benchmark Rates
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {lastKofiMessage.actionCard.data.slice(0, 2).map((p: any) => (
                      <div key={p.id} className="p-2 rounded-lg bg-white/5">
                        <div className="text-gray-300 font-medium">{p.crop} ({p.market.split(' ')[0]})</div>
                        <div className="text-sm font-bold text-white mt-1">GH₵ {p.wholesalePriceGHS}</div>
                        <div className="text-[10px] text-gray-400">Retail: GH₵ {p.retailPriceGHS}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {lastKofiMessage.actionCard.type === 'logistics_estimate' && (
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">
                    Freight Route Estimate
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-white/5 text-xs">
                    <div>
                      <div className="text-white font-medium">
                        {lastKofiMessage.actionCard.data.origin} → {lastKofiMessage.actionCard.data.destination}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {lastKofiMessage.actionCard.data.vehicle} • {lastKofiMessage.actionCard.data.hours} hrs
                      </div>
                    </div>
                    <div className="font-bold text-emerald-400 text-sm">
                      GH₵ {lastKofiMessage.actionCard.data.estimatedCostGHS}
                    </div>
                  </div>
                </div>
              )}

              {lastKofiMessage.actionCard.type === 'order_summary' && (
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                    Simulated Escrow Draft
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5 text-xs space-y-1">
                    <div className="flex justify-between text-white font-medium">
                      <span>{lastKofiMessage.actionCard.data.quantity} {lastKofiMessage.actionCard.data.unit} {lastKofiMessage.actionCard.data.product}</span>
                      <span className="text-emerald-400">GH₵ {lastKofiMessage.actionCard.data.totalAmountGHS}</span>
                    </div>
                    <div className="text-[11px] text-gray-400">
                      Pickup: {lastKofiMessage.actionCard.data.pickup} • Delivery: {lastKofiMessage.actionCard.data.destination}
                    </div>
                  </div>
                  <button
                    onClick={() => lastKofiMessage.actionCard && onConfirmOrder(lastKofiMessage.actionCard.data)}
                    className="w-full mt-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition"
                  >
                    Confirm Order Draft
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quick Guidance Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {[
              'What is 15 plus 25?',
              'What is the capital of Ghana?',
              'How does escrow work?',
              'Why do tomatoes spoil fast?',
              'What is inflation?',
              'Find tomatoes in Techiman',
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => onSelectPrompt(chip)}
                className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 text-gray-300 text-xs transition border border-white/5 active:scale-95 cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="max-w-md mx-auto w-full pt-4">
          {/* Keyboard input drawer if open */}
          {isKeyboardOpen && (
            <form onSubmit={handleFormSubmit} className="mb-4 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Ask Kofi or type command..."
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
              <button
                type="submit"
                disabled={!textInput.trim()}
                className="p-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 text-black font-semibold transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="flex items-center justify-between px-6 py-3 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
            {/* Keyboard shortcut on left */}
            <button
              onClick={() => setIsKeyboardOpen(!isKeyboardOpen)}
              className={`p-3 rounded-full transition ${
                isKeyboardOpen ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
              }`}
              title="Toggle keyboard"
            >
              <Keyboard className="w-5 h-5" />
            </button>

            {/* Small Waveform / Voice Indicator in center */}
            <div className="flex items-center gap-3">
              <button
                onClick={voiceState === 'speaking' || voiceState === 'processing' ? onInterrupt : onToggleMic}
                className={`relative w-14 h-14 rounded-full flex items-center justify-center transition shadow-lg active:scale-95 ${
                  voiceState === 'speaking' || voiceState === 'processing'
                    ? 'bg-red-500 text-white shadow-red-500/50'
                    : voiceState === 'listening'
                    ? 'bg-cyan-500 text-black shadow-cyan-500/50 animate-pulse'
                    : voiceState === 'standby'
                    ? 'bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 text-white ring-2 ring-purple-400/50'
                    : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
                }`}
                title={
                  voiceState === 'speaking' || voiceState === 'processing'
                    ? 'Tap to Interrupt'
                    : voiceState === 'standby' || voiceState === 'listening'
                    ? 'Tap to mute mic'
                    : 'Tap to speak'
                }
              >
                {voiceState === 'speaking' || voiceState === 'processing' ? (
                  <VolumeX className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </button>
            </div>

            {/* Minimize / Settings shortcut on right */}
            <button
              onClick={onToggleExpand}
              className="p-3 rounded-full text-gray-400 hover:text-white transition"
              title="Minimize to Compact Dock"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // COMPACT NON-OBSTRUCTIVE DOCK BAR (Default)
  // GHarvest application remains 100% visible and interactive!
  // -------------------------------------------------------------
  return (
    <>
      {/* Slide-up Conversation Drawer if toggled */}
      {isHistoryDrawerOpen && (
        <div className="fixed inset-x-0 bottom-24 z-40 max-w-2xl mx-auto px-4 animate-in slide-in-from-bottom-4 duration-200">
          <div className="bg-[#090909] border border-white/15 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl max-h-96 flex flex-col">
            <div className="p-3 bg-white/5 border-b border-white/10 flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Continuous Kofi Conversation
              </span>
              <div className="flex items-center gap-2">
                {onClearHistory && (
                  <button
                    onClick={onClearHistory}
                    className="text-gray-400 hover:text-red-400 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 flex items-center gap-1 text-[11px] transition"
                    title="Reset conversation and context"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
                <button
                  onClick={() => setIsHistoryDrawerOpen(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                      m.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-[#151515] border border-white/10 text-gray-200 rounded-bl-none'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{m.normalizedText}</p>
                    {m.sender === 'kofi' && (m.completedThought || m.detectedTone || m.reasoning) && (
                      <div className="mt-2 pt-2 border-t border-white/10 space-y-1.5 text-[11px]">
                        {/* Tone, Deep Breath, Question, and Permanent Memory Tag */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {m.intent === 'question' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-800/40 text-[10px]">
                              💡 Smart Answer
                            </span>
                          )}
                          {m.recalledMemory && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/40 text-[10px]">
                              🧠 Memory Recalled
                            </span>
                          )}
                          {m.newMemoriesExtracted && m.newMemoriesExtracted.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/40 text-[10px]">
                              💾 Memory Saved ({m.newMemoriesExtracted.length})
                            </span>
                          )}
                          {m.detectedTone && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-medium text-[10px]">
                              <span>
                                {m.detectedTone === 'anxious' ? '😰' :
                                 m.detectedTone === 'nervous' ? '😟' :
                                 m.detectedTone === 'overwhelmed' ? '😫' :
                                 m.detectedTone === 'sad' ? '😢' :
                                 m.detectedTone === 'happy' ? '😊' : '🧘'}
                              </span>
                              <span className="capitalize">{m.detectedTone} Tone</span>
                            </span>
                          )}
                          {m.shouldTakeDeepBreath && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/40 text-[10px]">
                              🌬️ Deep Breath
                            </span>
                          )}
                        </div>

                        {/* Inferred Goal */}
                        {m.completedThought && (
                          <div className="p-1.5 rounded-lg bg-amber-950/30 border border-amber-500/20 text-amber-200">
                            <span className="font-semibold text-amber-400">💡 Inferred Goal: </span>
                            <span>{m.completedThought}</span>
                          </div>
                        )}

                        {/* Internal Reasoning Details */}
                        {m.reasoning && (
                          <details className="cursor-pointer group">
                            <summary className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold list-none flex items-center gap-1">
                              <span>🧠 Kofi's Reasoning</span>
                              <span className="group-open:rotate-180 transition-transform">▾</span>
                            </summary>
                            <p className="mt-1 text-[10px] text-gray-300 bg-black/40 p-1.5 rounded border border-white/5 font-sans leading-relaxed">
                              {m.reasoning}
                            </p>
                          </details>
                        )}
                      </div>
                    )}
                    <div className="text-[9px] text-gray-400 mt-1.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span>{m.timestamp}</span>
                        {m.toolsUsed && m.toolsUsed.length > 0 && (
                          <span className="text-cyan-400">{m.toolsUsed.join(', ')}</span>
                        )}
                      </div>
                      {m.sender === 'kofi' && onRepeatResponse && (
                        <button
                          onClick={() => onRepeatResponse(m.normalizedText)}
                          className="text-gray-400 hover:text-cyan-300 p-0.5 rounded transition"
                          title="Repeat response aloud"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      )}

      {/* Floating Unobtrusive Context Card (if latest response has card) */}
      {lastKofiMessage?.actionCard && !isHistoryDrawerOpen && (
        <div className="fixed bottom-24 right-4 z-40 max-w-sm w-full animate-in slide-in-from-bottom-2 fade-in">
          <div className="bg-[#0b0b0b]/95 border border-white/15 p-3.5 rounded-2xl shadow-2xl backdrop-blur-md text-xs relative">
            <button
              onClick={() => {
                // dismiss card
                if (lastKofiMessage) lastKofiMessage.actionCard = undefined;
              }}
              className="absolute top-2.5 right-2.5 text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {lastKofiMessage.actionCard.type === 'harvest_list' && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">
                  Verified Smallholder Listings
                </div>
                <div className="text-white font-medium">
                  {lastKofiMessage.actionCard.data[0]?.crop} - {lastKofiMessage.actionCard.data[0]?.variety}
                </div>
                <div className="text-gray-400 text-[11px]">
                  {lastKofiMessage.actionCard.data[0]?.locationTown} • GH₵ {lastKofiMessage.actionCard.data[0]?.unitPriceGHS}/{lastKofiMessage.actionCard.data[0]?.unit}
                </div>
                <button
                  onClick={() => onNavigate('marketplace')}
                  className="w-full mt-1.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition flex items-center justify-center gap-1"
                >
                  View in Marketplace <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {lastKofiMessage.actionCard.type === 'price_check' && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-semibold text-pink-400 uppercase tracking-wider">
                  MoFA Benchmark Rate
                </div>
                <div className="text-white font-medium">
                  {lastKofiMessage.actionCard.data[0]?.crop}: GH₵ {lastKofiMessage.actionCard.data[0]?.wholesalePriceGHS} wholesale
                </div>
                <div className="text-gray-400 text-[11px]">
                  Market: {lastKofiMessage.actionCard.data[0]?.market}
                </div>
              </div>
            )}

            {lastKofiMessage.actionCard.type === 'logistics_estimate' && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">
                  Transit Freight Estimate
                </div>
                <div className="text-white font-medium">
                  {lastKofiMessage.actionCard.data.origin} → {lastKofiMessage.actionCard.data.destination}
                </div>
                <div className="flex justify-between text-gray-300 text-[11px]">
                  <span>Vehicle: {lastKofiMessage.actionCard.data.vehicle}</span>
                  <span className="font-bold text-emerald-400">GH₵ {lastKofiMessage.actionCard.data.estimatedCostGHS}</span>
                </div>
              </div>
            )}

            {lastKofiMessage.actionCard.type === 'order_summary' && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                  Simulated Order Summary
                </div>
                <div className="text-white font-medium">
                  {lastKofiMessage.actionCard.data.quantity} {lastKofiMessage.actionCard.data.unit} {lastKofiMessage.actionCard.data.product}
                </div>
                <div className="flex justify-between text-gray-300 text-[11px]">
                  <span>Total: GH₵ {lastKofiMessage.actionCard.data.totalAmountGHS}</span>
                  <button
                    onClick={() => lastKofiMessage.actionCard && onConfirmOrder(lastKofiMessage.actionCard.data)}
                    className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Primary Compact Voice Dock Bar (Anchored at Bottom) */}
      <aside aria-label="Kofi Voice Assistant" className="fixed bottom-3 inset-x-0 z-40 max-w-xl mx-auto px-4 select-none">

        {/* Quick Voice Prompt Pills (Always accessible when not expanded) */}
        {!isExpanded && !isHistoryDrawerOpen && voiceState !== 'speaking' && (
          <div className="flex items-center justify-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-1 mb-1">
            {[
              { label: '🧠 Who am I?', prompt: 'What is my name and who am I?' },
              { label: '🧠 What do you remember?', prompt: 'What do you remember about me?' },
              { label: '🌾 My Crop Preferences', prompt: 'What crops and markets do I prefer?' },
              { label: '❓ What is 15 + 25?', prompt: 'What is 15 plus 25?' },
              { label: '🇬🇭 Capital of Ghana?', prompt: 'What is the capital of Ghana?' },
              { label: '🛡️ How Escrow Works', prompt: 'How does escrow work?' },
              { label: '🍅 Techiman Tomatoes', prompt: 'Find tomatoes in Techiman' },
              { label: '🚚 Freight to Kumasi', prompt: 'Calculate freight transport to Kumasi' },
            ].map((chip) => (
              <button
                key={chip.label}
                onClick={() => onSelectPrompt(chip.prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[#0d1c13] hover:bg-[#132c1e] text-emerald-300 text-[10px] font-medium transition border border-emerald-700/60 shadow-sm active:scale-95 flex items-center gap-1 cursor-pointer"
                title={`Ask Kofi: "${chip.prompt}"`}
              >
                <span>{chip.label}</span>
              </button>
            ))}
          </div>
        )}

        <div className="bg-black/95 border border-white/15 rounded-3xl shadow-2xl backdrop-blur-xl px-4 py-2.5 flex flex-col gap-1.5">
          {/* Top Line: Minimal State Status and Screen indicator in Clean White Sans-serif */}
          <div className="flex items-center justify-between px-2 pt-0.5">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  voiceState === 'listening'
                    ? 'bg-cyan-400 animate-ping'
                    : voiceState === 'processing'
                    ? 'bg-purple-400 animate-pulse'
                    : voiceState === 'speaking'
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-gray-400'
                }`}
              />
              <span className="text-[11px] font-sans text-gray-200 font-medium">
                {getStatusLabel()}
              </span>
              <span className="text-[10px] text-gray-500 hidden sm:inline">
                • Screen: <span className="text-gray-300 font-medium">{appContext.currentPageTitle}</span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-gray-400">
              {lastKofiMessage && (
                <button
                  onClick={() => onRepeatResponse?.(lastKofiMessage.normalizedText)}
                  className="hover:text-cyan-300 transition flex items-center gap-1 text-[11px] text-gray-300 cursor-pointer"
                  title="Repeat Kofi's response aloud"
                >
                  <RotateCcw className="w-3 h-3 text-cyan-400" />
                  <span className="hidden sm:inline">Repeat</span>
                </button>
              )}
              <button
                onClick={() => setIsHistoryDrawerOpen(!isHistoryDrawerOpen)}
                className="hover:text-white transition flex items-center gap-1 cursor-pointer"
                title="View conversation history"
              >
                <span>History ({messages.length})</span>
                {isHistoryDrawerOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* High-Visibility Live Transcription Status & Stream Display */}
          <div
            aria-live="polite"
            aria-atomic="true"
            className="min-h-8 flex items-center justify-center px-1 py-0.5"
          >
            {partialTranscript || finalTranscript ? (
              <div className="w-full bg-cyan-950/80 border border-cyan-400/80 rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-2 shadow-md animate-in fade-in duration-100">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                  <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider shrink-0">
                    Intensive ASR:
                  </span>
                  <div className="truncate text-xs text-white font-medium">
                    <span>{finalTranscript} </span>
                    <span className="text-cyan-300 underline decoration-cyan-400 font-semibold">{partialTranscript}</span>
                  </div>
                </div>
                {onDoneSpeaking && (
                  <button
                    onClick={onDoneSpeaking}
                    className="shrink-0 text-[10px] font-bold bg-cyan-400 hover:bg-cyan-300 text-black px-2 py-0.5 rounded-md shadow transition active:scale-95 cursor-pointer"
                    title="Done speaking? Process immediately"
                  >
                    Done ↵
                  </button>
                )}
              </div>
            ) : voiceState === 'listening' ? (
              <div className="w-full bg-emerald-950/40 border border-emerald-500/40 rounded-xl px-2.5 py-1 flex items-center justify-between gap-2 text-[11px] text-emerald-300">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                  <span className="font-semibold text-emerald-400 shrink-0">Hands-Free:</span>
                  <span className="truncate">Speak anytime • Auto-transcribing</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full shrink-0">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  <span className="hidden sm:inline">Intensive ASR Active</span>
                </div>
              </div>
            ) : voiceState === 'processing' ? (
              <div className="w-full bg-purple-950/60 border border-purple-500/50 rounded-xl px-2.5 py-1 flex items-center justify-center gap-2 text-[11px] text-purple-200">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-spin" />
                <span className="font-semibold text-purple-300">Checking...</span>
                <span className="truncate">Sensed question done • AI reasoning in progress...</span>
              </div>
            ) : voiceState === 'speaking' ? (
              <div className="w-full bg-emerald-950/60 border border-emerald-500/50 rounded-xl px-2.5 py-1 flex items-center justify-between gap-2 text-[11px] text-emerald-200">
                <div className="flex items-center gap-1.5 truncate">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
                  <span className="font-bold text-emerald-400 shrink-0">Speaking:</span>
                  <span className="truncate text-white">"{lastKofiMessage?.normalizedText || 'Responding...'}"</span>
                </div>
                {onRepeatResponse && lastKofiMessage && (
                  <button
                    onClick={() => onRepeatResponse(lastKofiMessage.normalizedText)}
                    className="shrink-0 text-[10px] font-bold bg-white/10 hover:bg-white/20 text-cyan-300 px-2 py-0.5 rounded transition flex items-center gap-1 cursor-pointer"
                    title="Repeat speech"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Repeat</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="text-[11px] text-gray-400 flex items-center gap-1.5 justify-center py-0.5">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Tap microphone below or click any quick prompt to speak</span>
              </div>
            )}
          </div>

          {/* Subtle Tone & Inferred Goal banner in compact dock */}
          {lastKofiMessage && (lastKofiMessage.detectedTone || lastKofiMessage.shouldTakeDeepBreath || (lastKofiMessage.isIncompleteSentence && lastKofiMessage.completedThought)) && (
            <div className="flex flex-wrap items-center justify-between gap-1 px-2.5 py-1 rounded-xl bg-white/5 border border-white/5 text-[10px]">
              <div className="flex items-center gap-1.5 truncate">
                {lastKofiMessage.detectedTone && (
                  <span className="flex items-center gap-1 text-gray-300 font-medium">
                    <span>
                      {lastKofiMessage.detectedTone === 'anxious' ? '😰' :
                       lastKofiMessage.detectedTone === 'nervous' ? '😟' :
                       lastKofiMessage.detectedTone === 'overwhelmed' ? '😫' :
                       lastKofiMessage.detectedTone === 'sad' ? '😢' :
                       lastKofiMessage.detectedTone === 'happy' ? '😊' : '🧘'}
                    </span>
                    <span className="capitalize">{lastKofiMessage.detectedTone}</span>
                  </span>
                )}
                {lastKofiMessage.shouldTakeDeepBreath && (
                  <span className="text-cyan-300 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/40">
                    🌬️ Deep Breath
                  </span>
                )}
              </div>
              {lastKofiMessage.isIncompleteSentence && lastKofiMessage.completedThought && (
                <span className="text-amber-300 truncate max-w-[220px]" title={lastKofiMessage.completedThought}>
                  💡 Inferred: {lastKofiMessage.completedThought}
                </span>
              )}
            </div>
          )}

          {/* Smooth Glowing Horizontal Waveform */}
          <div
            onClick={voiceState === 'speaking' || voiceState === 'processing' ? onInterrupt : onToggleMic}
            className="cursor-pointer py-0.5 hover:opacity-90 transition"
            title="Tap waveform to speak / interrupt"
          >
            <KofiWaveform
              voiceState={voiceState}
              frequencies={frequencies}
              height={36}
              isCompact={true}
            />
          </div>

          {/* Text Input Drawer if keyboard shortcut active */}
          {isKeyboardOpen && (
            <form onSubmit={handleFormSubmit} className="flex items-center gap-2 pt-1 pb-1">
              <input
                ref={inputRef}
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Ask Kofi in English or Twi (e.g. 'Find tomatoes in Techiman')..."
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
              <button
                type="submit"
                disabled={!textInput.trim()}
                className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 text-black font-semibold transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Bottom Bar: Keyboard & Memory on left, Mic in center, Voice & Expand on right */}
          <div className="flex items-center justify-between pt-0.5 px-2 gap-1">
            <div className="flex items-center gap-1">
              {/* Keyboard shortcut */}
              <button
                onClick={() => setIsKeyboardOpen(!isKeyboardOpen)}
                className={`p-2 rounded-xl text-xs transition flex items-center gap-1.5 ${
                  isKeyboardOpen
                    ? 'bg-white text-black font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title="Type a message"
              >
                <Keyboard className="w-4 h-4" />
                <span className="text-[11px] hidden sm:inline">Type</span>
              </button>

              {/* Memory Bank Quick Button */}
              {onOpenMemoryBank && (
                <button
                  onClick={onOpenMemoryBank}
                  className="p-2 rounded-xl text-xs transition flex items-center gap-1 text-purple-300 hover:text-purple-100 hover:bg-purple-950/50 border border-purple-800/30"
                  title="Open Kofi's Memory Bank"
                >
                  <Brain className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-[11px] hidden sm:inline">Memory</span>
                </button>
              )}
            </div>

            {/* Small Voice indicator button in center */}
            <button
              onClick={voiceState === 'speaking' || voiceState === 'processing' ? onInterrupt : onToggleMic}
              className={`p-2 rounded-2xl flex items-center gap-1.5 px-4 transition text-xs font-semibold shadow-md active:scale-95 ${
                voiceState === 'speaking' || voiceState === 'processing'
                  ? 'bg-red-500 text-white animate-pulse'
                  : voiceState === 'listening'
                  ? 'bg-cyan-400 text-black animate-pulse'
                  : voiceState === 'standby'
                  ? 'bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-white'
                  : 'bg-white/10 text-gray-200 hover:bg-white/20'
              }`}
              title={
                voiceState === 'speaking' || voiceState === 'processing'
                  ? 'Click to Interrupt (Esc)'
                  : 'Click to start voice standby'
              }
            >
              {voiceState === 'speaking' || voiceState === 'processing' ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>Interrupt</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>{voiceState === 'listening' ? (isPermanentVoiceEnabled ? 'Live Voice (Perm)' : 'Listening') : 'Talk to Kofi'}</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-1">
              {/* Voice Studio button */}
              {onOpenVoiceSettings && (
                <button
                  onClick={onOpenVoiceSettings}
                  className="p-2 rounded-xl text-xs transition flex items-center gap-1 text-emerald-300 hover:text-emerald-100 hover:bg-emerald-950/50 border border-emerald-800/30"
                  title="Open Permanent Voice Studio"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] hidden sm:inline">Voice</span>
                </button>
              )}

              {/* Expand Kofi / Settings shortcut on right */}
              <button
                onClick={onToggleExpand}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition flex items-center gap-1.5"
                title="Expand to Full Voice Interface"
              >
                <span className="text-[11px] hidden sm:inline">Expand</span>
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
