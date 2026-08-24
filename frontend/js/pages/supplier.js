/* StokCerdas — Supplier Management Page View */

import { store } from '../store.js';
import { openModal, closeModal } from '../components/modal.js';
import { showToast } from '../components/notifications.js';

export function renderSupplier(onNavigate) {
  const container = document.getElementById('content-container');
  if (!container) return;

  const state = store.getState();
  const { suppliers } = state;

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h1 style="font-size: 1.6rem;">Direktori Supplier & Evaluasi Performa</h1>
        <p style="color: var(--slate-500); font-size: 0.9rem;">Kelola data kontak mitra supplier, MOQ, lead time pengiriman, dan skor pemenuhan pesanan.</p>
      </div>
      <button id="btn-add-supplier" class="btn btn-primary"><i data-lucide="user-plus"></i> Tambah Supplier</button>
    </div>

    <!-- Supplier Grid Cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
      ${suppliers.map(s => `
        <div class="card">
          <div class="card-header">
            <div>
              <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--slate-900);">${s.name}</h3>
              <small style="color: var(--slate-400);">${s.paymentTerms || 'Tunai COD'}</small>
            </div>
            <span class="badge badge-emerald"><i data-lucide="check-circle"></i> ${s.fulfillmentRate || 95}% Rate</span>
          </div>
          
          <div style="font-size: 0.88rem; display: flex; flex-direction: column; gap: 8px; color: var(--slate-700);">
            <div><i data-lucide="phone" style="width: 15px; height: 15px; color: var(--slate-400);"></i> <strong>Kontak:</strong> ${s.contact}</div>
            <div><i data-lucide="mail" style="width: 15px; height: 15px; color: var(--slate-400);"></i> <strong>Email:</strong> ${s.email || '-'}</div>
            <div><i data-lucide="clock" style="width: 15px; height: 15px; color: var(--slate-400);"></i> <strong>Lead Time Pengiriman:</strong> ${s.leadTimeDays} Hari</div>
            <div><i data-lucide="shopping-bag" style="width: 15px; height: 15px; color: var(--slate-400);"></i> <strong>MOQ Minimal Order:</strong> ${s.moq} unit</div>
            
            <div style="margin-top: 8px;">
              <span style="font-size: 0.8rem; color: var(--slate-500);">Produk Pasokan Utama:</span>
              <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-top: 4px;">
                ${(s.productsSupplied || []).map(pName => `<span class="badge badge-gray">${pName}</span>`).join('')}
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  document.getElementById('btn-add-supplier')?.addEventListener('click', () => openAddSupplierModal());
}

function openAddSupplierModal() {
  const html = `
    <form id="form-supplier">
      <div class="form-group">
        <label class="form-label">Nama Perusahaan / Supplier *</label>
        <input type="text" id="sup-name" class="form-control" placeholder="misal: PT Agrimart Pangan" required>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Kontak (HP/WhatsApp) *</label>
          <input type="text" id="sup-contact" class="form-control" placeholder="0812-xxxx-xxxx" required>
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" id="sup-email" class="form-control" placeholder="order@supplier.com">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Lead Time Pengiriman (Hari) *</label>
          <input type="number" id="sup-leadtime" class="form-control" value="2" min="1" required>
        </div>
        <div class="form-group">
          <label class="form-label">MOQ (Minimum Order Quantity) *</label>
          <input type="number" id="sup-moq" class="form-control" value="5" min="1" required>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Syarat Pembayaran (Payment Terms) *</label>
        <input type="text" id="sup-terms" class="form-control" value="Tunai Saat Diterima (COD)" required>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Batal</button>
        <button type="submit" class="btn btn-primary">Simpan Supplier</button>
      </div>
    </form>
  `;

  openModal('Tambah Supplier Baru', html, (body) => {
    body.querySelector('#btn-cancel-modal')?.addEventListener('click', closeModal);
    body.querySelector('#form-supplier')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const supData = {
        id: `sup-${Math.floor(100 + Math.random() * 900)}`,
        name: body.querySelector('#sup-name').value,
        contact: body.querySelector('#sup-contact').value,
        email: body.querySelector('#sup-email').value,
        leadTimeDays: Number(body.querySelector('#sup-leadtime').value),
        moq: Number(body.querySelector('#sup-moq').value),
        paymentTerms: body.querySelector('#sup-terms').value,
        productsSupplied: ['Bahan Utama'],
        fulfillmentRate: 98
      };

      store.getState().suppliers.push(supData);
      store.saveState();

      closeModal();
      showToast('Supplier baru berhasil ditambahkan!', 'success');
      renderSupplier();
    });
  });
}
