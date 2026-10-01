import { SmallholderFarmer, HarvestListing, LogisticsRoute, Order, CommodityPrice, AgriculturalWeather } from '../types';

export const INITIAL_FARMERS: SmallholderFarmer[] = [
  {
    id: 'farmer-1',
    name: 'Kwabena Mensah',
    phone: '024 456 7891',
    region: 'Bono East',
    district: 'Techiman Municipal',
    town: 'Techiman',
    isVerified: true,
    mofaId: 'MOFA-BE-TECH-2023-084',
    cropsGrown: ['Tomatoes', 'Pepper', 'Maize'],
    farmSizeAcres: 12.5,
    rating: 4.9,
    completedOrders: 142,
    joinedYear: 2021,
  },
  {
    id: 'farmer-2',
    name: 'Akosua Serwaa',
    phone: '055 789 1234',
    region: 'Ashanti',
    district: 'Ejura-Sekyedumase',
    town: 'Ejura',
    isVerified: true,
    mofaId: 'MOFA-ASH-EJU-2022-115',
    cropsGrown: ['Maize', 'Soybeans', 'Groundnuts'],
    farmSizeAcres: 24.0,
    rating: 4.8,
    completedOrders: 98,
    joinedYear: 2022,
  },
  {
    id: 'farmer-3',
    name: 'Ibrahim Mahama',
    phone: '020 890 2345',
    region: 'Northern',
    district: 'Tamale Metro',
    town: 'Tamale',
    isVerified: true,
    mofaId: 'MOFA-NOR-TAM-2021-042',
    cropsGrown: ['Yam', 'Soybeans', 'Rice'],
    farmSizeAcres: 35.0,
    rating: 5.0,
    completedOrders: 210,
    joinedYear: 2020,
  },
  {
    id: 'farmer-4',
    name: 'Yaw Boateng',
    phone: '054 321 9876',
    region: 'Eastern',
    district: 'Yilo Krobo',
    town: 'Somanya',
    isVerified: true,
    mofaId: 'MOFA-EAS-SOM-2023-019',
    cropsGrown: ['Pineapple', 'Mango', 'Cassava'],
    farmSizeAcres: 18.0,
    rating: 4.7,
    completedOrders: 76,
    joinedYear: 2023,
  },
  {
    id: 'farmer-5',
    name: 'Afua Adomah',
    phone: '027 654 3210',
    region: 'Bono East',
    district: 'Kintampo North',
    town: 'Kintampo',
    isVerified: true,
    mofaId: 'MOFA-BE-KIN-2022-093',
    cropsGrown: ['Cassava', 'Yam', 'Plantain'],
    farmSizeAcres: 15.0,
    rating: 4.9,
    completedOrders: 115,
    joinedYear: 2022,
  },
];

