import './logger';
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

// Friendly frontend for the root path
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Skeeme AI Service</title>
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background: linear-gradient(135deg, #1e1e2f 0%, #0d0d16 100%);
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          text-align: center;
        }
        .container {
          background: rgba(255, 255, 255, 0.05);
          padding: 3rem;
          border-radius: 24px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          max-width: 500px;
        }
        h1 {
          background: linear-gradient(90deg, #00C6FF 0%, #0072FF 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-top: 0;
          font-size: 2.5rem;
        }
        p {
          color: #a0a0b0;
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 2rem;
        }
        .status {
          display: inline-flex;
          align-items: center;
          background: rgba(0, 255, 128, 0.1);
          color: #00ff80;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.9rem;
          border: 1px solid rgba(0, 255, 128, 0.2);
        }
        .status::before {
          content: '';
          display: inline-block;
          width: 8px;
          height: 8px;
          background: #00ff80;
          border-radius: 50%;
          margin-right: 8px;
          box-shadow: 0 0 10px #00ff80;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(0, 255, 128, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(0, 255, 128, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 255, 128, 0); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Skeeme AI Processor</h1>
        <p>The AI brain behind Skeeme is up and running. This service is actively processing your study materials, flashcards, and quizzes.</p>
        <div class="status">Systems Online & Processing</div>
      </div>
    </body>
    </html>
  `);
});

// Register routes
app.use('/api/scan', scanRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/flashcards', flashcardRoutes);

app.listen(PORT, () => {
  console.log(`Skeeme AI Service running on http://localhost:${PORT}`);
});
