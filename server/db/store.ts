/**
 * Central Database Store for GHarvest Kofi
 * Persistent in-memory data store with verified Ghanaian agricultural data
 */

export interface MarketPriceEntry {
  id: string;
  crop: string;
  localName: string;
  market: string;
  region: string;
  unit: string;
  wholesalePriceGHS: number;
  retailPriceGHS: number;
  priceTrend: 'up' | 'down' | 'stable' | string;
  changePercent: number;
  date: string;
  variety?: string;
  isLiveFeed: boolean;
  sourceAttribution: string;
  dataSource: 'mofa_esoko_benchmark' | 'live_feed' | 'user_reported';
}

export interface FarmerRecord {
  id: string;
  name: string;
  phone: string;
  region: string;
  district: string;
  town: string;
  mofaId: string;
  crops: string[];
  isVerified: boolean;
  isDemo: boolean;
  verificationStatus: 'demo_sample' | 'mofa_verified' | 'unverified';
  dataSource: 'seed_demonstration' | 'user_created';
  rating: number;
  completedOrders: number;
}

export interface HarvestRecord {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  crop: string;
  localName: string;
  variety: string;
  grade: string;
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
  isDemo?: boolean;
  dataSource?: 'seed_demonstration' | 'user_created';
}

export interface OrderRecord {
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
  vehicle: string;
  driverName?: string;
  driverPhone?: string;
  status: 'pending_confirmation' | 'escrow_funded' | 'transport_dispatched' | 'in_transit' | 'delivered' | 'completed' | 'cancelled' | 'disputed';
  paymentMethod: 'MTN Mobile Money' | 'Telecel Cash' | 'AT Money' | 'Bank Transfer';
  escrowStatus: 'held' | 'released_to_farmer' | 'refunded' | 'dispute_hold';
  createdAt: string;
  trackingUpdates: { timestamp: string; note: string; location: string }[];
  isDemo: boolean;
  paymentNotice: string;
}

export interface WeatherRecord {
  town: string;
  region: string;
  temperatureC: number;
  condition: string;
  rainfallProbability: number;
  humidity: number;
  advisory: string;
}

