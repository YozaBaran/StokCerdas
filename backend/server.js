/**
 * StokCerdas — Node.js Express + MySQL REST API Backend Server
 * Architecture: JavaScript Full-Stack (Express.js, mysql2, CORS, Static SPA hosting)
 * Run: node backend/server.js or npm start
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { testConnection } = require('./config/db');

// Route Imports
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const salesRoutes = require('./routes/sales');
const dashboardRoutes = require('./routes/dashboard');
const expiryRoutes = require('./routes/expiry');
const wasteRoutes = require('./routes/waste');
const reorderRoutes = require('./routes/reorder');
const stateRoutes = require('./routes/state');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Configuration
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
const frontendPath = path.join(__dirname, '../');
app.use(express.static(frontendPath));

// API Endpoint Mounts
app.use('/api', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/expiry', expiryRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/reorder', reorderRoutes);
app.use('/api/state', stateRoutes);

// Additional explicit route mappings for direct prompt requirements
app.use('/api/register', authRoutes);
app.use('/api/login', authRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'StokCerdas Express.js MySQL REST API',
    architecture: 'Node.js Full-Stack',
    timestamp: new Date().toISOString()
  });
});

// SPA Fallback Route (Send index.html for any unhandled non-API route)
app.get('{*path}', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  } else {
    res.status(404).json({ status: 'error', message: 'API Endpoint not found' });
  }
});

// Server Initialization (Local Development & Export for Vercel)
if (require.main === module) {
  app.listen(PORT, async () => {
    console.log(`\n======================================================`);
    console.log(`🚀 StokCerdas Backend Server Running on http://localhost:${PORT}`);
    console.log(`🌐 Frontend Web App Hosted at: http://localhost:${PORT}`);
    console.log(`======================================================\n`);

    await testConnection();
  });
}

module.exports = app;

