/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Header } from './components/Header';
import { MarketplaceView } from './components/MarketplaceView';
import { LogisticsTrackerView } from './components/LogisticsTrackerView';
import { GhanaNlpStudioView } from './components/GhanaNlpStudioView';
import { OrderModal } from './components/OrderModal';
import { FarmerListingModal } from './components/FarmerListingModal';
import { KofiUnifiedInterface } from './components/KofiUnifiedInterface';
import { MemoryBankModal } from './components/MemoryBankModal';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';
import { KofiMemoryStore } from './services/memoryEngine';
import { PermanentVoiceStore } from './services/voiceSettings';
import { KofiVoiceEngine, classifyKofiIntent, KofiIntent, VoiceState } from './services/voiceEngine';
import { normalizeGhanaianSpeech } from './services/ghanaNlp';
import { GHarvestDataManager, INITIAL_HARVESTS, INITIAL_ORDERS } from './services/gharvestData';
import {
  SupportedLanguage,
  UserRole,
  VoiceMessage,
  Order,
  HarvestListing,
  ConversationMemory,
  AppRoute,
  AppContextState,
} from './types';
import { AppAction, validateAppAction } from './types/actions';
import {
  Sprout,
  Truck,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('marketplace');
  const [routeHistory, setRouteHistory] = useState<AppRoute[]>(['marketplace']);
  const [language, setLanguage] = useState<SupportedLanguage>('en-GH');
  const [role, setRole] = useState<UserRole>('buyer');
  const [voiceState, setVoiceState] = useState<VoiceState>('standby');
  const [partialTranscript, setPartialTranscript] = useState<string>('');
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [frequencies, setFrequencies] = useState<Uint8Array>(new Uint8Array(16));
  const [memory, setMemory] = useState<ConversationMemory>({});
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [harvests, setHarvests] = useState<HarvestListing[]>(INITIAL_HARVESTS);
  const [activeOrderModal, setActiveOrderModal] = useState<any | null>(null);
  const [isFarmerModalOpen, setIsFarmerModalOpen] = useState<boolean>(false);
  const [isKofiExpanded, setIsKofiExpanded] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Permanent Voice & Memory Bank Modals and Reactive Count
  const [isMemoryBankOpen, setIsMemoryBankOpen] = useState<boolean>(false);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState<boolean>(false);
  const [isPermanentVoiceEnabled, setIsPermanentVoiceEnabled] = useState<boolean>(
    () => PermanentVoiceStore.getConfig().permanentModeEnabled
  );
  const [memoryCount, setMemoryCount] = useState<number>(() => KofiMemoryStore.getMemories().length);

  // App Selection Context
  const [selectedListing, setSelectedListing] = useState<HarvestListing | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [marketplaceSearch, setMarketplaceSearch] = useState<string>('');
  const [marketplaceLocationFilter, setMarketplaceLocationFilter] = useState<string>('');
  const [marketplaceSort, setMarketplaceSort] = useState<'cheapest' | 'highest_price' | 'nearest' | 'newest'>('cheapest');
  const isSubmittingOrderRef = useRef<boolean>(false);

  // Continuous Conversation Messages
  const [messages, setMessages] = useState<VoiceMessage[]>([
    {
      id: 'init-msg',
      sender: 'kofi',
      normalizedText:
        "Akwaaba! I'm Kofi, your voice-first AI guide for GHarvest. I connect verified Ghanaian smallholders with buyers and haulage trucks across Ghana. You can ask me to find produce, check market prices, track orders, or calculate freight. What can I help you with?",
      timestamp: 'Just now',
      toolsUsed: ['GHarvest-Core', 'GhanaNLP'],
    },
  ]);

  const voiceEngineRef = useRef<KofiVoiceEngine | null>(null);
  const chatAbortControllerRef = useRef<AbortController | null>(null);

  // Navigate with history tracking
  const navigateTo = (newRoute: AppRoute) => {
    if (newRoute === currentRoute) return;
    setRouteHistory((prev) => [...prev, newRoute]);
    setCurrentRoute(newRoute);
  };

  // Go back support
  const handleGoBack = () => {
    if (routeHistory.length > 1) {
      const updated = [...routeHistory];
      updated.pop(); // remove current
      const prevRoute = updated[updated.length - 1];
      setRouteHistory(updated);
      setCurrentRoute(prevRoute);
    } else {
      setCurrentRoute('marketplace');
    }
  };

  // Keyboard shortcut for Esc key: interrupt Kofi anytime
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (voiceState === 'speaking' || voiceState === 'processing') {
          handleInterrupt();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [voiceState]);

  // Execute structured Kofi intent returned from /api/voice/intent
  const handleKofiIntent = (intent: KofiIntent) => {
    // 1. Clear active transcripts once turn finishes
    setPartialTranscript('');
    setFinalTranscript('');

    // 2. Instant zero-latency interruption handling
    if (intent.type === 'interruption') {
      handleInterrupt();
      return;
    }

    // 3. Append user spoken transcript
    const userMsg: VoiceMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      normalizedText: intent.transcript,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // 4. Append Kofi's conversational response with deep reasoning & tone analysis
    const kofiMsg: VoiceMessage = {
      id: `kofi-${Date.now()}`,
      sender: 'kofi',
      normalizedText: intent.response,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      toolsUsed: ['Kofi-Intent', intent.action ? `Action:${intent.action}` : 'Navigation'],
      reasoning: intent.reasoning,
      isIncompleteSentence: intent.isIncompleteSentence,
      completedThought: intent.completedThought,
      detectedTone: intent.detectedTone,
      toneConfidence: intent.toneConfidence,
      emotionalContext: intent.emotionalContext,
      shouldTakeDeepBreath: intent.shouldTakeDeepBreath,
      vocalStyle: intent.vocalStyle,
      audioBase64: intent.audioBase64,
    };

    setMessages((prev) => [...prev, userMsg, kofiMsg]);

    // 5. Execute Screen Navigation
    if (intent.route) {
      navigateTo(intent.route as AppRoute);
    }

    // 6. Execute Specific Application Action
    if (intent.action === 'search_listings' || intent.action === 'search_marketplace') {
      navigateTo('marketplace');
      const product = intent.entities?.product || intent.entities?.crop || intent.entities?.query;
      if (product) {
        setMarketplaceSearch(String(product));
      }
      const location = intent.entities?.location || intent.entities?.town;
      if (location) {
        setMarketplaceLocationFilter(String(location));
      }
    } else if (intent.action === 'filter_marketplace') {
      navigateTo('marketplace');
      if (intent.entities?.crop) {
        setMarketplaceSearch(String(intent.entities.crop));
      }
      if (intent.entities?.location) {
        setMarketplaceLocationFilter(String(intent.entities.location));
      }
    } else if (intent.action === 'show_orders' || intent.action === 'track_order') {
      navigateTo('orders');
      if (intent.entities?.orderId) {
        const target = orders.find((o) => o.id === intent.entities.orderId);
        if (target) setSelectedOrder(target);
      }
    } else if (intent.action === 'show_logistics') {
      navigateTo('logistics');
    } else if (intent.action === 'open_farmer_services') {
      setIsFarmerModalOpen(true);
    } else if (intent.action === 'open_home') {
      navigateTo('home');
    } else if (intent.action === 'open_order_draft') {
      if (intent.entities?.crop) {
        setActiveOrderModal({
          crop: String(intent.entities.crop),
          quantity: Number(intent.entities.quantity || 10),
          unit: String(intent.entities.unit || 'Bags'),
        });
      }
    }

    // 7. Speak response naturally through Voice Engine with deep breath and emotional modulation
    if (intent.response && voiceEngineRef.current) {
      voiceEngineRef.current.speak(intent.response, {
        audioBase64: intent.audioBase64,
        shouldTakeDeepBreath: intent.shouldTakeDeepBreath,
        tone: intent.detectedTone,
      });
    }
  };

  // Initialize Voice Engine & sync backend data
  useEffect(() => {
    setOrders(GHarvestDataManager.getOrders());
    setHarvests(GHarvestDataManager.getHarvests());

    // Sync with backend API
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setOrders(data);
        }
      })
      .catch(() => {});

    fetch('/api/harvests')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setHarvests(data);
        }
      })
      .catch(() => {});

    const engine = new KofiVoiceEngine(
      {
        onStateChange: (newState) => {
          setVoiceState(newState);
        },
        onTranscript: (partial, finalT) => {
          setPartialTranscript(partial);
          setFinalTranscript(finalT);
        },
        onIntent: (intent) => {
          handleKofiIntent(intent);
        },
        onError: (err) => {
          setErrorMessage(err);
          setTimeout(() => setErrorMessage(null), 5000);
        },
        onAudioFrequencies: (freqData) => {
          setFrequencies(new Uint8Array(freqData));
        },
      },
      {
        language: 'en-GH',
        silenceTimeoutMs: 320,
        minimumSpeechMs: 140,
        handsFree: true,
        classifyIntent: classifyKofiIntent,
      }
    );

    voiceEngineRef.current = engine;

    // Zero-Click Hands-Free Voice Activation:
    // Starts continuous transcription the moment user speaks; activates on page load or on first user gesture
    const autoActivateHandsFree = () => {
      engine.unlockAudio();
      engine.autoStartHandsFree().catch(() => {});
    };

    // Attempt start on mount (if permission was already granted)
    engine.autoStartHandsFree().catch(() => {});

    window.addEventListener('click', autoActivateHandsFree, { once: true });
    window.addEventListener('touchstart', autoActivateHandsFree, { once: true });
    window.addEventListener('keydown', autoActivateHandsFree, { once: true });

    return () => {
      window.removeEventListener('click', autoActivateHandsFree);
      window.removeEventListener('touchstart', autoActivateHandsFree);
      window.removeEventListener('keydown', autoActivateHandsFree);
      engine.destroy();
    };
  }, []);

  // Synchronize memory count and permanent voice status reactively
  useEffect(() => {
    const handleMemoryUpdate = () => {
      setMemoryCount(KofiMemoryStore.getMemories().length);
    };
    const handleVoiceUpdate = (e: Event) => {
      const customEvt = e as CustomEvent;
      if (customEvt.detail?.permanentModeEnabled !== undefined) {
        setIsPermanentVoiceEnabled(customEvt.detail.permanentModeEnabled);
      }
    };

    window.addEventListener('kofi-memory-updated', handleMemoryUpdate);
    window.addEventListener('kofi-voice-config-updated', handleVoiceUpdate);

    return () => {
      window.removeEventListener('kofi-memory-updated', handleMemoryUpdate);
      window.removeEventListener('kofi-voice-config-updated', handleVoiceUpdate);
    };
  }, []);

  // Compute live AppContextState to pass into Kofi on every request
  const currentAppContext = useMemo<AppContextState>(() => {
    let pageTitle = 'Harvest Market';
    if (currentRoute === 'orders') pageTitle = 'Orders & Escrow';
    if (currentRoute === 'logistics') pageTitle = 'Logistics & Freight';
    if (currentRoute === 'farmer_services') pageTitle = 'Farmer Services';
    if (currentRoute === 'nlp_studio') pageTitle = 'GhanaNLP Studio';
    if (currentRoute === 'home') pageTitle = 'GHarvest Overview';

    return {
      currentRoute,
      currentPageTitle: pageTitle,
      selectedListing,
      selectedOrder,
      userRole: role,
      language,
      availableActions: [
        'browse marketplace',
        'search tomatoes, maize, yam, cassava',
        'filter by town (Techiman, Ejura, Tamale)',
        'calculate freight transport',
        'track active orders in escrow',
        'list harvest produce',
      ],
      lastSearchQuery: marketplaceSearch,
      lastLocationFilter: marketplaceLocationFilter,
    };
  }, [
    currentRoute,
    selectedListing,
    selectedOrder,
    role,
    language,
    marketplaceSearch,
    marketplaceLocationFilter,
  ]);

  // Main Unified Kofi Conversational Dispatcher for Text Inputs / Quick Prompts
  const handleUserQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    voiceEngineRef.current?.unlockAudio();

    // Handle instant 'stop' locally for zero-latency interruption
    const cleanLower = queryText.toLowerCase().trim();
    if (cleanLower === 'stop' || cleanLower === 'quiet' || cleanLower === 'pause') {
      handleInterrupt();
      return;
    }

    if (chatAbortControllerRef.current) {
      chatAbortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    chatAbortControllerRef.current = abortController;

    // Show processing in UI
    setVoiceState('processing');

    try {
      const intent = await classifyKofiIntent(queryText.trim(), abortController.signal);
      handleKofiIntent(intent);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error('Kofi intent error:', err);
      const fallbackMsg: VoiceMessage = {
        id: `kofi-${Date.now()}`,
        sender: 'kofi',
        normalizedText:
          "I'm having trouble processing that right now. Could you please repeat or type your request?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      voiceEngineRef.current?.speak(fallbackMsg.normalizedText);
    } finally {
      if (chatAbortControllerRef.current === abortController) {
        chatAbortControllerRef.current = null;
      }
    }
  };

  // Toggle voice listening
  const handleToggleMic = () => {
    voiceEngineRef.current?.unlockAudio();
    if (voiceState === 'speaking' || voiceState === 'processing') {
      handleInterrupt();
    } else if (voiceState === 'listening') {
      voiceEngineRef.current?.stop();
      voiceEngineRef.current?.setHandsFree(false);
      setVoiceState('standby');
    } else {
      setPartialTranscript('');
      setFinalTranscript('');
      setVoiceState('listening');
      voiceEngineRef.current?.setHandsFree(true);
      voiceEngineRef.current?.autoStartHandsFree().catch(() => {});
    }
  };

  // Interrupt Kofi immediately
  const handleInterrupt = () => {
    if (chatAbortControllerRef.current) {
      chatAbortControllerRef.current.abort();
      chatAbortControllerRef.current = null;
    }
    voiceEngineRef.current?.interrupt();
    setVoiceState('interrupted');
  };

  // Order with Kofi shortcut from Marketplace
  const handleOrderWithKofi = (harvest: HarvestListing) => {
    setSelectedListing(harvest);
    const prompt = `I want to order ${harvest.minOrderQuantity * 2} ${harvest.unit} of ${harvest.crop} from ${harvest.farmerName} in ${harvest.locationTown} for delivery in Kumasi.`;
    handleUserQuery(prompt);
  };

  // Finalize order from modal
  const handleFinalizeOrder = (newOrder: Order) => {
    GHarvestDataManager.addOrder(newOrder);
    setOrders(GHarvestDataManager.getOrders());
    setActiveOrderModal(null);
    setSelectedOrder(newOrder);

    // Sync with backend API
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    }).catch(() => {});

    const confirmationMsg: VoiceMessage = {
      id: `kofi-${Date.now()}`,
      sender: 'kofi',
      normalizedText: `Payment confirmed! Simulated order ${newOrder.id} for ${newOrder.quantity} ${newOrder.unit} of ${newOrder.crop} is registered. You can track transit and release escrow on the Orders tab.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      toolsUsed: ['MTN-MoMo-Escrow', 'GHarvest-Dispatch'],
    };
    setMessages((prev) => [...prev, confirmationMsg]);
    voiceEngineRef.current?.speak(
      `Order ${newOrder.id} confirmed and escrow draft created for ${newOrder.crop}.`
    );
  };

  // Update order status
  const handleUpdateOrderStatus = (
    orderId: string,
    status: Order['status'],
    escrowStatus?: Order['escrowStatus'],
    note?: string
  ) => {
    GHarvestDataManager.updateOrderStatus(orderId, status, escrowStatus, note);
    setOrders(GHarvestDataManager.getOrders());
    voiceEngineRef.current?.playChime(660, 0.15);

    fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, escrowStatus, note }),
    }).catch(() => {});
  };

  // Add new farmer harvest
  const handleAddHarvest = (newHarvest: HarvestListing) => {
    GHarvestDataManager.addHarvest(newHarvest);
    setHarvests(GHarvestDataManager.getHarvests());

    fetch('/api/harvests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newHarvest),
    }).catch(() => {});

    const msg: VoiceMessage = {
      id: `kofi-${Date.now()}`,
      sender: 'kofi',
      normalizedText: `Akwaaba! Your harvest listing for ${newHarvest.quantityAvailable} ${newHarvest.unit} of ${newHarvest.crop} in ${newHarvest.locationTown} is now live on GHarvest. I will alert verified buyers for you!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      toolsUsed: ['GHarvest-Farmer-Listing'],
    };
    setMessages((prev) => [...prev, msg]);
    voiceEngineRef.current?.speak(
      'Your harvest has been listed on GHarvest. Buyers will see your verified listing.'
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070e09] text-gray-100 relative pb-28">
      {/* Header with live ticker & unified navigation tabs */}
      <Header
        currentTab={currentRoute}
        onSelectTab={navigateTo}
        language={language}
        onLanguageChange={setLanguage}
        role={role}
        onRoleChange={setRole}
        activeOrderCount={orders.filter((o) => o.status !== 'completed').length}
        voiceState={voiceState}
        onToggleVoiceMode={handleToggleMic}
        onExpandKofi={() => setIsKofiExpanded(true)}
        onOpenMemoryBank={() => setIsMemoryBankOpen(true)}
        onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
        isPermanentVoiceEnabled={isPermanentVoiceEnabled}
        memoryCount={memoryCount}
      />

      {/* Main View Area: Application content is ALWAYS VISIBLE and interactive */}
      <main className="flex-1 overflow-y-auto">
        {/* Route: Home Dashboard */}
        {currentRoute === 'home' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="bg-gradient-to-r from-emerald-950 via-[#0e1d14] to-[#0a150e] border border-emerald-800/60 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Kofi Voice-First Commerce
                </span>
                <h1 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
                  Ghanaian Smallholder Agricultural Hub
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
                  Connect verified smallholder farms with caterers, processors, and haulage trucks with secure Mobile Money escrow protection.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigateTo('marketplace')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-5 rounded-2xl text-xs flex items-center gap-2 shadow-lg transition"
                >
                  <Sprout className="w-4 h-4" />
                  Explore Harvests
                </button>
                <button
                  onClick={() => setIsKofiExpanded(true)}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 px-5 rounded-2xl text-xs flex items-center gap-2 border border-white/20 transition"
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Talk to Kofi
                </button>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                onClick={() => {
                  setMarketplaceSearch('Tomatoes');
                  navigateTo('marketplace');
                }}
                className="bg-[#0f1f16] border border-emerald-900/60 p-4 rounded-2xl hover:border-emerald-600/60 transition cursor-pointer space-y-1"
              >
                <Sprout className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-white text-sm">Find Produce</h3>
                <p className="text-[11px] text-gray-400">Search tomatoes, maize, and pona yam from verified farms.</p>
              </div>

              <div
                onClick={() => navigateTo('logistics')}
                className="bg-[#0f1f16] border border-emerald-900/60 p-4 rounded-2xl hover:border-emerald-600/60 transition cursor-pointer space-y-1"
              >
                <Truck className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold text-white text-sm">Calculate Freight</h3>
                <p className="text-[11px] text-gray-400">Check haulage distances, vehicle types, and Ghana Cedi rates.</p>
              </div>

              <div
                onClick={() => navigateTo('orders')}
                className="bg-[#0f1f16] border border-emerald-900/60 p-4 rounded-2xl hover:border-emerald-600/60 transition cursor-pointer space-y-1"
              >
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-white text-sm">Track Orders & Escrow</h3>
                <p className="text-[11px] text-gray-400">Inspect active shipments and release Mobile Money funds.</p>
              </div>

              <div
                onClick={() => setIsFarmerModalOpen(true)}
                className="bg-[#0f1f16] border border-emerald-900/60 p-4 rounded-2xl hover:border-emerald-600/60 transition cursor-pointer space-y-1"
              >
                <ShieldCheck className="w-5 h-5 text-pink-400" />
                <h3 className="font-semibold text-white text-sm">List Farm Harvest</h3>
                <p className="text-[11px] text-gray-400">MoFA-registered farmers can broadcast crops to bulk buyers.</p>
              </div>
            </div>

            {/* In-Transit Highlights */}
            <div className="bg-[#0d1a12] border border-emerald-900/50 p-5 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-white text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Active Shipments in Transit
                </h2>
                <button
                  onClick={() => navigateTo('orders')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
                >
                  View all ({orders.length}) <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.slice(0, 2).map((order) => (
                  <div
                    key={order.id}
                    onClick={() => {
                      setSelectedOrder(order);
                      navigateTo('orders');
                    }}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition cursor-pointer flex justify-between items-center"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">Order {order.id}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800 uppercase">
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300">
                        {order.quantity} {order.unit} {order.crop} ({order.pickupTown} → {order.deliveryTown})
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-400 text-xs font-mono">
                        GH₵ {order.totalAmountGHS.toLocaleString()}
                      </div>
                      <span className="text-[10px] text-gray-400">Escrow: {order.escrowStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Route: Marketplace */}
        {currentRoute === 'marketplace' && (
          <MarketplaceView
            harvests={harvests}
            onOrderWithKofi={handleOrderWithKofi}
            onOpenNewListing={() => setIsFarmerModalOpen(true)}
            searchQuery={marketplaceSearch}
            onSearchQueryChange={setMarketplaceSearch}
            selectedListingId={selectedListing?.id}
            onSelectListing={(h) => setSelectedListing(h)}
          />
        )}

        {/* Route: Orders & Escrow */}
        {currentRoute === 'orders' && (
          <LogisticsTrackerView
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            selectedOrderId={selectedOrder?.id}
            onSelectOrder={(o) => setSelectedOrder(o)}
          />
        )}

        {/* Route: Logistics & Freight */}
        {currentRoute === 'logistics' && (
          <LogisticsTrackerView
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            selectedOrderId={selectedOrder?.id}
            onSelectOrder={(o) => setSelectedOrder(o)}
          />
        )}

        {/* Route: Farmer Services */}
        {currentRoute === 'farmer_services' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="bg-[#0f1f16] border border-emerald-800/70 p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  MoFA Farmer Extension & Verification Portal
                </h2>
                <p className="text-xs text-gray-300 mt-1 max-w-xl">
                  Register your cluster, verify national MoFA ID credentials, and broadcast verified harvests directly to Ghanaian commercial kitchens and school feeding caterers.
                </p>
              </div>
              <button
                onClick={() => setIsFarmerModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-5 rounded-2xl text-xs flex items-center gap-2 shadow-lg transition"
              >
                <Sprout className="w-4 h-4" />
                List New Harvest
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0b160f] p-5 rounded-2xl border border-emerald-900/60 space-y-2">
                <span className="text-xs text-emerald-400 font-semibold uppercase">Verification Status</span>
                <div className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Cluster Active
                </div>
                <p className="text-xs text-gray-400">Bono East & Ashanti smallholder cooperatives linked to Techiman packhouse.</p>
              </div>

              <div className="bg-[#0b160f] p-5 rounded-2xl border border-emerald-900/60 space-y-2">
                <span className="text-xs text-amber-400 font-semibold uppercase">Simulated MoMo Payouts</span>
                <div className="text-lg font-bold text-white">GH₵ 48,920</div>
                <p className="text-xs text-gray-400">Total escrow payments cleared directly to smallholder MoMo wallets upon delivery.</p>
              </div>

              <div className="bg-[#0b160f] p-5 rounded-2xl border border-emerald-900/60 space-y-2">
                <span className="text-xs text-purple-400 font-semibold uppercase">Voice Commerce</span>
                <div className="text-lg font-bold text-white">Twi & English</div>
                <p className="text-xs text-gray-400">Farmers can use voice in Asante Twi to list crops without typing on complex screens.</p>
              </div>
            </div>
          </div>
        )}

        {/* Route: GhanaNLP Studio */}
        {currentRoute === 'nlp_studio' && (
          <GhanaNlpStudioView onSpeakSample={(text) => voiceEngineRef.current?.speak(text)} />
        )}
      </main>

      {/* SINGLE UNIFIED KOFI VOICE & INTERACTION LAYER */}
      <KofiUnifiedInterface
        voiceState={voiceState}
        frequencies={frequencies}
        onToggleMic={handleToggleMic}
        onInterrupt={handleInterrupt}
        onSubmitText={handleUserQuery}
        language={language}
        onLanguageChange={setLanguage}
        appContext={currentAppContext}
        onNavigate={navigateTo}
        messages={messages}
        onConfirmOrder={(orderData) => setActiveOrderModal(orderData)}
        onSelectPrompt={handleUserQuery}
        isExpanded={isKofiExpanded}
        onToggleExpand={() => setIsKofiExpanded(!isKofiExpanded)}
        errorMessage={errorMessage}
        onRepeatResponse={(text) => voiceEngineRef.current?.speak(text)}
        onDoneSpeaking={() => {
          const text = (finalTranscript + ' ' + partialTranscript).trim();
          voiceEngineRef.current?.finishTurn(text);
          if (text) {
            handleUserQuery(text);
          }
        }}
        partialTranscript={partialTranscript}
        finalTranscript={finalTranscript}
        onOpenMemoryBank={() => setIsMemoryBankOpen(true)}
        onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
        isPermanentVoiceEnabled={isPermanentVoiceEnabled}
      />

      {/* Permanent Memory Bank Modal */}
      <MemoryBankModal
        isOpen={isMemoryBankOpen}
        onClose={() => setIsMemoryBankOpen(false)}
        onAskKofi={(prompt) => {
          setIsMemoryBankOpen(false);
          handleUserQuery(prompt);
        }}
      />

      {/* Permanent Voice System Studio Modal */}
      <VoiceSettingsModal
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
        onPreviewVoice={(phrase) => {
          voiceEngineRef.current?.unlockAudio();
          voiceEngineRef.current?.speak(phrase);
        }}
        onPermanentModeChange={(enabled) => {
          setIsPermanentVoiceEnabled(enabled);
          voiceEngineRef.current?.setPermanentMode(enabled);
        }}
      />

      {/* Order Escrow Modal */}
      {activeOrderModal && (
        <OrderModal
          orderData={activeOrderModal}
          onClose={() => setActiveOrderModal(null)}
          onFinalizeOrder={handleFinalizeOrder}
        />
      )}

      {/* New Harvest Listing Modal */}
      {isFarmerModalOpen && (
        <FarmerListingModal
          onClose={() => setIsFarmerModalOpen(false)}
          onAddHarvest={handleAddHarvest}
        />
      )}
    </div>
  );
}
