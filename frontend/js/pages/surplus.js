/* StokCerdas — Selamatkan Surplus Rescue Hub Page View */

import { store } from '../store.js';
import { formatIDR } from '../utils.js';
import { detectSurplusAlerts, calculateFlashSaleDiscount } from '../engine/surplusEngine.js';
import { openModal, closeModal } from '../components/modal.js';
import { showToast } from '../components/notifications.js';

export function renderSurplus(onNavigate) {
  const container = document.getElementById('content-container');
  if (!container) return;

  const state = store.getState();
  const { products, expiryBatches, surplusRecords } = state;

  const surplusAlerts = detectSurplusAlerts(products, expiryBatches, surplusRecords);

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h1 style="font-size: 1.6rem;">Selamatkan Surplus (Pencegahan Waste)</h1>
        <p style="color: var(--slate-500); font-size: 0.9rem;">Pemberitahuan otomatis saat terjadi potensi sisa makanan. Pilih jalur penyelamatan makanan!</p>
      </div>
      <span class="badge badge-amber" style="font-size: 0.9rem; padding: 6px 14px;"><i data-lucide="shield-alert"></i> Surplus Rescue Mode Active</span>
    </div>

    <!-- Active Surplus Alert Section -->
    <div style="margin-bottom: 32px;">
      <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 16px; color: var(--slate-900);">
        ⚠️ SURPLUS ALERTS BERJALAN (${surplusAlerts.length})
      </h2>

      ${surplusAlerts.length === 0 
        ? `<div class="card" style="text-align: center; padding: 40px 20px;">
            <i data-lucide="heart" style="width: 40px; height: 40px; color: var(--primary-500); margin-bottom: 8px;"></i>
            <h3>Tidak Ada Potensi Food Waste Saat Ini!</h3>
            <p style="color: var(--slate-500);">Seluruh stok berada dalam kondisi rotasi FEFO yang optimal.</p>
           </div>`
        : `<div class="surplus-grid">
            ${surplusAlerts.map(a => `
              <div class="surplus-card ${a.riskLevel === 'CRITICAL' ? 'alert-critical' : 'alert-warning'}">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div>
                    <h3 style="font-size: 1.05rem; font-weight: 700;">${a.productName}</h3>
                    <span class="badge ${a.riskLevel === 'CRITICAL' ? 'badge-red' : 'badge-amber'}">Sisa ${a.quantity} ${a.unit}</span>
                  </div>
                  <strong style="color: var(--red-600);">${formatIDR(a.originalValue)}</strong>
                </div>

                <p style="font-size: 0.88rem; color: var(--slate-700); font-weight: 500;">
                  ${a.message}
                </p>

                <div style="font-size: 0.8rem; color: var(--slate-500);">
                  Rekomendasi Penyelamatan:
                </div>

                <!-- 4 Rescue Action Buttons -->
                <div class="surplus-actions-row">
                  <button class="btn btn-sm btn-primary btn-act-flashsale" data-id="${a.id}" data-name="${a.productName}" data-qty="${a.quantity}" data-val="${a.originalValue}">
                    <i data-lucide="tag"></i> 1. Flash Sale
                  </button>
                  <button class="btn btn-sm btn-teal btn-act-donation" data-id="${a.id}" data-name="${a.productName}" data-qty="${a.quantity}">
                    <i data-lucide="heart"></i> 2. Donasi
                  </button>
                  <button class="btn btn-sm btn-secondary btn-act-umkm" data-id="${a.id}" data-name="${a.productName}" data-qty="${a.quantity}">
                    <i data-lucide="users"></i> 3. Tawar UMKM
                  </button>
                  <button class="btn btn-sm btn-outline btn-act-compost" data-id="${a.id}" data-name="${a.productName}" data-qty="${a.quantity}">
                    <i data-lucide="sprout"></i> 4. Olah Kompos
                  </button>
                </div>
              </div>
            `).join('')}
           </div>`
      }
    </div>

    <!-- History of Rescued Surplus Table -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title"><i data-lucide="award" class="icon-emerald"></i> Riwayat Surplus Terpenyelamatkan</h3>
        <span class="badge badge-gray">${surplusRecords.length} Aktivitas</span>
      </div>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Batch / Nama Pangan</th>
              <th>Volume Surplus</th>
              <th>Status Penyelamatan</th>
              <th>Aksi yang Diambil</th>
              <th>Dampak Ekonomi Saved</th>
            </tr>
          </thead>
          <tbody>
            ${surplusRecords.map(s => `
              <tr>
                <td><strong>${s.productName}</strong></td>
                <td>${s.quantity} ${s.unit}</td>
                <td><span class="badge badge-emerald"><i data-lucide="check"></i> ${s.status}</span></td>
                <td>
                  ${s.actionsTaken.map(act => `• <strong>${act.type}</strong> (${act.qty} unit - ${act.date})`).join('<br>')}
                </td>
                <td><strong style="color: var(--primary-700);">${formatIDR(s.potentialWasteValue)}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Attach Action Button Handlers
  container.querySelectorAll('.btn-act-flashsale').forEach(btn => {
    btn.addEventListener('click', () => {
      const pName = btn.getAttribute('data-name');
      const pVal = Number(btn.getAttribute('data-val'));
      const pQty = Number(btn.getAttribute('data-qty'));
      openFlashSaleModal(pName, pVal, pQty);
    });
  });

  container.querySelectorAll('.btn-act-donation').forEach(btn => {
    btn.addEventListener('click', () => {
      const pName = btn.getAttribute('data-name');
      const pQty = Number(btn.getAttribute('data-qty'));
      openDonationModal(pName, pQty);
    });
  });

  container.querySelectorAll('.btn-act-umkm').forEach(btn => {
    btn.addEventListener('click', () => {
      const pName = btn.getAttribute('data-name');
      const pQty = Number(btn.getAttribute('data-qty'));
      openUMKMOfferModal(pName, pQty);
    });
  });

  container.querySelectorAll('.btn-act-compost').forEach(btn => {
    btn.addEventListener('click', () => {
      const pName = btn.getAttribute('data-name');
      const pQty = Number(btn.getAttribute('data-qty'));
      openCompostModal(pName, pQty);
    });
  });
}

function openFlashSaleModal(productName, originalVal, qty) {
  const calc = calculateFlashSaleDiscount(originalVal, 50);
  const html = `
    <form id="form-flash-sale">
      <div class="form-group">
        <label class="form-label">Produk Surplus</label>
        <input type="text" class="form-control" value="${productName} (${qty} unit)" disabled>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Harga Normal Total</label>
          <input type="text" class="form-control" value="${formatIDR(originalVal)}" disabled>
        </div>
        <div class="form-group">
          <label class="form-label">Diskon Flash Sale (%)</label>
          <input type="number" id="fs-discount" class="form-control" value="50" min="10" max="90">
        </div>
      </div>
      <div style="background: var(--primary-50); border: 1px solid var(--primary-500); padding: 12px; border-radius: var(--radius-sm); margin-bottom: 16px;">
        <span style="font-size: 0.85rem; color: var(--slate-600);">Harga Diskon Flash Sale Disarankan:</span><br>
        <strong id="fs-final-price" style="font-size: 1.2rem; color: var(--primary-700);">${calc.formattedSalePrice}</strong>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Batal</button>
        <button type="submit" class="btn btn-primary">Aktifkan Flash Sale</button>
      </div>
    </form>
  `;

  openModal('Jalur 1: Aktifkan Flash Sale Surplus', html, (body) => {
    body.querySelector('#btn-cancel-modal')?.addEventListener('click', closeModal);
    body.querySelector('#form-flash-sale')?.addEventListener('submit', (e) => {
      e.preventDefault();
      store.takeSurplusAction({
        surplusId: 'srp-301',
        actionType: 'Flash Sale',
        quantity: qty,
        details: `Diskon Flash Sale 50%`
      });
      closeModal();
      showToast('Flash sale surplus berhasil dipublikasikan!', 'success');
      renderSurplus();
    });
  });
}

function openDonationModal(productName, qty) {
  const html = `
    <form id="form-donation">
      <div class="form-group">
        <label class="form-label">Produk yang Didonasikan</label>
        <input type="text" class="form-control" value="${productName} (${qty} unit)" disabled>
      </div>
      <div class="form-group">
        <label class="form-label">Penerima Donasi (Panti Asuhan / Bank Pangan) *</label>
        <input type="text" id="don-recipient" class="form-control" value="Panti Asuhan Kasih Ibu - Jakarta" required>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Batal</button>
        <button type="submit" class="btn btn-teal">Catat Donasi Pangan</button>
      </div>
    </form>
  `;

  openModal('Jalur 2: Donasi Pangan Surplus', html, (body) => {
    body.querySelector('#btn-cancel-modal')?.addEventListener('click', closeModal);
    body.querySelector('#form-donation')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const recipient = body.querySelector('#don-recipient').value;
      store.takeSurplusAction({
        surplusId: 'srp-301',
        actionType: 'Donation',
        quantity: qty,
        details: `Disalurkan ke ${recipient}`
      });
      closeModal();
      showToast('Donasi pangan berhasil dicatat! Impact meningkat.', 'success');
      renderSurplus();
    });
  });
}

function openUMKMOfferModal(productName, qty) {
  const html = `
    <div style="padding: 10px 0;">
      <p style="font-size: 0.9rem; color: var(--slate-700); margin-bottom: 12px;">
        Salin teks penawaran B2B surplus berikut untuk dikirimkan ke grup mitra UMKM Kuliner terdekat:
      </p>
      <textarea class="form-control" rows="4" readonly style="font-family: monospace; font-size: 0.85rem;">[PENAWARAN SURPLUS BUMBU/BAHAN - KEDAI NUSANTARA]
Halo Rekan UMKM! Kami memiliki ketersediaan surplus bahan "${productName}" sebanyak ${qty} unit dengan harga spesial kemitraan (Diskon 40%). Minat silakan kontak fast response!</textarea>
      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px;">
        <button type="button" class="btn btn-secondary" id="btn-close-modal">Tutup</button>
        <button type="button" class="btn btn-primary" id="btn-copy-umkm">Salin Teks Penawaran</button>
      </div>
    </div>
  `;

  openModal('Jalur 3: Tawarkan ke Mitra UMKM', html, (body) => {
    body.querySelector('#btn-close-modal')?.addEventListener('click', closeModal);
    body.querySelector('#btn-copy-umkm')?.addEventListener('click', () => {
      showToast('Teks penawaran berhasil disalin ke clipboard!', 'success');
      closeModal();
    });
  });
}

function openCompostModal(productName, qty) {
  const html = `
    <form id="form-compost">
      <div class="form-group">
        <label class="form-label">Bahan Organik</label>
        <input type="text" class="form-control" value="${productName} (${qty} unit)" disabled>
      </div>
      <div class="form-group">
        <label class="form-label">Mitra Pengolah Kompos / Maggot Organik *</label>
        <input type="text" id="cmp-partner" class="form-control" value="Pengolahan Sampah Organik TPS3R Mandiri" required>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Batal</button>
        <button type="submit" class="btn btn-primary">Catat Pengolahan Organik</button>
      </div>
    </form>
  `;

  openModal('Jalur 4: Olah Kompos Organik', html, (body) => {
    body.querySelector('#btn-cancel-modal')?.addEventListener('click', closeModal);
    body.querySelector('#form-compost')?.addEventListener('submit', (e) => {
      e.preventDefault();
      store.takeSurplusAction({
        surplusId: 'srp-301',
        actionType: 'Compost',
        quantity: qty,
        details: `Dikirim ke pengolah organik TPS3R`
      });
      closeModal();
      showToast('Pengolahan kompos organik dicatat!', 'success');
      renderSurplus();
    });
  });
}
