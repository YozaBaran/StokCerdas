/* StokCerdas — Expiry Tracking (FEFO) & Food Waste Logging Page View */

import { store } from '../store.js';
import { formatIDR, formatDate } from '../utils.js';
import { openModal, closeModal } from '../components/modal.js';
import { showToast } from '../components/notifications.js';

export function renderExpiry(onNavigate) {
  const container = document.getElementById('content-container');
  if (!container) return;

  const state = store.getState();
  const { expiryBatches, wasteRecords, products } = state;

  const today = new Date();

  // Categorize batches
  let expiredCount = 0;
  let expiringTodayCount = 0;
  let expiring3DaysCount = 0;

  expiryBatches.forEach(b => {
    const diffDays = Math.ceil((new Date(b.expiryDate) - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) expiredCount++;
    else if (diffDays === 0) expiringTodayCount++;
    else if (diffDays <= 3) expiring3DaysCount++;
  });

  const totalWasteVal = wasteRecords.reduce((sum, w) => sum + (Number(w.estimatedValue) || 0), 0);
  const totalWasteKg = wasteRecords.reduce((sum, w) => sum + (Number(w.quantity) || 0), 0);

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h1 style="font-size: 1.6rem;">Expiry FEFO & Food Waste Tracking</h1>
        <p style="color: var(--slate-500); font-size: 0.9rem;">Prinsip First Expired First Out (FEFO) untuk mencegah kerusakan bahan pangan.</p>
      </div>
      <button id="btn-log-waste" class="btn btn-danger"><i data-lucide="trash-2"></i> Catat Food Waste</button>
    </div>

    <!-- Expiry Summary Cards -->
    <div class="kpi-grid">
      <div class="kpi-card kpi-red">
        <div class="kpi-top">
          <span class="kpi-label">Kadaluarsa Dalam <= 3 Hari</span>
          <div class="kpi-icon-box"><i data-lucide="clock"></i></div>
        </div>
        <div class="kpi-value" style="color: var(--red-600);">${expiring3DaysCount + expiringTodayCount} <span style="font-size: 1rem;">batch</span></div>
        <div class="kpi-subtext">Perlu prioritas pemakaian (FEFO)</div>
      </div>

      <div class="kpi-card kpi-amber">
        <div class="kpi-top">
          <span class="kpi-label">Total Waste Tersebabkan</span>
          <div class="kpi-icon-box"><i data-lucide="alert-triangle"></i></div>
        </div>
        <div class="kpi-value">${totalWasteKg.toFixed(1)} <span style="font-size: 1rem;">kg</span></div>
        <div class="kpi-subtext">Nilai Kerugian: ${formatIDR(totalWasteVal)}</div>
      </div>
    </div>

    <!-- FEFO Recommendation Banner -->
    <div class="card" style="background: linear-gradient(135deg, var(--teal-700), #0F172A); color: #FFFFFF; margin-bottom: 24px;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
        <i data-lucide="sparkles" style="color: var(--primary-200); width: 24px; height: 24px;"></i>
        <h3 style="color: #FFFFFF; font-size: 1.1rem;">Rekomendasi Penggunaan FEFO Hari Ini</h3>
      </div>
      <p style="font-size: 0.92rem; color: rgba(255,255,255,0.9);">
        👉 <strong>Gunakan 8 pack Roti Tawar Kupas (Batch BAT-RTI-20260817)</strong> terlebih dahulu karena akan expired dalam 1 hari! Jika berpotensi sisa, aktifkan penawaran <strong>Selamatkan Surplus</strong>.
      </p>
      <div style="margin-top: 14px;">
        <button id="btn-goto-surplus-from-expiry" class="btn btn-sm btn-teal"><i data-lucide="heart-handshake"></i> Buka Modul Selamatkan Surplus</button>
      </div>
    </div>

    <!-- Expiry Batch Table -->
    <div class="card" style="margin-bottom: 24px;">
      <div class="card-header">
        <h3 class="card-title"><i data-lucide="calendar" class="icon-emerald"></i> Daftar Batch Tanggal Kadaluarsa (FEFO Sorted)</h3>
        <span class="badge badge-gray">${expiryBatches.length} Batch Active</span>
      </div>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>No. Batch</th>
              <th>Nama Produk</th>
              <th>Jumlah Batch</th>
              <th>Tanggal Diterima</th>
              <th>Tanggal Kadaluarsa</th>
              <th>Sisa Hari</th>
              <th>Status FEFO</th>
            </tr>
          </thead>
          <tbody>
            ${expiryBatches.map(b => {
              const diffDays = Math.ceil((new Date(b.expiryDate) - today) / (1000 * 60 * 60 * 24));
              let badge = '<span class="badge badge-emerald">Aman</span>';
              if (diffDays <= 1) badge = '<span class="badge badge-red">🔴 Kritis Expired</span>';
              else if (diffDays <= 3) badge = '<span class="badge badge-amber">🟡 Pakai Segera</span>';

              return `
                <tr>
                  <td><strong>${b.batchNo}</strong></td>
                  <td>${b.productName}</td>
                  <td><strong>${b.quantity}</strong> ${b.unit}</td>
                  <td>${formatDate(b.dateReceived)}</td>
                  <td><strong>${formatDate(b.expiryDate)}</strong></td>
                  <td>${diffDays < 0 ? 'Kadaluarsa' : (diffDays === 0 ? 'Hari Ini' : diffDays + ' hari lagi')}</td>
                  <td>${badge}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Food Waste Log Table -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title"><i data-lucide="trash-2" class="icon-amber"></i> Log Food Waste Terบันต (Pencatatan Makanan Terbuang)</h3>
        <span class="badge badge-gray">${wasteRecords.length} Catatan Waste</span>
      </div>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Produk</th>
              <th>Jumlah Waste</th>
              <th>Estimasi Nilai (Rp)</th>
              <th>Alasan Kerusakan</th>
              <th>Catatan</th>
            </tr>
          </thead>
          <tbody>
            ${wasteRecords.map(w => `
              <tr>
                <td>${formatDate(w.date)}</td>
                <td><strong>${w.productName}</strong></td>
                <td>${w.quantity} ${w.unit}</td>
                <td><strong style="color: var(--red-600);">${formatIDR(w.estimatedValue)}</strong></td>
                <td><span class="badge badge-amber">${w.reason}</span></td>
                <td><small style="color: var(--slate-500);">${w.notes || '-'}</small></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  document.getElementById('btn-goto-surplus-from-expiry')?.addEventListener('click', () => onNavigate('surplus'));
  document.getElementById('btn-log-waste')?.addEventListener('click', () => openLogWasteModal(products));
}

function openLogWasteModal(products) {
  const html = `
    <form id="form-log-waste">
      <div class="form-group">
        <label class="form-label">Pilih Produk Terbuang *</label>
        <select id="wst-product" class="form-control" required>
          ${products.map(p => `<option value="${p.id}" data-price="${p.purchasePrice}">${p.name} (Stok: ${p.currentStock} ${p.unit})</option>`).join('')}
        </select>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Jumlah Terbuang *</label>
          <input type="number" id="wst-qty" class="form-control" step="0.1" value="1" required>
        </div>
        <div class="form-group">
          <label class="form-label">Estimasi Nilai Kerugian (Rp) *</label>
          <input type="number" id="wst-value" class="form-control" value="25000" required>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Alasan Terbuang *</label>
        <select id="wst-reason" class="form-control" required>
          <option value="Expired">Expired / Kadaluarsa</option>
          <option value="Overstock">Overstock / Tidak Terjual</option>
          <option value="Damaged">Damaged / Membusuk / Rusak</option>
          <option value="Unsold">Sisa Makanan Jadi Unsold</option>
          <option value="Preparation Waste">Preparation Waste (Persiapan Dapur)</option>
          <option value="Other">Lainnya</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Catatan Tambahan</label>
        <input type="text" id="wst-notes" class="form-control" placeholder="misal: Lemari es mati listrik semalaman">
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Batal</button>
        <button type="submit" class="btn btn-danger">Simpan Food Waste Log</button>
      </div>
    </form>
  `;

  openModal('Catat Food Waste / Makanan Terbuang', html, (body) => {
    body.querySelector('#btn-cancel-modal')?.addEventListener('click', closeModal);
    body.querySelector('#form-log-waste')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const pId = body.querySelector('#wst-product').value;
      const targetP = products.find(p => p.id === pId) || { name: 'Produk' };

      const wasteData = {
        id: `wst-${Date.now()}`,
        productId: pId,
        productName: targetP.name,
        quantity: Number(body.querySelector('#wst-qty').value),
        unit: targetP.unit || 'kg',
        estimatedValue: Number(body.querySelector('#wst-value').value),
        reason: body.querySelector('#wst-reason').value,
        date: new Date().toISOString().split('T')[0],
        notes: body.querySelector('#wst-notes').value
      };

      store.addWasteRecord(wasteData);
      closeModal();
      showToast('Log Food Waste berhasil dicatat!', 'warning');
      renderExpiry();
    });
  });
}
