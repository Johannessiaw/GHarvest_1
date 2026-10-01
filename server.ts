/**
 * GHarvest Kofi Voice Assistant - Modular Server Entry Point
 * @license Apache-2.0
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Modular Route Handlers
import { chatRouter } from './server/routes/chatRouter';
import { voiceRouter } from './server/routes/voiceRouter';
import { marketRouter } from './server/routes/marketRouter';
import { ordersRouter } from './server/routes/ordersRouter';
import { logisticsRouter } from './server/routes/logisticsRouter';
import { toolsRouter } from './server/routes/toolsRouter';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Mount API Routers
app.use('/api', chatRouter);
app.use('/api', voiceRouter);
app.use('/api', marketRouter);
app.use('/api', ordersRouter);
app.use('/api', logisticsRouter);
app.use('/api', toolsRouter);

// GhanaNLP Lexicon & ASR Benchmark Dataset Stats
app.get('/api/data/dataset-stats', (_req: Request, res: Response) => {
  res.json({
    note: 'Illustrative demo figures — not derived from a live benchmark run.',
    totalEntries: 10450,
    categories: {
      towns: 58,
      crops: 24,
      units: 14,
      asrCorrections: 82,
      syntheticPhrases: 10272,
    },
    supportedLanguages: ['en-GH', 'ak-GH', 'ga-GH', 'ee-GH', 'pcm-GH'],
    speechAccuracyBenchmark: {
      werBaseline: '18.4%',
      werWithGhanaNLP: '3.8%',
      intentAccuracy: '98.2%',
      townEntityAccuracy: '99.4%',
      cropEntityAccuracy: '98.9%',
    },
  });
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'kofi-voice-assistant', timestamp: new Date().toISOString() });
});

import http from 'http';
import { attachLiveTranscriptionServer } from './server/voice/liveTranscriptionServer';

// Mount Vite or serve static production build
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const httpServer = http.createServer(app);
  attachLiveTranscriptionServer(httpServer);

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`GHarvest Kofi Voice Assistant Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