export const INITIAL_HARVESTS: HarvestListing[] = [
  {
    id: 'harvest-1',
    farmerId: 'farmer-1',
    farmerName: 'Kwabena Mensah',
    farmerPhone: '024 456 7891',
    crop: 'Tomatoes',
    localName: 'Nntosi',
    variety: 'Roma / Petomech Grade A',
    grade: 'Grade A (Export / Premium)',
    quantityAvailable: 350,
    unit: 'Crates',
    unitPriceGHS: 90,
    locationTown: 'Techiman',
    locationRegion: 'Bono East',
    harvestDate: '2026-09-21',
    expiryDate: '2026-10-05',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
    minOrderQuantity: 10,
    inStock: true,
    notes: 'Firm, freshly picked tomatoes sorted at Techiman co-op packhouse. Ready for immediate loading.',
  },
  {
    id: 'harvest-2',
    farmerId: 'farmer-2',
    farmerName: 'Akosua Serwaa',
    farmerPhone: '055 789 1234',
    crop: 'Maize',
    localName: 'Aburo',
    variety: 'White Dent Maize (Dried, 13% Moisture)',
    grade: 'Grade A (Export / Premium)',
    quantityAvailable: 500,
    unit: 'Bags (100kg)',
    unitPriceGHS: 240,
    locationTown: 'Ejura',
    locationRegion: 'Ashanti',
    harvestDate: '2026-09-18',
    expiryDate: '2027-03-30',
    imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80',
    minOrderQuantity: 5,
    inStock: true,
    notes: 'Clean, aflatoxin-tested white maize from Ejura grain belt. Ideal for poultry feed, millers or food processing.',
  },
  {
    id: 'harvest-3',
    farmerId: 'farmer-3',
    farmerName: 'Ibrahim Mahama',
    farmerPhone: '020 890 2345',
    crop: 'Yam',
    localName: 'Bayere',
    variety: 'Pona / Labreko New Yam',
    grade: 'Grade A (Export / Premium)',
    quantityAvailable: 120,
    unit: '100 Tubers',
    unitPriceGHS: 850,
    locationTown: 'Tamale',
    locationRegion: 'Northern',
    harvestDate: '2026-09-19',
    expiryDate: '2026-12-15',
    imageUrl: 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=600&auto=format&fit=crop&q=80',
    minOrderQuantity: 1,
    inStock: true,
    notes: 'Sweet Northern Pona yam tubers, well cured without bruises. High dry matter content.',
  },
  {
    id: 'harvest-4',
    farmerId: 'farmer-4',
    farmerName: 'Yaw Boateng',
    farmerPhone: '054 321 9876',
    crop: 'Pineapple',
    localName: 'Aborobe',
    variety: 'Sugarloaf (Sweet & Juicy)',
    grade: 'Grade A (Export / Premium)',
    quantityAvailable: 2500,
    unit: 'Pieces',
    unitPriceGHS: 8,
    locationTown: 'Somanya',
    locationRegion: 'Eastern',
    harvestDate: '2026-09-22',
    expiryDate: '2026-10-06',
    imageUrl: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&auto=format&fit=crop&q=80',
    minOrderQuantity: 50,
    inStock: true,
    notes: 'Naturally ripened Somanya Sugarloaf pineapples. Brix level 14+; direct from Yilo Krobo valley.',
  },
  {
    id: 'harvest-5',
    farmerId: 'farmer-5',
    farmerName: 'Afua Adomah',
    farmerPhone: '027 654 3210',
    crop: 'Cassava',
    localName: 'Bankye',
    variety: 'High Starch White Cassava (Ampong)',
    grade: 'Grade B (Local Market)',
    quantityAvailable: 400,
    unit: 'Bags (100kg)',
    unitPriceGHS: 110,
    locationTown: 'Kintampo',
    locationRegion: 'Bono East',
    harvestDate: '2026-09-23',
    expiryDate: '2026-09-28',
    imageUrl: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=600&auto=format&fit=crop&q=80',
    minOrderQuantity: 10,
    inStock: true,
    notes: 'Freshly uprooted cassava roots, ideal for gari processing, fufu or industrial starch factories.',
  },
  {
    id: 'harvest-6',
    farmerId: 'farmer-1',
    farmerName: 'Kwabena Mensah',
    farmerPhone: '024 456 7891',
    crop: 'Pepper',
    localName: 'Mako',
    variety: 'Kpakpo Shito (Green Aroma)',
    grade: 'Grade A (Export / Premium)',
    quantityAvailable: 80,
    unit: 'Baskets',
    unitPriceGHS: 140,
    locationTown: 'Techiman',
    locationRegion: 'Bono East',
    harvestDate: '2026-09-22',
    expiryDate: '2026-10-08',
    imageUrl: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80',
    minOrderQuantity: 2,
    inStock: true,
    notes: 'Highly aromatic Kpakpo Shito hot peppers. Ideal for restaurant sauces and catering.',
  },
];

