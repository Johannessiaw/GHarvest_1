import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Mic,
  X,
  Sparkles,
  Play,
  Pause,
  Check,
  ShieldCheck,
  Zap,
  Wind,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import {
  PermanentVoiceStore,
  PermanentVoiceConfig,
  VOICE_PERSONAS,
  VoicePersonaId,
} from '../services/voiceSettings';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPreviewVoice: (phrase: string, personaId: VoicePersonaId) => void;
  onPermanentModeChange?: (enabled: boolean) => void;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  onPreviewVoice,
  onPermanentModeChange,
}) => {
  const [config, setConfig] = useState<PermanentVoiceConfig>(PermanentVoiceStore.getConfig());
  const [playingPersona, setPlayingPersona] = useState<VoicePersonaId | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfig(PermanentVoiceStore.getConfig());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpdate = (partial: Partial<PermanentVoiceConfig>) => {
    const updated = PermanentVoiceStore.updateConfig(partial);
    setConfig(updated);
    if ('permanentModeEnabled' in partial && onPermanentModeChange) {
      onPermanentModeChange(Boolean(partial.permanentModeEnabled));
    }
  };

  const handleSelectPersona = (id: VoicePersonaId) => {
    const updated = PermanentVoiceStore.setPersona(id);
    setConfig(updated);
    setToastMessage(`Switched permanent voice to ${VOICE_PERSONAS[id].name}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePreview = (personaId: VoicePersonaId) => {
    setPlayingPersona(personaId);
    const persona = VOICE_PERSONAS[personaId];
    onPreviewVoice(persona.samplePhrase, personaId);
    setTimeout(() => {
      setPlayingPersona(null);
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0c1811] border border-emerald-800/60 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-emerald-900/60 flex items-center justify-between bg-[#112318]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg text-white font-bold">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Permanent Voice System Studio</h2>
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                  Neural Persona
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Configure permanent always-on hands-free listening, voice identity, speed, and breathing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Toast Notice */}
          {toastMessage && (
            <div className="bg-emerald-950/90 border border-emerald-500/80 text-emerald-200 text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Primary Permanent Mode Switch (Hands-Free Always-On) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-[#102419] to-cyan-950/80 border border-emerald-600/50 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">Permanent Voice Mode (Always-On Listener)</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    config.permanentModeEnabled
                      ? 'bg-emerald-500 text-black'
                      : 'bg-gray-800 text-gray-400'
                  }`}>
                    {config.permanentModeEnabled ? 'ACTIVE' : 'OFF'}
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  When enabled, Kofi stays permanently active and listening across all screen navigation and tab switches. Automatic keep-alive auto-reconnects speech recognition with zero drops.
                </p>
              </div>

              <button
                onClick={() => handleUpdate({ permanentModeEnabled: !config.permanentModeEnabled })}
                className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  config.permanentModeEnabled ? 'bg-emerald-500' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    config.permanentModeEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Voice Personas Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                Select Permanent Voice Persona
              </span>
              <span className="text-[10px] text-gray-400">4 Authentic Personas</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(VOICE_PERSONAS) as VoicePersonaId[]).map((key) => {
                const persona = VOICE_PERSONAS[key];
                const isSelected = config.personaId === key;
                const isPlaying = playingPersona === key;

                return (
                  <div
                    key={persona.id}
                    onClick={() => handleSelectPersona(persona.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-emerald-950/70 border-emerald-400/80 shadow-md ring-1 ring-emerald-400/40'
                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{persona.avatarEmoji}</span>
                          <div>
                            <span className="text-sm font-bold text-white block">{persona.name}</span>
                            <span className="text-[11px] text-emerald-400 font-medium">{persona.tagline}</span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-300 leading-relaxed mt-1.5">{persona.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <span className="text-[10px] text-gray-400 truncate max-w-[140px]">{persona.accent}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreview(persona.id);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-cyan-300 text-[11px] font-medium transition flex items-center gap-1.5"
                      >
                        {isPlaying ? <Pause className="w-3 h-3 text-cyan-400 animate-spin" /> : <Play className="w-3 h-3 text-cyan-400" />}
                        <span>Sample</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Voice Modulation & Human Realism Sliders */}
          <div className="space-y-4 bg-[#112318]/50 p-4 rounded-2xl border border-emerald-900/50">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              Speech Modulation & Pacing
            </span>

            {/* Speed / Rate */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300">Speaking Rate (Speed)</span>
                <span className="text-emerald-400 font-mono font-bold">{config.rate.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.85"
                max="1.25"
                step="0.02"
                value={config.rate}
                onChange={(e) => handleUpdate({ rate: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500 bg-white/10 rounded-lg cursor-pointer h-2"
              />
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>0.85x (Deliberate & Grounded)</span>
                <span>1.0x (Natural)</span>
                <span>1.25x (Swift)</span>
              </div>
            </div>

            {/* Pitch */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300">Vocal Pitch Modulation</span>
                <span className="text-cyan-400 font-mono font-bold">{config.pitch.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.85"
                max="1.15"
                step="0.02"
                value={config.pitch}
                onChange={(e) => handleUpdate({ pitch: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 bg-white/10 rounded-lg cursor-pointer h-2"
              />
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>0.85x (Deep Baritone)</span>
                <span>1.0x (Standard)</span>
                <span>1.15x (Higher)</span>
              </div>
            </div>
          </div>

          {/* Human Tonal Realism Toggles */}
          <div className="space-y-3 bg-[#112318]/50 p-4 rounded-2xl border border-emerald-900/50">
            <span className="text-[11px] font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5" />
              Human Resonance & Turn Dynamics
            </span>

            <div className="space-y-3">
              {/* Deep Breaths & Sighs */}
              <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-white/5 transition">
                <div className="space-y-0.5">
                  <span className="text-xs text-white font-medium block">Natural Deep Breaths & Empathetic Sighs</span>
                  <span className="text-[11px] text-gray-400 block">
                    Kofi takes audible breaths when sensing nervousness, grounding the conversation authentically
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={config.deepBreathsEnabled}
                  onChange={(e) => handleUpdate({ deepBreathsEnabled: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer shrink-0 ml-3"
                />
              </label>

              {/* Instant Thinking Acknowledgment */}
              <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-white/5 transition">
                <div className="space-y-0.5">
                  <span className="text-xs text-white font-medium block">Immediate Thinking Acknowledgment</span>
                  <span className="text-[11px] text-gray-400 block">
                    Plays instant double-tone earcon and verbal filler ("Checking that for you...") within 40ms of speech end
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={config.thinkingAcknowledgmentEnabled}
                  onChange={(e) => handleUpdate({ thinkingAcknowledgmentEnabled: e.target.checked })}
                  className="w-4 h-4 accent-cyan-400 rounded cursor-pointer shrink-0 ml-3"
                />
              </label>

              {/* Auto Speak Responses */}
              <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-white/5 transition">
                <div className="space-y-0.5">
                  <span className="text-xs text-white font-medium block">Auto-Speak Spoken Responses</span>
                  <span className="text-[11px] text-gray-400 block">
                    Always synthesize and read Kofi's replies aloud automatically
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={config.autoSpeakResponses}
                  onChange={(e) => handleUpdate({ autoSpeakResponses: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer shrink-0 ml-3"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-emerald-900/60 bg-[#112318]/70 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1.5 text-cyan-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Permanent voice preferences saved automatically</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
