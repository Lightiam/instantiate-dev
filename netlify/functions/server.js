import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import { registerRoutes } from '../../server/routes.js';

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Register all API routes
registerRoutes(app);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: 'production'
  });
});

export const handler = serverless(app);