export const INITIAL_LOGISTICS_ROUTES: LogisticsRoute[] = [
  {
    id: 'route-1',
    originTown: 'Techiman',
    originRegion: 'Bono East',
    destinationTown: 'Kumasi',
    destinationRegion: 'Ashanti',
    distanceKm: 125,
    estimatedHours: 2.5,
    recommendedVehicle: 'Kia Rhino (3-5 Tonnes)',
    basePriceGHS: 450,
    pricePerKmGHS: 4.5,
    roadCondition: 'Good',
  },
  {
    id: 'route-2',
    originTown: 'Techiman',
    originRegion: 'Bono East',
    destinationTown: 'Accra',
    destinationRegion: 'Greater Accra',
    distanceKm: 375,
    estimatedHours: 6.5,
    recommendedVehicle: 'Heavy Diesel (10-15 Tonnes)',
    basePriceGHS: 1800,
    pricePerKmGHS: 4.8,
    roadCondition: 'Good',
  },
  {
    id: 'route-3',
    originTown: 'Ejura',
    originRegion: 'Ashanti',
    destinationTown: 'Kumasi',
    destinationRegion: 'Ashanti',
    distanceKm: 98,
    estimatedHours: 2.0,
    recommendedVehicle: 'Kia Rhino (3-5 Tonnes)',
    basePriceGHS: 380,
    pricePerKmGHS: 4.2,
    roadCondition: 'Good',
  },
  {
    id: 'route-4',
    originTown: 'Ejura',
    originRegion: 'Ashanti',
    destinationTown: 'Accra',
    destinationRegion: 'Greater Accra',
    distanceKm: 345,
    estimatedHours: 6.0,
    recommendedVehicle: 'Kia Rhino (3-5 Tonnes)',
    basePriceGHS: 1650,
    pricePerKmGHS: 4.6,
    roadCondition: 'Fair',
  },
  {
    id: 'route-5',
    originTown: 'Tamale',
    originRegion: 'Northern',
    destinationTown: 'Kumasi',
    destinationRegion: 'Ashanti',
    distanceKm: 395,
    estimatedHours: 6.8,
    recommendedVehicle: 'Heavy Diesel (10-15 Tonnes)',
    basePriceGHS: 2100,
    pricePerKmGHS: 5.0,
    roadCondition: 'Good',
  },
  {
    id: 'route-6',
    originTown: 'Tamale',
    originRegion: 'Northern',
    destinationTown: 'Accra',
    destinationRegion: 'Greater Accra',
    distanceKm: 640,
    estimatedHours: 10.5,
    recommendedVehicle: 'Heavy Diesel (10-15 Tonnes)',
    basePriceGHS: 3400,
    pricePerKmGHS: 5.2,
    roadCondition: 'Good',
  },
  {
    id: 'route-7',
    originTown: 'Somanya',
    originRegion: 'Eastern',
    destinationTown: 'Accra',
    destinationRegion: 'Greater Accra',
    distanceKm: 68,
    estimatedHours: 1.5,
    recommendedVehicle: 'Cargo Van (1-2 Tonnes)',
    basePriceGHS: 280,
    pricePerKmGHS: 3.8,
    roadCondition: 'Good',
  },
  {
    id: 'route-8',
    originTown: 'Kintampo',
    originRegion: 'Bono East',
    destinationTown: 'Kumasi',
    destinationRegion: 'Ashanti',
    distanceKm: 185,
    estimatedHours: 3.2,
    recommendedVehicle: 'Kia Rhino (3-5 Tonnes)',
    basePriceGHS: 650,
    pricePerKmGHS: 4.4,
    roadCondition: 'Good',
  },
];

export const INITIAL_COMMODITY_PRICES: CommodityPrice[] = [
  { id: 'price-1', crop: 'Tomatoes', localName: 'Nntosi', market: 'Techiman Central Market', region: 'Bono East', unit: 'Crate (Large)', wholesalePriceGHS: 90, retailPriceGHS: 110, priceTrend: 'down', changePercent: -5.2, date: '2026-09-23' },
  { id: 'price-2', crop: 'Maize (White)', localName: 'Aburo Fitaa', market: 'Ejura Grain Market', region: 'Ashanti', unit: 'Max Bag (100kg)', wholesalePriceGHS: 240, retailPriceGHS: 265, priceTrend: 'stable', changePercent: 0.8, date: '2026-09-23' },
  { id: 'price-3', crop: 'Yam (Pona)', localName: 'Bayere Pona', market: 'Kejetia Market Kumasi', region: 'Ashanti', unit: '100 Tubers', wholesalePriceGHS: 850, retailPriceGHS: 980, priceTrend: 'up', changePercent: 4.5, date: '2026-09-23' },
  { id: 'price-4', crop: 'Onions (Bawku Red)', localName: 'Gyeene Kɔkɔɔ', market: 'Agbogbloshie Accra', region: 'Greater Accra', unit: 'Net Bag (80kg)', wholesalePriceGHS: 420, retailPriceGHS: 470, priceTrend: 'up', changePercent: 3.1, date: '2026-09-23' },
  { id: 'price-5', crop: 'Plantain (Apem)', localName: 'Borɔdeɛ Apem', market: 'Makola Market Accra', region: 'Greater Accra', unit: 'Large Bunch', wholesalePriceGHS: 45, retailPriceGHS: 60, priceTrend: 'stable', changePercent: -1.0, date: '2026-09-23' },
  { id: 'price-6', crop: 'Soybeans', localName: 'Aseɛ', market: 'Tamale Central Market', region: 'Northern', unit: 'Max Bag (100kg)', wholesalePriceGHS: 310, retailPriceGHS: 340, priceTrend: 'stable', changePercent: 0.0, date: '2026-09-23' },
];

