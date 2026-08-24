/* StokCerdas — Interactive 8-Step Onboarding Setup Wizard */

import { store } from '../store.js';
import { showToast } from '../components/notifications.js';

export function renderOnboarding(onNavigate, onCompleteOnboarding) {
  const container = document.getElementById('content-container');
  if (!container) return;

  let currentStep = 1;
  const formData = {
    businessName: 'Warung Berkah Nusantara',
    businessType: 'UMKM Kuliner (Restoran & Cafe)',
    productCount: 15,
    useDemoSeed: true
  };

  const renderWizardStep = () => {
    container.innerHTML = `
      <div class="onboarding-card">
        <div style="text-align: center; margin-bottom: 24px;">
          <div class="brand-icon" style="margin: 0 auto 12px; width: 44px; height: 44px; font-size: 1.3rem;">
            <i data-lucide="leaf"></i>
          </div>
          <h2 style="font-size: 1.5rem; font-weight: 800;">Panduan Setup StokCerdas</h2>
          <p style="color: var(--slate-500); font-size: 0.88rem; margin-top: 4px;">
            Langkah ${currentStep} dari 8 — Menyiapkan Platform AI Inventory & Waste Management
          </p>
        </div>

        <!-- Step Dots Bar -->
        <div class="wizard-steps">
          ${[1, 2, 3, 4, 5, 6, 7, 8].map(stepNum => `
            <div class="wizard-step-dot ${stepNum === currentStep ? 'active' : (stepNum < currentStep ? 'completed' : '')}">
              ${stepNum < currentStep ? '<i data-lucide="check" style="width: 16px; height: 16px;"></i>' : stepNum}
            </div>
          `).join('')}
        </div>

        <!-- Step Content View -->
        <div style="min-height: 220px;">
          ${getStepHTML(currentStep, formData)}
        </div>

        <!-- Navigation Buttons Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 20px; margin-top: 24px;">
          <button id="wizard-prev-btn" class="btn btn-secondary" ${currentStep === 1 ? 'disabled' : ''}>
            <i data-lucide="arrow-left"></i> Kembali
          </button>
          
          <button id="wizard-next-btn" class="btn btn-primary">
            ${currentStep === 8 ? 'Selesai & Buka Dashboard <i data-lucide="check-circle"></i>' : 'Lanjut <i data-lucide="arrow-right"></i>'}
          </button>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Event Listeners for Wizard Navigation
    document.getElementById('wizard-prev-btn')?.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        renderWizardStep();
      }
    });

    document.getElementById('wizard-next-btn')?.addEventListener('click', () => {
      if (currentStep < 8) {
        currentStep++;
        renderWizardStep();
      } else {
        // Complete Onboarding!
        store.setDemoMode(true); // Activate full ready-to-use workspace!
        showToast('Selamat! Setup StokCerdas selesai.', 'success');
        if (onCompleteOnboarding) onCompleteOnboarding();
      }
    });
  };

  renderWizardStep();
}

function getStepHTML(step, formData) {
  switch (step) {
    case 1:
      return `
        <h3 style="font-size: 1.1rem; margin-bottom: 12px;">Langkah 1: Nama Usaha UMKM Anda</h3>
        <p style="font-size: 0.88rem; color: var(--slate-600); margin-bottom: 16px;">Masukkan nama bisnis atau brand usaha kuliner/retail Anda.</p>
        <div class="form-group">
          <label class="form-label">Nama Bisnis *</label>
          <input type="text" class="form-control" value="${formData.businessName}" placeholder="misal: Kedai Nusantara / Warung Sederhana">
        </div>
      `;
    case 2:
      return `
        <h3 style="font-size: 1.1rem; margin-bottom: 12px;">Langkah 2: Tipe Bisnis Pangan</h3>
        <p style="font-size: 0.88rem; color: var(--slate-600); margin-bottom: 16px;">Pilih kategori operasional bisnis Anda.</p>
        <div class="form-group">
          <label class="form-label">Kategori Usaha *</label>
          <select class="form-control">
            <option>UMKM Kuliner (Restoran, Cafe, Katering, Warung)</option>
            <option>UMKM Retail Food (Sembako, Minimarket, Frozen Food)</option>
          </select>
        </div>
      `;
    case 3:
      return `
        <h3 style="font-size: 1.1rem; margin-bottom: 12px;">Langkah 3: Perkiraan Jumlah Produk</h3>
        <p style="font-size: 0.88rem; color: var(--slate-600); margin-bottom: 16px;">Berapa perkiraan varian bahan atau produk yang Anda kelola?</p>
        <div class="form-group">
          <label class="form-label">Jumlah Variasi Produk (SKU)</label>
          <input type="number" class="form-control" value="20">
        </div>
      `;
    case 4:
      return `
        <h3 style="font-size: 1.1rem; margin-bottom: 12px;">Langkah 4: Pencatatan Stok Awal</h3>
        <p style="font-size: 0.88rem; color: var(--slate-600); margin-bottom: 16px;">Anda dapat memasukkan stok secara manual nanti atau memuat sampel data demo.</p>
        <div class="form-group">
          <label style="display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" checked style="width: 18px; height: 18px;">
            <span>Gunakan sampel produk bawaan untuk eksplorasi cepat</span>
          </label>
        </div>
      `;
    case 5:
      return `
        <h3 style="font-size: 1.1rem; margin-bottom: 12px;">Langkah 5: Histori Penjualan</h3>
        <p style="font-size: 0.88rem; color: var(--slate-600); margin-bottom: 16px;">AI Forecasting membutuhkan histori penjualan untuk menghitung velocity.</p>
        <span class="badge badge-emerald">Disiapkan 30 hari data simulasi</span>
      `;
    case 6:
      return `
        <h3 style="font-size: 1.1rem; margin-bottom: 12px;">Langkah 6: Pengaturan Supplier & Lead Time</h3>
        <p style="font-size: 0.88rem; color: var(--slate-600); margin-bottom: 16px;">Pengaturan waktu pengiriman supplier menentukan Reorder Point otomatis.</p>
        <span class="badge badge-teal">5 Supplier Utama Siap Terhubung</span>
      `;
    case 7:
      return `
        <h3 style="font-size: 1.1rem; margin-bottom: 12px;">Langkah 7: Threshold Minimum Stock & FEFO</h3>
        <p style="font-size: 0.88rem; color: var(--slate-600); margin-bottom: 16px;">Sistem akan memperingatkan jika stok mendekati threshold minimal.</p>
        <span class="badge badge-amber">Prinsip FEFO (First Expired First Out) Aktif</span>
      `;
    case 8:
      return `
        <div style="text-align: center; padding: 20px 0;">
          <i data-lucide="check-circle" style="width: 56px; height: 56px; color: var(--primary-600); margin-bottom: 12px;"></i>
          <h3 style="font-size: 1.35rem; font-weight: 800;">Setup Selesai! Selamat Datang di StokCerdas</h3>
          <p style="color: var(--slate-600); margin-top: 6px;">
            Platform Anda siap digunakan. Anda dapat mulai mencatat penjualan, memonitor prediksi AI, dan menyelamatkan makanan surplus!
          </p>
        </div>
      `;
    default:
      return '';
  }
}
