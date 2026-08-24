/**
 * Full App State Backup & Hybrid Sync Routes
 * GET /api/state & POST /api/state
 * Syncs JSON state dump with MySQL table `app_state_backup` & auto-populates `users` table
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// GET /api/state
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT state_json FROM app_state_backup WHERE business_id = 'biz-001' ORDER BY id DESC LIMIT 1"
    );

    if (rows.length > 0 && rows[0].state_json) {
      res.json({
        status: 'success',
        source: 'mysql',
        data: JSON.parse(rows[0].state_json)
      });
    } else {
      res.json({
        status: 'empty',
        message: 'Belum ada backup state di database MySQL.'
      });
    }
  } catch (error) {
    console.error('Get state error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST /api/state
router.post('/', async (req, res) => {
  const stateData = req.body.data || req.body;
  if (!stateData) {
    return res.status(400).json({ status: 'error', message: 'Data state kosong.' });
  }

  try {
    const jsonStr = JSON.stringify(stateData);

    // Save backup JSON into app_state_backup
    await pool.query(
      "INSERT INTO app_state_backup (business_id, state_json) VALUES ('biz-001', ?)",
      [jsonStr]
    );

    // Also sync all users to table `users`
    if (stateData.users && Array.isArray(stateData.users)) {
      for (const u of stateData.users) {
        await pool.query(
          `INSERT INTO users (id, email, password, name, role, business_name)
           VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, business_name = EXCLUDED.business_name`,
          [
            u.id || `usr-${Date.now()}`,
            u.email,
            u.password,
            u.name,
            u.role || 'owner',
            u.businessName || 'Kedai Nusantara'
          ]
        );
      }
    }

    res.json({
      status: 'success',
      message: 'State & data pengguna berhasil tersimpan di database MySQL phpMyAdmin!'
    });
  } catch (error) {
    console.error('Save state error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
