import express, { Request, Response } from 'express';
import cors from 'cors';
import { compileApp, runEvaluation } from './pipeline/compiler.js';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/compile', async (req: Request, res: Response) => {
  const result = await compileApp(req.body.prompt ?? '');
  res.json(result);
});

app.get('/api/evaluation', async (_req: Request, res: Response) => {
  const metrics = await runEvaluation();
  res.json(metrics);
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  console.log(`AI App Compiler backend listening on port ${port}`);
});