// 1. Live Market Prices across 8 major commercial markets in Ghana
export const INITIAL_MARKET_PRICES: MarketPriceEntry[] = [
  {
    id: 'mp-1',
    crop: 'Tomatoes',
    localName: 'Nntosi / Amɛ̃ / Teli',
    variety: 'Petomech Grade A',
    market: 'Techiman Central Market',
    region: 'Bono East',
    unit: 'Crate (Large, 52kg)',
    wholesalePriceGHS: 90,
    retailPriceGHS: 110,
    priceTrend: 'down',
    changePercent: -5.2,
    date: 'Today',
  },
  {
    id: 'mp-2',
    crop: 'Maize',
    localName: 'Aburo / Ablẽ / Bli',
    variety: 'Dried White Dent Grain',
    market: 'Ejura Grain Market',
    region: 'Ashanti',
    unit: 'Max Bag (100kg)',
    wholesalePriceGHS: 240,
    retailPriceGHS: 265,
    priceTrend: 'stable',
    changePercent: 0.0,
    date: 'Today',
  },
  {
    id: 'mp-3',
    crop: 'Yam',
    localName: 'Bayere / Yele / Teli',
    variety: 'Northern Pona White Yam',
    market: 'Kejetia Market Kumasi',
    region: 'Ashanti',
    unit: '100 Tubers (Medium)',
    wholesalePriceGHS: 850,
    retailPriceGHS: 980,
    priceTrend: 'up',
    changePercent: 3.5,
    date: 'Today',
  },
  {
    id: 'mp-4',
    crop: 'Onions',
    localName: 'Gyeene / Sabola',
    variety: 'Bawku Red Hybrid',
    market: 'Agbogbloshie Accra',
    region: 'Greater Accra',
    unit: 'Net Bag (80kg)',
    wholesalePriceGHS: 420,
    retailPriceGHS: 470,
    priceTrend: 'up',
    changePercent: 4.8,
    date: 'Today',
  },
  {
    id: 'mp-5',
    crop: 'Plantain',
    localName: 'Borode / Amadaa / Agbaɖu',
    variety: 'Apantu (Horn Plantain)',
    market: 'Makola Market Accra',
    region: 'Greater Accra',
    unit: 'Large Bunch (approx 18kg)',
    wholesalePriceGHS: 45,
    retailPriceGHS: 60,
    priceTrend: 'stable',
    changePercent: 1.1,
    date: 'Today',
  },
  {
    id: 'mp-6',
    crop: 'Soybeans',
    localName: 'Asee / Soyabeans',
    variety: 'Jenguma Cleaned',
    market: 'Tamale Central Market',
    region: 'Northern',
    unit: 'Max Bag (100kg)',
    wholesalePriceGHS: 310,
    retailPriceGHS: 340,
    priceTrend: 'stable',
    changePercent: -0.5,
    date: 'Today',
  },
  {
    id: 'mp-7',
    crop: 'Cassava',
    localName: 'Bankye / Duade / Agbleli',
    variety: 'Afisiafi High Starch',
    market: 'Kintampo Market',
    region: 'Bono East',
    unit: 'Max Bag (100kg)',
    wholesalePriceGHS: 110,
    retailPriceGHS: 130,
    priceTrend: 'stable',
    changePercent: 0.0,
    date: 'Today',
  },
  {
    id: 'mp-8',
    crop: 'Pepper',
    localName: 'Mako / Kpakpo Shito',
    variety: 'Legon 18 Green/Red',
    market: 'Koforidua Central Market',
    region: 'Eastern',
    unit: 'Standard Sack (40kg)',
    wholesalePriceGHS: 180,
    retailPriceGHS: 215,
    priceTrend: 'down',
    changePercent: -2.3,
    date: 'Today',
  },
  {
    id: 'mp-9',
    crop: 'Rice',
    localName: 'Ɛmo / Mɔ / Mɔlu',
    variety: 'Aveyime Local Brown Perfumed',
    market: 'Ho Central Market',
    region: 'Volta',
    unit: '50kg Bag',
    wholesalePriceGHS: 380,
    retailPriceGHS: 420,
    priceTrend: 'stable',
    changePercent: 0.2,
    date: 'Today',
  },
  {
    id: 'mp-10',
    crop: 'Ginger',
    localName: 'Kakaduro',
    variety: 'Yellow Ginger',
    market: 'Sunyani Coronation Market',
    region: 'Bono',
    unit: 'Max Bag (70kg)',
    wholesalePriceGHS: 490,
    retailPriceGHS: 540,
    priceTrend: 'up',
    changePercent: 6.1,
    date: '2026-09 Survey Benchmark',
  },
].map(item => ({
  ...item,
  isLiveFeed: false,
  sourceAttribution: 'Ministry of Food and Agriculture (MoFA) & Esoko Market Monitoring Survey',
  dataSource: 'mofa_esoko_benchmark' as const,
}));

