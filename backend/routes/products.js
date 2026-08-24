/**
 * Products Management Routes
 * Handles GET, POST, PUT, DELETE operations on `products` table
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY id DESC');
    res.json({ status: 'success', count: rows.length, data: rows });
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST /api/products
router.post('/', async (req, res) => {
  const p = req.body;
  const productId = p.id || `prd-${Date.now()}`;
  const sku = p.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    await pool.query(
      `INSERT INTO products 
        (id, sku, name, category, unit, purchase_price, selling_price, current_stock, minimum_stock, safety_stock, lead_time_days, supplier_id, expiry_tracking, shelf_life_days)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productId,
        sku,
        p.name || 'Produk Baru',
        p.category || 'Umum',
        p.unit || 'pcs',
        p.purchase_price || p.purchasePrice || 0,
        p.selling_price || p.sellingPrice || 0,
        p.current_stock || p.currentStock || 0,
        p.minimum_stock || p.minimumStock || 5,
        p.safety_stock || p.safetyStock || 3,
        p.lead_time_days || p.leadTimeDays || 2,
        p.supplier_id || p.supplierId || null,
        p.expiry_tracking !== undefined ? p.expiry_tracking : 1,
        p.shelf_life_days || p.shelfLifeDays || 14
      ]
    );

    res.json({
      status: 'success',
      message: 'Produk berhasil ditambahkan ke database MySQL!',
      data: { id: productId, sku, ...p }
    });
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// PUT /api/products/:id
router.put('/:id', async (req, res) => {
  const productId = req.params.id;
  const p = req.body;

  try {
    await pool.query(
      `UPDATE products SET
        name = COALESCE(?, name),
        category = COALESCE(?, category),
        unit = COALESCE(?, unit),
        purchase_price = COALESCE(?, purchase_price),
        selling_price = COALESCE(?, selling_price),
        current_stock = COALESCE(?, current_stock),
        minimum_stock = COALESCE(?, minimum_stock),
        safety_stock = COALESCE(?, safety_stock)
       WHERE id = ?`,
      [
        p.name,
        p.category,
        p.unit,
        p.purchase_price || p.purchasePrice,
        p.selling_price || p.sellingPrice,
        p.current_stock || p.currentStock,
        p.minimum_stock || p.minimumStock,
        p.safety_stock || p.safetyStock,
        productId
      ]
    );

    res.json({ status: 'success', message: 'Produk berhasil diperbarui!' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  const productId = req.params.id;

  try {
    await pool.query('DELETE FROM products WHERE id = ?', [productId]);
    res.json({ status: 'success', message: 'Produk berhasil dihapus!' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
