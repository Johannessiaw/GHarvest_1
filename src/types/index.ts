export type UserRole = 'buyer' | 'farmer' | 'logistics';
export type SupportedLanguage = 'en-GH' | 'ak-GH' | 'ga-GH' | 'ee-GH' | 'pcm-GH'; // Ghanaian English, Twi (Akan), Ga, Ewe, Ghanaian Pidgin

export interface SmallholderFarmer {
  id: string;
  name: string;
  phone: string;
  region: string;
  district: string;
  town: string;
  isVerified: boolean;
  mofaId: string; // Ministry of Food & Agriculture ID
  cropsGrown: string[];
  farmSizeAcres: number;
  rating: number;
  completedOrders: number;
  avatarUrl?: string;
  joinedYear: number;
}

export interface HarvestListing {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  crop: string;
  localName: string;
  variety: string;
  grade: 'Grade A (Export / Premium)' | 'Grade B (Local Market)';
  quantityAvailable: number;
  unit: string;
  unitPriceGHS: number;
  locationTown: string;
  locationRegion: string;
  harvestDate: string;
  expiryDate: string;
  imageUrl: string;
  minOrderQuantity: number;
  inStock: boolean;
  notes?: string;
}

export interface LogisticsRoute {
  id: string;
  originTown: string;
  originRegion: string;
  destinationTown: string;
  destinationRegion: string;
  distanceKm: number;
  estimatedHours: number;
  recommendedVehicle: 'Kia Rhino (3-5 Tonnes)' | 'Cargo Van (1-2 Tonnes)' | 'Heavy Diesel (10-15 Tonnes)' | 'Aboboyaa (Tricycle)';
  basePriceGHS: number;
  pricePerKmGHS: number;
  roadCondition: 'Good' | 'Fair' | 'Challenging (Feeder Road)';
}

export interface Order {
  id: string;
  crop: string;
  quantity: number;
  unit: string;
  totalCropPriceGHS: number;
  transportPriceGHS: number;
  serviceFeeGHS: number;
  totalAmountGHS: number;
  buyerName: string;
  buyerPhone: string;
  farmerName: string;
  farmerPhone: string;
  pickupTown: string;
  deliveryTown: string;
  deliveryDate: string;
  status: 'pending_confirmation' | 'escrow_funded' | 'transport_dispatched' | 'in_transit' | 'delivered' | 'completed' | 'cancelled';
  paymentMethod: 'MTN Mobile Money' | 'Telecel Cash' | 'AT Money' | 'Bank Transfer';
  escrowStatus: 'held' | 'released_to_farmer' | 'refunded';
  createdAt: string;
  trackingUpdates: { timestamp: string; note: string; location: string }[];
}

export interface CommodityPrice {
  id: string;
  crop: string;
  localName: string;
  market: string;
  region: string;
  unit: string;
  wholesalePriceGHS: number;
  retailPriceGHS: number;
  priceTrend: 'up' | 'down' | 'stable';
  changePercent: number;
  date: string;
}

export interface AgriculturalWeather {
  region: string;
  town: string;
  temperatureC: number;
  condition: string;
  rainfallProbability: number;
  humidity: number;
  advisory: string;
}

export interface VoiceMessage {
  id: string;
  sender: 'user' | 'kofi' | 'system';
  rawText?: string;
  normalizedText: string;
  twiTranslation?: string;
  timestamp: string;
  audioPlaying?: boolean;
  intent?: string;
  actionCard?: {
    type: 'order_summary' | 'logistics_estimate' | 'farmer_card' | 'price_check' | 'weather_alert' | 'confirmation_needed' | 'harvest_list' | 'web_summary';
    data: any;
  };
  toolsUsed?: string[];
  isThinking?: boolean;
  reasoning?: string;
  isIncompleteSentence?: boolean;
  completedThought?: string;
  detectedTone?: 'nervous' | 'anxious' | 'overwhelmed' | 'sad' | 'happy' | 'urgent' | 'calm';
  toneConfidence?: number;
  emotionalContext?: string;
  shouldTakeDeepBreath?: boolean;
  vocalStyle?: string;
  audioBase64?: string;
  // Permanent Memory & High-Retention Fields
  recalledMemory?: string;
  newMemoriesExtracted?: string[];
}

export interface ConversationMemory {
  product?: string;
  quantity?: number;
  unit?: string;
  quality?: string;
  location?: string;
  pickupLocation?: string;
  deliveryLocation?: string;
  deliveryDate?: string;
  buyerName?: string;
  buyerPhone?: string;
  farmerName?: string;
  estimatedTotalGHS?: number;
  transportType?: string;
  paymentStatus?: 'unpaid' | 'pending' | 'escrow_funded';
  orderPendingConfirmation?: Partial<Order>;
}

export interface LexiconEntry {
  id: string;
  term: string;
  category: 'town' | 'crop' | 'unit' | 'slang' | 'twi_phrase' | 'asr_correction' | 'phonetic';
  englishMeaning: string;
  twiEquivalent?: string;
  phoneticSpelling: string; // e.g. "Teh-chee-man"
  commonMistakes: string[]; // e.g. ["tech man", "take man"]
  regionOrContext?: string;
}

export type AppRoute = 'home' | 'marketplace' | 'orders' | 'logistics' | 'farmer_services' | 'nlp_studio';

export interface NavigationPayload {
  screen: AppRoute | 'back';
  searchQuery?: string;
  filterLocation?: string;
  orderId?: string;
  openModal?: 'order_draft' | 'farmer_listing' | null;
  reason?: string;
}

export interface AppContextState {
  currentRoute: AppRoute;
  currentPageTitle: string;
  selectedItem?: any;
  selectedOrder?: Order | null;
  selectedFarmer?: any;
  selectedListing?: HarvestListing | null;
  activeDraftOrder?: any;
  userRole: UserRole;
  language: SupportedLanguage;
  availableActions: string[];
  lastSearchQuery?: string;
  lastLocationFilter?: string;
}

export * from './actions';

