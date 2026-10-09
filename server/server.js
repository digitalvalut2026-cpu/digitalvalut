import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import productsRouter from './routes/products.js';
import paymentsRouter from './routes/payments.js';
import downloadsRouter from './routes/downloads.js';
import adminRouter from './routes/admin.js';
import { apiLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ==============================================================================
// 1. ADVANCED SECURITY MIDDLEWARES
// ==============================================================================

// Helmet: Protection against XSS, clickjacking, MIME sniffing, HSTS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Allows seamless CDN & Razorpay frame injections
}));

// CORS Configuration: Whitelist Cloudflare Pages and local origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5000'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    
    // Check if origin matches allowed list or any .pages.dev subdomain
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.endsWith('.pages.dev') ||
                      origin.includes('localhost') ||
                      origin.includes('127.0.0.1');

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: Access denied for this origin.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body Parsers with payload size limits to prevent Denial-of-Service attacks
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Apply general rate limiter to API routes
app.use('/api', apiLimiter);

// Optional: Serve frontend static files if running together on Railway
const frontendRoot = path.join(__dirname, '..');
app.use(express.static(frontendRoot));

// ==============================================================================
// 2. API ENDPOINTS
// ==============================================================================

app.use('/api/products', productsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/downloads', downloadsRouter);
app.use('/api/admin', adminRouter);

// Health Check Endpoint (Essential for Railway health probe & uptime monitoring)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Digital Vault Production Backend',
    version: '1.0.0'
  });
});

// SPA fallback for root navigation
app.get('/admin', (req, res) => {
  res.sendFile(path.join(frontendRoot, 'admin.html'));
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found or method not allowed.'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Exception:', err);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred. Please contact support.' 
      : err.message
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 Digital Vault Fullstack Engine Online`);
  console.log(`🔒 Security Layer: Active (Helmet, RateLimit, CORS, RLS)`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`==================================================\n`);
});
