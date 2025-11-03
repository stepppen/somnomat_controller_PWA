import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv/lib/main.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/log', (req: Request, res: Response) => {
  const body = req.body;
  console.log('Received:', body);
  res.json({ body });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});