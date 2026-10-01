import React from 'react';
import { Volume2, VolumeX, CheckCircle, Truck, MapPin, DollarSign, ShieldAlert, Sparkles, User, Bot, AlertCircle } from 'lucide-react';
import { VoiceMessage, Order } from '../types';

interface ConversationFeedProps {
  messages: VoiceMessage[];
  onPlaySpeech: (text: string) => void;
  onConfirmOrder: (orderData: any) => void;
  isKofiSpeaking: boolean;
  onInterrupt?: () => void;
}

export const ConversationFeed: React.FC<ConversationFeedProps> = ({
  messages,
  onPlaySpeech,
  onConfirmOrder,
  isKofiSpeaking,
  onInterrupt,
}) => {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-[#0d1811]/40 rounded-2xl border border-emerald-950/60 my-4">
        <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 mb-3">
          <Bot className="w-6 h-6" />
        </div>
        <h4 className="font-display font-semibold text-white text-base">Conversation with Kofi</h4>
        <p className="text-xs text-gray-400 max-w-sm mt-1">
          Tap the voice orb or pick a sample prompt below to start. Kofi understands Ghanaian English, Asante Twi, crop names, quantities, and locations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 my-4 max-w-3xl mx-auto px-2">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {msg.sender === 'kofi' && (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-emerald-950 mt-1">
              <Bot className="w-5 h-5" />
            </div>
          )}

          <div className={`max-w-[85%] rounded-2xl p-4 shadow-md ${
            msg.sender === 'user'
              ? 'bg-[#1b3826] text-white border border-emerald-700/50'
              : 'bg-[#112017] text-gray-100 border border-emerald-900/60'
          }`}>
            {/* Header info */}
            <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5 gap-2">
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                {msg.sender === 'user' ? 'You' : 'Kofi'}
                {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800/50">
                    tools: {msg.toolsUsed.join(', ')}
                  </span>
                )}
              </span>
              <span className="text-[10px] text-gray-400">{msg.timestamp}</span>
            </div>

            {/* If User: display raw transcription & GhanaNLP normalization tag */}
            {msg.sender === 'user' && msg.rawText && msg.rawText !== msg.normalizedText && (
              <div className="mb-2 bg-[#12241a] p-2 rounded-lg text-xs border border-emerald-800/40">
                <div className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider">
                  Raw Transcription (ASR):
                </div>
                <div className="text-gray-300 italic text-[11px]">"{msg.rawText}"</div>
                <div className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider mt-1">
                  GhanaNLP Normalized:
                </div>
                <div className="text-white font-medium text-xs">{msg.normalizedText}</div>
              </div>
            )}

            {/* Message Body */}
            <p className="text-sm leading-relaxed whitespace-pre-line font-normal">
              {msg.normalizedText}
            </p>

            {/* Kofi Voice Playback Button */}
            {msg.sender === 'kofi' && (
              <div className="mt-2.5 pt-2 border-t border-emerald-950/80 flex items-center justify-between">
                <button
                  onClick={() => onPlaySpeech(msg.normalizedText)}
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition py-1 px-2 rounded-md bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/40"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Read aloud (Ghanaian Speech)
                </button>

                {isKofiSpeaking && onInterrupt && (
                  <button
                    onClick={onInterrupt}
                    className="inline-flex items-center gap-1 text-xs text-red-300 hover:text-white transition py-1 px-2.5 rounded-md bg-red-950/60 hover:bg-red-900/80 border border-red-800/50 animate-pulse"
                  >
                    <VolumeX className="w-3.5 h-3.5" />
                    Stop speaking
                  </button>
                )}
              </div>
            )}

            {/* Action Cards */}
            {msg.actionCard && (
              <div className="mt-3.5 pt-2">
                {/* 1. Order Summary Card */}
                {msg.actionCard.type === 'order_summary' && (
                  <div className="bg-[#0b1710] border border-amber-500/40 rounded-xl p-3.5 shadow-lg">
                    <div className="flex items-center justify-between border-b border-emerald-950 pb-2 mb-2.5">
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ORDER CONFIRMATION SUMMARY
                      </div>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
                        Escrow Protected
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div>
                        <span className="text-gray-400 block text-[10px]">Product & Quantity</span>
                        <span className="font-semibold text-white">
                          {msg.actionCard.data.quantity} {msg.actionCard.data.unit} of {msg.actionCard.data.product}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">Verified Farmer</span>
                        <span className="font-semibold text-emerald-300">
                          {msg.actionCard.data.farmerName} ({msg.actionCard.data.farmerPhone})
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">Pickup Hub</span>
                        <span className="text-gray-200 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-400" />
                          {msg.actionCard.data.pickup}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">Delivery Destination</span>
                        <span className="text-gray-200 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-400" />
                          {msg.actionCard.data.destination}
                        </span>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-[#122218] p-2.5 rounded-lg border border-emerald-900/60 text-xs space-y-1 mb-3">
                      <div className="flex justify-between text-gray-300">
                        <span>Harvest Cost:</span>
                        <span>GH₵ {msg.actionCard.data.cropPriceGHS?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Logistics ({msg.actionCard.data.vehicle}):</span>
                        <span>GH₵ {msg.actionCard.data.transportGHS?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>GHarvest Escrow Fee:</span>
                        <span>GH₵ {msg.actionCard.data.serviceFeeGHS?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-emerald-300 pt-1 border-t border-emerald-900/80 text-sm">
                        <span>Total Escrow Amount:</span>
                        <span>GH₵ {msg.actionCard.data.totalAmountGHS?.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => msg.actionCard && onConfirmOrder(msg.actionCard.data)}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold py-2 px-3 rounded-lg text-xs shadow-md transition flex items-center justify-center gap-1.5"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
                        Confirm Order & Open MoMo Escrow
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Logistics Route Card */}
                {msg.actionCard.type === 'logistics_estimate' && (
                  <div className="bg-[#0e1b13] border border-emerald-800/60 rounded-xl p-3 text-xs">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
                      <Truck className="w-4 h-4" />
                      LOGISTICS ROUTE ESTIMATE
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-gray-200">
                      <div>
                        <span className="text-[10px] text-gray-400 block">Distance</span>
                        <span className="font-semibold text-white">{msg.actionCard.data.distanceKm} km</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block">Transit Time</span>
                        <span className="font-semibold text-white">~{msg.actionCard.data.hours} hours</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block">Estimated Cost</span>
                        <span className="font-semibold text-emerald-400">GH₵ {msg.actionCard.data.estimatedCostGHS}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Web URL Summary Card */}
                {msg.actionCard.type === 'web_summary' && (
                  <div className="bg-[#0c1811] border border-blue-600/40 rounded-xl p-3 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-blue-400 font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        URL INSPECTION SUMMARY
                      </span>
                      <span className="text-[10px] text-blue-300 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800/40">
                        Status: {msg.actionCard.data.status}
                      </span>
                    </div>
                    <div className="font-semibold text-white mb-1">{msg.actionCard.data.title}</div>
                    <div className="text-gray-300 text-[11px] leading-relaxed line-clamp-3 mb-2">
                      {msg.actionCard.data.extractedText || msg.actionCard.data.description}
                    </div>
                    <a
                      href={msg.actionCard.data.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-blue-400 hover:underline inline-flex items-center gap-1"
                    >
                      Open Link: {msg.actionCard.data.url}
                    </a>
                  </div>
                )}

                {/* 4. Weather Alert Card */}
                {msg.actionCard.type === 'weather_alert' && (
                  <div className="bg-[#0f1d14] border border-emerald-700/50 rounded-xl p-3 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-emerald-300 font-bold">
                        AGRI-WEATHER: {msg.actionCard.data.town} ({msg.actionCard.data.region})
                      </span>
                      <span className="text-white font-bold">{msg.actionCard.data.temperatureC}°C</span>
                    </div>
                    <p className="text-gray-300 text-[11px]">{msg.actionCard.data.advisory}</p>
                  </div>
                )}

                {/* 5. Live Price Check Card */}
                {msg.actionCard.type === 'price_check' && Array.isArray(msg.actionCard.data) && (
                  <div className="bg-[#0c1910] border border-emerald-800/50 rounded-xl p-3 text-xs">
                    <div className="text-emerald-400 font-bold mb-2">VERIFIED WHOLESALE COMMODITY PRICES</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {msg.actionCard.data.slice(0, 6).map((item: any, idx: number) => (
                        <div key={idx} className="bg-[#132419] p-2 rounded-lg border border-emerald-900/60">
                          <span className="text-gray-300 font-medium block text-[11px]">{item.crop}</span>
                          <span className="text-emerald-300 font-bold text-xs">GH₵ {item.wholesalePriceGHS}</span>
                          <span className="text-gray-400 block text-[9px] truncate">{item.market}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {msg.sender === 'user' && (
            <div className="w-9 h-9 rounded-xl bg-emerald-800 flex items-center justify-center text-white shrink-0 shadow-md mt-1">
              <User className="w-5 h-5" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
