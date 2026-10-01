/**
 * Kofi Conversational Chat Router
 * Handles multi-turn voice and text conversations with GHarvest intelligence
 */

import { Router, Request, Response } from 'express';
import { GeminiService } from '../services/geminiService';

export const chatRouter = Router();

chatRouter.post(['/chat', '/gemini/chat'], async (req: Request, res: Response) => {
  try {
    const { message, memory = {}, language = 'en-GH', history = [], appContext = {} } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message string is required' });
      return;
    }

    // Call conversational engine
    const result = await GeminiService.chat(history, message, language, memory, appContext);

    res.json(result);
  } catch (error: any) {
    // Graceful fallback on unexpected error
    const fallback = await GeminiService.localKofiEngine(
      req.body.message || '',
      req.body.memory || {},
      req.body.language || 'en-GH',
      req.body.history || [],
      req.body.appContext || {}
    );
    res.json(fallback);
  }
});
