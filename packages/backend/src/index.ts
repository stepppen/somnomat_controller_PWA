import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/log', (req: Request, res: Response) => {
  const { action } = req.body;
  console.log('Received:', action);
  res.json({ action });
});

app.listen(PORT, () => {
  console.log(`Port: ${PORT}`);
});