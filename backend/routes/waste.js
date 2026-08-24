/**
 * Food Waste Logging & Management Routes
 * GET /api/waste & POST /api/waste
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// GET /api/waste
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM waste_records ORDER BY timestamp DESC LIMIT 100');
    res.json({ status: 'success', data: rows });
  } catch (error) {
    res.json({ status: 'success', data: [] });
  }
});

// POST /api/waste
router.post('/', async (req, res) => {
  const { productId, productName, quantity, reason, estimatedValue, user } = req.body;
  const wasteId = `wst-${Date.now()}`;
  const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Insert waste record
    await connection.query(
      `INSERT INTO waste_records 
        (id, timestamp, product_id, product_name, quantity, reason, estimated_value, user)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        wasteId,
        timestamp,
        productId || null,
        productName || 'Bahan Katering',
        quantity || 1,
        reason || 'Kadaluwarsa',
        estimatedValue || 0,
        user || 'Staff'
      ]
    );

    // Auto-deduct stock if productId is provided
    if (productId) {
      const [pRows] = await connection.query(
        'SELECT name, current_stock FROM products WHERE id = ? FOR UPDATE',
        [productId]
      );

      if (pRows.length > 0) {
        const prod = pRows[0];
        const qtyBefore = Number(prod.current_stock);
        const qtyToDeduct = Math.abs(Number(quantity) || 1);
        const qtyAfter = Math.max(0, qtyBefore - qtyToDeduct);

        await connection.query('UPDATE products SET current_stock = ? WHERE id = ?', [qtyAfter, productId]);

        // Audit transaction log
        const trxId = `trx-${Date.now()}`;
        await connection.query(
          `INSERT INTO stock_transactions 
            (id, timestamp, product_id, product_name, type, quantity, qty_before, qty_after, reason, user)
           VALUES (?, ?, ?, ?, 'Stock Out', ?, ?, ?, ?, ?)`,
          [
            trxId,
            timestamp,
            productId,
            prod.name,
            qtyToDeduct,
            qtyBefore,
            qtyAfter,
            `Food Waste (${reason})`,
            user || 'Staff'
          ]
        );
      }
    }

    await connection.commit();
    res.json({
      status: 'success',
      message: 'Catatan Food Waste berhasil disimpan & stok produk dikurangi di MySQL!',
      wasteId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Waste logging error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
