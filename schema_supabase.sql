-- ============================================================
-- DATABASE SCHEMA & SEED DATA: StokCerdas Platform (Supabase PostgreSQL)
-- Backend: Node.js Express + pg (node-postgres)
-- Paste & Run this script in your Supabase Dashboard -> SQL Editor
-- ============================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) NOT NULL PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'owner',
  business_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Seed Users
INSERT INTO users (id, email, password, name, role, business_name) VALUES
('usr-001', 'owner@kedainusantara.com', 'password123', 'Budi Santoso', 'owner', 'Kedai Nusantara'),
('usr-002', 'manager@kedainusantara.com', 'password123', 'Siti Rahma', 'manager', 'Kedai Nusantara'),
('usr-003', 'staff@kedainusantara.com', 'password123', 'Agus Pratama', 'staff', 'Kedai Nusantara')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. BUSINESSES TABLE
CREATE TABLE IF NOT EXISTS businesses (
  id VARCHAR(50) NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(100) NOT NULL,
  owner VARCHAR(100) NOT NULL,
  location VARCHAR(100) DEFAULT 'Jakarta'
);

INSERT INTO businesses (id, name, type, owner, location) VALUES
('biz-001', 'Kedai Nusantara', 'UMKM Kuliner (Restoran & Katering)', 'Budi Santoso', 'Jakarta Selatan')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 3. SUPPLIERS TABLE
CREATE TABLE IF NOT EXISTS suppliers (
  id VARCHAR(50) NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  contact VARCHAR(50) NOT NULL,
  email VARCHAR(100),
  lead_time_days INT NOT NULL DEFAULT 2,
  moq INT NOT NULL DEFAULT 1,
  payment_terms VARCHAR(100) DEFAULT 'COD',
  fulfillment_rate INT DEFAULT 95
);

INSERT INTO suppliers (id, name, contact, email, lead_time_days, moq, payment_terms, fulfillment_rate) VALUES
('sup-101', 'PT Agrimart Pangan Utama', '0812-3456-7890 (Pak Hery)', 'order@agrimart.co.id', 2, 10, 'Tempo 14 Hari', 98),
('sup-102', 'CV Berkah Sembako Nusantara', '0813-9876-5432 (Bu Dewi)', 'berkahsembako@gmail.com', 1, 5, 'Tunai Saat Diterima (COD)', 95),
('sup-103', 'Koperasi Tani Segar Jaya', '0857-1122-3344 (Pak Jarwo)', 'koperasitani@jawa.id', 1, 3, 'Tunai Saat Diterima (COD)', 92),
('sup-104', 'PT Dairy & Beverage Indonesia', '0811-4455-6677 (Sales Team)', 'sales@dairyindo.com', 3, 12, 'Tempo 30 Hari', 100),
('sup-105', 'Toko Roti & Bahan Katering Prima', '0821-7788-9900 (Pak Budi)', 'primakatering@yahoo.com', 1, 5, 'Tunai Saat Diterima (COD)', 96)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 4. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(50) NOT NULL PRIMARY KEY,
  sku VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  purchase_price NUMERIC(12,2) NOT NULL,
  selling_price NUMERIC(12,2) NOT NULL,
  current_stock NUMERIC(10,2) NOT NULL DEFAULT 0,
  minimum_stock NUMERIC(10,2) NOT NULL DEFAULT 5,
  safety_stock NUMERIC(10,2) NOT NULL DEFAULT 3,
  lead_time_days INT NOT NULL DEFAULT 2,
  supplier_id VARCHAR(50) REFERENCES suppliers(id) ON DELETE SET NULL,
  expiry_tracking SMALLINT DEFAULT 1,
  shelf_life_days INT DEFAULT 14,
  active SMALLINT DEFAULT 1
);

INSERT INTO products (id, sku, name, category, unit, purchase_price, selling_price, current_stock, minimum_stock, safety_stock, lead_time_days, supplier_id, expiry_tracking, shelf_life_days) VALUES
('prd-001', 'BU-AYM-1001', 'Ayam Fillet Dada', 'Bahan Utama', 'kg', 48000.00, 75000.00, 10.00, 12.00, 5.00, 2, 'sup-101', 1, 5),
('prd-002', 'SMB-BRS-1002', 'Beras Ramos Super', 'Sembako', 'kg', 13500.00, 17000.00, 25.00, 15.00, 8.00, 1, 'sup-102', 1, 90),
('prd-003', 'BU-DNG-1003', 'Daging Sapi Rendang', 'Bahan Utama', 'kg', 110000.00, 155000.00, 6.00, 8.00, 4.00, 2, 'sup-101', 1, 7),
('prd-004', 'SMB-MYK-1004', 'Minyak Goreng Sawit', 'Sembako', 'Liter', 15500.00, 19000.00, 30.00, 10.00, 5.00, 1, 'sup-102', 0, 180),
('prd-005', 'BU-TLR-1005', 'Telur Ayam Negeri', 'Bahan Utama', 'kg', 26000.00, 32000.00, 14.00, 10.00, 5.00, 1, 'sup-102', 1, 14),
('prd-006', 'DRY-SSU-1006', 'Susu UHT Plain 1L', 'Olahan & Dairy', 'Liter', 18000.00, 24000.00, 18.00, 10.00, 4.00, 3, 'sup-104', 1, 45),
('prd-007', 'DRY-RTI-1007', 'Roti Tawar Kupas', 'Olahan & Dairy', 'pack', 12000.00, 18000.00, 15.00, 8.00, 3.00, 1, 'sup-105', 1, 4),
('prd-008', 'SYR-CBI-1008', 'Cabai Merah Keriting', 'Sayur & Bumbu', 'kg', 42000.00, 58000.00, 3.00, 5.00, 2.00, 1, 'sup-103', 1, 5)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 5. STOCK TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS stock_transactions (
  id VARCHAR(50) NOT NULL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  product_id VARCHAR(50) NOT NULL,
  product_name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  quantity NUMERIC(10,2) NOT NULL,
  qty_before NUMERIC(10,2) NOT NULL,
  qty_after NUMERIC(10,2) NOT NULL,
  reason VARCHAR(255) NOT NULL,
  "user" VARCHAR(100) NOT NULL
);

-- 6. SALES TABLE
CREATE TABLE IF NOT EXISTS sales (
  id VARCHAR(50) NOT NULL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(50) DEFAULT 'Cash',
  "user" VARCHAR(100) DEFAULT 'Kasir'
);

-- 7. WASTE RECORDS TABLE
CREATE TABLE IF NOT EXISTS waste_records (
  id VARCHAR(50) NOT NULL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  product_id VARCHAR(50),
  product_name VARCHAR(100) NOT NULL,
  quantity NUMERIC(10,2) NOT NULL,
  reason VARCHAR(255) NOT NULL,
  estimated_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  "user" VARCHAR(100) DEFAULT 'Staff'
);

-- 8. APP STATE BACKUP DUMP TABLE
CREATE TABLE IF NOT EXISTS app_state_backup (
  id SERIAL PRIMARY KEY,
  business_id VARCHAR(50) NOT NULL DEFAULT 'biz-001',
  state_json TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
