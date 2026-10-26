/**
 * Logistics and Freight Estimation Router
 */

import { Router, Request, Response } from 'express';
import { LogisticsService, GHANA_DISTANCES } from '../services/logisticsService';

export const logisticsRouter = Router();

logisticsRouter.post(['/logistics/estimate', '/logistics/quote'], (req: Request, res: Response) => {
  const { origin, destination, quantity = 50, crop } = req.body;

  if (!origin || !destination) {
    res.status(400).json({ error: 'Origin and destination are required' });
    return;
  }

  const estimate = LogisticsService.calculateFreight(origin, destination, Number(quantity) || 50, crop);
  res.json(estimate);
});

logisticsRouter.get(['/logistics/estimate', '/logistics/quote'], (req: Request, res: Response) => {
  const { origin, destination, quantity = 50, crop } = req.query;

  if (!origin || !destination) {
    res.status(400).json({ error: 'Origin and destination query parameters are required' });
    return;
  }

  const estimate = LogisticsService.calculateFreight(
    String(origin),
    String(destination),
    Number(quantity) || 50,
    crop ? String(crop) : undefined
  );
  res.json(estimate);
});

logisticsRouter.get('/logistics/routes', (_req: Request, res: Response) => {
  res.json({
    supportedHubs: Object.keys(GHANA_DISTANCES),
    distanceMatrix: GHANA_DISTANCES,
  });
});
