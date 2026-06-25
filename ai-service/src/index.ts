import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import scanRoutes from './routes/scan';
import quizRoutes from './routes/quiz';
import flashcardRoutes from './routes/flashcards';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'skeeme-ai-service' });
});

// Register routes
app.use('/api/scan', scanRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/flashcards', flashcardRoutes);

app.listen(PORT, () => {
  console.log(`Skeeme AI Service running on http://localhost:${PORT}`);
});
