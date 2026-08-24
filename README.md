# StokCerdas — AI-Powered Inventory & Food Waste Management untuk UMKM

**StokCerdas** adalah platform digital berbasis **JavaScript Full-Stack (Node.js, Express.js, & MySQL)** yang dirancang khusus untuk **UMKM Kuliner dan Retail Pangan** di Indonesia. Platform ini memonitor stok persediaan secara real-time, memberikan prediksi permintaan 7 hari ke depan, memberikan rekomendasi pembelian otomatis (*Smart Reorder*), melacak tanggal kadaluarsa (FEFO), menyelamatkan surplus makanan dari potensi terbuang, serta mengukur dampak ekonomi dan lingkungan.

---

## 🚀 Arsitektur Backend (Node.js & MySQL)

Backend StokCerdas telah disepakati dan dimigrasi total ke arsitektur **JavaScript Full-Stack**:
- **Backend Framework:** Node.js dengan Express.js
- **Database:** MySQL / MariaDB (dikelola via phpMyAdmin atau XAMPP)
- **Database Driver:** `mysql2` di Node.js (Connection pool & async/await)
- **API Format:** RESTful API berformat JSON

### 📂 Struktur Folder Proyek:
```
stok-cerdas/
├── backend/
│   ├── config/
│   │   └── db.js            # Koneksi database MySQL mysql2/promise
│   ├── routes/
│   │   ├── auth.js          # POST /api/register & POST /api/login
│   │   ├── products.js      # GET, POST, PUT, DELETE /api/products
│   │   ├── sales.js         # GET & POST /api/sales (auto-update stok)
│   │   ├── dashboard.js     # GET /api/dashboard/kpi
│   │   ├── expiry.js        # GET /api/expiry
│   │   ├── waste.js         # GET & POST /api/waste
│   │   ├── reorder.js       # GET /api/reorder (Smart Reorder AI)
│   │   └── state.js         # GET & POST /api/state (backup sync)
│   ├── package.json         # Dependensi backend (express, cors, mysql2)
│   └── server.js            # Entry point Express backend server & host frontend
├── frontend/
│   ├── index.html           # SPA HTML utama
│   ├── css/                 # Stylesheets
│   └── js/                  # Modules JavaScript SPA (store.js, app.js, dll)
├── package.json             # Root package.json (npm start / npm run dev)
├── schema.sql               # Database schema & seed data MySQL / phpMyAdmin
└── README.md                # Dokumentasi & Panduan Proyek
```

---

## 💻 Cara Menjalankan Aplikasi dengan Node.js

### 1. Import Database ke phpMyAdmin:
1. Buka XAMPP Control Panel dan jalankan **Apache** & **MySQL**.
2. Buka phpMyAdmin di browser: `http://localhost/phpmyadmin`.
3. Buat database baru bernama `stokcerdas_db`.
4. Pilih database `stokcerdas_db`, masuk ke tab **Import**, pilih file `schema.sql`, lalu klik **Import**.

### 2. Jalankan Backend Server Node.js:
1. Buka Terminal / PowerShell di folder proyek `stok cerdas`.
2. Install dependensi Node.js:
   ```bash
   npm install
   ```
3. Jalankan server Node.js:
   ```bash
   npm start
   ```
   *atau:*
   ```bash
   node backend/server.js
   ```
4. Buka browser di **`http://localhost:5000`**. Server Node.js Express akan otomatis menyajikan aplikasi frontend dan menghubungkan semua request API ke database MySQL (`stokcerdas_db`).

---

## 📡 Daftar RESTful API Endpoints

| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/register` | Pendaftaran akun baru (langsung ke tabel `users` MySQL) |
| `POST` | `/api/login` | Autentikasi user (langsung ke tabel `users` MySQL) |
| `GET` | `/api/products` | Mengambil seluruh katalog produk dari MySQL |
| `POST` | `/api/products` | Menambah produk baru ke database MySQL |
| `PUT` | `/api/products/:id` | Mengupdate data produk di MySQL |
| `DELETE` | `/api/products/:id` | Menghapus produk dari MySQL |
| `GET` | `/api/sales` | Mengambil riwayat transaksi penjualan |
| `POST` | `/api/sales` | Mencatat penjualan & **otomatis mengurangi stok produk** |
| `GET` | `/api/dashboard/kpi` | Mengambil statistik KPI bisnis real-time |
| `GET` | `/api/expiry` | Mengambil peringatan barang mendekati kadaluarsa |
| `GET` | `/api/waste` | Mengambil catatan food waste |
| `POST` | `/api/waste` | Mencatat food waste & **otomatis mengurangi stok** |
| `GET` | `/api/reorder` | Menghitung rekomendasi pembelian ulang otomatis (*Smart Reorder*) |
| `GET` | `/api/state` | Mengambil backup state JSON dari database MySQL |
| `POST` | `/api/state` | Menyimpan backup state JSON & mensinkronkan data pengguna |

---

## 🔑 Demo Access & Login Credentials

Aplikasi dilengkapi dengan **Demo Mode** dan **Database Login**:
- **Owner**: `owner@kedainusantara.com` / `password123`
- **Manager**: `manager@kedainusantara.com` / `password123`
- **Staff**: `staff@kedainusantara.com` / `password123`

---

## 📱 Ringkasan Modul & Fitur Utama

1. **Dashboard Performa**: Real-time KPI, visualisasi tren penjualan, dan insight AI.
2. **Manajemen Stok**: Stock In, Stock Out, Stock Opname, dan Audit Log mutasi *immutable*.
3. **Katalog Produk**: Master CRUD data produk dengan batas safety stock dan lead time.
4. **Penjualan & Kasir**: Pencatatan penjualan dengan pemotongan stok otomatis.
5. **Smart Reorder Engine**: Perhitungan otomatis titik pemesanan ulang (Safety Stock + Lead Time).
6. **Expiry FEFO & Waste Tracker**: Manajemen barang kadaluarsa dan pelacakan pemborosan pangan.
7. **Surplus Rescue Hub**: Diskon Flash Sale, Donasi, B2B, dan Olah Kompos.
8. **Circular Impact Dashboard**: Mengukur penghematan biaya dan emisi CO₂e yang berhasil dicegah.
