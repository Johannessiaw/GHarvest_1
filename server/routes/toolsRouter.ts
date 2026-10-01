/**
 * External Tools Router: URL Inspection, Search Grounding, Weather, High-Thinking
 */

import { Router, Request, Response } from 'express';
import { UrlInspectorService } from '../services/urlInspectorService';
import { AgriculturalService } from '../services/agriculturalService';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

export const toolsRouter = Router();

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// URL Inspection endpoint
toolsRouter.post('/tools/inspect-url', async (req: Request, res: Response) => {
  const { url } = req.body;
  if (!url) {
    res.status(400).json({ error: 'URL is required' });
    return;
  }

  const result = await UrlInspectorService.inspectUrl(url);
  res.json(result);
});

// Search Grounding with Google Search
toolsRouter.post(['/tools/search', '/gemini/search'], async (req: Request, res: Response) => {
  const { query } = req.body;
  if (!query) {
    res.status(400).json({ error: 'Query is required' });
    return;
  }

  if (!ai) {
    res.status(503).json({
      summary: 'Live web search is unavailable because the AI service client is not initialized.',
      isLive: false,
      sources: [],
    });
    return;
  }

  const models = ['gemini-3.6-flash', 'gemini-3.8-flash'];
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: `Search the web for up-to-date Ghanaian agricultural and market intelligence on: ${query}`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      if (response && response.text) {
        res.json({
          summary: response.text,
          groundingMetadata: response.candidates?.[0]?.groundingMetadata,
          isLive: true,
          model,
        });
        return;
      }
    } catch (err: any) {
      console.warn(`Search attempt with ${model} failed:`, err.message);
      continue;
    }
  }

  // Truthful response if search grounding is unavailable
  res.status(503).json({
    summary: `Live Google Search grounding is currently unavailable for query: "${query}". Please check your internet connection or consult official market monitoring desks directly.`,
    isLive: false,
    sources: [],
  });
});

// High-Thinking for Supply-Chain Optimization
toolsRouter.post(['/tools/think', '/gemini/think'], async (req: Request, res: Response) => {
  const { scenario } = req.body;
  if (!scenario) {
    res.status(400).json({ error: 'Scenario is required' });
    return;
  }

  if (!ai) {
    res.status(503).json({
      error: 'AI service client not initialized.',
    });
    return;
  }

  const prompt = `Perform multi-step logistics reasoning, risk assessment, and financial aggregation optimization for this Ghanaian agricultural scenario: ${scenario}. Provide concrete sourcing, routing, and mobile escrow steps.`;

  const models = ['gemini-3.6-flash', 'gemini-3.8-flash'];
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH,
          },
        },
      });

      if (response && response.text) {
        res.json({
          strategy: response.text,
          thinkingLevel: 'HIGH',
          model,
        });
        return;
      }
    } catch {
      continue;
    }
  }

  res.status(503).json({
    error: 'High-thinking reasoning service is temporarily unavailable.',
  });
});

// Weather advisory endpoint
toolsRouter.get('/tools/weather', (req: Request, res: Response) => {
  const { town } = req.query;
  const weather = AgriculturalService.getWeather(town ? String(town) : undefined);
  res.json(weather);
});