export const INITIAL_WEATHER_ADVISORIES: AgriculturalWeather[] = [
  {
    region: 'Bono East',
    town: 'Techiman',
    temperatureC: 29,
    condition: 'Partly Cloudy with Evening Showers',
    rainfallProbability: 40,
    humidity: 78,
    advisory: 'Favorable harvesting conditions for tomatoes and peppers until 3:00 PM. Cover loaded trucks before evening showers.',
  },
  {
    region: 'Ashanti',
    town: 'Ejura',
    temperatureC: 31,
    condition: 'Sunny & Dry',
    rainfallProbability: 15,
    humidity: 65,
    advisory: 'Optimal weather for drying white maize on tarpaulins. Keep moisture content under 13% before bagging.',
  },
  {
    region: 'Northern',
    town: 'Tamale',
    temperatureC: 33,
    condition: 'Clear Skies',
    rainfallProbability: 10,
    humidity: 55,
    advisory: 'Excellent dry weather for Northern yam harvesting and curing in straw pits. Transport routes dry and open.',
  },
  {
    region: 'Eastern',
    town: 'Somanya',
    temperatureC: 28,
    condition: 'Light Morning Mist, Sunny Afternoon',
    rainfallProbability: 25,
    humidity: 80,
    advisory: 'Ideal Brix concentration for Sugarloaf pineapples. Pick early morning for maximum freshness.',
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'GH-1042',
    crop: 'Tomatoes',
    quantity: 50,
    unit: 'Crates',
    totalCropPriceGHS: 4500,
    transportPriceGHS: 600,
    serviceFeeGHS: 120,
    totalAmountGHS: 5220,
    buyerName: 'Kofi Mensah Catering',
    buyerPhone: '024 123 4567',
    farmerName: 'Kwabena Mensah',
    farmerPhone: '024 456 7891',
    pickupTown: 'Techiman',
    deliveryTown: 'Kumasi',
    deliveryDate: '2026-09-25',
    status: 'in_transit',
    paymentMethod: 'MTN Mobile Money',
    escrowStatus: 'held',
    createdAt: '2026-09-22 10:30 AM',
    trackingUpdates: [
      { timestamp: '2026-09-22 10:35 AM', note: 'Escrow funded via MTN MoMo GH₵ 5,220. Held safely.', location: 'Techiman Escrow Vault' },
      { timestamp: '2026-09-22 01:15 PM', note: 'Inspected and loaded into Kia Rhino AS-4819-21 at Techiman co-op.', location: 'Techiman Market' },
      { timestamp: '2026-09-22 03:45 PM', note: 'Dispatched on N10 highway. Estimated arrival 5:30 PM.', location: 'Offinso Bypass' },
    ],
  },
  {
    id: 'GH-1041',
    crop: 'Maize',
    quantity: 20,
    unit: 'Bags (100kg)',
    totalCropPriceGHS: 4800,
    transportPriceGHS: 400,
    serviceFeeGHS: 150,
    totalAmountGHS: 5350,
    buyerName: 'Kejetia Mills & Feeds',
    buyerPhone: '055 333 4455',
    farmerName: 'Akosua Serwaa',
    farmerPhone: '055 789 1234',
    pickupTown: 'Ejura',
    deliveryTown: 'Kumasi',
    deliveryDate: '2026-09-24',
    status: 'escrow_funded',
    paymentMethod: 'Telecel Cash',
    escrowStatus: 'held',
    createdAt: '2026-09-21 04:10 PM',
    trackingUpdates: [
      { timestamp: '2026-09-21 04:15 PM', note: 'Escrow funded GH₵ 5,350 via Telecel Cash.', location: 'GHarvest Escrow' },
      { timestamp: '2026-09-21 05:00 PM', note: 'Farmer Akosua Serwaa confirmed 20 bags ready for loading.', location: 'Ejura Depot' },
    ],
  },
];

