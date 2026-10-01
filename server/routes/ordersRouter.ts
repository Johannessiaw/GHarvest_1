/**
 * GHarvest Orders & Escrow Router
 */

import { Router, Request, Response, NextFunction } from 'express';
import { EscrowService } from '../services/escrowService';

export const ordersRouter = Router();

// Minimal shared-secret guard for state-changing escrow actions (release/dispute/etc.).
// Set ADMIN_API_KEY in your environment and send it as the `x-api-key` header.
function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const configuredKey = process.env.ADMIN_API_KEY;
  if (!configuredKey) {
    console.warn('ADMIN_API_KEY is not set — /api/orders status updates are unauthenticated.');
    return next();
  }
  if (req.header('x-api-key') !== configuredKey) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

ordersRouter.get('/orders', (_req: Request, res: Response) => {
  const orders = EscrowService.getOrders();
  res.json(orders);
});

ordersRouter.post('/orders', async (req: Request, res: Response) => {
  try {
    const order = await EscrowService.createOrder(req.body);
    res.status(201).json(order);
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to create order', details: err.message });
  }
});

ordersRouter.patch('/orders/:id/status', requireApiKey, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, escrowStatus, note } = req.body;

  const updated = EscrowService.updateStatus(id, status, escrowStatus, note);
  if (!updated) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  res.json(updated);
});