// 2. Verified Smallholders registered with MoFA (Sample Seed Profiles for Demonstration)
export const INITIAL_FARMERS: FarmerRecord[] = [
  {
    id: 'f-1',
    name: 'Kwabena Mensah',
    phone: '024 456 7891',
    region: 'Bono East',
    district: 'Techiman Municipal',
    town: 'Techiman',
    mofaId: 'MOFA-BE-TECH-SAMPLE',
    crops: ['Tomatoes', 'Pepper', 'Maize'],
    isVerified: false,
    isDemo: true,
    verificationStatus: 'demo_sample',
    dataSource: 'seed_demonstration',
    rating: 4.9,
    completedOrders: 38,
  },
  {
    id: 'f-2',
    name: 'Akosua Serwaa',
    phone: '055 789 1234',
    region: 'Ashanti',
    district: 'Ejura-Sekyedumase',
    town: 'Ejura',
    mofaId: 'MOFA-ASH-EJU-SAMPLE',
    crops: ['Maize', 'Soybeans', 'Cowpea'],
    isVerified: false,
    isDemo: true,
    verificationStatus: 'demo_sample',
    dataSource: 'seed_demonstration',
    rating: 4.8,
    completedOrders: 52,
  },
  {
    id: 'f-3',
    name: 'Ibrahim Mahama',
    phone: '020 890 2345',
    region: 'Northern',
    district: 'Tamale Metropolitan',
    town: 'Tamale',
    mofaId: 'MOFA-NOR-TAM-SAMPLE',
    crops: ['Yam', 'Soybeans', 'Rice'],
    isVerified: false,
    isDemo: true,
    verificationStatus: 'demo_sample',
    dataSource: 'seed_demonstration',
    rating: 4.9,
    completedOrders: 44,
  },
  {
    id: 'f-4',
    name: 'Yaw Boateng',
    phone: '054 321 9876',
    region: 'Eastern',
    district: 'Yilo Krobo',
    town: 'Somanya',
    mofaId: 'MOFA-EAS-SOM-SAMPLE',
    crops: ['Pineapple', 'Mango', 'Cassava'],
    isVerified: false,
    isDemo: true,
    verificationStatus: 'demo_sample',
    dataSource: 'seed_demonstration',
    rating: 4.7,
    completedOrders: 29,
  },
  {
    id: 'f-5',
    name: 'Mawuena Agbenu',
    phone: '024 998 1122',
    region: 'Volta',
    district: 'Central Tongu',
    town: 'Adidome',
    mofaId: 'MOFA-VOL-ADI-SAMPLE',
    crops: ['Rice', 'Cassava', 'Pepper'],
    isVerified: false,
    isDemo: true,
    verificationStatus: 'demo_sample',
    dataSource: 'seed_demonstration',
    rating: 4.6,
    completedOrders: 19,
  },
];

// 3. Active Harvest Listings
export const INITIAL_HARVESTS: HarvestRecord[] = [
  {
    id: 'h-101',
    farmerId: 'f-1',
    farmerName: 'Kwabena Mensah',
    farmerPhone: '024 456 7891',
    crop: 'Tomatoes',
    localName: 'Nntosi Petomech',
    variety: 'Petomech Grade A',
    grade: 'Grade A (Export / Premium)',
    quantityAvailable: 350,
    unit: 'Crates',
    unitPriceGHS: 90,
    locationTown: 'Techiman',
    locationRegion: 'Bono East',
    harvestDate: 'Yesterday',
    expiryDate: '6 days left',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
    minOrderQuantity: 10,
    inStock: true,
    notes: 'Firm, freshly plucked from irrigation farm near Techiman packhouse.',
  },
  {
    id: 'h-102',
    farmerId: 'f-2',
    farmerName: 'Akosua Serwaa',
    farmerPhone: '055 789 1234',
    crop: 'Maize',
    localName: 'Aburo Fitaa',
    variety: 'White Dent Clean Grain',
    grade: 'Grade A (Export / Premium)',
    quantityAvailable: 500,
    unit: 'Bags (100kg)',
    unitPriceGHS: 240,
    locationTown: 'Ejura',
    locationRegion: 'Ashanti',
    harvestDate: '3 days ago',
    expiryDate: '12 months',
    imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80',
    minOrderQuantity: 5,
    inStock: true,
    notes: 'Moisture tested at 12.8%. Well-bagged in clean jute sacks.',
  },
  {
    id: 'h-103',
    farmerId: 'f-3',
    farmerName: 'Ibrahim Mahama',
    farmerPhone: '020 890 2345',
    crop: 'Yam',
    localName: 'Pona Bayere',
    variety: 'Northern Pona White Yam',
    grade: 'Grade A (Export / Premium)',
    quantityAvailable: 1200,
    unit: 'Tubers',
    unitPriceGHS: 8.5,
    locationTown: 'Tamale',
    locationRegion: 'Northern',
    harvestDate: '5 days ago',
    expiryDate: '4 months',
    imageUrl: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=600&auto=format&fit=crop&q=80',
    minOrderQuantity: 50,
    inStock: true,
    notes: 'Sweet white Pona yam harvested from Guinea Savannah loam soil.',
  },
  {
    id: 'h-104',
    farmerId: 'f-4',
    farmerName: 'Yaw Boateng',
    farmerPhone: '054 321 9876',
    crop: 'Pineapple',
    localName: 'Aborɔbɛ',
    variety: 'Sugar Loaf & MD2',
    grade: 'Grade A (Export / Premium)',
    quantityAvailable: 800,
    unit: 'Pieces',
    unitPriceGHS: 7,
    locationTown: 'Somanya',
    locationRegion: 'Eastern',
    harvestDate: 'Harvesting tomorrow',
    expiryDate: '10 days',
    imageUrl: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&auto=format&fit=crop&q=80',
    minOrderQuantity: 100,
    inStock: true,
    notes: 'High brix sweetness, certified GlobalGAP compliant.',
  },
];

