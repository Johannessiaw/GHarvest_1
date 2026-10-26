/**
 * Local ASR Router
 * Provides pure local ASR speech decoding & lattice re-scoring endpoint
 * 100% Offline execution with ZERO external Cloud API dependency.
 * Powered by the 25,000+ Ghanaian training dataset.
 * @license Apache-2.0
 */

import { Router, Request, Response } from 'express';
import { LocalAsrEngine } from '../../src/services/localAsrEngine';
import { LocalAsrLanguageModel } from '../../src/services/localAsrCorpus';

export const localAsrRouter = Router();

const engine = LocalAsrEngine.getInstance();
const lm = LocalAsrLanguageModel.getInstance();

/**
 * POST /api/asr/decode-local
 * Pure local speech hypothesis decoding using 25,000+ Ghanaian training corpus
 */
localAsrRouter.post(['/asr/decode-local', '/asr/decode'], (req: Request, res: Response) => {
  const { hypothesis, pcmBase64 } = req.body;

  if (!hypothesis && !pcmBase64) {
    res.status(400).json({
      error: 'Either hypothesis string or pcmBase64 audio buffer is required for local ASR decoding.',
    });
    return;
  }

  try {
    if (hypothesis && typeof hypothesis === 'string') {
      const result = engine.decodeHypothesis(hypothesis);
      res.json({
        ...result,
        corpusTrainedSize: lm.getDatasetCount(),
      });
      return;
    }

    if (pcmBase64 && typeof pcmBase64 === 'string') {
      const buffer = Buffer.from(pcmBase64, 'base64');
      const floatArray = new Float32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 4);
      const result = engine.decodeAudioPcm(floatArray);
      res.json({
        ...result,
        corpusTrainedSize: lm.getDatasetCount(),
      });
      return;
    }
  } catch (err: any) {
    res.status(500).json({
      error: 'Local ASR decoding failed',
      details: err?.message || 'Internal local engine error',
    });
  }
});

/**
 * GET /api/asr/stats
 * Statistics and verification of the 20,000+ local training dataset
 */
localAsrRouter.get('/asr/stats', (_req: Request, res: Response) => {
  const stats = lm.getCorpusStats();
  const benchmark = engine.runLocalBenchmark();

  res.json({
    status: 'online-local',
    zeroApiGuaranteed: true,
    totalTrainedUtterances: stats.totalUtterances,
    totalTokens: stats.totalTokens,
    uniqueVocabulary: stats.uniqueVocab,
    sourcesBreakdown: stats.sources,
    benchmarkResults: {
      baselineWer: benchmark.baselineWer,
      localTrainedWer: benchmark.localTrainedWer,
      averageLatencyMs: benchmark.averageLatencyMs,
    },
    supportedDialects: [
      'en-GH (Ghanaian English)',
      'ak-GH (Asante/Akuapem/Fante Twi)',
      'ga-GH (Ga)',
      'ee-GH (Ewe)',
      'pcm-GH (Ghanaian Pidgin & Code-Switching)',
    ],
  });
});

/**
 * GET /api/asr/sample-data
 * Returns verified samples from the 25,000+ dataset for auditing
 */
localAsrRouter.get('/asr/sample-data', (req: Request, res: Response) => {
  const limit = Math.min(100, parseInt(String(req.query.limit || '30'), 10));
  const samples = lm.getDatasetSample(limit);
  res.json({
    total: lm.getDatasetCount(),
    returned: samples.length,
    samples,
  });
});
