/**
 * Sales Recording & Auto Stock Update Routes
 * Handles GET /api/sales and POST /api/sales
 * Automatically updates product current_stock in MySQL and logs audit trail in stock_transactions
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// GET /api/sales
router.get('/', async (req, res) => {
  try {
    const [sales] = await pool.query('SELECT * FROM sales ORDER BY timestamp DESC LIMIT 100');
    res.json({ status: 'success', data: sales });
  } catch (error) {
    // Fallback if sales table isn't created yet, query stock_transactions where type = 'Stock Out'
    try {
      const [trxs] = await pool.query("SELECT * FROM stock_transactions WHERE type = 'Stock Out' ORDER BY timestamp DESC");
      res.json({ status: 'success', data: trxs });
    } catch (err) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
});

// POST /api/sales
router.post('/', async (req, res) => {
  const { id, items, totalAmount, paymentMethod, user } = req.body;
  const saleId = id || `sale-${Date.now()}`;
  const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Insert into sales table
    await connection.query(
      'INSERT INTO sales (id, timestamp, total_amount, payment_method, user) VALUES (?, ?, ?, ?, ?)',
      [saleId, timestamp, totalAmount || 0, paymentMethod || 'Cash', user || 'Kasir']
    );

    // 2. Process items, update products stock & record transactions audit
    if (items && Array.isArray(items)) {
      for (const item of items) {
        const productId = item.productId || item.product_id;
        const qtyToDeduct = Math.abs(item.qty || item.quantity || 1);

        // Fetch current stock
        const [prodRows] = await connection.query(
          'SELECT name, current_stock FROM products WHERE id = ? FOR UPDATE',
          [productId]
        );

        if (prodRows.length > 0) {
          const product = prodRows[0];
          const qtyBefore = Number(product.current_stock);
          const qtyAfter = Math.max(0, qtyBefore - qtyToDeduct);

          // Update stock in products table
          await connection.query(
            'UPDATE products SET current_stock = ? WHERE id = ?',
            [qtyAfter, productId]
          );

          // Record transaction audit trail
          const trxId = `trx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          await connection.query(
            `INSERT INTO stock_transactions 
              (id, timestamp, product_id, product_name, type, quantity, qty_before, qty_after, reason, user)
             VALUES (?, ?, ?, ?, 'Stock Out', ?, ?, ?, ?, ?)`,
            [
              trxId,
              timestamp,
              productId,
              product.name,
              qtyToDeduct,
              qtyBefore,
              qtyAfter,
              `Penjualan (Trx #${saleId})`,
              user || 'Kasir'
            ]
          );
        }
      }
    }

    await connection.commit();
    res.json({
      status: 'success',
      message: 'Transaksi penjualan berhasil dicatat & stok produk otomatis diperbarui di MySQL!',
      saleId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Sale recording error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