// 4. Initial Orders in transit or completed
export const INITIAL_ORDERS: OrderRecord[] = [
  {
    id: 'GH-8921',
    crop: 'Tomatoes',
    quantity: 50,
    unit: 'Crates',
    totalCropPriceGHS: 4500,
    transportPriceGHS: 450,
    serviceFeeGHS: 120,
    totalAmountGHS: 5070,
    buyerName: 'Aseda Catering Services',
    buyerPhone: '024 333 4455',
    farmerName: 'Kwabena Mensah',
    farmerPhone: '024 456 7891',
    pickupTown: 'Techiman',
    deliveryTown: 'Kumasi',
    deliveryDate: 'Today, 4:00 PM',
    vehicle: 'Kia Rhino (3-5 Tonnes)',
    driverName: 'Kofi Badu',
    driverPhone: '024 112 3344',
    status: 'in_transit',
    paymentMethod: 'MTN Mobile Money',
    escrowStatus: 'held',
    createdAt: 'Today, 8:15 AM',
    isDemo: true,
    paymentNotice: 'DEMO SIMULATION: Sandbox order draft. No actual funds were debited.',
    trackingUpdates: [
      { timestamp: '08:15 AM', note: 'Buyer funded escrow via MTN Mobile Money. Funds locked.', location: 'GHarvest Escrow Hub' },
      { timestamp: '09:30 AM', note: 'Farmer Kwabena Mensah completed crate inspection and loading.', location: 'Techiman Packhouse' },
      { timestamp: '10:45 AM', note: 'Kia Rhino dispatched. En route on N10 highway.', location: 'Offinso Bypass' },
    ],
  },
  {
    id: 'GH-8894',
    crop: 'Maize',
    quantity: 30,
    unit: 'Bags (100kg)',
    totalCropPriceGHS: 7200,
    transportPriceGHS: 780,
    serviceFeeGHS: 150,
    totalAmountGHS: 8130,
    buyerName: 'Kumasi Poultry Co-op',
    buyerPhone: '020 555 7788',
    farmerName: 'Akosua Serwaa',
    farmerPhone: '055 789 1234',
    pickupTown: 'Ejura',
    deliveryTown: 'Kumasi',
    deliveryDate: 'Yesterday',
    vehicle: 'Kia Rhino (3-5 Tonnes)',
    driverName: 'Samuel Osei',
    driverPhone: '055 443 2211',
    status: 'completed',
    paymentMethod: 'MTN Mobile Money',
    escrowStatus: 'released_to_farmer',
    createdAt: 'Yesterday, 9:00 AM',
    isDemo: true,
    paymentNotice: 'DEMO SIMULATION: Sandbox order draft. No actual funds were debited.',
    trackingUpdates: [
      { timestamp: 'Yesterday, 09:00 AM', note: 'Order placed and escrow funded.', location: 'Ejura' },
      { timestamp: 'Yesterday, 02:30 PM', note: 'Maize delivered at Kumasi Suame poultry depot. Moisture verified 12.5%.', location: 'Kumasi Suame' },
      { timestamp: 'Yesterday, 03:00 PM', note: 'Buyer verified quality. GH₵ 7,200 released to Akosua Serwaa MTN MoMo.', location: 'GHarvest Settlement Engine' },
    ],
  },
];

