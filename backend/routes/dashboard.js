/**
 * Dashboard & KPI Analytics Routes
 * GET /api/dashboard/kpi
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

router.get('/kpi', async (req, res) => {
  try {
    const [products] = await pool.query('SELECT current_stock, minimum_stock, expiry_tracking, shelf_life_days FROM products');
    
    let totalProducts = products.length;
    let lowStockCount = 0;
    let criticalStockCount = 0;

    products.forEach(p => {
      const stock = Number(p.current_stock);
      const minStock = Number(p.minimum_stock);
      if (stock <= minStock) {
        lowStockCount++;
      }
      if (stock <= minStock * 0.5) {
        criticalStockCount++;
      }
    });

    let totalSalesRp = 0;
    try {
      const [salesSum] = await pool.query('SELECT SUM(total_amount) as total FROM sales');
      totalSalesRp = Number(salesSum[0]?.total || 0);
    } catch (e) {
      // ignore
    }

    let totalWasteKg = 0;
    let totalWasteRp = 0;
    try {
      const [wasteSum] = await pool.query('SELECT SUM(quantity) as kg, SUM(estimated_value) as val FROM waste_records');
      totalWasteKg = Number(wasteSum[0]?.kg || 0);
      totalWasteRp = Number(wasteSum[0]?.val || 0);
    } catch (e) {
      // ignore
    }

    res.json({
      status: 'success',
      kpi: {
        totalProducts,
        lowStockCount,
        criticalStockCount,
        totalSalesRp,
        totalWastePreventedKg: totalWasteKg,
        totalWasteSavedValueRp: totalWasteRp,
        healthScore: Math.max(50, 100 - (lowStockCount * 5))
      }
    });
  } catch (error) {
    console.error('Dashboard KPI error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
