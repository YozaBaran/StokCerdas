/**
 * Expiry Tracking Routes
 * GET /api/expiry
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [products] = await pool.query(
      'SELECT id, name, category, current_stock, shelf_life_days FROM products WHERE expiry_tracking = 1 AND current_stock > 0'
    );

    const expiryBatches = products.map((p, idx) => {
      const today = new Date();
      const shelfDays = p.shelf_life_days || 7;
      const daysLeft = Math.floor(Math.random() * (shelfDays + 2)) - 1; // Simulated risk calculation
      const expDate = new Date(today);
      expDate.setDate(today.getDate() + daysLeft);

      let riskLevel = 'Low Risk';
      if (daysLeft <= 1) riskLevel = 'High Risk';
      else if (daysLeft <= 3) riskLevel = 'Medium Risk';

      return {
        id: `exp-${p.id}`,
        productId: p.id,
        productName: p.name,
        category: p.category,
        qty: Number(p.current_stock),
        expiryDate: expDate.toISOString().split('T')[0],
        daysRemaining: daysLeft,
        riskLevel
      };
    });

    res.json({
      status: 'success',
      data: expiryBatches
    });
  } catch (error) {
    console.error('Expiry endpoint error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
