/**
 * Auth & User Management Routes
 * Directly targets MySQL table `users`
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// POST /api/register
router.post('/register', async (req, res) => {
  const { name, email, password, businessName, businessType } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ status: 'error', message: 'Nama, email, dan password wajib diisi.' });
  }

  try {
    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ status: 'error', message: 'Email sudah terdaftar di database MySQL.' });
    }

    const userId = `usr-${Date.now()}`;
    const bName = businessName || 'Kedai Nusantara';

    // Insert user into MySQL users table
    await pool.query(
      'INSERT INTO users (id, email, password, name, role, business_name) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, email.toLowerCase().trim(), password, name, 'owner', bName]
    );

    const userObj = {
      id: userId,
      email: email.toLowerCase().trim(),
      name,
      role: 'owner',
      businessName: bName,
      businessType: businessType || 'UMKM Kuliner'
    };

    res.json({
      status: 'success',
      message: 'Registrasi berhasil tersimpan di MySQL database phpMyAdmin!',
      user: userObj
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ status: 'error', message: 'Gagal melakukan registrasi: ' + error.message });
  }
});

// POST /api/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ status: 'error', message: 'Email dan password wajib diisi.' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, email, password, name, role, business_name FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ status: 'error', message: 'Email tidak ditemukan.' });
    }

    const user = rows[0];
    if (user.password !== password) {
      return res.status(401).json({ status: 'error', message: 'Password salah.' });
    }

    const userObj = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      businessName: user.business_name
    };

    res.json({
      status: 'success',
      message: 'Login berhasil!',
      user: userObj
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ status: 'error', message: 'Gagal login: ' + error.message });
  }
});

module.exports = router;
