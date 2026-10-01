/**
 * Agricultural Data Service
 * Connects verified smallholders, crop listings, and daily commercial market price feeds
 */

import { dbStore, MarketPriceEntry, HarvestRecord, FarmerRecord } from '../db/store';

export class AgriculturalService {
  /**
   * Look up current wholesale/retail market prices
   */
  public static getMarketPrices(crop?: string, region?: string): MarketPriceEntry[] {
    return dbStore.getMarketPrices({ crop, region });
  }

  /**
   * Search available harvests from verified smallholders
   */
  public static searchHarvests(crop?: string, town?: string, maxPrice?: number): HarvestRecord[] {
    return dbStore.getHarvests({ crop, town, maxPrice });
  }

  /**
   * Find verified farmers by crop
   */
  public static getFarmers(crop?: string): FarmerRecord[] {
    return dbStore.getFarmers(crop);
  }

  /**
   * Add a new harvest listing for a verified smallholder
   */
  public static addHarvestListing(data: Omit<HarvestRecord, 'id'>): HarvestRecord {
    return dbStore.addHarvest(data);
  }

  /**
   * Get agricultural weather advisory
   */
  public static getWeather(town?: string) {
    return dbStore.getWeather(town);
  }

  /**
   * Provide contextual explanation for screens
   */
  public static explainScreen(screen: string): string {
    switch (screen) {
      case 'marketplace':
        return 'You are on the Harvest Market page, where verified smallholder farmers list their produce. You can filter by crop category, search by town (like Techiman or Ejura), or tap "Order with Kofi" to calculate freight and lock funds in escrow.';
      case 'orders':
        return 'You are on the Orders & Escrow page. Here you can inspect active purchases, verify MoMo escrow deposit status, track transit steps, and confirm delivery once crops arrive.';
      case 'logistics':
        return 'You are on the Logistics & Transit page. Here you can calculate real freight haulage costs across Ghana road networks, check transit weather corridors, and connect with haulage trucks.';
      case 'farmer_services':
        return 'You are in Farmer Services, where verified smallholders can list new harvests, verify MoFA credentials, and broadcast stock to caterers and bulk buyers.';
      default:
        return "Welcome to GHarvest, Ghana's voice-first smallholder agricultural supply chain platform. You can find verified crops, calculate haulage transport, and execute secure Mobile Money escrow trades.";
    }
  }
}

