import express, { Request, Response } from 'express';
import cors from 'cors';
import { compileApp, runEvaluation } from './pipeline/compiler.js';

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const PORT = Number(process.env.PORT) || 4000;
const nodeEnv = process.env.NODE_ENV ?? 'development';

process.on('uncaughtException', (error) => {
  console.error('[startup] Uncaught exception:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('[startup] Unhandled rejection:', reason);
});

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

app.post('/api/compile', async (req: Request, res: Response) => {
  const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';

  if (!prompt) {
    return res.status(400).json({ error: 'A prompt is required to compile an app.' });
  }

  try {
    const result = await compileApp(prompt);
    return res.json(result);
  } catch (error) {
    console.error('Compile request failed:', error);
    return res.status(500).json({
      error: 'Compiler failed to generate a response.',
      request_id: Date.now().toString(36),
    });
  }
});

app.get('/api/evaluation', async (_req: Request, res: Response) => {
  try {
    const metrics = await runEvaluation();
    return res.json(metrics);
  } catch (error) {
    console.error('Evaluation request failed:', error);
    return res.status(500).json({ error: 'Evaluation failed.' });
  }
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    environment: nodeEnv,
    port: PORT,
  });
});

app.use((error: Error, _req: Request, res: Response, _next: express.NextFunction) => {
  console.error('[request] Unhandled request error:', error);
  res.status(500).json({ error: 'Unexpected backend error.' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[startup] AI App Compiler backend listening on 0.0.0.0:${PORT} in ${nodeEnv}`);
  console.log(`[startup] Allowed CORS origins: ${allowedOrigins.join(', ') || 'none'}`);
});

server.on('error', (error) => {
  console.error('[startup] Server failed to bind:', error);
});

function shutdown(signal: NodeJS.Signals) {
  console.log(`[shutdown] Received ${signal}; closing HTTP server.`);
  server.close((error) => {
    if (error) {
      console.error('[shutdown] HTTP server closed with error:', error);
      process.exitCode = 1;
    }

    console.log('[shutdown] HTTP server closed.');
    process.exit();
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