// Helper functions for GHarvest state management
export class GHarvestDataManager {
  private static STORAGE_KEY_ORDERS = 'gharvest_orders_v1';
  private static STORAGE_KEY_HARVESTS = 'gharvest_harvests_v1';

  static getOrders(): Order[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_ORDERS);
      return stored ? JSON.parse(stored) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  }

  static saveOrders(orders: Order[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY_ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.warn('Failed to save orders to localStorage', e);
    }
  }

  static addOrder(order: Order): void {
    const orders = this.getOrders();
    orders.unshift(order);
    this.saveOrders(orders);
  }

  static updateOrderStatus(orderId: string, status: Order['status'], escrowStatus?: Order['escrowStatus'], updateNote?: string): Order | undefined {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      if (escrowStatus) order.escrowStatus = escrowStatus;
      if (updateNote) {
        order.trackingUpdates.push({
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note: updateNote,
          location: order.deliveryTown,
        });
      }
      this.saveOrders(orders);
      return order;
    }
    return undefined;
  }

  static getHarvests(): HarvestListing[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_HARVESTS);
      return stored ? JSON.parse(stored) : INITIAL_HARVESTS;
    } catch {
      return INITIAL_HARVESTS;
    }
  }

  static saveHarvests(harvests: HarvestListing[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY_HARVESTS, JSON.stringify(harvests));
    } catch (e) {
      console.warn('Failed to save harvests', e);
    }
  }

  static addHarvest(harvest: HarvestListing): void {
    const harvests = this.getHarvests();
    harvests.unshift(harvest);
    this.saveHarvests(harvests);
  }

  static calculateTransport(origin: string, destination: string, quantity: number, unit: string): {
    route: LogisticsRoute;
    estimatedCostGHS: number;
    vehicle: string;
    durationHours: number;
  } {
    // Look up route or compute approximation
    const found = INITIAL_LOGISTICS_ROUTES.find(
      r => (r.originTown.toLowerCase() === origin.toLowerCase() && r.destinationTown.toLowerCase() === destination.toLowerCase()) ||
           (r.originTown.toLowerCase() === destination.toLowerCase() && r.destinationTown.toLowerCase() === origin.toLowerCase())
    );

    if (found) {
      let multiplier = 1.0;
      if (quantity > 100) multiplier = 1.8;
      else if (quantity > 50) multiplier = 1.4;
      const cost = Math.round(found.basePriceGHS * multiplier);
      return {
        route: found,
        estimatedCostGHS: cost,
        vehicle: found.recommendedVehicle,
        durationHours: found.estimatedHours,
      };
    }

    // Default Ghanaian transport estimation
    const defaultKm = 180;
    const defaultHours = 3.5;
    const baseCost = 650;
    const defaultRoute: LogisticsRoute = {
      id: `route-custom-${Date.now()}`,
      originTown: origin,
      originRegion: 'Ghana Hub',
      destinationTown: destination,
      destinationRegion: 'Ghana Hub',
      distanceKm: defaultKm,
      estimatedHours: defaultHours,
      recommendedVehicle: 'Kia Rhino (3-5 Tonnes)',
      basePriceGHS: baseCost,
      pricePerKmGHS: 4.5,
      roadCondition: 'Fair',
    };

    return {
      route: defaultRoute,
      estimatedCostGHS: baseCost,
      vehicle: 'Kia Rhino (3-5 Tonnes)',
      durationHours: defaultHours,
    };
  }
}
