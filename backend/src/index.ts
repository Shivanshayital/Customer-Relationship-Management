import express, { Request, Response } from 'express';
import cors from 'cors';
import { compileApp, runEvaluation } from './pipeline/compiler.js';

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const port = Number(process.env.PORT) || 4000;
const nodeEnv = process.env.NODE_ENV ?? 'development';

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

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
    return res.status(500).json({ error: 'Compiler failed to generate a response.' });
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
    port,
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`AI App Compiler backend listening on port ${port} in ${nodeEnv}`);
});
