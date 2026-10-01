/**
 * Logistics and Freight Estimation Router
 */

import { Router, Request, Response } from 'express';
import { LogisticsService } from '../services/logisticsService';

export const logisticsRouter = Router();

logisticsRouter.post('/logistics/estimate', (req: Request, res: Response) => {
  const { origin, destination, quantity = 50, crop } = req.body;

  if (!origin || !destination) {
    res.status(400).json({ error: 'Origin and destination are required' });
    return;
  }

  const estimate = LogisticsService.calculateFreight(origin, destination, quantity, crop);
  res.json(estimate);
});
