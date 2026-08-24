/**
 * Smart Reorder Engine Routes
 * GET /api/reorder
 * Generates automated replenishment recommendations based on stock thresholds and lead times
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [products] = await pool.query(
      `SELECT p.id, p.name, p.category, p.unit, p.current_stock, p.minimum_stock, p.safety_stock, p.lead_time_days, p.purchase_price, s.name as supplier_name
       FROM products p
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       WHERE p.current_stock <= p.minimum_stock`
    );

    const reorderRecommendations = products.map(p => {
      const current = Number(p.current_stock);
      const minStock = Number(p.minimum_stock);
      const safety = Number(p.safety_stock);
      const leadTime = Number(p.lead_time_days) || 2;
      const targetStock = minStock + safety + 5;
      const recommendedQty = Math.max(5, Math.ceil(targetStock - current));

      return {
        productId: p.id,
        productName: p.name,
        category: p.category,
        unit: p.unit,
        currentStock: current,
        minimumStock: minStock,
        safetyStock: safety,
        leadTimeDays: leadTime,
        recommendedQty,
        estimatedCostRp: recommendedQty * Number(p.purchase_price),
        supplierName: p.supplier_name || 'Supplier Utama',
        urgency: current <= safety ? 'Kritis (Order Segera)' : 'Peringatan Reorder'
      };
    });

    res.json({
      status: 'success',
      count: reorderRecommendations.length,
      recommendations: reorderRecommendations
    });
  } catch (error) {
    console.error('Reorder engine error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
