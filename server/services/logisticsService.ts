/**
 * Logistics and Freight Estimation Service for Ghana Agricultural Transport
 */

export interface FreightEstimate {
  origin: string;
  destination: string;
  distanceKm: number;
  estimatedCostGHS: number;
  vehicle: 'Kia Rhino (3-5 Tonnes)' | 'Cargo Van (1-2 Tonnes)' | 'Heavy Diesel (10-15 Tonnes)' | 'Aboboyaa (Tricycle)';
  hours: number;
  roadCondition: 'Paved Highway' | 'Fair' | 'Challenging Feeder';
  fuelEstimatedLiters: number;
}

// Distance Matrix between key Ghanaian agricultural trading hubs (in kilometers)
export const GHANA_DISTANCES: Record<string, Record<string, number>> = {
  Techiman: {
    Kumasi: 125,
    Accra: 375,
    Tamale: 270,
    Sunyani: 60,
    Ejura: 95,
    Kintampo: 65,
    Takoradi: 360,
    Koforidua: 310,
    Bolgatanga: 430,
    CapeCoast: 310,
  },
  Kumasi: {
    Techiman: 125,
    Accra: 250,
    Tamale: 395,
    Sunyani: 128,
    Ejura: 98,
    Koforidua: 190,
    Takoradi: 240,
    CapeCoast: 195,
    Obuasi: 64,
    Sunyani_Bono: 130,
  },
  Ejura: {
    Kumasi: 98,
    Accra: 345,
    Techiman: 95,
    Tamale: 300,
    Mampong: 45,
    Atebubu: 60,
  },
  Tamale: {
    Kumasi: 395,
    Accra: 640,
    Techiman: 270,
    Bolgatanga: 160,
    Wa: 315,
    Yendi: 95,
    Buipe: 100,
  },
  Accra: {
    Kumasi: 250,
    Techiman: 375,
    Tamale: 640,
    Somanya: 68,
    CapeCoast: 145,
    Takoradi: 220,
    Ho: 160,
    Tema: 28,
    Koforidua: 85,
    Aflao: 190,
  },
  Somanya: {
    Accra: 68,
    Koforidua: 45,
    Kumasi: 275,
    Tema: 55,
    Ho: 110,
  },
  Sunyani: {
    Techiman: 60,
    Kumasi: 128,
    Accra: 380,
    DormaaAhenkro: 80,
  },
  Ho: {
    Accra: 160,
    Tema: 145,
    Koforidua: 140,
    Adidome: 85,
  },
};

export class LogisticsService {
  /**
   * Find matching town in distance matrix (handles spelling variations and casing)
   */
  private static normalizeTown(townName: string): string {
    const cleaned = townName.trim().toLowerCase();
    const allKeys = Object.keys(GHANA_DISTANCES);
    const exact = allKeys.find(k => k.toLowerCase() === cleaned);
    if (exact) return exact;

    // Fuzzy matching for Ghanaian pronunciations
    if (cleaned.includes('tech') || cleaned.includes('tekiman')) return 'Techiman';
    if (cleaned.includes('kumasi') || cleaned.includes('commasy') || cleaned.includes('k-si')) return 'Kumasi';
    if (cleaned.includes('accra') || cleaned.includes('nkran')) return 'Accra';
    if (cleaned.includes('tamale') || cleaned.includes('tamle')) return 'Tamale';
    if (cleaned.includes('ejura')) return 'Ejura';
    if (cleaned.includes('sunyani')) return 'Sunyani';
    if (cleaned.includes('somanya')) return 'Somanya';
    if (cleaned.includes('koforidua') || cleaned.includes('k-dua')) return 'Koforidua';
    if (cleaned.includes('takoradi') || cleaned.includes('taadi')) return 'Takoradi';
    if (cleaned.includes('ho')) return 'Ho';

    return 'Kumasi';
  }

  /**
   * Calculate freight rates for agricultural cargo across Ghana
   */
  public static calculateFreight(origin: string, destination: string, quantity = 50, crop = 'Produce'): FreightEstimate {
    const normOrigin = this.normalizeTown(origin);
    const normDest = this.normalizeTown(destination);

    let distance = GHANA_DISTANCES[normOrigin]?.[normDest];
    if (!distance) {
      distance = GHANA_DISTANCES[normDest]?.[normOrigin];
    }
    if (!distance) {
      distance = 180; // Estimated baseline inter-regional distance
    }

    // Vehicle selection based on load capacity
    let vehicle: FreightEstimate['vehicle'] = 'Kia Rhino (3-5 Tonnes)';
    let ratePerKm = 4.5;
    let baseDispatchFee = 150;

    if (quantity > 100) {
      vehicle = 'Heavy Diesel (10-15 Tonnes)';
      ratePerKm = 8.5;
      baseDispatchFee = 400;
    } else if (quantity <= 15) {
      vehicle = 'Aboboyaa (Tricycle)';
      ratePerKm = 2.8;
      baseDispatchFee = 60;
    } else if (quantity <= 35) {
      vehicle = 'Cargo Van (1-2 Tonnes)';
      ratePerKm = 3.6;
      baseDispatchFee = 100;
    }

    const estimatedCostGHS = Math.round(distance * ratePerKm + baseDispatchFee);
    const hours = Math.round((distance / 50) * 10) / 10;
    const fuelEstimatedLiters = Math.round(distance * 0.28);

    const roadCondition: FreightEstimate['roadCondition'] =
      (normOrigin === 'Techiman' && normDest === 'Kumasi') || (normOrigin === 'Kumasi' && normDest === 'Accra')
        ? 'Paved Highway'
        : 'Fair';

    return {
      origin: normOrigin,
      destination: normDest,
      distanceKm: distance,
      estimatedCostGHS,
      vehicle,
      hours,
      roadCondition,
      fuelEstimatedLiters,
    };
  }
}
