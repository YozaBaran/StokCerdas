-- ============================================================
-- DATABASE SCHEMA & RLS POLICIES: StokCerdas Platform (Supabase PostgreSQL)
-- Target: Supabase SQL Editor
-- Features: Supabase Auth Integration, Multi-Tenancy Data Isolation (RLS)
-- ============================================================

-- 1. BUSINESSES TABLE (Toko / UMKM per User)
CREATE TABLE IF NOT EXISTS businesses (
  id VARCHAR(50) NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(100) NOT NULL,
  owner VARCHAR(100) NOT NULL,
  location VARCHAR(100) DEFAULT 'Jakarta',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. SUPPLIERS TABLE (Pemasok per User)
CREATE TABLE IF NOT EXISTS suppliers (
  id VARCHAR(50) NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  contact VARCHAR(50) NOT NULL,
  email VARCHAR(100),
  lead_time_days INT NOT NULL DEFAULT 2,
  moq INT NOT NULL DEFAULT 1,
  payment_terms VARCHAR(100) DEFAULT 'COD',
  fulfillment_rate INT DEFAULT 95,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. PRODUCTS TABLE (Katalog Produk & Stok per User)
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(50) NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sku VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  purchase_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  selling_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  current_stock NUMERIC(10,2) NOT NULL DEFAULT 0,
  minimum_stock NUMERIC(10,2) NOT NULL DEFAULT 5,
  safety_stock NUMERIC(10,2) NOT NULL DEFAULT 3,
  lead_time_days INT NOT NULL DEFAULT 2,
  supplier_id VARCHAR(50) REFERENCES suppliers(id) ON DELETE SET NULL,
  expiry_tracking SMALLINT DEFAULT 1,
  shelf_life_days INT DEFAULT 14,
  active SMALLINT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. STOCK TRANSACTIONS TABLE (Audit Mutasi Stok per User)
CREATE TABLE IF NOT EXISTS stock_transactions (
  id VARCHAR(50) NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  product_id VARCHAR(50) NOT NULL,
  product_name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  quantity NUMERIC(10,2) NOT NULL,
  qty_before NUMERIC(10,2) NOT NULL,
  qty_after NUMERIC(10,2) NOT NULL,
  reason VARCHAR(255) NOT NULL,
  "user" VARCHAR(100) NOT NULL
);

-- 5. SALES TABLE (Pencatatan Penjualan Kasir per User)
CREATE TABLE IF NOT EXISTS sales (
  id VARCHAR(50) NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(50) DEFAULT 'Cash',
  items JSONB DEFAULT '[]'::jsonb,
  "user" VARCHAR(100) DEFAULT 'Kasir'
);

-- 6. WASTE RECORDS TABLE (Pelacakan Food Waste per User)
CREATE TABLE IF NOT EXISTS waste_records (
  id VARCHAR(50) NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  product_id VARCHAR(50),
  product_name VARCHAR(100) NOT NULL,
  quantity NUMERIC(10,2) NOT NULL,
  reason VARCHAR(255) NOT NULL,
  estimated_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  "user" VARCHAR(100) DEFAULT 'Staff'
);

-- 7. PURCHASE ORDERS TABLE (PO ke Supplier per User)
CREATE TABLE IF NOT EXISTS purchase_orders (
  id VARCHAR(50) NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  supplier_id VARCHAR(50) REFERENCES suppliers(id) ON DELETE SET NULL,
  supplier_name VARCHAR(100) NOT NULL,
  order_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  expected_date TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'DRAFT',
  total_amount NUMERIC(12,2) DEFAULT 0,
  items JSONB DEFAULT '[]'::jsonb
);

-- 8. EXPIRY BATCHES TABLE (Pelacakan Kadaluarsa Stok per User)
CREATE TABLE IF NOT EXISTS expiry_batches (
  id VARCHAR(50) NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
  batch_number VARCHAR(50) NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
  expiry_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Memastikan setiap user HANYA bisa membaca/mengubah datanya sendiri!
-- ============================================================

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE expiry_batches ENABLE ROW LEVEL SECURITY;

-- 1. Businesses Policies
CREATE POLICY "Users can manage their own business" ON businesses
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 2. Suppliers Policies
CREATE POLICY "Users can manage their own suppliers" ON suppliers
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. Products Policies
CREATE POLICY "Users can manage their own products" ON products
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. Stock Transactions Policies
CREATE POLICY "Users can manage their own stock transactions" ON stock_transactions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. Sales Policies
CREATE POLICY "Users can manage their own sales" ON sales
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. Waste Records Policies
CREATE POLICY "Users can manage their own waste records" ON waste_records
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. Purchase Orders Policies
CREATE POLICY "Users can manage their own purchase orders" ON purchase_orders
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 8. Expiry Batches Policies
CREATE POLICY "Users can manage their own expiry batches" ON expiry_batches
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


