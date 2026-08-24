/* StokCerdas — Standalone Public Landing Page & Auth Modal View */

import { store } from '../store.js';
import { openModal, closeModal } from '../components/modal.js';
import { showToast } from '../components/notifications.js';

export function renderLanding(onLoginSuccess) {
  const container = document.getElementById('content-container');
  if (!container) return;

  const state = store.getState();
  const currentUser = state.currentUser;

  container.innerHTML = `
    ${currentUser ? `
      <!-- Banner Logged In Status -->
      <div style="background: var(--primary-100); border: 1px solid var(--primary-500); padding: 12px 24px; border-radius: var(--radius-md); margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <i data-lucide="user-check" style="color: var(--primary-700);"></i>
          <span style="font-size: 0.9rem; color: var(--primary-900);">
            Anda sedang login sebagai <strong>${currentUser.name}</strong> (${currentUser.role.toUpperCase()}) di <strong>${currentUser.businessName || 'StokCerdas'}</strong>
          </span>
        </div>
        <button id="landing-back-to-dashboard-btn" class="btn btn-sm btn-primary">
          <i data-lucide="layout-dashboard"></i> Kembali ke Dashboard Utama
        </button>
      </div>
    ` : ''}

    <!-- Public Navbar Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 32px; background: var(--bg-surface); border-bottom: 1px solid var(--border-color); border-radius: var(--radius-lg); margin-bottom: 24px; box-shadow: var(--shadow-sm);">
      <div style="display: flex; align-items: center; gap: 10px;">
        <div class="brand-icon" style="width: 36px; height: 36px;"><i data-lucide="leaf"></i></div>
        <div class="brand-text" style="color: var(--slate-900);">Stok<span style="color: var(--primary-600);">Cerdas</span></div>
      </div>
      
      <div style="display: flex; gap: 12px; align-items: center;">
        ${currentUser ? `
          <button id="public-btn-goto-dashboard" class="btn btn-primary"><i data-lucide="layout-dashboard"></i> Masuk Dashboard</button>
        ` : `
          <button id="public-btn-login" class="btn btn-outline"><i data-lucide="log-in"></i> Masuk (Login)</button>
          <button id="public-btn-register" class="btn btn-primary"><i data-lucide="user-plus"></i> Daftar Akun Baru</button>
          <button id="public-btn-instant-demo" class="btn btn-teal"><i data-lucide="sparkles"></i> Try Demo Mode</button>
        `}
      </div>
    </div>

    <!-- Landing Hero Section -->
    <div class="landing-hero">
      <div class="landing-hero-badge">
        <i data-lucide="leaf"></i> Platform AI Inventory & Food Waste Management #1 untuk UMKM Pangan
      </div>
      
      <h1 class="landing-hero-title">
        Kelola Stok Lebih Cerdas, Cegah Overstock, & Selamatkan Surplus Makanan Usaha Anda
      </h1>
      
      <p class="landing-hero-subtitle">
        StokCerdas bukan sekadar software pencatat persediaan biasa. Kami membantu UMKM Kuliner & Retail Pangan memprediksi permintaan 7 hari ke depan, merekomendasikan pembelian otomatis (*Smart Reorder*), hingga menyalurkan makanan surplus sebelum terbuang.
      </p>

      <div class="landing-hero-cta">
        <button id="hero-btn-demo" class="btn btn-lg btn-teal">
          <i data-lucide="sparkles"></i> Masuk Demo Instan (Kedai Nusantara)
        </button>
        <button id="hero-btn-login" class="btn btn-lg btn-primary">
          <i data-lucide="layout-dashboard"></i> Buka Dashboard Utama
        </button>
      </div>
    </div>

    <!-- Product Principle & Workflow Banner -->
    <div class="card" style="background: linear-gradient(135deg, var(--teal-50), var(--primary-50)); border-color: var(--primary-200); margin-bottom: 40px; padding: 28px;">
      <div style="text-align: center; max-width: 850px; margin: 0 auto;">
        <span class="badge badge-emerald" style="margin-bottom: 10px;">PRINSIP UTAMA PRODUK</span>
        <h2 style="font-size: 1.4rem; color: var(--slate-900); font-weight: 800; margin-bottom: 12px;">
          "StokCerdas tidak sekadar memberi tahu apa yang Anda miliki. StokCerdas memberi tahu apa yang akan Anda butuhkan, apa yang harus dibeli, dan apa yang bisa Anda lakukan sebelum kelebihan barang menjadi food waste."
        </h2>
        <div style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; font-size: 0.85rem; font-weight: 700; color: var(--teal-700);">
          <span>Record</span> → <span>Understand</span> → <span>Predict</span> → <span>Recommend</span> → <span>Prevent Waste</span> → <span>Save Surplus</span> → <span>Measure Impact</span>
        </div>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="landing-stats-bar">
      <div>
        <div class="landing-stat-num">38.5 Ton</div>
        <div class="landing-stat-lbl">Food Waste Diselamatkan</div>
      </div>
      <div>
        <div class="landing-stat-num">Rp 1.45 M+</div>
        <div class="landing-stat-lbl">Nilai Modal Diselamatkan</div>
      </div>
      <div>
        <div class="landing-stat-num">96.2 kg</div>
        <div class="landing-stat-lbl">Estimasi CO₂e Avoided</div>
      </div>
      <div>
        <div class="landing-stat-num">98%</div>
        <div class="landing-stat-lbl">Akurasi Prediksi Reorder</div>
      </div>
    </div>

    <!-- Feature Grid -->
    <div style="margin-bottom: 40px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h2 style="font-size: 1.8rem; font-weight: 800;">Fitur Unggulan Terintegrasi</h2>
        <p style="color: var(--slate-500); font-size: 0.95rem;">Dirancang khusus untuk kebutuhan operasional sehari-hari UMKM Kuliner & Retail Pangan.</p>
      </div>

      <div class="landing-feature-grid">
        <div class="landing-feature-card">
          <div class="landing-feature-icon"><i data-lucide="trending-up"></i></div>
          <h3 style="font-size: 1.15rem; font-weight: 700;">1. AI Demand Forecasting</h3>
          <p style="font-size: 0.88rem; color: var(--slate-600); line-height: 1.5;">
            Prediksi kebutuhan stok 7 hari ke depan berbasis kecepatan penjualan, tren hari-dalam-minggu, dan lead time supplier.
          </p>
        </div>

        <div class="landing-feature-card">
          <div class="landing-feature-icon"><i data-lucide="sparkles"></i></div>
          <h3 style="font-size: 1.15rem; font-weight: 700;">2. Smart Reorder Engine</h3>
          <p style="font-size: 0.88rem; color: var(--slate-600); line-height: 1.5;">
            Menghitung otomatis titik pesan ulang (*Reorder Point*), safety stock, dan membuat Purchase Order otomatis dengan 1 klik.
          </p>
        </div>

        <div class="landing-feature-card">
          <div class="landing-feature-icon"><i data-lucide="clock"></i></div>
          <h3 style="font-size: 1.15rem; font-weight: 700;">3. Expiry & FEFO Tracking</h3>
          <p style="font-size: 0.88rem; color: var(--slate-600); line-height: 1.5;">
            Prinsip rotasi barang *First Expired First Out* (FEFO) dengan peringatan dini batch mendekati masa kadaluarsa.
          </p>
        </div>

        <div class="landing-feature-card">
          <div class="landing-feature-icon"><i data-lucide="heart-handshake"></i></div>
          <h3 style="font-size: 1.15rem; font-weight: 700;">4. Selamatkan Surplus Hub</h3>
          <p style="font-size: 0.88rem; color: var(--slate-600); line-height: 1.5;">
            4 Jalur penyelamatan makanan berpotensi sisa: Flash Sale diskon, Donasi Pangan, Penawaran antar UMKM, dan Kompos Organik.
          </p>
        </div>

        <div class="landing-feature-card">
          <div class="landing-feature-icon"><i data-lucide="leaf"></i></div>
          <h3 style="font-size: 1.15rem; font-weight: 700;">5. Circular Impact Dashboard</h3>
          <p style="font-size: 0.88rem; color: var(--slate-600); line-height: 1.5;">
            Ukur secara kuantitatif penghematan biaya operasional (Rp) dan pengimbangan estimasi emisi karbon (kg CO₂e avoided).
          </p>
        </div>

        <div class="landing-feature-card">
          <div class="landing-feature-icon"><i data-lucide="bot"></i></div>
          <h3 style="font-size: 1.15rem; font-weight: 700;">6. Conversational AI Assistant</h3>
          <p style="font-size: 0.88rem; color: var(--slate-600); line-height: 1.5;">
            Tanyakan segala hal tentang stok, penghematan, dan rekomendasi pembelian dalam Bahasa Indonesia secara alami.
          </p>
        </div>
      </div>
    </div>

    <!-- Final Call to Action -->
    <div style="background: var(--slate-900); color: #FFFFFF; border-radius: var(--radius-xl); padding: 48px 32px; text-align: center; margin-bottom: 40px;">
      <h2 style="font-size: 2rem; color: #FFFFFF; font-weight: 800; margin-bottom: 12px;">Siap Mengelola Stok Lebih Cerdas?</h2>
      <p style="font-size: 1rem; color: var(--slate-400); max-width: 600px; margin: 0 auto 24px;">
        Mulai gunakan StokCerdas tanpa perlu instalasi rumit. Masuk demo atau buat akun usaha Anda sekarang.
      </p>
      <button id="landing-btn-final-cta" class="btn btn-lg btn-teal">
        <i data-lucide="layout-dashboard"></i> Masuk ke Dashboard Utama
      </button>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Attach Action Button Handlers
  const handleGotoDashboard = () => {
    if (!store.getState().currentUser) {
      store.setDemoMode(true);
      store.loginUser('owner@kedainusantara.com', 'password123');
    }
    if (onLoginSuccess) onLoginSuccess();
  };

  document.getElementById('landing-back-to-dashboard-btn')?.addEventListener('click', handleGotoDashboard);
  document.getElementById('public-btn-goto-dashboard')?.addEventListener('click', handleGotoDashboard);

  document.getElementById('public-btn-instant-demo')?.addEventListener('click', handleGotoDashboard);
  document.getElementById('hero-btn-demo')?.addEventListener('click', handleGotoDashboard);

  const handleOpenLogin = () => {
    if (store.getState().currentUser) {
      handleGotoDashboard();
    } else {
      openLoginModal(onLoginSuccess);
    }
  };

  document.getElementById('public-btn-login')?.addEventListener('click', handleOpenLogin);
  document.getElementById('hero-btn-login')?.addEventListener('click', handleOpenLogin);
  document.getElementById('landing-btn-final-cta')?.addEventListener('click', handleOpenLogin);

  document.getElementById('public-btn-register')?.addEventListener('click', () => openRegisterModal(onLoginSuccess));
}

export function openLoginModal(onLoginSuccess) {
  const html = `
    <form id="form-login">
      <div class="form-group">
        <label class="form-label">Alamat Email *</label>
        <input type="email" id="login-email" class="form-control" value="owner@kedainusantara.com" placeholder="email@usaha.com" required>
      </div>
      <div class="form-group">
        <label class="form-label">Password *</label>
        <input type="password" id="login-password" class="form-control" value="password123" placeholder="••••••••" required>
      </div>
      
      <div style="background: var(--slate-50); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px 12px; margin-bottom: 16px; font-size: 0.82rem; color: var(--slate-600);">
        <strong>Akun Demo Bawaan:</strong><br>
        • Owner: <code>owner@kedainusantara.com</code> (Password: <code>password123</code>)<br>
        • Manager: <code>manager@kedainusantara.com</code> (Password: <code>password123</code>)<br>
        • Staff: <code>staff@kedainusantara.com</code> (Password: <code>password123</code>)
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px;">
        <button type="button" id="btn-switch-to-reg" class="btn btn-sm btn-ghost">Belum punya akun? Daftar</button>
        <div style="display: flex; gap: 8px;">
          <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Batal</button>
          <button type="submit" class="btn btn-primary">Masuk ke Dashboard</button>
        </div>
      </div>
    </form>
  `;

  openModal('Masuk Akun StokCerdas', html, (body) => {
    body.querySelector('#btn-cancel-modal')?.addEventListener('click', closeModal);
    body.querySelector('#btn-switch-to-reg')?.addEventListener('click', () => {
      closeModal();
      openRegisterModal(onLoginSuccess);
    });

    body.querySelector('#form-login')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = body.querySelector('#login-email').value;
      const pass = body.querySelector('#login-password').value;

      const res = await store.loginUser(email, pass);
      if (res.success) {
        closeModal();
        showToast(`Selamat datang kembali, ${res.user.name}!`, 'success');
        if (onLoginSuccess) onLoginSuccess();
      } else {
        showToast(res.message, 'error');
      }
    });
  });
}

export function openRegisterModal(onLoginSuccess) {
  const html = `
    <form id="form-register">
      <div class="form-group">
        <label class="form-label">Nama Lengkap Pemilik *</label>
        <input type="text" id="reg-name" class="form-control" placeholder="misal: Budi Santoso" required>
      </div>
      <div class="form-group">
        <label class="form-label">Nama Bisnis / Usaha UMKM *</label>
        <input type="text" id="reg-biz" class="form-control" placeholder="misal: Resto Berkah Rasa" required>
      </div>
      <div class="form-group">
        <label class="form-label">Kategori Usaha *</label>
        <select id="reg-biztype" class="form-control" required>
          <option value="UMKM Kuliner (Restoran, Cafe, Katering, Warung)">UMKM Kuliner (Restoran, Cafe, Katering, Warung)</option>
          <option value="UMKM Retail Food (Sembako, Minimarket, Frozen Food)">UMKM Retail Food (Sembako, Minimarket, Frozen Food)</option>
        </select>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Alamat Email *</label>
          <input type="email" id="reg-email" class="form-control" placeholder="budi@resto.com" required>
        </div>
        <div class="form-group">
          <label class="form-label">Password Baru *</label>
          <input type="password" id="reg-password" class="form-control" placeholder="••••••••" required>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px;">
        <button type="button" id="btn-switch-to-login" class="btn btn-sm btn-ghost">Sudah punya akun? Login</button>
        <div style="display: flex; gap: 8px;">
          <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Batal</button>
          <button type="submit" class="btn btn-primary">Daftar & Masuk</button>
        </div>
      </div>
    </form>
  `;

  openModal('Daftar Akun UMKM Baru', html, (body) => {
    body.querySelector('#btn-cancel-modal')?.addEventListener('click', closeModal);
    body.querySelector('#btn-switch-to-login')?.addEventListener('click', () => {
      closeModal();
      openLoginModal(onLoginSuccess);
    });

    body.querySelector('#form-register')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = body.querySelector('#reg-name').value;
      const biz = body.querySelector('#reg-biz').value;
      const bizType = body.querySelector('#reg-biztype').value;
      const email = body.querySelector('#reg-email').value;
      const pass = body.querySelector('#reg-password').value;

      const res = await store.registerUser({ name, email, password: pass, businessName: biz, businessType: bizType });
      if (res.success) {
        closeModal();
        showToast('Pendaftaran akun berhasil!', 'success');
        if (onLoginSuccess) onLoginSuccess();
      } else {
        showToast(res.message, 'error');
      }
    });
  });
}