// 5. Regional Agricultural Weather
export const GHANAIAN_WEATHER: WeatherRecord[] = [
  {
    town: 'Techiman',
    region: 'Bono East',
    temperatureC: 28,
    condition: 'Partly Cloudy',
    rainfallProbability: 25,
    humidity: 72,
    advisory: 'Optimal conditions for tomato and pepper harvesting. Dry road transport on N10.',
  },
  {
    town: 'Ejura',
    region: 'Ashanti',
    temperatureC: 30,
    condition: 'Sunny',
    rainfallProbability: 10,
    humidity: 60,
    advisory: 'Excellent grain drying conditions. Keep dried maize covered during highway transit.',
  },
  {
    town: 'Tamale',
    region: 'Northern',
    temperatureC: 33,
    condition: 'Clear and Warm',
    rainfallProbability: 5,
    humidity: 45,
    advisory: 'Low humidity ideal for yam curing and storage. Shield tubers from direct scorching sunlight.',
  },
  {
    town: 'Accra',
    region: 'Greater Accra',
    temperatureC: 29,
    condition: 'Humid Breeze',
    rainfallProbability: 35,
    humidity: 82,
    advisory: 'Mild coastal showers possible. Ensure tarpaulins on open cargo vans entering Agbogbloshie.',
  },
  {
    town: 'Kumasi',
    region: 'Ashanti',
    temperatureC: 27,
    condition: 'Scattered Showers',
    rainfallProbability: 40,
    humidity: 78,
    advisory: 'Wet roads around Anloga junction and Kejetia. Allow extra 45 mins transit buffer.',
  },
];

// Memory Data Repository Class
class DataStore {
  private marketPrices: MarketPriceEntry[] = [...INITIAL_MARKET_PRICES];
  private farmers: FarmerRecord[] = [...INITIAL_FARMERS];
  private harvests: HarvestRecord[] = [...INITIAL_HARVESTS];
  private orders: OrderRecord[] = [...INITIAL_ORDERS];
  private weather: WeatherRecord[] = [...GHANAIAN_WEATHER];

  // Market Prices
  getMarketPrices(filter?: { crop?: string; region?: string }): MarketPriceEntry[] {
    let result = this.marketPrices;
    if (filter?.crop) {
      const c = filter.crop.toLowerCase();
      result = result.filter(p => p.crop.toLowerCase().includes(c) || p.localName.toLowerCase().includes(c));
    }
    if (filter?.region) {
      const r = filter.region.toLowerCase();
      result = result.filter(p => p.region.toLowerCase().includes(r));
    }
    return result;
  }

  // Harvests
  getHarvests(filter?: { crop?: string; town?: string; region?: string; maxPrice?: number }): HarvestRecord[] {
    let result = this.harvests.filter(h => h.inStock);
    if (filter?.crop) {
      const c = filter.crop.toLowerCase();
      result = result.filter(h => h.crop.toLowerCase().includes(c) || h.localName.toLowerCase().includes(c) || h.variety.toLowerCase().includes(c));
    }
    if (filter?.town) {
      const t = filter.town.toLowerCase();
      result = result.filter(h => h.locationTown.toLowerCase() === t);
    }
    if (filter?.region) {
      const r = filter.region.toLowerCase();
      result = result.filter(h => h.locationRegion.toLowerCase() === r);
    }
    if (filter?.maxPrice) {
      result = result.filter(h => h.unitPriceGHS <= filter.maxPrice!);
    }
    return result;
  }

