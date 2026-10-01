import React from 'react';
import {
  Sparkles,
  Sprout,
  Truck,
  ShoppingBag,
  BookOpen,
  Volume2,
  ShieldCheck,
  ChevronRight,
  Brain,
  Mic,
} from 'lucide-react';
import { SupportedLanguage, UserRole, AppRoute } from '../types';
import { VoiceState } from '../services/voiceEngine';
import { INITIAL_COMMODITY_PRICES } from '../services/gharvestData';

interface HeaderProps {
  currentTab: AppRoute;
  onSelectTab: (tab: AppRoute) => void;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeOrderCount: number;
  voiceState?: VoiceState;
  onToggleVoiceMode?: () => void;
  onExpandKofi?: () => void;
  onOpenMemoryBank?: () => void;
  onOpenVoiceSettings?: () => void;
  isPermanentVoiceEnabled?: boolean;
  memoryCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  language,
  onLanguageChange,
  role,
  onRoleChange,
  activeOrderCount,
  voiceState = 'idle',
  onToggleVoiceMode,
  onExpandKofi,
  onOpenMemoryBank,
  onOpenVoiceSettings,
  isPermanentVoiceEnabled = true,
  memoryCount = 5,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0c1610]/95 backdrop-blur-md border-b border-emerald-950/60 shadow-lg">
      {/* Live Market Price Ticker */}
      <div className="bg-emerald-950/80 text-emerald-300 text-xs py-1.5 px-4 border-b border-emerald-900/40 overflow-hidden flex items-center gap-3">
        <span className="font-semibold text-emerald-400 shrink-0 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          ESOKO / MOFA LIVE:
        </span>
        <div className="flex gap-6 overflow-x-auto no-scrollbar whitespace-nowrap text-[11px]">
          {INITIAL_COMMODITY_PRICES.map((p) => (
            <span key={p.id} className="inline-flex items-center gap-1.5">
              <span className="text-gray-300 font-medium">{p.crop}</span>
              <span className="text-emerald-400 font-semibold">GH₵ {p.wholesalePriceGHS}</span>
              <span className="text-gray-400 text-[10px]">({p.market.split(' ')[0]})</span>
              <span className={p.priceTrend === 'up' ? 'text-amber-400' : p.priceTrend === 'down' ? 'text-emerald-300' : 'text-gray-400'}>
                {p.priceTrend === 'up' ? '▲' : p.priceTrend === 'down' ? '▼' : '▬'} {p.changePercent}%
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Logo & Assistant Identity */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('marketplace')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg text-white font-bold text-lg ring-2 ring-purple-500/30">
            GH
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xl tracking-tight text-white">GHarvest</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExpandKofi?.();
                }}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 transition"
                title="Expand Kofi Voice Interface"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>KOFI ASSISTANT</span>
                <span className={`w-1.5 h-1.5 rounded-full ${voiceState === 'listening' ? 'bg-cyan-400 animate-ping' : voiceState === 'speaking' ? 'bg-pink-400 animate-pulse' : 'bg-emerald-400'}`} />
              </button>
            </div>
            <p className="text-xs text-gray-400 hidden sm:block">Voice-Guided Smallholder Commerce & Logistics</p>
          </div>
        </div>

        {/* Navigation Tabs (Unified App Structure) */}
        <nav className="hidden md:flex items-center gap-1 bg-[#122218] p-1 rounded-xl border border-emerald-900/50">
          <button
            onClick={() => onSelectTab('marketplace')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              currentTab === 'marketplace'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-emerald-900/40'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            Harvest Market
          </button>
          <button
            onClick={() => onSelectTab('orders')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 relative ${
              currentTab === 'orders'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-emerald-900/40'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Orders & Escrow
            {activeOrderCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center">
                {activeOrderCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onSelectTab('logistics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              currentTab === 'logistics'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-emerald-900/40'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Logistics & Freight
          </button>
          <button
            onClick={() => onSelectTab('farmer_services')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              currentTab === 'farmer_services'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-emerald-900/40'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Farmer Services
          </button>
          <button
            onClick={() => onSelectTab('nlp_studio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              currentTab === 'nlp_studio'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-emerald-900/40'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            GhanaNLP
          </button>
        </nav>

        {/* Controls: Memory Bank, Voice Settings, Role & Language */}
        <div className="flex items-center gap-2">
          {/* Permanent Voice Indicator & Studio Button */}
          {onOpenVoiceSettings && (
            <button
              onClick={onOpenVoiceSettings}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border ${
                isPermanentVoiceEnabled
                  ? 'bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 border-emerald-500/60 shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-gray-400 border-white/10'
              }`}
              title="Open Permanent Voice System Studio"
            >
              <Mic className={`w-3.5 h-3.5 ${isPermanentVoiceEnabled ? 'text-emerald-400 animate-pulse' : 'text-gray-400'}`} />
              <span className="hidden sm:inline">Voice:</span>
              <span className={isPermanentVoiceEnabled ? 'text-emerald-300' : 'text-gray-400'}>
                {isPermanentVoiceEnabled ? 'Permanent' : 'Push'}
              </span>
            </button>
          )}

          {/* Memory Bank Button */}
          {onOpenMemoryBank && (
            <button
              onClick={onOpenMemoryBank}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer bg-purple-950/70 hover:bg-purple-900/80 text-purple-200 border border-purple-500/50 shadow-sm"
              title="Open Kofi's Permanent Memory Bank"
            >
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Memory</span>
              <span className="w-4 h-4 rounded-full bg-purple-500/40 text-purple-200 text-[10px] font-bold flex items-center justify-center">
                {memoryCount}
              </span>
            </button>
          )}

          {/* Role selector */}
          <div className="relative">
            <select
              value={role}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-[#14261b] text-gray-200 border border-emerald-900/70 rounded-lg text-xs py-1.5 pl-2 pr-6 appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="buyer">Role: Buyer / Caterer</option>
              <option value="farmer">Role: Smallholder Farmer</option>
              <option value="logistics">Role: Logistics Provider</option>
            </select>
          </div>

          {/* Language selector */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
              className="bg-[#14261b] text-emerald-300 border border-emerald-900/70 rounded-lg text-xs py-1.5 pl-2 pr-6 appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer font-medium"
            >
              <option value="en-GH">🇬🇭 English (GH)</option>
              <option value="ak-GH">🇬🇭 Twi (Akan)</option>
              <option value="ga-GH">🇬🇭 Ga (Accra)</option>
              <option value="ee-GH">🇬🇭 Ewe (Volta)</option>
              <option value="pcm-GH">🇬🇭 Pidgin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile navigation bar */}
      <div className="flex md:hidden border-t border-emerald-950/70 bg-[#0d1811] px-2 py-1.5 justify-around text-xs">
        <button
          onClick={onExpandKofi}
          className="py-1 px-2 rounded font-medium text-cyan-400 flex items-center gap-1"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Kofi
        </button>
        <button
          onClick={() => onSelectTab('marketplace')}
          className={`py-1 px-2 rounded font-medium ${currentTab === 'marketplace' ? 'text-emerald-400' : 'text-gray-400'}`}
        >
          Harvests
        </button>
        <button
          onClick={() => onSelectTab('orders')}
          className={`py-1 px-2 rounded font-medium ${currentTab === 'orders' ? 'text-emerald-400' : 'text-gray-400'}`}
        >
          Orders ({activeOrderCount})
        </button>
        <button
          onClick={() => onSelectTab('logistics')}
          className={`py-1 px-2 rounded font-medium ${currentTab === 'logistics' ? 'text-emerald-400' : 'text-gray-400'}`}
        >
          Logistics
        </button>
        <button
          onClick={() => onSelectTab('nlp_studio')}
          className={`py-1 px-2 rounded font-medium ${currentTab === 'nlp_studio' ? 'text-amber-400' : 'text-gray-400'}`}
        >
          GhanaNLP
        </button>
      </div>
    </header>
  );
};
