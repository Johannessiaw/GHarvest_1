/**
 * Agricultural Market Prices and Harvests Router
 */

import { Router, Request, Response } from 'express';
import { AgriculturalService } from '../services/agriculturalService';

export const marketRouter = Router();

// Get market prices
marketRouter.get('/market-prices', (req: Request, res: Response) => {
  const { crop, region } = req.query;
  const prices = AgriculturalService.getMarketPrices(
    crop ? String(crop) : undefined,
    region ? String(region) : undefined
  );
  res.json(prices);
});

// Search harvests
marketRouter.get('/harvests', (req: Request, res: Response) => {
  const { crop, town, maxPrice } = req.query;
  const harvests = AgriculturalService.searchHarvests(
    crop ? String(crop) : undefined,
    town ? String(town) : undefined,
    maxPrice ? parseFloat(String(maxPrice)) : undefined
  );
  res.json(harvests);
});

// Create new harvest listing
marketRouter.post('/harvests', (req: Request, res: Response) => {
  try {
    const newHarvest = AgriculturalService.addHarvestListing(req.body);
    res.status(201).json(newHarvest);
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to add harvest listing', details: err.message });
  }
});

// Get verified farmers
marketRouter.get('/farmers', (req: Request, res: Response) => {
  const { crop } = req.query;
  const farmers = AgriculturalService.getFarmers(crop ? String(crop) : undefined);
  res.json(farmers);
});
