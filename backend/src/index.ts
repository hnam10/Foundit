import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health';

const app = express();
const PORT = parseInt(process.env.PORT || '3001');

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/health', healthRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