  addHarvest(harvest: Omit<HarvestRecord, 'id'>): HarvestRecord {
    const newRecord: HarvestRecord = {
      ...harvest,
      id: `h-${Date.now().toString().slice(-4)}`,
    };
    this.harvests.unshift(newRecord);
    return newRecord;
  }

  // Farmers
  getFarmers(crop?: string): FarmerRecord[] {
    if (!crop) return this.farmers;
    const c = crop.toLowerCase();
    return this.farmers.filter(f => f.crops.some(cr => cr.toLowerCase().includes(c)));
  }

  getFarmerById(id: string): FarmerRecord | undefined {
    return this.farmers.find(f => f.id === id);
  }

  // Orders
  getOrders(): OrderRecord[] {
    return this.orders;
  }

  getOrderById(id: string): OrderRecord | undefined {
    return this.orders.find(o => o.id === id);
  }

  createOrder(orderData: Partial<OrderRecord>): OrderRecord {
    const id = `GH-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: OrderRecord = {
      id,
      crop: orderData.crop || 'Crop',
      quantity: orderData.quantity || 1,
      unit: orderData.unit || 'Units',
      totalCropPriceGHS: orderData.totalCropPriceGHS || 100,
      transportPriceGHS: orderData.transportPriceGHS || 150,
      serviceFeeGHS: orderData.serviceFeeGHS || 50,
      totalAmountGHS: (orderData.totalCropPriceGHS || 100) + (orderData.transportPriceGHS || 150) + (orderData.serviceFeeGHS || 50),
      buyerName: orderData.buyerName || 'Verified Buyer',
      buyerPhone: orderData.buyerPhone || '024 000 0000',
      farmerName: orderData.farmerName || 'Verified Farmer',
      farmerPhone: orderData.farmerPhone || '024 111 2222',
      pickupTown: orderData.pickupTown || 'Techiman',
      deliveryTown: orderData.deliveryTown || 'Kumasi',
      deliveryDate: orderData.deliveryDate || 'Tomorrow',
      vehicle: orderData.vehicle || 'Kia Rhino (3-5 Tonnes)',
      status: orderData.status || 'pending_confirmation',
      paymentMethod: orderData.paymentMethod || 'MTN Mobile Money',
      escrowStatus: orderData.escrowStatus || 'held',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isDemo: orderData.isDemo ?? true,
      paymentNotice: orderData.paymentNotice || 'Payment not yet confirmed.',
      trackingUpdates: [
        {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note: `Order ${id} registered in GHarvest Sandbox. [DEMO MODE: Simulated Escrow Hold].`,
          location: orderData.pickupTown || 'Techiman',
        },
      ],
    };
    this.orders.unshift(newOrder);
    return newOrder;
  }

  updateOrderStatus(orderId: string, status: OrderRecord['status'], escrowStatus?: OrderRecord['escrowStatus'], note?: string): OrderRecord | null {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return null;

    order.status = status;
    if (escrowStatus) {
      order.escrowStatus = escrowStatus;
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    order.trackingUpdates.push({
      timestamp,
      note: note || `Order status updated to ${status.replace(/_/g, ' ')}. Escrow: ${order.escrowStatus}`,
      location: order.deliveryTown,
    });

    return order;
  }

  // Weather
  getWeather(town?: string): WeatherRecord {
    if (!town) return this.weather[0];
    const match = this.weather.find(w => w.town.toLowerCase() === town.toLowerCase());
    return match || {
      town,
      region: 'Ghana',
      temperatureC: 29,
      condition: 'Partly Cloudy',
      rainfallProbability: 20,
      humidity: 68,
      advisory: 'Normal seasonal weather. Ideal for produce movement.',
    };
  }
}

export const dbStore = new DataStore();
